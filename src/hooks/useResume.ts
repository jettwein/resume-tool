import { useState, useEffect, useCallback } from 'react';
import { Resume } from '../types';
import { getItem, setItem, STORAGE_KEYS } from '../services/storage';

export function useResume() {
  const [resume, setResumeState] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getItem<Resume>(STORAGE_KEYS.RESUME);
    setResumeState(stored);
    setLoading(false);
  }, []);

  const saveResume = useCallback((content: string) => {
    const newResume: Resume = {
      content,
      lastUpdated: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.RESUME, newResume);
    setResumeState(newResume);
  }, []);

  const clearResume = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.RESUME);
    setResumeState(null);
  }, []);

  return {
    resume,
    loading,
    saveResume,
    clearResume,
    hasResume: !!resume?.content,
  };
}
