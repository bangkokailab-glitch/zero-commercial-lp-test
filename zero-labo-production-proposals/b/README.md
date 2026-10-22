# B案｜作字を主役にした構築的な表紙

## 方向性

ZERO LPの黒地、白い太字、黄色の強調、オレンジの点と線に合わせた比較案。「知る。」を大きな黄色の紙面として扱い、「つくる。育てる。」を白い大きな文字でつなぐ。右側の新規生成画像は、開いた本ではなく、組み立てられる紙と青い透明素材の立体構造。概念とコピーに一体感を持たせる。

## 制作・確認

- 使用スキル：`/Users/naokiikeda/.codex/skills/lp-production/SKILL.md`、`references/design-reference-review.md`、`references/intangible-business-fv.md`、`/Users/naokiikeda/.codex/skills/.system/imagegen/SKILL.md`。
- 生成：組み立てられた白い紙の建築的構造＋ZEROブルーの透明素材、文字・ロゴなしの画像を built-in image_gen で生成。保存先 `kinetic-planes.png`。
- キャッチコピー・ロゴ文字・ナビゲーションは HTML テキスト。指定文言と6件のURLを確認。
- ヘッダー＋ファーストビュー：PC 96px＋551px、SP 55px＋522px。PC中央幅1000px。画像全体がFV内に収まる位置へ調整。
- ローカルプレビュー：PC/SPとも横はみ出し0。`preview-pc.jpg` と `preview-sp.jpg` はローカル撮影のため、Morisawaは許可ドメイン外では読み込めずフォールバック表示。テストホスト公開後に実フォントで再撮影が必要。

## 画像生成プロンプトの要点

`stylized-concept`：日本語LP教育メディアのヒーロー用、3:2の透明背景。3枚の縦長の折り紙的な白い構築物、コバルトブルー透明アクリル、黄色の細いエッジ、オレンジの光、紙繊維と印刷感。知る・つくる・育てるを構造的な前進として表現。右側のビジュアルとして使える余白と全体シルエット。文字、数字、UI、ロゴ、ラベル、ボタン、開いた本は生成しない。
