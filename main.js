// ===== 設定定数 =====
const SITE_URL   = "https://rezu-katu.github.io/seiheki-jar/";
const CREDIT     = "制作：レズセ相性ナビ（@rezu_katu）";
const CREDIT_X_URL = "https://x.com/rezu_katu";
const HASHTAG    = "#性癖の瓶 #レズセ性癖の瓶";

// Canvas描画用カラー定数（CSS変数と同期）
const COL_DO   = "#4A90D9";
const COL_RECV = "#E2556B";
const COL_NG   = "#A8A4A1";
const COL_INK  = "#FFF5E8";
const COL_BG   = "#0F0C10";
const COL_BG_TOP = "#28141D";
const COL_CARD = "rgba(247,238,232,0.075)";
const COL_GOLD = "#F6D46B";
const COL_GLASS = "#E7C6A0";
const COL_MUTED = "rgba(247,238,232,0.72)";

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
// 各要素: { type: null|"do"|"recv"|"both"|"ng", doLevel: 1〜5, recvLevel: 1〜5 }
const jarStates = JAR_LABELS.map(() => ({ type: null, doLevel: 3, recvLevel: 3 }));

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

  const defs = document.createElementNS(NS, "defs");
  const clipId = "clip-body-" + Math.random().toString(36).slice(2);
  const clipPath = document.createElementNS(NS, "clipPath");
  clipPath.setAttribute("id", clipId);
  const clipPathShape = document.createElementNS(NS, "path");
  clipPathShape.setAttribute("d", jarBodyPathD());
  clipPath.appendChild(clipPathShape);
  defs.appendChild(clipPath);
  svg.appendChild(defs);

  const glassBase = svgEl("path", {
    d: jarBodyPathD(),
    fill: "rgba(255,255,255,0.035)",
    stroke: COL_GLASS,
    "stroke-width": "4",
    "stroke-linejoin": "round",
  });
  svg.appendChild(glassBase);

  if (state.type === "do" || state.type === "recv" || state.type === "both") {
    const liquidGroup = svgEl("g", { "clip-path": `url(#${clipId})` });
    if (state.type === "both") {
      appendLiquidSVG(liquidGroup, "do", state.doLevel, "left");
      appendLiquidSVG(liquidGroup, "recv", state.recvLevel, "right");
    } else {
      const level = state.type === "do" ? state.doLevel : state.recvLevel;
      appendLiquidSVG(liquidGroup, state.type, level, "full");
    }
    svg.appendChild(liquidGroup);
  }

  if (state.type === "both") {
    svg.appendChild(svgEl("line", {
      x1: "50", y1: "31", x2: "50", y2: "109",
      stroke: "rgba(247,238,232,0.28)",
      "stroke-width": "2",
    }));
  }

  if (state.type === "ng") {
    svg.appendChild(svgEl("line", {
      x1: "28", y1: "42", x2: "72", y2: "96",
      stroke: COL_NG, "stroke-width": "9", "stroke-linecap": "round",
    }));
    svg.appendChild(svgEl("line", {
      x1: "72", y1: "42", x2: "28", y2: "96",
      stroke: COL_NG, "stroke-width": "9", "stroke-linecap": "round",
    }));
  }

  svg.appendChild(svgEl("rect", {
    x: "30", y: "45", width: "8", height: "35", rx: "4",
    fill: "rgba(255,255,255,0.23)",
  }));
  svg.appendChild(svgEl("path", {
    d: jarBodyPathD(),
    fill: "none",
    stroke: COL_GLASS,
    "stroke-width": "4",
    "stroke-linejoin": "round",
  }));
  svg.appendChild(svgEl("rect", {
    x: "34", y: "8", width: "32", height: "18", rx: "6",
    fill: "#151014",
    stroke: COL_GLASS,
    "stroke-width": "4",
  }));

  return svg;
}

function jarBodyPathD() {
  return "M32 20 C32 30 18 34 18 51 L18 91 C18 108 30 115 50 115 C70 115 82 108 82 91 L82 51 C82 34 68 30 68 20 Z";
}

