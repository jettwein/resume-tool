/**
 * Resume Export Service
 *
 * Handles exporting resumes to various formats:
 * - Markdown (.md)
 * - HTML (.html)
 * - PDF (.pdf)
 * - Word (.docx)
 *
 * Architecture notes for SaaS:
 * - Export functions are pure and stateless
 * - Template rendering is delegated to the template system
 * - PDF/Word generation happens client-side to avoid server costs
 * - In SaaS mode, could move to server-side for premium features
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import { StructuredResume, ExportFormat } from '../types/resume';
import { renderResume, getDefaultTemplate } from '../templates';

/**
 * Export a resume to the specified format
 */
export async function exportResume(
  resume: StructuredResume,
  format: ExportFormat,
  templateId?: string
): Promise<void> {
  const template = templateId || getDefaultTemplate().id;
  const filename = generateFilename(resume.contactInfo.name, format);

  switch (format) {
    case 'markdown':
      await exportMarkdown(resume, template, filename);
      break;
    case 'html':
      await exportHtml(resume, template, filename);
      break;
    case 'pdf':
      await exportPdf(resume, template, filename);
      break;
    case 'docx':
      await exportDocx(resume, filename);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Generate a filename based on the person's name and format
 */
function generateFilename(name: string, format: ExportFormat): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${slug}-resume.${format === 'docx' ? 'docx' : format}`;
}

/**
 * Export to Markdown format
 */
async function exportMarkdown(
  resume: StructuredResume,
  templateId: string,
  filename: string
): Promise<void> {
  const content = renderResume(resume, templateId, 'markdown');
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, filename);
}

/**
 * Export to HTML format
 */
async function exportHtml(
  resume: StructuredResume,
  templateId: string,
  filename: string
): Promise<void> {
  const content = renderResume(resume, templateId, 'html');
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  saveAs(blob, filename);
}

/**
 * Export to PDF format using html2pdf.js
 */
async function exportPdf(
  resume: StructuredResume,
  templateId: string,
  filename: string
): Promise<void> {
  const htmlContent = renderResume(resume, templateId, 'html');

  // Create an iframe to properly render the full HTML document with styles
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.width = '850px';
  iframe.style.height = '1100px';
  document.body.appendChild(iframe);

  // Write the HTML content to the iframe
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error('Failed to create iframe document');
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Wait for content to render
  await new Promise(resolve => setTimeout(resolve, 100));

  const opt = {
    margin: 0.5,
    filename: filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true
    },
    jsPDF: {
      unit: 'in' as const,
      format: 'letter' as const,
      orientation: 'portrait' as const
    }
  };

  try {
    await html2pdf().set(opt).from(iframeDoc.body).save();
  } finally {
    document.body.removeChild(iframe);
  }
}

/**
 * Export to Word (DOCX) format using docx library
 */
async function exportDocx(
  resume: StructuredResume,
  filename: string
): Promise<void> {
  const { contactInfo, summary, experience, education, skills, technicalSkills, certifications, projects } = resume;

  const children: Paragraph[] = [];

  // Name header
  children.push(
    new Paragraph({
      text: contactInfo.name,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    })
  );

  // Contact info
  const contactParts: string[] = [];
  if (contactInfo.email) contactParts.push(contactInfo.email);
  if (contactInfo.phone) contactParts.push(contactInfo.phone);
  if (contactInfo.location) contactParts.push(contactInfo.location);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        text: contactParts.join(' | '),
        alignment: AlignmentType.CENTER,
      })
    );
  }

  // Links
  const linkParts: string[] = [];
  if (contactInfo.linkedin) linkParts.push(`LinkedIn: ${contactInfo.linkedin}`);
  if (contactInfo.github) linkParts.push(`GitHub: ${contactInfo.github}`);
  if (contactInfo.website) linkParts.push(`Website: ${contactInfo.website}`);

  if (linkParts.length > 0) {
    children.push(
      new Paragraph({
        text: linkParts.join(' | '),
        alignment: AlignmentType.CENTER,
      })
    );
  }

  children.push(new Paragraph({ text: '' }));

  // Summary
  if (summary) {
    children.push(
      new Paragraph({
        text: 'SUMMARY',
        heading: HeadingLevel.HEADING_1,
      })
    );
    children.push(new Paragraph({ text: summary }));
    children.push(new Paragraph({ text: '' }));
  }

  // Experience
  if (experience && experience.length > 0) {
    children.push(
      new Paragraph({
        text: 'EXPERIENCE',
        heading: HeadingLevel.HEADING_1,
      })
    );

    for (const exp of experience) {
      const dateRange = exp.endDate
        ? `${exp.startDate} - ${exp.endDate}`
        : `${exp.startDate} - Present`;

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true }),
          ],
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.company, bold: true }),
            new TextRun({ text: exp.location ? ` | ${exp.location}` : '' }),
            new TextRun({ text: ` | ${dateRange}` }),
          ],
        })
      );

      if (exp.bullets && exp.bullets.length > 0) {
        for (const bullet of exp.bullets) {
          children.push(
            new Paragraph({
              text: bullet,
              bullet: { level: 0 },
            })
          );
        }
      }

      if (exp.technologies && exp.technologies.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Technologies: ', italics: true }),
              new TextRun({ text: exp.technologies.join(', '), italics: true }),
            ],
          })
        );
      }
      children.push(new Paragraph({ text: '' }));
    }
  }

  // Technical Skills
  if (technicalSkills && Object.keys(technicalSkills).length > 0) {
    children.push(
      new Paragraph({
        text: 'TECHNICAL SKILLS',
        heading: HeadingLevel.HEADING_1,
      })
    );

    for (const [category, categorySkills] of Object.entries(technicalSkills)) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${category}: `, bold: true }),
            new TextRun({ text: categorySkills.join(', ') }),
          ],
        })
      );
    }
    children.push(new Paragraph({ text: '' }));
  } else if (skills && skills.length > 0) {
    children.push(
      new Paragraph({
        text: 'SKILLS',
        heading: HeadingLevel.HEADING_1,
      })
    );
    children.push(new Paragraph({ text: skills.join(', ') }));
    children.push(new Paragraph({ text: '' }));
  }

  // Education
  if (education && education.length > 0) {
    children.push(
      new Paragraph({
        text: 'EDUCATION',
        heading: HeadingLevel.HEADING_1,
      })
    );

    for (const edu of education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true }),
            new TextRun({ text: edu.field ? ` in ${edu.field}` : '' }),
          ],
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.institution, bold: true }),
            new TextRun({ text: edu.graduationDate ? ` | ${edu.graduationDate}` : '' }),
          ],
        })
      );
      if (edu.gpa) {
        children.push(new Paragraph({ text: `GPA: ${edu.gpa}` }));
      }
      if (edu.honors && edu.honors.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.honors.join(', '), italics: true }),
            ],
          })
        );
      }
      children.push(new Paragraph({ text: '' }));
    }
  }

  // Certifications
  if (certifications && certifications.length > 0) {
    children.push(
      new Paragraph({
        text: 'CERTIFICATIONS',
        heading: HeadingLevel.HEADING_1,
      })
    );

    for (const cert of certifications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: cert.name, bold: true }),
            new TextRun({ text: cert.issuer ? ` - ${cert.issuer}` : '' }),
            new TextRun({ text: cert.date ? ` (${cert.date})` : '' }),
          ],
        })
      );
    }
    children.push(new Paragraph({ text: '' }));
  }

  // Projects
  if (projects && projects.length > 0) {
    children.push(
      new Paragraph({
        text: 'PROJECTS',
        heading: HeadingLevel.HEADING_1,
      })
    );

    for (const project of projects) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: project.name, bold: true }),
          ],
        })
      );
      children.push(new Paragraph({ text: project.description }));

      if (project.technologies && project.technologies.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Technologies: ', italics: true }),
              new TextRun({ text: project.technologies.join(', '), italics: true }),
            ],
          })
        );
      }

      if (project.bullets && project.bullets.length > 0) {
        for (const bullet of project.bullets) {
          children.push(
            new Paragraph({
              text: bullet,
              bullet: { level: 0 },
            })
          );
        }
      }
      children.push(new Paragraph({ text: '' }));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

/**
 * Get available export formats
 */
export function getAvailableFormats(): { format: ExportFormat; label: string; icon: string }[] {
  return [
    { format: 'pdf', label: 'PDF', icon: 'picture_as_pdf' },
    { format: 'docx', label: 'Word', icon: 'description' },
    { format: 'markdown', label: 'Markdown', icon: 'code' },
    { format: 'html', label: 'HTML', icon: 'html' },
  ];
}
