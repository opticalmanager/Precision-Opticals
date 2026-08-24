import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#2A1E17] text-white hover:bg-[#C85A1B] shadow-sm",
        primary:
          "bg-[#C85A1B] text-white hover:bg-[#a84a12] shadow-md",
        outline:
          "border border-[#2A1E17] bg-transparent text-[#2A1E17] hover:bg-[#2A1E17] hover:text-white",
        secondary:
          "bg-[#FAF3EB] text-[#2A1E17] border border-[#E8DCCF] hover:bg-stone-200",
        ghost:
          "text-[#2A1E17] hover:bg-[#FAF3EB] hover:text-[#C85A1B]",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
        link: "text-[#C85A1B] underline-offset-4 hover:underline lowercase tracking-normal",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 px-3.5 text-[11px]",
        lg: "h-12 px-7 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
