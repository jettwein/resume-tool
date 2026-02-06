import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { useProfile } from '../hooks/useProfile';

export function SkillsEditor() {
  const { skills, saveSkills, hasSkills, profile } = useProfile();
  const [localSkills, setLocalSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalSkills(skills);
  }, [skills]);

  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (skill && !localSkills.includes(skill)) {
      setLocalSkills([...localSkills, skill]);
      setNewSkill('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setLocalSkills(localSkills.filter(s => s !== skillToRemove));
  };

  const handleSave = () => {
    saveSkills(localSkills);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const hasChanges = JSON.stringify(localSkills) !== JSON.stringify(skills);

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          Skills & Technologies
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          List your key skills, technologies, methodologies, and tools. These will be used to
          evaluate how well you match each job posting.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            size="small"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a skill (e.g., Python, AWS, Agile, Machine Learning)"
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddSkill}
            disabled={!newSkill.trim()}
          >
            Add
          </Button>
        </Box>

        {localSkills.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {localSkills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            No skills added yet. Add skills like programming languages, frameworks, cloud platforms,
            methodologies (Agile, Scrum), AI/ML tools, etc.
          </Alert>
        )}

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          Save Skills
        </Button>

        {saved && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Skills saved successfully!
          </Alert>
        )}

        {hasSkills && profile && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Last updated: {new Date(profile.lastUpdated).toLocaleString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
