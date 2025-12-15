import { tv, type VariantProps } from "tailwind-variants";

const grid = tv({
  base: "grid",
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    },
    colsMd: {
      1: "md:grid-cols-1",
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
      5: "md:grid-cols-5",
      6: "md:grid-cols-6",
    },
    colsLg: {
      1: "lg:grid-cols-1",
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
      6: "lg:grid-cols-6",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
  },
  defaultVariants: {
    cols: 1,
    gap: "md",
  },
});

type GridProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof grid>;

export function Grid({
  cols,
  colsMd,
  colsLg,
  gap,
  className,
  ...props
}: GridProps) {
  return (
    <div
      className={grid({ cols, colsMd, colsLg, gap, className })}
      {...props}
    />
  );
}
