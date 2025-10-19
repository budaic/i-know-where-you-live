import { ExaSearchResultWithSummary } from './exaRevampedService';
import { validateContextMatch, generateContextPoints, hasNameMatch } from './gpt5NanoService';
import RevampedSearchDebugger from './revampedSearchDebugger';

export interface ProcessedResult {
  originalResult: ExaSearchResultWithSummary;
  hasNameMatch: boolean;
  contextMatch: boolean;
  contextPoints: string[];
  confidence: number;
  processedAt: Date;
}

export interface ContextPoint {
  source: string;
  points: string[];
  confidence: number;
  timestamp: Date;
}

/**
 * Process search results through the validation pipeline
 */
export async function processSearchResults(
  results: ExaSearchResultWithSummary[],
  subjectName: string,
  hardContext: string,
  generatedContext: string,
  searchDebugger?: RevampedSearchDebugger
): Promise<ProcessedResult[]> {
  console.log(`🔄 Processing ${results.length} search results...`);
  
  const processedResults: ProcessedResult[] = [];
  let nameMatchCount = 0;
  let contextMatchCount = 0;
  let totalConfidence = 0;
  
  for (const result of results) {
    try {
      console.log(`📝 Processing result: ${result.title}`);
      
      // Step 1: Check if subject name appears in text
      const nameMatch = hasNameMatch(result.text || '', subjectName);
      if (!nameMatch) {
        console.log(`❌ No name match for: ${result.title}`);
        continue;
      }
      
      nameMatchCount++;
      console.log(`✅ Name match found for: ${result.title}`);
      
      // Step 2: Validate context match using GPT-5-nano
      const contextMatch = await validateContextMatch(
        result.text || '',
        result.summary || '',
        subjectName,
        hardContext,
        generatedContext
      );
      
      if (!contextMatch) {
        console.log(`❌ No context match for: ${result.title}`);
        continue;
      }
      
      contextMatchCount++;
      console.log(`✅ Context match found for: ${result.title}`);
      
      // Step 3: Generate context points
      const contextPoints = await generateContextPoints(
        result.text || '',
        result.summary || '',
        subjectName,
        hardContext,
        generatedContext
      );
      
      if (contextPoints.length === 0) {
        console.log(`❌ No context points generated for: ${result.title}`);
        continue;
      }
      
      console.log(`✅ Generated ${contextPoints.length} context points for: ${result.title}`);
      
      // Calculate confidence score
      const confidence = calculateConfidence(result, contextPoints.length);
      totalConfidence += confidence;
      
      const processedResult: ProcessedResult = {
        originalResult: result,
        hasNameMatch: nameMatch,
        contextMatch: contextMatch,
        contextPoints: contextPoints,
        confidence: confidence,
        processedAt: new Date()
      };
      
      processedResults.push(processedResult);
      console.log(`🎯 Successfully processed: ${result.title} (confidence: ${confidence.toFixed(2)})`);
      
    } catch (error) {
      const errorMsg = `Error processing result ${result.title}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      searchDebugger?.logError(errorMsg, 'context_validation');
    }
  }
  
  // Log detailed statistics
  const averageConfidence = processedResults.length > 0 ? totalConfidence / processedResults.length : 0;
  const totalContextPoints = processedResults.reduce((sum, result) => sum + result.contextPoints.length, 0);
  
  console.log(`✅ Processing complete: ${processedResults.length} valid results out of ${results.length}`);
  console.log(`📊 Statistics: ${nameMatchCount} name matches, ${contextMatchCount} context matches, ${totalContextPoints} context points, avg confidence: ${averageConfidence.toFixed(2)}`);
  
  // Log to debugger if available
  if (searchDebugger) {
    searchDebugger.logNameValidation(results.length, nameMatchCount);
    searchDebugger.logContextValidation(nameMatchCount, contextMatchCount, averageConfidence);
    searchDebugger.logPointGeneration(contextMatchCount, totalContextPoints);
    searchDebugger.logConfidenceScoring(processedResults.length, averageConfidence);
  }
  
  return processedResults;
}

/**
 * Calculate confidence score for a processed result
 */
function calculateConfidence(result: ExaSearchResultWithSummary, contextPointsCount: number): number {
  let confidence = 0;
  
  // Base score from Exa
  confidence += (result.score || 0) * 0.3;
  
  // Bonus for having text content
  if (result.text && result.text.length > 100) {
    confidence += 0.2;
  }
  
  // Bonus for having a good summary
  if (result.summary && result.summary.length > 50) {
    confidence += 0.2;
  }
  
  // Bonus for number of context points
  confidence += Math.min(contextPointsCount * 0.1, 0.3);
  
  // Cap at 1.0
  return Math.min(confidence, 1.0);
}

/**
 * Convert processed results to context points
 */
export function convertToContextPoints(processedResults: ProcessedResult[]): ContextPoint[] {
  return processedResults.map(result => ({
    source: result.originalResult.url,
    points: result.contextPoints,
    confidence: result.confidence,
    timestamp: result.processedAt
  }));
}

/**
 * Build generated context from processed results with comprehensive summarization
 */
export function buildGeneratedContext(processedResults: ProcessedResult[]): string {
  const contextPoints = convertToContextPoints(processedResults);
  
  if (contextPoints.length === 0) {
    return '';
  }
  
  // Create a comprehensive summary instead of just listing points
  const contextSections: string[] = [];
  
  // Add summary header
  contextSections.push(`COMPREHENSIVE CONTEXT SUMMARY (${contextPoints.length} sources analyzed):`);
  contextSections.push('');
  
  // Group points by theme for better organization
  const allPoints = contextPoints.flatMap(point => point.points);
  const uniquePoints = [...new Set(allPoints)]; // Remove duplicates
  
  // Add all unique context points
  contextSections.push('KEY FINDINGS:');
  uniquePoints.forEach((point, index) => {
    contextSections.push(`${index + 1}. ${point}`);
  });
  
  contextSections.push('');
  contextSections.push('DETAILED SOURCE BREAKDOWN:');
  
  // Add detailed source information
  contextPoints.forEach((point, index) => {
    contextSections.push(`\nSource ${index + 1}: ${point.source}`);
    contextSections.push(`Confidence: ${(point.confidence * 100).toFixed(1)}%`);
    contextSections.push('Context Points:');
    point.points.forEach(p => {
      contextSections.push(`  • ${p}`);
    });
  });
  
  return contextSections.join('\n');
}

/**
 * Get top results by confidence score
 */
export function getTopResults(processedResults: ProcessedResult[], limit: number = 10): ProcessedResult[] {
  return processedResults
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}
