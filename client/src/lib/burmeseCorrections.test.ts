import { describe, expect, it } from "vitest";
import { suggestCorrection } from "./burmeseCorrections";

describe("suggestCorrection", () => {
  it("collapses a duplicated vowel mark to one instance", () => {
    const result = suggestCorrection("\u1000\u102D\u102D", { code: "DUPLICATE_VOWEL_MARK", index: 1, length: 2 });
    expect(result).toEqual({ applicable: true, replacement: "\u102D", corrected: "\u1000\u102D" });
  });

  it("collapses a duplicated medial sign to one instance", () => {
    const result = suggestCorrection("\u1000\u103B\u103B\u102C", { code: "DUPLICATE_MEDIAL", index: 1, length: 2 });
    expect(result).toEqual({ applicable: true, replacement: "\u103B", corrected: "\u1000\u103B\u102C" });
  });

  it("swaps a medial that follows a vowel", () => {
    const result = suggestCorrection("\u1000\u1031\u103B", { code: "MEDIAL_AFTER_VOWEL", index: 2, length: 1 });
    expect(result).toEqual({ applicable: true, replacement: "\u103B\u1031", corrected: "\u1000\u103B\u1031" });
  });

  it("swaps an orphan combining mark with a following consonant", () => {
    const result = suggestCorrection("\u102D\u1000", { code: "ORPHAN_COMBINING_MARK", index: 0, length: 1 });
    expect(result).toEqual({ applicable: true, replacement: "\u1000\u102D", corrected: "\u1000\u102D" });
  });

  it("leaves an orphan combining mark without a following consonant uncorrected", () => {
    const result = suggestCorrection("\u102D", { code: "ORPHAN_COMBINING_MARK", index: 0, length: 1 });
    expect(result).toEqual({ applicable: false, replacement: null, corrected: null });
  });

  it("collapses repeated spaces to a single space", () => {
    const result = suggestCorrection("a  b", { code: "EXTRA_SPACE", index: 1, length: 2 });
    expect(result).toEqual({ applicable: true, replacement: " ", corrected: "a b" });
  });

  it("collapses longer space runs to a single space", () => {
    const result = suggestCorrection("a    b", { code: "EXTRA_SPACE", index: 1, length: 4 });
    expect(result).toEqual({ applicable: true, replacement: " ", corrected: "a b" });
  });

  it("declines manual-review codes", () => {
    const manual = { applicable: false, replacement: null, corrected: null };
    expect(suggestCorrection("\u102D\u1039\u1000", { code: "MISPLACED_VIRAMA", index: 1, length: 1 })).toEqual(manual);
    expect(suggestCorrection("\u1004\u103A\u1039", { code: "INCOMPLETE_KINZI", index: 0, length: 3 })).toEqual(manual);
    expect(suggestCorrection("\u1000\u1039", { code: "UNSTACKED_VIRAMA", index: 1, length: 1 })).toEqual(manual);
    expect(suggestCorrection("\u1000\u103A\u103A", { code: "DOUBLE_ASAT", index: 1, length: 2 })).toEqual(manual);
    expect(suggestCorrection("\u1000\u103A\u102D", { code: "MISPLACED_ASAT", index: 1, length: 1 })).toEqual(manual);
  });

  it("declines unknown codes", () => {
    expect(suggestCorrection("\u1000", { code: "NOT_A_RULE", index: 0, length: 1 })).toEqual({
      applicable: false,
      replacement: null,
      corrected: null,
    });
  });
});
