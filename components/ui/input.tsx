import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full bg-[#FAF7F2] border border-[#D5C2B1] px-3 py-2 text-xs font-sans text-[#2A1E17] placeholder:text-stone-400 focus-visible:outline-none focus-visible:border-[#C85A1B] focus-visible:ring-1 focus-visible:ring-[#C85A1B] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
