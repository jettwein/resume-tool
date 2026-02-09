const STORAGE_KEYS = {
  RESUME: 'resume-tool:resume',
  APPLICATIONS: 'resume-tool:applications',
  PROFILE: 'resume-tool:profile',
  JOB_SEARCH_FILTERS: 'resume-tool:job-search-filters',
  REJECTED_JOBS: 'resume-tool:rejected-jobs',
} as const;

export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key: string): void {
  localStorage.removeItem(key);
}

export { STORAGE_KEYS };
