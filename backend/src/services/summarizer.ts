import OpenAI from 'openai';
import { config } from '../config';
import { SourceContent, SourceSummary } from '../types';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

export async function summarizeSource(
  source: SourceContent,
  subjectName: string
): Promise<SourceSummary> {
  const prompt = `Summarize the following content about ${subjectName}. Focus on:
- Personal information (name variations, aliases, usernames)
- Professional information (job, education, skills)
- Contact information and social media
- Notable achievements or activities
- Any other relevant identifying information

Keep the summary concise (2-3 paragraphs maximum).

URL: ${source.url}

Content:
${source.content}

Summary:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise summaries of web content for OSINT research.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const summary = response.choices[0].message.content?.trim() || 'No summary available.';

    return {
      url: source.url,
      summary,
      depth: source.depth,
    };
  } catch (error) {
    console.error(`Error summarizing source ${source.url}:`, error);
    return {
      url: source.url,
      summary: source.content.substring(0, 300) + '...',
      depth: source.depth,
    };
  }
}

export async function summarizeSourcesBatch(
  sources: SourceContent[],
  subjectName: string
): Promise<SourceSummary[]> {
  const summaries: SourceSummary[] = [];

  // Process summaries with limited concurrency
  const batchSize = 5;
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    
    const batchPromises = batch.map(source => 
      summarizeSource(source, subjectName)
    );
    
    const batchResults = await Promise.all(batchPromises);
    summaries.push(...batchResults);

    // Small delay between batches
    if (i + batchSize < sources.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return summaries;
}

