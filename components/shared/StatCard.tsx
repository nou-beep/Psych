import { type ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  subtext?: string;
  trend?: string;
  trendPositive?: boolean;
  delay?: number;
}

export function StatCard({
  label,
  value,
  icon,
  color,
  subtext,
  trend,
  trendPositive,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="rounded-2xl border p-4 flex flex-col gap-2 card-hover animate-fade-up"
      style={{
        backgroundColor: "var(--psych-card)",
        borderColor: "var(--psych-border)",
        boxShadow: "var(--psych-shadow)",
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{
          backgroundColor: color ? color + "18" : "var(--psych-primary-light)",
          color: color ?? "var(--psych-primary)",
        }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: "var(--psych-text)" }}>
          {value}
        </p>
        <p className="text-xs font-medium leading-snug" style={{ color: "var(--psych-muted)" }}>
          {label}
        </p>
        {(subtext || trend) && (
          <p
            className="text-[10px] mt-0.5"
            style={{ color: trend ? (trendPositive ? "#15803D" : "#DC2626") : "var(--psych-muted)" }}
          >
            {trend || subtext}
          </p>
        )}
      </div>
    </div>
  );
}
