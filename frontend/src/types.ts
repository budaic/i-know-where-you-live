export interface Subject {
  name: string;
  hardContext: string;
  softContext: string;
  maxDepth?: number;
}

export interface GeneratedContext {
  linkedinData?: string;
  githubData?: string;
  websiteData?: string;
  additionalFindings: string[];
}

export interface ValidationResult {
  url: string;
  relevancyScore: number;
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
  timestamp: string;
}

export interface Profile {
  id: string;
  name: string;
  aliases: string[];
  profileSummary: string;
  sources: Source[];
  hardContext?: string;
  softContext?: string;
  generatedContext?: GeneratedContext;
  searchLogs?: SearchLog[];
  createdAt: string;
}

export interface Source {
  id: string;
  profileId: string;
  url: string;
  siteSummary: string;
  depth: number;
  relevancyScore?: number;
  validationReasoning?: string;
  confidence?: string;
  createdAt: string;
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
  timestamp: string;
}

export interface PhaseResults {
  found: number;
  qualified: number;
  selected?: string;
  contextAdded?: string;
  searchLog?: SearchLog;
}

export interface LiveSearchState {
  isSearching: boolean;
  sessionId?: string;
  currentPhase: string;
  progress: number;
  message: string;
  results: Partial<Profile>;
  errors: string[];
  searchLogs: SearchLog[];
  isRecovered?: boolean;
  startTime?: Date;
  lastUpdate?: Date;
}

export interface SessionInfo {
  sessionId: string;
  subjectName: string;
  currentPhase: string;
  progress: number;
  isActive: boolean;
  isComplete: boolean;
  startTime: string;
  lastUpdate: string;
  source: 'memory' | 'storage';
  errors: string[];
  searchLogs: SearchLog[];
  generatedContext?: GeneratedContext;
  partialProfile?: Partial<Profile>;
  finalProfile?: Profile;
}

