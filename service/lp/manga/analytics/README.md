# 漫画LP：CV計測の実装範囲と接続手順

更新日：2026-10-15。対象は `/service/lp/manga/` のGitHubテストサイトのみ。

## 現在できていること

- ページ閲覧、各章への到達、実際の赤い相談CTAのクリックを `window.dataLayer` に出力する。
- 追従中／最下部に収まったCTAを区別する。同じボタンなので重複設置はしない。
- LP実例・LINE会話デモ内のボタンは対象外。クリックを相談完了として扱わない。
- ページの二重初期化、同じ章への再スクロール、1.5秒以内の連打を重複計上しない。
- セッションストレージが使えないブラウザーでも動く。氏名、メール、電話、LINE ID、フォーム入力、会話内容、URLのクエリーやハッシュは取得・送信しない。
- 実相談・有効商談・受注のサーバー用payload生成部と、重複排除用outboxのスキーマ例を用意した。

**GA4/GTM ID、正式LINE URL、フォーム/CRMの接続先は未確定。外部への送信はOFF。dataLayerの内容はブラウザー内だけにあり、集計サーバーへ保存されていない。過去分を後から復元する機能もない。相談完了・有効商談・受注の実測はまだ開始していない。**

既存仮リンク `https://zero-s.jp/contact/` は変更・装飾しない。現在のZERO本番フォームやCRMには何も追加していない。

## ページへの組み込み

head内に順序を保って追加する。

```html
<script src="conversion-config.js?v=20261015-cv1" defer></script>
<script src="conversion-tracking.js?v=20261015-cv1" defer></script>
```

実際の赤いリンク1個だけに属性を付ける。スマホ内のデモには付けない。

```html
<a class="manga-cta__link" data-cv-cta="free_rough" href="https://zero-s.jp/contact/">
```

## イベント定義

| イベント | 条件 | 意味・重複の扱い |
|---|---|---|
| `manga_page_view` | 初期化完了 | 1ドキュメントにつき1回。再読込は新しい閲覧 |
| `manga_section_view` | 見出し/シーンが50%以上、連続1秒見えている | 各章1ドキュメント1回。非表示タブでの時間は除外 |
| `manga_cta_click` | 赤い相談CTAへの実ユーザー操作 | 問い合わせ意図。CVではない。同一CTA1.5秒以内は1回 |
| `generate_lead` | 相談内容をサーバーで受理・保存した事実 | 未接続。送信完了画面を開いただけでは発火させない |
| `qualify_lead` | CRMで「有効商談」に確定 | 未接続。担当者の定義・入力を根拠にする |
| `close_convert_lead` | CRMで受注確定 | 未接続。見積・検討中を受注にしない |

`section_id` は hero / worries / solution / lp_example / multilingual_lp / line_automation / line_demo / google_ads / plans / production_flow / faq / about_zero / free_rough。

イベントには `page_id=bangkok_manga`, `environment=test`, `offer_id=lp_outline_main_visual_rough` を固定で付ける。`cta_position` は floating / final / inline。正式LINE URLに切り替えた際は `line.me` / `lin.ee` の宛先を `destination_type=line` として扱う。

`lp_visit_id` はこのタブの30分単位の匿名ID、`page_view_id` は閲覧単位、`event_id` は発火単位。GA4のユーザーID/セッションIDではない。これらの高カーディナリティ値をGA4カスタムディメンションとして登録しない。

## 収集先が決まったら

### GA4をこのページから直接読み込む場合

1. 漫画版テスト用の正しい測定IDを確認する。
2. 既存タグ/CMPの担当者と送信条件を合わせる。既存GTM/gtagと二重導入しない。
3. `conversion-config.js` の `transport` を `ga4`、`measurementId` を確認済みの `G-...` に変更する。
4. このアダプターは初期の自動page_viewを止め、上の3イベントを1つの送信先へ送る。標準page_viewとの合計を母数に混ぜない。
5. テストクリックをDebugView/ネットワークで確認する。スクリプト読込成功だけを受信成功と扱わない。

既存GTMまたはgtag読込を検出すると、この直接送信アダプターは `blocked_existing_tag_owner` で止まる。意図せず2つの経路から送らないため。

### GTMで管理する場合

