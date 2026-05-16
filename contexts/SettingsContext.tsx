"use client";
// Accessibility / sensory-safe settings persisted to localStorage.
// Kept separate from AppContext so we don't bloat the case-data provider.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { loadFromStorage, saveToStorage } from "@/lib/store";
import {
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY,
  applySensorySafeMode,
  mergeAccessibility,
  type AccessibilitySettings,
} from "@/lib/accessibility";

interface SettingsContextType {
  accessibility: AccessibilitySettings;
  updateAccessibility: (patch: Partial<AccessibilitySettings>) => void;
  toggleSensorySafe: (on: boolean) => void;
  resetAccessibility: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(
    DEFAULT_ACCESSIBILITY
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage<Partial<AccessibilitySettings> | null>(
      ACCESSIBILITY_STORAGE_KEY,
      null
    );
    setAccessibility(mergeAccessibility(stored));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveToStorage(ACCESSIBILITY_STORAGE_KEY, accessibility);
  }, [accessibility, ready]);

  const updateAccessibility = useCallback(
    (patch: Partial<AccessibilitySettings>) => {
      setAccessibility((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const toggleSensorySafe = useCallback((on: boolean) => {
    setAccessibility((prev) => applySensorySafeMode(prev, on));
  }, []);

  const resetAccessibility = useCallback(() => {
    setAccessibility(DEFAULT_ACCESSIBILITY);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        accessibility,
        updateAccessibility,
        toggleSensorySafe,
        resetAccessibility,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
