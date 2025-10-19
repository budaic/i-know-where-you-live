import OpenAI from 'openai';
import { config } from '../config';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * Validate if a text contains information that matches the hard context or generated context
 */
export async function validateContextMatch(
  text: string,
  summary: string,
  subjectName: string,
  hardContext: string,
  generatedContext: string
): Promise<boolean> {
  try {
    const prompt = `
Text: ${text}
Summary: ${summary}
Subject: ${subjectName}
Hard Context: ${hardContext}
Generated Context: ${generatedContext}

STRICT VALIDATION RULES:
- The text must contain SPECIFIC, DETAILED information that DIRECTLY relates to the hard context or generated context
- Generic mentions of the subject name are NOT sufficient
- The text must provide SUBSTANTIAL evidence that this is the same person described in the context
- Vague or superficial connections are NOT acceptable
- The text must contain specific details, achievements, affiliations, or characteristics that match the context
- If the text only mentions the name without substantial context matching, answer "NO"

Does this text contain SUBSTANTIAL, SPECIFIC information that STRONGLY matches the hard context or generated context for ${subjectName}? Answer only "YES" or "NO".
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini as fallback since gpt-5-nano might not be available
      messages: [
        {
          role: 'system',
          content: 'You are a STRICT context matching assistant. You must be very conservative and only return "YES" if there is STRONG, SPECIFIC evidence that the text contains substantial information matching the provided context. Generic mentions or weak connections should result in "NO". Respond with only "YES" or "NO".'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 10,
      temperature: 0.0, // Even lower temperature for more consistent strictness
    });

    const answer = response.choices[0]?.message?.content?.trim().toUpperCase();
    console.log(`🔍 Context Validation for "${subjectName}": ${answer}`);
    console.log(`   Hard Context: ${hardContext}`);
    console.log(`   Generated Context: ${generatedContext}`);
    console.log(`   Text Preview: ${text.substring(0, 200)}...`);
    return answer === 'YES';
  } catch (error) {
    console.error('Error validating context match:', error);
    return false;
  }
}

/**
 * Generate exactly 3 bullet points on how the text relates the subject to the context
 */
export async function generateContextPoints(
  text: string,
  summary: string,
  subjectName: string,
  hardContext: string,
  generatedContext: string
): Promise<string[]> {
  try {
    const prompt = `
Text: ${text}
Summary: ${summary}
Subject: ${subjectName}
Hard Context: ${hardContext}
Generated Context: ${generatedContext}

Generate exactly 3 bullet points on how this text relates ${subjectName} to the hard context or generated context. Be specific and factual. No reasoning, just the 3 points. Format each point with a bullet point (-).
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini as fallback
      messages: [
        {
          role: 'system',
          content: 'You are a context analysis assistant. Generate exactly 3 bullet points that explain how the text relates the subject to the provided context. Be specific and factual. Format each point with a bullet point (-).'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return [];
    }

    // Parse bullet points from the response
    const points = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(point => point.length > 0)
      .slice(0, 3); // Ensure exactly 3 points

    return points;
  } catch (error) {
    console.error('Error generating context points:', error);
    return [];
  }
}

/**
 * Check if the subject name appears in the text
 */
export function hasNameMatch(text: string, subjectName: string): boolean {
  const nameWords = subjectName.toLowerCase().split(' ').filter(word => word.length > 2);
  const textLower = text.toLowerCase();
  
  // Check if all significant words from the name appear in the text
  return nameWords.every(word => textLower.includes(word));
}
