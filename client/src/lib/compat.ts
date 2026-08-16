export function safeNormalize(text: string) {
  try {
    return typeof text.normalize === "function" ? text.normalize("NFC") : text;
  } catch {
    return text;
  }
}

/**
 * Burmese is in the BMP, so a manual UTF-16 walk is sufficient for scanner
 * offsets and avoids Array.from/spread iterator assumptions in older browsers.
 */
export function safeChars(text: string): string[] {
  const normalized = safeNormalize(text);
  const chars: string[] = [];
  for (let index = 0; index < normalized.length; index += 1) {
    const first = normalized.charCodeAt(index);
    if (first >= 0xd800 && first <= 0xdbff && index + 1 < normalized.length) {
      const second = normalized.charCodeAt(index + 1);
      if (second >= 0xdc00 && second <= 0xdfff) {
        chars.push(normalized.slice(index, index + 2));
        index += 1;
        continue;
      }
    }
    chars.push(normalized.charAt(index));
  }
  return chars;
}

/** Convert arrays, array-like PDF collections, and safe iterables without for-of. */
export function toIndexedArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value.slice() as T[];
  if (value == null) return [];

  try {
    const length = (value as { length?: unknown }).length;
    if (typeof length === "number" && Number.isFinite(length) && length >= 0) {
      const result: T[] = [];
      const count = Math.min(Math.floor(length), 100000);
      for (let index = 0; index < count; index += 1) {
        result.push((value as Record<number, T>)[index]);
      }
      return result;
    }
  } catch {
    return [];
  }

  try {
    const iteratorFactory = typeof Symbol !== "undefined" ? (value as { [Symbol.iterator]?: () => unknown })[Symbol.iterator] : undefined;
    if (typeof iteratorFactory !== "function") return [];
    const iterator = iteratorFactory.call(value) as { next?: () => { done?: boolean; value?: T } };
    if (!iterator || typeof iterator.next !== "function") return [];
    const result: T[] = [];
    for (let step = iterator.next(); !step.done && result.length < 100000; step = iterator.next()) {
      result.push(step.value as T);
    }
    return result;
  } catch {
    return [];
  }
}
