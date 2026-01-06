# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Cookiecutter template for generating full-stack projects optimized for Claude Code agentic workflows. It generates React + Node.js/Python projects with Jira integration and GitHub Actions CI.

## Repository Structure

```
agentic-coding-poc/
├── cookiecutter.json                    # Template configuration
├── hooks/
│   ├── pre_gen_project.py              # Validation hook
│   └── post_gen_project.py             # Cleanup and git init hook
└── {{cookiecutter.project_slug}}/       # Template files (Jinja2)
    ├── CLAUDE.md                        # Generated Claude instructions
    ├── .claude/                         # Claude configuration
    ├── frontend/                        # React scaffold
    ├── backend-node/                    # Node.js scaffold
    ├── backend-python/                  # Python scaffold
    └── .github/workflows/               # CI configuration
```

## Testing the Template

```bash
# Generate a test project with Node.js backend
cookiecutter . --no-input project_name="Test Node" backend_choice=node

# Generate a test project with Python backend
cookiecutter . --no-input project_name="Test Python" backend_choice=python

# Clean up test projects
rm -rf test-node test-python
```

## Template Variables

Key variables in `cookiecutter.json`:
- `backend_choice`: "node" or "python" - determines which backend scaffold to include
- `enable_jira_integration`: "yes" or "no" - controls MCP server configuration
- `use_docker`: "yes" or "no" - includes docker-compose.yml
- `include_sample_app`: "yes" or "no" - includes todo app example

## Jinja2 Conventions

- Files use `{% if %}` blocks for conditional content
- Post-generation hook removes unused directories (e.g., backend-node when python is selected)
- Use `{% raw %}{{{% endraw %}` when you need literal double braces in output
