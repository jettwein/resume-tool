import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tabs,
  Tab,
  Stack,
  Chip,
  LinearProgress,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Select,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import HtmlIcon from '@mui/icons-material/Html';
import DownloadIcon from '@mui/icons-material/Download';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Application, JobPosting, ExportFormat, ApplicationStage, Activity } from '../types';
import { ApplicationCard } from './ApplicationCard';
import { ResearchPanel } from './ResearchPanel';
import { ActivityTimeline } from './ActivityTimeline';
import { refineResume } from '../services/api';
import { exportResume, getAvailableFormats } from '../services/export';
import { stageConfig, stageOrder } from '../utils/stages';

interface ApplicationListProps {
  applications: Application[];
  masterResume: string | null;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onReprocess: (id: string) => void;
  onDownload: (app: Application) => void;
  onUpdateJob: (id: string, updates: Partial<Pick<JobPosting, 'title' | 'company' | 'salaryRange'>>) => void;
  onUpdateResume: (id: string, resume: string) => void;
  onSetStage: (id: string, stage: ApplicationStage) => void;
  onAddActivity: (id: string, activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  onDeleteActivity: (appId: string, activityId: string) => void;
}

type SortField = 'company' | 'title' | 'stage' | 'matchScore' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

export function ApplicationList({
  applications,
  masterResume,
  onDelete,
  onArchive,
  onReprocess,
  onDownload,
  onUpdateJob,
  onUpdateResume,
  onSetStage,
  onAddActivity,
  onDeleteActivity,
}: ApplicationListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [viewMode, setViewMode] = useState<'resume' | 'research' | 'edit' | 'jobPosting' | 'timeline' | null>(null);
  const [resumeTab, setResumeTab] = useState(0);

  // Sort state for table view
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editSalary, setEditSalary] = useState('');

