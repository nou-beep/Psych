import { describe, it, expect } from "vitest";
import {
  EXPORT_PACKS,
  addSection,
  emptyComposed,
  findPack,
  tableOfContents,
  totalWordCount,
} from "@/lib/export/thesis-packs";

describe("thesis export packs", () => {
  it("ships 10 named packs", () => {
    const ids = EXPORT_PACKS.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "methodology",
        "literature-review",
        "participant-summary",
        "descriptive-statistics",
        "coding-summary",
        "quote-collection",
        "thesis-chapter",
        "appendix",
        "supervisor-review",
        "progress-summary",
      ])
    );
    expect(EXPORT_PACKS).toHaveLength(10);
  });

  it("methodology, literature, chapter packs format APA", () => {
    expect(findPack("methodology")!.apaFormatting).toBe(true);
    expect(findPack("literature-review")!.apaFormatting).toBe(true);
    expect(findPack("thesis-chapter")!.apaFormatting).toBe(true);
  });

  it("composes a pack with sections", () => {
    const pack = findPack("methodology")!;
    let composed = emptyComposed(pack, "Mrini, 2025-2026", "Nouhaila Mrini");
    composed = addSection(composed, {
      id: "pop",
      heading: "Population",
      body: "Échantillon de 52 jeunes adultes recrutés via les réseaux universitaires.",
    });
    composed = addSection(composed, {
      id: "instr",
      heading: "Instruments",
      rows: [
        { label: "CDS", value: "Cambridge Depersonalization Scale" },
        { label: "STAI-Y", value: "State-Trait Anxiety Inventory" },
      ],
    });
    expect(composed.sections).toHaveLength(2);
    expect(totalWordCount(composed)).toBeGreaterThan(10);
  });

  it("tableOfContents includes nested headings with depth", () => {
    const pack = findPack("methodology")!;
    let composed = emptyComposed(pack, "Thesis");
    composed = addSection(composed, {
      id: "ch5",
      heading: "Méthodologie",
      children: [
        { id: "pop", heading: "Population" },
        { id: "instr", heading: "Instruments" },
      ],
    });
    const toc = tableOfContents(composed);
    expect(toc).toHaveLength(3);
    expect(toc[0]).toEqual({ id: "ch5", heading: "Méthodologie", depth: 0 });
    expect(toc[1].depth).toBe(1);
    expect(toc[2].depth).toBe(1);
  });

  it("tableOfContents is empty for packs that don't support TOC", () => {
    const pack = findPack("quote-collection")!;
    expect(pack.tocSupported).toBe(false);
    let composed = emptyComposed(pack, "Quotes");
    composed = addSection(composed, { id: "x", heading: "X" });
    expect(tableOfContents(composed)).toEqual([]);
  });
});
