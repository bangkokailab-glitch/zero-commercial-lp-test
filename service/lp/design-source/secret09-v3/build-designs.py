from pathlib import Path
import json, shutil, hashlib

ROOT = Path(__file__).parent
FONT = 'https://morisawafonts.net/c/01M4BM2NTN3DGZBTPFB0NSJDMZ/mf.css'
LONG = 'お申し込み時に、布団の枚数と集荷のご希望日をお選びください。その後、ご自宅へ専用の集荷袋をお届けします。お届けした袋に布団を入れ、集荷日に配送員へお渡しください。お預かりした布団は、素材に合わせて洗浄・乾燥を行い、仕上がりを確認したうえで、ご自宅へお届けします。'
H1 = {
    'A': ['重たい布団を', '運ばずに。', '自宅から', 'クリーニング。'],
    'B': ['自宅では洗えない', '布団を、', 'すっきり', '清潔に。'],
    'C': ['家族の布団を、', '2枚まとめて。'],
}
DATA = {
    'A': {
        'label': '持ち運ぶ手間を、ご自宅での受け渡しへ。',
        'title': ['布団を抱えて、', '出かける手間をなくす。'],
        'body': 'かさばる布団を、お店まで持っていくのはひと仕事。ふとん便なら、ご自宅で布団を預けて、洗浄・乾燥後の布団をご自宅で受け取れます。',
        'tail': ['受け渡しも、受け取りも。', 'いつものご自宅で。'],
        'final': ['自宅から、', '布団のお手入れを。'],
        'photo_alt': '自宅の玄関で、布団の入った集荷袋を配送員へ渡す場面のイメージ',
        'benefit_alt': '室内で白い布団を集荷袋へ入れている場面のイメージ',
        'hero_crop': (42, 471, 571, 445),
        'benefit_crop': (29, 350, 965, 737),
    },
    'B': {
        'label': 'いつもの寝具に、洗浄と乾燥を。',
        'title': ['洗うことも、', '乾かすことも。'],
        'body': '大きな布団は、家で洗うのも、乾かすのも大変。ふとん便は、素材に合わせた洗浄・乾燥を行い、仕上がりを確認してからお届けします。',
        'tail': ['洗浄・乾燥から、仕上がりの確認まで。', '布団に合わせて、お手入れします。'],
        'final': ['いつもの布団に、', 'お手入れの時間を。'],
        'photo_alt': '自然光の寝室に置かれた白い布団のイメージ',
        'benefit_alt': '白い布団を両手で広げている場面のイメージ',
        'hero_crop': (42, 459, 571, 456),
        'benefit_crop': (1, 417, 1022, 638),
    },
    'C': {
        'label': '家族の寝具を、2枚いっしょに。',
        'title': ['2枚いっしょに、', 'お手入れの予定を。'],
        'body': '家族で使う布団を、2枚まとめてクリーニング。毎日の寝具も、季節の変わり目に使い終えた布団も。家族のお手入れの予定に合わせて、ご検討いただけます。',
        'tail': ['返送目安は、約2週間。', '布団を使う予定に合わせてご検討ください。'],
        'final': ['家族の布団に、', 'お手入れの予定を。'],
        'photo_alt': '家族がそれぞれの布団を整える、2枚の寝具が見える場面のイメージ',
        'benefit_alt': '木製ベンチに別々に置かれた2枚の白い布団のイメージ',
        'hero_crop': (42, 405, 571, 480),
        'benefit_crop': (36, 349, 954, 723),
    },
}

def lines(values):
    return ''.join(f'<span>{value}</span>' for value in values)

def photo(src, crop, alt, hero=False, kind='A'):
    x,y,w,h = crop
    iw,ih = (1254,1254) if hero else (1024,1536)
    classes = 'photo-crop hero-photo' if hero else 'photo-crop benefit-photo'
    return f'<div class="{classes}" style="--cx:{x};--cy:{y};--cw:{w};--ch:{h};--iw:{iw}"><img src="assets/{src}" width="{iw}" height="{ih}" alt="{alt}"></div>'

def cta():
    return '<a class="cta" href="#order"><img src="assets/cta.png" alt="" width="2172" height="724"><span>集荷を申し込む</span></a>'

