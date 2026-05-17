// Mock authentication — no real backend. Stores a session shape in
// localStorage so the gateway / login / portal-switch flows can be wired
// without changing the rest of the architecture later.

import { loadFromStorage, saveToStorage } from "@/lib/store";

export type Portal = "therapist" | "client";

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
  if (v.portal !== "therapist" && v.portal !== "client") return false;
  if (typeof v.email !== "string" || v.email.length === 0) return false;
  if (typeof v.signedInAt !== "string") return false;
  return true;
}

// Returns the route a user should land on after they sign in.
export function homePathFor(portal: Portal): string {
  return portal === "client" ? "/client" : "/therapist";
}

// Returns the route a user should be sent to if no session for that portal.
export function loginPathFor(portal: Portal): string {
  return portal === "client" ? "/login/client" : "/login/therapist";
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

// Returns the portal that owns a route, or null for public routes.
export function portalForRoute(pathname: string): Portal | null {
  if (isPublicRoute(pathname)) return null;
  if (pathname === "/client" || pathname.startsWith("/client/")) return "client";
  // Everything else is the therapist workspace.
  return "therapist";
}
