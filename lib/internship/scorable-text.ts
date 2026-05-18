// Auto-generated French clinical text from scorable-grid scores.
//
// Two layers:
//   - Per-domain summary paragraph (counts → headline + per-item
//     phrases collected from the template).
//   - Whole-grid summary (intro + per-domain block + observations
//     section + signature line).
//
// Plus assembly helpers that pull the same text into a daily
// report (DailyReportSections) or a grid-summary simple report.

import {
  CAPABILITY_SCORE_LONG_LABELS,
  DOMAIN_STATUS_LABELS,
  allDomainBreakdowns,
  domainBreakdown,
  gridBreakdown,
  suggestNextGridKeys,
  type DomainStatus,
  type ScorableGridAdministration,
  type ScorableGridTemplate,
} from "./scorable-grids";
import { followUpGridLabel } from "./scorable-templates";
import type { DailyReportSections } from "./types";

// ─── Headline phrases per domain status ────────────────────────

const DOMAIN_HEADLINE: Record<DomainStatus, string> = {
  "majoritairement-acquis":
    "Les capacités évaluées dans ce domaine apparaissent globalement acquises.",
  "en-cours-acquisition":
    "Les compétences sont en cours d'acquisition et nécessitent une stimulation régulière.",
  "a-renforcer":
    "Les items non acquis indiquent la nécessité d'un accompagnement structuré et progressif.",
  "non-suffisamment-observable":
    "Le domaine n'a pas pu être suffisamment observé lors de cette administration ; de nouvelles observations sont nécessaires.",
};

// Joins phrases as a French paragraph — keeps a single space, no
// double-period when the source already ends with one.
function joinSentences(parts: string[]): string {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (p.endsWith(".") ? p : p + "."))
    .join(" ");
}

// ─── Per-domain summary ────────────────────────────────────────

export function generateDomainSummary(
  admin: ScorableGridAdministration,
  template: ScorableGridTemplate,
  domainId: string
): string {
  const breakdown = domainBreakdown(admin, template, domainId);
  if (!breakdown) return "";
  const domain = template.domains.find((d) => d.id === domainId);
  if (!domain) return "";

  const sentences: string[] = [DOMAIN_HEADLINE[breakdown.status]];

  // Per-item phrases collected from the template definitions.
  for (const item of domain.items) {
    const entry = admin.scores[item.id];
    if (!entry) continue;
    if (entry.score === "A" && item.aPhrase) {
      sentences.push(item.aPhrase);
    } else if (
      (entry.score === "EC" || entry.score === "NA") &&
      item.ecOrNaPhrase
    ) {
      sentences.push(item.ecOrNaPhrase);
    }
  }

  return joinSentences(sentences);
}

// ─── Whole-grid summary ────────────────────────────────────────

export interface GridSummarySections {
  // Short headline for the grid as a whole.
  headline: string;
  // One paragraph per domain.
  perDomain: Array<{
    domainId: string;
    domainLabel: string;
    status: DomainStatus;
    statusLabel: string;
    acquisitionPct: number;
    paragraph: string;
  }>;
  // Cliniciansay-style synthesis paragraphs.
  strengths: string;
  difficulties: string;
  recommendations: string;
  // Suggested next grid keys (caller can render labels).
  nextGridKeys: string[];
}

export function generateGridSummary(
  admin: ScorableGridAdministration,
  template: ScorableGridTemplate
): GridSummarySections {
  const breakdowns = allDomainBreakdowns(admin, template);
  const grid = gridBreakdown(admin, template);

  const headline = grid.observabilityPct === 0
    ? "La grille n'a pas encore été cotée."
    : grid.acquisitionPct >= 75
    ? "Le profil clinique observé sur cette grille est globalement positif, avec des capacités majoritairement acquises."
    : grid.acquisitionPct >= 40
    ? "Le profil clinique observé sur cette grille fait apparaître des compétences en cours d'acquisition, avec des étayages à maintenir."
    : "Le profil clinique observé sur cette grille fait apparaître des compétences à renforcer ; un accompagnement structuré est recommandé.";

  // Strengths: items scored A.
  const acquiredItems: string[] = [];
  const ecItems: string[] = [];
  const naItems: string[] = [];
  for (const domain of template.domains) {
    for (const item of domain.items) {
      const entry = admin.scores[item.id];
      if (!entry) continue;
      if (entry.score === "A") acquiredItems.push(item.label);
      if (entry.score === "EC") ecItems.push(item.label);
      if (entry.score === "NA") naItems.push(item.label);
    }
  }

  const strengths =
    acquiredItems.length === 0
      ? "Aucune capacité n'a été cotée comme pleinement acquise lors de cette administration."
      : `Les capacités suivantes apparaissent acquises : ${acquiredItems.join(" ; ")}.`;

  const difficulties =
    ecItems.length === 0 && naItems.length === 0
      ? "Aucune difficulté marquée n'a été identifiée sur les items cotés."
      : [
          ecItems.length
            ? `Les capacités suivantes sont en cours d'acquisition : ${ecItems.join(" ; ")}.`
            : "",
          naItems.length
            ? `Les capacités suivantes ne sont pas acquises : ${naItems.join(" ; ")}.`
            : "",
        ]
          .filter(Boolean)
          .join(" ");

  const recommendations =
    grid.acquisitionPct >= 75
      ? "Poursuivre les apprentissages dans une logique de généralisation et d'autonomisation. Maintenir les supports structurants."
      : grid.acquisitionPct >= 40
      ? "Maintenir un étayage structuré, varier les contextes d'apprentissage, et reprendre les items en cours d'acquisition lors des prochaines séances."
      : "Mettre en place un accompagnement structuré et progressif, avec des objectifs courts et observables, en multipliant les opportunités d'observation.";

  return {
    headline,
    perDomain: breakdowns.map((b) => ({
      domainId: b.domainId,
      domainLabel: b.domainLabel,
      status: b.status,
      statusLabel: DOMAIN_STATUS_LABELS[b.status],
      acquisitionPct: b.acquisitionPct,
      paragraph: generateDomainSummary(admin, template, b.domainId),
    })),
    strengths,
    difficulties,
    recommendations,
    nextGridKeys: suggestNextGridKeys(admin, template),
  };
}