  // Refinement state
  const [refinementRequest, setRefinementRequest] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinementError, setRefinementError] = useState<string | null>(null);
  const [lastChangesSummary, setLastChangesSummary] = useState<string | null>(null);

  // Export menu state
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const formatIcons: Record<ExportFormat, React.ReactNode> = {
    pdf: <PictureAsPdfIcon fontSize="small" />,
    docx: <DescriptionIcon fontSize="small" />,
    markdown: <CodeIcon fontSize="small" />,
    html: <HtmlIcon fontSize="small" />,
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch =
      app.jobPosting.title.toLowerCase().includes(search.toLowerCase()) ||
      app.jobPosting.company.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && app.status !== 'archived') ||
      (filter === 'archived' && app.status === 'archived');

    return matchesSearch && matchesFilter;
  });

  // Sort applications for table view
  const sortedApps = [...filteredApps].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'company':
        comparison = a.jobPosting.company.localeCompare(b.jobPosting.company);
        break;
      case 'title':
        comparison = a.jobPosting.title.localeCompare(b.jobPosting.title);
        break;
      case 'stage':
        comparison = stageOrder.indexOf(a.stage || 'not_applied') - stageOrder.indexOf(b.stage || 'not_applied');
        break;
      case 'matchScore':
        comparison = (a.matchScore || 0) - (b.matchScore || 0);
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewResume = (app: Application) => {
    setSelectedApp(app);
    setViewMode('resume');
  };

  const handleViewResearch = (app: Application) => {
    setSelectedApp(app);
    setViewMode('research');
  };

  const handleEdit = (app: Application) => {
    setSelectedApp(app);
    setEditTitle(app.jobPosting.title);
    setEditCompany(app.jobPosting.company);
    setEditSalary(app.jobPosting.salaryRange || '');
    setViewMode('edit');
  };

  const handleViewJobPosting = (app: Application) => {
    setSelectedApp(app);
    setViewMode('jobPosting');
  };

  const handleViewTimeline = (app: Application) => {
    setSelectedApp(app);
    setViewMode('timeline');
  };

  const handleSaveEdit = () => {
    if (selectedApp) {
      onUpdateJob(selectedApp.id, {
        title: editTitle,
        company: editCompany,
        salaryRange: editSalary || null,
      });
    }
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setSelectedApp(null);
    setViewMode(null);
    setResumeTab(0);
    setRefinementRequest('');
    setRefinementError(null);
    setLastChangesSummary(null);
    setExportAnchorEl(null);
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExport = async (format: ExportFormat) => {
    if (!selectedApp?.structuredResume) {
      handleExportClose();
      onDownload(selectedApp!);
      return;
    }

    setIsExporting(true);
    try {
      await exportResume(selectedApp.structuredResume, format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      handleExportClose();
    }
  };

  const handleRefineResume = async () => {
    if (!selectedApp || !refinementRequest.trim() || !selectedApp.customizedResume) return;

    setIsRefining(true);
    setRefinementError(null);

    try {
      const result = await refineResume(
        selectedApp.customizedResume,
        masterResume,
        selectedApp.jobPosting,
        refinementRequest.trim()
      );

      onUpdateResume(selectedApp.id, result.updatedResume);
      setLastChangesSummary(result.changesSummary);
      setRefinementRequest('');

      setSelectedApp({
        ...selectedApp,
        customizedResume: result.updatedResume,
      });
    } catch (error) {
      setRefinementError(error instanceof Error ? error.message : 'Failed to refine resume');
    } finally {
      setIsRefining(false);
    }
  };

  const handleStageChange = (appId: string, event: SelectChangeEvent<ApplicationStage>) => {
    onSetStage(appId, event.target.value as ApplicationStage);
  };

  const getMatchColor = (score: number | null): 'success' | 'warning' | 'error' | 'info' => {
    if (score === null) return 'info';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getLastActivity = (app: Application): string => {
    if (!app.activities || app.activities.length === 0) return '-';
    const sorted = [...app.activities].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return new Date(sorted[0].date).toLocaleDateString();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Applications
        </Typography>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={(_, value) => value && setViewType(value)}
          size="small"
        >
          <ToggleButton value="cards">
            <ViewModuleIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="table">
            <ViewListIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by title or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, value) => value && setFilter(value)}
          size="small"
        >
          <ToggleButton value="active">Active</ToggleButton>
          <ToggleButton value="archived">Archived</ToggleButton>
          <ToggleButton value="all">All</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {filteredApps.length === 0 ? (
        <Alert severity="info">
          {applications.length === 0
            ? 'No applications yet. Add a job posting to get started!'
            : 'No applications match your search.'}
        </Alert>
      ) : viewType === 'cards' ? (
        <Grid container spacing={2}>
          {filteredApps.map(app => (
            <Grid item xs={12} sm={6} md={4} key={app.id}>
              <ApplicationCard
                application={app}
                onViewResume={() => handleViewResume(app)}
                onViewResearch={() => handleViewResearch(app)}
                onViewJobPosting={() => handleViewJobPosting(app)}
                onViewTimeline={() => handleViewTimeline(app)}
                onDelete={() => onDelete(app.id)}
                onArchive={() => onArchive(app.id)}
                onReprocess={() => onReprocess(app.id)}
                onDownload={() => onDownload(app)}
                onEdit={() => handleEdit(app)}
                onStageChange={(stage) => onSetStage(app.id, stage)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'company'}
                    direction={sortField === 'company' ? sortDirection : 'asc'}
                    onClick={() => handleSort('company')}
                  >
                    Company
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'title'}
                    direction={sortField === 'title' ? sortDirection : 'asc'}
                    onClick={() => handleSort('title')}
                  >
                    Title
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'stage'}
                    direction={sortField === 'stage' ? sortDirection : 'asc'}
                    onClick={() => handleSort('stage')}
                  >
                    Stage
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'matchScore'}
                    direction={sortField === 'matchScore' ? sortDirection : 'asc'}
                    onClick={() => handleSort('matchScore')}
                  >
                    Match
                  </TableSortLabel>
                </TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'updatedAt'}
                    direction={sortField === 'updatedAt' ? sortDirection : 'asc'}
                    onClick={() => handleSort('updatedAt')}
                  >
                    Updated
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedApps.map(app => (
                <TableRow key={app.id} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                      onClick={() => handleViewJobPosting(app)}
                    >
                      {app.jobPosting.company}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{app.jobPosting.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={app.stage || 'not_applied'}
                        onChange={(e) => handleStageChange(app.id, e)}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {stageOrder.map(stage => (
                          <MenuItem key={stage} value={stage} sx={{ fontSize: '0.75rem' }}>
                            {stageConfig[stage].label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {app.matchScore !== null ? (
                      <Chip
                        label={`${app.matchScore}%`}
                        size="small"
                        color={getMatchColor(app.matchScore)}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{getLastActivity(app)}</TableCell>
                  <TableCell>
                    {new Date(app.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleViewTimeline(app)}>
                      <TimelineIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleViewResume(app)} disabled={!app.customizedResume}>
                      <DescriptionIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Resume Dialog */}
      <Dialog
        open={viewMode === 'resume' && !!selectedApp}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
          <Box>
            <Typography variant="h6">Customized Resume</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedApp?.jobPosting.title} at {selectedApp?.jobPosting.company}
            </Typography>
            {selectedApp?.matchScore !== null && selectedApp?.matchScore !== undefined && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={`${selectedApp.matchScore}% Match`}
                  color={getMatchColor(selectedApp.matchScore)}
                  size="small"
                />
              </Box>
            )}
          </Box>
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={resumeTab} onChange={(_, v) => setResumeTab(v)}>
            <Tab label="Resume" />
            <Tab label="Customization Summary" />
            <Tab label="Match Analysis" />
          </Tabs>
        </Box>
        <DialogContent dividers>
          {resumeTab === 0 ? (
            <Box>
              <Box
                sx={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  mb: 3,
                }}
              >
                {selectedApp?.customizedResume || 'No customized resume available.'}
              </Box>

              {selectedApp?.customizedResume && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Request Changes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Describe what changes you'd like made to the resume above.
                  </Typography>

                  {lastChangesSummary && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">{lastChangesSummary}</Typography>
                    </Alert>
                  )}

                  {refinementError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {refinementError}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g., Make the summary more concise..."
                      value={refinementRequest}
                      onChange={(e) => setRefinementRequest(e.target.value)}
                      disabled={isRefining}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleRefineResume();
                        }
                      }}
                      multiline
                      maxRows={3}
                    />
                    <Button
                      variant="contained"
                      onClick={handleRefineResume}
                      disabled={isRefining || !refinementRequest.trim()}
                      sx={{ minWidth: 100 }}
                    >
                      {isRefining ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          ) : resumeTab === 1 ? (
            <Box sx={{ lineHeight: 1.8 }}>
              {selectedApp?.customizationSummary ? (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedApp.customizationSummary}
                </Typography>
              ) : (
                <Typography color="text.secondary">No customization summary available.</Typography>
              )}
            </Box>
          ) : (
            <Box>
              {selectedApp?.matchScore !== null && selectedApp?.matchScore !== undefined ? (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>Match Score</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={selectedApp.matchScore}
                        color={getMatchColor(selectedApp.matchScore)}
                        sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="h6" fontWeight={600}>
                        {selectedApp.matchScore}%
                      </Typography>
                    </Box>
                  </Box>
                  {selectedApp.matchAnalysis && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Analysis</Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                        {selectedApp.matchAnalysis}
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Typography color="text.secondary">
                  No match analysis available.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedApp?.customizedResume && (
            <>
              <Button
                variant="contained"
                onClick={handleExportClick}
                disabled={isExporting}
                startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
              >
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
              <Menu
                anchorEl={exportAnchorEl}
                open={Boolean(exportAnchorEl)}
                onClose={handleExportClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                {selectedApp?.structuredResume ? (
                  getAvailableFormats().map(({ format, label }) => (
                    <MenuItem key={format} onClick={() => handleExport(format)}>
                      <ListItemIcon>{formatIcons[format]}</ListItemIcon>
                      <ListItemText>{label}</ListItemText>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem onClick={() => onDownload(selectedApp!)}>
                    <ListItemIcon><DescriptionIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Download All (ZIP)</ListItemText>
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Timeline Dialog */}
      <Dialog
        open={viewMode === 'timeline' && !!selectedApp}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">Activity Timeline</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedApp?.jobPosting.title} at {selectedApp?.jobPosting.company}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedApp && (
            <ActivityTimeline
              activities={selectedApp.activities || []}
              onAddActivity={(activity) => onAddActivity(selectedApp.id, activity)}
              onDeleteActivity={(activityId) => onDeleteActivity(selectedApp.id, activityId)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={viewMode === 'edit' && !!selectedApp}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Job Details</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Job Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              fullWidth
            />
            <TextField
              label="Company"
              value={editCompany}
              onChange={(e) => setEditCompany(e.target.value)}
              fullWidth
            />
            <TextField
              label="Salary Range"
              value={editSalary}
              onChange={(e) => setEditSalary(e.target.value)}
              fullWidth
              placeholder="e.g., $150,000 - $180,000"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={!editTitle.trim() || !editCompany.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Research Dialog */}
      <Dialog
        open={viewMode === 'research' && !!selectedApp}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">Company Research</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedApp?.jobPosting.company}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedApp?.research ? (
            <ResearchPanel research={selectedApp.research} />
          ) : (
            <Typography color="text.secondary">No research available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Job Posting Dialog */}
      <Dialog
        open={viewMode === 'jobPosting' && !!selectedApp}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">{selectedApp?.jobPosting.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedApp?.jobPosting.company}
              {selectedApp?.jobPosting.salaryRange && ` • ${selectedApp.jobPosting.salaryRange}`}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedApp?.jobPosting.sourceUrl && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Source:{' '}
                <a href={selectedApp.jobPosting.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {selectedApp.jobPosting.sourceUrl}
                </a>
              </Typography>
            </Box>
          )}
          <Box sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: 1.7 }}>
            {selectedApp?.jobPosting.rawText || selectedApp?.jobPosting.description || 'No job posting text available.'}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
