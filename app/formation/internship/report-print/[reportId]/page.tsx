"use client";

// Printable A4 view for an internship report (daily / weekly /
// final / simple). Rendered without app chrome — `ChromeGate`
// recognises the route as immersive. The on-screen toolbar is
// stripped in print so the page goes straight to PDF.

import Link from "next/link";
import { useMemo } from "react";

import { useInternship } from "@/contexts/InternshipContext";
import { DEFAULT_EVALUATOR } from "@/lib/internship/evaluator";
import { DEFAULT_INSTITUTION } from "@/lib/internship/institutions";
import {
  INTERNSHIP_REPORT_LABELS,
  type DailyReportSections,
  type FinalReportSections,
  type WeeklyReportSections,
} from "@/lib/internship/types";
import { findScorableTemplate } from "@/lib/internship/scorable-templates";
import { generateGridSummary } from "@/lib/internship/scorable-text";
import { CONTEXT_OPTIONS, RESPONSE_QUALITY_OPTIONS, labelOf } from "@/components/ui/structured/options";

interface PageProps {
  params: { reportId: string };
}

export default function ReportPrintPage({ params }: PageProps) {
  const { reports, cases, scorableAdmins } = useInternship();
  const report = useMemo(
    () => reports.find((r) => r.id === params.reportId),
    [reports, params.reportId]
  );
  const caseData = useMemo(
    () => (report ? cases.find((c) => c.id === report.caseId) : null),
    [cases, report]
  );

  if (!report) {
    return (
      <main className="report-print-page">
        <p style={{ padding: 40, fontFamily: "Georgia, serif" }}>
          Rapport introuvable.{" "}
          <Link href="/internship">← retour</Link>
        </p>
        <style jsx global>
          {PRINT_CSS}
        </style>
      </main>
    );
  }

  return (
    <main className="report-print-page">
      <div className="report-print-toolbar no-print">
        <Link href={`/internship/cases/${report.caseId}?tab=reports`}>
          ← retour au cas
        </Link>
        <button onClick={() => window.print()}>Imprimer / PDF</button>
      </div>

      <article className="report-print-body">
        <header className="report-print-header">
          <div className="report-print-eyebrow">
            {INTERNSHIP_REPORT_LABELS[report.kind]}
          </div>
          <h1>{report.title}</h1>
          <p className="report-print-subhead">
            {DEFAULT_INSTITUTION.setting} · {DEFAULT_INSTITUTION.academicProgram}
          </p>
        </header>

        <section className="report-print-meta">
          <div>
            <strong>Code dossier</strong>
            <span>{caseData?.identification.caseCode ?? "—"}</span>
          </div>
          <div>
            <strong>Évaluateur</strong>
            <span>
              {DEFAULT_EVALUATOR.name}
              <br />
              <span className="report-print-meta-sub">
                {DEFAULT_EVALUATOR.role}
              </span>
            </span>
          </div>
          <div>
            <strong>Encadrement</strong>
            <span>{DEFAULT_INSTITUTION.academicSupervisor}</span>
          </div>
          <div>
            <strong>Statut</strong>
            <span>{report.draft ? "Brouillon" : "Finalisé"}</span>
          </div>
        </section>

        {report.kind === "daily" && report.daily && (
          <DailySections sections={report.daily} />
        )}
        {report.kind === "weekly" && report.weekly && (
          <WeeklySections sections={report.weekly} />
        )}
        {(report.kind === "monthly" && report.monthly) && (
          <WeeklySections sections={report.monthly} />
        )}
        {report.kind === "final" && report.final && (
          <FinalSections
            sections={report.final}
            caseId={report.caseId}
            scorableAdmins={scorableAdmins.filter(
              (a) => a.caseId === report.caseId
            )}
          />
        )}
        {report.body &&
          report.kind !== "daily" &&
          report.kind !== "weekly" &&
          report.kind !== "final" &&
          report.kind !== "monthly" && (
            <section className="report-print-section">
              <div className="report-print-paragraph">{report.body}</div>
            </section>
          )}

        <section className="report-print-signatures">
          <div>
            <strong>Signature du psychologue</strong>
            <span>{DEFAULT_EVALUATOR.name}</span>
          </div>
          <div>
            <strong>Visa du responsable</strong>
            <span />
          </div>
        </section>
      </article>

      <style jsx global>
        {PRINT_CSS}
      </style>
    </main>
  );
}

// ─── Section renderers ────────────────────────────────────────

function ParagraphField({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value || !value.trim()) return null;
  return (
    <section className="report-print-section">
      <h2>{label}</h2>
      <div className="report-print-paragraph">{value}</div>
    </section>
  );
}

