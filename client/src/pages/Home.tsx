import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import {
  ArrowUpRight,
  Check,
  ClipboardCheck,
  CloudUpload,
  Download,
  FileImage,
  FileText,
  HelpCircle,
  History,
  LayoutDashboard,
  MapPin,
  Menu,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Save,
  Settings2,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { scanBurmeseDocument, type ScanFinding } from "@/lib/scanDocument";
import { textFromPdfItems } from "@/lib/pdfText";
import { createCorrectedDocxBlob } from "@/lib/docxExport";
import { safeChars } from "@/lib/compat";
import { getFindingHighlightRangeFromChars } from "@/lib/findingHighlight";
import { wrapPdfLine } from "@/lib/pdfLayout";
import { isOcrTimeoutError, requestOcrText } from "@/lib/ocrTimeout";

type ScanStage = "idle" | "ready" | "extracting" | "scanning" | "complete" | "error";

function NavItem({ icon: Icon, label, active = false, onClick }: { icon: typeof LayoutDashboard; label: string; active?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-all duration-200 hover:-translate-y-0.5 ${active ? "bg-[#24354f] text-[#fffaf0] shadow-[0_8px_20px_rgba(36,53,79,.16)]" : "text-[#526078] hover:bg-[#e5dfd2] hover:text-[#24354f]"}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d7795d]" />}</button>;
}

function Sidebar({ onInfo }: { onInfo: (title: string) => void }) {
  return <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[#dfd8ca] bg-[#eee9dd] px-4 py-5 lg:flex"><div className="mb-11 flex items-center gap-3 px-2"><div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#c85a3f] shadow-[0_7px_16px_rgba(200,90,63,.23)]"><img src="/manus-storage/thanaka-mark_67fd5df7.png" alt="Thanaka mark" className="h-7 w-7 object-contain" /></div><div><div className="burmese text-[19px] font-bold leading-none">စာစစ်</div><div className="mt-1 text-[9px] font-bold tracking-[.2em] text-[#7b8796]">TYPO CHECKER</div></div></div><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.19em] text-[#98a0a7]">Workspace</div><nav className="space-y-1"><NavItem icon={LayoutDashboard} label="Review desk" active /><NavItem icon={History} label="Recent files" onClick={() => onInfo("Recent files")} /><NavItem icon={ClipboardCheck} label="Dictionary" onClick={() => onInfo("Burmese dictionary")} /></nav><div className="mt-auto space-y-1"><NavItem icon={Settings2} label="Preferences" onClick={() => onInfo("Preferences")} /><NavItem icon={HelpCircle} label="Help center" onClick={() => onInfo("Help center")} /><div className="mt-5 border-t border-[#ded6c7] pt-4"><div className="rounded-2xl bg-[#e4ded0] p-3.5"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.16em] text-[#7b8796]">Monthly scans</span><Zap size={14} className="text-[#c85a3f]" /></div><div className="mb-2 flex items-end gap-1"><span className="text-2xl font-bold">12</span><span className="pb-1 text-xs text-[#7b8796]">/ 50</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#d1c8b8]"><div className="h-full w-1/4 rounded-full bg-[#c85a3f]" /></div></div><div className="mt-4 flex items-center gap-3 px-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c6d7c6] text-xs font-bold text-[#31523d]">MK</div><div className="min-w-0"><div className="truncate text-xs font-bold">May Kha</div><div className="text-[10px] text-[#89929c]">Personal workspace</div></div><MoreHorizontal size={16} className="ml-auto text-[#9ca3a7]" /></div></div></div></aside>;
}

function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("This image could not be read."));
    reader.readAsDataURL(file);
  });
}

async function extractPdfText(file: File, onProgress: (value: number) => void) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  loadingTask.onProgress = ({ loaded, total }: { loaded: number; total?: number }) => {
    const ratio = total && total > 0 ? loaded / total : 0.25;
    onProgress(Math.min(0.45, Math.max(0.12, ratio * 0.45)));
  };
  const document = await loadingTask.promise;
  const pages: string[] = [];
  for (let page = 1; page <= document.numPages; page += 1) {
    onProgress(0.45 + ((page - 1) / Math.max(1, document.numPages)) * 0.45);
    const pageProxy = await document.getPage(page);
    const content = await pageProxy.getTextContent();
    const rawItems = content && typeof content === "object" ? (content as { items?: unknown }).items : undefined;
    pages.push(textFromPdfItems(rawItems));
  }
  onProgress(0.92);
  return pages.join("\f");
}

