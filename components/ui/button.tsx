// Button component — supports multiple variants and sizes.
// Uses the current theme's primary color for the default variant.
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", style, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    // Variants use inline styles for theme colors so they respond to theme changes
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: "var(--psych-primary)",
        color: "white",
      },
      secondary: {
        backgroundColor: "var(--psych-primary-light)",
        color: "var(--psych-accent)",
      },
      outline: {
        backgroundColor: "transparent",
        color: "var(--psych-primary)",
        border: "1.5px solid var(--psych-primary)",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "var(--psych-muted)",
      },
      destructive: {
        backgroundColor: "#FEE2E2",
        color: "#DC2626",
      },
    };

    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], className)}
        style={{ ...variantStyles[variant], ...style }}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
