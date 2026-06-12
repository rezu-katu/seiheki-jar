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
