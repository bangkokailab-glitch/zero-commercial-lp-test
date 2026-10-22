import {chromium} from '/Users/naokiikeda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const url=process.argv[2]||pathToFileURL(resolve(new URL('./index.html',import.meta.url).pathname)).href;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--allow-file-access-from-files']});
for(const [name,width,height] of [['pc',1440,900],['sp',390,844],['sp-small',320,700]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('.art').evaluate(img=>img.decode());
  await page.evaluate(()=>document.fonts.ready);
  const metrics=await page.evaluate(()=>({heroBottom:Math.round(document.querySelector('.hero').getBoundingClientRect().bottom),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,copy:document.querySelector('h1').textContent,sub:document.querySelector('.sub').textContent,source:document.querySelector('.source').textContent,logo:document.querySelector('.brand span').textContent,artLoaded:document.querySelector('.art').naturalWidth>0,nav:[...document.querySelectorAll('.primary-nav a')].map(a=>[a.textContent.trim(),a.href])}));
  await page.screenshot({path:new URL(`./preview-${name}.jpg`,import.meta.url).pathname,type:'jpeg',quality:90,clip:{x:0,y:0,width,height:Math.min(height,metrics.heroBottom)}});
  console.log(name,JSON.stringify(metrics));
  if(name==='sp'){
    await page.locator('.menu-toggle').click();
    console.log('sp-menu',await page.locator('.primary-nav').evaluate(el=>getComputedStyle(el).display),await page.locator('.menu-toggle').getAttribute('aria-expanded'));
  }
  await page.close();
}
await browser.close();
