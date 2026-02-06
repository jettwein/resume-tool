export interface Resume {
  content: string;
  lastUpdated: string;
}

export interface UserProfile {
  skills: string[];
  lastUpdated: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  salaryRange: string | null;
  description: string;
  requirements: string[];
  source: 'text' | 'url';
  sourceUrl?: string;
  rawText: string;
  createdAt: string;
}

export interface CompanyResearch {
  companyInfo: string;
  hiringManager: string | null;
  orgStructure: string;
  sources: string[];
  createdAt: string;
}

import { StructuredResume } from './resume';

export * from './resume';

// Application stage in the hiring process
export type ApplicationStage =
  | 'not_applied'
  | 'applied'
  | 'phone_screen'
  | 'interviewing'
  | 'final_round'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

// Activity types for timeline tracking
export type ActivityType =
  | 'created'
  | 'applied'
  | 'email_sent'
  | 'email_received'
  | 'phone_screen'
  | 'interview'
  | 'follow_up'
  | 'offer'
  | 'rejection'
  | 'withdrawn'
  | 'note';

// Timeline activity for tracking interactions
export interface Activity {
  id: string;
  date: string;
  type: ActivityType;
  title: string;
  notes?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  jobPosting: JobPosting;
  customizedResume: string | null; // Plain text (legacy/fallback)
  structuredResume: StructuredResume | null; // Structured data for templates
  customizationSummary: string | null;
  matchScore: number | null;
  matchAnalysis: string | null;
  research: CompanyResearch | null;
  status: 'pending' | 'processing' | 'ready' | 'archived';
  stage: ApplicationStage;
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomizeResponse {
  customizedResume: string;
  structuredResume?: StructuredResume;
  keyMatches: string[];
  summary: string;
  matchScore: number;
  matchAnalysis: string;
}

export interface ResearchResponse {
  companyInfo: string;
  hiringManager: string | null;
  orgStructure: string;
  sources: string[];
}

export interface FetchPostingResponse {
  title: string;
  company: string;
  salaryRange: string | null;
  description: string;
  requirements: string[];
  rawText: string;
}

export interface ParsePostingResponse {
  title: string;
  company: string;
  salaryRange: string | null;
  description: string;
  requirements: string[];
}
