import OpenAI from 'openai';
import { config } from '../config';
import { Subject, SearchQuery } from '../types';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

export async function generateSearchQueries(
  subject: Subject
): Promise<SearchQuery[]> {
  const maxDepth = subject.maxDepth || config.maxDepth;
  
  const contextInfo = [subject.hardContext, subject.softContext].filter(Boolean).join(' ');
  
  const prompt = `Given a person's name and context, generate ${maxDepth + 1} search queries (depth 0 to ${maxDepth}) to find information about them online.

Name: ${subject.name}
Context: ${contextInfo}

Generate queries that target:
- Depth 0: Most specific - combining name with detailed context and specific platforms (github, linkedin, personal website, university site)
- Depths 1-${Math.floor(maxDepth/2)}: Moderate specificity - name with partial context
- Depths ${Math.floor(maxDepth/2)+1}-${maxDepth-1}: Broader - name with minimal context
- Depth ${maxDepth}: Broadest - just the name

Return ONLY a JSON array of objects with "depth" (number) and "query" (string) fields. No other text.

Example format:
[
  {"depth": 0, "query": "John Smith engineering student SUTD github"},
  {"depth": 1, "query": "John Smith engineering student SUTD linkedin"},
  {"depth": 2, "query": "John Smith SUTD"},
  {"depth": 3, "query": "John Smith"}
]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates search queries for OSINT research. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 1,
    });

    const content = response.choices[0].message.content?.trim() || '[]';
    const queries = JSON.parse(content);

    return queries.map((q: any, index: number) => ({
      uid: `${Date.now()}-${index}`,
      depth: q.depth,
      query: q.query,
    }));
  } catch (error) {
    console.error('Error generating search queries:', error);
    // Fallback to simple query generation
    return generateFallbackQueries(subject);
  }
}

function generateFallbackQueries(subject: Subject): SearchQuery[] {
  const maxDepth = subject.maxDepth || config.maxDepth;
  const queries: SearchQuery[] = [];
  const platforms = ['github', 'linkedin', 'personal website', 'university'];
  const contextInfo = [subject.hardContext, subject.softContext].filter(Boolean).join(' ');

  // Depth 0: Most specific with platforms
  for (let i = 0; i < Math.min(platforms.length, maxDepth + 1); i++) {
    queries.push({
      uid: `${Date.now()}-${i}`,
      depth: i,
      query: i === 0 
        ? `${subject.name} ${contextInfo} ${platforms[i]}`
        : `${subject.name} ${contextInfo}`,
      type: 'simple',
      priority: i + 1,
    });
  }

  // Fill remaining depths
  for (let i = platforms.length; i <= maxDepth; i++) {
    queries.push({
      uid: `${Date.now()}-${i}`,
      depth: i,
      query: i === maxDepth ? subject.name : `${subject.name} ${contextInfo.split(' ').slice(0, maxDepth - i).join(' ')}`,
      type: 'simple',
      priority: i + 1,
    });
  }

  return queries;
}

