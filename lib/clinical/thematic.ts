// Transcript + Thematic Analysis — pure code & theme model.
// The transcripts page can use these helpers to annotate excerpts,
// build a code-frequency view, and export a thematic table.

import { generateId, nowISO } from "@/lib/store";

export interface ThematicCode {
  id: string;
  label: string;
  color?: string;
  parentThemeId?: string;
  description?: string;
}

export interface ThematicTheme {
  id: string;
  label: string;
  color?: string;
  description?: string;
  codeIds: string[];
}

export interface ThematicExcerpt {
  id: string;
  transcriptId: string;
  participantId?: string;
  // Character offsets into the transcript content.
  start: number;
  end: number;
  text: string;
  codeIds: string[];
  emotionalTags: string[]; // free-text emotional labels
  symptomTags: string[]; // free-text symptom labels
  supervisionFlagged: boolean;
  note?: string;
  createdAt: string;
}

export const THEMATIC_STORAGE_KEY = "psych-thematic-v1";

export interface ThematicProject {
  codes: ThematicCode[];
  themes: ThematicTheme[];
  excerpts: ThematicExcerpt[];
}

export function emptyProject(): ThematicProject {
  return { codes: [], themes: [], excerpts: [] };
}

// ─── Code / theme CRUD ──────────────────────────────────────────

export function addCode(
  project: ThematicProject,
  label: string,
  opts: { color?: string; parentThemeId?: string; description?: string } = {}
): ThematicProject {
  const code: ThematicCode = {
    id: generateId(),
    label: label.trim(),
    color: opts.color,
    parentThemeId: opts.parentThemeId,
    description: opts.description,
  };
  return { ...project, codes: [...project.codes, code] };
}

export function removeCode(
  project: ThematicProject,
  codeId: string
): ThematicProject {
  return {
    ...project,
    codes: project.codes.filter((c) => c.id !== codeId),
    themes: project.themes.map((t) => ({
      ...t,
      codeIds: t.codeIds.filter((id) => id !== codeId),
    })),
    excerpts: project.excerpts.map((e) => ({
      ...e,
      codeIds: e.codeIds.filter((id) => id !== codeId),
    })),
  };
}

export function addTheme(
  project: ThematicProject,
  label: string,
  opts: { color?: string; description?: string; codeIds?: string[] } = {}
): ThematicProject {
  const theme: ThematicTheme = {
    id: generateId(),
    label: label.trim(),
    color: opts.color,
    description: opts.description,
    codeIds: opts.codeIds ?? [],
  };
  return { ...project, themes: [...project.themes, theme] };
}

export function assignCodeToTheme(
  project: ThematicProject,
  codeId: string,
  themeId: string
): ThematicProject {
  return {
    ...project,
    codes: project.codes.map((c) =>
      c.id === codeId ? { ...c, parentThemeId: themeId } : c
    ),
    themes: project.themes.map((t) =>
      t.id === themeId
        ? {
            ...t,
            codeIds: t.codeIds.includes(codeId) ? t.codeIds : [...t.codeIds, codeId],
          }
        : { ...t, codeIds: t.codeIds.filter((id) => id !== codeId) }
    ),
  };
}

// ─── Excerpt operations ─────────────────────────────────────────

export function addExcerpt(
  project: ThematicProject,
  data: Omit<ThematicExcerpt, "id" | "createdAt">
): ThematicProject {
  const excerpt: ThematicExcerpt = {
    ...data,
    id: generateId(),
    createdAt: nowISO(),
  };
  return { ...project, excerpts: [excerpt, ...project.excerpts] };
}

export function removeExcerpt(
  project: ThematicProject,
  excerptId: string
): ThematicProject {
  return {
    ...project,
    excerpts: project.excerpts.filter((e) => e.id !== excerptId),
  };
}

export function toggleSupervisionFlag(
  project: ThematicProject,
  excerptId: string
): ThematicProject {
  return {
    ...project,
    excerpts: project.excerpts.map((e) =>
      e.id === excerptId ? { ...e, supervisionFlagged: !e.supervisionFlagged } : e
    ),
  };
}

export function toggleCodeOnExcerpt(
  project: ThematicProject,
  excerptId: string,
  codeId: string
): ThematicProject {
  return {
    ...project,
    excerpts: project.excerpts.map((e) =>
      e.id === excerptId
        ? {
            ...e,
            codeIds: e.codeIds.includes(codeId)
              ? e.codeIds.filter((c) => c !== codeId)
              : [...e.codeIds, codeId],
          }
        : e
    ),
  };
}

// ─── Analysis ───────────────────────────────────────────────────

export interface CodeFrequencyRow {
  codeId: string;
  label: string;
  count: number;
  percent: number;
}

export function codeFrequency(project: ThematicProject): CodeFrequencyRow[] {
  const counts = new Map<string, number>();
  for (const e of project.excerpts) {
    for (const cid of e.codeIds) counts.set(cid, (counts.get(cid) ?? 0) + 1);
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;
  const rows: CodeFrequencyRow[] = [];
  for (const code of project.codes) {
    const c = counts.get(code.id) ?? 0;
    if (c === 0) continue;
    rows.push({
      codeId: code.id,
      label: code.label,
      count: c,
      percent: Math.round((c / total) * 1000) / 10,
    });
  }
  return rows.sort((a, b) => b.count - a.count);
}

export interface ThematicTableRow {
  themeId: string;
  themeLabel: string;
  codes: Array<{ label: string; count: number }>;
  excerptCount: number;
  representativeQuote?: string;
}

export function thematicTable(project: ThematicProject): ThematicTableRow[] {
  return project.themes.map((theme) => {
    const codesInTheme = project.codes.filter((c) => theme.codeIds.includes(c.id));
    const codeRows = codesInTheme.map((code) => {
      const count = project.excerpts.filter((e) => e.codeIds.includes(code.id)).length;
      return { label: code.label, count };
    });
    const excerpts = project.excerpts.filter((e) =>
      e.codeIds.some((cid) => theme.codeIds.includes(cid))
    );
    return {
      themeId: theme.id,
      themeLabel: theme.label,
      codes: codeRows,
      excerptCount: excerpts.length,
      representativeQuote: excerpts[0]?.text,
    };
  });
}

// Extract quotes filtered by emotional / symptom tag.
export function quotesByTag(
  project: ThematicProject,
  opts: { emotional?: string; symptom?: string }
): ThematicExcerpt[] {
  return project.excerpts.filter((e) => {
    if (opts.emotional && !e.emotionalTags.includes(opts.emotional)) return false;
    if (opts.symptom && !e.symptomTags.includes(opts.symptom)) return false;
    return true;
  });
}
