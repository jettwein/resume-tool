"""Pre-generation hook for validation."""
import re
import sys


def validate_project_slug():
    """Ensure project_slug is valid for package/directory naming."""
    project_slug = '{{ cookiecutter.project_slug }}'

    if not re.match(r'^[a-z][a-z0-9-]*$', project_slug):
        print(f"ERROR: '{project_slug}' is not a valid project slug.")
        print("Must start with lowercase letter, contain only lowercase letters, numbers, and hyphens.")
        sys.exit(1)


def validate_jira_config():
    """Warn if Jira is enabled but project key is empty."""
    enable_jira = '{{ cookiecutter.enable_jira_integration }}'
    jira_key = '{{ cookiecutter.jira_project_key }}'.strip()

    if enable_jira == 'yes' and not jira_key:
        print("WARNING: Jira integration enabled but no project key provided.")
        print("You can add the project key later in CLAUDE.md")


if __name__ == '__main__':
    validate_project_slug()
    validate_jira_config()
