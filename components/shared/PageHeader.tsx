// PageHeader — consistent page title, subtitle, and optional right-side action.
import { type ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  sparkle?: boolean; // show decorative sparkle beside title
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, sparkle = true, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--psych-text)" }}
          >
            {title}
          </h1>
          {sparkle && (
            <Sparkles
              size={14}
              className="animate-sparkle"
              style={{ color: "var(--psych-primary)" }}
            />
          )}
        </div>
        {subtitle && (
          <p
            className="text-sm mt-1"
            style={{ color: "var(--psych-muted)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
