# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

{{ cookiecutter.project_description }}

**Stack**: React frontend + {% if cookiecutter.backend_choice == 'node' %}Node.js/Express{% else %}Python/Flask{% endif %} backend

## Quick Reference Commands

### Frontend (React + Vite + TypeScript)
```bash
cd frontend && npm install      # Install dependencies
cd frontend && npm run dev      # Start dev server (port 5173)
cd frontend && npm run build    # Production build
cd frontend && npm run test     # Run tests with Vitest
cd frontend && npm run lint     # ESLint check
cd frontend && npm run typecheck # TypeScript check
```

{% if cookiecutter.backend_choice == 'node' %}
### Backend (Node.js + Express + TypeScript)
```bash
cd backend-node && npm install  # Install dependencies
cd backend-node && npm run dev  # Start dev server (port 3000)
cd backend-node && npm run build # Compile TypeScript
cd backend-node && npm run test # Run tests with Jest
cd backend-node && npm run lint # ESLint check
```
{% else %}
### Backend (Python + Flask)
```bash
cd backend-python && pip install -e ".[dev]"  # Install with dev deps
cd backend-python && flask run --port 3000    # Start dev server
cd backend-python && pytest                    # Run tests
cd backend-python && ruff check .             # Lint check
cd backend-python && ruff format .            # Format code
cd backend-python && mypy app                 # Type check
```
{% endif %}

### Full Stack
```bash
make dev          # Start all services
make test         # Run all tests
make lint         # Lint all code
make build        # Build for production
{% if cookiecutter.use_docker == 'yes' %}make clean        # Remove containers and volumes{% endif %}
```

## Git Workflow

### Branch Naming Convention
- Feature branches: `feature/<jira-key>-<short-description>` (e.g., `feature/PROJ-123-add-auth`)
- Bug fixes: `fix/<jira-key>-<short-description>`
- Hotfixes: `hotfix/<jira-key>-<short-description>`

### Creating a Feature Branch
```bash
git checkout {{ cookiecutter.default_branch }}
git pull origin {{ cookiecutter.default_branch }}
git checkout -b feature/PROJ-XXX-description
```

### Pull Request Process
1. Push branch to origin: `git push -u origin <branch-name>`
2. Create PR via: `gh pr create --base {{ cookiecutter.default_branch }} --fill`
3. Request human review - DO NOT merge without approval
4. After approval, squash merge to {{ cookiecutter.default_branch }}

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

Refs: PROJ-XXX
```
Types: feat, fix, docs, style, refactor, test, chore

{% if cookiecutter.enable_jira_integration == 'yes' %}
## Jira Integration

### MCP Server Setup
The Atlassian MCP server is configured in `.claude/settings.json`. On first use:
1. Claude will prompt for OAuth authentication
2. Authorize in browser when redirected
3. Return to Claude Code to continue

### Reading Jira Issues
Use the `/jira-task` command or ask Claude directly:
- "Read Jira issue {{ cookiecutter.jira_project_key }}-123"
- "Get the acceptance criteria from {{ cookiecutter.jira_project_key }}-123"
- "List open issues in {{ cookiecutter.jira_project_key }}"

### Updating Jira from Claude
- "Add comment to {{ cookiecutter.jira_project_key }}-123: Implementation complete"
- "Transition {{ cookiecutter.jira_project_key }}-123 to In Review"

### Workflow: Jira Issue to Implementation
1. Read issue: "Fetch {{ cookiecutter.jira_project_key }}-XXX and summarize requirements"
2. Create branch: Follow branch naming convention above
3. Implement: Use explore-plan-code-commit workflow
4. Update Jira: Add implementation notes as comment
5. Create PR: Link to Jira issue in PR description

### Workflow: Requirements to Jira Tickets
Use `/init-project` to bootstrap a project from a requirements document:

1. **Prepare requirements**: Copy `requirements.md.example` to `requirements.md` and fill in your project details
2. **Run init-project**: Execute `/init-project` (or `/init-project path/to/requirements.md`)
3. **Review plan**: Claude will generate epics and user stories for your approval
4. **Create tickets**: Once approved, Claude bulk-creates Jira tickets
5. **Start development**: Use `/jira-task {{ cookiecutter.jira_project_key }}-X` to implement each ticket

This workflow is ideal for:
- Starting a new project from a PRD or requirements doc
- Converting meeting notes into actionable tickets
- Breaking down a large feature into trackable stories
{% endif %}

## Multi-Agent Workflows

### Git Worktree Pattern for Parallel Development
When working on independent features simultaneously:

```bash
# Create worktrees for parallel work
git worktree add ../{{ cookiecutter.project_slug }}-feature-a feature/PROJ-001-feature-a
git worktree add ../{{ cookiecutter.project_slug }}-feature-b feature/PROJ-002-feature-b

# Run Claude in each worktree (separate terminals)
cd ../{{ cookiecutter.project_slug }}-feature-a && claude
cd ../{{ cookiecutter.project_slug }}-feature-b && claude

# Clean up worktrees when done
git worktree remove ../{{ cookiecutter.project_slug }}-feature-a
git worktree remove ../{{ cookiecutter.project_slug }}-feature-b
```

### Task Decomposition Pattern
For complex features, decompose into parallel-safe tasks:
1. **Frontend task**: UI components, state management
2. **Backend task**: API endpoints, business logic
3. **Integration task**: Connect frontend to backend (depends on 1 & 2)

## Code Review Workflow

### Before Requesting Review
1. All tests pass: `make test`
2. Code is linted: `make lint`
3. Branch is up to date with {{ cookiecutter.default_branch }}

### Review Checklist
- [ ] Code follows project conventions
- [ ] Tests cover new functionality
- [ ] No hardcoded secrets or credentials
- [ ] Error handling is appropriate
- [ ] Documentation updated if needed

### Using /review Command
Run `/review` to have Claude analyze the current changes against this checklist.

## Project Structure

```
{{ cookiecutter.project_slug }}/
├── frontend/              # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── types/        # TypeScript type definitions
│   │   ├── App.tsx       # Main app component
│   │   └── main.tsx      # Entry point
│   └── tests/            # Frontend tests
{% if cookiecutter.backend_choice == 'node' %}
├── backend-node/          # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── types/        # TypeScript type definitions
│   │   └── index.ts      # Server entry point
│   └── tests/            # Backend tests
{% else %}
├── backend-python/        # Python + Flask
│   ├── app/
│   │   ├── routes/       # API route handlers
│   │   └── __init__.py   # Flask app factory
│   └── tests/            # Backend tests
{% endif %}
├── .claude/              # Claude Code configuration
│   ├── settings.json     # MCP servers and permissions
│   └── commands/         # Custom slash commands
└── .github/workflows/    # CI/CD pipelines
```

## API Conventions

- REST endpoints follow pattern: `/api/v1/<resource>`
- Use plural nouns for resources: `/api/v1/users`, `/api/v1/todos`
- Return JSON with consistent structure: `{ "data": ..., "error": null }`

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api/v1
```

### Backend (.env)
{% if cookiecutter.backend_choice == 'node' %}
```
NODE_ENV=development
PORT=3000
```
{% else %}
```
FLASK_ENV=development
FLASK_DEBUG=1
```
{% endif %}

**IMPORTANT**: Never commit .env files. Use .env.example as a template.
