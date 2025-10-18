import Exa from 'exa-js';
import { config } from '../config';

const exaClient = new Exa(config.exaApiKey);

export interface ExaResult {
  url: string;
  title: string;
  text?: string;
  score?: number;
}

/**
 * Search LinkedIn profiles
 */
export async function searchLinkedIn(name: string): Promise<ExaResult[]> {
  try {
    const query = `${name} site:linkedin.com`;
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
    console.error(`Error searching LinkedIn for ${name}:`, error);
    return [];
  }
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

