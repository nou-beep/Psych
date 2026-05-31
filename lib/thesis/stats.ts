// Pure statistics for the thesis data-analysis workspace.
//
// Every function is deterministic, takes plain arrays, and guards
// against small-n / NaN. Numerical sensitive paths (lgamma,
// incomplete beta) use textbook implementations — Lanczos for
// log-gamma, Lentz's continued fraction for the regularized
// incomplete beta. p-values come from the Student t CDF.
//
// Conventions:
// - Sample SD uses n-1 denominator.
// - Sample skewness uses the adjusted Fisher-Pearson coefficient
//   (G1 = n / ((n-1)(n-2)) * Σ((x - x̄)/s)^3) — matches R's e1071
//   `type = 2`, Excel SKEW, and Jamovi default.
// - Spearman handles ties via average ranks.
// - "insufficient data" semantics: callers handle the null returns.

// ─── Basic descriptives ──────────────────────────────────────

export function mean(xs: number[]): number | null {
  if (xs.length === 0) return null;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

/** Sample standard deviation, n-1 denominator. Requires n ≥ 2. */
export function sampleSD(xs: number[]): number | null {
  const n = xs.length;
  if (n < 2) return null;
  const m = mean(xs)!;
  let acc = 0;
  for (const x of xs) {
    const d = x - m;
    acc += d * d;
  }
  return Math.sqrt(acc / (n - 1));
}

export function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const sorted = [...xs].sort((a, b) => a - b);
  const n = sorted.length;
  if (n % 2 === 1) return sorted[(n - 1) / 2];
  return (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

export function min(xs: number[]): number | null {
  if (xs.length === 0) return null;
  let m = xs[0];
  for (const x of xs) if (x < m) m = x;
  return m;
}

export function max(xs: number[]): number | null {
  if (xs.length === 0) return null;
  let m = xs[0];
  for (const x of xs) if (x > m) m = x;
  return m;
}

/**
 * Adjusted Fisher-Pearson sample skewness (G1).
 * Returns null for n < 3 or when SD is zero.
 */
export function skewness(xs: number[]): number | null {
  const n = xs.length;
  if (n < 3) return null;
  const m = mean(xs)!;
  const s = sampleSD(xs)!;
  if (s === 0) return null;
  let acc = 0;
  for (const x of xs) {
    const z = (x - m) / s;
    acc += z * z * z;
  }
  return (n / ((n - 1) * (n - 2))) * acc;
}

// ─── Ranks with average-tie correction ───────────────────────

/**
 * Returns ranks (1-indexed). Tied values receive the average of
 * their tied positions — the convention Spearman expects.
 * Example: [2, 4, 4, 5, 5] → [1, 2.5, 2.5, 4.5, 4.5].
 */
export function ranks(xs: number[]): number[] {
  const n = xs.length;
  const indexed = xs.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);
  const out = new Array<number>(n).fill(0);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && indexed[j + 1].v === indexed[i].v) j += 1;
    // Positions i..j (0-indexed) tied; mean rank = ((i+1)+(j+1))/2
    const avgRank = (i + 1 + j + 1) / 2;
    for (let k = i; k <= j; k += 1) out[indexed[k].i] = avgRank;
    i = j + 1;
  }
  return out;
}

// ─── Correlations ────────────────────────────────────────────

export interface CorrelationResult {
  /** Coefficient. Null when undefined (n < 2 or zero variance). */
  r: number | null;
  /** Two-tailed p-value from Student t CDF. Null when r is null or n < 3. */
  p: number | null;
  /** Effective sample size after pairwise filtering. */
  n: number;
}

/** Strips pairs where either value is NaN or undefined. */
function pairwiseFinite(
  xs: number[],
  ys: number[]
): { xs: number[]; ys: number[] } {
  const X: number[] = [];
  const Y: number[] = [];
  const n = Math.min(xs.length, ys.length);
  for (let i = 0; i < n; i += 1) {
    const a = xs[i];
    const b = ys[i];
    if (Number.isFinite(a) && Number.isFinite(b)) {
      X.push(a);
      Y.push(b);
    }
  }
  return { xs: X, ys: Y };
}

