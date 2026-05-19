// Tests for the Formation Portal cleanup pass: every Formation
// sidebar item lives inside /formation/*, therapist routes are absent,
// the dashboard quick actions stay inside /formation/*, and the
// legacy paths redirect under next.config.mjs.

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  FORMATION_NAV,
  THERAPIST_NAV,
} from "@/components/layout/sidebar-nav";
import { portalForRoute } from "@/lib/auth";

function flatHrefs(nav: typeof FORMATION_NAV): string[] {
  return nav.flatMap((g) => g.items.map((i) => i.href));
}

describe("Formation sidebar — all links live inside /formation", () => {
  it("every Formation href starts with /formation", () => {
    const hrefs = flatHrefs(FORMATION_NAV);
    for (const href of hrefs) {
      expect(href.startsWith("/formation")).toBe(true);
    }
  });

  it("none of the therapist-only routes appear", () => {
    const hrefs = flatHrefs(FORMATION_NAV);
    const therapistOnly = [
      "/cases",
      "/reports",
      "/clinical",
      "/clinical/worksheets",
      "/assessments",
      "/checkins",
      "/goals",
      "/inbox",
      "/formulation",
      "/interventions",
      "/loops",
      "/material",
      "/ethics",
      "/backup",
    ];
    for (const t of therapistOnly) {
      expect(hrefs).not.toContain(t);
    }
  });

  it("uses Formation labels (Overview / Dataset / Stats / Open Work)", () => {
    const labels = FORMATION_NAV.flatMap((g) => g.items.map((i) => i.label));
    expect(labels).toContain("Overview");
    expect(labels).toContain("Dataset / Stats");
    expect(labels).toContain("Open Work");
    // No leftover therapist phrasing
    expect(labels).not.toContain("Thesis Studio");
    expect(labels).not.toContain("Internship Studio");
    expect(labels).not.toContain("Open Loops");
    expect(labels).not.toContain("Dataset / Analytics");
  });

  it("groups the brief's structure: Home · Thesis · Internship · Print/Materials · System", () => {
    const groupLabels = FORMATION_NAV.map((g) => g.label);
    expect(groupLabels).toContain("Home");
    expect(groupLabels).toContain("Thesis");
    expect(groupLabels).toContain("Internship");
    expect(groupLabels).toContain("Print / Materials");
    expect(groupLabels).toContain("System");
  });
});

describe("Therapist sidebar — clean of Formation-only routes", () => {
  it("does not include any /formation/* href", () => {
    const hrefs = flatHrefs(THERAPIST_NAV);
    for (const href of hrefs) {
      expect(href.startsWith("/formation")).toBe(false);
    }
  });

  it("does not include legacy thesis/internship/research/grids/supervision/transcripts", () => {
    const hrefs = flatHrefs(THERAPIST_NAV);
    for (const stale of [
      "/thesis",
      "/thesis/writer",
      "/internship",
      "/research",
      "/research/literature",
      "/transcripts",
      "/supervision",
      "/grids",
    ]) {
      expect(hrefs).not.toContain(stale);
    }
  });
});

describe("Formation dashboard quick actions stay inside /formation", () => {
  it("every quickAction href starts with /formation", () => {
    const src = readFileSync(
      resolve(process.cwd(), "app/formation/page.tsx"),
      "utf8"
    );
    const matches = src.match(/href: "(\/[^"]+)"/g) ?? [];
    const hrefs = matches.map((m) => m.slice('href: "'.length, -1));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href.startsWith("/formation")).toBe(true);
    }
  });

  it("dashboard has no <Link> hrefs that escape /formation", () => {
    const src = readFileSync(
      resolve(process.cwd(), "app/formation/page.tsx"),
      "utf8"
    );
    // Match plain Link href strings — we deliberately exclude template
    // literals (e.g. `${id}`) and external URLs.
    const matches = src.match(/href="(\/[^"]+)"/g) ?? [];
    const hrefs = matches.map((m) => m.slice('href="'.length, -1));
    // Whitelist routes that may legitimately escape (none yet).
    const allowedOutside = new Set<string>([]);
    for (const href of hrefs) {
      if (allowedOutside.has(href)) continue;
      expect(href.startsWith("/formation")).toBe(true);
    }
  });
});

