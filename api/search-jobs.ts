import type { VercelRequest, VercelResponse } from '@vercel/node';
import { execFile } from 'child_process';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { keywords, location, remote, jobType, resultsWanted, hoursOld, siteNames } = req.body;

  if (!keywords) {
    return res.status(400).json({ error: 'keywords is required' });
  }

  const input = JSON.stringify({
    keywords,
    location: location || '',
    remote: !!remote,
    jobType: jobType || null,
    resultsWanted: Math.min(resultsWanted || 20, 50),
    hoursOld: hoursOld || 72,
    siteNames: siteNames || ['indeed', 'linkedin', 'glassdoor'],
  });

  const scriptPath = path.join(process.cwd(), 'scripts', 'search-jobs.py');

  // Try venv python first, fall back to system python
  const venvPython = path.join(process.cwd(), '.venv', 'bin', 'python3');
  const pythonCandidates = [venvPython, 'python3.12', 'python3', 'python'];

  try {
    const result = await tryPython(pythonCandidates, scriptPath, input);
    const data = JSON.parse(result);

    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    return res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    return res.status(500).json({ error: message });
  }
}

function tryPython(candidates: string[], scriptPath: string, input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    function attempt(index: number) {
      if (index >= candidates.length) {
        reject(new Error('No working Python 3.10+ found. Install python-jobspy in a .venv or system-wide.'));
        return;
      }

      const python = candidates[index];
      const proc = execFile(python, [scriptPath], { timeout: 60000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          // If this python doesn't exist or fails to start, try next
          if (error.code === 'ENOENT' || (stderr && stderr.includes('No module named'))) {
            attempt(index + 1);
            return;
          }
          reject(new Error(stderr || error.message));
          return;
        }
        resolve(stdout);
      });

      proc.stdin?.write(input);
      proc.stdin?.end();
    }

    attempt(0);
  });
}
