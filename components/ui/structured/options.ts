// Standard option dictionaries shared across the app.
//
// Use these everywhere a clinical workflow needs frequency,
// intensity, support level, context, response quality,
// acquisition, or clinical-confidence selectors. Centralised so
// every surface speaks the same language.

export type Frequency =
  | "jamais"
  | "rarement"
  | "parfois"
  | "souvent"
  | "tres-souvent";

export const FREQUENCY_OPTIONS: Array<{ value: Frequency; label: string }> = [
  { value: "jamais", label: "Jamais" },
  { value: "rarement", label: "Rarement" },
  { value: "parfois", label: "Parfois" },
  { value: "souvent", label: "Souvent" },
  { value: "tres-souvent", label: "Très souvent" },
];

export type Intensity =
  | "faible"
  | "moderee"
  | "elevee"
  | "tres-elevee";

export const INTENSITY_OPTIONS: Array<{ value: Intensity; label: string }> = [
  { value: "faible", label: "Faible" },
  { value: "moderee", label: "Modérée" },
  { value: "elevee", label: "Élevée" },
  { value: "tres-elevee", label: "Très élevée" },
];

export type SupportLevel =
  | "sans-aide"
  | "aide-gestuelle"
  | "aide-verbale"
  | "guidance-physique-partielle"
  | "guidance-physique-totale";

export const SUPPORT_LEVEL_OPTIONS: Array<{ value: SupportLevel; label: string }> = [
  { value: "sans-aide", label: "Sans aide" },
  { value: "aide-gestuelle", label: "Aide gestuelle" },
  { value: "aide-verbale", label: "Aide verbale" },
  { value: "guidance-physique-partielle", label: "Guidance physique partielle" },
  { value: "guidance-physique-totale", label: "Guidance physique totale" },
];

export type Acquisition =
  | "acquis"
  | "en-cours"
  | "non-acquis"
  | "non-observe";

export const ACQUISITION_OPTIONS: Array<{ value: Acquisition; label: string }> = [
  { value: "acquis", label: "Acquis" },
  { value: "en-cours", label: "En cours" },
  { value: "non-acquis", label: "Non acquis" },
  { value: "non-observe", label: "Non observé" },
];

export type ClinicalConfidence =
  | "a-explorer"
  | "faible"
  | "moderee"
  | "elevee";

export const CLINICAL_CONFIDENCE_OPTIONS: Array<{
  value: ClinicalConfidence;
  label: string;
}> = [
  { value: "a-explorer", label: "À explorer" },
  { value: "faible", label: "Faible" },
  { value: "moderee", label: "Modérée" },
  { value: "elevee", label: "Élevée" },
];

export type ClinicalContext =
  | "atelier-individuel"
  | "activite-structuree"
  | "jeu-libre"
  | "groupe"
  | "transition"
  | "repas"
  | "recreation"
  | "entretien"
  | "observation"
  | "supervision"
  | "domicile"
  | "ecole"
  | "association";

export const CONTEXT_OPTIONS: Array<{ value: ClinicalContext; label: string }> = [
  { value: "atelier-individuel", label: "Atelier individuel" },
  { value: "activite-structuree", label: "Activité structurée" },
  { value: "jeu-libre", label: "Jeu libre" },
  { value: "groupe", label: "Groupe" },
  { value: "transition", label: "Transition" },
  { value: "repas", label: "Repas" },
  { value: "recreation", label: "Récréation" },
  { value: "entretien", label: "Entretien" },
  { value: "observation", label: "Observation" },
  { value: "supervision", label: "Supervision" },
  { value: "domicile", label: "Domicile" },
  { value: "ecole", label: "École" },
  { value: "association", label: "Association" },
];

export type ResponseQuality =
  | "absente"
  | "instable"
  | "partielle"
  | "adaptee"
  | "generalisee";

export const RESPONSE_QUALITY_OPTIONS: Array<{
  value: ResponseQuality;
  label: string;
}> = [
  { value: "absente", label: "Absente" },
  { value: "instable", label: "Instable" },
  { value: "partielle", label: "Partielle" },
  { value: "adaptee", label: "Adaptée" },
  { value: "generalisee", label: "Généralisée" },
];

// Quick lookup helpers — turn a value back into its display label.
export function labelOf<T extends string>(
  options: ReadonlyArray<{ value: T; label: string }>,
  value: T | undefined
): string {
  if (!value) return "";
  return options.find((o) => o.value === value)?.label ?? value;
}
