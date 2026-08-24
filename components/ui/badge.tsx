import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#2A1E17] text-white",
        secondary:
          "bg-[#FAF3EB] text-[#2A1E17] border border-[#E8DCCF]",
        terracotta:
          "bg-[#C85A1B] text-white",
        gold:
          "bg-[#8A6D3B] text-white",
        outline:
          "text-[#2A1E17] border border-[#2A1E17]",
        destructive:
          "bg-rose-600 text-white",
        success:
          "bg-emerald-700 text-white",
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
