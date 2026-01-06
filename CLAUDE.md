# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a starter repo for Claude Code projects with GitHub and Jira integration. Use it as a starting point for new projects where you want Claude to help with:
- Reading requirements and creating Jira user stories
- Implementing features from Jira tickets
- Managing git workflow (branches, PRs)

## Jira Integration

The Atlassian MCP server is configured in `.claude/settings.json`. On first use:
1. Claude will prompt for OAuth authentication
2. Authorize in browser when redirected
3. Return to Claude Code to continue

## Custom Commands

### `/init-project <PROJECT-KEY> [requirements-file]`
Read a requirements document and create Jira epics/stories.
```
/init-project PROJ                    # Uses requirements.md
/init-project PROJ docs/prd.md        # Uses custom file
```

### `/jira-task <ISSUE-KEY>`
Fetch a Jira issue and plan implementation.
```
/jira-task PROJ-123
```

### `/new-feature <description>`
Implement a feature using explore-plan-code-commit workflow.

### `/review`
Review current changes before creating a PR.

## Workflow: Requirements → Jira → Implementation

1. **Add requirements**: Copy `requirements.md.example` to `requirements.md` and fill in your project details
2. **Create Jira project**: Manually create a Jira project (one-time setup)
3. **Generate stories**: Run `/init-project PROJ` to create epics and user stories
4. **Implement**: Use `/jira-task PROJ-X` to work on individual tickets
5. **Review**: Run `/review` before creating PRs
6. **Submit PR**: Use `gh pr create` for human review

## Git Workflow

### Branch Naming
- Features: `feature/<jira-key>-<description>` (e.g., `feature/PROJ-123-add-auth`)
- Bug fixes: `fix/<jira-key>-<description>`

### PR Process
1. Push branch: `git push -u origin <branch-name>`
2. Create PR: `gh pr create --base main --fill`
3. Wait for human review - DO NOT merge without approval
