// EmptyState — shown when a list has no items. Has a sparkle icon, title, and optional action.
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  icon?: string; // emoji or symbol
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = "✦",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {/* Decorative icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-sm"
        style={{ backgroundColor: "var(--psych-primary-light)" }}
      >
        <span>{icon}</span>
      </div>

      {/* Sparkle decorations */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={10} style={{ color: "var(--psych-muted)" }} className="opacity-50" />
        <h3
          className="text-base font-semibold"
          style={{ color: "var(--psych-text)" }}
        >
          {title}
        </h3>
        <Sparkles size={10} style={{ color: "var(--psych-muted)" }} className="opacity-50" />
      </div>

      <p
        className="text-sm max-w-xs leading-relaxed mb-6"
        style={{ color: "var(--psych-muted)" }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
