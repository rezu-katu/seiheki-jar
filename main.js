// ===== 設定定数 =====
const SITE_URL   = "https://REPLACE-AFTER-DEPLOY.netlify.app/";
const CREDIT     = "制作：レズセがしたい女性の応援垢（@rezu_katu）";
const CREDIT_X_URL = "https://x.com/rezu_katu";
const HASHTAG    = "#性癖の瓶";

// Canvas描画用カラー定数（CSS変数と同期）
const COL_DO   = "#4A90D9";
const COL_RECV = "#E2556B";
const COL_NG   = "#888888";
const COL_INK  = "#3A3A3A";
const COL_BG   = "#FFFBF5";
const COL_CARD = "#FFFFFF";

// ===== 瓶ラベル一覧（28個・4列×7行）=====
const JAR_LABELS = [
  "クンニ",     "玩具",       "キスマ",   "コスプレ",
  "パイパン",   "剛毛",       "寸止め",   "焦らし",
  "青姦",       "野外露出",   "痴漢",     "言葉攻め",
  "落書き",     "首絞め",     "目隠し",   "拘束",
  "緊縛",       "スパンキング","乳首攻め", "腹パン",
  "体外式ポルチオ","アナル",  "レイプ",   "NTR",
  "スワッピング","ハメ撮り",  "複数プレイ","飲尿",
];

// ===== 瓶の状態管理 =====
// 各要素: { type: null|"do"|"recv"|"both"|"ng", level: 1〜5 }
const jarStates = JAR_LABELS.map(() => ({ type: null, level: 3 }));

// ===== チップ選択状態 =====
// キー: data-group 属性値、値: 選択中の value の Set
const chipSelections = {};

// ===== 現在開いているボトムシートの対象index =====
let activeJarIndex = -1;

// ===== 瓶グリッドの描画 =====
function renderJarGrid() {
  const grid = document.getElementById("jar-grid");
  grid.innerHTML = "";
  JAR_LABELS.forEach((label, i) => {
    const cell = document.createElement("button");
    cell.className = "jar-cell" + (activeJarIndex === i ? " selected" : "");
    cell.setAttribute("type", "button");
    cell.setAttribute("role", "listitem");
    cell.setAttribute("aria-label", label + " 設定を開く");
    cell.dataset.index = i;

    // SVG描画
    cell.appendChild(buildJarSVG(jarStates[i]));

    // ラベル
    const lbl = document.createElement("span");
    lbl.className = "jar-label";
    lbl.textContent = label;
    cell.appendChild(lbl);

    cell.addEventListener("click", () => openSheet(i));
    grid.appendChild(cell);
  });
}

