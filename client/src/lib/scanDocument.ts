import { safeChars } from "./compat";
import { detectBurmeseSyllableTypos, type BurmeseTypoCode } from "./burmeseTypos";
import { suggestCorrection } from "./burmeseCorrections";

export type ScanFinding = {
  id: string;
  type: string;
  code: string;
  excerpt: string;
  suggestion: string;
  confidence: string;
  correction: string | null;
  replacement: string | null;
  page: number;
  line: number;
  character: number;
  index: number;
  length: number;
};

/**
 * The exact source span a finding's auto-fix replaces. Swap-type fixes
 * (MEDIAL_AFTER_VOWEL, ORPHAN_COMBINING_MARK) cover a wider two-char span than
 * the finding's own index/length so applying the replacement stays aligned.
 */
export function findingFixSpan(finding: { code: string; index: number; length: number }): { start: number; end: number } {
  if (finding.code === "MEDIAL_AFTER_VOWEL") return { start: finding.index - 1, end: finding.index + 1 };
  if (finding.code === "ORPHAN_COMBINING_MARK") return { start: finding.index, end: finding.index + 2 };
  return { start: finding.index, end: finding.index + finding.length };
}

const issueCopy: Record<BurmeseTypoCode, { type: string; suggestion: string; confidence: string }> = {
  ORPHAN_COMBINING_MARK: { type: "Myanmar mark order", suggestion: "Place the mark after its base consonant.", confidence: "99%" },
  MISPLACED_VIRAMA: { type: "Stacking order", suggestion: "Place the virama after the correct consonant.", confidence: "99%" },
  INCOMPLETE_KINZI: { type: "Kinzi sequence", suggestion: "Complete the kinzi sequence with a base consonant.", confidence: "98%" },
  DUPLICATE_VOWEL_MARK: { type: "Repeated vowel mark", suggestion: "Remove the duplicated vowel sign.", confidence: "99%" },
  DUPLICATE_MEDIAL: { type: "Repeated medial", suggestion: "Keep only one matching medial sign.", confidence: "98%" },
  MEDIAL_AFTER_VOWEL: { type: "Medial order", suggestion: "Move the medial sign before the vowel mark.", confidence: "98%" },
  DOUBLE_ASAT: { type: "Repeated asat", suggestion: "Remove the duplicated asat sign.", confidence: "98%" },
  MISPLACED_ASAT: { type: "Asat order", suggestion: "Move the asat sign to the end of its syllable.", confidence: "98%" },
  UNSTACKED_VIRAMA: { type: "Stacking order", suggestion: "Complete the stacked consonant with a base consonant.", confidence: "98%" },
};

function locationFor(text: string, index: number) {
  const before = safeChars(text).slice(0, index).join("");
  const pages = before.split("\f");
  const pageText = pages[pages.length - 1] ?? "";
  const lines = pageText.split(/\r?\n/);
  const lastLine = lines[lines.length - 1] ?? "";
  return { page: pages.length, line: lines.length, character: safeChars(lastLine).length + 1 };
}

function excerptFor(text: string, index: number, length: number) {
  const chars = safeChars(text);
  const start = Math.max(0, index - 20);
  const end = Math.min(chars.length, index + length + 36);
  return `${start > 0 ? "…" : ""}${chars.slice(start, end).join("").replace(/\s+/g, " ").trim()}${end < chars.length ? "…" : ""}`;
}

/** Return only high-confidence structural or obvious whitespace findings. Unknown words remain review metadata, not automatic typos. */
export function scanBurmeseDocument(text: string): ScanFinding[] {
  const findings: ScanFinding[] = detectBurmeseSyllableTypos(text).map((issue) => {
    const copy = issueCopy[issue.code];
    const correction = suggestCorrection(text, { code: issue.code, index: issue.index, length: issue.length });
    return { id: `${issue.code}-${issue.index}`, code: issue.code, type: copy.type, excerpt: excerptFor(text, issue.index, issue.length), suggestion: copy.suggestion, confidence: copy.confidence, correction: correction.corrected, replacement: correction.replacement, ...locationFor(text, issue.index), index: issue.index, length: issue.length };
  });

  const chars = safeChars(text);
  const whitespace = / {2,}/g;
  let match: RegExpExecArray | null;
  while ((match = whitespace.exec(text)) !== null) {
    const codeUnitIndex = match.index;
    const index = safeChars(text.slice(0, codeUnitIndex)).length;
    const length = safeChars(match[0]).length;
    findings.push({ id: `EXTRA_SPACE-${index}`, code: "EXTRA_SPACE", type: "Repeated space", excerpt: excerptFor(text, index, length), suggestion: "Replace repeated spaces with one space.", confidence: "96%", correction: `${chars.slice(0, index).join("")} ${chars.slice(index + length).join("")}`, replacement: " ", ...locationFor(text, index), index, length });
  }

  return findings.sort((left, right) => left.index - right.index);
}
