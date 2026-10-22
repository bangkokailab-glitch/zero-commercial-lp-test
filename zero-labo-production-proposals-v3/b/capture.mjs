import { chromium } from '/Users/naokiikeda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(resolve(folder, 'index.html')).href;
const browser = await chromium.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true, args:['--no-sandbox'] });
for (const [name, width, height] of [['pc',1392,900],['sp',390,844],['sp320',320,700]]) {
  const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  await page.goto(url,{waitUntil:'load'});
  await page.waitForTimeout(1000);
  await page.screenshot({path:resolve(folder,`preview-${name}.jpg`),fullPage:true,quality:87});
  const details = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: innerWidth,
    heroHeight: Math.round(document.querySelector('.hero').getBoundingClientRect().height),
    videoReady: document.querySelector('video').readyState,
    videoPlaying: !document.querySelector('video').paused,
    copy: [...document.querySelectorAll('[data-copy]')].map(el => [el.dataset.copy,el.textContent.replace(/\s+/g,'').trim()]),
    logoLoaded: document.querySelector('.hero-logo').complete && document.querySelector('.hero-logo').naturalWidth > 0,
    headlineWithinViewport: (() => {const r = document.querySelector('.headline-verbs').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth})(),
  }));
  process.stdout.write(`${name} ${JSON.stringify(details)}\n`);
  await page.close();
}
await browser.close();
