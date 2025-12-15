# Supabase Integration

How Supabase integrates with Next.js using the Adapter pattern for maximum decoupling.

---

## Design Decision

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| Types | Generated from DB | Always in sync, no manual maintenance |
| Adapters | Simple functions | No classes, no mapping, minimal boilerplate |
| Coupling | Supabase isolated in `adapters/` | Easy to swap, testable |

---

## Folder Structure

```
project-root/
├── supabase/                          # Supabase CLI (outside src/)
│   ├── config.toml
│   ├── seed.sql
│   └── migrations/
│       └── *.sql
│
└── src/
    ├── shared/
    │   ├── adapters/
    │   │   ├── supabase/
    │   │   │   ├── client.ts              # Server/Browser clients
    │   │   │   │
    │   │   │   └── repositories/          # Data access
    │   │   │       ├── vendors.ts
    │   │   │       ├── members.ts
    │   │   │       ├── trips.ts
    │   │   │       └── auth.ts
    │   │   │
    │   │   ├── types/                     # Extended types (when needed)
    │   │   │   └── index.ts
    │   │   │
    │   │   └── index.ts                   # Re-exports
    │   │
    │   └── lib/
    │       ├── env.ts                     # Validated env vars
    │       └── supabase/
    │           └── database.types.ts      # GENERATED
    │
    ├── middleware.ts                      # Auth session refresh
    │
    └── app/
        └── [feature]/
            ├── page.tsx
            ├── actions.ts                 # Uses adapters
            └── logic.ts
```

---

## Type Flow

```
supabase/migrations/*.sql
         ↓
    npm run db:types
         ↓
shared/lib/supabase/database.types.ts  (generated)
         ↓
shared/adapters/supabase/repositories/*.ts  (uses generated types)
         ↓
shared/adapters/types/index.ts  (helper exports, extensions)
         ↓
app/**/actions.ts  (uses same types)
```

---

## Type Generation

### Setup

```json
// package.json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/shared/lib/supabase/database.types.ts",
    "db:types:local": "supabase gen types typescript --local > src/shared/lib/supabase/database.types.ts"
  }
}
```

### When to Regenerate

- After any migration
- After changing RLS policies
- After adding/modifying database functions

---

## Client Setup

### Server Client (Server Components, Actions, Route Handlers)

```typescript
// shared/adapters/supabase/client.ts

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/shared/lib/supabase/database.types'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}
```

### Browser Client (Client Components)

```typescript
// shared/adapters/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/shared/lib/supabase/database.types'

export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## Repository Pattern

### Structure

Each repository file contains simple functions for one domain area.

```typescript
// shared/adapters/supabase/repositories/vendors.ts

import { createServerSupabaseClient } from '../client'
import type { Database } from '@/shared/lib/supabase/database.types'

type VendorHotel = Database['public']['Tables']['vendor_hotels']['Row']
type VendorHotelInsert = Database['public']['Tables']['vendor_hotels']['Insert']
type VendorHotelUpdate = Database['public']['Tables']['vendor_hotels']['Update']

