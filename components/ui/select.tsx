// Select — themed dropdown select.
import { cn } from "@/lib/utils";
import { type SelectHTMLAttributes, forwardRef } from "react";

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, style, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full px-3.5 py-2 rounded-xl text-sm border transition-colors appearance-none cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          className
        )}
        style={{
          backgroundColor: "var(--psych-bg)",
          borderColor: "var(--psych-border)",
          color: "var(--psych-text)",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: "36px",
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
export { Select };
