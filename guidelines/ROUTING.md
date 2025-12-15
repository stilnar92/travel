# Routing Guidelines

## Overview

All application routes must be defined in `src/shared/lib/routes.ts`. Never use hardcoded URL strings in components.

## Rules

### ✅ DO

```typescript
import { routes } from "@/shared/lib/routes";

// Navigation
router.push(routes.vendors.list);
router.push(routes.vendors.edit(vendorId));

// Links
<Link href={routes.vendors.new}>Add Vendor</Link>
<Link href={routes.vendors.edit(id)}>Edit</Link>
```

### ❌ DON'T

```typescript
// Hardcoded strings
router.push("/vendors");
router.push(`/vendors/${id}/edit`);

<Link href="/vendors/new">Add Vendor</Link>
```

## Route Structure

```typescript
// src/shared/lib/routes.ts
export const routes = {
  home: "/",

  vendors: {
    list: "/vendors",
    new: "/vendors/new",
    edit: (id: string) => `/vendors/${id}/edit`,
    view: (id: string) => `/vendors/${id}`,
  },

  categories: {
    list: "/categories",
  },
} as const;
```

## Benefits

1. **Type safety** - TypeScript catches typos and invalid routes
2. **Refactoring** - Change route once, updates everywhere
3. **Discoverability** - All routes visible in one place
4. **Consistency** - Standard pattern across the codebase

## Adding New Routes

1. Add route to `src/shared/lib/routes.ts`
2. Use descriptive names (e.g., `vendors.edit` not `vendors.e`)
3. Use functions for dynamic routes with parameters
4. Group related routes under namespace objects
