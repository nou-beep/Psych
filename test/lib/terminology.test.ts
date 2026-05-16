import { describe, it, expect } from "vitest";
import { CLIENT_TERMS, TERM_LABELS, resolveTerm, t } from "@/lib/terminology";

describe("terminology resolver", () => {
  it("defaults to Client when no preference is provided", () => {
    expect(resolveTerm(undefined)).toBe("Client");
  });

  it("returns each supported term in title case", () => {
    for (const term of CLIENT_TERMS) {
      expect(resolveTerm(term)).toBe(TERM_LABELS[term]);
    }
  });

  it("supports lowercase + plural casing options", () => {
    expect(resolveTerm("patient", { plural: true })).toBe("Patients");
    expect(resolveTerm("client", { capitalize: false })).toBe("client");
    expect(resolveTerm("participant", { plural: true, capitalize: false })).toBe(
      "participants"
    );
  });
});

describe("t() template substitution", () => {
  it("substitutes {client} and {clients}", () => {
    expect(t("Add a new {client}", "patient")).toBe("Add a new Patient");
    expect(t("{clients} in care", "client")).toBe("Clients in care");
  });

  it("substitutes lowercase variants", () => {
    expect(t("Add a {client_lc}", "client")).toBe("Add a client");
    expect(t("All {clients_lc}", "participant")).toBe("All participants");
  });

  it("returns the template unchanged when no placeholders", () => {
    expect(t("Hello", "client")).toBe("Hello");
  });
});
