import { describe, it, expect, beforeEach } from "vitest";
import {
  CLIENT_STORE_KEYS,
  homePathForPortal,
  readPortalPreference,
  setPortalPreference,
} from "@/lib/client/portal-store";

describe("portal preference", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns null when nothing is stored", () => {
    expect(readPortalPreference()).toBeNull();
  });

  it("round-trips valid values", () => {
    setPortalPreference("client");
    expect(readPortalPreference()).toBe("client");
    setPortalPreference("therapist");
    expect(readPortalPreference()).toBe("therapist");
    setPortalPreference("formation");
    expect(readPortalPreference()).toBe("formation");
  });

  it("setting null removes the key", () => {
    setPortalPreference("client");
    setPortalPreference(null);
    expect(
      window.localStorage.getItem(CLIENT_STORE_KEYS.PORTAL_PREF)
    ).toBeNull();
  });

  it("ignores unrecognised values when reading", () => {
    window.localStorage.setItem(CLIENT_STORE_KEYS.PORTAL_PREF, "bogus");
    expect(readPortalPreference()).toBeNull();
  });
});

describe("homePathForPortal", () => {
  it("maps each portal to its home", () => {
    expect(homePathForPortal("client")).toBe("/client");
    expect(homePathForPortal("therapist")).toBe("/therapist");
    expect(homePathForPortal("formation")).toBe("/formation");
    expect(homePathForPortal(null)).toBe("/");
  });
});