def hero(kind='A', alternate=False):
    d = DATA[kind]
    copy = H1['B'] if alternate else H1[kind]
    sub = '<p class="hero-sub">いつもの寝具を、いっしょにお手入れ。<br>往復配送から洗浄・乾燥まで。</p>' if kind=='C' else ''
    return f'''<section class="lp-fv hero-{kind}" id="top" data-generation="fv-{kind.lower()}-pair">
      <header class="brand-header"><p class="wordmark">ふとん便</p><p class="category">布団の宅配クリーニング</p></header>
      <div class="hero-intro"><h1 class="hero-copy">{lines(copy)}</h1>{sub}</div>
      {photo(f'fv-{kind.lower()}-pair.png',d['hero_crop'],d['photo_alt'],True,kind)}
      <div class="hero-offer"><p class="mini-price"><span class="course">布団2枚</span><span><strong>12,800</strong><span class="yen">円</span><span class="tax">（税込）</span></span></p>
      <p class="includes">往復配送・洗浄・乾燥込み</p>{cta()}
      <p class="hero-terms">返送目安：約2週間<br>一部地域は配送対象外です。</p><a class="secondary-link" href="#price">料金と内容を見る</a></div>
    </section>'''

def benefit(kind):
    d=DATA[kind]
    return f'''<section class="benefit benefit-{kind}" id="benefit" data-generation="benefit-{kind.lower()}">
    <div class="benefit-header"><p class="section-label">ふとん便のある暮らし</p><h2 class="section-title">{lines(d['title'])}</h2></div>
    {photo(f'benefit-{kind.lower()}.png',d['benefit_crop'],d['benefit_alt'])}
    <div class="benefit-copy"><p>{d['body']}</p><p class="benefit-tail">{'<br>'.join(d['tail'])}</p></div></section>'''

def flow(kind='A', after=False):
    titles=['ネットで予約','自宅から発送','自宅で受け取る']
    short=['布団の枚数と集荷日を選ぶ。','専用の袋に詰めて渡す。','洗浄・乾燥後にお届け。']
    bodies=['布団の枚数と集荷の希望日を選びます。専用の集荷袋をご自宅へお届けします。','届いた袋に布団を入れ、集荷日に配送員へ渡します。','素材に合わせて洗浄・乾燥。仕上がりを確認して、ご自宅へお届けします。']
    title = ['ご利用の流れ'] if kind=='A' else ['ご自宅から、','お手入れへ。'] if kind=='B' else ['まとめて預けて、','ご自宅で受け取る。']
    if kind=='A' and not after:
        content=f'<p class="flow-long">{LONG}</p>'
    else:
        selected=short if after else bodies
        content='<ol class="flow-steps">'+''.join(f'<li><span class="step-no">{i:02d}</span><div><h3>{h}</h3><p>{b}</p></div></li>' for i,(h,b) in enumerate(zip(titles,selected),1))+'</ol>'
    return f'<section class="lp-flow {"short-comparison" if after else ""}" id="process" data-generation="flow-guide"><p class="section-label">ご利用方法</p><h2 class="section-title">{lines(title)}</h2>{content}</section>'

def offer():
    return f'''<section class="lp-offer" id="price" data-generation="price-guide"><p class="section-label">料金・サービス内容</p><h2 class="section-title">料金は、2枚で。</h2>
    <div class="offer-block"><p class="offer-course">布団2枚コース</p><p class="offer-price"><strong>12,800</strong> 円<span class="tax">（税込）</span></p><p class="offer-includes">往復配送・洗浄・乾燥込み</p></div>
    <dl class="offer-terms"><div><dt>返送目安</dt><dd>約2週間</dd></div><div><dt>配送地域</dt><dd>一部地域は配送対象外</dd></div></dl>{cta()}</section>'''

def faq():
    return '''<section class="faq-section" id="faq"><h2 class="section-title"><span>ご利用前に、</span><span>確認したいこと。</span></h2><dl class="faqs">
    <div><dt>料金に含まれるものは？</dt><dd>布団2枚の往復配送・洗浄・乾燥が含まれます。料金は12,800円（税込）です。</dd></div>
    <div><dt>返送までの目安は？</dt><dd>返送目安は約2週間です。布団を使う予定に合わせてご検討ください。</dd></div>
    <div><dt>どの地域でも利用できますか？</dt><dd>一部地域は配送対象外です。</dd></div></dl></section>'''

def final(kind):
    return f'''<section class="final-order" id="order"><h2 class="section-title">{lines(DATA[kind]['final'])}</h2><p class="final-price">布団2枚 12,800円（税込）</p><p class="final-includes">往復配送・洗浄・乾燥込み</p>
    <p class="demo-note">ふとん便は、説明用の架空サービスです。<br>このページではお申し込みを受け付けていません。</p><a class="return-link" href="#price"><span>料金と内容をもう一度見る</span><span class="arrow" aria-hidden="true">→</span></a></section>
    <footer class="lp-footer">ふとん便（仮称）<br>説明用の架空サービス・デザイン例</footer>'''

