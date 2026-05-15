// Badge — small label used for case types, statuses, and tags.
import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "error" | "info";
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "var(--psych-primary-light)",
    color: "var(--psych-accent)",
  },
  secondary: {
    backgroundColor: "var(--psych-border)",
    color: "var(--psych-text)",
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--psych-primary)",
    border: "1px solid var(--psych-primary)",
  },
  success: { backgroundColor: "#DCFCE7", color: "#15803D" },
  warning: { backgroundColor: "#FEF9C3", color: "#A16207" },
  error: { backgroundColor: "#FEE2E2", color: "#DC2626" },
  info: { backgroundColor: "#DBEAFE", color: "#1D4ED8" },
};

// Automatic variant based on status/type text
export function getStatusVariant(status: string): BadgeProps["variant"] {
  const s = status.toLowerCase();
  if (s === "active") return "success";
  if (s === "paused") return "warning";
  if (s === "archived") return "secondary";
  if (s === "needs review") return "error";
  return "default";
}

function Badge({ className, variant = "default", style, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        className
      )}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  );
}

export { Badge };
