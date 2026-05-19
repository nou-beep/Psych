"use client";
// Thesis dashboard — surfaces the user's real thesis material:
// descriptives, correlations, regression finding, methodology
// sub-sections, hypotheses, and analysis plan. Scatterplots and
// raw-data charts are intentionally NOT generated unless
// participant-level data is imported.

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ANALYSIS_PLAN,
  METHODOLOGY_SECTIONS,
  REAL_CORRELATIONS,
  REAL_DESCRIPTIVES,
  REAL_THESIS_DESIGN,
  REGRESSION_FINDING,
  THESIS_AIM,
  THESIS_CONCEPTS,
  THESIS_FR_TITLE,
  THESIS_KEYWORDS,
  THESIS_OWNER,
  THESIS_PROBLEM,
  THESIS_TOPIC_SUMMARY,
} from "@/lib/thesis/real-seed";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { loadFromStorage } from "@/lib/store";
import type { ThesisParticipant } from "@/lib/thesis-data";

export default function ThesisDashboardPage() {
  const [participants, setParticipants] = useState<ThesisParticipant[]>([]);

  useEffect(() => {
    try {
      const stored = loadFromStorage<ThesisParticipant[]>(
        "thesis_participants",
        []
      );
      setParticipants(Array.isArray(stored) ? stored : []);
    } catch {
      setParticipants([]);
    }
  }, []);

  const hasRealData = participants.length > 0;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in" data-section="thesis">
      <PageHeader
        title="Thesis dashboard"
        subtitle={
          <span className="text-sm" style={{ color: "var(--psych-muted)" }}>
            {THESIS_FR_TITLE}
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Link href="/thesis/import">
              <Button size="sm" variant="secondary">
                Import participant data
              </Button>
            </Link>
            <Link href="/thesis/writer">
              <Button size="sm">Open writer</Button>
            </Link>
          </div>
        }
      />

      {/* Overview */}
      <SectionCard
        title="Overview"
        description={`${THESIS_OWNER.author} · ${THESIS_OWNER.supervisor} · ${THESIS_OWNER.academicYear}`}
      >
        <p className="text-sm mb-3" style={{ color: "var(--psych-text)" }}>
          <strong>Aim. </strong>
          {THESIS_AIM}
        </p>
        <p className="text-sm mb-3" style={{ color: "var(--psych-text)" }}>
          <strong>Problem. </strong>
          {THESIS_PROBLEM}
        </p>
        <p className="text-sm mb-3" style={{ color: "var(--psych-muted)" }}>
          {THESIS_TOPIC_SUMMARY}
        </p>
        <div className="flex flex-wrap gap-1">
          {THESIS_KEYWORDS.map((k) => (
            <span
              key={k}
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{
                background: "var(--psych-primary-light)",
                color: "var(--psych-accent)",
              }}
            >
              {k}
            </span>
          ))}
        </div>
      </SectionCard>

      {/* Descriptive statistics */}
      <SectionCard
        title="Descriptive statistics (n=52)"
        description="Values reported by the author. Re-computed automatically if participant-level data is imported."
        className="mt-4"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          {REAL_DESCRIPTIVES.map((d) => (
            <div
              key={d.acronym}
              className="rounded-xl border p-3 alive-hover"
              style={{
                borderColor: "var(--psych-border)",
                background: "var(--psych-card)",
              }}
            >
              <div
                className="text-[10px] uppercase tracking-wider"
                style={{ color: "var(--psych-muted)" }}
              >
                {d.acronym}
              </div>
              <div
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--psych-text)" }}
              >
                {d.instrument}
              </div>
              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td style={{ color: "var(--psych-muted)" }}>M</td>
                    <td className="text-right font-mono">{d.mean}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--psych-muted)" }}>SD</td>
                    <td className="text-right font-mono">{d.sd}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--psych-muted)" }}>Min – Max</td>
                    <td className="text-right font-mono">
                      {d.min} – {d.max}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--psych-muted)" }}>n</td>
                    <td className="text-right font-mono">{d.n}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Correlations */}
      <SectionCard
        title="Pearson correlations"
        description="Reported by the author"
        className="mt-4"
      >
        <ul className="space-y-2">
          {REAL_CORRELATIONS.map((c) => (
            <li
              key={`${c.variableA}-${c.variableB}`}
              className="rounded-xl border p-3"
              style={{ borderColor: "var(--psych-border)" }}
            >
              <div
                className="text-sm font-medium"
                style={{ color: "var(--psych-text)" }}
              >
                {c.variableA} ↔ {c.variableB}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: "var(--psych-muted)" }}
              >
                r = <strong style={{ color: "var(--psych-text)" }}>{c.r}</strong> · p {c.p} ·
                n = {c.n}
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--psych-muted)" }}>
                {c.interpretation}
              </p>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Regression */}
      <SectionCard
        title="Regression finding"
        description="Reported by the author"
        className="mt-4"
      >
        <div
          className="rounded-xl border p-3"
          style={{
            borderColor: "var(--psych-border)",
            borderLeft: "4px solid #9F1239",
          }}
        >
          <div
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "var(--psych-muted)" }}
          >
            Outcome
          </div>
          <div className="text-sm font-medium" style={{ color: "var(--psych-text)" }}>
            {REGRESSION_FINDING.outcome}
          </div>
          <div
            className="text-[10px] uppercase tracking-wider mt-2"
            style={{ color: "var(--psych-muted)" }}
          >
            Predictors
          </div>
          <div className="text-xs" style={{ color: "var(--psych-text)" }}>
            {REGRESSION_FINDING.predictors.join(" · ")}
          </div>
          <p
            className="text-sm mt-2 italic"
            style={{ color: "var(--psych-text)" }}
          >
            {REGRESSION_FINDING.keyResult}
          </p>
          <p
            className="text-[11px] mt-2"
            style={{ color: "var(--psych-muted)" }}
          >
            {REGRESSION_FINDING.note}
          </p>
        </div>
      </SectionCard>

      {/* Scatterplots placeholder */}
      <SectionCard
        title="Scatterplots"
        description="Structure ready — awaiting participant-level data"
        className="mt-4"
      >
        {hasRealData ? (
          <p className="text-sm" style={{ color: "var(--psych-text)" }}>
            {participants.length} participants imported. Open the Thesis Studio
            to view scatterplots and run analytics on the real dataset.
          </p>
        ) : (
          <div
            className="rounded-xl border-2 border-dashed p-6 text-center"
            style={{
              borderColor: "var(--psych-border)",
              background: "var(--psych-bg)",
            }}
          >
            <div
              className="text-sm mb-1"
              style={{ color: "var(--psych-text)" }}
            >
              Structure only — participant-level data required.
            </div>
            <p
              className="text-xs"
              style={{ color: "var(--psych-muted)" }}
            >
              No raw data points are generated until you import your CSV
              (CDS / STAI-Y / PHQ-9 per participant).
            </p>
            <Link href="/thesis/import">
              <Button size="sm" className="mt-3">
                Import participant-level data
              </Button>
            </Link>
          </div>
        )}
      </SectionCard>

      {/* Methodology sub-sections */}
      <SectionCard
        title="Methodology"
        description="Editable sections — populate in the thesis writer"
        className="mt-4"
      >
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {METHODOLOGY_SECTIONS.map((s) => (
            <li
              key={s}
              className="rounded-md border p-2 alive-hover"
              style={{ borderColor: "var(--psych-border)" }}
            >
              {s}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Hypotheses */}
      <SectionCard
        title="Hypothèses"
        description="Versions françaises et opérationnalisation"
        className="mt-4"
      >
        <ul className="space-y-2">
          {REAL_THESIS_DESIGN.hypotheses.map((h, i) => (
            <li
              key={i}
              className="rounded-xl border p-3 text-sm"
              style={{ borderColor: "var(--psych-border)" }}
            >
              {h}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Analysis plan */}
      <SectionCard
        title="Plan d'analyse statistique"
        className="mt-4"
      >
        <ul className="space-y-2">
          {ANALYSIS_PLAN.map((p) => (
            <li
              key={p.id}
              className="rounded-md border p-2 text-sm"
              style={{ borderColor: "var(--psych-border)" }}
            >
              <div className="font-medium" style={{ color: "var(--psych-text)" }}>
                {p.label}
              </div>
              <div className="text-xs" style={{ color: "var(--psych-muted)" }}>
                {p.description}
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Concepts */}
      <SectionCard title="Concepts thésauriques" className="mt-4">
        <ul className="space-y-2">
          {THESIS_CONCEPTS.map((c) => (
            <li
              key={c.id}
              className="rounded-md border p-3 text-sm"
              style={{ borderColor: "var(--psych-border)" }}
            >
              <div
                className="font-medium"
                style={{ color: "var(--psych-text)" }}
              >
                {c.label}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--psych-muted)" }}>
                {c.body}
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
