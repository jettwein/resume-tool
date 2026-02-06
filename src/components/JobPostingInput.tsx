import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import { JobPosting } from '../types';
import { parseJobPosting, fetchJobPosting } from '../services/api';

interface JobPostingInputProps {
  onAdd: (jobPosting: Omit<JobPosting, 'id' | 'createdAt'>) => void;
  hasResume: boolean;
}

interface ParsedJob {
  title: string;
  company: string;
  salaryRange: string | null;
  description: string;
  requirements: string[];
  rawText: string;
  source: 'text' | 'url';
  sourceUrl?: string;
}

export function JobPostingInput({ onAdd, hasResume }: JobPostingInputProps) {
  const [mode, setMode] = useState<'text' | 'url'>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedJob, setParsedJob] = useState<ParsedJob | null>(null);

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: 'text' | 'url' | null) => {
    if (newMode) {
      setMode(newMode);
      setError(null);
      setParsedJob(null);
    }
  };

  const resetForm = () => {
    setText('');
    setUrl('');
    setError(null);
    setParsedJob(null);
  };

  const handleParse = async () => {
    setLoading(true);
    setError(null);
    setParsedJob(null);

    try {
      if (mode === 'text') {
        if (!text.trim()) {
          setError('Please paste the job posting text');
          return;
        }
        const result = await parseJobPosting(text.trim());
        setParsedJob({
          ...result,
          rawText: text.trim(),
          source: 'text',
        });
      } else {
        if (!url.trim()) {
          setError('Please enter a URL');
          return;
        }
        const result = await fetchJobPosting(url.trim());
        setParsedJob({
          title: result.title,
          company: result.company,
          salaryRange: result.salaryRange,
          description: result.description,
          requirements: result.requirements,
          rawText: result.rawText,
          source: 'url',
          sourceUrl: url.trim(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse job posting');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!parsedJob) return;

    onAdd({
      title: parsedJob.title,
      company: parsedJob.company,
      salaryRange: parsedJob.salaryRange,
      description: parsedJob.description,
      requirements: parsedJob.requirements,
      source: parsedJob.source,
      sourceUrl: parsedJob.sourceUrl,
      rawText: parsedJob.rawText,
    });

    resetForm();
  };

  if (!hasResume) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Add Job Posting
        </Typography>
        <Alert severity="info">
          Please add your master resume first before adding job postings.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Add Job Posting
      </Typography>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              size="small"
            >
              <ToggleButton value="text">
                <TextFieldsIcon sx={{ mr: 1 }} />
                Paste Text
              </ToggleButton>
              <ToggleButton value="url">
                <LinkIcon sx={{ mr: 1 }} />
                From URL
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {mode === 'text' ? (
            <Stack spacing={2}>
              <TextField
                label="Job Posting"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setParsedJob(null);
                }}
                fullWidth
                multiline
                minRows={10}
                placeholder="Paste the full job posting here..."
              />
              <Box>
                <Button
                  variant="contained"
                  onClick={handleParse}
                  disabled={loading || !text.trim()}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Parsing...' : 'Parse Job Posting'}
                </Button>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <TextField
                label="Job Posting URL"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setParsedJob(null);
                }}
                fullWidth
                placeholder="https://..."
                helperText="Enter the URL of the job posting"
              />
              <Box>
                <Button
                  variant="contained"
                  onClick={handleParse}
                  disabled={loading || !url.trim()}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Fetching...' : 'Fetch Job Posting'}
                </Button>
              </Box>
            </Stack>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {parsedJob && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Extracted Details (edit if needed)
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Job Title"
                  value={parsedJob.title}
                  onChange={(e) => setParsedJob({ ...parsedJob, title: e.target.value })}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Company"
                  value={parsedJob.company}
                  onChange={(e) => setParsedJob({ ...parsedJob, company: e.target.value })}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Salary Range"
                  value={parsedJob.salaryRange || ''}
                  onChange={(e) => setParsedJob({ ...parsedJob, salaryRange: e.target.value || null })}
                  fullWidth
                  size="small"
                  placeholder="e.g., $150,000 - $180,000"
                />
              </Stack>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                  disabled={!parsedJob.title.trim() || !parsedJob.company.trim()}
                >
                  Add This Job
                </Button>
                <Button
                  variant="text"
                  onClick={resetForm}
                  sx={{ ml: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
