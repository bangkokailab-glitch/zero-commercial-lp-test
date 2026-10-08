// npm install, then npm run build. Source files remain the editing source of truth.
const fs=require('fs'),path=require('path');
const esbuild=process.env.ZERO_BUILD_TOOLS ? require(path.join(process.env.ZERO_BUILD_TOOLS,'esbuild')) : require('esbuild');
const root=path.resolve(__dirname,'../service/lp');
const config=JSON.parse(fs.readFileSync(path.join(root,'asset-bundle.config.json'),'utf8'));
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
