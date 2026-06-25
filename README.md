# product-pages

自社プロダクトの紹介 LP を一括管理するモノレポ。

## 構成

- 1 フォルダ = 1 プロダクトの LP（例: `homeride/`）
- `shared/` — 全 LP 共通のスタイル・アセット
- ビルド工程なし。素の HTML/CSS/JS のみ（push したら即公開できる状態を保つ）

## LP 一覧

| コンテンツ | パス | 状態 |
|---|---|---|
| ポートフォリオ（トップページ） | `/`（ルート直下） | 公開中 — https://nakaishota.github.io/product-pages/ |
| CSS clamp() ジェネレーター（Web ツール・SEO 対応） | `clamp-generator/` | **非公開（UI改修中）** — ファイルは残しているがポートフォリオ未掲載 / sitemap除外 / noindex。詳細: `TODO.md` の `clamp-generator-hidden` 項目 |
| HomeRide（乗換ナビ iOS アプリ） | `homeride/` | 公開中 — https://nakaishota.github.io/product-pages/homeride/ |
| 尾道レトロキャンペーン（架空・サンプル LP） | `onomichi/` | 移植済み — https://nakaishota.github.io/product-pages/onomichi/ |
| OneTimer（ロック画面ワンタップタイマー iOS アプリ） | `onetimer/` | 公開中 — https://nakaishota.github.io/product-pages/onetimer/ |
| Shiori（思考の再開メモ macOS/iOS アプリ） | `shiori/` | 作業中（未公開・draft） |
| 管理コスト診断（Web 診断アプリ・別リポジトリ） | WORKS から外部リンク（`kanricost` リポジトリ） | 公開中 — https://nakaishota.github.io/kanricost/ |
