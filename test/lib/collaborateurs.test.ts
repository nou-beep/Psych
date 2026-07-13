// Collaborateurs model + aggregation tests. Every aggregate
// expectation is hand-computed from the fixed input records.

import { describe, it, expect, beforeEach } from "vitest";
import {
  absenceTotal,
  addAbsenceEntry,
  addAssignment,
  addCheckIn,
  addCollaborateur,
  addMoodEntry,
  addRiskEntry,
  buildDatasetExport,
  buildRapportDirection,
  buildSampleCollaborateurs,
  clearSampleData,
  currentRiskLevel,
  departureCount,
  hasSampleData,
  latestRiskEntry,
  loadCollaborateurs,
  newCollaborateur,
  parseDatasetImport,
  patchCollaborateur,
  rapportDirectionText,
  removeAssignment,
  riskDistribution,
  riskImprovedCount,
  saveCollaborateurs,
  setDeparture,
  teamClimate,
  teamClimateSeries,
  toggleAssignment,
  COLLABORATEURS_STORAGE_KEY,
  type Collaborateur,
  type RiskLevel,
} from "@/lib/therapist/collaborateurs";

function person(
  name: string,
  team = "Équipe A",
  status: Collaborateur["status"] = "actif"
): Collaborateur {
  const c = newCollaborateur({ displayName: name, team, role: "Rôle" });
  c.status = status;
  return c;
}

/** Adds a risk entry directly on the record (test shorthand). */
function withRisk(
  c: Collaborateur,
  date: string,
  flight: RiskLevel,
  burnout: RiskLevel
): Collaborateur {
  return {
    ...c,
    riskEntries: [
      ...c.riskEntries,
      { id: `${c.id}-r${c.riskEntries.length}`, date, flightRisk: flight, burnoutRisk: burnout },
    ],
  };
}

function withMood(
  c: Collaborateur,
  date: string,
  functioning: number
): Collaborateur {
  return {
    ...c,
    moodEntries: [
      ...c.moodEntries,
      { id: `${c.id}-m${c.moodEntries.length}`, date, functioning },
    ],
  };
}

// ─── Risk helpers ─────────────────────────────────────────────

describe("latestRiskEntry / currentRiskLevel", () => {
  it("returns null with no entries", () => {
    expect(latestRiskEntry(person("A"))).toBeNull();
    expect(currentRiskLevel(person("A"))).toBeNull();
  });

  it("takes the latest entry by date regardless of insertion order", () => {
    let c = person("A");
    c = withRisk(c, "2026-05-10", "high", "high");
    c = withRisk(c, "2026-05-01", "ok", "ok");
    expect(latestRiskEntry(c)!.date).toBe("2026-05-10");
    expect(currentRiskLevel(c)).toBe("high");
  });

  it("overall level = worse of flight / burnout", () => {
    let c = person("A");
    c = withRisk(c, "2026-05-01", "ok", "watch");
    expect(currentRiskLevel(c)).toBe("watch");
    c = withRisk(c, "2026-05-02", "high", "ok");
    expect(currentRiskLevel(c)).toBe("high");
  });

  it("same-date tie: later entry in the array wins", () => {
    let c = person("A");
    c = withRisk(c, "2026-05-01", "high", "high");
    c = withRisk(c, "2026-05-01", "ok", "ok");
    expect(currentRiskLevel(c)).toBe("ok");
  });
});

describe("riskDistribution — fixed entries → exact counts", () => {
  it("counts high / watch / ok / none over non-clos", () => {
    const a = withRisk(person("A"), "2026-05-01", "high", "ok"); // high
    const b = withRisk(person("B"), "2026-05-01", "ok", "watch"); // watch
    const c = withRisk(person("C"), "2026-05-01", "ok", "ok"); // ok
    const d = person("D"); // none (no entry)
    const closHigh = withRisk(
      person("E", "Équipe A", "clos"),
      "2026-05-01",
      "high",
      "high"
    ); // excluded — clos
    const dist = riskDistribution([a, b, c, d, closHigh]);
    expect(dist.high).toBe(1);
    expect(dist.watch).toBe(1);
    expect(dist.ok).toBe(1);
    expect(dist.none).toBe(1);
    expect(dist.highList.map((x) => x.displayName)).toEqual(["A"]);
  });
});

// ─── Team climate ─────────────────────────────────────────────

