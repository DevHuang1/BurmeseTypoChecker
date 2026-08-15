/**
 * Ink & Signal rule layer: deterministic Myanmar-script structural checks.
 * This is intentionally conservative: it flags Unicode-ordering patterns that
 * are very likely typos without attempting to replace a full Burmese lexicon.
 */

export type BurmeseTypoCode =
  | "ORPHAN_COMBINING_MARK"
  | "MISPLACED_VIRAMA"
  | "INCOMPLETE_KINZI"
  | "DUPLICATE_VOWEL_MARK"
  | "DUPLICATE_MEDIAL"
  | "MEDIAL_AFTER_VOWEL";

export type BurmeseTypoIssue = {
  code: BurmeseTypoCode;
  index: number;
  length: number;
  message: string;
};

const consonant = /[\u1000-\u1021\u103F\u104E]/;
const medial = /[\u103B-\u103E]/;
const vowel = /[\u102B-\u1032\u1036]/;
const combining = /[\u102B-\u103E\u1056-\u1059\u1060-\u109D]/;
const virama = "\u1039";
const asat = "\u103A";
const nga = "\u1004";

const toChars = (value: string) => Array.from(value.normalize("NFC"));

function isKinziAt(chars: string[], index: number) {
  return chars[index] === nga && chars[index + 1] === asat && chars[index + 2] === virama;
}

function hasConsonantBefore(chars: string[], index: number) {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (consonant.test(chars[cursor])) return true;
    if (!combining.test(chars[cursor])) return false;
  }
  return false;
}

/**
 * Finds high-confidence structural typos in Myanmar text. Offsets are Unicode
 * code-point positions in NFC-normalized input, suitable for review highlights.
 */
export function detectBurmeseSyllableTypos(value: string): BurmeseTypoIssue[] {
  const chars = toChars(value);
  const issues: BurmeseTypoIssue[] = [];
  const seen = new Set<string>();
  const add = (code: BurmeseTypoCode, index: number, length: number, message: string) => {
    const key = `${code}:${index}`;
    if (!seen.has(key)) {
      seen.add(key);
      issues.push({ code, index, length, message });
    }
  };

  for (let index = 0; index < chars.length; index += 1) {
    const current = chars[index];
    const previous = chars[index - 1];

    if (combining.test(current) && !hasConsonantBefore(chars, index) && !(current === virama && isKinziAt(chars, index - 2))) {
      add("ORPHAN_COMBINING_MARK", index, 1, "A Burmese combining mark appears without a base consonant.");
    }

    if (current === virama) {
      const followsKinzi = previous === asat && chars[index - 2] === nga;
      if (!followsKinzi && !consonant.test(previous ?? "")) {
        add("MISPLACED_VIRAMA", index, 1, "The stacking virama must follow a Myanmar consonant or a complete kinzi prefix.");
      }
    }

    if (isKinziAt(chars, index) && !consonant.test(chars[index + 3] ?? "")) {
      add("INCOMPLETE_KINZI", index, 3, "A kinzi sequence must be followed by a base consonant.");
    }

    if (vowel.test(current) && current === previous) {
      add("DUPLICATE_VOWEL_MARK", index - 1, 2, "The same vowel mark is repeated in one syllable.");
    }

    if (medial.test(current) && current === previous) {
      add("DUPLICATE_MEDIAL", index - 1, 2, "The same medial consonant sign is repeated in one syllable.");
    }

    if (medial.test(current) && vowel.test(previous ?? "")) {
      add("MEDIAL_AFTER_VOWEL", index, 1, "A medial consonant sign appears after a vowel mark; medials should precede vowels.");
    }
  }

  return issues;
}