async function extractUploadedText(file: File, onProgress: (value: number) => void) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (["txt", "md", "csv"].includes(extension ?? "")) {
    onProgress(0.55);
    const text = await file.text();
    onProgress(0.92);
    return text;
  }
  if (extension === "docx") {
    onProgress(0.2);
    const mammoth = await import("mammoth/mammoth.browser");
    const text = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
    onProgress(0.92);
    return text;
  }
  if (extension === "pdf") return extractPdfText(file, onProgress);
  if (file.type.startsWith("image/")) {
    onProgress(0.2);
    const text = await requestOcrText(await toDataUrl(file));
    onProgress(0.92);
    return text;
  }
  throw new Error("Supported formats are TXT, DOCX, PDF, PNG, JPG, JPEG, and WEBP.");
}

function fileType(fileName: string) {
  const extension = fileName.split(".").pop()?.toUpperCase();
  return extension || "FILE";
}

const myanmarFontUrl = "/manus-storage/NotoSansMyanmar-Regular_476dce1c.ttf";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function createCorrectedPdfDownload(text: string, filename: string) {
  const response = await fetch(myanmarFontUrl);
  if (!response.ok) throw new Error("The Burmese PDF font could not be loaded.");
  const fontBytes = await response.arrayBuffer();
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 48;
  const fontSize = 16;
  const lineHeight = 27;
  let page = pdf.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - margin;
  const sourceLines = text.split(/\r?\n/);
  for (let sourceLineIndex = 0; sourceLineIndex < sourceLines.length; sourceLineIndex += 1) {
    const wrappedLines = wrapPdfLine(sourceLines[sourceLineIndex]);
    for (let lineIndex = 0; lineIndex < wrappedLines.length; lineIndex += 1) {
      const line = wrappedLines[lineIndex];
      if (cursorY < margin + lineHeight) {
        page = pdf.addPage([pageWidth, pageHeight]);
        cursorY = pageHeight - margin;
      }
      page.drawText(line, { x: margin, y: cursorY, size: fontSize, font, color: rgb(0.14, 0.21, 0.31), lineHeight });
      cursorY -= lineHeight;
    }
  }
  const bytes = await pdf.save();
  downloadBlob(new Blob([bytes], { type: "application/pdf" }), filename);
}

async function createCorrectedDocxDownload(text: string, filename: string) {
  const response = await fetch(myanmarFontUrl);
  if (!response.ok) throw new Error("The Noto Sans Myanmar font could not be loaded.");
  const fontBytes = new Uint8Array(await response.arrayBuffer());
  const blob = await createCorrectedDocxBlob(text, fontBytes, filename.replace(/\.docx$/i, ""));
  downloadBlob(blob, filename);
}

function HighlightedFindingExcerpt({ sourceChars, finding, className = "" }: { sourceChars: string[]; finding: ScanFinding; className?: string }) {
  const { start, end, markStart, markEnd } = getFindingHighlightRangeFromChars(sourceChars, finding.index, finding.length);
  const before = sourceChars.slice(start, markStart).join("");
  const marked = sourceChars.slice(markStart, markEnd).join("");
  const after = sourceChars.slice(markEnd, end).join("");
  return <p className={`burmese leading-[1.9] ${className}`}><span className="text-[#324258]">{start > 0 ? "…" : ""}{before}</span><mark data-finding-highlight="true" className="rounded-md bg-[#f2b36d] px-1 py-0.5 text-[#24354f] shadow-[0_0_0_2px_rgba(242,179,109,.25)]">{marked || " "}</mark><span className="text-[#324258]">{after}{end < sourceChars.length ? "…" : ""}</span></p>;
}

