import { describe, expect, it } from "vitest";
import { classifyBurmeseWords } from "./burmeseDictionary";

describe("classifyBurmeseWords", () => {
  it("recognizes curated core vocabulary as common", () => {
    const [word] = classifyBurmeseWords("မြန်မာစာ");
    expect(word).toMatchObject({ token: "မြန်မာစာ", status: "common", structuralIssues: [] });
  });

  it("retains curated uncommon vocabulary without marking it as a typo", () => {
    const [word] = classifyBurmeseWords("နက္ခတ္တဗေဒ");
    expect(word).toMatchObject({ token: "နက္ခတ္တဗေဒ", status: "approved-uncommon", structuralIssues: [] });
  });

  it("keeps a structurally valid but unlisted token separate from a structural typo", () => {
    const [word] = classifyBurmeseWords("က္က");
    expect(word).toMatchObject({ status: "unknown", structuralIssues: [] });
  });

  it("prioritizes structural errors even when the token resembles dictionary content", () => {
    const [word] = classifyBurmeseWords("မြန်မာစာိိ");
    expect(word.status).toBe("structural-error");
    expect(word.structuralIssues.map((issue) => issue.code)).toContain("DUPLICATE_VOWEL_MARK");
  });

  it("supports a runtime allowlist for organization-specific uncommon words", () => {
    const [word] = classifyBurmeseWords("နိဗ္ဗာန်", { additionalApprovedWords: ["နိဗ္ဗာန်"] });
    expect(word).toMatchObject({ status: "approved-uncommon", structuralIssues: [] });
  });

  it("reports code-point offsets for a mixed Latin and Burmese text sample", () => {
    const [word] = classifyBurmeseWords("note: နက္ခတ္တဗေဒ");
    expect(word).toMatchObject({ index: 6, status: "approved-uncommon" });
  });
});