def page(title, body, sticky=False, gallery=False):
    return f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{title}</title><link rel="stylesheet" href="{FONT}"><link rel="stylesheet" href="lp-designs.css?v=20261010-v3"><script>if(new URLSearchParams(location.search).get('export')==='2')document.documentElement.classList.add('export2x');</script></head><body class="{'gallery-body' if gallery else 'single'} {'has-sticky' if sticky else ''}">{body}{'<aside class="sticky-cta" aria-label="集荷の案内">'+cta()+'</aside>' if sticky else ''}<script src="font-audit.js?v=20261010-v3"></script>{'<script src="lp-ui.js?v=20261010-v3"></script>' if sticky else ''}</body></html>'''

def lp(kind='A', after=False):
    return f'<main class="lp-canvas" data-lp="{kind}">{hero(kind)}{benefit(kind)}{flow(kind,after)}{offer()}{faq()}{final(kind)}</main>'

for kind in 'ABC':
    (ROOT/f'lp-{kind.lower()}.html').write_text(page(f'ふとん便 — {"便利さ" if kind=="A" else "清潔さ" if kind=="B" else "家族利用"}のLP',lp(kind),True))
(ROOT/'lp-a-after.html').write_text(page('ふとん便 — ご利用の流れを3ステップで紹介',lp('A',True),True))
for label,alternate in [('a',False),('b',True)]:
    (ROOT/f'fv-{label}.html').write_text(page(f'ふとん便 — 主見出し比較 {label.upper()}',f'<main class="lp-canvas">{hero("A",alternate)}</main>'))

gallery='''<main class="gallery"><p class="section-label">ZERO 秘訣9 サンプルLP</p><h1>ふとん便の、3つの伝え方。</h1><p>同じ架空サービスを、便利さ・清潔さ・家族利用から伝える完成LPです。<br>スマートフォンでそれぞれのページを開き、ファーストビューから料金・最終案内まで確認できます。</p><div class="gallery-grid">'''
for kind,label in [('A','便利さ'),('B','清潔さ'),('C','家族利用')]:
    gallery+=f'<article class="gallery-card"><p class="section-label">SAMPLE {kind}</p><h2>{label}</h2><p>{DATA[kind]["label"]}</p><a href="lp-{kind.lower()}.html">単体LPを見る →</a><a href="renders/lp-{kind.lower()}.jpg">LP全景の画像を見る →</a></article>'
gallery+='''</div><div class="gallery-links"><a href="fv-a.html">図01 見出しA</a><a href="fv-b.html">図01 見出しB</a><a href="lp-a-after.html#process">図03 3ステップ版</a><a href="design-study.html">制作デザインを見る</a><a href="../../#secret-09">テストサイトの秘訣9へ</a></div><p>ふとん便は、説明用の架空サービスです。実際のお申し込みは受け付けていません。</p></main>'''
(ROOT/'index.html').write_text(page('秘訣9 サンプルLP一覧',gallery,gallery=True))
study='<main class="study"><h1>ふとん便 デザイン制作記録</h1><p>各訴求で通常案と文字強調案を生成し、同じ深緑・温白・自然光の写真を使う左の通常案を選定しました。最終LPは写真領域を使い、文字・価格・条件を実際の新ゴで編集可能なHTMLに組み直しています。</p>'
for kind,label in [('A','便利さ'),('B','清潔さ'),('C','家族利用')]:
    study+=f'<section><h2>{kind} {label}</h2><img src="assets/fv-{kind.lower()}-pair.png" alt="{label}の通常案と文字強調案"><p>左の通常案を選定。<a href="lp-{kind.lower()}.html">最終LPを確認する</a></p></section>'
study+='<section><h2>主要下層の生成デザイン</h2><div class="lower-guides">'+''.join(f'<img src="assets/{x}.png" alt="{x}の生成デザインガイド">' for x in ['benefit-a','benefit-b','benefit-c','flow-guide','price-guide'])+'</div></section></main>'
(ROOT/'design-study.html').write_text(page('ふとん便 デザイン制作記録',study,gallery=True))
shutil.copy2(ROOT.parent/'secret09-v2/font-audit.js',ROOT/'font-audit.js')
manifest={'version':'v3','fontStylesheet':FONT,'heroCrops':{k:v['hero_crop'] for k,v in DATA.items()},'benefitCrops':{k:v['benefit_crop'] for k,v in DATA.items()},'assets':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((ROOT/'assets').glob('*.png'))},'fig01':'H1 text only; all other markup, geometry, photos and conditions identical','fig03':'Only process block changes; original long paragraph versus approved concise 3 steps; meanings and fixed conditions retained','publication':'test repository only; production is outside scope'}
(ROOT/'source-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Built 3 complete LPs, isolated procedure comparison, 2 FV comparisons, gallery and design study.')
