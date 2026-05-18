// Final internship report template — section scaffolding only.
//
// Section labels follow the standard structure of a French master's
// internship report (intro, lieu de stage, méthodologie, étude de
// cas, conclusion, bibliographie). The placeholder paragraphs are
// neutral starter prompts the clinician edits in their own voice —
// no content is copied from any specific report.

import { DEFAULT_INSTITUTION } from "./institutions";
import { DEFAULT_EVALUATOR } from "./evaluator";

export interface FinalReportSectionTemplate {
  // Stable id used by the report editor + assembly helpers.
  id: string;
  // Display label (FR).
  label: string;
  // Whether the section is part of the main body (vs front/back matter).
  kind: "front" | "body" | "back";
  // Neutral starter text the user replaces. Empty string when the
  // section is purely structural (e.g. liste des figures).
  placeholder?: string;
}

export const FINAL_REPORT_SECTIONS: FinalReportSectionTemplate[] = [
  // ─── Front matter ────────────────────────────────────────────
  {
    id: "remerciements",
    label: "Remerciements",
    kind: "front",
    placeholder:
      "Remercier les personnes ayant accompagné le stage : encadrants académiques, équipe d'accueil, familles et enfants suivis (dans le respect de l'anonymat).",
  },
  {
    id: "liste-figures",
    label: "Liste des figures",
    kind: "front",
  },
  {
    id: "liste-abreviations",
    label: "Liste des abréviations",
    kind: "front",
  },

  // ─── Body ────────────────────────────────────────────────────
  {
    id: "introduction",
    label: "Introduction",
    kind: "body",
    placeholder:
      "Présenter brièvement le cadre du stage, l'institution d'accueil et le projet clinique. Annoncer le plan du rapport.",
  },
  {
    id: "lieu-de-stage",
    label: "Présentation du lieu de stage",
    kind: "body",
    placeholder: `Décrire l'institution d'accueil (${DEFAULT_INSTITUTION.setting}), sa mission, son public et son fonctionnement quotidien. Présenter l'équipe pluridisciplinaire.`,
  },
  {
    id: "cadre-theorique",
    label: "Cadre théorique",
    kind: "body",
    placeholder:
      "Situer les notions cliniques mobilisées (TSA, communication fonctionnelle, particularités sensorielles, accompagnement éducatif). Citer les références consultées.",
  },
  {
    id: "methodologie",
    label: "Méthodologie",
    kind: "body",
    placeholder:
      "Décrire les modalités d'observation, l'usage des grilles structurées, les contextes d'évaluation et la place de la supervision dans l'analyse clinique.",
  },
  {
    id: "missions-realisees",
    label: "Missions réalisées",
    kind: "body",
    placeholder:
      "Énumérer les missions du stage : observation clinique, accompagnement individuel et de groupe, participation aux ateliers, supervision, rédaction des comptes-rendus.",
  },
  {
    id: "presentation-cas",
    label: "Étude de cas clinique — Présentation du cas",
    kind: "body",
    placeholder:
      "Présenter le cas de manière anonymisée (code dossier seulement). Décrire l'âge, le contexte de suivi, le motif d'accompagnement et la consigne d'anonymat.",
  },
  {
    id: "symptomes-observes",
    label: "Symptômes observés",
    kind: "body",
    placeholder:
      "Rapporter les observations cliniques organisées par domaine (communication, interaction sociale, comportement, profil sensoriel, autonomie, motricité, attention).",
  },
  {
    id: "hypothese-clinique",
    label: "Hypothèse clinique",
    kind: "body",
    placeholder:
      "Formuler l'hypothèse clinique à partir des observations structurées et des grilles administrées. Articuler les axes prioritaires.",
  },
  {
    id: "demarche-clinique",
    label: "Démarche clinique",
    kind: "body",
    placeholder:
      "Décrire la démarche d'évaluation, les grilles utilisées, l'ordre d'administration et la lecture clinique des résultats.",
  },
  {
    id: "intervention-pistes",
    label: "Intervention et pistes thérapeutiques",
    kind: "body",
    placeholder:
      "Présenter les pistes d'accompagnement proposées, leur articulation aux observations, et les ajustements en séance.",
  },
  {
    id: "evolution-reflexion",
    label: "Évolution et réflexion personnelle",
    kind: "body",
    placeholder:
      "Décrire l'évolution observée pendant le stage et la réflexion clinique personnelle issue de l'accompagnement et de la supervision.",
  },
  {
    id: "conclusion-perspectives",
    label: "Conclusion et perspectives",
    kind: "body",
    placeholder:
      "Conclure sur les apports cliniques du stage, les limites, et les perspectives pour la suite (suite de l'accompagnement, prochaines évaluations, axes d'approfondissement).",
  },

  // ─── Back matter ─────────────────────────────────────────────
  {
    id: "bibliographie",
    label: "Bibliographie",
    kind: "back",
  },
  {
    id: "annexes",
    label: "Annexes",
    kind: "back",
    placeholder:
      "Inclure les grilles administrées (versions imprimables) et tout matériel complémentaire pertinent.",
  },
];

// Compose the final report's `final` sections object from the
// template + a default institutional context so the report renders
// something coherent on first creation.
export function defaultFinalReportInitial() {
  return {
    coverPage: `${DEFAULT_INSTITUTION.academicProgram}\n${DEFAULT_INSTITUTION.university}\n\nRapport de stage clinique\n\nStagiaire : ${DEFAULT_EVALUATOR.name}\nLieu de stage : ${DEFAULT_INSTITUTION.name}\nEncadrement académique : ${DEFAULT_INSTITUTION.academicSupervisor}\nResponsable du Master : ${DEFAULT_INSTITUTION.masterResponsible}`,
    internshipContext: `${DEFAULT_INSTITUTION.setting} — ${DEFAULT_INSTITUTION.populationDescription}\n\n${DEFAULT_INSTITUTION.teamDescription}`,
    observationMethodology: DEFAULT_INSTITUTION.internshipFocus,
  };
}
