import OpenAI from 'openai';
import { config } from '../config';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

export interface OptimizedQuery {
  originalQuery: string;
  optimizedQuery: string;
  reasoning: string;
  searchStrategy: string;
}

/**
 * Optimize search queries using GPT-5-nano for better search results
 */
export async function optimizeSearchQuery(
  query: string,
  subjectName: string,
  hardContext: string,
  queryType: 'simple' | 'hard-context' | 'generated-context'
): Promise<OptimizedQuery> {
  try {
    const prompt = `
Original Query: "${query}"
Subject Name: ${subjectName}
Hard Context: ${hardContext}
Query Type: ${queryType}

OPTIMIZATION GOALS:
- Make the query more specific and targeted for web search
- Include relevant keywords that would appear in high-quality sources
- Use proper search operators and syntax
- Focus on finding substantial, detailed information about the subject
- Avoid overly broad or generic terms
- Include context-specific terms that would help identify the right person

SEARCH STRATEGY GUIDELINES:
- For "simple" queries: Focus on the name with professional/academic context
- For "hard-context" queries: Emphasize the specific context details
- For "generated-context" queries: Build on previously found information
- Use site-specific searches when appropriate (e.g., "site:linkedin.com")
- Include relevant professional/academic keywords
- Consider variations and synonyms

Generate an optimized query that will find the most relevant, high-quality information about ${subjectName}.

Return ONLY valid JSON:
{
  "optimizedQuery": "optimized search query here",
  "reasoning": "explanation of why this query is better",
  "searchStrategy": "description of the search approach used"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini as fallback
      messages: [
        {
          role: 'system',
          content: 'You are an expert search query optimizer. Create highly effective search queries that will find the most relevant and detailed information about people. Focus on specificity, relevance, and search effectiveness.'
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
      throw new Error('No response from query optimizer');
    }

    const result = JSON.parse(content);
    
    console.log(`🔍 Query Optimization:`);
    console.log(`   Original: "${query}"`);
    console.log(`   Optimized: "${result.optimizedQuery}"`);
    console.log(`   Strategy: ${result.searchStrategy}`);
    console.log(`   Reasoning: ${result.reasoning}`);

    return {
      originalQuery: query,
      optimizedQuery: result.optimizedQuery,
      reasoning: result.reasoning,
      searchStrategy: result.searchStrategy
    };

  } catch (error) {
    console.error('Error optimizing search query:', error);
    // Fallback to original query if optimization fails
    return {
      originalQuery: query,
      optimizedQuery: query,
      reasoning: 'Optimization failed, using original query',
      searchStrategy: 'fallback'
    };
  }
}

/**
 * Optimize multiple queries in batch
 */
export async function optimizeSearchQueries(
  queries: string[],
  subjectName: string,
  hardContext: string,
  queryType: 'simple' | 'hard-context' | 'generated-context'
): Promise<OptimizedQuery[]> {
  const optimizedQueries: OptimizedQuery[] = [];
  
  for (const query of queries) {
    try {
      const optimized = await optimizeSearchQuery(query, subjectName, hardContext, queryType);
      optimizedQueries.push(optimized);
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error optimizing query "${query}":`, error);
      optimizedQueries.push({
        originalQuery: query,
        optimizedQuery: query,
        reasoning: 'Optimization failed',
        searchStrategy: 'fallback'
      });
    }
  }
  
  return optimizedQueries;
}