function HighlightedExtractedDocument({ sourceChars, finding }: { sourceChars: string[]; finding?: ScanFinding }) {
  if (!finding) return <p className="burmese whitespace-pre-wrap text-[17px] leading-[2.05] text-[#3c4c5f]">{sourceChars.join("")}</p>;
  const { start, end, markStart, markEnd } = getFindingHighlightRangeFromChars(sourceChars, finding.index, finding.length, 120, 180);
  const before = sourceChars.slice(start, markStart).join("");
  const marked = sourceChars.slice(markStart, markEnd).join("");
  const after = sourceChars.slice(markEnd, end).join("");
  return <p className="burmese whitespace-pre-wrap text-[17px] leading-[2.05] text-[#3c4c5f]"><span>{start > 0 ? "…" : ""}{before}</span><mark data-finding-highlight="true" className="rounded-md bg-[#f2b36d] px-1 py-0.5 text-[#24354f] shadow-[0_0_0_2px_rgba(242,179,109,.25)]">{marked || " "}</mark><span>{after}{end < sourceChars.length ? "…" : ""}</span></p>;
}

function ScanResults({ findings, sourceChars, onSelect }: { findings: ScanFinding[]; sourceChars: string[]; onSelect: (id: string) => void }) {
  if (findings.length === 0) return <section aria-live="polite" className="mt-5 rounded-[22px] border border-[#cbdac9] bg-[#f3f8f0] px-5 py-5 sm:px-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcebd9] text-[#4d7556]"><Check size={19} /></div><div><div className="text-sm font-bold text-[#31523d]">No high-confidence structural typos found</div><p className="mt-1 text-[11px] leading-4 text-[#627b67]">This scan checks Myanmar character order and repeated spaces. Unknown valid words are not automatically called typos.</p></div></div></section>;
  return <section aria-live="polite" className="mt-5 overflow-hidden rounded-[22px] border border-[#ded6c9] bg-[#fbf8f0] shadow-[0_10px_24px_rgba(50,44,34,.05)]"><div className="flex flex-col gap-2 border-b border-[#e5ddd1] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><div className="flex items-center gap-2 text-sm font-bold"><span className="h-px w-5 bg-[#c85a3f]" /> Instant scan results <span className="rounded-full bg-[#f2d5cb] px-2 py-0.5 text-[10px] font-bold text-[#a24d3b]">{findings.length > 30 ? `Showing 30 of ${findings.length}` : `${findings.length} found`}</span></div><div className="mt-1 text-[11px] text-[#8e9699]">Typos are mapped to extracted page, line, and character locations.</div></div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.13em] text-[#6e9072]"><span className="h-1.5 w-1.5 rounded-full bg-[#6e9072]" /> Locations ready</div></div><div className="divide-y divide-[#e8dfd3]">{findings.slice(0, 30).map((finding) => <button key={finding.id} onClick={() => onSelect(finding.id)} className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-[#f5eee4] sm:gap-4 sm:px-6"><div className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-lg bg-[#f3d8cf] px-2 py-1 text-[10px] font-bold text-[#a24d3b]"><MapPin size={12} />P{finding.page} · L{finding.line}</div><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#9a8e82]">{finding.type}</span><span className="text-[10px] font-semibold text-[#80908a]">Char {finding.character}</span><span className="text-[9px] font-bold text-[#648269]">{finding.confidence}</span></div><HighlightedFindingExcerpt sourceChars={sourceChars} finding={finding} className="truncate text-[15px]" /><p className="mt-1 truncate text-[12px] leading-[1.7] text-[#a15d49]"><span className="mr-1 font-bold uppercase tracking-widest text-[#b16b54]">Suggest</span>{finding.suggestion}</p></div><ArrowUpRight size={15} className="mt-1 shrink-0 text-[#abb0ae]" /></button>)}</div></section>;
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [editableText, setEditableText] = useState("");
  const [findings, setFindings] = useState<ScanFinding[]>([]);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [stage, setStage] = useState<ScanStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"review" | "original">("review");
  const [editingExtractedText, setEditingExtractedText] = useState(false);
  const [progress, setProgress] = useState(0);

  const info = (title: string) => toast.info(title, { description: "This workspace action is ready for your next review." });
  const chooseFile = () => inputRef.current?.click();
  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    setFile(nextFile);     setSourceText(""); setEditableText(""); setFindings([]); setSelectedFindingId(null); setStage("ready"); setError(null); setEditingExtractedText(false); setProgress(0);
    toast.success("File ready to scan", { description: nextFile.name });
  };
  const scanText = (text: string, message: string) => {
    setStage("scanning"); setProgress(0.94); setError(null);
    window.setTimeout(() => {
      const nextFindings = scanBurmeseDocument(text);
      setFindings(nextFindings); setSelectedFindingId(nextFindings[0]?.id ?? null); setProgress(1); setStage("complete"); setEditingExtractedText(false); setTab("review");
      window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
      toast.success(message, { description: nextFindings.length ? `${nextFindings.length} high-confidence finding${nextFindings.length === 1 ? "" : "s"} mapped to source locations.` : "No high-confidence structural typos found." });
    }, 420);
  };
  const startScan = async () => {
    if (!file) { toast.info("Choose a file first", { description: "Upload a TXT, DOCX, PDF, or image before scanning." }); chooseFile(); return; }
    setError(null); setFindings([]); setSelectedFindingId(null); setProgress(0.08); setStage("extracting");
    try {
      const text = await extractUploadedText(file, setProgress);
      if (!text.trim()) throw new Error("No readable text was found in this file.");
      setSourceText(text); setEditableText(text); scanText(text, "Scan complete");
    } catch (scanError) { const message = scanError instanceof Error ? scanError.message : "The file could not be scanned."; const timedOut = isOcrTimeoutError(scanError); setProgress(0); setError(message); setStage("error"); toast.error(timedOut ? "Image OCR timed out" : "Scan could not complete", timedOut ? { description: message, action: { label: "Retry image OCR", onClick: () => { void startScan(); } } } : { description: message }); }
  };
  const saveAndRescanEdits = () => {
    if (!editableText.trim()) { toast.error("Keep at least one character", { description: "The extracted-text editor cannot scan an empty document." }); return; }
    setSourceText(editableText); scanText(editableText, "Edits saved and re-scanned");
  };
  const resetEdits = () => { setEditableText(sourceText); toast.info("Edits reset", { description: "The editor now matches the last scanned text." }); };
  const exportCorrectedText = () => {
    if (!sourceText.trim()) { toast.info("Scan text before exporting", { description: "Your corrected text will appear here after a completed scan." }); return; }
    if (hasUnsavedEdits) { toast.info("Save corrections first", { description: "Use Save & re-scan before exporting the latest text." }); return; }
    const baseName = (file?.name ?? "burmese-corrected").replace(/\.[^.]+$/, "");
    downloadBlob(new Blob([sourceText], { type: "text/plain;charset=utf-8" }), `${baseName}-corrected.txt`);
    toast.success("Corrected text downloaded", { description: "The latest saved text was exported as a UTF-8 TXT file." });
  };
  const exportCorrectedPdf = async () => {
    if (!sourceText.trim()) { toast.info("Scan text before exporting", { description: "Your corrected text will appear here after a completed scan." }); return; }
    if (hasUnsavedEdits) { toast.info("Save corrections first", { description: "Use Save & re-scan before exporting the latest text." }); return; }
    try {
      const baseName = (file?.name ?? "burmese-corrected").replace(/\.[^.]+$/, "");
      await createCorrectedPdfDownload(sourceText, `${baseName}-corrected.pdf`);
      toast.success("Corrected PDF downloaded", { description: "The latest saved Burmese text was embedded in a new PDF." });
    } catch (exportError) {
      toast.error("PDF export could not complete", { description: exportError instanceof Error ? exportError.message : "Try exporting TXT instead." });
    }
  };
  const exportCorrectedDocx = async () => {
    if (!sourceText.trim()) { toast.info("Scan text before exporting", { description: "Your corrected text will appear here after a completed scan." }); return; }
    if (hasUnsavedEdits) { toast.info("Save corrections first", { description: "Use Save & re-scan before exporting the latest text." }); return; }
    try {
      const baseName = (file?.name ?? "burmese-corrected").replace(/\.[^.]+$/, "");
      await createCorrectedDocxDownload(sourceText, `${baseName}-corrected.docx`);
      toast.success("Corrected DOCX downloaded", { description: "The latest saved Burmese text was exported with Noto Sans Myanmar embedded." });
    } catch (exportError) {
      toast.error("DOCX export could not complete", { description: exportError instanceof Error ? exportError.message : "Try exporting TXT instead." });
    }
  };

  const busy = stage === "extracting" || stage === "scanning";
  const progressLabel = stage === "extracting" && file?.name.toLowerCase().endsWith(".pdf") ? `Reading PDF · ${Math.round(progress * 100)}%` : stage === "extracting" ? "Extracting text…" : stage === "scanning" ? "Checking Burmese…" : stage === "complete" ? "Scan complete" : "Ready to scan";
  const selectedFinding = findings.find((finding) => finding.id === selectedFindingId);
  const fileName = file?.name ?? "No file selected";
  const hasUnsavedEdits = editableText !== sourceText;
  const sourceChars = useMemo(() => safeChars(sourceText), [sourceText]);

  return <div className="min-h-screen bg-[#f4f0e7] text-[#24354f]"><input ref={inputRef} type="file" accept=".txt,.md,.csv,.docx,.pdf,image/png,image/jpeg,image/webp" className="hidden" onChange={onFile} /><div className="flex min-h-screen"><Sidebar onInfo={info} /><main className="min-w-0 flex-1"><header className="flex h-[76px] items-center justify-between border-b border-[#e1dacc] bg-[#f7f3ea]/85 px-5 backdrop-blur-xl sm:px-8 lg:px-10"><div className="flex items-center gap-3"><button className="rounded-lg p-2 hover:bg-[#ebe5d8] lg:hidden"><Menu size={19} /></button><div><div className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a0a29f]">Review desk / Current file</div><div className="mt-1 flex items-center gap-2 text-sm font-semibold"><FileText size={15} className="text-[#c85a3f]" />{fileName}<span className="rounded-md bg-[#e7e2d6] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#8e918f]">{file ? fileType(file.name) : "READY"}</span></div></div></div><div className="flex items-center gap-2 sm:gap-5"><div className="hidden items-center gap-2 text-xs text-[#6f7b86] sm:flex"><span className="h-2 w-2 rounded-full bg-[#6d9270]" /> Auto-save on</div><button className="rounded-xl p-2 text-[#6f7b86] hover:bg-[#ebe5d8]" onClick={() => info("Keyboard shortcuts")}><PanelLeft size={18} /></button><button className="flex items-center gap-2 rounded-xl bg-[#24354f] px-3.5 py-2.5 text-xs font-bold text-[#fffaf0] shadow-[0_6px_15px_rgba(36,53,79,.15)] transition hover:-translate-y-0.5" onClick={() => toast.success("Report exported", { description: "Your scan summary is ready." })}><Download size={14} /><span className="hidden sm:inline">Export report</span></button></div></header><div className="container py-8 lg:py-10"><div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]"><section className="min-w-0"><div className="rise-in mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e4d7c8] bg-[#f9f5ec] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[#a15d49]"><Sparkles size={12} /> Advanced Burmese review</div><h1 className="max-w-[720px] text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.03] tracking-[-.055em] text-[#24354f]">Make every line<br /><span className="proof-underline">publish-ready.</span></h1><p className="mt-4 max-w-[600px] text-sm leading-6 text-[#718091]">Upload a Burmese document or image. The scan extracts your real content, checks high-confidence structural patterns, and maps every result back to its source location.</p></div><button onClick={chooseFile} className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#cfc5b5] bg-[#fbf7ef] px-4 py-3 text-xs font-bold text-[#24354f] transition hover:-translate-y-0.5 hover:border-[#c85a3f]"><Upload size={15} /> Choose file</button></div><div className="rise-in rise-in-delay-1 overflow-hidden rounded-[22px] border border-[#ded6c9] bg-[#fbf8f0] shadow-[0_14px_35px_rgba(50,44,34,.07)]"><div className="flex items-center justify-between border-b border-[#e6dfd3] px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5eee4] text-[#4d7556]"><ScanLine size={18} /></div><div><div className="text-sm font-bold">Scan your file</div><div className="text-[11px] text-[#8a9297]">TXT, DOCX, PDF, PNG, JPG, JPEG, WEBP · scan → inspect → export</div></div></div><div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] ${busy ? "text-[#c85a3f]" : stage === "complete" ? "text-[#6e9072]" : "text-[#8e9699]"}`}><span className={`h-1.5 w-1.5 rounded-full ${busy ? "animate-pulse bg-[#c85a3f]" : stage === "complete" ? "bg-[#6e9072]" : "bg-[#aaa69e]"}`} /> {busy ? "Reading" : stage === "complete" ? "Scanned" : "Waiting"}</div></div><div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_220px] lg:items-center"><div className="flex items-center gap-5"><div className="relative flex h-[82px] w-[72px] shrink-0 items-center justify-center rounded-lg border border-[#ded3c1] bg-[#f1eadc] shadow-[3px_4px_0_#ded3c1]">{file?.type.startsWith("image/") ? <FileImage size={28} className="text-[#c85a3f]" /> : <FileText size={28} className="text-[#c85a3f]" />}<span className="absolute bottom-1.5 text-[8px] font-bold tracking-widest text-[#8c8c88]">{file ? fileType(file.name) : "FILE"}</span></div><div className="min-w-0"><div className="truncate text-sm font-bold">{fileName}</div><div className="mt-1 text-xs text-[#91989a]">{file ? `${Math.max(1, Math.ceil(file.size / 1024))} KB selected` : "Select a supported file to begin"}</div><div className="mt-3 flex items-center gap-2"><div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#e2ddd1]"><div className="h-full rounded-full bg-[#c85a3f] transition-[width] duration-300" style={{ width: `${Math.round(progress * 100)}%` }} /></div><span className="text-[10px] font-bold text-[#9a8e82]">{progressLabel}</span></div></div></div><button onClick={startScan} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl bg-[#c85a3f] px-4 py-3 text-xs font-bold text-white shadow-[0_8px_18px_rgba(200,90,63,.2)] transition hover:-translate-y-0.5 active:scale-[.98] disabled:opacity-60"><ScanLine size={15} /> {busy ? "Scanning file" : file ? "Run scan" : "Choose a file"}</button></div></div><div ref={resultsRef} tabIndex={-1} className="scroll-mt-6 outline-none">{stage === "complete" ? <ScanResults findings={findings} sourceChars={sourceChars} onSelect={(id) => { setSelectedFindingId(id); setTab("review"); }} /> : <section aria-live="polite" className={`rounded-b-[22px] border-t px-5 py-5 sm:px-6 ${error ? "border-[#efc7bb] bg-[#fff2ed]" : "border-dashed border-[#d9ccba] bg-[#f8f3e9]"}`}><div className="flex items-center gap-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${error ? "bg-[#f3d8cf] text-[#a24d3b]" : busy ? "bg-[#f3d8cf] text-[#a24d3b]" : "bg-[#e5eee4] text-[#4d7556]"}`}><ScanLine size={18} className={busy ? "animate-spin" : ""} /></div><div><div className="text-sm font-bold">{error ? "Scan needs attention" : busy ? "Scanning your uploaded content…" : "Results will appear here"}</div><p className="mt-1 text-[11px] leading-4 text-[#849098]">{error || (busy ? `${progressLabel} · mapping findings to exact locations.` : "Choose a file, then run a scan to generate a location-based typo list.")}</p>{busy && <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#ead9cf]"><div className="h-full w-1/3 animate-pulse rounded-full bg-[#c85a3f]" /></div>}</div></div></section>}</div></section><aside className="space-y-5"><div className="rise-in rise-in-delay-1 rounded-[22px] bg-[#24354f] p-5 text-[#fffaf0] shadow-[0_15px_35px_rgba(36,53,79,.18)]"><div className="mb-8 flex items-start justify-between"><div><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#aeb9c1]"><span className="h-px w-5 bg-[#d7795d]" /> Inspection slip</div><div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#aeb9c1]">Scan status</div><div className="text-3xl font-bold tracking-[-.05em]">{stage === "complete" ? findings.length : "—"}<span className="ml-1 text-sm text-[#aeb9c1]">{stage === "complete" ? "findings" : "ready"}</span></div></div><div className="rounded-xl bg-[#354864] p-2.5"><ClipboardCheck size={19} className="text-[#d98568]" /></div></div><div className="mb-2 flex justify-between text-[11px] text-[#b9c3c7]"><span>Document health</span><span className="font-bold text-[#d7e1d1]">{stage === "complete" ? (findings.length ? "Review needed" : "Clear") : "Awaiting scan"}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#41536e]"><div className="h-full rounded-full bg-[#d7795d] transition-[width] duration-300" style={{ width: `${Math.round(progress * 100)}%` }} /></div><div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#41536e] pt-4 text-center"><div><div className="text-xl font-bold">{stage === "complete" ? findings.length : "—"}</div><div className="text-[9px] uppercase tracking-wider text-[#aeb9c1]">Found</div></div><div><div className="text-xl font-bold text-[#d7e1d1]">{file ? fileType(file.name) : "—"}</div><div className="text-[9px] uppercase tracking-wider text-[#aeb9c1]">Source</div></div><div><div className="text-xl font-bold">{sourceText ? sourceChars.length : "—"}</div><div className="text-[9px] uppercase tracking-wider text-[#aeb9c1]">Chars</div></div></div></div><button onClick={chooseFile} className="paper-grain group flex w-full items-center gap-4 rounded-[22px] border border-[#dfd4c4] p-4 text-left transition hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(50,44,34,.09)]"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fbf8f0] text-[#c85a3f] shadow-sm"><CloudUpload size={20} /></div><div className="min-w-0"><div className="text-xs font-bold">Scan a file or image <span className="ml-1 text-[9px] font-semibold uppercase tracking-widest text-[#b16b54]">OCR</span></div><div className="mt-1 text-[11px] leading-4 text-[#77848d]">Images use server-side Myanmar OCR. Documents extract text locally in your browser.</div></div><ArrowUpRight size={15} className="ml-auto shrink-0 text-[#9c8c7b]" /></button><div className="flex items-center justify-between px-1 text-[10px] text-[#a1a09a]"><span className="flex items-center gap-1.5"><FileImage size={13} /> TXT, DOCX, PDF, PNG, JPG</span><span>Images &lt; 6 MB</span></div></aside></div>{stage === "complete" && <section className="mt-6"><div className="flex items-center gap-6 border-b border-[#ded6c9]"><button onClick={() => setTab("review")} className={`relative pb-3 text-sm font-bold ${tab === "review" ? "text-[#24354f]" : "text-[#9b9d9a]"}`}>Selected finding{findings.length ? <span className="ml-2 rounded-full bg-[#f2d5cb] px-1.5 py-0.5 text-[10px] text-[#a24d3b]">{findings.length}</span> : null}{tab === "review" && <span className="absolute -bottom-[1px] left-0 h-0.5 w-full bg-[#c85a3f]" />}</button><button onClick={() => { setTab("original"); setEditingExtractedText(false); }} className={`relative pb-3 text-sm font-bold ${tab === "original" ? "text-[#24354f]" : "text-[#9b9d9a]"}`}>Extracted text {hasUnsavedEdits ? <span className="ml-1.5 rounded-full bg-[#f3d8cf] px-1.5 py-0.5 text-[9px] font-bold text-[#a24d3b]">edited</span> : null}</button></div>{tab === "review" ? (selectedFinding ? <article className="mt-5 overflow-hidden rounded-2xl border border-[#c85a3f] bg-[#fbf8f0] shadow-[0_8px_24px_rgba(50,44,34,.08)]"><div className="p-5"><div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded bg-[#f3d8cf] px-2 py-1 text-[10px] font-bold text-[#a24d3b]">P{selectedFinding.page} · L{selectedFinding.line} · Char {selectedFinding.character}</span><span className="rounded bg-[#edf0e9] px-2 py-1 text-[9px] font-bold text-[#648269]">{selectedFinding.confidence} confidence</span></div><div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9a8e82]">{selectedFinding.type}</div><div className="mt-2 rounded-xl border border-[#ead7b4] bg-[#fff8e8] px-3 py-2.5"><div className="mb-1 text-[9px] font-bold uppercase tracking-[.15em] text-[#a15d49]">Exact source span · P{selectedFinding.page} · L{selectedFinding.line} · Char {selectedFinding.character}</div><HighlightedFindingExcerpt sourceChars={sourceChars} finding={selectedFinding} className="text-[18px]" /></div><div className="mt-4 rounded-xl bg-[#f1e8dc] p-3.5"><div className="mb-1 text-[10px] font-bold uppercase tracking-[.15em] text-[#b16b54]">Suggested correction</div><p className="text-sm text-[#24354f]">{selectedFinding.suggestion}</p></div></div></article> : <div className="mt-5 rounded-2xl border border-[#cbdac9] bg-[#f3f8f0] p-5 text-sm font-semibold text-[#31523d]">Your uploaded content has no high-confidence structural findings.</div>) : <section className="rule mt-5 overflow-hidden rounded-2xl border border-[#e2dace] bg-[#fbf8f0]"><div className="flex flex-col gap-3 border-b border-[#e7ded1] p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#9a8e82]"><FileText size={14} className="text-[#c85a3f]" /> Extracted content</div><p className="mt-1 text-[11px] text-[#849098]">Correct the extracted text, then save and re-scan to refresh all finding locations.</p></div><div className="flex flex-wrap items-center gap-2">{sourceText && <><button onClick={exportCorrectedText} className="rounded-lg border border-[#d7cbbb] bg-[#fffaf1] px-3 py-2 text-[10px] font-bold text-[#24354f] transition hover:border-[#c85a3f]">TXT</button><button onClick={() => void exportCorrectedPdf()} className="rounded-lg border border-[#d7cbbb] bg-[#fffaf1] px-3 py-2 text-[10px] font-bold text-[#24354f] transition hover:border-[#c85a3f]">PDF</button><button onClick={() => void exportCorrectedDocx()} className="rounded-lg border border-[#d7cbbb] bg-[#fffaf1] px-3 py-2 text-[10px] font-bold text-[#24354f] transition hover:border-[#c85a3f]">DOCX</button></>}{!editingExtractedText ? <button onClick={() => setEditingExtractedText(true)} className="flex items-center justify-center gap-2 rounded-lg border border-[#d7cbbb] bg-[#fffaf1] px-3 py-2 text-xs font-bold text-[#24354f] transition hover:border-[#c85a3f]"><Pencil size={14} /> Edit text</button> : <div className="flex flex-wrap gap-2"><button onClick={resetEdits} disabled={!hasUnsavedEdits} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-[#6f7b86] hover:bg-[#eee6d9] disabled:opacity-45"><RotateCcw size={14} /> Reset</button><button onClick={saveAndRescanEdits} className="flex items-center gap-1.5 rounded-lg bg-[#24354f] px-3 py-2 text-xs font-bold text-[#fffaf0] transition hover:-translate-y-0.5"><Save size={14} /> Save & re-scan</button></div>}</div></div>{editingExtractedText ? <div className="p-5"><textarea aria-label="Editable extracted Burmese text" value={editableText} onChange={(event) => setEditableText(event.target.value)} className="burmese min-h-[310px] w-full resize-y rounded-xl border border-[#cfc4b3] bg-[#fffdf8] p-4 text-[17px] leading-[2.05] text-[#3c4c5f] outline-none ring-[#c85a3f] transition focus:border-[#c85a3f] focus:ring-2" /><div className="mt-3 flex items-center justify-between text-[11px] text-[#849098]"><span>{safeChars(editableText).length} characters · edits stay in this browser session</span><button onClick={saveAndRescanEdits} className="flex items-center gap-1.5 font-bold text-[#a24d3b]"><RefreshCw size={13} /> Refresh findings</button></div></div> : <div className="p-7"><div className="mb-3 flex items-center gap-2 rounded-lg border border-[#ead7b4] bg-[#fff8e8] px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#a15d49]"><MapPin size={13} /> Selected finding highlighted at P{selectedFinding?.page ?? "—"} · L{selectedFinding?.line ?? "—"} · Char {selectedFinding?.character ?? "—"}</div><HighlightedExtractedDocument sourceChars={sourceChars} finding={selectedFinding} /></div>}</section>}</section>}</div></main></div></div>;
}
