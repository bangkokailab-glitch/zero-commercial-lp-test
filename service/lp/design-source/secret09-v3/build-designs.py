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

JOURNEY_CROPS = [(62,275,489,370),(62,730,489,361),(62,1169,489,328)]
CARE_CROPS = [(38,265,598,372),(386,659,600,371),(38,1052,948,284)]
FAMILY_CROP = (0,320,1122,623)

def guide_photo(src, crop, alt, classes, dimensions=(1024,1536)):
    x,y,w,h = crop
    iw,ih = dimensions
    return f'<div class="photo-crop {classes}" style="--cx:{x};--cy:{y};--cw:{w};--ch:{h};--iw:{iw}"><img src="assets/{src}" width="{iw}" height="{ih}" alt="{alt}"></div>'

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
    if kind == 'B':
        stages = [
            ('洗浄','素材に合わせて、布団を洗浄します。','白い布団を洗う洗濯機のドラムと、ガラス内の泡のイメージ'),
            ('乾燥','洗浄した布団を、乾燥させます。','乾燥機のドラムに入れられた白い布団のイメージ'),
            ('仕上がり確認','仕上がりを確認してから、<span class="phrase">ご自宅へお届けします。</span>','作業台で布団の縫い目と表面を手で確認する場面のイメージ'),
        ]
        shots = ''.join(f'<div class="care-shot care-shot-{i}">{guide_photo("care-guide.png",crop,alt,"care-photo")}<h3><span class="care-no">{i:02d}</span>{title}</h3><p>{body}</p></div>' for i,((title,body,alt),crop) in enumerate(zip(stages,CARE_CROPS),1))
        return f'''<section class="benefit benefit-B care-section" id="benefit" data-generation="care-guide"><div class="benefit-header"><p class="section-label">布団のお手入れ</p><h2 class="section-title"><span>洗って、乾かして。</span><span>仕上がりまで確認。</span></h2></div><div class="care-stages">{shots}<p class="image-note">お手入れのイメージ</p></div></section>'''
    if kind == 'C':
        return f'''<section class="benefit benefit-C plan-section" id="benefit" data-generation="family-plan-guide"><div class="benefit-header"><p class="section-label">家族のお手入れの予定に</p><h2 class="section-title"><span>2枚まとめて、</span><span>使う予定に合わせて。</span></h2></div>
        {guide_photo('family-plan-guide.png',FAMILY_CROP,'2枚の白い布団と生成りの集荷袋、日付のないカレンダーを組み合わせた利用計画のイメージ','plan-photo',(1122,1402))}
        <div class="plan-content"><dl class="plan-facts"><div><dt>預ける布団</dt><dd><strong>2</strong>枚</dd></div><div><dt>返送目安</dt><dd><span>約</span><strong>2</strong>週間</dd></div></dl><p class="plan-copy"><span class="plan-lead">家族で使う布団を、2枚いっしょに。</span>布団を使う予定に合わせて<span class="phrase">ご検討ください。</span></p></div></section>'''
    d=DATA[kind]
    return f'''<section class="benefit benefit-{kind}" id="benefit" data-generation="benefit-{kind.lower()}">
    <div class="benefit-header"><p class="section-label">ふとん便のある暮らし</p><h2 class="section-title">{lines(d['title'])}</h2></div>
    {photo(f'benefit-{kind.lower()}.png',d['benefit_crop'],d['benefit_alt'])}
    <div class="benefit-copy"><p>布団を預けるのも、受け取るのも、<span class="phrase">ご自宅で。</span>お店まで持ち運ぶ手間を省けます。</p></div></section>'''