// ─── Renderable summary blocks (UI / print / report) ───────────

// Plain-text rendering used by report assembly + the print view.
export function renderSummaryAsText(
  summary: GridSummarySections
): string {
  const parts: string[] = [summary.headline];
  for (const d of summary.perDomain) {
    parts.push(
      `${d.domainLabel} · ${d.statusLabel} (${d.acquisitionPct}% acquisition)\n${d.paragraph}`
    );
  }
  parts.push("Forces : " + summary.strengths);
  parts.push("Difficultés : " + summary.difficulties);
  parts.push("Recommandations : " + summary.recommendations);
  if (summary.nextGridKeys.length > 0) {
    parts.push(
      "Grilles à administrer ensuite : " +
        summary.nextGridKeys.map(followUpGridLabel).join(" · ")
    );
  }
  return parts.join("\n\n");
}

// ─── Report assembly ────────────────────────────────────────────
//
// Build a daily-report skeleton from a scored administration so
// the user only has to add the session-specific context.

export function buildDailyFromGrid(
  admin: ScorableGridAdministration,
  template: ScorableGridTemplate
): DailyReportSections {
  const summary = generateGridSummary(admin, template);
  const perDomain = summary.perDomain
    .map(
      (d) =>
        `• ${d.domainLabel} — ${d.statusLabel} (${d.acquisitionPct}%): ${d.paragraph}`
    )
    .join("\n");
  return {
    date: admin.date,
    contextSession:
      admin.context ||
      (admin.sessionLabel
        ? `Séance · ${admin.sessionLabel}`
        : "Séance d'évaluation clinique."),
    objectives: `Administration de la grille « ${template.name} ».`,
    observations: [summary.headline, perDomain].filter(Boolean).join("\n\n"),
    reflection: [
      `Forces : ${summary.strengths}`,
      `Difficultés : ${summary.difficulties}`,
    ].join(" "),
    nextSteps: [
      summary.recommendations,
      summary.nextGridKeys.length > 0
        ? `Grilles proposées ensuite : ${summary.nextGridKeys
            .map(followUpGridLabel)
            .join(" · ")}.`
        : "",
    ]
      .filter(Boolean)
      .join(" "),
  };
}

// Build a free-text body suitable for a grid-summary simple report.
export function buildGridSummaryReportBody(
  admin: ScorableGridAdministration,
  template: ScorableGridTemplate
): string {
  const summary = generateGridSummary(admin, template);
  const header = `${template.name}\nDate · ${admin.date}${
    admin.evaluator ? `\nÉvaluateur · ${admin.evaluator}` : ""
  }${admin.context ? `\nContexte · ${admin.context}` : ""}`;
  return [header, renderSummaryAsText(summary)].join("\n\n");
}

// Convenience: a single-line top sentence the UI can show under a
// domain card before the user opens the full summary.
export function domainOneLiner(
  admin: ScorableGridAdministration,
  template: ScorableGridTemplate,
  domainId: string
): string {
  const b = domainBreakdown(admin, template, domainId);
  if (!b) return "";
  if (b.status === "non-suffisamment-observable") {
    const noted = b.counts.A + b.counts.EC + b.counts.NA;
    return `Domaine peu observé (${noted}/${b.total} items cotés).`;
  }
  return `${DOMAIN_STATUS_LABELS[b.status]} · ${b.acquisitionPct}% acquisition · ${b.counts.A} ${CAPABILITY_SCORE_LONG_LABELS.A.toLowerCase()}, ${b.counts.EC} ${CAPABILITY_SCORE_LONG_LABELS.EC.toLowerCase()}, ${b.counts.NA} ${CAPABILITY_SCORE_LONG_LABELS.NA.toLowerCase()}.`;
}
