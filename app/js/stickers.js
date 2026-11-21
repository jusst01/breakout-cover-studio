/**
 * Required Exports:
 * - STICKER_TEXTS: string[]
 * - drawStickers(ctx, state): void
 */

export const STICKER_TEXTS = [
  "WANTED IN LEONIDA",
  "VICE HEAT",
  "EST. 2026",
  "NO BRAKES",
  "SUNSET CHASER",
  "MIDNIGHT RUN"
];

export function drawStickers(ctx, state) {
  if (!state.stickersEnabled) return;

  const { w, h } = state.canvasSize;
  const titleZoneY = h * 0.78;

  // Cycle text based on height
  const seed = Math.floor(h % STICKER_TEXTS.length);

  const badges = [
    { x: 60, y: 60, text: STICKER_TEXTS[seed], rotation: -6 * Math.PI / 180 },
    { x: w - 80, y: 120, text: STICKER_TEXTS[(seed + 1) % STICKER_TEXTS.length], rotation: 5 * Math.PI / 180 }
  ];

  badges.forEach(badge => {
    if (badge.y > titleZoneY) return;

    ctx.save();

    // Calculate full sticker dimensions (text + padding)
    ctx.font = 'bold 16px Archivo, sans-serif';
    const padding = 10;
    const textWidth = ctx.measureText(badge.text).width;
    const rectWidth = textWidth + padding * 2;
    const rectHeight = 30;

    // Estimate rotated bounds
    const angle = badge.rotation;
    const sin = Math.abs(Math.sin(angle));
    const cos = Math.abs(Math.cos(angle));
    const fullW = rectWidth * cos + rectHeight * sin;
    const fullH = rectWidth * sin + rectHeight * cos;

    // Clamp to canvas with 1.5% margin
    const margin = w * 0.015;
    const clampedX = Math.max(fullW / 2 + margin, Math.min(w - fullW / 2 - margin, badge.x));
    const clampedY = Math.max(fullH / 2 + margin, Math.min(titleZoneY - fullH / 2 - margin, badge.y));

    ctx.translate(clampedX, clampedY);
    ctx.rotate(badge.rotation);

    ctx.font = 'bold 16px Archivo, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Dark translucent fill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;

    // Rounded rect
    ctx.beginPath();
    ctx.roundRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(badge.text, 0, 0);

    ctx.restore();
  });
}