// ===== 瓶SVGを生成 =====
function buildJarSVG(state) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 100 120");
  svg.setAttribute("xmlns", NS);
  svg.setAttribute("aria-hidden", "true");

  // clipPath定義
  const defs = document.createElementNS(NS, "defs");

  // 本体パスをclipとして使う
  const clipId = "clip-body-" + Math.random().toString(36).slice(2);
  const clipPath = document.createElementNS(NS, "clipPath");
  clipPath.setAttribute("id", clipId);
  const clipPathShape = document.createElementNS(NS, "path");
  clipPathShape.setAttribute("d", "M32 24 C32 32 18 36 18 52 L18 94 C18 107 29 113 50 113 C71 113 82 107 82 94 L82 52 C82 36 68 32 68 24 Z");
  clipPath.appendChild(clipPathShape);
  defs.appendChild(clipPath);
  svg.appendChild(defs);

  // 塗りの高さ計算（y=30〜111の範囲、高さ81）
  const fillTop = 30;
  const fillBottom = 111;
  const fillHeight = fillBottom - fillTop; // 81
  const level = (state.type && state.type !== "ng") ? state.level : 0;
  const paintH = (level / 5) * fillHeight;
  const paintY = fillBottom - paintH;

  // 塗りを描く（type に応じて）
  if (state.type === "do" || state.type === "recv" || state.type === "both") {
    if (state.type === "both") {
      // 左半分：青
      const rectL = document.createElementNS(NS, "rect");
      rectL.setAttribute("x", "18");
      rectL.setAttribute("y", String(paintY));
      rectL.setAttribute("width", "32");
      rectL.setAttribute("height", String(paintH + 2));
      rectL.setAttribute("fill", COL_DO);
      rectL.setAttribute("clip-path", `url(#${clipId})`);
      svg.appendChild(rectL);
      // 右半分：赤
      const rectR = document.createElementNS(NS, "rect");
      rectR.setAttribute("x", "50");
      rectR.setAttribute("y", String(paintY));
      rectR.setAttribute("width", "32");
      rectR.setAttribute("height", String(paintH + 2));
      rectR.setAttribute("fill", COL_RECV);
      rectR.setAttribute("clip-path", `url(#${clipId})`);
      svg.appendChild(rectR);
    } else {
      const rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", "18");
      rect.setAttribute("y", String(paintY));
      rect.setAttribute("width", "64");
      rect.setAttribute("height", String(paintH + 2));
      rect.setAttribute("fill", state.type === "do" ? COL_DO : COL_RECV);
      rect.setAttribute("clip-path", `url(#${clipId})`);
      svg.appendChild(rect);
    }
  }

  // 本体アウトライン
  const body = document.createElementNS(NS, "path");
  body.setAttribute("d", "M32 24 C32 32 18 36 18 52 L18 94 C18 107 29 113 50 113 C71 113 82 107 82 94 L82 52 C82 36 68 32 68 24 Z");
  body.setAttribute("fill", "none");
  body.setAttribute("stroke", COL_INK);
  body.setAttribute("stroke-width", "4");
  body.setAttribute("stroke-linejoin", "round");
  svg.appendChild(body);

  // フタ
  const lid = document.createElementNS(NS, "path");
  lid.setAttribute("d", "M34 9 L66 9 C69 9 70 11 70 13 L70 19 L30 19 L30 13 C30 11 31 9 34 9 Z");
  lid.setAttribute("fill", COL_BG);
  lid.setAttribute("stroke", COL_INK);
  lid.setAttribute("stroke-width", "4");
  lid.setAttribute("stroke-linejoin", "round");
  svg.appendChild(lid);

  // NGの×印（左上→右下、右上→左下）
  if (state.type === "ng") {
    const xLine1 = document.createElementNS(NS, "line");
    xLine1.setAttribute("x1", "28"); xLine1.setAttribute("y1", "42");
    xLine1.setAttribute("x2", "72"); xLine1.setAttribute("y2", "86");
    xLine1.setAttribute("stroke", COL_NG);
    xLine1.setAttribute("stroke-width", "8");
    xLine1.setAttribute("stroke-linecap", "round");
    svg.appendChild(xLine1);

    const xLine2 = document.createElementNS(NS, "line");
    xLine2.setAttribute("x1", "72"); xLine2.setAttribute("y1", "42");
    xLine2.setAttribute("x2", "28"); xLine2.setAttribute("y2", "86");
    xLine2.setAttribute("stroke", COL_NG);
    xLine2.setAttribute("stroke-width", "8");
    xLine2.setAttribute("stroke-linecap", "round");
    svg.appendChild(xLine2);
  }

  return svg;
}

// ===== ボトムシートを開く =====
function openSheet(index) {
  activeJarIndex = index;
  const state = jarStates[index];

  // タイトル更新
  document.getElementById("sheet-title").textContent = JAR_LABELS[index];

  // 種別ボタン更新
  updateSheetTypeButtons(state.type);

  // 強さボタン更新
  updateSheetLevelButtons(state.level, state.type);

  // グリッドのハイライト更新
  updateGridHighlight();

  // シート表示
  const overlay = document.getElementById("sheet-overlay");
  const sheet   = document.getElementById("bottom-sheet");
  overlay.classList.add("visible");
  overlay.setAttribute("aria-hidden", "false");
  sheet.removeAttribute("hidden");
  sheet.setAttribute("aria-hidden", "false");
  document.getElementById("btn-close-sheet").focus();
}

// ===== ボトムシートを閉じる =====
function closeSheet() {
  activeJarIndex = -1;
  const overlay = document.getElementById("sheet-overlay");
  const sheet   = document.getElementById("bottom-sheet");
  overlay.classList.remove("visible");
  overlay.setAttribute("aria-hidden", "true");
  // スクリーンリーダーにシートが非表示になったことを伝える
  sheet.setAttribute("aria-hidden", "true");
  updateGridHighlight();
}

