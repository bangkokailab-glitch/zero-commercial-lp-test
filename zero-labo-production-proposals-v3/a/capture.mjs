import { chromium } from '/Users/naokiikeda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
for (const [label,width,height] of [['pc',1392,900],['sp',390,844],['sp-small',320,720]]) {
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(resolve('index.html')).href,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(600);
  if(label!=='sp-small'){
    const bottom=await page.locator('.hero').evaluate(element=>element.getBoundingClientRect().bottom);
    await page.screenshot({path:`preview-${label}.jpg`,type:'jpeg',quality:88,clip:{x:0,y:0,width,height:Math.ceil(bottom)}});
  }
  const info=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,height:document.documentElement.scrollHeight,main:document.querySelector('[data-copy="main"]').textContent,sub:document.querySelector('[data-copy="sub"]').textContent,source:document.querySelector('[data-copy="source"]').textContent,video:document.querySelector('video').readyState,videoPlaying:!document.querySelector('video').paused,logo:document.querySelector('.hero-logo').naturalWidth}));
  console.log(label,JSON.stringify({...info,errors}));
  await page.close();
}
await browser.close();
