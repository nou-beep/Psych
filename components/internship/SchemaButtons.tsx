"use client";
// SchemaButtonGroup — the universal one-button-per-schema-value
// control from the ScoreSet engine. Extracted from ScoreSetSection
// so other surfaces (Espace séance structured observations, future
// therapist workspaces) reuse the exact same renderer instead of
// duplicating it.

import { Eraser } from "lucide-react";
import type { ScoreSchemaValue } from "@/lib/internship/score-set";

export const TONE_BG: Record<string, string> = {
  calm: "#D1FAE5",
  neutral: "var(--psych-primary-light)",
  warm: "#FEF3C7",
  warning: "#FED7AA",
  alarm: "#FEE2E2",
};

export const TONE_FG: Record<string, string> = {
  calm: "#065F46",
  neutral: "var(--psych-primary)",
  warm: "#92400E",
  warning: "#9A3412",
  alarm: "#991B1B",
};

export function SchemaButtonGroup({
  values,
  current,
  onPick,
  onClear,
  clearLabel = "Effacer",
}: {
  values: ReadonlyArray<ScoreSchemaValue<string>>;
  current: string | undefined;
  onPick: (value: string) => void;
  onClear: () => void;
  clearLabel?: string;
}) {
  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      {values.map((v) => {
        const active = current === v.value;
        const tone = v.tone ?? "neutral";
        return (
          <button
            key={v.value}
            type="button"
            onClick={() => onPick(v.value)}
            title={v.longLabel ?? v.label}
            className="text-[11px] font-semibold rounded-md transition-all"
            style={{
              backgroundColor: active ? TONE_BG[tone] : "var(--psych-bg)",
              color: active ? TONE_FG[tone] : "var(--psych-muted)",
              border: active
                ? `1px solid ${TONE_FG[tone]}`
                : "1px solid var(--psych-border)",
              padding: "4px 8px",
              minWidth: 36,
            }}
          >
            {v.label}
          </button>
        );
      })}
      {current !== undefined && (
        <button
          type="button"
          onClick={onClear}
          title={clearLabel}
          aria-label={clearLabel}
          className="text-[10px] rounded-md p-1"
          style={{ color: "var(--psych-muted)" }}
        >
          <Eraser size={11} />
        </button>
      )}
    </div>
  );
}
