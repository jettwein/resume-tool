import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import PhoneIcon from '@mui/icons-material/Phone';
import GroupsIcon from '@mui/icons-material/Groups';
import MailIcon from '@mui/icons-material/Mail';
import InboxIcon from '@mui/icons-material/Inbox';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CancelIcon from '@mui/icons-material/Cancel';
import NoteIcon from '@mui/icons-material/Note';
import ReplayIcon from '@mui/icons-material/Replay';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Activity, ActivityType } from '../types';
import { activityTypeConfig } from '../utils/stages';

interface ActivityTimelineProps {
  activities: Activity[];
  onAddActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  onDeleteActivity: (activityId: string) => void;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  created: <AddCircleIcon fontSize="small" />,
  applied: <SendIcon fontSize="small" />,
  email_sent: <MailIcon fontSize="small" />,
  email_received: <InboxIcon fontSize="small" />,
  phone_screen: <PhoneIcon fontSize="small" />,
  interview: <GroupsIcon fontSize="small" />,
  follow_up: <ReplayIcon fontSize="small" />,
  offer: <CelebrationIcon fontSize="small" />,
  rejection: <CancelIcon fontSize="small" />,
  withdrawn: <ExitToAppIcon fontSize="small" />,
  note: <NoteIcon fontSize="small" />,
};

const quickAddTypes: ActivityType[] = ['applied', 'phone_screen', 'interview', 'follow_up', 'offer', 'rejection'];

export function ActivityTimeline({ activities, onAddActivity, onDeleteActivity }: ActivityTimelineProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState<ActivityType>('note');
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleQuickAdd = (type: ActivityType) => {
    const config = activityTypeConfig[type];
    onAddActivity({
      type,
      title: config.label,
      date: new Date().toISOString(),
    });
  };

  const handleAddActivity = () => {
    if (!newTitle.trim()) return;

    onAddActivity({
      type: newType,
      title: newTitle.trim(),
      notes: newNotes.trim() || undefined,
      date: new Date(newDate).toISOString(),
    });

    setNewType('note');
    setNewTitle('');
    setNewNotes('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  const getActivityColor = (type: ActivityType): 'default' | 'primary' | 'success' | 'error' | 'info' | 'warning' => {
    switch (type) {
      case 'offer':
        return 'success';
      case 'rejection':
      case 'withdrawn':
        return 'error';
      case 'interview':
      case 'phone_screen':
        return 'info';
      case 'applied':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Quick Add Buttons */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Quick Add</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {quickAddTypes.map(type => (
            <Button
              key={type}
              size="small"
              variant="outlined"
              startIcon={activityIcons[type]}
              onClick={() => handleQuickAdd(type)}
            >
              {activityTypeConfig[type].label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Custom Add Form */}
      {showAddForm ? (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Add Custom Activity</Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newType}
                  label="Type"
                  onChange={(e) => setNewType(e.target.value as ActivityType)}
                >
                  {Object.entries(activityTypeConfig).map(([type, config]) => (
                    <MenuItem key={type} value={type}>
                      {config.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                type="date"
                label="Date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              size="small"
              label="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              fullWidth
              placeholder="e.g., Phone screen with hiring manager"
            />
            <TextField
              size="small"
              label="Notes (optional)"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Any additional notes..."
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleAddActivity}
                disabled={!newTitle.trim()}
              >
                Add
              </Button>
            </Box>
          </Stack>
        </Paper>
      ) : (
        <Button
          startIcon={<AddIcon />}
          onClick={() => setShowAddForm(true)}
          sx={{ mb: 3 }}
        >
          Add Custom Activity
        </Button>
      )}

      {/* Timeline */}
      <Box>
        {sortedActivities.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No activities yet. Add one above!
          </Typography>
        ) : (
          <Stack spacing={2}>
            {sortedActivities.map((activity) => (
              <Paper
                key={activity.id}
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'action.hover',
                    flexShrink: 0,
                  }}
                >
                  {activityIcons[activity.type]}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2">{activity.title}</Typography>
                    <Chip
                      label={activityTypeConfig[activity.type].label}
                      size="small"
                      color={getActivityColor(activity.type)}
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Typography>
                  {activity.notes && (
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      {activity.notes}
                    </Typography>
                  )}
                </Box>
                {activity.type !== 'created' && (
                  <IconButton
                    size="small"
                    onClick={() => onDeleteActivity(activity.id)}
                    sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
