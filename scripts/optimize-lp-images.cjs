/*
 * Produce high-quality AVIF alternatives without overwriting approved artwork.
 * Run: node scripts/optimize-lp-images.cjs
 * Optional dependency path: ZERO_IMAGE_TOOLS=/path/to/node_modules
 * Original dimensions are preserved; AVIF quality 85 is visually high quality,
 * not mathematically lossless. Original sources remain the browser fallback.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
let sharp;
try {
  sharp = require(process.env.ZERO_IMAGE_TOOLS
    ? path.join(process.env.ZERO_IMAGE_TOOLS, 'sharp') : 'sharp');
} catch (error) {
  throw new Error('Install sharp, or set ZERO_IMAGE_TOOLS to its node_modules directory.', { cause: error });
}

const root = path.resolve(__dirname, '../service/lp');
const outputDirectory = 'performance-media/optimized-20261010';
const manifestPath = path.join(root, outputDirectory, 'manifest.json');
const settings = { quality: 85, effort: 4, chromaSubsampling: '4:4:4' };
const thresholdBytes = 150 * 1024;
const minimumSaving = 0.20;
const digest = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const previous = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { assets: [] };
const previousBySource = new Map(previous.assets.map(asset => [asset.source, asset]));
const originalByOutput = new Map(previous.assets.filter(asset => asset.output)
  .map(asset => [asset.output, asset.source]));

function getSourcePaths() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sources = new Set();
  for (const tag of html.matchAll(/<(?:img|source)\b[^>]*>/gi)) {
    for (const attribute of tag[0].matchAll(/\b(?:src|srcset)\s*=\s*["']([^"']+)["']/gi)) {
      if (/^data:/i.test(attribute[1])) continue;
      for (const candidate of attribute[1].split(',')) {
        let source = candidate.trim().split(/\s+/)[0].split(/[?#]/)[0];
        if (/^(?:https?:|\/|data:)/i.test(source)) continue;
        source = originalByOutput.get(source) || source;
        if (!/\.(?:jpe?g|png|webp)$/i.test(source)) continue;
        const absolute = path.resolve(root, source);
        if (!absolute.startsWith(root + path.sep) || !fs.existsSync(absolute)) continue;
        if (fs.statSync(absolute).size > thresholdBytes) sources.add(source);
      }
    }
  }
  return [...sources].sort();
}

async function optimize(source) {
  const original = fs.readFileSync(path.join(root, source));
  const sourceHash = digest(original);
  const cached = previousBySource.get(source);
  if (cached?.sourceHash === sourceHash &&
      JSON.stringify(previous.settings) === JSON.stringify(settings) &&
      previous.sharpVersion === sharp.versions.sharp &&
      (!cached.output || (fs.existsSync(path.join(root, cached.output)) &&
        digest(fs.readFileSync(path.join(root, cached.output))) === cached.outputHash))) {
    return cached;
  }
  const metadata = await sharp(original).metadata();
  const encoded = await sharp(original).avif(settings).toBuffer();
  const encodedMetadata = await sharp(encoded).metadata();
  if (encodedMetadata.width !== metadata.width || encodedMetadata.height !== metadata.height) {
    throw new Error(`Dimensions changed unexpectedly: ${source}`);
  }
  const saving = 1 - encoded.length / original.length;
  const asset = {
    source, sourceHash, sourceBytes: original.length,
    width: metadata.width, height: metadata.height,
    candidateBytes: encoded.length, saving: Number(saving.toFixed(6))
  };
  if (saving >= minimumSaving) {
    const name = path.basename(source, path.extname(source))
      .replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 88) || 'image';
    const identity = digest(Buffer.from(source + '\n' + sourceHash)).slice(0, 12);
    asset.output = `${outputDirectory}/${name}-${identity}.avif`;
    asset.outputBytes = encoded.length;
    asset.outputHash = digest(encoded);
    fs.writeFileSync(path.join(root, asset.output), encoded);
  } else {
    asset.reason = 'Original retained: saving is below 20 percent.';
  }
  console.log(JSON.stringify({ source, before: original.length,
    after: asset.outputBytes ?? original.length, optimized: Boolean(asset.output) }));
  return asset;
}

async function main() {
  fs.mkdirSync(path.join(root, outputDirectory), { recursive: true });
  const sources = getSourcePaths();
  const assets = new Array(sources.length);
  let next = 0;
  // Limit memory/CPU use for the unusually long mobile A/B-test artwork.
  const worker = async () => {
    while (next < sources.length) {
      const index = next++;
      assets[index] = await optimize(sources[index]);
    }
  };
  await Promise.all([worker(), worker()]);
  const selected = assets.filter(asset => asset.output);
  const manifest = {
    version: 1, settings, sharpVersion: sharp.versions.sharp,
    thresholdBytes, minimumSaving,
    note: 'AVIF alternatives preserve dimensions and artwork. They are not lossless; original files remain unchanged as fallbacks.',
    summary: {
      examined: assets.length, optimized: selected.length,
      sourceBytes: assets.reduce((sum, asset) => sum + asset.sourceBytes, 0),
      deliveryBytes: assets.reduce((sum, asset) => sum + (asset.outputBytes ?? asset.sourceBytes), 0),
      selectedSourceBytes: selected.reduce((sum, asset) => sum + asset.sourceBytes, 0),
      selectedOutputBytes: selected.reduce((sum, asset) => sum + asset.outputBytes, 0)
    },
    assets
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ manifest: manifestPath, ...manifest.summary }));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
