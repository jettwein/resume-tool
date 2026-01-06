# {{ cookiecutter.project_name }}

{{ cookiecutter.project_description }}

## Stack

- **Frontend**: React + Vite + TypeScript
{% if cookiecutter.backend_choice == 'node' %}- **Backend**: Node.js + Express + TypeScript{% else %}- **Backend**: Python + Flask{% endif %}
{% if cookiecutter.use_docker == 'yes' %}- **Development**: Docker Compose{% endif %}

## Getting Started

### Prerequisites

- Node.js {{ cookiecutter.node_version }}+
{% if cookiecutter.backend_choice == 'python' %}- Python {{ cookiecutter.python_version }}+{% endif %}
{% if cookiecutter.use_docker == 'yes' %}- Docker and Docker Compose{% endif %}

### Installation

```bash
make install
```

### Development

{% if cookiecutter.use_docker == 'yes' %}
```bash
make dev
```

This starts all services via Docker Compose:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
{% else %}
Start the frontend and backend in separate terminals:

```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
{% if cookiecutter.backend_choice == 'node' %}cd backend-node && npm run dev{% else %}cd backend-python && flask run --port 3000{% endif %}
```
{% endif %}

### Testing

```bash
make test
```

### Linting

```bash
make lint
```

## Using Claude Code

This project is optimized for use with [Claude Code](https://claude.ai/code). See `CLAUDE.md` for detailed instructions on:

- Available commands and workflows
- Git branching conventions
- PR process
{% if cookiecutter.enable_jira_integration == 'yes' %}- Jira integration{% endif %}
- Multi-agent development patterns

### Custom Commands

- `/init-project` - Read requirements.md and create Jira epics/stories
- `/jira-task <issue-key>` - Fetch a Jira issue and plan implementation
- `/new-feature <description>` - Implement a feature with explore-plan-code-commit workflow
- `/review` - Review current changes before creating a PR
{% if cookiecutter.enable_jira_integration == 'yes' %}
## Jira Integration

This project uses the Atlassian MCP server for Jira integration. On first use:

1. Run any Jira-related command (e.g., `/jira-task {{ cookiecutter.jira_project_key }}-1`)
2. Authenticate via OAuth when prompted in your browser
3. Return to Claude Code to continue
{% endif %}

## Project Structure

```
{{ cookiecutter.project_slug }}/
├── frontend/              # React application
{% if cookiecutter.backend_choice == 'node' %}├── backend-node/          # Node.js API{% else %}├── backend-python/        # Python/Flask API{% endif %}
├── .claude/              # Claude Code configuration
├── .github/workflows/    # CI/CD pipelines
├── CLAUDE.md             # Claude Code instructions
└── Makefile              # Common commands
```

## License

Private
