import { Box, Typography, Divider, Chip, Stack } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LinkIcon from '@mui/icons-material/Link';
import { CompanyResearch } from '../types';

interface ResearchPanelProps {
  research: CompanyResearch;
}

export function ResearchPanel({ research }: ResearchPanelProps) {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <BusinessIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Company Overview
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {research.companyInfo}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {research.hiringManager && (
        <>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <PersonIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>
                Potential Hiring Manager
              </Typography>
            </Box>
            <Typography variant="body2">{research.hiringManager}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />
        </>
      )}

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <AccountTreeIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Organization Structure
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {research.orgStructure}
        </Typography>
      </Box>

      {research.sources && research.sources.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <LinkIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>
                Research Sources
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {research.sources.map((source, index) => (
                <Chip key={index} label={source} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>
        </>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
        Research generated {new Date(research.createdAt).toLocaleString()}
      </Typography>
    </Box>
  );
}
