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
  PFE_TABLES,
  REAL_CHAPTER_PROGRESS,
  REAL_CORRELATIONS,
  REAL_DESCRIPTIVES,
  REAL_THESIS_DESIGN,
  REGRESSION_FINDING,
  THESIS_ABSTRACT_EN,
  THESIS_ABSTRACT_FR,
  THESIS_AIM,
  THESIS_CONCEPTS,
  THESIS_FR_TITLE,
  THESIS_KEYWORDS,
  THESIS_OBJECTIVES,
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
            <Link href="/formation/thesis/import">
              <Button size="sm" variant="secondary">
                Import participant data
              </Button>
            </Link>
            <Link href="/formation/thesis/writer">
              <Button size="sm">Open writer</Button>
            </Link>
          </div>
        }
      />

      {/* Overview */}
      <SectionCard
        title="Vue d'ensemble"
        description={`${THESIS_OWNER.author} · ${THESIS_OWNER.supervisor} · ${THESIS_OWNER.academicYear} · ${THESIS_OWNER.defenceDate}`}
      >
        <p className="text-sm mb-3" style={{ color: "var(--psych-text)" }}>
          <strong>Programme. </strong>
          {THESIS_OWNER.programme} · {THESIS_OWNER.module}
          <br />
          <span style={{ color: "var(--psych-muted)" }}>
            {THESIS_OWNER.laboratory}
          </span>
        </p>
        <p className="text-sm mb-3" style={{ color: "var(--psych-text)" }}>
          <strong>Objectif. </strong>
          {THESIS_AIM}
        </p>
        <p className="text-sm mb-3" style={{ color: "var(--psych-text)" }}>
          <strong>Problématique. </strong>
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

      {/* Abstract — French + English */}
      <SectionCard
        title="Résumé / Abstract"
        description="Versions française et anglaise extraites du PFE."
        className="mt-4"
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"
          style={{ color: "var(--psych-text)" }}
        >
          <div
            className="rounded-lg border p-3"
            style={{ borderColor: "var(--psych-border)" }}
          >
            <div
              className="text-[10px] uppercase tracking-widest mb-1"
              style={{ color: "var(--psych-accent)" }}
            >
              Résumé · FR
            </div>
            <p className="whitespace-pre-line">{THESIS_ABSTRACT_FR}</p>
          </div>
          <div
            className="rounded-lg border p-3"
            style={{ borderColor: "var(--psych-border)" }}
          >
            <div
              className="text-[10px] uppercase tracking-widest mb-1"
              style={{ color: "var(--psych-accent)" }}
            >
              Abstract · EN
            </div>
            <p className="whitespace-pre-line">{THESIS_ABSTRACT_EN}</p>
          </div>
        </div>
      </SectionCard>

      {/* Four objectives */}
      <SectionCard
        title="Objectifs du travail"
        description="Quatre objectifs articulant les dimensions théorique, analytique, intégrative et empirique."
        className="mt-4"
      >
        <ol
          className="space-y-2 list-decimal list-inside text-sm"
          style={{ color: "var(--psych-text)" }}
        >
          {THESIS_OBJECTIVES.map((o, i) => (
            <li key={i} className="leading-relaxed">
              {o}
            </li>
          ))}
        </ol>
      </SectionCard>

      {/* Chapter progress tracker */}
      <SectionCard
        title="Avancement par chapitre"
        description="État du brouillon — pourcentages estimés à partir du draft PFE."
        className="mt-4"
      >
        <div className="space-y-2">
          {REAL_CHAPTER_PROGRESS.map((ch) => {
            const tint =
              ch.status === "drafted"
                ? "#10B981"
                : ch.status === "in-progress"
                  ? "#3B82F6"
                  : ch.status === "outline"
                    ? "#F59E0B"
                    : ch.status === "complete"
                      ? "#5B36A8"
                      : "#94a3b8";
            return (
              <div
                key={ch.chapterId}
                className="rounded-lg border p-3"
                style={{ borderColor: "var(--psych-border)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--psych-text)" }}
                  >
                    {ch.label}
                  </div>
                  <div
                    className="text-xs font-mono"
                    style={{ color: tint }}
                  >
                    {ch.percent}%
                  </div>
                </div>
                <div
                  className="w-full h-1.5 rounded-full"
                  style={{ background: "var(--psych-bg)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${ch.percent}%`,
                      background: tint,
                    }}
                  />
                </div>
                <p
                  className="text-[11px] mt-1"
                  style={{ color: "var(--psych-muted)" }}
                >
                  {ch.note}
                </p>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Descriptive statistics */}
      <SectionCard
        title="Statistiques descriptives — protocole (n planifié = 50)"
        description="Collecte de données non commencée. Les valeurs seront calculées après la passation."
        className="mt-4"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
              <table className="w-full text-xs mb-2">
                <tbody>
                  <tr>
                    <td style={{ color: "var(--psych-muted)" }}>n planifié</td>
                    <td className="text-right font-mono">{d.plannedN}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--psych-muted)" }}>Étendue</td>
                    <td className="text-right font-mono">{d.scoreRange}</td>
                  </tr>
                </tbody>
              </table>
              <p
                className="text-[11px] mt-2"
                style={{ color: "var(--psych-muted)" }}
              >
                {d.status}
              </p>
              <p
                className="text-[10px] mt-1"
                style={{ color: "var(--psych-muted)", opacity: 0.7 }}
              >
                {d.pfeSection}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Correlations */}
      <SectionCard
        title="Corrélations prévues (H1 & H2)"
        description="Tests à conduire après la collecte. Cadre statistique défini au §5.5.2."
        className="mt-4"
      >
        <ul className="space-y-2">
          {REAL_CORRELATIONS.map((c) => (
            <li
              key={c.hypothesis}
              className="rounded-xl border p-3"
              style={{ borderColor: "var(--psych-border)" }}
            >
              <div
                className="text-[10px] uppercase tracking-widest mb-1"
                style={{ color: "var(--psych-accent)" }}
              >
                {c.hypothesis}
              </div>
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
                {c.test}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--psych-muted)" }}
              >
                Seuil : {c.alphaThreshold} · Attendu : {c.expected}
              </div>
              <p
                className="text-[11px] mt-1 italic"
                style={{ color: "var(--psych-muted)" }}
              >
                {c.status}
              </p>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Regression */}
      <SectionCard
        title="Régression linéaire multiple — H3"
        description="Spécification du modèle. Estimation à conduire après la collecte (§5.5.3)."
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
            Variable dépendante
          </div>
          <div className="text-sm font-medium" style={{ color: "var(--psych-text)" }}>
            {REGRESSION_FINDING.outcome}
          </div>
          <div
            className="text-[10px] uppercase tracking-wider mt-2"
            style={{ color: "var(--psych-muted)" }}
          >
            Prédicteurs
          </div>
          <div className="text-xs" style={{ color: "var(--psych-text)" }}>
            {REGRESSION_FINDING.predictors.join(" · ")}
          </div>
          <div
            className="text-[10px] uppercase tracking-wider mt-2"
            style={{ color: "var(--psych-muted)" }}
          >
            Covariables
          </div>
          <div className="text-xs" style={{ color: "var(--psych-text)" }}>
            {REGRESSION_FINDING.covariates.join(" · ")}
          </div>
          <div
            className="text-[10px] uppercase tracking-wider mt-2"
            style={{ color: "var(--psych-muted)" }}
          >
            Méthode
          </div>
          <div className="text-xs" style={{ color: "var(--psych-text)" }}>
            {REGRESSION_FINDING.method}
          </div>
          <div
            className="text-[10px] uppercase tracking-wider mt-2"
            style={{ color: "var(--psych-muted)" }}
          >
            Postulats vérifiés
          </div>
          <ul className="text-xs list-disc pl-5" style={{ color: "var(--psych-text)" }}>
            {REGRESSION_FINDING.postulatesChecks.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p
            className="text-sm mt-2 italic"
            style={{ color: "var(--psych-text)" }}
          >
            Hypothèse {REGRESSION_FINDING.hypothesis} : {REGRESSION_FINDING.expected}
          </p>
          <p
            className="text-[11px] mt-2"
            style={{ color: "var(--psych-muted)" }}
          >
            Indicateurs rapportés : {REGRESSION_FINDING.reportedIndicators}
          </p>
          <p
            className="text-[11px] mt-1 italic"
            style={{ color: "var(--psych-muted)" }}
          >
            {REGRESSION_FINDING.status}
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
            <Link href="/formation/thesis/import">
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

      {/* Tableaux du PFE */}
      <SectionCard
        title="Tableaux du PFE"
        description="Variables, plan d'analyse et correspondance hypothèses ↔ tests (chapitre 5)."
        className="mt-4"
      >
        <div className="space-y-5">
          {PFE_TABLES.map((t) => (
            <div key={t.id}>
              <div
                className="text-xs font-semibold mb-1"
                style={{ color: "var(--psych-text)" }}
              >
                Tableau {t.number} — {t.caption}
              </div>
              <div className="overflow-x-auto">
                <table
                  className="w-full text-xs border-collapse"
                  style={{ color: "var(--psych-text)" }}
                >
                  <thead>
                    <tr>
                      {t.columns.map((col) => (
                        <th
                          key={col}
                          className="text-left p-2 font-medium border-b"
                          style={{
                            borderColor: "var(--psych-border)",
                            background: "var(--psych-bg)",
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="p-2 border-b align-top"
                            style={{
                              borderColor: "var(--psych-border)",
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p
                className="text-[10px] mt-1 italic"
                style={{ color: "var(--psych-muted)" }}
              >
                Note. {t.note}
              </p>
            </div>
          ))}
        </div>
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
