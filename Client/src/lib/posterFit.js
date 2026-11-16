// Where to draw an uploaded image on the invitation poster.
// containRect: the whole image, centred, nothing cut off.
// coverRect: the image scaled to fill the poster (used for the soft backdrop).

const place = (scale, imgW, imgH, boxW, boxH) => {
  const w = imgW * scale;
  const h = imgH * scale;
  return { x: (boxW - w) / 2, y: (boxH - h) / 2, w, h };
};

const wholeBox = (boxW, boxH) => ({ x: 0, y: 0, w: boxW, h: boxH });

export const containRect = (imgW, imgH, boxW, boxH) => {
  if (!(imgW > 0) || !(imgH > 0)) return wholeBox(boxW, boxH);
  return place(Math.min(boxW / imgW, boxH / imgH), imgW, imgH, boxW, boxH);
};

export const coverRect = (imgW, imgH, boxW, boxH) => {
  if (!(imgW > 0) || !(imgH > 0)) return wholeBox(boxW, boxH);
  return place(Math.max(boxW / imgW, boxH / imgH), imgW, imgH, boxW, boxH);
};
