import { detectBurmeseSyllableTypos, type BurmeseTypoIssue } from "./burmeseTypos";

/**
 * Curated vocabulary is intentionally small and reviewable. It classifies known
 * words but never replaces structural validation or claims full dictionary coverage.
 */
export type BurmeseLexiconDomain = "legal" | "medical";
export type BurmeseWordStatus = "common" | "approved-uncommon" | "domain-recognized" | "unknown" | "structural-error";

export type BurmeseWordClassification = {
  token: string;
  normalized: string;
  baseToken: string;
  normalizedBaseToken: string;
  attachedParticles: string[];
  index: number;
  length: number;
  status: BurmeseWordStatus;
  recognizedDomains: BurmeseLexiconDomain[];
  structuralIssues: BurmeseTypoIssue[];
};

export type BurmeseDictionaryOptions = {
  additionalApprovedWords?: Iterable<string>;
  includedDomains?: Iterable<BurmeseLexiconDomain>;
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

/**
 * Reviewed legal terminology. The set is curated for clear category coverage,
 * not presented as a replacement for a complete legal dictionary.
 */
export const CURATED_BURMESE_LEGAL_WORDS = [
  "ဥပဒေ",
  "တရားဥပဒေ",
  "တရားရုံး",
  "တရားသူကြီး",
  "ရှေ့နေ",
  "တရားလို",
  "တရားခံ",
  "အမှု",
  "အမှုတွဲ",
  "တရားစွဲဆိုမှု",
  "စွဲချက်",
  "သက်သေ",
  "သက်သေခံ",
  "သက်သေခံပစ္စည်း",
  "အယူခံ",
  "အမိန့်",
  "စီရင်ချက်",
  "ပြစ်မှု",
  "ပြစ်ဒဏ်",
  "အကျဉ်းထောင်",
  "အာမခံ",
  "စာချုပ်",
  "တရားဝင်",
  "အခွင့်အရေး",
  "တာဝန်",
  "ဖွဲ့စည်းပုံအခြေခံဥပဒေ",
  "ဥပဒေကြမ်း",
  "နိုင်ငံသား",
  "ပစ္စည်း",
  "ပိုင်ဆိုင်မှု",
  "အမွေဆက်ခံ",
  "ချုပ်နှောင်",
  "အာဏာ",
  "ရာဇဝတ်မှု",
  "သံသယရှိသူ",
  "မှတ်တမ်း",
  "လျှောက်လွှာ",
  "ခွင့်ပြုချက်",
  "ပိတ်ပင်မှု",
  "တရားမျှတမှု",
] as const;

/**
 * Reviewed medical terminology spanning clinical roles, care settings, symptoms,
 * diagnostics, treatment, prevention, and common body systems.
 */
export const CURATED_BURMESE_MEDICAL_WORDS = [
  "ကျန်းမာရေး",
  "ဆေးရုံ",
  "ဆရာဝန်",
  "သူနာပြု",
  "လူနာ",
  "ရောဂါ",
  "ကုသမှု",
  "ရောဂါလက္ခဏာ",
  "ရောဂါရှာဖွေခြင်း",
  "ဆေးဝါး",
  "ကာကွယ်ဆေး",
  "ကာကွယ်မှု",
  "ခွဲစိတ်ကုသမှု",
  "သွေးပေါင်ချိန်",
  "ကိုယ်အပူချိန်",
  "အသက်ရှူ",
  "အရေးပေါ်",
  "ပိုးကူးစက်မှု",
  "ကူးစက်ရောဂါ",
  "နာကျင်မှု",
  "ဆေးညွှန်း",
  "ဆေးမှတ်တမ်း",
  "ဓာတ်ခွဲခန်း",
  "ဓာတ်မှန်",
  "စစ်ဆေးမှု",
  "ကာယကုထုံး",
  "အာဟာရ",
  "အာဟာရချို့တဲ့မှု",
  "မိခင်",
  "ကလေး",
  "ကာကွယ်ဆေးထိုးခြင်း",
  "နာတာရှည်ရောဂါ",
  "စိတ်ကျန်းမာရေး",
  "မျက်စိ",
  "နှလုံး",
  "အသည်း",
  "ကျောက်ကပ်",
  "အဆုတ်",
  "သွေးချို",
  "သွေးအားနည်းရောဂါ",
] as const;

const myanmarCharacter = /[\u1000-\u109F]/;
const normalize = (value: string) => value.normalize("NFC");

/**
 * Conservative bound particles/postpositions. Keep this list explicit so
 * suffix stripping cannot silently turn arbitrary text into a dictionary hit.
 */
export const BURMESE_ATTACHED_PARTICLES = [
  "သည်",
  "၏",
  "ကို",
  "က",
  "မှ",
  "တွင်",
  "တွေနှင့်",
  "နှင့်",
  "ဖြင့်",
  "အတွက်",
  "အပေါ်",
  "အောက်",
  "ထံ",
] as const;
const coreWords = new Set(CURATED_BURMESE_CORE_WORDS.map(normalize));
const uncommonWords = new Set(CURATED_BURMESE_UNCOMMON_WORDS.map(normalize));
const domainWords: Record<BurmeseLexiconDomain, Set<string>> = {
  legal: new Set(CURATED_BURMESE_LEGAL_WORDS.map(normalize)),
  medical: new Set(CURATED_BURMESE_MEDICAL_WORDS.map(normalize)),
};

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

function resolveAttachedParticles(token: string) {
  const normalizedToken = normalize(token);
  const particles = [...BURMESE_ATTACHED_PARTICLES].sort((left, right) => right.length - left.length);
  const attachedParticles: string[] = [];
  let baseToken = normalizedToken;

  let changed = true;
  while (changed) {
    changed = false;
    const particle = particles.find((candidate) => baseToken.endsWith(candidate) && baseToken !== candidate);
    if (particle) {
      attachedParticles.unshift(particle);
      baseToken = baseToken.slice(0, -particle.length);
      changed = true;
    }
  }

  return { baseToken, attachedParticles };
}

/**
 * Classifies Burmese tokens after structural checks. A valid but unknown token is
 * returned as `unknown` for review; it is not automatically labelled a typo.
 */
export function classifyBurmeseWords(value: string, options: BurmeseDictionaryOptions = {}): BurmeseWordClassification[] {
  const structuralIssues = detectBurmeseSyllableTypos(value);
  const approvedWords = new Set(Array.from(options.additionalApprovedWords ?? [], normalize));
  const includedDomains = new Set<BurmeseLexiconDomain>(
    Array.from(options.includedDomains ?? (["legal", "medical"] as BurmeseLexiconDomain[])),
  );

  return extractBurmeseTokens(value).map(({ token, index, length }) => {
    const normalized = normalize(token);
    const { baseToken, attachedParticles } = resolveAttachedParticles(normalized);
    const tokenIssues = structuralIssues.filter((issue) => overlaps(index, length, issue.index, issue.length));
    const recognizedDomains = (Object.keys(domainWords) as BurmeseLexiconDomain[]).filter(
      (domain) => includedDomains.has(domain) && domainWords[domain].has(baseToken),
    );
    let status: BurmeseWordStatus = "unknown";

    if (tokenIssues.length > 0) status = "structural-error";
    else if (coreWords.has(baseToken)) status = "common";
    else if (uncommonWords.has(baseToken) || approvedWords.has(baseToken)) status = "approved-uncommon";
    else if (recognizedDomains.length > 0) status = "domain-recognized";

    return {
      token,
      normalized,
      baseToken,
      normalizedBaseToken: baseToken,
      attachedParticles,
      index,
      length,
      status,
      recognizedDomains,
      structuralIssues: tokenIssues,
    };
  });
}
