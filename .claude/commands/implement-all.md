# Implement All Stories

Automatically work through all stories in the backlog, analyzing dependencies and implementing in optimal order.

## Arguments

$ARGUMENTS - `<project-key> [--wait | --batch]`

- **project-key** (required): Jira project key (e.g., `ACME`, `TODOAPP`)
- **--wait** (optional): Wait for PR approval before starting next story (default)
- **--batch** (optional): Create all PRs without waiting for approval

### Examples
```
/implement-all ACME                # Wait mode (default) - one story at a time
/implement-all ACME --wait         # Explicit wait mode
/implement-all ACME --batch        # Batch mode - create all PRs at once
```

## Instructions

### Step 1: Fetch Stories from Jira

Use jira-cli to fetch all stories:
```bash
jira issue list -P<PROJECT> -tStory -s"Backlog" -s"To Do" --plain --columns key,summary,status
```
- Project key from arguments
- Status: Backlog or To Do (not already In Progress or Done)
- For each story, get details: `jira issue view <KEY>`

### Step 2: Analyze Dependencies

Analyze the stories to determine implementation order:

1. **Read each story's description and acceptance criteria**
2. **Identify dependencies**:
   - Explicit: "Depends on PROJ-X" or "Requires PROJ-Y"
   - Implicit: Story B needs API from Story A, Story C needs UI component from Story B
3. **Build dependency graph**
4. **Determine optimal order** using topological sort:
   - Foundation/infrastructure stories first
   - Stories with no dependencies before those that depend on them
   - Group related stories when possible

### Step 3: Present Implementation Plan

Show the user the planned order:

```
## Implementation Plan

I've analyzed [N] stories and determined the following order based on dependencies:

### Implementation Order
1. **PROJ-1**: [Title] - Foundation (no dependencies)
2. **PROJ-3**: [Title] - Depends on PROJ-1
3. **PROJ-2**: [Title] - Depends on PROJ-1
4. **PROJ-4**: [Title] - Depends on PROJ-2, PROJ-3
...

### Dependency Graph
PROJ-1 → PROJ-3 → PROJ-4
       ↘ PROJ-2 ↗

### Mode: [Wait for approval | Batch all PRs]

Ready to begin? (yes/no/reorder)
```

**Wait for user confirmation before proceeding.**

### Step 4: Implement Stories

For each story in order:

#### 4.1: Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/[PROJ-X]-[description]
```

#### 4.2: Update Jira Status
Set story status to "In Progress":
```bash
jira issue move <KEY> "In Progress"
```

#### 4.3: Implement the Story
- Read the story requirements and acceptance criteria
- Implement the feature
- Write tests as needed
- Ensure all acceptance criteria are met

#### 4.4: Run Review
Execute the `/review` workflow:
- Run tests
- Check linting
- Verify changes

#### 4.5: Create PR
```bash
git push -u origin feature/[PROJ-X]-[description]
gh pr create --base main --fill
```

Update Jira status to "In Review":
```bash
jira issue move <KEY> "In Review"
```

#### 4.6: Handle Mode

**If --wait mode (default):**
```
PR created for PROJ-X: [PR URL]

Waiting for PR approval and merge before continuing to next story.
Let me know when merged, or say "skip" to move to next story.

Progress: [X/N] stories complete
Remaining: PROJ-Y, PROJ-Z, ...
```
- Wait for user to confirm merge or skip
- After merge, continue to next story

**If --batch mode:**
```
PR created for PROJ-X: [PR URL]
Moving to next story...
```
- Immediately continue to next story
- Each story gets its own branch from latest main

### Step 5: Summary

After all stories are complete (or PRs created in batch mode):

```
## Implementation Complete

### PRs Created
| Story | Title | PR | Status |
|-------|-------|-----|--------|
| PROJ-1 | [Title] | #1 | Merged |
| PROJ-2 | [Title] | #2 | Open |
...

### Stats
- Stories implemented: X
- PRs merged: Y
- PRs pending review: Z

### Next Steps
[If batch mode]: Review and merge open PRs
[If wait mode]: All stories merged, ready for next phase
```

## Error Handling

- **Merge conflict**: Stop, notify user, provide resolution steps
- **Tests failing**: Stop on that story, show failures, ask how to proceed
- **Jira CLI error**: Check JIRA_API_TOKEN is set; retry, then continue without status update if needed
- **No stories found**: Notify user, check project key and filters

## Important Rules

- **Always create feature branch from main** before starting each story
- **Never force push or merge without approval**
- **In wait mode**: Do not start next story until current PR is merged or skipped
- **In batch mode**: Always branch from latest main to minimize conflicts
- **Update Jira status** as work progresses (In Progress → In Review → Done)
