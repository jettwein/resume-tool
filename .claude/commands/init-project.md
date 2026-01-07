# Initialize Project from Requirements

Read a requirements document and create a project plan with Jira user stories.

## Arguments

$ARGUMENTS - `<project-key> [requirements-file]`

- **project-key** (required): Jira project key (e.g., `ACME`, `TODOAPP`)
- **requirements-file** (optional): Path to requirements file (defaults to `requirements.md`)

### Examples
```
/init-project ACME                      # Uses ACME project, reads requirements.md
/init-project TODOAPP docs/prd.md       # Uses TODOAPP project, reads docs/prd.md
```

## Prerequisites

- Jira project must already exist in your Atlassian instance
- jira-cli installed and configured (see CLAUDE.md for setup)

## Instructions

### Phase 1: Plan Mode - Define What to Build

**Enter plan mode** to collaboratively define the project scope.

#### Step 1.1: Read Requirements Document

Read the requirements file specified (or `requirements.md` by default). Extract:
- Project overview/goals
- Functional requirements
- Non-functional requirements
- User personas (if specified)
- Technical constraints

#### Step 1.2: Generate Project Plan

Create a high-level implementation plan:
1. Break down into epics (major feature areas)
2. Identify dependencies between features
3. Suggest implementation order
4. Estimate complexity (S/M/L) for each epic

#### Step 1.3: Draft User Stories

For each epic, draft well-formed user stories following this format:

```
### [Story Title]

**As a** [user persona],
**I want** [functionality],
**So that** [benefit/value].

**Acceptance Criteria**:

**GIVEN** [initial context/state]
**WHEN** [action taken]
**THEN** [expected outcome]

**GIVEN** [another context]
**WHEN** [another action]
**THEN** [another outcome]

**Epic**: [Parent epic name]
**Complexity**: [S/M/L]
```

#### Step 1.4: Write Stories Document for Review

Write all stories to `stories.md` in the project root with this structure:

```markdown
# Project Stories: [Project Name]

## Summary
- **Total Epics**: X
- **Total Stories**: Y
- **Jira Project**: [PROJECT-KEY]

## Epics Overview
1. [Epic 1 Name] - [brief description]
2. [Epic 2 Name] - [brief description]
...

## Stories by Epic

### Epic 1: [Epic Name]

#### [Story 1 Title]
**As a** [persona], **I want** [functionality], **So that** [benefit].

**Acceptance Criteria**:
**GIVEN** [context]
**WHEN** [action]
**THEN** [outcome]

**Complexity**: S/M/L

---

#### [Story 2 Title]
...

### Epic 2: [Epic Name]
...
```

#### Step 1.5: Present for Review

Tell the user:
```
I've written the project stories to `stories.md` for your review.

Summary:
- X epics
- Y user stories
- Target Jira project: [PROJECT-KEY]

Please review and let me know:
- "approved" - Create all tickets in Jira
- Request changes - Tell me what to modify

To make changes, you can either:
1. Edit `stories.md` directly and tell me when done
2. Ask me to change specific stories (e.g., "update Story X to...", "remove the login story", "add a story for...")

I will NOT create any Jira tickets until you explicitly approve.
```

**STOP and wait for user approval.** Do not proceed to Phase 2 until the user explicitly approves.

#### Step 1.6: Iterate on Stories (If Requested)

If the user requests changes:
1. **Direct edits**: If user says they edited `stories.md` directly, read the file to see their changes
2. **Conversational changes**: If user describes changes in chat:
   - Update `stories.md` with the requested changes
   - Summarize what was changed
   - Ask if they want to make more changes or approve

Repeat until user says "approved". Support requests like:
- "Change story X to focus on..."
- "Remove the [story name] story"
- "Add a new story for [feature]"
- "Split story X into two stories"
- "Merge stories X and Y"
- "Update the acceptance criteria for story X"

---

### Phase 2: Create Jira Tickets (After Approval Only)

**Only proceed after user says "approved" or similar confirmation.**

#### Step 2.1: Create Epic Tickets

Use jira-cli to create Epic tickets first:
```bash
jira issue create -tEpic -P<PROJECT> -s"Epic Title" -b"Epic description"
```
- Add label: `generated-from-requirements`

#### Step 2.2: Create Story Tickets

For each story in `stories.md`, use jira-cli:
```bash
jira issue create -tStory -P<PROJECT> -s"Story Title" -b"Description with acceptance criteria" -lgenerated-from-requirements
```
- Link to parent Epic using: `jira issue link <story-key> <epic-key> "is child of"`
- Description includes:
  - User story (As a... I want... So that...)
  - Acceptance criteria in GIVEN/WHEN/THEN format

#### Step 2.3: Output Summary

Provide a summary of created tickets:

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
- If Jira auth fails: Check JIRA_API_TOKEN is set and jira-cli is configured (see CLAUDE.md)
- If ticket creation fails: Log which tickets succeeded, retry failed ones

## Important Rules

- **Never create Jira tickets without explicit user approval**
- Always write to `stories.md` first so user can review
- Use GIVEN/WHEN/THEN format for all acceptance criteria
- Wait for user to say "approved" before creating any tickets
