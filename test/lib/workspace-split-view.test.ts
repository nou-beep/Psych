import { describe, it, expect } from "vitest";
import {
  addPane,
  defaultConfig,
  findPaneTarget,
  isSplit,
  removePane,
  resizePane,
  setFocused,
  setOrientation,
  swapPanes,
} from "@/lib/workspace/split-view";

describe("split-view config", () => {
  it("default config has a single 100% primary pane", () => {
    const c = defaultConfig();
    expect(c.panes).toHaveLength(1);
    expect(c.panes[0].target).toBe("primary");
    expect(c.panes[0].size).toBe(100);
    expect(isSplit(c)).toBe(false);
  });

  it("adds a second pane, balancing sizes", () => {
    let c = defaultConfig();
    c = addPane(c, "timeline");
    expect(c.panes).toHaveLength(2);
    const total = c.panes.reduce((s, p) => s + p.size, 0);
    expect(total).toBe(100);
    expect(c.focusedIndex).toBe(1);
    expect(isSplit(c)).toBe(true);
  });

  it("caps at three panes", () => {
    let c = defaultConfig();
    c = addPane(c, "timeline");
    c = addPane(c, "references");
    c = addPane(c, "audio"); // should be ignored
    expect(c.panes).toHaveLength(3);
  });

  it("removes a pane and normalizes sizes back to 100", () => {
    let c = defaultConfig();
    c = addPane(c, "timeline");
    c = addPane(c, "references");
    c = removePane(c, 1);
    expect(c.panes).toHaveLength(2);
    const total = c.panes.reduce((s, p) => s + p.size, 0);
    expect(total).toBe(100);
  });

  it("does not remove the last pane", () => {
    const c = defaultConfig();
    const after = removePane(c, 0);
    expect(after.panes).toHaveLength(1);
  });

  it("resizes panes by stealing from the next pane", () => {
    let c = defaultConfig();
    c = addPane(c, "timeline");
    c = resizePane(c, 0, 70);
    const total = c.panes.reduce((s, p) => s + p.size, 0);
    expect(total).toBe(100);
    expect(c.panes[0].size).toBe(70);
    expect(c.panes[1].size).toBe(30);
  });

  it("resize clamps min 10 / max total-10", () => {
    let c = defaultConfig();
    c = addPane(c, "timeline");
    c = resizePane(c, 0, 5); // below min
    expect(c.panes[0].size).toBe(10);
    c = resizePane(c, 0, 999); // above max
    expect(c.panes[0].size).toBe(90);
  });

  it("swaps panes", () => {
    let c = defaultConfig();
    c = addPane(c, "timeline");
    const before = c.panes[0].target;
    c = swapPanes(c, 0, 1);
    expect(c.panes[1].target).toBe(before);
  });

  it("toggles orientation and focus", () => {
    let c = defaultConfig();
    c = addPane(c, "timeline");
    c = setOrientation(c, "vertical");
    expect(c.orientation).toBe("vertical");
    c = setFocused(c, 0);
    expect(c.focusedIndex).toBe(0);
  });

  it("findPaneTarget returns a registered target", () => {
    expect(findPaneTarget("timeline")?.label).toBe("Timeline");
    expect(findPaneTarget("nope")).toBeUndefined();
  });
});
