import { tv, type VariantProps } from "tailwind-variants";

const stack = tv({
  base: "flex",
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    wrap: {
      true: "flex-wrap",
    },
  },
  defaultVariants: {
    direction: "column",
    gap: "md",
    align: "stretch",
    justify: "start",
  },
});

type StackProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof stack>;

export function Stack({
  direction,
  gap,
  align,
  justify,
  wrap,
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={stack({ direction, gap, align, justify, wrap, className })}
      {...props}
    />
  );
}
