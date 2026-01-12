# Adopt Agentic Coding Workflow

Adopt the agentic coding workflow in an existing repository.

## Instructions

You are helping the user adopt the agentic coding workflow in their existing repository. Be interactive and only set up what they need.

### Step 1: Verify Repository

First, confirm this is a git repository and show the user what repo they're in:

```bash
git remote get-url origin
```

Ask the user to confirm this is the correct repo before proceeding.

### Step 2: Ask About Integrations

Ask the user which integrations they want to set up:

**"Which integrations would you like to enable?"**

1. **Core only** — `/new-feature`, `/review` commands (no external services)
2. **Jira** — Ticket management (`/jira-task`, status updates)
3. **GitHub Actions** — @claude PR reviews, automatic code review
4. **Slack** — PR and Claude activity notifications
5. **All of the above**

Let them select multiple (e.g., "2 and 3" or "all").

---

### Step 3: Gather Required Information

Based on their selections, gather the necessary information:

#### If Jira selected:

Ask: **"What is your Jira project key?"** (e.g., `NAV`, `PROJ`, `ACME`)

This is the prefix for ticket numbers like NAV-123.

Also check if jira-cli is installed locally:
```bash
which jira
```

If not installed, tell them:
```
To use Jira commands locally, you'll need jira-cli:
brew install ankitpokhrel/jira-cli/jira-cli

Then configure it:
export JIRA_API_TOKEN="your-token"  # Add to ~/.zshrc
jira init --installation cloud --server https://COMPANY.atlassian.net --login EMAIL
```

#### If GitHub Actions selected:

Note that they'll need to add secrets. Ask if they want to do it now via CLI:
```bash
gh secret set ANTHROPIC_API_KEY
```

Or they can do it manually in GitHub Settings → Secrets → Actions.

---

### Step 4: Create Files Based on Selections

Create the directory structure:
```bash
mkdir -p .claude/commands
```

#### Always create (core commands):

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
      "Bash(gh:*)"
    ]
  }
}
```

#### If Jira selected, also create:

Update **.claude/settings.json** to include Jira:
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

#### If GitHub Actions selected, create:

```bash
mkdir -p .github/workflows
```

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

      - name: Install jira-cli
        run: |
          curl -sSL https://github.com/ankitpokhrel/jira-cli/releases/download/v1.5.2/jira_1.5.2_linux_x86_64.tar.gz -o jira.tar.gz
          tar xzf jira.tar.gz
          sudo mv jira_1.5.2_linux_x86_64/bin/jira /usr/local/bin/
          rm -rf jira.tar.gz jira_1.5.2_linux_x86_64
          mkdir -p ~/.config/.jira
          cat > ~/.config/.jira/.config.yml << EOF
          board:
            id: 0
            type: ""
          epic:
            name: Epic
            link: Parent
          installation: cloud
          login: ${{ secrets.JIRA_EMAIL }}
          project:
            key: ""
            type: ""
          server: ${{ secrets.JIRA_SERVER }}
          EOF

      - name: Run Claude Code Action
        uses: anthropics/claude-code-action@main
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
        env:
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}

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

#### If Slack selected (requires GitHub Actions), also create:

**.github/workflows/slack-notifications.yml:**
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
      - name: Notify Slack - PR Created
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
                    "text": "🔀 *New PR:* <${{ github.event.pull_request.html_url }}|${{ github.event.pull_request.title }}> (#${{ github.event.pull_request.number }})"
                  }
                },
                {
                  "type": "context",
                  "elements": [
                    {
                      "type": "mrkdwn",
                      "text": "by *${{ github.event.pull_request.user.login }}* in `${{ github.repository }}`"
                    }
                  ]
                }
              ]
            }

  notify-pr-merged:
    if: github.event_name == 'pull_request' && github.event.action == 'closed' && github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Notify Slack - PR Merged
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
                    "text": "✅ *Merged:* <${{ github.event.pull_request.html_url }}|${{ github.event.pull_request.title }}> (#${{ github.event.pull_request.number }})"
                  }
                },
                {
                  "type": "context",
                  "elements": [
                    {
                      "type": "mrkdwn",
                      "text": "merged by *${{ github.event.pull_request.merged_by.login }}* in `${{ github.repository }}`"
                    }
                  ]
                }
              ]
            }

  notify-review-submitted:
    if: github.event_name == 'pull_request_review' && github.event.action == 'submitted'
    runs-on: ubuntu-latest
    steps:
      - name: Notify Slack - Review Submitted
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
                    "text": "👀 *Review submitted* on <${{ github.event.pull_request.html_url }}|#${{ github.event.pull_request.number }}> - ${{ github.event.review.state }}"
                  }
                },
                {
                  "type": "context",
                  "elements": [
                    {
                      "type": "mrkdwn",
                      "text": "by *${{ github.event.review.user.login }}* in `${{ github.repository }}`"
                    }
                  ]
                }
              ]
            }

  notify-claude-triggered:
    if: github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    steps:
      - name: Notify Slack - Claude Triggered
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
                    "text": "🤖 *Claude triggered* on <${{ github.event.issue.html_url }}|#${{ github.event.issue.number }}>"
                  }
                },
                {
                  "type": "context",
                  "elements": [
                    {
                      "type": "mrkdwn",
                      "text": "by *${{ github.event.comment.user.login }}* in `${{ github.repository }}`"
                    }
                  ]
                }
              ]
            }
```

