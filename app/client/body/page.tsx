"use client";
// Client body map — tap regions, mark sensations, save entries.
// Entries become body-sensation PsyNodes owned by the client.

import { useMemo, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { ClientShell } from "@/components/client/ClientShell";
import { BodyMap } from "@/components/psy/BodyMap";
import {
  COMMON_SENSATIONS,
  findRegion,
  type BodyRegionId,
} from "@/lib/psy/body-regions";
import { usePsyGraph } from "@/contexts/PsyGraphContext";
import { useApp } from "@/contexts/AppContext";

export default function ClientBodyMapPage() {
  const { cases } = useApp();
  const { nodes, addNode, deleteNode } = usePsyGraph();

  // For the demo: the client portal isn't tied to a real case yet, so
  // we use the first non-archived case as a stand-in. In production
  // this would come from the auth session.
  const activeCase = cases.find((c) => !c.isArchived) ?? cases[0];
  const caseId = activeCase?.id ?? "client-self";

  const [region, setRegion] = useState<BodyRegionId | null>(null);
  const [sensation, setSensation] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState("");

  // Heatmap data: aggregate intensity across the client's saved entries.
  const heat = useMemo(() => {
    const acc: Partial<Record<BodyRegionId, number>> = {};
    const counts: Partial<Record<BodyRegionId, number>> = {};
    const mine = nodes.filter(
      (n) =>
        n.kind === "body-sensation" &&
        n.meta?.authoredBy === "client" &&
        n.caseId === caseId
    );
    for (const n of mine) {
      const r = n.meta?.bodyRegion as BodyRegionId | undefined;
      if (!r) continue;
      const i = typeof n.intensity === "number" ? n.intensity / 10 : 0.3;
      acc[r] = Math.min(1, (acc[r] ?? 0) + i * 0.35);
      counts[r] = (counts[r] ?? 0) + 1;
    }
    return { acc, counts };
  }, [nodes, caseId]);

  const recentEntries = useMemo(
    () =>
      nodes
        .filter(
          (n) =>
            n.kind === "body-sensation" &&
            n.meta?.authoredBy === "client" &&
            n.caseId === caseId
        )
        .slice()
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 8),
    [nodes, caseId]
  );

  function save() {
    if (!region || !sensation.trim()) return;
    addNode(caseId, "body-sensation", {
      label: sensation.trim(),
      notes,
      intensity,
      tags: [],
      meta: {
        bodyRegion: region,
        authoredBy: "client",
        sharedWithTherapist: true,
      },
    });
    setSensation("");
    setNotes("");
    setIntensity(5);
  }

  const regionMeta = region ? findRegion(region) : null;
  const suggestions = regionMeta?.commonSensations ?? [];

  return (
    <ClientShell
      title="Body map."
      microcopy="Where do you notice things today? Tap a region, name the sensation, save it."
    >
      <div className="cp-card cp-fade-in" style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 220px) 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div>
            <BodyMap
              selectedRegion={region}
              heat={heat.acc}
              counts={heat.counts}
              onSelect={(r) => setRegion(r)}
              accent="var(--cp-accent)"
            />
          </div>
          <div>
            {!region ? (
              <p
                className="cp-microcopy"
                style={{ fontSize: "0.88rem", lineHeight: 1.6 }}
              >
                Tap any part of the body to start. There are no wrong
                answers — even a vague sensation counts.
              </p>
            ) : (
              <>
                <div
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--cp-muted)" }}
                >
                  Region
                </div>
                <div
                  className="text-sm font-semibold mb-3"
                  style={{ color: "var(--cp-text)" }}
                >
                  {regionMeta?.label}
                </div>

                <div
                  className="text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: "var(--cp-muted)" }}
                >
                  Common sensations here
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                  {[...new Set([...suggestions, ...COMMON_SENSATIONS])].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSensation(s)}
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        border: `1px solid ${
                          sensation === s ? "var(--cp-accent)" : "var(--cp-border)"
                        }`,
                        background:
                          sensation === s ? "var(--cp-glow)" : "transparent",
                        color: "var(--cp-text)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <label
                  className="block text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: "var(--cp-muted)" }}
                >
                  Custom sensation
                </label>
                <input
                  value={sensation}
                  onChange={(e) => setSensation(e.target.value)}
                  placeholder="describe it in your own words"
                  className="w-full mb-2"
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid var(--cp-border)",
                    background: "var(--cp-card-soft)",
                    color: "var(--cp-text)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />

                <div style={{ marginBottom: 10 }}>
                  <label
                    className="block text-[10px] uppercase tracking-wider mb-1"
                    style={{ color: "var(--cp-muted)" }}
                  >
                    Intensity ({intensity}/10)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--cp-accent)" }}
                  />
                </div>

                <label
                  className="block text-[10px] uppercase tracking-wider mb-1"
                  style={{ color: "var(--cp-muted)" }}
                >
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What was happening when you noticed this?"
                  rows={3}
                  className="w-full mb-2"
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid var(--cp-border)",
                    background: "var(--cp-card-soft)",
                    color: "var(--cp-text)",
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />

                <button
                  onClick={save}
                  disabled={!sensation.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full"
                  style={{
                    background: "var(--cp-accent)",
                    color: "white",
                    fontSize: 13,
                    opacity: sensation.trim() ? 1 : 0.5,
                    cursor: sensation.trim() ? "pointer" : "not-allowed",
                    border: "none",
                  }}
                >
                  <Save size={12} /> Save entry
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {recentEntries.length > 0 && (
        <div className="cp-card cp-fade-in">
          <div
            className="text-[10px] uppercase tracking-wider mb-2"
            style={{ color: "var(--cp-muted)" }}
          >
            Recent body entries
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
            {recentEntries.map((n) => {
              const region = findRegion(n.meta?.bodyRegion ?? "");
              return (
                <li
                  key={n.id}
                  className="cp-card-soft"
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm" style={{ color: "var(--cp-text)" }}>
                      <strong>{region?.label}</strong>
                      {" · "}
                      <span>{n.label}</span>
                    </div>
                    <div
                      className="text-[11px]"
                      style={{ color: "var(--cp-muted)" }}
                    >
                      {n.date} · intensity {n.intensity ?? "—"}/10
                      {n.notes && ` · ${n.notes.slice(0, 60)}${n.notes.length > 60 ? "…" : ""}`}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNode(n.id)}
                    aria-label="Delete entry"
                    className="opacity-60 hover:opacity-100"
                    style={{ color: "var(--cp-muted)", padding: 4 }}
                  >
                    <Trash2 size={12} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </ClientShell>
  );
}
