import { describe, it, expect, beforeEach } from "vitest";
import {
  SESSION_NOTES_STORAGE_KEY,
  loadSessionNotes,
  saveSessionNotes,
  upsertSessionNote,
  removeSessionNote,
} from "@/lib/session-notes-store";
import { convertPlanToNote } from "@/lib/session-convert";

function makeNote(id: string) {
  const n = convertPlanToNote({
    id: `plan-${id}`,
    caseId: "c1",
    date: "2026-05-16",
  });
  return { ...n, id };
}

describe("session-notes-store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loadSessionNotes returns an empty array when nothing is stored", () => {
    expect(loadSessionNotes()).toEqual([]);
  });

  it("saveSessionNotes round-trips through localStorage", () => {
    const a = makeNote("a");
    saveSessionNotes([a]);
    const loaded = loadSessionNotes();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe("a");
    expect(window.localStorage.getItem(SESSION_NOTES_STORAGE_KEY)).not.toBeNull();
  });

  it("upsertSessionNote inserts new notes at the front", () => {
    const a = makeNote("a");
    const b = makeNote("b");
    const next = upsertSessionNote([a], b);
    expect(next.map((n) => n.id)).toEqual(["b", "a"]);
  });

  it("upsertSessionNote replaces existing notes by id", () => {
    const a = makeNote("a");
    const aPrime = { ...a, observations: "updated" };
    const next = upsertSessionNote([a], aPrime);
    expect(next).toHaveLength(1);
    expect(next[0].observations).toBe("updated");
  });

  it("removeSessionNote drops the matching id", () => {
    const a = makeNote("a");
    const b = makeNote("b");
    expect(removeSessionNote([a, b], "a")).toEqual([b]);
    expect(removeSessionNote([a, b], "missing")).toEqual([a, b]);
  });
});
