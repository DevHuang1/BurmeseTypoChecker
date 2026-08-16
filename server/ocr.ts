const MAX_IMAGE_DATA_URL_LENGTH = 8_000_000;

function responseText(content: unknown) {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "object" && part && "text" in part ? String(part.text ?? "") : ""))
      .join("\n")
      .trim();
  }
  return "";
}

/** Extract visible Myanmar text from a user-supplied image using the server-side vision model. */
export async function extractBurmeseTextFromImage(imageDataUrl: string) {
  if (!/^data:image\/(png|jpe?g|webp);base64,/i.test(imageDataUrl)) {
    throw new Error("Upload a PNG, JPG, JPEG, or WEBP image for OCR.");
  }
  if (imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    throw new Error("This image is too large to scan. Choose an image below 6 MB.");
  }

  const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
  const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
  if (!forgeBaseUrl || !forgeKey) {
    throw new Error("Image OCR is not configured for this workspace.");
  }

  const response = await fetch(`${forgeBaseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${forgeKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-3-flash-preview",
      max_tokens: 1800,
      messages: [
        {
          role: "system",
          content:
            "You are a precise OCR engine for Myanmar script. Transcribe all visible Burmese/Myanmar text exactly. Preserve paragraph and line breaks. Do not translate, correct, summarize, label, or add commentary. Return an empty response only when there is no readable text.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract the visible Burmese/Myanmar text from this image." },
            { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("The image OCR request could not be completed. Please try again.");
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: unknown } }> };
  const text = responseText(payload.choices?.[0]?.message?.content);
  if (!text) throw new Error("No readable Burmese text was found in this image.");
  return text;
}
