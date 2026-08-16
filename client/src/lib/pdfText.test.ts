import { describe, expect, it } from "vitest";
import { textFromPdfItems } from "./pdfText";

describe("textFromPdfItems", () => {
  it("extracts Burmese strings from PDF text items in order", () => {
    expect(textFromPdfItems([{ str: "တရားရုံး" }, { str: "သည်" }, { str: "ဆေးရုံ" }])).toBe("တရားရုံး သည် ဆေးရုံ");
  });

  it("returns an empty string for non-array or malformed collections", () => {
    expect(textFromPdfItems(undefined)).toBe("");
    expect(textFromPdfItems({ 0: { str: "အမှု" }, length: 1 })).toBe("");
    expect(textFromPdfItems([{ str: 12 }, null, { noText: true }])).toBe("");
  });
});
