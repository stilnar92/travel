# Tech Stack Integration

How each technology integrates with architecture patterns from `ARCHITECTURE-RULES.md`.

---

## 1. Next.js (App Router)

| Architecture Concept | Next.js Implementation |
|---------------------|------------------------|
| Route = Feature | `app/[feature]/` folder |
| `page.tsx` | Server Component (default) |
| `actions.ts` | Server Actions (`'use server'`) |
| Client components | `'use client'` directive |
| `data.ts` | Server-only data fetching |

### Server vs Client Decision

| Need | Component Type | Directive |
|------|----------------|-----------|
| Data fetching | Server | (none) |
| SEO content | Server | (none) |
| useState, useEffect | Client | `'use client'` |
| Event handlers (onClick) | Client | `'use client'` |
| Browser APIs | Client | `'use client'` |

**Default:** Server Component. Add `'use client'` only when needed.

---

## 2. TypeScript

### tsconfig.json (Strict Mode)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Type Patterns by File

| File | Type Pattern |
|------|--------------|
| `page.tsx` | Props from params, searchParams |
| `actions.ts` | Input/Output types, Zod inference |
| `data.ts` | Database types, Supabase generated |
| `logic.ts` | Pure function signatures |
| `Component.model.ts` | Hook return types, state types |

### Zod Type Inference

```typescript
// Define schema once, infer type
const VendorSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['hotel', 'restaurant', 'yacht']),
})

type Vendor = z.infer<typeof VendorSchema>
```

---

## 3. Zod Integration

| File | Zod Usage | Example |
|------|-----------|---------|
| `actions.ts` | Input validation | `schema.parse(input)` |
| `data.ts` | Response validation | `schema.safeParse(dbResult)` |
| `logic.ts` | Business rules | `schema.refine()` |
| Forms | React Hook Form | `zodResolver(schema)` |

### Validation Patterns

```typescript
// actions.ts - validate input
export async function createVendor(input: unknown) {
  const data = VendorSchema.parse(input) // throws on invalid
  return await saveVendor(data)
}

// data.ts - validate response
export async function getVendors() {
  const result = await supabase.from('vendors').select()
  return VendorsArraySchema.parse(result.data)
}
```

### Error Handling

```typescript
// Safe parsing with error handling
const result = schema.safeParse(input)
if (!result.success) {
  return { error: result.error.flatten() }
}
return { data: result.data }
```

---

## 4. React Hook Form + Zod

### Schema Location

Define schemas in `logic.ts`, import in both form and actions:

```typescript
// app/vendors/logic.ts
import { z } from "zod";

export const vendorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  city: z.string().min(1, "City is required"),
});

export type VendorFormData = z.infer<typeof vendorSchema>;
```

### Complete Form Pattern

```typescript
// app/vendors/VendorForm.tsx
'use client'

import { useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorSchema, type VendorFormData } from "./logic";
import { createVendorAction } from "./actions";

// Local field component - keeps form readable
interface VendorNameFieldProps {
  register: UseFormRegister<VendorFormData>;
  onEscape?: () => void;
}

function VendorNameField({ register, onEscape }: VendorNameFieldProps) {
  return (
    <Input
      {...register("name")}
      placeholder="Vendor name"
      autoFocus
      onKeyDown={(e) => {
        if (e.key === "Escape") onEscape?.();
      }}
    />
  );
}

export function VendorForm() {
  // Server error state (separate from client validation)
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  const onSubmit = async (data: VendorFormData) => {
    setServerError(null);

    // Convert to FormData for server action
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("city", data.city);

    const result = await createVendorAction(formData);

    if (result.success) {
      reset();
    } else {
      setServerError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Server errors (DB, network, etc.) */}
      {serverError && <Alert variant="error">{serverError}</Alert>}

      {/* Client validation errors (Zod via react-hook-form) */}
      {errors.name && <Alert variant="error">{errors.name.message}</Alert>}

      <VendorNameField register={register} onEscape={handleCancel} />

      <Button type="submit" disabled={isSubmitting}>
        Create
      </Button>
    </form>
  );
}
```

