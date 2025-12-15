# Security

Security guidelines for authentication, authorization, data protection, and secure coding practices.

---

## Overview

| Layer | Protection |
|-------|------------|
| **Authentication** | Supabase Auth (JWT) |
| **Authorization** | Row-Level Security (RLS) |
| **Input Validation** | Zod schemas |
| **Data Protection** | Encryption at rest, HTTPS |
| **Secrets** | Environment variables |

---

## Authentication

### Supabase Auth Flow

```
1. User signs in → Supabase issues JWT
2. JWT stored in httpOnly cookie
3. Each request includes JWT
4. Middleware refreshes session
5. RLS policies check JWT claims
```

### Session Management

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session (important!)
  await supabase.auth.getUser()

  return response
}
```

### Protected Routes

```typescript
// middleware.ts (continued)
const { data: { user } } = await supabase.auth.getUser()

const protectedRoutes = ['/dashboard', '/vendors', '/settings']
const authRoutes = ['/login', '/signup']

const isProtected = protectedRoutes.some(route =>
  request.nextUrl.pathname.startsWith(route)
)

if (!user && isProtected) {
  return NextResponse.redirect(new URL('/login', request.url))
}

if (user && authRoutes.includes(request.nextUrl.pathname)) {
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

### Server Action Auth Check

```typescript
// app/vendors/actions.ts
'use server'

import { getUser } from '@/shared/adapters/supabase/repositories/auth'
import { err } from '@/shared/lib/action-result'

export async function createVendor(input: unknown) {
  const user = await getUser()

  if (!user) {
    return err('Please sign in to continue', 'UNAUTHORIZED')
  }

  // Continue with authorized action...
}
```

---

## Authorization (RLS)

### RLS Strategy

| Principle | Implementation |
|-----------|----------------|
| Default deny | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |
| Explicit allow | Create policies for each operation |
| Use JWT claims | `auth.uid()`, `auth.jwt()->>'role'` |
| No bypass | Never use service role in client code |

### Policy Patterns

#### User-owned data

```sql
-- Users can only see their own data
CREATE POLICY "Users view own data"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can only update their own data
CREATE POLICY "Users update own data"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);
```

#### Role-based access

```sql
-- Only admins can view all vendors
CREATE POLICY "Admins view all vendors"
ON vendors FOR SELECT
USING (
  auth.jwt()->>'role' = 'admin'
);

-- Admins and managers can update vendors
CREATE POLICY "Admins and managers update vendors"
ON vendors FOR UPDATE
USING (
  auth.jwt()->>'role' IN ('admin', 'manager')
);
```

#### Team-based access

```sql
-- Users can see data from their organization
CREATE POLICY "Org members view org data"
ON vendors FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);
```

### Custom Claims (User Roles)

```sql
-- Function to get user role from profiles table
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles
  WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Use in RLS policy
CREATE POLICY "Role-based access"
ON sensitive_data FOR SELECT
USING (
  public.get_user_role() IN ('admin', 'manager')
);
```

### RLS Testing

```sql
-- Test as specific user
SET request.jwt.claim.sub = 'user-uuid-here';
SET request.jwt.claim.role = 'admin';

-- Run query
SELECT * FROM vendors;

-- Reset
RESET request.jwt.claim.sub;
RESET request.jwt.claim.role;
```

---

## Input Validation

### Server-Side Validation (Required)

```typescript
// app/vendors/schemas.ts
import { z } from 'zod'

export const CreateVendorSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name too long'),
  email: z.string()
    .email('Invalid email'),
  website: z.string()
    .url('Invalid URL')
    .optional(),
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number')
    .optional(),
})
```

### Action Validation

```typescript
// app/vendors/actions.ts
'use server'

import { CreateVendorSchema } from './schemas'

export async function createVendor(input: unknown) {
  // Always validate on server
  const parsed = CreateVendorSchema.safeParse(input)

  if (!parsed.success) {
    return err(parsed.error.errors[0]?.message ?? 'Invalid input')
  }

  // Use parsed.data (typed and sanitized)
  const vendor = await saveVendor(parsed.data)
}
```

### Sanitization Patterns

```typescript
// Prevent XSS in user content
import DOMPurify from 'isomorphic-dompurify'

const sanitizedHtml = DOMPurify.sanitize(userInput)

// Or use text content only (safer)
const textOnly = userInput.replace(/<[^>]*>/g, '')
```

### SQL Injection Prevention

```typescript
// NEVER do this
const query = `SELECT * FROM vendors WHERE name = '${userInput}'`

// Supabase handles parameterization automatically
const { data } = await supabase
  .from('vendors')
  .select('*')
  .eq('name', userInput) // Safe - parameterized
```

---

## Secrets Management

### Environment Variables

| Type | Storage | Access |
|------|---------|--------|
| Public | `.env.local`, Vercel | Browser + Server |
| Private | `.env.local`, Vercel | Server only |
| Sensitive | Vercel (encrypted) | Server only |

### Naming Convention

```bash
# Public (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_APP_URL=https://example.com

# Private (server only)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
SENTRY_AUTH_TOKEN=...
```

### Validation

```typescript
// shared/lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Public
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Private
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)
```

### Never Commit Secrets

```gitignore
# .gitignore
.env
.env.local
.env.*.local
*.pem
*.key
```

### .env.example (Safe to Commit)

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## HTTPS & Transport Security

### Vercel (Automatic)

- All traffic forced to HTTPS
- Automatic SSL certificates
- HSTS headers enabled

### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co",
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## CSRF Protection

### Server Actions (Built-in)

Next.js Server Actions have built-in CSRF protection:
- Origin header validation
- Same-origin enforcement

### API Routes (Manual)

```typescript
// For custom API routes, validate origin
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
  ]

  if (!origin || !allowedOrigins.includes(origin)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Continue...
}
```

---

## File Upload Security

### Validation

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const FileSchema = z.object({
  file: z
    .instanceof(File)
    .refine(f => f.size <= MAX_FILE_SIZE, 'File too large (max 5MB)')
    .refine(f => ALLOWED_TYPES.includes(f.type), 'Invalid file type'),
})
```

### Supabase Storage Policies

```sql
-- Only authenticated users can upload
CREATE POLICY "Authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
  AND bucket_id = 'avatars'
);

