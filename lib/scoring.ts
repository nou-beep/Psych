// Questionnaire scoring + descriptive / correlation statistics.
// Pure functions. Complement to existing utils in lib/thesis-data.ts.

// ── Generic descriptives ────────────────────────────────────────

export interface Descriptives {
  n: number;
  mean: number;
  median: number;
  sd: number;
  min: number;
  max: number;
  range: number;
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance =
    arr.reduce((a, b) => a + (b - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

export function describe(values: Array<number | null | undefined>): Descriptives {
  const cleaned = values.filter(
    (v): v is number => typeof v === "number" && !Number.isNaN(v)
  );
  if (cleaned.length === 0) {
    return { n: 0, mean: 0, median: 0, sd: 0, min: 0, max: 0, range: 0 };
  }
  const min = Math.min(...cleaned);
  const max = Math.max(...cleaned);
  return {
    n: cleaned.length,
    mean: round(mean(cleaned)),
    median: round(median(cleaned)),
    sd: round(stdDev(cleaned)),
    min,
    max,
    range: max - min,
  };
}

export function round(value: number, digits = 2): number {
  if (Number.isNaN(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

// ── Frequencies ────────────────────────────────────────────────

export interface FrequencyRow {
  value: string;
  count: number;
  percent: number;
}

export function frequencies(
  values: Array<string | number | null | undefined>
): FrequencyRow[] {
  const cleaned = values.filter(
    (v): v is string | number => v !== null && v !== undefined && v !== ""
  );
  const map = new Map<string, number>();
  for (const v of cleaned) {
    const key = String(v);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  const total = cleaned.length;
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({
      value,
      count,
      percent: total === 0 ? 0 : round((count / total) * 100, 1),
    }));
}

// ── Pearson correlation matrix ─────────────────────────────────

export function pearson(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  const mx = mean(x.slice(0, n));
  const my = mean(y.slice(0, n));
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
    dy += (y[i] - my) ** 2;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : round(num / den, 3);
}

// Pairs values across variables, skipping rows where any variable is null.
export function correlationMatrix(
  rows: Array<Record<string, number | null | undefined>>,
  variables: string[]
): Array<{ a: string; b: string; r: number; n: number }> {
  const result: Array<{ a: string; b: string; r: number; n: number }> = [];
  for (let i = 0; i < variables.length; i++) {
    for (let j = i + 1; j < variables.length; j++) {
      const a = variables[i];
      const b = variables[j];
      const xs: number[] = [];
      const ys: number[] = [];
      for (const row of rows) {
        const xv = row[a];
        const yv = row[b];
        if (typeof xv === "number" && typeof yv === "number") {
          xs.push(xv);
          ys.push(yv);
        }
      }
      result.push({ a, b, r: pearson(xs, ys), n: xs.length });
    }
  }
  return result;
}

// ── PHQ-9 scoring ──────────────────────────────────────────────

// PHQ-9: 9 items, each 0–3. Total ranges 0–27.
export interface PHQ9Result {
  total: number;
  itemCount: number;
  severity:
    | "Minimal"
    | "Mild"
    | "Moderate"
    | "Moderately severe"
    | "Severe"
    | "Incomplete";
  flags: { item9SuicideRisk: boolean };
}

export function scorePHQ9(items: Array<number | null | undefined>): PHQ9Result {
  if (items.length !== 9) {
    throw new Error(`PHQ-9 expects exactly 9 items, got ${items.length}`);
  }
  const cleaned = items.map((v) =>
    typeof v === "number" && v >= 0 && v <= 3 ? v : null
  );
  const valid = cleaned.filter((v): v is number => v !== null);
  if (valid.length < 9) {
    return {
      total: valid.reduce((a, b) => a + b, 0),
      itemCount: valid.length,
      severity: "Incomplete",
      flags: {
        item9SuicideRisk: typeof cleaned[8] === "number" && cleaned[8]! > 0,
      },
    };
  }
  const total = valid.reduce((a, b) => a + b, 0);
  let severity: PHQ9Result["severity"];
  if (total <= 4) severity = "Minimal";
  else if (total <= 9) severity = "Mild";
  else if (total <= 14) severity = "Moderate";
  else if (total <= 19) severity = "Moderately severe";
  else severity = "Severe";
  return {
    total,
    itemCount: 9,
    severity,
    flags: { item9SuicideRisk: cleaned[8]! > 0 },
  };
}

// ── GAD-7 scoring ──────────────────────────────────────────────

export interface GAD7Result {
  total: number;
  itemCount: number;
  severity: "Minimal" | "Mild" | "Moderate" | "Severe" | "Incomplete";
}

export function scoreGAD7(items: Array<number | null | undefined>): GAD7Result {
  if (items.length !== 7) {
    throw new Error(`GAD-7 expects exactly 7 items, got ${items.length}`);
  }
  const cleaned = items.map((v) =>
    typeof v === "number" && v >= 0 && v <= 3 ? v : null
  );
  const valid = cleaned.filter((v): v is number => v !== null);
  if (valid.length < 7) {
    return {
      total: valid.reduce((a, b) => a + b, 0),
      itemCount: valid.length,
      severity: "Incomplete",
    };
  }
  const total = valid.reduce((a, b) => a + b, 0);
  let severity: GAD7Result["severity"];
  if (total <= 4) severity = "Minimal";
  else if (total <= 9) severity = "Mild";
  else if (total <= 14) severity = "Moderate";
  else severity = "Severe";
  return { total, itemCount: 7, severity };
}

// ── Custom scale (sum of items) ───────────────────────────────

export function scoreSum(
  items: Array<number | null | undefined>,
  opts: { allowMissing?: boolean } = {}
): { total: number; itemCount: number; incomplete: boolean } {
  const valid = items.filter(
    (v): v is number => typeof v === "number" && !Number.isNaN(v)
  );
  const incomplete = valid.length !== items.length;
  if (incomplete && !opts.allowMissing) {
    return { total: 0, itemCount: valid.length, incomplete: true };
  }
  return {
    total: valid.reduce((a, b) => a + b, 0),
    itemCount: valid.length,
    incomplete,
  };
}

// ── Data quality checks ────────────────────────────────────────

export interface QualityIssue {
  participantCode: string;
  issue: string;
  field?: string;
}

export interface QualityCheckRow {
  code: string;
  [key: string]: unknown;
}

export interface QualityRules {
  // For each field, the valid inclusive range, or "required"
  fields: Record<string, { min?: number; max?: number; required?: boolean }>;
}

export function findDuplicateIds(rows: QualityCheckRow[]): string[] {
  const seen = new Map<string, number>();
  for (const r of rows) {
    seen.set(r.code, (seen.get(r.code) ?? 0) + 1);
  }
  return Array.from(seen.entries())
    .filter(([, count]) => count > 1)
    .map(([code]) => code);
}

export function findMissing(
  rows: QualityCheckRow[],
  fields: string[]
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  for (const r of rows) {
    for (const field of fields) {
      const v = r[field];
      if (v === null || v === undefined || v === "") {
        issues.push({
          participantCode: r.code,
          issue: `Missing ${field}`,
          field,
        });
      }
    }
  }
  return issues;
}

export function findImpossibleValues(
  rows: QualityCheckRow[],
  rules: QualityRules
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  for (const r of rows) {
    for (const [field, rule] of Object.entries(rules.fields)) {
      const v = r[field];
      if (v === null || v === undefined) continue;
      if (typeof v !== "number") continue;
      if (typeof rule.min === "number" && v < rule.min) {
        issues.push({
          participantCode: r.code,
          issue: `${field} = ${v} is below allowed minimum ${rule.min}`,
          field,
        });
      }
      if (typeof rule.max === "number" && v > rule.max) {
        issues.push({
          participantCode: r.code,
          issue: `${field} = ${v} is above allowed maximum ${rule.max}`,
          field,
        });
      }
    }
  }
  return issues;
}

// ── CSV helpers ────────────────────────────────────────────────

// Minimal CSV parse: comma separator, double-quote escape via "".
// No support for embedded newlines inside quoted fields — keep it
// simple and predictable for typical research exports.
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    if (rawLine === "" && rows.length > 0) {
      // skip trailing blank lines
      continue;
    }
    const cells: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < rawLine.length; i++) {
      const ch = rawLine[i];
      if (inQuotes) {
        if (ch === '"' && rawLine[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          cur += ch;
        }
      } else {
        if (ch === ",") {
          cells.push(cur);
          cur = "";
        } else if (ch === '"' && cur === "") {
          inQuotes = true;
        } else {
          cur += ch;
        }
      }
    }
    cells.push(cur);
    rows.push(cells);
  }
  return rows;
}

export function toCSV(headers: string[], rows: Array<Array<string | number | null | undefined>>): string {
  const escape = (v: string | number | null | undefined): string => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const out: string[] = [];
  out.push(headers.map(escape).join(","));
  for (const row of rows) out.push(row.map(escape).join(","));
  return out.join("\n");
}
