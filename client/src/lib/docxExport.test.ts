import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { BURMESE_DOCX_FONT_NAME, createCorrectedDocxBlob } from "./docxExport";

describe("createCorrectedDocxBlob", () => {
  it("preserves Burmese text and embeds the configured Myanmar font", async () => {
    const blob = await createCorrectedDocxBlob("တရားရုံးသည် ဆေးရုံတွင်\nပြင်ဆင်ပြီး", new Uint8Array([0, 1, 2, 3, 4]), "Burmese correction");
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const documentXml = await zip.file("word/document.xml")?.async("string");
    const fontTableXml = await zip.file("word/fontTable.xml")?.async("string");

    expect(documentXml).toContain("တရားရုံးသည် ဆေးရုံတွင်");
    expect(documentXml).toContain("ပြင်ဆင်ပြီး");
    expect(documentXml).toContain(BURMESE_DOCX_FONT_NAME);
    expect(fontTableXml).toContain(BURMESE_DOCX_FONT_NAME);
    expect(zip.file("word/fonts/font1.odttf")).toBeTruthy();
    expect(zip.file("word/_rels/fontTable.xml.rels")).toBeTruthy();
  });
});
