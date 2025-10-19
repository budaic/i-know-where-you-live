export interface Subject {
  name: string;
  hardContext: string;  // Must be true
  softContext: string;  // Could be true, guidance
  maxDepth?: number;
}

export interface ContextInput {
  hardContext: string;
  softContext: string;
}

export interface GeneratedContext {
  linkedinData?: string;
  githubData?: string;
  websiteData?: string;
  additionalFindings: string[];
}

export interface ValidationResult {
  url: string;
  relevancyScore: number;  // 1-10
  isLikelyMatch: boolean;
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
  samePersonElements: string[];
  differentPersonElements: string[];
  prompt?: string;  // The plaintext prompt and answer used during validation
  category?: 'profile' | 'post' | 'company' | 'other';  // Category of the result
}

export interface SearchLog {
  phase: string;
  query: string;
  resultsFound: number;
  validatedResults: ValidationResult[];
  selectedUrl?: string;
  contextAdded?: string;
  timestamp: Date;
  searchRound?: number;
  totalRounds?: number;
}

export interface RevampedSearchStep {
  stepId: string;
  stepType: 'query_generation' | 'search_execution' | 'name_validation' | 'context_validation' | 'point_generation' | 'confidence_scoring';
  query?: string;
  queryType?: 'simple' | 'hard-context' | 'generated-context';
  resultsCount?: number;
  processedCount?: number;
  validCount?: number;
  confidence?: number;
  details: string;
  timestamp: Date;
  duration?: number;
  errors?: string[];
}

export interface RevampedSearchRound {
  roundNumber: number;
  totalRounds: number;
  queries: SearchQuery[];
  steps: RevampedSearchStep[];
  resultsCollected: number;
  resultsProcessed: number;
  resultsValid: number;
  contextPointsGenerated: number;
  averageConfidence: number;
  startTime: Date;
  endTime: Date;
  duration: number;
}

export interface SearchQuery {
  query: string;
  type: 'simple' | 'hard-context' | 'generated-context';
  priority: number;
  expectedResults?: number;
  actualResults?: number;
  uid?: string;
  depth?: number;
}

export interface RevampedSearchDebug {
  sessionId: string;
  subjectName: string;
  hardContext: string;
  softContext: string;
  generatedContext: string;
  rounds: RevampedSearchRound[];
  totalResultsCollected: number;
  totalResultsProcessed: number;
  totalResultsValid: number;
  totalContextPoints: number;
  overallConfidence: number;
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  errors: string[];
  warnings: string[];
}

export interface ProfileCreationLog {
  subjectName: string;
  hardContext: string;
  softContext: string;
  generatedContext: GeneratedContext;
  searchLogs: SearchLog[];
  finalSources: ValidationResult[];
}


export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  depth: number;
}

export interface SourceContent {
  url: string;
  content: string;
  depth: number;
}

export interface SourceSummary {
  url: string;
  summary: string;
  depth: number;
}

export interface Profile {
  id?: string;
  name: string;
  aliases: string[];
  profileSummary: string;
  sources: Source[];
  hardContext?: string;
  softContext?: string;
  generatedContext?: GeneratedContext;
  searchLogs?: SearchLog[];
  createdAt?: Date;
}

export interface Source {
  id?: string;
  profileId?: string;
  url: string;
  siteSummary: string;
  depth: number;
  relevancyScore?: number;
  validationReasoning?: string;
  confidence?: string;
  createdAt?: Date;
}

export interface ProfileRequest {
  subjects: Subject[];
}

export interface ProfileResponse {
  profiles: Profile[];
  errors?: string[];
}

export interface ProgressUpdate {
  sessionId: string;
  subjectName: string;
  phase: 'linkedin' | 'github' | 'website' | 'general' | 'complete' | 'error';
  status: 'starting' | 'searching' | 'validating' | 'completed' | 'failed';
  message: string;
  progress: number; // 0-100
  results?: PhaseResults;
  timestamp: Date;
}

export interface PhaseResults {
  found: number;
  qualified: number;
  selected?: string;
  contextAdded?: string;
  searchLog?: SearchLog;
}

export interface LiveSearchSession {
  sessionId: string;
  subjectName: string;
  startTime: Date;
  currentPhase: string;
  progress: number;
  partialProfile?: Partial<Profile>;
  errors: string[];
  isActive: boolean;
}

