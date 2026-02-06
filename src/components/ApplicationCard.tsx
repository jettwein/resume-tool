import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Stack,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Select,
  FormControl,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import WorkIcon from '@mui/icons-material/Work';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CodeIcon from '@mui/icons-material/Code';
import HtmlIcon from '@mui/icons-material/Html';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useState } from 'react';
import { Application, ExportFormat, ApplicationStage } from '../types';
import { exportResume, getAvailableFormats } from '../services/export';
import { stageConfig, stageOrder } from '../utils/stages';

interface ApplicationCardProps {
  application: Application;
  onViewResume: () => void;
  onViewResearch: () => void;
  onViewJobPosting: () => void;
  onViewTimeline: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onReprocess: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onStageChange: (stage: ApplicationStage) => void;
}

const statusConfig = {
  pending: { label: 'Pending', color: 'default' as const },
  processing: { label: 'Processing...', color: 'info' as const },
  ready: { label: 'Ready', color: 'success' as const },
  archived: { label: 'Archived', color: 'default' as const },
};

export function ApplicationCard({
  application,
  onViewResume,
  onViewResearch,
  onViewJobPosting,
  onViewTimeline,
  onDelete,
  onArchive,
  onReprocess,
  onDownload,
  onEdit,
  onStageChange,
}: ApplicationCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const open = Boolean(anchorEl);
  const exportOpen = Boolean(exportAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExport = async (format: ExportFormat) => {
    if (!application.structuredResume) {
      handleExportClose();
      onDownload();
      return;
    }

    setIsExporting(true);
    try {
      await exportResume(application.structuredResume, format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      handleExportClose();
    }
  };

  const formatIcons: Record<ExportFormat, React.ReactNode> = {
    pdf: <PictureAsPdfIcon fontSize="small" />,
    docx: <DescriptionIcon fontSize="small" />,
    markdown: <CodeIcon fontSize="small" />,
    html: <HtmlIcon fontSize="small" />,
  };

  const { status, jobPosting, createdAt, stage, matchScore } = application;
  const config = statusConfig[status];
  const currentStage = stage || 'not_applied';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={config.label}
              color={config.color}
              size="small"
            />
            {matchScore !== null && (
              <Chip
                label={`${matchScore}%`}
                size="small"
                color={matchScore >= 80 ? 'success' : matchScore >= 60 ? 'warning' : 'error'}
              />
            )}
          </Box>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography
          variant="h6"
          onClick={onViewJobPosting}
          sx={{
            fontWeight: 600,
            mb: 0.5,
            lineHeight: 1.3,
            cursor: 'pointer',
            '&:hover': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          {jobPosting.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {jobPosting.company}
        </Typography>

        {/* Stage Selector */}
        <FormControl size="small" sx={{ mb: 1, minWidth: 130 }}>
          <Select
            value={currentStage}
            onChange={(e) => onStageChange(e.target.value as ApplicationStage)}
            size="small"
            sx={{ fontSize: '0.75rem' }}
          >
            {stageOrder.map(s => (
              <MenuItem key={s} value={s} sx={{ fontSize: '0.75rem' }}>
                {stageConfig[s].label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {jobPosting.salaryRange && (
          <Chip
            icon={<AttachMoneyIcon />}
            label={jobPosting.salaryRange}
            size="small"
            color="success"
            variant="outlined"
            sx={{ mb: 1, display: 'block', width: 'fit-content' }}
          />
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Added {new Date(createdAt).toLocaleDateString()}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Tooltip title="View Job Posting">
            <IconButton
              size="small"
              onClick={onViewJobPosting}
              color="primary"
            >
              <WorkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Customized Resume">
            <span>
              <IconButton
                size="small"
                onClick={onViewResume}
                disabled={!application.customizedResume}
                color="primary"
              >
                <DescriptionIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="View Company Research">
            <span>
              <IconButton
                size="small"
                onClick={onViewResearch}
                disabled={!application.research}
                color="primary"
              >
                <BusinessIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Activity Timeline">
            <IconButton
              size="small"
              onClick={onViewTimeline}
              color="primary"
            >
              <TimelineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Resume">
            <span>
              <IconButton
                size="small"
                onClick={handleExportClick}
                disabled={!application.customizedResume || isExporting}
                color="primary"
              >
                {isExporting ? <CircularProgress size={18} /> : <DownloadIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Export Format Menu */}
        <Menu
          anchorEl={exportAnchorEl}
          open={exportOpen}
          onClose={handleExportClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          {application.structuredResume ? (
            getAvailableFormats().map(({ format, label }) => (
              <MenuItem key={format} onClick={() => handleExport(format)}>
                <ListItemIcon>{formatIcons[format]}</ListItemIcon>
                <ListItemText>{label}</ListItemText>
              </MenuItem>
            ))
          ) : (
            <MenuItem onClick={() => { onDownload(); handleExportClose(); }}>
              <ListItemIcon><FolderZipIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Download All (ZIP)</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { onEdit(); handleClose(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Details</ListItemText>
        </MenuItem>
        {status !== 'processing' && (
          <MenuItem onClick={() => { onReprocess(); handleClose(); }}>
            <ListItemIcon>
              <RefreshIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Reprocess</ListItemText>
          </MenuItem>
        )}
        {status !== 'archived' && (
          <MenuItem onClick={() => { onArchive(); handleClose(); }}>
            <ListItemIcon>
              <ArchiveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Archive</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { onDelete(); handleClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
}