// ===== 種別ボタンの表示更新 =====
function updateSheetTypeButtons(type) {
  const map = {
    "do":    "active-do",
    "recv":  "active-recv",
    "both":  "active-both",
    "ng":    "active-ng",
    "clear": "active-clear",
  };
  document.querySelectorAll(".btn-type").forEach(btn => {
    const t = btn.dataset.type;
    btn.className = "btn-type";
    if (type === t) {
      btn.classList.add(map[t] || "");
    }
  });
}

// ===== 強さボタンの表示更新 =====
function updateSheetLevelButtons(level, type) {
  const isActive = (type && type !== "ng");
  document.querySelectorAll(".btn-level").forEach(btn => {
    const lv = Number(btn.dataset.level);
    btn.className = "btn-level";
    if (!isActive) {
      btn.classList.add("disabled");
    } else if (lv === level) {
      btn.classList.add("active");
    }
  });
}

// ===== グリッドのハイライト更新 =====
function updateGridHighlight() {
  document.querySelectorAll(".jar-cell").forEach(cell => {
    const i = Number(cell.dataset.index);
    if (i === activeJarIndex) {
      cell.classList.add("selected");
    } else {
      cell.classList.remove("selected");
    }
  });
}

// ===== チップ初期化 =====
function initChips() {
  document.querySelectorAll(".chip-list").forEach(list => {
    const group = list.dataset.group;
    const isMulti = list.dataset.multi === "true";
    chipSelections[group] = new Set();

    list.querySelectorAll(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const val = chip.dataset.value;
        if (isMulti) {
          // 複数選択
          if (chipSelections[group].has(val)) {
            chipSelections[group].delete(val);
            chip.classList.remove("active");
            chip.setAttribute("aria-pressed", "false");
          } else {
            chipSelections[group].add(val);
            chip.classList.add("active");
            chip.setAttribute("aria-pressed", "true");
          }
        } else {
          // 単一選択（再クリックで解除）
          if (chipSelections[group].has(val)) {
            chipSelections[group].clear();
            list.querySelectorAll(".chip").forEach(c => {
              c.classList.remove("active");
              c.setAttribute("aria-pressed", "false");
            });
          } else {
            chipSelections[group].clear();
            list.querySelectorAll(".chip").forEach(c => {
              c.classList.remove("active");
              c.setAttribute("aria-pressed", "false");
            });
            chipSelections[group].add(val);
            chip.classList.add("active");
            chip.setAttribute("aria-pressed", "true");
          }
        }
      });

      // キーボード対応
      chip.setAttribute("role", "button");
      chip.setAttribute("aria-pressed", "false");
    });
  });
}

// ===== ボトムシートのイベント =====
function initSheet() {
  // 閉じるボタン
  document.getElementById("btn-close-sheet").addEventListener("click", closeSheet);
  // オーバーレイクリックで閉じる
  document.getElementById("sheet-overlay").addEventListener("click", closeSheet);

  // 種別ボタン
  document.querySelectorAll(".btn-type").forEach(btn => {
    btn.addEventListener("click", () => {
      if (activeJarIndex < 0) return;
      const t = btn.dataset.type;
      const state = jarStates[activeJarIndex];
      if (t === "clear") {
        state.type = null;
        state.level = 3;
      } else {
        state.type = t;
      }
      updateSheetTypeButtons(state.type);
      updateSheetLevelButtons(state.level, state.type);
      // グリッドの瓶を再描画
      refreshJarCell(activeJarIndex);
    });
  });

  // 強さボタン
  document.querySelectorAll(".btn-level").forEach(btn => {
    btn.addEventListener("click", () => {
      if (activeJarIndex < 0) return;
      const state = jarStates[activeJarIndex];
      const lv = Number(btn.dataset.level);
      // type 未設定なら "do" にする
      if (!state.type || state.type === "ng") {
        state.type = "do";
        updateSheetTypeButtons(state.type);
      }
      state.level = lv;
      updateSheetLevelButtons(state.level, state.type);
      refreshJarCell(activeJarIndex);
    });
  });

  // Escキーで閉じる
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && activeJarIndex >= 0) closeSheet();
  });
}

