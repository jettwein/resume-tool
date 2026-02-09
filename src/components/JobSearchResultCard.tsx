import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Box,
  Button,
  Tooltip,
  IconButton,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { JobSearchResult } from '../types';

interface JobSearchResultCardProps {
  result: JobSearchResult;
  userSkills: string[];
  isAdded: boolean;
  onSelect: () => void;
  onAdd: () => void;
  onReject: () => void;
}

function getRelativeDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

const sourceColors: Record<string, string> = {
  indeed: '#2164f3',
  linkedin: '#0a66c2',
  glassdoor: '#0caa41',
  google: '#4285f4',
  zip_recruiter: '#23a455',
};

export function JobSearchResultCard({
  result,
  userSkills,
  isAdded,
  onSelect,
  onAdd,
  onReject,
}: JobSearchResultCardProps) {
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const matchingSkills = result.skills.filter(s =>
    userSkillsLower.includes(s.toLowerCase())
  );
  const otherSkills = result.skills.filter(
    s => !userSkillsLower.includes(s.toLowerCase())
  );

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 4 },
      }}
      onClick={onSelect}
    >
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={result.source}
              size="small"
              sx={{
                bgcolor: sourceColors[result.source] || '#666',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 20,
              }}
            />
            {result.isRemote && (
              <Chip label="Remote" size="small" color="info" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
            )}
            {result.jobType && (
              <Chip label={result.jobType} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
            )}
          </Box>
          {result.datePosted && (
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: 1 }}>
              {getRelativeDate(result.datePosted)}
            </Typography>
          )}
        </Box>

        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3, fontSize: '1rem' }}
        >
          {result.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {result.company}
        </Typography>

        {result.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {result.location}
            </Typography>
          </Box>
        )}

        {result.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.8rem',
              lineHeight: 1.5,
            }}
          >
            {result.description
              .replace(/\\([*\-+&#()[\]{}_.!~`>|])/g, '$1')
              .replace(/\*\*(.+?)\*\*/g, '$1')
              .replace(/\*(.+?)\*/g, '$1')
              .replace(/^[*\-]\s+/gm, '')
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()}
          </Typography>
        )}

        {result.salary.display && (
          <Chip
            icon={<AttachMoneyIcon />}
            label={result.salary.display}
            size="small"
            color="success"
            variant="outlined"
            sx={{ mb: 1, mt: 0.5 }}
          />
        )}

        {result.skills.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1, mb: 1 }}>
            {matchingSkills.slice(0, 5).map(skill => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                color="primary"
                variant="filled"
                sx={{ height: 22, fontSize: '0.7rem' }}
              />
            ))}
            {otherSkills.slice(0, 3).map(skill => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.7rem' }}
              />
            ))}
            {matchingSkills.length + otherSkills.length > 8 && (
              <Chip
                label={`+${matchingSkills.length + otherSkills.length - 8}`}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        )}

        {result.companyInfo.industry && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {result.companyInfo.industry}
            {result.companyInfo.numEmployees && ` | ${result.companyInfo.numEmployees} employees`}
          </Typography>
        )}

        <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 1 }}>
          <Button
            size="small"
            variant={isAdded ? 'outlined' : 'contained'}
            startIcon={isAdded ? <CheckIcon /> : <AddIcon />}
            disabled={isAdded}
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
          >
            {isAdded ? 'Added' : 'Add to Applications'}
          </Button>
          {result.url && (
            <Tooltip title="Open original posting">
              <Button
                size="small"
                variant="text"
                startIcon={<OpenInNewIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(result.url, '_blank', 'noopener');
                }}
                sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto' }}
              >
                View
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Not interested">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onReject();
              }}
              sx={{ ml: 'auto', color: 'text.secondary', '&:hover': { color: 'error.main' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}
