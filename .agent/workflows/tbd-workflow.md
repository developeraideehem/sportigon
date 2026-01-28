---
description: Trunk-Based Development Workflow for Sportigon
---

# Trunk-Based Development (TBD) Workflow

This workflow guides you through making small, frequent commits directly to the `main` branch using trunk-based development principles.

## Prerequisites

- GitHub repository set up
- CI/CD pipeline configured (GitHub Actions)
- Feature flags system in place
- Local development environment running

---

## Daily Development Flow

### 1. Start Your Work Session

```bash
# Pull latest changes from main
git checkout main
git pull origin main

// turbo
# Install any new dependencies
npm install

// turbo
# Start development server
npm run dev
```

---

### 2. Plan Your Commit

**Break down features into small, bite-sized commits:**
- Each commit should be < 200 lines
- Focus on single responsibility
- Should take < 2 hours to complete

**Examples of good commit sizes:**
- ✅ "Add email validation to contact form"
- ✅ "Create MatchCard component"
- ✅ "Add loading state to LiveScores page"

**Examples of too-large commits:**
- ❌ "Implement entire payment system"
- ❌ "Refactor all components"
- ❌ "Add multiple new features"

---

### 3. Implement Your Change

**For incomplete features, use feature flags:**

```typescript
// src/pages/NewFeature.tsx
import { useFeatureFlag } from '@/lib/featureFlags';

export function NewFeature() {
  const isEnabled = useFeatureFlag('new-feature');
  
  if (!isEnabled) {
    return null; // Hide from users until ready
  }
  
  return <div>New Feature Content</div>;
}
```

**Update .env:**
```env
# Enable during development only
VITE_ENABLED_FEATURES=live-scores-api,new-feature
```

---

### 4. Test Locally

// turbo
```bash
# Run all tests
npm run test

# Run TypeScript type checking
npm run type-check

# Run linting
npm run lint

# Build to catch production issues
npm run build
```

**Fix any issues before committing!**

---

### 5. Commit and Push

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add email validation to contact form

- Add regex pattern for email validation
- Show error message for invalid emails
- Add unit tests for validation logic"

# Push directly to main
git push origin main
```

**Note:** For Sportigon, we commit directly to `main`. No feature branches needed for small changes!

---

### 6. Monitor CI Pipeline

**After pushing, watch GitHub Actions:**

1. Go to: `https://github.com/[username]/sportigon/actions`
2. Find your latest commit
3. Watch the CI pipeline run:
   - ✅ Tests pass
   - ✅ Build succeeds
   - ✅ Linting passes
   - ✅ Deploy to staging

**If CI fails:**
- Fix the issue immediately
- Commit the fix
- Push again

---

### 7. Verify on Staging

```bash
# Staging URL (auto-deployed after CI passes)
https://sportigon-staging.vercel.app
```

**Test your changes:**
- ✅ Feature works as expected
- ✅ No console errors
- ✅ Responsive design works
- ✅ No breaking changes to existing features

---

## When to Use Short-Lived Branches

**Use a branch ONLY if:**
- You need a code review from a teammate
- The change requires > 4 hours of work
- You're experimenting and may abandon the work

**Branch workflow:**
```bash
# Create short-lived branch
git checkout -b feature/quick-fix

# Make changes, commit
git add .
git commit -m "fix: resolve cache invalidation bug"

# Push and open PR
git push origin feature/quick-fix

# After review (within same day), merge and delete
git checkout main
git pull origin main
git branch -d feature/quick-fix
```

**Important:** Branches should live < 24 hours!

---

## Feature Flag Lifecycle

### 1. Add New Feature Behind Flag

```typescript
// .env
VITE_ENABLED_FEATURES=live-scores-api,my-new-feature
```

### 2. Develop Incrementally

Commit small pieces while feature is hidden:
- Commit 1: Add API endpoint
- Commit 2: Create UI component
- Commit 3: Wire up state management
- Commit 4: Add styling

### 3. Test in Staging

```env
# Staging .env
VITE_ENABLED_FEATURES=live-scores-api,my-new-feature
```

### 4. Release to Production

```env
# Production .env
VITE_ENABLED_FEATURES=live-scores-api,my-new-feature
```

### 5. Remove Flag (After Stable)

Once feature is stable for 2+ weeks, remove the flag:
```typescript
// Before
const isEnabled = useFeatureFlag('my-new-feature');
if (!isEnabled) return null;

// After
// Just render the feature directly
```

---

## Emergency Hotfix Process

**For critical production bugs:**

```bash
# 1. Fix the issue locally
# Make the smallest possible fix

# 2. Test thoroughly
npm run test
npm run build

# 3. Commit with "hotfix:" prefix
git commit -m "hotfix: resolve payment processing error"

# 4. Push to main
git push origin main

# 5. CI will auto-deploy to staging
# 6. Manually trigger production deployment via GitHub Actions

# 7. Monitor production
# Watch error logs, user reports
```

**Goal:** < 10 minutes from fix to production

---

## Daily Checklist

**Before starting work:**
- [ ] Pull latest `main`
- [ ] Check for failing CI builds
- [ ] Review any overnight changes

**Before committing:**
- [ ] Run tests locally
- [ ] Check TypeScript has no errors
- [ ] Lint code
- [ ] Test in browser

**After pushing:**
- [ ] Monitor CI pipeline
- [ ] Verify staging deployment
- [ ] Check for errors in staging logs

---

## Measuring Your Success

### DORA Metrics to Track

**Personal Targets:**
- **Deployment Frequency**: 3-5 commits/day
- **Lead Time**: < 1 hour from commit to staging
- **Commit Size**: < 200 lines per commit
- **CI Pass Rate**: > 95%

**Team Targets:**
- **Change Failure Rate**: < 5%
- **Recovery Time**: < 10 minutes
- **Test Coverage**: > 80%

---

## Common Anti-Patterns to Avoid

❌ **Don't:**
- Create long-lived feature branches (> 1 day)
- Commit directly to production without testing
- Skip CI checks ("I'll fix it later")
- Make massive commits (> 500 lines)
- Deploy without feature flags for incomplete work

✅ **Do:**
- Commit small, working increments
- Use feature flags for in-progress features
- Monitor CI and fix failures immediately
- Deploy multiple times per day
- Keep `main` always deployable

---

## Quick Reference Commands

```bash
# Daily start
git pull origin main && npm install && npm run dev

# Pre-commit checks
npm run test && npm run lint && npm run build

# Commit and push
git add . && git commit -m "feat: [description]" && git push origin main

# Check CI status
gh run list --limit 1  # (requires GitHub CLI)

# Manual production deploy
gh workflow run deploy-production.yml  # (requires GitHub CLI)
```

---

## Need Help?

**CI Pipeline Failing?**
- Check GitHub Actions logs
- Run tests locally first
- Ask for code review if stuck

**Feature Flag Not Working?**
- Verify `.env` has the correct flags
- Restart dev server
- Check browser localStorage (dev override)

**Not Sure How to Break Down Work?**
- Ask AI: "How can I split this feature into 3-5 small commits?"
- Review TBD best practices
- Pair with a teammate

---

**Remember:** The goal is to ship small, frequently, and safely. Trust your automated tests and feature flags! 🚀
