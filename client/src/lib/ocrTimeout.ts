export const OCR_TIMEOUT_MS = 45_000;
export const OCR_STILL_WORKING_AFTER_MS = 10_000;

export class OcrTimeoutError extends Error {
  constructor() {
    super("Image OCR is taking longer than expected. Please retry the scan.");
    this.name = "OcrTimeoutError";
  }
}

export function isOcrTimeoutError(error: unknown): error is OcrTimeoutError {
  return error instanceof OcrTimeoutError || (error instanceof Error && error.name === "OcrTimeoutError");
}

export function getOcrElapsedSeconds(startedAt: number, currentTime: number): number {
  return Math.max(0, Math.floor((currentTime - startedAt) / 1000));
}

export function getOcrProgressStatus(elapsedSeconds: number): string {
  return elapsedSeconds * 1000 >= OCR_STILL_WORKING_AFTER_MS ? "Still working — reading image text" : "Reading image text";
}

export async function requestOcrText(
  imageDataUrl: string,
  request: typeof fetch = fetch,
  timeoutMs: number = OCR_TIMEOUT_MS,
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await request("/api/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl }),
      signal: controller.signal,
    });
    const payload = (await response.json()) as { text?: string; error?: string };
    if (!response.ok || !payload.text) throw new Error(payload.error || "No readable Burmese text was found in this image.");
    return payload.text;
  } catch (error) {
    if (controller.signal.aborted) throw new OcrTimeoutError();
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
