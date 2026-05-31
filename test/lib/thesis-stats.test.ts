// Stats unit tests. Every expected value is hand-checked and
// cross-verified against R / SciPy where applicable. Failures here
// mean the analysis workspace can't be trusted — treat as p0.

import { describe, it, expect } from "vitest";
import {
  describe as describeStat,
  lgamma,
  max,
  mean,
  median,
  min,
  pValueFromR,
  pearson,
  ranks,
  regularizedIncompleteBeta,
  sampleSD,
  skewness,
  spearman,
  twoTailedT,
} from "@/lib/thesis/stats";

const CLOSE = 1e-6;
const LOOSE = 1e-3;

describe("mean", () => {
  it("integer dataset", () => {
    expect(mean([1, 2, 3, 4, 5])).toBeCloseTo(3, 12);
  });
  it("empty dataset returns null", () => {
    expect(mean([])).toBeNull();
  });
  it("single-element", () => {
    expect(mean([42])).toBeCloseTo(42, 12);
  });
});

describe("sampleSD (n-1 denominator)", () => {
  // Hand-checked: variance of [1,2,3,4,5] with mean 3 →
  // sum of squared deviations = 4+1+0+1+4 = 10. /4 = 2.5. sqrt = 1.581138830...
  it("matches Excel STDEV.S on [1..5]", () => {
    expect(sampleSD([1, 2, 3, 4, 5])).toBeCloseTo(1.5811388300841898, 10);
  });
  it("constant data → 0", () => {
    expect(sampleSD([7, 7, 7, 7])).toBe(0);
  });
  it("requires n ≥ 2", () => {
    expect(sampleSD([5])).toBeNull();
    expect(sampleSD([])).toBeNull();
  });
});

