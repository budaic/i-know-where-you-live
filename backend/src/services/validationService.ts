import OpenAI from 'openai';
import { config } from '../config';
import { ValidationResult, GeneratedContext } from '../types';
import { ExaResult } from './exaService';
import { parseName } from '../utils/nameParser';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});


/**
 * Sanity check to verify if the first name and last name can be found in the source text
 * Returns true if both names are found, false otherwise
 * For LinkedIn profiles, we're more lenient - only require one name match
 */
export function sanityCheckSource(
  source: ExaResult,
  firstName: string,
  lastName: string
): boolean {
  if (!source.text || !firstName || !lastName) {
    return false;
  }
  
  const text = source.text.toLowerCase();
  const firstNameLower = firstName.toLowerCase();
  const lastNameLower = lastName.toLowerCase();
  
  // Check if both first name and last name are present in the text
  const hasFirstName = text.includes(firstNameLower);
  const hasLastName = text.includes(lastNameLower);
  
  // For LinkedIn profiles, be more lenient - only require one name match
  if (source.url.includes('linkedin.com/in/')) {
    return hasFirstName || hasLastName;
  }
  
  // For other sources, require both names
  return hasFirstName && hasLastName;
}

/**
 * Categorize a LinkedIn URL based on its structure
 */
function categorizeLinkedInUrl(url: string): 'profile' | 'post' | 'company' | 'other' {
  if (url.includes('/in/')) {
    return 'profile';
  } else if (url.includes('/posts/') || url.includes('/activity/')) {
    return 'post';
  } else if (url.includes('/company/')) {
    return 'company';
  }
  return 'other';
}

/**
 * Validate a source against the subject's contexts
 * Returns a relevancy score (1-10) and determines if it's likely the same person
 */
export async function validateSource(
  source: ExaResult,
  subjectName: string,
  hardContext: string,
  softContext: string,
  generatedContext: GeneratedContext
): Promise<ValidationResult> {
  // Parse the subject name to get first and last name
  const { firstName, lastName } = parseName(subjectName);
  
  // Categorize the source if it's LinkedIn
  const category = source.url.includes('linkedin.com') ? categorizeLinkedInUrl(source.url) : 'other';
  
  // Perform sanity check - if names aren't found in the source, return low score immediately
  if (!sanityCheckSource(source, firstName, lastName)) {
    const promptWithResponse = `SANITY CHECK FAILED: First name "${firstName}" or last name "${lastName}" not found in source text.`;
    
    return {
      url: source.url,
      relevancyScore: 1,
      isLikelyMatch: false,
      confidence: 'low',
      reasoning: `Names not found in source: ${firstName} ${lastName}`,
      samePersonElements: [],
      differentPersonElements: [`First name "${firstName}" not found`, `Last name "${lastName}" not found`],
      prompt: promptWithResponse,
      category,
    };
  }
  
  const generatedContextText = formatGeneratedContext(generatedContext);

  // Determine context to use based on category
  let contextToUse: string;
  if (category === 'profile' && source.url.includes('linkedin.com')) {
    // For LinkedIn profiles, use hard context
    contextToUse = `Hard Context: ${hardContext || 'None'} | Soft Context: ${softContext || 'None'}`;
  } else {
    // For all other sources (including LinkedIn posts/companies), add hard context to soft context
    const combinedSoftContext = [softContext, hardContext].filter(Boolean).join(' | ');
    contextToUse = `Context: ${combinedSoftContext || 'None'}`;
  }

  // Create specialized prompt for LinkedIn profiles
  let prompt: string;
  if (category === 'profile' && source.url.includes('linkedin.com')) {
    prompt = `Role: Expert LinkedIn profile validator
Task: Determine if this is the CORRECT LinkedIn profile for "${subjectName}"

Critical Checks:
1. URL MUST contain "linkedin.com/in/" (any subdomain/format is acceptable)
2. Profile name must match "${subjectName}" (allowing for name order variations)
3. Hard context "${hardContext}" should ideally appear in job/education/experience
4. Soft context "${softContext}" should align geographically/professionally

${contextToUse}
Known: ${generatedContextText || 'None'}

Source: ${source.title}
Content: ${source.text?.substring(0, 1000) || 'No content'}

Scoring Guide:
- 9-10: Perfect name match + hard context clearly confirmed
- 7-8: Name match + hard context partially confirmed OR strong soft context alignment
- 5-6: Name match but weak/no context confirmation (still acceptable for LinkedIn profiles)
- 1-4: Name mismatch, wrong person, or company/post page

Respond with ONLY this JSON:
{
  "relevancyScore": 7,
  "isLikelyMatch": true,
  "confidence": "high",
  "reasoning": "Brief explanation",
  "samePersonElements": ["element1", "element2"],
  "differentPersonElements": ["element1"]
}`;
  } else {
    prompt = `Validate if this source is about "${subjectName}".

${contextToUse}
Known: ${generatedContextText || 'None'}

Source: ${source.title}
Content: ${source.text?.substring(0, 1000) || 'No content'}

Score 1-10, determine if same person, list matching/conflicting elements.

Respond with ONLY this JSON:
{
  "relevancyScore": 7,
  "isLikelyMatch": true,
  "confidence": "high",
  "reasoning": "Brief explanation",
  "samePersonElements": ["element1", "element2"],
  "differentPersonElements": ["element1"]
}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: category === 'profile' && source.url.includes('linkedin.com') 
            ? 'You are an expert LinkedIn profile validator. Your job is to determine if this is the correct LinkedIn profile for the given person. URL must contain "linkedin.com/in/" (any subdomain/format acceptable). Be precise about context matching. Respond with ONLY valid JSON. No other text.'
            : 'You are a web search analyst. Respond with ONLY valid JSON. No other text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 1,
      max_completion_tokens: 4000,
    });

    const rawContent = response.choices[0].message.content?.trim() || '{}';
    
    let result;
    try {
      result = JSON.parse(rawContent);
    } catch (parseError) {
      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    }

    // Create the prompt field with both the prompt and the response
    const promptWithResponse = `PROMPT:\n${prompt}\n\nRESPONSE:\n${rawContent}`;

    return {
      url: source.url,
      relevancyScore: result.relevancyScore || 1,
      isLikelyMatch: result.isLikelyMatch || false,
      confidence: result.confidence || 'low',
      reasoning: result.reasoning || 'Unable to determine',
      samePersonElements: result.samePersonElements || [],
      differentPersonElements: result.differentPersonElements || [],
      prompt: promptWithResponse,
      category,
    };
  } catch (error) {
    console.error(`Error validating source ${source.url}:`, error);
    // Return low-confidence result on error
    const promptWithError = `PROMPT:\n${prompt}\n\nRESPONSE:\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
    return {
      url: source.url,
      relevancyScore: 1,
      isLikelyMatch: false,
      confidence: 'low',
      reasoning: 'Validation failed',
      samePersonElements: [],
      differentPersonElements: [],
      prompt: promptWithError,
      category,
    };
  }
}

