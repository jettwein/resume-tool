/**
 * Modern Resume Template (ATS-Optimized)
 *
 * A clean, professional resume template optimized for
 * Applicant Tracking Systems (ATS). Features:
 * - Single column layout
 * - Standard section headings
 * - ATS-safe fonts (Arial, Calibri)
 * - Simple formatting without tables or columns
 * - Contact info in body (not header/footer)
 */

import { ResumeTemplate, StructuredResume } from '../types/resume';

function renderMarkdown(resume: StructuredResume): string {
  const lines: string[] = [];
  const { contactInfo, summary, experience, education, skills, technicalSkills, certifications, projects } = resume;

  // Header / Contact Info
  lines.push(`# ${contactInfo.name}`);
  lines.push('');

  const contactParts: string[] = [];
  if (contactInfo.email) contactParts.push(contactInfo.email);
  if (contactInfo.phone) contactParts.push(contactInfo.phone);
  if (contactInfo.location) contactParts.push(contactInfo.location);
  if (contactParts.length > 0) {
    lines.push(contactParts.join(' | '));
  }

  const linkParts: string[] = [];
  if (contactInfo.linkedin) linkParts.push(contactInfo.linkedin);
  if (contactInfo.github) linkParts.push(contactInfo.github);
  if (contactInfo.website) linkParts.push(contactInfo.website);
  if (linkParts.length > 0) {
    lines.push(linkParts.join(' | '));
  }
  lines.push('');

  // Summary
  if (summary) {
    lines.push('## SUMMARY');
    lines.push('');
    lines.push(summary);
    lines.push('');
  }

  // Experience
  if (experience && experience.length > 0) {
    lines.push('## EXPERIENCE');
    lines.push('');

    for (const exp of experience) {
      const dateRange = exp.endDate
        ? `${exp.startDate} - ${exp.endDate}`
        : `${exp.startDate} - Present`;

      lines.push(`### ${exp.title}`);
      lines.push(`${exp.company}${exp.location ? ` | ${exp.location}` : ''} | ${dateRange}`);
      lines.push('');

      if (exp.bullets && exp.bullets.length > 0) {
        for (const bullet of exp.bullets) {
          lines.push(`- ${bullet}`);
        }
        lines.push('');
      }

      if (exp.technologies && exp.technologies.length > 0) {
        lines.push(`Technologies: ${exp.technologies.join(', ')}`);
        lines.push('');
      }
    }
  }

  // Skills (placed before Education for ATS - skills are often keyword-scanned)
  if (technicalSkills && Object.keys(technicalSkills).length > 0) {
    lines.push('## SKILLS');
    lines.push('');
    for (const [category, categorySkills] of Object.entries(technicalSkills)) {
      lines.push(`${category}: ${categorySkills.join(', ')}`);
    }
    lines.push('');
  } else if (skills && skills.length > 0) {
    lines.push('## SKILLS');
    lines.push('');
    lines.push(skills.join(', '));
    lines.push('');
  }

  // Education
  if (education && education.length > 0) {
    lines.push('## EDUCATION');
    lines.push('');

    for (const edu of education) {
      lines.push(`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`);
      lines.push(`${edu.institution}${edu.graduationDate ? ` | ${edu.graduationDate}` : ''}`);
      if (edu.gpa) {
        lines.push(`GPA: ${edu.gpa}`);
      }
      if (edu.honors && edu.honors.length > 0) {
        lines.push(edu.honors.join(', '));
      }
      lines.push('');
    }
  }

  // Certifications
  if (certifications && certifications.length > 0) {
    lines.push('## CERTIFICATIONS');
    lines.push('');
    for (const cert of certifications) {
      const certLine = cert.issuer
        ? `- ${cert.name} - ${cert.issuer}${cert.date ? ` (${cert.date})` : ''}`
        : `- ${cert.name}${cert.date ? ` (${cert.date})` : ''}`;
      lines.push(certLine);
    }
    lines.push('');
  }

  // Projects
  if (projects && projects.length > 0) {
    lines.push('## PROJECTS');
    lines.push('');

    for (const project of projects) {
      lines.push(`### ${project.name}`);
      lines.push(project.description);
      if (project.technologies && project.technologies.length > 0) {
        lines.push(`Technologies: ${project.technologies.join(', ')}`);
      }
      if (project.bullets && project.bullets.length > 0) {
        lines.push('');
        for (const bullet of project.bullets) {
          lines.push(`- ${bullet}`);
        }
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

function renderHtml(resume: StructuredResume): string {
  const { contactInfo, summary, experience, education, skills, technicalSkills, certifications, projects } = resume;

  // ATS-optimized HTML with simple, parseable structure
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${contactInfo.name} - Resume</title>
  <style>
    /* ATS-friendly styles: simple, single-column, standard fonts */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, Calibri, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
      background: #fff;
    }
    h1 {
      font-size: 18pt;
      font-weight: bold;
      color: #000;
      margin-bottom: 4px;
      text-align: center;
    }
    h2 {
      font-size: 12pt;
      font-weight: bold;
      color: #000;
      text-transform: uppercase;
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    h3 {
      font-size: 11pt;
      font-weight: bold;
      color: #000;
      margin-bottom: 0;
    }
    .contact-info {
      text-align: center;
      font-size: 10pt;
      color: #000;
      margin-bottom: 2px;
    }
    .contact-info a {
      color: #000;
      text-decoration: none;
    }
    .summary {
      font-size: 11pt;
      color: #000;
      margin-bottom: 8px;
    }
    .experience-item, .education-item, .project-item {
      margin-bottom: 12px;
    }
    .job-meta {
      font-size: 11pt;
      color: #000;
      margin-bottom: 4px;
    }
    .company-name {
      font-weight: bold;
    }
    ul {
      margin-left: 18px;
      margin-top: 4px;
    }
    li {
      font-size: 11pt;
      margin-bottom: 2px;
    }
    .technologies {
      font-size: 10pt;
      color: #333;
      margin-top: 4px;
    }
    .skills-list {
      font-size: 11pt;
      margin-bottom: 4px;
    }
    .certification-item {
      font-size: 11pt;
      margin-bottom: 2px;
    }
    @media print {
      body {
        padding: 0.25in;
      }
      h2 {
        page-break-after: avoid;
      }
      .experience-item, .education-item {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(contactInfo.name)}</h1>
    <div class="contact-info">
      ${[contactInfo.email, contactInfo.phone, contactInfo.location].filter(Boolean).join(' | ')}
    </div>
    ${(contactInfo.linkedin || contactInfo.github || contactInfo.website) ? `
    <div class="contact-info">
      ${[contactInfo.linkedin, contactInfo.github, contactInfo.website].filter(Boolean).join(' | ')}
    </div>
    ` : ''}
  </header>

  ${summary ? `
  <section>
    <h2>Summary</h2>
    <p class="summary">${escapeHtml(summary)}</p>
  </section>
  ` : ''}

  ${experience && experience.length > 0 ? `
  <section>
    <h2>Experience</h2>
    ${experience.map(exp => `
    <div class="experience-item">
      <h3>${escapeHtml(exp.title)}</h3>
      <div class="job-meta">
        <span class="company-name">${escapeHtml(exp.company)}</span>${exp.location ? ` | ${escapeHtml(exp.location)}` : ''} | ${escapeHtml(exp.startDate)} - ${escapeHtml(exp.endDate || 'Present')}
      </div>
      ${exp.bullets && exp.bullets.length > 0 ? `
      <ul>
        ${exp.bullets.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join('\n        ')}
      </ul>
      ` : ''}
      ${exp.technologies && exp.technologies.length > 0 ? `
      <div class="technologies">Technologies: ${exp.technologies.map(escapeHtml).join(', ')}</div>
      ` : ''}
    </div>
    `).join('')}
  </section>
  ` : ''}

  ${technicalSkills && Object.keys(technicalSkills).length > 0 ? `
  <section>
    <h2>Skills</h2>
    ${Object.entries(technicalSkills).map(([category, categorySkills]) => `
    <div class="skills-list"><strong>${escapeHtml(category)}:</strong> ${(categorySkills as string[]).map(escapeHtml).join(', ')}</div>
    `).join('')}
  </section>
  ` : skills && skills.length > 0 ? `
  <section>
    <h2>Skills</h2>
    <p class="skills-list">${skills.map(escapeHtml).join(', ')}</p>
  </section>
  ` : ''}

  ${education && education.length > 0 ? `
  <section>
    <h2>Education</h2>
    ${education.map(edu => `
    <div class="education-item">
      <h3>${escapeHtml(edu.degree)}${edu.field ? ` in ${escapeHtml(edu.field)}` : ''}</h3>
      <div class="job-meta">
        <span class="company-name">${escapeHtml(edu.institution)}</span>${edu.graduationDate ? ` | ${escapeHtml(edu.graduationDate)}` : ''}
      </div>
      ${edu.gpa ? `<div>GPA: ${escapeHtml(edu.gpa)}</div>` : ''}
      ${edu.honors && edu.honors.length > 0 ? `<div>${edu.honors.map(escapeHtml).join(', ')}</div>` : ''}
    </div>
    `).join('')}
  </section>
  ` : ''}

  ${certifications && certifications.length > 0 ? `
  <section>
    <h2>Certifications</h2>
    ${certifications.map(cert => `
    <div class="certification-item">
      ${escapeHtml(cert.name)}${cert.issuer ? ` - ${escapeHtml(cert.issuer)}` : ''}${cert.date ? ` (${escapeHtml(cert.date)})` : ''}
    </div>
    `).join('')}
  </section>
  ` : ''}

  ${projects && projects.length > 0 ? `
  <section>
    <h2>Projects</h2>
    ${projects.map(project => `
    <div class="project-item">
      <h3>${escapeHtml(project.name)}</h3>
      <p>${escapeHtml(project.description)}</p>
      ${project.technologies && project.technologies.length > 0 ? `
      <div class="technologies">Technologies: ${project.technologies.map(escapeHtml).join(', ')}</div>
      ` : ''}
      ${project.bullets && project.bullets.length > 0 ? `
      <ul>
        ${project.bullets.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join('\n        ')}
      </ul>
      ` : ''}
    </div>
    `).join('')}
  </section>
  ` : ''}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

export const modernTemplate: ResumeTemplate = {
  id: 'modern',
  name: 'Modern (ATS-Optimized)',
  description: 'A clean, ATS-friendly template with standard formatting. Optimized for Applicant Tracking Systems.',
  renderMarkdown,
  renderHtml,
};
