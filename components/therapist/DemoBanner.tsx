"use client";
// "Données de démonstration" banner — shown wherever sample data is
// present, with the one-tap clear action. Demo data must be
// unmistakably separate from real records.

import { FlaskConical, Trash2 } from "lucide-react";
import { useT } from "@/contexts/LocaleContext";

export function DemoBanner({ onClear }: { onClear: () => void }) {
  const t = useT();
  return (
    <div
      data-demo-banner
      className="flex items-center gap-3 px-3 py-2 rounded-xl border text-xs"
      style={{
        borderColor: "rgba(245,158,11,0.35)",
        background: "rgba(245,158,11,0.08)",
        color: "#92400E",
      }}
    >
      <FlaskConical size={13} style={{ flexShrink: 0 }} />
      <span className="flex-1 font-medium">{t("collab.demoBadge")}</span>
      <button
        onClick={onClear}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border font-medium"
        style={{ borderColor: "rgba(245,158,11,0.4)", color: "#92400E" }}
      >
        <Trash2 size={11} /> {t("collab.clearDemo")}
      </button>
    </div>
  );
}
