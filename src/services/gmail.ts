/**
 * Gmail Integration Service
 *
 * Handles OAuth authentication and email fetching from Gmail API.
 * Uses Google Identity Services for authentication.
 */

import { getItem, setItem } from './storage';

// Gmail API scopes
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

// Storage keys for Gmail
const GMAIL_TOKEN_KEY = 'gmail_access_token';
const GMAIL_EXPIRY_KEY = 'gmail_token_expiry';

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
}

export interface GmailConfig {
  clientId: string;
}

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let gapiInitialized = false;
let gisInitialized = false;

/**
 * Load the Google API scripts
 */
export async function loadGoogleScripts(): Promise<void> {
  // Load GAPI (Google API client)
  if (!window.gapi) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  // Load GIS (Google Identity Services)
  if (!window.google?.accounts) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }
}

/**
 * Initialize the Gmail API client
 */
export async function initializeGmail(clientId: string): Promise<void> {
  await loadGoogleScripts();

  // Initialize GAPI client
  if (!gapiInitialized) {
    await new Promise<void>((resolve) => {
      gapi.load('client', async () => {
        await gapi.client.init({
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
        });
        gapiInitialized = true;
        resolve();
      });
    });
  }

  // Initialize GIS token client
  if (!gisInitialized) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: () => {}, // Will be set during sign-in
    });
    gisInitialized = true;
  }

  // Check for existing token
  const storedToken = getItem<string>(GMAIL_TOKEN_KEY);
  const storedExpiry = getItem<number>(GMAIL_EXPIRY_KEY);

  if (storedToken && storedExpiry && Date.now() < storedExpiry) {
    gapi.client.setToken({ access_token: storedToken });
  }
}

/**
 * Check if user is signed in to Gmail
 */
export function isGmailConnected(): boolean {
  const token = gapi.client.getToken();
  const storedExpiry = getItem<number>(GMAIL_EXPIRY_KEY);
  return !!token && !!storedExpiry && Date.now() < storedExpiry;
}

/**
 * Sign in to Gmail
 */
export function signInToGmail(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Gmail not initialized. Call initializeGmail first.'));
      return;
    }

    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(response.error));
        return;
      }

      // Store token and expiry
      setItem(GMAIL_TOKEN_KEY, response.access_token);
      setItem(GMAIL_EXPIRY_KEY, Date.now() + (response.expires_in * 1000));

      resolve();
    };

    // Check if we need consent or just a token refresh
    if (gapi.client.getToken() === null) {
      // Request consent
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Skip consent for returning users
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
}

/**
 * Sign out from Gmail
 */
export function signOutFromGmail(): void {
  const token = gapi.client.getToken();
  if (token) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken(null);
  }

  // Clear stored tokens
  localStorage.removeItem(GMAIL_TOKEN_KEY);
  localStorage.removeItem(GMAIL_EXPIRY_KEY);
}

/**
 * Search for emails matching company domains or job-related keywords
 */
export async function searchEmails(
  companyDomains: string[],
  keywords: string[] = ['interview', 'application', 'offer', 'position', 'candidate', 'resume'],
  maxResults: number = 50,
  afterDate?: Date
): Promise<GmailMessage[]> {
  if (!isGmailConnected()) {
    throw new Error('Not connected to Gmail');
  }

  // Build search query
  const queryParts: string[] = [];

  // Search by company domains
  if (companyDomains.length > 0) {
    const domainQuery = companyDomains.map(d => `from:${d}`).join(' OR ');
    queryParts.push(`(${domainQuery})`);
  }

  // Add keyword search
  if (keywords.length > 0) {
    const keywordQuery = keywords.map(k => `"${k}"`).join(' OR ');
    queryParts.push(`(${keywordQuery})`);
  }

  // Add date filter
  if (afterDate) {
    const dateStr = afterDate.toISOString().split('T')[0].replace(/-/g, '/');
    queryParts.push(`after:${dateStr}`);
  }

  // Exclude sent mail, drafts, and spam
  queryParts.push('-in:sent -in:drafts -in:spam');

  const query = queryParts.join(' ');

  // Search for messages
  const response = await gapi.client.gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults,
  });

  const messages = response.result.messages || [];

  // Fetch full message details
  const fullMessages: GmailMessage[] = [];

  for (const msg of messages) {
    try {
      const fullMsg = await gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });

      const parsed = parseGmailMessage(fullMsg.result);
      if (parsed) {
        fullMessages.push(parsed);
      }
    } catch (error) {
      console.error('Failed to fetch message:', msg.id, error);
    }
  }

  return fullMessages;
}

/**
 * Parse a Gmail API message into our format
 */
function parseGmailMessage(message: gapi.client.gmail.Message): GmailMessage | null {
  const headers = message.payload?.headers || [];

  const getHeader = (name: string): string => {
    const header = headers.find(h => h.name?.toLowerCase() === name.toLowerCase());
    return header?.value || '';
  };

  const subject = getHeader('Subject');
  const from = getHeader('From');
  const to = getHeader('To');
  const date = getHeader('Date');

  // Extract body
  let body = '';

  if (message.payload?.body?.data) {
    body = decodeBase64(message.payload.body.data);
  } else if (message.payload?.parts) {
    // Look for text/plain or text/html part
    const textPart = message.payload.parts.find(
      p => p.mimeType === 'text/plain' || p.mimeType === 'text/html'
    );
    if (textPart?.body?.data) {
      body = decodeBase64(textPart.body.data);
    }
  }

  // Strip HTML if present
  if (body.includes('<html') || body.includes('<body')) {
    body = stripHtml(body);
  }

  return {
    id: message.id || '',
    threadId: message.threadId || '',
    snippet: message.snippet || '',
    subject,
    from,
    to,
    date,
    body: body.substring(0, 5000), // Limit body size
  };
}

/**
 * Decode base64url encoded string
 */
function decodeBase64(data: string): string {
  // Replace URL-safe characters
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return atob(base64);
  }
}

/**
 * Strip HTML tags from a string
 */
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

/**
 * Get company domains from applications
 */
export function extractCompanyDomains(companies: string[]): string[] {
  const domains: string[] = [];

  for (const company of companies) {
    // Try to create a domain from company name
    const slug = company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .substring(0, 30);

    if (slug) {
      domains.push(`@${slug}.com`);
      domains.push(`@${slug}.io`);
      domains.push(`@${slug}.co`);
    }
  }

  return [...new Set(domains)];
}

// TypeScript declarations for Google APIs
declare global {
  interface Window {
    gapi: typeof gapi;
    google: typeof google;
  }
}
