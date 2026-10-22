import {chromium} from '/Users/naokiikeda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';
const dir=dirname(fileURLToPath(import.meta.url));
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
for(const [name,width,height] of [['pc',1392,639],['sp',390,566],['sp-small',320,566]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  await page.goto(pathToFileURL(join(dir,'index.html')).href,{waitUntil:'domcontentloaded'});
  await page.locator('.visual img').evaluate(img=>img.decode());
  await page.screenshot({path:join(dir,`preview-${name}.jpg`),type:'jpeg',quality:90});
  const metrics=await page.evaluate(()=>({hero:document.querySelector('.first-view').getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,copy:document.querySelector('[data-copy="main"]').textContent,menu:document.querySelectorAll('.main-nav a').length,asset:document.querySelector('.visual img').naturalWidth}));
  if(width<768) await page.locator('.menu-button').click();
  console.log(JSON.stringify({name,...metrics,menuVisible:width<768?await page.locator('.main-nav').isVisible():true}));
  await page.close();
}
await browser.close();
