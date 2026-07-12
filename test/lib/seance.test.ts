// Séance model tests. Hand-checked expectations, including the
// exact deterministic output of assembleSeanceText and the full
// sessionPermissions truth table.

import { describe, it, expect, beforeEach } from "vitest";
import {
  addFollowUp,
  addHomework,
  addSeance,
  addSeanceNote,
  archiveSeance,
  assembleSeanceText,
  clearSeanceObservation,
  finaliseSeance,
  findSeance,
  loadSeances,
  newSeance,
  patchSeance,
  removeFollowUp,
  removeHomework,
  removeSeanceNote,
  reopenSeance,
  restoreSeance,
  saveSeances,
  seancesForDossier,
  sessionPermissions,
  setSeanceObservation,
  toggleFollowUp,
  toggleHomework,
  toggleLinkedAssessment,
  toggleLinkedWorksheet,
  SEANCES_STORAGE_KEY,
  type Seance,
} from "@/lib/internship/seance";

function seed(dossierId = "dossier-1", date?: string): Seance {
  return newSeance({ dossierId, date });
}

describe("newSeance — factory defaults", () => {
  it("creates a stage draft with empty collections", () => {
    const s = seed();
    expect(s.id).toBeTruthy();
    expect(s.dossierId).toBe("dossier-1");
    expect(s.context).toBe("stage");
    expect(s.status).toBe("draft");
    expect(s.archived).toBe(false);
    expect(s.notes).toEqual([]);
    expect(s.observations).toEqual([]);
    expect(s.linkedAssessmentIds).toEqual([]);
    expect(s.linkedWorksheetIds).toEqual([]);
    expect(s.homework).toEqual([]);
    expect(s.followUps).toEqual([]);
    expect(s.nextAppointment).toBeNull();
    // Default date is today (from createdAt).
    expect(s.date).toBe(s.createdAt.slice(0, 10));
  });

  it("respects an explicit date", () => {
    expect(seed("d", "2026-05-04").date).toBe("2026-05-04");
  });
});

describe("notes — add / remove", () => {
  it("appends notes in insertion order with ids + timestamps", () => {
    const s = seed();
    let list = addSeanceNote([s], s.id, {
      type: "general",
      text: "Première note",
    });
    list = addSeanceNote(list, s.id, {
      type: "reflection",
      text: "Deuxième note",
    });
    const notes = list[0].notes;
    expect(notes).toHaveLength(2);
    expect(notes[0].text).toBe("Première note");
    expect(notes[1].type).toBe("reflection");
    expect(notes[0].id).toBeTruthy();
    expect(notes[0].createdAt).toBeTruthy();
  });

  it("removeSeanceNote drops only the target note", () => {
    const s = seed();
    let list = addSeanceNote([s], s.id, { type: "general", text: "a" });
    list = addSeanceNote(list, s.id, { type: "general", text: "b" });
    const keepId = list[0].notes[1].id;
    list = removeSeanceNote(list, s.id, list[0].notes[0].id);
    expect(list[0].notes).toHaveLength(1);
    expect(list[0].notes[0].id).toBe(keepId);
  });
});

describe("observations — one live record per category", () => {
  it("setSeanceObservation creates then replaces in place", () => {
    const s = seed();
    let list = setSeanceObservation([s], s.id, {
      category: "attention",
      value: "parfois",
    });
    expect(list[0].observations).toHaveLength(1);
    const firstId = list[0].observations[0].id;

    list = setSeanceObservation(list, s.id, {
      category: "attention",
      value: "souvent",
    });
    expect(list[0].observations).toHaveLength(1);
    expect(list[0].observations[0].value).toBe("souvent");
    // Replacement keeps the same record id (it's an update, not a new record).
    expect(list[0].observations[0].id).toBe(firstId);
  });

  it("keeps the previous note when re-picking a value without a note", () => {
    const s = seed();
    let list = setSeanceObservation([s], s.id, {
      category: "sensory",
      value: "rarement",
      note: "sensible au bruit",
    });
    list = setSeanceObservation(list, s.id, {
      category: "sensory",
      value: "parfois",
    });
    expect(list[0].observations[0].note).toBe("sensible au bruit");
  });

  it("different categories coexist", () => {
    const s = seed();
    let list = setSeanceObservation([s], s.id, {
      category: "communication",
      value: "souvent",
    });
    list = setSeanceObservation(list, s.id, {
      category: "social",
      value: "jamais",
    });
    expect(list[0].observations).toHaveLength(2);
  });

  it("clearSeanceObservation removes the category record", () => {
    const s = seed();
    let list = setSeanceObservation([s], s.id, {
      category: "regulation",
      value: "parfois",
    });
    list = clearSeanceObservation(list, s.id, "regulation");
    expect(list[0].observations).toEqual([]);
  });
});

