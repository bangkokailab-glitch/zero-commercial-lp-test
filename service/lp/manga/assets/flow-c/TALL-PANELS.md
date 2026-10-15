# 制作フローC：縦方向に拡張した漫画背景（2026-10-16）

## 修正した問題

旧実装は、文字量に合わせてカードを縦に伸ばした一方、元の低い漫画コマだけを中央表示したため、絵が約90pxの帯に見えた。元画像の空番号タブも残っていた。今回、採用Cの各場面を縦に描き足し、漫画と本文が横並びになる各カードの背景を作り直した。

## 新しい素材

- panels-01-04.webp：724×2171、前半4場面、359,750 bytes
- panels-05-08.webp：724×2171、後半4場面、348,184 bytes
- 1枚を4等分した各場面は724×542.75。
- 奇数：左クリーム色の文章面、右に漫画。偶数：左漫画、右文章面。
- 元Cの人物、ポーズの意味、行動、暖かいサロン、衣装を参照し、頭部だけでなく胴・腕・机・素材を縦に追加。
- フレーム・数字・空タブ・吹き出し・焼き込み文字を作らず、枠と番号をHTML/CSSに統一。
- 冒頭人物は従来のflow-c-clean.webpをそのまま使用。

## 実装

flow-c.htmlの各カードではSVG viewBoxを724×542.75にし、spriteの該当段だけを表示。preserveAspectRatioはxMidYMid slice。縦横比を維持したまま、カード高さ全体に漫画を表示する。画像や顔をCSSで縦伸ばししない。

共通CSSは本文16px以上、見出し19px以上。奇数は文章を左、偶数は右に固定。要点は採用案と同程度に短く整理。既存の詳しい19段落は末尾の詳細欄に同順で保持。全てoverflow:clipで、内部スクロールを作らない。

## 手順と検品

親のDesignNOW LP手順確認後、既存LP原稿をDesignNOW checkしPASS（8ブロック、10,126字）。元Cおよび文字なし画像をview_imageで確認。built-in image_genで前半・後半を独立生成し目視した。4場面の順、左右、人物と行動、空番号タブが無いことを確認。PillowはPNGから同じ寸法WebPへの変換のみ。作品集保存なし。360px/390px/PCの実表示は統合側で確認する。

## 元生成ファイル

- /Users/naokiikeda/.codex/generated_images/01a140ed-1e84-7c00-98ba-e0a770b904df/exec-e1e58c03-10e0-4625-a14a-e156b5f03403.png
- /Users/naokiikeda/.codex/generated_images/01a140ed-1e84-7c00-98ba-e0a770b904df/exec-82bcab94-9205-4e0a-84f3-500b5390d19b.png

## Prompt 01–04

Use case: precise-object-edit / layout outpainting. Use the attached approved comic as the exact character, illustration style and action reference. Create a TEXTLESS web background sprite sheet for FOUR consecutive production-process cards. Tall aspect ratio 1:3, target 1024x3072. Four equal horizontal panels stacked vertically edge-to-edge, each occupies EXACTLY 25% of total height and full width. NO title/header/footer, NO frames, NO gold borders, NO numbers, NO dark number tabs or shields, NO typography, NO speech bubbles, NO logos, NO labels. All of that will be HTML.
Critical: expand each approved SHORT scene VERTICALLY into a TALLER scene. Do not put a small horizontal image strip floating within empty space. The art side must be fully filled from top to bottom with the salon scene and people/desk, while the other side is clean blank ivory #fffdf5 for live body text. Each scene has about50% art width and50% ivory width, smoothly blended across only a narrow middle transition. Preserve the warm golden salon lighting, detailed plants and fittings. OUTPAINT downward with natural torsos, arms, salon desk and work materials rather than stretching faces or losing heads. Characters have normal realistic manga proportions.
Recurring exact identities: Saito a handsome young adult Japanese man, black wavy side parted hair, navy jacket, light open collar shirt. Mari is an adult blonde long wavy side-parted hair woman, amber eyes, black blazer, white V-neck top, pearl earrings. Same faces as reference. Preserve the approved expression and interaction per scene. NO extra people.
Panel boundaries at25%,50%,75%, but no gutters or lines; artwork may meet adjacent ivory but each row independent. The pale blank text half must remain truly blank throughout full row height. Do not insert a central white text box on top of the art. Do not make a montage or 2x2 grid.
This sheet contains source approved stages01–04, from TOP TO BOTTOM:
ROW1: left50% completely blank ivory, right50% tall salon illustration: Mari holding her smartphone, Saito beside/behind her pointing at it with a smile, like original first card. Show both from head through torso and desk; salon fills full height on right.
ROW2: left50% tall salon illustration, right50% blank ivory. Saito at left foreground in profile explaining to Mari, shop/material reference photos on screen in background, like original second card. Expand below with desk/photo folder.
ROW3: left50% blank ivory, right50% tall salon illustration. Saito presenting a laptop/screen with a beautiful salon landing-page visual mockup to pleasantly surprised Mari, like original third card. Preserve laptop and two figures; extend desktop below. Screen no readable words.
ROW4: left50% tall salon illustration, right50% blank ivory. Saito and Mari shaking hands at salon desk, smiling, like original fourth card. Extend bodies and desk to bottom without stretching.

