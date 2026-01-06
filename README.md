# Claude Code Starter

A minimal starter repo for [Claude Code](https://claude.ai/code) projects with GitHub and Jira integration.

## What's Included

```
├── CLAUDE.md                    # Claude Code instructions (single source of truth)
├── requirements.md.example      # Template for project requirements
└── .claude/
    ├── settings.json            # Jira MCP server config
    └── commands/
        ├── init-project.md      # Requirements → stories.md → Jira tickets
        ├── implement-all.md     # Auto-implement all stories
        ├── jira-task.md         # Implement individual Jira ticket
        ├── new-feature.md       # Feature implementation workflow
        └── review.md            # Pre-PR code review
```

## Quick Start

### 1. Clone and Setup
```bash
git clone <this-repo> my-project
cd my-project
```

### 2. Create a Jira Project
Manually create a project in your Atlassian instance (e.g., project key `ACME`)

### 3. Add Your Requirements
```bash
cp requirements.md.example requirements.md
# Edit requirements.md with your project details
```

### 4. Generate Stories
```bash
claude
```
```
/init-project JIRA-PROJ-ID
```

Claude will:
- Read `requirements.md`
- Generate epics and user stories
- Write everything to `stories.md` for your review

### 5. Review and Iterate
Review `stories.md`. Each story includes GIVEN/WHEN/THEN acceptance criteria.

To make changes:
- Edit `stories.md` directly, or
- Ask Claude: "remove story X", "add a story for...", "update acceptance criteria for..."

### 6. Approve Stories
Say **"approved"** and Claude will create all tickets in Jira.

### 7. Implement
```
/implement-all JIRA-PROJ-ID
```

Claude will:
- Analyze story dependencies
- Show you the implementation order
- Work through each story (branch → code → test → PR)

Options:
- `--wait` (default): Waits for PR merge before next story
- `--batch`: Creates all PRs without waiting

### 8. Review and Merge PRs
Review PRs in GitHub and merge when approved.

## Workflow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 1: Define Stories                                        │
├─────────────────────────────────────────────────────────────────┤
│  requirements.md                                                │
│       ↓                                                         │
│  /init-project JIRA-PROJ-ID                                     │
│       ↓                                                         │
│  stories.md  ←──  review & iterate                              │
│       ↓                                                         │
│  "approved"  →  Jira tickets created                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Phase 2: Implement                                             │
├─────────────────────────────────────────────────────────────────┤
│  /implement-all JIRA-PROJ-ID                                    │
│       ↓                                                         │
│  Claude works through stories (branch → code → PR)              │
│       ↓                                                         │
│  Human reviews and merges PRs                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Jira Authentication

On first use of any Jira command, Claude will prompt you to authenticate via OAuth in your browser. This is a one-time setup per session.

## Custom Commands

| Command | Description |
|---------|-------------|
| `/init-project JIRA-PROJ-ID [file]` | Read requirements, generate `stories.md`, create Jira tickets after approval |
| `/implement-all JIRA-PROJ-ID [--wait\|--batch]` | Auto-implement all stories in dependency order |
| `/jira-task JIRA-PROJ-ID-123` | Implement a single Jira ticket |
| `/new-feature <desc>` | Implement with explore-plan-code-commit workflow |
| `/review` | Review changes before PR |

## Human Checkpoints

This workflow has two human approval points:

1. **Stories**: Review `stories.md` before Jira tickets are created
2. **Code**: Review PRs before merging to main

Claude will never create Jira tickets or merge code without explicit approval.

See `CLAUDE.md` for detailed documentation.
