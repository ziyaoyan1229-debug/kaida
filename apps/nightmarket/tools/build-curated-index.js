/*
 * 由 curated/<夜市 id>.json 產生 curated-index.js（首頁搜尋用的攤位名稱和招牌關鍵字）。
 * 改過 curated/ 裡的檔案後執行：node apps/nightmarket/tools/build-curated-index.js
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const dir = path.join(ROOT, "curated");
const markets = {};
let updated = "";
for (const f of fs.readdirSync(dir).sort()) {
  if (!f.endsWith(".json")) continue;
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (d.updated > updated) updated = d.updated;
  const words = [];
  (d.stalls || []).forEach((s) => [s.zh, s.en].concat(s.foods || [], s.foodsEn || []).forEach((w) => {
    w = String(w || "").trim().toLowerCase();
    if (w && words.indexOf(w) < 0) words.push(w);
  }));
  if (d.stalls && d.stalls.length) markets[f.slice(0, -5)] = words.join(" ");
}
fs.writeFileSync(path.join(ROOT, "curated-index.js"),
  "/* 推薦攤位搜尋索引（由 tools/build-curated-index.js 產生，請勿手改）。攤位內容在 curated/<夜市 id>.json。 */\n" +
  "window.NM_CURATED_INDEX = " + JSON.stringify({ updated: updated, markets: markets }) + ";\n");
console.log(Object.keys(markets).length + " markets, updated " + updated);
