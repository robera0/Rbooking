import { containRect } from "./posterFit.js";
import { loadBrandLogo } from "./brand.js";

// Puts the Paysso logo in the middle of a QR code image (a ticket, an
// invitation or an event code). The QR payload is untouched; the logo only
// hides a small centre patch, which QR codes are built to survive. Keep the
// plate small: it must never cover more than QR_LOGO_MAX_AREA of the code.

export const QR_LOGO_PLATE_RATIO = 0.2; // plate width as a share of the QR width
export const QR_LOGO_MAX_AREA = 0.05; // never hide more than 5% of the code
const PLATE_PADDING = 0.14; // space around the logo inside the plate

// Where the white plate and the logo go on a QR image `size` pixels wide.
export const qrLogoLayout = (size, logoW, logoH) => {
  const plateSize = Math.round(size * QR_LOGO_PLATE_RATIO);
  const plate = {
    x: (size - plateSize) / 2,
    y: (size - plateSize) / 2,
    size: plateSize,
    radius: plateSize * 0.22,
  };
  const inner = plateSize * (1 - PLATE_PADDING * 2);
  const fit = containRect(logoW, logoH, inner, inner);
  const logo = {
    x: plate.x + (plateSize - inner) / 2 + fit.x,
    y: plate.y + (plateSize - inner) / 2 + fit.y,
    w: fit.w,
    h: fit.h,
  };
  return { plate, logo };
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load the QR code"));
    img.src = src;
  });

const roundRectPath = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
};

// Returns a new image (a PNG data URL) of the same QR with the logo in the
// middle. If anything goes wrong the caller keeps using the original.
export const composeQrWithLogo = async (qrSrc) => {
  const [qr, logoImg] = await Promise.all([loadImage(qrSrc), loadBrandLogo()]);
  const size = qr.naturalWidth || qr.width;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create the QR image");

  ctx.drawImage(qr, 0, 0, size, size);
  const { plate, logo } = qrLogoLayout(size, logoImg.width, logoImg.height);
  ctx.fillStyle = "#ffffff";
  roundRectPath(ctx, plate.x, plate.y, plate.size, plate.size, plate.radius);
  ctx.fill();
  ctx.drawImage(logoImg, logo.x, logo.y, logo.w, logo.h);
  return canvas.toDataURL("image/png");
};

// If the logo version cannot be made, the plain QR is used, so a ticket is
// never left without a code.
export const qrWithLogoOrOriginal = async (qrSrc) => {
  if (!qrSrc) return qrSrc;
  try {
    return await composeQrWithLogo(qrSrc);
  } catch {
    return qrSrc;
  }
};
