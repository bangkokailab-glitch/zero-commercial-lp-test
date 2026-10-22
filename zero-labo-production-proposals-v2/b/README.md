# 新B案｜カットペーパーの作字キャンペーン

## 方向性

旧3案の「左コピー／右に立体物」を捨て、ZERO商業LPの見せ方に直接つなぐ。参照元の `service/lp/` は黒い煙背景、巨大な生きた文字、黄色マーカー、斜めの白い印刷帯、オレンジのドットと細いヘッダー区切りが特徴。B案は、画面全体を走る切り紙・印刷の帯でそれらを再構成し、「知る。つくる。育てる。」を斜めの階段のように読ませる。実績の円形バッジや数字は媒体サイトに流用しない。

## スキルと制作順

1. `/Users/naokiikeda/.codex/skills/lp-production/SKILL.md`、`references/design-reference-review.md`、`references/intangible-business-fv.md`、`references/lp-workflow.md` を読んだ。今回の対象は情報媒体のヘッダー＋FVだけ。主役は指定の3文のうち第1文で、既存記事への導線が主目的。架空の実績・特典・申込訴求は足さない。
2. ZERO LP実画面 `task/screenshots/zero-lp-reference-{pc,sp}.jpg` と `service/lp/index.html`、`text-upgrade-20261007.css` を確認した。
3. built-in `image_gen` で文字なしの `kinetic-cut-paper.png` を先に制作し、実画像を見てから比較用HTML/CSSを組んだ。配信用はJPEG `kinetic-cut-paper.jpg`（約702KB）に変換。画像内にコピーは焼き込んでいない。
4. ヘッダーは商業LPの組み文字シンボル `service/lp/images/logo-w.svg` を使用。ロゴ文字「ZEROラボ」と3文はHTMLのまま、新ゴR/BのWebフォントを指定。

## 画像生成の最終プロンプト

> Use case: ads-marketing. Asset type: text-free panoramic hero artwork for a Japanese LP education media sibling to ZERO's commercial LP. A kinetic CUT-PAPER editorial campaign: large overlapping blank charcoal-black and warm-white heavy paper slashes crossing the frame diagonally with rough torn edges, scuffed screen-print ink texture and physical shadows; a few acid-yellow paper tabs, burnt-orange small registration dots, and one restrained deep-blue paper edge. Design-studio materiality and high-energy Japanese direct-response print-ad art direction, not a minimalist portfolio. Leave a broad dark clear central band for live Japanese display headline and dark upper/lower lanes for smaller live copy. Wide 1000px-by-551px hero crop suitable. Absolutely no text, letters, numbers, logos, faces, people, books, doors, glossy 3D objects, glass sculptures, UI, dashboards, buttons, triangles, watermarks, or full webpage simulation.

## 比較用検証

- `preview-pc.jpg`: 1440px幅、ヘッダー86px＋ヒーロー551px。
- `preview-sp.jpg`: 390px幅、ヘッダー55px＋ヒーロー560px。
- `preview-sp-small.jpg`: 320px幅、ヘッダー55px＋ヒーロー550px。
- 指定の3文、6ナビのURLとラベル、画像読み込み、横はみ出し0、SPメニュー開閉を確認。スクリーンショットはローカルファイル撮影なので実モリサワは公開済みテストホストで再確認が必要。
- 本番・旧3案・商業LPは変更していない。
