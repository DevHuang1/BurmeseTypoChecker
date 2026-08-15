import { classifyBurmeseWords } from "./client/src/lib/burmeseDictionary";

const samples = {
  legal: {
    clean: "တရားရုံးသည် တရားသူကြီး၏ စီရင်ချက်နှင့် အမိန့်ကို မှတ်တမ်းတင်သည်။",
    unknown: "တရားရုံးတွင် အလင်းဝါဟုခေါ်သော ဝေါဟာရကို အသုံးပြုသည်။",
    structural: "တရားရုံးိိတွင် စာချုပ်ကို စစ်ဆေးသည်။",
  },
  medical: {
    clean: "ဆေးရုံတွင် ဆရာဝန်သည် လူနာ၏ ရောဂါလက္ခဏာနှင့် ဆေးမှတ်တမ်းကို စစ်ဆေးသည်။",
    unknown: "ဆေးရုံတွင် ဇီဝညှိနှိုင်းမှုဟုခေါ်သော ဝေါဟာရကို လေ့လာသည်။",
    structural: "ဆေးရုံိိတွင် လူနာကို ကုသသည်။",
  },
};

for (const [domain, cases] of Object.entries(samples)) {
  console.log(`\n[${domain.toUpperCase()}]`);
  for (const [caseName, text] of Object.entries(cases)) {
    const result = classifyBurmeseWords(text, { includedDomains: [domain as "legal" | "medical"] });
    console.log(JSON.stringify({ caseName, text, result }, null, 2));
  }
}

const isolatedTerms = {
  legal: "တရားရုံး စီရင်ချက် အမိန့်",
  medical: "ဆေးရုံ ဆရာဝန် လူနာ",
};
for (const [domain, text] of Object.entries(isolatedTerms)) {
  const result = classifyBurmeseWords(text, { includedDomains: [domain as "legal" | "medical"] });
  console.log(JSON.stringify({ caseName: "isolated-domain-terms", domain, text, result }, null, 2));
}
