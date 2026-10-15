// Manga-only assets. Source CSS/JS remain editable; never edit generated bundles.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const esbuild = process.env.ZERO_BUILD_TOOLS
  ? require(path.join(process.env.ZERO_BUILD_TOOLS, 'esbuild')) : require('esbuild');
const repoRoot = path.resolve(__dirname, '..');
const configPath = path.join(__dirname, 'manga-assets.config.json');

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2];
}
function plainFile(url) { return url.replace(/[?#].*$/, '').replace(/^\.\//, ''); }
function fileStats(source) {
  const buffer = Buffer.isBuffer(source) ? source : Buffer.from(source);
  return { bytes: buffer.length, gzipBytes: zlib.gzipSync(buffer, { level: 9 }).length };
}
function sumStats(list) {
  return list.reduce((sum, stats) => ({ bytes: sum.bytes + stats.bytes, gzipBytes: sum.gzipBytes + stats.gzipBytes }), { bytes: 0, gzipBytes: 0 });
}
function sameOrder(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} order differs from scripts/manga-assets.config.json. Keep the manifest in sync before building.\nExpected: ${expected.join(' -> ')}\nActual: ${actual.join(' -> ')}`);
  }
}

function verifyHTMLOrder(html, config) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || html;
  const expectedCSS = config.styles.flatMap(group => group.sources || [group.external || '@inline-style']);
  const groups = new Map(config.styles.filter(group => group.sources).map(group => [group.output, group.sources]));
  const actualCSS = [];
  for (const match of head.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>|<link\b[^>]*>/gi)) {
    const tag = match[0];
    if (/^<style\b/i.test(tag)) { actualCSS.push('@inline-style'); continue; }
    if (attribute(tag, 'rel') !== 'stylesheet') continue;
    const href = attribute(tag, 'href');
    if (!href) throw new Error('A stylesheet has no href.');
    if (attribute(tag, 'media') && attribute(tag, 'media') !== 'all') throw new Error(`Preserve media-specific link separately before bundling: ${href}`);
    const file = /^https?:/i.test(href) ? href : plainFile(href);
    actualCSS.push(...(groups.get(file) || [file]));
  }
  sameOrder(actualCSS, expectedCSS, 'Manga stylesheet / Morisawa / inline style');

  const actualJS = [];
  for (const match of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["'][^"']+["'][^>]*>/gi)) {
    const tag = match[0], src = attribute(tag, 'src');
    if (/^https?:\/\//i.test(src)) continue;
    if (!/\bdefer(?:\s|=|>)/i.test(tag) || /\basync(?:\s|=|>)/i.test(tag) || attribute(tag, 'type') === 'module') {
      throw new Error(`Manga bundle requires classic defer execution: ${src}`);
    }
    const file = plainFile(src);
    actualJS.push(...(file === config.scripts.output ? config.scripts.sources : [file]));
  }
  sameOrder(actualJS, config.scripts.sources, 'Manga deferred script');
}

function cssSource(root, file) {
  const directory = path.posix.dirname(file);
  let css = fs.readFileSync(path.join(root, file), 'utf8').replace(/^\s*@charset\s+[^;]+;/gim, '');
  if (/^\s*@import\b/m.test(css)) throw new Error(`Resolve @import explicitly before bundling: ${file}`);
  // The outputs live beside index.html. Preserve query/hash suffixes and data URLs.
  if (directory !== '.') css = css.replace(/url\(\s*(?:(["'])(.*?)\1|([^)]*?))\s*\)/gi, (all, quote, quoted, unquoted) => {
    const url = (quoted ?? unquoted).trim();
    if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(url)) return all;
    const split = url.search(/[?#]/), pathname = split < 0 ? url : url.slice(0, split), suffix = split < 0 ? '' : url.slice(split);
    return `url(${quote || '"'}${path.posix.normalize(path.posix.join(directory, pathname))}${suffix}${quote || '"'})`;
  });
  return css;
}

function buildMangaAssets() {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const root = path.join(repoRoot, config.root);
  verifyHTMLOrder(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), config);
  const outputFiles = [];
  const sourceCSS = [], sourceJS = [];
  for (const group of config.styles.filter(group => group.sources)) {
    const input = group.sources.map(file => {
      const original = fs.readFileSync(path.join(root, file));
      sourceCSS.push(fileStats(original));
      return `/* ${file} */\n${cssSource(root, file)}`;
    }).join('\n');
    const result = esbuild.transformSync(input, { loader: 'css', minify: true, legalComments: 'inline', target: ['chrome100', 'safari15'] });
    if (result.warnings.length) throw new Error(esbuild.formatMessagesSync(result.warnings, { kind: 'warning' }).join('\n'));
    fs.writeFileSync(path.join(root, group.output), result.code);
    outputFiles.push({ file: group.output, sources: group.sources, ...fileStats(result.code) });
  }
  const js = config.scripts.sources.map(file => {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    sourceJS.push(fileStats(source));
    if (source.includes('document.currentScript')) throw new Error(`Keep currentScript-dependent module separate: ${file}`);
    return `/* ${file} */\n${source}\n;`;
  }).join('\n');
  const result = esbuild.transformSync(js, { loader: 'js', minify: true, legalComments: 'inline', target: ['chrome100', 'safari15'] });
  if (result.warnings.length) throw new Error(esbuild.formatMessagesSync(result.warnings, { kind: 'warning' }).join('\n'));
  fs.writeFileSync(path.join(root, config.scripts.output), result.code);
  outputFiles.push({ file: config.scripts.output, sources: config.scripts.sources, ...fileStats(result.code) });

  const cssOutputs = outputFiles.filter(output => output.file.endsWith('.css'));
  const jsOutputs = outputFiles.filter(output => output.file.endsWith('.js'));
  const revision = crypto.createHash('sha256');
  outputFiles.forEach(output => revision.update(fs.readFileSync(path.join(root, output.file))));
  const report = {
    page: config.root,
    revision: revision.digest('hex').slice(0, 12),
    source: { cssRequests: sourceCSS.length, jsRequests: sourceJS.length, css: sumStats(sourceCSS), js: sumStats(sourceJS) },
    bundled: { cssRequests: cssOutputs.length, jsRequests: jsOutputs.length, css: sumStats(cssOutputs), js: sumStats(jsOutputs) },
    unchanged: ['Morisawa stylesheet and fonts', 'inline base style and its cascade position', 'early inline motion fallback'],
    gzipNote: 'gzipBytes are level-9 estimates, not measured transfer sizes.',
    outputs: outputFiles
  };
  fs.writeFileSync(path.join(__dirname, 'manga-bundle-report.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}
module.exports = { buildMangaAssets };
if (require.main === module) console.log(JSON.stringify(buildMangaAssets(), null, 2));
