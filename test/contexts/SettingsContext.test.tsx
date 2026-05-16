import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import {
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY,
} from "@/lib/accessibility";

function wrapper({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

async function renderSettings() {
  const view = renderHook(() => useSettings(), { wrapper });
  await waitFor(() => expect(view.result.current).toBeTruthy());
  return view;
}

describe("SettingsContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("hydrates with defaults on first mount", async () => {
    const { result } = await renderSettings();
    expect(result.current.accessibility).toEqual(DEFAULT_ACCESSIBILITY);
  });

  it("hydrates partial stored values on top of defaults", async () => {
    window.localStorage.setItem(
      ACCESSIBILITY_STORAGE_KEY,
      JSON.stringify({ largerText: true })
    );
    const { result } = await renderSettings();
    expect(result.current.accessibility.largerText).toBe(true);
    expect(result.current.accessibility.focusOutlines).toBe(true);
  });

  it("updateAccessibility patches and persists", async () => {
    const { result } = await renderSettings();
    act(() => {
      result.current.updateAccessibility({ highContrast: true });
    });
    expect(result.current.accessibility.highContrast).toBe(true);
    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY) || "{}"
      );
      expect(stored.highContrast).toBe(true);
    });
  });

  it("toggleSensorySafe applies the preset on, and only flips its flag off", async () => {
    const { result } = await renderSettings();
    act(() => {
      result.current.toggleSensorySafe(true);
    });
    expect(result.current.accessibility.sensorySafeMode).toBe(true);
    expect(result.current.accessibility.reducedMotion).toBe(true);
    expect(result.current.accessibility.disableSparkles).toBe(true);

    act(() => {
      result.current.toggleSensorySafe(false);
    });
    expect(result.current.accessibility.sensorySafeMode).toBe(false);
    // Other prefs remain on, so a user keeps their preferred sub-settings.
    expect(result.current.accessibility.reducedMotion).toBe(true);
  });

  it("resetAccessibility returns to defaults", async () => {
    const { result } = await renderSettings();
    act(() => {
      result.current.updateAccessibility({ largerText: true, highContrast: true });
    });
    expect(result.current.accessibility.largerText).toBe(true);
    act(() => {
      result.current.resetAccessibility();
    });
    expect(result.current.accessibility).toEqual(DEFAULT_ACCESSIBILITY);
  });
});
