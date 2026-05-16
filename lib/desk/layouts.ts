// Case Desktop — rearrangeable / collapsible panel layouts per case.
// The therapist can rearrange panels, collapse them, pin widgets, and
// switch between named presets. Pure data shape; the UI persists.

import { generateId, nowISO } from "@/lib/store";

export type PanelKind =
  | "timeline"
  | "body-map"
  | "thought-web"
  | "assessments"
  | "symptom-graphs"
  | "session-recap"
  | "quote-fragments"
  | "sticky-notes"
  | "quick-notes"
  | "therapy-needs"
  | "hypotheses"
  | "reports-in-progress"
  | "transcript-excerpts"
  | "workbook-completion"
  | "assigned-interventions"
  | "supervision-reminders"
  | "session-prep"
  | "open-threads";

export const PANEL_LABELS: Record<PanelKind, string> = {
  timeline: "Timeline",
  "body-map": "Body map",
  "thought-web": "Thought web",
  assessments: "Assessments",
  "symptom-graphs": "Symptom graphs",
  "session-recap": "Session recap",
  "quote-fragments": "Quote fragments",
  "sticky-notes": "Sticky notes",
  "quick-notes": "Quick notes",
  "therapy-needs": "Therapy needs",
  hypotheses: "Hypotheses",
  "reports-in-progress": "Reports in progress",
  "transcript-excerpts": "Transcript excerpts",
  "workbook-completion": "Workbook completion",
  "assigned-interventions": "Assigned interventions",
  "supervision-reminders": "Supervision reminders",
  "session-prep": "Session prep",
  "open-threads": "Open threads",
};

export type PanelSize = "sm" | "md" | "lg";

export interface DesktopPanel {
  id: string;
  kind: PanelKind;
  size: PanelSize;
  collapsed: boolean;
  pinned: boolean;
  order: number;
}

export interface DesktopLayout {
  id: string;
  // Layouts are either case-scoped (caseId set) or global presets (caseId undefined).
  caseId?: string;
  name: string;
  presetId?: string; // identifies a built-in preset this layout descends from
  panels: DesktopPanel[];
  createdAt: string;
  updatedAt: string;
}

export const DESKTOP_LAYOUTS_STORAGE_KEY = "psych-desk-layouts-v1";
export const DESKTOP_ACTIVE_LAYOUT_KEY = "psych-desk-active-layout-v1";

// ─── Built-in presets ──────────────────────────────────────────

interface PresetSpec {
  id: string;
  name: string;
  description: string;
  panels: Array<{ kind: PanelKind; size: PanelSize }>;
}

export const LAYOUT_PRESETS: PresetSpec[] = [
  {
    id: "session-prep",
    name: "Session Prep",
    description: "Last session + session prep + assigned work + therapy needs",
    panels: [
      { kind: "session-recap", size: "lg" },
      { kind: "session-prep", size: "md" },
      { kind: "therapy-needs", size: "md" },
      { kind: "assigned-interventions", size: "sm" },
      { kind: "workbook-completion", size: "sm" },
    ],
  },
  {
    id: "assessment-review",
    name: "Assessment Review",
    description: "Symptom trajectory + assessment scores + body-map heatmap",
    panels: [
      { kind: "symptom-graphs", size: "lg" },
      { kind: "assessments", size: "md" },
      { kind: "body-map", size: "md" },
      { kind: "hypotheses", size: "sm" },
    ],
  },
  {
    id: "timeline-focus",
    name: "Timeline Focus",
    description: "Wide timeline + symptom graphs + open threads",
    panels: [
      { kind: "timeline", size: "lg" },
      { kind: "symptom-graphs", size: "md" },
      { kind: "open-threads", size: "md" },
    ],
  },
  {
    id: "research-view",
    name: "Research View",
    description: "Transcript excerpts + thought web + quote fragments",
    panels: [
      { kind: "transcript-excerpts", size: "lg" },
      { kind: "thought-web", size: "md" },
      { kind: "quote-fragments", size: "md" },
      { kind: "open-threads", size: "sm" },
    ],
  },
  {
    id: "thesis-coding",
    name: "Thesis Coding",
    description: "Transcript excerpts + quote fragments + sticky observations",
    panels: [
      { kind: "transcript-excerpts", size: "lg" },
      { kind: "quote-fragments", size: "md" },
      { kind: "sticky-notes", size: "md" },
    ],
  },
  {
    id: "report-writing",
    name: "Report Writing",
    description: "Reports in progress + last session + therapy needs",
    panels: [
      { kind: "reports-in-progress", size: "lg" },
      { kind: "session-recap", size: "md" },
      { kind: "therapy-needs", size: "md" },
      { kind: "quick-notes", size: "sm" },
    ],
  },
  {
    id: "supervision-review",
    name: "Supervision Review",
    description: "Supervision reminders + hypotheses + open threads",
    panels: [
      { kind: "supervision-reminders", size: "lg" },
      { kind: "hypotheses", size: "md" },
      { kind: "open-threads", size: "md" },
      { kind: "session-recap", size: "sm" },
    ],
  },
];

