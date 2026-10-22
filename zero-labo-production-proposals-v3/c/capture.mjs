import {chromium} from '/Users/naokiikeda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--allow-file-access-from-files']});
const results=[];
for(const [name,width,height] of [['pc',1392,900],['sp',390,844],['sp-small',320,700]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(new URL('./index.html',import.meta.url).href,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1100);
  const m=await page.evaluate(()=>({
    header:document.querySelector('.site-header').getBoundingClientRect().height,
    hero:document.querySelector('.hero').getBoundingClientRect().height,
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    heading:document.querySelector('[data-copy="main"]').textContent.trim(),
    sub:document.querySelector('[data-copy="sub"]').textContent.trim(),
    source:document.querySelector('[data-copy="source"]').textContent.trim(),
    nav:[...document.querySelectorAll('nav a')].map(a=>({text:a.textContent.trim(),href:a.href})),
    logo:document.querySelector('.hero-logo').naturalWidth,
    video:{readyState:document.querySelector('video').readyState,currentTime:document.querySelector('video').currentTime,paused:document.querySelector('video').paused},
    font:document.fonts.check('700 20px mfw-pshingopr6n-bold'),
  }));
  await page.screenshot({path:`preview-${name}.jpg`,type:'jpeg',quality:90,fullPage:true});
  if(name!=='pc'){await page.locator('.menu-button').click();m.mobileMenuVisible=await page.locator('nav').isVisible()}
  results.push({name,status:response?.status(),...m,errors});await page.close();
}
await browser.close();
await writeFile('preview-check.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(({name,status,header,hero,overflow,logo,video,font,mobileMenuVisible,errors})=>({name,status,header,hero,overflow,logo,video,font,mobileMenuVisible,errors})),null,2));