function svgEl(name, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
  return el;
}

function levelToWaterY(level) {
  const clamped = Math.max(1, Math.min(5, Number(level) || 3));
  return 92 - ((clamped - 1) / 4) * 44;
}

function drawLiquidPath(level, side) {
  const y = levelToWaterY(level);
  const bottom = 121;
  if (side === "left") {
    return `M14 ${y} C24 ${y - 6} 38 ${y + 5} 50 ${y} L50 ${bottom} L14 ${bottom} Z`;
  }
  if (side === "right") {
    return `M50 ${y} C62 ${y - 6} 74 ${y + 5} 86 ${y - 1} L86 ${bottom} L50 ${bottom} Z`;
  }
  return `M14 ${y} C27 ${y - 6} 38 ${y + 5} 50 ${y} C64 ${y - 5} 75 ${y + 4} 86 ${y - 2} L86 ${bottom} L14 ${bottom} Z`;
}

function drawWaterLinePath(level, side) {
  const y = levelToWaterY(level);
  if (side === "left") return `M14 ${y} C24 ${y - 6} 38 ${y + 5} 50 ${y}`;
  if (side === "right") return `M50 ${y} C62 ${y - 6} 74 ${y + 5} 86 ${y - 1}`;
  return `M14 ${y} C27 ${y - 6} 38 ${y + 5} 50 ${y} C64 ${y - 5} 75 ${y + 4} 86 ${y - 2}`;
}

