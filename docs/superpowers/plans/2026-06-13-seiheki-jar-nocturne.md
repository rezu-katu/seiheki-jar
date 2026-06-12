# 性癖の瓶 Nocturne Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 静的アプリを「夜の標本棚」デザインにし、4列瓶、水のような液体表現、両方選択時の左右別レベル、縦長生成画像反映、公開準備まで完成させる。

**Architecture:** 既存の `site/index.html`、`site/style.css`、`site/main.js` を維持する。状態管理と瓶描画ヘルパーを `main.js` 内で整理し、DOM SVG と Canvas の見え方を揃える。テストは Node の軽量スクリプトで静的仕様を検査する。

**Tech Stack:** HTML / CSS / Vanilla JavaScript / Canvas API / Node.js built-in modules

---

## File Structure

- Modify: `site/index.html`
  - ボトムシートの強さUIを単一行から用途別コンテナに変更する。
  - 文言とOGPを公開版デザインに合わせる。
- Modify: `site/style.css`
  - Nocturneテーマ、4列瓶グリッド、囲いなしセル、目立つラベル、暗色ボトムシートを実装する。
- Modify: `site/main.js`
  - `jarStates` を `doLevel` / `recvLevel` に拡張する。
  - 液体SVG描画、Canvas液体描画、ボトムシートの用途別レベル操作を実装する。
- Create: `tests/static-contract.test.js`
  - ファイル内容ベースで公開前に落ちやすい仕様を検査する。
- Create: `package.json`
  - `npm test` で静的契約テストを実行する。

## Tasks

### Task 1: 静的契約テストを追加

**Files:**
- Create: `package.json`
- Create: `tests/static-contract.test.js`

- [ ] **Step 1: Write the failing test**

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const html = read("site/index.html");
const css = read("site/style.css");
const js = read("site/main.js");

assert.match(js, /doLevel/);
assert.match(js, /recvLevel/);
assert.match(js, /drawLiquidPath/);
assert.match(js, /buildJarSVG/);
assert.match(js, /drawJarCanvas/);
assert.match(html, /id="do-level-panel"/);
assert.match(html, /id="recv-level-panel"/);
assert.match(css, /grid-template-columns:\s*repeat\(4,\s*1fr\)/);
assert.match(css, /--col-bg:\s*#0f0c10/i);
assert.doesNotMatch(js, /state\.level/);

console.log("static contract ok");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: fails because `package.json` and new state fields do not exist yet.

- [ ] **Step 3: Add minimal package script**

```json
{
  "scripts": {
    "test": "node tests/static-contract.test.js"
  }
}
```

- [ ] **Step 4: Keep the test failing until implementation**

Run: `npm test`

Expected: fails on missing `doLevel` / `recvLevel` / panel ids.

### Task 2: HTMLボトムシート構造を更新

**Files:**
- Modify: `site/index.html`

- [ ] **Step 1: Replace level buttons with two named panels**

Use this structure after the type buttons:

```html
  <div class="level-panel" id="do-level-panel" data-level-kind="do">
    <div class="sheet-section-label level-title-do">したい強さ</div>
    <div class="level-buttons" role="group" aria-label="したい強さを選ぶ">
      <button class="btn-level" data-level-kind="do" data-level="1" type="button">1</button>
      <button class="btn-level" data-level-kind="do" data-level="2" type="button">2</button>
      <button class="btn-level" data-level-kind="do" data-level="3" type="button">3</button>
      <button class="btn-level" data-level-kind="do" data-level="4" type="button">4</button>
      <button class="btn-level" data-level-kind="do" data-level="5" type="button">5</button>
    </div>
  </div>

  <div class="level-panel" id="recv-level-panel" data-level-kind="recv">
    <div class="sheet-section-label level-title-recv">されたい強さ</div>
    <div class="level-buttons" role="group" aria-label="されたい強さを選ぶ">
      <button class="btn-level" data-level-kind="recv" data-level="1" type="button">1</button>
      <button class="btn-level" data-level-kind="recv" data-level="2" type="button">2</button>
      <button class="btn-level" data-level-kind="recv" data-level="3" type="button">3</button>
      <button class="btn-level" data-level-kind="recv" data-level="4" type="button">4</button>
      <button class="btn-level" data-level-kind="recv" data-level="5" type="button">5</button>
    </div>
  </div>
```

- [ ] **Step 2: Run test**

Run: `npm test`

Expected: still fails because JS/CSS are not updated.

### Task 3: Nocturne CSSを実装

**Files:**
- Modify: `site/style.css`

- [ ] **Step 1: Update theme variables**

Set dark background, gold accent, light glass-friendly ink, and panel colors.

- [ ] **Step 2: Update jar grid**

Use `grid-template-columns: repeat(4, 1fr)`, remove visible square borders, and make labels larger.

- [ ] **Step 3: Update bottom sheet**

Make it dark, show `.level-panel.visible`, and color active do/recv level buttons separately.

- [ ] **Step 4: Run test**

Run: `npm test`

Expected: still fails only on JS state/drawing assertions.

### Task 4: State and SVG liquid drawing

**Files:**
- Modify: `site/main.js`

- [ ] **Step 1: Change jar state shape**

Use:

```js
const jarStates = JAR_LABELS.map(() => ({ type: null, doLevel: 3, recvLevel: 3 }));
```

- [ ] **Step 2: Add level helpers**

Add helpers for level-to-waterline, liquid wave path, and SVG node creation.

- [ ] **Step 3: Update `buildJarSVG`**

Draw glass outline, clipped liquid wave, waterline, bubbles, shine, optional center divider, and NG cross.

- [ ] **Step 4: Update sheet events**

Type buttons choose `type`. Level buttons update `doLevel` or `recvLevel`. Panels show based on type.

- [ ] **Step 5: Run test**

Run: `npm test`

Expected: passes static contract.

### Task 5: Canvas生成画像をNocturne化

**Files:**
- Modify: `site/main.js`

- [ ] **Step 1: Update canvas colors and background**

Use dark background and gold/light labels.

- [ ] **Step 2: Update `drawJarCanvas`**

Mirror the SVG liquid logic: wave waterline, bubbles, shine, both-side split.

- [ ] **Step 3: Run local smoke test**

Run a static server and open `site/index.html`; select a few bottles, generate an image, confirm preview is nonblank and shows split water levels.

### Task 6: Publish preparation

**Files:**
- Modify: `site/index.html`
- Modify: `site/main.js`
- Modify: `README.md`

- [ ] **Step 1: Decide public host**

Use GitHub Pages if a remote exists and Pages can serve the static site; otherwise use the repo's documented Netlify Drop flow.

- [ ] **Step 2: Replace public URLs**

Replace `https://REPLACE-AFTER-DEPLOY.netlify.app/` in `site/index.html` and `site/main.js`.

- [ ] **Step 3: Verify**

Run: `npm test`

Then verify the public URL returns HTTP 200 and the app loads.