export function fromPreset(
  preset: PresetSpec,
  caseId?: string
): DesktopLayout {
  const now = nowISO();
  return {
    id: generateId(),
    caseId,
    name: preset.name,
    presetId: preset.id,
    panels: preset.panels.map((p, i) => ({
      id: generateId(),
      kind: p.kind,
      size: p.size,
      collapsed: false,
      pinned: false,
      order: i,
    })),
    createdAt: now,
    updatedAt: now,
  };
}

export function findPreset(id: string): PresetSpec | undefined {
  return LAYOUT_PRESETS.find((p) => p.id === id);
}

// ─── Mutations (pure) ──────────────────────────────────────────

export function addPanel(
  layout: DesktopLayout,
  kind: PanelKind,
  opts: { size?: PanelSize } = {}
): DesktopLayout {
  if (layout.panels.some((p) => p.kind === kind)) return layout;
  return {
    ...layout,
    updatedAt: nowISO(),
    panels: [
      ...layout.panels,
      {
        id: generateId(),
        kind,
        size: opts.size ?? "md",
        collapsed: false,
        pinned: false,
        order: layout.panels.length,
      },
    ],
  };
}

export function removePanel(
  layout: DesktopLayout,
  panelId: string
): DesktopLayout {
  return {
    ...layout,
    updatedAt: nowISO(),
    panels: layout.panels
      .filter((p) => p.id !== panelId)
      .map((p, i) => ({ ...p, order: i })),
  };
}

export function reorderPanels(
  layout: DesktopLayout,
  fromIndex: number,
  toIndex: number
): DesktopLayout {
  if (fromIndex === toIndex) return layout;
  if (fromIndex < 0 || fromIndex >= layout.panels.length) return layout;
  if (toIndex < 0 || toIndex >= layout.panels.length) return layout;
  const next = [...layout.panels];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return {
    ...layout,
    updatedAt: nowISO(),
    panels: next.map((p, i) => ({ ...p, order: i })),
  };
}

export function patchPanel(
  layout: DesktopLayout,
  panelId: string,
  patch: Partial<Pick<DesktopPanel, "size" | "collapsed" | "pinned">>
): DesktopLayout {
  return {
    ...layout,
    updatedAt: nowISO(),
    panels: layout.panels.map((p) =>
      p.id === panelId ? { ...p, ...patch } : p
    ),
  };
}

export function duplicateLayout(
  layout: DesktopLayout,
  newName?: string
): DesktopLayout {
  const now = nowISO();
  return {
    ...layout,
    id: generateId(),
    name: newName ?? `${layout.name} (copy)`,
    presetId: undefined, // a copy isn't tied to its parent preset
    panels: layout.panels.map((p) => ({ ...p, id: generateId() })),
    createdAt: now,
    updatedAt: now,
  };
}

// Pinned panels always render first, then the rest by their `order`.
export function visiblePanels(layout: DesktopLayout): DesktopPanel[] {
  return [...layout.panels].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.order - b.order;
  });
}
