import { describe, expect, it } from "vitest";
import { scanBurmeseDocument } from "./scanDocument";
import { applyAllAutoFixes } from "./findingsApply";

const applyAndRescan = (text: string) => {
  const findings = scanBurmeseDocument(text);
  const corrected = applyAllAutoFixes(text, findings);
  return { findings, corrected, remaining: scanBurmeseDocument(corrected) };
};

describe("applyAllAutoFixes", () => {
  it("fixes a duplicated vowel mark and collapses repeated spaces together", () => {
    const { corrected, remaining } = applyAndRescan("အဖွင့်\nကိိ  က");
    expect(corrected).toBe("အဖွင့်\nကိ က");
    expect(remaining).toEqual([]);
  });

  it("fixes multiple duplicate marks in one pass", () => {
    const { corrected, remaining } = applyAndRescan("ကိိကိိ");
    expect(corrected).toBe("ကိကိ");
    expect(remaining).toEqual([]);
  });

  it("swaps a medial placed after a vowel", () => {
    const { corrected, remaining } = applyAndRescan("ကာျ");
    expect(corrected).toBe("ကျာ");
    expect(remaining).toEqual([]);
  });

  it("swaps an orphan combining mark with a following consonant", () => {
    const { corrected, remaining } = applyAndRescan("ိက");
    expect(corrected).toBe("ကိ");
    expect(remaining).toEqual([]);
  });

  it("returns the source unchanged when nothing is auto-fixable", () => {
    const { findings, corrected } = applyAndRescan("တရားရုံး");
    expect(findings).toEqual([]);
    expect(corrected).toBe("တရားရုံး");
  });

  it("keeps manual-review findings in place after applying the auto fixes", () => {
    const { corrected, remaining } = applyAndRescan("ကိိ င်္");
    expect(corrected).toBe("ကိ င်္");
    expect(remaining.map((finding) => finding.code)).toEqual(["INCOMPLETE_KINZI"]);
  });

  it("does not auto-swap a misplaced virama into a dangling stacking mark", () => {
    const { corrected, remaining } = applyAndRescan("ကိိ ္က");
    expect(corrected).toBe("ကိ ္က");
    expect(remaining.map((finding) => finding.code)).toEqual(["ORPHAN_COMBINING_MARK", "MISPLACED_VIRAMA"]);
  });
});