import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { company, jobTitle } = req.body;

    if (!company || !jobTitle) {
      return res.status(400).json({ error: 'Company and job title are required' });
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: `Research the following company for a job application. Provide helpful information for someone applying to this position.

Company: ${company}
Position: ${jobTitle}

Based on your knowledge, provide:
1. Company overview - what they do, their mission, recent news or achievements
2. Potential hiring manager - who might be the hiring manager for this role (typical titles)
3. Organization structure - what team this role likely reports to
4. Interview tips - what to emphasize based on company culture and values

Return a JSON object with:
- companyInfo: A comprehensive overview of the company (2-3 paragraphs)
- hiringManager: Best guess at who the hiring manager might be (job title, or null if unknown)
- orgStructure: Description of where this role fits in the organization
- sources: Array of suggested places to learn more (LinkedIn, company website sections, etc.)

Return ONLY valid JSON, no other text.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to generate research' });
    }

    const result = JSON.parse(jsonMatch[0]);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
