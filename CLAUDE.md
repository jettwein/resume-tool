# CLAUDE.md

This file is the **single source of truth** for Claude Code when working in this repository. Both Claude and humans should update this file as the project evolves—adding rules, decisions, patterns, and learnings.

## About This File

- **Living document**: Update this file whenever you establish new patterns, make architectural decisions, or learn something important about the codebase
- **Claude should update**: When Claude discovers something important or establishes a new convention, it should add it here
- **Humans should update**: When humans make decisions or want to guide Claude's behavior, add it here
- **Read first**: Claude should always read this file at the start of a session

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

The Atlassian MCP server is configured in `.claude/settings.json`. On first use:
1. Claude will prompt for OAuth authentication
2. Authorize in browser when redirected
3. Return to Claude Code to continue

---

## Custom Commands

| Command | Description |
|---------|-------------|
| `/init-project PROJ [file]` | Read requirements and create Jira epics/stories |
| `/jira-task PROJ-123` | Fetch issue and plan implementation |
| `/new-feature <desc>` | Implement with explore-plan-code-commit workflow |
| `/review` | Review changes before PR |

---

## Workflow: Requirements → Jira → Implementation

1. **Add requirements**: Copy `requirements.md.example` to `requirements.md`
2. **Create Jira project**: Manually create in Atlassian (one-time)
3. **Generate stories**: `/init-project PROJ`
4. **Parallelize if possible**: Identify independent stories for concurrent work
5. **Implement**: `/jira-task PROJ-X` for each story
6. **Review**: `/review` before PR
7. **Submit PR**: `gh pr create` for human review
8. **Human merges**: After approval, human merges to main

---

## Git Workflow

### Branch Naming
- Features: `feature/<jira-key>-<description>`
- Bug fixes: `fix/<jira-key>-<description>`

### PR Process
1. Push branch: `git push -u origin <branch-name>`
2. Create PR: `gh pr create --base main --fill`
3. **Wait for human review** - DO NOT merge without approval
4. Address feedback, push updates
5. Human merges when approved

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
