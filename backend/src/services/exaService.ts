import Exa from 'exa-js';
import { config } from '../config';

const exaClient = new Exa(config.exaApiKey);

export interface ExaResult {
  url: string;
  title: string;
  text?: string;
  score?: number;
  highlights?: string[];
  summary?: string;
}

/**
 * Check if a URL is a LinkedIn profile
 */
function isLinkedInProfile(url: string): boolean {
  return url.includes('linkedin.com') && url.includes('/in/');
}

/**
 * Check if a URL is on LinkedIn
 */
function isLinkedInUrl(url: string): boolean {
  return url.includes('linkedin.com');
}

/**
 * Search LinkedIn profiles with smart filtering to ensure actual profiles
 */
export async function searchLinkedIn(name: string, hardContext?: string, softContext?: string): Promise<ExaResult[]> {
  const maxAttempts = 3;
  const targetProfiles = 5; // Reduced to get fewer LinkedIn profiles
  const allResults: ExaResult[] = [];
  const seenUrls = new Set<string>();
  
  console.log(`\n=== Smart LinkedIn Search for: ${name} ===`);
  console.log(`Hard Context: ${hardContext || 'None'}`);
  console.log(`Soft Context: ${softContext || 'None'}`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Try different query variations to get more diverse results
      let query: string;
      let includeText: string[] = [];
      
      switch (attempt) {
        case 1:
          // Most specific: direct profile search
          query = `${name} site:linkedin.com/in/`;
          includeText = [name];
          break;
        case 2:
          // Exact name match with quotes
          query = `"${name}" site:linkedin.com/in/`;
          includeText = [name];
          break;
        case 3:
          // Broader search but still targeting profiles
          query = `${name} linkedin profile site:linkedin.com/in/`;
          includeText = [name];
          break;
        default:
          // Fallback to general LinkedIn search
          query = `${name} site:linkedin.com`;
      }
      
      console.log(`Attempt ${attempt}: Searching with query: "${query}"`);
      if (includeText.length > 0) {
        console.log(`Include text: ${includeText.join(', ')}`);
      }
      
      const searchOptions: any = {
        numResults: 10, // Get more results to filter from
        useAutoprompt: false,
        type: 'keyword', // Use keyword search for Google-like results
        category: 'linkedin profile', // Focus on LinkedIn profiles
        context: true, // Format results for LLM context
        contents: {
          text: true, // Get full page text
          livecrawl: 'preferred', // Always try to livecrawl for fresh data
          livecrawlTimeout: 15000, // 15 second timeout for LinkedIn
          highlights: true, // Get LLM-identified relevant snippets
          summary: true, // Get webpage summary
        },
      };
      
      // Add includeText if we have it
      if (includeText.length > 0) {
        searchOptions.includeText = includeText;
      }
      
      const response = await exaClient.searchAndContents(query, searchOptions);

      const newResults = response.results
        .map((result: any) => ({
          url: result.url,
          title: result.title || '',
          text: result.text || '',
          score: result.score,
          highlights: result.highlights || [],
          summary: result.summary || '',
        }))
        .filter((result: ExaResult) => {
          // Only include LinkedIn URLs we haven't seen before
          if (seenUrls.has(result.url)) {
            return false;
          }
          seenUrls.add(result.url);
          return isLinkedInUrl(result.url);
        });

      console.log(`Found ${newResults.length} new LinkedIn results (${newResults.filter((r: ExaResult) => isLinkedInProfile(r.url)).length} profiles)`);
      
      allResults.push(...newResults);
      
      // Check if we have enough profiles
      const profileCount = allResults.filter((r: ExaResult) => isLinkedInProfile(r.url)).length;
      console.log(`Total profiles found so far: ${profileCount}/${targetProfiles}`);
      
      if (profileCount >= targetProfiles) {
        console.log(`✅ Found ${profileCount} LinkedIn profiles, stopping search`);
        break;
      }
      
      // Small delay between attempts to avoid rate limiting
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`Error in attempt ${attempt} for LinkedIn search:`, error);
    }
  }
  
  // Filter to only LinkedIn profiles and limit to target count
  let profileResults = allResults
    .filter((result: ExaResult) => isLinkedInProfile(result.url))
    .slice(0, targetProfiles);
  
  // If we still don't have enough profiles, try one final fallback search
  if (profileResults.length < targetProfiles && profileResults.length < 5) {
    console.log(`\n🔄 Final fallback attempt: trying broader search...`);
    try {
      const fallbackQuery = `${name} site:linkedin.com`;
      const fallbackResponse = await exaClient.searchAndContents(fallbackQuery, {
        numResults: 20,
        useAutoprompt: false,
        type: 'keyword',
        category: 'linkedin profile',
        context: true,
        contents: {
          text: true,
          livecrawl: 'preferred',
          livecrawlTimeout: 15000,
          highlights: true,
          summary: true,
        },
      });
      
      const fallbackResults = fallbackResponse.results
        .map((result: any) => ({
          url: result.url,
          title: result.title || '',
          text: result.text || '',
          score: result.score,
          highlights: result.highlights || [],
          summary: result.summary || '',
        }))
        .filter((result: ExaResult) => {
          if (seenUrls.has(result.url)) return false;
          seenUrls.add(result.url);
          return isLinkedInProfile(result.url);
        });
      
      console.log(`Fallback search found ${fallbackResults.length} additional profiles`);
      allResults.push(...fallbackResults);
      
      // Re-filter and sort
      profileResults = allResults
        .filter((result: ExaResult) => isLinkedInProfile(result.url))
        .slice(0, targetProfiles);
        
    } catch (error) {
      console.error(`Error in fallback search:`, error);
    }
  }
  
  // Sort by score (highest first) if available
  profileResults.sort((a, b) => (b.score || 0) - (a.score || 0));
  
  console.log(`\n=== LinkedIn Search Complete ===`);
  console.log(`Total LinkedIn URLs found: ${allResults.length}`);
  console.log(`LinkedIn profiles found: ${profileResults.length}`);
  console.log(`Returning top ${profileResults.length} profiles`);
  
  if (profileResults.length === 0) {
    console.log(`⚠️  No LinkedIn profiles found for "${name}"`);
  } else if (profileResults.length < targetProfiles) {
    console.log(`⚠️  Only found ${profileResults.length}/${targetProfiles} LinkedIn profiles`);
  } else {
    console.log(`✅ Successfully found ${profileResults.length} LinkedIn profiles`);
  }
  
  return profileResults;
}

