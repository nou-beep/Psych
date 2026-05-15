import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  action?: ReactNode;
  noPadding?: boolean;
}

export function SectionCard({
  title,
  description,
  children,
  className,
  headerAction,
  action,
  noPadding = false,
}: SectionCardProps) {
  const rightSlot = action ?? headerAction;
  return (
    <div
      className={cn("rounded-2xl border", className)}
      style={{
        backgroundColor: "var(--psych-card)",
        borderColor: "var(--psych-border)",
        boxShadow: "var(--psych-shadow)",
      }}
    >
      {(title || rightSlot) && (
        <div
          className="flex items-center justify-between gap-3 px-5 py-3.5 border-b"
          style={{ borderColor: "var(--psych-border)" }}
        >
          <div>
            {title && (
              <h3 className="text-sm font-semibold" style={{ color: "var(--psych-text)" }}>
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs mt-0.5" style={{ color: "var(--psych-muted)" }}>
                {description}
              </p>
            )}
          </div>
          {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
        </div>
      )}
      <div className={cn(!noPadding && "p-5")}>{children}</div>
    </div>
  );
}
