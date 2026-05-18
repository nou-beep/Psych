// Final internship report builder — pulls case + profile + scored
// grids + tests + supervision into a FinalReportSections object so
// the user starts editing instead of staring at a blank page.
//
// Rule-based, original French clinical wording. The user can edit
// or regenerate from updated source data at any time.

import { DEFAULT_EVALUATOR } from "./evaluator";
import { DEFAULT_INSTITUTION } from "./institutions";
import {
  domainBreakdown,
  type ScorableGridAdministration,
} from "./scorable-grids";
import { findScorableTemplate } from "./scorable-templates";
import { generateGridSummary } from "./scorable-text";
import {
  generateProfileSummary,
  profileToReportBlock,
} from "./structured-profile-text";
import { generateInterventionParagraph } from "./intervention-chips";
import { TEST_DOMAIN_LABELS, TEST_STATUS_LABELS } from "./types";
import type {
  FinalReportSections,
  InternshipCase,
  InternshipReport,
  InternshipSupervisionNote,
  InternshipTest,
} from "./types";

export interface FinalReportSources {
  caseData: InternshipCase;
  scorableAdmins: ScorableGridAdministration[];
  tests: InternshipTest[];
  supervision: InternshipSupervisionNote[];
  weeklyReports: InternshipReport[];
  dailyReports: InternshipReport[];
}

// Plain count summary the UI uses for the "Generated from N grids,
// M tests…" attribution line.
export interface FinalReportAttribution {
  gridCount: number;
  testCount: number;
  supervisionCount: number;
  weeklyCount: number;
  dailyCount: number;
  profileFilled: boolean;
}

// ─── Section builders ────────────────────────────────────────

function buildCoverPage(c: InternshipCase): string {
  const id = c.identification;
  const lines: string[] = [
    `${DEFAULT_INSTITUTION.academicProgram}`,
    `${DEFAULT_INSTITUTION.university}`,
    "",
    "Rapport de stage clinique",
    "",
    `Stagiaire : ${DEFAULT_EVALUATOR.name}`,
    `Lieu de stage : ${id.internshipPlace ?? DEFAULT_INSTITUTION.name}`,
    `Encadrement académique : ${
      id.supervisor ?? DEFAULT_INSTITUTION.academicSupervisor
    }`,
    `Responsable du Master : ${DEFAULT_INSTITUTION.masterResponsible}`,
    `Code dossier : ${id.caseCode}`,
  ];
  return lines.join("\n");
}

function buildInternshipContext(): string {
  return `${DEFAULT_INSTITUTION.setting} — ${DEFAULT_INSTITUTION.populationDescription}\n\n${DEFAULT_INSTITUTION.teamDescription}`;
}

function buildObservationMethodology(
  sources: FinalReportSources
): string {
  const parts: string[] = [DEFAULT_INSTITUTION.internshipFocus];
  // Roll in the count of structured observation artefacts to anchor
  // the methodology section in what was actually done.
  const counts: string[] = [];
  if (sources.scorableAdmins.length > 0) {
    counts.push(
      `${sources.scorableAdmins.length} grille${
        sources.scorableAdmins.length === 1 ? "" : "s"
      } d'évaluation administrée${sources.scorableAdmins.length === 1 ? "" : "s"}`
    );
  }
  if (sources.tests.length > 0) {
    counts.push(
      `${sources.tests.length} test${
        sources.tests.length === 1 ? "" : "s"
      } planifié${sources.tests.length === 1 ? "" : "s"}/administré${
        sources.tests.length === 1 ? "" : "s"
      }`
    );
  }
  if (sources.dailyReports.length > 0) {
    counts.push(
      `${sources.dailyReports.length} compte${
        sources.dailyReports.length === 1 ? "" : "s"
      }-rendu${sources.dailyReports.length === 1 ? "" : "s"} de séance`
    );
  }
  if (counts.length > 0) {
    parts.push(`Matériel collecté : ${counts.join(" ; ")}.`);
  }
  return parts.join("\n\n");
}

function buildCasePresentation(c: InternshipCase): string {
  const id = c.identification;
  const lines: string[] = [
    `Code dossier : ${id.caseCode}` +
      (id.age ? ` — âge : ${id.age}` : "") +
      (id.setting ? ` — cadre : ${id.setting}` : "") +
      ".",
  ];
  if (id.reasonForFollowUp) {
    lines.push(`Motif de suivi : ${id.reasonForFollowUp}`);
  }
  if (id.diagnosticContext) {
    lines.push(`Contexte diagnostique : ${id.diagnosticContext}`);
  }
  return lines.join("\n\n");
}

