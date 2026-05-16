// Terminology system — lets clinicians default to "Client", "Patient",
// or "Participant" depending on their context. The setting lives in
// SettingsContext; this module is a pure resolver.

export type ClientTerm = "client" | "patient" | "participant";

export const CLIENT_TERMS: ClientTerm[] = ["client", "patient", "participant"];

export const TERM_LABELS: Record<ClientTerm, string> = {
  client: "Client",
  patient: "Patient",
  participant: "Participant",
};

interface CasingOptions {
  // Capitalise the first letter (default true).
  capitalize?: boolean;
  // Pluralise (basic +s; for "person", an irregular case is not currently
  // exposed in CLIENT_TERMS so the basic rule is fine).
  plural?: boolean;
}

export function resolveTerm(
  pref: ClientTerm | undefined,
  opts: CasingOptions = {}
): string {
  const base = TERM_LABELS[pref ?? "client"] ?? TERM_LABELS.client;
  const word = base + (opts.plural ? "s" : "");
  if (opts.capitalize === false) return word.toLowerCase();
  return word;
}

// Convenience used by UI components: returns a string with the term
// substituted into a template that contains the literal `{client}`.
//
//   t("Add a new {client}", "patient") → "Add a new Patient"
export function t(template: string, pref: ClientTerm | undefined): string {
  return template
    .replace(/\{client\}/g, resolveTerm(pref))
    .replace(/\{clients\}/g, resolveTerm(pref, { plural: true }))
    .replace(/\{client_lc\}/g, resolveTerm(pref, { capitalize: false }))
    .replace(
      /\{clients_lc\}/g,
      resolveTerm(pref, { plural: true, capitalize: false })
    );
}
