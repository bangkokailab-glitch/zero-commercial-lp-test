# C案｜制作過程のストーリーボード

ZEROの商業LPと同じ黒いステージ、白い大胆な活字、黄色の強調、オレンジのアクセント、細いナビ区切りを使い、ラボが扱う「知る・つくる・育てる」を3場面の写真にしました。コピーが主役の上段と、手を動かす過程を見せる下段を分け、以前の書籍立体物や抽象図案とは異なる方向にしています。

## 使用したスキルと参照

- `/Users/naokiikeda/.codex/skills/lp-production/SKILL.md`
- 同スキルの `references/design-reference-review.md`、`references/intangible-business-fv.md`、`references/lp-workflow.md`
- `/Users/naokiikeda/.codex/skills/.system/imagegen/SKILL.md` と `references/prompting.md`
- ZERO商業LPのPC/SPキャプチャ `task/screenshots/zero-lp-reference-pc.jpg` と `zero-lp-reference-sp.jpg`
- `service/lp/index.html`、`service/lp/text-upgrade-20261007.css`、`service/lp/images/logo-w.svg`、`service/lp/images/hero-title-ink.svg`

スキルの手順に従い、参照デザインの視覚要素を抽出し、主張するコピー、見る順番、画像の役割を決めてから画像を生成し、HTMLとCSSでファーストビューを組みました。実画像素材は `storyboard-process.png`。生成時には無地の調査カード、無地のワイヤーフレーム、物理的な改善を示すオレンジの曲線を3場面で指定し、画像内の文字、数字、ロゴ、UIラベル、実績表示を禁じました。画像を目視し、読める文字がないことを確認しています。

## 実装条件

- メインコピーと補足の2文は依頼された3文に完全一致するHTMLテキスト。ロゴ文字 `ZEROラボ` もHTMLテキスト。
- モリサワ新ゴ R/B は既存ZEROラボの共有CSSと、既存許可ホスト用のモリサワCSSエンドポイントを利用。ZEROの組み文字シンボルは商業LPの `logo-w.svg` を再利用。
- ナビは指定されたホーム、LPO対策、SEO対策、メディア運営、WEB用語集、お問い合わせの6リンク。
- PCの内側幅は最大1000px。ヘッダー98px、ヒーロー551px。スマホ幅390pxではヘッダー56px、ヒーロー約598px。
- `index.html` は比較ページのみ。既存ラボや商業LP、本番サイトは変更していません。

## ローカル検証

`capture.mjs` でPC 1392px、スマホ390px、小型スマホ360pxを撮影し、`preview-check.json` に確認結果を保存しました。全画面で3文と6リンクの一致、画像読込、横はみ出し0、JavaScriptエラー0を確認しました。スマホのメニューも開閉します。PC/SPの画像は `preview-pc.jpg` と `preview-sp.jpg`。画像はヘッダーからヒーロー終端で切り出しています。

ローカルホストはモリサワの許可ドメインではないため、画像プレビューはフォントライセンス内の最終表示確認ではありません。テストホストへの配置後にネットワークで新ゴの実読込とcomputed fontを確認する必要があります。
