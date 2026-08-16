import { describe, expect, it, vi } from "vitest";
import { isOcrTimeoutError, OcrTimeoutError, OCR_TIMEOUT_MS, requestOcrText } from "./ocrTimeout";

describe("OCR timeout handling", () => {
  it("uses a bounded 45-second timeout and identifies a retryable timeout", () => {
    expect(OCR_TIMEOUT_MS).toBe(45_000);
    expect(isOcrTimeoutError(new OcrTimeoutError())).toBe(true);
    expect(isOcrTimeoutError(new Error("network unavailable"))).toBe(false);
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
});
