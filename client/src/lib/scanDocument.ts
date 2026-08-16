import { detectBurmeseSyllableTypos, type BurmeseTypoCode } from "./burmeseTypos";

export type ScanFinding = {
  id: string;
  type: string;
  code: string;
  excerpt: string;
  suggestion: string;
  confidence: string;
  page: number;
  line: number;
  character: number;
  index: number;
};

const issueCopy: Record<BurmeseTypoCode, { type: string; suggestion: string; confidence: string }> = {
  ORPHAN_COMBINING_MARK: { type: "Myanmar mark order", suggestion: "Place the mark after its base consonant.", confidence: "99%" },
  MISPLACED_VIRAMA: { type: "Stacking order", suggestion: "Place the virama after the correct consonant.", confidence: "99%" },
  INCOMPLETE_KINZI: { type: "Kinzi sequence", suggestion: "Complete the kinzi sequence with a base consonant.", confidence: "98%" },
  DUPLICATE_VOWEL_MARK: { type: "Repeated vowel mark", suggestion: "Remove the duplicated vowel sign.", confidence: "99%" },
  DUPLICATE_MEDIAL: { type: "Repeated medial", suggestion: "Keep only one matching medial sign.", confidence: "98%" },
  MEDIAL_AFTER_VOWEL: { type: "Medial order", suggestion: "Move the medial sign before the vowel mark.", confidence: "98%" },
};

function locationFor(text: string, index: number) {
  const before = Array.from(text).slice(0, index).join("");
  const pages = before.split("\f");
  const pageText = pages.at(-1) ?? "";
  const lines = pageText.split(/\r?\n/);
  return {
    page: pages.length,
    line: lines.length,
    character: Array.from(lines.at(-1) ?? "").length + 1,
  };
}

function excerptFor(text: string, index: number, length: number) {
  const chars = Array.from(text);
  const start = Math.max(0, index - 20);
  const end = Math.min(chars.length, index + length + 36);
  return `${start > 0 ? "…" : ""}${chars.slice(start, end).join("").replace(/\s+/g, " ").trim()}${end < chars.length ? "…" : ""}`;
}

/** Return only high-confidence structural or obvious whitespace findings. Unknown words remain review metadata, not automatic typos. */
export function scanBurmeseDocument(text: string): ScanFinding[] {
  const findings: ScanFinding[] = detectBurmeseSyllableTypos(text).map((issue) => {
    const copy = issueCopy[issue.code];
    return {
      id: `${issue.code}-${issue.index}`,
      code: issue.code,
      type: copy.type,
      excerpt: excerptFor(text, issue.index, issue.length),
      suggestion: copy.suggestion,
      confidence: copy.confidence,
      ...locationFor(text, issue.index),
      index: issue.index,
    };
  });

  const chars = Array.from(text);
  const whitespace = / {2,}/g;
  for (const match of Array.from(text.matchAll(whitespace))) {
    const codeUnitIndex = match.index ?? 0;
    const index = Array.from(text.slice(0, codeUnitIndex)).length;
    findings.push({
      id: `EXTRA_SPACE-${index}`,
      code: "EXTRA_SPACE",
      type: "Repeated space",
      excerpt: excerptFor(text, index, Array.from(match[0]).length),
      suggestion: "Replace repeated spaces with one space.",
      confidence: "96%",
      ...locationFor(chars.join(""), index),
      index,
    });
  }

  return findings.sort((left, right) => left.index - right.index).slice(0, 50);
}
