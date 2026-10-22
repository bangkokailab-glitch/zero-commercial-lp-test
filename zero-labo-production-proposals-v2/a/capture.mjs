import { chromium } from '/Users/naokiikeda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
for (const [label,width,height] of [['pc',1392,642],['sp',390,626],['sp-small',320,626]]) {
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  await page.goto(pathToFileURL(resolve('index.html')).href,{waitUntil:'domcontentloaded'});
  await page.screenshot({path:`preview-${label}.jpg`,type:'jpeg',quality:88});
  const info=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,height:document.querySelector('.header').offsetHeight+document.querySelector('.hero').offsetHeight,copy:document.querySelector('h1').textContent,sub:document.querySelector('.sub').textContent,source:document.querySelector('.source').textContent}));
  console.log(label,JSON.stringify(info));
  await page.close();
}
await browser.close();