// ===== 特定の瓶セルだけ再描画 =====
function refreshJarCell(index) {
  const cell = document.querySelector(`.jar-cell[data-index="${index}"]`);
  if (!cell) return;
  // SVGを入れ替え
  const oldSvg = cell.querySelector("svg");
  if (oldSvg) oldSvg.remove();
  cell.insertBefore(buildJarSVG(jarStates[index]), cell.querySelector(".jar-label"));
}

// ===== フッター描画 =====
function renderFooter() {
  const el = document.getElementById("footer-credit");
  // "@rezu_katu" 部分をリンク化
  const text = CREDIT;
  const atIdx = text.indexOf("@rezu_katu");
  if (atIdx >= 0) {
    const before = text.slice(0, atIdx);
    const after  = text.slice(atIdx + "@rezu_katu".length);
    const link = `<a href="${CREDIT_X_URL}" target="_blank" rel="noopener noreferrer">@rezu_katu</a>`;
    el.innerHTML = before + link + after + `<br><a href="${SITE_URL}" target="_blank" rel="noopener noreferrer">${SITE_URL}</a>`;
  } else {
    el.textContent = text;
  }
}

// ===== Canvas画像生成 =====
async function generateImage() {
  // フォントのロードを待つ
  await document.fonts.ready;
  try {
    await document.fonts.load("900 32px 'Zen Maru Gothic'");
    await document.fonts.load("700 24px 'Zen Maru Gothic'");
    await document.fonts.load("500 20px 'Zen Maru Gothic'");
  } catch(e) {
    // フォント読み込み失敗時はフォールバックで続行
  }

  const W = 1080;
  const MARGIN = 48;
  const INNER = W - MARGIN * 2;

  // --- プロフィール文字列の組み立て ---
  const sel = chipSelections;
  const getFirst = (group) => {
    const s = sel[group];
    if (!s || s.size === 0) return "ひみつ";
    return [...s][0];
  };
  const getAll = (group) => {
    const s = sel[group];
    if (!s || s.size === 0) return "こだわらない";
    return [...s].join("・");
  };

  const myAttr    = getFirst("attr");
  const myLook    = getFirst("look");
  const myAge     = getFirst("age");
  const myArea    = getFirst("area");
  const myPurpose = getFirst("purpose");
  const wantAttr  = getAll("want-attr");
  const wantLook  = getAll("want-look");

  // --- 高さを事前計算 ---
  // タイトルブロック: 約180px
  // プロフィールブロック: 約200px
  // 瓶グリッド: 4列×7行
  const COLS = 4;
  const ROWS = 7;
  const JAR_CELL_W = Math.floor(INNER / COLS);  // 約246
  const JAR_W  = 100;
  const JAR_H  = 120;
  const LABEL_H = 36;
  const JAR_CELL_H = JAR_H + LABEL_H + 16;
  const GRID_H = ROWS * JAR_CELL_H;

  const TITLE_BLOCK_H = 200;
  const PROF_BLOCK_H  = 260;
  const FOOTER_H      = 80;
  const PAD_TOP = 60;
  const PAD_BTM = 60;

  const CANVAS_H = PAD_TOP + TITLE_BLOCK_H + PROF_BLOCK_H + GRID_H + FOOTER_H + PAD_BTM;

  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");

  // 背景
  ctx.fillStyle = COL_BG;
  ctx.fillRect(0, 0, W, CANVAS_H);

  let y = PAD_TOP;

  // --- タイトル ---
  ctx.fillStyle = COL_INK;
  ctx.textAlign = "center";
  ctx.font = `900 52px 'Zen Maru Gothic', sans-serif`;
  ctx.fillText("レズビアン向け性癖の瓶 ver1.0", W / 2, y + 52);
  y += 80;

  // 凡例（左揃えで色付き部分を measureText で連結）
  ctx.textAlign = "left";
  ctx.font = `700 28px 'Zen Maru Gothic', sans-serif`;
  const legendY = y + 28;
  let lx = MARGIN + 48;

  ctx.fillStyle = COL_DO;
  ctx.fillText("したいこと", lx, legendY);
  lx += ctx.measureText("したいこと").width;

  ctx.fillStyle = COL_INK;
  const t1 = "は青く塗る  ／  ";
  ctx.fillText(t1, lx, legendY);
  lx += ctx.measureText(t1).width;

  ctx.fillStyle = COL_RECV;
  ctx.fillText("されたいこと", lx, legendY);
  lx += ctx.measureText("されたいこと").width;

  ctx.fillStyle = COL_INK;
  ctx.fillText("は赤く塗る", lx, legendY);
  ctx.textAlign = "center";

  y += 48;
  ctx.font = `500 24px 'Zen Maru Gothic', sans-serif`;
  ctx.fillStyle = "#777";
  ctx.fillText("塗りの高さ＝気持ちの強さ（1〜5）  空白は可もなく不可もなく", W / 2, y + 24);
  y += 52;

  // --- プロフィールブロック（白カード） ---
  const profCardX = MARGIN;
  const profCardW = INNER;
  const profCardH = PROF_BLOCK_H - 20;
  roundRect(ctx, profCardX, y, profCardW, profCardH, 20);
  ctx.fillStyle = COL_CARD;
  ctx.fill();
  ctx.strokeStyle = "#E8E8E8";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = COL_INK;
  const px = profCardX + 40;
  let py = y + 48;

  ctx.font = `900 30px 'Zen Maru Gothic', sans-serif`;
  ctx.fillText("わたし", px, py);
  ctx.font = `500 28px 'Zen Maru Gothic', sans-serif`;
  ctx.fillText(`${myAttr}  ／  ${myLook}  ／  ${myAge}  ／  ${myArea}`, px + 120, py);

  py += 50;
  ctx.font = `900 30px 'Zen Maru Gothic', sans-serif`;
  ctx.fillText("目的", px, py);
  ctx.font = `500 28px 'Zen Maru Gothic', sans-serif`;
  ctx.fillText(myPurpose, px + 120, py);

  py += 50;
  ctx.font = `900 30px 'Zen Maru Gothic', sans-serif`;
  ctx.fillText("求める相手", px, py);
  ctx.font = `500 28px 'Zen Maru Gothic', sans-serif`;
  ctx.fillText(`属性：${wantAttr}  ／  見た目：${wantLook}`, px + 200, py);

  y += PROF_BLOCK_H;

  // --- 瓶グリッド ---
  const gridStartY = y + 12;

  for (let i = 0; i < JAR_LABELS.length; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const cx = MARGIN + col * JAR_CELL_W + JAR_CELL_W / 2;
    const cellY = gridStartY + row * JAR_CELL_H;

    drawJarCanvas(ctx, jarStates[i], cx - JAR_W / 2, cellY, JAR_W, JAR_H);

    // ラベル
    ctx.textAlign = "center";
    ctx.fillStyle = COL_INK;
    const labelText = JAR_LABELS[i];
    // フォントサイズを測ってはみ出さないよう縮小
    let fontSize = 22;
    ctx.font = `700 ${fontSize}px 'Zen Maru Gothic', sans-serif`;
    while (ctx.measureText(labelText).width > JAR_CELL_W - 8 && fontSize > 13) {
      fontSize--;
      ctx.font = `700 ${fontSize}px 'Zen Maru Gothic', sans-serif`;
    }
    ctx.fillText(labelText, cx, cellY + JAR_H + 26);
  }

  y = gridStartY + ROWS * JAR_CELL_H + 20;

  // --- フッター ---
  ctx.textAlign = "center";
  ctx.font = `500 22px 'Zen Maru Gothic', sans-serif`;
  ctx.fillStyle = "#AAAAAA";
  ctx.fillText(CREDIT, W / 2, y + 28);
  ctx.fillText(SITE_URL, W / 2, y + 58);

  return canvas;
}

