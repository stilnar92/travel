# Error Handling

Patterns for handling errors across Server Actions, Client Components, and API boundaries.

---

## Overview

| Layer | Strategy |
|-------|----------|
| **Server Actions** | Return `ActionResult<T>` type |
| **Client Components** | Error boundaries + toast notifications |
| **Data Fetching** | Try/catch with typed errors |
| **Validation** | Zod with user-friendly messages |
| **Monitoring** | Sentry for tracking |

---

## ActionResult Pattern

### Type Definition

```typescript
// shared/lib/action-result.ts

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

// Helper functions
export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

export function err(error: string, code?: string): ActionResult<never> {
  return { success: false, error, code }
}
```

### Usage in Server Actions

```typescript
// app/vendors/actions.ts
'use server'

import { ok, err, type ActionResult } from '@/shared/lib/action-result'
import { VendorSchema } from './schemas'
import { createVendor } from '@/shared/adapters/supabase/repositories/vendors'

export async function addVendor(input: unknown): Promise<ActionResult<Vendor>> {
  // 1. Validate input
  const parsed = VendorSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.errors[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR')
  }

  // 2. Execute operation
  try {
    const vendor = await createVendor(parsed.data)
    return ok(vendor)
  } catch (error) {
    // 3. Log to Sentry
    console.error('Failed to create vendor:', error)
    return err('Failed to create vendor. Please try again.', 'DATABASE_ERROR')
  }
}
```

### Usage in Client Components

```typescript
// app/vendors/VendorForm.tsx
'use client'

import { toast } from 'sonner'
import { addVendor } from './actions'

export function VendorForm() {
  async function onSubmit(data: FormData) {
    const result = await addVendor(data)

    if (result.success) {
      toast.success('Vendor created successfully')
      // redirect or update UI
    } else {
      toast.error(result.error)
    }
  }

  return <form action={onSubmit}>...</form>
}
```

---

## Error Codes

### Standard Codes

| Code | Meaning | User Message |
|------|---------|--------------|
| `VALIDATION_ERROR` | Input validation failed | Show field-specific errors |
| `NOT_FOUND` | Resource doesn't exist | "Item not found" |
| `UNAUTHORIZED` | Not logged in | "Please sign in" |
| `FORBIDDEN` | No permission | "You don't have access" |
| `CONFLICT` | Duplicate/conflict | "This item already exists" |
| `DATABASE_ERROR` | DB operation failed | "Something went wrong" |
| `NETWORK_ERROR` | External API failed | "Service temporarily unavailable" |

### Error Code Handling

```typescript
// Client-side error code handling
function handleActionResult<T>(result: ActionResult<T>) {
  if (result.success) return result.data

  switch (result.code) {
    case 'UNAUTHORIZED':
      redirect('/login')
      break
    case 'NOT_FOUND':
      notFound()
      break
    default:
      toast.error(result.error)
  }
}
```

---

## Validation Errors

### Zod Error Formatting

```typescript
// shared/lib/validation.ts

import { z } from 'zod'

export function formatZodError(error: z.ZodError): string {
  const firstError = error.errors[0]
  if (!firstError) return 'Invalid input'

  const field = firstError.path.join('.')
  return field ? `${field}: ${firstError.message}` : firstError.message
}

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const err of error.errors) {
    const field = err.path.join('.')
    if (field && !errors[field]) {
      errors[field] = err.message
    }
  }

  return errors
}
```

### Form Validation with Field Errors

```typescript
// Server action returning field errors
export async function addVendor(input: unknown): Promise<ActionResult<Vendor>> {
  const parsed = VendorSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      fieldErrors: formatZodErrors(parsed.error),
    }
  }

  // ... rest of action
}
```

```typescript
// Extended ActionResult type for forms
export type FormActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; fieldErrors?: Record<string, string> }
```

---

## Error Boundaries

### Global Error Boundary

```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/shared/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">
        We've been notified and are working on a fix.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

### Route-Level Error Boundary

```typescript
// app/vendors/error.tsx
'use client'