### Error Types

| Error Type | Source | Handling |
|------------|--------|----------|
| Client validation | Zod via react-hook-form | `formState.errors` |
| Server validation | Server action re-validates | `ActionResult.error` |
| Server error | Database, network | `ActionResult.error` |

### Server Action Integration

```typescript
// app/vendors/actions.ts
'use server'

import { revalidatePath } from "next/cache";
import { ok, err, type ActionResult } from "@/shared/lib/action-result";
import { vendorSchema } from "./logic";

export async function createVendorAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  // Re-validate on server (never trust client)
  const result = vendorSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
  });

  if (!result.success) {
    return err(result.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    const vendor = await createVendor(result.data);
    revalidatePath("/vendors");
    return ok({ id: vendor.id });
  } catch (error) {
    return err("Failed to create vendor");
  }
}
```

### Local Field Components

Extract repeated form fields into local components (same file):

```typescript
// Define BEFORE main component
interface FieldProps {
  register: UseFormRegister<FormData>;
  onEscape?: () => void;
}

function NameField({ register, onEscape }: FieldProps) {
  return (
    <Input
      {...register("name")}
      placeholder="Name"
      onKeyDown={(e) => e.key === "Escape" && onEscape?.()}
    />
  );
}

// Main component uses local field
export function MyForm() {
  const { register } = useForm<FormData>(...);
  return <NameField register={register} onEscape={handleCancel} />;
}
```

**Rules:**
- Define local component BEFORE main component
- Pass `register` function, not entire form object
- Use explicit interface for props
- Extract when field is used 2+ times in same file

### With shadcn/ui Form (Alternative)

```typescript
<Form {...form}>
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

---

## 5. Supabase Integration

### Architecture Mapping

| Architecture Layer | Supabase Usage |
|-------------------|----------------|
| `data.ts` | Supabase client queries |
| `actions.ts` | Orchestrates data calls |
| `middleware.ts` | Auth session refresh |
| Database | Row-Level Security (RLS) |

### Client Setup

```typescript
// shared/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// shared/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => cookies.forEach(c => cookieStore.set(c)),
      },
    }
  )
}
```

### data.ts Pattern

```typescript
// app/vendors/data.ts
import { createClient } from '@/shared/lib/supabase/server'

export async function getVendors() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getVendorById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
```

### actions.ts Pattern

```typescript
// app/vendors/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { getVendors, saveVendor } from './data'
import { validateVendor } from './logic'

export async function createVendor(input: unknown) {
  // 1. Validate input
  const validated = validateVendor(input)
  if (!validated.success) {
    return { error: validated.error }
  }

  // 2. Save to database
  const result = await saveVendor(validated.data)

  // 3. Revalidate cache
  revalidatePath('/vendors')

  return { data: result }
}
```

---

## 6. Tailwind + tailwind-variants

### Base Styling

```typescript
// Component with Tailwind
function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
      {children}
    </button>
  )
}
```

### tailwind-variants Pattern

```typescript
// shared/ui/button.tsx
import { tv } from 'tailwind-variants'

const button = tv({
  base: 'px-4 py-2 rounded-md font-medium transition-colors',
  variants: {
    color: {
      primary: 'bg-primary text-white hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg',
    },
  },
  defaultVariants: {
    color: 'primary',
    size: 'md',
  },
})

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ color, size, className, ...props }: ButtonProps) {
  return <button className={button({ color, size, className })} {...props} />
}
```

### cn() Helper (shadcn default)

```typescript
// shared/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn('base-class', conditional && 'conditional-class', className)} />
```

---

## 7. shadcn/ui

### Component Location

| Component Type | Location |
|----------------|----------|
| Base shadcn components | `shared/ui/` |
| Feature-specific UI | `app/[feature]/components/` |
| Composed components | `shared/features/` (if 2+ routes) |

### Installation Pattern

```bash
# Add components as needed
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add dialog
```

### Customization

```typescript
// Extend shadcn component
import { Button as ShadcnButton } from '@/shared/ui/button'

