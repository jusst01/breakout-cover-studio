/**
 * Lettering utilities for hero cover.
 *
 * Exports:
 * - drawChromeTitle(ctx, text, W, H): Draws the main title with chrome gradient and neon stripes.
 * - drawCaption(ctx, text, W, H): Draws the caption text below the title.
 */

function drawChromeTitle(ctx, text, W, H) {
  if (!text) return;

  let fontSize = 100;
  ctx.font = `bold ${fontSize}px "Bebas Neue"`;

  // Shrink until it fits 92% width
  while (ctx.measureText(text).width > W * 0.92 && fontSize > 10) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px "Bebas Neue"`;
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const textH = fontSize;

  // Browser-based rendering (expecting Canvas environment)
  const off = document.createElement('canvas');
  off.width = textW;
  off.height = textH;
  const octx = off.getContext('2d');
  octx.font = ctx.font;
  octx.textAlign = 'center';
  octx.textBaseline = 'bottom';

  // Chrome Gradient
  const grad = octx.createLinearGradient(0, 0, 0, textH);
  grad.addColorStop(0, '#fdfdfd');
  grad.addColorStop(0.25, '#b8c4cc');
  grad.addColorStop(0.5, '#5d6a72');
  grad.addColorStop(0.75, '#e8eef2');
  grad.addColorStop(1, '#39424a');

  octx.fillStyle = grad;
  octx.fillText(text, textW / 2, textH);

  // Neon stripes (Source-atop)
  octx.globalCompositeOperation = 'source-atop';
  const stripeH = textH / 4;
  octx.fillStyle = '#22d3ee'; // cyan
  octx.fillRect(0, textH * 0.2, textW, stripeH);
  octx.fillStyle = '#f0f'; // magenta
  octx.fillRect(0, textH * 0.5, textW, stripeH);
  octx.fillStyle = '#fbbf24'; // amber
  octx.fillRect(0, textH * 0.8, textW, stripeH);

  // Draw back to main
  ctx.drawImage(off, (W - textW) / 2, H * 0.8 - textH);

  // Thin dark stroke
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeText(text, W / 2, H * 0.8);
}

function drawCaption(ctx, text, W, H) {
  if (!text) return;
  const colors = ['#ffb3ba', '#baffc9', '#bae1ff', '#e1bae1', '#ffdfba'];
  ctx.font = '20px "Archivo"';
  ctx.textAlign = 'center';

  // Use letterSpacing if available, otherwise manual spacing
  if (ctx.letterSpacing !== undefined) {
    ctx.letterSpacing = '5px';
  }

  let x = W / 2;
  const spacing = 20;
  const totalWidth = (text.length - 1) * spacing;
  let startX = x - totalWidth / 2;

  for (let i = 0; i < text.length; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillText(text[i].toUpperCase(), startX + i * spacing, H * 0.95);
  }
}

export { drawChromeTitle, drawCaption };