## Prompt 05–08

Use case: precise-object-edit / layout outpainting. Use the attached approved comic as the exact character, illustration style and action reference. Create a TEXTLESS web background sprite sheet for FOUR consecutive production-process cards. Tall aspect ratio 1:3, target 1024x3072. Four equal horizontal panels stacked vertically edge-to-edge, each occupies EXACTLY 25% of total height and full width. NO title/header/footer, NO frames, NO gold borders, NO numbers, NO dark number tabs or shields, NO typography, NO speech bubbles, NO logos, NO labels. All of that will be HTML.
Critical: expand each approved SHORT scene VERTICALLY into a TALLER scene. Do not put a small horizontal image strip floating within empty space. The art side must be fully filled from top to bottom with the salon scene and people/desk, while the other side is clean blank ivory #fffdf5 for live body text. Each scene has about50% art width and50% ivory width, smoothly blended across only a narrow middle transition. Preserve the warm golden salon lighting, detailed plants and fittings. OUTPAINT downward with natural torsos, arms, salon desk and work materials rather than stretching faces or losing heads. Characters have normal realistic manga proportions.
Recurring exact identities: Saito a handsome young adult Japanese man, black wavy side parted hair, navy jacket, light open collar shirt. Mari is an adult blonde long wavy side-parted hair woman, amber eyes, black blazer, white V-neck top, pearl earrings. Same faces as reference. Preserve the approved expression and interaction per scene. NO extra people.
Panel boundaries at25%,50%,75%, but no gutters or lines; artwork may meet adjacent ivory but each row independent. The pale blank text half must remain truly blank throughout full row height. Do not insert a central white text box on top of the art. Do not make a montage or 2x2 grid.
This sheet contains source approved stages05–08, from TOP TO BOTTOM:
ROW1: left50% completely blank ivory, right50% tall salon illustration. Saito thoughtful holding a paper, Mari looking at a laptop alongside him, planning content, like original fifth card. Expand desk and papers below, alltextless.
ROW2: left50% tall salon illustration, right50% blank ivory. Mari at left and Saito at right facing a salon LP design shown on a large screen, discussing it, like original sixth card. Extend desk/lower torsos to fillfull height.
ROW3: left50% blank ivory, right50% tall salon illustration. Saito and Mari reviewing AI/booking setup with calendar board and a small friendly blue round robot, like original seventh card. Tall scene from faces down to laptop and desk, no logos or words.
ROW4: left50% tall salon illustration, right50% blank ivory. Both smiling in delight at finished laptop, Mari clasped hands/celebrating and Saito leaning beside her, like original lastcard. Extendgolden salon and desk to fillheight, avoid tiny horizontal strip.



## 2026-10-16 文字安全域の修正版

360/390px QAで本文が人物に重なったため、同じ場面を維持しながら人物を左右それぞれの列内へ組み直した。2人の顔を残し、各コマ全高にサロン・机を描き足している。数字タブ・枠・文字は含まない。奇数段は左側、偶数段は右側をクリーム地の本文領域として確保。厳密な55%固定ではなく、目視上は約半幅が空白になっているため、最終重なりはブラウザQAで確認する。

- panels-01-04.webp: 724×2172。元PNG exec-261ee18d-63d2-469a-a705-43ca2baca053.png
- panels-05-08.webp: 724×2172。元PNG exec-aa739978-ec1c-43a5-9d9a-9760943a083a.png
- 元PNG共通場所: /Users/naokiikeda/.codex/generated_images/01a140ed-1e84-7c00-98ba-e0a770b904df/
- 表示は各段543px、SVGのimage height2172、y=0/-543/-1086/-1629。
- 旧CSSの奇数12%/偶数-14%移動は削除し、2人の顔が切れないことを確認する。
- このパスでは画像と本メモのみ変更。HTML/CSSは親エージェントが統合する。
