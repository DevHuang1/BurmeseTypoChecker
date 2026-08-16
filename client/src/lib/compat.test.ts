import { describe, expect, it } from "vitest";
import { safeChars, safeNormalize, toIndexedArray } from "./compat";

describe("compatibility helpers", () => {
  it("segments Burmese text without relying on Array.from", () => {
    expect(safeChars("တရားရုံးသည်")).toEqual(["တ", "ရ", "ာ", "း", "ရ", "ု", "ံ", "း", "သ", "ည", "်"]);
  });

  it("falls back when Unicode normalization is unavailable or throws", () => {
    expect(safeNormalize("မြန်မာ")).toBe("မြန်မာ");
  });

  it("normalizes arrays and array-like objects without invoking iterators", () => {
    expect(toIndexedArray({ 0: "a", 1: "b", length: 2 })).toEqual(["a", "b"]);
    expect(toIndexedArray({ length: "bad" })).toEqual([]);
    expect(toIndexedArray(new Set(["a", "b"]))).toEqual(["a", "b"]);
    const iterableOnly = {
      [Symbol.iterator]: () => new Set(["c", "d"])[Symbol.iterator](),
    };
    expect(toIndexedArray(iterableOnly)).toEqual([]);
  });
});
