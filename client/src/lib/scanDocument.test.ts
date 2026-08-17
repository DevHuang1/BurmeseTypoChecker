import { describe, expect, it } from "vitest";
import { scanBurmeseDocument } from "./scanDocument";

describe("scanBurmeseDocument", () => {
  it("maps a structural Burmese issue to a line, character, and page", () => {
    const [finding] = scanBurmeseDocument("အဖွင့်\nကိိ");
    expect(finding).toMatchObject({ code: "DUPLICATE_VOWEL_MARK", page: 1, line: 2, character: 2, confidence: "99%", index: 8, length: 2 });
  });

  it("tracks page locations from form-feed page boundaries", () => {
    const [finding] = scanBurmeseDocument("ပထမ\fကိိ");
    expect(finding).toMatchObject({ page: 2, line: 1, character: 2 });
  });

  it("finds obvious repeated spaces without calling unknown vocabulary a typo", () => {
    const [finding] = scanBurmeseDocument("တရားရုံး  ဆေးရုံ");
    expect(finding).toMatchObject({ code: "EXTRA_SPACE", type: "Repeated space", confidence: "96%", length: 2 });
  });

  it("carries a correction string on auto-fixable findings", () => {
    const [finding] = scanBurmeseDocument("အဖွင့်\nကိိ");
    expect(finding.code).toBe("DUPLICATE_VOWEL_MARK");
    expect(finding.correction).toBe("အဖွင့်\nကိ");
    expect(finding.replacement).toBe("ိ");
    const spaceFinding = scanBurmeseDocument("a  b").find((item) => item.code === "EXTRA_SPACE");
    expect(spaceFinding?.correction).toBe("a b");
    expect(spaceFinding?.replacement).toBe(" ");
  });

  it("returns all findings instead of capping at fifty", () => {
    const findings = scanBurmeseDocument("\u1000\u102D\u102D".repeat(60));
    expect(findings.length).toBeGreaterThan(50);
    expect(findings.length).toBe(60);
    expect(findings.every((finding) => finding.code === "DUPLICATE_VOWEL_MARK")).toBe(true);
  });
});
