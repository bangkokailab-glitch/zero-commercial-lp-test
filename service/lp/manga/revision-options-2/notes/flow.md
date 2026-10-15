# 制作フローのデザイン比較 3案

作成日: 2026-10-15
対象: service/lp/manga/#production-flow
状態: デザイン提案。既存ページ本文やCSSは未変更。作品集には保存していない。

## 共通条件

既存の8工程を保ち、01〜08をそれぞれ独立した枠で囲った。無料提案は「LP構成案＋メイン画像ラフ1案」。正式な依頼・着手金を経て本制作に進む。LINE構築は工程5〜6と並行。全文は既存HTMLに残し、画像は比較用に各工程の要点へ整理している。

原稿チェック: DesignNOW check、LP全体＋提案用フロー原稿、PASS（8ブロック、10,391字）。制作は標準image_gen。参照キャラは既存company.webp。画像修正もimage_genを使用。WebPへの変換のみPillowを使用しデザインや文字の描画は行っていない。

## A: 白いカードと縦ステップ

白地のカードを細い紺金枠で囲み、大きな番号を左端に固定。各工程で準備するものを右に添え、必要な場面だけ人物を見せる。無料ラフと並行工程のタグを分けて示す。assets/flow-a.webp、724×2172。

## B: 成果物を見せる紺金パネル

8枚の紺のボードに金色の番号を大きく置き、相談・素材・ラフ・見積もり・原稿・LP・LINE・納品を具体物で説明。人物は02・03・08で自然に登場。assets/flow-b.webp、738×2132。

## C: 相談を追える漫画カード

各工程を独立したカードにし、斎藤さんとマリの打ち合わせ場面を左右交互に配置。番号タブ、文章、イラストを各枠内にまとめる。assets/flow-c.webp、724×2172。

## 目視確認

全案で01〜08の順序・各工程のタイトル・無料ラフの範囲・工程5〜6との並行表記・最終納品を確認。C初稿の08が重複する問題はimage_genでその箇所のみ除去し再確認。人物は黒髪・紺スーツの斎藤さん、ブロンド・黒ジャケットのマリで統一。

比較画像は自然な縦長。採用後の実装ではスマホ幅に合わせて本文をWebフォントで読みやすく組む。元ページの詳しい説明を意図なく削らない。

## 提案用原稿

お問い合わせから 制作・納品までの流れ
01 LINEでお問い合わせ
「無料ラフを相談したい」とお知らせください。お店のお悩みを伺います。
02 ヒアリング・素材のご提供
サービス・料金・強み・お客様像を確認。写真やロゴをご用意いただきます。
03 LP構成案＋メイン画像ラフをご提案
LP構成案と、メイン画像のラフ1案を無料でご提案。方向性と費用をご確認ください。
04 正式なご依頼・着手金
提案と見積もりにご納得いただいたうえでご依頼。着手金のお支払い後、本制作へ。
05 企画・構成・文章を作成
伝える内容と順番はZEROが整理。原稿をすべて書く必要はありません。
06 デザイン決定・ページ制作
最初にメイン画像を決め、ページ全体を制作。多言語版は日本語版を土台に展開します。
07 LINEのAI対応・予約を構築
工程5〜6と並行。お店のルールを確認し、Googleカレンダー連動の質問・予約対応を整えます。
08 最終確認・納品
LPの表示・問い合わせ導線・LINEの回答と予約を確認。調整後、ご依頼範囲に合わせて納品します。

## 生成プロンプト

### A

