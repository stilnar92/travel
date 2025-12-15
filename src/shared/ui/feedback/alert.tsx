import { tv, type VariantProps } from "tailwind-variants";

const alert = tv({
  base: "rounded-md p-3 text-sm",
  variants: {
    variant: {
      error: "bg-destructive/10 text-destructive",
      success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    },
  },
  defaultVariants: {
    variant: "error",
  },
});

type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alert>;

export function Alert({ variant, className, ...props }: AlertProps) {
  return <div role="alert" className={alert({ variant, className })} {...props} />;
}
