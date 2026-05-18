"use client";

// Numeric rating scale with N segments (default 1-5). The active
// segment + everything before it fills in, so it reads as both a
// rating and a level meter.

import type { CSSProperties } from "react";

interface RatingScaleProps {
  label?: string;
  min?: number;
  max?: number;
  value: number | undefined;
  onChange: (next: number | undefined) => void;
  disabled?: boolean;
  // Optional anchor labels rendered at the extremes ("Faible" / "Élevée").
  minLabel?: string;
  maxLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export function RatingScale({
  label,
  min = 1,
  max = 5,
  value,
  onChange,
  disabled,
  minLabel,
  maxLabel,
  className,
  style,
}: RatingScaleProps) {
  const ticks: number[] = [];
  for (let i = min; i <= max; i++) ticks.push(i);

  return (
    <div className={className} style={style}>
      {label && (
        <p
          className="text-[10px] uppercase tracking-wider mb-1"
          style={{ color: "var(--psych-muted)" }}
        >
          {label}
        </p>
      )}
      <div className="inline-flex items-center gap-2">
        {minLabel && (
          <span
            className="text-[10px]"
            style={{ color: "var(--psych-muted)" }}
          >
            {minLabel}
          </span>
        )}
        <div
          className="inline-flex rounded-md overflow-hidden"
          style={{
            border: "1px solid var(--psych-border)",
            backgroundColor: "var(--psych-bg)",
          }}
          role="radiogroup"
          aria-label={label}
        >
          {ticks.map((t, i) => {
            const active = value !== undefined && t <= value;
            const isCurrent = value === t;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={isCurrent}
                disabled={disabled}
                onClick={() => onChange(isCurrent ? undefined : t)}
                className="text-[11px] transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: active
                    ? "var(--psych-primary)"
                    : "transparent",
                  color: active ? "white" : "var(--psych-text)",
                  borderRight:
                    i < ticks.length - 1
                      ? "1px solid var(--psych-border)"
                      : "none",
                  padding: "5px 11px",
                  minWidth: 32,
                  fontWeight: isCurrent ? 700 : 400,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
        {maxLabel && (
          <span
            className="text-[10px]"
            style={{ color: "var(--psych-muted)" }}
          >
            {maxLabel}
          </span>
        )}
      </div>
    </div>
  );
}
