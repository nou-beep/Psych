import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
  generateId,
  nowISO,
  formatDate,
  STORE_KEYS,
} from "@/lib/store";

describe("lib/store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("loadFromStorage", () => {
    it("returns the fallback when nothing is stored", () => {
      const fallback = [{ id: "a" }];
      expect(loadFromStorage("missing-key", fallback)).toBe(fallback);
    });

    it("returns the parsed value when something is stored", () => {
      window.localStorage.setItem("foo", JSON.stringify({ count: 3 }));
      expect(loadFromStorage("foo", { count: 0 })).toEqual({ count: 3 });
    });

    it("supports primitive fallbacks", () => {
      expect(loadFromStorage<number>("nope", 7)).toBe(7);
      window.localStorage.setItem("num", JSON.stringify(42));
      expect(loadFromStorage<number>("num", 0)).toBe(42);
    });

    it("returns the fallback when the stored JSON is malformed", () => {
      window.localStorage.setItem("bad", "{not-json");
      const fallback = { ok: true };
      expect(loadFromStorage("bad", fallback)).toBe(fallback);
    });

    it("returns the fallback when localStorage.getItem throws", () => {
      const fallback = { safe: true };
      const spy = vi
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => {
          throw new Error("denied");
        });
      expect(loadFromStorage("anything", fallback)).toBe(fallback);
      spy.mockRestore();
    });
  });

  describe("saveToStorage", () => {
    it("writes a JSON-serialized value", () => {
      saveToStorage("alpha", { greet: "hi" });
      expect(window.localStorage.getItem("alpha")).toBe(
        JSON.stringify({ greet: "hi" })
      );
    });

    it("overwrites previous values", () => {
      saveToStorage("k", 1);
      saveToStorage("k", 2);
      expect(window.localStorage.getItem("k")).toBe("2");
    });

    it("silently swallows quota-exceeded errors", () => {
      const spy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("quota");
        });
      expect(() => saveToStorage("k", "v")).not.toThrow();
      spy.mockRestore();
    });
  });

  describe("removeFromStorage", () => {
    it("removes a stored key", () => {
      window.localStorage.setItem("byebye", "1");
      removeFromStorage("byebye");
      expect(window.localStorage.getItem("byebye")).toBeNull();
    });

    it("is a no-op for missing keys and does not throw", () => {
      expect(() => removeFromStorage("never-set")).not.toThrow();
    });

    it("silently swallows errors from removeItem", () => {
      const spy = vi
        .spyOn(Storage.prototype, "removeItem")
        .mockImplementation(() => {
          throw new Error("boom");
        });
      expect(() => removeFromStorage("k")).not.toThrow();
      spy.mockRestore();
    });
  });

  describe("generateId", () => {
    it("returns a non-empty string", () => {
      const id = generateId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("produces unique values across many calls", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 1000; i++) ids.add(generateId());
      expect(ids.size).toBe(1000);
    });

    it("uses a base36 timestamp prefix joined to a random suffix", () => {
      const id = generateId();
      expect(id).toMatch(/^[0-9a-z]+-[0-9a-z]+$/);
    });
  });

  describe("nowISO", () => {
    it("returns an ISO-8601 string parseable by Date", () => {
      const iso = nowISO();
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(Number.isNaN(Date.parse(iso))).toBe(false);
    });

    it("uses the current Date", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2030-01-02T03:04:05.000Z"));
      try {
        expect(nowISO()).toBe("2030-01-02T03:04:05.000Z");
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("formatDate", () => {
    it("formats an ISO timestamp using the en-CA locale (YYYY-MM-DD)", () => {
      expect(formatDate("2026-05-16T12:00:00.000Z")).toMatch(
        /^\d{4}-\d{2}-\d{2}$/
      );
    });
  });

  describe("STORE_KEYS", () => {
    it("exposes a stable, namespaced set of keys", () => {
      const values = Object.values(STORE_KEYS);
      expect(new Set(values).size).toBe(values.length);
      for (const v of values) {
        expect(v.startsWith("psych-")).toBe(true);
      }
    });

    it("includes the core entities the app reads on mount", () => {
      expect(STORE_KEYS.CASES).toBe("psych-cases-v2");
      expect(STORE_KEYS.CHECKINS).toBe("psych-checkins-v2");
      expect(STORE_KEYS.GOALS).toBe("psych-goals-v2");
      expect(STORE_KEYS.PINNED).toBe("psych-pinned-v2");
    });
  });
});
