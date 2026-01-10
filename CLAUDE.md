# CLAUDE.md

This file is the **single source of truth** for Claude Code when working in this repository. Both Claude and humans should update this file as the project evolves—adding rules, decisions, patterns, and learnings.

## About This File

- **Living document**: Update this file whenever you establish new patterns, make architectural decisions, or learn something important about the codebase
- **Claude should update**: When Claude discovers something important or establishes a new convention, it should add it here
- **Humans should update**: When humans make decisions or want to guide Claude's behavior, add it here
- **Read first**: Claude should always read this file at the start of a session
- **ALWAYS document**: Any new workflow, convention, or process change MUST be added to this file

---

## Project Overview

This is a starter repo for Claude Code projects with GitHub and Jira integration. Designed for:
- Multiple Claude agents working concurrently on different features
- Human-in-the-loop review via GitHub PRs
- Requirements-driven development via Jira integration

---

## Multi-Agent Concurrent Development

When multiple features can be developed in parallel, use git worktrees to run separate Claude instances:

### Setup Parallel Work
```bash
# From main repo, create worktrees for each feature
git worktree add ../project-feature-a feature/PROJ-1-feature-a
git worktree add ../project-feature-b feature/PROJ-2-feature-b

# Start Claude in each worktree (separate terminal windows)
cd ../project-feature-a && claude
cd ../project-feature-b && claude
```

### Guidelines for Parallel Work
- Each agent works on an **independent feature branch**
- Avoid working on the same files across agents
- Coordinate via Jira—check ticket status before starting
- When done, create PR and clean up worktree:
  ```bash
  git worktree remove ../project-feature-a
  ```

### When to Parallelize
- **Do parallelize**: Independent features, separate areas of codebase
- **Don't parallelize**: Features with shared dependencies, same files

---

## Jira Integration

