import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentResume, originalResume, jobPosting, request } = req.body;

    if (!currentResume || !request) {
      return res.status(400).json({ error: 'Current resume and request are required' });
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6000,
      messages: [
        {
          role: 'user',
          content: `You are helping to make MINIMAL, TARGETED edits to a resume based on a specific user request.

CURRENT RESUME:
${currentResume}

ORIGINAL MASTER RESUME (source of truth for facts):
${originalResume || 'Not provided'}

USER'S REQUESTED CHANGE:
${request}

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. ONLY modify the specific section/text the user mentioned - leave everything else EXACTLY as-is
2. NEVER add numbers, dollar amounts, percentages, or metrics that aren't in the original resume
3. NEVER invent or embellish achievements, transactions, or accomplishments
4. NEVER rewrite sections the user didn't ask about
5. If the user asks to "reword" something, just rephrase it - don't add new information
6. Copy unchanged sections character-for-character from the current resume
7. When in doubt, make smaller changes rather than larger ones

If the user's request would require you to invent information, explain in the changesSummary that you cannot add information not present in the original resume.

Return a JSON object with:
- updatedResume: The full resume with ONLY the requested minimal changes applied
- changesSummary: A brief explanation of exactly what you changed (be specific about which section)

Return ONLY valid JSON, no other text.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to refine resume' });
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