function buildEvaluationGridsSection(
  sources: FinalReportSources
): string {
  if (sources.scorableAdmins.length === 0) {
    return "Aucune grille n'a encore été cotée.";
  }
  const blocks: string[] = [];
  for (const admin of sources.scorableAdmins) {
    const tpl = findScorableTemplate(admin.templateId);
    if (!tpl) continue;
    const summary = generateGridSummary(admin, tpl);
    const breakdowns = tpl.domains
      .map((d) => domainBreakdown(admin, tpl, d.id))
      .filter((b): b is NonNullable<typeof b> => Boolean(b));
    const dateLine = `${tpl.name} · ${admin.date}${
      admin.context ? ` · ${admin.context}` : ""
    }`;
    const domainLines = breakdowns
      .map(
        (b) =>
          `  · ${b.domainLabel} — ${
            b.acquisitionPct
          }% acquisition (${b.counts.A} A · ${b.counts.EC} EC · ${
            b.counts.NA
          } NA · ${b.counts.NO} N/O)`
      )
      .join("\n");
    blocks.push(
      `${dateLine}\n${summary.headline}\n${domainLines}`.trim()
    );
  }
  return blocks.join("\n\n");
}

function buildTestsAdministered(sources: FinalReportSources): string {
  if (sources.tests.length === 0) {
    return "Aucun test administré pour cette période.";
  }
  return sources.tests
    .map((t) => {
      const lines: string[] = [
        `${t.name} (${TEST_DOMAIN_LABELS[t.domain]}) — statut : ${
          TEST_STATUS_LABELS[t.status]
        }`,
      ];
      if (t.administrationDate) {
        lines.push(`  Administré le ${t.administrationDate}`);
      }
      if (t.score?.band || t.score?.rawScore) {
        lines.push(
          `  Score : ${[t.score.rawScore, t.score.band]
            .filter(Boolean)
            .join(" · ")}`
        );
      }
      if (t.interpretationNotes) {
        lines.push(`  Interprétation : ${t.interpretationNotes}`);
      }
      return lines.join("\n");
    })
    .join("\n\n");
}

function buildClinicalObservations(
  c: InternshipCase,
  sources: FinalReportSources
): string {
  // Combine the profile per-domain paragraphs with the most-recent
  // grid headline if any.
  const parts: string[] = [];
  const profile = c.context.structuredProfile;
  if (profile) {
    parts.push(profileToReportBlock(profile));
  }
  if (sources.scorableAdmins.length > 0) {
    const latest = sources.scorableAdmins
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    const tpl = findScorableTemplate(latest.templateId);
    if (tpl) {
      const summary = generateGridSummary(latest, tpl);
      parts.push(
        `Dernière grille administrée (${latest.date}) : ${summary.headline}`
      );
    }
  }
  return parts.length > 0
    ? parts.join("\n\n")
    : "Observations cliniques à compléter à partir des séances réalisées.";
}

function buildInterventionSection(sources: FinalReportSources): string {
  // Aggregate all intervention chips ever logged on daily reports.
  const all = new Set<string>();
  for (const r of sources.dailyReports) {
    for (const c of r.daily?.interventionChips ?? []) {
      all.add(c);
    }
  }
  if (all.size === 0) {
    return "Interventions mobilisées à décrire à partir des séances. Documenter les modalités utilisées (étayage, supports visuels, séquençage, régulation sensorielle) et leur effet observé.";
  }
  return generateInterventionParagraph(
    Array.from(all) as import("./intervention-chips").InterventionChip[]
  );
}

function buildProgressEvolution(sources: FinalReportSources): string {
  if (sources.weeklyReports.length === 0) {
    return "Évolution à documenter à partir des synthèses hebdomadaires une fois celles-ci constituées.";
  }
  return sources.weeklyReports
    .slice()
    .sort((a, b) =>
      (a.weekly?.weekStart ?? "").localeCompare(b.weekly?.weekStart ?? "")
    )
    .map((w) => {
      const week = `${w.weekly?.weekStart ?? "?"} → ${
        w.weekly?.weekEnd ?? "?"
      }`;
      const progress = w.weekly?.progressObserved ?? "";
      return `Semaine ${week}\n${progress || "(à compléter)"}`;
    })
    .join("\n\n");
}

