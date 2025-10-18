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

