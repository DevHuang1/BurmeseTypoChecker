import { describe, expect, it } from "vitest";
import { getFindingHighlightRange } from "./findingHighlight";

describe("getFindingHighlightRange", () => {
  it("places the selected finding at the exact Unicode-safe source index", () => {
    const source = "အဖွင့်\nကိိ စာ";
    const range = getFindingHighlightRange(source, 8, 2, 0, 0);
    expect(range.chars.slice(range.markStart, range.markEnd).join("")).toBe("ိိ");
    expect(range.markStart).toBe(8);
    expect(range.markEnd).toBe(10);
  });

  it("keeps a page boundary and finding range stable for long extracted PDFs", () => {
    const source = `${"က".repeat(500)}\f${"စာ".repeat(500)}`;
    const findingIndex = 502;
    const range = getFindingHighlightRange(source, findingIndex, 2, 20, 36);
    expect(range.chars[range.markStart]).toBe("ာ");
    expect(range.markEnd - range.markStart).toBe(2);
    expect(range.chars.slice(range.start, range.end).join("")).toContain("\f");
  });
});
