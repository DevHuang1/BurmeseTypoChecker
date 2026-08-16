import { describe, expect, it, vi } from "vitest";
import { getOcrElapsedSeconds, getOcrProgressStatus, isOcrTimeoutError, OcrTimeoutError, OCR_STILL_WORKING_AFTER_MS, OCR_TIMEOUT_MS, requestOcrText } from "./ocrTimeout";

describe("OCR timeout handling", () => {
  it("uses a bounded 45-second timeout and identifies a retryable timeout", () => {
    expect(OCR_TIMEOUT_MS).toBe(45_000);
    expect(isOcrTimeoutError(new OcrTimeoutError())).toBe(true);
    expect(isOcrTimeoutError(new Error("network unavailable"))).toBe(false);
  });

  it("reports elapsed seconds and switches to still-working status before timeout", () => {
    expect(getOcrElapsedSeconds(1_000, 10_999)).toBe(9);
    expect(getOcrProgressStatus(9)).toBe("Reading image text");
    expect(OCR_STILL_WORKING_AFTER_MS).toBe(10_000);
    expect(getOcrProgressStatus(10)).toBe("Still working — reading image text");
  });

  it("converts an aborted OCR request into a timeout error", async () => {
    vi.useFakeTimers();
    const request = vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
    }));
    const pending = requestOcrText("data:image/png;base64,AAAA", request as unknown as typeof fetch, 25);
    const rejection = expect(pending).rejects.toBeInstanceOf(OcrTimeoutError);
    await vi.advanceTimersByTimeAsync(25);
    await rejection;
    vi.useRealTimers();
  });

  it("cleans up the timeout timer when OCR succeeds", async () => {
    vi.useFakeTimers();
    let aborted = false;
    const request = vi.fn((_url: string, init?: RequestInit) => {
      init?.signal?.addEventListener("abort", () => { aborted = true; });
      return Promise.resolve({ ok: true, json: async () => ({ text: "စာ" }) } as Response);
    });
    await expect(requestOcrText("data:image/png;base64,AAAA", request as unknown as typeof fetch)).resolves.toBe("စာ");
    await vi.advanceTimersByTimeAsync(OCR_TIMEOUT_MS);
    expect(aborted).toBe(false);
    vi.useRealTimers();
  });
});
