# API Conventions

Patterns for Server Actions, response formats, pagination, and data fetching.

---

## Overview

| Aspect | Convention |
|--------|------------|
| **Data mutations** | Server Actions |
| **Data fetching** | Server Components + repositories |
| **Response format** | `ActionResult<T>` |
| **Validation** | Zod schemas |
| **Pagination** | Cursor-based (preferred) or offset |

---

## Server Actions

### File Organization

```
app/
└── vendors/
    ├── page.tsx          # Server Component (data fetching)
    ├── actions.ts        # Server Actions (mutations)
    ├── schemas.ts        # Zod validation schemas
    └── logic.ts          # Pure business logic
```

### Action Structure

```typescript
// app/vendors/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { ok, err, type ActionResult } from '@/shared/lib/action-result'
import { getUser } from '@/shared/adapters/supabase/repositories/auth'
import { createVendor } from '@/shared/adapters/supabase/repositories/vendors'
import { CreateVendorSchema } from './schemas'

export async function addVendor(input: unknown): Promise<ActionResult<Vendor>> {
  // 1. Authentication
  const user = await getUser()
  if (!user) {
    return err('Please sign in', 'UNAUTHORIZED')
  }

  // 2. Validation
  const parsed = CreateVendorSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.errors[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR')
  }

  // 3. Authorization (if needed)
  // Check user has permission...

  // 4. Execute
  try {
    const vendor = await createVendor(parsed.data)

    // 5. Revalidate cache
    revalidatePath('/vendors')

    return ok(vendor)
  } catch (error) {
    console.error('Failed to create vendor:', error)
    return err('Failed to create vendor', 'DATABASE_ERROR')
  }
}
```

---

## Response Format

### ActionResult Type

```typescript
// shared/lib/action-result.ts

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: ErrorCode }

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'DATABASE_ERROR'
  | 'NETWORK_ERROR'

// Helper constructors
export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

export function err(error: string, code?: ErrorCode): ActionResult<never> {
  return { success: false, error, code }
}
```

### FormActionResult (with field errors)

```typescript
// shared/lib/action-result.ts

export type FormActionResult<T> =
  | { success: true; data: T }
  | {
      success: false
      error: string
      code?: ErrorCode
      fieldErrors?: Record<string, string>
    }

export function fieldErr(
  error: string,
  fieldErrors: Record<string, string>
): FormActionResult<never> {
  return {
    success: false,
    error,
    code: 'VALIDATION_ERROR',
    fieldErrors,
  }
}
```

### Usage Examples

```typescript
// Success
return ok({ id: '123', name: 'Hotel XYZ' })

// Simple error
return err('Vendor not found', 'NOT_FOUND')

// Validation error with fields
return fieldErr('Validation failed', {
  name: 'Name is required',
  email: 'Invalid email format',
})
```

---

## Pagination

### Cursor-Based (Preferred)

Best for infinite scroll, real-time data, large datasets.

```typescript
// Types
interface CursorPaginatedResult<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

interface CursorPaginationParams {
  cursor?: string
  limit?: number
}
```

```typescript
// Repository
export async function getVendors(
  params: CursorPaginationParams = {}
): Promise<CursorPaginatedResult<Vendor>> {
  const { cursor, limit = 20 } = params
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit + 1) // Fetch one extra to check hasMore

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query
  if (error) throw error

  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, -1) : data
  const nextCursor = hasMore ? items[items.length - 1]?.created_at : null

  return { items, nextCursor, hasMore }
}
```

```typescript
// Action
export async function loadMoreVendors(
  cursor?: string
): Promise<ActionResult<CursorPaginatedResult<Vendor>>> {
  try {
    const result = await getVendors({ cursor, limit: 20 })
    return ok(result)
  } catch (error) {
    return err('Failed to load vendors')
  }
}
```

### Offset-Based

Best for numbered pages, admin tables, small datasets.

```typescript
// Types
interface OffsetPaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface OffsetPaginationParams {
  page?: number
  pageSize?: number
}
```

```typescript
// Repository
export async function getVendorsPaginated(
  params: OffsetPaginationParams = {}
): Promise<OffsetPaginatedResult<Vendor>> {
  const { page = 1, pageSize = 20 } = params
  const offset = (page - 1) * pageSize

  const supabase = await createServerSupabaseClient()

  // Get total count
  const { count } = await supabase
    .from('vendors')
    .select('*', { count: 'exact', head: true })

  // Get page data
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  const total = count ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    items: data,
    total,
    page,
    pageSize,
    totalPages,
  }
}
```

### URL State with nuqs

```typescript
// app/vendors/page.tsx
import { parseAsInteger, useQueryStates } from 'nuqs'

export default function VendorsPage() {
  const [pagination, setPagination] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(20),
  })

  // URL: /vendors?page=2&pageSize=20
}
```

---

## Filtering & Sorting

### Filter Types

```typescript
// Types
interface VendorFilters {
  search?: string
  category?: string
  priceLevel?: string
  city?: string
  isActive?: boolean
}

interface SortParams {
  sortBy?: 'name' | 'created_at' | 'price_level'
  sortOrder?: 'asc' | 'desc'
}
```

### Repository with Filters

```typescript
// Repository
export async function getVendors(
  filters: VendorFilters = {},
  sort: SortParams = {},
  pagination: OffsetPaginationParams = {}
) {
  const supabase = await createServerSupabaseClient()
  const { page = 1, pageSize = 20 } = pagination
  const { sortBy = 'created_at', sortOrder = 'desc' } = sort
  const offset = (page - 1) * pageSize

  let query = supabase.from('vendors').select('*', { count: 'exact' })

  // Apply filters
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.priceLevel) {
    query = query.eq('price_level', filters.priceLevel)
  }
  if (filters.city) {
    query = query.eq('city', filters.city)
  }
  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive)
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query
  if (error) throw error

  return {
    items: data,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}
```