-- Users can only access their own files
CREATE POLICY "User file access"
ON storage.objects FOR SELECT
USING (
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Safe File Names

```typescript
import { nanoid } from 'nanoid'

function safeFileName(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || ''
  const safeName = nanoid()
  return `${safeName}.${ext}`
}
```

---

## Audit Logging

### Log Security Events

```typescript
// shared/lib/audit.ts
import * as Sentry from '@sentry/nextjs'

export function auditLog(event: {
  action: string
  userId?: string
  resource?: string
  details?: Record<string, unknown>
}) {
  // Log to Sentry breadcrumbs
  Sentry.addBreadcrumb({
    category: 'audit',
    message: event.action,
    data: event,
    level: 'info',
  })

  // Or log to database
  // await supabase.from('audit_logs').insert(event)
}

// Usage
auditLog({
  action: 'vendor.created',
  userId: user.id,
  resource: vendor.id,
  details: { name: vendor.name },
})
```

### Events to Log

| Event | Priority |
|-------|----------|
| Login success/failure | High |
| Password change | High |
| Role change | High |
| Data export | High |
| Delete operations | Medium |
| Settings change | Medium |
| Create/update records | Low |

---

## Dependency Security

### Audit Dependencies

```bash
# Check for vulnerabilities
pnpm audit

# Fix automatically
pnpm audit fix
```

### Keep Updated

```bash
# Check for updates
pnpm outdated

# Update dependencies
pnpm update
```

### Lockfile

- Always commit `pnpm-lock.yaml`
- Review lockfile changes in PRs

---

## Quick Reference

| Threat | Protection |
|--------|------------|
| Unauthorized access | Auth middleware + RLS |
| SQL injection | Supabase parameterized queries |
| XSS | Input sanitization, CSP |
| CSRF | Server Actions (built-in) |
| Data exposure | RLS policies |
| Secrets leak | Environment variables |
| File upload attacks | Type/size validation |
| Session hijacking | httpOnly cookies, HTTPS |

---

## Security Checklist

### Before Launch

- [ ] RLS enabled on all tables
- [ ] RLS policies tested
- [ ] All inputs validated with Zod
- [ ] No secrets in code or git
- [ ] HTTPS enforced
- [ ] Auth flows tested
- [ ] File upload limits set
- [ ] Dependencies audited

### Ongoing

- [ ] Regular dependency updates
- [ ] Monitor Sentry for anomalies
- [ ] Review audit logs
- [ ] Rotate secrets periodically

---

## DO / DON'T

### DO

- Enable RLS on every table
- Validate all inputs on server
- Use environment variables for secrets
- Use Supabase client (parameterized queries)
- Log security events
- Keep dependencies updated
- Test RLS policies

### DON'T

- Trust client-side validation alone
- Use service role key in client code
- Commit secrets to git
- Disable RLS for convenience
- Build raw SQL queries
- Expose internal errors to users
- Skip input validation
