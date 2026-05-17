import { describe, it, expect, beforeEach } from "vitest";
import {
  SESSION_STORAGE_KEY,
  homePathFor,
  isPublicRoute,
  isValidSession,
  loginPathFor,
  portalForRoute,
  readSession,
  writeSession,
  type Session,
} from "@/lib/auth";

const TEST_SESSION: Session = {
  portal: "therapist",
  email: "test@example.com",
  signedInAt: "2026-01-01T00:00:00Z",
};

describe("auth — session round-trip", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns null when nothing is stored", () => {
    expect(readSession()).toBeNull();
  });

  it("writes and reads a session", () => {
    writeSession(TEST_SESSION);
    expect(readSession()).toEqual(TEST_SESSION);
  });

  it("writeSession(null) clears storage", () => {
    writeSession(TEST_SESSION);
    writeSession(null);
    expect(readSession()).toBeNull();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("readSession discards malformed values", () => {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ portal: "wrong" }));
    expect(readSession()).toBeNull();
  });
});

describe("isValidSession", () => {
  it("rejects non-objects", () => {
    expect(isValidSession(null)).toBe(false);
    expect(isValidSession("x")).toBe(false);
    expect(isValidSession(42)).toBe(false);
  });
  it("rejects unknown portals", () => {
    expect(
      isValidSession({ portal: "ghost", email: "a@b.com", signedInAt: "x" })
    ).toBe(false);
  });
  it("requires email and signedInAt", () => {
    expect(
      isValidSession({ portal: "therapist", email: "", signedInAt: "x" })
    ).toBe(false);
    expect(
      isValidSession({ portal: "therapist", email: "a@b.com", signedInAt: 1 })
    ).toBe(false);
  });
  it("accepts well-formed sessions", () => {
    expect(isValidSession(TEST_SESSION)).toBe(true);
  });
});

describe("route helpers", () => {
  it("homePathFor / loginPathFor map portal to expected paths", () => {
    expect(homePathFor("therapist")).toBe("/therapist");
    expect(homePathFor("client")).toBe("/client");
    expect(loginPathFor("therapist")).toBe("/login/therapist");
    expect(loginPathFor("client")).toBe("/login/client");
  });

  it("isPublicRoute covers gateway, welcome, and login", () => {
    expect(isPublicRoute("/")).toBe(true);
    expect(isPublicRoute("/welcome")).toBe(true);
    expect(isPublicRoute("/login/therapist")).toBe(true);
    expect(isPublicRoute("/login/client")).toBe(true);
    expect(isPublicRoute("/therapist")).toBe(false);
    expect(isPublicRoute("/cases")).toBe(false);
  });

  it("portalForRoute returns the owning portal", () => {
    expect(portalForRoute("/")).toBeNull();
    expect(portalForRoute("/welcome")).toBeNull();
    expect(portalForRoute("/client")).toBe("client");
    expect(portalForRoute("/client/workbooks")).toBe("client");
    expect(portalForRoute("/therapist")).toBe("therapist");
    expect(portalForRoute("/cases")).toBe("therapist");
    expect(portalForRoute("/clinical/mse")).toBe("therapist");
  });
});
