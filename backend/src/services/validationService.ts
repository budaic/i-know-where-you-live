import OpenAI from 'openai';
import { config } from '../config';
import { ValidationResult, GeneratedContext } from '../types';
import { ExaResult } from './exaService';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

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
  const generatedContextText = formatGeneratedContext(generatedContext);

  const prompt = `You are validating whether a source is about the subject "${subjectName}".

Hard Context (MUST be true): ${hardContext || 'None provided'}
Soft Context (guidance): ${softContext || 'None provided'}
Generated Context (known facts): ${generatedContextText || 'None yet'}

Source URL: ${source.url}
Source Title: ${source.title}
Source Content: ${source.text?.substring(0, 2000) || 'No content available'}

Score this source 1-10:
- 1-3: Only name or partial name matches
- 4-5: Name + some context matches
- 6-8: Name + professional background matches
- 9-10: Name + professional + multiple context points match

Identify:
1. Elements suggesting SAME person (list them)
2. Elements suggesting DIFFERENT person (list them)

Compare the two lists and determine:
- Is this likely the same person? (true/false)
- Relevancy score (1-10)
- Confidence (high/medium/low)
- Reasoning (2-3 sentences)

Return ONLY valid JSON:
{
  "relevancyScore": 7,
  "isLikelyMatch": true,
  "confidence": "high",
  "reasoning": "...",
  "samePersonElements": ["element1", "element2"],
  "differentPersonElements": ["element1"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are an expert OSINT analyst who validates sources. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 1,
      max_completion_tokens: 500,
    });

    const content = response.choices[0].message.content?.trim() || '{}';
    const result = JSON.parse(content);

    return {
      url: source.url,
      relevancyScore: result.relevancyScore || 1,
      isLikelyMatch: result.isLikelyMatch || false,
      confidence: result.confidence || 'low',
      reasoning: result.reasoning || 'Unable to determine',
      samePersonElements: result.samePersonElements || [],
      differentPersonElements: result.differentPersonElements || [],
    };
  } catch (error) {
    console.error(`Error validating source ${source.url}:`, error);
    // Return low-confidence result on error
    return {
      url: source.url,
      relevancyScore: 1,
      isLikelyMatch: false,
      confidence: 'low',
      reasoning: 'Validation failed',
      samePersonElements: [],
      differentPersonElements: [],
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
  // Filter to only likely matches with score >= 6
  const qualified = validations.filter(
    v => v.isLikelyMatch && v.relevancyScore >= 6
  );

  if (qualified.length === 0) {
    return null;
  }

  // Sort by score descending, then by confidence
  qualified.sort((a, b) => {
    if (b.relevancyScore !== a.relevancyScore) {
      return b.relevancyScore - a.relevancyScore;
    }
    const confidenceOrder = { high: 3, medium: 2, low: 1 };
    return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
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