describe("teamClimate — average of latest functioning per team", () => {
  it("hand-checked averages", () => {
    // Team Alpha: A latest = 6 (05-08 beats 05-01), B latest = 8. avg = 7.
    // Team Beta: C latest = 4 only. avg = 4.
    let a = person("A", "Alpha");
    a = withMood(a, "2026-05-01", 2);
    a = withMood(a, "2026-05-08", 6);
    let b = person("B", "Alpha");
    b = withMood(b, "2026-05-08", 8);
    let c = person("C", "Beta");
    c = withMood(c, "2026-05-08", 4);
    const climate = teamClimate([a, b, c]);
    expect(climate).toEqual([
      { team: "Alpha", average: 7, memberCount: 2, scoredCount: 2 },
      { team: "Beta", average: 4, memberCount: 1, scoredCount: 1 },
    ]);
  });

  it("members without mood data count in memberCount but not the average", () => {
    let a = person("A", "Alpha");
    a = withMood(a, "2026-05-08", 6);
    const b = person("B", "Alpha"); // no mood
    const climate = teamClimate([a, b]);
    expect(climate[0].average).toBe(6);
    expect(climate[0].memberCount).toBe(2);
    expect(climate[0].scoredCount).toBe(1);
  });

  it("team with zero scored members has average null", () => {
    const a = person("A", "Alpha");
    expect(teamClimate([a])[0].average).toBeNull();
  });

  it("clos collaborateurs are excluded", () => {
    let gone = person("G", "Alpha", "clos");
    gone = withMood(gone, "2026-05-08", 1);
    let live = person("L", "Alpha");
    live = withMood(live, "2026-05-08", 9);
    expect(teamClimate([gone, live])[0].average).toBe(9);
  });
});

describe("teamClimateSeries — trend ordering", () => {
  it("points ascend by date; per-date average across team entries", () => {
    // Alpha 05-01: A=4, B=6 → 5. Alpha 05-08: A=8 → 8.
    let a = person("A", "Alpha");
    a = withMood(a, "2026-05-08", 8);
    a = withMood(a, "2026-05-01", 4);
    let b = person("B", "Alpha");
    b = withMood(b, "2026-05-01", 6);
    const series = teamClimateSeries([a, b]);
    expect(series).toHaveLength(1);
    expect(series[0].team).toBe("Alpha");
    expect(series[0].points).toEqual([
      { date: "2026-05-01", value: 5 },
      { date: "2026-05-08", value: 8 },
    ]);
  });

  it("teams sorted alphabetically", () => {
    let z = person("Z", "Zulu");
    z = withMood(z, "2026-05-01", 5);
    let a = person("A", "Alpha");
    a = withMood(a, "2026-05-01", 5);
    expect(teamClimateSeries([z, a]).map((s) => s.team)).toEqual([
      "Alpha",
      "Zulu",
    ]);
  });
});

// ─── Absence / departures / improvement ───────────────────────

describe("absenceTotal — fixed data → exact numbers", () => {
  it("sums days inside the window only (inclusive bounds)", () => {
    let a = person("A");
    a = {
      ...a,
      absenceEntries: [
        { id: "1", date: "2026-04-30", days: 3 }, // before window
        { id: "2", date: "2026-05-01", days: 2 }, // on lower bound
        { id: "3", date: "2026-05-15", days: 4 }, // inside
        { id: "4", date: "2026-05-31", days: 1 }, // on upper bound
        { id: "5", date: "2026-06-01", days: 9 }, // after window
      ],
    };
    expect(absenceTotal([a], "2026-05-01", "2026-05-31")).toBe(7);
  });

  it("sums across collaborateurs", () => {
    let a = person("A");
    a = { ...a, absenceEntries: [{ id: "1", date: "2026-05-05", days: 2 }] };
    let b = person("B");
    b = { ...b, absenceEntries: [{ id: "2", date: "2026-05-06", days: 3 }] };
    expect(absenceTotal([a, b], "2026-05-01", "2026-05-31")).toBe(5);
  });
});

describe("departureCount", () => {
  it("counts departures dated in-window", () => {
    const gone1 = {
      ...person("A"),
      departure: { date: "2026-05-10", reason: "Démission" },
    };
    const gone2 = {
      ...person("B"),
      departure: { date: "2026-04-01", reason: "Fin de contrat" },
    };
    const stays = person("C");
    expect(
      departureCount([gone1, gone2, stays], "2026-05-01", "2026-05-31")
    ).toBe(1);
  });
});

