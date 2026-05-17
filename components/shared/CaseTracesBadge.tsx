"use client";
// CaseTracesBadge — subtle visual density indicator for a case row.
// Five dots that fill in based on accumulated work. The point is for
// a heavily worked case to *feel* heavier without shouting a number.

import {
  DENSITY_LABELS,
  caseTraces,
  type CaseTraceInputs,
} from "@/lib/workspace/human-traces";

export function CaseTracesBadge({
  inputs,
  showHint = true,
}: {
  inputs: CaseTraceInputs;
  showHint?: boolean;
}) {
  const traces = caseTraces(inputs);
  const filled =
    traces.density === "dense"
      ? 5
      : traces.density === "developed"
      ? 4
      : traces.density === "moderate"
      ? 3
      : traces.density === "light"
      ? 2
      : traces.density === "blank"
      ? 0
      : 1;

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px]"
      title={`${DENSITY_LABELS[traces.density]} · ${traces.hint}`}
      style={{ color: "var(--psych-muted)" }}
    >
      <span className="inline-flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor:
                i < filled
                  ? "var(--psych-primary)"
                  : "var(--psych-border)",
              opacity: i < filled ? 0.6 + (i / filled) * 0.4 : 0.6,
            }}
          />
        ))}
      </span>
      {showHint && (
        <span className="italic">{DENSITY_LABELS[traces.density]}</span>
      )}
    </span>
  );
}
