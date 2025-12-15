# UI Component Principles

Core principles for building UI components. Based on Radix UI / shadcn approach.

---

## Pattern Hierarchy

| Priority | Pattern | Use When |
|----------|---------|----------|
| 1 | **Custom Hooks** | Shared stateful logic, most cases |
| 2 | **Compound Components** | Multi-part UI with shared state (forms, tabs, modals) |
| 3 | **Render Props** | Rare - only when rendering control is critical |

**Default**: Start with hooks. Upgrade to compound components when needed.

---

## Core Principles

### 1. Composition Over Configuration

```tsx
// ❌ BAD: Prop soup
<Card
  showHeader
  footerVariant="compact"
  isCompact
  title="..."
  subtitle="..."
  headerAction={<Button />}
/>

// ✅ GOOD: Composable
<Card>
  <CardHeader>
    <CardTitle>...</CardTitle>
    <CardDescription>...</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

**Why**: Flexible, declarative, no prop explosion.

---

### 2. The `asChild` Pattern

Radix's signature pattern. Allows component behavior without forcing DOM structure.

```tsx
// Default: renders <button>
<Button>Click me</Button>

// With asChild: renders Link with Button styles/behavior
<Button asChild>
  <Link href="/home">Go Home</Link>
</Button>

// With asChild: renders anchor
<Button asChild variant="ghost">
  <a href="https://example.com">External Link</a>
</Button>
```

#### Implementation

```tsx
import { Slot } from '@radix-ui/react-slot'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp ref={ref} {...props} />
  }
)
```

**How `Slot` works**: Merges props onto its child element instead of rendering a wrapper.

#### When to Use `asChild`

| Scenario | Use `asChild` |
|----------|---------------|
| Button as Link | Yes |
| Custom trigger for Dialog/Popover | Yes |
| Polymorphic "as" prop replacement | Yes |
| Simple variant switching | No (use variants) |

---

### 3. Variant-Based Styling

Use `tailwind-variants` for type-safe, composable styles.

```tsx
import { tv, type VariantProps } from 'tailwind-variants'

const button = tv({
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',

  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      sm: 'h-9 px-3 text-sm',
      default: 'h-10 px-4 py-2',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10',
    },
  },

  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

type ButtonVariants = VariantProps<typeof button>
```

#### Compound Variants

For special combination treatments:

```tsx
const button = tv({
  variants: {
    variant: { primary: '...', outline: '...' },
    size: { sm: '...', lg: '...' },
  },
  compoundVariants: [
    {
      variant: 'outline',
      size: 'lg',
      class: 'border-2', // thicker border for large outline
    },
  ],
})
```

---

### 4. Consistent Naming

Use same variant names across all components:

| Variant | Values |
|---------|--------|
| `variant` | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` |
| `size` | `sm`, `default`, `lg`, `icon` |

---

## Component Template

Standard structure for all UI components:

```tsx
// shared/ui/button.tsx
import { Slot } from '@radix-ui/react-slot'
import { tv, type VariantProps } from 'tailwind-variants'
import { forwardRef } from 'react'
import { cn } from '@/shared/lib/utils'

// 1. Define variants
const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      sm: 'h-9 px-3',
      default: 'h-10 px-4 py-2',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

// 2. Define props (extend HTML + variants + asChild)
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// 3. Component with forwardRef
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

// 4. Export component and variants
export { Button, buttonVariants }
```

---

## Compound Components Pattern

For complex multi-part UI (tabs, accordion, dialog).

### Structure

```tsx
// 1. Create context
const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('useTabs must be used within Tabs')
  return ctx
}

// 2. Parent manages state
function Tabs({ defaultValue, children }: TabsProps) {
  const [value, setValue] = useState(defaultValue)

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className="...">{children}</div>
    </TabsContext.Provider>
  )
}

// 3. Children consume context
function TabsTrigger({ value, children }: TabsTriggerProps) {
  const { value: activeValue, setValue } = useTabs()
  const isActive = activeValue === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => setValue(value)}
      className={tabsTrigger({ active: isActive })}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, children }: TabsContentProps) {
  const { value: activeValue } = useTabs()
  if (activeValue !== value) return null

  return (
    <div role="tabpanel" className="...">
      {children}
    </div>
  )
}

// 4. Attach subcomponents
Tabs.Trigger = TabsTrigger
Tabs.Content = TabsContent
Tabs.List = TabsList

// 5. Usage
<Tabs defaultValue="account">
  <Tabs.List>
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">Account settings...</Tabs.Content>
  <Tabs.Content value="settings">App settings...</Tabs.Content>
</Tabs>
```

### Rules

- Subcomponents must be semantically attached to parent
- Never re-export subcomponents separately
- Use `data-state` for CSS styling hooks
- Always include ARIA attributes

---

## Local Component Pattern

