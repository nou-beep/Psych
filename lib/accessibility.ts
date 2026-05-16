// Accessibility & Sensory Safe Mode — settings shape, defaults, and
// a derive helper that turns the settings into a stable set of CSS
// class names. The class names are applied on a wrapper element.

export interface AccessibilitySettings {
  reducedMotion: boolean;
  mutedColors: boolean;
  largerText: boolean;
  highContrast: boolean;
  lowStimulation: boolean;
  simplifiedLayout: boolean;
  disableSparkles: boolean;
  softerContrast: boolean;
  focusOutlines: boolean;
  sensorySafeMode: boolean;
}

export const ACCESSIBILITY_STORAGE_KEY = "psych-accessibility-v1";

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  reducedMotion: false,
  mutedColors: false,
  largerText: false,
  highContrast: false,
  lowStimulation: false,
  simplifiedLayout: false,
  disableSparkles: false,
  softerContrast: false,
  focusOutlines: true,
  sensorySafeMode: false,
};

// Sensory Safe Mode is a "preset" — turning it on flips several
// individual flags at once. Turning it off restores the previous
// values when possible, but as a pure helper we just expose the
// preset shape.
export const SENSORY_SAFE_PRESET: Partial<AccessibilitySettings> = {
  reducedMotion: true,
  mutedColors: true,
  lowStimulation: true,
  disableSparkles: true,
  softerContrast: true,
  sensorySafeMode: true,
};

export function applySensorySafeMode(
  current: AccessibilitySettings,
  on: boolean
): AccessibilitySettings {
  if (on) {
    return { ...current, ...SENSORY_SAFE_PRESET };
  }
  // When turning off, only flip the flag itself — leave other prefs alone.
  return { ...current, sensorySafeMode: false };
}

export function mergeAccessibility(
  partial: Partial<AccessibilitySettings> | null | undefined
): AccessibilitySettings {
  return { ...DEFAULT_ACCESSIBILITY, ...(partial ?? {}) };
}

// Returns class names that the UI should apply to the <body> or root.
// Caller is responsible for the actual CSS that implements each class.
export function accessibilityClasses(
  settings: AccessibilitySettings
): string[] {
  const out: string[] = [];
  if (settings.reducedMotion) out.push("a11y-reduced-motion");
  if (settings.mutedColors) out.push("a11y-muted-colors");
  if (settings.largerText) out.push("a11y-larger-text");
  if (settings.highContrast) out.push("a11y-high-contrast");
  if (settings.lowStimulation) out.push("a11y-low-stim");
  if (settings.simplifiedLayout) out.push("a11y-simplified");
  if (settings.disableSparkles) out.push("a11y-no-sparkles");
  if (settings.softerContrast) out.push("a11y-soft-contrast");
  if (settings.focusOutlines) out.push("a11y-focus-outlines");
  if (settings.sensorySafeMode) out.push("a11y-sensory-safe");
  return out;
}
