# 「私たちについて」採用①の実装

## 採用と変更範囲

- 基準：revision-options-3/assets/about-1.webp ＋ about-1-part-2.webp。
- ユーザー指定：内側の「私たちについて」の重複ラベルを削除。実績ラベルと数字を拡大。本文をスマホで読みやすい約16pxへ。会社紹介から最後の署名まで一つの外枠に統合。
- 静止画内の生成6事例は使用せず、親担当が用意する約10点の実スマホLPカルーセルへ置換。
- 採用済みの人物・ポーズ・3場面・最後の万年筆と便箋を保持。
- 構図を参考にしたライブHTML実装。見出しと本文はモリサワのWebフォント。固定高さに文章を押し込めず、自然な高さにする。

## ファイルと差し込み

- about-selected.html：既存 #about-zero の章見出し直後に置く article。#zero-message を維持。
- about-selected.css：既存CSSより後に読込。すべて #about-zero .about-selected 以下へ限定。
- `<!-- ABOUT_CASES -->`：実スマホLPカルーセルの挿入位置。カルーセル見出しは親担当側へ委ね、ここには重複見出しを置いていない。
- assets/about-selected/hero-clean.webp：1024×1536。上部人物。文字・旧ラベル・実績数値・生成事例を除去。
- assets/about-selected/story-clean.webp：744×2112。3つの漫画場面と濃紺の装飾。文字と白い吹き出しを除去。
- assets/about-selected/laurels-clean.webp：1024×1536。実績の月桂樹を残した中間素材。現行HTMLでは未参照。

## 文字と余白

- 主本文：スマホ16px、行間1.9、段落間22px。600px以上で18px。
- 各本文ブロック：左右22px、上28px、下32pxを基本に統一。
- 実績ラベル：16px以上。数字40px以上。補足14px以上。
- 上部の訴求は人物と衝突しないよう3行で表現。「日本で磨いた力を、／バンコクのお店の／売上へ。」
- 最終の約束と株式会社ゼロは同じ濃紺面の中。
- 吹き出しは文字と枠を含めて `data-speech-reveal` で表示する。背景画像に白い空の吹き出しは残していない。
- 動作は既存 manga-interactions.js / comic-dialogue.css / comic-speech.css を使用。

## 画像素材の生成

DesignNOW原稿チェックは既存LP全体の文脈と採用原稿、途中・最後の既存CTAを含め9ブロック・10,632文字でPASS。原稿は承認済みの `notes/about.md` から保持し、本文の意味は変更していない。

組み込み image_gen で採用済み画像を編集。PNG→WebPの形式変換のみコードで実施。画像への文字合成はしていない。ライブWebテキストはユーザーが指定した実装物。

- hero-clean：exec-b9fd5a8c-4edd-4273-84cd-cc6ae16a69df.png
- story-clean：exec-073b60dc-8136-46cb-9e8b-a37313c13da7.png
- laurels-clean：exec-607c52da-9220-42b6-95c0-f13ca44620a7.png
- 生成元ディレクトリ：/Users/naokiikeda/.codex/generated_images/01a140ed-aef6-7183-b1de-200fe8979961/

## 確認

画像の人物・ポーズ・文字除去を目視。HTMLのID重複なし、カルーセル挿入位置1箇所、重複見出しなし、参照画像実在、2つの吹き出しの演出フックを確認。

親担当で既存ページへ差し込み、390pxを含むブラウザ確認を行う。subagentはindex変更、ブラウザ操作、commit/push、作品集保存を行っていない。
