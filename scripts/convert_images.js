#!/usr/bin/env node
// Convert images to WebP and generate responsive variants + manifest
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const yargs = require('yargs');

const argv = yargs
  .option('input', { alias: 'i', type: 'string', default: 'assets/images', description: 'Input folder (recursive) containing images' })
  .option('output', { alias: 'o', type: 'string', default: 'assets/optimized', description: 'Output folder for optimized images' })
  .option('widths', { alias: 'w', type: 'string', default: '400,800,1200', description: 'Comma separated widths for responsive images' })
  .option('quality', { alias: 'q', type: 'number', default: 80, description: 'WebP quality (0-100)' })
  .help()
  .argv;

const inputDir = path.resolve(argv.input);
const outputDir = path.resolve(argv.output);
const widths = argv.widths.split(',').map(s => parseInt(s,10)).filter(Boolean);
const quality = Math.max(1, Math.min(100, argv.quality));

if (!fs.existsSync(inputDir)) {
  console.error('Input folder does not exist:', inputDir);
  process.exit(1);
}
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const pattern = path.join(inputDir, '**/*.+(jpg|jpeg|png|tiff|webp)');
const files = glob.sync(pattern, { nodir: true });

const manifest = {};

(async () => {
  for (const file of files) {
    const rel = path.relative(inputDir, file);
    const baseName = rel.replace(/\\/g, '/');
    const baseNoExt = baseName.replace(/\.[^/.]+$/, '');
    const outFolder = path.join(outputDir, path.dirname(baseName));
    if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, { recursive: true });

    manifest[baseNoExt] = { sources: [] };

    for (const w of widths) {
      const outName = `${baseNoExt}-${w}.webp`;
      const outPath = path.join(outputDir, outName);
      try {
        await sharp(file)
          .resize({ width: w })
          .webp({ quality })
          .toFile(outPath);
        manifest[baseNoExt].sources.push({ width: w, src: outName });
        console.log('Written', outPath);
      } catch (e) {
        console.error('Failed', file, e.message);
      }
    }
    // also export a fallback max width version
    const maxOutName = `${baseNoExt}-max.webp`;
    const maxOutPath = path.join(outputDir, maxOutName);
    try {
      await sharp(file).webp({ quality }).toFile(maxOutPath);
      manifest[baseNoExt].fallback = maxOutName;
    } catch (e) {}
  }

  const manifestPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Done. Manifest written to', manifestPath);
})();
