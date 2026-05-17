"use client";
// Somatic Experience System — the unified bodily-experience surface.
//
// Aggregates body sensations, sensory load, dissociation, numbness,
// tension, fatigue. Each entry is a body-sensation node with a
// somatic-kind tag (sensation:* / sensory:* / dissociation:* …) so
// the same node store powers heatmaps and recurring-threads analysis.

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { usePsyGraph } from "@/contexts/PsyGraphContext";
import { BodyMap } from "@/components/psy/BodyMap";
import {
  BODY_REGIONS,
  findRegion,
  type BodyRegionId,
} from "@/lib/psy/body-regions";

// Somatic kinds. Each maps to a tag prefix so existing
// threads / search / coding still pick the entry up.
type SomaticKind =
  | "sensation"
  | "sensory"
  | "dissociation"
  | "numbness"
  | "tension"
  | "fatigue";

const SOMATIC_KIND_LABELS: Record<SomaticKind, string> = {
  sensation: "Sensation",
  sensory: "Sensory load",
  dissociation: "Dissociation",
  numbness: "Numbness",
  tension: "Tension",
  fatigue: "Fatigue",
};

const SOMATIC_KIND_COLORS: Record<SomaticKind, string> = {
  sensation: "#9882C0",
  sensory: "#3B82F6",
  dissociation: "#8B4A66",
  numbness: "#94A3B8",
  tension: "#9F1239",
  fatigue: "#B07A4F",
};