// ===== Canvasに瓶を描く =====
function drawJarCanvas(ctx, state, x, y, w, h) {
  // スケール: 100×120 → w×h
  const sx = w / 100;
  const sy = h / 120;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);

  // 本体パス（clipPathとして使う）
  const bodyPath = new Path2D("M32 24 C32 32 18 36 18 52 L18 94 C18 107 29 113 50 113 C71 113 82 107 82 94 L82 52 C82 36 68 32 68 24 Z");

  // 塗り
  const fillTop    = 30;
  const fillBottom = 111;
  const fillHeight = fillBottom - fillTop;
  const level = (state.type && state.type !== "ng") ? state.level : 0;
  const paintH = (level / 5) * fillHeight;
  const paintY = fillBottom - paintH;

  if (state.type === "do" || state.type === "recv" || state.type === "both") {
    ctx.save();
    ctx.clip(bodyPath);

    if (state.type === "both") {
      ctx.fillStyle = COL_DO;
      ctx.fillRect(18, paintY, 32, paintH + 2);
      ctx.fillStyle = COL_RECV;
      ctx.fillRect(50, paintY, 32, paintH + 2);
    } else {
      ctx.fillStyle = (state.type === "do") ? COL_DO : COL_RECV;
      ctx.fillRect(18, paintY, 64, paintH + 2);
    }
    ctx.restore();
  }

  // 本体アウトライン
  ctx.strokeStyle = COL_INK;
  ctx.lineWidth   = 4;
  ctx.lineJoin    = "round";
  ctx.stroke(bodyPath);

  // フタ
  const lidPath = new Path2D("M34 9 L66 9 C69 9 70 11 70 13 L70 19 L30 19 L30 13 C30 11 31 9 34 9 Z");
  ctx.fillStyle = COL_BG;
  ctx.fill(lidPath);
  ctx.stroke(lidPath);

  // NG ×
  if (state.type === "ng") {
    ctx.strokeStyle = COL_NG;
    ctx.lineWidth   = 8;
    ctx.lineCap     = "round";
    ctx.beginPath();
    ctx.moveTo(28, 42); ctx.lineTo(72, 86);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(72, 42); ctx.lineTo(28, 86);
    ctx.stroke();
  }

  ctx.restore();
}

