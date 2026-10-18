/* 台灣夜市地圖：純前端，資料在 data.js，收藏與封測進度存在瀏覽器 */
(function () {
  "use strict";

  var MARKETS = window.NM_MARKETS;
  var CITIES = window.NM_CITIES;

  var T = {
    zh: {
      title: "台灣夜市地圖", byKaida: "開達 Kaida 封測作品", tasksBtn: "封測任務",
      searchPh: "搜尋夜市、城市或小吃（例如：蚵仔煎）", all: "全部", today: "今天有開", near: "離我最近", favs: "想去清單",
      mustEat: "必吃小吃", openDays: "營業日", hours: "時間（約）", transit: "交通", distance: "距離",
      warn: "營業時間與攤位常有變動，請以現場為準。", navigate: "Google 地圖導航", share: "分享", report: "回報資料錯誤",
      favAdd: "☆ 加入想去", favDel: "★ 已在想去清單",
      betaTag: "開達封測 · 第一輪", tasksTitle: "幫我們試試看這 4 件事", tasksIntro: "完成後會自動打勾。最後留一句回饋，就是最大的幫忙。",
      fbTitle: "你的回饋", fbPh: "哪裡好用？哪裡卡住？少了哪個夜市？", fbSave: "送出回饋", fbReset: "重新開始任務",
      fbFine: "這是封測版本，回饋先存在你的手機，送出時會一併複製，方便貼到開達作品頁或 Threads。",
      tasks: [
        ["找到離你最近的夜市", "按「離我最近」，允許定位"],
        ["用小吃找夜市", "搜尋一種想吃的，例如「臭豆腐」或「胡椒餅」"],
        ["收藏 3 個想去的夜市", "點夜市旁邊的星星"],
        ["打開一個今天有開的夜市", "看看必吃小吃和怎麼去"]
      ],
      results: function (n) { return "共 " + n + " 個夜市"; },
      sortedNear: "依距離排序", dailyOpen: "每天", checkDays: "不固定，出發前請確認",
      openNow: "營業中", opensAt: function (t) { return "今天 " + t + " 開始"; }, closedToday: "今天公休",
      endedToday: "今天已收攤", nextOpen: function (d) { return "下次：" + d; }, unknown: "營業日請先確認",
      week: ["週日", "週一", "週二", "週三", "週四", "週五", "週六"], weekJoin: "、",
      empty: "找不到符合的夜市。", clear: "清除篩選", noFavs: "還沒有收藏。點星星把想去的夜市加進來。",
      locating: "定位中…", locFail: "無法取得位置，請確認瀏覽器允許定位。", copied: "已複製連結",
      fbSaved: "謝謝！回饋已存下並複製。", fbEmpty: "先寫一句話再送出喔", reportPre: function (n) { return "【資料錯誤】" + n + "："; },
      resetDone: "任務已重新開始", taskDone: function (t) { return "封測任務完成：" + t; }, allDone: "4 個任務都完成了，謝謝你！",
      source: function (d) { return "夜市資料由開達整理自公開資訊（" + d + "），未逐一實地查證，座標為大致位置。看到錯誤請按「回報資料錯誤」。"; },
      km: function (k) { return k < 1 ? Math.round(k * 1000) + " 公尺" : k.toFixed(1) + " 公里"; },
      langBtn: "EN", shareText: function (n) { return n + "：今天有開嗎？必吃什麼？"; },
      stallsTitle: "夜市裡的店家（Google 地圖）", stallsLoading: "正在從 Google 地圖找店家…", stallsNone: "Google 地圖上沒找到這裡的店家。",
      stallsError: "暫時載入不了店家，稍後再試。", seeMap: function (n) { return "在地圖上看 " + n + " 家店"; },
      back: "‹ 回夜市", ratings: function (n) { return n + " 則評分"; }, noRating: "還沒有評分", reviewsTitle: "饕客評論",
      reviewsLoading: "載入評論中…", noReviews: "這家店還沒有評論。", reviewsError: "暫時載入不了評論。",
      allReviews: "在 Google 地圖看全部評論", photoBy: "照片：", prevPhoto: "上一張", nextPhoto: "下一張", reviewsFrom: "照片、評論與店家資料來自 Google 地圖，開達不會修改或保存。", night: "夜市夜景",
      stallQPh: "在這個夜市找店家（例如：臭豆腐）", stallFound: function (n, q) { return "「" + q + "」找到 " + n + " 家"; },
      stallNoMatch: function (q) { return "這個夜市沒找到「" + q + "」，換個關鍵字試試。"; }, stallSearching: "也在 Google 地圖上找…",
      stallRelated: function (n, q) { return "店名裡沒有「" + q + "」，以下 " + n + " 家是 Google 地圖依評論和菜單找到的相關店家"; },
      stallMore: function (n) { return "還有 " + n + " 家攤位，點這裡載入店名"; }, stallMoreBusy: "載入中…",
      picksTitle: "網友推薦攤位", picksNote: "整理自網友的部落格和文章，用我們自己的話摘要，點「來源」可以看原文。攤位資訊可能有變動。",
      picksMentions: function (n) { return n + " 篇推薦"; }, picksMap: "在 Google 地圖找這家", picksSrc: "來源",
      stallFree: function (n) { return "地圖上標了 " + n + " 個攤位，點圖釘就會打開 Google 地圖看那家店的店名、評分和評論。"; },
      stallLoad: function (n) { return n ? "地圖上標了 " + n + " 個攤位，點這裡載入店名和評分" : "點這裡從 Google 地圖載入店家和評分"; }
    },
    en: {
      title: "Taiwan Night Market Map", byKaida: "A Kaida beta project", tasksBtn: "Beta tasks",
      searchPh: "Search markets, cities or food (e.g. oyster omelette)", all: "All", today: "Open today", near: "Nearest", favs: "Want to go",
      mustEat: "Must-eat", openDays: "Open days", hours: "Hours (approx.)", transit: "Getting there", distance: "Distance",
      warn: "Hours and stalls change often. Please check on site.", navigate: "Directions in Google Maps", share: "Share", report: "Report an error",
      favAdd: "☆ Add to list", favDel: "★ On your list",
      betaTag: "Kaida beta · round 1", tasksTitle: "Help us test these 4 things", tasksIntro: "They tick themselves off as you go. A one-line note at the end helps the most.",
      fbTitle: "Your feedback", fbPh: "What worked? Where did you get stuck? Which market is missing?", fbSave: "Send feedback", fbReset: "Restart tasks",
      fbFine: "This is a beta. Feedback is kept on your phone and copied when you send it, so you can paste it on Kaida or Threads.",
      tasks: [
        ["Find the night market nearest you", "Tap “Nearest” and allow location"],
        ["Find a market by food", "Search for something, e.g. “stinky tofu”"],
        ["Save 3 markets you want to visit", "Tap the star next to a market"],
        ["Open a market that is open today", "Check its must-eats and how to get there"]
      ],
      results: function (n) { return n + (n === 1 ? " night market" : " night markets"); },
      sortedNear: "sorted by distance", dailyOpen: "Every day", checkDays: "Varies, check before going",
      openNow: "Open now", opensAt: function (t) { return "Opens today at " + t; }, closedToday: "Closed today",
      endedToday: "Closed for tonight", nextOpen: function (d) { return "Next: " + d; }, unknown: "Check opening days",
      week: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], weekJoin: ", ",
      empty: "No night markets match.", clear: "Clear filters", noFavs: "Nothing saved yet. Tap a star to add a market.",
      locating: "Finding you…", locFail: "Couldn't get your location. Please allow location access.", copied: "Link copied",
      fbSaved: "Thanks! Feedback saved and copied.", fbEmpty: "Write a line first", reportPre: function (n) { return "[Data error] " + n + ": "; },
      resetDone: "Tasks restarted", taskDone: function (t) { return "Beta task done: " + t; }, allDone: "All 4 tasks done. Thank you!",
      source: function (d) { return "Market data compiled by Kaida from public sources (" + d + "), not verified on site; pins are approximate. Spot a mistake? Tap “Report an error”."; },
      km: function (k) { return k < 1 ? Math.round(k * 1000) + " m" : k.toFixed(1) + " km"; },
      langBtn: "中", shareText: function (n) { return n + ": open today? What to eat?"; },
      stallsTitle: "Places inside (Google Maps)", stallsLoading: "Finding places on Google Maps…", stallsNone: "No places found here on Google Maps.",
      stallsError: "Couldn't load places right now. Try again later.", seeMap: function (n) { return "See " + n + " places on the map"; },
      back: "‹ Back to market", ratings: function (n) { return n + " ratings"; }, noRating: "No ratings yet", reviewsTitle: "Reviews",
      reviewsLoading: "Loading reviews…", noReviews: "No reviews yet.", reviewsError: "Couldn't load reviews right now.",
      allReviews: "See all reviews on Google Maps", photoBy: "Photo:", reviewsFrom: "Photos, reviews and place info come from Google Maps. Kaida doesn't edit or store them.", night: "Night",
      stallQPh: "Search this market (e.g. stinky tofu)", stallFound: function (n, q) { return n + " found for “" + q + "”"; },
      stallNoMatch: function (q) { return "Nothing for “" + q + "” here. Try another word."; }, stallSearching: "Also searching Google Maps…",
      stallRelated: function (n, q) { return "No name mentions “" + q + "”. These " + n + " places come up on Google Maps from reviews and menus."; },
      stallMore: function (n) { return n + " more stalls on the map. Tap to load their names"; }, stallMoreBusy: "Loading…",
      picksTitle: "Stalls locals recommend", picksNote: "Compiled from blogs and posts, summarized in our own words. Tap a source number to read the original. Details may change.",
      picksMentions: function (n) { return n + " recommendations"; }, picksMap: "Find on Google Maps", picksSrc: "Sources",
      stallFree: function (n) { return n + " stalls are marked on the map. Tap a pin to open that place in Google Maps for its name, rating and reviews."; },
      stallLoad: function (n) { return n ? n + " stalls marked on the map. Tap to load names and ratings" : "Tap to load places and ratings from Google Maps"; }
    }
  };

  /* ---------- 狀態 ---------- */
  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 無痕模式時忽略 */ } }

  var lang = "zh";
  try { lang = localStorage.getItem("kaida-lang") === "en" ? "en" : "zh"; } catch (e) { /* 預設中文 */ }
  var state = {
    q: "", city: "all", today: false, near: false, favOnly: false,
    favs: load("nm-favs", []), tasks: load("nm-tasks", {}), me: null, selected: null
  };
  var t = function (k) { return T[lang][k]; };
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 台北時間與營業狀態 ---------- */
  function taipeiNow() {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Taipei", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
    return { day: day, min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
  }
  function toMin(s) { var p = s.split(":"); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }
  function opensOn(m, day) { return m.days === null || (Array.isArray(m.days) && m.days.indexOf(day) >= 0); }
  function status(m) {
    if (!Array.isArray(m.days) && m.days !== null) return { cls: "unknown", text: t("unknown"), today: null };
    var now = taipeiNow();
    var h = m.hours.split("–"), start = toMin(h[0]), end = toMin(h[1]);
    var overnight = end <= start;
    var yesterday = (now.day + 6) % 7;
    if (overnight && now.min < end && opensOn(m, yesterday)) return { cls: "open", text: t("openNow"), today: true };
    if (opensOn(m, now.day)) {
      if (now.min >= start && (overnight || now.min < end)) return { cls: "open", text: t("openNow"), today: true };
      if (now.min < start) return { cls: "open", text: t("opensAt")(h[0]), today: true };
      return { cls: "closed", text: t("endedToday") + " · " + t("nextOpen")(nextDay(m, now.day)), today: true };
    }
    return { cls: "closed", text: t("closedToday") + " · " + t("nextOpen")(nextDay(m, now.day)), today: false };
  }
  function nextDay(m, day) {
    for (var i = 1; i <= 7; i++) { var d = (day + i) % 7; if (opensOn(m, d)) return t("week")[d]; }
    return "";
  }
  function daysText(m) {
    if (m.days === null) return t("dailyOpen");
    if (!Array.isArray(m.days)) return t("checkDays");
    return m.days.slice().sort(function (a, b) { return ((a + 6) % 7) - ((b + 6) % 7); }).map(function (d) { return t("week")[d]; }).join(t("weekJoin"));
  }

  /* ---------- 小工具 ---------- */
  function name(m) { return lang === "zh" ? m.zh : m.en; }
  function cityName(key) { var c = CITIES.filter(function (x) { return x.key === key; })[0]; return c ? c[lang] : key; }
  function foods(m) { return lang === "zh" ? m.foodsZh : m.foodsEn; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function hi(s, q) {
    if (!q) return esc(s);
    var i = s.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(s);
    return esc(s.slice(0, i)) + "<mark>" + esc(s.slice(i, i + q.length)) + "</mark>" + esc(s.slice(i + q.length));
  }
  function distKm(a, b) {
    var R = 6371, rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  var toastTimer;
  function toast(msg) {
    var el = $("toast");
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(function () {});
    var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) { /* 忽略 */ }
    ta.remove();
    return Promise.resolve();
  }

  /* ---------- 網友推薦攤位（自己整理的資料，不用 Google） ---------- */
  function picksOf(m) {
    var c = window.NM_CURATED;
    return (c && c.markets && c.markets[m.id] && c.markets[m.id].stalls) || [];
  }
  function renderPicks(m) {
    var list = picksOf(m).slice();
    $("dPicksWrap").hidden = !list.length;
    if (!list.length) { $("dPicks").innerHTML = ""; return; }
    var en = lang === "en";
    // 主頁搜尋的關鍵字（例如「臭豆腐」）對到的攤位排前面
    var words = state.q.trim().toLowerCase().split(/\s+/).filter(function (w) { return w && (m.zh + " " + m.en + " " + cityName(m.city)).toLowerCase().indexOf(w) < 0; });
    function hit(p) { var h = [p.zh, p.en].concat(p.foods || [], p.foodsEn || []).join(" ").toLowerCase(); return words.length && words.some(function (w) { return h.indexOf(w) >= 0; }); }
    list.sort(function (a, b) { return (hit(b) ? 1 : 0) - (hit(a) ? 1 : 0); });
    $("dPicks").innerHTML = list.map(function (p) {
      var name = en ? (p.en || p.zh) : p.zh, sub = en ? (p.en ? p.zh : "") : (p.en || "");
      var foods = (en && p.foodsEn && p.foodsEn.length ? p.foodsEn : p.foods) || [];
      var meta = [p.price, p.where, p.mentions ? t("picksMentions")(p.mentions) : ""].filter(Boolean).join(" · ");
      var gq = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.zh + " " + m.zh.replace(/（.*）/, ""));
      var src = (p.sources || []).map(function (x, i) { return '<a href="' + esc(x.url) + '" target="_blank" rel="noopener" title="' + esc(x.title || "") + '">' + (i + 1) + "</a>"; }).join(" ");
      var ph = p.photo && p.photo.url ? '<figure class="pick-ph"><img src="' + esc(p.photo.url) + '" alt="' + esc(name) + '" loading="lazy" onerror="this.parentNode.remove()"><figcaption><a href="' + esc(p.photo.page || p.photo.url) + '" target="_blank" rel="noopener">' + esc(t("photoBy")) + " " + esc(p.photo.author || "") + " · " + esc(p.photo.license || "") + "</a></figcaption></figure>" : "";
      return '<li class="pick' + (hit(p) ? " hit" : "") + '">' + ph + '<div class="pick-body"><h4>' + esc(name) + (sub ? " <small>" + esc(sub) + "</small>" : "") + "</h4>" +
        (foods.length ? '<ul class="foods">' + foods.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" : "") +
        '<p class="pick-sum">' + esc(en ? (p.summaryEn || p.summaryZh) : p.summaryZh) + "</p>" +
        (meta ? '<p class="pick-meta">' + esc(meta) + "</p>" : "") +
        '<p class="pick-links"><a href="' + gq + '" target="_blank" rel="noopener">' + esc(t("picksMap")) + "</a>" + (src ? ' <span>' + esc(t("picksSrc")) + " " + src + "</span>" : "") + "</p></div></li>";
    }).join("");
  }

  /* ---------- 篩選 ---------- */
  function matches(m, q) {
    if (!q) return true;
    var hay = [m.zh, m.en, cityName(m.city), CITIES.filter(function (c) { return c.key === m.city; }).map(function (c) { return c.zh + " " + c.en; }).join(" ")]
      .concat(m.foodsZh, m.foodsEn, picksOf(m).map(function (p) { return [p.zh, p.en].concat(p.foods || [], p.foodsEn || []).join(" "); })).join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function foodHit(m, q) {
    if (!q) return false;
    return m.foodsZh.concat(m.foodsEn).some(function (f) { return f.toLowerCase().indexOf(q.toLowerCase()) >= 0; });
  }
  function visible() {
    var q = state.q.trim();
    var list = MARKETS.filter(function (m) {
      if (state.city !== "all" && m.city !== state.city) return false;
      if (state.favOnly && state.favs.indexOf(m.id) < 0) return false;
      if (state.today && status(m).today !== true) return false;
      return matches(m, q);
    });
    if (state.near && state.me) {
      list.sort(function (a, b) { return distKm(state.me, a) - distKm(state.me, b); });
    }
    return list;
  }

  /* ---------- 地圖 ---------- */
  var PIN = '<svg viewBox="0 0 30 38" aria-hidden="true"><path class="b" d="M15 37C10 29 2 22.5 2 14a13 13 0 0 1 26 0c0 8.5-8 15-13 23z"/>' +
    '<path class="i" d="M8 10h14v4a1.75 1.75 0 0 1-3.5 0a1.75 1.75 0 0 1-3.5 0a1.75 1.75 0 0 1-3.5 0a1.75 1.75 0 0 1-3.5 0z"/>' +
    '<rect class="i" x="8.5" y="15" width="1.4" height="5"/><rect class="i" x="20.1" y="15" width="1.4" height="5"/><rect class="i" x="7.5" y="19.5" width="15" height="2" rx=".6"/></svg>';
  var mapOpts = {
    pinHtml: function (sel, off, label) { return '<div class="nm-pin' + (off ? " off" : "") + (sel ? " sel" : "") + '">' + PIN + (label ? '<span class="pin-name">' + esc(label) + "</span>" : "") + "</div>"; },
    label: function (m) { return name(m); },
    lang: function () { return lang; },
    night: function () { return night; },
    skin: document.documentElement.getAttribute("data-skin") === "cyber" ? "cyber" : "beige",
    mapId: (window.NM_CONFIG || {}).googleMapId,
    onMarketClick: function (id) { openDetail(id); },
    onStallClick: function (id) { openStall(id); }
  };
  // 地圖還沒準備好之前先用空殼，所有呼叫都安全
  var noop = function () {};
  var view = { supportsStalls: false, syncMarkets: noop, fit: noop, focus: noop, setMe: noop, setSkin: noop, showArea: function () { return Promise.resolve(null); }, clearArea: noop, selectStall: noop };
  var mapReady = false;

  function useLeaflet() {
    if (view.destroy) view.destroy();
    view = window.NMLeafletMap($("map"), mapOpts);
    afterMap();
  }
  function afterMap() {
    mapReady = true;
    document.body.classList.toggle("has-stalls", !!view.supportsStalls);
    if (state.me) view.setMe(state.me.lat, state.me.lng);
    render({ fit: !state.selected });
    if (state.selected) { var m = byId(state.selected); if (m) showArea(m); }
  }
  function startMap() {
    var key = (window.NM_CONFIG || {}).googleMapsKey;
    if (!key) { useLeaflet(); return; }
    var failed = false;
    var fallback = function (why) {
      if (failed) return; failed = true;
      console.warn("[map] Google 地圖無法使用，改用 OpenStreetMap：", why);
      useLeaflet();
    };
    window.NMLoadGoogle(key, lang, function () { fallback("金鑰無效或未授權這個網址"); })
      .then(function () { return window.NMGoogleMap($("map"), mapOpts); })
      .then(function (v) { if (failed) { v.destroy(); return; } view = v; afterMap(); })
      .catch(fallback);
  }

  function syncMarkers(list) {
    var ids = list.map(function (m) { return m.id; });
    view.syncMarkets(MARKETS, ids, state.selected, function (m) { return status(m).today === false; });
  }
  function fitTo(list) {
    var pts = list.map(function (m) { return [m.lat, m.lng]; });
    if (state.me && state.near && state.city === "all") pts.push([state.me.lat, state.me.lng]);
    view.clearArea(); stalls = [];
    view.fit(pts, 15);
  }

  /* ---------- 清單 ---------- */
  function renderChips() {
    var counts = {};
    MARKETS.forEach(function (m) { counts[m.city] = (counts[m.city] || 0) + 1; });
    var html = '<button class="chip" type="button" data-city="all" aria-pressed="' + (state.city === "all") + '">' + t("all") + "<small>" + MARKETS.length + "</small></button>";
    CITIES.forEach(function (c) {
      if (!counts[c.key]) return;
      html += '<button class="chip" type="button" data-city="' + c.key + '" aria-pressed="' + (state.city === c.key) + '">' + c[lang] + "<small>" + counts[c.key] + "</small></button>";
    });
    $("cityChips").innerHTML = html;
  }

  function render(opts) {
    opts = opts || {};
    var list = visible();
    var q = state.q.trim();
    var line = t("results")(list.length);
    if (state.near && state.me) line += " · " + t("sortedNear");
    $("resultLine").textContent = line;
    $("favCount").textContent = state.favs.length;

    if (!list.length) {
      $("list").innerHTML = '<li class="empty">' + (state.favOnly && !state.favs.length ? t("noFavs") : t("empty")) +
        '<br><button class="btn" type="button" id="clearBtn">' + t("clear") + "</button></li>";
      $("clearBtn").onclick = clearFilters;
    } else {
      $("list").innerHTML = list.map(function (m) {
        var st = status(m);
        var fav = state.favs.indexOf(m.id) >= 0;
        var fs = foods(m);
        var shown = q ? fs.filter(function (f) { return f.toLowerCase().indexOf(q.toLowerCase()) >= 0; }).concat(fs.filter(function (f) { return f.toLowerCase().indexOf(q.toLowerCase()) < 0; })) : fs;
        return '<li><div class="item' + (state.selected === m.id ? " active" : "") + '" role="button" tabindex="0" data-id="' + m.id + '">' +
          "<h3>" + hi(name(m), q) + "</h3>" +
          '<div class="side"><button class="star" type="button" data-fav="' + m.id + '" aria-pressed="' + fav + '" aria-label="' + esc(fav ? t("favDel") : t("favAdd")) + '">' + (fav ? "★" : "☆") + "</button>" +
          (state.me ? '<span class="dist">' + t("km")(distKm(state.me, m)) + "</span>" : "") + "</div>" +
          '<div class="meta"><span>' + esc(cityName(m.city)) + '</span><span class="badge ' + st.cls + '">' + esc(st.text) + "</span></div>" +
          '<div class="foods-line">' + shown.slice(0, 4).map(function (f) { return hi(f, q); }).join(" · ") + "</div>" +
          "</div></li>";
      }).join("");
    }
    syncMarkers(list);
    if (opts.fit) fitTo(list);

    if (q && list.some(function (m) { return foodHit(m, q); })) doneTask("search");
  }

  function clearFilters() {
    state.q = ""; state.city = "all"; state.today = false; state.favOnly = false;
    $("q").value = "";
    setPressed("todayBtn", false); setPressed("favBtn", false);
    renderChips(); render({ fit: true });
  }
  function setPressed(id, v) { $(id).setAttribute("aria-pressed", String(v)); }

  /* ---------- 收藏 ---------- */
  function toggleFav(id) {
    var i = state.favs.indexOf(id);
    if (i >= 0) state.favs.splice(i, 1); else state.favs.push(id);
    save("nm-favs", state.favs);
    if (state.favs.length >= 3) doneTask("fav");
    render();
    if (state.selected === id) fillFavBtn(id);
  }
  function fillFavBtn(id) {
    var fav = state.favs.indexOf(id) >= 0;
    $("dFav").textContent = fav ? t("favDel") : t("favAdd");
    $("dFav").setAttribute("aria-pressed", String(fav));
  }

  /* ---------- 詳細面板 ---------- */
  var lastFocus = null;
  function openSheet(id) {
    lastFocus = document.activeElement;
    $(id).hidden = false;
    var c = $(id).querySelector(".close"); if (c) c.focus();
  }
  function closeSheet(el) {
    el.hidden = true;
    if (el.id === "detail") {
      var prev = state.selected; state.selected = null;
      if (prev) { render(); }
      if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function openDetail(id) {
    var m = MARKETS.filter(function (x) { return x.id === id; })[0];
    if (!m) return;
    state.selected = id;
    var st = status(m);
    $("dMeta").textContent = cityName(m.city).toUpperCase() + " · " + (lang === "zh" ? m.en : m.zh);
    $("dName").textContent = name(m);
    $("dStatus").innerHTML = '<span class="badge ' + st.cls + '">' + esc(st.text) + "</span>";
    $("dNote").textContent = lang === "zh" ? m.noteZh : m.noteEn;
    renderPicks(m);
    $("dFoods").innerHTML = foods(m).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    $("dDays").textContent = daysText(m);
    $("dHours").textContent = m.hours;
    $("dTransit").textContent = lang === "zh" ? m.transitZh : m.transitEn;
    if (state.me) { $("dDistRow").hidden = false; $("dDist").textContent = t("km")(distKm(state.me, m)); } else { $("dDistRow").hidden = true; }
    $("dNav").href = "https://www.google.com/maps/dir/?api=1&destination=" + m.lat + "," + m.lng;
    fillFavBtn(id);
    if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    render();
    openSheet("detail");
    if (view.supportsStalls && stallFor === id && stalls.length && FREE_STALLS) renderStalls();
    else if (view.supportsStalls && stallFor === id && stalls.length) {
      var cq = carryQuery(m);
      if (cq && cq !== stallQ) { stallQ = cq; $("dStallQ").value = cq; searchStalls(); } else renderStalls();
    }
    else { view.focus(m.lat, m.lng, 15); renderStalls(); showArea(m); }
    if (st.today === true) doneTask("today");
  }

  /* ---------- 夜市範圍與攤位（Google 地圖） ---------- */
  var stalls = [];
  var stallFor = null, stallMode = "loaded";
  // 免費模式：只用資料檔畫攤位位置，不向 Google 抓店名、評分、照片和評論；點圖釘直接開 Google 地圖看那家店
  var FREE_STALLS = true;
  var stallQ = "", stallHits = {}, stallBusy = false, stallTimer = null;
  function byId(id) { return MARKETS.filter(function (x) { return x.id === id; })[0]; }
  function stars(r) {
    var full = Math.round(r || 0);
    return '<span class="stars" aria-label="' + (r ? r.toFixed(1) : "0") + '">' + "★★★★★".slice(0, full) + '<i>' + "★★★★★".slice(full) + "</i></span>";
  }
  function showArea(m) {
    if (!mapReady || !view.supportsStalls) return;
    stallFor = m.id; stalls = [];
    stallQ = carryQuery(m); $("dStallQ").value = stallQ; stallHits = {};
    if (FREE_STALLS) {
      stallMode = "free"; stallQ = ""; $("dStallQ").value = "";
      stalls = (view.previewArea && view.previewArea(m)) || [];
      renderStalls();
      return;
    }
    // 先只畫資料檔裡的攤位位置，不向 Google 查詢；使用者按「載入店名」或搜尋關鍵字才查
    var pre = view.previewArea ? view.previewArea(m) : null;
    if (pre || (view.previewArea && !stallQ)) {
      stallMode = "preview"; stalls = pre || [];
      if (stallQ) searchStalls(); else renderStalls();
      return;
    }
    loadStalls(m);
  }
  function loadStalls(m) {
    var old = stalls;
    stallMode = "loaded";
    renderStalls("loading");
    view.showArea(m).then(function (list) {
      if (stallFor !== m.id) return;
      stalls = list || [];
      // 預覽時已經載入過的店（點過圖釘或關鍵字找到的）不用再查一次
      old.forEach(function (o) {
        if (o.pending) return;
        var i = -1;
        stalls.forEach(function (s, k) { if (s.id === o.id) i = k; });
        if (i < 0) stalls.push(o); else if (stalls[i].pending) stalls[i] = o;
      });
      if (stallQ) searchStalls(); else renderStalls();
    }).catch(function (e) {
      console.warn("[stalls]", e);
      if (stallFor === m.id) renderStalls("error");
    });
  }
  // 主頁搜尋的關鍵字帶進夜市：去掉夜市名稱和縣市，剩下的（例如「臭豆腐」）拿來找店家
  function carryQuery(m) {
    var hay = [m.zh, m.en, cityName(m.city)].concat(CITIES.filter(function (c) { return c.key === m.city; }).map(function (c) { return c.zh + " " + c.en; })).join(" ").toLowerCase();
    var foods = m.foodsZh.concat(m.foodsEn);
    return state.q.trim().split(/\s+/).filter(function (w) { return w && hay.indexOf(w.toLowerCase()) < 0 && w.toLowerCase().indexOf("夜市") < 0 && w.toLowerCase() !== "night" && w.toLowerCase() !== "market"; })
      .map(function (w) {
        // 打一半（例如「香」）時，換成這個夜市符合的小吃名（「烤香腸」），才不會找到香舖之類不相干的店
        var hit = foods.filter(function (f) { return f.toLowerCase().indexOf(w.toLowerCase()) >= 0; }).sort(function (a, b) { return a.length - b.length; })[0];
        if (!hit || hit.toLowerCase() === w.toLowerCase()) return w;
        var trimmed = hit.replace(m.zh.replace(/夜市$/, ""), "").trim();
        return trimmed.length >= w.length ? trimmed : hit;
      }).join(" ");
  }
  function norm(x) { return String(x || "").toLowerCase().replace(/\s+/g, ""); }
  // 店家關鍵字：先比對店名和類型，再加上 Google 地圖用這個關鍵字在夜市範圍內找到的店
  function matchStalls() {
    var q = norm(stallQ);
    if (!q) return null;
    var hits = stallHits[stallQ] || {};
    // 店名有關鍵字的排前面，其餘照 Google 的相關度
    // 長一點的關鍵字拆成兩字詞：「豬肝湯」看「豬肝」「肝湯」，店名對到越多越前面
    var grams = [];
    if (q.length >= 3) for (var g = 0; g < q.length - 1; g++) grams.push(q.slice(g, g + 2));
    function rank(s) {
      var n = norm(s.name);
      if (n.indexOf(q) >= 0) return 0;
      var hit = grams.filter(function (x) { return n.indexOf(x) >= 0; }).length;
      if (hit) return 2 - hit / grams.length;
      return norm(s.type).indexOf(q) >= 0 ? 2 : 3 + (hits[s.id] || 0);
    }
    return stalls.filter(function (s) { return !(s.pending && !s.name) && (hits[s.id] || norm(s.name + " " + s.type).indexOf(q) >= 0); })
      .sort(function (a, b) { return rank(a) - rank(b); });
  }
  // 店名有沒有對到關鍵字（整個詞，或長關鍵字裡的兩字詞，例如「豬肝湯」的「豬肝」）
  function nameHits(name) {
    var q = norm(stallQ), n = norm(name);
    if (n.indexOf(q) >= 0) return true;
    for (var i = 0; q.length >= 3 && i < q.length - 1; i++) if (n.indexOf(q.slice(i, i + 2)) >= 0) return true;
    return false;
  }
  function renderStalls(mode) {
    var box = $("dStalls");
    if (!view.supportsStalls) { $("dStallsWrap").hidden = true; return; }
    $("dStallsWrap").hidden = false;
    if (stallMode === "free") {
      $("dStallsWrap").hidden = !stalls.length;
      $("dStallQWrap").hidden = true;
      $("dStallHint").textContent = "";
      $("dSeeMap").hidden = !stalls.length;
      $("dSeeMap").textContent = t("seeMap")(stalls.length);
      box.innerHTML = '<li class="muted">' + esc(t("stallFree")(stalls.length)) + "</li>";
      return;
    }
    if (stallMode === "preview" && mode !== "loading" && mode !== "error" && !norm(stallQ)) {
      $("dStallQWrap").hidden = !stalls.length;
      $("dStallHint").textContent = "";
      if (view.filterStalls) view.filterStalls(null);
      $("dSeeMap").hidden = !stalls.length;
      $("dSeeMap").textContent = t("seeMap")(stalls.length);
      box.innerHTML = '<li><button type="button" class="stall-more" id="dStallLoad">' + esc(t("stallLoad")(stalls.length)) + "</button></li>";
      return;
    }
    var loaded = mode !== "loading" && mode !== "error" && stalls.length;
    $("dStallQWrap").hidden = !loaded;
    if (!loaded) $("dStallHint").textContent = "";
    if (mode === "loading") { box.innerHTML = '<li class="muted">' + esc(t("stallsLoading")) + "</li>"; $("dSeeMap").hidden = true; return; }
    if (mode === "error" || !stalls.length) { box.innerHTML = '<li class="muted">' + esc(mode === "error" ? t("stallsError") : t("stallsNone")) + "</li>"; $("dSeeMap").hidden = true; return; }
    var shown = matchStalls();
    if (view.filterStalls) view.filterStalls(shown ? shown.map(function (s) { return s.id; }) : null);
    var list = shown || stalls.filter(function (s) { return !s.pending; });
    var waiting = shown ? 0 : stalls.length - list.length;
    $("dSeeMap").hidden = !list.length;
    $("dSeeMap").textContent = t("seeMap")(list.length);
    var exact = shown && list.some(function (s) { return nameHits(s.name); });
    $("dStallHint").textContent = !shown ? "" : stallBusy && !list.length ? t("stallSearching") : list.length ? (exact ? t("stallFound")(list.length, stallQ) : t("stallRelated")(list.length, stallQ)) + (stallBusy ? " · " + t("stallSearching") : "") : t("stallNoMatch")(stallQ);
    box.innerHTML = list.map(function (s) {
      var i = stalls.indexOf(s);
      return '<li><button type="button" class="stall-row" data-stall="' + esc(s.id) + '"><span class="thumb"><span class="no">' + (i + 1) + '</span></span><span class="nm">' + esc(s.name) +
        "<small>" + esc(s.type) + "</small></span>" +
        (s.rating ? '<span class="rt">' + s.rating.toFixed(1) + " ★<small>(" + s.count + ")</small></span>" : "") + "</button></li>";
    }).join("") + (waiting ? '<li><button type="button" class="stall-more" id="dStallMore">' + esc(stallMoreBusy ? t("stallMoreBusy") : t("stallMore")(waiting)) + "</button></li>" : "");
  }
  // 資料檔裡其他攤位：使用者要看才向 Google 載入店名和評分
  var stallMoreBusy = false;
  function loadMoreStalls() {
    var id = stallFor, todo = stalls.filter(function (s) { return s.pending; });
    if (stallMoreBusy || !todo.length || !view.resolveStall) return;
    stallMoreBusy = true; renderStalls();
    Promise.all(todo.map(function (s) { return view.resolveStall(s).catch(function (e) { console.warn("[stall]", e); }); })).then(function () {
      stallMoreBusy = false;
      if (stallFor !== id) return;
      // 載不到的就不列了
      stalls = stalls.filter(function (s) { return !s.pending || s.name; });
      renderStalls();
    });
  }
  function searchStalls() {
    var q = stallQ, id = stallFor, m = byId(id);
    renderStalls();
    if (!q || !m || !view.searchStalls || stallHits[q]) return;
    stallBusy = true; renderStalls();
    view.searchStalls(m, q).then(function (ids) {
      if (stallFor !== id) return;
      var h = {}; ids.forEach(function (x, i) { h[x] = i + 1; });
      stallHits[q] = h;
    }).catch(function (e) { console.warn("[stall search]", e); }).then(function () {
      if (stallFor !== id) return;
      stallBusy = false;
      if (stallQ === q) renderStalls();
    });
  }
  function openStall(id) {
    var s = stalls.filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    if (FREE_STALLS) {
      view.selectStall(id);
      var mk = byId(stallFor);
      window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mk ? mk.zh : s.lat + "," + s.lng) + "&query_place_id=" + encodeURIComponent(s.id), "_blank", "noopener");
      return;
    }
    if (s.pending && view.resolveStall) {
      view.resolveStall(s).then(function () { renderStalls(); openStall(id); }).catch(function (e) { console.warn("[stall]", e); });
      return;
    }
    view.selectStall(id);
    if (!$("detail").hidden) { $("detail").hidden = true; }
    $("sName").textContent = s.name;
    $("sMeta").textContent = (byId(stallFor) ? name(byId(stallFor)) : "") + (s.type ? " · " + s.type : "");
    $("sRating").innerHTML = s.rating ? stars(s.rating) + " <b>" + s.rating.toFixed(1) + "</b> <small>" + esc(t("ratings")(s.count)) + "</small>" : '<small>' + esc(t("noRating")) + "</small>";
    $("sAddr").textContent = s.address;
    $("sGallery").hidden = !s.photos || !s.photos.length;
    $("sPhotos").innerHTML = (s.photos || []).map(function (p) {
      var credit = p.author ? (p.authorUrl ? '<a href="' + esc(p.authorUrl) + '" target="_blank" rel="noopener">' + esc(p.author) + "</a>" : esc(p.author)) : "";
      // 照片每載入一張 Google 就算一次錢，所以只先載第一張，滑到才載下一張
      return '<figure><img data-src="' + esc(p.url) + '" alt="' + esc(s.name) + '" onerror="this.parentNode.remove();window.__nmGallery&&window.__nmGallery()">' +
        (credit ? "<figcaption>" + esc(t("photoBy")) + " " + credit + "</figcaption>" : "") + "</figure>";
    }).join("");
    $("sPhotos").scrollLeft = 0;
    updateGallery();
    $("sGmaps").href = s.url || ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(s.name) + "&query_place_id=" + encodeURIComponent(s.id));
    $("sReviews").innerHTML = '<li class="muted">' + esc(t("reviewsLoading")) + "</li>";
    openSheet("stall");
    view.fetchReviews(s).then(function (rs) {
      if ($("stall").hidden || $("sName").textContent !== s.name) return;
      if (!rs.length) { $("sReviews").innerHTML = '<li class="muted">' + esc(t("noReviews")) + "</li>"; return; }
      $("sReviews").innerHTML = rs.map(function (r) {
        var who = r.authorUrl ? '<a href="' + esc(r.authorUrl) + '" target="_blank" rel="noopener">' + esc(r.author) + "</a>" : esc(r.author);
        return '<li class="review">' + (r.photo ? '<img src="' + esc(r.photo) + '" alt="" width="32" height="32" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'av\'}))">' : '<span class="av"></span>') +
          '<div><p class="rv-head">' + who + ' <span class="rv-when">' + esc(r.when) + "</span></p>" + stars(r.rating) +
          '<p class="rv-text">' + esc(r.text) + "</p></div></li>";
      }).join("");
    }).catch(function (e) {
      console.warn("[reviews]", e);
      $("sReviews").innerHTML = '<li class="muted">' + esc(t("reviewsError")) + "</li>";
    });
  }
  // 店家照片：手機用手指滑，電腦用箭頭或拖曳
  function galleryIndex() {
    var el = $("sPhotos"), w = el.clientWidth || 1;
    return Math.round(el.scrollLeft / w);
  }
  function updateGallery() {
    var el = $("sPhotos"), n = el.children.length, i = Math.min(galleryIndex(), Math.max(n - 1, 0));
    if (!n) { $("sGallery").hidden = true; return; }
    var img = el.children[i].querySelector("img[data-src]");
    if (img) { img.src = img.getAttribute("data-src"); img.removeAttribute("data-src"); }
    $("gCount").textContent = (i + 1) + " / " + n;
    $("gCount").hidden = n < 2;
    $("gPrev").hidden = i <= 0;
    $("gNext").hidden = i >= n - 1;
  }
  window.__nmGallery = updateGallery;
  function goPhoto(step) {
    var el = $("sPhotos");
    el.scrollTo({ left: (galleryIndex() + step) * el.clientWidth, behavior: "smooth" });
  }
  function revealMap() {
    var el = $("map");
    if (el.getBoundingClientRect().top < 0) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- 封測任務 ---------- */
  var TASK_KEYS = ["near", "search", "fav", "today"];
  function doneTask(key) {
    if (state.tasks[key]) return;
    state.tasks[key] = true;
    save("nm-tasks", state.tasks);
    renderTasks();
    var n = TASK_KEYS.filter(function (k) { return state.tasks[k]; }).length;
    toast(n === 4 ? t("allDone") : t("taskDone")(t("tasks")[TASK_KEYS.indexOf(key)][0]));
  }
  function renderTasks() {
    var n = 0;
    $("taskList").innerHTML = TASK_KEYS.map(function (k, i) {
      var d = !!state.tasks[k]; if (d) n++;
      return '<li class="' + (d ? "done" : "") + '"><span class="ck">' + (d ? "✓" : i + 1) + "</span><div><strong>" + esc(t("tasks")[i][0]) + "</strong><small>" + esc(t("tasks")[i][1]) + "</small></div></li>";
    }).join("");
    $("taskCount").textContent = n + "/4";
  }

  /* ---------- 定位 ---------- */
  function locate(cb) {
    if (!navigator.geolocation) { toast(t("locFail")); return; }
    toast(t("locating"));
    navigator.geolocation.getCurrentPosition(function (pos) {
      state.me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      view.setMe(state.me.lat, state.me.lng);
      $("toast").classList.remove("show");
      cb && cb();
    }, function () {
      toast(t("locFail"));
      state.near = false; setPressed("nearBtn", false);
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }

  /* ---------- 語言與風格 ---------- */
  function applyLang() {
    document.documentElement.lang = lang === "zh" ? "zh-Hant-TW" : "en";
    document.title = t("title") + " · " + (lang === "zh" ? "開達 Kaida" : "Kaida");
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-i18n-ph")); });
    $("langBtn").textContent = t("langBtn");
    $("sourceNote").textContent = t("source")(window.NM_DATA_UPDATED);
    renderChips(); renderTasks(); render();
    if (state.selected && !$("detail").hidden) openDetail(state.selected);
  }
  // 地圖夜晚模式：記住使用者的選擇；沒選過就看台北時間，傍晚 5 點到清晨 5 點自動開
  var night = (function () {
    try { var v = localStorage.getItem("nm-night"); if (v === "1" || v === "0") return v === "1"; } catch (e) { /* 忽略 */ }
    var h = Math.floor(taipeiNow().min / 60);
    return h >= 17 || h < 5;
  })();
  function applyNight() {
    document.querySelector(".map-wrap").classList.toggle("night", night);
    $("nightBtn").setAttribute("aria-pressed", night ? "true" : "false");
    if (view.setNight) view.setNight(night);
  }
  function applySkin(skin) {
    if (skin === "cyber") document.documentElement.setAttribute("data-skin", "cyber");
    else document.documentElement.removeAttribute("data-skin");
    document.querySelector('meta[name="theme-color"]').content = skin === "cyber" ? "#07080d" : "#2a2620";
    mapOpts.skin = skin;
    view.setSkin(skin);
  }

  /* ---------- 事件 ---------- */
  var qTimer;
  $("q").addEventListener("input", function (e) {
    clearTimeout(qTimer);
    qTimer = setTimeout(function () { state.q = e.target.value; render({ fit: true }); }, 120);
  });
  $("cityChips").addEventListener("click", function (e) {
    var b = e.target.closest("[data-city]"); if (!b) return;
    state.city = b.getAttribute("data-city");
    renderChips(); render({ fit: true });
  });
  $("todayBtn").onclick = function () { state.today = !state.today; setPressed("todayBtn", state.today); render({ fit: true }); };
  $("favBtn").onclick = function () { state.favOnly = !state.favOnly; setPressed("favBtn", state.favOnly); render({ fit: true }); };
  $("nearBtn").onclick = function () {
    if (state.near) { state.near = false; setPressed("nearBtn", false); render(); return; }
    state.near = true; setPressed("nearBtn", true);
    locate(function () {
      render();
      var first = visible()[0];
      if (first) { view.clearArea(); view.fit([[state.me.lat, state.me.lng], [first.lat, first.lng]], 15); doneTask("near"); }
    });
  };
  $("locateBtn").onclick = function () { locate(function () { view.fit([[state.me.lat, state.me.lng]], 14); render(); }); };

  $("list").addEventListener("click", function (e) {
    var s = e.target.closest("[data-fav]");
    if (s) { e.stopPropagation(); toggleFav(s.getAttribute("data-fav")); return; }
    var it = e.target.closest("[data-id]"); if (it) openDetail(it.getAttribute("data-id"));
  });
  $("list").addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".item")) { e.preventDefault(); openDetail(e.target.getAttribute("data-id")); }
  });

  document.querySelectorAll(".sheet").forEach(function (sh) {
    sh.addEventListener("click", function (e) { if (e.target === sh || e.target.closest("[data-close]")) closeSheet(sh); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.querySelectorAll(".sheet:not([hidden])").forEach(closeSheet);
  });

  $("dFav").onclick = function () { if (state.selected) toggleFav(state.selected); };
  $("dShare").onclick = function () {
    var m = MARKETS.filter(function (x) { return x.id === state.selected; })[0]; if (!m) return;
    var url = location.origin + location.pathname + "#" + m.id;
    if (navigator.share) navigator.share({ title: name(m), text: t("shareText")(name(m)), url: url }).catch(function () {});
    else copy(url).then(function () { toast(t("copied")); });
  };
  $("dReport").onclick = function () {
    var m = MARKETS.filter(function (x) { return x.id === state.selected; })[0]; if (!m) return;
    closeSheet($("detail"));
    var ta = $("fbText");
    ta.value = t("reportPre")(m.zh) + (ta.value ? "\n" + ta.value : "");
    openSheet("tasks");
    ta.focus(); ta.setSelectionRange(t("reportPre")(m.zh).length, t("reportPre")(m.zh).length);
  };

  $("dStalls").addEventListener("click", function (e) {
    if (e.target.closest("#dStallMore")) { loadMoreStalls(); return; }
    if (e.target.closest("#dStallLoad")) { if (byId(stallFor)) loadStalls(byId(stallFor)); return; }
    var b = e.target.closest("[data-stall]"); if (b) openStall(b.getAttribute("data-stall"));
  });
  $("dStallQ").addEventListener("input", function () {
    stallQ = this.value.trim();
    clearTimeout(stallTimer);
    renderStalls();
    stallTimer = setTimeout(searchStalls, 600);
  });
  $("dStallQ").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); clearTimeout(stallTimer); searchStalls(); this.blur(); }
  });
  $("dSeeMap").onclick = function () { closeSheet($("detail")); revealMap(); };
  $("sBack").onclick = function () { closeSheet($("stall")); if (stallFor) { openDetail(stallFor); } };
  $("gPrev").onclick = function () { goPhoto(-1); };
  $("gNext").onclick = function () { goPhoto(1); };
  var gTimer;
  $("sPhotos").addEventListener("scroll", function () { clearTimeout(gTimer); gTimer = setTimeout(updateGallery, 60); }, { passive: true });
  // 滑鼠拖曳也能換張
  (function () {
    var el = $("sPhotos"), x0 = null, s0 = 0, moved = false;
    el.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; x0 = e.clientX; s0 = el.scrollLeft; moved = false; el.classList.add("dragging"); });
    window.addEventListener("pointermove", function (e) { if (x0 === null) return; var d = e.clientX - x0; if (Math.abs(d) > 4) moved = true; el.scrollLeft = s0 - d; });
    window.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var d = e.clientX - x0; x0 = null; el.classList.remove("dragging");
      var w = el.clientWidth, i = Math.round(s0 / w) + (d < -40 ? 1 : d > 40 ? -1 : 0);
      el.scrollTo({ left: i * w, behavior: "smooth" });
    });
    el.addEventListener("click", function (e) { if (moved && e.target.tagName !== "A") { e.preventDefault(); moved = false; } }, true);
    el.addEventListener("dragstart", function (e) { e.preventDefault(); });
  })();
  $("tasksBtn").onclick = function () { renderTasks(); openSheet("tasks"); };
  $("fbText").value = load("nm-feedback-draft", "");
  $("fbText").addEventListener("input", function (e) { save("nm-feedback-draft", e.target.value); });
  $("fbSave").onclick = function () {
    var v = $("fbText").value.trim();
    if (!v) { toast(t("fbEmpty")); return; }
    var all = load("nm-feedback", []);
    all.push({ at: new Date().toISOString(), text: v, tasks: state.tasks, lang: lang });
    save("nm-feedback", all);
    var done = TASK_KEYS.filter(function (k) { return state.tasks[k]; }).length;
    copy("#開達封測 " + t("title") + "（" + done + "/4）\n" + v + "\n" + location.origin + location.pathname);
    $("fbText").value = ""; save("nm-feedback-draft", "");
    toast(t("fbSaved"));
  };
  $("fbReset").onclick = function () { state.tasks = {}; save("nm-tasks", state.tasks); renderTasks(); toast(t("resetDone")); };

  $("langBtn").onclick = function () {
    lang = lang === "zh" ? "en" : "zh";
    stallFor = null; stalls = []; view.clearArea();
    if (view.setLang) setTimeout(view.setLang, 0);
    try { localStorage.setItem("kaida-lang", lang); } catch (e) { /* 忽略 */ }
    applyLang();
  };
  $("nightBtn").onclick = function () {
    night = !night;
    try { localStorage.setItem("nm-night", night ? "1" : "0"); } catch (e) { /* 忽略 */ }
    applyNight();
  };
  $("skinBtn").onclick = function () {
    var next = document.documentElement.getAttribute("data-skin") === "cyber" ? "beige" : "cyber";
    applySkin(next);
    try { localStorage.setItem("kaida-skin", next); } catch (e) { /* 忽略 */ }
  };

  window.addEventListener("hashchange", function () {
    var id = location.hash.slice(1);
    if (id && id !== state.selected) openDetail(id);
  });

  /* ---------- 開始 ---------- */
  applySkin(document.documentElement.getAttribute("data-skin") === "cyber" ? "cyber" : "beige");
  applyNight();
  applyLang();
  startMap();
  // 每分鐘更新營業狀態
  setInterval(function () { render(); }, 60000);
  var startId = location.hash.slice(1);
  if (startId && MARKETS.some(function (m) { return m.id === startId; })) openDetail(startId);
})();