/**
 * Validate multiple sources in batch
 */
export async function validateSourcesBatch(
  sources: ExaResult[],
  subjectName: string,
  hardContext: string,
  softContext: string,
  generatedContext: GeneratedContext
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  // Process in batches to avoid rate limits
  const batchSize = 3;
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    
    const batchPromises = batch.map(source =>
      validateSource(source, subjectName, hardContext, softContext, generatedContext)
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Small delay between batches
    if (i + batchSize < sources.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Select the best profile from validation results
 * For LinkedIn/GitHub/Website, we want only ONE profile
 */
export function selectBestProfile(validations: ValidationResult[]): ValidationResult | null {
  // Filter to only likely matches with score >= 4 for LinkedIn profiles, >= 5 for others
  const qualified = validations.filter(
    v => v.isLikelyMatch && (
      (v.url.includes('linkedin.com/in/') && v.relevancyScore >= 4) ||
      (!v.url.includes('linkedin.com/in/') && v.relevancyScore >= 5)
    )
  );

  if (qualified.length === 0) {
    return null;
  }

  // Sort by multiple criteria to prioritize the best profile
  qualified.sort((a, b) => {
    // 1. Prioritize LinkedIn profiles with /in/ URLs
    const aIsLinkedInProfile = a.url.includes('linkedin.com/in/');
    const bIsLinkedInProfile = b.url.includes('linkedin.com/in/');
    
    if (aIsLinkedInProfile && !bIsLinkedInProfile) return -1;
    if (!aIsLinkedInProfile && bIsLinkedInProfile) return 1;
    
    // 2. Sort by relevancy score (highest first)
    if (b.relevancyScore !== a.relevancyScore) {
      return b.relevancyScore - a.relevancyScore;
    }
    
    // 3. Sort by confidence level
    const confidenceOrder = { high: 3, medium: 2, low: 1 };
    const confidenceDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    if (confidenceDiff !== 0) {
      return confidenceDiff;
    }
    
    // 4. For LinkedIn profiles, prioritize those with more context matches
    if (aIsLinkedInProfile && bIsLinkedInProfile) {
      const aContextMatches = a.samePersonElements.length;
      const bContextMatches = b.samePersonElements.length;
      return bContextMatches - aContextMatches;
    }
    
    return 0;
  });

  return qualified[0];
}

/**
 * Format generated context for display in prompts
 */
function formatGeneratedContext(context: GeneratedContext): string {
  const parts: string[] = [];
  
  if (context.linkedinData) {
    parts.push(`LinkedIn: ${context.linkedinData}`);
  }
  if (context.githubData) {
    parts.push(`GitHub: ${context.githubData}`);
  }
  if (context.websiteData) {
    parts.push(`Website: ${context.websiteData}`);
  }
  if (context.additionalFindings.length > 0) {
    parts.push(`Additional: ${context.additionalFindings.join('; ')}`);
  }

  return parts.join(' | ');
}

