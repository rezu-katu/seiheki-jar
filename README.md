# seiheki-jar — レズビアン向け性癖の瓶ジェネレーター

制作：レズセ相性ナビ（[@rezu_katu](https://x.com/rezu_katu)）

## ディレクトリ構成

```
seiheki-jar/
├── README.md          ← このファイル
└── site/
    ├── index.html     ← メインページ（GitHub Pages で公開）
    ├── style.css      ← スタイル
    └── main.js        ← ロジック・Canvas画像生成
```

公開フォルダは `site/` のみです。

---

## GitHub Pages での公開

公開URL:

`https://rezu-katu.github.io/seiheki-jar/`

公開フォルダは `site/` のみです。`master` にソース一式を push し、`site/` を `gh-pages` ブランチへ subtree push して公開します。

```bash
npm test
git push origin master
git subtree push --prefix site origin gh-pages
```

---

## 本番URL

`site/main.js` の `SITE_URL` と `site/index.html` の `og:url` は、GitHub Pages の公開URLに固定しています。`SITE_URL` はページフッターの表示と X 投稿テキストに使われます。

---

## 技術仕様

- 純粋な HTML / CSS / JavaScript（フレームワーク・ビルド不要）
- Google Fonts「Zen Maru Gothic」のみ外部依存
- モバイルファースト（基準幅 390px、コンテナ max-width 480px）
- Canvas API で 1080px 幅の画像を生成・PNG でエクスポート
- Web Share API 対応端末ではシステム共有シートから X へ画像付き投稿可能
