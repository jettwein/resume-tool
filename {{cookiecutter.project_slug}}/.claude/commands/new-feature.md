# New Feature Workflow

Implement a new feature following the explore-plan-code-commit pattern.

## Arguments

$ARGUMENTS - Description of the feature to implement

## Instructions

### 1. Explore
- Read relevant existing code to understand patterns
- DO NOT write any code yet
- Identify similar features as reference
- Note conventions and patterns used

### 2. Plan
- Create detailed implementation plan
- Break into discrete, testable steps
- Identify files to create/modify
- Consider parallel task decomposition (frontend vs backend)

### 3. Code
- Write tests first (TDD approach) when applicable
- Implement incrementally
- Run tests after each significant change
- Follow existing code conventions

### 4. Commit
- Create atomic commits with clear messages
- Each commit should be a logical unit
- Use conventional commit format: `<type>(<scope>): <subject>`
- Reference Jira issue if applicable

## Parallel Task Identification

If this feature can be parallelized:
- Identify independent frontend vs backend work
- Suggest git worktree setup for parallel Claude instances
- Provide clear boundaries for each parallel task
