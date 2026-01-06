# Initialize Project from Requirements

Read a requirements document and create a project plan with Jira user stories.

## Arguments

$ARGUMENTS - `<project-key> [requirements-file]`

- **project-key** (required): Jira project key (e.g., `PROJ`, `MYAPP`)
- **requirements-file** (optional): Path to requirements file (defaults to `requirements.md`)

### Examples
```
/init-project PROJ                      # Uses PROJ project, reads requirements.md
/init-project MYAPP docs/prd.md         # Uses MYAPP project, reads docs/prd.md
```

## Prerequisites

- Jira project must already exist in your Atlassian instance
- Atlassian MCP server authenticated (OAuth will prompt on first use)

## Instructions

### Step 1: Read Requirements Document

Read the requirements file specified (or `requirements.md` by default). Extract:
- Project overview/goals
- Functional requirements
- Non-functional requirements
- User personas (if specified)
- Acceptance criteria

### Step 2: Generate Project Plan

Create a high-level implementation plan:
1. Break down into epics (major feature areas)
2. Identify dependencies between features
3. Suggest implementation order
4. Estimate complexity (S/M/L) for each epic

### Step 3: Generate User Stories

For each epic, create well-formed user stories following this format:

```
**Title**: [Action-oriented title]

**As a** [user persona],
**I want** [functionality],
**So that** [benefit/value].

**Acceptance Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

**Technical Notes**:
[Implementation hints, API endpoints needed, etc.]

**Complexity**: [S/M/L]
**Epic**: [Parent epic name]
```

### Step 4: Review with User

Present the plan and user stories to the user for review:

```
## Project Plan: [Project Name]

### Epics
1. [Epic 1] - [X stories, complexity: M]
2. [Epic 2] - [Y stories, complexity: L]
...

### User Stories Summary
[List all story titles grouped by epic]

### Suggested Implementation Order
1. [Epic/Story] - Foundation work
2. [Epic/Story] - Core features
3. [Epic/Story] - Enhancements
...

Ready to create [N] Jira tickets? (yes/no/modify)
```

### Step 5: Create Jira Tickets

Once approved, use the Atlassian MCP server to bulk create tickets:

1. Create Epic tickets first (issue type: Epic)
2. Create Story tickets linked to their parent Epic
3. Add labels: `generated-from-requirements`
4. Set initial status to Backlog

### Step 6: Output Summary

Provide a summary of created tickets (using the project key from arguments):

```
## Created Jira Tickets

### Epics
- [PROJECT]-1: [Epic title]
- [PROJECT]-2: [Epic title]

### Stories
| Key | Title | Epic | Complexity |
|-----|-------|------|------------|
| [PROJECT]-3 | [Title] | Epic 1 | M |
| [PROJECT]-4 | [Title] | Epic 1 | S |
...

Total: [N] tickets created

Next steps:
1. Review and prioritize tickets in Jira
2. Assign to sprint
3. Use `/jira-task [PROJECT]-X` to start implementation
```

## Error Handling

- If project key not provided: Ask user for the Jira project key
- If requirements file not found: Prompt user for correct path
- If Jira auth fails: Guide user through OAuth flow
- If ticket creation fails: Log which tickets succeeded, retry failed ones
