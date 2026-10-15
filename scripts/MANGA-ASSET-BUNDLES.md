# 漫画LP CSS / JSバンドル

対象は`service/lp/manga/`のみ。既存の編集用CSS・JSを残し、esbuild 0.28.2で配信用ファイルを生成する。

## ビルド

通常の必須コマンドに組み込み済み：

```sh
node scripts/build-lp-assets.cjs
```

漫画版のみの再生成：

```sh
node scripts/build-manga-assets.cjs
```

新たなCSS・JS追加や順序変更時は`manga-assets.config.json`も更新する。ビルドはindexのソース参照とバンドル参照のどちらにも対応するが、マニフェストと順序が食い違う場合は明示的に失敗する。生成した4ファイルを直接編集しない。

## indexへの差し替え位置

順序を変えず、次の順で残す。`?v=`はreportのrevision、またはデプロイ時の版へ合わせる。

```html
<!-- Early inline motion fallback: existing code unchanged. -->
<link rel="stylesheet" href="manga-base.bundle.css?v=REVISION">
<link rel="preconnect" href="https://morisawafonts.net" crossorigin>
<link rel="stylesheet" href="https://morisawafonts.net/c/01M4BM2NTN3DGZBTPFB0NSJDMZ/mf.css">
<link rel="stylesheet" href="manga-components.bundle.css?v=REVISION">
<script src="manga-page.bundle.js?v=REVISION" defer></script>
<style>
  /* Existing base inline style remains exactly here, unchanged. */
</style>
<link rel="stylesheet" href="manga-page.bundle.css?v=REVISION">
```

- `manga-base.bundle.css`：元の`lp-example.css`→`aidma-b.css`。
- Morisawaをその直後に残す。フォント配信URLやフォント指定は変更しない。
- `manga-components.bundle.css`：元の`manga-cta.css`→`aidma-ticket.css`→`aidma-scene.css`。
- 元の基礎inline styleを残す。
- `manga-page.bundle.css`：元の`manga-interactions.css`から`campaign-selected.css`まで、マニフェスト順。
- JSは元の7ファイルすべてを元の順序でまとめたclassic defer script。元の個別7参照は外す。早期inline fallbackはそのまま。

## 初回計測（2026-10-16）

| 項目 | ソース参照 | バンドル参照 |
| --- | ---: | ---: |
| ローカルCSSリクエスト | 24 | 3 |
| ローカルJSリクエスト | 7 | 1 |
| CSS bytes | 130,731 | 114,985 |
| JS bytes | 44,730 | 29,622 |
| 合計bytes | 175,461 | 144,607 |
| 個別gzip合算の推定bytes | 55,171 | 36,226 |

ローカル31リクエスト→4。非圧縮合計約17.6%削減、gzip推定約34.3%削減。Morisawa、inline style、早期fallbackは比較対象外で維持。gzipはlevel 9の計算値で、GitHub Pagesで実測した転送量ではない。

並行してJSやCSSが更新されるため、公開前に必ず再ビルドする。最新数値は`manga-bundle-report.json`。

## 保持する挙動と確認

- 3つに分ける理由はMorisawaとinline styleのカスケード境界をそのまま維持するため。
- 出力はindexと同じディレクトリ。相対画像URLとquery/hashを保持。将来サブディレクトリのCSSを入れた場合は相対URLをrebasingする。
- CSSを連結後にminify。順序、media query、cqw、選択済みスタイルを保持。ソースの未使用判定やルール削除は行わない。
- JSは各IIFEの間にセミコロンを挟み、元の実行順でminify。`conversion-config.js`はtrackingより先。
- ビルド時にCSS/外部フォント/inline styleの正確な順序と、classic defer JSの順序を検査。
- 初回：生成JSのnode構文検査、CSSのローカル画像URL集合と存在確認、cqw保持を確認。
- 統合後は360px / 390px / PCで、CTA追従・LP内スクロール・LINEデモ・見出し枠・吹き出し表示を確認する。