export function pearson(xs: number[], ys: number[]): CorrelationResult {
  const { xs: X, ys: Y } = pairwiseFinite(xs, ys);
  const n = X.length;
  if (n < 2) return { r: null, p: null, n };

  const mx = mean(X)!;
  const my = mean(Y)!;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i += 1) {
    const a = X[i] - mx;
    const b = Y[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return { r: null, p: null, n };

  const r = num / Math.sqrt(dx * dy);
  const p = pValueFromR(r, n);
  return { r, p, n };
}

export function spearman(xs: number[], ys: number[]): CorrelationResult {
  const { xs: X, ys: Y } = pairwiseFinite(xs, ys);
  const n = X.length;
  if (n < 2) return { r: null, p: null, n };
  const rxs = ranks(X);
  const rys = ranks(Y);
  return pearson(rxs, rys);
}

// ─── p-value from correlation coefficient ────────────────────

/**
 * Two-tailed p-value for a correlation r with n observations.
 * Uses t = r * sqrt((n-2)/(1-r²)), df = n-2.
 */
export function pValueFromR(r: number, n: number): number | null {
  if (n < 3) return null;
  if (!Number.isFinite(r)) return null;
  if (r === 1 || r === -1) return 0;
  const df = n - 2;
  const t = r * Math.sqrt(df / (1 - r * r));
  return twoTailedT(t, df);
}

/** Two-tailed Student t probability: 2 * P(T > |t|) for df. */
export function twoTailedT(t: number, df: number): number {
  if (!Number.isFinite(t) || df <= 0) return Number.NaN;
  const x = df / (df + t * t);
  // P(T > |t|) = 0.5 * I_x(df/2, 0.5) for the regularized incomplete beta.
  const oneTail = 0.5 * regularizedIncompleteBeta(x, df / 2, 0.5);
  const p = 2 * oneTail;
  // Numerical clamp.
  if (p < 0) return 0;
  if (p > 1) return 1;
  return p;
}

// ─── Regularized incomplete beta — Numerical Recipes style ───

/**
 * I_x(a, b) regularized incomplete beta function.
 * Switches between the two continued-fraction branches based on x
 * so each branch converges.
 */
export function regularizedIncompleteBeta(
  x: number,
  a: number,
  b: number
): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    lgamma(a + b) -
      lgamma(a) -
      lgamma(b) +
      a * Math.log(x) +
      b * Math.log(1 - x)
  );
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(a, b, x)) / a;
  }
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

/** Continued-fraction expansion for the incomplete beta (Lentz). */
function betacf(a: number, b: number, x: number): number {
  const MAX_ITER = 200;
  const EPS = 3e-16;
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAX_ITER; m += 1) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) return h;
  }
  return h;
}

// ─── Log-gamma — Lanczos approximation (g = 7, n = 9) ────────

const LANCZOS_G = 7;
const LANCZOS_COEFS: number[] = [
  0.99999999999980993,
  676.5203681218851,
  -1259.1392167224028,
  771.32342877765313,
  -176.61502916214059,
  12.507343278686905,
  -0.13857109526572012,
  9.9843695780195716e-6,
  1.5056327351493116e-7,
];

export function lgamma(z: number): number {
  if (z < 0.5) {
    // Reflection formula: Γ(z)Γ(1-z) = π / sin(πz)
    return (
      Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z)
    );
  }
  const zShift = z - 1;
  let x = LANCZOS_COEFS[0];
  for (let i = 1; i < LANCZOS_COEFS.length; i += 1) {
    x += LANCZOS_COEFS[i] / (zShift + i);
  }
  const t = zShift + LANCZOS_G + 0.5;
  return (
    0.5 * Math.log(2 * Math.PI) +
    (zShift + 0.5) * Math.log(t) -
    t +
    Math.log(x)
  );
}

// ─── Summary record builder ──────────────────────────────────

export interface DescriptiveSummary {
  n: number;
  mean: number | null;
  sd: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  skew: number | null;
}

/** Build a summary record. Returns nulls for stats not defined at this n. */
export function describe(xs: number[]): DescriptiveSummary {
  const filtered = xs.filter((x) => Number.isFinite(x));
  const n = filtered.length;
  return {
    n,
    mean: mean(filtered),
    sd: sampleSD(filtered),
    median: median(filtered),
    min: min(filtered),
    max: max(filtered),
    skew: skewness(filtered),
  };
}
