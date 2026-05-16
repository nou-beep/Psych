import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AppProvider, useApp, type CaseWithMeta } from "@/contexts/AppContext";
import { STORE_KEYS } from "@/lib/store";

function wrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

// Hydrate the provider with empty case state so each test starts from a
// known baseline (the default seed is the demo mockCases array).
function seedEmptyCases() {
  window.localStorage.setItem(STORE_KEYS.CASES, JSON.stringify([]));
  window.localStorage.setItem(STORE_KEYS.PINNED, JSON.stringify([]));
}

async function renderApp() {
  const view = renderHook(() => useApp(), { wrapper });
  // Wait for the mount-time useEffect that hydrates from localStorage.
  await waitFor(() => {
    expect(view.result.current).toBeTruthy();
  });
  return view;
}

describe("AppContext — cases CRUD", () => {
  beforeEach(() => {
    window.localStorage.clear();
    seedEmptyCases();
  });

  describe("createCase", () => {
    it("creates a case with the provided fields", async () => {
      const { result } = await renderApp();

      let created: CaseWithMeta | undefined;
      act(() => {
        created = result.current.createCase({
          code: "CASE-TEST",
          type: "Adult Case",
          status: "Active",
          shortNote: "Hello",
          tags: ["test"],
          currentGoals: ["g1", "g2"],
        });
      });

      expect(created).toBeDefined();
      expect(created!.code).toBe("CASE-TEST");
      expect(created!.type).toBe("Adult Case");
      expect(created!.status).toBe("Active");
      expect(created!.shortNote).toBe("Hello");
      expect(created!.tags).toEqual(["test"]);
      expect(created!.currentGoals).toEqual(["g1", "g2"]);
      expect(created!.isArchived).toBe(false);
      expect(created!.isPinned).toBe(false);
      expect(created!.id).toEqual(expect.any(String));
      expect(created!.createdAt).toEqual(expect.any(String));
      expect(created!.updatedAt).toEqual(expect.any(String));
    });

    it("prepends new cases to the list", async () => {
      const { result } = await renderApp();

      act(() => {
        result.current.createCase({ code: "FIRST" });
      });
      act(() => {
        result.current.createCase({ code: "SECOND" });
      });

      expect(result.current.cases.map((c) => c.code)).toEqual([
        "SECOND",
        "FIRST",
      ]);
    });

    it("fills in sensible defaults when fields are omitted", async () => {
      const { result } = await renderApp();

      let created: CaseWithMeta | undefined;
      act(() => {
        created = result.current.createCase({});
      });

      expect(created!.code).toMatch(/^CASE-\d{4}$/);
      expect(created!.type).toBe("Clinical Case");
      expect(created!.status).toBe("Active");
      expect(created!.currentGoals).toEqual([]);
      expect(created!.tags).toEqual([]);
      expect(created!.alerts).toEqual([]);
      expect(created!.lastCheckIn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(created!.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("assigns unique ids to successive cases", async () => {
      const { result } = await renderApp();

      const ids: string[] = [];
      act(() => {
        for (let i = 0; i < 5; i++) {
          ids.push(result.current.createCase({ code: `C-${i}` }).id);
        }
      });
      expect(new Set(ids).size).toBe(5);
    });

    it("persists created cases to localStorage", async () => {
      const { result } = await renderApp();

      act(() => {
        result.current.createCase({ code: "PERSIST-ME" });
      });

      await waitFor(() => {
        const stored = JSON.parse(
          window.localStorage.getItem(STORE_KEYS.CASES) || "[]"
        ) as CaseWithMeta[];
        expect(stored.some((c) => c.code === "PERSIST-ME")).toBe(true);
      });
    });
  });

  describe("updateCase", () => {
    it("updates the matching case and refreshes updatedAt", async () => {
      const { result } = await renderApp();

      let id = "";
      act(() => {
        id = result.current.createCase({ code: "OLD" }).id;
      });
      const originalUpdatedAt = result.current.cases.find((c) => c.id === id)!
        .updatedAt!;

      // Ensure measurable time has passed between create and update.
      await new Promise((r) => setTimeout(r, 5));

      act(() => {
        result.current.updateCase(id, { code: "NEW", shortNote: "changed" });
      });

      const updated = result.current.cases.find((c) => c.id === id)!;
      expect(updated.code).toBe("NEW");
      expect(updated.shortNote).toBe("changed");
      expect(updated.updatedAt).not.toBe(originalUpdatedAt);
    });

    it("does not touch unrelated cases", async () => {
      const { result } = await renderApp();

      let aId = "";
      let bId = "";
      act(() => {
        aId = result.current.createCase({ code: "A" }).id;
        bId = result.current.createCase({ code: "B" }).id;
      });

      act(() => {
        result.current.updateCase(aId, { shortNote: "only A" });
      });

      const b = result.current.cases.find((c) => c.id === bId)!;
      expect(b.code).toBe("B");
      expect(b.shortNote).toBe("");
    });

    it("is a no-op for an unknown id", async () => {
      const { result } = await renderApp();

      act(() => {
        result.current.createCase({ code: "X" });
      });
      const before = result.current.cases;

      act(() => {
        result.current.updateCase("does-not-exist", { code: "Y" });
      });

      expect(result.current.cases.map((c) => c.code)).toEqual(
        before.map((c) => c.code)
      );
    });
  });

  describe("deleteCase", () => {
    it("removes the matching case", async () => {
      const { result } = await renderApp();

      let id = "";
      act(() => {
        id = result.current.createCase({ code: "TO-DELETE" }).id;
        result.current.createCase({ code: "KEEP" });
      });

      act(() => {
        result.current.deleteCase(id);
      });

      expect(result.current.cases.find((c) => c.id === id)).toBeUndefined();
      expect(result.current.cases.some((c) => c.code === "KEEP")).toBe(true);
    });

    it("is a no-op for an unknown id", async () => {
      const { result } = await renderApp();

      act(() => {
        result.current.createCase({ code: "A" });
      });
      const beforeCount = result.current.cases.length;

      act(() => {
        result.current.deleteCase("nope");
      });

      expect(result.current.cases.length).toBe(beforeCount);
    });
  });

  describe("archiveCase / restoreCase", () => {
    it("marks a case as archived", async () => {
      const { result } = await renderApp();

      let id = "";
      act(() => {
        id = result.current.createCase({ code: "ARCH" }).id;
      });

      act(() => {
        result.current.archiveCase(id);
      });

      expect(result.current.cases.find((c) => c.id === id)!.isArchived).toBe(
        true
      );
    });

    it("restoreCase un-archives a case", async () => {
      const { result } = await renderApp();

      let id = "";
      act(() => {
        id = result.current.createCase({ code: "REST" }).id;
        result.current.archiveCase(id);
      });

      act(() => {
        result.current.restoreCase(id);
      });

      expect(result.current.cases.find((c) => c.id === id)!.isArchived).toBe(
        false
      );
    });

    it("archive is idempotent (calling twice stays archived)", async () => {
      const { result } = await renderApp();

      let id = "";
      act(() => {
        id = result.current.createCase({ code: "IDEM" }).id;
      });

      act(() => {
        result.current.archiveCase(id);
        result.current.archiveCase(id);
      });

      expect(result.current.cases.find((c) => c.id === id)!.isArchived).toBe(
        true
      );
    });

    it("activeCases excludes archived and non-Active cases", async () => {
      const { result } = await renderApp();

      let activeId = "";
      let archivedId = "";
      let pausedId = "";
      act(() => {
        activeId = result.current.createCase({
          code: "ACT",
          status: "Active",
        }).id;
        archivedId = result.current.createCase({
          code: "ARCH",
          status: "Active",
        }).id;
        pausedId = result.current.createCase({
          code: "PAU",
          status: "Paused",
        }).id;
      });

      act(() => {
        result.current.archiveCase(archivedId);
      });

      const activeIds = result.current.activeCases.map((c) => c.id);
      expect(activeIds).toContain(activeId);
      expect(activeIds).not.toContain(archivedId);
      expect(activeIds).not.toContain(pausedId);
    });
  });

  describe("duplicateCase", () => {
    it("creates a copy with a new id and -COPY suffixed code", async () => {
      const { result } = await renderApp();

      let originalId = "";
      act(() => {
        originalId = result.current.createCase({
          code: "ORIG",
          tags: ["alpha", "beta"],
          currentGoals: ["g1"],
        }).id;
      });

      let dupe: CaseWithMeta | null = null;
      act(() => {
        dupe = result.current.duplicateCase(originalId);
      });

      expect(dupe).not.toBeNull();
      expect(dupe!.id).not.toBe(originalId);
      expect(dupe!.code).toBe("ORIG-COPY");
      expect(dupe!.tags).toEqual(["alpha", "beta"]);
      expect(dupe!.currentGoals).toEqual(["g1"]);
      expect(dupe!.isArchived).toBe(false);
    });

    it("returns null and does not mutate state for an unknown id", async () => {
      const { result } = await renderApp();

      act(() => {
        result.current.createCase({ code: "A" });
      });
      const before = result.current.cases.length;

      let returned: CaseWithMeta | null = null;
      act(() => {
        returned = result.current.duplicateCase("missing-id");
      });

      expect(returned).toBeNull();
      expect(result.current.cases.length).toBe(before);
    });

    it("places the duplicate at the front of the list", async () => {
      const { result } = await renderApp();

      let originalId = "";
      act(() => {
        originalId = result.current.createCase({ code: "ORIG" }).id;
        result.current.createCase({ code: "OTHER" });
      });

      act(() => {
        result.current.duplicateCase(originalId);
      });

      expect(result.current.cases[0].code).toBe("ORIG-COPY");
    });
  });

  describe("togglePinCase", () => {
    it("pins a case when not already pinned", async () => {
      const { result } = await renderApp();

      let id = "";
      act(() => {
        id = result.current.createCase({ code: "PIN" }).id;
      });

      act(() => {
        result.current.togglePinCase(id);
      });

      expect(result.current.pinnedCaseIds).toContain(id);
    });

    it("unpins a case that is already pinned", async () => {
      const { result } = await renderApp();

      let id = "";
      act(() => {
        id = result.current.createCase({ code: "PIN" }).id;
        result.current.togglePinCase(id);
      });

      act(() => {
        result.current.togglePinCase(id);
      });

      expect(result.current.pinnedCaseIds).not.toContain(id);
    });

    it("prepends newly pinned ids", async () => {
      const { result } = await renderApp();

      let a = "";
      let b = "";
      act(() => {
        a = result.current.createCase({ code: "A" }).id;
        b = result.current.createCase({ code: "B" }).id;
      });

      act(() => {
        result.current.togglePinCase(a);
        result.current.togglePinCase(b);
      });

      expect(result.current.pinnedCaseIds[0]).toBe(b);
      expect(result.current.pinnedCaseIds[1]).toBe(a);
    });
  });

  describe("getCase lookup", () => {
    it("finds a case by id", async () => {
      const { result } = await renderApp();

      let id = "";
      act(() => {
        id = result.current.createCase({ code: "LOOKUP" }).id;
      });

      expect(result.current.getCase(id)?.code).toBe("LOOKUP");
    });

    it("falls back to case-insensitive code matching", async () => {
      const { result } = await renderApp();

      act(() => {
        result.current.createCase({ code: "CASE-007" });
      });

      expect(result.current.getCase("case-007")?.code).toBe("CASE-007");
      expect(result.current.getCase("CASE-007")?.code).toBe("CASE-007");
    });

    it("returns undefined when nothing matches", async () => {
      const { result } = await renderApp();
      expect(result.current.getCase("ghost")).toBeUndefined();
    });
  });

  describe("hydration from localStorage", () => {
    it("loads pre-existing cases from storage on mount", async () => {
      const preloaded: CaseWithMeta[] = [
        {
          id: "pre-1",
          code: "PRE-1",
          type: "Adult Case",
          status: "Active",
          age: "",
          gender: "",
          context: "",
          presentingConcerns: "",
          currentGoals: [],
          keyObservations: "",
          latestSummary: "",
          lastCheckIn: "2026-01-01",
          nextReportDue: "",
          tags: [],
          shortNote: "preloaded",
          alerts: [],
          startDate: "2026-01-01",
          supervisor: "",
          institution: "",
          isArchived: false,
          isPinned: false,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ];
      window.localStorage.setItem(
        STORE_KEYS.CASES,
        JSON.stringify(preloaded)
      );

      const { result } = await renderApp();

      await waitFor(() => {
        expect(result.current.cases.some((c) => c.id === "pre-1")).toBe(true);
      });
      expect(result.current.cases.find((c) => c.id === "pre-1")!.shortNote).toBe(
        "preloaded"
      );
    });
  });
});