/**
 * Search GitHub profiles
 */
export async function searchGitHub(name: string): Promise<ExaResult[]> {
  try {
    const query = `${name} github`;
    const response = await exaClient.searchAndContents(query, {
      numResults: 10,
      text: true,
      useAutoprompt: false,
    });

    return response.results.map((result: any) => ({
      url: result.url,
      title: result.title || '',
      text: result.text || '',
      score: result.score,
    }));
  } catch (error) {
    console.error(`Error searching GitHub for ${name}:`, error);
    return [];
  }
}

/**
 * Search for personal websites
 */
export async function searchWebsite(name: string): Promise<ExaResult[]> {
  try {
    const query = `${name} personal website OR portfolio`;
    const response = await exaClient.searchAndContents(query, {
      numResults: 10,
      text: true,
      useAutoprompt: false,
    });

    return response.results.map((result: any) => ({
      url: result.url,
      title: result.title || '',
      text: result.text || '',
      score: result.score,
    }));
  } catch (error) {
    console.error(`Error searching website for ${name}:`, error);
    return [];
  }
}

/**
 * General search with custom query
 */
export async function searchGeneral(query: string): Promise<ExaResult[]> {
  try {
    const response = await exaClient.searchAndContents(query, {
      numResults: 10,
      text: true,
      useAutoprompt: false,
    });

    return response.results.map((result: any) => ({
      url: result.url,
      title: result.title || '',
      text: result.text || '',
      score: result.score,
    }));
  } catch (error) {
    console.error(`Error in general search for "${query}":`, error);
    return [];
  }
}

/**
 * Crawl content from a specific URL (replaces Browserbase)
 */
export async function crawlContent(url: string): Promise<string> {
  try {
    const response = await exaClient.getContents([url], {
      text: true,
      maxCharacters: 5000,
    });

    if (response.results && response.results.length > 0) {
      return response.results[0].text || '';
    }
    return '';
  } catch (error) {
    console.error(`Error crawling content from ${url}:`, error);
    return '';
  }
}

