import { afterEach, describe, expect, it } from "vitest";
import { installArrayIteratorShim } from "./iteratorShim";

const iteratorKey = Symbol.iterator;
const originalDescriptor = Object.getOwnPropertyDescriptor(Array.prototype, iteratorKey);

afterEach(() => {
  if (originalDescriptor) Object.defineProperty(Array.prototype, iteratorKey, originalDescriptor);
});

describe("native array iterator compatibility shim", () => {
  it("restores indexed iteration when a runtime exposes Symbol.iterator but Array lacks its iterator method", () => {
    Object.defineProperty(Array.prototype, iteratorKey, { configurable: true, writable: true, value: undefined });
    installArrayIteratorShim();

    const iterator = (["a", "b"] as unknown as { [Symbol.iterator]: () => { next: () => { value: unknown; done: boolean } } })[iteratorKey]();
    expect(iterator.next()).toEqual({ value: "a", done: false });
    expect(iterator.next()).toEqual({ value: "b", done: false });
    expect(iterator.next()).toEqual({ value: undefined, done: true });
  });
});
