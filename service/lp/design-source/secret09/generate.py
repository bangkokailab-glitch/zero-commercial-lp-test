from pathlib import Path
import html

ROOT = Path(__file__).parent
OUT = ROOT
OUT.mkdir(exist_ok=True)

ICONS = {
 'home':'<path d="M5 22 24 6l19 16M10 19v24h28V19M19 43V28h10v15"/>',
 'box':'<path d="m6 14 18-8 18 8v25l-18 9-18-9zM6 14l18 9 18-9M24 23v25M15 10l18 9"/>',
 'phone':'<rect x="13" y="4" width="24" height="42" rx="4"/><path d="M21 39h8M19 11h12M20 24l4 4 8-9"/>',
 'wash':'<rect x="7" y="5" width="36" height="41" rx="4"/><circle cx="25" cy="29" r="11"/><path d="M17 30c5-7 10 7 16 0M13 12h4M24 12h2"/>',
 'person':'<circle cx="25" cy="13" r="8"/><path d="M10 46v-9a15 15 0 0 1 30 0v9M18 46V35M32 46V35"/>',
 'check':'<rect x="9" y="7" width="32" height="39" rx="3"/><path d="M19 7V3h13v4M16 24l6 6 12-14M17 37h16"/>',
 'yen':'<circle cx="25" cy="25" r="21"/><path d="m15 13 10 15 10-15M25 28v13M16 27h18M16 34h18"/>',
 'search':'<circle cx="21" cy="21" r="15"/><path d="m32 32 13 13M13 25l6-8 6 4 5-8"/>',
 'arrow':'<path d="M5 25h38M30 12l13 13-13 13"/>',
}
def icon(name):
 return '<svg class="icon" viewBox="0 0 50 50" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONS[name]+'</svg>'

def cta(): return '<div class="lp-cta"><span>集荷を申し込む <b>→</b></span><small>ご自宅で、申し込みから受け取りまで。</small></div>'

def steps():
 return '''<section class="lp-part how"><span class="lp-kicker">HOW TO USE</span><h3>家から頼める、3ステップ。</h3><div class="lp-steps">'''+''.join(f'<div>{icon(i)}<p><b>0{n}　{t}</b><span>{d}</span></p></div>' for n,i,t,d in [(1,'phone','ネットで予約','枚数と集荷希望日を選びます。'),(2,'box','自宅から発送','専用の袋に布団を詰めて渡します。'),(3,'home','きれいになって到着','洗浄・乾燥後、ご自宅へ届けます。')])+'''</div></section>'''

def cleaning():
 return '''<section class="lp-part cleaning"><span class="lp-kicker">CARE FOR YOUR FUTON</span><h3>毎日使う布団に、<br>きちんと洗う機会を。</h3><p>大きくて家では洗いにくい布団も、素材に合わせて洗浄・乾燥。仕上がりを確認してからお返しします。</p><div class="care-points"><span>素材を確認</span><span>洗浄・乾燥</span><span>仕上げ確認</span></div></section>'''

def family():
 return '''<section class="lp-part family"><span class="lp-kicker">FOR YOUR FAMILY</span><h3>家族の布団を、<br>一緒に整える。</h3><p>ご夫婦の布団も、子どもの布団も。衣替えのタイミングに、まとめてお手入れしませんか。</p><p class="lp-callout">持ち込む日を空けなくても、<br>いつもの家事の合間に準備できます。</p></section>'''

def pricing():
 return '''<section class="lp-part price"><span class="lp-kicker">PLAN</span><h3>布団2枚コース</h3><p class="lp-price"><b>12,800</b>円<span>（税込）</span></p><p>往復配送・洗浄・乾燥を含みます。</p><small>返送目安：約2週間。<br>一部地域は配送対象外です。</small></section>'''

def faq():
 return '''<section class="lp-part faq"><span class="lp-kicker">FAQ</span><h3>気になることを、先に。</h3><p><b>Q. 羽毛布団も頼めますか？</b><span>洗濯表示を確認し、素材に応じて対応可否をご案内します。</span></p><p><b>Q. 家で準備するものは？</b><span>専用の集荷袋をお届けします。布団を詰めて、集荷をお待ちください。</span></p></section>'''

COPIES = {'A':'重たい布団を運ばずに。<br>自宅からクリーニング。','B':'自宅では洗えない布団を、<br>すっきり清潔に。','C':'家族の布団をまとめて。<br>心地よい毎日へ。'}

