import { detectBurmeseSyllableTypos, type BurmeseTypoIssue } from "./burmeseTypos";

/**
 * Curated vocabulary is intentionally small and reviewable. It classifies known
 * words but never replaces structural validation or claims full dictionary coverage.
 */
export type BurmeseWordStatus = "common" | "approved-uncommon" | "unknown" | "structural-error";

export type BurmeseWordClassification = {
  token: string;
  normalized: string;
  index: number;
  length: number;
  status: BurmeseWordStatus;
  structuralIssues: BurmeseTypoIssue[];
};

export type BurmeseDictionaryOptions = {
  additionalApprovedWords?: Iterable<string>;
};

export const CURATED_BURMESE_CORE_WORDS = [
  "မြန်မာ",
  "မြန်မာစာ",
  "ဘာသာစကား",
  "စာ",
  "စာရေးခြင်း",
  "စာဖတ်ခြင်း",
  "စာတည်းဖြတ်ခြင်း",
  "စာလုံးပေါင်း",
  "သတ်ပုံ",
  "ပုဒ်ဖြတ်",
  "အရေးကြီး",
  "အလှပ",
  "ယနေ့",
  "ခေတ်",
  "အလေ့အထ",
  "သုတေသန",
  "ပညာရေး",
  "နည်းပညာ",
  "ပြည်သူ",
  "နိုင်ငံ",
  "ကမ္ဘာ",
] as const;

/**
 * Valid, lower-frequency words which should not be presented as possible typos.
 * New domain terms can be passed at runtime through additionalApprovedWords.
 */
export const CURATED_BURMESE_UNCOMMON_WORDS = [
  "နက္ခတ္တဗေဒ",
  "အဏုမြူ",
  "စကြဝဠာ",
  "ပရိယတ္တိ",
  "ဝိဇ္ဇာ",
  "သီရိမင်္ဂလာ",
  "နိဗ္ဗာန်",
  "ဝေါဟာရ",
  "ရာဇဝင်",
  "ဂီတစာပေ",
] as const;

const myanmarCharacter = /[\u1000-\u109F]/;
const normalize = (value: string) => value.normalize("NFC");
const coreWords = new Set(CURATED_BURMESE_CORE_WORDS.map(normalize));
const uncommonWords = new Set(CURATED_BURMESE_UNCOMMON_WORDS.map(normalize));

function extractBurmeseTokens(value: string) {
  const chars = Array.from(normalize(value));
  const tokens: Array<{ token: string; index: number; length: number }> = [];
  let start = -1;

  for (let index = 0; index <= chars.length; index += 1) {
    const isMyanmar = index < chars.length && myanmarCharacter.test(chars[index]);
    if (isMyanmar && start === -1) start = index;
    if (!isMyanmar && start !== -1) {
      tokens.push({ token: chars.slice(start, index).join(""), index: start, length: index - start });
      start = -1;
    }
  }

  return tokens;
}

function overlaps(leftIndex: number, leftLength: number, rightIndex: number, rightLength: number) {
  return leftIndex < rightIndex + rightLength && rightIndex < leftIndex + leftLength;
}

/**
 * Classifies Burmese tokens after structural checks. A valid but unknown token is
 * returned as `unknown` for review; it is not automatically labelled a typo.
 */
export function classifyBurmeseWords(value: string, options: BurmeseDictionaryOptions = {}): BurmeseWordClassification[] {
  const structuralIssues = detectBurmeseSyllableTypos(value);
  const approvedWords = new Set(Array.from(options.additionalApprovedWords ?? [], normalize));

  return extractBurmeseTokens(value).map(({ token, index, length }) => {
    const normalized = normalize(token);
    const tokenIssues = structuralIssues.filter((issue) => overlaps(index, length, issue.index, issue.length));
    let status: BurmeseWordStatus = "unknown";

    if (tokenIssues.length > 0) status = "structural-error";
    else if (coreWords.has(normalized)) status = "common";
    else if (uncommonWords.has(normalized) || approvedWords.has(normalized)) status = "approved-uncommon";

    return { token, normalized, index, length, status, structuralIssues: tokenIssues };
  });
}
