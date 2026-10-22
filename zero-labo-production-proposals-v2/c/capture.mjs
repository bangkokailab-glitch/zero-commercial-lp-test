import {chromium} from '/Users/naokiikeda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
const results=[];
for(const [name,width,height] of [['pc',1392,900],['sp',390,844],['sp-small',320,700]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('http://127.0.0.1:8878/zero-labo-production-proposals-v2/c/',{waitUntil:'domcontentloaded'});
  await page.locator('.storyboard img').first().evaluate(img=>img.decode());
  const m=await page.evaluate(()=>({
    header:document.querySelector('.site-header').getBoundingClientRect().height,
    hero:document.querySelector('.hero').getBoundingClientRect().height,
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    heading:document.querySelector('h1').textContent.trim(),
    sub:document.querySelector('.sub').textContent.trim(),
    source:document.querySelector('.source').textContent.trim(),
    nav:[...document.querySelectorAll('nav a')].map(a=>({text:a.textContent.trim(),href:a.href})),
    imageLoaded:document.querySelector('.storyboard img').naturalWidth,
  }));
  await page.screenshot({path:`preview-${name}.jpg`,type:'jpeg',quality:91,clip:{x:0,y:0,width,height:Math.ceil(m.header+m.hero)}});
  if(name!=='pc'){await page.locator('.menu-button').click();m.mobileMenuVisible=await page.locator('nav').isVisible()}
  results.push({name,status:response.status(),...m,errors});await page.close();
}
await browser.close();
await writeFile('preview-check.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(({name,status,header,hero,overflow,imageLoaded,mobileMenuVisible,errors})=>({name,status,header,hero,overflow,imageLoaded,mobileMenuVisible,errors})),null,2));
