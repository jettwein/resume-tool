/**
 * Resume Template System
 *
 * This module provides a registry of resume templates and
 * functions for rendering resumes in various formats.
 *
 * Architecture for SaaS scalability:
 * - Templates are registered in a central registry
 * - Each template implements the ResumeTemplate interface
 * - Templates can be loaded dynamically (from DB in future)
 * - Premium templates can be gated by user subscription
 */

import { ResumeTemplate, StructuredResume, ExportFormat } from '../types/resume';
import { modernTemplate } from './modern';

// Template Registry
const templates: Map<string, ResumeTemplate> = new Map();

// Register built-in templates
templates.set(modernTemplate.id, modernTemplate);

/**
 * Get all available templates
 */
export function getTemplates(): ResumeTemplate[] {
  return Array.from(templates.values());
}

/**
 * Get a specific template by ID
 */
export function getTemplate(id: string): ResumeTemplate | undefined {
  return templates.get(id);
}

/**
 * Get the default template
 */
export function getDefaultTemplate(): ResumeTemplate {
  return modernTemplate;
}

/**
 * Register a new template (for dynamic template loading)
 */
export function registerTemplate(template: ResumeTemplate): void {
  templates.set(template.id, template);
}

/**
 * Render a resume using a specific template and format
 */
export function renderResume(
  resume: StructuredResume,
  templateId: string,
  format: ExportFormat
): string {
  const template = templates.get(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  switch (format) {
    case 'markdown':
      return template.renderMarkdown(resume);
    case 'html':
      return template.renderHtml(resume);
    default:
      throw new Error(`Unsupported format for direct rendering: ${format}`);
  }
}

// Re-export templates
export { modernTemplate };
