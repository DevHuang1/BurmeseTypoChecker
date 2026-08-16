import { safeChars } from "./compat";

export type FindingHighlightRange = {
  chars: string[];
  start: number;
  end: number;
  markStart: number;
  markEnd: number;
};

export function getFindingHighlightRange(sourceText: string, index: number, length: number, context = 20, trailing = 36): FindingHighlightRange {
  const chars = safeChars(sourceText);
  const start = Math.max(0, index - context);
  const end = Math.min(chars.length, index + length + trailing);
  const markStart = Math.max(start, Math.min(end, index));
  const markEnd = Math.max(markStart, Math.min(end, index + Math.max(0, length)));
  return { chars, start, end, markStart, markEnd };
}
