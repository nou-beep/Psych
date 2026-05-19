// Tests for the three-portal architecture: portal detection, path
// helpers, sidebar nav per portal, gateway card presence.

import { describe, it, expect } from "vitest";
import {
  homePathFor,
  loginPathFor,
  portalForRoute,
  isPublicRoute,
} from "@/lib/auth";
import {
  FORMATION_NAV,
  THERAPIST_NAV,
  CLIENT_NAV,
  navForPortal,
} from "@/components/layout/sidebar-nav";

describe("homePathFor / loginPathFor — Formation portal", () => {
  it("homePathFor routes each portal to its dashboard", () => {
    expect(homePathFor("formation")).toBe("/formation");
    expect(homePathFor("therapist")).toBe("/therapist");
    expect(homePathFor("client")).toBe("/client");
  });

  it("loginPathFor routes each portal to its login screen", () => {
    expect(loginPathFor("formation")).toBe("/login/formation");
    expect(loginPathFor("therapist")).toBe("/login/therapist");
    expect(loginPathFor("client")).toBe("/login/client");
  });
});

describe("portalForRoute — route prefix detection", () => {
  it("returns null for public routes", () => {
    expect(portalForRoute("/")).toBeNull();
    expect(portalForRoute("/welcome")).toBeNull();
    expect(portalForRoute("/login/therapist")).toBeNull();
    expect(portalForRoute("/login/formation")).toBeNull();
    expect(portalForRoute("/login/client")).toBeNull();
  });

  it("returns 'client' for /client and nested client routes", () => {
    expect(portalForRoute("/client")).toBe("client");
    expect(portalForRoute("/client/calendar")).toBe("client");
    expect(portalForRoute("/client/workbooks/anxiety")).toBe("client");
    expect(portalForRoute("/client/assigned")).toBe("client");
  });

  it("returns 'formation' for the Formation route tree", () => {
    expect(portalForRoute("/formation")).toBe("formation");
    expect(portalForRoute("/formation/dashboard")).toBe("formation");
  });

  it("returns 'formation' for thesis / internship / research routes", () => {
    expect(portalForRoute("/thesis")).toBe("formation");
    expect(portalForRoute("/thesis/writer")).toBe("formation");
    expect(portalForRoute("/internship")).toBe("formation");
    expect(portalForRoute("/internship/cases/abc123")).toBe("formation");
    expect(portalForRoute("/research")).toBe("formation");
    expect(portalForRoute("/research/literature")).toBe("formation");
    expect(portalForRoute("/transcripts")).toBe("formation");
    expect(portalForRoute("/supervision")).toBe("formation");
    expect(portalForRoute("/grids")).toBe("formation");
  });

  it("returns 'therapist' for clinical routes", () => {
    expect(portalForRoute("/therapist")).toBe("therapist");
    expect(portalForRoute("/cases")).toBe("therapist");
    expect(portalForRoute("/cases/case-id-123")).toBe("therapist");
    expect(portalForRoute("/assessments")).toBe("therapist");
    expect(portalForRoute("/reports")).toBe("therapist");
    expect(portalForRoute("/clinical")).toBe("therapist");
    expect(portalForRoute("/clinical/worksheets")).toBe("therapist");
    expect(portalForRoute("/checkins")).toBe("therapist");
    expect(portalForRoute("/goals")).toBe("therapist");
  });

  it("does not confuse prefix overlap (/clientele vs /client)", () => {
    expect(portalForRoute("/clientele")).toBe("therapist");
    expect(portalForRoute("/thesis-old")).toBe("therapist");
    expect(portalForRoute("/internshipx")).toBe("therapist");
  });

  it("isPublicRoute matches the same set as portalForRoute === null", () => {
    const pubs = ["/", "/welcome", "/login/therapist", "/login/client", "/login/formation"];
    for (const p of pubs) {
      expect(isPublicRoute(p)).toBe(true);
      expect(portalForRoute(p)).toBeNull();
    }
  });
});

describe("sidebar nav per portal", () => {
  it("navForPortal returns the matching config", () => {
    expect(navForPortal("formation")).toBe(FORMATION_NAV);
    expect(navForPortal("therapist")).toBe(THERAPIST_NAV);
    expect(navForPortal("client")).toBe(CLIENT_NAV);
  });

  it("Formation sidebar has Thesis and Internship sections", () => {
    const labels = FORMATION_NAV.map((g) => g.label);
    expect(labels).toContain("Thesis");
    expect(labels).toContain("Internship");
  });

  it("Therapist sidebar omits thesis/internship/research routes", () => {
    const hrefs = THERAPIST_NAV.flatMap((g) =>
      g.items.map((i) => i.href)
    );
    expect(hrefs).not.toContain("/thesis");
    expect(hrefs).not.toContain("/thesis/writer");
    expect(hrefs).not.toContain("/internship");
    expect(hrefs).not.toContain("/research");
    expect(hrefs).not.toContain("/grids");
    expect(hrefs).not.toContain("/supervision");
  });

  it("Therapist sidebar still has its clinical surface", () => {
    const hrefs = THERAPIST_NAV.flatMap((g) =>
      g.items.map((i) => i.href)
    );
    expect(hrefs).toContain("/therapist");
    expect(hrefs).toContain("/cases");
    expect(hrefs).toContain("/assessments");
    expect(hrefs).toContain("/reports");
    expect(hrefs).toContain("/clinical");
  });

  it("Client sidebar has the simpler structured set", () => {
    const hrefs = CLIENT_NAV.flatMap((g) => g.items.map((i) => i.href));
    expect(hrefs).toContain("/client");
    expect(hrefs).toContain("/client/calendar");
    expect(hrefs).toContain("/client/assigned");
    expect(hrefs).toContain("/client/assessments");
    expect(hrefs).toContain("/client/workbooks");
  });

  it("Client sidebar has no therapist or formation routes", () => {
    const hrefs = CLIENT_NAV.flatMap((g) => g.items.map((i) => i.href));
    for (const href of hrefs) {
      expect(href.startsWith("/client")).toBe(true);
    }
  });

  it("nav items have unique label-per-group", () => {
    for (const nav of [FORMATION_NAV, THERAPIST_NAV, CLIENT_NAV]) {
      for (const g of nav) {
        const labels = g.items.map((i) => i.label);
        const unique = new Set(labels);
        expect(unique.size).toBe(labels.length);
      }
    }
  });
});

describe("Entry gateway", () => {
  it("renders three portal cards (formation, therapist, client)", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const src = await fs.readFile(
      path.resolve(process.cwd(), "app/page.tsx"),
      "utf8"
    );
    // The cards array embeds id: "formation" | "therapist" | "client"
    expect(src).toMatch(/id: "formation"/);
    expect(src).toMatch(/id: "therapist"/);
    expect(src).toMatch(/id: "client"/);
  });
});

describe("Login routes", () => {
  it("the formation login page exists and renders LoginScreen", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const src = await fs.readFile(
      path.resolve(process.cwd(), "app/login/formation/page.tsx"),
      "utf8"
    );
    expect(src).toMatch(/portal="formation"/);
  });

  it("the therapist login page renders LoginScreen with the therapist portal", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const src = await fs.readFile(
      path.resolve(process.cwd(), "app/login/therapist/page.tsx"),
      "utf8"
    );
    expect(src).toMatch(/portal="therapist"/);
  });

  it("the client login page renders LoginScreen with the client portal", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const src = await fs.readFile(
      path.resolve(process.cwd(), "app/login/client/page.tsx"),
      "utf8"
    );
    expect(src).toMatch(/portal="client"/);
  });
});
