import { describe, expect, it } from "vitest";
import {
  classifyBurmeseWords,
  CURATED_BURMESE_CORE_WORDS,
  CURATED_BURMESE_UNCOMMON_WORDS,
  CURATED_BURMESE_LEGAL_WORDS,
  CURATED_BURMESE_MEDICAL_WORDS,
} from "./burmeseDictionary";

describe("classifyBurmeseWords", () => {
  it("recognizes curated core vocabulary as common", () => {
    const [word] = classifyBurmeseWords("မြန်မာစာ");
    expect(word).toMatchObject({ token: "မြန်မာစာ", status: "common", recognizedDomains: [], structuralIssues: [] });
  });

  it("retains curated uncommon vocabulary without marking it as a typo", () => {
    const [word] = classifyBurmeseWords("နက္ခတ္တဗေဒ");
    expect(word).toMatchObject({ token: "နက္ခတ္တဗေဒ", status: "approved-uncommon", recognizedDomains: [], structuralIssues: [] });
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
    expect(word).toMatchObject({ status: "approved-uncommon", recognizedDomains: [], structuralIssues: [] });
  });

  it("reports code-point offsets for a mixed Latin and Burmese text sample", () => {
    const [word] = classifyBurmeseWords("note: နက္ခတ္တဗေဒ");
    expect(word).toMatchObject({ index: 6, status: "approved-uncommon" });
  });

  it("resolves a legal base term with an attached subject particle", () => {
    const [word] = classifyBurmeseWords("တရားရုံးသည်", { includedDomains: ["legal"] });
    expect(word).toMatchObject({
      token: "တရားရုံးသည်",
      baseToken: "တရားရုံး",
      attachedParticles: ["သည်"],
      status: "domain-recognized",
      recognizedDomains: ["legal"],
      structuralIssues: [],
    });
  });

  it("resolves multiple medical terms with attached particles", () => {
    const words = classifyBurmeseWords("ဆေးရုံတွင် ဆရာဝန်သည် လူနာ၏", { includedDomains: ["medical"] });
    expect(words.map((word) => word.baseToken)).toEqual(["ဆေးရုံ", "ဆရာဝန်", "လူနာ"]);
    expect(words.every((word) => word.status === "domain-recognized")).toBe(true);
    expect(words.map((word) => word.attachedParticles)).toEqual([["တွင်"], ["သည်"], ["၏"]]);
  });

  it("preserves the whole original span when an attached token has a structural typo", () => {
    const [word] = classifyBurmeseWords("ဆေးရုံိိတွင်", { includedDomains: ["medical"] });
    expect(word).toMatchObject({
      token: "ဆေးရုံိိတွင်",
      baseToken: "ဆေးရုံိိ",
      attachedParticles: ["တွင်"],
      status: "structural-error",
    });
    expect(word.structuralIssues.map((issue) => issue.code)).toContain("DUPLICATE_VOWEL_MARK");
  });

  it("recognizes reviewed legal vocabulary and reports its domain", () => {
    const [word] = classifyBurmeseWords("တရားရုံး");
    expect(word).toMatchObject({ status: "domain-recognized", recognizedDomains: ["legal"], structuralIssues: [] });
  });

  it("recognizes reviewed medical vocabulary and reports its domain", () => {
    const [word] = classifyBurmeseWords("ကျန်းမာရေး");
    expect(word).toMatchObject({ status: "domain-recognized", recognizedDomains: ["medical"], structuralIssues: [] });
  });

  it("can scope recognition to the relevant document domain", () => {
    const [word] = classifyBurmeseWords("ဆေးရုံ", { includedDomains: ["legal"] });
    expect(word).toMatchObject({ status: "unknown", recognizedDomains: [], structuralIssues: [] });
  });

  it("does not let a domain entry suppress a structural finding", () => {
    const [word] = classifyBurmeseWords("ဆေးရုံိိ");
    expect(word.status).toBe("structural-error");
    expect(word.recognizedDomains).toEqual([]);
    expect(word.structuralIssues.map((issue) => issue.code)).toContain("DUPLICATE_VOWEL_MARK");
  });
});

describe("curated lexicon integrity", () => {
  const curatedGroups = [
    CURATED_BURMESE_CORE_WORDS,
    CURATED_BURMESE_UNCOMMON_WORDS,
    CURATED_BURMESE_LEGAL_WORDS,
    CURATED_BURMESE_MEDICAL_WORDS,
  ];

  it("contains no structurally invalid entries across every curated array", () => {
    curatedGroups.forEach((group) => {
      group.forEach((word) => {
        const [classification] = classifyBurmeseWords(word);
        expect(classification).toBeDefined();
        expect(classification.status).not.toBe("structural-error");
        expect(classification.structuralIssues).toEqual([]);
      });
    });
  });

  it("classifies newly added core vocabulary as common", () => {
    ["ကျောင်း", "အိမ်", "မိသားစု"].forEach((word) => {
      expect(classifyBurmeseWords(word)[0]).toMatchObject({
        status: "common",
        recognizedDomains: [],
        structuralIssues: [],
      });
    });
  });

  it("classifies newly added uncommon vocabulary as approved-uncommon", () => {
    ["သိပ္ပံ", "ဝိညာဉ်", "ဘုန်းတော်ကြီး"].forEach((word) => {
      expect(classifyBurmeseWords(word)[0]).toMatchObject({
        status: "approved-uncommon",
        recognizedDomains: [],
        structuralIssues: [],
      });
    });
  });

  it("classifies newly added legal vocabulary with the legal domain", () => {
    ["တရားလွှတ်တော်", "ရဲအရာရှိ", "မှတ်ပုံတင်"].forEach((word) => {
      expect(classifyBurmeseWords(word)[0]).toMatchObject({
        status: "domain-recognized",
        recognizedDomains: ["legal"],
        structuralIssues: [],
      });
    });
  });

  it("classifies newly added medical vocabulary with the medical domain", () => {
    ["နှလုံးရောဂါ", "ဆီးချိုရောဂါ", "သက်ကြီးရွယ်အို"].forEach((word) => {
      expect(classifyBurmeseWords(word)[0]).toMatchObject({
        status: "domain-recognized",
        recognizedDomains: ["medical"],
        structuralIssues: [],
      });
    });
  });

  it("does not let a curated core hit suppress a structural finding", () => {
    const [word] = classifyBurmeseWords("ရေိိ");
    expect(word.status).toBe("structural-error");
    expect(word.recognizedDomains).toEqual([]);
    expect(word.structuralIssues.map((issue) => issue.code)).toContain("DUPLICATE_VOWEL_MARK");
  });
});
