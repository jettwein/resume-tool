import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Fetch the page content
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ResumeCustomizer/1.0)',
      },
    });

    if (!pageResponse.ok) {
      return res.status(400).json({ error: 'Failed to fetch URL' });
    }

    const html = await pageResponse.text();

    // Use Claude to extract job posting details
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Extract the job posting details from this HTML content. Return a JSON object with the following fields:
- title: The job title
- company: The company name
- salaryRange: The salary range if mentioned (e.g., "$150,000 - $180,000"), or null if not specified
- description: A clean summary of the job description
- requirements: An array of key requirements/qualifications
- rawText: The full job posting text (cleaned of HTML)

If you cannot find a field, use an empty string, null, or empty array as appropriate.

HTML Content:
${html.substring(0, 50000)}

Return ONLY valid JSON, no other text.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse job posting' });
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
