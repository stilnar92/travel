# Design System

UI component guidelines using **tailwind-variants** as the single source of styling.

---

## 1. Philosophy

| Principle | Description |
|-----------|-------------|
| **Component-first** | Build UI from reusable, composable components |
| **Composition over inheritance** | Combine simple components to create complex ones |
| **Type-safe variants** | All styling via `tailwind-variants` with TypeScript inference |
| **Accessibility** | React Aria patterns for keyboard, screen readers, focus |
| **Theming** | Light/dark modes via CSS variables |

**Inspiration:** [React Aria](https://react-spectrum.adobe.com/react-aria/) for accessibility patterns.

---

## 2. Design Tokens

### 2.1 Color System & Theming

All colors use **CSS variables in HSL format** for easy theming.

```css
/* globals.css */
:root {
  /* Background & Foreground */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;

  /* Primary */
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;

  /* Secondary */
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;

  /* Muted */
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;

  /* Accent */
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;

  /* Destructive */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;

  /* Border & Ring */
  --border: 240 5.9% 90%;
  --ring: 240 5.9% 10%;

  /* Radius */
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;

  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;

  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;

  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;

  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;

  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;

  --border: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}
```

**Usage in tailwind-variants:**

```typescript
const button = tv({
  base: 'bg-primary text-primary-foreground',
  variants: {
    variant: {
      destructive: 'bg-destructive text-destructive-foreground',
      outline: 'border border-border bg-background',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    },
  },
})
```

**Theme switching with next-themes:**

```typescript
// shared/providers/theme-provider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
```

### 2.2 Typography

| Token | Value | Usage |
|-------|-------|-------|
| `text-xs` | 12px | Labels, captions |
| `text-sm` | 14px | Secondary text, buttons |
| `text-base` | 16px | Body text |
| `text-lg` | 18px | Subheadings |
| `text-xl` | 20px | Section titles |
| `text-2xl` | 24px | Page headings |
| `text-3xl` | 30px | Hero titles |

**Font weights:**

| Token | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Buttons, labels |
| `font-semibold` | 600 | Subheadings |
| `font-bold` | 700 | Headings |

### 2.3 Spacing & Sizing

**4px base grid:**

| Token | Value | Pixels |
|-------|-------|--------|
| `0` | 0 | 0px |
| `1` | 0.25rem | 4px |
| `2` | 0.5rem | 8px |
| `3` | 0.75rem | 12px |
| `4` | 1rem | 16px |
| `6` | 1.5rem | 24px |
| `8` | 2rem | 32px |
| `12` | 3rem | 48px |
| `16` | 4rem | 64px |

**Component sizes:**

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `sm` | h-8 (32px) | px-3 | text-sm |
| `md` | h-10 (40px) | px-4 | text-sm |
| `lg` | h-12 (48px) | px-6 | text-base |

**Border radius tokens:**

| Token | Value |
|-------|-------|
| `rounded-sm` | 0.125rem (2px) |
| `rounded` | 0.25rem (4px) |
| `rounded-md` | 0.375rem (6px) |
| `rounded-lg` | 0.5rem (8px) |
| `rounded-xl` | 0.75rem (12px) |
| `rounded-full` | 9999px |

### 2.4 Shadows & Effects

| Token | Usage |
|-------|-------|
| `shadow-sm` | Cards, subtle elevation |
| `shadow` | Dropdowns, popovers |
| `shadow-md` | Modals, dialogs |
| `shadow-lg` | Floating elements |
| `shadow-xl` | High elevation overlays |

---

## 3. Accessibility (a11y)

### Focus Ring Pattern

```typescript
const focusRing = tv({
  base: [
    'outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
  ],
})
```

### ARIA Attributes

| Component | Required ARIA |
|-----------|---------------|
| Button (icon-only) | `aria-label` |
| Dialog | `aria-labelledby`, `aria-describedby` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"` |
| Menu | `role="menu"`, `role="menuitem"` |
| Alert | `role="alert"` |
| Progress | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

### Color Contrast

- Text on background: minimum 4.5:1 ratio (WCAG AA)
- Large text (18px+): minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus to next element |
| `Shift+Tab` | Move focus to previous element |
| `Enter/Space` | Activate focused element |
| `Escape` | Close overlay/dialog |
| `Arrow keys` | Navigate within component (tabs, menu) |

---

## 4. Icons

**Library:** `lucide-react`

```typescript
import { Search, X, ChevronDown } from 'lucide-react'

// Icon sizes match text
<Search className="h-4 w-4" />  // text-sm
<Search className="h-5 w-5" />  // text-base
<Search className="h-6 w-6" />  // text-lg
```

**Icon + Text alignment:**

```typescript
const iconText = tv({
  base: 'inline-flex items-center gap-2',
})

<span className={iconText()}>
  <Search className="h-4 w-4" />
  Search
</span>
```

**Icon-only buttons:**

```typescript
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>
```

---

## 5. Animation & Transitions

### Duration Tokens

| Token | Duration | Usage |
|-------|----------|-------|
| `duration-75` | 75ms | Instant feedback |
| `duration-150` | 150ms | Fast transitions (hover) |
| `duration-200` | 200ms | Normal transitions |
| `duration-300` | 300ms | Slow transitions (modals) |

### Easing Functions

| Token | Usage |
|-------|-------|
| `ease-in` | Exit animations |
| `ease-out` | Enter animations |
| `ease-in-out` | General purpose |

### Standard Transitions

```typescript
const transitions = tv({
  variants: {
    transition: {
      colors: 'transition-colors duration-150',
      opacity: 'transition-opacity duration-200',
      transform: 'transition-transform duration-200',
      all: 'transition-all duration-200',
    },
  },
})
```

### Reduced Motion Support

```typescript
const animation = tv({
  base: [
    'motion-safe:transition-all',
    'motion-safe:duration-200',
    'motion-reduce:transition-none',
  ],
})
```

---

## 6. Component Hierarchy (By Function)

```
shared/ui/
├── forms/          # Input, Select, Checkbox, FormField, SearchInput
├── feedback/       # Alert, Toast, Skeleton, Progress, Spinner
├── layout/         # Stack, Container, Grid, Divider, Spacer
├── navigation/     # Tabs, Breadcrumb, Pagination, Link
├── overlay/        # Dialog, Dropdown, Popover, Tooltip, Sheet
├── data-display/   # Table, Card, List, Badge, Avatar
└── buttons/        # Button, IconButton, LoadingButton
```

**Rules:**
- shadcn and custom components live together within each folder
- No separation by "source" - only by function
- Easy to find: "I need a form component" → look in `forms/`

---

## 7. Layout Components

### Stack

```typescript
// shared/ui/layout/stack.tsx
import { tv, type VariantProps } from 'tailwind-variants'

const stack = tv({
  base: 'flex',
  variants: {
    direction: {
      row: 'flex-row',
      column: 'flex-col',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
  },
  defaultVariants: {
    direction: 'column',
    gap: 'md',
    align: 'stretch',
    justify: 'start',
  },
})

type StackProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof stack>

export function Stack({
  direction, gap, align, justify, className, ...props
}: StackProps) {
  return (
    <div
      className={stack({ direction, gap, align, justify, className })}
      {...props}
    />
  )
}
```

### Container

```typescript
// shared/ui/layout/container.tsx
const container = tv({
  base: 'mx-auto w-full px-4',
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
})
```

### Grid

```typescript
// shared/ui/layout/grid.tsx
const grid = tv({
  base: 'grid',
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    },
    gap: {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 'md',
  },
})
```

### Divider

```typescript
// shared/ui/layout/divider.tsx
const divider = tv({
  base: 'bg-border',
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full w-px',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
})
```

---

## 8. tailwind-variants Rules

### Core Rule

> **ALL styling MUST use `tv()` function. No raw Tailwind classes in JSX.**

### Structure

```typescript
import { tv, type VariantProps } from 'tailwind-variants'

const component = tv({
  // Base styles (always applied)
  base: 'rounded-md font-medium transition-colors',

  // Variant options
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      ghost: 'hover:bg-accent',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    },
    disabled: {
      true: 'opacity-50 pointer-events-none',
    },
  },

  // Combinations of variants
  compoundVariants: [
    {
      variant: 'primary',
      disabled: true,
      class: 'bg-primary/50',
    },
  ],

  // Default values
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})
```

### Slots (Multi-part Components)

```typescript
const card = tv({
  slots: {
    root: 'rounded-lg border bg-card shadow-sm',
    header: 'flex flex-col space-y-1.5 p-6',
    title: 'text-2xl font-semibold',
    description: 'text-sm text-muted-foreground',
    content: 'p-6 pt-0',
    footer: 'flex items-center p-6 pt-0',
  },
  variants: {
    size: {
      sm: {
        root: 'max-w-sm',
        header: 'p-4',
        content: 'p-4 pt-0',
      },
      lg: {
        root: 'max-w-lg',
      },
    },
  },
})

// Usage
const { root, header, title, content } = card({ size: 'sm' })

<div className={root()}>
  <div className={header()}>
    <h3 className={title()}>Card Title</h3>
  </div>
  <div className={content()}>Content</div>
</div>
```

### Responsive Variants

```typescript
const layout = tv({
  base: 'grid',
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
    },
  },
  defaultVariants: {
    cols: 1,
  },
}, {
  responsiveVariants: ['sm', 'md', 'lg'],
})

// Usage
<div className={layout({ cols: { initial: 1, sm: 2, lg: 3 } })} />
```

### Type Inference

```typescript
import { tv, type VariantProps } from 'tailwind-variants'

const button = tv({ /* ... */ })

type ButtonVariants = VariantProps<typeof button>

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
          ButtonVariants {
  children: React.ReactNode
}
```

---

## 9. Component Templates

### Template 1: shadcn Installation

```bash
pnpm dlx shadcn@latest add button
```

Component goes to `shared/ui/buttons/button.tsx`.

### Template 2: Wrapping shadcn

```typescript
// shared/ui/buttons/loading-button.tsx
'use client'

import { tv, type VariantProps } from 'tailwind-variants'
import { Button, type ButtonProps } from './button'
import { Loader2 } from 'lucide-react'

const loadingButton = tv({
  base: 'relative',
  variants: {
    loading: {
      true: 'text-transparent',
    },
  },
})

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
}

export function LoadingButton({
  loading,
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={loadingButton({ loading, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="absolute h-4 w-4 animate-spin" />
      )}
      {children}
    </Button>
  )
}
```

### Template 3: From Scratch

```typescript
// shared/ui/feedback/badge.tsx
import { tv, type VariantProps } from 'tailwind-variants'

const badge = tv({
  base: [
    'inline-flex items-center rounded-full',
    'px-2.5 py-0.5',
    'text-xs font-semibold',
    'transition-colors',
  ],
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      outline: 'border border-border text-foreground',
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badge>

export function Badge({ variant, className, ...props }: BadgeProps) {
  return <span className={badge({ variant, className })} {...props} />
}
```

### Template 4: Form Field Composition

```typescript
// shared/ui/forms/form-field.tsx
'use client'

import { tv } from 'tailwind-variants'
import { Label } from './label'
import { Input } from './input'

const formField = tv({
  slots: {
    root: 'space-y-2',
    label: 'text-sm font-medium',
    input: 'w-full',
    error: 'text-sm text-destructive',
    hint: 'text-sm text-muted-foreground',
  },
  variants: {
    error: {
      true: {
        label: 'text-destructive',
        input: 'border-destructive focus-visible:ring-destructive',
      },
    },
  },
})

interface FormFieldProps {
  label: string
  name: string
  error?: string
  hint?: string
}

export function FormField({ label, name, error, hint }: FormFieldProps) {
  const styles = formField({ error: !!error })

  return (
    <div className={styles.root()}>
      <Label htmlFor={name} className={styles.label()}>{label}</Label>
      <Input id={name} name={name} className={styles.input()} />
      {error && <p className={styles.error()}>{error}</p>}
      {hint && !error && <p className={styles.hint()}>{hint}</p>}
    </div>
  )
}
```

---

## 10. Patterns

### Props Interface

```typescript
// Extend HTML attributes + add variants
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
          VariantProps<typeof button> {
  asChild?: boolean
}
```

### className Prop Handling

```typescript
// tv() automatically merges className with variants
export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={button({ variant, size, className })} {...props} />
}

// Usage - custom classes merge correctly
<Button variant="primary" className="mt-4" />
```

### Responsive Variants

```typescript
// Option 1: Use responsiveVariants config
const card = tv({ /* ... */ }, { responsiveVariants: ['sm', 'md', 'lg'] })
<div className={card({ size: { initial: 'sm', md: 'lg' } })} />

// Option 2: Template literals for one-off responsive
<div className={card({ size: 'sm', className: 'md:max-w-lg' })} />
```

### State Variants

```typescript
const input = tv({
  base: 'border rounded-md px-3 py-2',
  variants: {
    state: {
      default: 'border-border',
      error: 'border-destructive',
      success: 'border-green-500',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed bg-muted',
    },
  },
})
```

### Dark Mode

```typescript
// Dark mode handled automatically via CSS variables
const card = tv({
  base: 'bg-background text-foreground', // Works in both modes
})

// For explicit dark mode styles
const badge = tv({
  variants: {
    variant: {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    },
  },
})
```

### Forwarding Refs

```typescript
import { forwardRef } from 'react'

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={button({ variant, size, className })}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

### Polymorphic Components

```typescript
import { Slot } from '@radix-ui/react-slot'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export function Button({ asChild, className, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={button({ className })} {...props} />
}

// Usage
<Button asChild>
  <a href="/link">Link styled as button</a>
</Button>
```

---

## 11. Anti-patterns

| Don't | Do Instead |
|-------|------------|
| `<button className="px-4 py-2 bg-blue-500">` | Use `tv()` with variants |
| `style={{ padding: 16 }}` | Use Tailwind spacing tokens |
| CSS modules (`.button { }`) | Use `tv()` |
| `cn('variant-a', condition && 'variant-b')` for variants | Use `tv()` variants |
| `#3B82F6` hardcoded colors | Use semantic tokens (`bg-primary`) |
| `margin-top: 17px` magic numbers | Use spacing scale (`mt-4`) |
| Custom breakpoints | Use Tailwind defaults (`sm`, `md`, `lg`, `xl`) |
| `!important` overrides | Fix specificity with proper variant structure |

### cn() vs tv() Usage

```typescript
// cn() - ONLY for conditional class toggling
cn('base-class', isActive && 'active-class', className)

// tv() - for ALL variant-based styling
const button = tv({
  variants: {
    active: { true: 'bg-accent' }
  }
})
button({ active: isActive, className })
```

---

## Quick Reference

| Need | Solution |
|------|----------|
| Component styling | `tv()` with variants |
| Conditional classes | `tv()` variants or `cn()` |
| Theme colors | CSS variables (`bg-primary`) |
| Spacing | Tailwind scale (`p-4`, `gap-6`) |
| Responsive | `responsiveVariants` or `md:` prefix |
| Dark mode | CSS variables auto-switch |
| Accessibility | Focus rings, ARIA, contrast |
| Icons | `lucide-react` |
| Animation | `transition-*` + `duration-*` |
