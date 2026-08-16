import { CharacterSet, Document, Packer, Paragraph, TextRun } from "docx";

export const BURMESE_DOCX_FONT_NAME = "NotoSansMyanmar";

export async function createCorrectedDocxBlob(text: string, fontBytes: Uint8Array, title: string): Promise<Blob> {
  const sourceLines = text.split(/\r?\n/);
  const paragraphs = sourceLines.map((line) => new Paragraph({
    spacing: { after: 180, line: 360 },
    children: [new TextRun({ text: line || " ", font: BURMESE_DOCX_FONT_NAME, size: 32, color: "24354F" })],
  }));
  const document = new Document({
    creator: "Burmese Typo Checker",
    title,
    fonts: [{ name: BURMESE_DOCX_FONT_NAME, data: fontBytes as unknown as Buffer, characterSet: CharacterSet.DEFAULT }],
    styles: {
      default: {
        document: {
          run: { font: BURMESE_DOCX_FONT_NAME, size: 32, color: "24354F" },
        },
      },
    },
    sections: [{ children: paragraphs }],
  });
  return Packer.toBlob(document);
}
