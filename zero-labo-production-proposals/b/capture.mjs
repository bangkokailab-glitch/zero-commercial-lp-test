import {chromium} from '/Users/naokiikeda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const url=process.argv[2]||'http://127.0.0.1:8878/zero-labo-production-proposals/b/';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
for(const [name,width,height] of [['pc',1440,900],['sp',390,844]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('.hero-image').evaluate(img=>img.decode());
 await page.evaluate(()=>document.fonts.ready);
 const metrics=await page.evaluate(()=>({fontStatus:document.documentElement.dataset.zeroFontStatus,heroBottom:document.querySelector('.hero').getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,copy:document.querySelector('h1').textContent,nav:[...document.querySelectorAll('.nav a')].map(a=>[a.textContent.trim(),a.href])}));
 await page.screenshot({path:new URL(`./preview-${name}.jpg`,import.meta.url).pathname,type:'jpeg',quality:90,clip:{x:0,y:0,width,height:name==='pc'?647:577}});
 console.log(name,JSON.stringify(metrics));
 await page.close();
}
await browser.close();
