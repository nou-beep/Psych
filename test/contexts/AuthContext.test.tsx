import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SESSION_STORAGE_KEY } from "@/lib/auth";

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

async function renderAuth() {
  const view = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(view.result.current.ready).toBe(true));
  return view;
}

describe("AuthContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("hydrates with no session and ready=true", async () => {
    const { result } = await renderAuth();
    expect(result.current.session).toBeNull();
  });

  it("signIn stores a session and persists it", async () => {
    const { result } = await renderAuth();
    act(() => {
      result.current.signIn("client", "client@example.com");
    });
    expect(result.current.session?.portal).toBe("client");
    expect(result.current.session?.email).toBe("client@example.com");
    await waitFor(() => {
      const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
      expect(raw).not.toBeNull();
    });
  });

  it("signOut clears state and storage", async () => {
    const { result } = await renderAuth();
    act(() => {
      result.current.signIn("therapist", "t@example.com");
    });
    act(() => {
      result.current.signOut();
    });
    expect(result.current.session).toBeNull();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("switchPortal updates the active portal", async () => {
    const { result } = await renderAuth();
    act(() => {
      result.current.signIn("therapist", "x@example.com");
    });
    act(() => {
      result.current.switchPortal("client");
    });
    expect(result.current.session?.portal).toBe("client");
  });

  it("signIn falls back to a placeholder email when blank", async () => {
    const { result } = await renderAuth();
    act(() => {
      result.current.signIn("therapist", "");
    });
    expect(result.current.session?.email).toBe("user@example.com");
  });
});
