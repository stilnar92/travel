# Architecture Rules

Concise rules for Minimal Architecture (Hybrid KISS).

---

## Folder Structure

```
src/
├── app/                          # Routes = Features
│   ├── layout.tsx
│   ├── page.tsx
│   └── [feature]/
│       ├── page.tsx              # Server Component
│       ├── actions.ts            # Server Actions
│       ├── data.ts               # Storage (Supabase)
│       ├── logic.ts              # Pure business logic
│       └── ui/                   # Feature-specific UI components
│           ├── Component.tsx
│           └── Component.model.ts    # UI state & hooks
│
└── shared/
    ├── features/                 # UI + logic bundles (3+ routes)
    ├── ui/                       # Pure UI components
    ├── models/                   # Shared hooks
    └── lib/                      # Pure functions
```

---

## 4 Core Rules

| # | Rule | Threshold |
|---|------|-----------|
| 1 | **Route = Feature** | Everything for `/todos` lives in `app/todos/` |
| 2 | **Flat until painful** | No subfolders until 7+ files |
| 3 | **Shared = last resort** | Only if used by 2+ routes |
| 4 | **View + Model together** | `Component.tsx` + `Component.model.ts` |

---

## Import Hierarchy

Dependencies flow DOWN only. Never import from upper layers.

```
┌─────────────────────────────────────────────────┐
│  app/                    (Composition)          │
├─────────────────────────────────────────────────┤
│  shared/features/        (UI + logic bundles)   │  ← ui/, models/, lib/
├─────────────────────────────────────────────────┤
│  shared/ui/              (UI components)        │  ← lib/ only
│  shared/models/          (Hooks, state)         │  ← lib/ only
├─────────────────────────────────────────────────┤
│  shared/lib/             (Pure functions)       │  ← external only
└─────────────────────────────────────────────────┘
```

### Forbidden Imports

- `shared/ui/` cannot import from `shared/models/` (siblings)
- `shared/*` cannot import from `app/*`
- `app/route-a/` cannot import from `app/route-b/`

---

## File Responsibilities

| File | Purpose | Imports From |
|------|---------|--------------|
| `page.tsx` | UI, render, call actions | `actions.ts` |
| `actions.ts` | Orchestration, glue | `logic.ts`, `data.ts` |
| `logic.ts` | Pure business rules | Nothing (types only) |
| `data.ts` | Storage (Supabase) | `shared/lib/supabase` |
| `Component.model.ts` | UI state, hooks | `shared/lib/`, `logic.ts` |

---

## When to Split

| Condition | Action |
|-----------|--------|
| 1-6 files in route | Stay flat |
| 7-12 files | Group by concern (`components/`, `hooks/`) |
| 13+ files | Split into sub-features or extract to shared |
| Model > 200 lines | Split by concern (`*.filters.ts`, `*.sorting.ts`) |
| Logic > 50 lines | Extract to `logic.ts` |
| Business rules > 20 lines | Extract to `services/` |

---

## When to Move to Shared

| Usage | Location |
|-------|----------|
| 1 route | Keep in route |
| 2+ routes | Move to `shared/` |

### Shared Folder Types

| Folder | Contains |
|--------|----------|
| `shared/lib/` | Pure functions (formatters, validators, constants) |
| `shared/ui/` | Presentational components (no business logic) |
| `shared/models/` | Hooks and state (no UI) |
| `shared/features/` | UI + logic bundles (always used together) |
| `shared/services/` | Shared business logic |
| `shared/queries/` | Shared DB queries |

---

## Server vs Client

| Need | Component Type |
|------|----------------|
| Data fetching | Server |
| SEO content | Server |
| useState, useEffect | Client |
| Event handlers | Client |
| Browser APIs | Client |

**Default:** Server. Add `'use client'` only when needed.

---

## Naming Conventions

| Type | Convention |
|------|------------|
| Components | `PascalCase.tsx` |
| Hooks | `useCamelCase.ts` |
| Logic/Utils | `camelCase.ts` |
| Actions | `actions.ts` |
| Types | `types.ts` or colocated |

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| `shared/` from day 1 | Keep in route, extract at 2nd usage |
| Deep folder nesting | Flat until painful |
| Barrel files everywhere | Direct imports |
| Separate `/api` folder | Server Actions in feature |
| Business logic in components | Extract to `logic.ts` or `services/` |
| Cross-route imports | Move to `shared/` |

---

## 3-File Pattern (Clean Separation)

**When to use:** Complex business logic, need testability, may swap storage.

```
page.tsx → actions.ts → logic.ts (pure)
                     → data.ts  (storage)
```

- `logic.ts` imports NOTHING (except types)
- `data.ts` imports only storage client
- `actions.ts` glues both
- `page.tsx` imports only actions

---

## Quick Reference

> **Start in route. Split when painful. Share when proven.**

1. New code → route folder
2. Growing → extract files
3. Reused 2x → move to `shared/`
4. Complex → split by concern
5. Never → premature abstraction
