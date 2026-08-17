import { type BurmeseTypoIssue } from "./burmeseTypos";
import { safeChars } from "./compat";

export type BurmeseCorrection = {
  applicable: boolean;
  replacement: string | null; // corrected text for the issue span
  corrected: string | null;   // whole text after applying the span fix
};

const consonant = /[\u1000-\u1021\u103F\u104E]/;
const vowel = /[\u102B-\u1032\u1036]/;
const medial = /[\u103B-\u103E]/;

/**
 * Deterministic, conservative span fixes for high-confidence structural typos.
 * Offsets align with safeChars(value); anything ambiguous returns no correction
 * so it stays a manual-review item.
 */
export function suggestCorrection(value: string, issue: { code: string; index: number; length: number }): BurmeseCorrection {
  const chars = safeChars(value);
  const { code, index, length } = issue;

  if (code === "DUPLICATE_VOWEL_MARK" || code === "DUPLICATE_MEDIAL") {
    if (length === 2 && chars[index] !== undefined && chars[index] === chars[index + 1]) {
      const replacement = chars[index];
      const corrected = [...chars.slice(0, index), chars[index], ...chars.slice(index + length)].join("");
      return { applicable: true, replacement, corrected };
    }
    return { applicable: false, replacement: null, corrected: null };
  }

  if (code === "MEDIAL_AFTER_VOWEL") {
    if (length === 1 && index >= 1 && medial.test(chars[index] ?? "") && vowel.test(chars[index - 1])) {
      const replacement = chars[index] + chars[index - 1];
      const corrected = [...chars.slice(0, index - 1), chars[index], chars[index - 1], ...chars.slice(index + 1)].join("");
      return { applicable: true, replacement, corrected };
    }
    return { applicable: false, replacement: null, corrected: null };
  }

  if (code === "ORPHAN_COMBINING_MARK") {
    if (chars[index] === "\u1039") {
      return { applicable: false, replacement: null, corrected: null };
    }
    if (length === 1 && consonant.test(chars[index + 1] ?? "")) {
      const replacement = chars[index + 1] + chars[index];
      const corrected = [...chars.slice(0, index), chars[index + 1], chars[index], ...chars.slice(index + 2)].join("");
      return { applicable: true, replacement, corrected };
    }
    return { applicable: false, replacement: null, corrected: null };
  }

  if (code === "EXTRA_SPACE") {
    const replacement = " ";
    const corrected = [...chars.slice(0, index), " ", ...chars.slice(index + length)].join("");
    return { applicable: true, replacement, corrected };
  }

  return { applicable: false, replacement: null, corrected: null };
}
