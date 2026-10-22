import {chromium} from '/Users/naokiikeda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const root='http://127.0.0.1:8878/zero-labo-production-proposals/c/';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
const results=[];
for(const [name,width,height] of [['pc',1440,637],['sp',390,571],['sp-small',320,576]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(root,{waitUntil:'domcontentloaded'});
  await page.locator('.hero-photo img').evaluate(img=>img.decode());
  await page.evaluate(()=>document.fonts.ready);
  const metrics=await page.evaluate(()=>({
    header:document.querySelector('.site-header').getBoundingClientRect().height,
    hero:document.querySelector('.hero').getBoundingClientRect().height,
    inner:document.querySelector('.header-inner').getBoundingClientRect().width,
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    heading:document.querySelector('h1').textContent.trim(),
    sub:document.querySelector('.sub').textContent.trim(),
    source:document.querySelector('.source').textContent.trim(),
    navigation:[...document.querySelectorAll('.nav a')].map(a=>({text:a.textContent.trim(),href:a.href})),
    imageLoaded:document.querySelector('.hero-photo img').naturalWidth,
    fontStatus:document.documentElement.dataset.zeroFontStatus
  }));
  await page.screenshot({path:`preview-${name}.jpg`,type:'jpeg',quality:90});
  if(name!=='pc'){
    await page.locator('.menu-toggle').click();
    metrics.mobileMenuVisible=await page.locator('.nav').isVisible();
    metrics.contactVisible=await page.locator('.contact').isVisible();
  }
  results.push({name,httpStatus:response?.status(),metrics,errors});
  await page.close();
}
await browser.close();
await writeFile('preview-check.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(r=>({name:r.name,httpStatus:r.httpStatus,header:r.metrics.header,hero:r.metrics.hero,inner:r.metrics.inner,overflow:r.metrics.overflow,font:r.metrics.fontStatus,image:r.metrics.imageLoaded,menu:r.metrics.mobileMenuVisible,errors:r.errors})),null,2));
