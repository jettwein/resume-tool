"""Post-generation hook for conditional file removal and setup."""
import os
import shutil
import subprocess

# Paths to remove based on choices
REMOVE_PATHS = [
    # Remove Node.js backend if Python was chosen
    '{% if cookiecutter.backend_choice == "python" %}backend-node{% endif %}',
    # Remove Python backend if Node.js was chosen
    '{% if cookiecutter.backend_choice == "node" %}backend-python{% endif %}',
    # Remove Docker files if not using Docker
    '{% if cookiecutter.use_docker == "no" %}docker-compose.yml{% endif %}',
    '{% if cookiecutter.use_docker == "no" %}.dockerignore{% endif %}',
    # Remove sample app files if not wanted
    '{% if cookiecutter.include_sample_app == "no" %}frontend/src/components/TodoList.tsx{% endif %}',
    '{% if cookiecutter.include_sample_app == "no" %}frontend/src/components/AddTodo.tsx{% endif %}',
    '{% if cookiecutter.include_sample_app == "no" %}frontend/src/types/index.ts{% endif %}',
]


def remove_paths():
    """Remove files/directories that aren't needed based on choices."""
    for path in REMOVE_PATHS:
        path = path.strip()
        if path and os.path.exists(path):
            if os.path.isdir(path):
                shutil.rmtree(path)
                print(f"Removed directory: {path}")
            else:
                os.remove(path)
                print(f"Removed file: {path}")


def init_git():
    """Initialize git repository."""
    try:
        subprocess.run(['git', 'init'], check=True, capture_output=True)
        subprocess.run(['git', 'add', '.'], check=True, capture_output=True)
        subprocess.run(
            ['git', 'commit', '-m', 'Initial commit from cookiecutter-claude-fullstack'],
            check=True,
            capture_output=True
        )
        print("Initialized git repository with initial commit")
    except subprocess.CalledProcessError as e:
        print(f"Warning: Git initialization failed: {e}")


def print_next_steps():
    """Print helpful next steps for the user."""
    project_name = '{{ cookiecutter.project_name }}'
    project_slug = '{{ cookiecutter.project_slug }}'
    enable_jira = '{{ cookiecutter.enable_jira_integration }}'

    print("\n" + "=" * 60)
    print(f"SUCCESS! Created {project_name}")
    print("=" * 60)
    print("\nNext steps:")
    print(f"  cd {project_slug}")
    print("  claude  # Start Claude Code")
    print("\nUseful commands:")
    print("  make dev      # Start development servers")
    print("  make test     # Run all tests")
    print("  make lint     # Lint all code")
    if enable_jira == 'yes':
        print("\nJira Integration:")
        print("  The Atlassian MCP server is configured.")
        print("  On first Jira command, authenticate via OAuth in your browser.")
    print("\nFor multi-agent workflows, see CLAUDE.md")
    print("=" * 60 + "\n")


if __name__ == '__main__':
    remove_paths()
    init_git()
    print_next_steps()