export default function VendorsError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="p-4">
      <h2>Failed to load vendors</h2>
      <button onClick={reset}>Retry</button>
    </div>
  )
}
```

### Not Found Page

```typescript
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Link href="/" className="text-primary hover:underline">
        Go home
      </Link>
    </div>
  )
}
```

---

## Toast Notifications

### Setup (sonner)

```typescript
// app/layout.tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
```

### Toast Patterns

```typescript
import { toast } from 'sonner'

// Success
toast.success('Vendor created')

// Error
toast.error('Failed to save changes')

// Warning
toast.warning('You have unsaved changes')

// Info
toast.info('New update available')

// With description
toast.error('Failed to save', {
  description: 'Please check your connection and try again',
})

// With action
toast.error('Failed to save', {
  action: {
    label: 'Retry',
    onClick: () => handleRetry(),
  },
})

// Promise toast (loading → success/error)
toast.promise(saveVendor(data), {
  loading: 'Saving...',
  success: 'Vendor saved',
  error: 'Failed to save vendor',
})
```

---

## Data Fetching Errors

### Server Component Pattern

```typescript
// app/vendors/page.tsx
import { getVendors } from '@/shared/adapters/supabase/repositories/vendors'

export default async function VendorsPage() {
  try {
    const vendors = await getVendors()
    return <VendorList vendors={vendors} />
  } catch (error) {
    // Option 1: Show error UI inline
    return <div>Failed to load vendors</div>

    // Option 2: Throw to error boundary
    // throw error
  }
}
```

### Repository Error Handling

```typescript
// shared/adapters/supabase/repositories/vendors.ts

export async function getVendorById(id: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('vendor_hotels')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found
      return null
    }
    throw error
  }

  return data
}
```

### Typed Database Errors

```typescript
// shared/lib/errors.ts

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`)
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message)
    this.name = 'DatabaseError'
  }
}
```

---

## Sentry Integration

### Error Capture in Actions

```typescript
// app/vendors/actions.ts
import * as Sentry from '@sentry/nextjs'

export async function addVendor(input: unknown): Promise<ActionResult<Vendor>> {
  try {
    // ... action logic
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'addVendor' },
      extra: { input },
    })

    return err('Failed to create vendor')
  }
}
```

### Error Capture with Context

```typescript
Sentry.captureException(error, {
  tags: {
    action: 'addVendor',
    vendorType: 'hotel',
  },
  extra: {
    userId: session?.user?.id,
    input: sanitizedInput,
  },
  level: 'error',
})
```

### User Context

```typescript
// Set user context after login
Sentry.setUser({
  id: user.id,
  email: user.email,
  role: user.role,
})

// Clear on logout
Sentry.setUser(null)
```

---

## Async Error Handling

### try/catch Wrapper

```typescript
// shared/lib/try-catch.ts

export async function tryCatch<T>(
  fn: () => Promise<T>
): Promise<[T, null] | [null, Error]> {
  try {
    const result = await fn()
    return [result, null]
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))]
  }
}

// Usage
const [data, error] = await tryCatch(() => getVendors())
if (error) {
  return err(error.message)
}
```

---

## User-Facing Error Messages

### Message Guidelines

| Internal Error | User Message |
|----------------|--------------|
| Database connection failed | "Unable to connect. Please try again." |
| Constraint violation | "This name is already taken." |
| Network timeout | "Request timed out. Please try again." |
| Unknown error | "Something went wrong. Please try again." |

### Never Expose

- Stack traces
- Database schema details
- Internal IDs or codes
- File paths
- Environment variables

---

## Quick Reference

| Scenario | Pattern |
|----------|---------|
| Server Action result | Return `ActionResult<T>` |
| Show user error | `toast.error(message)` |
| Log to monitoring | `Sentry.captureException(error)` |
| Validation failed | Return field errors |
| Page crashes | `error.tsx` boundary |
| Resource not found | `not-found.tsx` or return `null` |
| Async operation | `toast.promise()` |

---

## DO / DON'T

### DO

- Always return typed `ActionResult` from actions
- Show user-friendly error messages
- Log detailed errors to Sentry
- Handle validation errors per field
- Use error boundaries for unexpected errors
- Provide retry options when appropriate

### DON'T

- Expose internal error details to users
- Throw unhandled errors in actions
- Show technical jargon to users
- Ignore errors silently
- Log sensitive data (passwords, tokens)
- Use `console.log` in production (use Sentry)
