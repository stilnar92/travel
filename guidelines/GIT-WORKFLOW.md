# Git Workflow

Git conventions for branching, commits, and pull requests.

---

## Overview

| Aspect | Convention |
|--------|------------|
| **Branching** | GitHub Flow (feature branches) |
| **Main branch** | `main` (always deployable) |
| **Staging branch** | `staging` (testing environment) |
| **Commits** | Conventional Commits |
| **PRs** | Required for all changes |

---

## Branch Strategy

### Branch Types

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | Production-ready code | Production |
| `staging` | Pre-release testing | Staging |
| `feature/*` | New features | Preview |
| `fix/*` | Bug fixes | Preview |
| `hotfix/*` | Urgent production fixes | Preview → Production |

### Naming Convention

```
<type>/<short-description>

# Examples
feature/vendor-search
feature/add-user-roles
fix/login-redirect
fix/date-picker-timezone
hotfix/auth-token-refresh
```

### Flow

```
main (production)
  │
  └── staging (testing)
        │
        ├── feature/vendor-search
        ├── feature/user-roles
        └── fix/login-bug
```

### Standard Flow

```
1. Create branch from staging
   git checkout staging
   git pull
   git checkout -b feature/my-feature

2. Work on feature (commit often)
   git add .
   git commit -m "feat: add vendor search"

3. Push and create PR to staging
   git push -u origin feature/my-feature
   # Create PR: feature/my-feature → staging

4. After review, merge to staging
   # Test on staging environment

5. When ready, PR staging → main
   # Deploy to production
```

### Hotfix Flow

```
1. Create branch from main
   git checkout main
   git pull
   git checkout -b hotfix/critical-fix

2. Fix the issue
   git commit -m "fix: resolve auth crash"

3. PR to main (skip staging for urgent fixes)
   # After merge, also merge main → staging
```

---

## Commit Messages

### Format (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add vendor search` |
| `fix` | Bug fix | `fix: resolve login redirect` |
| `refactor` | Code restructure (no behavior change) | `refactor: extract validation logic` |
| `style` | Formatting, whitespace | `style: format with prettier` |
| `docs` | Documentation | `docs: update API readme` |
| `test` | Add/update tests | `test: add vendor service tests` |
| `chore` | Maintenance, deps | `chore: update dependencies` |
| `perf` | Performance improvement | `perf: optimize query` |

### Scope (Optional)

```
feat(vendors): add search filter
fix(auth): resolve token refresh
refactor(ui): simplify button variants
```

### Examples

```bash
# Feature
feat: add vendor search functionality

# Feature with scope
feat(vendors): add category filter to search

# Bug fix
fix: resolve date picker timezone issue

# Fix with scope
fix(auth): handle expired refresh token

# Refactor
refactor: extract form validation to shared utils

# Breaking change (!)
feat!: change API response format

feat(api)!: rename vendor endpoints
```

### Rules

| Rule | Example |
|------|---------|
| Lowercase first letter | `feat: add search` not `feat: Add search` |
| No period at end | `feat: add search` not `feat: add search.` |
| Imperative mood | `add feature` not `added feature` |
| Max 72 chars | Keep subject line short |

### Body (Optional)

```bash
git commit -m "feat: add vendor search" -m "
Implements full-text search across vendor names and descriptions.
Uses Supabase text search with ranking.

Closes #123
"
```

---

## Pull Requests

### PR Title

Follow same format as commits:

```
feat: add vendor search functionality
fix: resolve login redirect issue
refactor: extract validation logic
```

### PR Description Template

```markdown
## Summary
Brief description of changes (1-2 sentences)

## Changes
- Added vendor search component
- Implemented Supabase full-text search
- Added search filters UI

## Testing
- [ ] Tested locally
- [ ] Tested on preview deployment
- [ ] Added/updated tests

## Screenshots (if UI changes)
[Attach screenshots]

## Related Issues
Closes #123
```

### PR Checklist

Before requesting review:

- [ ] Branch is up to date with target
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Lint passes
- [ ] Self-reviewed changes
- [ ] PR description is complete

