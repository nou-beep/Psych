// Default institutional context for the Internship Studio — the
// real-world setting the studio was built to support. Lives as a
// constant so the seed, the report templates, and any "fill from
// internship report" affordance all read from one place. Can be
// overridden later via localStorage if the user moves to another
// internship site.

import { loadFromStorage, saveToStorage } from "@/lib/store";

export interface InternshipInstitution {
  // Display name of the internship site.
  name: string;
  // Setting label used on case identification (e.g. "École / Association").
  setting: string;
  // Academic context.
  academicProgram: string;
  university: string;
  // People.
  academicSupervisor: string;
  masterResponsible: string;
  // One-paragraph free description of the multidisciplinary team —
  // used when the report template asks for institutional context.
  teamDescription: string;
  // Population description (used as a default value for new cases
  // and in the final-report institutional context section).
  populationDescription: string;
  // What the internship is about, kept as a short paragraph for
  // the "missions réalisées" / introduction sections.
  internshipFocus: string;
}

export const DEFAULT_INSTITUTION: InternshipInstitution = {
  name: "Association À Petit Pas",
  setting: "École Rihani / Association À Petit Pas",
  academicProgram: "Master en Psychologie Clinique et Psychothérapie",
  university: "Université Ibn Tofail",
  academicSupervisor: "Professeur Docteur Salim Gassim",
  masterResponsible: "Professeur Docteur Nabil Abdessamad",
  teamDescription:
    "Équipe multidisciplinaire associant éducateurs, psychomotriciens, orthophonistes, kinésithérapeutes, psychologues et autres professionnels intervenant en synergie autour de l'enfant.",
  populationDescription:
    "Enfants présentant un trouble du spectre de l'autisme, des troubles du développement, des difficultés d'apprentissage et des besoins spécifiques, accueillis en contexte éducatif et thérapeutique adapté.",
  internshipFocus:
    "Observation clinique, communication, interaction sociale, autonomie, fonctionnement sensoriel et comportemental, activités éducatives structurées, et réflexion clinique supervisée.",
};

export const INTERNSHIP_INSTITUTION_STORAGE_KEY =
  "psych-internship-institution-v1";

export function loadInstitution(): InternshipInstitution {
  const stored = loadFromStorage<InternshipInstitution | null>(
    INTERNSHIP_INSTITUTION_STORAGE_KEY,
    null
  );
  if (stored && typeof stored.name === "string" && stored.name.trim()) {
    return { ...DEFAULT_INSTITUTION, ...stored };
  }
  return DEFAULT_INSTITUTION;
}

export function saveInstitution(institution: InternshipInstitution): void {
  saveToStorage(INTERNSHIP_INSTITUTION_STORAGE_KEY, institution);
}

// Convenient one-line label for headers.
export function institutionShortLabel(
  institution: InternshipInstitution = DEFAULT_INSTITUTION
): string {
  return `${institution.name} · ${institution.academicProgram} (${institution.university})`;
}
