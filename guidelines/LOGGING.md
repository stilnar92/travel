# Logging

Patterns for logging across Server Actions, repositories, and background operations.

---

## Overview

| Layer | Strategy |
|-------|----------|
| **Development** | `console.*` methods allowed |
| **Production** | Sentry for error tracking |
| **Audit Events** | `auditLog()` helper (see SECURITY.md) |
| **Sensitive Data** | Never log PII, tokens, passwords |

---

## Log Levels

### When to Use Each Level

| Level | Method | Use For |
|-------|--------|---------|
| **Debug** | `console.debug()` | Development-only details, variable inspection |
| **Info** | `console.info()` | Operation started/completed, state changes |
| **Warn** | `console.warn()` | Recoverable issues, deprecation notices |
| **Error** | `console.error()` | Failed operations, caught exceptions |

### Examples

```typescript
// Debug - development only
console.debug('Parsing input:', { raw: input })

// Info - operation flow
console.info('Vendor created:', { id: vendor.id })

// Warn - something unexpected but handled
console.warn('Retry attempt 2 of 3 for vendor fetch')

// Error - operation failed
console.error('Failed to create vendor:', error)
```

---

## What to Log

### DO Log

| Event Type | Example |
|------------|---------|
| **Action entry/exit** | `console.info('addVendor started')` |
| **Operation success** | `console.info('Vendor created:', { id })` |
| **Operation failure** | `console.error('Failed to create vendor:', error)` |
| **Auth events** | `console.info('User logged in:', { userId })` |
| **Retry attempts** | `console.warn('Retry attempt 2 of 3')` |
| **Performance issues** | `console.warn('Slow query: 2500ms')` |

### DON'T Log

| Data Type | Why |
|-----------|-----|
| **Passwords** | Security risk |
| **API keys / tokens** | Security risk |
| **Full request bodies** | May contain sensitive data |
| **Email addresses** | PII, GDPR compliance |
| **Phone numbers** | PII, GDPR compliance |
| **Credit card data** | PCI compliance |
| **Full user objects** | May expose sensitive fields |

---

## Logging in Server Actions

### Basic Pattern

```typescript
// app/vendors/actions.ts
'use server'

import * as Sentry from '@sentry/nextjs'
import { ok, err, type ActionResult } from '@/shared/lib/action-result'

export async function addVendor(input: unknown): Promise<ActionResult<Vendor>> {
  console.info('addVendor: started')

  const parsed = VendorSchema.safeParse(input)
  if (!parsed.success) {
    console.warn('addVendor: validation failed')
    return err(parsed.error.errors[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR')
  }

  try {
    const vendor = await createVendor(parsed.data)
    console.info('addVendor: success', { vendorId: vendor.id })
    return ok(vendor)
  } catch (error) {
    console.error('addVendor: failed', error)
    Sentry.captureException(error, { tags: { action: 'addVendor' } })
    return err('Failed to create vendor. Please try again.', 'DATABASE_ERROR')
  }
}
```

### Sanitizing Log Data

```typescript
// Never log the full input - extract safe fields
console.info('addVendor: started', {
  vendorType: input.type,
  // NOT: email: input.email,
  // NOT: ...input
})
```

---

## Development vs Production

### Development

- All `console.*` methods are fine
- Use `console.debug()` for detailed inspection
- Logs appear in terminal and browser devtools

### Production

- Avoid excessive `console.log()` (performance overhead)
- Use `console.error()` for errors
- **Send errors to Sentry** for tracking and alerting
- Use `auditLog()` for security-relevant events

```typescript
// Production error handling
catch (error) {
  // Log locally for immediate visibility
  console.error('Operation failed:', error)

  // Send to Sentry for tracking
  Sentry.captureException(error, {
    tags: { action: 'addVendor' },
    extra: { vendorType: input.type },
  })

  return err('Something went wrong')
}
```

---

## Integration with Sentry

### Error Logging

```typescript
import * as Sentry from '@sentry/nextjs'

// Basic capture
Sentry.captureException(error)

// With context
Sentry.captureException(error, {
  tags: {
    action: 'addVendor',
    vendorType: 'hotel',
  },
  extra: {
    userId: session?.user?.id,
  },
  level: 'error',
})
```

### Breadcrumbs for Context

```typescript
// Add breadcrumb before operations
Sentry.addBreadcrumb({
  category: 'action',
  message: 'Creating vendor',
  data: { vendorType: 'hotel' },
  level: 'info',
})

// If error occurs later, breadcrumbs show the trail
```

### Audit Logging (from SECURITY.md)

```typescript
import { auditLog } from '@/shared/lib/audit'

// Log security-relevant events
auditLog({
  action: 'vendor.deleted',
  userId: user.id,
  resource: vendor.id,
  details: { name: vendor.name },
})
```

See **SECURITY.md** for full audit logging implementation.

---

## Quick Reference

| Scenario | Pattern |
|----------|---------|
| Action started | `console.info('actionName: started')` |
| Action success | `console.info('actionName: success', { id })` |
| Action failed | `console.error('actionName: failed', error)` |
| Send to Sentry | `Sentry.captureException(error)` |
| Security event | `auditLog({ action, userId, resource })` |
| Validation warning | `console.warn('actionName: validation failed')` |

---

## DO / DON'T

### DO

- Log action entry and exit points
- Include relevant IDs (vendor, user) for traceability
- Use appropriate log levels
- Send errors to Sentry in production
- Sanitize data before logging
- Use `auditLog()` for security events

### DON'T

- Log passwords, tokens, or API keys
- Log full user objects or request bodies
- Use `console.log()` for everything (use appropriate levels)
- Log PII (emails, phone numbers, names)
- Expose internal error details in user-facing messages
- Skip error logging (even if you handle the error gracefully)
