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
});
