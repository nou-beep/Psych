// Transcript + audio synchronization.
//
// Parses timestamped transcripts (common formats: WebVTT, [hh:mm:ss],
// "01:23 Speaker:"), exposes lookup by audio time, and helps the UI
// scroll/highlight the active line.

import { generateId, nowISO } from "@/lib/store";

export interface TranscriptLine {
  id: string;
  // Start time in seconds. End may be inferred from next line's start.
  start: number;
  end?: number;
  speaker?: string;
  text: string;
  // Optional codings/excerpt links produced by the analyst.
  excerptIds: string[];
  themeIds: string[];
}

export interface TranscriptDocument {
  id: string;
  title: string;
  audioFileName?: string;
  // Duration in seconds — set by the player once metadata loads.
  durationSec?: number;
  lines: TranscriptLine[];
  createdAt: string;
  updatedAt: string;
}

export const TRANSCRIPT_SYNC_STORAGE_KEY = "psych-transcript-sync-v1";

// ─── Timestamp parsing ────────────────────────────────────────

// Accepts: "1:23", "01:23", "1:23:45", "1:23.456", with optional [].
const TS_RE =
  /^(?:\[)?(?:(\d+):)?(\d{1,2}):(\d{2}(?:\.\d+)?)(?:\])?/;

export function parseTimestamp(token: string): number | null {
  const m = token.match(TS_RE);
  if (!m) return null;
  const h = m[1] ? Number(m[1]) : 0;
  const mins = Number(m[2]);
  const secs = Number(m[3]);
  if (Number.isNaN(h) || Number.isNaN(mins) || Number.isNaN(secs))
    return null;
  return h * 3600 + mins * 60 + secs;
}

export function formatTimestamp(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

// Parses a raw transcript text into lines. Accepted formats:
//
//   1) WebVTT-ish: "00:00:01.000 --> 00:00:05.000\nSpeaker: text"
//   2) Bracketed:  "[00:01:23] Speaker: text"
//   3) Leading TS: "01:23 Speaker: text"
//   4) Speaker:    "Speaker: text"  (no timestamps)
//
// Any line without a parseable timestamp inherits the previous start.
export function parseTranscript(raw: string): TranscriptLine[] {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  // Strip a leading "WEBVTT" header if present.
  const cleaned = text.replace(/^WEBVTT[^\n]*\n+/i, "").trim();

  // Split into entries by double-newline (vtt-style) — but also handle
  // plain transcripts split per line.
  const entries =
    cleaned.includes("\n\n") && /-->/i.test(cleaned)
      ? cleaned.split(/\n\n+/)
      : cleaned.split(/\n+/);

  const lines: TranscriptLine[] = [];
  let lastStart = 0;
  let lastEnd: number | undefined = undefined;

  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    // WebVTT-style: "00:00:01.000 --> 00:00:05.000\ntext"
    const vttMatch = trimmed.match(
      /(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)\s*\n([\s\S]*)/
    );
    if (vttMatch) {
      const start = parseTimestamp(vttMatch[1]) ?? lastStart;
      const end = parseTimestamp(vttMatch[2]) ?? undefined;
      const body = vttMatch[3].trim();
      const { speaker, text: clean } = splitSpeaker(body);
      lines.push({
        id: generateId(),
        start,
        end,
        speaker,
        text: clean,
        excerptIds: [],
        themeIds: [],
      });
      lastStart = start;
      lastEnd = end;
      continue;
    }

    // Single-line with leading timestamp (with or without brackets).
    const leadMatch = trimmed.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+(.*)$/);
    if (leadMatch) {
      const start = parseTimestamp(leadMatch[1]) ?? lastStart;
      const body = leadMatch[2].trim();
      const { speaker, text: clean } = splitSpeaker(body);
      lines.push({
        id: generateId(),
        start,
        speaker,
        text: clean,
        excerptIds: [],
        themeIds: [],
      });
      lastStart = start;
      lastEnd = undefined;
      continue;
    }

    // No timestamp — inherit previous start.
    const { speaker, text: clean } = splitSpeaker(trimmed);
    if (!clean) continue;
    lines.push({
      id: generateId(),
      start: lastStart,
      end: lastEnd,
      speaker,
      text: clean,
      excerptIds: [],
      themeIds: [],
    });
  }

  // Compute end times: each line ends at the next line's start (or 2s
  // after start as a soft default for the last line).
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].end === undefined) lines[i].end = lines[i + 1].start;
  }
  if (lines.length > 0 && lines[lines.length - 1].end === undefined) {
    lines[lines.length - 1].end = lines[lines.length - 1].start + 2;
  }

  return lines;
}

function splitSpeaker(body: string): { speaker?: string; text: string } {
  // "Speaker: text" — split on the FIRST colon if the speaker looks
  // like a short label (no spaces > 4 tokens). Use [\s\S] for
  // dot-matches-all to stay ES5-compatible.
  const m = body.match(/^([^:\n]{1,80}):\s*([\s\S]+)$/);
  if (!m) return { text: body };
  const speakerCandidate = m[1].trim();
  // Reject anything that looks like a sentence rather than a label.
  if (speakerCandidate.split(/\s+/).length > 5) return { text: body };
  return { speaker: speakerCandidate, text: m[2].trim() };
}

// ─── Lookup ────────────────────────────────────────────────────

export function activeLineAt(
  lines: TranscriptLine[],
  seconds: number
): TranscriptLine | null {
  if (!lines.length) return null;
  // Binary search since lines are sorted by start.
  let lo = 0;
  let hi = lines.length - 1;
  let best: TranscriptLine | null = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const l = lines[mid];
    if (l.start <= seconds) {
      best = l;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (!best) return null;
  if (best.end !== undefined && seconds > best.end) return null;
  return best;
}

export function lineIndexAt(
  lines: TranscriptLine[],
  seconds: number
): number {
  const line = activeLineAt(lines, seconds);
  if (!line) return -1;
  return lines.findIndex((l) => l.id === line.id);
}

// ─── Excerpt extraction ───────────────────────────────────────

export interface ExtractedExcerpt {
  startSec: number;
  endSec: number;
  text: string;
  speakers: string[];
  lineIds: string[];
}

export function excerptFromRange(
  lines: TranscriptLine[],
  fromIndex: number,
  toIndex: number
): ExtractedExcerpt | null {
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= lines.length) return null;
  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  const slice = lines.slice(start, end + 1);
  if (slice.length === 0) return null;
  const text = slice
    .map((l) => (l.speaker ? `${l.speaker}: ${l.text}` : l.text))
    .join("\n");
  const speakers = Array.from(
    new Set(slice.map((l) => l.speaker).filter(Boolean))
  ) as string[];
  return {
    startSec: slice[0].start,
    endSec: slice[slice.length - 1].end ?? slice[slice.length - 1].start,
    text,
    speakers,
    lineIds: slice.map((l) => l.id),
  };
}

// ─── Document factory ─────────────────────────────────────────

export function newTranscriptDocument(
  title: string,
  raw: string,
  audioFileName?: string
): TranscriptDocument {
  const now = nowISO();
  return {
    id: generateId(),
    title: title.trim() || "Untitled transcript",
    audioFileName,
    lines: parseTranscript(raw),
    createdAt: now,
    updatedAt: now,
  };
}