function buildSupervisionReflections(
  sources: FinalReportSources
): string {
  if (sources.supervision.length === 0) {
    return "Supervision à intégrer au rapport final une fois les notes de supervision constituées.";
  }
  return sources.supervision
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => {
      const head = `${s.date}${
        s.supervisor ? ` — ${s.supervisor}` : ""
      }`;
      const body = [
        s.feedbackReceived ? `Feedback : ${s.feedbackReceived}` : "",
        s.actionPlan ? `Plan d'action : ${s.actionPlan}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      return body ? `${head}\n${body}` : head;
    })
    .join("\n\n");
}

function buildLimits(): string {
  return "Travail réalisé en contexte de stage avec une période d'observation limitée, sur un petit nombre de séances. Les évaluations s'appuient sur l'observation clinique structurée par grilles propres et sur la supervision ; elles ne se substituent pas à une évaluation diagnostique formalisée. Les conclusions sont à considérer comme des pistes cliniques inscrites dans une démarche de formation supervisée.";
}

function buildRecommendations(c: InternshipCase): string {
  const profile = c.context.structuredProfile;
  if (!profile) {
    return "Recommandations à formuler une fois les axes prioritaires consolidés à partir des grilles et des séances.";
  }
  const summary = generateProfileSummary(profile);
  if (summary.priorityDomains.length === 0) {
    return "Poursuivre l'observation clinique structurée et consolider les acquis dans une logique de généralisation.";
  }
  const recs: string[] = [];
  for (const d of summary.priorityDomains) {
    if (d === "communication") {
      recs.push(
        "Continuer le travail de communication fonctionnelle en variant les modalités (mots, gestes, supports visuels) et les contextes de demande."
      );
    } else if (d === "social") {
      recs.push(
        "Étayer les compétences sociales émergentes (initiation, tour de rôle, attention conjointe) via des activités courtes et structurées."
      );
    } else if (d === "sensory") {
      recs.push(
        "Adapter l'environnement sensoriel et proposer des stratégies de régulation (pression profonde, casque anti-bruit, cocon) en libre accès."
      );
    } else if (d === "behavior") {
      recs.push(
        "Préciser la fonction des comportements observés par analyse ABC et tester des stratégies de remplacement fonctionnelles."
      );
    } else if (d === "attention") {
      recs.push(
        "Travailler l'attention soutenue et la tolérance à l'attente sur des tâches courtes avec renforcement positif."
      );
    } else if (d === "autonomy") {
      recs.push(
        "Structurer les routines d'autonomie (repas, toilettes, transitions) avec supports visuels et étayage progressif."
      );
    } else if (d === "motor") {
      recs.push(
        "Mettre en place un travail graphomoteur progressif et un repérage spatial structuré, sous supervision."
      );
    }
  }
  return recs.join("\n\n");
}

function buildConclusion(c: InternshipCase, sources: FinalReportSources): string {
  const profile = c.context.structuredProfile;
  const headline = profile
    ? generateProfileSummary(profile).headline
    : "Le tableau clinique observé sera consolidé une fois le profil structuré renseigné.";
  return `${headline} Le suivi se poursuivra en articulation avec l'équipe pluridisciplinaire et la supervision. Les prochaines évaluations cibleront les axes mis en évidence par les grilles déjà administrées (${sources.scorableAdmins.length}) et permettront de mesurer l'évolution sur les domaines prioritaires.`;
}

// ─── Public API ──────────────────────────────────────────────

export function buildFinalReport(
  sources: FinalReportSources
): { sections: FinalReportSections; attribution: FinalReportAttribution } {
  const sections: FinalReportSections = {
    coverPage: buildCoverPage(sources.caseData),
    internshipContext: buildInternshipContext(),
    casePresentation: buildCasePresentation(sources.caseData),
    observationMethodology: buildObservationMethodology(sources),
    testsAdministered: buildTestsAdministered(sources),
    evaluationGrids: buildEvaluationGridsSection(sources),
    clinicalObservations: buildClinicalObservations(
      sources.caseData,
      sources
    ),
    interventionReflection: buildInterventionSection(sources),
    progressEvolution: buildProgressEvolution(sources),
    supervisionReflections: buildSupervisionReflections(sources),
    limits: buildLimits(),
    recommendations: buildRecommendations(sources.caseData),
    conclusion: buildConclusion(sources.caseData, sources),
  };
  const attribution: FinalReportAttribution = {
    gridCount: sources.scorableAdmins.length,
    testCount: sources.tests.length,
    supervisionCount: sources.supervision.length,
    weeklyCount: sources.weeklyReports.length,
    dailyCount: sources.dailyReports.length,
    profileFilled: Boolean(sources.caseData.context.structuredProfile),
  };
  return { sections, attribution };
}

// Render the attribution as a single human-friendly line.
export function attributionLine(a: FinalReportAttribution): string {
  const bits: string[] = [];
  if (a.profileFilled) bits.push("profil structuré");
  if (a.gridCount > 0)
    bits.push(`${a.gridCount} grille${a.gridCount === 1 ? "" : "s"}`);
  if (a.testCount > 0)
    bits.push(`${a.testCount} test${a.testCount === 1 ? "" : "s"}`);
  if (a.supervisionCount > 0)
    bits.push(
      `${a.supervisionCount} supervision${a.supervisionCount === 1 ? "" : "s"}`
    );
  if (a.dailyCount > 0)
    bits.push(`${a.dailyCount} séance${a.dailyCount === 1 ? "" : "s"}`);
  if (a.weeklyCount > 0)
    bits.push(`${a.weeklyCount} synthèse${a.weeklyCount === 1 ? "" : "s"}`);
  return bits.length === 0
    ? "Aucune source matérielle disponible — sections générées à partir des valeurs par défaut."
    : `Généré à partir de : ${bits.join(" · ")}.`;
}