def lp(kind='A', mode='ab'):
 photo='convenience' if mode=='ab' or kind=='A' else 'clean' if kind=='B' else 'family'
 order={'A':[steps(),cleaning()], 'B':[cleaning(),steps()], 'C':[family(),cleaning(),steps()]}
 parts=[steps(),cleaning()] if mode=='ab' else order[kind]
 copyclass=' lp-copy-change' if mode=='ab' else ''
 return f'''<article class="sample-lp lp-{kind.lower()} {mode}">
 <header class="lp-brand"><b>{icon('home')}ふとん便</b><span>布団の宅配クリーニング</span></header>
 <div class="lp-hero"><p class="lp-hero-kicker">ふだんの暮らしに、布団のお手入れを。</p><h2 class="lp-copy{copyclass}">{COPIES[kind]}</h2><img src="assets/{photo}.webp" alt="布団の宅配クリーニングをイメージした写真" width="1536" height="1024"><p class="lp-hero-caption">申し込みも、受け取りも。<br>ご自宅で完結する宅配サービスです。</p></div>
 {cta()}{''.join(parts)}{pricing()}{faq()}{cta()}
 <footer class="lp-footer">ふとん便（仮称）<br>説明用の架空サービス・デザイン例</footer></article>'''

def heading(n,title,desc=''):
 return f'<header class="figure-header"><span class="figure-no">図 {n:02d}</span><h1>{title}</h1>'+ (f'<p>{desc}</p>' if desc else '')+'</header>'

def note(text): return f'<p class="figure-note">{text}</p>'
FICT='説明用の架空サービス・デザイン例'

def figure1():
 cards=[]
 for letter,count,cvr in [('A','30','3'),('B','50','5')]:
  cards.append(f'''<section class="ab-case"><h2 class="case-title"><span>{letter}案</span><b>メインコピーだけを変更</b></h2><div class="copy-caption">{COPIES[letter]}</div>{lp(letter)}<div class="results"><div><span>LPを見た人数</span><b>1,000<small>人</small></b></div><div><span>申し込み数</span><b>{count}<small>件</small></b></div><div class="cvr"><span>成約率</span><b>{cvr}<small>%</small></b></div></div></section>''')
 return heading(1,'A/Bテストとは？','異なる案を同じ時期に表示し、<br class="sp-only">申し込みにつながる反応を比較します。')+f'''
 <div class="traffic">{icon('person')}<strong>広告からアクセスを集める</strong></div><div class="branch"><span>A案・B案へ、ランダムに約半分ずつ</span><i></i></div>
 <div class="ab-grid">{''.join(cards)}</div>
 <div class="same-conditions"><b>そろえる条件</b><span>写真・本文・料金条件・CTA・配置</span></div>
 <div class="mobile-results"><div><b>A案</b><strong>3<small>%</small></strong><span>1,000人中30件</span></div><div><b>B案</b><strong>5<small>%</small></strong><span>1,000人中50件</span></div></div>
 <p class="figure-summary">この例では、B案の成約率が高い結果に。</p>
 {note('数値は説明用の仮例です。実績や効果を保証するものではありません。')}
 {note('1,000人は計算例であり、テストに必要な人数や終了条件ではありません。')}
 {note(FICT)}'''

def figure2():
 axes=[('A','便利さ','持ち運ぶ手間を減らす','利用の流れを先に伝える。'),('B','清潔さ','家では洗いにくい布団を洗う','洗浄と仕上がりを先に伝える。'),('C','家族での利用','家族の布団をまとめて頼む','一緒に利用する場面を先に伝える。')]
 cards=''.join(f'<section class="axis-case"><header><span class="axis-letter">{a}案</span><h2>{t}</h2><p>{d}</p><small>{s}</small></header>{lp(a,"axis")}</section>' for a,t,d,s in axes)
 return heading(2,'訴求の違う3つのLPで、<br class="sp-only">反応を確かめる。','同じサービスの、何を先に伝えるか。')+f'<div class="axes-grid">{cards}</div><div class="same-conditions"><b>基本条件は共通</b><span>商品・料金・申し込み条件をそろえる</span></div><p class="figure-summary flow-summary"><span>比較する</span><i>→</i><span>有望な方向性を絞る</span><i>→</i><span>さらに改善する</span></p>'+note(FICT)

def step_title(n,title): return f'<h2 class="stage-title"><span>{n}</span>{title}</h2>'

