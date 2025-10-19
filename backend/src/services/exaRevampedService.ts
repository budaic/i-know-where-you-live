import { Exa } from 'exa-js';
import { config } from '../config';

const exa = new Exa(config.exaApiKey);

export interface ExaSearchResultWithSummary {
  id: string;
  title: string | null;
  url: string;
  publishedDate?: string;
  author?: string;
  score: number | undefined;
  text?: string;
  summary?: string;
}

export interface SearchQuery {
  query: string;
  type: 'simple' | 'hard-context' | 'generated-context';
  priority: number;
}

/**
 * Search with AI-generated summaries using Exa
 */
export async function searchWithAISummaries(
  query: string,
  subjectName: string,
  hardContext: string,
  numResults: number = 30
): Promise<ExaSearchResultWithSummary[]> {
  try {
    console.log(`🔍 Searching with AI summaries: "${query}"`);
    
    const summaryQuery = `Summarize what this text is about and what it says about ${subjectName} and ${hardContext}. Focus on specific details, achievements, affiliations, and any relevant information that would help identify this person.`;

    const response = await exa.searchAndContents(query, {
      text: true,
      livecrawl: "preferred",
      type: "auto",
      includeText: [subjectName],
      numResults,
      summary: {
        query: summaryQuery
      }
    });

    const results: ExaSearchResultWithSummary[] = response.results.map(result => ({
      id: result.id,
      title: result.title,
      url: result.url,
      publishedDate: result.publishedDate,
      author: result.author,
      score: result.score,
      text: result.text,
      summary: result.summary
    }));

    console.log(`✅ Found ${results.length} results with AI summaries`);
    return results;
  } catch (error) {
    console.error('Error searching with AI summaries:', error);
    return [];
  }
}

/**
 * Generate search queries for the revamped search system
 */
export function generateSearchQueries(
  subjectName: string,
  hardContext: string,
  generatedContext: string
): SearchQuery[] {
  const queries: SearchQuery[] = [];

  // Simple name query
  queries.push({
    query: subjectName,
    type: 'simple',
    priority: 1
  });

  // Name + hard context query
  if (hardContext && hardContext.trim()) {
    queries.push({
      query: `${subjectName} ${hardContext}`,
      type: 'hard-context',
      priority: 2
    });
  }

  // Name + generated context query (if we have generated context)
  if (generatedContext && generatedContext.trim()) {
    queries.push({
      query: `${subjectName} ${generatedContext}`,
      type: 'generated-context',
      priority: 3
    });
  }

  return queries;
}

/**
 * Execute multiple search queries and collect results
 */
export async function executeMultipleSearches(
  queries: SearchQuery[],
  subjectName: string,
  hardContext: string,
  maxResultsPerQuery: number = 30
): Promise<ExaSearchResultWithSummary[]> {
  const allResults: ExaSearchResultWithSummary[] = [];
  const seenUrls = new Set<string>();

  for (const query of queries) {
    try {
      console.log(`🔍 Executing ${query.type} query: "${query.query}"`);
      
      const results = await searchWithAISummaries(
        query.query,
        subjectName,
        hardContext,
        maxResultsPerQuery
      );

      // Deduplicate results by URL
      for (const result of results) {
        if (!seenUrls.has(result.url)) {
          seenUrls.add(result.url);
          allResults.push(result);
        }
      }

      console.log(`✅ Collected ${results.length} results from ${query.type} query`);
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error executing ${query.type} query:`, error);
    }
  }

  console.log(`🎯 Total unique results collected: ${allResults.length}`);
  return allResults;
}
