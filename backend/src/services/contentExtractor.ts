import { chromium } from 'playwright';
import { config } from '../config';
import { SearchResult, SourceContent } from '../types';

export async function extractContent(
  result: SearchResult
): Promise<SourceContent | null> {
  try {
    // Use Browserbase for browser automation
    // Connect to Browserbase remote browser
    const browser = await chromium.connectOverCDP(
      `wss://connect.browserbase.com?apiKey=${config.browserbaseApiKey}`
    );

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(result.url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    // Extract text content
    const content = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style, nav, footer, header');
      scripts.forEach(el => el.remove());

      // Get main content
      const main = document.querySelector('main, article, .content, #content');
      if (main) {
        return main.textContent || '';
      }

      return document.body.textContent || '';
    });

    await context.close();
    await browser.close();

    // Clean and limit content
    const cleanContent = content
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // Limit to 5000 characters

    return {
      url: result.url,
      content: cleanContent,
      depth: result.depth,
    };
  } catch (error) {
    console.error(`Error extracting content from ${result.url}:`, error);
    
    // Fallback: use the snippet from search results
    return {
      url: result.url,
      content: result.snippet,
      depth: result.depth,
    };
  }
}

export async function extractContentBatch(
  results: SearchResult[]
): Promise<SourceContent[]> {
  const contents: SourceContent[] = [];

  // Process in smaller batches to avoid overwhelming Browserbase
  const batchSize = 3;
  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);
    
    const batchPromises = batch.map(result => extractContent(result));
    const batchResults = await Promise.allSettled(batchPromises);

    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        contents.push(result.value);
      }
    }

    // Delay between batches
    if (i + batchSize < results.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return contents;
}

// Fallback function using simple fetch if Browserbase is unavailable
export async function extractContentSimple(
  result: SearchResult
): Promise<SourceContent> {
  try {
    const response = await fetch(result.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OSINTProfiler/1.0)',
      },
    });

    const html = await response.text();
    
    // Simple HTML tag removal
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000);

    return {
      url: result.url,
      content: text,
      depth: result.depth,
    };
  } catch (error) {
    console.error(`Error in simple extraction from ${result.url}:`, error);
    return {
      url: result.url,
      content: result.snippet,
      depth: result.depth,
    };
  }
}

