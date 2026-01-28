# Contributing to Sportigon

Thank you for your interest in contributing to Sportigon! This document provides guidelines and best practices for contributing to the project using our Trunk-Based Development workflow.

## 🌳 Development Workflow

We use **Trunk-Based Development (TBD)**, which means:
- Small, frequent commits directly to the `main` branch
- Feature flags for incomplete features
- Automated testing and deployment
- Fast feedback loops

For detailed workflow guidance, see [`.agent/workflows/tbd-workflow.md`](.agent/workflows/tbd-workflow.md).

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/developeraideehem/sportigon.git
cd sportigon
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 2. Make Your Change

```bash
# Pull latest changes
git pull origin main

# Create small, focused change (< 200 lines)
# For incomplete features, use feature flags

# Test locally
npm run test
npm run lint
npm run build

# Commit directly to main
git add .
git commit -m "feat: your descriptive message"
git push origin main
```

### 3. Monitor CI

- Check GitHub Actions for your commit
- Verify tests pass
- Confirm staging deployment

## 📝 Commit Guidelines

### Commit Size
- **Keep it small**: < 200 lines per commit
- **Single responsibility**: One logical change per commit
- **Complete**: Should not break the build

### Commit Message Format

```
<type>: <subject>

<optional body>

<optional footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add email validation to contact form

- Add regex pattern for email validation
- Show error message for invalid emails
- Add unit tests for validation logic

Closes #123
```

## 🚩 Feature Flags

### When to Use

Use feature flags for:
- Features that take > 2 hours to complete
- Features with visual/UX changes
- Breaking changes that need gradual rollout
- A/B testing experiments

### How to Use

```typescript
import { useFeatureFlag } from '@/lib/featureFlags';

export function NewFeature() {
  const isEnabled = useFeatureFlag('new-feature');
  
  if (!isEnabled) return null;
  
  return <div>Feature Content</div>;
}
```

**Enable in `.env`:**
```env
VITE_ENABLED_FEATURES=live-scores-api,new-feature
```

**Development Override:**
```javascript
// In browser console
setFeatureFlagOverride('new-feature', true);
```

## 🧪 Testing Requirements

### Before Committing

All commits must:
- ✅ Pass existing tests: `npm run test`
- ✅ Pass type checking: `npm run type-check`
- ✅ Pass linting: `npm run lint`
- ✅ Build successfully: `npm run build`

### Writing Tests

**For new features:**
```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

**For services/utilities:**
```typescript
// src/services/__tests__/myService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { myFunction } from '../myService';

describe('myFunction', () => {
  it('returns expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Coverage Goals
- Minimum: 50% coverage
- Target: 80% coverage
- Critical paths: 100% coverage

## 🔄 Branching Strategy

### Default: Direct to Main

For simple changes (< 200 lines, < 2 hours):
```bash
git checkout main
git pull origin main
# make changes
git add .
git commit -m "feat: simple change"
git push origin main
```

### Short-Lived Branches

Only when necessary (code review needed, experimental work):
```bash
git checkout -b feature/quick-fix
# make changes
git add .
git commit -m "fix: resolve issue"
git push origin feature/quick-fix
# Open PR, get review
# Merge and delete branch within 24 hours
```

**Important:** Branches should live < 24 hours!

## 🐛 Bug Fixes

### Regular Bugs

Follow normal TBD workflow:
```bash
git pull origin main
# fix the bug
npm run test
git commit -m "fix: resolve user login issue"
git push origin main
```

### Critical Hotfixes

For production-breaking bugs:
```bash
# 1. Make minimal fix
# 2. Test thoroughly
npm run test
npm run build

# 3. Commit with "hotfix:" prefix
git commit -m "hotfix: resolve payment processing error"

# 4. Push to main
git push origin main

# 5. Monitor staging, then manually deploy to production
```

**Goal:** < 10 minutes from fix to production

## 📦 Dependencies

### Adding Dependencies

```bash
# Install package
npm install package-name

# Update package.json is automatic
# Commit both package.json and package-lock.json
git add package.json package-lock.json
git commit -m "chore: add package-name for feature X"
git push origin main
```

### Security

- Run `npm audit` before committing dependency changes
- Fix high/critical vulnerabilities immediately
- Document why vulnerable packages are needed (if unavoidable)

## 🚢 Deployment

### Staging (Automatic)

Every push to `main` triggers:
1. GitHub Actions CI
2. Run tests
3. Build application
4. Deploy to staging

**Staging URL:** `https://sportigon-staging.vercel.app`

### Production (Manual)

1. Navigate to GitHub Actions
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select "production" environment
5. Confirm deployment

**Production URL:** `https://sportigon.vercel.app` (if configured)

## 🔍 Code Review

### When Required
- Complex logic changes
- Security-related code
- Breaking API changes
- Database migrations

### Review Checklist
- [ ] Tests added/updated
- [ ] No lint errors
- [ ] Feature flag used (if incomplete)
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Commit message clear

## 📊 Measuring Success

We track these DORA metrics:

| Metric | Target |
|--------|--------|
| **Deployment Frequency** | 3-5 deploys/day |
| **Lead Time** | < 1 hour |
| **Change Failure Rate** | < 5% |
| **Recovery Time** | < 10 minutes |

Individual targets:
- 3-5 commits per day
- < 200 lines per commit
- 95%+ CI pass rate

## ❓ Getting Help

**Have questions?**
- Check [`.agent/workflows/tbd-workflow.md`](.agent/workflows/tbd-workflow.md)
- Review [TBD Implementation Plan](docs/tbd_implementation_plan.md)
- Open a GitHub Discussion
- Ask in team chat

**Found a bug?**
- Open an issue with reproduction steps
- Include error messages and screenshots
- Tag with appropriate labels

**Want to add a feature?**
- Open an issue to discuss approach
- Get feedback before large implementations
- Use feature flags for gradual rollout

## 🎯 Best Practices

### DO
- ✅ Commit small, frequently
- ✅ Use feature flags for WIP
- ✅ Write tests for new code
- ✅ Keep main always deployable
- ✅ Monitor CI results
- ✅ Fix broken builds immediately

### DON'T
- ❌ Create long-lived branches
- ❌ Skip tests
- ❌ Commit broken code
- ❌ Ignore CI failures
- ❌ Make massive commits
- ❌ Deploy untested code

---

**Happy coding! 🚀**

Remember: Small commits, frequent deploys, automated safety nets. Trust the process!
