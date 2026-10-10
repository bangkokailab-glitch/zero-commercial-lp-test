from pathlib import Path
ROOT=Path(__file__).parent
FONT='https://morisawafonts.net/c/01M4BM2NTN3DGZBTPFB0NSJDMZ/mf.css'
FICT='説明用の架空サービス・デザイン例'
def note(text):return f'<p class="note">{text}</p>'
def head(n,title,desc=''):return f'<header class="figure-head"><span>図 {n:02d}</span><h1>{title}</h1>'+ (f'<p>{desc}</p>' if desc else '')+'</header>'
def image(name,alt,width=780,height=4710):return f'<img src="renders/{name}.jpg" width="{width}" height="{height}" alt="{alt}">'
def figure1():
 cards=[]
 for k,copy,n,cvr in [('a','重たい布団を運ばずに。<br>自宅からクリーニング。',30,3),('b','自宅では洗えない布団を、<br>すっきり清潔に。',50,5)]:
  cards.append(f'<section class="fv-case"><h2><span>{k.upper()}案</span>メインコピーだけを変更</h2><p class="key-copy">{copy}</p>{image("fv-"+k,"同じ写真・配置でメインコピーだけを変えたFV",780,1040)}<div class="result"><p>LPを見た人数<b>1,000人</b></p><p>申し込み数<b>{n}件</b></p><p class="cvr">成約率<strong>{cvr}<small>%</small></strong></p></div></section>')
 return head(1,'A/Bテストとは？','同じ時期に表示し、申し込みにつながる反応を比較します。')+'<div class="traffic">広告からアクセスを集める</div><p class="split">A案・B案へ、ランダムに約半分ずつ<br><b>↓</b></p><div class="fv-grid">'+''.join(cards)+'</div><p class="conditions"><b>そろえる条件</b>写真・配置・料金条件・CTA</p><p class="summary">この例では、B案の成約率が高い結果に。</p>'+note('数値は説明用の仮例です。実績や効果を保証するものではありません。')+note('1,000人は計算例であり、テストに必要な人数や終了条件ではありません。')+note(FICT)
def figure2():
 cards=[]
 for k,title,copy,order in [('a','便利さ','重たい布団を運ばずに。','利用の流れを先に伝える。'),('b','清潔さ','家では洗いにくい布団を洗う。','洗浄と仕上がりを先に伝える。'),('c','家族での利用','家族の布団をまとめて頼む。','一緒に利用する場面を先に伝える。')]:
  cards.append(f'<section class="axis-case"><header><h2><span>{k.upper()}案</span>{title}</h2><p>{copy}</p><small>{order}</small></header>{image("lp-"+k,"生成した"+title+"訴求の完成LP。FV、本文、料金、FAQ、CTAを含む")}</section>')
 return head(2,'訴求の違う3つのLPで、反応を確かめる。','同じサービスの、何を先に伝えるか。')+'<div class="axes-grid">'+''.join(cards)+'</div><p class="conditions"><b>基本条件は共通</b>商品・料金・申し込み条件をそろえる</p><p class="summary flow"><span>比較する</span><i>→</i><span>有望な方向性を絞る</span><i>→</i><span>さらに改善する</span></p>'+note(FICT)
def crop(name,kind='flow'):
 return f'<div class="lp-crop {kind}">{image(name,"同じ生成LPの利用手順部分")}</div>'
def figure3():
 return head(3,'読み進めなくなる箇所を<br class="sp-only">見直す。')+note('説明用の模式図・実測データではありません')+f'''<section class="inspect"><h2 class="step-title"><span>1</span>確認する</h2><div class="inspect-grid"><div><p class="source-label">図02・A案の利用手順</p><div class="overview-wrap">{crop('lp-a','overview')}<div class="focus-area"></div><div class="reach"><b>到達</b><span>多い</span><i></i><span>少ない</span></div></div></div><div class="inspect-copy"><h3>長い説明のあたりで、<br>読み進める人が減っている。</h3><p>該当箇所と、その前後の文章を確認します。</p><div class="hypothesis"><b>見直す仮説</b><p>説明が長く、<br>理解しにくいのでは？</p></div><p class="caution">離脱した位置だけで<br>原因は断定できません。</p><p>ボタンのクリックも確認します。</p></div></div></section><section class="repair"><h2 class="step-title"><span>2</span>見直す</h2><p class="repair-intro">同じLPの長い説明を、3ステップの図解に整理。</p><div class="repair-grid"><div><h3>変更前</h3>{crop('lp-a')}</div><div><h3>変更後</h3>{crop('lp-a-after')}</div></div></section><section class="recheck"><h2 class="step-title"><span>3</span>もう一度確かめる</h2><div><p>次のコンテンツまで<br><b>進む人は増えたか</b></p><p>ボタンは<br><b>押されるようになったか</b></p></div></section><p class="summary">離脱が多い箇所を見つけ、<br class="sp-only">修正し、反応を確かめる。</p>'''+note(FICT)
for n,func in enumerate([figure1,figure2,figure3],1):
 html=f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>秘訣9 改訂図{n:02d}</title><link rel="stylesheet" href="{FONT}"><link rel="stylesheet" href="figures-v2.css?v=20261010-v2b"><script>if(new URLSearchParams(location.search).get('export')==='2')document.documentElement.classList.add('export2x');</script></head><body><main class="diagram figure-{n:02d}">{func()}</main><script src="font-audit.js?v=20261010-v2a"></script></body></html>'''
 (ROOT/f'figure-{n:02d}.html').write_text(html)
print('Prepared three diagrams referencing the same rendered LP files. Figure 04 is unchanged.')