export default function ClinicalBodyMapPage() {
  const { cases } = useApp();
  const { nodes, addNode, deleteNode, updateNode } = usePsyGraph();

  const active = cases.filter((c) => !c.isArchived);
  const [caseId, setCaseId] = useState<string>(active[0]?.id ?? "");
  const [region, setRegion] = useState<BodyRegionId | null>(null);
  const [annotation, setAnnotation] = useState("");
  const [somaticKind, setSomaticKind] = useState<SomaticKind>("sensation");

  const caseSensations = useMemo(
    () =>
      nodes.filter((n) => n.kind === "body-sensation" && n.caseId === caseId),
    [nodes, caseId]
  );

  const heat = useMemo(() => {
    const acc: Partial<Record<BodyRegionId, number>> = {};
    const counts: Partial<Record<BodyRegionId, number>> = {};
    for (const n of caseSensations) {
      const r = n.meta?.bodyRegion as BodyRegionId | undefined;
      if (!r) continue;
      const i = typeof n.intensity === "number" ? n.intensity / 10 : 0.3;
      acc[r] = Math.min(1, (acc[r] ?? 0) + i * 0.35);
      counts[r] = (counts[r] ?? 0) + 1;
    }
    return { acc, counts };
  }, [caseSensations]);

  const regionEntries = useMemo(() => {
    if (!region) return [];
    return caseSensations
      .filter((n) => n.meta?.bodyRegion === region)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [caseSensations, region]);

  function addAnnotation() {
    if (!caseId || !region || !annotation.trim()) return;
    addNode(caseId, "body-sensation", {
      label: annotation.trim(),
      tags: ["clinician-observation", `somatic:${somaticKind}`],
      meta: {
        bodyRegion: region,
        authoredBy: "therapist",
        sharedWithTherapist: true,
        sharedWithClient: false,
      },
    });
    setAnnotation("");
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in" data-section="client">
      <PageHeader
        title="Somatic experience"
        subtitle="Body map + sensory load + dissociation + numbness + tension + fatigue. All bodily experience in one heatmap."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div className="md:col-span-2">
          <Label className="text-xs">Case</Label>
          <Select value={caseId} onChange={(e) => setCaseId(e.target.value)}>
            <option value="">Choose a case…</option>
            {active.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.type}
              </option>
            ))}
          </Select>
        </div>
        <div
          className="text-xs flex items-end"
          style={{ color: "var(--psych-muted)" }}
        >
          {caseSensations.length} body entries on this case
        </div>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "minmax(0, 260px) 1fr" }}
      >
        <SectionCard title="Heatmap" description="Click a region to drill in">
          <BodyMap
            selectedRegion={region}
            heat={heat.acc}
            counts={heat.counts}
            onSelect={(r) => setRegion(r)}
          />
        </SectionCard>

        <div className="space-y-3">
          <SectionCard
            title={
              region ? `${findRegion(region)?.label} entries` : "Pick a region"
            }
            description={
              region
                ? `${regionEntries.length} entr${regionEntries.length === 1 ? "y" : "ies"} recorded for this region`
                : "Click anywhere on the silhouette to view body entries from that area."
            }
          >
            {region && regionEntries.length > 0 ? (
              <ul className="space-y-2">
                {regionEntries.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-xl border p-3 alive-hover"
                    style={{ borderColor: "var(--psych-border)" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="annot-tag"
                        style={{
                          ["--section-tint" as never]:
                            n.meta?.authoredBy === "client"
                              ? "rgba(152,130,192,0.10)"
                              : "rgba(180,90,140,0.10)",
                          ["--section-accent" as never]:
                            n.meta?.authoredBy === "client"
                              ? "#9882C0"
                              : "#9F1239",
                        }}
                      >
                        {n.meta?.authoredBy === "client"
                          ? "client"
                          : "clinician"}
                      </span>
                      {(() => {
                        const kindTag = n.tags.find((t) => t.startsWith("somatic:"));
                        if (!kindTag) return null;
                        const k = kindTag.slice("somatic:".length) as SomaticKind;
                        const label = SOMATIC_KIND_LABELS[k];
                        const color = SOMATIC_KIND_COLORS[k];
                        if (!label) return null;
                        return (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full border"
                            style={{
                              borderColor: color,
                              color,
                              backgroundColor: color + "12",
                            }}
                          >
                            {label}
                          </span>
                        );
                      })()}
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {n.date}
                      </span>
                      {typeof n.intensity === "number" && (
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          intensity {n.intensity}/10
                        </span>
                      )}
                      <button
                        onClick={() => deleteNode(n.id)}
                        className="ml-auto opacity-60 hover:opacity-100"
                        style={{ color: "var(--psych-muted)" }}
                        aria-label="Delete entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--psych-text)" }}
                    >
                      <strong>{n.label}</strong>
                      {n.notes && (
                        <span
                          className="block mt-1 text-xs"
                          style={{ color: "var(--psych-muted)" }}
                        >
                          {n.notes}
                        </span>
                      )}
                    </div>
                    {/* Quick tag input — appends a clinical tag (defense /
                        distortion / context) to the node so it shows up
                        in threads + connects to other surfaces. */}
                    <div className="mt-2">
                      <Textarea
                        value={n.tags.join(", ")}
                        onChange={(e) =>
                          updateNode(n.id, {
                            tags: e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="comma-separated tags (e.g. shame, trauma trigger)"
                        className="text-xs min-h-[40px]"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : region ? (
              <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
                No entries for this region yet.
              </p>
            ) : (
              <ul className="text-sm space-y-1">
                {BODY_REGIONS.filter((r) => (heat.counts[r.id] ?? 0) > 0).map(
                  (r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between"
                    >
                      <button
                        onClick={() => setRegion(r.id)}
                        className="text-xs"
                        style={{ color: "var(--psych-primary)" }}
                      >
                        {r.label}
                      </button>
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        {heat.counts[r.id]} entr
                        {heat.counts[r.id] === 1 ? "y" : "ies"}
                      </span>
                    </li>
                  )
                )}
              </ul>
            )}
          </SectionCard>

          {region && (
            <SectionCard
              title="Add clinician annotation"
              description="Pick the somatic kind, then describe the experience. Tagged for cross-surface use."
            >
              <div className="flex items-center gap-1 mb-2 flex-wrap">
                {(Object.keys(SOMATIC_KIND_LABELS) as SomaticKind[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSomaticKind(k)}
                    className="text-[10px] px-2 py-0.5 rounded-full border transition-colors"
                    style={{
                      backgroundColor:
                        somaticKind === k
                          ? SOMATIC_KIND_COLORS[k] + "20"
                          : "transparent",
                      borderColor:
                        somaticKind === k
                          ? SOMATIC_KIND_COLORS[k]
                          : "var(--psych-border)",
                      color:
                        somaticKind === k
                          ? SOMATIC_KIND_COLORS[k]
                          : "var(--psych-muted)",
                    }}
                  >
                    {SOMATIC_KIND_LABELS[k]}
                  </button>
                ))}
              </div>
              <Textarea
                value={annotation}
                onChange={(e) => setAnnotation(e.target.value)}
                placeholder={
                  somaticKind === "dissociation"
                    ? "e.g. floating sensation, lost sense of time during the third session"
                    : somaticKind === "sensory"
                    ? "e.g. overwhelmed by lighting / sounds when stressed"
                    : somaticKind === "numbness"
                    ? "e.g. left side felt blank during EMDR"
                    : somaticKind === "tension"
                    ? "e.g. clenched jaw whenever boundaries came up"
                    : somaticKind === "fatigue"
                    ? "e.g. crushing tiredness after Sunday sessions"
                    : "e.g. consistent throat constriction during attachment-related sessions"
                }
                className="min-h-[80px]"
              />
              <Button
                size="sm"
                className="mt-2"
                onClick={addAnnotation}
                disabled={!annotation.trim()}
              >
                <Plus size={12} /> Save annotation
              </Button>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
