import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resume, jobPosting, skills = [] } = req.body;

    if (!resume || !jobPosting) {
      return res.status(400).json({ error: 'Resume and job posting are required' });
    }

    const skillsSection = skills.length > 0
      ? `\nCANDIDATE'S KEY SKILLS & TECHNOLOGIES:\n${skills.join(', ')}\n`
      : '';

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10000,
      messages: [
        {
          role: 'user',
          content: `You are an expert resume writer and job match analyst. Customize the following resume for the job posting below and evaluate how well the candidate matches the role.

IMPORTANT GUIDELINES:
1. Keep all factual information accurate - do not invent experiences or skills the candidate doesn't have
2. Reorder and emphasize relevant experiences that match the job requirements
3. Use keywords and phrases from the job posting where they genuinely apply
4. Adjust the professional summary to highlight relevant qualifications
5. Keep the format clean and professional
6. Focus on achievements and impact rather than just responsibilities
7. NEVER invent numbers, dollar amounts, percentages, or metrics not in the original resume
8. NEVER change employment dates - keep all start dates and end dates exactly as they appear in the original resume
9. NEVER modify the education section - copy it exactly as-is from the original resume (institution names, degrees, graduation dates, GPA, honors)

MASTER RESUME:
${resume}
${skillsSection}
JOB POSTING:
Title: ${jobPosting.title}
Company: ${jobPosting.company}
Description: ${jobPosting.description}
${jobPosting.requirements?.length ? `Requirements: ${jobPosting.requirements.join(', ')}` : ''}

Return a JSON object with the following structure:

{
  "structuredResume": {
    "contactInfo": {
      "name": "Full Name",
      "email": "email@example.com (if available)",
      "phone": "phone number (if available)",
      "location": "City, State (if available)",
      "linkedin": "LinkedIn URL (if available)",
      "website": "Personal website (if available)",
      "github": "GitHub URL (if available)"
    },
    "summary": "Professional summary paragraph tailored to this job",
    "experience": [
      {
        "id": "unique-id-1",
        "company": "Company Name",
        "title": "Job Title",
        "location": "City, State (if available)",
        "startDate": "MMM YYYY",
        "endDate": "MMM YYYY or Present",
        "bullets": [
          "Achievement/responsibility bullet point 1",
          "Achievement/responsibility bullet point 2"
        ],
        "technologies": ["Tech1", "Tech2"]
      }
    ],
    "education": [
      {
        "id": "unique-id-1",
        "institution": "University Name",
        "degree": "Degree Type",
        "field": "Field of Study",
        "graduationDate": "YYYY",
        "gpa": "GPA if mentioned",
        "honors": ["Honor 1"]
      }
    ],
    "skills": ["Skill 1", "Skill 2", "Skill 3"],
    "technicalSkills": {
      "Category1": ["Skill1", "Skill2"],
      "Category2": ["Skill3", "Skill4"]
    },
    "certifications": [
      {
        "id": "unique-id-1",
        "name": "Certification Name",
        "issuer": "Issuing Organization",
        "date": "YYYY"
      }
    ],
    "projects": [
      {
        "id": "unique-id-1",
        "name": "Project Name",
        "description": "Brief description",
        "technologies": ["Tech1", "Tech2"],
        "bullets": ["Accomplishment 1"]
      }
    ]
  },
  "customizedResume": "Full plain text version of the customized resume (for backward compatibility)",
  "keyMatches": ["Key skill/experience match 1", "Key skill/experience match 2"],
  "summary": "A detailed explanation (3-5 paragraphs) of what changes you made and why",
  "matchScore": 75,
  "matchAnalysis": "Detailed analysis of strengths, gaps, and recommendations"
}

IMPORTANT NOTES:
- Generate unique IDs for each experience, education, certification, and project item (use format like "exp-1", "edu-1", etc.)
- Only include sections that have content from the original resume
- The technicalSkills field should categorize skills if there are enough (e.g., "Languages", "Frameworks", "Cloud", "Tools")
- Be honest and objective in the matchScore (0-100) - identify real gaps
- The customizedResume field should be a nicely formatted plain text version

Return ONLY valid JSON, no other text.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to generate customized resume' });
    }

    const result = JSON.parse(jsonMatch[0]);

    // Add metadata to structured resume
    if (result.structuredResume) {
      const now = new Date().toISOString();
      result.structuredResume.id = `resume-${Date.now()}`;
      result.structuredResume.version = 1;
      result.structuredResume.createdAt = now;
      result.structuredResume.updatedAt = now;
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
