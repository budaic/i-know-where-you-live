export interface Subject {
  name: string;
  context: string;
  maxDepth?: number;
}

export interface SearchQuery {
  uid: string;
  depth: number;
  query: string;
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
  createdAt?: Date;
}

export interface Source {
  id?: string;
  profileId?: string;
  url: string;
  siteSummary: string;
  depth: number;
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
  subjectName: string;
  stage: 'query_generation' | 'search' | 'extraction' | 'summarization' | 'profile_generation' | 'complete' | 'error';
  message: string;
  progress?: number;
}