describe("homework / follow-ups — add / toggle / remove", () => {
  it("addHomework appends undone items", () => {
    const s = seed();
    const list = addHomework([s], s.id, "Exercice de respiration");
    expect(list[0].homework).toHaveLength(1);
    expect(list[0].homework[0].done).toBe(false);
  });

  it("toggleHomework flips done and flips back", () => {
    const s = seed();
    let list = addHomework([s], s.id, "x");
    const todoId = list[0].homework[0].id;
    list = toggleHomework(list, s.id, todoId);
    expect(list[0].homework[0].done).toBe(true);
    list = toggleHomework(list, s.id, todoId);
    expect(list[0].homework[0].done).toBe(false);
  });

  it("removeHomework drops the item", () => {
    const s = seed();
    let list = addHomework([s], s.id, "x");
    list = removeHomework(list, s.id, list[0].homework[0].id);
    expect(list[0].homework).toEqual([]);
  });

  it("followUps mirror the same behaviour", () => {
    const s = seed();
    let list = addFollowUp([s], s.id, "Contacter l'encadrant");
    const id = list[0].followUps[0].id;
    list = toggleFollowUp(list, s.id, id);
    expect(list[0].followUps[0].done).toBe(true);
    list = removeFollowUp(list, s.id, id);
    expect(list[0].followUps).toEqual([]);
  });
});

describe("links — toggle semantics", () => {
  it("toggleLinkedAssessment adds then removes", () => {
    const s = seed();
    let list = toggleLinkedAssessment([s], s.id, "adm-1");
    expect(list[0].linkedAssessmentIds).toEqual(["adm-1"]);
    list = toggleLinkedAssessment(list, s.id, "adm-1");
    expect(list[0].linkedAssessmentIds).toEqual([]);
  });

  it("toggleLinkedWorksheet adds then removes", () => {
    const s = seed();
    let list = toggleLinkedWorksheet([s], s.id, "ws-1");
    expect(list[0].linkedWorksheetIds).toEqual(["ws-1"]);
    list = toggleLinkedWorksheet(list, s.id, "ws-1");
    expect(list[0].linkedWorksheetIds).toEqual([]);
  });
});

describe("status + archive lifecycle", () => {
  it("finalise → reopen round-trips", () => {
    const s = seed();
    let list = finaliseSeance([s], s.id);
    expect(list[0].status).toBe("finalised");
    list = reopenSeance(list, s.id);
    expect(list[0].status).toBe("draft");
  });

  it("archive → restore round-trips (no hard delete exists)", () => {
    const s = seed();
    let list = archiveSeance([s], s.id);
    expect(list[0].archived).toBe(true);
    list = restoreSeance(list, s.id);
    expect(list[0].archived).toBe(false);
  });

  it("patchSeance updates date and nextAppointment", () => {
    const s = seed();
    const list = patchSeance([s], s.id, {
      date: "2026-05-10",
      nextAppointment: { date: "2026-05-17", note: "matin" },
    });
    expect(list[0].date).toBe("2026-05-10");
    expect(list[0].nextAppointment).toEqual({
      date: "2026-05-17",
      note: "matin",
    });
  });
});

describe("seancesForDossier — timeline ordering", () => {
  it("filters by dossier, most recent session date first", () => {
    const a = { ...seed("d1", "2026-05-01"), id: "a" };
    const b = { ...seed("d1", "2026-05-15"), id: "b" };
    const c = { ...seed("d1", "2026-05-08"), id: "c" };
    const other = { ...seed("d2", "2026-05-20"), id: "other" };
    const out = seancesForDossier([a, b, c, other], "d1");
    expect(out.map((s) => s.id)).toEqual(["b", "c", "a"]);
  });

  it("same-day séances order by createdAt (newest first)", () => {
    const early = {
      ...seed("d1", "2026-05-01"),
      id: "early",
      createdAt: "2026-05-01T09:00:00.000Z",
    };
    const late = {
      ...seed("d1", "2026-05-01"),
      id: "late",
      createdAt: "2026-05-01T15:00:00.000Z",
    };
    const out = seancesForDossier([early, late], "d1");
    expect(out.map((s) => s.id)).toEqual(["late", "early"]);
  });

  it("excludes archived by default, includes with the flag", () => {
    const live = { ...seed("d1", "2026-05-01"), id: "live" };
    const gone = {
      ...seed("d1", "2026-05-02"),
      id: "gone",
      archived: true,
    };
    expect(seancesForDossier([live, gone], "d1").map((s) => s.id)).toEqual([
      "live",
    ]);
    expect(
      seancesForDossier([live, gone], "d1", { includeArchived: true }).map(
        (s) => s.id
      )
    ).toEqual(["gone", "live"]);
  });

  it("findSeance retrieves by id", () => {
    const s = seed();
    expect(findSeance([s], s.id)?.id).toBe(s.id);
    expect(findSeance([s], "nope")).toBeUndefined();
  });
});

