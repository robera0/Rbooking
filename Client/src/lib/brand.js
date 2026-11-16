// The Paysso logo and name, drawn the same way everywhere a poster is made
// (invitations and the event QR), so they always look like one brand.

export const BRAND_LOGO_SRC = "/P_logo.png";
export const BRAND_ORANGE = "#FF7A00";
const FONT = `800 {px}px Poppins, "Helvetica Neue", Arial, sans-serif`;

// Puts the logo and the name side by side and centres them as one group.
export const brandRowLayout = ({ logoW, logoH, textW, height, gap, centerX }) => {
  const scale = logoH > 0 ? height / logoH : 1;
  const w = logoW > 0 ? logoW * scale : height;
  const total = w + gap + textW;
  const x = centerX - total / 2;
  return { logo: { x, w, h: height }, textX: x + w + gap, total };
};

let logoPromise = null;
export const loadBrandLogo = () => {
  if (!logoPromise) {
    logoPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        logoPromise = null; // let a later download try again
        reject(new Error("Could not load the Paysso logo"));
      };
      img.src = BRAND_LOGO_SRC;
    });
  }
  return logoPromise;
};

// height = the logo's height in canvas pixels; the name scales with it.
export const drawBrand = (ctx, logoImg, { centerX, centerY, height }) => {
  const fontPx = Math.round(height * 0.72);
  ctx.save();
  ctx.font = FONT.replace("{px}", fontPx);
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const payW = ctx.measureText("PAY").width;
  const ssoW = ctx.measureText("SSO").width;
  const row = brandRowLayout({
    logoW: logoImg.width,
    logoH: logoImg.height,
    textW: payW + ssoW,
    height,
    gap: height * 0.25,
    centerX,
  });
  ctx.drawImage(logoImg, row.logo.x, centerY - height / 2, row.logo.w, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("PAY", row.textX, centerY);
  ctx.fillStyle = BRAND_ORANGE;
  ctx.fillText("SSO", row.textX + payW, centerY);
  ctx.restore();
};