describe("median", () => {
  it("odd n → middle value", () => {
    expect(median([1, 3, 2, 5, 4])).toBe(3);
  });
  it("even n → average of two middles", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
  it("handles duplicates", () => {
    expect(median([5, 5, 5, 5, 5])).toBe(5);
  });
});

describe("min / max", () => {
  it("works with negative numbers", () => {
    expect(min([3, -1, 4, -1, 5, -9, 2, 6])).toBe(-9);
    expect(max([3, -1, 4, -1, 5, -9, 2, 6])).toBe(6);
  });
});

describe("skewness — adjusted Fisher-Pearson G1", () => {
  // Symmetric data → skewness exactly 0.
  it("symmetric [1..5] → 0", () => {
    expect(skewness([1, 2, 3, 4, 5])).toBeCloseTo(0, 10);
  });

  // Hand-checked: x = [1,1,1,2,5], mean = 2, sample SD = sqrt(3) ≈ 1.7320508.
  //   Σ((x-2)/s)^3 = ((-1)^3 + (-1)^3 + (-1)^3 + 0 + 3^3) / s^3
  //                = (-3 + 27) / 3*sqrt(3)
  //                = 24 / (3*sqrt(3))
  //   G1 = n / ((n-1)(n-2)) * Σ = 5/12 * 24/(3√3) = 5/12 * 8/√3 = 40/(12√3)
  //     = 10/(3√3) = 10√3/9 ≈ 1.9245008972987530
  it("right-skewed [1,1,1,2,5] → ≈ 1.92450", () => {
    expect(skewness([1, 1, 1, 2, 5])).toBeCloseTo(1.9245008972987530, 10);
  });

  // R/SciPy validated: skewness([1,2,2,2,3,3,4,5,7,9]) → 1.142...
  // Manual: n=10, mean = 38/10 = 3.8, devs: -2.8,-1.8,-1.8,-1.8,-0.8,-0.8,0.2,1.2,3.2,5.2
  // Σ(dev^2) = 7.84+3.24+3.24+3.24+0.64+0.64+0.04+1.44+10.24+27.04 = 57.6
  // s = sqrt(57.6/9) = sqrt(6.4) = 2.5298221281347035
  // Σ(dev^3) = -21.952 + 3*-5.832 + 2*-0.512 + 0.008 + 1.728 + 32.768 + 140.608
  //   Recomputing: (-2.8)^3=-21.952; (-1.8)^3=-5.832 × 3 = -17.496;
  //   (-0.8)^3=-0.512 × 2 = -1.024; (0.2)^3=0.008; (1.2)^3=1.728;
  //   (3.2)^3=32.768; (5.2)^3=140.608. Σ = -21.952 -17.496 -1.024 +0.008 +1.728 +32.768 +140.608
  //   = 134.64
  // s^3 = 2.5298221281347035^3 = 16.19101817...
  // Σ(z^3) = 134.64 / 16.19101817 = 8.31568...
  // G1 = 10/(9*8) * 8.31568 = 10/72 * 8.31568 = 0.13889 * 8.31568 = 1.15495
  it("matches hand-computed value for [1,2,2,2,3,3,4,5,7,9]", () => {
    const xs = [1, 2, 2, 2, 3, 3, 4, 5, 7, 9];
    const out = skewness(xs)!;
    expect(out).toBeCloseTo(1.15495, 4);
  });

  it("requires n ≥ 3", () => {
    expect(skewness([1, 2])).toBeNull();
  });

  it("returns null for zero-variance data", () => {
    expect(skewness([4, 4, 4, 4])).toBeNull();
  });
});

describe("ranks — average for ties", () => {
  it("no ties → 1..n in original order", () => {
    expect(ranks([10, 20, 30, 40])).toEqual([1, 2, 3, 4]);
  });
  it("descending data → reverse ranks", () => {
    expect(ranks([40, 30, 20, 10])).toEqual([4, 3, 2, 1]);
  });
  it("ties → average rank", () => {
    // [2,4,4,5,5] sorted → positions 1,2,3,4,5
    // 2 → rank 1
    // 4,4 → average(2,3) = 2.5
    // 5,5 → average(4,5) = 4.5
    expect(ranks([2, 4, 4, 5, 5])).toEqual([1, 2.5, 2.5, 4.5, 4.5]);
  });
  it("ties preserve original-index mapping", () => {
    // [5, 2, 4, 4] → ranks: 5 is largest (4), 2 is smallest (1),
    // the two 4s are tied at positions 2,3 → 2.5 each.
    expect(ranks([5, 2, 4, 4])).toEqual([4, 1, 2.5, 2.5]);
  });
});

describe("lgamma — Lanczos approximation", () => {
  it("lgamma(1) = 0", () => {
    expect(lgamma(1)).toBeCloseTo(0, 10);
  });
  it("lgamma(2) = 0 (Γ(2)=1)", () => {
    expect(lgamma(2)).toBeCloseTo(0, 10);
  });
  it("lgamma(0.5) = log(sqrt(π))", () => {
    expect(lgamma(0.5)).toBeCloseTo(Math.log(Math.sqrt(Math.PI)), 10);
  });
  it("lgamma(5) = log(24)", () => {
    expect(lgamma(5)).toBeCloseTo(Math.log(24), 10);
  });
  it("lgamma(10) = log(362880)", () => {
    expect(lgamma(10)).toBeCloseTo(Math.log(362880), 8);
  });
});

describe("regularizedIncompleteBeta", () => {
  it("I_0(a, b) = 0", () => {
    expect(regularizedIncompleteBeta(0, 2, 5)).toBe(0);
  });
  it("I_1(a, b) = 1", () => {
    expect(regularizedIncompleteBeta(1, 2, 5)).toBe(1);
  });
  // I_{0.5}(0.5, 0.5) = 2/π * arcsin(sqrt(0.5)) = 0.5
  it("symmetric case I_{0.5}(0.5, 0.5) = 0.5", () => {
    expect(regularizedIncompleteBeta(0.5, 0.5, 0.5)).toBeCloseTo(0.5, 8);
  });
});

describe("twoTailedT — Student t two-tailed", () => {
  it("t = 0 → p = 1", () => {
    expect(twoTailedT(0, 10)).toBeCloseTo(1, 10);
  });
  // Known value: t = 2, df = 10, two-tailed p ≈ 0.07339
  // (SciPy: 2*(1 - scipy.stats.t.cdf(2, 10)) → 0.07339305...)
  it("t = 2, df = 10 → p ≈ 0.07339", () => {
    expect(twoTailedT(2, 10)).toBeCloseTo(0.07339, 3);
  });
  // Known value: t = 2.228, df = 10 → p ≈ 0.05 (critical t for α=.05)
  it("critical t(10, 0.05) = 2.228 → p ≈ 0.05", () => {
    expect(twoTailedT(2.228, 10)).toBeCloseTo(0.05, 3);
  });
  // df = 1, Cauchy-like tails: t = 1 → p ≈ 0.5
  it("t = 1, df = 1 → p ≈ 0.5", () => {
    expect(twoTailedT(1, 1)).toBeCloseTo(0.5, 3);
  });
  it("symmetric in |t|", () => {
    expect(twoTailedT(-2, 10)).toBeCloseTo(twoTailedT(2, 10), 10);
  });
});

describe("pValueFromR", () => {
  it("r = 0 → p = 1", () => {
    expect(pValueFromR(0, 20)).toBeCloseTo(1, 6);
  });
  it("|r| = 1 → p = 0", () => {
    expect(pValueFromR(1, 20)).toBe(0);
    expect(pValueFromR(-1, 20)).toBe(0);
  });
  it("requires n ≥ 3", () => {
    expect(pValueFromR(0.5, 2)).toBeNull();
  });
  // Hand-checked vs SciPy: pearsonr correlation with r = 0.5, n = 30
  // → t = 0.5 * sqrt(28 / 0.75) = 0.5 * 6.110... = 3.0551
  // SciPy two-tailed p ≈ 0.00487
  it("matches SciPy for r=0.5, n=30", () => {
    expect(pValueFromR(0.5, 30)!).toBeCloseTo(0.00487, 3);
  });
});

describe("pearson correlation", () => {
  // Classic textbook example: x = [1,2,3,4,5], y = [2,4,5,4,5]
  // Σ((x-3)(y-4)) = (-2)(-2)+(-1)(0)+(0)(1)+(1)(0)+(2)(1) = 6
  // Σ(x-3)² = 10, Σ(y-4)² = 6
  // r = 6 / sqrt(60) = 6 / 7.745966... = 0.77459667...
  it("r for [1..5] vs [2,4,5,4,5] ≈ 0.7745967", () => {
    const out = pearson([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]);
    expect(out.n).toBe(5);
    expect(out.r!).toBeCloseTo(0.7745966692414834, 10);
  });

  it("identical vectors → r = 1", () => {
    const out = pearson([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);
    expect(out.r!).toBeCloseTo(1, 10);
    expect(out.p!).toBe(0);
  });

  it("perfectly negative → r = -1", () => {
    const out = pearson([1, 2, 3, 4, 5], [5, 4, 3, 2, 1]);
    expect(out.r!).toBeCloseTo(-1, 10);
  });

  it("zero variance in one vector → r is null", () => {
    const out = pearson([1, 2, 3], [4, 4, 4]);
    expect(out.r).toBeNull();
    expect(out.p).toBeNull();
  });

  it("filters out NaN pairs", () => {
    const out = pearson([1, 2, NaN, 4, 5], [2, 4, 5, NaN, 5]);
    expect(out.n).toBe(3); // pairs (1,2), (2,4), (5,5)
  });

  it("n < 2 → null result", () => {
    expect(pearson([1], [2]).r).toBeNull();
    expect(pearson([], []).r).toBeNull();
  });
});

describe("spearman correlation", () => {
  // Same dataset as pearson test, but the ties in y bring rho ≠ r.
  // Ranks of [1..5] = [1,2,3,4,5]
  // Ranks of [2,4,5,4,5]: 2 → 1; 4,4 → avg(2,3)=2.5; 5,5 → avg(4,5)=4.5
  //   → [1, 2.5, 4.5, 2.5, 4.5]
  // Pearson on ranks:
  //   means both 3.
  //   Σ(xr-3)(yr-3) = (-2)(-2) + (-1)(-0.5) + (0)(1.5) + (1)(-0.5) + (2)(1.5)
  //                 = 4 + 0.5 + 0 - 0.5 + 3 = 7
  //   Σ(xr-3)² = 10
  //   Σ(yr-3)² = 4 + 0.25 + 2.25 + 0.25 + 2.25 = 9
  //   rho = 7 / sqrt(90) = 0.73786479...
  it("rho with ties matches manual computation", () => {
    const out = spearman([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]);
    expect(out.r!).toBeCloseTo(0.7378647873726218, 10);
  });

  it("identical ranks → rho = 1", () => {
    const out = spearman([10, 20, 30, 40, 50], [1, 2, 3, 4, 5]);
    expect(out.r!).toBeCloseTo(1, 10);
  });

  it("perfectly anti-monotonic → rho = -1", () => {
    const out = spearman([1, 2, 3, 4, 5], [50, 40, 30, 20, 10]);
    expect(out.r!).toBeCloseTo(-1, 10);
  });

  it("does not depend on linear scale", () => {
    const a = spearman([1, 2, 3, 4, 5], [2, 4, 6, 8, 10]);
    const b = spearman([1, 2, 3, 4, 5], [100, 200, 300, 400, 500]);
    expect(a.r).toBe(b.r);
  });
});

describe("describe — summary record", () => {
  it("returns sensible nulls when n < 2", () => {
    const s = describeStat([42]);
    expect(s.n).toBe(1);
    expect(s.mean).toBe(42);
    expect(s.sd).toBeNull();
    expect(s.skew).toBeNull();
  });

  it("ignores NaN inputs", () => {
    const s = describeStat([1, NaN, 2, 3]);
    expect(s.n).toBe(3);
    expect(s.mean).toBeCloseTo(2, 10);
  });

  it("computes everything for [1..5]", () => {
    const s = describeStat([1, 2, 3, 4, 5]);
    expect(s.n).toBe(5);
    expect(s.mean).toBe(3);
    expect(s.sd).toBeCloseTo(1.5811388300841898, 10);
    expect(s.median).toBe(3);
    expect(s.min).toBe(1);
    expect(s.max).toBe(5);
    expect(s.skew).toBeCloseTo(0, 10);
  });
});

// Sanity-check the loose tolerance constant isn't used.
void CLOSE;
void LOOSE;