function appendLiquidSVG(group, kind, level, side) {
  const color = kind === "do" ? COL_DO : COL_RECV;
  const lineColor = kind === "do" ? "#9BD2FF" : "#FFACBA";
  group.appendChild(svgEl("path", { d: drawLiquidPath(level, side), fill: color }));
  group.appendChild(svgEl("path", {
    d: drawWaterLinePath(level, side),
    fill: "none",
    stroke: lineColor,
    "stroke-width": "4",
    "stroke-linecap": "round",
  }));

  if (side !== "right") {
    group.appendChild(svgEl("circle", { cx: "38", cy: "82", r: "3", fill: "rgba(255,255,255,0.25)" }));
  }
  if (side !== "left") {
    group.appendChild(svgEl("circle", { cx: "61", cy: "94", r: "2.4", fill: "rgba(255,255,255,0.22)" }));
  }
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
  updateSheetLevelButtons(state);

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
function updateSheetLevelButtons(state) {
  const showDo = state.type === "do" || state.type === "both";
  const showRecv = state.type === "recv" || state.type === "both";
  document.getElementById("do-level-panel").classList.toggle("visible", showDo);
  document.getElementById("recv-level-panel").classList.toggle("visible", showRecv);

  document.querySelectorAll(".btn-level").forEach(btn => {
    const lv = Number(btn.dataset.level);
    const kind = btn.dataset.levelKind;
    btn.className = "btn-level";
    if (kind === "do" && lv === state.doLevel) {
      btn.classList.add("active-do");
    }
    if (kind === "recv" && lv === state.recvLevel) {
      btn.classList.add("active-recv");
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
        state.doLevel = 3;
        state.recvLevel = 3;
      } else {
        state.type = t;
      }
      updateSheetTypeButtons(state.type);
      updateSheetLevelButtons(state);
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
      const kind = btn.dataset.levelKind;
      if (!state.type || state.type === "ng") {
        state.type = kind;
        updateSheetTypeButtons(state.type);
      }
      if (state.type === "do" && kind === "recv") state.type = "both";
      if (state.type === "recv" && kind === "do") state.type = "both";
      if (kind === "do") state.doLevel = lv;
      if (kind === "recv") state.recvLevel = lv;
      updateSheetTypeButtons(state.type);
      updateSheetLevelButtons(state);
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
  const PROF_BLOCK_H  = 190;
  const FOOTER_H      = 80;
  const PAD_TOP = 60;
  const PAD_BTM = 60;

  const CANVAS_H = PAD_TOP + TITLE_BLOCK_H + PROF_BLOCK_H + GRID_H + FOOTER_H + PAD_BTM;

  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  bg.addColorStop(0, COL_BG_TOP);
  bg.addColorStop(0.48, COL_BG);
  bg.addColorStop(1, "#09070A");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, CANVAS_H);
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 460);
  glow.addColorStop(0, "rgba(128,36,66,0.72)");
  glow.addColorStop(1, "rgba(128,36,66,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 520);

  let y = PAD_TOP;

  // --- タイトル ---
  ctx.fillStyle = COL_INK;
  ctx.textAlign = "center";
  ctx.font = `900 52px 'Zen Maru Gothic', sans-serif`;
  ctx.fillText("レズセ性癖の瓶", W / 2, y + 52);
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
  ctx.fillStyle = "rgba(247,238,232,0.66)";
  ctx.fillText("水位＝気持ちの強さ（1〜5）  空白は可もなく不可もなく", W / 2, y + 24);
  y += 52;

  // --- プロフィールブロック（白カード） ---
  const profCardX = MARGIN;
  const profCardW = INNER;
  const profCardH = PROF_BLOCK_H - 20;
  roundRect(ctx, profCardX, y, profCardW, profCardH, 20);
  ctx.fillStyle = "rgba(247,238,232,0.08)";
  ctx.fill();
  ctx.strokeStyle = "rgba(246,212,107,0.24)";
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
  ctx.fillStyle = "rgba(247,238,232,0.58)";
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

  const bodyPath = new Path2D(jarBodyPathD());

  ctx.fillStyle = "rgba(255,255,255,0.035)";
  ctx.fill(bodyPath);
  ctx.strokeStyle = COL_GLASS;
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.stroke(bodyPath);

  if (state.type === "do" || state.type === "recv" || state.type === "both") {
    ctx.save();
    ctx.clip(bodyPath);

    if (state.type === "both") {
      drawLiquidCanvas(ctx, "do", state.doLevel, "left");
      drawLiquidCanvas(ctx, "recv", state.recvLevel, "right");
    } else {
      const level = state.type === "do" ? state.doLevel : state.recvLevel;
      drawLiquidCanvas(ctx, state.type, level, "full");
    }
    ctx.restore();
  }

  if (state.type === "both") {
    ctx.strokeStyle = "rgba(247,238,232,0.28)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 31);
    ctx.lineTo(50, 109);
    ctx.stroke();
  }

  // 本体アウトラインとハイライト
  ctx.fillStyle = "rgba(255,255,255,0.23)";
  roundRect(ctx, 30, 45, 8, 35, 4);
  ctx.fill();
  ctx.strokeStyle = COL_INK;
  ctx.strokeStyle = COL_GLASS;
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.stroke(bodyPath);

  const lidPath = new Path2D("M34 8 L66 8 C69 8 70 11 70 14 L70 20 C70 23 68 26 65 26 L35 26 C32 26 30 23 30 20 L30 14 C30 11 31 8 34 8 Z");
  ctx.fillStyle = "#151014";
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

function drawLiquidCanvas(ctx, kind, level, side) {
  const color = kind === "do" ? COL_DO : COL_RECV;
  const lineColor = kind === "do" ? "#9BD2FF" : "#FFACBA";

  ctx.fillStyle = color;
  ctx.fill(new Path2D(drawLiquidPath(level, side)));

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke(new Path2D(drawWaterLinePath(level, side)));

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  if (side !== "right") {
    ctx.beginPath();
    ctx.arc(38, 82, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  if (side !== "left") {
    ctx.beginPath();
    ctx.arc(61, 94, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
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
  const shareText = `レズセ性癖の瓶、埋めてみた🫙\n\nみんなもここから作れるよ→ ${SITE_URL}\n\n@rezu_katu\n${HASHTAG}`;

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
