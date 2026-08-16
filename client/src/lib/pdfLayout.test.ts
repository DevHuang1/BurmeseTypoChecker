import { describe, expect, it } from "vitest";
import { wrapPdfLine } from "./pdfLayout";

describe("wrapPdfLine", () => {
  it("wraps Burmese characters without Array.from or spread iterator assumptions", () => {
    expect(wrapPdfLine("ကိိစာရုံး", 3)).toEqual(["ကိိ", "စာရ", "ုံး"]);
  });

  it("keeps empty PDF lines renderable", () => {
    expect(wrapPdfLine("", 42)).toEqual([" "]);
  });
});
