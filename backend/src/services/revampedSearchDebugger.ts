import { v4 as uuidv4 } from 'uuid';
import { 
  RevampedSearchDebug, 
  RevampedSearchRound, 
  RevampedSearchStep, 
  SearchQuery 
} from '../types';

class RevampedSearchDebugger {
  private debugData: RevampedSearchDebug;
  private currentRound: RevampedSearchRound | null = null;
  private currentStep: RevampedSearchStep | null = null;

  constructor(sessionId: string, subjectName: string, hardContext: string, softContext: string) {
    this.debugData = {
      sessionId,
      subjectName,
      hardContext,
      softContext,
      generatedContext: '',
      rounds: [],
      totalResultsCollected: 0,
      totalResultsProcessed: 0,
      totalResultsValid: 0,
      totalContextPoints: 0,
      overallConfidence: 0,
      startTime: new Date(),
      endTime: new Date(),
      totalDuration: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Start a new search round
   */
  startRound(roundNumber: number, totalRounds: number): void {
    this.currentRound = {
      roundNumber,
      totalRounds,
      queries: [],
      steps: [],
      resultsCollected: 0,
      resultsProcessed: 0,
      resultsValid: 0,
      contextPointsGenerated: 0,
      averageConfidence: 0,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0
    };
    
    this.logStep('query_generation', `Starting search round ${roundNumber}/${totalRounds}`);
  }

  /**
   * End the current search round
   */
  endRound(): void {
    if (this.currentRound) {
      this.currentRound.endTime = new Date();
      this.currentRound.duration = this.currentRound.endTime.getTime() - this.currentRound.startTime.getTime();
      
      // Calculate average confidence
      const confidenceSteps = this.currentRound.steps.filter(s => s.confidence !== undefined);
      if (confidenceSteps.length > 0) {
        this.currentRound.averageConfidence = confidenceSteps.reduce((sum, step) => sum + (step.confidence || 0), 0) / confidenceSteps.length;
      }
      
      this.debugData.rounds.push(this.currentRound);
      this.currentRound = null;
    }
  }

  /**
   * Log a search step
   */
  logStep(
    stepType: RevampedSearchStep['stepType'],
    details: string,
    query?: string,
    queryType?: 'simple' | 'hard-context' | 'generated-context',
    resultsCount?: number,
    processedCount?: number,
    validCount?: number,
    confidence?: number,
    errors?: string[]
  ): RevampedSearchStep {
    const step: RevampedSearchStep = {
      stepId: uuidv4(),
      stepType,
      query,
      queryType,
      resultsCount,
      processedCount,
      validCount,
      confidence,
      details,
      timestamp: new Date(),
      errors
    };

    if (this.currentRound) {
      this.currentRound.steps.push(step);
    }

    // Log to console with detailed formatting
    this.logToConsole(step);
    
    return step;
  }

  /**
   * Log query generation
   */
  logQueryGeneration(queries: SearchQuery[]): void {
    if (this.currentRound) {
      this.currentRound.queries = queries;
    }
    
    queries.forEach((query, index) => {
      this.logStep(
        'query_generation',
        `Generated ${query.type} query: "${query.query}"`,
        query.query,
        query.type,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });
  }

  /**
   * Log search execution
   */
  logSearchExecution(query: string, queryType: string, resultsCount: number): void {
    this.logStep(
      'search_execution',
      `Executed ${queryType} search: found ${resultsCount} results`,
      query,
      queryType as 'simple' | 'hard-context' | 'generated-context',
      resultsCount
    );

    if (this.currentRound) {
      this.currentRound.resultsCollected += resultsCount;
    }
    this.debugData.totalResultsCollected += resultsCount;
  }

  /**
   * Log name validation
   */
  logNameValidation(resultsCount: number, validCount: number): void {
    this.logStep(
      'name_validation',
      `Name validation: ${validCount}/${resultsCount} results contain subject name`,
      undefined,
      undefined,
      resultsCount,
      validCount,
      validCount
    );

    if (this.currentRound) {
      this.currentRound.resultsProcessed += resultsCount;
    }
    this.debugData.totalResultsProcessed += resultsCount;
  }

  /**
   * Log context validation
   */
  logContextValidation(processedCount: number, validCount: number, averageConfidence: number): void {
    this.logStep(
      'context_validation',
      `Context validation: ${validCount}/${processedCount} results match context (avg confidence: ${averageConfidence.toFixed(2)})`,
      undefined,
      undefined,
      undefined,
      processedCount,
      validCount,
      averageConfidence
    );

    if (this.currentRound) {
      this.currentRound.resultsValid += validCount;
    }
    this.debugData.totalResultsValid += validCount;
  }

  /**
   * Log point generation
   */
  logPointGeneration(validCount: number, pointsGenerated: number): void {
    this.logStep(
      'point_generation',
      `Context point generation: ${pointsGenerated} points generated from ${validCount} valid results`,
      undefined,
      undefined,
      undefined,
      undefined,
      validCount,
      undefined
    );

    if (this.currentRound) {
      this.currentRound.contextPointsGenerated += pointsGenerated;
    }
    this.debugData.totalContextPoints += pointsGenerated;
  }

  /**
   * Log confidence scoring
   */
  logConfidenceScoring(resultsCount: number, averageConfidence: number): void {
    this.logStep(
      'confidence_scoring',
      `Confidence scoring: average confidence ${averageConfidence.toFixed(2)} for ${resultsCount} results`,
      undefined,
      undefined,
      undefined,
      undefined,
      resultsCount,
      averageConfidence
    );
  }

  /**
   * Log error
   */
  logError(error: string, stepType?: RevampedSearchStep['stepType']): void {
    this.debugData.errors.push(error);
    
    if (stepType) {
      this.logStep(stepType, `ERROR: ${error}`, undefined, undefined, undefined, undefined, undefined, undefined, [error]);
    }
    
    console.error(`🔴 Revamped Search Error: ${error}`);
  }

  /**
   * Log warning
   */
  logWarning(warning: string): void {
    this.debugData.warnings.push(warning);
    console.warn(`🟡 Revamped Search Warning: ${warning}`);
  }

  /**
   * Update generated context
   */
  updateGeneratedContext(context: string): void {
    this.debugData.generatedContext = context;
  }

  /**
   * Finalize debug data
   */
  finalize(): RevampedSearchDebug {
    this.debugData.endTime = new Date();
    this.debugData.totalDuration = this.debugData.endTime.getTime() - this.debugData.startTime.getTime();
    
    // Calculate overall confidence
    const allConfidenceSteps = this.debugData.rounds.flatMap(round => 
      round.steps.filter(step => step.confidence !== undefined)
    );
    
    if (allConfidenceSteps.length > 0) {
      this.debugData.overallConfidence = allConfidenceSteps.reduce((sum, step) => sum + (step.confidence || 0), 0) / allConfidenceSteps.length;
    }

    this.logToConsole({
      stepId: 'final',
      stepType: 'confidence_scoring',
      details: `Search completed: ${this.debugData.totalResultsValid} valid results, ${this.debugData.totalContextPoints} context points, overall confidence: ${this.debugData.overallConfidence.toFixed(2)}`,
      timestamp: new Date()
    });

    return this.debugData;
  }

  /**
   * Get current debug data
   */
  getDebugData(): RevampedSearchDebug {
    return this.debugData;
  }

  /**
   * Log step to console with detailed formatting
   */
  private logToConsole(step: RevampedSearchStep): void {
    const timestamp = step.timestamp.toISOString();
    const roundInfo = this.currentRound ? `[Round ${this.currentRound.roundNumber}/${this.currentRound.totalRounds}]` : '';
    
    const icon = this.getStepIcon(step.stepType);
    const queryInfo = step.query ? ` | Query: "${step.query}"` : '';
    const countsInfo = step.resultsCount !== undefined ? ` | Results: ${step.resultsCount}` : '';
    const confidenceInfo = step.confidence !== undefined ? ` | Confidence: ${step.confidence.toFixed(2)}` : '';
    
    console.log(`${icon} ${roundInfo} [${step.stepType}] ${step.details}${queryInfo}${countsInfo}${confidenceInfo}`);
    
    if (step.errors && step.errors.length > 0) {
      step.errors.forEach(error => console.error(`  ❌ ${error}`));
    }
  }

  /**
   * Get icon for step type
   */
  private getStepIcon(stepType: RevampedSearchStep['stepType']): string {
    switch (stepType) {
      case 'query_generation': return '📋';
      case 'search_execution': return '🔍';
      case 'name_validation': return '👤';
      case 'context_validation': return '✅';
      case 'point_generation': return '📝';
      case 'confidence_scoring': return '📊';
      default: return '📌';
    }
  }
}

export default RevampedSearchDebugger;
