# Project Setup Wizard

Interactive setup for configuring your project integrations.

## Instructions

You are helping the user configure their project. This command verifies their environment is ready and helps configure project-specific settings.

### Step 1: Verify Developer Environment

First, check that the developer's environment is properly configured:

```bash
# Check GitHub CLI
gh auth status 2>&1 | head -3

# Check Jira CLI
jira project list 2>&1 | head -3
```

**If either check fails**, tell the user:
```
Your development environment isn't fully configured.
Please follow the setup guide: docs/ONBOARDING.md

Once complete, run /setup again.
```

Stop here if environment checks fail.

**If both checks pass**, continue to Step 2.

---

### Step 2: Check Current Configuration

Check what's already configured in this project:

```bash
# Check for CLAUDE.md
ls CLAUDE.md 2>/dev/null && echo "CLAUDE.md exists"

# Check for workflow files
ls .github/workflows/*.yml 2>/dev/null

# Check git remote
git remote get-url origin 2>/dev/null
```

Report what you find to the user.

---

### Step 3: Ask About Integrations

Ask the user which integrations they want to enable for this project:

**"Which integrations would you like to set up?"**

Present these options:
1. **Jira** — Ticket management (`/jira-task`, `/init-project`, `/implement-all`)
2. **GitHub Actions** — @claude PR reviews, automatic code review
3. **Slack** — PR and Claude activity notifications
4. **All of the above** (Recommended)
5. **None** — Just use basic commands (`/new-feature`, `/review`)

Let the user select multiple options (e.g., "1 and 2" or "all").

---

### Step 4: Verify Org-Level Configuration

Based on their selections, verify the org-level setup is in place.

#### If GitHub Actions selected:

Explain that Rippl uses organization-level secrets:
```
GitHub Actions uses org-level secrets (already configured):
- ANTHROPIC_API_KEY
- JIRA_API_TOKEN, JIRA_EMAIL, JIRA_SERVER
- SLACK_WEBHOOK_URL

No per-repo secret configuration needed.
```

Check if the Claude GitHub App is installed:
```bash
gh api repos/:owner/:repo/installation 2>&1 | head -5
```

If not installed, tell them:
```
The Claude GitHub App needs to be installed on this repo.
This should happen automatically for Rippl repos, but if it's missing,
contact an org admin or install it at: github.com/apps/claude
```

---

### Step 5: Configure Project-Specific Settings

#### If Jira selected:

Ask for the Jira project key:
```
What is the Jira project key for this repo? (e.g., NAV, PROJ, ACME)
This is the prefix for ticket numbers like NAV-123.
```

Store this for updating CLAUDE.md.

---

### Step 6: Update CLAUDE.md

Ask the user if they want to customize `CLAUDE.md` with project-specific details:

1. **Project name and description**
2. **Tech stack** (e.g., React, Node.js, Python)
3. **Key conventions** (naming, file structure, patterns)
4. **Jira project key** (if using Jira)

If they say yes, help them update the relevant sections of CLAUDE.md.

---

### Step 7: Verify Workflow Files

Check if the necessary workflow files exist based on their selections:

```bash
ls .github/workflows/claude.yml 2>/dev/null
ls .github/workflows/auto-review.yml 2>/dev/null
ls .github/workflows/slack-notifications.yml 2>/dev/null
```

If any selected integrations are missing their workflow files, offer to create them or point them to `/adopt` to set up the full workflow.

---

### Step 8: Summary

Provide a summary of the project configuration:

```
## Setup Complete!

### Environment:
✅ GitHub CLI authenticated
✅ Jira CLI configured

### Project Integrations:
✅ Jira (project: PROJ)
✅ GitHub Actions (org secrets configured)
✅ Slack notifications

### Commands available:
- /new-feature <desc> — Build a new feature
- /review — Review your changes
- /jira-task PROJ-123 — Implement a Jira ticket
- /init-project PROJ — Generate stories from requirements
- /implement-all PROJ — Auto-implement all stories
```

---

### Step 9: Offer to Disable Unused Workflows

If the user didn't select certain integrations, offer to remove the corresponding workflow files:

- No Slack? → Offer to delete `.github/workflows/slack-notifications.yml`
- No auto-review? → Offer to delete `.github/workflows/auto-review.yml`
- No @claude reviews? → Offer to delete `.github/workflows/claude.yml`

Ask before deleting anything.

---

## Important Notes

- Be conversational and helpful
- Don't walk through environment setup — point to docs/ONBOARDING.md instead
- Org-level secrets mean no per-repo secret configuration
- Focus on project-specific configuration (Jira project key, CLAUDE.md customization)
- If something fails, help troubleshoot or point to the right resource
