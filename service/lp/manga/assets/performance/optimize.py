"""Re-encode referenced raster assets without changing illustration or layout.
Run with bundled Python/Pillow from repository root.
"""
from pathlib import Path
from PIL import Image
import json
base=Path(__file__).resolve().parents[2]
out=Path(__file__).resolve().parent
inventory=json.loads((out/'inventory.json').read_text())
items=[]
for row in inventory['assets']:
 src=(base/row['path']).resolve()
 im=Image.open(src)
 ow,oh=im.size
 # Artwork is displayed inside a 390 CSS-pixel LP; 780 pixels preserves DPR2.
 maxwidth=780
 q=85
 kind='illustration'
 if 'salon-lp' in row['path']:
  maxwidth=780;q=90;kind='embedded-LP-text'
 if row['path']=='assets/salon-lp-full.webp':
  maxwidth=ow;q=88;kind='full-long-LP-original-dimensions'
 if row['path'].startswith('../images/'):
  maxwidth=ow;q=88;kind='case-study-text'
 if 'ads-mobile/' in row['path']:
  maxwidth=ow;q=95;kind='search-screenshot'
 if row['path'].endswith('fv-approved.png'):
  maxwidth=780;q=90;kind='hero-manga-text'
 if row['path'].endswith('fv-action-button-follow-cta.png'):
  maxwidth=ow;q=92;kind='CTA-text-and-mask'
 if row['path'].endswith('saito-demo-poses.png'):
  maxwidth=1002;q=88;kind='six-pose-sprite'
 if row['path'].endswith('aidma-scene-approved.png'):
  maxwidth=780;q=88;kind='device-scene'
 if row['path'].endswith('salon-hp-desktop.webp'):
  maxwidth=600;q=90;kind='small-device-screen'
 # Existing sub-780 assets are never enlarged. Long pages retain full height ratio.
 scale=min(1,maxwidth/ow)
 nw,nh=round(ow*scale),round(oh*scale)
 if (nw,nh)!=(ow,oh):im=im.resize((nw,nh),Image.Resampling.LANCZOS)
 if im.mode not in ('RGB','RGBA'):im=im.convert('RGBA' if 'transparency' in im.info else 'RGB')
 safe=row['path'].replace('../','parent-').replace('/','--').rsplit('.',1)[0]+'.webp'
 dst=out/safe
 im.save(dst,format='WEBP',quality=q,method=6)
 n=dst.stat().st_size;old=src.stat().st_size
 use=n<old*.92
 item={'original':row['path'],'optimized':'assets/performance/'+safe,'originalBytes':old,'optimizedBytes':n,'savedBytes':old-n,'savedPercent':round((1-n/old)*100,1),'originalWidth':ow,'originalHeight':oh,'width':nw,'height':nh,'quality':q,'kind':kind,'replace':use,'references':row['refs']}
 if not use:dst.unlink()
 items.append(item)
 print(f"{'USE ' if use else 'KEEP'} {old/1024:7.1f} -> {n/1024:6.1f} KB {item['savedPercent']:5.1f}% {row['path']}",flush=True)
orig=sum(x['originalBytes'] for x in items);optimized=sum(x['optimizedBytes'] if x['replace'] else x['originalBytes'] for x in items)
manifest={'description':'Source files preserved. Replacement is opt-in via replace=true. SVG images retain their source viewport geometry; replace URL only. Width/height HTML attributes may retain original ratio.','originalTotalBytes':orig,'optimizedTotalBytes':optimized,'savedBytes':orig-optimized,'savedPercent':round((1-optimized/orig)*100,1),'replacements':items}
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(out/'replace-map.json').write_text(json.dumps({x['original']:x['optimized'] for x in items if x['replace']},ensure_ascii=False,indent=2))
print('TOTAL',orig,optimized,manifest['savedPercent'])
