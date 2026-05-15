// Textarea — themed multiline input.
import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes, forwardRef } from "react";

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, style, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full px-3.5 py-2 rounded-xl text-sm border transition-colors resize-y min-h-[80px]",
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

Textarea.displayName = "Textarea";
export { Textarea };