function DailySections({ sections }: { sections: DailyReportSections }) {
  const contextLabel = sections.contextChip
    ? labelOf(CONTEXT_OPTIONS, sections.contextChip)
    : "";
  const responseLabel = sections.responseQuality
    ? labelOf(RESPONSE_QUALITY_OPTIONS, sections.responseQuality)
    : "";
  return (
    <>
      <section className="report-print-meta-secondary">
        <div>
          <strong>Date</strong>
          <span>{sections.date}</span>
        </div>
        {(sections.contextSession || contextLabel) && (
          <div>
            <strong>Contexte</strong>
            <span>{sections.contextSession || contextLabel}</span>
          </div>
        )}
        {responseLabel && (
          <div>
            <strong>Qualité de réponse</strong>
            <span>{responseLabel}</span>
          </div>
        )}
      </section>
      <ParagraphField label="Objectifs" value={sections.objectives} />
      <ParagraphField label="Observations" value={sections.observations} />
      <ParagraphField label="Communication" value={sections.communication} />
      <ParagraphField
        label="Interaction sociale"
        value={sections.socialInteraction}
      />
      <ParagraphField label="Comportement" value={sections.behavior} />
      <ParagraphField
        label="Régulation émotionnelle"
        value={sections.emotionalRegulation}
      />
      <ParagraphField label="Notes sensorielles" value={sections.sensoryNotes} />
      <ParagraphField label="Intervention mobilisée" value={sections.interventionUsed} />
      <ParagraphField label="Réponse" value={sections.response} />
      <ParagraphField label="Réflexion" value={sections.reflection} />
      <ParagraphField label="Étapes suivantes" value={sections.nextSteps} />
    </>
  );
}

function WeeklySections({ sections }: { sections: WeeklyReportSections }) {
  return (
    <>
      <section className="report-print-meta-secondary">
        <div>
          <strong>Période</strong>
          <span>
            {sections.weekStart} → {sections.weekEnd}
          </span>
        </div>
        {typeof sections.sessionsCompleted === "number" && (
          <div>
            <strong>Séances</strong>
            <span>{sections.sessionsCompleted}</span>
          </div>
        )}
      </section>
      <ParagraphField label="Progrès observés" value={sections.progressObserved} />
      <ParagraphField label="Difficultés" value={sections.difficulties} />
      <ParagraphField label="Patterns récurrents" value={sections.repeatedPatterns} />
      <ParagraphField label="Tests administrés" value={sections.testsAdministered} />
      <ParagraphField label="Grilles complétées" value={sections.gridsCompleted} />
      <ParagraphField
        label="Questions de supervision"
        value={sections.supervisionQuestions}
      />
      <ParagraphField
        label="Objectifs pour la semaine suivante"
        value={sections.nextWeekObjectives}
      />
    </>
  );
}