// GET all
export async function getVendorHotels(options?: { limit?: number }) {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('vendor_hotels')
    .select('*')
    .order('created_at', { ascending: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// GET by id
export async function getVendorHotelById(id: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('vendor_hotels')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// CREATE
export async function createVendorHotel(input: VendorHotelInsert) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('vendor_hotels')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

// UPDATE
export async function updateVendorHotel(id: string, input: VendorHotelUpdate) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('vendor_hotels')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// DELETE
export async function deleteVendorHotel(id: string) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('vendor_hotels')
    .delete()
    .eq('id', id)

  if (error) throw error
}
```

### Polymorphic Vendor Operations

```typescript
// shared/adapters/supabase/repositories/vendors.ts

const VENDOR_TABLES = {
  hotel: 'vendor_hotels',
  restaurant: 'vendor_restaurants',
  yacht: 'vendor_sailing_yachts',
  // ... all vendor types
} as const

type VendorType = keyof typeof VENDOR_TABLES

export async function getVendorById(type: VendorType, id: string) {
  const supabase = await createServerSupabaseClient()
  const table = VENDOR_TABLES[type]

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function searchVendors(params: {
  types?: VendorType[]
  city?: string
  priceLevel?: string
  query?: string
}) {
  const supabase = await createServerSupabaseClient()
  const results = []

  const typesToSearch = params.types || Object.keys(VENDOR_TABLES) as VendorType[]

  for (const type of typesToSearch) {
    const table = VENDOR_TABLES[type]

    let query = supabase.from(table).select('*')

    if (params.priceLevel) {
      query = query.eq('price_level', params.priceLevel)
    }

    if (params.query) {
      query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`)
    }

    const { data } = await query.limit(10)
    if (data) results.push(...data.map(row => ({ ...row, _type: type })))
  }

  return results
}
```

---

## Extended Types

When generated types are not enough, extend in `adapters/types/`:

```typescript
// shared/adapters/types/index.ts

import type { Database } from '@/shared/lib/supabase/database.types'

// Helper extractions
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Row types
export type VendorHotel = Tables['vendor_hotels']['Row']
export type VendorRestaurant = Tables['vendor_restaurants']['Row']
export type Member = Tables['members']['Row']

// Insert/Update types
export type VendorHotelInsert = Tables['vendor_hotels']['Insert']
export type VendorHotelUpdate = Tables['vendor_hotels']['Update']

// Union types
export type VendorType =
  | 'hotel' | 'apartment' | 'villa'
  | 'restaurant' | 'cafe' | 'bar'
  | 'sailing_yacht' | 'motor_yacht'

// Extended types (when DB types not enough)
export interface VendorWithLocations extends VendorHotel {
  vendor_locations: Tables['vendor_locations']['Row'][]
}

// Query option types
export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}
```

---

## Auth Repository

```typescript
// shared/adapters/supabase/repositories/auth.ts

import { createServerSupabaseClient } from '../client'

export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signIn(email: string, password: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }
  return { user: data.user }
}

export async function signUp(email: string, password: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) return { error: error.message }
  return { user: data.user }
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
}
```

---

## Usage in Actions

```typescript
// app/vendors/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import {
  getVendorHotels,
  createVendorHotel
} from '@/shared/adapters/supabase/repositories/vendors'
import type { VendorHotelInsert } from '@/shared/adapters/types'
import { validateVendorInput } from './logic'

export async function getHotels() {
  return getVendorHotels({ limit: 50 })
}

export async function addHotel(input: unknown) {
  // 1. Validate (pure function)
  const validated = validateVendorInput(input)
  if (!validated.success) {
    return { error: validated.error }
  }

  // 2. Save via repository
  const hotel = await createVendorHotel(validated.data)

  // 3. Revalidate (Next.js specific)
  revalidatePath('/vendors')

  return { data: hotel }
}
```

---

## Middleware

```typescript
// src/middleware.ts

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

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const isProtected = request.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Environment Variables

```bash
# .env.example

# Public (available in browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Private (server only)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

```typescript
// shared/lib/env.ts

import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)
```

---

## Layer Responsibilities

| Layer | Knows About | Doesn't Know About |
|-------|-------------|-------------------|
| `database.types.ts` | DB schema | Next.js, business logic |
| `adapters/supabase/repositories/*` | Supabase, generated types | Next.js cache, revalidation |
| `adapters/types/*` | Generated types | Supabase client, Next.js |
| `app/**/actions.ts` | Repositories, Next.js | Supabase internals |
| `app/**/logic.ts` | Domain types only | Supabase, Next.js |

---

## Rules

### DO

- Generate types after every migration
- Use generated types directly in repositories
- Keep Supabase code in `adapters/supabase/`
- Use `revalidatePath` only in actions, not in repositories
- Create helper types in `adapters/types/` when needed

### DON'T

- Import Supabase client outside of `adapters/`
- Call Supabase directly from components or actions
- Manually define types that match DB schema
- Mix Next.js specific code in repositories
- Create mapping/transformation layers (keep it simple)

---

## Migrations

Location: `supabase/migrations/`

Naming: `YYYYMMDDHHMMSS_description.sql`

```sql
-- supabase/migrations/20240101000000_init.sql

create table public.users (
  id uuid references auth.users(id) primary key,
  role text not null,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
```

After creating migration:
```bash
# Apply locally
npx supabase db push

# Regenerate types
npm run db:types:local
```

---

## Quick Reference

| Task | Location |
|------|----------|
| Supabase client | `shared/adapters/supabase/client.ts` |
| Data access functions | `shared/adapters/supabase/repositories/*.ts` |
| Generated types | `shared/lib/supabase/database.types.ts` |
| Extended types | `shared/adapters/types/index.ts` |
| Env validation | `shared/lib/env.ts` |
| Auth middleware | `src/middleware.ts` |
| Migrations | `supabase/migrations/` |