Use case: ads-marketing. Create a finished polished Japanese mobile landing-page design proposal, an isolated production process section. This is not a whole LP. EXTREMELY TALL portrait approximately 1024 x 3072, width:height 1:3. Never fit into one mobile screen. All eight steps readable, substantial vertical room. Navy #08243d, gold #c9a459 and white/ivory. High-end Japanese service design with crafted hierarchy, handsome deep navy and warm gold; body sans serif Japanese, all text crisp and readable. 8 separate fully enclosed card frames numbered 01 through 08, each with title and short supporting copy. Avoid floating chopped-off face badges. Supporting objects and human scenes help meaning. Reference image is CHARACTER IDENTITY ONLY: consultant Saito early30s Japanese man wavy parted black hair navy suit open collar light shirt; shop owner Mari late20s woman long side parted wavy blonde hair pearl earrings black blazer white V-neck blouse. Faces and clothing consistent. People shown naturally engaging with work, not pasted circular headshots. No invented CTA, no price, no A/B/C labels, no phone-browser chrome. Include this complete Japanese copy exactly, can introduce sensible line breaks:
お問い合わせから 制作・納品までの流れ
01 LINEでお問い合わせ
「無料ラフを相談したい」とお知らせください。お店のお悩みを伺います。
02 ヒアリング・素材のご提供
サービス・料金・強み・お客様像を確認。写真やロゴをご用意いただきます。
03 LP構成案＋メイン画像ラフをご提案
LP構成案と、メイン画像のラフ1案を無料でご提案。方向性と費用をご確認ください。
04 正式なご依頼・着手金
提案と見積もりにご納得いただいたうえでご依頼。着手金のお支払い後、本制作へ。
05 企画・構成・文章を作成
伝える内容と順番はZEROが整理。原稿をすべて書く必要はありません。
06 デザイン決定・ページ制作
最初にメイン画像を決め、ページ全体を制作。多言語版は日本語版を土台に展開します。
07 LINEのAI対応・予約を構築
工程5〜6と並行。お店のルールを確認し、Googleカレンダー連動の質問・予約対応を整えます。
08 最終確認・納品
LPの表示・問い合わせ導線・LINEの回答と予約を確認。調整後、ご依頼範囲に合わせて納品します。
Ensure headings do not collide and each step retains its full number, title and copy. Use beautiful crafted layout but no horizontal multi-column grid of eight tiny boxes. Each step gets an obvious own frame.
Design A direction: ivory editorial timeline, eight large WHITE cards with a solid fine navy border and delicate inner gold keyline. A generous gold 01,02 etc occupies narrow left inset each card, main text to right. Gold connectors only in gaps. Small miniature illustrations on right edge or at footer of a few cards: chat on phone, photos and logo documents, wireframe and main visual rough, paperwork, copywriting desk, tall LP, calendar/chat integration, complete device checks. Some naturally cropped figures in those illustrations but no mandatory character on every card. Step03 special soft gold wash and small 今なら無料 label. Step07 parallel relation in a subtle badge 工程5〜6と並行. Main header navy square frame gold two-lines and downward navy triangle. Spacious breathable precision.

### B

Use case: ads-marketing. Create a finished polished Japanese mobile landing-page design proposal, an isolated production process section. This is not a whole LP. EXTREMELY TALL portrait approximately 1024 x 3072, width:height 1:3. Never fit into one mobile screen. All eight steps readable, substantial vertical room. Navy #08243d, gold #c9a459 and white/ivory. High-end Japanese service design with crafted hierarchy, handsome deep navy and warm gold; body sans serif Japanese, all text crisp and readable. 8 separate fully enclosed card frames numbered 01 through 08, each with title and short supporting copy. Avoid floating chopped-off face badges. Supporting objects and human scenes help meaning. Reference image is CHARACTER IDENTITY ONLY: consultant Saito early30s Japanese man wavy parted black hair navy suit open collar light shirt; shop owner Mari late20s woman long side parted wavy blonde hair pearl earrings black blazer white V-neck blouse. Faces and clothing consistent. People shown naturally engaging with work, not pasted circular headshots. No invented CTA, no price, no A/B/C labels, no phone-browser chrome. Include this complete Japanese copy exactly, can introduce sensible line breaks:
お問い合わせから 制作・納品までの流れ
01 LINEでお問い合わせ
「無料ラフを相談したい」とお知らせください。お店のお悩みを伺います。
02 ヒアリング・素材のご提供
サービス・料金・強み・お客様像を確認。写真やロゴをご用意いただきます。
03 LP構成案＋メイン画像ラフをご提案
LP構成案と、メイン画像のラフ1案を無料でご提案。方向性と費用をご確認ください。
04 正式なご依頼・着手金
提案と見積もりにご納得いただいたうえでご依頼。着手金のお支払い後、本制作へ。
05 企画・構成・文章を作成
伝える内容と順番はZEROが整理。原稿をすべて書く必要はありません。
06 デザイン決定・ページ制作
最初にメイン画像を決め、ページ全体を制作。多言語版は日本語版を土台に展開します。
07 LINEのAI対応・予約を構築
工程5〜6と並行。お店のルールを確認し、Googleカレンダー連動の質問・予約対応を整えます。
08 最終確認・納品
LPの表示・問い合わせ導線・LINEの回答と予約を確認。調整後、ご依頼範囲に合わせて納品します。
Ensure headings do not collide and each step retains its full number, title and copy. Use beautiful crafted layout but no horizontal multi-column grid of eight tiny boxes. Each step gets an obvious own frame.
Design B direction: a sequence of eight deep navy rectangular premium project boards on creamy background with rich gold double borders. All eight steps independently framed. Large gold STEP number and white bold heading at top of each frame; white main copy below, naturally arranged around relevant mini tangible deliverables at alternating bottom-left and bottom-right. Every card is visualized as a service delivery: phone chat; store photography/material folder; LP outline and first-view rough; estimate agreement; copywriting pages; responsive page mockup; calendar-chat workflow; laptop/mobile final check. Whitespace between frames, little gold downward chevron. Golden spotlight only at step03 and stage08. Characters naturally appear in 02,03,08 as halfbody gestures interacting with props, not sticker portraits. Header clean ivory with large navy typography and thin gold rules.

