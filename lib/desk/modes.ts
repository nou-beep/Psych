// Live workspace modes — subtle, workflow-aware UI shifts. NOT a redesign.
// Each mode flips a few feature flags the UI reads (sidebar collapsed,
// reduced density, focused panel set, etc.).

export type WorkspaceMode =
  | "default"
  | "session"
  | "writing"
  | "research"
  | "review"
  | "supervision";

export interface ModeMeta {
  id: WorkspaceMode;
  label: string;
  description: string;
  // Cosmetic / behavioural flags the UI consumes.
  flags: {
    // Collapses the sidebar to icons only so the writing surface gets more room.
    collapseSidebar: boolean;
    // Adds a "focus" class to the main element that reduces vertical paddings.
    denseLayout: boolean;
    // Hides decorative ambient elements (sparkles, orbs).
    quietChrome: boolean;
    // Suggested layout preset id (when on a case desktop).
    suggestedPresetId?: string;
  };
}

export const MODES: ModeMeta[] = [
  {
    id: "default",
    label: "Default",
    description: "Normal workspace.",
    flags: { collapseSidebar: false, denseLayout: false, quietChrome: false },
  },
  {
    id: "session",
    label: "Session",
    description: "Minimal distractions; quick-access panels.",
    flags: {
      collapseSidebar: false,
      denseLayout: false,
      quietChrome: true,
      suggestedPresetId: "session-prep",
    },
  },
  {
    id: "writing",
    label: "Writing",
    description: "Document-focused; calm layout.",
    flags: {
      collapseSidebar: true,
      denseLayout: false,
      quietChrome: true,
      suggestedPresetId: "report-writing",
    },
  },
  {
    id: "research",
    label: "Research",
    description: "Denser information; coding tools.",
    flags: {
      collapseSidebar: false,
      denseLayout: true,
      quietChrome: false,
      suggestedPresetId: "research-view",
    },
  },
  {
    id: "review",
    label: "Review",
    description: "Timelines and longitudinal views.",
    flags: {
      collapseSidebar: false,
      denseLayout: false,
      quietChrome: false,
      suggestedPresetId: "timeline-focus",
    },
  },
  {
    id: "supervision",
    label: "Supervision",
    description: "Unresolved threads and questions.",
    flags: {
      collapseSidebar: false,
      denseLayout: false,
      quietChrome: false,
      suggestedPresetId: "supervision-review",
    },
  },
];

export const MODE_STORAGE_KEY = "psych-workspace-mode-v1";

export function findMode(id: string): ModeMeta | undefined {
  return MODES.find((m) => m.id === id);
}

// Returns the CSS class names the UI should put on a wrapper element
// for the given mode. Keeping this pure lets us test it without DOM.
export function modeClassNames(mode: WorkspaceMode): string[] {
  const meta = findMode(mode);
  if (!meta) return [];
  const out: string[] = [`workspace-mode-${meta.id}`];
  if (meta.flags.collapseSidebar) out.push("workspace-collapse-sidebar");
  if (meta.flags.denseLayout) out.push("workspace-dense");
  if (meta.flags.quietChrome) out.push("workspace-quiet");
  return out;
}
