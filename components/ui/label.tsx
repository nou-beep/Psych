// Label — form field label.
import { cn } from "@/lib/utils";
import { type LabelHTMLAttributes } from "react";

function Label({ className, style, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-xs font-semibold mb-1.5 uppercase tracking-wide", className)}
      style={{ color: "var(--psych-muted)", ...style }}
      {...props}
    />
  );
}

export { Label };
