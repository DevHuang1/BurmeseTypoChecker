import { safeChars } from "@/lib/compat";
import { getFindingHighlightRangeFromChars } from "@/lib/findingHighlight";
import { findingFixSpan, type ScanFinding } from "@/lib/scanDocument";
import { ArrowUpRight, Check, MapPin, Zap } from "lucide-react";

export type FindingsFilter = "all" | "autofix" | "manual";

export function HighlightedFindingExcerpt({ sourceChars, finding, className = "" }: { sourceChars: string[]; finding: ScanFinding; className?: string }) {
  const { start, end, markStart, markEnd } = getFindingHighlightRangeFromChars(sourceChars, finding.index, finding.length);
  const before = sourceChars.slice(start, markStart).join("");
  const marked = sourceChars.slice(markStart, markEnd).join("");
  const after = sourceChars.slice(markEnd, end).join("");
  return <p className={`burmese leading-[1.9] ${className}`}><span className="text-[#324258]">{start > 0 ? "…" : ""}{before}</span><mark data-finding-highlight="true" className="rounded-md bg-[#f2b36d] px-1 py-0.5 text-[#24354f] shadow-[0_0_0_2px_rgba(242,179,109,.25)]">{marked || " "}</mark><span className="text-[#324258]">{after}{end < sourceChars.length ? "…" : ""}</span></p>;
}

export function CorrectionPreview({ original, replacement }: { original: string; replacement: string }) {
  const part = (value: string) => value === "" ? <span className="text-[#b09a83]">∅</span> : <span className="burmese whitespace-pre">{value}</span>;
  return <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-[#efe9dc] px-2 py-1 align-middle text-[11px] leading-none text-[#6b726e]">{part(original)}<span className="text-[#b09a83]" aria-hidden="true">→</span>{part(replacement)}</span>;
}

type ScanResultsProps = {
  findings: ScanFinding[];
  sourceChars: string[];
  filter: FindingsFilter;
  onFilterChange: (filter: FindingsFilter) => void;
  onSelect: (id: string) => void;
  onAccept: (finding: ScanFinding) => void;
  onApplyAll: () => void;
};

export function ScanResults({ findings, sourceChars, filter, onFilterChange, onSelect, onAccept, onApplyAll }: ScanResultsProps) {
  if (findings.length === 0) return <section aria-live="polite" className="mt-5 rounded-[22px] border border-[#cbdac9] bg-[#f3f8f0] px-5 py-5 sm:px-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcebd9] text-[#4d7556]"><Check size={19} /></div><div><div className="text-sm font-bold text-[#31523d]">No high-confidence typos found</div><p className="mt-1 text-[11px] leading-4 text-[#627b67]">Corrections are applied from the review desk. If valid words were flagged as unknown, they remain review metadata, not automatic typos.</p></div></div></section>;

  const autoFixable = findings.filter((finding) => finding.correction !== null);
  const manual = findings.filter((finding) => finding.correction === null);
  const visible = filter === "all" ? findings : filter === "autofix" ? autoFixable : manual;
  const segmentClass = (active: boolean) => `rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em] transition ${active ? "bg-[#24354f] text-[#fffaf0] shadow-[0_4px_10px_rgba(36,53,79,.18)]" : "bg-[#f1ecdf] text-[#6f7b86] hover:bg-[#e7e1d3] hover:text-[#24354f]"}`;

  return <section aria-live="polite" className="mt-5 overflow-hidden rounded-[22px] border border-[#ded6c9] bg-[#fbf8f0] shadow-[0_10px_24px_rgba(50,44,34,.05)]"><div className="flex flex-col gap-2 border-b border-[#e5ddd1] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><div className="flex items-center gap-2 text-sm font-bold"><span className="h-px w-5 bg-[#c85a3f]" /> Instant scan results <span className="rounded-full bg-[#f2d5cb] px-2 py-0.5 text-[10px] font-bold text-[#a24d3b]">{visible.length > 30 ? `Showing 30 of ${visible.length}` : `${visible.length} found`}</span></div><div className="mt-1 text-[11px] text-[#8e9699]">Typos are mapped to extracted page, line, and character locations.</div></div><div className="flex flex-wrap items-center gap-3">{autoFixable.length > 0 ? <button onClick={onApplyAll} className="flex items-center gap-1.5 rounded-lg border border-[#c8dcbe] bg-[#f2f7ef] px-3 py-2 text-[10px] font-bold text-[#31523d] transition hover:-translate-y-0.5 hover:border-[#4d7556]"><Zap size={12} /> Apply all fixes</button> : null}<div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.13em] text-[#6e9072]"><span className="h-1.5 w-1.5 rounded-full bg-[#6e9072]" /> Locations ready</div></div></div><div className="flex flex-wrap items-center gap-2 border-b border-[#e5ddd1] bg-[#faf6ec] px-5 py-3 sm:px-6"><button onClick={() => onFilterChange("all")} className={segmentClass(filter === "all")}>All <span className="opacity-80">{findings.length}</span></button><button onClick={() => onFilterChange("autofix")} className={segmentClass(filter === "autofix")}>Auto-fixable <span className="opacity-80">{autoFixable.length}</span></button><button onClick={() => onFilterChange("manual")} className={segmentClass(filter === "manual")}>Manual review <span className="opacity-80">{manual.length}</span></button></div><div className="divide-y divide-[#e8dfd3]">{visible.length === 0 ? <div className="px-5 py-8 text-center text-xs text-[#8e9699]">No findings match this filter.</div> : visible.slice(0, 30).map((finding) => <div key={finding.id} role="button" tabIndex={0} onClick={() => onSelect(finding.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(finding.id); } }} className="flex w-full cursor-pointer items-start gap-3 px-5 py-4 text-left transition hover:bg-[#f5eee4] sm:gap-4 sm:px-6"><div className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-lg bg-[#f3d8cf] px-2 py-1 text-[10px] font-bold text-[#a24d3b]"><MapPin size={12} />P{finding.page} · L{finding.line}</div><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#9a8e82]">{finding.type}</span><span className="text-[10px] font-semibold text-[#80908a]">Char {finding.character}</span><span className="text-[9px] font-bold text-[#648269]">{finding.confidence}</span></div><HighlightedFindingExcerpt sourceChars={sourceChars} finding={finding} className="truncate text-[15px]" /><p className="mt-1 truncate text-[12px] leading-[1.7] text-[#a15d49]"><span className="mr-1 font-bold uppercase tracking-widest text-[#b16b54]">Suggest</span>{finding.suggestion}</p>{finding.replacement !== null ? <CorrectionPreview original={sourceChars.slice(findingFixSpan(finding).start, findingFixSpan(finding).end).join("")} replacement={finding.replacement} /> : null}</div><div className="flex shrink-0 flex-col items-end gap-2.5"><ArrowUpRight size={15} className="mt-1 text-[#abb0ae]" />{finding.correction !== null ? <button onClick={(event) => { event.stopPropagation(); onAccept(finding); }} className="flex items-center gap-1.5 rounded-lg bg-[#4d7556] px-2.5 py-1.5 text-[10px] font-bold text-[#fffaf0] shadow-[0_3px_8px_rgba(77,117,86,.25)] transition hover:-translate-y-0.5 hover:bg-[#3f6349]"><Check size={12} strokeWidth={2.5} /> Accept</button> : <span className="rounded-md bg-[#e9e3d7] px-2 py-1 text-[9px] font-semibold uppercase tracking-[.13em] text-[#8e9699]">Manual review</span>}</div></div>)}</div></section>;
}