For form fields and small reusable pieces within a single file. Keeps component readable without creating separate files.

### When to Use

| Scenario | Pattern |
|----------|---------|
| Form field used 2+ times in same file | Local component |
| Component used in 1 file only | Local component |
| Component used in 2+ files | Extract to `shared/ui/` |

### Named Field Components (REQUIRED)

**NEVER use `<Input>` directly in forms. Always wrap in a named component.**

```tsx
// ❌ BAD: Using Input directly
<Input {...register("name")} placeholder="Name" />

// ✅ GOOD: Named field component
<VendorNameField register={register} />
```

**Why:**
- Self-documenting code (what field is this?)
- Encapsulates field-specific behavior (validation, keyboard handlers)
- Easier to find and modify field logic
- Consistent pattern across all forms

### Example

```tsx
// app/vendors/ui/VendorForm.tsx
'use client'

import { useForm, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { vendorSchema, type VendorFormData } from '../logic'

// Named field components - defined BEFORE main component
interface VendorNameFieldProps {
  register: UseFormRegister<VendorFormData>;
}

function VendorNameField({ register }: VendorNameFieldProps) {
  return (
    <Input
      {...register("name")}
      placeholder="Vendor name"
    />
  );
}

interface VendorCityFieldProps {
  register: UseFormRegister<VendorFormData>;
}

function VendorCityField({ register }: VendorCityFieldProps) {
  return (
    <Input
      {...register("city")}
      placeholder="City"
    />
  );
}

// Main component uses named field components
export function VendorForm() {
  const { register, handleSubmit } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VendorNameField register={register} />
      <VendorCityField register={register} />
    </form>
  );
}
```

### Field Naming Convention

| Field Type | Naming Pattern | Example |
|------------|----------------|---------|
| Text input | `{Feature}{FieldName}Field` | `VendorNameField` |
| Select/Dropdown | `{Feature}{FieldName}Select` | `VendorCategorySelect` |
| Checkbox group | `{Feature}{FieldName}Checkboxes` | `VendorCategoriesCheckboxes` |
| Date picker | `{Feature}{FieldName}DatePicker` | `TripStartDatePicker` |

### Rules

- **ALWAYS wrap `<Input>`, `<Select>`, etc. in named components**
- Define local component BEFORE the main component
- Use explicit interface for props (not inline)
- Pass only what's needed (not entire form object)
- Name clearly: `{Feature}{Field}Field` or `{Feature}{Part}`

---

## File Organization

### Simple (default)

```
shared/ui/
├── button.tsx
├── card.tsx
├── input.tsx
└── dialog.tsx
```

### Complex (7+ files per component)

```
shared/ui/
├── button/
│   ├── button.tsx
│   ├── button.variants.ts
│   └── index.ts
├── form/
│   ├── form.tsx
│   ├── form-field.tsx
│   ├── form-item.tsx
│   └── index.ts
```

---

## Guidelines

### DO

- Use `forwardRef` for all components
- Extend native HTML attributes in props
- Always provide `defaultVariants`
- Use consistent variant names (`size`, `variant`)
- Use `cn()` for className merging
- Include `displayName` for DevTools
- Use `data-state` attributes for styling

### DON'T

- Create "God Components" with endless props
- Mix business logic into UI components
- Re-export subcomponents without parent
- Skip accessibility (ARIA, keyboard nav)
- Premature abstraction (wait for 2+ usages)

---

## Integration with Architecture

| Rule | Application |
|------|-------------|
| Route = Feature | Feature-specific UI in `app/[feature]/ui/` |
| Components in `ui/` folder | All feature components live in `ui/` subfolder |
| Shared = last resort | `shared/ui/` only when 2+ routes use it |
| View + Model | `Component.tsx` + `Component.model.ts` for stateful UI |

### Feature Folder Structure

```
app/[feature]/
├── page.tsx              # Server Component (imports from ui/)
├── actions.ts            # Server Actions
├── data.ts               # Data fetching
├── logic.ts              # Pure business logic
└── ui/                   # All UI components here
    ├── FeatureList.tsx
    ├── FeatureItem.tsx
    ├── FeatureItem.model.ts
    ├── FeatureForm.tsx
    └── FeatureForm.model.ts
```

**Why `ui/` folder:**
- Clear separation between page logic and UI components
- Easier to navigate in large features
- Consistent structure across all features

---

## Dependencies

```bash
# Required
pnpm add @radix-ui/react-slot
pnpm add tailwind-variants
pnpm add clsx tailwind-merge

# Optional (for compound components)
pnpm add @radix-ui/react-tabs
pnpm add @radix-ui/react-dialog
# etc.
```

---

## Quick Reference

```tsx
// Basic component with variants + asChild
const Component = forwardRef<HTMLElement, Props>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        className={cn(variants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Component.displayName = 'Component'
```
