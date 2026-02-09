export interface JobSearchFilters {
  keywords: string;
  location: string;
  remote: 'any' | 'remote' | 'onsite';
  jobType: 'any' | 'fulltime' | 'parttime' | 'contract' | 'internship';
  salaryMin: string;
  salaryMax: string;
  hoursOld: number;
  siteNames: string[];
  resultsWanted: number;
}

export interface JobSalary {
  min: number | null;
  max: number | null;
  period: string | null;
  currency: string;
  display: string | null;
}

export interface JobCompanyInfo {
  industry: string | null;
  url: string | null;
  description: string | null;
  numEmployees: string | null;
  revenue: string | null;
}

export interface JobSearchResult {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: JobSalary;
  description: string;
  skills: string[];
  companyInfo: JobCompanyInfo;
  url: string;
  datePosted: string | null;
  source: string;
  jobType: string | null;
  isRemote: boolean;
}

export interface JobSearchResponse {
  results: JobSearchResult[];
  totalFound: number;
  searchParams: {
    keywords: string;
    location: string;
    remote: boolean;
    jobType: string | null;
    resultsWanted: number;
    hoursOld: number;
    siteNames: string[];
  };
}

export const DEFAULT_SEARCH_FILTERS: JobSearchFilters = {
  keywords: '',
  location: '',
  remote: 'any',
  jobType: 'any',
  salaryMin: '',
  salaryMax: '',
  hoursOld: 72,
  siteNames: ['indeed', 'linkedin', 'glassdoor'],
  resultsWanted: 20,
};

export const AVAILABLE_SITES = [
  { id: 'indeed', label: 'Indeed' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'glassdoor', label: 'Glassdoor' },
  { id: 'google', label: 'Google' },
  { id: 'zip_recruiter', label: 'ZipRecruiter' },
] as const;
