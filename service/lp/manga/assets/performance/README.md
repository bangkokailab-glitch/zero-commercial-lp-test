# 漫画LP画像の軽量化 / 2026-10-16

## 範囲

現行 manga/index.html と参照中のローカル CSS/JS から抽出した44画像。CSSで宣言されても現行DOMでは使われない画像を含むため、合計容量は静的参照上限であり初回ネットワーク転送量ではない。元画像を保持し、現行ページのHTML/CSS参照を最適化WebPへ切り替えた。

- 変更前：17,645,777 bytes
- 置換候補38点を利用：7,053,942 bytes
- 削減：10,591,835 bytes / 60.0%

## 統合

`replace-map.json` に旧→新の38件。`manifest.json` に参照元、画素寸法、品質、容量、置換可否を記録。query文字列を除いたURLを置換し、同じ画像のHTML・CSS両方の参照を揃える。

SVG image（制作フロー）は画像ピクセル寸法を維持しており、URLのみの置換で既存viewBoxと座標を維持できる。一般HTMLのwidth/heightは既存比率を維持して利用可能。画像の縦横比は四捨五入による1px程度を除いて同じ。

## 品質方針

- 通常の漫画：最大幅780px。390 CSS px / DPR2 を確保。元画像が780px未満なら拡大しない。
- 長尺Salon de Six LP：600×15162をそのまま維持、WebP quality88。分割・極端な縮小なし。
- 多言語LPと画面内文字：quality90。元寸法が小さい事例5点は容量が増えるため元画像を採用。
- 6ポーズシート：1002×1002、1セル334px。RGBA維持。
- CTA：817×194そのまま、quality92。透明アルファは元PNGと完全一致を検証。
- 検索スクリーンショット：元JPEGの方が小さいため維持。マップスクリーンショットは同寸法quality95。
- 38点の再読込・寸法一致を検証。FV、悩み漫画、フロー、長尺LP先頭、タイ語LP、CTAを目視比較。可読性・キャラクターの輪郭を保持。比較画像はworkspace outputs/performance-qa に保存（配信対象外）。

## CSS画像について

- aidma-scene.css: AIDMA背景PNGは1.60MB→約120KB。
- line-booking-demo.css: ポーズPNGは2.18MB→約260KB。サロン背景も780px化。
- manga-interactions.css: CTAのmaskとimgを同じ新WebPへ合わせる。
- campaign-selected.css: サテン背景も同寸法再エンコード。
- revision-20261015.css: 旧ステップ顔の背景指定が残るが、DOMに対象がなければ実通信はしない。

作品集保存なし。画像の再生成なし。別途、採用案に合わせたHTML/CSSの配置・吹き出し修正を実施。
