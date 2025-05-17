import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border border-neutral-200 px-1 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 dark:border-neutral-800 dark:focus:ring-neutral-300",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-neutral-900 text-neutral-50 shadow hover:bg-neutral-900/80 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/80",
        secondary:
          "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800/80",
        destructive:
          "border-transparent bg-red-500 text-neutral-50 shadow hover:bg-red-500/80 dark:bg-red-900 dark:text-neutral-50 dark:hover:bg-red-900/80",
        warning:
          "border-transparent bg-yellow-500 text-neutral-50 shadow hover:bg-yellow-500/80 dark:bg-yellow-800 dark:text-neutral-50 dark:hover:bg-yellow-800/80",
        outline: "text-neutral-950 dark:text-neutral-50",
        green:
          "border-transparent bg-green-500 text-green-200 shadow hover:bg-green-500/80 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900/80",
        red: "border-transparent bg-red-500 text-red-200 shadow hover:bg-red-500/80 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-900/80",
        minimal: "border-transparent bg-neutral-700 text-neutral-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
