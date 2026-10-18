/*
 * 夜市店家資料檔的共用邏輯：找出每個夜市裡的店家，只留 Google 地點編號和座標。
 * 依 Google Maps Platform 條款，地點編號可以長期保存，座標最多保存 30 天；
 * 店名、評分、評論、照片都不存，網頁打開時才跟 Google 拿。
 * 這支檔案在 Node（每週更新）和瀏覽器（第一次建立）都能用。
 */
(function (root) {
  "use strict";
  var M_PER_DEG_LAT = 111320;
  var FOOD = /restaurant|food|cafe|bakery|meal_|dessert|ice_cream|juice|tea|coffee|bar$|confection|snack|deli|candy|donut|sandwich|brunch|diner|buffet/;
  function mPerDegLng(lat) { return M_PER_DEG_LAT * Math.cos(lat * Math.PI / 180); }
  function box(c, halfM) {
    var dLat = halfM / M_PER_DEG_LAT, dLng = halfM / mPerDegLng(c.lat);
    return { north: c.lat + dLat, south: c.lat - dLat, east: c.lng + dLng, west: c.lng - dLng };
  }
  function distM(a, b) {
    var dy = (a.lat - b.lat) * M_PER_DEG_LAT, dx = (a.lng - b.lng) * mPerDegLng((a.lat + b.lat) / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }
  function trimOutliers(list) {
    if (list.length < 6) return list;
    var c = { lat: 0, lng: 0 };
    list.forEach(function (s) { c.lat += s.lat; c.lng += s.lng; });
    c.lat /= list.length; c.lng /= list.length;
    var d = list.map(function (s) { return distM(s, c); }).sort(function (a, b) { return a - b; });
    var limit = Math.max(d[Math.floor(d.length / 2)] * 2.2, 120);
    return list.filter(function (s) { return distM(s, c) <= limit; });
  }
  var r6 = function (x) { return Math.round(x * 1e6) / 1e6; };

  // searchText(text, { center, radius } 或 { rect }, max) → [{ id, lat, lng, types }]
  async function collect(m, searchText) {
    var center = { lat: m.lat, lng: m.lng };
    var market = (await searchText(m.zh, { center: center, radius: 2000 }, 1))[0];
    var marketId = null;
    if (market && distM(market, center) < 2000) { marketId = market.id; center = { lat: market.lat, lng: market.lng }; }
    var rect = box(center, 650);
    var lists = await Promise.all([m.zh + " 小吃", m.zh + " 攤位", m.zh + " 美食"].map(function (q) { return searchText(q, { rect: rect }, 20); }));
    var seen = {}, stalls = [];
    lists.forEach(function (list) {
      list.forEach(function (p) {
        if (seen[p.id] || p.id === marketId) return;
        if (p.types && p.types.length && !p.types.some(function (t) { return FOOD.test(t); })) return;
        seen[p.id] = true;
        stalls.push(p);
      });
    });
    var keep = trimOutliers(stalls.filter(function (s) { return distM(s, center) < 700; }));
    return { center: [r6(center.lat), r6(center.lng)], stalls: keep.map(function (s) { return [s.id, r6(s.lat), r6(s.lng)]; }) };
  }

  // 推薦攤位（我們自己整理的店名）找 Google 上的位置：只留地點編號和座標，店名不存
  function core(name) { return String(name || "").replace(/[（(].*?[）)]/g, "").replace(/\s+/g, ""); }
  function sameShop(a, b) {
    a = core(a); b = core(b);
    if (!a || !b) return false;
    if (a.indexOf(b) >= 0 || b.indexOf(a) >= 0) return true;
    var grams = [];
    for (var i = 0; i < b.length - 1; i++) grams.push(b.slice(i, i + 2));
    var hit = grams.filter(function (g) { return a.indexOf(g) >= 0; }).length;
    return grams.length > 0 && hit / grams.length >= 0.5;
  }
  async function locatePicks(m, center, picks, searchText) {
    var c = { lat: center[0], lng: center[1] }, out = [];
    var mk = m.zh.replace(/（.*?）/g, "");
    for (var i = 0; i < picks.length; i++) {
      var pk = picks[i];
      var list = await searchText(core(pk.zh) + " " + mk, { center: c, radius: 900 }, 3);
      var best = list.filter(function (p) { return distM(p, c) < 1000 && sameShop(p.name, pk.zh); })[0];
      if (best) out.push([pk.zh, best.id, r6(best.lat), r6(best.lng)]);
    }
    return out;
  }

  // 寫成網頁直接載入的 stall-db.js
  function toFile(markets, date) {
    return "/* 夜市店家資料檔：自動產生，請勿手動修改。只存 Google 地點編號與座標（座標超過 30 天網頁就不再使用）。 */\n" +
      "window.NM_STALL_DB = " + JSON.stringify({ updated: date, markets: markets }) + ";\n";
  }

  var api = { collect: collect, locatePicks: locatePicks, toFile: toFile, box: box };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NMStallDbCore = api;
})(this);
