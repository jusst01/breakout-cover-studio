/**
 * Main Module for BREAKOUT Pop-out Hero Cover Studio
 *
 * State management, event wiring, layout rebuilding, and render pipeline.
 */

import { layoutPanels, panelPath } from './breakout-layout.js';
import { loadPhotoFile, loadPhotoURL, coverSourceRect, drawPanelPhoto } from './photo-panels.js';
import { GRADES, gradeFilter, applyGradeOverlay } from './grades.js';
import { drawPopout } from './popout.js';
import { drawChromeTitle, drawCaption } from './lettering.js';
import { STICKER_TEXTS, drawStickers } from './stickers.js';
import { drawCover, renderCoverToCanvas, exportPNG } from './exporter.js';

export const state = {
  canvasSize: { w: 1080, h: 1080 },
  photos: [null, null, null],
  panelPhotos: [0, 1, 2],
  fillMode: "individual",
  panels: [],
  titleText: "MIDNIGHT RECKONING",
  captionText: "A LEONIDA STORY",
  popoutEnabled: true,
  stickersEnabled: true,
  globalGrade: "neon-rain"
};

export function rebuildPanels() {
  const { w, h } = state.canvasSize;
  const rawPanels = layoutPanels(w, h);
  state.panels = rawPanels.map((p, i) => {
    const existing = state.panels && state.panels[i] ? state.panels[i] : {};
    const defaultFocal = i === 0 ? { x: 0.55, y: 0.38 } : i === 1 ? { x: 0.5, y: 0.4 } : { x: 0.5, y: 0.42 };
    return {
      ...p,
      photoIndex: state.panelPhotos[i] !== undefined ? state.panelPhotos[i] : i,
      focalX: existing.focalX !== undefined ? existing.focalX : defaultFocal.x,
      focalY: existing.focalY !== undefined ? existing.focalY : defaultFocal.y,
      zoom: existing.zoom !== undefined ? existing.zoom : 1,
      grade: existing.grade !== undefined ? existing.grade : state.globalGrade
    };
  });
}

export function render() {
  const canvas = document.querySelector('#cover-canvas');
  if (!canvas) return;

  canvas.width = state.canvasSize.w;
  canvas.height = state.canvasSize.h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  drawCover(ctx, state);
}

function updateThumbnails() {
  const slots = document.querySelectorAll('.thumbnail-slot');
  slots.forEach((slot, i) => {
    const img = state.photos[i];
    slot.innerHTML = '';
    if (img && img.src) {
      const thumbImg = document.createElement('img');
      thumbImg.src = img.src;
      thumbImg.style.width = '100%';
      thumbImg.style.height = '100%';
      thumbImg.style.objectFit = 'cover';
      slot.appendChild(thumbImg);
    } else {
      slot.textContent = `Slot ${i + 1}`;
    }
  });
}

async function loadInitialSamples() {
  try {
    const [heroImg, manImg, carImg] = await Promise.all([
      loadPhotoURL('samples/hero.jpg').catch(e => { console.warn('Hero sample load failed', e); return null; }),
      loadPhotoURL('samples/man.jpg').catch(e => { console.warn('Man sample load failed', e); return null; }),
      loadPhotoURL('samples/car.jpg').catch(e => { console.warn('Car sample load failed', e); return null; })
    ]);
    state.photos[0] = heroImg;
    state.photos[1] = manImg;
    state.photos[2] = carImg;
    rebuildPanels();
    render();
    updateThumbnails();
  } catch (err) {
    console.error('Error loading initial samples:', err);
  }
}

async function loadCustomFonts() {
  try {
    const fontBebas = new FontFace('Bebas Neue', 'url(fonts/BebasNeue-Regular.ttf)');
    const fontArchivo = new FontFace('Archivo', 'url(fonts/Archivo.ttf)');

    const [loadedBebas, loadedArchivo] = await Promise.all([
      fontBebas.load().catch(err => { console.warn('Bebas Neue font load failed', err); return null; }),
      fontArchivo.load().catch(err => { console.warn('Archivo font load failed', err); return null; })
    ]);

    if (loadedBebas) document.fonts.add(loadedBebas);
    if (loadedArchivo) document.fonts.add(loadedArchivo);

    render();
  } catch (err) {
    console.warn('Font loading error:', err);
  }
}

