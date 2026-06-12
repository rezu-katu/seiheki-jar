# seiheki-jar — レズビアン向け性癖の瓶ジェネレーター

制作：レズセがしたい女性の応援垢（[@rezu_katu](https://x.com/rezu_katu)）

## ディレクトリ構成

```
seiheki-jar/
├── README.md          ← このファイル
└── site/
    ├── index.html     ← メインページ（Netlify Drop でそのままドロップ）
    ├── style.css      ← スタイル
    └── main.js        ← ロジック・Canvas画像生成
```

公開フォルダは `site/` のみです。

---

## Netlify Drop でのデプロイ手順

1. ブラウザで [https://app.netlify.com/drop](https://app.netlify.com/drop) を開く
2. `site/` フォルダをそのままドラッグ＆ドロップする
3. デプロイが完了すると `xxxxx.netlify.app` 形式の URL が発行される

---

## デプロイ後の本番URL書き換え手順

デプロイ後、`main.js` の冒頭の `SITE_URL` を実際の URL に更新してから **再ドロップ** する。

1. `site/main.js` を開く
2. 1行目の定数を書き換える:
   ```js
   // 変更前
   const SITE_URL = "https://REPLACE-AFTER-DEPLOY.netlify.app/";
   
   // 変更後（実際に発行されたURLに置き換える）
   const SITE_URL = "https://your-site-name.netlify.app/";
   ```
3. `site/` フォルダを再度 Netlify Drop にドラッグ＆ドロップする
4. 同じサイト URL でアップデートが反映される

`SITE_URL` はページフッターの表示と X 投稿テキストに使われます。

---

## 技術仕様

- 純粋な HTML / CSS / JavaScript（フレームワーク・ビルド不要）
- Google Fonts「Zen Maru Gothic」のみ外部依存
- モバイルファースト（基準幅 390px、コンテナ max-width 480px）
- Canvas API で 1080px 幅の画像を生成・PNG でエクスポート
- Web Share API 対応端末ではシステム共有シートから X へ画像付き投稿可能
