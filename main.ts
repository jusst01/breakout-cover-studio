import * as fs from 'node:fs';
import * as path from 'node:path';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node --experimental-strip-types main.ts <output-dir>');
  process.exit(1);
}

const outputDir = path.resolve(args[0]);
const sourceDirs = ['app', 'screenshots'];

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let fileCount = 0;
const fileSizes: Record<string, number> = {};

function copyRecursive(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stats = fs.statSync(srcPath);

    if (stats.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      const relativePath = path.relative(process.cwd(), srcPath).replace(/\\/g, '/');
      fileSizes[relativePath] = stats.size;
      fileCount++;
    }
  }
}

for (const dir of sourceDirs) {
  const srcPath = path.resolve(dir);
  const destPath = path.join(outputDir, dir);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
  } else {
    fs.mkdirSync(destPath, { recursive: true });
  }
}

const dossier = {
  title: "BREAKOUT — pop-out hero cover studio",
  bounty: "gta6-cover-art-01",
  app: "app/index.html",
  files: fileSizes
};

fs.writeFileSync(path.join(outputDir, 'dossier.json'), JSON.stringify(dossier, null, 2));

console.log(fileCount);
