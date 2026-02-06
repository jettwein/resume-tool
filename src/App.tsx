import { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { ResumeManager } from './components/ResumeManager';
import { JobPostingInput } from './components/JobPostingInput';
import { ApplicationList } from './components/ApplicationList';
import { useResume } from './hooks/useResume';
import { useApplications } from './hooks/useApplications';
import { useProfile } from './hooks/useProfile';
import { Application, JobPosting, CompanyResearch } from './types';
import { customizeResume, researchCompany } from './services/api';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const { resume, hasResume } = useResume();
  const { skills } = useProfile();
  const {
    applications,
    addApplication,
    setCustomizedResume,
    setResearch,
    setStatus,
    setStage,
    addActivity,
    deleteActivity,
    deleteApplication,
    archiveApplication,
    updateJobPosting,
    updateApplication,
  } = useApplications();

  const processApplication = useCallback(async (app: Application, resumeContent: string, userSkills: string[]) => {
    setStatus(app.id, 'processing');

    try {
      const { company, title } = app.jobPosting;

      if (!company || !title) {
        console.error('Missing company or title:', { company, title });
        setStatus(app.id, 'pending');
        return;
      }

      // Run customization and research in parallel
      const [customizeResult, researchResult] = await Promise.all([
        customizeResume(resumeContent, app.jobPosting, userSkills),
        researchCompany(company, title),
      ]);

      setCustomizedResume(
        app.id,
        customizeResult.customizedResume,
        customizeResult.summary,
        customizeResult.structuredResume
      );
      updateApplication(app.id, {
        matchScore: customizeResult.matchScore,
        matchAnalysis: customizeResult.matchAnalysis,
      });

      const research: CompanyResearch = {
        ...researchResult,
        createdAt: new Date().toISOString(),
      };
      setResearch(app.id, research);

      setStatus(app.id, 'ready');
    } catch (error) {
      console.error('Failed to process application:', error);
      setStatus(app.id, 'pending');
    }
  }, [setStatus, setCustomizedResume, setResearch, updateApplication]);

  const handleAddJob = useCallback((jobPosting: Omit<JobPosting, 'id' | 'createdAt'>) => {
    const app = addApplication(jobPosting);
    if (resume?.content) {
      processApplication(app, resume.content, skills);
    }
    setCurrentTab(2); // Switch to Applications tab
  }, [addApplication, resume, processApplication, skills]);

  const handleReprocess = useCallback((id: string) => {
    const app = applications.find(a => a.id === id);
    if (app && resume?.content) {
      processApplication(app, resume.content, skills);
    }
  }, [applications, resume, processApplication, skills]);

  const handleDownload = useCallback(async (app: Application) => {
    const zip = new JSZip();
    const companySlug = app.jobPosting.company.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const titleSlug = app.jobPosting.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const folderName = `${companySlug}-${titleSlug}`;

    if (app.customizedResume) {
      zip.file(`${folderName}/resume.txt`, app.customizedResume);
    }

    if (app.customizationSummary) {
      zip.file(`${folderName}/customization-summary.md`, `# Customization Summary\n\n${app.customizationSummary}`);
    }

    if (app.research) {
      const researchMd = `# Company Research: ${app.jobPosting.company}

## Company Overview
${app.research.companyInfo}

## Potential Hiring Manager
${app.research.hiringManager || 'Not identified'}

## Organization Structure
${app.research.orgStructure}

## Research Sources
${app.research.sources?.map((s: string) => `- ${s}`).join('\n') || 'None'}

---
Generated: ${new Date(app.research.createdAt).toLocaleString()}
`;
      zip.file(`${folderName}/research.md`, researchMd);
    }

    // Add original job posting
    const jobPostingMd = `# Job Posting: ${app.jobPosting.title}

**Company:** ${app.jobPosting.company}
**Source:** ${app.jobPosting.source === 'url' ? app.jobPosting.sourceUrl : 'Manual entry'}
**Added:** ${new Date(app.jobPosting.createdAt).toLocaleString()}

## Description
${app.jobPosting.description}

## Requirements
${app.jobPosting.requirements?.map((r: string) => `- ${r}`).join('\n') || 'Not specified'}
`;
    zip.file(`${folderName}/job-posting.md`, jobPostingMd);

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${folderName}.zip`);
  }, []);

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {currentTab === 0 && <ResumeManager />}
      {currentTab === 1 && (
        <JobPostingInput onAdd={handleAddJob} hasResume={hasResume} />
      )}
      {currentTab === 2 && (
        <ApplicationList
          applications={applications}
          masterResume={resume?.content || null}
          onDelete={deleteApplication}
          onArchive={archiveApplication}
          onReprocess={handleReprocess}
          onDownload={handleDownload}
          onUpdateJob={updateJobPosting}
          onUpdateResume={(id, newResume) => setCustomizedResume(id, newResume)}
          onSetStage={setStage}
          onAddActivity={addActivity}
          onDeleteActivity={deleteActivity}
        />
      )}
    </Layout>
  );
}

export default App;
