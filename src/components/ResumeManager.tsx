import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useResume } from '../hooks/useResume';
import { SkillsEditor } from './SkillsEditor';

export function ResumeManager() {
  const { resume, loading, saveResume, clearResume, hasResume } = useResume();
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resume?.content) {
      setContent(resume.content);
    }
  }, [resume]);

  const handleSave = () => {
    if (content.trim()) {
      saveResume(content.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClear = () => {
    setContent('');
    clearResume();
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Master Resume
      </Typography>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Paste your full resume below or upload a text file. This will be used as the base
            for all customized resumes.
          </Typography>

          <TextField
            multiline
            fullWidth
            minRows={15}
            maxRows={30}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your resume here...

Include your work experience, skills, education, and any other relevant information.
The more detail you provide, the better the customization will be."
            sx={{
              mb: 2,
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
          />

          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!content.trim()}
            >
              Save Resume
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md"
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload File
            </Button>

            {hasResume && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
          </Stack>

          {saved && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Resume saved successfully!
            </Alert>
          )}

          {hasResume && resume && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Last updated: {new Date(resume.lastUpdated).toLocaleString()}
            </Typography>
          )}
        </CardContent>
      </Card>

      <SkillsEditor />
    </Box>
  );
}
