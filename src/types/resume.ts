/**
 * Structured Resume Data Model
 *
 * This model represents a resume as structured data that can be
 * rendered using different templates and exported to various formats.
 *
 * Designed for SaaS scalability - templates can be stored in DB,
 * users can have preferences, and premium templates can be added.
 */

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string; // undefined or "Present" for current role
  bullets: string[];
  technologies?: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  graduationDate?: string;
  gpa?: string;
  honors?: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
  expirationDate?: string;
  credentialId?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  bullets?: string[];
}

export interface CustomSection {
  id: string;
  title: string;
  type: 'bullets' | 'paragraph' | 'list';
  content: string[] | string;
}

export interface StructuredResume {
  // Metadata
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;

  // Content
  contactInfo: ContactInfo;
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  technicalSkills?: Record<string, string[]>; // e.g., { "Languages": ["Python", "JavaScript"] }
  certifications?: CertificationItem[];
  projects?: ProjectItem[];
  customSections?: CustomSection[];

  // Formatting preferences (can be overridden by template)
  preferences?: ResumePreferences;
}

export interface ResumePreferences {
  showContactIcons?: boolean;
  dateFormat?: 'MM/YYYY' | 'MMM YYYY' | 'MMMM YYYY';
  skillsLayout?: 'inline' | 'columns' | 'grouped';
  sectionOrder?: string[]; // e.g., ['summary', 'experience', 'skills', 'education']
}

/**
 * Template Definition
 *
 * Templates are responsible for rendering StructuredResume
 * into various output formats.
 */
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string; // URL to preview image
  isPremium?: boolean;

  // Render functions
  renderMarkdown: (resume: StructuredResume) => string;
  renderHtml: (resume: StructuredResume) => string;
  // DOCX rendering is handled separately due to async nature
}

export type ExportFormat = 'markdown' | 'pdf' | 'docx' | 'html';

export interface ExportOptions {
  format: ExportFormat;
  templateId: string;
  filename?: string;
}
