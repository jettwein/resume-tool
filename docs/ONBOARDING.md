# Developer Onboarding

This guide covers the one-time setup needed to use the agentic coding workflow at Rippl. Once you've completed these steps, you'll be able to use Claude Code with full Jira and GitHub integration across all Rippl projects.

## What is the Agentic Coding Workflow?

Rippl uses Claude Code (Anthropic's AI coding assistant) to accelerate development. The workflow includes:

- **Claude Code** — AI assistant that runs in your terminal, understands codebases, and can write/edit code
- **Custom commands** — Slash commands like `/new-feature`, `/jira-task`, and `/review` that guide Claude through structured workflows
- **Jira integration** — Claude can read tickets, update statuses, and track work
- **GitHub integration** — Automatic code reviews on PRs, and `@claude` mentions for PR feedback

This setup takes about 10-15 minutes.

---

## Prerequisites

You'll need:
- macOS (the primary supported platform)
- Homebrew installed (`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`)
- Access to Rippl's GitHub organization
- Access to Rippl's Jira instance

---

## Step 1: Install Claude Code

Claude Code is Anthropic's official CLI tool for working with Claude in your terminal.

### Install via npm

```bash
npm install -g @anthropic-ai/claude-code
```

### Authenticate

Run Claude Code for the first time:

```bash
claude
```

This will open a browser window to authenticate with your Anthropic account. Follow the prompts to complete authentication.

### Verify Installation

After authenticating, you should see Claude's interactive prompt. Type `/help` to see available commands, then `/exit` to quit.

---

## Step 2: Set Up GitHub CLI

The GitHub CLI (`gh`) allows Claude to create branches, PRs, and interact with GitHub.

### Install

```bash
brew install gh
```

### Authenticate

```bash
gh auth login
```

Choose the following options when prompted:
- **Where do you use GitHub?** → GitHub.com
- **Preferred protocol** → HTTPS (recommended) or SSH
- **Authenticate Git with GitHub credentials?** → Yes
- **How would you like to authenticate?** → Login with a web browser

### Verify Installation

```bash
gh auth status
```

You should see your GitHub username and authentication status.

---

## Step 3: Set Up Jira CLI

The Jira CLI (`jira`) allows Claude to read tickets, update statuses, and track work locally.

> **Note:** GitHub Actions uses a separate service account for Jira (already configured by admins). This setup is for your local development environment so you can run commands like `/jira-task` from your terminal.

### Install

```bash
brew install ankitpokhrel/jira-cli/jira-cli
```

### Create a Personal API Token

You'll need your own API token for local Jira access. This is different from the service account used by GitHub Actions.

1. Go to [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**
3. Name it something memorable (e.g., "jira-cli" or "claude-code")
4. Copy the token — you won't be able to see it again

### Add Token to Your Shell

Add this line to your shell configuration (`~/.zshrc` for Zsh or `~/.bashrc` for Bash):

```bash
export JIRA_API_TOKEN="your-api-token-here"
```

Then reload your shell:

```bash
source ~/.zshrc  # or source ~/.bashrc
```

### Configure jira-cli

Run the initialization command with Rippl's Jira server:

```bash
jira init --installation cloud --server https://ripplcare.atlassian.net --login your-email@rippl.com
```

Replace `your-email@rippl.com` with your actual Atlassian account email.

### Verify Installation

```bash
jira project list
```

You should see a list of Jira projects you have access to.

---

## Step 4: Verify Everything Works

Run these commands to confirm your setup is complete:

```bash
# Claude Code
claude --version

# GitHub CLI
gh auth status

# Jira CLI
jira project list | head -3
```

All three should succeed without errors.

---

## You're Ready!

Your development environment is now configured. Here's how to get started with a Rippl project:

### Clone a Project

```bash
git clone https://github.com/ripplcare/your-project.git
cd your-project
```

### Start Claude Code

```bash
claude
```

### Try Some Commands

Once Claude is running, try these commands:

| Command | What it does |
|---------|--------------|
| `/help` | See all available commands |
| `/new-feature add a logout button` | Start implementing a feature |
| `/jira-task PROJ-123` | Work on a specific Jira ticket |
| `/review` | Review your changes before creating a PR |

### Read the Project's CLAUDE.md

Each project has a `CLAUDE.md` file with project-specific conventions. Claude reads this automatically, but it's helpful for you to understand it too.

---

## Troubleshooting

### "jira: command not found"

Make sure Homebrew's bin directory is in your PATH:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

### Jira authentication fails

1. Verify your API token is set: `echo $JIRA_API_TOKEN`
2. Make sure you're using your Atlassian email, not your Rippl email (if they differ)
3. Try regenerating your API token

### GitHub CLI says "not logged in"

Re-run authentication:

```bash
gh auth login
```

### Claude Code authentication issues

Clear the auth cache and re-authenticate:

```bash
claude logout
claude
```

---

## Getting Help

- **Claude Code issues** — Check [github.com/anthropics/claude-code](https://github.com/anthropics/claude-code/issues)
- **Workflow questions** — Ask in the #engineering Slack channel
- **Jira access issues** — Contact your team lead or IT

---

## Next Steps

- Read through a project's `CLAUDE.md` to understand its conventions
- Try `/new-feature` on a small task to get comfortable with the workflow
- Review the custom commands in `.claude/commands/` to see what's available
