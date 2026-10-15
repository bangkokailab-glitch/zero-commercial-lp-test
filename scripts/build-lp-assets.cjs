// npm install, then npm run build. Source files remain the editing source of truth.
const fs=require('fs'),path=require('path');
const esbuild=process.env.ZERO_BUILD_TOOLS ? require(path.join(process.env.ZERO_BUILD_TOOLS,'esbuild')) : require('esbuild');
const root=path.resolve(__dirname,'../service/lp');
const config=JSON.parse(fs.readFileSync(path.join(root,'asset-bundle.config.json'),'utf8'));
// The navigation policy must run before parsing fragments or restoring scroll.
const htmlPath=path.join(root,'index.html');
const html=fs.readFileSync(htmlPath,'utf8');
const startScript=fs.readFileSync(path.join(root,'preview-start.js'),'utf8').trim();
const nextHTML=html.replace(/<script>\/\* (?:Fresh opens and reloads|Run in the head:)[\s\S]*?(?=\ndocument\.documentElement\.classList\.add\('zero-has-deferred-backgrounds')/,()=>`<script>${startScript}\n`);
if(nextHTML===html&&!html.includes(startScript))throw new Error('Missing early navigation script in index.html');
if(nextHTML!==html)fs.writeFileSync(htmlPath,nextHTML);
const css=config.css.map(file=>{
  let source=fs.readFileSync(path.join(root,file),'utf8').replace(/^@charset[^;]+;/gm,'');
  const base=path.posix.dirname(file);
  if(base!=='.')source=source.replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/g,(all,q,url)=>/^(?:data:|https?:|\/|#)/.test(url)?all:`url(${q}${path.posix.normalize(path.posix.join(base,url))}${q})`);
  return `/* ${file} */\n${source}`;
}).join('\n');
const js=config.js.map(file=>`/* ${file} */\n${fs.readFileSync(path.join(root,file),'utf8')}\n;`).join('\n');
fs.writeFileSync(path.join(root,'page-bundle.css'),esbuild.transformSync(css,{loader:'css',minify:true,legalComments:'inline',target:['chrome100','safari15']}).code);
fs.writeFileSync(path.join(root,'page-bundle.js'),esbuild.transformSync(js,{loader:'js',minify:true,legalComments:'inline',target:['chrome100','safari15']}).code);
console.log(JSON.stringify({stylesheets:config.css.length,scripts:config.js.length,cssBytes:fs.statSync(path.join(root,'page-bundle.css')).size,jsBytes:fs.statSync(path.join(root,'page-bundle.js')).size}));
// The manga page keeps its own source order, font boundary and inline styles.
console.log(JSON.stringify({manga:require('./build-manga-assets.cjs').buildMangaAssets()}));