### Filter Schema Validation

```typescript
// schemas.ts
import { z } from 'zod'

export const VendorFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  category: z.enum(['hotel', 'restaurant', 'yacht']).optional(),
  priceLevel: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
  city: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
})

export const SortParamsSchema = z.object({
  sortBy: z.enum(['name', 'created_at', 'price_level']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})
```

---

## Data Fetching Patterns

### Server Component (Direct)

```typescript
// app/vendors/page.tsx
import { getVendors } from '@/shared/adapters/supabase/repositories/vendors'

export default async function VendorsPage() {
  const vendors = await getVendors()

  return <VendorList vendors={vendors} />
}
```

### With Search Params

```typescript
// app/vendors/page.tsx
interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    category?: string
  }>
}

export default async function VendorsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const result = await getVendors(
    {
      search: params.search,
      category: params.category,
    },
    {},
    { page: Number(params.page) || 1 }
  )

  return <VendorList {...result} />
}
```

### Loading States

```typescript
// app/vendors/loading.tsx
export default function Loading() {
  return <VendorListSkeleton />
}
```

### Error Handling

```typescript
// app/vendors/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Failed to load vendors</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

## Optimistic Updates

### Pattern

```typescript
// Client component with optimistic update
'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleFavorite } from './actions'

export function FavoriteButton({ vendorId, isFavorite }: Props) {
  const [isPending, startTransition] = useTransition()
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(isFavorite)

  async function handleToggle() {
    startTransition(async () => {
      setOptimisticFavorite(!optimisticFavorite)
      await toggleFavorite(vendorId)
    })
  }

  return (
    <button onClick={handleToggle} disabled={isPending}>
      {optimisticFavorite ? '★' : '☆'}
    </button>
  )
}
```

---

## Caching & Revalidation

### Revalidate After Mutation

```typescript
// actions.ts
import { revalidatePath, revalidateTag } from 'next/cache'

export async function createVendor(input: unknown) {
  // ... create vendor

  // Option 1: Revalidate specific path
  revalidatePath('/vendors')

  // Option 2: Revalidate by tag
  revalidateTag('vendors')

  return ok(vendor)
}
```

### Fetch with Tags

```typescript
// Repository with cache tags
export async function getVendors() {
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('vendors')
    .select('*')

  return data
}

// In Server Component
import { unstable_cache } from 'next/cache'

const getCachedVendors = unstable_cache(
  async () => getVendors(),
  ['vendors'],
  { tags: ['vendors'], revalidate: 60 }
)
```

---

## Batch Operations

### Bulk Actions

```typescript
// Types
interface BulkActionResult {
  succeeded: string[]
  failed: { id: string; error: string }[]
}

// Action
export async function bulkDeleteVendors(
  ids: string[]
): Promise<ActionResult<BulkActionResult>> {
  const user = await getUser()
  if (!user) return err('Unauthorized', 'UNAUTHORIZED')

  const succeeded: string[] = []
  const failed: { id: string; error: string }[] = []

  for (const id of ids) {
    try {
      await deleteVendor(id)
      succeeded.push(id)
    } catch (error) {
      failed.push({ id, error: 'Failed to delete' })
    }
  }

  revalidatePath('/vendors')

  return ok({ succeeded, failed })
}
```

---

## Naming Conventions

### Actions

| Pattern | Example |
|---------|---------|
| Create | `createVendor`, `addVendor` |
| Read | `getVendor`, `getVendors`, `getVendorById` |
| Update | `updateVendor`, `editVendor` |
| Delete | `deleteVendor`, `removeVendor` |
| Toggle | `toggleFavorite`, `toggleActive` |
| Bulk | `bulkDelete`, `bulkUpdate` |

### Schemas

| Pattern | Example |
|---------|---------|
| Create | `CreateVendorSchema` |
| Update | `UpdateVendorSchema` |
| Filters | `VendorFiltersSchema` |
| Params | `PaginationParamsSchema` |

### Types

| Pattern | Example |
|---------|---------|
| Entity | `Vendor`, `User` |
| Create input | `VendorInsert`, `CreateVendorInput` |
| Update input | `VendorUpdate`, `UpdateVendorInput` |
| List result | `VendorListResult`, `PaginatedVendors` |

---

## Quick Reference

| Task | Pattern |
|------|---------|
| Return success | `return ok(data)` |
| Return error | `return err('message', 'CODE')` |
| Validate input | `Schema.safeParse(input)` |
| Check auth | `const user = await getUser()` |
| Refresh data | `revalidatePath('/path')` |
| Cursor pagination | `{ items, nextCursor, hasMore }` |
| Offset pagination | `{ items, total, page, totalPages }` |
| Apply filters | Chain `.eq()`, `.ilike()` methods |
| Sort results | `.order(field, { ascending })` |

---

## DO / DON'T

### DO

- Always return `ActionResult` from actions
- Validate all inputs with Zod
- Check authentication first
- Use cursor pagination for infinite scroll
- Revalidate cache after mutations
- Handle errors gracefully

### DON'T

- Return raw errors to client
- Skip input validation
- Forget to revalidate after mutations
- Use offset pagination for large datasets
- Mix fetching logic in actions (use repositories)
- Expose internal error details
