/*
 * 每半個月更新夜市店家資料檔（GitHub Actions 執行）。
 * 需要環境變數 NM_PLACES_KEY：一把只開 Places API (New)、沒有網址限制的伺服器用金鑰。
 * 用法：NM_PLACES_KEY=... node apps/nightmarket/tools/update-stall-db.js
 */
"use strict";
const fs = require("fs");
const path = require("path");
const core = require("./stall-db-core.js");

const KEY = process.env.NM_PLACES_KEY;
if (!KEY) { console.error("缺少 NM_PLACES_KEY"); process.exit(1); }
const ROOT = path.join(__dirname, "..");

// 讀 data.js 的夜市清單
global.window = {};
require(path.join(ROOT, "data.js"));
const MARKETS = global.window.NM_MARKETS;
// 推薦攤位：curated/<夜市 id>.json
const CURATED = {};
for (const f of fs.readdirSync(path.join(ROOT, "curated"))) {
  if (f.endsWith(".json")) CURATED[f.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(ROOT, "curated", f), "utf8"));
}

async function searchText(text, where, max) {
  const body = { textQuery: text, languageCode: "zh-TW", regionCode: "TW", pageSize: max };
  if (where.rect) {
    const r = where.rect;
    body.locationRestriction = { rectangle: { low: { latitude: r.south, longitude: r.west }, high: { latitude: r.north, longitude: r.east } } };
  } else {
    body.locationBias = { circle: { center: { latitude: where.center.lat, longitude: where.center.lng }, radius: where.radius } };
  }
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": "places.id,places.location,places.types,places.displayName" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(text + ": HTTP " + res.status + " " + (await res.text()).slice(0, 300));
  const json = await res.json();
  return (json.places || []).filter((p) => p.location).map((p) => ({ id: p.id, lat: p.location.latitude, lng: p.location.longitude, types: p.types || [], name: (p.displayName && p.displayName.text) || "" }));
}

// 已經對到的推薦攤位只用 Place Details（只要座標，Essentials 等級、免費額度大）更新座標；
// 還沒對到的才用文字搜尋重找，而且每月只在月初那次找，省查詢次數
async function placeLocation(id) {
  const res = await fetch("https://places.googleapis.com/v1/places/" + encodeURIComponent(id), {
    headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": "id,location" }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(id + ": HTTP " + res.status + " " + (await res.text()).slice(0, 300));
  const p = await res.json();
  return p.location ? { id: p.id || id, lat: p.location.latitude, lng: p.location.longitude } : null;
}
const r6 = (x) => Math.round(x * 1e6) / 1e6;

(async () => {
  global.window = {};
  try { require(path.join(ROOT, "stall-db.js")); } catch (e) { /* 第一次跑 */ }
  const prev = (global.window.NM_STALL_DB && global.window.NM_STALL_DB.markets) || {};
  const date = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
  const full = process.env.NM_FULL === "1" || +date.slice(8) <= 7;
  const out = {};
  for (const m of MARKETS) {
    out[m.id] = await core.collect(m, searchText);
    const picks = (CURATED[m.id] && CURATED[m.id].stalls) || [];
    const known = {};
    ((prev[m.id] && prev[m.id].picks) || []).forEach((r) => { known[r[0]] = r[1]; });
    const found = [], missing = [];
    for (const pk of picks) {
      const loc = known[pk.zh] ? await placeLocation(known[pk.zh]) : null;
      if (loc) found.push([pk.zh, loc.id, r6(loc.lat), r6(loc.lng)]); else missing.push(pk);
    }
    const more = full ? await core.locatePicks(m, out[m.id].center, missing, searchText) : [];
    out[m.id].picks = found.concat(more);
    console.log(m.zh, out[m.id].stalls.length, "picks", out[m.id].picks.length + "/" + picks.length);
  }
  fs.writeFileSync(path.join(ROOT, "stall-db.js"), core.toFile(out, date));
  console.log("stall-db.js updated", date, full ? "(full)" : "");
})().catch((e) => { console.error(e); process.exit(1); });
