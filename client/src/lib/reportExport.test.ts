import { describe, expect, it } from "vitest";
import { buildScanReportHtml } from "./reportExport";
import { scanBurmeseDocument } from "./scanDocument";

describe("buildScanReportHtml", () => {
  it("builds a report with document health, type summary, and finding rows", () => {
    const sourceText = "တရားရုံး  ဆေးရုံတွင် ကိိ";
    const findings = scanBurmeseDocument(sourceText);
    const html = buildScanReportHtml({
      fileName: "sample.txt",
      fileType: "TXT",
      fileSize: "1 KB",
      scannedAt: "2026-08-17 09:00",
      sourceText,
      findings,
    });

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Burmese Typo Scan Report");
    expect(html).toContain("sample.txt");
    expect(html).toContain("Findings");
    expect(html).toContain("Repeated space");
    expect(html).toContain("P1 · L1");
    expect(html).toContain("96%");
  });

  it("handles an empty findings list", () => {
    const html = buildScanReportHtml({
      fileName: "clean.txt",
      fileType: "TXT",
      fileSize: "1 KB",
      scannedAt: "2026-08-17 09:00",
      sourceText: "မြန်မာစာ",
      findings: [],
    });

    expect(html).toContain("No high-confidence structural typos were found");
    expect(html).toContain("Clear");
  });

  it("escapes HTML-sensitive characters in finding text", () => {
    const html = buildScanReportHtml({
      fileName: "test.txt",
      fileType: "TXT",
      fileSize: "1 KB",
      scannedAt: "2026-08-17 09:00",
      sourceText: "a  b",
      findings: [
        {
          id: "EXTRA_SPACE-1",
          code: "EXTRA_SPACE",
          type: "Repeated space",
          excerpt: "a  b",
          suggestion: "Replace repeated spaces with one space.",
          confidence: "96%",
          correction: "a b",
          replacement: " ",
          page: 1,
          line: 1,
          character: 2,
          index: 1,
          length: 2,
        },
      ],
    });

    expect(html).toContain("Repeated space");
    expect(html).toContain("a  b");
  });
});
