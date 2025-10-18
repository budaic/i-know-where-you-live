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
  console.log('\n' + '='.repeat(80));
  console.log('🔍 VALIDATION SERVICE DEBUG - START');
  console.log('='.repeat(80));
  
  console.log('\n📋 INPUT PARAMETERS:');
  console.log('Subject Name:', subjectName);
  console.log('Hard Context:', hardContext);
  console.log('Soft Context:', softContext);
  console.log('Generated Context:', JSON.stringify(generatedContext, null, 2));
  
  console.log('\n📄 SOURCE DATA:');
  console.log('URL:', source.url);
  console.log('Title:', source.title);
  console.log('Text Length:', source.text?.length || 0);
  console.log('Text Preview:', source.text?.substring(0, 200) + '...');
  
  const generatedContextText = formatGeneratedContext(generatedContext);

  const prompt = `Validate if this source is about "${subjectName}".

Context: ${hardContext || 'None'} | ${softContext || 'None'}
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

  console.log('\n📝 PROMPT GENERATION:');
  console.log('Generated Context Text:', generatedContextText);
  console.log('Prompt Length:', prompt.length);
  console.log('Prompt Preview (first 500 chars):', prompt.substring(0, 500) + '...');
  
  console.log('\n🚀 MAKING API CALL:');
  console.log('Model: gpt-5-nano');
  console.log('Temperature: 1');
  console.log('Max Completion Tokens: 4000');
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are an OSINT analyst. Respond with ONLY valid JSON. No other text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 1,
      max_completion_tokens: 4000,
    });

    console.log('\n📥 API RESPONSE RECEIVED:');
    console.log('Response ID:', response.id);
    console.log('Model Used:', response.model);
    console.log('Finish Reason:', response.choices[0].finish_reason);
    
    console.log('\n🔢 DETAILED TOKEN USAGE:');
    console.log('Prompt Tokens:', response.usage.prompt_tokens);
    console.log('Completion Tokens:', response.usage.completion_tokens);
    console.log('Total Tokens:', response.usage.total_tokens);
    console.log('Max Completion Tokens Limit:', 4000);
    console.log('Tokens Remaining:', 4000 - response.usage.completion_tokens);
    console.log('Token Usage Percentage:', Math.round((response.usage.completion_tokens / 4000) * 100) + '%');
    
    console.log('\n🧠 REASONING TOKEN BREAKDOWN:');
    console.log('Reasoning Tokens:', response.usage.completion_tokens_details?.reasoning_tokens || 'N/A');
    console.log('Accepted Prediction Tokens:', response.usage.completion_tokens_details?.accepted_prediction_tokens || 'N/A');
    console.log('Rejected Prediction Tokens:', response.usage.completion_tokens_details?.rejected_prediction_tokens || 'N/A');
    
    if (response.usage.completion_tokens_details?.reasoning_tokens) {
      const reasoningTokens = response.usage.completion_tokens_details.reasoning_tokens;
      const totalCompletion = response.usage.completion_tokens;
      const outputTokens = totalCompletion - reasoningTokens;
      console.log('Output Tokens (for response):', outputTokens);
      console.log('Reasoning vs Output Ratio:', Math.round((reasoningTokens / totalCompletion) * 100) + '% reasoning, ' + Math.round((outputTokens / totalCompletion) * 100) + '% output');
    }
    
    console.log('\n🔍 RESPONSE CONTENT ANALYSIS:');
    const rawContent = response.choices[0].message.content?.trim() || '{}';
    console.log('Raw Content Type:', typeof response.choices[0].message.content);
    console.log('Raw Content Length:', response.choices[0].message.content?.length || 0);
    console.log('Raw Content is null:', response.choices[0].message.content === null);
    console.log('Raw Content is undefined:', response.choices[0].message.content === undefined);
    console.log('Raw Content is empty string:', response.choices[0].message.content === '');
    console.log('Raw Content after trim:', rawContent);
    console.log('Final processed content:', rawContent);
    
    console.log('\n🔧 JSON PARSING:');
    let result;
    try {
      result = JSON.parse(rawContent);
      console.log('✅ JSON parsing successful');
      console.log('Parsed result:', JSON.stringify(result, null, 2));
    } catch (parseError) {
      console.log('❌ JSON parsing failed:', parseError.message);
      console.log('Raw content that failed to parse:', rawContent);
      
      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('🔍 Attempting to extract JSON from response...');
        console.log('Extracted JSON:', jsonMatch[0]);
        result = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON extraction successful');
      } else {
        console.log('❌ No valid JSON found in response');
        throw new Error('No valid JSON found in response');
      }
    }

    console.log('\n📤 RETURNING RESULT:');
    console.log('URL:', source.url);
    console.log('Relevancy Score:', result.relevancyScore || 1);
    console.log('Is Likely Match:', result.isLikelyMatch || false);
    console.log('Confidence:', result.confidence || 'low');
    console.log('Reasoning:', result.reasoning || 'Unable to determine');
    
    // Create the prompt field with both the prompt and the response
    const promptWithResponse = `PROMPT:\n${prompt}\n\nRESPONSE:\n${rawContent}`;

    console.log('\n' + '='.repeat(80));
    console.log('✅ VALIDATION SERVICE DEBUG - COMPLETE');
    console.log('='.repeat(80) + '\n');

    return {
      url: source.url,
      relevancyScore: result.relevancyScore || 1,
      isLikelyMatch: result.isLikelyMatch || false,
      confidence: result.confidence || 'low',
      reasoning: result.reasoning || 'Unable to determine',
      samePersonElements: result.samePersonElements || [],
      differentPersonElements: result.differentPersonElements || [],
      prompt: promptWithResponse,
    };
  } catch (error) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ VALIDATION SERVICE ERROR');
    console.log('='.repeat(80));
    console.log('Error validating source:', source.url);
    console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('='.repeat(80) + '\n');
    
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

