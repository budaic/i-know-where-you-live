import { ProfileCreationLog, GeneratedContext, SearchLog, RevampedSearchDebug } from '../types';
import { generateSearchQueries, executeMultipleSearches } from './exaRevampedService';
import { processSearchResults, buildGeneratedContext, getTopResults } from './resultProcessorService';
import { optimizeSearchQueries } from './queryOptimizer';
import RevampedSearchDebugger from './revampedSearchDebugger';
import * as progressTracker from './progressTracker';

/**
 * Execute the revamped search system with iterative context building and detailed debugging
 */
export async function executeRevampedSearchWithDebug(
  subjectName: string,
  hardContext: string,
  softContext: string,
  sessionId?: string
): Promise<{ profileLog: ProfileCreationLog; debugData: RevampedSearchDebug }> {
  const searchDebugger = new RevampedSearchDebugger(sessionId || 'no-session', subjectName, hardContext, softContext);
  
  try {
    const profileLog = await executeRevampedSearchInternal(subjectName, hardContext, softContext, sessionId, searchDebugger);
    const debugData = searchDebugger.finalize();
    
    return { profileLog, debugData };
  } catch (error) {
    searchDebugger.logError(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    const debugData = searchDebugger.finalize();
    throw error;
  }
}

/**
 * Execute the revamped search system with iterative context building
 */
export async function executeRevampedSearch(
  subjectName: string,
  hardContext: string,
  softContext: string,
  sessionId?: string
): Promise<ProfileCreationLog> {
  const searchDebugger = new RevampedSearchDebugger(sessionId || 'no-session', subjectName, hardContext, softContext);
  
  try {
    const result = await executeRevampedSearchInternal(subjectName, hardContext, softContext, sessionId, searchDebugger);
    // Get debug data to create proper search logs
    const debugData = searchDebugger.finalize();
    
    // Create search logs from debug data
    const searchLogs: SearchLog[] = [];
    debugData.rounds.forEach((round, roundIndex) => {
      const searchLog: SearchLog = {
        phase: `Revamped Round ${round.roundNumber}`,
        query: round.queries.map(q => q.query).join('; '),
        resultsFound: round.resultsCollected,
        validatedResults: [], // Will be populated by the main function
        contextAdded: roundIndex === debugData.rounds.length - 1 ? debugData.generatedContext : undefined,
        timestamp: new Date(round.startTime),
        searchRound: round.roundNumber,
        totalRounds: round.totalRounds
      };
      searchLogs.push(searchLog);
    });
    
    // Update the result with proper search logs
    result.searchLogs = searchLogs;
    return result;
  } catch (error) {
    searchDebugger.logError(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Internal implementation of the revamped search system
 */
async function executeRevampedSearchInternal(
  subjectName: string,
  hardContext: string,
  softContext: string,
  sessionId?: string,
  searchDebugger?: RevampedSearchDebugger
): Promise<ProfileCreationLog> {
  console.log(`\n🚀 Starting Revamped Search for: ${subjectName}`);
  console.log(`Hard Context: ${hardContext}`);
  console.log(`Soft Context: ${softContext}`);
  console.log(`${'='.repeat(60)}\n`);

  const searchLogs: SearchLog[] = [];
  let generatedContext: GeneratedContext = {
    additionalFindings: [],
  };

  try {
    // Minimum 3 search rounds
    const minSearchRounds = 3;
    let searchRound = 0;
    let allProcessedResults: any[] = [];

    while (searchRound < minSearchRounds) {
      searchRound++;
      console.log(`\n🔄 Search Round ${searchRound}/${minSearchRounds}`);
      
      // Start round in debugger
      searchDebugger?.startRound(searchRound, minSearchRounds);
      
      if (sessionId) {
        progressTracker.sendPhaseProgress(
          sessionId,
          'general',
          'searching',
          `Search Round ${searchRound}/${minSearchRounds}: Generating queries and collecting results`
        );
      }

      // Generate search queries for this round
      const rawQueries = generateSearchQueries(subjectName, hardContext, buildGeneratedContext(allProcessedResults));
      console.log(`📋 Generated ${rawQueries.length} raw queries for round ${searchRound}`);
      
      // Optimize queries using GPT-5-nano
      console.log(`🔧 Optimizing queries with GPT-5-nano...`);
      const optimizedQueries = await optimizeSearchQueries(
        rawQueries.map(q => q.query),
        subjectName,
        hardContext,
        'generated-context'
      );
      
      // Create optimized query objects
      const queries = optimizedQueries.map((opt, index) => ({
        ...rawQueries[index],
        query: opt.optimizedQuery,
        originalQuery: opt.originalQuery,
        optimizationReasoning: opt.reasoning,
        searchStrategy: opt.searchStrategy
      }));
      
      console.log(`✅ Optimized ${queries.length} queries for round ${searchRound}`);
      
      // Log query generation
      searchDebugger?.logQueryGeneration(queries);

      // Execute searches and collect results
      const searchResults = await executeMultipleSearches(queries, subjectName, hardContext);
      console.log(`📊 Collected ${searchResults.length} results from round ${searchRound}`);
      
      // Log search execution for each query
      queries.forEach((query, index) => {
        const queryResults = searchResults.filter(result => 
          result.text?.toLowerCase().includes(query.query.toLowerCase().split(' ')[0])
        );
        searchDebugger?.logSearchExecution(query.query, query.type, queryResults.length);
      });

      if (sessionId) {
        progressTracker.sendPhaseProgress(
          sessionId,
          'general',
          'validating',
          `Search Round ${searchRound}/${minSearchRounds}: Processing and validating ${searchResults.length} results`
        );
      }

      // Process results through validation pipeline
      const processedResults = await processSearchResults(
        searchResults,
        subjectName,
        hardContext,
        buildGeneratedContext(allProcessedResults),
        searchDebugger
      );

      console.log(`✅ Round ${searchRound} complete: ${processedResults.length} valid results`);
      
      // Add to accumulated results
      allProcessedResults.push(...processedResults);

      // Create search log for this round
      const searchLog: SearchLog = {
        phase: 'general',
        query: queries.map(q => q.query).join('; '),
        resultsFound: searchResults.length,
        validatedResults: [], // We'll populate this with processed results if needed
        selectedUrl: processedResults.length > 0 ? processedResults[0].originalResult.url : undefined,
        timestamp: new Date(),
        searchRound: searchRound,
        totalRounds: minSearchRounds
      };

      searchLogs.push(searchLog);

      if (sessionId) {
        progressTracker.sendPhaseProgress(
          sessionId,
          'general',
          'completed',
          `Search Round ${searchRound}/${minSearchRounds} complete: ${processedResults.length} valid results found`,
          {
            found: searchResults.length,
            qualified: processedResults.length,
            searchLog: searchLog
          }
        );
      }

      // End round in debugger
      searchDebugger?.endRound();

      // Add delay between rounds
      if (searchRound < minSearchRounds) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Build final generated context
    const contextText = buildGeneratedContext(allProcessedResults);
    if (contextText) {
      generatedContext.additionalFindings = [contextText];
      searchDebugger?.updateGeneratedContext(contextText);
    }

    console.log(`\n🎯 Revamped Search Complete:`);
    console.log(`Total Results Processed: ${allProcessedResults.length}`);
    console.log(`Generated Context Length: ${contextText.length} characters`);

    if (sessionId) {
      progressTracker.sendPhaseComplete(
        sessionId,
        'general',
        `Revamped search complete: ${allProcessedResults.length} high-quality results found`,
        {
          found: allProcessedResults.length,
          qualified: allProcessedResults.length,
          contextAdded: contextText
        }
      );
    }

    // Get ALL strongly related results (confidence > 0.6) instead of just top 10
    const stronglyRelatedResults = allProcessedResults.filter(result => result.confidence > 0.6);
    console.log(`🎯 Found ${stronglyRelatedResults.length} strongly related results (confidence > 0.6) out of ${allProcessedResults.length} total processed results`);
    
    // Sort by confidence for better organization
    const sortedResults = stronglyRelatedResults.sort((a, b) => b.confidence - a.confidence);
    
    const finalSources = sortedResults.map(result => ({
      url: result.originalResult.url,
      relevancyScore: result.confidence,
      isLikelyMatch: result.confidence > 0.5,
      reasoning: `Strong context match (confidence: ${result.confidence.toFixed(2)}) with ${result.contextPoints.length} context points`,
      confidence: result.confidence > 0.8 ? 'high' as const : result.confidence > 0.6 ? 'medium' as const : 'low' as const,
      samePersonElements: result.contextPoints,
      differentPersonElements: [],
      prompt: `Generated context points: ${result.contextPoints.join('; ')}`,
      category: 'other' as const
    }));

    // Create a single comprehensive search log for the revamped search
    console.log(`📋 Creating search log for revamped search with ${finalSources.length} sources...`);
    
    const searchLog: SearchLog = {
      phase: `Revamped Search Complete`,
      query: `Multi-round iterative search with context building`,
      resultsFound: allProcessedResults.length,
      validatedResults: finalSources,
      contextAdded: contextText,
      timestamp: new Date(),
      searchRound: 1,
      totalRounds: 1
    };

    searchLogs.push(searchLog);
    console.log(`  ✅ Revamped Search: ${finalSources.length} sources, ${allProcessedResults.length} total results processed`);

    return {
      subjectName,
      hardContext,
      softContext,
      generatedContext,
      searchLogs,
      finalSources,
    };

  } catch (error) {
    console.error('Error in revamped search:', error);
    
    if (sessionId) {
      progressTracker.sendError(sessionId, `Revamped search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    throw error;
  }
}
