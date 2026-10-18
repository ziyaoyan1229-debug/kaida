/*
 * 每週更新夜市店家資料檔（GitHub Actions 執行）。
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
require(path.join(ROOT, "curated.js"));
const CURATED = (global.window.NM_CURATED && global.window.NM_CURATED.markets) || {};

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

(async () => {
  const out = {};
  for (const m of MARKETS) {
    out[m.id] = await core.collect(m, searchText);
    const picks = (CURATED[m.id] && CURATED[m.id].stalls) || [];
    out[m.id].picks = await core.locatePicks(m, out[m.id].center, picks, searchText);
    console.log(m.zh, out[m.id].stalls.length, "picks", out[m.id].picks.length + "/" + picks.length);
  }
  const date = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
  fs.writeFileSync(path.join(ROOT, "stall-db.js"), core.toFile(out, date));
  console.log("stall-db.js updated", date);
})().catch((e) => { console.error(e); process.exit(1); });