describe("sessionPermissions — full truth table", () => {
  it("stage / draft", () => {
    expect(sessionPermissions("stage", "draft")).toEqual({
      canEdit: true,
      canFinalise: true,
      canReopen: false,
      canArchive: true,
      canRestore: true,
      canHardDelete: false,
      visibleToSupervisor: true,
    });
  });

  it("stage / finalised", () => {
    expect(sessionPermissions("stage", "finalised")).toEqual({
      canEdit: false,
      canFinalise: false,
      canReopen: true,
      canArchive: true,
      canRestore: true,
      canHardDelete: false,
      visibleToSupervisor: true,
    });
  });

  it("therapist / draft (provisional — not supervisor-visible)", () => {
    expect(sessionPermissions("therapist", "draft")).toEqual({
      canEdit: true,
      canFinalise: true,
      canReopen: false,
      canArchive: true,
      canRestore: true,
      canHardDelete: false,
      visibleToSupervisor: false,
    });
  });

  it("therapist / finalised (provisional)", () => {
    expect(sessionPermissions("therapist", "finalised")).toEqual({
      canEdit: false,
      canFinalise: false,
      canReopen: true,
      canArchive: true,
      canRestore: true,
      canHardDelete: false,
      visibleToSupervisor: false,
    });
  });

  it("hard delete is never allowed from this surface", () => {
    for (const ctx of ["stage", "therapist"] as const) {
      for (const st of ["draft", "finalised"] as const) {
        expect(sessionPermissions(ctx, st).canHardDelete).toBe(false);
      }
    }
  });
});

describe("assembleSeanceText — deterministic formatting", () => {
  it("empty séance assembles to just the header line", () => {
    const s = { ...seed("d1", "2026-05-04"), id: "s1" };
    expect(assembleSeanceText(s)).toBe(
      "Séance du 2026-05-04 — Brouillon"
    );
  });

  it("fixed input records → exact expected output", () => {
    let s: Seance = { ...seed("d1", "2026-05-04"), id: "s1" };
    // Build via the real mutations so the test exercises the pipeline.
    let list: Seance[] = [s];
    list = setSeanceObservation(list, "s1", {
      category: "communication",
      value: "souvent",
      note: "demandes verbales spontanées",
    });
    list = setSeanceObservation(list, "s1", {
      category: "attention",
      value: "parfois",
    });
    list = addSeanceNote(list, "s1", {
      type: "general",
      text: "Bonne entrée en séance.",
    });
    list = addSeanceNote(list, "s1", {
      type: "incident",
      text: "Sursaut au bruit du couloir.",
    });
    list = addHomework(list, "s1", "Tri de formes à la maison");
    list = toggleHomework(list, "s1", list[0].homework[0].id);
    list = addFollowUp(list, "s1", "Préparer la grille motricité fine");
    list = patchSeance(list, "s1", {
      nextAppointment: { date: "2026-05-11", note: "matin" },
    });
    s = finaliseSeance(list, "s1")[0];

    const expected = [
      "Séance du 2026-05-04 — Finalisée",
      "",
      "## Observations structurées",
      "- Communication : souvent — demandes verbales spontanées",
      "- Attention : parfois",
      "",
      "## Notes",
      "- [Note] Bonne entrée en séance.",
      "- [Événement] Sursaut au bruit du couloir.",
      "",
      "## Devoirs",
      "- [x] Tri de formes à la maison",
      "",
      "## Actions de suivi",
      "- [ ] Préparer la grille motricité fine",
      "",
      "## Prochain rendez-vous",
      "- 2026-05-11 — matin",
    ].join("\n");

    expect(assembleSeanceText(s)).toBe(expected);
  });

  it("observations render in canonical category order, not insertion order", () => {
    let list: Seance[] = [{ ...seed("d1", "2026-05-04"), id: "s1" }];
    // Insert social first, then communication — output must lead with communication.
    list = setSeanceObservation(list, "s1", {
      category: "social",
      value: "jamais",
    });
    list = setSeanceObservation(list, "s1", {
      category: "communication",
      value: "souvent",
    });
    const text = assembleSeanceText(list[0]);
    const commIdx = text.indexOf("Communication");
    const socialIdx = text.indexOf("Interaction sociale");
    expect(commIdx).toBeGreaterThan(-1);
    expect(socialIdx).toBeGreaterThan(commIdx);
  });

  it("maps the non-observe value to its label", () => {
    let list: Seance[] = [{ ...seed("d1", "2026-05-04"), id: "s1" }];
    list = setSeanceObservation(list, "s1", {
      category: "regulation",
      value: "non-observe",
    });
    expect(assembleSeanceText(list[0])).toContain(
      "- Régulation : non observé"
    );
  });
});

describe("persistence", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") window.localStorage.clear();
  });

  it("save / load round-trip under eyla-seances-v1", () => {
    const s = seed();
    saveSeances([s]);
    expect(loadSeances()).toEqual([s]);
    expect(window.localStorage.getItem(SEANCES_STORAGE_KEY)).toBeTruthy();
  });

  it("loads [] when nothing stored", () => {
    expect(loadSeances()).toEqual([]);
  });
});

describe("addSeance ordering", () => {
  it("prepends the new séance", () => {
    const a = seed();
    const b = seed();
    expect(addSeance(addSeance([], a), b).map((s) => s.id)).toEqual([
      b.id,
      a.id,
    ]);
  });
});
