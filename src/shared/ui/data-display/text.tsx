import { tv, type VariantProps } from "tailwind-variants";

const text = tv({
  variants: {
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      destructive: "text-destructive",
    },
  },
  defaultVariants: {
    weight: "normal",
    size: "base",
    color: "default",
  },
});

type TextProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof text> & {
    as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  };

export function Text({
  as: Component = "span",
  weight,
  size,
  color,
  className,
  ...props
}: TextProps) {
  return <Component className={text({ weight, size, color, className })} {...props} />;
}
