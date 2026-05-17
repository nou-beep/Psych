import { describe, it, expect } from "vitest";
import {
  DEFAULT_ACCESSIBILITY,
  applySensorySafeMode,
  mergeAccessibility,
  accessibilityClasses,
} from "@/lib/accessibility";

describe("DEFAULT_ACCESSIBILITY", () => {
  it("starts with sensible defaults", () => {
    expect(DEFAULT_ACCESSIBILITY.reducedMotion).toBe(false);
    expect(DEFAULT_ACCESSIBILITY.focusOutlines).toBe(true);
    expect(DEFAULT_ACCESSIBILITY.sensorySafeMode).toBe(false);
  });
});

describe("mergeAccessibility", () => {
  it("returns defaults for null or undefined", () => {
    expect(mergeAccessibility(null)).toEqual(DEFAULT_ACCESSIBILITY);
    expect(mergeAccessibility(undefined)).toEqual(DEFAULT_ACCESSIBILITY);
  });
  it("layers partial values on top of defaults", () => {
    const merged = mergeAccessibility({ largerText: true });
    expect(merged.largerText).toBe(true);
    expect(merged.reducedMotion).toBe(false);
  });
});

describe("applySensorySafeMode", () => {
  it("enabling flips the sensory-safe preset", () => {
    const next = applySensorySafeMode(DEFAULT_ACCESSIBILITY, true);
    expect(next.sensorySafeMode).toBe(true);
    expect(next.reducedMotion).toBe(true);
    expect(next.mutedColors).toBe(true);
    expect(next.lowStimulation).toBe(true);
    expect(next.disableSparkles).toBe(true);
    expect(next.softerContrast).toBe(true);
  });

  it("disabling only flips the sensory-safe flag itself", () => {
    const on = applySensorySafeMode(DEFAULT_ACCESSIBILITY, true);
    const off = applySensorySafeMode(on, false);
    expect(off.sensorySafeMode).toBe(false);
    // The other flags should remain unchanged from the on state, so the
    // user can keep individual preferences when toggling preset off.
    expect(off.reducedMotion).toBe(true);
    expect(off.mutedColors).toBe(true);
  });
});

describe("accessibilityClasses", () => {
  it("returns class names per active flag", () => {
    const classes = accessibilityClasses({
      ...DEFAULT_ACCESSIBILITY,
      reducedMotion: true,
      largerText: true,
    });
    expect(classes).toContain("a11y-reduced-motion");
    expect(classes).toContain("a11y-larger-text");
    expect(classes).toContain("a11y-focus-outlines");
  });

  it("returns empty when nothing is on (except focus outlines default)", () => {
    const classes = accessibilityClasses({
      ...DEFAULT_ACCESSIBILITY,
      focusOutlines: false,
    });
    expect(classes).toEqual([]);
  });

  it("includes a11y-sensory-safe when sensory-safe is on", () => {
    const next = applySensorySafeMode(DEFAULT_ACCESSIBILITY, true);
    expect(accessibilityClasses(next)).toContain("a11y-sensory-safe");
  });
});
