import { drawBrand, loadBrandLogo, BRAND_ORANGE } from "./brand.js";

// The downloadable event QR: Paysso logo and name on top, the event name,
// then the QR code on a white tile.

const W = 1080;
const H = 1350;
const NAME_MAX_WIDTH = 900;
const FONT_FAMILY = 'Poppins, "Helvetica Neue", Arial, sans-serif';

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load the QR code"));
    img.src = src;
  });

// Shrinks the text until it fits, then cuts it with "…" as a last resort.
const fitText = (ctx, text, maxWidth, startPx, minPx) => {
  let px = startPx;
  ctx.font = `800 ${px}px ${FONT_FAMILY}`;
  while (ctx.measureText(text).width > maxWidth && px > minPx) {
    px -= 2;
    ctx.font = `800 ${px}px ${FONT_FAMILY}`;
  }
  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}`).width > maxWidth) {
    out = out.slice(0, -1);
    if (ctx.measureText(`${out}…`).width <= maxWidth) return `${out}…`;
  }
  return out;
};

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
  ctx.fill();
};

export const buildEventQrPoster = async ({ qrCode, eventName }) => {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create the QR image");

  const [qrImg, logo] = await Promise.all([loadImage(qrCode), loadBrandLogo()]);

  ctx.fillStyle = "#111214";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createLinearGradient(0, 0, 0, H * 0.45);
  glow.addColorStop(0, "rgba(255,122,0,0.18)");
  glow.addColorStop(1, "rgba(255,122,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  drawBrand(ctx, logo, { centerX: W / 2, centerY: 150, height: 90 });

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = BRAND_ORANGE;
  ctx.font = `800 26px ${FONT_FAMILY}`;
  ctx.fillText("E V E N T", W / 2, 330);

  ctx.fillStyle = "#ffffff";
  const name = fitText(ctx, eventName || "Event", NAME_MAX_WIDTH, 64, 32);
  ctx.fillText(name, W / 2, 400);

  const tile = 640;
  const tileX = (W - tile) / 2;
  const tileY = 520;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, tileX, tileY, tile, tile, 48);
  const pad = 44;
  ctx.drawImage(qrImg, tileX + pad, tileY + pad, tile - pad * 2, tile - pad * 2);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `700 28px ${FONT_FAMILY}`;
  ctx.fillText("S C A N   T O   V I E W   E V E N T", W / 2, 1230);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not create the PNG"))),
      "image/png",
    );
  });
};
