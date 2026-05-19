// Mock authentication — no real backend. Stores a session shape in
// localStorage so the gateway / login / portal-switch flows can be wired
// without changing the rest of the architecture later.

import { loadFromStorage, saveToStorage } from "@/lib/store";

export type Portal = "formation" | "therapist" | "client";

export interface Session {
  portal: Portal;
  email: string;
  signedInAt: string;
}

export const SESSION_STORAGE_KEY = "psych-session-v1";

export function readSession(): Session | null {
  const value = loadFromStorage<Session | null>(SESSION_STORAGE_KEY, null);
  return isValidSession(value) ? value : null;
}

export function writeSession(s: Session | null): void {
  if (s === null) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    return;
  }
  saveToStorage(SESSION_STORAGE_KEY, s);
}

export function isValidSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.portal !== "therapist" && v.portal !== "client" && v.portal !== "formation")
    return false;
  if (typeof v.email !== "string" || v.email.length === 0) return false;
  if (typeof v.signedInAt !== "string") return false;
  return true;
}

// Returns the route a user should land on after they sign in.
export function homePathFor(portal: Portal): string {
  if (portal === "client") return "/client";
  if (portal === "formation") return "/formation";
  return "/therapist";
}

// Returns the route a user should be sent to if no session for that portal.
export function loginPathFor(portal: Portal): string {
  if (portal === "client") return "/login/client";
  if (portal === "formation") return "/login/formation";
  return "/login/therapist";
}

// Routes that must NOT require an auth session: the gateway, the legacy
// welcome redirect, and any login screen.
export function isPublicRoute(pathname: string): boolean {
  if (!pathname) return true;
  if (pathname === "/") return true;
  if (pathname.startsWith("/welcome")) return true;
  if (pathname.startsWith("/login")) return true;
  return false;
}

// Route prefixes that belong to the Formation Portal. Single source
// of truth for sidebar selection, dashboard ownership, and chrome
// decisions. After the Formation cleanup pass, Formation work lives
// physically under /formation/* — the legacy /thesis, /internship,
// /research, /supervision, /grids, /transcripts, /material paths are
// permanent redirects defined in next.config.mjs. The legacy
// prefixes are still listed here so that during the redirect hop
// (or in unit tests asserting old paths) the portal resolves
// consistently.
const FORMATION_PREFIXES = [
  "/formation",
  // Legacy aliases — redirected by next.config.mjs.
  "/thesis",
  "/internship",
  "/research",
  "/transcripts",
  "/supervision",
  "/grids",
  "/material",
];

function startsWithPrefix(pathname: string, prefix: string): boolean {
  if (pathname === prefix) return true;
  return pathname.startsWith(prefix + "/");
}

// Returns the portal that owns a route, or null for public routes.
export function portalForRoute(pathname: string): Portal | null {
  if (isPublicRoute(pathname)) return null;
  if (startsWithPrefix(pathname, "/client")) return "client";
  for (const prefix of FORMATION_PREFIXES) {
    if (startsWithPrefix(pathname, prefix)) return "formation";
  }
  // Everything else is the therapist workspace.
  return "therapist";
}
