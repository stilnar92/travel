"use client";

import { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/shared/lib/utils";

const checkbox = tv({
  base: [
    "peer shrink-0 rounded border border-input",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "checked:bg-primary checked:border-primary checked:text-primary-foreground",
  ],
  variants: {
    size: {
      sm: "h-3.5 w-3.5",
      default: "h-4 w-4",
      lg: "h-5 w-5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
    VariantProps<typeof checkbox> {}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(checkbox({ size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox, checkbox };