function FinalSections({
  sections,
  caseId,
  scorableAdmins,
}: {
  sections: FinalReportSections;
  caseId: string;
  scorableAdmins: ReturnType<typeof useInternship>["scorableAdmins"];
}) {
  void caseId;
  return (
    <>
      {sections.coverPage && (
        <section className="report-print-section report-print-cover">
          <pre className="report-print-paragraph">{sections.coverPage}</pre>
        </section>
      )}
      <ParagraphField
        label="Présentation du lieu de stage"
        value={sections.internshipContext}
      />
      <ParagraphField
        label="Présentation du cas"
        value={sections.casePresentation}
      />
      <ParagraphField
        label="Méthodologie d'observation"
        value={sections.observationMethodology}
      />
      <ParagraphField
        label="Symptômes observés"
        value={sections.clinicalObservations}
      />
      <ParagraphField
        label="Hypothèse clinique"
        value={sections.recommendations}
      />
      <ParagraphField
        label="Tests administrés"
        value={sections.testsAdministered}
      />
      <ParagraphField
        label="Grilles d'évaluation"
        value={sections.evaluationGrids}
      />
      {scorableAdmins.length > 0 && (
        <section className="report-print-section">
          <h2>Synthèses détaillées des grilles</h2>
          {scorableAdmins.map((a) => {
            const tpl = findScorableTemplate(a.templateId);
            if (!tpl) return null;
            const summary = generateGridSummary(a, tpl);
            return (
              <div key={a.id} className="report-print-grid-detail">
                <h3>
                  {tpl.name} · {a.date}
                </h3>
                <p>{summary.headline}</p>
                <ul>
                  {summary.perDomain
                    .filter((d) => d.paragraph)
                    .map((d) => (
                      <li key={d.domainId}>
                        <strong>{d.domainLabel}</strong> ({d.acquisitionPct}%
                        acquisition) : {d.paragraph}
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}
      <ParagraphField
        label="Intervention et pistes thérapeutiques"
        value={sections.interventionReflection}
      />
      <ParagraphField
        label="Évolution et réflexion personnelle"
        value={sections.progressEvolution}
      />
      <ParagraphField
        label="Supervision"
        value={sections.supervisionReflections}
      />
      <ParagraphField label="Limites" value={sections.limits} />
      <ParagraphField
        label="Recommandations"
        value={sections.recommendations}
      />
      <ParagraphField label="Conclusion" value={sections.conclusion} />
      <ParagraphField label="Annexes" value={sections.appendices} />
    </>
  );
}

// ─── Print CSS ────────────────────────────────────────────────

const PRINT_CSS = `
  .report-print-page {
    background: #FFFAF0;
    min-height: 100vh;
    color: #1C1812;
    font-family: Georgia, "Times New Roman", serif;
  }
  .report-print-toolbar {
    background: #F4F0E8;
    border-bottom: 1px solid rgba(28,24,18,0.22);
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 13px;
  }
  .report-print-toolbar a {
    color: #4B1F3C;
    text-decoration: none;
    font-weight: 500;
  }
  .report-print-toolbar button {
    background: #4B1F3C;
    color: #FFFAF0;
    border: none;
    padding: 6px 14px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
  }
  .report-print-body {
    max-width: 210mm;
    margin: 0 auto;
    padding: 28mm 18mm 24mm;
    background: #FFFAF0;
  }
  .report-print-header { margin-bottom: 18px; }
  .report-print-eyebrow {
    text-transform: uppercase;
    font-size: 9px;
    letter-spacing: 0.16em;
    color: #5C5244;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", monospace;
    margin-bottom: 6px;
  }
  .report-print-header h1 {
    font-size: 20px;
    margin: 0;
    color: #1C1812;
    font-weight: 700;
  }
  .report-print-subhead {
    font-size: 11px;
    color: #5C5244;
    margin-top: 4px;
    font-style: italic;
  }
  .report-print-meta {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 16px 0 14px;
    padding: 10px 12px;
    border: 1px solid rgba(28,24,18,0.22);
    background: #F4F0E8;
    font-size: 11px;
  }
  .report-print-meta-secondary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin: 0 0 14px;
    padding: 8px 12px;
    border-left: 2px solid #4B1F3C;
    background: #F4F0E8;
    font-size: 11px;
  }
  .report-print-meta div,
  .report-print-meta-secondary div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .report-print-meta strong,
  .report-print-meta-secondary strong {
    text-transform: uppercase;
    font-size: 9px;
    letter-spacing: 0.08em;
    color: #5C5244;
    font-weight: 600;
  }
  .report-print-meta span,
  .report-print-meta-secondary span {
    color: #1C1812;
  }
  .report-print-meta-sub {
    color: #5C5244;
    font-size: 10px;
  }
  .report-print-section {
    margin-bottom: 14px;
    page-break-inside: avoid;
  }
  .report-print-section h2 {
    font-size: 13px;
    font-weight: 700;
    margin: 0 0 4px;
    color: #1C1812;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .report-print-section h3 {
    font-size: 12px;
    font-weight: 600;
    margin: 6px 0 2px;
    color: #1C1812;
  }
  .report-print-paragraph {
    font-size: 12px;
    line-height: 1.55;
    white-space: pre-wrap;
    color: #1C1812;
  }
  .report-print-cover .report-print-paragraph {
    font-family: Georgia, serif;
    font-size: 13px;
    text-align: center;
    line-height: 1.7;
  }
  .report-print-grid-detail {
    margin-top: 8px;
    padding: 8px 10px;
    background: #F4F0E8;
    border-left: 2px solid #7A3560;
  }
  .report-print-grid-detail p {
    font-size: 11.5px;
    margin: 4px 0;
    color: #1C1812;
  }
  .report-print-grid-detail ul {
    margin: 4px 0 0 18px;
    padding: 0;
    font-size: 11px;
  }
  .report-print-grid-detail li {
    margin-bottom: 3px;
    color: #1C1812;
  }
  .report-print-signatures {
    margin-top: 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    page-break-inside: avoid;
  }
  .report-print-signatures div {
    border-top: 1px solid rgba(28,24,18,0.35);
    padding-top: 6px;
    font-size: 10px;
    color: #1C1812;
    display: flex;
    flex-direction: column;
    min-height: 56px;
  }
  .report-print-signatures strong {
    text-transform: uppercase;
    font-size: 9px;
    letter-spacing: 0.08em;
    color: #5C5244;
    margin-bottom: 4px;
  }
  @media print {
    body { background: white; }
    .no-print { display: none !important; }
    .report-print-body { padding: 14mm 12mm; box-shadow: none; }
  }
`;
