# WORKFLOW.md

Shared workflow standards for all projects. This file can be synced to projects cloned from this template.

---

## Git Workflow

### Starting New Work
**ALWAYS create a feature branch from main before starting any new work:**
```bash
git checkout main
git pull origin main
git checkout -b feature/<jira-key>-<description>
jira issue move <jira-key> "In Progress"  # Update Jira status
```
Never commit directly to main. All work must happen on a feature branch.

### Branch Naming
- Features: `feature/<jira-key>-<description>`
- Bug fixes: `fix/<jira-key>-<description>`

### Jira Status Updates
Update Jira ticket status as work progresses:
- **Starting work** → Move ticket to "In Progress"
- **PR merged** → Move ticket to "Done"

### PR Process
1. Push branch: `git push -u origin <branch-name>`
2. Create PR: `gh pr create --base main --fill`
3. **Wait for human review** - DO NOT merge without approval
4. Address feedback, push updates
5. Human merges when approved
6. After merge: `jira issue move <jira-key> "Done"`

### After PR is Merged
1. Pull latest main: `git checkout main && git pull`
2. Delete feature branch: `git branch -d <branch-name>`
3. Update Jira: `jira issue move <KEY> "Done"`

---

## Syncing This File

For projects cloned from the template, sync the latest workflow standards:

```bash
# One-time setup: add template as a remote
git remote add template git@github.com:ripplcare/agentic-coding-poc.git

# Pull latest WORKFLOW.md
git fetch template
git checkout template/main -- WORKFLOW.md
git commit -m "chore: Sync WORKFLOW.md from template"
```
