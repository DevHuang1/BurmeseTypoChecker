import { describe, expect, it } from "vitest";
import { scanBurmeseDocument } from "./scanDocument";

describe("scan input compatibility", () => {
  const cases = [
    ["TXT extraction", "တရားရုံး  ဆေးရုံတွင် ကိိ"],
    ["DOCX extraction", "တရားရုံးသည် ဆေးရုံတွင် ကိိ"],
    ["OCR extraction", "ကျန်းမာရေး  ဆေးရုံတွင် ကိိ"],
  ] as const;

  it.each(cases)("scans %s content without throwing", (_label, text) => {
    expect(() => scanBurmeseDocument(text)).not.toThrow();
    expect(scanBurmeseDocument(text).length).toBeGreaterThan(0);
  });
});
