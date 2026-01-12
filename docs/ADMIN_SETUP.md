# Organization Admin Setup

This guide documents the organization-level configuration for the agentic coding workflow. These are one-time setup steps that enable all Rippl repositories to use Claude Code with GitHub Actions, Jira, and Slack integration.

**Audience:** GitHub org admins, IT administrators

---

## Overview

The agentic coding workflow uses organization-level configuration so individual repositories don't need per-repo setup. This includes:

- **GitHub org secrets** — API keys and tokens shared across all repos
- **Claude GitHub App** — Installed org-wide for @claude PR reviews
- **Jira service account** — Dedicated account for automation
- **Slack webhook** — Notifications channel

---

## GitHub Organization Secrets

**Location:** github.com/ripplcare → Settings → Secrets and variables → Actions

### Required Secrets

| Secret | Description | Source |
|--------|-------------|--------|
| `ANTHROPIC_API_KEY` | Claude API key for GitHub Actions | console.anthropic.com |
| `JIRA_API_TOKEN` | Jira service account OAuth token | admin.atlassian.com |
| `JIRA_EMAIL` | Jira service account email | Service account you created |
| `JIRA_SERVER` | Jira instance URL | `https://ripplcare.atlassian.net` |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook | api.slack.com/apps |

### Adding/Updating Secrets

1. Go to github.com/ripplcare
2. Settings → Secrets and variables → Actions
3. Click "New organization secret" (or "Update" for existing)
4. Set **Repository access** to "All repositories"

### Verifying Secrets

To check if secrets are configured:
1. Go to any repo → Settings → Secrets and variables → Actions
2. Organization secrets should appear in the list

---

## Claude GitHub App

**Purpose:** Enables `@claude` mentions in PR comments to trigger Claude Code in GitHub Actions.

### Installation

1. Go to github.com/apps/claude
2. Click "Install"
3. Select the **ripplcare** organization
4. Choose "All repositories"

### Verifying Installation

1. Go to github.com/ripplcare → Settings → GitHub Apps
2. "Claude" should appear in the list

### Troubleshooting

If `@claude` mentions aren't working:
- Verify the app is installed on the specific repo
- Check that the `claude.yml` workflow exists in the repo's `.github/workflows/`
- Review Actions logs for the workflow run

---

## Jira Service Account

**Purpose:** A dedicated Jira account for automation, so GitHub Actions can read/update tickets without using individual developer credentials.

### Account Setup

1. Create a new Atlassian account for the service (e.g., `claude-automation@rippl.com`)
2. Add the account to your Jira instance
3. Grant appropriate project access (see below)

### API Token (OAuth 2.0 with Scopes)

Created at admin.atlassian.com:

1. Go to admin.atlassian.com
2. Settings → API keys (or Service accounts)
3. Create a new token for the service account
4. Required scopes:
   - `read:jira-work` — Read issues, projects, statuses
   - `write:jira-work` — Create/edit issues, transition statuses

### Project Access

The service account needs access to each Jira project it will interact with:

1. Go to each project → Project Settings → People
2. Add the service account email
3. Assign "Developer" role (or equivalent with create/edit/transition permissions)

### Token Rotation

When rotating the Jira token:
1. Create a new token at admin.atlassian.com
2. Update the `JIRA_API_TOKEN` GitHub org secret
3. Revoke the old token

---

## Slack Webhook

**Purpose:** Sends notifications to a Slack channel for PR activity and Claude events.

### Creating the Webhook

1. Go to api.slack.com/apps
2. Create New App → From scratch
3. Name: "Rippl Claude Bot" (or similar)
4. Select your Slack workspace
5. Go to "Incoming Webhooks" → Turn On
6. Click "Add New Webhook to Workspace"
7. Select the target channel (e.g., `#engineering-notifications`)
8. Copy the webhook URL

### Updating the Channel

To change which channel receives notifications:
1. Go to api.slack.com/apps → Your app
2. Incoming Webhooks → Add New Webhook to Workspace
3. Select the new channel
4. Update the `SLACK_WEBHOOK_URL` GitHub org secret with the new URL

### Notification Events

The following events trigger Slack notifications:
- PR created
- PR merged
- Review submitted
- `@claude` triggered in a PR
- `@claude` finished (success/failure)

---

## Maintenance Tasks

### Rotating API Keys

| Secret | Rotation Steps |
|--------|----------------|
| `ANTHROPIC_API_KEY` | Generate new key at console.anthropic.com → Update org secret → Revoke old key |
| `JIRA_API_TOKEN` | Create new token at admin.atlassian.com → Update org secret → Revoke old token |
| `SLACK_WEBHOOK_URL` | Create new webhook in Slack app → Update org secret |

### Adding New Repositories

New repos automatically get access to org secrets and the Claude GitHub App. To enable the workflow:

1. Developer runs `/adopt` in the repo
2. Claude creates the necessary workflow files
3. Done — no admin action needed

### Removing Access

To disable the workflow for a specific repo:
1. Delete the `.github/workflows/claude.yml` and related workflow files
2. Or: Change org secrets to "Selected repositories" and exclude the repo

---

## Troubleshooting

### GitHub Actions failing with "secret not found"

- Verify the secret exists at org level: github.com/ripplcare → Settings → Secrets
- Check repository access is set to "All repositories"
- Ensure the workflow file references the correct secret name

### @claude not responding to PR comments

1. Check Claude GitHub App is installed: github.com/ripplcare → Settings → GitHub Apps
2. Verify `claude.yml` workflow exists in the repo
3. Check Actions tab for workflow runs and errors
4. Ensure the comment contains exactly `@claude` (case-sensitive)

### Jira commands failing

1. Verify `JIRA_API_TOKEN` is valid (tokens can expire)
2. Check service account has access to the specific project
3. Verify `JIRA_SERVER` URL is correct
4. Test locally: `jira project list` should work with the same credentials

### Slack notifications not appearing

1. Verify `SLACK_WEBHOOK_URL` is correct
2. Check the Slack app is still installed in your workspace
3. Verify the channel still exists
4. Check webhook hasn't been revoked in Slack app settings

---

## Security Considerations

- **API tokens** are sensitive — treat them like passwords
- **Rotate tokens** periodically (quarterly recommended)
- **Service accounts** should have minimal required permissions
- **Audit access** — periodically review which repos have access to org secrets
- **Webhook URLs** can be used to post to your Slack — keep them secret

---

## Quick Reference

| Resource | URL |
|----------|-----|
| GitHub org settings | github.com/ripplcare/settings |
| GitHub org secrets | github.com/organizations/ripplcare/settings/secrets/actions |
| Claude GitHub App | github.com/apps/claude |
| Anthropic Console | console.anthropic.com |
| Atlassian Admin | admin.atlassian.com |
| Atlassian API Tokens | id.atlassian.com/manage-profile/security/api-tokens |
| Slack Apps | api.slack.com/apps |