And add the Slack notification step to claude.yml after the Run Claude Code Action step:
```yaml
      - name: Notify Slack - Claude Finished
        if: always()
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
                    "text": "🤖 *Claude finished* on <${{ github.event.issue.html_url }}|#${{ github.event.issue.number }}> - ${{ job.status }}"
                  }
                },
                {
                  "type": "context",
                  "elements": [
                    {
                      "type": "mrkdwn",
                      "text": "in `${{ github.repository }}`"
                    }
                  ]
                }
              ]
            }
```

---

### Step 5: Create CLAUDE.md

Check if CLAUDE.md already exists:
```bash
ls CLAUDE.md 2>/dev/null
```

If it exists, ask if they want to keep it or replace it. If replacing or creating new, use this template:

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
| `/new-feature <desc>` | Implement a new feature |
| `/review` | Review changes before PR |
```

If Jira was selected, add to the commands table:
```
| `/jira-task PROJ-123` | Implement a Jira ticket |
```

And add a Jira section:
```markdown
## Jira Integration

Project key: **PROJ** (replace with actual key)

- Use `/jira-task PROJ-123` to work on tickets
- Tickets are moved to "In Progress" when work starts
- Tickets are moved to "Done" after PR is merged
```

---

### Step 6: Summary

Display a summary based on what was configured:

```
## ✅ Agentic coding workflow adopted!

### Files created:
- `.claude/commands/new-feature.md`
- `.claude/commands/review.md`
- `.claude/settings.json`
[If Jira] - `.claude/commands/jira-task.md`
[If GitHub Actions] - `.github/workflows/claude.yml`
[If GitHub Actions] - `.github/workflows/auto-review.yml`
[If Slack] - `.github/workflows/slack-notifications.yml`
- `CLAUDE.md`

### Required secrets (add in GitHub Settings → Secrets → Actions):
[If GitHub Actions]
- `ANTHROPIC_API_KEY` — console.anthropic.com

[If GitHub Actions + Jira]
- `JIRA_API_TOKEN` — id.atlassian.com/manage-profile/security/api-tokens
- `JIRA_EMAIL` — Your Atlassian login email
- `JIRA_SERVER` — e.g., https://yourcompany.atlassian.net

[If Slack]
- `SLACK_WEBHOOK_URL` — api.slack.com/apps

### Additional setup:
[If GitHub Actions]
- Install Claude GitHub App: github.com/apps/claude

### Commands now available:
- `/new-feature <desc>` — Build a new feature
- `/review` — Review your changes
[If Jira] - `/jira-task PROJ-123` — Work on a Jira ticket
```

---

### Step 7: Commit

Ask the user if they want you to commit and push the changes:

```bash
git add .claude .github CLAUDE.md
git commit -m "Adopt agentic coding workflow"
git push
```

---

## Important Notes

- Only create files for the integrations the user selected
- If they don't want Slack, don't create slack-notifications.yml
- If they don't want GitHub Actions at all, don't create .github/workflows/
- Be helpful about explaining what each integration does
- Check for existing files before overwriting
