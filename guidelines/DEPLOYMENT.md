# Deployment

Deployment guidelines for Vercel + Supabase stack with 3-tier environments.

---

## Overview

| Component | Service |
|-----------|---------|
| **Hosting** | Vercel |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage |
| **Monitoring** | Sentry + Vercel Analytics |

---

## Environments

| Environment | Purpose | App URL | Supabase | Git Branch |
|-------------|---------|---------|----------|------------|
| **Development** | Local dev | `localhost:3000` | Local (`supabase start`) | feature branches |
| **Staging** | Testing, QA | `staging.example.com` | Staging project | `staging` |
| **Production** | Live site | `example.com` | Production project | `main` |

### Environment Flow

```
feature-branch → PR → staging → main
     ↓              ↓         ↓
  Preview       Staging   Production
```

---

## Environment Variables

### Variable Types

| Prefix | Visibility | Example |
|--------|-----------|---------|
| `NEXT_PUBLIC_` | Browser + Server | `NEXT_PUBLIC_SUPABASE_URL` |
| No prefix | Server only | `SUPABASE_SERVICE_ROLE_KEY` |

### Per-Environment Configuration

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54321` | `https://xxx-staging.supabase.co` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Local key | Staging key | Production key |
| `SUPABASE_SERVICE_ROLE_KEY` | Local key | Staging key | Production key |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://staging.example.com` | `https://example.com` |
| `SENTRY_DSN` | - | Staging DSN | Production DSN |

### Local Files

```bash
# .env.local (git ignored) - Development
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...local
SUPABASE_SERVICE_ROLE_KEY=eyJ...local
NEXT_PUBLIC_APP_URL=http://localhost:3000

# .env.example (committed) - Template
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
SENTRY_DSN=
```

### Vercel Environment Settings

Configure in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Environment |
|----------|-------------|
| Production vars | Production only |
| Staging vars | Preview (for `staging` branch) |
| Development vars | Development |

---

## Vercel Configuration

### vercel.json

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "git": {
    "deploymentEnabled": {
      "main": true,
      "staging": true
    }
  }
}
```

### Branch Deployment Mapping

| Branch | Environment | Domain |
|--------|-------------|--------|
| `main` | Production | `example.com` |
| `staging` | Preview | `staging.example.com` |
| Other branches | Preview | `*.vercel.app` |

### Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `pnpm build` |
| Install Command | `pnpm install` |
| Output Directory | `.next` |
| Node.js Version | 20.x |

---

## CI/CD Pipeline

### Automatic Deployments

| Trigger | Action |
|---------|--------|
| Push to `main` | Deploy to Production |
| Push to `staging` | Deploy to Staging |
| Pull Request | Preview deployment |
| Merge PR to `main` | Production deployment |

### Deployment Flow

```
1. Push code to branch
2. Vercel triggers build
3. Build: pnpm install → pnpm build
4. Deploy to environment
5. Run checks (if configured)
6. Update deployment status
```

### Preview Deployments

- Every PR gets a unique preview URL
- Preview uses staging Supabase by default
- Comment with preview link added to PR

---

## Supabase Environments

### Setup

| Environment | Setup |
|-------------|-------|
| Development | `supabase start` (local Docker) |
| Staging | Separate Supabase project |
| Production | Main Supabase project |

### Database Migrations Workflow

```bash
# 1. Create migration locally
supabase migration new add_users_table

# 2. Write migration SQL
# supabase/migrations/YYYYMMDDHHMMSS_add_users_table.sql

# 3. Test locally
supabase db reset

# 4. Push to staging
supabase db push --project-ref <staging-ref>

# 5. Verify staging works

# 6. Push to production
supabase db push --project-ref <production-ref>
```

### Type Generation Per Environment

```bash
# Local types
pnpm db:types:local

# Remote types (staging/production)
SUPABASE_PROJECT_ID=<project-id> pnpm db:types
```

### Supabase Project IDs

Store in `.env` files:

```bash
# .env.staging
SUPABASE_PROJECT_ID=xxx-staging

