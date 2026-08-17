import { safeChars } from "./compat";
import { findingFixSpan, type ScanFinding } from "./scanDocument";

/**
 * Combines every auto-fixable finding into one corrected document. Fixes are
 * applied in descending index order so earlier spans stay aligned; each span
 * replacement is taken from the authoritative scanner span, so identical
 * adjacent characters cannot be misaligned.
 */
export function applyAllAutoFixes(text: string, findings: ScanFinding[]): string {
  const fixes = findings.filter((finding) => finding.correction !== null && finding.replacement !== null);
  fixes.sort((left, right) => right.index - left.index);
  let result = text;
  for (const finding of fixes) {
    const { start, end } = findingFixSpan(finding);
    const chars = safeChars(result);
    result = [...chars.slice(0, start), finding.replacement as string, ...chars.slice(end)].join("");
  }
  return result;
}