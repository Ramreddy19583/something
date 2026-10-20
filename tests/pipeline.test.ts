import { describe, it, expect } from "vitest";
import { canonicalizeUrl, calculateTitleSimilarity } from "../src/lib/ingestion/pipeline";

describe("Ingestion Pipeline & Deduplication", () => {
  it("normalizes canonical URLs by stripping tracking parameters and trailing slashes", () => {
    const raw =
      "https://summerofcode.withgoogle.com/programs/2026/?utm_source=twitter&utm_medium=social&ref=student_hub";
    const canonical = canonicalizeUrl(raw);
    expect(canonical).toBe("https://summerofcode.withgoogle.com/programs/2026");
  });

  it("handles URLs with trailing slashes cleanly", () => {
    const raw = "https://www.pmrf.in/";
    const canonical = canonicalizeUrl(raw);
    expect(canonical).toBe("https://www.pmrf.in");
  });

  it("calculates title similarity accurately using Levenshtein distance", () => {
    const titleA = "Google Summer of Code 2026";
    const titleB = "Google Summer of Code (GSoC) 2026";
    const titleC = "Prime Minister Research Fellowship";

    const simHigh = calculateTitleSimilarity(titleA, titleB);
    const simLow = calculateTitleSimilarity(titleA, titleC);

    expect(simHigh).toBeGreaterThan(0.7);
    expect(simLow).toBeLessThan(0.4);
    expect(calculateTitleSimilarity(titleA, titleA)).toBe(1.0);
  });
});
