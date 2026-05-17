// Split view state + persistence.
//
// The UI primitive (`<SplitView>`) consumes this. Splits are saved
// per top-level route family so the user can land back in their last
// workspace arrangement.

import { loadFromStorage, saveToStorage } from "@/lib/store";

export type SplitOrientation = "horizontal" | "vertical";

export interface SplitPane {
  // The route or registered pane id displayed in this pane.
  target: string;
  // 0-100, percent of the split this pane takes.
  size: number;
}

export interface SplitConfig {
  orientation: SplitOrientation;
  panes: SplitPane[];
  // ID of the pane currently focused (for keyboard shortcuts).
  focusedIndex: number;
}

export const SPLIT_VIEW_STORAGE_KEY = "psych-split-view-v1";

export function defaultConfig(): SplitConfig {
  return {
    orientation: "horizontal",
    panes: [{ target: "primary", size: 100 }],
    focusedIndex: 0,
  };
}

export function isSplit(config: SplitConfig): boolean {
  return config.panes.length > 1;
}

export function addPane(
  config: SplitConfig,
  target: string,
  orientation?: SplitOrientation
): SplitConfig {
  if (config.panes.length >= 3) return config; // cap at 3 panes
  const newOrientation = orientation ?? config.orientation;
  const equalSize = Math.floor(100 / (config.panes.length + 1));
  const remainder = 100 - equalSize * config.panes.length;
  const resized = config.panes.map((p) => ({ ...p, size: equalSize }));
  return {
    orientation: newOrientation,
    panes: [...resized, { target, size: remainder }],
    focusedIndex: config.panes.length,
  };
}

export function removePane(
  config: SplitConfig,
  index: number
): SplitConfig {
  if (config.panes.length <= 1) return config;
  if (index < 0 || index >= config.panes.length) return config;
  const remaining = config.panes.filter((_, i) => i !== index);
  const total = remaining.reduce((s, p) => s + p.size, 0) || 1;
  const normalized = remaining.map((p) => ({
    ...p,
    size: Math.round((p.size / total) * 100),
  }));
  // Fix rounding so total = 100.
  const drift = 100 - normalized.reduce((s, p) => s + p.size, 0);
  if (normalized.length > 0) normalized[0].size += drift;
  return {
    orientation: config.orientation,
    panes: normalized,
    focusedIndex: Math.min(config.focusedIndex, normalized.length - 1),
  };
}

export function resizePane(
  config: SplitConfig,
  index: number,
  newSize: number
): SplitConfig {
  if (index < 0 || index >= config.panes.length) return config;
  // Adjust by stealing from the next pane.
  const next = (index + 1) % config.panes.length;
  if (next === index) return config;
  const total = config.panes[index].size + config.panes[next].size;
  const clamped = Math.max(10, Math.min(total - 10, newSize));
  return {
    ...config,
    panes: config.panes.map((p, i) => {
      if (i === index) return { ...p, size: clamped };
      if (i === next) return { ...p, size: total - clamped };
      return p;
    }),
  };
}

export function swapPanes(
  config: SplitConfig,
  a: number,
  b: number
): SplitConfig {
  if (a === b) return config;
  if (a < 0 || b < 0 || a >= config.panes.length || b >= config.panes.length)
    return config;
  const panes = [...config.panes];
  [panes[a], panes[b]] = [panes[b], panes[a]];
  return { ...config, panes };
}

export function setOrientation(
  config: SplitConfig,
  orientation: SplitOrientation
): SplitConfig {
  return { ...config, orientation };
}

export function setFocused(config: SplitConfig, index: number): SplitConfig {
  if (index < 0 || index >= config.panes.length) return config;
  return { ...config, focusedIndex: index };
}

export function loadConfig(scope: string): SplitConfig {
  const all = loadFromStorage<Record<string, SplitConfig>>(
    SPLIT_VIEW_STORAGE_KEY,
    {}
  );
  if (all && typeof all === "object" && all[scope]) return all[scope];
  return defaultConfig();
}

export function saveConfig(scope: string, config: SplitConfig): void {
  const all = loadFromStorage<Record<string, SplitConfig>>(
    SPLIT_VIEW_STORAGE_KEY,
    {}
  );
  saveToStorage(SPLIT_VIEW_STORAGE_KEY, { ...all, [scope]: config });
}

// ─── Pane registry ────────────────────────────────────────────
// Registered pane targets the SplitView UI can render. The host page
// supplies a renderer for "primary" plus any pane targets it offers.

export interface PaneTarget {
  id: string;
  label: string;
  // A short hint shown in the pane picker, e.g. "Show timeline".
  description?: string;
}

export const COMMON_PANE_TARGETS: PaneTarget[] = [
  { id: "primary", label: "Primary view" },
  { id: "timeline", label: "Timeline", description: "Case timeline" },
  { id: "references", label: "References", description: "Linked literature" },
  { id: "quotes", label: "Quote bank", description: "Extracted quotes" },
  { id: "coding-wall", label: "Coding wall", description: "Thematic codes" },
  { id: "assessments", label: "Assessments" },
  { id: "audio", label: "Audio player" },
  { id: "session-notes", label: "Session notes" },
  { id: "body-map", label: "Body map" },
  { id: "prep-notes", label: "Prep notes" },
  { id: "apa-builder", label: "APA builder" },
];

export function findPaneTarget(id: string): PaneTarget | undefined {
  return COMMON_PANE_TARGETS.find((p) => p.id === id);
}
