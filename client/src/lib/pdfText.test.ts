import { describe, expect, it } from "vitest";
import { textFromPdfItems } from "./pdfText";

describe("textFromPdfItems", () => {
  it("extracts Burmese strings from PDF text items in order", () => {
    expect(textFromPdfItems([{ str: "တရားရုံး" }, { str: "သည်" }, { str: "ဆေးရုံ" }])).toBe("တရားရုံး သည် ဆေးရုံ");
  });

  it("returns an empty string for non-array or malformed collections", () => {
    expect(textFromPdfItems(undefined)).toBe("");
    expect(textFromPdfItems({ 0: { str: "အမှု" }, length: 1 })).toBe("အမှု");
    expect(textFromPdfItems([{ str: 12 }, null, { noText: true }])).toBe("");
  });

  it("handles the supplied PDF's long mixed page payload shape", () => {
    const suppliedPdfPage = new Array(708).fill(null).map((_item, index) => index === 0
      ? { str: "By Lwin Moe Paing TypeScript Baby" }
      : index === 707
        ? { str: "တရားရုံးသည် ဆေးရုံတွင်" }
        : { str: index % 17 === 0 ? "" : "က" });
    const pageText = textFromPdfItems(suppliedPdfPage);
    const documentText = new Array(84).fill(pageText).join("\f");
    expect(documentText.split("\f")).toHaveLength(84);
    expect(documentText).toContain("TypeScript Baby");
    expect(documentText).toContain("တရားရုံးသည် ဆေးရုံတွင်");
    expect(documentText.length).toBeGreaterThan(60000);
  });
});
