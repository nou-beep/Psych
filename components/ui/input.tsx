// Input — themed text input.
import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, style, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-3.5 py-2 rounded-xl text-sm border transition-colors",
          "placeholder:text-[var(--psych-muted)]",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          className
        )}
        style={{
          backgroundColor: "var(--psych-bg)",
          borderColor: "var(--psych-border)",
          color: "var(--psych-text)",
          ...style,
        }}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export { Input };
