"use client";
// Threads — recurring tags across all nodes for a case. Therapist-side
// view with a kind-breakdown bar per thread.

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { usePsyGraph } from "@/contexts/PsyGraphContext";
import {
  COMMON_THREADS,
  analyzeThreads,
  recurringThreads,
} from "@/lib/psy/threads";
import { KIND_LABELS } from "@/lib/psy/nodes";

const KIND_COLOURS: Record<string, string> = {
  thought: "#6B7AA0",
  emotion: "#C77DAA",
  "body-sensation": "#9882C0",
  situation: "#7E7A6E",
  memory: "#8B4A66",
  person: "#3D5C3D",
  behavior: "#B07A4F",
  defense: "#9B4D3A",
  distortion: "#A4756A",
  role: "#8A6E5D",
  thread: "#9F1239",
  conflict: "#8B4A66",
  session: "#94A3B8",
  "intervention-ref": "#10B981",
  "assessment-ref": "#EC4899",
};

export default function ThreadsPage() {
  const { cases } = useApp();
  const { nodes } = usePsyGraph();
  const active = cases.filter((c) => !c.isArchived);
  const [caseId, setCaseId] = useState(active[0]?.id ?? "");

  const caseNodes = useMemo(
    () => nodes.filter((n) => n.caseId === caseId),
    [nodes, caseId]
  );

  const allThreads = useMemo(() => analyzeThreads(caseNodes), [caseNodes]);
  const recurring = useMemo(() => recurringThreads(caseNodes), [caseNodes]);
  const incidental = useMemo(
    () => allThreads.filter((t) => !t.recurring),
    [allThreads]
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in" data-section="thesis">
      <PageHeader
        title="Threads"
        subtitle="Recurring psychological themes — derived from tags on every node across the case."
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
          {caseNodes.length} nodes scanned · {recurring.length} recurring threads
        </div>
      </div>

      <SectionCard
        title={`Recurring (${recurring.length})`}
        description="Threads that show up across multiple node kinds or with multiple occurrences."
      >
        {recurring.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            No recurring threads yet. Tag a few nodes (e.g. &ldquo;shame&rdquo;, &ldquo;abandonment&rdquo;)
            on the thought web or body map to make patterns emerge.
          </p>
        ) : (
          <ul className="space-y-3">
            {recurring.map((t) => {
              const totalBarUnits = Object.values(t.kindBreakdown).reduce(
                (a, b) => a + b,
                0
              );
              const lastSeenDate = t.lastSeen
                ? t.lastSeen.split("T")[0]
                : "—";
              return (
                <li
                  key={t.tag}
                  className="rounded-xl border p-3 alive-hover"
                  style={{ borderColor: "var(--psych-border)" }}
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="annot-tag"
                      style={{
                        ["--section-tint" as never]: "rgba(159,18,57,0.10)",
                        ["--section-accent" as never]: "#9F1239",
                      }}
                    >
                      {t.tag}
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--psych-text)" }}
                    >
                      {t.count} occurrence{t.count > 1 ? "s" : ""}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--psych-muted)" }}
                    >
                      · last seen {lastSeenDate}
                    </span>
                    {COMMON_THREADS.includes(t.tag as never) && (
                      <span
                        className="text-[10px] px-1.5 py-0 rounded-full ml-auto"
                        style={{
                          background: "var(--psych-primary-light)",
                          color: "var(--psych-accent)",
                        }}
                      >
                        common thread
                      </span>
                    )}
                  </div>
                  {/* Kind breakdown bar */}
                  <div
                    className="flex h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--psych-border)" }}
                  >
                    {Object.entries(t.kindBreakdown).map(([kind, count]) => (
                      <span
                        key={kind}
                        title={`${KIND_LABELS[kind as never] ?? kind}: ${count}`}
                        style={{
                          width: `${(count / totalBarUnits) * 100}%`,
                          background: KIND_COLOURS[kind] ?? "#94A3B8",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(t.kindBreakdown).map(([kind, count]) => (
                      <span
                        key={kind}
                        className="text-[10px]"
                        style={{ color: "var(--psych-muted)" }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: KIND_COLOURS[kind] ?? "#94A3B8",
                            marginRight: 3,
                            verticalAlign: "middle",
                          }}
                        />
                        {KIND_LABELS[kind as never] ?? kind} · {count}
                      </span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {incidental.length > 0 && (
        <SectionCard
          title={`Incidental tags (${incidental.length})`}
          description="Tags below the recurrence threshold — keep an eye on them"
          className="mt-4"
        >
          <div className="flex flex-wrap gap-1">
            {incidental.map((t) => (
              <span
                key={t.tag}
                className="text-[11px] px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: "var(--psych-border)",
                  color: "var(--psych-muted)",
                }}
              >
                {t.tag} · {t.count}
              </span>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
