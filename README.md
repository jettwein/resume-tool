# Claude Code Starter

A minimal starter repo for [Claude Code](https://claude.ai/code) projects with GitHub and Jira integration.

## What's Included

```
├── CLAUDE.md                    # Claude Code instructions
├── requirements.md.example      # Template for project requirements
└── .claude/
    ├── settings.json           # Jira MCP server config
    └── commands/
        ├── init-project.md     # Requirements → Jira stories
        ├── jira-task.md        # Implement from Jira ticket
        ├── new-feature.md      # Feature implementation workflow
        └── review.md           # Pre-PR code review
```

## Quick Start

1. **Clone this repo** (or use as template)
   ```bash
   git clone <this-repo> my-project
   cd my-project
   ```

2. **Create a Jira project** in your Atlassian instance

3. **Add your requirements**
   ```bash
   cp requirements.md.example requirements.md
   # Edit requirements.md with your project details
   ```

4. **Start Claude Code**
   ```bash
   claude
   ```

5. **Generate Jira stories from requirements**
   ```
   /init-project YOUR-PROJECT-KEY
   ```

6. **Start implementing**
   ```
   /jira-task YOUR-PROJECT-KEY-1
   ```

## Jira Authentication

On first use of any Jira command, Claude will prompt you to authenticate via OAuth in your browser. This is a one-time setup per session.

## Custom Commands

| Command | Description |
|---------|-------------|
| `/init-project PROJ [file]` | Read requirements and create Jira epics/stories |
| `/jira-task PROJ-123` | Fetch issue and plan implementation |
| `/new-feature <desc>` | Implement with explore-plan-code-commit workflow |
| `/review` | Review changes before PR |

## Workflow

```
requirements.md → /init-project → Jira tickets → /jira-task → Implementation → /review → PR
```

See `CLAUDE.md` for detailed workflow documentation.
