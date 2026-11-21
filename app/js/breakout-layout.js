/**
 * Breakout Layout Module
 *
 * Exports:
 * - layoutPanels(W, H): Computes panel geometry ({id, x, y, w, h, angleDeg}) for portrait/square or landscape.
 * - panelPath(ctx, panel): Builds the rotated rectangular clipping/border path on a 2D canvas context.
 * - initLayout(): Initialization helper.
 */

export function initLayout() {
    // Layout initialization
}

export function layoutPanels(W, H) {
    const panels = [];

    if (H >= W) {
        // Portrait or Square:
        // Hero panel across the top ~58% of height, full width, angle 0
        const heroH = Math.round(H * 0.58);
        panels.push({
            id: 'hero',
            x: 0,
            y: 0,
            w: W,
            h: heroH,
            angleDeg: 0
        });

        // Bottom area for mini1 and mini2
        const gap = Math.round(W * 0.02);
        const bottomY = heroH + gap;
        const bottomH = H - bottomY - gap;
        const miniW = Math.round((W - 3 * gap) / 2);
        const miniH = Math.max(100, bottomH);

        panels.push({
            id: 'mini1',
            x: gap,
            y: bottomY,
            w: miniW,
            h: miniH,
            angleDeg: -7
        });

        panels.push({
            id: 'mini2',
            x: gap * 2 + miniW,
            y: bottomY,
            w: miniW,
            h: miniH,
            angleDeg: 6
        });
    } else {
        // Landscape:
        // Hero panel on the right ~56% of width, full height, angle 0
        const heroW = Math.round(W * 0.56);
        const heroX = W - heroW;
        panels.push({
            id: 'hero',
            x: heroX,
            y: 0,
            w: heroW,
            h: H,
            angleDeg: 0
        });

        // Left column for mini1 and mini2
        const gap = Math.round(H * 0.03);
        // Increased margin to ensure rotated corners stay inside
        const inset = Math.round(W * 0.04);
        const leftW = heroX - 2 * gap - inset;
        const miniH = Math.round((H - 3 * gap - inset) / 2);

        panels.push({
            id: 'mini1',
            x: gap + inset/2,
            y: gap + inset/2,
            w: leftW,
            h: miniH,
            angleDeg: -7
        });

        panels.push({
            id: 'mini2',
            x: gap + inset/2,
            y: gap * 2 + miniH + inset/2,
            w: leftW,
            h: miniH,
            angleDeg: 6
        });
    }

    return panels;
}

export function panelPath(ctx, panel) {
    ctx.save();
    const centerX = panel.x + panel.w / 2;
    const centerY = panel.y + panel.h / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((panel.angleDeg * Math.PI) / 180);
    ctx.beginPath();
    ctx.rect(-panel.w / 2, -panel.h / 2, panel.w, panel.h);
    ctx.restore();
}