# .env.production
SUPABASE_PROJECT_ID=xxx-production
```

---

## Custom Domain Setup

### DNS Configuration

| Record Type | Name | Value |
|-------------|------|-------|
| CNAME | `@` or `www` | `cname.vercel-dns.com` |
| CNAME | `staging` | `cname.vercel-dns.com` |

Or use A record:

| Record Type | Name | Value |
|-------------|------|-------|
| A | `@` | `76.76.21.21` |

### Vercel Domain Settings

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add `example.com` (production)
3. Add `staging.example.com` (staging)
4. Assign domains to branches:
   - `example.com` → `main` branch
   - `staging.example.com` → `staging` branch

### SSL Certificates

- Automatic via Vercel
- Auto-renewal
- No manual configuration needed

---

## Monitoring & Alerting

### Sentry Integration

```bash
# Install
pnpm add @sentry/nextjs

# Initialize
pnpm sentry:init
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Supabase Monitoring

- Database health: Supabase Dashboard → Reports
- API usage: Supabase Dashboard → API
- Auth events: Supabase Dashboard → Authentication → Logs

### Alert Configuration

| Alert Type | Tool | Trigger |
|------------|------|---------|
| Error spike | Sentry | Error count > threshold |
| Build failure | Vercel | Build fails |
| Database issues | Supabase | Dashboard alerts |

---

## Pre-deployment Checklist

### Before Staging

- [ ] All tests pass locally
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Database migrations tested locally

### Before Production

- [ ] Staging tested and verified
- [ ] Database migrations applied to staging
- [ ] Environment variables configured in Vercel
- [ ] Types regenerated if schema changed
- [ ] No console errors in staging

---

## Post-deployment Verification

### Immediate Checks

| Check | How |
|-------|-----|
| App loads | Visit production URL |
| Auth works | Test login/logout |
| Database connected | Check data loads |
| No console errors | Browser DevTools |

### Health Check Endpoint (Optional)

```typescript
// app/api/health/route.ts
import { createClient } from '@/shared/adapters/supabase/client'

export async function GET() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('users').select('id').limit(1)

    if (error) throw error

    return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch (error) {
    return Response.json({ status: 'error', error: String(error) }, { status: 500 })
  }
}
```

### Critical User Flows

1. Landing page loads
2. User can sign in
3. Protected routes work
4. Data operations (CRUD) work
5. File uploads work (if applicable)

---

## Rollback Strategy

### Vercel Rollback

1. Go to Vercel Dashboard → Project → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Instant rollback (no rebuild)

### Database Rollback

**Warning**: Database rollbacks are complex. Plan carefully.

```bash
# Option 1: Revert migration (if reversible)
supabase migration revert --project-ref <ref>

# Option 2: Restore from backup (destructive)
# Contact Supabase support for point-in-time recovery
```

### Rollback Checklist

- [ ] Identify the issue (app or database?)
- [ ] If app only: Vercel rollback
- [ ] If database: Assess migration reversibility
- [ ] Communicate with team
- [ ] Document incident

---

## Scripts Reference

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/shared/lib/supabase/database.types.ts",
    "db:types:local": "supabase gen types typescript --local > src/shared/lib/supabase/database.types.ts",
    "db:push": "supabase db push",
    "db:reset": "supabase db reset"
  }
}
```

---

## Quick Reference

| Task | Command / Action |
|------|------------------|
| Deploy to staging | Push to `staging` branch |
| Deploy to production | Merge to `main` branch |
| Rollback app | Vercel Dashboard → Promote previous deployment |
| Apply migrations | `supabase db push --project-ref <ref>` |
| Generate types | `pnpm db:types` |
| Check build locally | `pnpm build` |
| View logs | Vercel Dashboard → Logs |
| View errors | Sentry Dashboard |

---

## DO / DON'T

### DO

- Test migrations on staging before production
- Use environment-specific Supabase projects
- Configure Sentry for error tracking
- Verify critical flows after each deployment
- Keep `.env.example` updated

### DON'T

- Push directly to `main` without testing
- Share production keys in `.env.example`
- Skip staging for database migrations
- Ignore Sentry alerts
- Deploy on Fridays (unless necessary)