// ===== roundRect ポリフィル =====
function roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

// ===== 生成ボタン =====
let generatedBlob = null;

async function handleGenerate() {
  const btn = document.getElementById("btn-generate");
  btn.textContent = "生成中…";
  btn.disabled = true;

  try {
    const canvas = await generateImage();
    // toBlob はコールバック形式なので Promise でラップして await する
    // （await しないと finally がコールバック完了前に走りボタンが先に戻る）
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(b => {
        if (b === null) {
          reject(new Error("toBlob が null を返しました（メモリ不足の可能性があります）"));
        } else {
          resolve(b);
        }
      }, "image/png");
    });
    generatedBlob = blob;
    const url = URL.createObjectURL(blob);
    const img = document.getElementById("preview-img");
    img.src = url;
    document.getElementById("preview-area").classList.add("visible");
    // スクロールしてプレビューを表示
    document.getElementById("preview-area").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch(e) {
    alert("画像生成中にエラーが発生しました。\n" + e.message);
  } finally {
    btn.textContent = "画像を作る";
    btn.disabled = false;
  }
}

// ===== X投稿 =====
async function handlePostX() {
  const shareText = `レズビアン向け性癖の瓶、埋めてみた🫙\n\nみんなもここから作れるよ→ ${SITE_URL}\n\n${HASHTAG}`;

  if (!generatedBlob) {
    alert("先に「画像を作る」を押してね！");
    return;
  }

  const file = new File([generatedBlob], "seiheki-bin.png", { type: "image/png" });

  // スマホWebShareAPI（ファイル共有対応）
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ text: shareText, files: [file] });
      return;
    } catch(e) {
      // キャンセル or 失敗 → フォールバック
    }
  }

  // PC等のフォールバック: 自動DL + Xインテント
  downloadBlob(generatedBlob, "seiheki-bin.png");
  const intentUrl = "https://x.com/intent/post?text=" + encodeURIComponent(shareText);
  window.open(intentUrl, "_blank", "noopener,noreferrer");
  const hint = document.getElementById("share-hint");
  hint.classList.add("visible");
}

// ===== 保存 =====
function handleSave() {
  if (!generatedBlob) {
    alert("先に「画像を作る」を押してね！");
    return;
  }
  downloadBlob(generatedBlob, "seiheki-bin.png");
}

// ===== Blob をダウンロード =====
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// ===== 初期化 =====
function init() {
  renderJarGrid();
  initChips();
  initSheet();
  renderFooter();

  document.getElementById("btn-generate").addEventListener("click", handleGenerate);
  document.getElementById("btn-x").addEventListener("click", handlePostX);
  document.getElementById("btn-save").addEventListener("click", handleSave);
}

document.addEventListener("DOMContentLoaded", init);