LONG='お申し込み時に、布団の枚数と集荷のご希望日をお選びください。その後、ご自宅へ専用の集荷袋をお届けします。お届けした袋に布団を入れ、集荷日に配送員へお渡しください。お預かりした布団は、素材に合わせて洗浄・乾燥を行い、仕上がりを確認したうえで、ご自宅へお届けします。'
def figure3():
 return heading(3,'<span class="keep">読み進めなくなる箇所を</span><span class="keep">見直す。</span>')+note('説明用の模式図・実測データではありません')+f'''
 <div class="analysis-grid"><section class="observe">{step_title('1','確認する')}<p class="stage-lead">どこで読む手が止まるか。</p>
 <div class="scroll-study"><div class="analysis-page"><div class="mini-brand">ふとん便</div><h3>重たい布団を運ばずに。<br>自宅からクリーニング。</h3><img src="assets/convenience.webp" alt="布団を集荷用に準備する写真" width="1536" height="1024"><span class="mini-cta">集荷を申し込む <i class="click-dot"></i></span><div class="dense-copy"><h3>ご利用の流れ</h3><p>{LONG}</p></div><div class="next-content"><h3>布団2枚コース</h3><b>12,800円</b><p>往復配送・洗浄・乾燥込み</p></div><span class="mini-cta">集荷を申し込む <i class="click-dot"></i></span><div class="scroll-overlay"></div></div><div class="reach-rail"><b>到達</b><span>多い</span><i></i><span>少ない</span></div></div>
 <div class="drop-callout"><b>長い説明のあたりで、<br>読み進める人が減っている。</b><span>前後の文章も確認する。</span></div><p class="click-note"><i class="click-dot"></i>ボタンのクリックも確認</p></section>
 <section class="repair">{step_title('2','見直す')}<p class="stage-lead">長い文章を<br><b>3ステップの図解に整理する。</b></p><div class="before"><span class="repair-label">変更前</span><h3>ご利用の流れ</h3><p>{LONG}</p></div><div class="repair-arrow">↓</div><div class="after"><span class="repair-label">変更後</span><h3>家から頼める、3ステップ。</h3><div class="repair-steps">'''+''.join(f'<div>{icon(ic)}<p><b>{n}. {t}</b><span>{d}</span></p></div>' for n,ic,t,d in [(1,'phone','ネットで予約','枚数・集荷日を選ぶ'),(2,'box','自宅から発送','専用の袋に詰めて渡す'),(3,'home','自宅で受け取る','洗浄・乾燥後にお届け')])+f'''</div></div><p class="hypothesis-note">「説明が長く、理解しにくいのでは？」<br>という仮説で見直します。<br>離脱した位置だけで原因は断定できません。</p></section></div>
 <section class="recheck">{step_title('3','もう一度確かめる')}<div class="recheck-items"><p>{icon('search')}<span>次のコンテンツまで<br><b>進む人は増えたか</b></span></p><p>{icon('phone')}<span>ボタンは<br><b>押されるようになったか</b></span></p></div></section>
 <p class="figure-summary"><span class="keep">離脱が多い箇所を見つけ、</span><span class="keep">修正し、反応を確かめる。</span></p>{note(FICT)}'''

def figure4():
 return heading(4,'改善後は、この2つを確認。')+f'''
 <div class="metrics-grid"><section class="metric"><span class="metric-label">申し込みにつながった割合</span><h2>成約率 <small>〈CVR〉</small></h2><p class="metric-definition">訪問した人のうち、<br>何人が申し込んだか</p><div class="metric-visual"><div class="visitors">{icon('person')}{icon('person')}{icon('person')}<b>訪問</b></div>{icon('arrow')}<div>{icon('check')}<b>申し込み完了</b></div></div><p class="metric-foot">ボタンのクリックと<br><b>申し込みの完了は分けて確認。</b></p></section>
 <section class="metric"><span class="metric-label">1件あたりにかかった広告費</span><h2>獲得単価 <small>〈CPA〉</small></h2><p class="metric-definition">1件の申し込みに、<br>広告費がいくらかかったか</p><div class="metric-visual"><div>{icon('yen')}<b>広告費</b></div><span class="divide">÷</span><div>{icon('check')}<b>申し込み件数</b></div></div><p class="metric-foot">かかった広告費を<br><b>申し込みの完了件数で割る。</b></p></section></div>
 <div class="metric-compare">変更前と変更後を比較する</div><p class="figure-summary">読まれたか。<br class="sp-only"><span class="keep">その先の申し込みに</span><span class="keep">つながったか。</span></p>'''

for n,func in enumerate([figure1,figure2,figure3,figure4],1):
 body=func()
 page=f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>ZERO 秘訣9 図{n:02d} 編集用組版</title><link rel="stylesheet" href="https://morisawafonts.net/c/01M4BM2NTN3DGZBTPFB0NSJDMZ/mf.css"><link rel="stylesheet" href="figures.css?v=20261010-r5"></head><body><main class="diagram figure-{n:02d}">{body}</main></body></html>'''
 page=page.replace('</head>', '<script>if(new URLSearchParams(location.search).get("export")=="2")document.documentElement.classList.add("export2x");</script></head>')
 page=page.replace('</body>', '<script src="font-audit.js?v=20261010-r5"></script></body>')
 (OUT/f'figure-{n:02d}.html').write_text(page)
 (OUT/f'figure-{n:02d}-fragment.html').write_text(body)
print('Generated 4 editable figure HTML pages and fragments.')
