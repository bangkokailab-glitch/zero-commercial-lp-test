# C案｜制作工程のワークショップ

## デザイン意図

LPを「知る・つくる・育てる」媒体として、調査カード、ページ設計紙、計測を示す透明な立体物を一続きの制作現場として描いた。ZEROのLPと黒地、白の太い文字、黄色の強調、オレンジの点／ラインを共有し、青い透明素材でZEROラボらしさを添える。3文のコピーを唯一の訴求として扱い、実績・バッジ・追加CTAは作っていない。

## 制作方法

- `/Users/naokiikeda/.codex/skills/lp-production/SKILL.md` と `references/design-reference-review.md`、`references/intangible-business-fv.md` を確認。
- `/Users/naokiikeda/.codex/skills/.system/imagegen/SKILL.md` の built-in mode により文字なし主画像を生成し、`workshop-process-c.png` として配置。
- 見出し・補足文・ZEROラボのロゴ文字は HTML のまま。既存の許可済み Morisawa Web フォントの CSS と診断 JS を参照する。ブランドの組み文字シンボルは既存 PNG を表示。
- リンクはユーザー指定のホーム・LPO対策・SEO対策・メディア運営・WEB用語集・お問い合わせのみ。

### 画像生成プロンプト

> Use case: ads-marketing. Asset type: textless premium hero artwork for a Japanese landing-page education media site. Show LP creation as a tactile editorial workshop process from researching to designing to measuring/improving. Dramatic charcoal-black worktable still life; three distinct connected layers sweeping diagonally from lower center to upper right: blank research cards and yellow swatch with orange pencil, intricate white paper page-layout prototype and folded grids with royal-blue translucent film, and clear acrylic measurement frame with an unlabeled rising orange line of physical string. Photoreal sculptural mixed-media, sophisticated commercial art direction, tactile paper grain, controlled studio shadow and highlights; black and off-white contrast, selective bright yellow and orange point accents, ZERO-brand blue in paper films. Right two-thirds populated, left third deep dark negative space for HTML headline. 3:2 landscape crop-friendly. NO letters, NO Japanese or English text, NO numbers, NO logos, NO badges, NO dashboards, NO watermarks, no text-like marks; exact headline will be placed separately in HTML.

## 確認

- `preview-pc.jpg`: 1440×637。ヘッダー86px、メイン551px、内側1000px。
- `preview-sp.jpg`: 390×571。ヘッダー56px、メイン515px。
- `preview-sp-small.jpg`: 320×576。ヘッダー56px、メイン520px。
- 横はみ出し0。主画像読み込み正常。モバイルメニューで全リンクとお問い合わせ表示を確認。
- ローカルホスト撮影ではモリサワ配信許可ドメイン外のため CSS が読み込まれない。公開した許可済みテストホストでの実フォント確認と再撮影が必要。
- 本番サイトと既存ゼロラボ本体には変更を加えていない。