直接送信を `transport: 'none'` のままにし、承認済みのGTMを一つだけ導入する。上記3つのカスタムイベントトリガーを作り、`event_source=bangkok_manga` で限定する。Data Layer変数から page_id / environment / section_id / cta_id / cta_position / destination_type / offer_id を渡す。汎用リンククリックのトリガーと、この専用トリガーを同時に同じイベントへ送らない。

**CTAクリックやデモ操作をキーイベント（相談完了CV）に登録しない。** 外部LINEを開いただけ・友だち追加だけ・ありがとうURL/ハッシュを開いただけで `generate_lead` を生成しない。

## 相談完了→有効商談→受注の接続

これらの事実はこの静的LPだけでは確認できない。接続先決定後、次の順に実装する。

1. フォームならサーバーで受理・保存成功を確認する。LINEなら署名検証済みWebhookと相談受付ルールに基づく。CRM更新は認証済みWebhook/APIを使う。
2. ランダムな案件キーを作り、相談・商談・受注を同じ案件として管理する。顧客の連絡先・会話はCRM側だけに保持する。
3. LPのGAクライアントとの結び付けを、承認済みクロスドメイン設定またはサーバー署名付き引き継ぎで確立する。今の匿名 `lp_visit_id` とGA client_idを同一視しない。LINEのユーザーIDをGAへ直接送らない。
4. `server/lead-event-payload.cjs` を**サーバー側だけ**で呼ぶ。入力はサーバーが確認した案件状態・分析許可・GA client_id。ブラウザーから送られた stage や analyticsAllowed の値をそのまま信頼しない。
5. 返された `idempotencyKey` をoutboxのUNIQUEキーにして、CRM状態更新と同じトランザクションで登録する。段階ごとに1回。再送Webhookは再登録しない。GAへ `event_id` を付けるだけでは重複排除を保証しない。
6. 確認済みの測定IDとサーバーの秘密管理に置いたAPI secretを使い、Measurement Protocolの検証エンドポイントで確認後に送信する。**API secretはこの公開リポジトリ/HTML/ブラウザーへ入れない。**
7. 送信結果が不明なタイムアウトは `uncertain` として照合する。無条件リトライで二重CVにしない。検証エンドポイントの応答は本番レポートへの記録を意味しない。

サーバー補助コードは送信しない・DBを作らない・フォーム/LINE/CRMを接続しない。72時間超の古いイベントを現在時刻へ書き換えて送らない。購入金額/推定リード価値は実際に確認できる場合だけ渡し、仮の7万THBなどを全相談に付けない。

## レポート設計

| 指標 | 算出・確認 |
|---|---|
| 章の到達 | ページ閲覧者のうち各 `section_id` が記録された人数 |
| 相談CTAへの反応 | 閲覧者のうち `manga_cta_click` がある人数。クリック連打のイベント総数でCVRを作らない |
| 相談完了率 | 接続済みの対象流入のうち、実相談が受理された割合 |
| 有効商談率 | 受付済み案件のうち、定義を満たした有効商談の割合 |
| 受注率・獲得単価 | 有効商談/受付済み案件からの受注、対象広告費÷実案件数 |

広告ごとの流入との結び付け、Google広告のCVインポート、レポートの自動作成は未接続。IDとフォーム/LINE/CRMの運用が確定してから、テスト案件を一度ずつ各段階へ進めて実件数と照合する。

## 検証

```sh
node --test analytics/tests/*.test.cjs
```

10テスト：二重初期化、CTA二重発火、後続の有効操作、デモ除外、合成クリック除外、URL内の個人情報非採取、1秒の閲覧条件、非表示タブ、ストレージ拒否、タグ二重所有の防止、GA設定、3段階のサーバーpayloadと不正入力拒否。

ブラウザーの読み取り確認：

```js
window.MangaConversion.status()
window.dataLayer.filter(item => item.event_source === 'bangkok_manga')
```

本番の相談を送ってテストしない。相談完了以降はテスト案件/テストプロパティで確認する。

## Google公式仕様

実リードの段階にはGoogleの推奨イベント名を用いる。[GA4 recommended events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)

サーバー送信は認証情報とイベントの条件を確認して設定する。[Measurement Protocol reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference)

送信前のpayload検証と実際の記録確認を分ける。[Validate events](https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events)