### C

Use case: ads-marketing. Create a finished polished Japanese mobile landing-page design proposal, an isolated production process section. This is not a whole LP. EXTREMELY TALL portrait approximately 1024 x 3072, width:height 1:3. Never fit into one mobile screen. All eight steps readable, substantial vertical room. Navy #08243d, gold #c9a459 and white/ivory. High-end Japanese service design with crafted hierarchy, handsome deep navy and warm gold; body sans serif Japanese, all text crisp and readable. 8 separate fully enclosed card frames numbered 01 through 08, each with title and short supporting copy. Avoid floating chopped-off face badges. Supporting objects and human scenes help meaning. Reference image is CHARACTER IDENTITY ONLY: consultant Saito early30s Japanese man wavy parted black hair navy suit open collar light shirt; shop owner Mari late20s woman long side parted wavy blonde hair pearl earrings black blazer white V-neck blouse. Faces and clothing consistent. People shown naturally engaging with work, not pasted circular headshots. No invented CTA, no price, no A/B/C labels, no phone-browser chrome. Include this complete Japanese copy exactly, can introduce sensible line breaks:
お問い合わせから 制作・納品までの流れ
01 LINEでお問い合わせ
「無料ラフを相談したい」とお知らせください。お店のお悩みを伺います。
02 ヒアリング・素材のご提供
サービス・料金・強み・お客様像を確認。写真やロゴをご用意いただきます。
03 LP構成案＋メイン画像ラフをご提案
LP構成案と、メイン画像のラフ1案を無料でご提案。方向性と費用をご確認ください。
04 正式なご依頼・着手金
提案と見積もりにご納得いただいたうえでご依頼。着手金のお支払い後、本制作へ。
05 企画・構成・文章を作成
伝える内容と順番はZEROが整理。原稿をすべて書く必要はありません。
06 デザイン決定・ページ制作
最初にメイン画像を決め、ページ全体を制作。多言語版は日本語版を土台に展開します。
07 LINEのAI対応・予約を構築
工程5〜6と並行。お店のルールを確認し、Googleカレンダー連動の質問・予約対応を整えます。
08 最終確認・納品
LPの表示・問い合わせ導線・LINEの回答と予約を確認。調整後、ご依頼範囲に合わせて納品します。
Ensure headings do not collide and each step retains its full number, title and copy. Use beautiful crafted layout but no horizontal multi-column grid of eight tiny boxes. Each step gets an obvious own frame.
Design C direction: eight individually framed consultation story cards. Warm white card background, navy chunky top tab with gold step number, thin double navy and gold border around each entire card. Each card combines a short Japanese title/copy in a clear upper text area with a wide shallow manga scene at lower part; can alternate left visual/right text composition across cards but mobile readability priority. Cards grouped in vertical single-column flow separated by white generous gaps, no all-in-one scene. Saito and Mari meaningfully discuss phone inquiry, shop materials, proposed rough, agreement, script plan, LP design, AI calendar preparation, final approval, with varied poses and cut angles; natural attentive expressions. Keep exact provided copy outside scenes, no extra speech bubbles. Warm salon desk in illustrations plus deep navy graphic panels tie to existing manga LP. High-quality editorial type, no tiny labels. Fulleight steps, noomission.

