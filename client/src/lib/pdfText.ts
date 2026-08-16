import { toIndexedArray } from "./compat";

export function textFromPdfItems(rawItems: unknown) {
  const items = toIndexedArray<{ str?: unknown }>(rawItems);
  let text = "";
  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    const item = items[itemIndex];
    if (item && typeof item === "object" && typeof item.str === "string") {
      text += `${item.str} `;
    }
  }
  return text.trim();
}
