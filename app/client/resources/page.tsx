"use client";
// Client resources — therapist-guided psychoeducation viewer.

import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import {
  PSYCHOEDUCATION_TOPICS,
  type HandoutStyle,
} from "@/lib/clinical/psychoeducation";

const CLIENT_STYLES: Array<{ id: HandoutStyle; label: string }> = [
  { id: "clinician", label: "Standard" },
  { id: "adolescent", label: "Adolescent-friendly" },
  { id: "parent", label: "Parent guidance" },
];

export default function ClientResourcesPage() {
  const [activeId, setActiveId] = useState(
    PSYCHOEDUCATION_TOPICS[0]?.id ?? ""
  );
  const [style, setStyle] = useState<HandoutStyle>("clinician");
  const topic = useMemo(
    () => PSYCHOEDUCATION_TOPICS.find((t) => t.id === activeId),
    [activeId]
  );
  const variant = topic?.variants[style];

  return (
    <ClientShell
      title="Resources."
      microcopy="Psychoeducation to read between sessions. Your therapist may direct you to specific topics."
    >
      {/* Topic list */}
      <div
        className="cp-card-soft cp-fade-in"
        style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: 6 }}
      >
        {PSYCHOEDUCATION_TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            aria-pressed={activeId === t.id}
            style={{
              all: "unset",
              cursor: "pointer",
              padding: "0.4rem 0.85rem",
              borderRadius: 999,
              border: `1px solid ${
                activeId === t.id ? "var(--cp-accent)" : "var(--cp-border)"
              }`,
              background: activeId === t.id ? "var(--cp-glow)" : "transparent",
              color: "var(--cp-text)",
              fontSize: "0.82rem",
            }}
          >
            {t.title}
          </button>
        ))}
      </div>

      {topic && variant && (
        <article className="cp-card cp-fade-in">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 6,
            }}
          >
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 600,
                margin: 0,
                color: "var(--cp-text)",
              }}
            >
              {topic.title}
            </h2>
            <div className="print:hidden" style={{ display: "flex", gap: 6 }}>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as HandoutStyle)}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  padding: "0.4rem 0.7rem",
                  borderRadius: 10,
                  border: "1px solid var(--cp-border)",
                  background: "var(--cp-card-soft)",
                  color: "var(--cp-text)",
                  fontSize: "0.84rem",
                }}
              >
                {CLIENT_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => window.print()}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  padding: "0.4rem 0.7rem",
                  borderRadius: 10,
                  border: "1px solid var(--cp-border)",
                  color: "var(--cp-muted)",
                  fontSize: "0.84rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Printer size={12} /> Print
              </button>
            </div>
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--cp-text)", lineHeight: 1.6 }}>
            {variant.intro}
          </p>

          <Section label="What it is" body={variant.whatItIs} />
          <Section label="What it feels like" body={variant.whatItFeelsLike} />
          <Section label="What helps" body={variant.whatHelps} />
          <Section label="When to seek support" body={variant.whenToSeekSupport} />
        </article>
      )}
    </ClientShell>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div style={{ marginTop: 12 }}>
      <h3
        style={{
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--cp-muted)",
          margin: 0,
        }}
      >
        {label}
      </h3>
      <p
        style={{
          marginTop: 4,
          fontSize: "0.9rem",
          color: "var(--cp-text)",
          lineHeight: 1.6,
        }}
      >
        {body}
      </p>
    </div>
  );
}