### PR Size Guidelines

| Size | Lines Changed | Review Time |
|------|---------------|-------------|
| Small | < 100 | Quick review |
| Medium | 100-300 | Normal review |
| Large | 300-500 | Split if possible |
| Too Large | > 500 | Must split |

---

## Code Review

### For Authors

- Keep PRs focused and small
- Respond to feedback promptly
- Don't take feedback personally
- Explain complex changes in description
- Request re-review after addressing feedback

### For Reviewers

| Check | What to Look For |
|-------|------------------|
| **Correctness** | Does it work? Edge cases? |
| **Design** | Fits architecture? Maintainable? |
| **Complexity** | Can it be simpler? |
| **Tests** | Adequate coverage? |
| **Naming** | Clear and consistent? |
| **Security** | Any vulnerabilities? |

### Review Comments

```markdown
# Suggestion (non-blocking)
suggestion: Consider using early return here for readability

# Request (blocking)
request: This needs error handling for the null case

# Question
question: Why was this approach chosen over X?

# Nitpick (non-blocking)
nit: Typo in variable name
```

### Approval Guidelines

| Scenario | Action |
|----------|--------|
| All good | Approve |
| Minor issues | Approve with comments |
| Needs changes | Request changes |
| Questions | Comment, don't block |

---

## Merge Strategy

### Squash and Merge (Default)

- Combines all commits into one
- Cleaner history on main/staging
- Use for feature branches

### Merge Commit

- Preserves all commits
- Use for staging → main
- Shows full development history

### Rebase and Merge

- Linear history
- Use sparingly
- Never on shared branches

---

## Protected Branches

### main

- [ ] Require PR
- [ ] Require 1 approval
- [ ] Require status checks (build, lint, typecheck)
- [ ] No direct pushes
- [ ] No force pushes

### staging

- [ ] Require PR
- [ ] Require status checks
- [ ] No force pushes

---

## Common Operations

### Update Branch with Target

```bash
# Option 1: Merge (preferred)
git checkout feature/my-feature
git fetch origin
git merge origin/staging

# Option 2: Rebase (clean history, use with caution)
git checkout feature/my-feature
git fetch origin
git rebase origin/staging
```

### Undo Last Commit (Not Pushed)

```bash
# Keep changes staged
git reset --soft HEAD~1

# Keep changes unstaged
git reset HEAD~1

# Discard changes
git reset --hard HEAD~1
```

### Amend Last Commit (Not Pushed)

```bash
# Add more changes
git add .
git commit --amend --no-edit

# Change message
git commit --amend -m "new message"
```

### Cherry-Pick

```bash
# Apply specific commit to current branch
git cherry-pick <commit-hash>
```

### Stash Changes

```bash
# Save changes
git stash

# List stashes
git stash list

# Apply and remove
git stash pop

# Apply and keep
git stash apply
```

---

## Git Hooks (Husky)

### Pre-commit

```bash
# .husky/pre-commit
pnpm lint-staged
```

### lint-staged Config

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### Commit-msg (Optional)

```bash
# .husky/commit-msg
npx commitlint --edit $1
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
}
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Create feature branch | `git checkout -b feature/name` |
| Push branch | `git push -u origin feature/name` |
| Update from staging | `git merge origin/staging` |
| Undo last commit | `git reset --soft HEAD~1` |
| Amend commit | `git commit --amend` |
| Stash changes | `git stash` |
| Apply stash | `git stash pop` |
| Cherry-pick | `git cherry-pick <hash>` |
| Delete local branch | `git branch -d feature/name` |
| Delete remote branch | `git push origin --delete feature/name` |

---

## DO / DON'T

### DO

- Create branches from `staging`
- Write clear commit messages
- Keep PRs small and focused
- Update branch before merging
- Squash merge feature branches
- Request review from relevant people

### DON'T

- Push directly to `main` or `staging`
- Force push to shared branches
- Commit secrets or credentials
- Create huge PRs (500+ lines)
- Merge without tests passing
- Leave PRs open for too long
