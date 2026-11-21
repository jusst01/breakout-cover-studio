/**
 * Grades Module
 *
 * Defines color grades (canvas filters + split-tone gradient overlays) for GTA cover art panels.
 *
 * Exports:
 * - GRADES: Object containing color grade configurations ("neon-rain", "vice-dusk", "acid-palm", "mono-heat").
 * - gradeFilter(gradeName): Returns the CSS filter string for a given grade (or "none").
 * - applyGradeOverlay(ctx, panel, gradeName): Draws a vertical split-tone gradient overlay over a panel.
 */

export const GRADES = {
  "neon-rain": {
    label: "Neon Rain",
    filter: "saturate(1.35) contrast(1.12)",
    hi: "#ff007f", // magenta highlights
    lo: "#00f0ff", // cyan shadows
    overlayAlpha: 0.45
  },
  "vice-dusk": {
    label: "Vice Dusk",
    filter: "saturate(1.25) contrast(1.1)",
    hi: "#ff7e29", // warm orange highlights
    lo: "#a020f0", // pink-purple shadows
    overlayAlpha: 0.45
  },
  "acid-palm": {
    label: "Acid Palm",
    filter: "saturate(1.3) contrast(1.15)",
    hi: "#d4af37", // gold highlights
    lo: "#006400", // emerald green shadows
    overlayAlpha: 0.45
  },
  "mono-heat": {
    label: "Mono Heat",
    filter: "grayscale(1) contrast(1.25)",
    hi: "#ff2a85", // hot pink highlights
    lo: "#2d0a22", // deep dark magenta/warm shadow
    overlayAlpha: 0.5
  }
};

export function gradeFilter(gradeName) {
  const grade = GRADES[gradeName];
  return grade ? grade.filter : "none";
}

export function applyGradeOverlay(ctx, panel, gradeName) {
  const grade = GRADES[gradeName] || GRADES["neon-rain"];

  ctx.save();
  const centerX = panel.x + panel.w / 2;
  const centerY = panel.y + panel.h / 2;
  ctx.translate(centerX, centerY);
  ctx.rotate((panel.angleDeg * Math.PI) / 180);

  const gradient = ctx.createLinearGradient(0, -panel.h / 2, 0, panel.h / 2);
  gradient.addColorStop(0, grade.hi);
  gradient.addColorStop(1, grade.lo);

  ctx.globalAlpha = grade.overlayAlpha;
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = gradient;
  ctx.fillRect(-panel.w / 2, -panel.h / 2, panel.w, panel.h);

  ctx.restore();
}
