import {
  JobPosting,
  CustomizeResponse,
  ResearchResponse,
  FetchPostingResponse,
  ParsePostingResponse,
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export async function fetchJobPosting(url: string): Promise<FetchPostingResponse> {
  const response = await fetch(`${API_BASE}/fetch-posting`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return handleResponse<FetchPostingResponse>(response);
}

export async function customizeResume(
  resume: string,
  jobPosting: JobPosting,
  skills: string[] = []
): Promise<CustomizeResponse> {
  const response = await fetch(`${API_BASE}/customize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume, jobPosting, skills }),
  });
  return handleResponse<CustomizeResponse>(response);
}

export async function researchCompany(
  company: string,
  jobTitle: string
): Promise<ResearchResponse> {
  const response = await fetch(`${API_BASE}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company, jobTitle }),
  });
  return handleResponse<ResearchResponse>(response);
}

export async function parseJobPosting(text: string): Promise<ParsePostingResponse> {
  const response = await fetch(`${API_BASE}/parse-posting`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return handleResponse<ParsePostingResponse>(response);
}

export interface RefineResumeResponse {
  updatedResume: string;
  changesSummary: string;
}

export async function refineResume(
  currentResume: string,
  originalResume: string | null,
  jobPosting: JobPosting | null,
  request: string
): Promise<RefineResumeResponse> {
  const response = await fetch(`${API_BASE}/refine-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentResume, originalResume, jobPosting, request }),
  });
  return handleResponse<RefineResumeResponse>(response);
}
