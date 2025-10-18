export interface Subject {
  name: string;
  context: string;
  maxDepth?: number;
}

export interface Profile {
  id: string;
  name: string;
  aliases: string[];
  profileSummary: string;
  sources: Source[];
  createdAt: string;
}

export interface Source {
  id: string;
  profileId: string;
  url: string;
  siteSummary: string;
  depth: number;
  createdAt: string;
}

export interface ProfileResponse {
  profiles: Profile[];
  errors?: string[];
}

