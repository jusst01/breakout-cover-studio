/**
 * Photo Panels Module
 *
 * Exports:
 * - loadPhotoFile(file): Loads a photo file and downscales it if necessary.
 * - loadPhotoURL(url): Loads a photo from a URL and downscales it if necessary.
 * - coverSourceRect(imgW, imgH, destW, destH, focalX, focalY, zoom): Calculates source crop.
 * - drawPanelPhoto(ctx, img, panel, focalX, focalY, zoom): Draws the image into the panel.
 */
import { panelPath } from './breakout-layout.js';

async function downscale(img) {
  if (img.width <= 2048 && img.height <= 2048) return img;
  const canvas = document.createElement('canvas');
  const ratio = Math.min(2048 / img.width, 2048 / img.height);
  canvas.width = Math.round(img.width * ratio);
  canvas.height = Math.round(img.height * ratio);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  const newImg = new Image();
  newImg.src = canvas.toDataURL();
  await newImg.decode();
  return newImg;
}

export async function loadPhotoFile(file) {
  const url = URL.createObjectURL(file);
  return loadPhotoURL(url);
}

export async function loadPhotoURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        const result = await downscale(img);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function coverSourceRect(imgW, imgH, destW, destH, focalX, focalY, zoom) {
  const destAspect = destW / destH;
  const srcAspect = imgW / imgH;
  let sw, sh;
  if (srcAspect > destAspect) {
    sh = imgH;
    sw = sh * destAspect;
  } else {
    sw = imgW;
    sh = sw / destAspect;
  }
  sw /= zoom;
  sh /= zoom;
  const focalPointX = focalX * imgW;
  const focalPointY = focalY * imgH;
  let sx = focalPointX - sw / 2;
  let sy = focalPointY - sh / 2;
  sx = Math.max(0, Math.min(imgW - sw, sx));
  sy = Math.max(0, Math.min(imgH - sh, sy));
  return { sx, sy, sw, sh };
}

export function drawPanelPhoto(ctx, img, panel, focalX, focalY, zoom) {
  ctx.save();

  // Rotate/Translate to panel center
  const centerX = panel.x + panel.w / 2;
  const centerY = panel.y + panel.h / 2;
  ctx.translate(centerX, centerY);
  ctx.rotate((panel.angleDeg * Math.PI) / 180);

  const border = panel.w * 0.03;
  const bottomBorder = border * 3;
  const photoW = panel.w - border * 2;
  const photoH = panel.h - border * 2 - bottomBorder;

  const frameW = photoW + border * 2;
  const frameH = photoH + border + bottomBorder;

  // Polaroid frame
  ctx.fillStyle = '#f9f9f9';
  ctx.fillRect(-frameW / 2, -frameH / 2, frameW, frameH);

  // Clip the image area
  ctx.beginPath();
  ctx.rect(-photoW / 2, -frameH / 2 + border, photoW, photoH);
  ctx.clip();

  const rect = coverSourceRect(img.width, img.height, photoW, photoH, focalX, focalY, zoom);
  ctx.drawImage(img, rect.sx, rect.sy, rect.sw, rect.sh, -photoW / 2, -frameH / 2 + border, photoW, photoH);

  ctx.restore();
}
