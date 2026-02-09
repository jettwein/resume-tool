import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Stack,
  Grid,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import SortIcon from '@mui/icons-material/Sort';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {
  JobSearchFilters,
  JobSearchResult,
  JobPosting,
  DEFAULT_SEARCH_FILTERS,
  AVAILABLE_SITES,
} from '../types';
import { searchJobs } from '../services/api';
import { getItem, setItem, STORAGE_KEYS } from '../services/storage';
import { JobSearchResultCard } from './JobSearchResultCard';

function markdownToHtml(md: string): string {
  let html = md
    // Unescape backslash-escaped characters (e.g. \- \+ \*)
    .replace(/\\([*\-+&#()[\]{}_.!~`>|])/g, '$1')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Unordered list items: lines starting with * or -
    .replace(/^[*\-]\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>, stripping newlines between items
    .replace(/((?:<li>.*<\/li>\n?)+)/g, (match) => `<ul>${match.replace(/\n/g, '')}</ul>`)
    // Line breaks: double newline → paragraph break, single → <br>
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return `<p>${html}</p>`;
}

interface JobSearchProps {
  onAddJob: (jobPosting: Omit<JobPosting, 'id' | 'createdAt'>) => void;
  hasResume: boolean;
  userSkills: string[];
}

type SortOption = 'date' | 'salary' | 'company';

function mapResultToJobPosting(result: JobSearchResult): Omit<JobPosting, 'id' | 'createdAt'> {
  return {
    title: result.title,
    company: result.company,
    salaryRange: result.salary.display || null,
    description: result.description,
    requirements: result.skills,
    source: 'url',
    sourceUrl: result.url,
    rawText: result.description,
  };
}

export function JobSearch({ onAddJob, hasResume, userSkills }: JobSearchProps) {
  const [filters, setFilters] = useState<JobSearchFilters>(() => {
    const saved = getItem<JobSearchFilters>(STORAGE_KEYS.JOB_SEARCH_FILTERS);
    return saved || { ...DEFAULT_SEARCH_FILTERS, keywords: userSkills.slice(0, 3).join(', ') };
  });
  const [results, setResults] = useState<JobSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobSearchResult | null>(null);
  const [addedJobs, setAddedJobs] = useState<Set<string>>(new Set());
  const [rejectedJobs, setRejectedJobs] = useState<Set<string>>(() => {
    const saved = getItem<string[]>(STORAGE_KEYS.REJECTED_JOBS);
    return new Set(saved || []);
  });
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setItem(STORAGE_KEYS.JOB_SEARCH_FILTERS, filters);
  }, [filters]);

  const handleSearch = useCallback(async () => {
    if (!filters.keywords.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await searchJobs(filters);
      // Deduplicate by normalized company+title, keeping the result with the longer description
      const seen = new Map<string, JobSearchResult>();
      for (const result of response.results) {
        const key = `${result.company.toLowerCase().trim()}::${result.title.toLowerCase().trim()}`;
        const existing = seen.get(key);
        if (!existing || result.description.length > existing.description.length) {
          seen.set(key, result);
        }
      }
      setResults([...seen.values()]);
      setFiltersExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleAddJob = useCallback(
    (result: JobSearchResult) => {
      if (addedJobs.has(result.id)) return;
      onAddJob(mapResultToJobPosting(result));
      setAddedJobs(prev => new Set(prev).add(result.id));
    },
    [addedJobs, onAddJob]
  );

  const handleReject = useCallback((resultId: string) => {
    setRejectedJobs(prev => {
      const next = new Set(prev).add(resultId);
      setItem(STORAGE_KEYS.REJECTED_JOBS, [...next]);
      return next;
    });
  }, []);

  const updateFilter = <K extends keyof JobSearchFilters>(
    key: K,
    value: JobSearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleSite = (siteId: string) => {
    setFilters(prev => {
      const sites = prev.siteNames.includes(siteId)
        ? prev.siteNames.filter(s => s !== siteId)
        : [...prev.siteNames, siteId];
      return { ...prev, siteNames: sites.length > 0 ? sites : prev.siteNames };
    });
  };

  const visibleResults = results.filter(r => !rejectedJobs.has(r.id));
  const sortedResults = [...visibleResults].sort((a, b) => {
    switch (sortBy) {
      case 'date': {
        const dateA = a.datePosted ? new Date(a.datePosted).getTime() : 0;
        const dateB = b.datePosted ? new Date(b.datePosted).getTime() : 0;
        return dateB - dateA;
      }
      case 'salary': {
        const salaryA = a.salary.max || a.salary.min || 0;
        const salaryB = b.salary.max || b.salary.min || 0;
        return salaryB - salaryA;
      }
      case 'company':
        return a.company.localeCompare(b.company);
      default:
        return 0;
    }
  });

  const userSkillsLower = userSkills.map(s => s.toLowerCase());

  return (
    <Box>
      {/* Search Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Search Jobs
            </Typography>
            <IconButton size="small">
              {filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={filtersExpanded}>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Keywords / Skills"
                    value={filters.keywords}
                    onChange={e => updateFilter('keywords', e.target.value)}
                    placeholder="e.g. React, Python, Product Manager"
                    size="small"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={filters.location}
                    onChange={e => updateFilter('location', e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    size="small"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <ToggleButtonGroup
                    value={filters.remote}
                    exclusive
                    onChange={(_, value) => value && updateFilter('remote', value)}
                    size="small"
                    fullWidth
                  >
                    <ToggleButton value="any">Any</ToggleButton>
                    <ToggleButton value="remote">Remote</ToggleButton>
                    <ToggleButton value="onsite">On-site</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      value={filters.jobType}
                      label="Job Type"
                      onChange={e => updateFilter('jobType', e.target.value as JobSearchFilters['jobType'])}
                    >
                      <MenuItem value="any">Any</MenuItem>
                      <MenuItem value="fulltime">Full-time</MenuItem>
                      <MenuItem value="parttime">Part-time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="internship">Internship</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth
                    label="Salary Min"
                    value={filters.salaryMin}
                    onChange={e => updateFilter('salaryMin', e.target.value)}
                    placeholder="e.g. 100000"
                    size="small"
                    type="number"
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth
                    label="Salary Max"
                    value={filters.salaryMax}
                    onChange={e => updateFilter('salaryMax', e.target.value)}
                    placeholder="e.g. 200000"
                    size="small"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Posted Within</InputLabel>
                    <Select
                      value={filters.hoursOld}
                      label="Posted Within"
                      onChange={e => updateFilter('hoursOld', e.target.value as number)}
                    >
                      <MenuItem value={24}>24 hours</MenuItem>
                      <MenuItem value={72}>3 days</MenuItem>
                      <MenuItem value={168}>1 week</MenuItem>
                      <MenuItem value={720}>30 days</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Results</InputLabel>
                    <Select
                      value={filters.resultsWanted}
                      label="Results"
                      onChange={e => updateFilter('resultsWanted', e.target.value as number)}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={20}>20</MenuItem>
                      <MenuItem value={30}>30</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Site Selection */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Search on:
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {AVAILABLE_SITES.map(site => (
                    <Chip
                      key={site.id}
                      label={site.label}
                      size="small"
                      color={filters.siteNames.includes(site.id) ? 'primary' : 'default'}
                      variant={filters.siteNames.includes(site.id) ? 'filled' : 'outlined'}
                      onClick={() => toggleSite(site.id)}
                    />
                  ))}
                </Stack>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  disabled={loading || !filters.keywords.trim()}
                  sx={{ textTransform: 'none' }}
                >
                  {loading ? 'Searching...' : 'Search Jobs'}
                </Button>
                <Button
                  variant="text"
                  onClick={() => setFilters({ ...DEFAULT_SEARCH_FILTERS, keywords: userSkills.slice(0, 3).join(', ') })}
                  sx={{ textTransform: 'none' }}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {!hasResume && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Add your resume in the "My Resume" tab first to enable resume customization when adding jobs.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Results Section */}
      {loading && (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="80%" height={28} sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="50%" height={20} />
                  <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
                  <Skeleton variant="rectangular" height={32} sx={{ mt: 2 }} width="50%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && visibleResults.length > 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {visibleResults.length} job{visibleResults.length !== 1 ? 's' : ''} found
              {rejectedJobs.size > 0 && ` (${results.length - visibleResults.length} hidden)`}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <SortIcon fontSize="small" color="action" />
              <ToggleButtonGroup
                value={sortBy}
                exclusive
                onChange={(_, value) => value && setSortBy(value)}
                size="small"
              >
                <ToggleButton value="date" sx={{ textTransform: 'none', px: 1.5, py: 0.25 }}>Date</ToggleButton>
                <ToggleButton value="salary" sx={{ textTransform: 'none', px: 1.5, py: 0.25 }}>Salary</ToggleButton>
                <ToggleButton value="company" sx={{ textTransform: 'none', px: 1.5, py: 0.25 }}>Company</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Box>

          <Grid container spacing={2}>
            {sortedResults.map(result => (
              <Grid item xs={12} md={6} lg={4} key={result.id}>
                <JobSearchResultCard
                  result={result}
                  userSkills={userSkills}
                  isAdded={addedJobs.has(result.id)}
                  onSelect={() => setSelectedJob(result)}
                  onAdd={() => handleAddJob(result)}
                  onReject={() => handleReject(result.id)}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {!loading && hasSearched && visibleResults.length === 0 && results.length > 0 && !error && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            All results hidden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You've dismissed all {results.length} results. Try a new search or adjust filters.
          </Typography>
        </Card>
      )}

      {!loading && hasSearched && results.length === 0 && !error && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No jobs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search keywords, location, or filters.
          </Typography>
        </Card>
      )}

      {!hasSearched && !loading && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Search for jobs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter keywords and filters above to find jobs matching your skills.
          </Typography>
        </Card>
      )}

      {/* Job Detail Dialog */}
      <Dialog
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedJob && (
          <>
            <DialogTitle sx={{ pr: 6, fontWeight: 600 }}>
              {selectedJob.title}
              <Typography variant="body2" color="text.secondary">
                {selectedJob.company}
                {selectedJob.location && ` | ${selectedJob.location}`}
              </Typography>
              <IconButton
                onClick={() => setSelectedJob(null)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                {selectedJob.isRemote && <Chip label="Remote" size="small" color="info" />}
                {selectedJob.jobType && <Chip label={selectedJob.jobType} size="small" />}
                {selectedJob.salary.display && (
                  <Chip icon={<AttachMoneyIcon />} label={selectedJob.salary.display} size="small" color="success" variant="outlined" />
                )}
                {selectedJob.location && (
                  <Chip icon={<LocationOnIcon />} label={selectedJob.location} size="small" variant="outlined" />
                )}
                <Chip label={selectedJob.source} size="small" variant="outlined" />
                {selectedJob.datePosted && (
                  <Chip label={`Posted: ${new Date(selectedJob.datePosted).toLocaleDateString()}`} size="small" variant="outlined" />
                )}
              </Stack>

              {selectedJob.companyInfo.industry && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Company Info</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedJob.companyInfo.industry}
                    {selectedJob.companyInfo.numEmployees && ` | ${selectedJob.companyInfo.numEmployees} employees`}
                    {selectedJob.companyInfo.revenue && ` | Revenue: ${selectedJob.companyInfo.revenue}`}
                  </Typography>
                </Box>
              )}

              {selectedJob.skills.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Skills</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {selectedJob.skills.map(skill => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        color={userSkillsLower.includes(skill.toLowerCase()) ? 'primary' : 'default'}
                        variant={userSkillsLower.includes(skill.toLowerCase()) ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>Description</Typography>
              {selectedJob.description ? (
                <Box
                  sx={{
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                    color: 'text.secondary',
                    '& p': { mt: 0, mb: 1 },
                    '& ul': { pl: 2.5, mb: 1, mt: 0, listStyleType: 'disc' },
                    '& li': { mb: 0, pb: 0.25 },
                    '& strong': { color: 'text.primary' },
                    '& br + br': { display: 'none' },
                  }}
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(selectedJob.description) }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No description available.
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              {selectedJob.url && (
                <Button
                  startIcon={<OpenInNewIcon />}
                  onClick={() => window.open(selectedJob.url, '_blank', 'noopener')}
                  sx={{ textTransform: 'none' }}
                >
                  Open Original
                </Button>
              )}
              <Button
                variant={addedJobs.has(selectedJob.id) ? 'outlined' : 'contained'}
                startIcon={addedJobs.has(selectedJob.id) ? <CheckIcon /> : <AddIcon />}
                disabled={addedJobs.has(selectedJob.id)}
                onClick={() => handleAddJob(selectedJob)}
                sx={{ textTransform: 'none' }}
              >
                {addedJobs.has(selectedJob.id) ? 'Added to Applications' : 'Add to Applications'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
