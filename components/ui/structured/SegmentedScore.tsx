"use client";

// Segmented control — like ChipSelect but rendered as a single bar
// of adjacent buttons. Designed for ordered scales (low / moderate
// / high) where the order conveys meaning.

import type { CSSProperties, ReactNode } from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  // Optional tone — colours the active state. Useful for severity
  // scales where "high" should look warmer than "low".
  tone?: "neutral" | "warm" | "warning" | "alarm" | "calm";
}

const TONE_BG: Record<
  NonNullable<SegmentedOption<string>["tone"]>,
  string
> = {
  neutral: "var(--psych-primary-light)",
  warm: "#FEF3C7",
  warning: "#FED7AA",
  alarm: "#FEE2E2",
  calm: "#D1FAE5",
};
const TONE_FG: Record<
  NonNullable<SegmentedOption<string>["tone"]>,
  string
> = {
  neutral: "var(--psych-primary)",
  warm: "#92400E",
  warning: "#9A3412",
  alarm: "#991B1B",
  calm: "#065F46",
};

interface SegmentedScoreProps<T extends string> {
  label?: string;
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T | undefined;
  onChange: (next: T | undefined) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  // Allow clearing the value by clicking the active button again.
  clearable?: boolean;
}

export function SegmentedScore<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
  className,
  style,
  clearable = true,
}: SegmentedScoreProps<T>) {
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
      <div
        className="inline-flex rounded-md overflow-hidden"
        style={{
          border: "1px solid var(--psych-border)",
          backgroundColor: "var(--psych-bg)",
        }}
        role="radiogroup"
      >
        {options.map((o, i) => {
          const active = value === o.value;
          const tone = o.tone ?? "neutral";
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(active && clearable ? undefined : o.value)}
              className="text-[11px] transition-colors disabled:opacity-50"
              style={{
                backgroundColor: active ? TONE_BG[tone] : "transparent",
                color: active ? TONE_FG[tone] : "var(--psych-text)",
                borderRight:
                  i < options.length - 1
                    ? "1px solid var(--psych-border)"
                    : "none",
                padding: "5px 12px",
                cursor: disabled ? "not-allowed" : "pointer",
                fontWeight: active ? 600 : 400,
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
