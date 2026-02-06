import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile } from '../types';
import { getItem, setItem, STORAGE_KEYS } from '../services/storage';

const EMPTY_SKILLS: string[] = [];

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getItem<UserProfile>(STORAGE_KEYS.PROFILE);
    setProfileState(stored);
    setLoading(false);
  }, []);

  const saveSkills = useCallback((skills: string[]) => {
    const newProfile: UserProfile = {
      skills,
      lastUpdated: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PROFILE, newProfile);
    setProfileState(newProfile);
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    setProfileState(null);
  }, []);

  const skills = useMemo(() => profile?.skills || EMPTY_SKILLS, [profile?.skills]);

  return {
    profile,
    skills,
    loading,
    saveSkills,
    clearProfile,
    hasSkills: skills.length > 0,
  };
}
