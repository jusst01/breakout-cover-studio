/**
 * Exporter Module
 *
 * Exports:
 * - drawCover(ctx, state): Renders the whole cover onto ctx at state.canvasSize.
 * - renderCoverToCanvas(state, w, h): Creates a canvas w x h, adjusts state, draws cover, returns canvas.
 * - exportPNG(state): Renders at state.canvasSize via renderCoverToCanvas and downloads breakout-cover.png.
 * - initExporter(): Initialization helper.
 */

import { layoutPanels, panelPath } from './breakout-layout.js';
import { drawPanelPhoto } from './photo-panels.js';
import { gradeFilter, applyGradeOverlay } from './grades.js';
import { drawPopout } from './popout.js';
import { drawChromeTitle, drawCaption } from './lettering.js';
import { drawStickers } from './stickers.js';

export function initExporter() {
  // Exporter initialization
}

export function drawCover(ctx, state) {
  const W = state.canvasSize ? state.canvasSize.w : ctx.canvas.width;
  const H = state.canvasSize ? state.canvasSize.h : ctx.canvas.height;

  // (1) Fill the near-black background #0b0e13
  ctx.save();
  ctx.fillStyle = '#0b0e13';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Ensure panels exist
  const panels = state.panels || layoutPanels(W, H);

  // (2) For each panel
  panels.forEach((panel, i) => {
    // Determine photo index
    let imgIdx = 0;
    if (state.fillMode === 'individual' && state.panelPhotos && state.panelPhotos[i] !== undefined) {
      imgIdx = state.panelPhotos[i];
    } else if (panel.photoIndex !== undefined) {
      imgIdx = panel.photoIndex;
    }

    const img = state.photos && state.photos[imgIdx];
    const focalX = panel.focalX !== undefined ? panel.focalX : 0.5;
    const focalY = panel.focalY !== undefined ? panel.focalY : 0.5;
    const zoom = panel.zoom !== undefined ? panel.zoom : 1;
    const grade = panel.grade || state.globalGrade || 'neon-rain';

    if (img && img.width && img.height) {
      // Draw photo with filter and grade overlay
      ctx.save();
      const filterStr = gradeFilter(grade);
      ctx.filter = filterStr;
      drawPanelPhoto(ctx, img, panel, focalX, focalY, zoom);
      ctx.filter = 'none';
      applyGradeOverlay(ctx, panel, grade);
      ctx.restore();
    } else {
      // Placeholder fill plus centred label "ADD A PHOTO"
      ctx.save();
      panelPath(ctx, panel);
      ctx.clip();

      const centerX = panel.x + panel.w / 2;
      const centerY = panel.y + panel.h / 2;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((panel.angleDeg * Math.PI) / 180);

      const pgrad = ctx.createLinearGradient(0, -panel.h / 2, 0, panel.h / 2);
      pgrad.addColorStop(0, '#151922');
      pgrad.addColorStop(1, '#0b0e13');
      ctx.fillStyle = pgrad;
      ctx.fillRect(-panel.w / 2, -panel.h / 2, panel.w, panel.h);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 18px "Archivo", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ADD A PHOTO', 0, 0);

      ctx.restore();
      ctx.restore();
    }

    // Stroke the panel border (2px, rgba(255,255,255,0.85))
    ctx.save();
    panelPath(ctx, panel);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.stroke();
    ctx.restore();
  });

  // (3) drawPopout(ctx, state)
  drawPopout(ctx, state);

  // (4) drawChromeTitle and drawCaption
  const titleText = state.titleText !== undefined ? state.titleText : 'VICE CITY';
  const captionText = state.captionText !== undefined ? state.captionText : '';
  drawChromeTitle(ctx, titleText, W, H);
  drawCaption(ctx, captionText, W, H);

  // (5) drawStickers(ctx, state)
  drawStickers(ctx, state);

  // (6) Subtle vignette that does not darken the title zone
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H * 0.75);
  ctx.clip();

  const vig = ctx.createRadialGradient(W / 2, H * 0.4, W * 0.1, W / 2, H * 0.4, Math.max(W, H) * 0.8);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(0.5, 'rgba(0,0,0,0.25)');
  vig.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

export function renderCoverToCanvas(state, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const basePanels = layoutPanels(w, h);
  const adjustedPanels = basePanels.map((panel, i) => {
    const oldPanel = state.panels && state.panels[i] ? state.panels[i] : {};
    return {
      ...panel,
      focalX: oldPanel.focalX !== undefined ? oldPanel.focalX : 0.5,
      focalY: oldPanel.focalY !== undefined ? oldPanel.focalY : 0.5,
      zoom: oldPanel.zoom !== undefined ? oldPanel.zoom : 1,
      grade: oldPanel.grade !== undefined ? oldPanel.grade : (state.globalGrade || 'neon-rain'),
      photoIndex: oldPanel.photoIndex !== undefined ? oldPanel.photoIndex : 0
    };
  });

  const adjustedState = {
    ...state,
    canvasSize: { w, h },
    panels: adjustedPanels
  };

  drawCover(ctx, adjustedState);
  return canvas;
}

export function exportPNG(state) {
  const w = state.canvasSize ? state.canvasSize.w : 1200;
  const h = state.canvasSize ? state.canvasSize.h : 1600;
  const canvas = renderCoverToCanvas(state, w, h);
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'breakout-cover.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}