This repo uses [jira-cli](https://github.com/ankitpokhrel/jira-cli) for Jira integration.

### One-Time Setup (per developer)

1. **Install jira-cli**:
   ```bash
   brew install ankitpokhrel/jira-cli/jira-cli
   ```

2. **Create an API token**:
   - Go to https://id.atlassian.com/manage-profile/security/api-tokens
   - Click "Create API token"
   - Name it (e.g., "jira-cli")
   - Copy the token

3. **Add token to your shell** (add to `~/.zshrc` or `~/.bashrc`):
   ```bash
   export JIRA_API_TOKEN="your-api-token-here"
   ```

4. **Configure jira-cli**:
   ```bash
   source ~/.zshrc  # reload shell config
   jira init --installation cloud --server https://yourcompany.atlassian.net --login your-email@company.com
   ```

5. **Verify connection**:
   ```bash
   jira project list
   ```

### Notes
- API tokens work even if your org uses SSO/OAuth for web login
- Each developer maintains their own `~/.config/.jira/.config.yml` locally
- No credentials are stored in the repo

---

## GitHub Actions Setup

The `@claude` PR review feature requires GitHub repository secrets. Set these in **Settings → Secrets and variables → Actions**:

| Secret | Description | How to get it |
|--------|-------------|---------------|
| `ANTHROPIC_API_KEY` | Claude API key | [console.anthropic.com](https://console.anthropic.com/) |
| `JIRA_API_TOKEN` | Jira API token | [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens) |
| `JIRA_EMAIL` | Your Jira login email | Your Atlassian account email |
| `JIRA_SERVER` | Jira server URL | e.g., `https://yourcompany.atlassian.net` |

Once configured, the GitHub Action at `.github/workflows/claude.yml` will automatically respond to `@claude` mentions in PR comments.

---

## Slack Notifications

The repo sends notifications to Slack for key events. Add this secret:

| Secret | Description |
|--------|-------------|
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL |

**To get a webhook URL:**
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create a new app → **From scratch**
3. Go to **Incoming Webhooks** → Toggle **On**
4. Click **Add New Webhook to Workspace**
5. Select your channel and copy the URL

**Events that trigger notifications:**

| Event | Message |
|-------|---------|
| PR created | 🔀 New PR: Title (#123) |
| PR merged | ✅ Merged: Title (#123) |
| Review submitted | 👀 Review submitted on #123 |
| @claude triggered | 🤖 Claude triggered on #123 |
| @claude finished | 🤖 Claude finished on #123 - success/failure |

---

## Vercel Preview Deployments (Optional)

Every PR automatically gets a preview deployment URL, allowing reviewers to see changes live before merging.

**This is optional.** If you don't need preview deployments, simply skip this section. The Vercel config files in the repo won't affect anything unless you connect to Vercel.

### Setup (per project)

1. **Connect repo to Vercel:**
   - Go to [vercel.com](https://vercel.com) → **Add New Project**
   - Select the cloned repo
   - Vercel auto-detects Vite — click **Deploy**

2. **Add environment variable for private dependencies:**
   - Go to **Settings** → **Environment Variables**
   - Add `GITHUB_TOKEN` with a GitHub Personal Access Token that has read access to `rippl-shared-components`
   - Select all environments (Production, Preview, Development)

3. **Create the GitHub token:**
   - Go to [github.com/settings/tokens](https://github.com/settings/tokens)
   - Generate new token → **Fine-grained token**
   - Repository access: Select `rippl-shared-components`
   - Permissions: **Contents** → Read-only

### How It Works

- Push to any branch → Vercel builds a preview
- Open a PR → Vercel comments with the preview URL
- Merge to main → Vercel deploys to production

The `vercel.json` and `scripts/vercel-install.sh` files configure git to use the `GITHUB_TOKEN` for private repo access during builds.

---

## New Project Setup Checklist

When cloning this template for a new project, here's what you need to configure:

### Inherited from Template (no setup needed)
- [x] GitHub Actions workflows (`.github/workflows/`)
- [x] Claude custom commands (`.claude/commands/`)
- [x] Vercel build configuration (`vercel.json`, `scripts/vercel-install.sh`)
- [x] Project structure and placeholder app

### Per-Project Setup Required

| Item | Where | Secrets/Config Needed | Required? |
|------|-------|----------------------|-----------|
| **GitHub Actions** | Repo → Settings → Secrets | `ANTHROPIC_API_KEY`, `JIRA_API_TOKEN`, `JIRA_EMAIL`, `JIRA_SERVER`, `SLACK_WEBHOOK_URL` | Yes |
| **Claude GitHub App** | github.com/apps/claude | Install on the new repo | Yes |
| **Jira CLI (local)** | Developer machine | Already configured if using existing setup | Yes |
| **Vercel** | vercel.com | Connect repo, add `GITHUB_TOKEN` env var | Optional |

### Quick Setup Commands

```bash
# 1. Clone the template
git clone https://github.com/ripplcare/agentic-coding-poc.git my-new-project
cd my-new-project

# 2. Update remote to new repo
git remote set-url origin https://github.com/ripplcare/my-new-project.git
git push -u origin main

# 3. Add GitHub secrets (via GitHub UI or CLI)
gh secret set ANTHROPIC_API_KEY
gh secret set JIRA_API_TOKEN
gh secret set JIRA_EMAIL
gh secret set JIRA_SERVER
gh secret set SLACK_WEBHOOK_URL

# 4. Connect to Vercel (via vercel.com UI)
# 5. Install Claude GitHub App on the new repo
```

---

## Adopting in Existing Repositories

For existing repositories that weren't created from this template, use the `/adopt` command to set up the agentic coding workflow.

### How to Adopt

1. **Open Claude Code** in the existing repo:
   ```bash
   cd /path/to/existing-repo
   claude
   ```

2. **Run the adopt command**:
   ```
   /adopt
   ```

3. **Follow the prompts** — Claude will:
   - Verify you're in the right repo
   - Create `.claude/commands/` with custom commands
   - Create `.github/workflows/` with GitHub Actions
   - Create a starter `CLAUDE.md`
   - Provide a checklist of secrets to configure

### What Gets Created

| Directory/File | Purpose |
|----------------|---------|
| `.claude/commands/jira-task.md` | Jira ticket implementation workflow |
| `.claude/commands/new-feature.md` | New feature workflow |
| `.claude/commands/review.md` | Pre-PR code review |
| `.claude/settings.json` | Claude permissions for git, gh, jira |
| `.github/workflows/claude.yml` | @claude PR review trigger |
| `.github/workflows/auto-review.yml` | Automatic code review |
| `.github/workflows/slack-notifications.yml` | Slack notifications |
| `CLAUDE.md` | Project instructions (customize this!) |

### After Adopting

1. **Add GitHub secrets** — see [GitHub Actions Setup](#github-actions-setup)
2. **Install Claude GitHub App** — [github.com/apps/claude](https://github.com/apps/claude)
3. **Customize CLAUDE.md** — add project-specific details, tech stack, conventions
4. **Commit and push** the new files

---

## Custom Commands

| Command | Description |
|---------|-------------|
| `/adopt` | Adopt agentic workflow in an existing repository |
| `/init-project JIRA-PROJ-ID [file]` | Read requirements and create Jira epics/stories |
| `/implement-all JIRA-PROJ-ID [--wait\|--batch]` | Auto-implement all stories in dependency order |
| `/jira-task JIRA-PROJ-ID-123` | Fetch issue and plan implementation |
| `/new-feature <desc>` | Implement with explore-plan-code-commit workflow |
| `/review` | Review changes before PR |
| `/ui-components` | List available shared UI components |

---

## UI Development

This project uses the **rippl-shared-components** library for consistent UI across applications.

### Golden Rule
**ALWAYS check `COMPONENTS.md` before creating any UI component.** Use existing shared components first. Only create custom components if nothing suitable exists in the library.

### Tech Stack
- **React 19** + **TypeScript**
- **Material-UI (MUI) 6** for component foundation
- **Emotion** for CSS-in-JS styling (via MUI's `sx` prop)
- **Montserrat** font family

### Component Usage
```tsx
// Import from the shared library
import { Button, Card, Avatar, LoadingSpinner } from 'rippl-shared-components'
import { lightTheme, darkTheme } from 'rippl-shared-components'
```

### Styling Guidelines
1. **Use the `sx` prop** for component-specific styling (MUI pattern)
2. **Use theme tokens** for colors, spacing, and typography—don't hardcode values
3. **Follow existing patterns** in the shared components library

### Before Building UI
1. Run `/ui-components` to see available components
2. Check `COMPONENTS.md` for props and usage examples
3. If a component doesn't exist, consider whether it should be added to the shared library

### Design Tokens (Reference)
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#312F7A` | Main brand color |
| Secondary | `#F73C36` | Accent/alert |
| Accent | `#3858E9` | Ripply AI branding |
| Success | `#42B042` | Success states |
| Error | `#E85621` | Error states |

---

## Workflow: Requirements → Jira → Implementation

### Phase 1: Define Stories
1. **Add requirements**: Copy `requirements.md.example` to `requirements.md`
2. **Create Jira project**: Manually create in Atlassian (one-time)
3. **Generate stories**: `/init-project JIRA-PROJ-ID` - Claude reads requirements and writes stories to `stories.md`
4. **Review stories**: Review `stories.md` - each story has GIVEN/WHEN/THEN acceptance criteria
5. **Iterate** (optional): Edit `stories.md` directly, or ask Claude to make changes conversationally
6. **Approve**: Say "approved" to create Jira tickets (Claude will NOT create tickets without approval)

### Phase 2: Implement
7. **Implement all stories**: `/implement-all JIRA-PROJ-ID` - Claude analyzes dependencies and works through stories
   - `--wait` (default): Waits for PR approval before next story
   - `--batch`: Creates all PRs without waiting
   - Or use `/jira-task JIRA-PROJ-ID-X` for individual stories
8. **Human reviews and merges**: Review PRs in GitHub, merge when approved

---

## Adding Features After Initial Implementation

Once a project is running, there are three ways to add new features:

### Option 1: Quick Features (Conversational)
Best for: 1-2 small features

Just tell Claude what you want:
> "Add a dark mode toggle to the app"

Claude will:
1. Create a Jira ticket
2. Implement the feature
3. Create a PR

### Option 2: Work on Existing Tickets
Best for: Pre-planned work or tickets created by others

Reference a Jira ticket directly:
> "Work on PM-10"

Or use the command:
> `/jira-task PM-10`

Claude will fetch the ticket details and implement it.

### Option 3: Batch of New Features (Requirements Update)
Best for: Major new feature areas or significant scope additions

1. Update `requirements.md` with new features
2. Run `/init-project JIRA-PROJ-ID`
3. Review generated stories in `stories.md`
4. Say "approved" to create Jira tickets
5. Use `/implement-all` or work tickets individually

### Which Option to Choose?
| Scope | Recommended Approach |
|-------|---------------------|
| Quick fix or small feature | Option 1 (conversational) |
| Ticket already exists | Option 2 (`/jira-task`) |
| Multiple related features | Option 3 (requirements update) |
| New feature area | Option 3 (requirements update) |

---

## Git Workflow

> **Note**: Core workflow is also in [WORKFLOW.md](./WORKFLOW.md) for syncing to cloned projects.

### Starting New Work
**ALWAYS create a feature branch from main before starting any new work:**
```bash
git checkout main
git pull origin main
git checkout -b feature/<jira-key>-<description>
jira issue move <jira-key> "In Progress"  # Update Jira status
```
Never commit directly to main. All work must happen on a feature branch.

### Branch Naming
- Features: `feature/<jira-key>-<description>`
- Bug fixes: `fix/<jira-key>-<description>`

### PR Process
1. Push branch: `git push -u origin <branch-name>`
2. Create PR: `gh pr create --base main --fill`
3. **Wait for human review** - DO NOT merge without approval
4. Address feedback, push updates (see **@claude PR Reviews** below)
5. Human merges when approved
6. After merge: `jira issue move <jira-key> "Done"`

### Automatic Code Review

Every PR is automatically reviewed by Claude when opened or updated. This is **advisory only** — it won't block merging.

**What Claude checks:**
- Potential bugs, edge cases, error handling gaps
- Security concerns (XSS, injection, exposed secrets)
- React: hooks usage, accessibility, TypeScript types (avoid `any`)
- TypeScript: error handling, type safety, null checks
- Config files: exposed secrets, valid syntax

**Review output format:**
- Summary (one sentence)
- File-by-file findings with line numbers
- Verdict: ✅ Looks good, ⚠️ Minor suggestions, or 🔍 Needs discussion

This runs automatically — no action needed. The review appears as a comment on the PR.

**Configuration:** See `.github/workflows/auto-review.yml`

### @claude PR Reviews

Humans can request changes directly in PR comments using `@claude`:

```
@claude Please fix the type errors in this file
@claude Can you add error handling to this function?
@claude Refactor this to use the shared Button component
```

**The flow in practice:**

1. **Claude creates PR** for a feature branch
2. **Human reviews** the PR and leaves a comment:
   ```
   @claude Please add error handling to the submit function
   ```
3. **GitHub Action triggers** automatically (listens for `@claude` mentions)
4. **Claude spins up** in a GitHub Actions runner, checks out the PR branch
5. **Claude reads context** — the PR diff, your comment, CLAUDE.md, custom commands, shared components
6. **Claude makes changes** based on your feedback and pushes to the branch
7. **Human sees the update** in the PR and continues the review
8. **Repeat** as needed until the PR is ready to merge

**What Claude can do in PR reviews:**
- Fix bugs and type errors
- Refactor code based on feedback
- Add missing error handling
- Update to use shared components
- Any code change a human reviewer requests

**Note:** There is no persistent Claude instance waiting. Each `@claude` mention triggers a fresh GitHub Actions job that spins up, does the work, and shuts down.

This enables an iterative review workflow without the human needing to make changes themselves.

### Jira Status Updates
Claude must update Jira ticket status as work progresses:
- **Starting work** → Move ticket to "In Progress"
- **PR merged** → Move ticket to "Done"

This keeps Jira in sync and helps coordinate multi-agent work.

### After Creating a PR
Claude can automatically check if a PR has been merged:
```bash
gh pr view <PR-number> --json state --jq '.state'
```

**User can say any of these to proceed:**
- "continue" or "next" - Claude checks PR status and proceeds if merged
- "merged" - Claude proceeds with cleanup
- Give a new task - Claude checks PR status first

**After merge is confirmed, Claude will:**
1. Pull latest main: `git checkout main && git pull`
2. Delete feature branch: `git branch -d <branch-name>`
3. Update Jira: `jira issue move <KEY> "Done"`

---

## Project-Specific Rules

<!-- Add project-specific conventions, patterns, and decisions below -->
<!-- Example entries:
- Use snake_case for all Python files
- All API endpoints must have OpenAPI documentation
- Database migrations require review from @dbadmin
-->

*No project-specific rules yet. Add them as the project evolves.*

---

## Decisions Log

<!-- Record important architectural or design decisions here -->
<!-- Format: **YYYY-MM-DD**: Decision description - rationale -->

*No decisions logged yet.*

---

## Learnings

<!-- Record things Claude or humans learn about the codebase -->
<!-- Example: "The auth module requires tokens to be refreshed every 15 min" -->

*No learnings recorded yet.*
