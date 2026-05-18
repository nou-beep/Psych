"use client";

// Single-select chip row. Click an option to set; click again to
// clear. Useful as a segmented control for a small set of mutually
// exclusive options (frequency, intensity, etc.).

import type { CSSProperties, ReactNode } from "react";
import { Eraser } from "lucide-react";

export interface ChipOption<T extends string> {
  value: T;
  label: ReactNode;
  hint?: string;
}

interface ChipSelectProps<T extends string> {
  label?: string;
  hint?: string;
  options: ReadonlyArray<ChipOption<T>>;
  value: T | undefined;
  onChange: (next: T | undefined) => void;
  // Optional disabled state.
  disabled?: boolean;
  // Render variant: "soft" (default) or "outlined".
  variant?: "soft" | "outlined";
  style?: CSSProperties;
  className?: string;
}

export function ChipSelect<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
  disabled,
  variant = "soft",
  style,
  className,
}: ChipSelectProps<T>) {
  return (
    <div className={className} style={style}>
      {label && (
        <p
          className="text-[10px] uppercase tracking-wider mb-1"
          style={{ color: "var(--psych-muted)" }}
        >
          {label}
          {hint && (
            <span
              className="ml-1.5 normal-case tracking-normal italic"
              style={{ color: "var(--psych-muted)" }}
            >
              {hint}
            </span>
          )}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(active ? undefined : o.value)}
              title={o.hint}
              className="text-[11px] rounded-md transition-colors disabled:opacity-50"
              style={{
                backgroundColor: active
                  ? "var(--psych-primary-light)"
                  : variant === "soft"
                  ? "var(--psych-bg)"
                  : "transparent",
                color: active
                  ? "var(--psych-primary)"
                  : "var(--psych-text)",
                border: active
                  ? "1px solid var(--psych-primary)"
                  : "1px solid var(--psych-border)",
                padding: "4px 9px",
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {o.label}
            </button>
          );
        })}
        {value !== undefined && !disabled && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Effacer la sélection"
            title="Effacer"
            className="text-[10px] rounded-md p-1"
            style={{ color: "var(--psych-muted)" }}
          >
            <Eraser size={10} />
          </button>
        )}
      </div>
    </div>
  );
}