def flow(kind='A', before=False):
    titles=['ネットで予約','自宅から発送','自宅で受け取る']
    short=['布団の枚数と集荷日を選ぶ。','専用の袋に詰めて渡す。','洗浄・乾燥後にお届け。']
    alts=['スマートフォンで布団の枚数と集荷日を選ぶイメージ','布団を入れた生成りの集荷袋を玄関に用意するイメージ','自宅に届いた2枚の白い布団のイメージ']
    compact = kind != 'A'
    if before:
        content=f'<p class="flow-long">{LONG}</p>'
    else:
        headings = ['ネットで<br>予約','自宅から<br>発送','自宅で<br>受け取る'] if compact else titles
        bodies = ['枚数と集荷日<br>を選ぶ。','専用の袋に<br>詰めて渡す。','洗浄・乾燥<br>してお届け。'] if compact else ['<span class="phrase">布団の枚数と</span><span class="phrase">集荷日を選ぶ。</span>',short[1],short[2]]
        content = '<ol class="flow-steps">'+''.join(f'<li>{guide_photo("journey-guide.png",crop,alt,"journey-photo")}<div class="step-copy"><h3><span class="step-no">{i:02d}</span>{h}</h3><p>{b}</p></div></li>' for i,(h,b,crop,alt) in enumerate(zip(headings,bodies,JOURNEY_CROPS,alts),1))+'</ol>'
    title = 'ご自宅から、3ステップ。' if compact else 'ご利用の流れ'
    return f'<section class="lp-flow {"compact-flow" if compact else "comparison-flow"}" id="process" data-generation="journey-guide"><p class="section-label">ご利用方法</p><h2 class="section-title">{title}</h2>{content}</section>'

def offer():
    return f'''<section class="lp-offer" id="price" data-generation="price-guide"><p class="section-label">料金・サービス内容</p><h2 class="section-title">料金は、2枚で。</h2>
    <div class="offer-block"><p class="offer-course">布団2枚コース</p><p class="offer-price"><strong>12,800</strong> 円<span class="tax">（税込）</span></p><p class="offer-includes">往復配送・洗浄・乾燥込み</p></div>
    <dl class="offer-terms"><div><dt>返送目安</dt><dd>約2週間</dd></div><div><dt>配送地域</dt><dd>一部地域は配送対象外</dd></div></dl>{cta()}</section>'''

def faq(kind):
    second = '' if kind == 'B' else '<details><summary>預けた布団は、どうなりますか？</summary><p>素材に合わせて洗浄・乾燥を行い、仕上がりを確認してから、ご自宅へお届けします。</p></details>'
    return f'''<section class="faq-section" id="faq"><h2 class="section-title">ご利用前の確認</h2><div class="faqs"><details open><summary>家では、何を準備しますか？</summary><p>お届けする専用の集荷袋に布団を入れ、集荷日に配送員へお渡しください。</p></details>{second}</div></section>'''

def final(kind):
    return f'''<section class="final-order" id="order"><h2 class="section-title">{lines(DATA[kind]['final'])}</h2>
    <p class="demo-note">ふとん便は、説明用の架空サービスです。<br><span class="phrase">このページでは</span><span class="phrase">お申し込みを</span><span class="phrase">受け付けていません。</span></p><a class="return-link" href="#price"><span>料金と内容をもう一度見る</span><span class="arrow" aria-hidden="true">→</span></a></section>
    <footer class="lp-footer">ふとん便（仮称）<br>説明用の架空サービス・デザイン例</footer>'''

