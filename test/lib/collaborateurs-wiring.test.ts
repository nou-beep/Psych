// Wiring assertions for the caseload cockpit — page-source checks in
// the same style as today-portals.test.ts, plus the parked-client
// contract.

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { t } from "@/lib/i18n";

function src(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("Caseload cockpit wiring", () => {
  it("therapist dashboard mounts the CaseloadDashboard", () => {
    const page = src("app/therapist/page.tsx");
    expect(page).toContain("CaseloadDashboard");
  });

  it("roster + case detail + rapport routes exist", () => {
    expect(() => src("app/therapist/collaborateurs/page.tsx")).not.toThrow();
    expect(() =>
      src("app/therapist/collaborateurs/[id]/page.tsx")
    ).not.toThrow();
    expect(() => src("app/therapist/rapport-direction/page.tsx")).not.toThrow();
  });

  it("case detail reuses the Séance model with context 'therapist'", () => {
    const page = src("app/therapist/collaborateurs/[id]/page.tsx");
    expect(page).toContain('context: "therapist"');
    expect(page).toContain("seancesForDossier");
    expect(page).toContain("assembleSeanceText");
  });

  it("case detail reuses SchemaButtonGroup, MemoryRail, SideSheet and LongitudinalChart", () => {
    const page = src("app/therapist/collaborateurs/[id]/page.tsx");
    expect(page).toContain("SchemaButtonGroup");
    expect(page).toContain("MemoryRail");
    expect(page).toContain("SideSheet");
    expect(page).toContain("LongitudinalChart");
  });

  it("sidebar exposes Collaborateurs + Rapport direction in the Clinical group", async () => {
    const { THERAPIST_NAV } = await import("@/components/layout/sidebar-nav");
    const hrefs = THERAPIST_NAV.flatMap((g) => g.items.map((i) => i.href));
    expect(hrefs).toContain("/therapist/collaborateurs");
    expect(hrefs).toContain("/therapist/rapport-direction");
  });
});

describe("Client portal is parked, not deleted", () => {
  it("gateway no longer renders a client card", () => {
    const gateway = src("app/page.tsx");
    // The active CARDS array must not declare the client entry —
    // it survives only inside the restore comment.
    const activeCode = gateway
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("//"))
      .join("\n");
    expect(activeCode).not.toContain('id: "client"');
    // Restore instructions are documented.
    expect(gateway).toContain("PARKED");
  });

  it("client routes still exist on disk (reversible)", () => {
    expect(() => src("app/client/page.tsx")).not.toThrow();
    expect(() => src("app/login/client/page.tsx")).not.toThrow();
  });
});

describe("Pinned terminology stays clean (FR)", () => {
  it("new collab strings avoid Patient / Portail / Compte rendu", () => {
    const keys = [
      "collab.rosterTitle",
      "collab.rosterDesc",
      "collab.dashboard.riskOverviewTitle",
      "collab.dashboard.climateTitle",
      "collab.dashboard.impactTitle",
      "collab.rapport.title",
      "collab.rapport.desc",
      "collab.journal.title",
      "collab.safety.desc",
    ];
    for (const key of keys) {
      const fr = t(key, "fr");
      expect(fr).not.toMatch(/\bPatient\b/i);
      expect(fr).not.toMatch(/\bPortail\b/i);
      expect(fr).not.toMatch(/compte rendu/i);
    }
  });

  it("uses the pinned new terms", () => {
    expect(t("collab.risk.label", "fr")).toBe("Niveau de risque");
    expect(t("collab.dashboard.climateTitle", "fr")).toBe("Climat par équipe");
    expect(t("collab.journal.title", "fr")).toBe("Journal de contact");
    expect(t("collab.rapport.title", "fr")).toBe("Rapport direction");
    expect(t("collab.fields.status", "fr")).toBe("Statut");
  });

  it("EN parallels exist (no fallback to key)", () => {
    expect(t("collab.rosterTitle", "en")).toBe("Team members");
    expect(t("collab.rapport.title", "en")).toBe("Management report");
    expect(t("collab.journal.title", "en")).toBe("Contact log");
  });
});
