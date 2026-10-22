# A案｜紙の回廊を開くキャンペーン表紙

## 制作の前提

- 対象: ZEROラボの本番 `https://zero-s.jp/labo/` に将来差し替えるヘッダーとファーストビューの比較用プレビュー。本番は未変更。
- 指定の3文、6つのナビゲーション、ZEROの組み文字シンボルを維持。コピーとロゴ文字は画像ではなくHTML。
- 参考: 既存ZERO LPの黒・白の高い対比、黄色のマーカー、オレンジの小さなアクセント、迫力のある文字組み。現行ラボの中央1000px幅、PCメイン画像551px高、スマホのコンパクトな高さ。

## LP制作スキルの適用

`/Users/naokiikeda/.codex/skills/lp-production/SKILL.md`、`references/design-reference-review.md`、`references/intangible-business-fv.md`、画像生成スキルを確認。主役は「ランディングページを、知る。つくる。育てる。」で、補足の2文は読みやすさを優先。これは情報メディアの入口なので、未確認の実績や特典、独自のCTAは追加しない。視覚の錨として、教科書を物理的に開く新しいアートを先に画像生成し、それを比較用HTMLへ組んだ。

## 生成画像

ファイル: `blue-folio-doorway.png`。built-in `image_gen`で生成。左半分に生きた文字を載せる暗い余白、右に直立した青い本と紙の回廊。以前の寝た見開き本とは別の構図。画像内に文字、ロゴ、人物、バッジなし。

生成プロンプトの要旨: “TEXT-FREE hero artwork for ZERO Labo; premium campaign photography / sculptural 3D; monumental upright cobalt-blue hardcover editorial book opening like a doorway into layered white paper corridor, orange page tabs, graphite almost-black background with tactile print texture and warm amber rim light; dark left 55% reserved for live Japanese headline; short wide banner crop; ZERO commercial LP affinity; no text, letters, numerals, logo, UI, icons, people, badges or yellow triangle.”

## 比較用表示

- `index.html` + `style.css` は制作案を比較するためのプレビュー。既存本番テーマへ直接組み込む最終コードではない。
- PC 1392×639とSP 390×566、狭幅320×566のスクリーンショットを `preview-pc.jpg`、`preview-sp.jpg`、`preview-sp-small.jpg` に保存。
- 見出しテキスト完全一致、ナビ6件、主画像読み込み、横はみ出し0をローカルChromeで確認。モリサワの実ライセンス表示はテスト許可ホストへの配置後に別途確認する。
