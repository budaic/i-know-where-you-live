import Exa from 'exa-js';
import { config } from '../config';
import { SearchQuery, SearchResult } from '../types';

// Initialize Exa client
// Note: Exa requires an API key even when using through Smithery
const exaClient = new Exa(config.exaApiKey);

export async function executeSearch(
  query: SearchQuery
): Promise<SearchResult[]> {
  try {
    // Use Exa search API
    const response = await exaClient.searchAndContents(query.query, {
      numResults: 5,
      text: true,
      highlights: true,
    });

    return response.results.map((result: any) => ({
      url: result.url,
      title: result.title || '',
      snippet: result.text?.substring(0, 500) || result.highlights?.[0] || '',
      depth: query.depth,
    }));
  } catch (error) {
    console.error(`Error executing search for query "${query.query}":`, error);
    return [];
  }
}

export async function executeSearchBatch(
  queries: SearchQuery[]
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  // Execute searches sequentially to avoid rate limiting
  for (const query of queries) {
    const queryResults = await executeSearch(query);
    results.push(...queryResults);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

export function filterViableResults(
  results: SearchResult[],
  subjectName: string
): SearchResult[] {
  // Filter out results that don't seem relevant
  // Basic heuristic: the result should at least mention the subject name
  const nameParts = subjectName.toLowerCase().split(' ');
  
  return results.filter((result) => {
    const text = `${result.title} ${result.snippet}`.toLowerCase();
    
    // Check if at least some parts of the name appear
    const matchCount = nameParts.filter(part => text.includes(part)).length;
    
    // Require at least half of the name parts to match
    return matchCount >= Math.ceil(nameParts.length / 2);
  });
}

export function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  const unique: SearchResult[] = [];

  for (const result of results) {
    if (!seen.has(result.url)) {
      seen.add(result.url);
      unique.push(result);
    }
  }

  return unique;
}

