"use client";
// Rapport direction — the management-facing anonymised synthesis.
// ONLY aggregates: risk distribution, team climate, absence totals,
// departures, risk-improvement counts. No names, no clinical notes,
// no per-individual rows. Printable (print CSS strips app chrome
// via the global .no-print pattern).

import { useMemo, useState } from "react";
import { Copy, Printer, ShieldCheck } from "lucide-react";

import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/therapist/DemoBanner";
import { useCollaborateurs } from "@/contexts/CollaborateurContext";
import { useT } from "@/contexts/LocaleContext";
import {
  buildRapportDirection,
  rapportDirectionText,
} from "@/lib/therapist/collaborateurs";

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function RapportDirectionPage() {
  const t = useT();
  const store = useCollaborateurs();
  const [from, setFrom] = useState(daysAgoISO(90));
  const [to, setTo] = useState(daysAgoISO(0));
  const [copied, setCopied] = useState(false);

  const rapport = useMemo(
    () => buildRapportDirection(store.collaborateurs, { from, to }),
    [store.collaborateurs, from, to]
  );

  async function copy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(rapportDirectionText(rapport));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const inputStyle: React.CSSProperties = {
    padding: "0.4rem 0.6rem",
    borderRadius: 8,
    border: "1px solid var(--psych-border)",
    background: "var(--psych-bg)",
    color: "var(--psych-text)",
    fontSize: 12,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      <header className="no-print flex items-start gap-3 flex-wrap">
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 className="text-2xl font-bold" style={{ color: "var(--psych-text)" }}>
            {t("collab.rapport.title")}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--psych-muted)" }}>
            {t("collab.rapport.desc")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={copy}>
            <Copy size={13} />{" "}
            {copied ? t("collab.rapport.copied") : t("collab.rapport.copy")}
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer size={13} /> {t("collab.rapport.print")}
          </Button>
        </div>
      </header>

      {store.hasDemo && (
        <div className="no-print">
          <DemoBanner onClear={store.clearDemo} />
        </div>
      )}

      {/* Window picker */}
      <div className="no-print flex items-end gap-2 flex-wrap">
        <label className="text-[10px]" style={{ color: "var(--psych-muted)" }}>
          {t("collab.rapport.window")}
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={inputStyle}
            className="block mt-1"
          />
        </label>
        <span className="text-xs pb-2" style={{ color: "var(--psych-muted)" }}>
          →
        </span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={inputStyle}
        />
      </div>

      {store.collaborateurs.length === 0 ? (
        <SectionCard>
          <p className="text-sm text-center py-8" style={{ color: "var(--psych-muted)" }}>
            {t("collab.rapport.empty")}
          </p>
        </SectionCard>
      ) : (
        <SectionCard>
          <div
            data-rapport-direction
            className="flex items-start gap-2 mb-4 text-xs px-3 py-2 rounded-lg"
            style={{ background: "rgba(16,185,129,0.08)", color: "#065F46" }}
          >
            <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <p className="m-0">{t("collab.rapport.desc")}</p>
          </div>
          <pre
            className="text-sm whitespace-pre-wrap p-4 rounded-xl border"
            style={{
              borderColor: "var(--psych-border)",
              background: "var(--psych-bg)",
              color: "var(--psych-text)",
              fontFamily:
                "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
              lineHeight: 1.7,
            }}
          >
            {rapportDirectionText(rapport)}
          </pre>
        </SectionCard>
      )}
    </div>
  );
}
