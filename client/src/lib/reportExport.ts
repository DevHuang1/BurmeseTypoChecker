import { type ScanFinding } from "./scanDocument";
import { safeChars } from "./compat";

export type ScanReportData = {
  fileName: string;
  fileType: string;
  fileSize: string;
  scannedAt: string;
  sourceText: string;
  findings: ScanFinding[];
};

const AMP = String.fromCharCode(38);
const LT = String.fromCharCode(60);
const GT = String.fromCharCode(62);
const QUOT = String.fromCharCode(34);
const APOS = String.fromCharCode(39);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, `${AMP}amp;`)
    .replace(/</g, `${LT}lt;`)
    .replace(/>/g, `${GT}gt;`)
    .replace(/"/g, `${QUOT}quot;`)
    .replace(/'/g, `${APOS}#39;`);
}

function findingTypeCounts(
  findings: ScanFinding[]
): Array<{ type: string; count: number }> {
  const counts = new Map<string, number>();
  for (const finding of findings) {
    counts.set(finding.type, (counts.get(finding.type) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((left, right) => right.count - left.count);
}

export function buildScanReportHtml(data: ScanReportData): string {
  const { fileName, fileType, fileSize, scannedAt, sourceText, findings } =
    data;
  const charCount = safeChars(sourceText).length;
  const typeCounts = findingTypeCounts(findings);
  const health = findings.length === 0 ? "Clear" : "Review needed";

  const rows = findings
    .map(
      finding => `
        <tr>
          <td class="px-3 py-2 text-center">P${finding.page} · L${finding.line} · C${finding.character}</td>
          <td class="px-3 py-2">${escapeHtml(finding.type)}</td>
          <td class="px-3 py-2 burmese">${escapeHtml(finding.excerpt)}</td>
          <td class="px-3 py-2 burmese">${escapeHtml(finding.suggestion)}</td>
          <td class="px-3 py-2 text-center">${escapeHtml(finding.confidence)}</td>
        </tr>`
    )
    .join("");

  const typeSummary = typeCounts
    .map(
      entry => `
        <div class="flex items-center justify-between py-1.5">
          <span class="text-sm">${escapeHtml(entry.type)}</span>
          <span class="font-bold text-[#c85a3f]">${entry.count}</span>
        </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Scan Report — ${escapeHtml(fileName)}</title>
<style>
  body { font-family: 'Noto Sans Myanmar', 'DM Sans', sans-serif; background: #f4f0e7; color: #24354f; margin: 0; padding: 2rem; }
  .container { max-width: 900px; margin: 0 auto; }
  h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; }
  .meta { color: #718091; font-size: 0.85rem; margin-bottom: 1.5rem; }
  .card { background: #fbf8f0; border: 1px solid #ded6c9; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; }
  .card h2 { font-size: 1rem; font-weight: 700; margin: 0 0 0.75rem; color: #24354f; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
  .stat { background: #fbf8f0; border: 1px solid #ded6c9; border-radius: 10px; padding: 0.75rem; }
  .stat .value { font-size: 1.5rem; font-weight: 700; }
  .stat .label { font-size: 0.7rem; color: #8e9699; text-transform: uppercase; letter-spacing: 0.08em; }
  table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
  th { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid #e5ddd1; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: #6f7b86; }
  td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #e8dfd3; }
  .burmese { font-family: 'Noto Sans Myanmar', sans-serif; }
  .badge { display: inline-block; background: #f2d5cb; color: #a24d3b; border-radius: 6px; padding: 0.15rem 0.5rem; font-size: 0.7rem; font-weight: 600; }
  .empty { color: #627b67; font-style: italic; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<div class="container">
  <h1>Burmese Typo Scan Report</h1>
  <div class="meta">${escapeHtml(fileName)} · ${escapeHtml(fileType)} · ${escapeHtml(fileSize)} · ${escapeHtml(scannedAt)}</div>

  <div class="card">
    <h2>Document health</h2>
    <div class="grid">
      <div class="stat"><div class="value">${findings.length}</div><div class="label">Findings</div></div>
      <div class="stat"><div class="value">${charCount.toLocaleString()}</div><div class="label">Characters</div></div>
      <div class="stat"><div class="value">${escapeHtml(health)}</div><div class="label">Status</div></div>
    </div>
  </div>

  <div class="card">
    <h2>Findings by type</h2>
    ${typeSummary || '<p class="empty">No findings to summarize.</p>'}
  </div>

  <div class="card">
    <h2>All findings <span class="badge">${findings.length}</span></h2>
    ${
      findings.length === 0
        ? '<p class="empty">No high-confidence structural typos were found in this document.</p>'
        : `<table>
          <thead>
            <tr><th>Location</th><th>Type</th><th>Excerpt</th><th>Suggestion</th><th>Confidence</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`
    }
  </div>
</div>
</body>
</html>`;
}

export function downloadScanReportHtml(data: ScanReportData): void {
  const html = buildScanReportHtml(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${data.fileName.replace(/\.[^.]+$/, "")}-scan-report.html`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
