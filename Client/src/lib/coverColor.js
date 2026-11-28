// Samples a cover image in the browser and returns an [r, g, b] tint for the
// now-playing glass. Cross-origin images are requested anonymously; if the
// host does not allow that, sampling fails and callers keep their default tint.

export async function sampleCoverColor(src) {
  if (typeof document === "undefined" || !src || typeof src !== "string") {
    return null;
  }

  try {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = src;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const size = 32;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(image, 0, 0, size, size);
    const { data } = context.getImageData(0, 0, size, size);

    const buckets = new Map();
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let pixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a < 128) continue;
      sumR += r;
      sumG += g;
      sumB += b;
      pixels += 1;

      // Ignore greys and washed-out pixels so a coloured cover picks its own
      // colour rather than a muddy average.
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max - min < 24 || max < 40 || min > 220) continue;

      const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
      const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.n += 1;
      buckets.set(key, bucket);
    }

    let best = null;
    for (const bucket of buckets.values()) {
      if (!best || bucket.n > best.n) best = bucket;
    }
    if (best) {
      return [
        Math.round(best.r / best.n),
        Math.round(best.g / best.n),
        Math.round(best.b / best.n),
      ];
    }
    if (pixels) {
      return [
        Math.round(sumR / pixels),
        Math.round(sumG / pixels),
        Math.round(sumB / pixels),
      ];
    }
    return null;
  } catch {
    return null;
  }
}
