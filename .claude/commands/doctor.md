# Doctor - Diagnose Setup Issues

Run diagnostics to verify your development environment and project configuration.

## Instructions

You are a diagnostic tool. Run through each check, report results clearly, and provide actionable fixes for any issues found.

### Output Format

For each check, output one of:
- ✅ **Check name** — passed
- ⚠️ **Check name** — warning (works but could be better)
- ❌ **Check name** — failed (needs fixing)

At the end, provide a summary and any recommended actions.

---

### Check 1: Git Repository

```bash
git rev-parse --is-inside-work-tree 2>/dev/null && git remote get-url origin 2>/dev/null
```

- ✅ if inside a git repo with a remote
- ❌ if not a git repo or no remote configured

---

### Check 2: GitHub CLI

```bash
gh auth status 2>&1
```

- ✅ if authenticated
- ❌ if not authenticated → "Run: gh auth login"

---

### Check 3: Jira CLI

```bash
jira me 2>&1
```

- ✅ if returns user info
- ❌ if not configured → "See docs/ONBOARDING.md for jira-cli setup"

---

### Check 4: Jira Project Access

Only run this if Check 3 passed. Look for a Jira project key in CLAUDE.md:

```bash
grep -E "Project key:|project:" CLAUDE.md 2>/dev/null | head -1
```

If a project key is found, verify access:
```bash
jira project view <PROJECT_KEY> 2>&1
```

- ✅ if project is accessible
- ⚠️ if no project key found in CLAUDE.md → "Consider adding your Jira project key to CLAUDE.md"
- ❌ if project key found but not accessible → "Check your Jira permissions for this project"

---

### Check 5: Claude Commands Directory

```bash
ls .claude/commands/*.md 2>/dev/null | wc -l
```

- ✅ if commands exist
- ❌ if no commands → "Run /adopt to set up the workflow"

---

### Check 6: GitHub Workflows

```bash
ls .github/workflows/*.yml 2>/dev/null
```

Check for expected files:
- `claude.yml` — @claude PR reviews
- `auto-review.yml` — automatic code review
- `slack-notifications.yml` — Slack notifications

- ✅ if all three exist
- ⚠️ if some are missing → list which ones (might be intentional)
- ❌ if `.github/workflows/` doesn't exist → "Run /adopt to set up GitHub Actions"

---

### Check 7: CLAUDE.md Configuration

```bash
cat CLAUDE.md 2>/dev/null | head -50
```

Check for customization:
- Is "Project Overview" section filled in (not just placeholder comments)?
- Is tech stack defined?
- Is Jira project key specified (if using Jira)?

- ✅ if CLAUDE.md exists and appears customized
- ⚠️ if CLAUDE.md exists but has placeholder text → "Customize CLAUDE.md with your project details"
- ❌ if CLAUDE.md doesn't exist → "Run /adopt or create CLAUDE.md"

---

### Check 8: Global /adopt Command

```bash
ls ~/.claude/commands/adopt.md 2>/dev/null
```

- ✅ if exists
- ⚠️ if missing → "Install global /adopt: ln -sf ~/repos/agentic-coding-framework/.claude/commands/adopt.md ~/.claude/commands/adopt.md"

---

### Check 9: Git Branch Hygiene

```bash
git branch --show-current
```

- ✅ if on a feature branch (not main/master)
- ⚠️ if on main/master → "Create a feature branch before making changes"

---

### Summary

After all checks, output a summary like:

```
## Diagnosis Complete

✅ 7 checks passed
⚠️ 2 warnings
❌ 1 issue needs fixing

### Action Items:
1. ❌ Run `gh auth login` to authenticate GitHub CLI
2. ⚠️ Customize CLAUDE.md with your project details
3. ⚠️ Create a feature branch before starting work
```

If everything passes:
```
## Diagnosis Complete

✅ All 9 checks passed — you're ready to go!
```

---

## Notes

- Be concise but helpful
- For failures, always provide the fix command or point to docs
- Don't stop on first failure — run all checks so user sees full picture
