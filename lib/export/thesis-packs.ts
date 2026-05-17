// Thesis Export Packs — composition layer that decides what goes into
// each export. Pure data: the UI renders the pack as printable HTML.
//
// We do NOT generate PDFs server-side. The exported view is a styled
// printable page; the user prints to PDF from the browser (consistent
// with the rest of Eyla's print system).

export type ExportPackId =
  | "methodology"
  | "literature-review"
  | "participant-summary"
  | "descriptive-statistics"
  | "coding-summary"
  | "quote-collection"
  | "thesis-chapter"
  | "appendix"
  | "supervisor-review"
  | "progress-summary";

export interface ExportPackDefinition {
  id: ExportPackId;
  label: string;
  description: string;
  includes: string[]; // what data sections the pack pulls in
  apaFormatting: boolean;
  tocSupported: boolean;
}

export const EXPORT_PACKS: ExportPackDefinition[] = [
  {
    id: "methodology",
    label: "Methodology export",
    description:
      "Echantillon, instruments, procédure, hypothèses, variables, plan d'analyse, critères d'inclusion/exclusion, biais, considérations éthiques.",
    includes: [
      "research-design",
      "methodology-sections",
      "hypotheses",
      "variables",
      "analysis-plan",
    ],
    apaFormatting: true,
    tocSupported: true,
  },
  {
    id: "literature-review",
    label: "Literature review export",
    description:
      "Synthèse de la littérature pertinente, organisée par thème ou par chapitre.",
    includes: ["literature", "themes", "linked-chapters"],
    apaFormatting: true,
    tocSupported: true,
  },
  {
    id: "participant-summary",
    label: "Participant summary export",
    description:
      "Résumés anonymisés des participants, codes, thèmes émergents, statut de codage.",
    includes: ["participants", "themes", "coding-status"],
    apaFormatting: false,
    tocSupported: true,
  },
  {
    id: "descriptive-statistics",
    label: "Descriptive statistics export",
    description:
      "Moyennes, écarts-types, min/max, corrélations, résultats de régression — tableaux APA-style.",
    includes: ["descriptives", "correlations", "regression"],
    apaFormatting: true,
    tocSupported: false,
  },
  {
    id: "coding-summary",
    label: "Coding summary export",
    description:
      "Résumé du codage thématique : thèmes, sous-thèmes, fréquences, extraits illustratifs.",
    includes: ["themes", "excerpts", "participants"],
    apaFormatting: false,
    tocSupported: true,
  },
  {
    id: "quote-collection",
    label: "Quote collection export",
    description:
      "Recueil de citations classées par thème ou par participant.",
    includes: ["quotes", "linked-themes", "linked-chapters"],
    apaFormatting: false,
    tocSupported: false,
  },
  {
    id: "thesis-chapter",
    label: "Thesis chapter export",
    description:
      "Un chapitre choisi, avec ses sections, sa pagination, et ses citations.",
    includes: ["chapter-sections", "citations", "footnotes"],
    apaFormatting: true,
    tocSupported: true,
  },
  {
    id: "appendix",
    label: "Appendix export",
    description: "Tableaux, figures, instruments, transcripts en annexe.",
    includes: ["tables", "figures", "instruments"],
    apaFormatting: true,
    tocSupported: true,
  },
  {
    id: "supervisor-review",
    label: "Supervisor review pack",
    description:
      "Bundle pour la supervision : progression, questions ouvertes, captures et hypothèses à discuter.",
    includes: [
      "progress",
      "open-questions",
      "supervision-captures",
      "hypotheses",
    ],
    apaFormatting: false,
    tocSupported: true,
  },
  {
    id: "progress-summary",
    label: "Progress summary pack",
    description:
      "État d'avancement par chapitre, échéances, mots écrits, références collectées.",
    includes: ["chapter-progress", "deadlines", "word-counts", "references"],
    apaFormatting: false,
    tocSupported: false,
  },
];

export function findPack(id: string): ExportPackDefinition | undefined {
  return EXPORT_PACKS.find((p) => p.id === id);
}

// ─── Pack composition input/output ─────────────────────────────

export interface PackSection {
  id: string;
  heading: string;
  // Pre-rendered HTML or markdown — the UI decides which to use.
  // We keep this as plain text + structured rows so the export view
  // can format it.
  body?: string;
  rows?: PackRow[];
  // Sub-sections.
  children?: PackSection[];
}

export interface PackRow {
  label: string;
  value: string;
  note?: string;
}

export interface ComposedPack {
  pack: ExportPackDefinition;
  documentTitle: string;
  authorLine?: string;
  generatedAt: string;
  sections: PackSection[];
  // Bibliography entries (already APA-formatted strings) — when the
  // pack supports references.
  bibliography?: string[];
}

export function emptyComposed(
  pack: ExportPackDefinition,
  documentTitle: string,
  authorLine?: string
): ComposedPack {
  return {
    pack,
    documentTitle,
    authorLine,
    generatedAt: new Date().toISOString(),
    sections: [],
  };
}

export function addSection(
  pack: ComposedPack,
  section: PackSection
): ComposedPack {
  return { ...pack, sections: [...pack.sections, section] };
}

export function totalWordCount(pack: ComposedPack): number {
  function count(s: PackSection): number {
    const fromBody = (s.body ?? "").trim().split(/\s+/).filter(Boolean).length;
    const fromRows = (s.rows ?? []).reduce(
      (acc, r) =>
        acc + (r.value ?? "").trim().split(/\s+/).filter(Boolean).length,
      0
    );
    const fromKids = (s.children ?? []).reduce(
      (acc, c) => acc + count(c),
      0
    );
    return fromBody + fromRows + fromKids;
  }
  return pack.sections.reduce((acc, s) => acc + count(s), 0);
}

export function tableOfContents(
  pack: ComposedPack
): Array<{ id: string; heading: string; depth: number }> {
  if (!pack.pack.tocSupported) return [];
  const out: Array<{ id: string; heading: string; depth: number }> = [];
  function walk(s: PackSection, depth: number) {
    out.push({ id: s.id, heading: s.heading, depth });
    for (const c of s.children ?? []) walk(c, depth + 1);
  }
  for (const s of pack.sections) walk(s, 0);
  return out;
}
