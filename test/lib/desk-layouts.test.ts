import { describe, it, expect } from "vitest";
import {
  LAYOUT_PRESETS,
  PANEL_LABELS,
  addPanel,
  duplicateLayout,
  findPreset,
  fromPreset,
  patchPanel,
  removePanel,
  reorderPanels,
  visiblePanels,
} from "@/lib/desk/layouts";

describe("desk layouts", () => {
  it("every panel kind has a human label", () => {
    for (const preset of LAYOUT_PRESETS) {
      for (const p of preset.panels) {
        expect(PANEL_LABELS[p.kind]).toBeTruthy();
      }
    }
  });

  it("ships the user-requested preset set", () => {
    const ids = LAYOUT_PRESETS.map((p) => p.id);
    for (const expected of [
      "session-prep",
      "assessment-review",
      "timeline-focus",
      "research-view",
      "thesis-coding",
      "report-writing",
      "supervision-review",
    ]) {
      expect(ids).toContain(expected);
    }
  });

  it("fromPreset materialises a layout with sequential order", () => {
    const layout = fromPreset(LAYOUT_PRESETS[0], "case-1");
    expect(layout.caseId).toBe("case-1");
    expect(layout.presetId).toBe(LAYOUT_PRESETS[0].id);
    expect(layout.panels.map((p) => p.order)).toEqual(
      layout.panels.map((_, i) => i)
    );
  });

  it("addPanel dedupes by panel kind", () => {
    let layout = fromPreset(LAYOUT_PRESETS[0]);
    layout = addPanel(layout, layout.panels[0].kind);
    expect(layout.panels.filter((p) => p.kind === layout.panels[0].kind)).toHaveLength(1);
  });

  it("removePanel reindexes order", () => {
    const layout = fromPreset(LAYOUT_PRESETS[2]);
    const target = layout.panels[1];
    const next = removePanel(layout, target.id);
    expect(next.panels.find((p) => p.id === target.id)).toBeUndefined();
    expect(next.panels.map((p) => p.order)).toEqual(
      next.panels.map((_, i) => i)
    );
  });

  it("reorderPanels moves a panel and reindexes", () => {
    const layout = fromPreset(LAYOUT_PRESETS[1]);
    const before = layout.panels.map((p) => p.kind);
    const next = reorderPanels(layout, 0, 2);
    expect(next.panels.map((p) => p.kind)).toEqual([
      before[1],
      before[2],
      before[0],
      ...before.slice(3),
    ]);
    expect(next.panels.map((p) => p.order)).toEqual(
      next.panels.map((_, i) => i)
    );
  });

  it("patchPanel updates collapsed / pinned / size", () => {
    const layout = fromPreset(LAYOUT_PRESETS[0]);
    const target = layout.panels[0];
    const next = patchPanel(layout, target.id, { collapsed: true, pinned: true });
    const updated = next.panels.find((p) => p.id === target.id)!;
    expect(updated.collapsed).toBe(true);
    expect(updated.pinned).toBe(true);
  });

  it("duplicateLayout produces a clean copy with new ids", () => {
    const layout = fromPreset(LAYOUT_PRESETS[0]);
    const copy = duplicateLayout(layout, "My copy");
    expect(copy.id).not.toBe(layout.id);
    expect(copy.name).toBe("My copy");
    expect(copy.presetId).toBeUndefined();
    const oldIds = new Set(layout.panels.map((p) => p.id));
    for (const p of copy.panels) expect(oldIds.has(p.id)).toBe(false);
  });

  it("visiblePanels surfaces pinned panels first then order", () => {
    let layout = fromPreset(LAYOUT_PRESETS[1]);
    // Pin panel #2 — it should jump to the top of the visible list.
    const target = layout.panels[2];
    layout = patchPanel(layout, target.id, { pinned: true });
    expect(visiblePanels(layout)[0].id).toBe(target.id);
  });

  it("findPreset returns by id or undefined", () => {
    expect(findPreset("session-prep")?.name).toBe("Session Prep");
    expect(findPreset("nope")).toBeUndefined();
  });
});
