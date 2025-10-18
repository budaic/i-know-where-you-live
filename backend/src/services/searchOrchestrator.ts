import OpenAI from 'openai';
import { config } from '../config';
import { ProfileCreationLog, GeneratedContext, SearchLog, ValidationResult, ProgressUpdate } from '../types';
import * as exaService from './exaService';
import * as validationService from './validationService';
import * as progressTracker from './progressTracker';
import { generateProfileFromLog } from './profileGeneratorV2';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * Execute the complete 4-phase search flow
 */
export async function executeMultiPhaseSearch(
  name: string,
  hardContext: string,
  softContext: string,
  sessionId?: string
): Promise<ProfileCreationLog> {
  console.log(`\n=== Starting Multi-Phase Search for: ${name} ===`);
  
  if (sessionId) {
    progressTracker.sendPhaseStart(sessionId, 'linkedin', 'Starting LinkedIn profile search...');
  }

  const generatedContext: GeneratedContext = {
    additionalFindings: [],
  };

  const searchLogs: SearchLog[] = [];

  try {
    // Phase 1: LinkedIn
    console.log('\n--- Phase 1: LinkedIn Search ---');
    const linkedinLog = await searchLinkedInProfile(name, hardContext, softContext, generatedContext, sessionId);
    searchLogs.push(linkedinLog);

    // Phase 2: GitHub
    console.log('\n--- Phase 2: GitHub Search ---');
    if (sessionId) {
      progressTracker.sendPhaseStart(sessionId, 'github', 'Starting GitHub profile search...');
    }
    const githubLog = await searchGitHubProfile(name, hardContext, softContext, generatedContext, sessionId);
    searchLogs.push(githubLog);

    // Phase 3: Personal Website
    console.log('\n--- Phase 3: Website Search ---');
    if (sessionId) {
      progressTracker.sendPhaseStart(sessionId, 'website', 'Starting personal website search...');
    }
    const websiteLog = await searchPersonalWebsite(name, hardContext, softContext, generatedContext, sessionId);
    searchLogs.push(websiteLog);

    // Phase 4: General Queries
    console.log('\n--- Phase 4: General Queries ---');
    if (sessionId) {
      progressTracker.sendPhaseStart(sessionId, 'general', 'Starting general information search...');
    }
    const generalLogs = await searchGeneralQueries(name, hardContext, softContext, generatedContext, sessionId);
    searchLogs.push(...generalLogs);
  } catch (error) {
    if (sessionId) {
      progressTracker.sendError(sessionId, `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    throw error;
  }

  // Collect all high-quality sources (score >= 6)
  const finalSources = collectFinalSources(searchLogs);

  console.log(`\n=== Search Complete: ${finalSources.length} high-quality sources found ===`);
  
  if (sessionId) {
    // Generate the final profile to save with the session
    const finalProfile = await generateProfileFromLog({
      subjectName: name,
      hardContext,
      softContext,
      generatedContext,
      searchLogs,
      finalSources,
    });
    
    progressTracker.sendSearchComplete(sessionId, `Search completed successfully! Found ${finalSources.length} high-quality sources.`, finalProfile);
  }

  return {
    subjectName: name,
    hardContext,
    softContext,
    generatedContext,
    searchLogs,
    finalSources,
  };
}

/**
 * Phase 1: Search and validate LinkedIn profile
 */
async function searchLinkedInProfile(
  name: string,
  hardContext: string,
  softContext: string,
  generatedContext: GeneratedContext,
  sessionId?: string
): Promise<SearchLog> {
  const query = `${name} linkedin.com`;
  console.log(`Searching: ${query}`);
  
  if (sessionId) {
    progressTracker.sendPhaseProgress(sessionId, 'linkedin', 'searching', `Searching LinkedIn for ${name}...`);
  }

  const results = await exaService.searchLinkedIn(name);
  console.log(`Smart search returned ${results.length} LinkedIn profile results`);
  
  if (sessionId) {
    progressTracker.sendPhaseProgress(sessionId, 'linkedin', 'searching', `Found ${results.length} LinkedIn results, validating...`);
  }

  if (results.length === 0) {
    if (sessionId) {
      progressTracker.sendPhaseComplete(sessionId, 'linkedin', 'No LinkedIn profiles found');
    }
    return {
      phase: 'LinkedIn',
      query,
      resultsFound: 0,
      validatedResults: [],
      timestamp: new Date(),
    };
  }

  // Validate each result
  if (sessionId) {
    progressTracker.sendPhaseProgress(sessionId, 'linkedin', 'validating', `Validating ${results.length} LinkedIn results...`);
  }
  
  const validations = await validationService.validateSourcesBatch(
    results,
    name,
    hardContext,
    softContext,
    generatedContext
  );

  // Select the best LinkedIn profile (should be only one)
  // Only consider actual profiles (category === 'profile') for LinkedIn profile selection
  const profileValidations = validations.filter(v => v.category === 'profile');
  const bestProfile = validationService.selectBestProfile(profileValidations);

  let contextAdded: string | undefined;
  let selectedUrl: string | undefined;

  if (bestProfile) {
    console.log(`Selected LinkedIn profile: ${bestProfile.url} (score: ${bestProfile.relevancyScore}, category: ${bestProfile.category})`);
    selectedUrl = bestProfile.url;

    if (sessionId) {
      progressTracker.sendPhaseProgress(sessionId, 'linkedin', 'validating', `Selected LinkedIn profile: ${bestProfile.url}`, {
        found: results.length,
        qualified: profileValidations.length,
        selected: bestProfile.url,
      });
    }

    // Crawl the LinkedIn profile
    if (sessionId) {
      progressTracker.sendPhaseProgress(sessionId, 'linkedin', 'validating', 'Crawling LinkedIn profile content...');
    }
    
    const content = await exaService.crawlContent(bestProfile.url);
    if (content) {
      // Extract key information using GPT
      const summary = await summarizeProfileContent(content, 'LinkedIn');
      generatedContext.linkedinData = summary;
      contextAdded = summary;
      console.log(`\n=== GENERATED CONTEXT ADDED ===`);
      console.log(`LinkedIn Profile Context: ${summary}`);
      console.log(`=== END GENERATED CONTEXT ===\n`);
      
      if (sessionId) {
        progressTracker.sendPhaseComplete(sessionId, 'linkedin', 'LinkedIn profile processed successfully', {
          found: results.length,
          qualified: profileValidations.length,
          selected: bestProfile.url,
          contextAdded: summary,
        });
      }
    }
  } else {
    console.log('No qualified LinkedIn profile found');
    // Log what categories were found instead
    const categories = validations.map(v => `${v.category || 'unknown'}: ${v.url}`).join(', ');
    console.log(`Found LinkedIn results in categories: ${categories}`);
    
    if (sessionId) {
      progressTracker.sendPhaseComplete(sessionId, 'linkedin', 'No qualified LinkedIn profile found', {
        found: results.length,
        qualified: 0,
      });
    }
  }

  return {
    phase: 'LinkedIn',
    query,
    resultsFound: results.length,
    validatedResults: validations,
    selectedUrl,
    contextAdded,
    timestamp: new Date(),
  };
}

/**
 * Phase 2: Search and validate GitHub profile
 */
async function searchGitHubProfile(
  name: string,
  hardContext: string,
  softContext: string,
  generatedContext: GeneratedContext,
  sessionId?: string
): Promise<SearchLog> {
  const query = `${name} github`;
  console.log(`Searching: ${query}`);

  const results = await exaService.searchGitHub(name);
  console.log(`Found ${results.length} GitHub results`);

  if (results.length === 0) {
    return {
      phase: 'GitHub',
      query,
      resultsFound: 0,
      validatedResults: [],
      timestamp: new Date(),
    };
  }

  // Validate each result
  const validations = await validationService.validateSourcesBatch(
    results,
    name,
    hardContext,
    softContext,
    generatedContext
  );

  // Select the best GitHub profile
  const bestProfile = validationService.selectBestProfile(validations);

  let contextAdded: string | undefined;
  let selectedUrl: string | undefined;

  if (bestProfile) {
    console.log(`Selected GitHub profile: ${bestProfile.url} (score: ${bestProfile.relevancyScore})`);
    selectedUrl = bestProfile.url;

    // Crawl the GitHub profile
    const content = await exaService.crawlContent(bestProfile.url);
    if (content) {
      const summary = await summarizeProfileContent(content, 'GitHub');
      generatedContext.githubData = summary;
      contextAdded = summary;
      console.log(`\n=== GENERATED CONTEXT ADDED ===`);
      console.log(`GitHub Profile Context: ${summary}`);
      console.log(`=== END GENERATED CONTEXT ===\n`);
    }
  } else {
    console.log('No qualified GitHub profile found');
  }

  return {
    phase: 'GitHub',
    query,
    resultsFound: results.length,
    validatedResults: validations,
    selectedUrl,
    contextAdded,
    timestamp: new Date(),
  };
}

/**
 * Phase 3: Search and validate personal website
 */
async function searchPersonalWebsite(
  name: string,
  hardContext: string,
  softContext: string,
  generatedContext: GeneratedContext,
  sessionId?: string
): Promise<SearchLog> {
  const query = `${name} personal website OR portfolio`;
  console.log(`Searching: ${query}`);

  const results = await exaService.searchWebsite(name);
  console.log(`Found ${results.length} website results`);

  if (results.length === 0) {
    return {
      phase: 'Website',
      query,
      resultsFound: 0,
      validatedResults: [],
      timestamp: new Date(),
    };
  }

  // Validate each result
  const validations = await validationService.validateSourcesBatch(
    results,
    name,
    hardContext,
    softContext,
    generatedContext
  );

  // Select the best website
  const bestProfile = validationService.selectBestProfile(validations);

  let contextAdded: string | undefined;
  let selectedUrl: string | undefined;

  if (bestProfile) {
    console.log(`Selected website: ${bestProfile.url} (score: ${bestProfile.relevancyScore})`);
    selectedUrl = bestProfile.url;

    // Crawl the website
    const content = await exaService.crawlContent(bestProfile.url);
    if (content) {
      const summary = await summarizeProfileContent(content, 'Website');
      generatedContext.websiteData = summary;
      contextAdded = summary;
      console.log(`\n=== GENERATED CONTEXT ADDED ===`);
      console.log(`Website Context: ${summary}`);
      console.log(`=== END GENERATED CONTEXT ===\n`);
    }
  } else {
    console.log('No qualified website found');
  }

  return {
    phase: 'Website',
    query,
    resultsFound: results.length,
    validatedResults: validations,
    selectedUrl,
    contextAdded,
    timestamp: new Date(),
  };
}

/**
 * Phase 4: Generate and execute custom queries
 */
async function searchGeneralQueries(
  name: string,
  hardContext: string,
  softContext: string,
  generatedContext: GeneratedContext,
  sessionId?: string
): Promise<SearchLog[]> {
  // Generate 5 custom queries
  const queries = await generateCustomQueries(name, hardContext, softContext, generatedContext);
  console.log(`Generated ${queries.length} custom queries`);

  const logs: SearchLog[] = [];

  for (const queryObj of queries) {
    console.log(`\nSearching: ${queryObj.query}`);
    
    const results = await exaService.searchGeneral(queryObj.query);
    console.log(`Found ${results.length} results for "${queryObj.target}"`);

    if (results.length === 0) {
      logs.push({
        phase: `General: ${queryObj.target}`,
        query: queryObj.query,
        resultsFound: 0,
        validatedResults: [],
        timestamp: new Date(),
      });
      continue;
    }

    // Validate results
    const validations = await validationService.validateSourcesBatch(
      results,
      name,
      hardContext,
      softContext,
      generatedContext
    );

    // Filter to high-quality sources (score >= 6)
    const qualifiedSources = validations.filter(
      v => v.isLikelyMatch && v.relevancyScore >= 6
    );

    console.log(`${qualifiedSources.length} qualified sources found`);

    // Add findings to generated context
    for (const source of qualifiedSources.slice(0, 2)) { // Top 2
      const content = await exaService.crawlContent(source.url);
      if (content) {
        const finding = `From ${queryObj.target}: ${content.substring(0, 200)}`;
        generatedContext.additionalFindings.push(finding);
        console.log(`\n=== GENERATED CONTEXT ADDED ===`);
        console.log(`Additional Finding: ${finding}`);
        console.log(`=== END GENERATED CONTEXT ===\n`);
      }
    }

    logs.push({
      phase: `General: ${queryObj.target}`,
      query: queryObj.query,
      resultsFound: results.length,
      validatedResults: validations,
      timestamp: new Date(),
    });

    // Delay between queries
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return logs;
}

/**
 * Generate custom search queries using GPT
 */
async function generateCustomQueries(
  name: string,
  hardContext: string,
  softContext: string,
  generatedContext: GeneratedContext
): Promise<Array<{ query: string; target: string }>> {
  const generatedContextText = [
    generatedContext.linkedinData,
    generatedContext.githubData,
    generatedContext.websiteData,
    ...generatedContext.additionalFindings,
  ]
    .filter(Boolean)
    .join(' | ');

  const prompt = `Generate 5 search queries to find more information about ${name}.

Hard Context: ${hardContext || 'None'}
Soft Context: ${softContext || 'None'}
Generated Context: ${generatedContextText || 'None yet'}

Generate queries that:
- Target different aspects (education, work, publications, social media, etc.)
- Use known information from generated context
- Are specific enough to avoid wrong matches
- Don't duplicate LinkedIn/GitHub/website searches already done

Return ONLY valid JSON array:
[
  {"query": "query 1", "target": "education records"},
  {"query": "query 2", "target": "publications"},
  {"query": "query 3", "target": "social media"},
  {"query": "query 4", "target": "professional activities"},
  {"query": "query 5", "target": "mentions or interviews"}
]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are an expert OSINT researcher who generates effective search queries. Always respond with valid JSON only.',
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
    return queries;
  } catch (error) {
    console.error('Error generating custom queries:', error);
    // Return fallback queries
    return [
      { query: `${name} education`, target: 'education' },
      { query: `${name} work experience`, target: 'work' },
      { query: `${name} publications OR articles`, target: 'publications' },
      { query: `${name} social media`, target: 'social' },
      { query: `${name} interview OR mention`, target: 'mentions' },
    ];
  }
}

/**
 * Summarize profile content for generated context
 */
async function summarizeProfileContent(content: string, source: string): Promise<string> {
  const prompt = `Summarize the key information from this ${source} profile in 1-2 sentences.
Focus on: name, job/role, education, skills, location, notable achievements.

Content:
${content.substring(0, 1500)}

Return a concise summary (max 2 sentences):`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 1,
      max_completion_tokens: 150,
    });

    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error(`Error summarizing ${source} content:`, error);
    return content.substring(0, 200);
  }
}

/**
 * Collect all high-quality sources from search logs
 */
function collectFinalSources(logs: SearchLog[]): ValidationResult[] {
  const allSources: ValidationResult[] = [];

  for (const log of logs) {
    const qualified = log.validatedResults.filter(
      v => v.isLikelyMatch && v.relevancyScore >= 6
    );
    allSources.push(...qualified);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique: ValidationResult[] = [];

  for (const source of allSources) {
    if (!seen.has(source.url)) {
      seen.add(source.url);
      unique.push(source);
    }
  }

  // Sort by score descending
  unique.sort((a, b) => b.relevancyScore - a.relevancyScore);

  return unique;
}