describe("riskImprovedCount — high→watch→ok counts once", () => {
  it("counts a collaborateur improving from high to ok exactly once", () => {
    let a = person("A");
    a = withRisk(a, "2026-05-01", "high", "high");
    a = withRisk(a, "2026-05-10", "watch", "watch");
    a = withRisk(a, "2026-05-20", "ok", "ok");
    expect(riskImprovedCount([a], "2026-05-01", "2026-05-31")).toBe(1);
  });

  it("worsening does not count", () => {
    let a = person("A");
    a = withRisk(a, "2026-05-01", "ok", "ok");
    a = withRisk(a, "2026-05-20", "high", "watch");
    expect(riskImprovedCount([a], "2026-05-01", "2026-05-31")).toBe(0);
  });

  it("unchanged does not count", () => {
    let a = person("A");
    a = withRisk(a, "2026-05-01", "watch", "ok");
    a = withRisk(a, "2026-05-20", "ok", "watch");
    // overall level watch → watch: no improvement
    expect(riskImprovedCount([a], "2026-05-01", "2026-05-31")).toBe(0);
  });

  it("single in-window entry cannot count", () => {
    let a = person("A");
    a = withRisk(a, "2026-04-01", "high", "high"); // out of window
    a = withRisk(a, "2026-05-10", "ok", "ok"); // only one in-window
    expect(riskImprovedCount([a], "2026-05-01", "2026-05-31")).toBe(0);
  });

  it("only in-window entries are compared", () => {
    let a = person("A");
    a = withRisk(a, "2026-04-01", "ok", "ok"); // out of window
    a = withRisk(a, "2026-05-05", "high", "high"); // in-window first
    a = withRisk(a, "2026-05-25", "watch", "ok"); // in-window last
    // In-window: high → watch = improvement.
    expect(riskImprovedCount([a], "2026-05-01", "2026-05-31")).toBe(1);
  });
});

// ─── Rapport direction ────────────────────────────────────────

describe("buildRapportDirection + rapportDirectionText", () => {
  function seededList(): Collaborateur[] {
    let a = person("Yasmine Benkirane", "Alpha");
    a = withRisk(a, "2026-05-01", "high", "watch");
    a = withMood(a, "2026-05-01", 4);
    a = {
      ...a,
      absenceEntries: [{ id: "abs", date: "2026-05-10", days: 3 }],
      riskEntries: [
        ...a.riskEntries,
        { id: "r2", date: "2026-05-20", flightRisk: "ok" as const, burnoutRisk: "ok" as const },
      ],
    };
    // Clinical note that must NEVER leak into the rapport:
    a = {
      ...a,
      checkIns: [
        {
          id: "k",
          date: "2026-05-12",
          channel: "call",
          summary: "Evoque un conflit avec son manager, pleurs en fin d'appel",
          seemed: "Très affectée",
        },
      ],
    };
    const b = withMood(person("B", "Beta"), "2026-05-01", 8);
    return [a, b];
  }

  it("aggregates hand-checked numbers", () => {
    const r = buildRapportDirection(
      seededList(),
      { from: "2026-05-01", to: "2026-05-31" },
      "2026-06-01T00:00:00.000Z"
    );
    expect(r.headcount).toBe(2);
    expect(r.risk).toEqual({ high: 0, watch: 0, ok: 1, none: 1 });
    expect(r.absenceDays).toBe(3);
    expect(r.departures).toBe(0);
    expect(r.riskImproved).toBe(1); // high → ok in window
    expect(r.climate).toEqual([
      { team: "Alpha", average: 4, memberCount: 1 },
      { team: "Beta", average: 8, memberCount: 1 },
    ]);
  });

  it("text output contains NO names and NO clinical notes", () => {
    const r = buildRapportDirection(seededList(), {
      from: "2026-05-01",
      to: "2026-05-31",
    });
    const text = rapportDirectionText(r);
    expect(text).not.toContain("Yasmine");
    expect(text).not.toContain("Benkirane");
    expect(text).not.toContain("conflit");
    expect(text).not.toContain("pleurs");
    expect(text).not.toContain("Très affectée");
    // And it does contain the aggregates:
    expect(text).toContain("Jours d'absence sur la période : 3");
    expect(text).toContain("dont le risque s'est amélioré : 1");
    expect(text).toContain("anonymisée");
  });
});

// ─── CRUD via pure mutations ──────────────────────────────────

