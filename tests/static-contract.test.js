const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const html = read("site/index.html");
const css = read("site/style.css");
const js = read("site/main.js");
const countArrayItems = (name) => {
  const match = js.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`));
  assert.ok(match, `${name} should exist`);
  return [...match[1].matchAll(/"[^"]*"/g)].length;
};

assert.match(js, /doLevel/);
assert.match(js, /recvLevel/);
assert.match(js, /drawLiquidPath/);
assert.match(js, /buildJarSVG/);
assert.match(js, /drawJarCanvas/);
assert.match(html, /id="do-level-panel"/);
assert.match(html, /id="recv-level-panel"/);
assert.match(html, /id="sheet-description"/);
assert.match(html, /style\.css\?v=20260616-nyo1/);
assert.match(html, /main\.js\?v=20260616-nyo1/);
assert.match(css, /grid-template-columns:\s*repeat\(4,\s*1fr\)/);
assert.match(css, /\.sheet-description/);
assert.match(css, /--col-bg:\s*#0f0c10/i);
assert.match(js, /const JAR_DESCRIPTIONS = \[/);
assert.match(js, /説明：/);
assert.match(js, /現実の無断行為は絶対NG/);
assert.match(js, /飲ませたいは青のしたい、飲みたいは赤のされたい/);
assert.equal(countArrayItems("JAR_DESCRIPTIONS"), countArrayItems("JAR_LABELS"));
assert.equal(countArrayItems("JAR_DESCRIPTIONS"), 28);
assert.match(html, /レズセ性癖の瓶/);
assert.match(js, /レズセ性癖の瓶/);
assert.match(js, /#性癖の瓶 #レズセ性癖の瓶/);
assert.doesNotMatch(html, /レズビアン向け性癖の瓶/);
assert.doesNotMatch(js, /レズビアン向け性癖の瓶/);
assert.doesNotMatch(html, /レズビアン向け/);
assert.doesNotMatch(js, /レズビアン向け/);
assert.match(js, /@rezu_katu/);
assert.match(js, /制作：レズセ相性ナビ/);
assert.doesNotMatch(js, /レズセがしたい女性の応援垢/);
assert.match(js, /みんなもここから作れるよ→ \$\{SITE_URL\}\\n\\n@rezu_katu\\n\$\{HASHTAG\}/);
assert.match(js, /const PROF_BLOCK_H\s+= 190;/);
assert.match(html, /投稿画面では @rezu_katu とハッシュタグを消さないでね/);
assert.doesNotMatch(js, /state\.level/);

console.log("static contract ok");