export function LoadingButton({ loading, children, ...props }) {
  return (
    <ShadcnButton disabled={loading} {...props}>
      {loading ? <Spinner /> : children}
    </ShadcnButton>
  )
}
```

---

## 8. Utility Libraries

| Library | Location | Usage |
|---------|----------|-------|
| `date-fns` | `shared/lib/date.ts` | Date formatting, manipulation |
| `clsx` + `tailwind-merge` | `shared/lib/utils.ts` | cn() helper |
| `lucide-react` | Direct import | Icons |
| `sonner` | `shared/ui/toaster.tsx` | Toast notifications |
| `next-themes` | `shared/providers/` | Theme switching |
| `nuqs` | Feature hooks | URL state management |
| `nanoid` | `shared/lib/id.ts` | ID generation |

### date-fns

```typescript
// shared/lib/date.ts
import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date: Date | string) {
  return format(new Date(date), 'MMM d, yyyy')
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}
```

### sonner

```typescript
// Layout setup
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

// Usage in components
import { toast } from 'sonner'

toast.success('Vendor created')
toast.error('Failed to save')
```

### nuqs (URL State)

```typescript
// app/vendors/page.tsx
import { useQueryState } from 'nuqs'

export default function VendorsPage() {
  const [search, setSearch] = useQueryState('q')
  const [category, setCategory] = useQueryState('category')

  // URL: /vendors?q=hotel&category=accommodation
}
```

### nanoid

```typescript
// shared/lib/id.ts
import { nanoid } from 'nanoid'

export function generateId() {
  return nanoid() // "V1StGXR8_Z5jdHi6B-myT"
}

export function generateShortId() {
  return nanoid(10) // "V1StGXR8_Z"
}
```

---

## 9. Code Quality Tools

### ESLint

```javascript
// eslint.config.mjs
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'import/order': ['error', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling'],
        'newlines-between': 'always',
      }],
    },
  },
]
```

### Prettier

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Husky + lint-staged

```bash
# Setup
pnpm add -D husky lint-staged
pnpm exec husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
pnpm lint-staged
```

---

## 10. Development Environment

### pnpm

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit"
  }
}
```

### Environment Variables

```bash
# .env.local (git ignored)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# .env.example (committed)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Type-safe Env with Zod

```typescript
// shared/lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)
```

### VSCode Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma"
  ]
}
```

---

## Quick Reference

| Task | Tool | Location |
|------|------|----------|
| Validate input | Zod | `actions.ts` + `logic.ts` |
| Form handling | React Hook Form + Zod | Client component |
| Form schema | Zod | `logic.ts` |
| Server errors | ActionResult | `actions.ts` → component state |
| Client validation errors | react-hook-form | `formState.errors` |
| Database query | Supabase | `data.ts` |
| Business logic | Pure functions | `logic.ts` |
| Styling variants | tailwind-variants | `shared/ui/` |
| Toast notifications | sonner | Any client component |
| URL state | nuqs | Feature page/component |
| Date formatting | date-fns | `shared/lib/date.ts` |
| ID generation | nanoid | `shared/lib/id.ts` |

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Validate in components | Validate in `actions.ts` |
| Supabase calls in components | Use `data.ts` + `actions.ts` |
| Inline complex styles | Use tailwind-variants |
| Manual form state | Use React Hook Form |
| String concatenation for classes | Use cn() helper |
| Hardcode env values | Use Zod-validated env |
| Large client components | Split into smallest client + server parent |
| Pass entire form object | Pass only `register` to local fields |
| Define schema in form | Define in `logic.ts`, import everywhere |
| Mix server/client errors | Separate: `formState.errors` vs `serverError` state |
