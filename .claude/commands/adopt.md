# Adopt Agentic Coding Workflow

Adopt the agentic coding workflow in an existing repository. This will set up:
- Claude custom commands (`/jira-task`, `/new-feature`, etc.)
- GitHub Actions for @claude PR reviews
- Automatic code review on every PR
- Slack notifications
- A starter CLAUDE.md for project instructions

## Instructions

You are setting up the agentic coding workflow in an existing repository.

### Step 1: Verify we're in the right place

First, confirm this is a git repository and show the user what repo they're in:
```bash
git remote get-url origin
```

Ask the user to confirm this is the correct repo before proceeding.

### Step 2: Create directory structure

Create the necessary directories:
```bash
mkdir -p .claude/commands
mkdir -p .github/workflows
```

### Step 3: Copy Claude commands

Create each command file. These are the custom slash commands for Claude Code.

**.claude/commands/jira-task.md:**
```markdown
# Jira Task Implementation

Implement a Jira ticket: $ARGUMENTS

## Instructions

1. Fetch the ticket details:
   ```bash
   jira issue view $ARGUMENTS
   ```

2. Read CLAUDE.md for project conventions

3. Create a feature branch:
   ```bash
   git checkout main && git pull
   git checkout -b feature/$ARGUMENTS-<short-description>
   ```

4. Update Jira status:
   ```bash
   jira issue move $ARGUMENTS "In Progress"
   ```

5. Implement the feature according to the acceptance criteria

6. Create a PR:
   ```bash
   git push -u origin HEAD
   gh pr create --base main --fill
   ```

7. Wait for human review before proceeding
```

**.claude/commands/new-feature.md:**
```markdown
# New Feature Implementation

Implement a new feature: $ARGUMENTS

## Instructions

1. Read CLAUDE.md for project conventions

2. Explore the codebase to understand where changes should be made

3. Create a plan and get user approval before implementing

4. Create a feature branch:
   ```bash
   git checkout main && git pull
   git checkout -b feature/<short-description>
   ```

5. Implement the feature

6. Create a PR:
   ```bash
   git push -u origin HEAD
   gh pr create --base main --fill
   ```

7. Wait for human review
```

**.claude/commands/review.md:**
```markdown
# Code Review

Review the current changes before creating a PR.

## Instructions

1. Check what has changed:
   ```bash
   git status
   git diff
   ```

2. Review the changes for:
   - Code quality and best practices
   - Potential bugs or edge cases
   - Security issues
   - Missing error handling
   - TypeScript type safety

3. Report findings to the user

4. Suggest improvements if needed
```

**.claude/settings.json:**
```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(gh:*)",
      "Bash(jira:*)"
    ]
  }
}
```

### Step 4: Copy GitHub workflows

Create the workflow files.

**.github/workflows/claude.yml** - For @claude PR reviews:
```yaml
name: Claude Code Action

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          ref: ${{ github.head_ref }}
          fetch-depth: 0

      - name: Run Claude Code Action
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
        env:
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
```

**.github/workflows/auto-review.yml** - Automatic code review:
```yaml
name: Auto Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      id-token: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            REPO: ${{ github.repository }}
            PR NUMBER: ${{ github.event.pull_request.number }}

            Review this pull request. This is ADVISORY only - do not block or request changes.

            ## What to check:
            - Potential bugs, edge cases, error handling gaps
            - Security concerns (XSS, injection, exposed secrets)
            - React: hooks usage, accessibility, TypeScript types (avoid 'any')
            - TypeScript: error handling, type safety, null checks
            - Config files: exposed secrets, valid syntax

            ## Instructions:
            1. Read the PR diff using `gh pr diff ${{ github.event.pull_request.number }}`
            2. Analyze the changes
            3. Post your review using `gh pr comment ${{ github.event.pull_request.number }} --body "YOUR_REVIEW"`

            ## Review format:
            Post a comment with: Summary, Findings (file + line), and Verdict (✅/⚠️/🔍)

          claude_args: |
            --allowedTools "Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*),Read,Glob,Grep"
```

