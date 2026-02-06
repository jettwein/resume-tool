import { useState, useEffect, useCallback, useRef } from 'react';
import { Application, JobPosting, CompanyResearch, StructuredResume, ApplicationStage, Activity } from '../types';
import { getItem, setItem, STORAGE_KEYS } from '../services/storage';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Migrate old applications that don't have stage/activities fields
function migrateApplication(app: Application): Application {
  return {
    ...app,
    stage: app.stage || 'not_applied',
    activities: app.activities || [{
      id: generateId(),
      date: app.createdAt,
      type: 'created',
      title: 'Application created',
      createdAt: app.createdAt,
    }],
  };
}

export function useApplications() {
  const [applications, setApplicationsState] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const applicationsRef = useRef<Application[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    applicationsRef.current = applications;
  }, [applications]);

  useEffect(() => {
    const stored = getItem<Application[]>(STORAGE_KEYS.APPLICATIONS);
    const rawApps = stored || [];
    // Migrate any old applications
    const apps = rawApps.map(migrateApplication);
    // Save if migration occurred
    if (JSON.stringify(rawApps) !== JSON.stringify(apps)) {
      setItem(STORAGE_KEYS.APPLICATIONS, apps);
    }
    setApplicationsState(apps);
    applicationsRef.current = apps;
    setLoading(false);
  }, []);

  const saveToStorage = useCallback((apps: Application[]) => {
    setItem(STORAGE_KEYS.APPLICATIONS, apps);
    setApplicationsState(apps);
    applicationsRef.current = apps;
  }, []);

  const addApplication = useCallback((jobPosting: Omit<JobPosting, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const appId = generateId();
    const newApp: Application = {
      id: appId,
      jobPosting: {
        ...jobPosting,
        id: generateId(),
        createdAt: now,
      } as JobPosting,
      customizedResume: null,
      structuredResume: null,
      customizationSummary: null,
      matchScore: null,
      matchAnalysis: null,
      research: null,
      status: 'pending',
      stage: 'not_applied',
      activities: [{
        id: generateId(),
        date: now,
        type: 'created',
        title: 'Application created',
        createdAt: now,
      }],
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newApp, ...applicationsRef.current];
    saveToStorage(updated);
    return newApp;
  }, [saveToStorage]);

  const updateApplication = useCallback((id: string, updates: Partial<Omit<Application, 'id' | 'createdAt'>>) => {
    const updated = applicationsRef.current.map(app => {
      if (app.id === id) {
        return {
          ...app,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return app;
    });
    saveToStorage(updated);
  }, [saveToStorage]);

  const setCustomizedResume = useCallback((
    id: string,
    resume: string,
    summary?: string,
    structuredResume?: StructuredResume
  ) => {
    updateApplication(id, {
      customizedResume: resume,
      ...(summary && { customizationSummary: summary }),
      ...(structuredResume && { structuredResume })
    });
  }, [updateApplication]);

  const setResearch = useCallback((id: string, research: CompanyResearch) => {
    updateApplication(id, { research });
  }, [updateApplication]);

  const setStatus = useCallback((id: string, status: Application['status']) => {
    updateApplication(id, { status });
  }, [updateApplication]);

  const deleteApplication = useCallback((id: string) => {
    const updated = applicationsRef.current.filter(app => app.id !== id);
    saveToStorage(updated);
  }, [saveToStorage]);

  const archiveApplication = useCallback((id: string) => {
    updateApplication(id, { status: 'archived' });
  }, [updateApplication]);

  const updateJobPosting = useCallback((id: string, jobUpdates: Partial<Pick<JobPosting, 'title' | 'company' | 'salaryRange'>>) => {
    const app = applicationsRef.current.find(a => a.id === id);
    if (app) {
      updateApplication(id, {
        jobPosting: {
          ...app.jobPosting,
          ...jobUpdates,
        }
      });
    }
  }, [updateApplication]);

  const getApplicationById = useCallback((id: string) => {
    return applicationsRef.current.find(app => app.id === id) || null;
  }, []);

  const setStage = useCallback((id: string, stage: ApplicationStage) => {
    updateApplication(id, { stage });
  }, [updateApplication]);

  const addActivity = useCallback((
    id: string,
    activity: Omit<Activity, 'id' | 'createdAt'>
  ) => {
    const app = applicationsRef.current.find(a => a.id === id);
    if (app) {
      const now = new Date().toISOString();
      const newActivity: Activity = {
        ...activity,
        id: generateId(),
        createdAt: now,
      };
      updateApplication(id, {
        activities: [...(app.activities || []), newActivity],
      });
      return newActivity;
    }
    return null;
  }, [updateApplication]);

  const deleteActivity = useCallback((appId: string, activityId: string) => {
    const app = applicationsRef.current.find(a => a.id === appId);
    if (app) {
      updateApplication(appId, {
        activities: (app.activities || []).filter(a => a.id !== activityId),
      });
    }
  }, [updateApplication]);

  return {
    applications,
    loading,
    addApplication,
    updateApplication,
    updateJobPosting,
    setCustomizedResume,
    setResearch,
    setStatus,
    setStage,
    addActivity,
    deleteActivity,
    deleteApplication,
    archiveApplication,
    getApplicationById,
    activeApplications: applications.filter(app => app.status !== 'archived'),
    archivedApplications: applications.filter(app => app.status === 'archived'),
  };
}
