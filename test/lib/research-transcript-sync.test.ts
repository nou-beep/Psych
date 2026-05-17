import { describe, it, expect } from "vitest";
import {
  activeLineAt,
  excerptFromRange,
  formatTimestamp,
  lineIndexAt,
  newTranscriptDocument,
  parseTimestamp,
  parseTranscript,
} from "@/lib/research/transcript-sync";

describe("timestamp parsing", () => {
  it("parses mm:ss and hh:mm:ss", () => {
    expect(parseTimestamp("1:23")).toBe(83);
    expect(parseTimestamp("01:23")).toBe(83);
    expect(parseTimestamp("1:23:45")).toBe(5025);
    expect(parseTimestamp("[1:23]")).toBe(83);
  });

  it("supports fractional seconds", () => {
    expect(parseTimestamp("0:01.500")).toBe(1.5);
  });

  it("returns null for garbage", () => {
    expect(parseTimestamp("abc")).toBeNull();
  });
});

describe("timestamp formatting", () => {
  it("formats mm:ss for short clips", () => {
    expect(formatTimestamp(83)).toBe("1:23");
    expect(formatTimestamp(5)).toBe("0:05");
    expect(formatTimestamp(0)).toBe("0:00");
  });

  it("formats h:mm:ss for hour+ clips", () => {
    expect(formatTimestamp(3725)).toBe("1:02:05");
  });

  it("guards against bad input", () => {
    expect(formatTimestamp(-1)).toBe("0:00");
    expect(formatTimestamp(NaN)).toBe("0:00");
  });
});

describe("transcript parsing", () => {
  it("parses leading-timestamp lines", () => {
    const lines = parseTranscript(`00:00 Therapist: Comment ça va ?
00:05 Client: Je suis fatigué.
00:12 Therapist: Pouvez-vous décrire ?`);
    expect(lines).toHaveLength(3);
    expect(lines[0].speaker).toBe("Therapist");
    expect(lines[0].text).toBe("Comment ça va ?");
    expect(lines[0].start).toBe(0);
    expect(lines[1].start).toBe(5);
    expect(lines[2].start).toBe(12);
  });

  it("parses WebVTT", () => {
    const lines = parseTranscript(`WEBVTT

00:00:00.000 --> 00:00:05.000
Therapist: Hello.

00:00:05.000 --> 00:00:10.000
Client: Hi.`);
    expect(lines).toHaveLength(2);
    expect(lines[0].speaker).toBe("Therapist");
    expect(lines[0].start).toBe(0);
    expect(lines[0].end).toBe(5);
    expect(lines[1].start).toBe(5);
  });

  it("inherits previous start when timestamp missing", () => {
    const lines = parseTranscript(`00:00 A: hi
B: still at zero`);
    expect(lines[1].start).toBe(0);
    expect(lines[1].speaker).toBe("B");
  });

  it("derives end time from next line's start", () => {
    const lines = parseTranscript(`00:00 A: one
00:05 B: two
00:10 C: three`);
    expect(lines[0].end).toBe(5);
    expect(lines[1].end).toBe(10);
    // last line gets +2s fallback
    expect(lines[2].end).toBe(12);
  });

  it("handles plain text without speakers", () => {
    const lines = parseTranscript(`Just a long thought without any timing or speaker label.`);
    expect(lines).toHaveLength(1);
    expect(lines[0].speaker).toBeUndefined();
    expect(lines[0].text).toMatch(/^Just a long thought/);
  });
});

describe("active line lookup", () => {
  const lines = parseTranscript(`00:00 A: hi
00:05 B: there
00:10 C: now`);

  it("finds the active line for a time", () => {
    expect(activeLineAt(lines, 0)?.text).toBe("hi");
    expect(activeLineAt(lines, 4)?.text).toBe("hi");
    expect(activeLineAt(lines, 5)?.text).toBe("there");
    expect(activeLineAt(lines, 11)?.text).toBe("now");
  });

  it("returns null when before the first line", () => {
    expect(activeLineAt([], 5)).toBeNull();
  });

  it("lineIndexAt returns the index", () => {
    expect(lineIndexAt(lines, 5)).toBe(1);
  });
});

describe("excerpt extraction", () => {
  const lines = parseTranscript(`00:00 A: one
00:05 B: two
00:10 C: three
00:15 D: four`);

  it("extracts a range with speakers and timing", () => {
    const ex = excerptFromRange(lines, 1, 2);
    expect(ex).not.toBeNull();
    expect(ex!.startSec).toBe(5);
    expect(ex!.endSec).toBe(15);
    expect(ex!.text).toContain("B: two");
    expect(ex!.text).toContain("C: three");
    expect(ex!.speakers).toEqual(expect.arrayContaining(["B", "C"]));
    expect(ex!.lineIds).toHaveLength(2);
  });

  it("handles reversed indices", () => {
    const ex = excerptFromRange(lines, 2, 0);
    expect(ex).not.toBeNull();
    expect(ex!.startSec).toBe(0);
    // Last line of slice is index 2 ("three" @ 10s), which ends at line 3's start (15s).
    expect(ex!.endSec).toBe(15);
    expect(ex!.lineIds).toHaveLength(3);
  });

  it("returns null for invalid ranges", () => {
    expect(excerptFromRange(lines, -1, 0)).toBeNull();
    expect(excerptFromRange(lines, 0, 99)).not.toBeNull(); // clamps to end
  });
});

describe("transcript document factory", () => {
  it("creates a document with title and parsed lines", () => {
    const doc = newTranscriptDocument(
      "Session 3",
      "00:00 A: hi",
      "session3.mp3"
    );
    expect(doc.title).toBe("Session 3");
    expect(doc.audioFileName).toBe("session3.mp3");
    expect(doc.lines).toHaveLength(1);
  });

  it("falls back to default title on empty input", () => {
    const doc = newTranscriptDocument("  ", "");
    expect(doc.title).toBe("Untitled transcript");
    expect(doc.lines).toEqual([]);
  });
});
