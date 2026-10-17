// ── Client-side image preparation for the DB-backed upload path ──────────────
//
// WHY THIS EXISTS
//   When the deployment has no object storage, the image bytes travel to the
//   server inside the tRPC request (base64), and a serverless request body is
//   capped at 4.5 MB. A phone photo is routinely 3–8 MB, so sending it raw would
//   fail on size alone. Downscaling in the browser first keeps every upload
//   comfortably inside the cap and makes the round-trip fast on mobile.
//
//   The presign path does NOT use this: there the browser PUTs straight to
//   object storage, so the original bytes are preserved.

/** Longest edge (px) an uploaded image is downscaled to. */
export const MAX_IMAGE_EDGE = 1600;

/** Above this many bytes an image is re-encoded even if its pixels already fit. */
export const MAX_IMAGE_BYTES = 1_500_000;

/** JPEG quality used when re-encoding. 0.85 is visually lossless for photos. */
export const JPEG_QUALITY = 0.85;

/** Whether an image needs re-encoding before upload. Pure — unit-tested. */
export function shouldDownscale(width: number, height: number, size: number): boolean {
  return size > MAX_IMAGE_BYTES || width > MAX_IMAGE_EDGE || height > MAX_IMAGE_EDGE;
}

/** Fit `width`×`height` inside a `maxEdge` box, preserving aspect ratio.
 *  Never upscales. Pure — unit-tested. */
export function scaledSize(
  width: number,
  height: number,
  maxEdge: number = MAX_IMAGE_EDGE,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge || longest === 0) return { width, height };
  const ratio = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = src;
  });
}

/** Downscale + re-encode an image so it fits the upload cap.
 *
 *  Returns the ORIGINAL file unchanged when it is not an image, is an animated
 *  GIF (re-encoding would flatten the animation), or already fits. Any failure
 *  also returns the original — a downscale is an optimisation, never a
 *  correctness requirement, so it must not be able to block an upload. */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!shouldDownscale(width, height, file.size)) return file;

    const target = scaledSize(width, height);
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, target.width, target.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) return file;

    const name = `${file.name.replace(/\.[^.]+$/, "") || "upload"}.jpg`;
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Read a File as bare base64 (no `data:` prefix) for the tRPC payload. */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}
