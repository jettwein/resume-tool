import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SyncIcon from '@mui/icons-material/Sync';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import {
  initializeGmail,
  isGmailConnected,
  signInToGmail,
  signOutFromGmail,
  searchEmails,
  extractCompanyDomains,
  GmailMessage,
} from '../services/gmail';
import { parseEmails, ParsedEmail } from '../services/api';
import { Application, Activity } from '../types';

interface GmailSyncProps {
  applications: Application[];
  onAddActivity: (appId: string, activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  onSetStage: (appId: string, stage: Application['stage']) => void;
}

interface SyncResult {
  email: GmailMessage;
  parsed: ParsedEmail;
  matchedApp: Application | null;
  status: 'matched' | 'unmatched' | 'error';
}

export function GmailSync({ applications, onAddActivity, onSetStage }: GmailSyncProps) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Check if Gmail is already connected
  useEffect(() => {
    const storedClientId = localStorage.getItem('gmail_client_id');
    if (storedClientId) {
      setClientId(storedClientId);
      initializeGmail(storedClientId)
        .then(() => {
          setConnected(isGmailConnected());
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to initialize Gmail:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleConnect = useCallback(async () => {
    if (!clientId) {
      setShowSetup(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      localStorage.setItem('gmail_client_id', clientId);
      await initializeGmail(clientId);
      await signInToGmail();
      setConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Gmail');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const handleDisconnect = useCallback(() => {
    signOutFromGmail();
    setConnected(false);
  }, []);

  const handleSaveClientId = useCallback(() => {
    localStorage.setItem('gmail_client_id', clientId);
    setShowSetup(false);
    handleConnect();
  }, [clientId, handleConnect]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setError(null);
    setSyncResults([]);

    try {
      // Get company names from applications
      const companies = applications.map((app) => app.jobPosting.company);
      const domains = extractCompanyDomains(companies);

      // Search for relevant emails (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const emails = await searchEmails(domains, undefined, 50, thirtyDaysAgo);

      if (emails.length === 0) {
        setSyncResults([]);
        setShowResults(true);
        return;
      }

      // Parse emails using Claude
      const { parsedEmails } = await parseEmails(
        emails.map((e) => ({
          subject: e.subject,
          from: e.from,
          to: e.to,
          date: e.date,
          body: e.body,
          snippet: e.snippet,
        }))
      );

      // Match emails to applications
      const results: SyncResult[] = emails.map((email, index) => {
        const parsed = parsedEmails[index];
        const matchedApp = findMatchingApplication(parsed, applications);

        return {
          email,
          parsed,
          matchedApp,
          status: matchedApp ? 'matched' : 'unmatched',
        };
      });

      setSyncResults(results);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync emails');
    } finally {
      setSyncing(false);
    }
  }, [applications]);

  const handleApplyResult = useCallback(
    (result: SyncResult) => {
      if (!result.matchedApp) return;

      const { parsed, email } = result;
      const appId = result.matchedApp.id;

      // Add activity based on email type
      const activityTypeMap: Record<string, Activity['type']> = {
        application_received: 'applied',
        interview_request: 'interview',
        rejection: 'rejection',
        offer: 'offer',
        follow_up: 'email_received',
        other: 'email_received',
      };

      const activityType = activityTypeMap[parsed.emailType] || 'email_received';

      onAddActivity(appId, {
        type: activityType,
        title: parsed.summary,
        date: email.date,
        notes: `From: ${email.from}\nSubject: ${email.subject}`,
      });

      // Update stage if appropriate
      const stageMap: Record<string, Application['stage']> = {
        interview_request: 'phone_screen',
        rejection: 'rejected',
        offer: 'offer',
      };

      if (stageMap[parsed.emailType]) {
        onSetStage(appId, stageMap[parsed.emailType]);
      }

      // Mark as applied if we didn't update otherwise
      setSyncResults((prev) =>
        prev.map((r) =>
          r === result ? { ...r, status: 'matched' as const } : r
        )
      );
    },
    [onAddActivity, onSetStage]
  );

  const getEmailTypeColor = (type: ParsedEmail['emailType']) => {
    const colors: Record<ParsedEmail['emailType'], 'success' | 'info' | 'warning' | 'error' | 'default'> = {
      application_received: 'info',
      interview_request: 'success',
      rejection: 'error',
      offer: 'success',
      follow_up: 'info',
      other: 'default',
    };
    return colors[type];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <EmailIcon color="primary" />
        <Typography variant="h6">Gmail Integration</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!connected ? (
        <Box>
          <Typography color="text.secondary" paragraph>
            Connect your Gmail account to automatically find and track job-related emails.
          </Typography>
          <Button
            variant="contained"
            startIcon={<EmailIcon />}
            onClick={handleConnect}
            disabled={loading}
          >
            Connect Gmail
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            Requires a Google Cloud OAuth Client ID.{' '}
            <Button size="small" onClick={() => setShowSetup(true)}>
              Configure
            </Button>
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <CheckCircleIcon color="success" fontSize="small" />
            <Typography color="success.main">Gmail connected</Typography>
          </Box>

          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={syncing ? <CircularProgress size={20} /> : <SyncIcon />}
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? 'Syncing...' : 'Sync Emails'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LinkOffIcon />}
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </Box>

          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            Searches for job-related emails from the past 30 days.
          </Typography>
        </Box>
      )}

      {/* Setup Dialog */}
      <Dialog open={showSetup} onClose={() => setShowSetup(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configure Gmail Integration</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            To use Gmail integration, you need to create a Google Cloud OAuth Client ID:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary="1. Go to Google Cloud Console"
                secondary="console.cloud.google.com"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary="2. Create or select a project"
                secondary="Enable the Gmail API"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary="3. Create OAuth credentials"
                secondary="Configure consent screen, then create Web application credentials"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary="4. Add authorized JavaScript origins"
                secondary={window.location.origin}
              />
            </ListItem>
          </List>
          <TextField
            fullWidth
            label="OAuth Client ID"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="123456789-abc123.apps.googleusercontent.com"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSetup(false)}>Cancel</Button>
          <Button onClick={handleSaveClientId} variant="contained" disabled={!clientId}>
            Save & Connect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={showResults} onClose={() => setShowResults(false)} maxWidth="md" fullWidth>
        <DialogTitle>Sync Results</DialogTitle>
        <DialogContent>
          {syncResults.length === 0 ? (
            <Typography color="text.secondary">
              No job-related emails found in the past 30 days.
            </Typography>
          ) : (
            <List>
              {syncResults.map((result, index) => (
                <Box key={result.email.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      py: 2,
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      width="100%"
                      alignItems="center"
                    >
                      <Typography variant="subtitle1" fontWeight="medium">
                        {result.email.subject}
                      </Typography>
                      <Chip
                        label={result.parsed.emailType.replace('_', ' ')}
                        size="small"
                        color={getEmailTypeColor(result.parsed.emailType)}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      From: {result.email.from} | {new Date(result.email.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {result.parsed.summary}
                    </Typography>
                    {result.parsed.company && (
                      <Typography variant="body2" color="text.secondary">
                        Company: {result.parsed.company}
                      </Typography>
                    )}
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      {result.matchedApp ? (
                        <>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography variant="body2" color="success.main">
                            Matched to: {result.matchedApp.jobPosting.title} at{' '}
                            {result.matchedApp.jobPosting.company}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleApplyResult(result)}
                          >
                            Add Activity
                          </Button>
                        </>
                      ) : (
                        <>
                          <WarningIcon color="warning" fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            No matching application found
                          </Typography>
                        </>
                      )}
                    </Box>
                  </ListItem>
                </Box>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResults(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

function findMatchingApplication(
  parsed: ParsedEmail,
  applications: Application[]
): Application | null {
  if (!parsed.company) return null;

  const companyLower = parsed.company.toLowerCase();

  // Try exact match first
  let match = applications.find(
    (app) => app.jobPosting.company.toLowerCase() === companyLower
  );

  if (match) return match;

  // Try partial match
  match = applications.find(
    (app) =>
      app.jobPosting.company.toLowerCase().includes(companyLower) ||
      companyLower.includes(app.jobPosting.company.toLowerCase())
  );

  if (match) return match;

  // Try matching job title if company didn't match
  if (parsed.jobTitle) {
    const titleLower = parsed.jobTitle.toLowerCase();
    match = applications.find(
      (app) =>
        app.jobPosting.title.toLowerCase().includes(titleLower) ||
        titleLower.includes(app.jobPosting.title.toLowerCase())
    );
  }

  return match || null;
}
