"use client";
// Mock auth state shared across the app. No real backend. Any
// credentials work — the gateway records who claimed which portal so
// the rest of the UI can branch on it.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  homePathFor,
  loginPathFor,
  readSession,
  writeSession,
  type Portal,
  type Session,
} from "@/lib/auth";

interface AuthContextValue {
  session: Session | null;
  ready: boolean; // turns true after the first hydration so guards don't redirect prematurely
  signIn: (portal: Portal, email: string) => Session;
  signOut: () => void;
  switchPortal: (portal: Portal) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(readSession());
    setReady(true);
  }, []);

  const signIn = useCallback((portal: Portal, email: string): Session => {
    const s: Session = {
      portal,
      email: email.trim() || "user@example.com",
      signedInAt: new Date().toISOString(),
    };
    setSession(s);
    writeSession(s);
    return s;
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    writeSession(null);
  }, []);

  const switchPortal = useCallback((portal: Portal) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next: Session = { ...prev, portal };
      writeSession(next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, ready, signIn, signOut, switchPortal }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// Re-export helpers so consumers only need to import from one place.
export { homePathFor, loginPathFor };