describe("mutations", () => {
  it("addMoodEntry / addRiskEntry / addAbsenceEntry append records", () => {
    const c = person("A");
    let list = [c];
    list = addMoodEntry(list, c.id, { date: "2026-05-01", functioning: 6 });
    list = addRiskEntry(list, c.id, {
      date: "2026-05-01",
      flightRisk: "ok",
      burnoutRisk: "watch",
    });
    list = addAbsenceEntry(list, c.id, { date: "2026-05-02", days: 1 });
    expect(list[0].moodEntries).toHaveLength(1);
    expect(list[0].riskEntries).toHaveLength(1);
    expect(list[0].absenceEntries).toHaveLength(1);
  });

  it("setDeparture closes the dossier; clearing reactivates", () => {
    const c = person("A");
    let list = setDeparture([c], c.id, {
      date: "2026-05-15",
      reason: "Démission",
    });
    expect(list[0].status).toBe("clos");
    list = setDeparture(list, c.id, null);
    expect(list[0].status).toBe("actif");
    expect(list[0].departure).toBeNull();
  });

  it("assignment add / toggle / remove", () => {
    const c = person("A");
    let list = addAssignment([c], c.id, { text: "Lire la fiche sommeil" });
    const aId = list[0].assignments[0].id;
    expect(list[0].assignments[0].done).toBe(false);
    list = toggleAssignment(list, c.id, aId);
    expect(list[0].assignments[0].done).toBe(true);
    list = toggleAssignment(list, c.id, aId);
    expect(list[0].assignments[0].done).toBe(false);
    list = removeAssignment(list, c.id, aId);
    expect(list[0].assignments).toEqual([]);
  });

  it("addCheckIn appends a contact record", () => {
    const c = person("A");
    const list = addCheckIn([c], c.id, {
      date: "2026-05-10",
      channel: "whatsapp",
      summary: "Prise de nouvelles",
      seemed: "Détendue",
    });
    expect(list[0].checkIns).toHaveLength(1);
    expect(list[0].checkIns[0].channel).toBe("whatsapp");
  });

  it("patchCollaborateur updates identity fields", () => {
    const c = person("A");
    const list = patchCollaborateur([c], c.id, {
      team: "Nouvelle équipe",
      status: "surveille",
    });
    expect(list[0].team).toBe("Nouvelle équipe");
    expect(list[0].status).toBe("surveille");
  });

  it("addCollaborateur prepends", () => {
    const a = person("A");
    const b = person("B");
    expect(
      addCollaborateur(addCollaborateur([], a), b).map((x) => x.displayName)
    ).toEqual(["B", "A"]);
  });
});

// ─── Sample data ──────────────────────────────────────────────

describe("sample data", () => {
  const TODAY = "2026-05-20";

  it("builds ~10 sample collaborateurs across 4 teams, all flagged", () => {
    const sample = buildSampleCollaborateurs(TODAY);
    expect(sample).toHaveLength(10);
    expect(sample.every((c) => c.isSample)).toBe(true);
    const teams = new Set(sample.map((c) => c.team));
    expect(teams.size).toBe(4);
  });

  it("includes exactly one departure and it is clos", () => {
    const sample = buildSampleCollaborateurs(TODAY);
    const departed = sample.filter((c) => c.departure !== null);
    expect(departed).toHaveLength(1);
    expect(departed[0].status).toBe("clos");
  });

  it("every non-clos sample has mood history (dashboard populated)", () => {
    const sample = buildSampleCollaborateurs(TODAY);
    for (const c of sample) {
      expect(c.moodEntries.length).toBeGreaterThanOrEqual(4);
      expect(c.riskEntries.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("dates are deterministic for a fixed today", () => {
    const a = buildSampleCollaborateurs(TODAY);
    const b = buildSampleCollaborateurs(TODAY);
    expect(a.map((c) => c.moodEntries.map((m) => m.date))).toEqual(
      b.map((c) => c.moodEntries.map((m) => m.date))
    );
  });

  it("hasSampleData / clearSampleData separate demo from real", () => {
    const real = person("Réel");
    const mixed = [...buildSampleCollaborateurs(TODAY), real];
    expect(hasSampleData(mixed)).toBe(true);
    const cleared = clearSampleData(mixed);
    expect(cleared).toHaveLength(1);
    expect(cleared[0].displayName).toBe("Réel");
    expect(hasSampleData(cleared)).toBe(false);
  });
});

// ─── Export / import ──────────────────────────────────────────

describe("export → import round-trip", () => {
  it("preserves collaborateurs and séances", () => {
    let a = person("A");
    a = withMood(a, "2026-05-01", 6);
    const seances = [{ id: "s1", dossierId: a.id }];
    const exported = buildDatasetExport([a], seances, "2026-05-20T10:00:00Z");
    const json = JSON.stringify(exported);
    const imported = parseDatasetImport(json);
    expect(imported).not.toBeNull();
    expect(imported!.collaborateurs).toEqual([a]);
    expect(imported!.seances).toEqual(seances);
    expect(imported!.exportedAt).toBe("2026-05-20T10:00:00Z");
  });

  it("rejects malformed payloads", () => {
    expect(parseDatasetImport("not json")).toBeNull();
    expect(parseDatasetImport("{}")).toBeNull();
    expect(
      parseDatasetImport(
        JSON.stringify({ format: "something-else", version: 1 })
      )
    ).toBeNull();
    expect(
      parseDatasetImport(
        JSON.stringify({
          format: "eyla-therapist-dataset",
          version: 2,
          collaborateurs: [],
          seances: [],
        })
      )
    ).toBeNull();
  });
});

// ─── Persistence ──────────────────────────────────────────────

describe("persistence", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") window.localStorage.clear();
  });

  it("save / load round-trip under eyla-collaborateurs-v1", () => {
    const a = person("A");
    saveCollaborateurs([a]);
    expect(loadCollaborateurs()).toEqual([a]);
    expect(
      window.localStorage.getItem(COLLABORATEURS_STORAGE_KEY)
    ).toBeTruthy();
  });
});