**.github/workflows/slack-notifications.yml** - Slack notifications:
```yaml
name: Slack Notifications

on:
  pull_request:
    types: [opened, closed]
  pull_request_review:
    types: [submitted]
  issue_comment:
    types: [created]

jobs:
  notify-pr-created:
    if: github.event_name == 'pull_request' && github.event.action == 'opened'
    runs-on: ubuntu-latest
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v2.0.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            {
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "🔀 *New PR:* <${{ github.event.pull_request.html_url }}|${{ github.event.pull_request.title }}> (#${{ github.event.pull_request.number }})\nby *${{ github.event.pull_request.user.login }}* in `${{ github.repository }}`"
                  }
                }
              ]
            }

  notify-pr-merged:
    if: github.event_name == 'pull_request' && github.event.action == 'closed' && github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v2.0.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            {
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "✅ *Merged:* <${{ github.event.pull_request.html_url }}|${{ github.event.pull_request.title }}> (#${{ github.event.pull_request.number }})\nby *${{ github.event.pull_request.merged_by.login }}* in `${{ github.repository }}`"
                  }
                }
              ]
            }

  notify-claude-triggered:
    if: github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v2.0.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            {
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "🤖 *Claude triggered* on <${{ github.event.issue.html_url }}|#${{ github.event.issue.number }}>\nby *${{ github.event.comment.user.login }}* in `${{ github.repository }}`"
                  }
                }
              ]
            }
```

### Step 5: Create starter CLAUDE.md

Create a starter CLAUDE.md file. The user should customize this for their project.

```markdown
# CLAUDE.md

This file provides context for Claude Code when working in this repository.

## Project Overview

<!-- Describe what this project does -->

## Tech Stack

<!-- List the key technologies used -->

## Development Workflow

### Starting New Work
```bash
git checkout main && git pull
git checkout -b feature/<description>
```

### Custom Commands
| Command | Description |
|---------|-------------|
| `/jira-task PROJ-123` | Implement a Jira ticket |
| `/new-feature <desc>` | Implement a new feature |
| `/review` | Review changes before PR |

### PR Process
1. Push branch and create PR
2. Wait for automatic code review
3. Address feedback (use `@claude` for changes)
4. Human approves and merges

## Code Conventions

<!-- Add project-specific conventions here -->

## Important Files

<!-- List key files Claude should know about -->
```

### Step 6: Display setup instructions

After creating all files, tell the user:

---

## ✅ Agentic coding workflow adopted!

**Files created:**
- `.claude/commands/` - Custom slash commands
- `.claude/settings.json` - Claude permissions
- `.github/workflows/claude.yml` - @claude PR reviews
- `.github/workflows/auto-review.yml` - Automatic code review
- `.github/workflows/slack-notifications.yml` - Notifications
- `CLAUDE.md` - Project instructions (customize this!)

**Next steps:**

1. **Add GitHub secrets** (Settings → Secrets → Actions):
   - `ANTHROPIC_API_KEY` - Claude API key
   - `JIRA_API_TOKEN` - Jira API token (if using Jira)
   - `SLACK_WEBHOOK_URL` - Slack webhook (if using Slack)

2. **Install Claude GitHub App** on this repo:
   - Go to github.com/apps/claude
   - Install on this repository

3. **Customize CLAUDE.md** with project-specific details

4. **Commit and push** the new files:
   ```bash
   git add .claude .github CLAUDE.md
   git commit -m "Adopt agentic coding workflow"
   git push
   ```

**Commands now available:**
- `/jira-task PROJ-123` - Work on a Jira ticket
- `/new-feature <desc>` - Build a new feature
- `/review` - Review your changes

**Automatic features:**
- Every PR gets auto-reviewed by Claude
- Comment `@claude <request>` on PRs for changes
- Slack notifications for PR activity

---

Ask the user if they want you to commit and push the changes.
