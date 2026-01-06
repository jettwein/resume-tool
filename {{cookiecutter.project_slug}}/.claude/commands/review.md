# Code Review Command

Review current changes against project standards.

## Instructions

1. Run `git diff` to see all staged and unstaged changes
2. Run the test suite: `make test`
3. Run linting: `make lint`
4. Check each changed file against:
   - [ ] Follows project code style
   - [ ] Has appropriate test coverage
   - [ ] No hardcoded values or secrets
   - [ ] Error handling is appropriate
   - [ ] Types are properly defined
   - [ ] No debug statements (console.log/print) unless intentional logging

5. Provide review summary with the format below

## Output Format

```
## Code Review: [branch-name]

### Summary
[1-2 sentence overview of changes]

### Test Results
- Tests: [PASS/FAIL] ([X] passed, [Y] failed)
- Lint: [PASS/FAIL]

### Issues Found
- [ ] [Issue 1 with file:line reference]
- [ ] [Issue 2 with file:line reference]

### Suggestions
- [Optional improvement suggestions]

### Verdict
[READY FOR PR / NEEDS CHANGES]
```

If NEEDS CHANGES, list specific items that must be addressed before PR creation.
