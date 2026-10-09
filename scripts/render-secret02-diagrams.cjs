// Export the editable Secret 2 SVG sources; the page uses the optimized WebP files.
// ZERO_RENDER_TOOLS may point to the host's existing node_modules directory.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const load = name => require(process.env.ZERO_RENDER_TOOLS ? path.join(process.env.ZERO_RENDER_TOOLS, name) : name);
const { chromium } = load('playwright');
const sharp = load('sharp');
const root = path.resolve(__dirname, '..');
const manifest = require('./secret02-diagrams/manifest.json');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    for (const item of manifest) {
      const svg = fs.readFileSync(path.join(root, item.source), 'utf8');
      assert(!/悩み|LPで答えるべきこと|F8C7CD/.test(svg), item.id + ': unrelated footer remains');
      assert(svg.replace(/<[^>]+>/g, '').includes(item.retainedNote), item.id + ': required note missing');
      const page = await browser.newPage({ viewport: { width: item.width, height: item.height }, deviceScaleFactor: 1 });
      await page.setContent('<style>html,body{margin:0;padding:0}</style>' + svg);
      await page.evaluate(() => document.fonts.ready);
      const png = await page.locator('body > svg').screenshot();
      const originalDir = item.id.endsWith('-sp') ? 'sp' : 'pc';
      const original = path.join(root, 'service/lp/images/secret02-' + originalDir + '-template-20260925', item.originalName.replace('.svg', '.png'));
      const lastNote = [...svg.matchAll(/<text\b[^>]*>[\s\S]*?<\/text>/g)].at(-1)[0];
      const noteBaseline = Number(lastNote.match(/y="([\d.]+)"/)[1]);
      const innerWidth = Number([...svg.matchAll(/viewBox="0 0 ([\d.]+) [\d.]+"/g)].at(-1)[1]);
      const compareHeight = Math.ceil((noteBaseline + 6) * item.width / innerWidth);
      const region = { left: 0, top: 0, width: item.width, height: compareHeight };
      const before = await sharp(original).extract(region).removeAlpha().raw().toBuffer();
      const after = await sharp(png).extract(region).removeAlpha().raw().toBuffer();
      assert.equal(before.length, after.length);
      let sum = 0, changed = 0;
      for (let i = 0; i < before.length; i++) { const d = Math.abs(before[i] - after[i]); sum += d; if (d) changed++; }
      // Existing exports may differ by a few antialiasing values between Chrome builds.
      const mae = sum / before.length;
      assert(mae < .05, item.id + ': retained artwork changed (MAE ' + mae + ')');
      const out = path.join(root, item.output);
      await sharp(png).webp({ quality: 90, effort: 6 }).toFile(out);
      console.log(JSON.stringify({ id: item.id, width: item.width, height: item.height, retainedArtworkMAE: mae, changedChannels: changed, bytes: fs.statSync(out).size }));
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
