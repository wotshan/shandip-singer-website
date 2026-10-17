import { describe, expect, it } from "vitest";
import { MAX_IMAGE_BYTES, MAX_IMAGE_EDGE, scaledSize, shouldDownscale } from "./image-upload";

// Only the PURE decisions are tested here. prepareImageForUpload needs a real
// canvas + Image, which jsdom does not implement — its behaviour is covered by
// the live end-to-end upload check instead.

describe("shouldDownscale", () => {
  it("leaves a small, already-modest image alone", () => {
    expect(shouldDownscale(800, 600, 200_000)).toBe(false);
  });

  it("re-encodes when the file is heavy even if the pixels fit", () => {
    expect(shouldDownscale(800, 600, MAX_IMAGE_BYTES + 1)).toBe(true);
  });

  it("re-encodes when the longest edge exceeds the cap", () => {
    expect(shouldDownscale(MAX_IMAGE_EDGE + 1, 600, 100_000)).toBe(true);
    expect(shouldDownscale(600, MAX_IMAGE_EDGE + 1, 100_000)).toBe(true);
  });

  it("does not re-encode exactly at the cap", () => {
    expect(shouldDownscale(MAX_IMAGE_EDGE, MAX_IMAGE_EDGE, MAX_IMAGE_BYTES)).toBe(false);
  });
});

describe("scaledSize", () => {
  it("preserves aspect ratio for a landscape image", () => {
    expect(scaledSize(4000, 2000, 1600)).toEqual({ width: 1600, height: 800 });
  });

  it("preserves aspect ratio for a portrait image", () => {
    expect(scaledSize(2000, 4000, 1600)).toEqual({ width: 800, height: 1600 });
  });

  it("never upscales an image that already fits", () => {
    expect(scaledSize(320, 240, 1600)).toEqual({ width: 320, height: 240 });
  });

  it("never returns a zero dimension", () => {
    const out = scaledSize(10000, 1, 1600);
    expect(out.width).toBe(1600);
    expect(out.height).toBeGreaterThanOrEqual(1);
  });

  it("handles a degenerate zero-size image without dividing by zero", () => {
    expect(scaledSize(0, 0, 1600)).toEqual({ width: 0, height: 0 });
  });
});
