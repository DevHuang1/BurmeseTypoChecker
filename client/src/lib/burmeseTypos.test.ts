import { describe, expect, it } from "vitest";
import { detectBurmeseSyllableTypos } from "./burmeseTypos";

const codes = (value: string) => detectBurmeseSyllableTypos(value).map((issue) => issue.code);

describe("detectBurmeseSyllableTypos", () => {
  it("accepts valid stacked consonants and a valid kinzi sequence", () => {
    expect(codes("\u1000\u1039\u1000")).toEqual([]); // က္က
    expect(codes("\u1004\u103A\u1039\u1000")).toEqual([]); // င်္က
  });

  it("accepts a complex medial-and-vowel syllable", () => {
    expect(codes("\u1000\u103B\u103D\u1031\u102C\u1038")).toEqual([]); // ကျွော:
  });

  it("detects a combining mark that starts a syllable without a base consonant", () => {
    const issues = detectBurmeseSyllableTypos("\u102D\u1000"); // ိက
    expect(issues).toMatchObject([{ code: "ORPHAN_COMBINING_MARK", index: 0 }]);
  });

  it("detects a virama not anchored to a base consonant", () => {
    expect(codes("\u102D\u1039\u1000")).toContain("MISPLACED_VIRAMA"); // ိ္က
  });

  it("detects an incomplete kinzi prefix", () => {
    const issues = detectBurmeseSyllableTypos("\u1004\u103A\u1039"); // င်္
    expect(issues).toMatchObject([{ code: "INCOMPLETE_KINZI", index: 0, length: 3 }]);
  });

  it("detects duplicate vowel signs in a complex syllable", () => {
    expect(codes("\u1000\u103B\u102D\u102D")).toContain("DUPLICATE_VOWEL_MARK"); // ကျိိ
  });

  it("detects repeated medial consonant signs", () => {
    expect(codes("\u1000\u103B\u103B\u102C")).toContain("DUPLICATE_MEDIAL"); // ကျျာ
  });

  it("detects a medial sign placed after a vowel sign", () => {
    const issues = detectBurmeseSyllableTypos("\u1000\u1031\u103B"); // ကေျ
    expect(issues).toMatchObject([{ code: "MEDIAL_AFTER_VOWEL", index: 2 }]);
  });

  it("retains code-point offsets after an earlier ASCII token", () => {
    const issues = detectBurmeseSyllableTypos("draft: \u1000\u102D\u102D");
    expect(issues).toMatchObject([{ code: "DUPLICATE_VOWEL_MARK", index: 8 }]);
  });

  it("detects two consecutive asat signs", () => {
    const issues = detectBurmeseSyllableTypos("\u1000\u103A\u103A");
    expect(issues).toMatchObject([{ code: "DOUBLE_ASAT", index: 1, length: 2 }]);
  });

  it("detects an asat followed by another combining mark", () => {
    expect(codes("\u1000\u103A\u102D")).toContain("MISPLACED_ASAT");
  });

  it("does not flag the asat inside a valid kinzi sequence", () => {
    expect(codes("\u1004\u103A\u1039\u1000")).not.toContain("MISPLACED_ASAT");
  });

  it("detects a stacking virama at the end of the text", () => {
    const issues = detectBurmeseSyllableTypos("\u1000\u1039");
    expect(issues).toMatchObject([{ code: "UNSTACKED_VIRAMA", index: 1, length: 1 }]);
  });

  it("detects a stacking virama followed by a vowel", () => {
    const issues = detectBurmeseSyllableTypos("\u1000\u1039\u102D");
    expect(issues).toMatchObject([{ code: "UNSTACKED_VIRAMA", index: 1, length: 1 }]);
  });

  it("keeps valid stacked consonants and kinzi sequences free of UNSTACKED_VIRAMA", () => {
    expect(codes("\u1000\u1039\u1000")).not.toContain("UNSTACKED_VIRAMA");
    expect(codes("\u1004\u103A\u1039\u1000")).not.toContain("UNSTACKED_VIRAMA");
  });

  it("does not flag UNSTACKED_VIRAMA on a misplaced virama followed by a consonant", () => {
    expect(codes("\u102D\u1039\u1000")).not.toContain("UNSTACKED_VIRAMA");
  });
});
