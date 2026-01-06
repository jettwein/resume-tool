# Jira Task Workflow

Read a Jira issue and prepare for implementation.

## Arguments

$ARGUMENTS - The Jira issue key (e.g., {{ cookiecutter.jira_project_key }}-123)

## Instructions

1. Fetch the Jira issue specified: $ARGUMENTS
2. Extract and summarize:
   - Title and description
   - Acceptance criteria
   - Story points (if available)
   - Related issues or blockers
3. Propose a feature branch name following the convention: `feature/<issue-key>-<short-description>`
4. Create an implementation plan based on the requirements
5. Wait for user approval before starting implementation

## Output Format

```
## Issue Summary: [ISSUE_KEY]
**Title**: [title]
**Type**: [bug/story/task]
**Points**: [points or "unestimated"]

### Requirements
[Extracted requirements as bullet points]

### Acceptance Criteria
[Extracted acceptance criteria]

### Proposed Implementation Plan
1. [Step 1]
2. [Step 2]
...

### Branch Name
`feature/[ISSUE_KEY]-[short-description]`

Ready to proceed? (yes/no)
```