describe("Legacy → Formation redirects are configured", () => {
  it("next.config.mjs declares the canonical redirect map", () => {
    const src = readFileSync(
      resolve(process.cwd(), "next.config.mjs"),
      "utf8"
    );
    for (const [from, to] of [
      ["/thesis", "/formation/thesis"],
      ["/thesis/writer", "/formation/thesis/writer"],
      ["/internship", "/formation/internship"],
      ["/internship/cases/:id", "/formation/internship/cases/:id"],
      ["/research", "/formation/thesis/stats"],
      ["/research/literature", "/formation/thesis/literature"],
      ["/supervision", "/formation/internship/supervision"],
      ["/grids", "/formation/internship/tests-grids"],
      ["/transcripts", "/formation/materials/transcripts"],
      ["/material", "/formation/materials/resources"],
    ]) {
      // Match a complete redirect rule with both source and destination
      // on the same object so we don't get false positives from any
      // overlap between two unrelated rules.
      const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedTo = to.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(
        `source:\\s*"${escapedFrom}"[^}]*destination:\\s*"${escapedTo}"`,
        "s"
      );
      expect(src).toMatch(pattern);
    }
  });
});

describe("portalForRoute — legacy + new Formation paths both resolve", () => {
  it("recognises new /formation/* paths", () => {
    expect(portalForRoute("/formation")).toBe("formation");
    expect(portalForRoute("/formation/thesis")).toBe("formation");
    expect(portalForRoute("/formation/thesis/writer")).toBe("formation");
    expect(portalForRoute("/formation/internship")).toBe("formation");
    expect(portalForRoute("/formation/internship/cases/abc")).toBe(
      "formation"
    );
    expect(portalForRoute("/formation/materials/worksheets")).toBe(
      "formation"
    );
    expect(portalForRoute("/formation/settings")).toBe("formation");
  });

  it("legacy aliases still resolve to formation (during the redirect hop)", () => {
    expect(portalForRoute("/thesis")).toBe("formation");
    expect(portalForRoute("/internship")).toBe("formation");
    expect(portalForRoute("/research")).toBe("formation");
    expect(portalForRoute("/supervision")).toBe("formation");
    expect(portalForRoute("/grids")).toBe("formation");
    expect(portalForRoute("/transcripts")).toBe("formation");
    expect(portalForRoute("/material")).toBe("formation");
  });

  it("therapist routes are untouched", () => {
    expect(portalForRoute("/cases")).toBe("therapist");
    expect(portalForRoute("/assessments")).toBe("therapist");
    expect(portalForRoute("/clinical")).toBe("therapist");
    expect(portalForRoute("/reports")).toBe("therapist");
    expect(portalForRoute("/therapist")).toBe("therapist");
  });
});

describe("Formation route tree — canonical pages exist", () => {
  // Asserting the page.tsx files exist proves the moves landed.
  it.each([
    "app/formation/page.tsx",
    "app/formation/thesis/page.tsx",
    "app/formation/thesis/writer/page.tsx",
    "app/formation/thesis/stats/page.tsx",
    "app/formation/thesis/literature/page.tsx",
    "app/formation/thesis/exports/page.tsx",
    "app/formation/internship/page.tsx",
    "app/formation/internship/cases/page.tsx",
    "app/formation/internship/cases/[id]/page.tsx",
    "app/formation/internship/tests-grids/page.tsx",
    "app/formation/internship/reports/page.tsx",
    "app/formation/internship/supervision/page.tsx",
    "app/formation/materials/worksheets/page.tsx",
    "app/formation/materials/transcripts/page.tsx",
    "app/formation/materials/resources/page.tsx",
    "app/formation/calendar/page.tsx",
    "app/formation/open-work/page.tsx",
    "app/formation/settings/page.tsx",
  ])("%s exists", (path) => {
    expect(() =>
      readFileSync(resolve(process.cwd(), path), "utf8")
    ).not.toThrow();
  });
});