def page(title, body, sticky=False, gallery=False):
    return f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{title}</title><link rel="stylesheet" href="{FONT}"><link rel="stylesheet" href="lp-designs.css?v=20261010-v3-polish4"><script>if(new URLSearchParams(location.search).get('export')==='2')document.documentElement.classList.add('export2x');</script></head><body class="{'gallery-body' if gallery else 'single'} {'has-sticky' if sticky else ''}">{body}{'<aside class="sticky-cta" aria-label="集荷の案内">'+cta()+'</aside>' if sticky else ''}<script src="font-audit.js?v=20261010-v3"></script>{'<script src="lp-ui.js?v=20261010-v3"></script>' if sticky else ''}</body></html>'''

def lp(kind='A', before=False):
    if kind == 'A':
        lower = benefit(kind)+flow(kind,before)+faq(kind)+offer()
    elif kind == 'B':
        lower = benefit(kind)+offer()+flow(kind)+faq(kind)
    else:
        lower = benefit(kind)+flow(kind)+offer()+faq(kind)
    return f'<main class="lp-canvas" data-lp="{kind}">{hero(kind)}{lower}{final(kind)}</main>'

for kind in 'ABC':
    (ROOT/f'lp-{kind.lower()}.html').write_text(page(f'ふとん便 — {"便利さ" if kind=="A" else "清潔さ" if kind=="B" else "家族利用"}のLP',lp(kind),True))
(ROOT/'lp-a-after.html').write_text(page('ふとん便 — ご利用の流れを3ステップで紹介',lp('A'),True))
(ROOT/'lp-a-before.html').write_text(page('ふとん便 — ご利用の流れを長文で紹介',lp('A',True),True))
for label,alternate in [('a',False),('b',True)]:
    (ROOT/f'fv-{label}.html').write_text(page(f'ふとん便 — 主見出し比較 {label.upper()}',f'<main class="lp-canvas">{hero("A",alternate)}</main>'))

gallery='''<main class="gallery"><p class="section-label">ZERO 秘訣9 サンプルLP</p><h1>ふとん便の、3つの伝え方。</h1><p>制作中の確認用プレビューです。実寸レビューと記事の図への反映は未完了です。<br>同じ架空サービスを、便利さ・清潔さ・家族利用から伝える3案を掲載しています。</p><div class="gallery-grid">'''
for kind,label in [('A','便利さ'),('B','清潔さ'),('C','家族利用')]:
    gallery+=f'<article class="gallery-card"><p class="section-label">SAMPLE {kind}</p><h2>{label}</h2><p>{DATA[kind]["label"]}</p><a href="lp-{kind.lower()}.html">単体LPを見る →</a></article>'
gallery+='''</div><div class="gallery-links"><a href="fv-a.html">図01 見出しA</a><a href="fv-b.html">図01 見出しB</a><a href="lp-a-before.html#process">図03 Before：長文版</a><a href="lp-a-after.html#process">図03 After：3ステップ版</a><a href="design-study.html">制作デザインを見る</a><a href="../../#secret-09">テストサイトの秘訣9へ</a></div><p>ふとん便は、説明用の架空サービスです。実際のお申し込みは受け付けていません。</p></main>'''
(ROOT/'index.html').write_text(page('秘訣9 サンプルLP一覧',gallery,gallery=True))
study='<main class="study"><h1>ふとん便 デザイン制作記録</h1><p>各訴求で通常案と文字強調案を生成し、同じ深緑・温白・自然光の写真を使う左の通常案を選定しました。最終LPは写真領域を使い、文字・価格・条件を実際の新ゴで編集可能なHTMLに組み直しています。</p>'
for kind,label in [('A','便利さ'),('B','清潔さ'),('C','家族利用')]:
    study+=f'<section><h2>{kind} {label}</h2><img src="assets/fv-{kind.lower()}-pair.png" alt="{label}の通常案と文字強調案"><p>左の通常案を選定。<a href="lp-{kind.lower()}.html">最終LPを確認する</a></p></section>'
study+='<section><h2>下層の仕上げデザイン</h2><p>Aは利用の行動、Bは布団への作業、Cは枚数と利用予定を、それぞれの構成で伝えます。ガイドの文字は実装時に新ゴへ置き換えています。</p><div class="lower-guides">'+''.join(f'<img src="assets/{x}.png" alt="{x}の生成デザインガイド">' for x in ['journey-guide','care-guide','family-plan-guide'])+'</div></section><section><h2>初期の主要下層デザイン</h2><div class="lower-guides">'+''.join(f'<img src="assets/{x}.png" alt="{x}の生成デザインガイド">' for x in ['benefit-a','benefit-b','benefit-c','flow-guide','price-guide'])+'</div></section></main>'
(ROOT/'design-study.html').write_text(page('ふとん便 デザイン制作記録',study,gallery=True))
shutil.copy2(ROOT.parent/'secret09-v2/font-audit.js',ROOT/'font-audit.js')
manifest={'version':'v3-lower-polish','fontStylesheet':FONT,'heroCrops':{k:v['hero_crop'] for k,v in DATA.items()},'benefitCrops':{k:v['benefit_crop'] for k,v in DATA.items()},'polishCrops':{'journey':JOURNEY_CROPS,'care':CARE_CROPS,'family':FAMILY_CROP},'assets':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((ROOT/'assets').glob('*.png'))},'fig01':'H1 text only; all other markup, geometry, photos and conditions identical','fig02':'Normal A and After use the same complete LP with an illustrated three-step procedure','fig03':'Dedicated lp-a-before versus lp-a-after: only process content changes; exact original long paragraph versus approved concise 3 steps; fixed conditions retained','publication':'test repository only; production is outside scope'}
(ROOT/'source-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Built 3 complete LPs, isolated procedure comparison, 2 FV comparisons, gallery and design study.')
