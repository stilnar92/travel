# Vendor Management System

Admin panel for managing vendors and categories with filtering and authentication.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Supabase (local)
- Tailwind CSS + shadcn/ui
- Zod validation
- tailwind-variants

## Data Model

- `categories` (id, name)
- `vendors` (id, name, city)
- `vendor_categories` (many-to-many junction)

## Features

- Categories CRUD (inline editing)
- Vendors CRUD with category selection
- Filter vendors by city/category
- Email/password authentication

## Setup

### Prerequisites

- Node.js 18+
- pnpm
- Docker Desktop (running)
- Supabase CLI (`brew install supabase/tap/supabase`)

### Installation

```bash
# 1. Clone and install dependencies
git clone <repo-url>
cd travel
pnpm install

# 2. Setup environment
cp .env.example .env.local

# 3. Start Supabase (Docker must be running)
supabase start

# 4. Get your local Supabase credentials
supabase status
# Copy API URL and anon key to .env.local

# 5. Apply migrations and seed data
supabase db reset

# 6. Start dev server
pnpm dev
```

Open http://localhost:3000 - you'll be redirected to login.
Sign up with any email/password to access the app.

### Useful Commands

```bash
supabase stop          # Stop Supabase containers
supabase db reset      # Reset DB + apply migrations + seed
supabase status        # Show local credentials
```

## Project Structure

```
src/
├── app/
│   ├── (protected)/           # Auth-required routes
│   │   ├── layout.tsx         # Sidebar layout
│   │   ├── categories/
│   │   │   ├── page.tsx       # UI rendering
│   │   │   ├── actions.ts     # Server Actions
│   │   │   ├── data.ts        # Repository calls
│   │   │   ├── logic.ts       # Zod schemas
│   │   │   └── ui/            # Client components
│   │   └── vendors/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       ├── [id]/edit/page.tsx
│   │       ├── actions.ts
│   │       ├── data.ts
│   │       ├── logic.ts
│   │       └── ui/
│   └── (public)/              # No auth required
│       └── login/
├── shared/
│   ├── adapters/              # Supabase client + repositories
│   ├── features/              # Business logic (auth)
│   ├── lib/                   # Utils, routes, errors
│   └── ui/                    # Reusable components
```

## Architecture Principles

- Functions over classes (composition, not inheritance)
- Server Components by default, `'use client'` only when needed
- Route = Feature (all vendor code in `app/vendors/`)
- File responsibilities: `page.tsx` (UI), `actions.ts` (Server Actions), `data.ts` (repository calls), `logic.ts` (Zod schemas)
- tailwind-variants for all component styling

See [`guidelines/`](guidelines/) for detailed architecture rules and patterns.

## Trade-offs

- Local Supabase only (no production deploy)
- Simple auth (no password reset, email verification)
- No pagination (small dataset assumption)

## Future Improvements

- Add pagination
- Email verification flow
- Deploy to Vercel + Supabase Cloud
