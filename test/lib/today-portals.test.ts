// Asserts the Today layer is mounted on every portal home page.
// Reads the actual page source so test failures point at the right
// surface if someone removes the wiring.

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

function pageSrc(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("Today layer is wired into every portal home", () => {
  it("Formation home renders TodayPanel from computeFormationToday", () => {
    const src = pageSrc("app/formation/page.tsx");
    expect(src).toContain("TodayPanel");
    expect(src).toContain("computeFormationToday");
  });

  it("Therapist home renders TodayPanel from computeTherapistToday", () => {
    const src = pageSrc("app/therapist/page.tsx");
    expect(src).toContain("TodayPanel");
    expect(src).toContain("computeTherapistToday");
  });

  it("Client home renders TodayPanel from computeClientToday", () => {
    const src = pageSrc("app/client/page.tsx");
    expect(src).toContain("TodayPanel");
    expect(src).toContain("computeClientToday");
  });
});

describe("MemoryRail is wired into clinician-facing portals", () => {
  it("Formation home renders the MemoryRail", () => {
    expect(pageSrc("app/formation/page.tsx")).toContain("MemoryRail");
  });

  it("Therapist home renders the MemoryRail", () => {
    expect(pageSrc("app/therapist/page.tsx")).toContain("MemoryRail");
  });

  it("Client home does NOT mount the MemoryRail — too academic for the client surface", () => {
    expect(pageSrc("app/client/page.tsx")).not.toContain("MemoryRail");
  });
});
