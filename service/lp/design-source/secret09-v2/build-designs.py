from pathlib import Path
import json

ROOT = Path(__file__).parent
FONT = 'https://morisawafonts.net/c/01M4BM2NTN3DGZBTPFB0NSJDMZ/mf.css'
LONG = 'お申し込み時に、布団の枚数と集荷のご希望日をお選びください。その後、ご自宅へ専用の集荷袋をお届けします。お届けした袋に布団を入れ、集荷日に配送員へお渡しください。お預かりした布団は、素材に合わせて洗浄・乾燥を行い、仕上がりを確認したうえで、ご自宅へお届けします。'
ASSETS = {'A':'convenience','B':'clean','C':'family'}
COPIES = {
 'A':'重たい布団を<br>運ばずに。<br>自宅から<br>クリーニング。',
 'B':'自宅では洗えない<br>布団を、すっきり清潔に。',
 'C':'家族の布団をまとめて。<br>心地よい毎日へ。',
}
AB_COPY_B = '自宅では<br>洗えない布団を、<br>すっきり<br>清潔に。'

def hero(kind='A', copy_b=False, emphasized=False):
 text = AB_COPY_B if copy_b else COPIES[kind]
 return f'''<section class="lp-fv lp-fv-{kind} {'emphasized' if emphasized else 'standard'}" data-generation="fv-{ASSETS[kind]}-pair">
 <img class="fv-art" src="assets/fv-{ASSETS[kind]}-pair.png" width="1536" height="1024" alt="布団宅配クリーニングのファーストビューデザイン">
 <div class="brand"><b>ふとん便</b><span>布団の宅配クリーニング</span></div>
 <p class="fv-target">家から頼める、布団のお手入れ。</p>
 <h1 class="fv-copy">{text}</h1>
 <span class="fv-button-art"><img src="assets/cta.png" alt="" width="2048" height="682"></span><span class="fv-cta">集荷を申し込む</span>
 </section>'''

def flow(after=False):
 content = '''<ol class="flow-steps"><li><b><span>1</span>ネットで予約</b><p>布団の枚数と集荷日を選ぶ。</p></li><li><b><span>2</span>自宅から発送</b><p>専用の袋に詰めて渡す。</p></li><li><b><span>3</span>自宅で受け取る</b><p>洗浄・乾燥後にお届け。</p></li></ol>''' if after else f'<p class="flow-long">{LONG}</p>'
 return f'''<section class="lp-slice lp-flow" data-generation="lower-flow" id="process"><img class="slice-art" src="assets/lower-flow.png" width="1024" height="1536" alt="申し込み、自宅発送、受け取りの場面をつなぐデザイン"><h2>ご利用の流れ</h2>{content}</section>'''

def care():
 return '''<section class="lp-slice lp-care" data-generation="lower-care"><img class="slice-art" src="assets/lower-care.png" width="1024" height="1536" alt="布団の洗浄と仕上がりを伝えるデザイン"><h2>布団に合ったお手入れ</h2><div class="care-item care-item-1"><h3>素材を確認</h3><p>洗濯表示と素材を確認します。</p></div><div class="care-item care-item-2"><h3>洗浄・乾燥</h3><p>素材に合わせて洗浄・乾燥。</p></div><div class="care-item care-item-3"><h3>仕上げ確認</h3><p>仕上がりを見てからお届け。</p></div></section>'''

def family():
 return '''<section class="lp-slice lp-family" data-generation="lower-family"><img class="slice-art" src="assets/lower-family.png" width="1024" height="1536" alt="家族で布団をまとめて準備するデザイン"><h2>家族の布団を、一緒に。</h2><div class="family-copy"><p>ご夫婦の布団も、子どもの布団も。<br>衣替えの時期に、まとめてお手入れ。</p><p>素材に合わせて洗浄・乾燥。<br>仕上がりを確認し、ご自宅へ届けます。</p></div></section>'''

def offer():
 return '''<section class="lp-slice lp-offer" data-generation="lower-offer"><img class="slice-art" src="assets/lower-offer.png" width="1024" height="1536" alt="共通料金、よくある質問と申し込みボタンのデザイン"><div class="offer-brand">ふとん便</div><h2>布団2枚コース</h2><p class="offer-price"><b>12,800</b>円<span>（税込）</span></p><p class="offer-includes">往復配送・洗浄・乾燥込み</p><p class="offer-terms">返送目安：約2週間。<br>一部地域は配送対象外です。</p><dl class="faqs"><div class="faq-one"><dt>羽毛布団も頼めますか？</dt><dd>洗濯表示を確認し、素材に応じて<br>対応可否をご案内します。</dd></div><div class="faq-two"><dt>家で準備するものは？</dt><dd>専用の集荷袋をお届けします。<br>布団を詰めて、集荷をお待ちください。</dd></div></dl><span class="offer-button-art"><img src="assets/cta.png" alt="" width="2048" height="682"></span><span class="offer-cta">集荷を申し込む</span></section>'''

def lp(kind='A', after=False):
 lower = {'A':flow(after)+care(), 'B':care()+flow(), 'C':family()+flow()}[kind]
 return f'<main class="lp-canvas" data-lp="{kind}">{hero(kind)}{lower}{offer()}<footer class="lp-footer">ふとん便（仮称）<br>説明用の架空サービス・デザイン例</footer></main>'

def page(title, body, study=False):
 return f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{title}</title><link rel="stylesheet" href="{FONT}"><link rel="stylesheet" href="lp-designs.css?v=20261010-v2a"><script>if(new URLSearchParams(location.search).get('export')==='2')document.documentElement.classList.add('export2x');</script></head><body class="{'study' if study else 'single'}">{body}<script src="font-audit.js?v=20261010-v2a"></script></body></html>'''

for kind in 'ABC':
 (ROOT/f'lp-{kind.lower()}.html').write_text(page(f'ふとん便 LP {kind} 生成デザイン・編集原本',lp(kind)))
(ROOT/'lp-a-after.html').write_text(page('ふとん便 LP A 利用手順を3ステップにした版',lp('A',True)))
for label,copy_b in [('a',False),('b',True)]:
 (ROOT/f'fv-{label}.html').write_text(page(f'ふとん便 FV コピー{label.upper()}',f'<main class="lp-canvas">{hero("A",copy_b)}</main>'))
study = '<main class="study-grid">'+''.join(f'<article><h2>{kind} {"便利さ" if kind=="A" else "清潔さ" if kind=="B" else "家族利用"}</h2><div class="study-pair"><div><h3>通常コンセプト案</h3>{hero(kind)}</div><div><h3>強調構成案</h3>{hero(kind,emphasized=True)}</div></div></article>' for kind in 'ABC')+'</main>'
(ROOT/'fv-study.html').write_text(page('FV 3訴求 通常・強調の生成デザイン比較',study,True))
print('Created 3 complete LP designs, one isolated process revision, 2 identical-condition FV variants and 6-pattern design study.')