async function handleShotMode(shot) {
  console.log('Shot mode:', shot);
  if (document.body) document.body.classList.add('shot', `shot-${shot}`);
  try {
    const [heroImg, manImg, carImg] = await Promise.all([
      loadPhotoURL('samples/hero.jpg').catch(() => null),
      loadPhotoURL('samples/man.jpg').catch(() => null),
      loadPhotoURL('samples/car.jpg').catch(() => null)
    ]);
    state.photos[0] = heroImg;
    state.photos[1] = manImg;
    state.photos[2] = carImg;
  } catch (err) {
    console.warn('Shot mode sample load error:', err);
  }

  if (shot === 'cover') {
    state.canvasSize = { w: 1920, h: 1080 };
    state.popoutEnabled = true;
    state.stickersEnabled = true;
    state.titleText = "MIDNIGHT RECKONING";
    state.captionText = "A LEONIDA STORY";
    state.globalGrade = "neon-rain";
    rebuildPanels();

    const nav = document.querySelector('.top-nav');
    if (nav) nav.style.display = 'none';
    const sidebar = document.querySelector('.sidebar-controls');
    if (sidebar) sidebar.style.display = 'none';
    const filmstrip = document.querySelector('.filmstrip-tray');
    if (filmstrip) filmstrip.style.display = 'none';
    const appLayout = document.querySelector('.app-layout');
    if (appLayout) {
      appLayout.style.width = '100vw';
      appLayout.style.height = '100vh';
    }
    const canvasWorkspace = document.querySelector('.canvas-workspace');
    if (canvasWorkspace) {
      canvasWorkspace.style.width = '100vw';
      canvasWorkspace.style.height = '100vh';
      canvasWorkspace.style.margin = '0';
      canvasWorkspace.style.padding = '0';
    }
    const canvasWrapper = document.querySelector('.canvas-wrapper');
    if (canvasWrapper) {
      canvasWrapper.style.width = '100vw';
      canvasWrapper.style.height = '100vh';
      canvasWrapper.style.display = 'flex';
      canvasWrapper.style.alignItems = 'center';
      canvasWrapper.style.justifyContent = 'center';
    }
    if (document.body) {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.background = '#0b0e13';
      document.body.style.overflow = 'hidden';
    }
    if (document.documentElement) {
      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';
      document.documentElement.style.background = '#0b0e13';
    }
    const canvas = document.querySelector('#cover-canvas');
    if (canvas) {
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.objectFit = 'contain';
    }
    render();
  } else if (shot === 'editor') {
    state.canvasSize = { w: 1080, h: 1350 };
    state.popoutEnabled = true;
    state.stickersEnabled = true;
    rebuildPanels();
    const canvas = document.querySelector('#cover-canvas');
    if (canvas) {
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.maxHeight = '100%';
      canvas.style.objectFit = 'contain';
    }
    const canvasWrapper = document.querySelector('.canvas-wrapper');
    if (canvasWrapper) {
      canvasWrapper.style.overflow = 'visible';
    }
    const canvasWorkspace = document.querySelector('.canvas-workspace');
    if (canvasWorkspace) {
      canvasWorkspace.style.overflow = 'visible';
    }
    render();
    updateThumbnails();
  } else if (shot === 'panels') {
    if (document.body) {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.background = '#0b0e13';
      document.body.style.overflow = 'hidden';
    }
    if (document.documentElement) {
      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';
      document.documentElement.style.background = '#0b0e13';
    }
    rebuildPanels();
    // Hide sidebar
    const sidebar = document.querySelector('.sidebar-controls');
    if (sidebar) sidebar.style.display = 'none';
    const nav = document.querySelector('.top-nav');
    if (nav) nav.style.display = 'none';

    // Set up triptych stage
    const stage = document.createElement('div');
    stage.id = 'triptych-stage';
    stage.style.display = 'flex';
    stage.style.gap = '20px';
    stage.style.padding = '40px';
    stage.style.background = '#0b0e13';
    stage.style.width = '100vw';
    stage.style.height = '100vh';
    stage.style.boxSizing = 'border-box';
    stage.style.alignItems = 'center';
    stage.style.justifyContent = 'center';
    stage.style.overflow = 'hidden';

    const winW = window.innerWidth || 1280;
    const winH = window.innerHeight || 800;
    const targetH = winH - 80;
    const targetW = Math.round((winW - 80 - 40) / 3);

    state.panels.forEach((panel, i) => {
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        const img = state.photos[state.panelPhotos[i]];
        if (img) {
            drawPanelPhoto(ctx, img, { ...panel, x: 0, y: 0, w: targetW, h: targetH }, panel.focalX, panel.focalY, panel.zoom);
        }
        canvas.style.width = `${targetW}px`;
        canvas.style.height = `${targetH}px`;
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
        canvas.style.objectFit = 'contain';
        stage.appendChild(canvas);
    });

    document.querySelectorAll('body > *:not(#triptych-stage)').forEach(el => el.style.display = 'none');
    document.body.appendChild(stage);
    document.title = 'SHOT-READY';
    return; // Don't render cover canvas
  } else if (shot === 'sizes') {
    const nav = document.querySelector('.top-nav');
    if (nav) nav.style.display = 'none';
    const appLayout = document.querySelector('.app-layout');
    if (appLayout) appLayout.style.display = 'none';
    if (document.body) {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.background = '#0b0e13';
      document.body.style.overflow = 'auto';
    }

    state.canvasSize = { w: 1080, h: 1080 };
    rebuildPanels();

    const stage = document.createElement('div');
    stage.style.display = 'flex';
    stage.style.flexDirection = 'row';
    stage.style.gap = '30px';
    stage.style.alignItems = 'center';
    stage.style.justifyContent = 'center';
    stage.style.minHeight = '100vh';
    stage.style.padding = '40px';
    stage.style.background = '#0b0e13';
    stage.style.boxSizing = 'border-box';

    const canvas1 = renderCoverToCanvas(state, 1080, 1080);
    const canvas2 = renderCoverToCanvas(state, 1080, 1350);

    canvas1.style.maxHeight = '80vh';
    canvas1.style.width = 'auto';
    canvas1.style.height = 'auto';
    canvas1.style.objectFit = 'contain';
    canvas1.style.border = '2px solid rgba(255,255,255,0.2)';
    canvas1.style.borderRadius = '8px';

    canvas2.style.maxHeight = '80vh';
    canvas2.style.width = 'auto';
    canvas2.style.height = 'auto';
    canvas2.style.objectFit = 'contain';
    canvas2.style.border = '2px solid rgba(255,255,255,0.2)';
    canvas2.style.borderRadius = '8px';

    stage.appendChild(canvas1);
    stage.appendChild(canvas2);
    document.body.appendChild(stage);
  }

  document.title = 'SHOT-READY';

  // Load custom fonts non-blockingly and re-render when ready
  try {
    const fontBebas = new FontFace('Bebas Neue', 'url(fonts/BebasNeue-Regular.ttf)');
    const fontArchivo = new FontFace('Archivo', 'url(fonts/Archivo.ttf)');
    Promise.all([
      fontBebas.load().catch(() => null),
      fontArchivo.load().catch(() => null)
    ]).then(([loadedBebas, loadedArchivo]) => {
      if (loadedBebas) document.fonts.add(loadedBebas);
      if (loadedArchivo) document.fonts.add(loadedArchivo);
      render();
    });
  } catch (err) {
    console.warn('Shot mode font load error:', err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Location search:', window.location.search);
  rebuildPanels();

  const urlParams = new URLSearchParams(window.location.search);
  const shot = urlParams.get('shot');
  if (shot) {
    await handleShotMode(shot);
    return;
  }

  // Sync DOM inputs with state
  const titleInput = document.querySelector('#title-input');
  if (titleInput) {
    titleInput.value = state.titleText;
    titleInput.addEventListener('input', () => {
      state.titleText = titleInput.value;
      render();
    });
  }

  const captionInput = document.querySelector('#caption-input');
  if (captionInput) {
    captionInput.value = state.captionText;
    captionInput.addEventListener('input', () => {
      state.captionText = captionInput.value;
      render();
    });
  }

  const fillModeSelect = document.querySelector('#fill-mode');
  if (fillModeSelect) {
    fillModeSelect.value = state.fillMode;
    fillModeSelect.addEventListener('change', () => {
      state.fillMode = fillModeSelect.value;
      rebuildPanels();
      render();
    });
  }

  const canvasSizeSelect = document.querySelector('#canvas-size');
  if (canvasSizeSelect) {
    canvasSizeSelect.value = `${state.canvasSize.w}x${state.canvasSize.h}`;
    canvasSizeSelect.addEventListener('change', () => {
      const parts = canvasSizeSelect.value.split('x');
      if (parts.length === 2) {
        const w = parseInt(parts[0], 10);
        const h = parseInt(parts[1], 10);
        if (!isNaN(w) && !isNaN(h)) {
          state.canvasSize = { w, h };
          rebuildPanels();
          render();
        }
      }
    });
  }

  const popoutToggle = document.querySelector('#popout-toggle');
  if (popoutToggle) {
    popoutToggle.checked = state.popoutEnabled;
    popoutToggle.addEventListener('change', () => {
      state.popoutEnabled = popoutToggle.checked;
      render();
    });
  }

  const stickersToggle = document.querySelector('#stickers-toggle');
  if (stickersToggle) {
    stickersToggle.checked = state.stickersEnabled;
    stickersToggle.addEventListener('change', () => {
      state.stickersEnabled = stickersToggle.checked;
      render();
    });
  }

  const gradeSelect = document.querySelector('#grade-select');
  if (gradeSelect) {
    gradeSelect.value = state.globalGrade;
    gradeSelect.addEventListener('change', () => {
      state.globalGrade = gradeSelect.value;
      state.panels.forEach(p => { p.grade = state.globalGrade; });
      render();
    });
  }

  // Photo file inputs
  document.querySelectorAll('.photo-input').forEach(input => {
    const panelIdx = parseInt(input.dataset.panel, 10);
    if (isNaN(panelIdx)) return;
    input.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const img = await loadPhotoFile(file);
        state.photos[panelIdx] = img;
        render();
        updateThumbnails();
      } catch (err) {
        console.error('Failed to load photo file:', err);
      }
    });
  });

  // Sample buttons
  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const group = btn.closest('.panel-upload-group');
      const input = group?.querySelector('.photo-input');
      const panelIdx = input ? parseInt(input.dataset.panel, 10) : 0;
      const sampleName = btn.dataset.sample;
      if (!sampleName) return;
      const url = `samples/${sampleName}.jpg`;
      try {
        const img = await loadPhotoURL(url);
        state.photos[panelIdx] = img;
        render();
        updateThumbnails();
      } catch (err) {
        console.error(`Failed to load sample ${sampleName}:`, err);
      }
    });
  });

  // Export button
  const exportBtn = document.querySelector('#export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportPNG(state);
    });
  }

  // Sliders wiring
  document.querySelectorAll('.focal-x, .focal-y, .zoom').forEach(slider => {
    const panelIdx = parseInt(slider.dataset.panel, 10);
    if (isNaN(panelIdx)) return;

    const panel = state.panels[panelIdx];
    if (panel) {
      if (slider.classList.contains('focal-x')) slider.value = panel.focalX;
      if (slider.classList.contains('focal-y')) slider.value = panel.focalY;
      if (slider.classList.contains('zoom')) slider.value = panel.zoom;

      const valDisplay = slider.closest('.control-group')?.querySelector('.val-display');
      if (valDisplay) valDisplay.textContent = slider.value;
    }

    slider.addEventListener('input', () => {
      const val = parseFloat(slider.value);
      const p = state.panels[panelIdx];
      if (!p) return;

      if (slider.classList.contains('focal-x')) p.focalX = val;
      if (slider.classList.contains('focal-y')) p.focalY = val;
      if (slider.classList.contains('zoom')) p.zoom = val;

      const valDisplay = slider.closest('.control-group')?.querySelector('.val-display');
      if (valDisplay) valDisplay.textContent = val;

      render();
    });
  });

  // Initial render
  render();

  // Load sample photos and fonts
  loadInitialSamples();
  loadCustomFonts();
});
