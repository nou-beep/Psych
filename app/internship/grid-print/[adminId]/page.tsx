"use client";

// Printable A4 view for a scored capability grid.
//
// Rendered without app chrome. Uses inline print CSS so it can be
// sent to a printer or saved as PDF directly from the browser.
// Layout follows the original paper grid: title, identification
// block, table with A / EC/NA / item / domain columns, observations
// section, signatures.

import Link from "next/link";
import { useMemo } from "react";
import { useInternship } from "@/contexts/InternshipContext";
import { findScorableTemplate } from "@/lib/internship/scorable-templates";
import {
  CAPABILITY_SCORE_LABELS,
  allDomainBreakdowns,
  type CapabilityScore,
} from "@/lib/internship/scorable-grids";

interface PageProps {
  params: { adminId: string };
}

export default function GridPrintPage({ params }: PageProps) {
  const { scorableAdmins, cases } = useInternship();
  const admin = useMemo(
    () => scorableAdmins.find((a) => a.id === params.adminId),
    [scorableAdmins, params.adminId]
  );
  const template = admin ? findScorableTemplate(admin.templateId) : null;
  const caseData = useMemo(
    () => (admin ? cases.find((c) => c.id === admin.caseId) : null),
    [cases, admin]
  );

  if (!admin || !template) {
    return (
      <main className="grid-print-page">
        <p style={{ padding: 40, fontFamily: "Georgia, serif" }}>
          Administration introuvable.{" "}
          <Link href="/internship">← retour</Link>
        </p>
        <style jsx global>
          {GLOBAL_PRINT_CSS}
        </style>
      </main>
    );
  }

  const breakdowns = allDomainBreakdowns(admin, template);

  return (
    <main className="grid-print-page">
      {/* On-screen toolbar (hidden in print). */}
      <div className="grid-print-toolbar no-print">
        <Link href={`/internship/cases/${admin.caseId}`}>
          ← retour à la case
        </Link>
        <button onClick={() => window.print()}>Imprimer / PDF</button>
      </div>

      <article className="grid-print-page-body">
        <header className="grid-print-header">
          <h1>{template.name}</h1>
          {template.description && (
            <p className="grid-print-subtitle">{template.description}</p>
          )}
        </header>

        <section className="grid-print-meta">
          <div>
            <strong>Code dossier</strong>
            <span>{caseData?.identification.caseCode ?? "—"}</span>
          </div>
          <div>
            <strong>Date</strong>
            <span>{admin.date}</span>
          </div>
          <div>
            <strong>Évaluateur</strong>
            <span>{admin.evaluator ?? "—"}</span>
          </div>
          <div>
            <strong>Contexte</strong>
            <span>{admin.context ?? "—"}</span>
          </div>
        </section>

        {breakdowns.map((b) => {
          const domain = template.domains.find((d) => d.id === b.domainId);
          if (!domain) return null;
          return (
            <section key={domain.id} className="grid-print-domain">
              <h2>
                <span>{domain.label}</span>
                <span className="grid-print-domain-meta">
                  {b.counts.A} A · {b.counts.EC} EC · {b.counts.NA} NA ·{" "}
                  {b.counts.NO} N/O · {b.acquisitionPct}% acquisition
                </span>
              </h2>
              <table className="grid-print-table">
                <thead>
                  <tr>
                    <th className="grid-print-col-a">A</th>
                    <th className="grid-print-col-ecna">EC / NA</th>
                    <th>Indicateur clinique / tâche observée</th>
                    <th className="grid-print-col-domain">Domaine</th>
                  </tr>
                </thead>
                <tbody>
                  {domain.items.map((item) => {
                    const entry = admin.scores[item.id];
                    const score: CapabilityScore | null = entry?.score ?? null;
                    return (
                      <tr key={item.id}>
                        <td className="grid-print-tick">
                          {score === "A" ? "✓" : ""}
                        </td>
                        <td className="grid-print-tick">
                          {score === "EC"
                            ? CAPABILITY_SCORE_LABELS.EC
                            : score === "NA"
                            ? CAPABILITY_SCORE_LABELS.NA
                            : score === "NO"
                            ? CAPABILITY_SCORE_LABELS.NO
                            : ""}
                        </td>
                        <td>
                          {item.label}
                          {entry?.evidence && (
                            <span className="grid-print-evidence">
                              · {entry.evidence}
                            </span>
                          )}
                        </td>
                        <td className="grid-print-domain-cell">
                          {domain.label}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}

        <section className="grid-print-observations">
          <h3>
            {template.observationsHeading ?? "Observations cliniques générales"}
          </h3>
          <div className="grid-print-observations-body">
            {admin.observations || (
              <span className="grid-print-placeholder">(à compléter)</span>
            )}
          </div>
        </section>

        <section className="grid-print-signatures">
          <div>
            <strong>Signature du psychologue</strong>
            <span>{admin.signaturePsychologue ?? ""}</span>
          </div>
          <div>
            <strong>Visa du responsable</strong>
            <span>{admin.visaResponsable ?? ""}</span>
          </div>
        </section>

        {template.licensingNote && (
          <footer className="grid-print-footer">
            {template.licensingNote}
          </footer>
        )}
      </article>

      <style jsx global>
        {GLOBAL_PRINT_CSS}
      </style>
    </main>
  );
}

// Inline print CSS — kept in one place so the printable view does
// not pull in any of the app chrome stylesheets it doesn't need.
const GLOBAL_PRINT_CSS = `
  .grid-print-page {
    background: #FFFAF0;
    min-height: 100vh;
    color: #1C1812;
    font-family: Georgia, "Times New Roman", serif;
  }
  .grid-print-toolbar {
    background: #F4F0E8;
    border-bottom: 1px solid rgba(28,24,18,0.22);
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 13px;
  }
  .grid-print-toolbar a {
    color: #4B1F3C;
    text-decoration: none;
    font-weight: 500;
  }
  .grid-print-toolbar button {
    background: #4B1F3C;
    color: #FFFAF0;
    border: none;
    padding: 6px 14px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
  }
  .grid-print-page-body {
    max-width: 210mm;
    margin: 0 auto;
    padding: 28mm 18mm 24mm;
    background: #FFFAF0;
  }
  .grid-print-header { margin-bottom: 14px; }
  .grid-print-header h1 {
    font-size: 19px;
    margin: 0;
    color: #1C1812;
    font-weight: 700;
  }
  .grid-print-subtitle {
    font-size: 11px;
    color: #5C5244;
    margin-top: 4px;
    font-style: italic;
  }
  .grid-print-meta {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 16px 0 18px;
    padding: 10px 12px;
    border: 1px solid rgba(28,24,18,0.22);
    background: #F4F0E8;
    font-size: 11px;
  }
  .grid-print-meta div { display: flex; flex-direction: column; gap: 2px; }
  .grid-print-meta strong {
    text-transform: uppercase;
    font-size: 9px;
    letter-spacing: 0.08em;
    color: #5C5244;
    font-weight: 600;
  }
  .grid-print-meta span { color: #1C1812; }
  .grid-print-domain { margin-bottom: 14px; page-break-inside: avoid; }
  .grid-print-domain h2 {
    font-size: 13px;
    font-weight: 700;
    margin: 0 0 4px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    color: #1C1812;
  }
  .grid-print-domain-meta {
    font-size: 10px;
    font-weight: 400;
    color: #5C5244;
    font-style: italic;
  }
  .grid-print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  .grid-print-table th,
  .grid-print-table td {
    border: 1px solid rgba(28,24,18,0.35);
    padding: 6px 8px;
    vertical-align: top;
    text-align: left;
  }
  .grid-print-table th {
    background: #E5DFD3;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 9px;
    letter-spacing: 0.06em;
  }
  .grid-print-col-a, .grid-print-col-ecna { width: 38px; text-align: center; }
  .grid-print-col-domain { width: 110px; color: #5C5244; }
  .grid-print-tick { text-align: center; font-weight: 600; }
  .grid-print-domain-cell { color: #5C5244; font-size: 10px; }
  .grid-print-evidence {
    color: #5C5244;
    font-size: 10px;
    font-style: italic;
    margin-left: 4px;
  }
  .grid-print-observations { margin-top: 18px; }
  .grid-print-observations h3 {
    font-size: 12px;
    font-weight: 600;
    margin: 0 0 6px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #5C5244;
  }
  .grid-print-observations-body {
    border: 1px solid rgba(28,24,18,0.35);
    padding: 8px 10px;
    min-height: 80px;
    font-size: 11.5px;
    line-height: 1.5;
    background: #FFFAF0;
    white-space: pre-wrap;
  }
  .grid-print-placeholder { color: rgba(28,24,18,0.4); font-style: italic; }
  .grid-print-signatures {
    margin-top: 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .grid-print-signatures div {
    border-top: 1px solid rgba(28,24,18,0.35);
    padding-top: 6px;
    font-size: 10px;
    color: #1C1812;
    display: flex;
    flex-direction: column;
    min-height: 56px;
  }
  .grid-print-signatures strong {
    text-transform: uppercase;
    font-size: 9px;
    letter-spacing: 0.08em;
    color: #5C5244;
    margin-bottom: 4px;
  }
  .grid-print-footer {
    margin-top: 24px;
    font-size: 9px;
    color: #5C5244;
    font-style: italic;
    border-top: 1px dashed rgba(28,24,18,0.22);
    padding-top: 6px;
  }
  @media print {
    body { background: white; }
    .no-print { display: none !important; }
    .grid-print-page-body { padding: 14mm 12mm; box-shadow: none; }
  }
`;
