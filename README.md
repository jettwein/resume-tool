# Agentic Coding Framework

A framework for AI-assisted software development with [Claude Code](https://claude.ai/code). Works standalone or with optional integrations for Jira, GitHub Actions, Slack, and Vercel.

## Quick Start (No Setup Required)

Clone and start building immediately:

```bash
git clone https://github.com/ripplcare/agentic-coding-framework.git my-project
cd my-project
claude
```

That's it. You now have access to:
- `/new-feature <description>` — Build features with guided workflow
- `/review` — Review your changes before committing

No API keys, no configuration, no accounts required.

---

## What You Can Do

### Without Any Integrations

| Command | What It Does |
|---------|--------------|
| `/new-feature add user login` | Claude explores codebase, plans approach, implements, creates branch |
| `/review` | Reviews your changes for bugs, security issues, best practices |
| Just talk to Claude | "Fix the bug in checkout", "Refactor this component", "Explain how auth works" |

### With Optional Integrations

| Integration | What It Enables | What You Need |
|-------------|-----------------|---------------|
| **Jira** | `/jira-task PROJ-123`, `/init-project`, `/implement-all` | Jira account + API token |
| **GitHub Actions** | @claude PR reviews, automatic code review | GitHub repo + API key |
| **Slack** | Notifications for PRs, reviews, Claude activity | Slack webhook URL |
| **Vercel** | Preview deployments for every PR | Vercel account |

---

## Optional Integrations

### Jira Integration

Connect to Jira to manage tickets directly from Claude Code.

**Enables:**
- `/jira-task PROJ-123` — Fetch ticket, create branch, implement, update status
- `/init-project PROJ` — Generate stories from requirements, create Jira tickets
- `/implement-all PROJ` — Auto-implement all stories in dependency order

**Setup:** See [docs/ONBOARDING.md](./docs/ONBOARDING.md) for jira-cli installation and configuration.

---

### GitHub Actions (PR Reviews)

Let Claude respond to @mentions in PR comments and automatically review every PR.

**Enables:**
- Comment `@claude fix the type errors` on any PR → Claude makes the changes
- Automatic advisory code review on every PR opened

**Setup:** Already configured at the organization level. All required secrets (`ANTHROPIC_API_KEY`, `JIRA_*`, `SLACK_WEBHOOK_URL`) and the Claude GitHub App are pre-configured for all Rippl repos.

See [docs/ADMIN_SETUP.md](./docs/ADMIN_SETUP.md) for details on org-level configuration.

---

### Slack Notifications

Get notified when PRs are created, merged, reviewed, or when Claude is triggered.

**Enables:**
- 🔀 New PR notifications
- ✅ Merged PR notifications
- 👀 Review submitted notifications
- 🤖 Claude triggered/finished notifications

**Setup:** Already configured at the organization level. All repos notify the shared engineering channel.

See [docs/ADMIN_SETUP.md](./docs/ADMIN_SETUP.md) for webhook configuration.

---

### Vercel Preview Deployments

Get a preview URL for every PR automatically.

**Enables:**
- Every PR gets a unique preview deployment
- Reviewers can see changes live before merging

**Setup:**

1. Connect repo to Vercel at [vercel.com](https://vercel.com) → Add New Project
2. If using private npm dependencies, add `GITHUB_TOKEN` environment variable in Vercel

**Required info:** Vercel account

---

## Project Structure

```
├── CLAUDE.md                    # Project instructions for Claude (customize this!)
├── README.md                    # This file
├── requirements.md.example      # Template for requirements-driven development
├── .claude/
│   ├── settings.json            # Claude permissions
│   └── commands/                # Custom slash commands
│       ├── new-feature.md       # Feature implementation workflow
│       ├── review.md            # Pre-PR code review
│       ├── jira-task.md         # Jira ticket workflow
│       ├── init-project.md      # Requirements → Jira stories
│       ├── implement-all.md     # Auto-implement all stories
│       └── setup.md             # Interactive setup wizard
├── .github/workflows/           # GitHub Actions (if using)
│   ├── claude.yml               # @claude PR reviews
│   ├── auto-review.yml          # Automatic code review
│   └── slack-notifications.yml  # Slack notifications
└── docs/                        # Additional documentation
```

---

## Requirements-Driven Development (with Jira)

If you're using Jira, you can use the full requirements-to-implementation workflow:

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 1: Define Stories                                        │
├─────────────────────────────────────────────────────────────────┤
│  requirements.md                                                │
│       ↓                                                         │
│  /init-project PROJ                                             │
│       ↓                                                         │
│  stories.md  ←──  review & iterate                              │
│       ↓                                                         │
│  "approved"  →  Jira tickets created                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Phase 2: Implement                                             │
├─────────────────────────────────────────────────────────────────┤
│  /implement-all PROJ                                            │
│       ↓                                                         │
│  Claude works through stories (branch → code → PR)              │
│       ↓                                                         │
│  Human reviews and merges PRs                                   │
└─────────────────────────────────────────────────────────────────┘
```

1. Copy `requirements.md.example` to `requirements.md`
2. Add your project requirements
3. Run `/init-project YOUR-JIRA-PROJECT-KEY`
4. Review generated stories, say "approved" to create Jira tickets
5. Run `/implement-all YOUR-JIRA-PROJECT-KEY`

---

## Command Reference

| Command | Requires | Description |
|---------|----------|-------------|
| `/new-feature <desc>` | Nothing | Implement a feature with guided workflow |
| `/review` | Nothing | Review changes before creating PR |
| `/setup` | Nothing | Interactive setup wizard |
| `/doctor` | Nothing | Diagnose setup issues and verify configuration |
| `/jira-task PROJ-123` | Jira | Implement a Jira ticket |
| `/init-project PROJ` | Jira | Generate stories from requirements |
| `/implement-all PROJ` | Jira | Auto-implement all Jira stories |
| `/ui-components` | Nothing | List available shared UI components |
| `/adopt` | Nothing | Adopt this workflow in an existing repo |

---

## Human Checkpoints

Claude never acts without approval at key points:

1. **Stories** — Review `stories.md` before Jira tickets are created
2. **Code** — Review PRs before merging to main
3. **Destructive actions** — Claude asks before force pushes, deletions, etc.

---

## Customization

Edit `CLAUDE.md` to add:
- Project-specific conventions
- Tech stack details
- Important files and patterns
- Team decisions and learnings

Claude reads this file at the start of every session.

---

## Adopting in Existing Repos

Already have a project? Run `/adopt` in your existing repo to add this workflow without starting from scratch.

```bash
cd /path/to/existing-project
claude
```
```
/adopt
```

---

## More Documentation

- [CLAUDE.md](./CLAUDE.md) — Full project instructions and conventions
- [WORKFLOW.md](./WORKFLOW.md) — Git workflow details
- [COMPONENTS.md](./COMPONENTS.md) — Shared UI components (if using rippl-shared-components)
- [docs/ONBOARDING.md](./docs/ONBOARDING.md) — New developer setup guide
- [docs/ADMIN_SETUP.md](./docs/ADMIN_SETUP.md) — Organization admin configuration
- [docs/shared-components-packaging.md](./docs/shared-components-packaging.md) — Packaging libraries for external use
