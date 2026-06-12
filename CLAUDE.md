# product-pages — 運用ルール

自社プロダクトの紹介 LP を集約するモノレポ。受託案件（lp-seisaku 等)は混ぜない。

## 構成ルール

- **ルート直下の `index.html` = ポートフォリオ**（サイト全体のトップページ。各プロダクト LP への導線を持つ）
- **1 フォルダ = 1 プロダクト LP**。エントリポイントは必ず `<プロダクト名>/index.html`
- フォルダ名は小文字ケバブケース（例: `homeride`, `onetimer`）
- 共通のスタイル・アセットは `shared/` に置き、各 LP から相対パスで参照する
- **ビルド工程を導入しない**。素の HTML/CSS/JS のみ。フレームワーク・npm 依存・バンドラ禁止
- 画像は各 LP フォルダ内の `images/` に置く

## 新しい LP を追加する手順

1. `<プロダクト名>/index.html` を作成
2. README.md の LP 一覧表に行を追加
3. commit して push（GitHub Pages で自動公開）

## デプロイ

- GitHub Pages（リポジトリルートから配信）
- 公開 URL: `https://nakaishota.github.io/product-pages/<プロダクト名>/`
- push = デプロイ。プレビュー環境はないので、公開したくない作業中の LP は draft ブランチで作業する

## HomeRide LP の制約（重要）

HomeRide の LP を編集する際は、アプリ仕様との整合性を守ること:

- **カウントダウン表現禁止**（「あと N 分」等の相対時間表示はアプリに存在しない）
- **番線（ホーム番号）表示は v1.1 以降**。LP に番線表示の画面例を載せない
- **対応路線は東京メトロ・都営地下鉄など首都圏の非 JR 路線のみ**。JR・東急・京王等の対応を示唆しない
- 要件の SSoT は `/Users/nakai/.claude/plans/giggly-wandering-dusk.md`
