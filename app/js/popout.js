/**
 * Popout Module
 *
 * Exports:
 * - drawPopout(ctx, state): Draws the hero photo with a popout effect.
 */
import { coverSourceRect } from './photo-panels.js';

export function drawPopout(ctx, state) {
  if (!state.popoutEnabled) return;
  const hero = state.panels[0];
  if (!hero) return;
  const imgIndex = state.panelPhotos[0];
  const img = state.photos && state.photos[imgIndex];
  if (!img) return;

  const focalX = hero.focalX !== undefined ? hero.focalX : 0.5;
  const focalY = hero.focalY !== undefined ? hero.focalY : 0.5;
  const zoom = hero.zoom !== undefined ? hero.zoom : 1;

  const border = hero.w * 0.03;
  const photoW = hero.w - border * 2;
  const photoH = hero.h - border * 2 - border * 3;

  const {sx, sy, sw, sh} = coverSourceRect(img.width, img.height, photoW, photoH, focalX, focalY, zoom);
  const destX = hero.x + border;
  const destY = hero.y + border;

  // Mask for popout foreground shape (around heroine's face/head)
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = hero.w;
  maskCanvas.height = hero.h;
  const mCtx = maskCanvas.getContext('2d');

  const mCenterX = border + photoW * focalX;
  const mCenterY = border + photoH * 0.35;
  const mRadiusX = photoW * 0.48;
  const mRadiusY = photoH * 0.48;

  const radialGrad = mCtx.createRadialGradient(
    mCenterX, mCenterY, mRadiusX * 0.1,
    mCenterX, mCenterY, mRadiusX
  );
  radialGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  radialGrad.addColorStop(0.75, 'rgba(255, 255, 255, 0.9)');
  radialGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  mCtx.fillStyle = radialGrad;
  mCtx.beginPath();
  mCtx.ellipse(mCenterX, mCenterY, mRadiusX, mRadiusY, 0, 0, Math.PI * 2);
  mCtx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.rect(hero.x - 50, hero.y - 50, hero.w + 100, hero.h + 150);
  ctx.clip();

  // Draw drop shadow
  ctx.save();
  ctx.translate(10, 12);
  ctx.globalAlpha = 0.8;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = hero.w;
  tempCanvas.height = hero.h;
  const tCtx = tempCanvas.getContext('2d');
  tCtx.drawImage(img, sx, sy, sw, sh, destX - hero.x, destY - hero.y, photoW, photoH);
  tCtx.globalCompositeOperation = 'destination-in';
  tCtx.drawImage(maskCanvas, 0, 0);

  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = hero.w;
  shadowCanvas.height = hero.h;
  const sCtx = shadowCanvas.getContext('2d');
  sCtx.drawImage(tempCanvas, 0, 0);
  sCtx.globalCompositeOperation = 'source-in';
  sCtx.fillStyle = '#0b0b10';
  sCtx.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height);

  ctx.drawImage(shadowCanvas, hero.x, hero.y);
  ctx.restore();

  // Draw masked popout foreground layer
  const fgCanvas = document.createElement('canvas');
  fgCanvas.width = hero.w;
  fgCanvas.height = hero.h;
  const fgCtx = fgCanvas.getContext('2d');
  fgCtx.drawImage(img, sx, sy, sw, sh, destX - hero.x, destY - hero.y, photoW, photoH);
  fgCtx.globalCompositeOperation = 'destination-in';
  fgCtx.drawImage(maskCanvas, 0, 0);

  ctx.drawImage(fgCanvas, hero.x, hero.y);
  ctx.restore();
}
