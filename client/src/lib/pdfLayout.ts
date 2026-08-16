import { safeChars } from "./compat";

export function wrapPdfLine(line: string, maxCharacters = 42): string[] {
  const chars = safeChars(line);
  const wrapped: string[] = [];
  for (let index = 0; index < chars.length; index += maxCharacters) {
    wrapped.push(chars.slice(index, index + maxCharacters).join("") || " ");
  }
  return wrapped.length ? wrapped : [" "];
}
