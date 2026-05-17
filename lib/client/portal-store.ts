// localStorage keys + small persistence helpers for the client portal.
// The persistence layer in lib/store.ts already handles SSR and quota
// gracefully — these are convenience wrappers with stable key names.

export const CLIENT_STORE_KEYS = {
  PORTAL_PREF: "psych-portal-preference-v1",
  CLIENT_STATE: "psych-client-state-v1",
  CHECK_INS: "psych-client-checkins-v1",
  WEATHER_HISTORY: "psych-client-weather-history-v1",
  COMFORT_OBJECTS: "psych-client-comfort-v1",
  SAFE_PEOPLE: "psych-client-safe-people-v1",
  JOURNEY_PROGRESS: "psych-client-journey-progress-v1",
  FAVOURITE_CARDS: "psych-client-favourite-cards-v1",
  EXPRESSION_CANVASES: "psych-client-expression-v1",
  WORKBOOK_PROGRESS: "psych-client-workbook-progress-v1",
  CLIENT_AUDIO: "psych-client-audio-v1",
} as const;

export type PortalPreference = "therapist" | "client" | null;

export function readPortalPreference(): PortalPreference {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CLIENT_STORE_KEYS.PORTAL_PREF);
    if (v === "therapist" || v === "client") return v;
    return null;
  } catch {
    return null;
  }
}

export function setPortalPreference(pref: PortalPreference): void {
  if (typeof window === "undefined") return;
  try {
    if (pref === null) {
      window.localStorage.removeItem(CLIENT_STORE_KEYS.PORTAL_PREF);
    } else {
      window.localStorage.setItem(CLIENT_STORE_KEYS.PORTAL_PREF, pref);
    }
  } catch {
    // ignore
  }
}

// Returns the default home path for a portal preference. Used by the
// welcome screen and any "switch portal" actions.
export function homePathForPortal(pref: PortalPreference): string {
  if (pref === "client") return "/client";
  if (pref === "therapist") return "/";
  return "/welcome";
}
