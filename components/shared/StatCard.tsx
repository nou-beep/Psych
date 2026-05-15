// StatCard — dashboard metric card showing a number, label, and optional trend.
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accent?: string; // override the primary color for the icon bg
}

export function StatCard({ label, value, icon: Icon, trend, trendPositive, accent }: StatCardProps) {
  return (
    <div
      className="rounded-2xl border p-5 flex items-start gap-4 transition-all hover:shadow-md"
      style={{
        backgroundColor: "var(--psych-card)",
        borderColor: "var(--psych-border)",
        boxShadow: "var(--psych-shadow)",
      }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: accent ?? "var(--psych-primary-light)",
          color: accent ? "white" : "var(--psych-primary)",
        }}
      >
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-0.5"
          style={{ color: "var(--psych-muted)" }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-bold"
          style={{ color: "var(--psych-text)" }}
        >
          {value}
        </p>
        {trend && (
          <p
            className="text-xs mt-0.5"
            style={{ color: trendPositive ? "#15803D" : "#DC2626" }}
          >
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
