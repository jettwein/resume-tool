# Project Setup Wizard

Interactive setup for configuring your project integrations.

## Instructions

You are helping the user configure their project. Guide them through each integration step by step.

### Step 1: Welcome and Discovery

First, welcome the user and check the current state:

```bash
echo "Checking current configuration..."
```

Check what's already configured:
- Does `CLAUDE.md` exist and have project-specific content?
- Is this a git repository?
- Is jira-cli installed? (`which jira`)
- Does `.github/workflows/` have workflow files?

Report what you find, then ask:

**"Which integrations would you like to set up?"**

Present these options:
1. **Jira** — Ticket management (`/jira-task`, `/init-project`, `/implement-all`)
2. **GitHub Actions** — @claude PR reviews, automatic code review
3. **Slack** — PR and Claude activity notifications
4. **Vercel** — Preview deployments for PRs
5. **None** — Just use basic commands (`/new-feature`, `/review`)

Let the user select multiple options (e.g., "1 and 2" or "all" or "none").

---

### Step 2: Configure Selected Integrations

For each selected integration, walk through the setup:

#### If Jira selected:

1. Check if jira-cli is installed:
   ```bash
   which jira
   ```

2. If not installed, provide instructions:
   ```
   Install jira-cli:
   brew install ankitpokhrel/jira-cli/jira-cli
   ```

3. Check if already configured:
   ```bash
   jira project list 2>/dev/null | head -5
   ```

4. If not configured, guide them:
   - Create API token at https://id.atlassian.com/manage-profile/security/api-tokens
   - Add to shell: `export JIRA_API_TOKEN="your-token"`
   - Run: `jira init --installation cloud --server https://COMPANY.atlassian.net --login EMAIL`

5. Ask for their Jira project key (e.g., `PROJ`, `ACME`) and note it for later.

#### If GitHub Actions selected:

1. Check if this is a GitHub repo:
   ```bash
   git remote get-url origin 2>/dev/null
   ```

2. Explain the required secrets:
   ```
   You'll need to add these secrets in GitHub (Settings → Secrets → Actions):

   Required:
   - ANTHROPIC_API_KEY — Get from console.anthropic.com

   For Jira integration (if using):
   - JIRA_API_TOKEN — Same token from Jira setup
   - JIRA_EMAIL — Your Atlassian login email
   - JIRA_SERVER — e.g., https://yourcompany.atlassian.net

   For Slack (if using):
   - SLACK_WEBHOOK_URL — From Slack app setup
   ```

3. Ask if they want to add secrets now via CLI:
   ```bash
   gh secret set ANTHROPIC_API_KEY
   ```

4. Remind them to install the Claude GitHub App:
   ```
   Install the Claude GitHub App on your repo:
   https://github.com/apps/claude
   ```

#### If Slack selected:

1. Explain the setup:
   ```
   To set up Slack notifications:

   1. Go to https://api.slack.com/apps
   2. Create New App → From scratch
   3. Go to "Incoming Webhooks" → Turn On
   4. Click "Add New Webhook to Workspace"
   5. Select your channel
   6. Copy the webhook URL
   ```

2. If GitHub Actions is also selected, remind them to add `SLACK_WEBHOOK_URL` as a GitHub secret.

3. If GitHub Actions is NOT selected, explain that Slack notifications require GitHub Actions to be enabled.

#### If Vercel selected:

1. Explain the setup:
   ```
   To set up Vercel preview deployments:

   1. Go to vercel.com
   2. Add New Project → Import this repository
   3. Vercel will auto-detect the framework

   If you have private npm dependencies:
   - Go to Settings → Environment Variables
   - Add GITHUB_TOKEN with a token that has read access to private repos
   ```

---

### Step 3: Update CLAUDE.md

Ask the user if they want to customize `CLAUDE.md` with project-specific details:

1. **Project name and description**
2. **Tech stack** (e.g., React, Node.js, Python)
3. **Key conventions** (naming, file structure, patterns)
4. **Jira project key** (if using Jira)

If they say yes, help them update the relevant sections of CLAUDE.md.

---

### Step 4: Summary

Provide a summary of what was configured:

```
## Setup Complete!

### Configured:
✅ Jira integration (project: PROJ)
✅ GitHub Actions (@claude reviews, auto-review)
✅ Slack notifications
⏭️ Vercel (skipped)

### Next steps:
1. Add GitHub secrets: ANTHROPIC_API_KEY, JIRA_API_TOKEN, JIRA_EMAIL, JIRA_SERVER, SLACK_WEBHOOK_URL
2. Install Claude GitHub App: https://github.com/apps/claude
3. Customize CLAUDE.md with your project details

### Commands available:
- /new-feature <desc> — Build a new feature
- /review — Review your changes
- /jira-task PROJ-123 — Implement a Jira ticket
- /init-project PROJ — Generate stories from requirements
```

---

### Step 5: Offer to Disable Unused Workflows

If the user didn't select certain integrations, offer to remove or disable the corresponding workflow files:

- No GitHub Actions? → Offer to delete `.github/workflows/`
- No Slack? → Offer to delete `.github/workflows/slack-notifications.yml`
- No auto-review? → Offer to delete `.github/workflows/auto-review.yml`

Ask before deleting anything:
```
You didn't select Slack. Would you like me to remove the slack-notifications.yml workflow file? (y/n)
```

---

## Important Notes

- Be conversational and helpful
- Explain why each step matters
- If something fails, help troubleshoot
- Don't assume — ask the user if you're unsure
- At the end, make sure they know what commands are available to them
