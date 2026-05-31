// Descriptive clinical bands for PHQ-9 and GAD-7.
// Used to surface band counts on the dashboard — no diagnostic
// claim, no severity scoring inside the analysis pipeline itself.

export type Phq9Band =
  | "minimal"
  | "mild"
  | "moderate"
  | "mod-severe"
  | "severe";

export type Gad7Band = "minimal" | "mild" | "moderate" | "severe";

export const PHQ9_BAND_ORDER: ReadonlyArray<Phq9Band> = [
  "minimal",
  "mild",
  "moderate",
  "mod-severe",
  "severe",
] as const;

export const GAD7_BAND_ORDER: ReadonlyArray<Gad7Band> = [
  "minimal",
  "mild",
  "moderate",
  "severe",
] as const;

export function phq9Band(score: number): Phq9Band | null {
  if (!Number.isFinite(score)) return null;
  if (score < 0 || score > 27) return null;
  if (score <= 4) return "minimal";
  if (score <= 9) return "mild";
  if (score <= 14) return "moderate";
  if (score <= 19) return "mod-severe";
  return "severe";
}

export function gad7Band(score: number): Gad7Band | null {
  if (!Number.isFinite(score)) return null;
  if (score < 0 || score > 21) return null;
  if (score <= 4) return "minimal";
  if (score <= 9) return "mild";
  if (score <= 14) return "moderate";
  return "severe";
}

export function countPhq9Bands(scores: number[]): Record<Phq9Band, number> {
  const out: Record<Phq9Band, number> = {
    minimal: 0,
    mild: 0,
    moderate: 0,
    "mod-severe": 0,
    severe: 0,
  };
  for (const s of scores) {
    const band = phq9Band(s);
    if (band) out[band] += 1;
  }
  return out;
}

export function countGad7Bands(scores: number[]): Record<Gad7Band, number> {
  const out: Record<Gad7Band, number> = {
    minimal: 0,
    mild: 0,
    moderate: 0,
    severe: 0,
  };
  for (const s of scores) {
    const band = gad7Band(s);
    if (band) out[band] += 1;
  }
  return out;
}

// ─── Range edges (for the UI table) ──────────────────────────

export const PHQ9_BAND_RANGES: Record<Phq9Band, string> = {
  minimal: "0–4",
  mild: "5–9",
  moderate: "10–14",
  "mod-severe": "15–19",
  severe: "20–27",
};

export const GAD7_BAND_RANGES: Record<Gad7Band, string> = {
  minimal: "0–4",
  mild: "5–9",
  moderate: "10–14",
  severe: "15–21",
};
