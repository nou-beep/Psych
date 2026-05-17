"use client";
// Longitudinal Tracking — per-case symptom evolution with overlays.

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { useClinical } from "@/contexts/ClinicalContext";
import { loadFromStorage } from "@/lib/store";
import {
  ASSESSMENT_ADMINISTRATIONS_STORAGE_KEY,
  ASSESSMENT_LIBRARY,
  caseAdministrations,
  findAssessment,
  type AssessmentAdministration,
} from "@/lib/clinical/assessments";
import {
  buildOverlayMarkers,
  comparePeriods,
  subscaleSeries,
  totalScoreSeries,
  type NamedSeries,
} from "@/lib/clinical/longitudinal";
import dynamic from "next/dynamic";

const LongitudinalChart = dynamic(
  () => import("@/components/clinical/LongitudinalChart"),
  { ssr: false }
);

export default function LongitudinalPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto py-12 text-sm" style={{ color: "var(--psych-muted)" }}>
          Loading…
        </div>
      }
    >
      <LongitudinalInner />
    </Suspense>
  );
}

function LongitudinalInner() {
  const search = useSearchParams();
  const initialCaseId = search?.get("caseId") ?? "";

  const { cases, sessions } = useApp();
  const { interventions } = useClinical();
  const [admins, setAdmins] = useState<AssessmentAdministration[]>([]);
  const [caseId, setCaseId] = useState(initialCaseId);
  const [assessmentId, setAssessmentId] = useState("phq9");
  const [beforeStart, setBeforeStart] = useState("");
  const [beforeEnd, setBeforeEnd] = useState("");
  const [afterStart, setAfterStart] = useState("");
  const [afterEnd, setAfterEnd] = useState("");

  useEffect(() => {
    setAdmins(
      loadFromStorage<AssessmentAdministration[]>(
        ASSESSMENT_ADMINISTRATIONS_STORAGE_KEY,
        []
      )
    );
  }, []);

  const def = findAssessment(assessmentId);

  const caseAdmins = useMemo(
    () => (caseId ? caseAdministrations(admins, caseId, assessmentId) : []),
    [admins, caseId, assessmentId]
  );

  const series: NamedSeries[] = useMemo(() => {
    if (!def || !caseId) return [];
    const total = totalScoreSeries(caseAdmins, def);
    const subs = subscaleSeries(caseAdmins, def);
    return def.subscales ? subs : [total];
  }, [def, caseId, caseAdmins]);

  const overlays = useMemo(() => {
    if (!caseId) return [];
    return buildOverlayMarkers({
      interventions: interventions
        .filter((i) => i.caseId === caseId)
        .map((i) => ({ id: i.id, date: i.date, name: i.name })),
      sessions: sessions
        .filter((s) => s.caseId === caseId)
        .map((s) => ({ id: s.id, date: s.date })),
      assessmentAdministrations: caseAdmins,
    });
  }, [caseId, interventions, sessions, caseAdmins]);

  // Comparison between two periods (uses total-score series).
  const comparison = useMemo(() => {
    if (!def || series.length === 0) return null;
    if (!beforeStart || !beforeEnd || !afterStart || !afterEnd) return null;
    // Compare highest-priority series (subscales for multi-subscale, total otherwise).
    return comparePeriods(
      series[0],
      { start: beforeStart, end: beforeEnd },
      { start: afterStart, end: afterEnd },
      { higherIsWorse: true }
    );
  }, [def, series, beforeStart, beforeEnd, afterStart, afterEnd]);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Longitudinal tracking"
        subtitle="Symptom evolution with intervention and session overlays"
      />

      <SectionCard title="Pick the trajectory">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Case</Label>
            <Select value={caseId} onChange={(e) => setCaseId(e.target.value)}>
              <option value="">Choose…</option>
              {cases
                .filter((c) => !c.isArchived)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.type}
                  </option>
                ))}
            </Select>
          </div>
          <div>
            <Label>Instrument</Label>
            <Select
              value={assessmentId}
              onChange={(e) => setAssessmentId(e.target.value)}
            >
              {ASSESSMENT_LIBRARY.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.title}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Score progression"
        description={def ? `${def.code} — ${def.title}` : ""}
        className="mt-4"
      >
        {!caseId ? (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            Pick a case to see its trajectory.
          </p>
        ) : caseAdmins.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            No administrations recorded for this case + instrument yet.
          </p>
        ) : (
          <LongitudinalChart series={series} overlays={overlays} />
        )}
      </SectionCard>

      <SectionCard title="Period comparison" className="mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <Label>Before — start</Label>
            <Input
              type="date"
              value={beforeStart}
              onChange={(e) => setBeforeStart(e.target.value)}
            />
          </div>
          <div>
            <Label>Before — end</Label>
            <Input
              type="date"
              value={beforeEnd}
              onChange={(e) => setBeforeEnd(e.target.value)}
            />
          </div>
          <div>
            <Label>After — start</Label>
            <Input
              type="date"
              value={afterStart}
              onChange={(e) => setAfterStart(e.target.value)}
            />
          </div>
          <div>
            <Label>After — end</Label>
            <Input
              type="date"
              value={afterEnd}
              onChange={(e) => setAfterEnd(e.target.value)}
            />
          </div>
        </div>
        {comparison ? (
          <div
            className="rounded-lg border p-3 text-sm"
            style={{
              borderColor: "var(--psych-border)",
              backgroundColor: "var(--psych-bg)",
            }}
          >
            <p>
              Before mean:{" "}
              <strong>{comparison.before.mean?.toFixed(1) ?? "—"}</strong> ·{" "}
              {comparison.before.count} record(s)
            </p>
            <p>
              After mean:{" "}
              <strong>{comparison.after.mean?.toFixed(1) ?? "—"}</strong> ·{" "}
              {comparison.after.count} record(s)
            </p>
            <p>
              Delta:{" "}
              <strong>
                {comparison.delta !== null ? comparison.delta.toFixed(1) : "—"}
              </strong>{" "}
              · trajectory:{" "}
              <strong style={{ color: directionColor(comparison.direction) }}>
                {comparison.direction}
              </strong>
            </p>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--psych-muted)" }}>
            Fill both periods to compare.
          </p>
        )}
      </SectionCard>
    </div>
  );
}

function directionColor(d: string): string {
  switch (d) {
    case "improved":
      return "#10B981";
    case "worsened":
      return "#DC2626";
    case "stable":
      return "var(--psych-muted)";
    default:
      return "var(--psych-muted)";
  }
}
