# TODO

リポジトリ全体の TODO 一覧。各項目には識別タグ（例 `clamp-generator-hidden`）を割り当て、
対応するコメントがファイル内に同タグで埋め込まれている。コードを grep すれば該当箇所を辿れる。

---

## `clamp-generator-hidden` — clamp-generator LP を非公開化中

**ステータス**: 非公開（UI改修中）  
**配置**: `clamp-generator/index.html` はリポジトリに残しているが、検索エンジンとポートフォリオからは外している  
**発生コミット**: `draft/clamp-generator-ui` ブランチをクローズしたコミット

### 何をした
- ルート `index.html` の WORKS カードをコメントアウト（`TODO[clamp-generator-hidden]` で囲み）
- ルート `sitemap.xml` の `<url>` をコメントアウト（同タグ）
- ルート `README.md` の LP一覧表でステータスを「**非公開（UI改修中）**」に変更
- `clamp-generator/index.html` の `<head>` 先頭に `<meta name="robots" content="noindex,nofollow">` を追加し、巨大な TODO コメントを併記

### なぜ
UI改修が作業途中で、完成までポートフォリオサイトに見せたくない／検索エンジンに拾われたくないため。
ただしファイル自体は履歴から消したくないので、リポジトリには残しつつ4箇所で「非公開」を担保している。

### 残作業（UI改修側）
- clamp-generator UI改修の続き（プレイグラウンド拡充など）
- 完成判定の基準を決める

### 公開復活の手順（完成したらこれを実行）
1. `clamp-generator/index.html` 先頭の `<meta name="robots" content="noindex,nofollow">` を削除し、関連コメントも整理
2. ルート `index.html` の `<!-- TODO[clamp-generator-hidden] ... -->` で囲まれた WORKS カードのコメントを解除
3. ルート `sitemap.xml` の `<!-- TODO[clamp-generator-hidden] ... -->` で囲まれた `<url>` ブロックのコメントを解除
4. ルート `README.md` の clamp-generator 行のステータスを **公開中 — https://nakaicode.com/clamp-generator/** に戻す
5. この `TODO.md` から本セクションを削除

### grep ヒント
```sh
grep -rn 'TODO\[clamp-generator-hidden\]' .
```

---

## `voiceon-hidden` — VoiceOn LP を一時的に非公開化中

**ステータス**: 非公開  
**配置**: `voiceon/` はリポジトリに残しているが、検索エンジンとポートフォリオからは外している  
**発生コミット**: pastimage デプロイ後の運用変更

### 何をした
- ルート `index.html` の WORKS カードをコメントアウト（`TODO[voiceon-hidden]` で囲み）
- ルート `sitemap.xml` の `<url>` をコメントアウト（同タグ）
- ルート `README.md` の LP一覧表でステータスを「**非公開**」に変更
- `voiceon/index.html` の `<head>` 先頭に `<meta name="robots" content="noindex,nofollow">` を追加し、TODO コメントを併記

### なぜ
一時的にポートフォリオから外したいため。ファイル自体は履歴から消したくないので、
リポジトリには残しつつ4箇所で「非公開」を担保している（clamp-generator と同じパターン）。

### 公開復活の手順
1. `voiceon/index.html` 先頭の `<meta name="robots" content="noindex,nofollow">` を削除し、関連コメントも整理
2. ルート `index.html` の `<!-- TODO[voiceon-hidden] ... -->` で囲まれた WORKS カードのコメントを解除
3. ルート `sitemap.xml` の `<!-- TODO[voiceon-hidden] ... -->` で囲まれた `<url>` ブロックのコメントを解除
4. ルート `README.md` の VoiceOn 行のステータスを **公開中 — https://nakaicode.com/voiceon/** に戻す
5. この `TODO.md` から本セクションを削除

### grep ヒント
```sh
grep -rn 'TODO\[voiceon-hidden\]' .
```

---
