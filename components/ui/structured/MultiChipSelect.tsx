"use client";

// Multi-select chip group. Click to toggle; "clear all" button when
// at least one chip is active.

import type { CSSProperties, ReactNode } from "react";
import { Eraser } from "lucide-react";

export interface MultiChipOption<T extends string> {
  value: T;
  label: ReactNode;
  hint?: string;
  // Optional grouping label — chips with the same group sit
  // together. The component does not visually segment them; the
  // group label is just metadata for callers that want to filter.
  group?: string;
}

interface MultiChipSelectProps<T extends string> {
  label?: string;
  hint?: string;
  options: ReadonlyArray<MultiChipOption<T>>;
  value: ReadonlyArray<T>;
  onChange: (next: T[]) => void;
  disabled?: boolean;
  // Optional max selection count — clicks beyond this no-op.
  max?: number;
  style?: CSSProperties;
  className?: string;
}

export function MultiChipSelect<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
  disabled,
  max,
  style,
  className,
}: MultiChipSelectProps<T>) {
  function toggle(v: T) {
    if (disabled) return;
    const next = value.includes(v)
      ? value.filter((x) => x !== v)
      : max && value.length >= max
      ? value.slice()
      : [...value, v];
    onChange(next);
  }

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
          {max && (
            <span
              className="ml-1.5 normal-case tracking-normal"
              style={{ color: "var(--psych-muted)" }}
            >
              · max {max}
            </span>
          )}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((o) => {
          const active = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              disabled={disabled}
              onClick={() => toggle(o.value)}
              title={o.hint}
              className="text-[11px] rounded-md transition-colors disabled:opacity-50"
              style={{
                backgroundColor: active
                  ? "var(--psych-primary-light)"
                  : "var(--psych-bg)",
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
        {value.length > 0 && !disabled && (
          <button
            type="button"
            onClick={() => onChange([])}
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
