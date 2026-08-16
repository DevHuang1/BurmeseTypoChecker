export function textFromPdfItems(rawItems: unknown): string {
  if (!Array.isArray(rawItems)) return "";

  let text = "";
  for (let itemIndex = 0; itemIndex < rawItems.length; itemIndex += 1) {
    const item = rawItems[itemIndex];
    if (item && typeof item === "object" && "str" in item && typeof (item as { str?: unknown }).str === "string") {
      text += `${(item as { str: string }).str} `;
    }
  }
  return text.trim();
}
