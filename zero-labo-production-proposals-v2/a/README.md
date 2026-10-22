# 新 A案｜ZERO商業LPの姉妹表紙

## 意図

旧3案はいずれも左に文字・右に3D素材を置き、ZERO商業LPから色だけ借りたように見えた。新Aは実際の商業LPにある**中央の巨大なタイトル、かすれた印刷文字、斜めの白い紙片、黄色いマーカー、3つのオレンジ円、黒い煙と印刷の粒子**を構図へ移した。オレンジ円は実績数値の代わりに、調べる・設計する・計測して育てる各工程の文字なし図像を入れた。未確認の成果・特典・数値は載せない。

## 使用したスキルと参照

- `/Users/naokiikeda/.codex/skills/lp-production/SKILL.md`
- `references/design-reference-review.md`、`references/intangible-business-fv.md`
- `/Users/naokiikeda/.codex/skills/.system/imagegen/SKILL.md`
- ZERO商業LPの `service/lp/index.html`、`service/lp/text-upgrade-20261007.css`、`service/lp/images/logo-w.svg`、`service/lp/images/hero-title-ink.svg` と、`screenshots/zero-lp-reference-pc.jpg` / `-sp.jpg`

**参照パターン:** これはLP制作のノウハウを読むメディアの入口。コンバージョン用の証拠やオファーを捏造せず、指定コピーを主役に置く。既存LPの作字処理をWebフォントの上に重ね、技術上もブランド上もつながる。新しいFV画像を先に生成し、比較用HTML/CSSはその後で組んだ。これは選定前のデザイン比較であり、WordPress本番テンプレートではない。

## 新規画像

`zero-sibling-background.png` は built-in `image_gen` で生成。コピーやロゴは画像に含めていない。プロンプト要旨:

> Use case: ads-marketing. Text-free 16:9 background art for a Japanese landing-page education website. Style kinship with a direct-response ZERO LP: charcoal-black smoky studio, distressed screen-print grain, white blank paper layout mockups cropping in only from outer corners and lower edge, flashes of orange and yellow print registration. Center 65% must remain dark and empty for a giant live Japanese headline. Art-directed, energetic, tactile editorial photography, no 3D book or sculpture, not minimalist. Absolutely no text, letters, characters, numerals, logos, badges, faces, UI, circles or triangles.

## 表示と確認

- PCは中央1000px内、ヘッダー91px＋FV551px。SPはヘッダー56px＋FV570px。
- `preview-pc.jpg` (1392×642)、`preview-sp.jpg` (390×626)、`preview-sp-small.jpg` (320×626) はローカル比較画像。
- 3つの指定コピーの `textContent` は一字一句一致。6件の指定ナビURLを保持。1392/390/320pxで横はみ出し0。
- 文字とロゴの文字部分はHTML。商業LPの元のZEROシンボルはSVGをそのまま参照。フォント指定は既存の新ゴR/B配信。ローカル撮影では配信許可外のため、公開テストホストで実フォントを再確認する。
- 本番・既存ZERO LP・旧比較案は変更していない。
