import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const anthropic = new Anthropic();

export interface ParsedEmail {
  company: string | null;
  jobTitle: string | null;
  emailType: 'application_received' | 'interview_request' | 'rejection' | 'offer' | 'follow_up' | 'other';
  summary: string;
  actionRequired: boolean;
  actionDescription: string | null;
  scheduledDate: string | null;
  senderName: string | null;
  senderRole: string | null;
  confidence: 'high' | 'medium' | 'low';
}

export interface EmailInput {
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  snippet?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { emails } = req.body as { emails: EmailInput[] };

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'emails array is required' });
  }

  try {
    const parsedEmails: ParsedEmail[] = [];

    for (const email of emails) {
      const parsed = await parseEmail(email);
      parsedEmails.push(parsed);
    }

    return res.status(200).json({ parsedEmails });
  } catch (error) {
    console.error('Email parsing error:', error);
    return res.status(500).json({
      error: 'Failed to parse emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function parseEmail(email: EmailInput): Promise<ParsedEmail> {
  const prompt = `Analyze this job-related email and extract structured information.

EMAIL:
From: ${email.from}
To: ${email.to}
Date: ${email.date}
Subject: ${email.subject}

Body:
${email.body.substring(0, 3000)}

Respond with a JSON object containing:
{
  "company": "Company name if identifiable, or null",
  "jobTitle": "Job title if mentioned, or null",
  "emailType": "One of: application_received, interview_request, rejection, offer, follow_up, other",
  "summary": "Brief 1-2 sentence summary of the email",
  "actionRequired": true/false,
  "actionDescription": "What action is needed, if any, or null",
  "scheduledDate": "ISO date string if an interview/call is scheduled, or null",
  "senderName": "Name of the sender if identifiable, or null",
  "senderRole": "Role/title of sender if mentioned (e.g., 'Recruiter', 'Hiring Manager'), or null",
  "confidence": "high, medium, or low - how confident you are in this analysis"
}

Guidelines:
- "application_received" = confirmation that application was received
- "interview_request" = invitation to interview (phone, video, or in-person)
- "rejection" = application was declined
- "offer" = job offer extended
- "follow_up" = recruiter checking in, status update, or requesting more info
- "other" = doesn't fit above categories or not job-related

Only respond with the JSON object, no other text.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: prompt }
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  try {
    const parsed = JSON.parse(content.text) as ParsedEmail;
    return parsed;
  } catch {
    // If JSON parsing fails, return a default
    return {
      company: null,
      jobTitle: null,
      emailType: 'other',
      summary: 'Could not parse email content',
      actionRequired: false,
      actionDescription: null,
      scheduledDate: null,
      senderName: null,
      senderRole: null,
      confidence: 'low',
    };
  }
}
