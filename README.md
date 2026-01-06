# Claude Code Full-Stack Template

A [Cookiecutter](https://cookiecutter.readthedocs.io/) template for creating full-stack projects optimized for [Claude Code](https://claude.ai/code) agentic workflows.

## Features

- **Full-stack scaffolding**: React + Vite frontend with choice of Node.js or Python/Flask backend
- **Claude Code optimized**: Comprehensive `CLAUDE.md` with commands, workflows, and conventions
- **Jira integration**: Optional MCP server configuration for Jira issue tracking
- **GitHub Actions CI**: Automated testing and linting on pull requests
- **Custom slash commands**: `/jira-task`, `/new-feature`, `/review` workflows
- **Multi-agent patterns**: Git worktree setup for parallel development

## Usage

### Prerequisites

- Python 3.8+ (for cookiecutter)
- Node.js 20+
- Python 3.11+ (if using Python backend)

### Generate a New Project

```bash
# Install cookiecutter if you haven't already
pip install cookiecutter

# Generate a project from this template
cookiecutter /path/to/agentic-coding-poc

# Or directly from GitHub (once published)
# cookiecutter gh:your-username/agentic-coding-poc
```

### Template Options

| Option | Description | Default |
|--------|-------------|---------|
| `project_name` | Display name for the project | My Fullstack App |
| `backend_choice` | Backend stack (node/python) | node |
| `use_docker` | Include Docker Compose setup | yes |
| `enable_jira_integration` | Configure Atlassian MCP server | yes |
| `jira_project_key` | Jira project key (e.g., PROJ) | |
| `include_sample_app` | Include sample todo app | yes |

## Generated Project Structure

```
my-project/
├── CLAUDE.md                # Single source of truth for Claude Code
├── README.md
├── Makefile                 # Unified commands
├── .claude/
│   ├── settings.json       # MCP servers and permissions
│   └── commands/           # Custom slash commands
│       ├── jira-task.md
│       ├── new-feature.md
│       └── review.md
├── frontend/               # React + Vite + TypeScript
├── backend-node/           # Node.js + Express (if selected)
├── backend-python/         # Python + Flask (if selected)
└── .github/workflows/      # CI pipeline
```

## Workflow Overview

1. **Start from Jira**: Use `/jira-task PROJ-123` to fetch requirements
2. **Create branch**: Follow `feature/<jira-key>-<description>` convention
3. **Implement**: Use `/new-feature` for explore-plan-code-commit workflow
4. **Review**: Run `/review` to check code before PR
5. **Submit PR**: Create PR for human review via `gh pr create`
6. **Iterate**: Address feedback, rerun tests
7. **Merge**: Human merges approved PR to main

## Development

To modify this template:

```bash
# Clone the repository
git clone https://github.com/your-username/agentic-coding-poc
cd agentic-coding-poc

# Test generation locally
cookiecutter . --no-input project_name="Test Project"

# Check the generated output
cd test-project
```

## License

MIT
