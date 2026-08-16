type IndexedIterator = { next: () => { value: unknown; done: boolean } };

/**
 * Restore the native Array iterator only when an older browser exposes Symbol.iterator
 * but omits Array.prototype[Symbol.iterator]. This protects bundled library helpers
 * without making arbitrary PDF or document objects iterable.
 */
export function installArrayIteratorShim(): void {
  if (typeof Symbol !== "function" || !Symbol.iterator) return;
  const arrayPrototype = Array.prototype as unknown as { [Symbol.iterator]?: () => IndexedIterator };
  if (typeof arrayPrototype[Symbol.iterator] === "function") return;

  Object.defineProperty(Array.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: function indexedArrayIterator(this: unknown[]): IndexedIterator {
      let index = 0;
      return {
        next: () => {
          if (index >= this.length) return { value: undefined, done: true };
          const value = this[index];
          index += 1;
          return { value, done: false };
        },
      };
    },
  });
}

installArrayIteratorShim();
