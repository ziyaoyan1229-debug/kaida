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
      warn: "營業時間與攤位常有變動，請以現場為準。", navigate: "Google 地圖導航", navigateApple: "Apple 地圖導航", share: "分享", report: "回報資料錯誤",
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
      allReviews: "在 Google 地圖看全部評論", photoBy: "照片：", prevPhoto: "上一張", nextPhoto: "下一張", reviewsFrom: "照片、評論與店家資料來自 Google 地圖，開達不會修改或保存。", night: "夜市夜景", toDay: "切換成白天模式", toNight: "切換成夜晚模式", regions: "地區", cities: "縣市", wholeRegion: "全區",
      stallQPh: "在這個夜市找店家（例如：臭豆腐）", stallFound: function (n, q) { return "「" + q + "」找到 " + n + " 家"; },
      stallNoMatch: function (q) { return "這個夜市沒找到「" + q + "」，換個關鍵字試試。"; }, stallSearching: "也在 Google 地圖上找…",
      stallRelated: function (n, q) { return "店名裡沒有「" + q + "」，以下 " + n + " 家是 Google 地圖依評論和菜單找到的相關店家"; },
      stallMore: function (n) { return "還有 " + n + " 家攤位，點這裡載入店名"; }, stallMoreBusy: "載入中…",
      contribBtn: "＋ 投稿攤位、心得或照片", contribTitle: "投稿攤位、心得或照片", pickHint: "點一下地圖上攤位的位置", cancel: "取消",
      fStall: "攤位名稱 *", fFoods: "招牌小吃（用逗號分開）", fPrice: "價格", fRating: "你的評分", fWhere: "位置說明", fPick: "在地圖上標位置",
      fReview: "你的心得", fPhotos: "照片（最多 4 張，限自己拍的）", fNick: "暱稱 *（會顯示在投稿上）",
      fConsent: "我同意以 CC BY-SA 4.0 授權這篇投稿（可自由使用，但要標示作者），而且文字和照片都是我自己寫、自己拍的。",
      fSend: "送出投稿", fNote: "投稿會先經過審核，通過後才會出現在網站上。", fLocSet: "已標好位置 ✓",
      fNeedStall: "請填攤位名稱。", fNeedNick: "請填暱稱。", fNeedConsent: "請勾選同意授權。", fNeedSome: "請至少寫心得、招牌小吃、標位置或附照片其中一項。",
      fTooMany: "照片最多 4 張。", fUploading: function (i, n) { return "上傳照片 " + i + "/" + n + "…"; }, fSending: "送出中…",
      fDone: "謝謝你的投稿！審核通過後就會出現在網站上。", fErr: "送出失敗，請稍後再試。", fLimited: "投稿太頻繁了，請過一陣子再試。",
      commTitle: "饕客心得", commCount: function (n) { return n + " 篇"; }, commEmpty: "還沒有饕客心得，按「踩點評分」寫第一篇。", commBadge: "網友新增",
      sTaste: "味蕾度", sAroma: "香氣", sAttitude: "態度", sCp: "CP 值", sVisual: "視覺", sVibe: "氛圍", sTotal: "綜合", sCount: function (n) { return n + " 人評"; },
      medalGold: "開拓者", medalReview: "開拓者・審核中", medalSilver: "探險家", medalBronze: "朝聖者", fScores: "評分（0–10）*", fNeedScores: "六項評分都要選。",
      fNeedPhoto: "拿開拓者或探險家勳章要附一張照片，沒照片會是朝聖者。", fGoldReview: "開拓者要審核通過才會頒發。", fNeedLoc: "新點位要在地圖上標出位置，才能拿開拓者。", fWillGet: function (m) { return "這篇會拿到：" + m; },
      medalRule: "開拓者（金）：第一個發掘新點位的人，要標位置、拍照＋評分，審核通過才算。探險家（銀）：第一個踩點的人，要拍照＋評分。朝聖者（銅）：之後去踩點並評分的人。",
      devShort: "評分", radarDefault: "還沒有網友評分，先顯示開發者給的預設分數。", radarFrom: function (n) { return n + " 位網友評分的平均。"; }, visitBtn: "📍 踩點評分", visitTitle: "踩點評分", localTag: "未送出",
      fSaved: "還沒連上投稿資料庫，先存在這支手機。連線後會自動送出。", fSyncing: function (n) { return "正在送出先前存的 " + n + " 篇投稿…"; },
      mineMedals: "我的勳章", seasonPts: function (n) { return "本季積分 " + n + " 分"; }, rankBtn: "🏆 本季排行榜",
      rankTitle: function (y, q) { return y + " 年第 " + q + " 季排行榜"; }, rankPrize: "本季的第一名可以和開發者去逛夜市🤗",
      rankRule: "積分：開拓者 30 分、探險家 10 分、朝聖者 3 分，只算本季審核通過的投稿。", rankEmpty: "本季還沒有人得分，第一名等你來拿。",
      rankOffline: "連上投稿資料庫後才看得到大家的排名，下面先顯示你自己的。", rankMe: "你", rankPts: function (n) { return n + " 分"; }, mineNoMedals: "還沒有勳章。到夜市踩點、拍照、評分就能拿到。", commBy: function (n, d) { return n + " · " + d; },
      picksTitle: "網友推薦攤位", picksNote: "整理自網友的部落格和文章，用我們自己的話摘要，點「來源」可以看原文。攤位資訊可能有變動。",
      picksMentions: function (n) { return n + " 篇推薦"; }, picksMap: "Google 地圖", picksApple: "Apple 地圖", picksSrc: "來源", mineTitle: "我的收藏", mineFavs: "想去的夜市", mineLikes: "喜愛的店家", mineNote: "收藏只存在這支手機的瀏覽器裡。", mineNoFavs: "還沒有。在夜市頁按「☆ 加入想去」就會出現在這裡。", mineNoLikes: "還沒有。在推薦攤位按 ♡ 就會出現在這裡。", like: "喜愛這家店", unlike: "取消喜愛", unfav: "取消想去",
      stallFree: function (n) { return "地圖上標了 " + n + " 個攤位。有編號和店名的是下面的推薦攤位，點了會跳到介紹；其他圖釘點了會打開 Google 地圖。"; },
      stallLoad: function (n) { return n ? "地圖上標了 " + n + " 個攤位，點這裡載入店名和評分" : "點這裡從 Google 地圖載入店家和評分"; }
    },
    en: {
      title: "Taiwan Night Market Map", byKaida: "A Kaida beta project", tasksBtn: "Beta tasks",
      searchPh: "Search markets, cities or food (e.g. oyster omelette)", all: "All", today: "Open today", near: "Nearest", favs: "Want to go",
      mustEat: "Must-eat", openDays: "Open days", hours: "Hours (approx.)", transit: "Getting there", distance: "Distance",
      warn: "Hours and stalls change often. Please check on site.", navigate: "Directions in Google Maps", navigateApple: "Directions in Apple Maps", share: "Share", report: "Report an error",
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
      allReviews: "See all reviews on Google Maps", photoBy: "Photo:", reviewsFrom: "Photos, reviews and place info come from Google Maps. Kaida doesn't edit or store them.", night: "Night", toDay: "Switch to day mode", toNight: "Switch to night mode", regions: "Regions", cities: "Cities", wholeRegion: "Whole region",
      stallQPh: "Search this market (e.g. stinky tofu)", stallFound: function (n, q) { return n + " found for “" + q + "”"; },
      stallNoMatch: function (q) { return "Nothing for “" + q + "” here. Try another word."; }, stallSearching: "Also searching Google Maps…",
      stallRelated: function (n, q) { return "No name mentions “" + q + "”. These " + n + " places come up on Google Maps from reviews and menus."; },
      stallMore: function (n) { return n + " more stalls on the map. Tap to load their names"; }, stallMoreBusy: "Loading…",
      contribBtn: "+ Add a stall, review or photo", contribTitle: "Add a stall, review or photo", pickHint: "Tap the stall's spot on the map", cancel: "Cancel",
      fStall: "Stall name *", fFoods: "Signature items (comma separated)", fPrice: "Price", fRating: "Your rating", fWhere: "Where", fPick: "Mark it on the map",
      fReview: "Your review", fPhotos: "Photos (up to 4, your own only)", fNick: "Nickname * (shown with your post)",
      fConsent: "I license this post under CC BY-SA 4.0 (free to reuse with credit), and I wrote the text and took the photos myself.",
      fSend: "Submit", fNote: "Posts are reviewed before they appear on the site.", fLocSet: "Location set ✓",
      fNeedStall: "Please enter the stall name.", fNeedNick: "Please enter a nickname.", fNeedConsent: "Please tick the license box.", fNeedSome: "Add at least a review, items, a location or a photo.",
      fTooMany: "Up to 4 photos.", fUploading: function (i, n) { return "Uploading photo " + i + "/" + n + "…"; }, fSending: "Sending…",
      fDone: "Thanks! Your post will appear once it's reviewed.", fErr: "Couldn't send. Please try again later.", fLimited: "Too many posts. Please try again later.",
      commTitle: "Foodie notes", commCount: function (n) { return n + (n === 1 ? " note" : " notes"); }, commEmpty: "No foodie notes yet. Tap “Rate this stall” to write the first one.", commBadge: "Added by visitors",
      sTaste: "Taste", sAroma: "Aroma", sAttitude: "Service", sCp: "Value", sVisual: "Looks", sVibe: "Vibe", sTotal: "Score", sCount: function (n) { return n + (n === 1 ? " rating" : " ratings"); },
      medalGold: "Pioneer", medalReview: "Pioneer · in review", medalSilver: "Explorer", medalBronze: "Pilgrim", fScores: "Scores (0–10) *", fNeedScores: "Please pick all six scores.",
      fNeedPhoto: "Pioneer and Explorer medals need a photo. Without one you get Pilgrim.", fGoldReview: "Pioneer is awarded once the post is approved.", fNeedLoc: "Mark the new spot on the map to earn Pioneer.", fWillGet: function (m) { return "This post earns: " + m; },
      medalRule: "Pioneer (gold): first to discover a new spot, with its location, a photo and scores. Counts once approved. Explorer (silver): first visit with a photo and scores. Pilgrim (bronze): later visits with scores.",
      devShort: "Score", radarDefault: "No visitor ratings yet, so these are the developer's default scores.", radarFrom: function (n) { return "Average of " + n + (n === 1 ? " visitor rating." : " visitor ratings."); }, visitBtn: "📍 Rate this stall", visitTitle: "Rate this stall", localTag: "not sent yet",
      fSaved: "Not connected yet, so it's saved on this phone. It will be sent once we're online.", fSyncing: function (n) { return "Sending " + n + " saved posts…"; },
      mineMedals: "My medals", seasonPts: function (n) { return "This season: " + n + " pts"; }, rankBtn: "🏆 Season leaderboard",
      rankTitle: function (y, q) { return y + " Q" + q + " leaderboard"; }, rankPrize: "This season's No. 1 gets to explore a night market with the developer 🤗",
      rankRule: "Points: Pioneer 30, Explorer 10, Pilgrim 3. Only this season's approved posts count.", rankEmpty: "No points yet this season. The top spot is yours to take.",
      rankOffline: "The full ranking shows once we're connected. Here's yours for now.", rankMe: "You", rankPts: function (n) { return n + " pts"; }, mineNoMedals: "No medals yet. Visit a stall, take a photo and rate it to earn one.", commBy: function (n, d) { return n + " · " + d; },
      picksTitle: "Stalls locals recommend", picksNote: "Compiled from blogs and posts, summarized in our own words. Tap a source number to read the original. Details may change.",
      picksMentions: function (n) { return n + " recommendations"; }, picksMap: "Google Maps", picksApple: "Apple Maps", picksSrc: "Sources", mineTitle: "My saved", mineFavs: "Markets to visit", mineLikes: "Liked stalls", mineNote: "Saved only in this browser on this device.", mineNoFavs: "Nothing yet. Tap “☆ Save” on a market.", mineNoLikes: "Nothing yet. Tap ♡ on a recommended stall.", like: "Like this stall", unlike: "Unlike", unfav: "Remove from saved",
      stallFree: function (n) { return n + " stalls are marked on the map. Numbered pins with names are the picks below, and tapping one jumps to its card. Other pins open in Google Maps."; },
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
    q: "", region: "all", city: "all", today: false, near: false, favOnly: false,
    favs: load("nm-favs", []), likes: load("nm-likes", []), tasks: load("nm-tasks", {}), me: null, selected: null
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
  // 每個夜市的攤位放在 curated/<id>.json，點開夜市才下載；搜尋用 curated-index.js 的關鍵字
  var picksCache = {}, picksLoading = {};
  function picksOf(m) { return picksCache[m.id] || []; }
  function loadPicks(m) {
    if (picksCache[m.id]) return Promise.resolve();
    if (picksLoading[m.id]) return picksLoading[m.id];
    var idx = window.NM_CURATED_INDEX;
    if (!idx || !idx.markets || !idx.markets[m.id]) { picksCache[m.id] = []; return Promise.resolve(); }
    return picksLoading[m.id] = fetch("curated/" + m.id + ".json?v=" + encodeURIComponent(idx.updated || "")).then(function (r) { return r.ok ? r.json() : { stalls: [] }; })
      .catch(function () { return null; })
      .then(function (d) {
        picksLoading[m.id] = null;
        if (!d) return;
        picksCache[m.id] = d.stalls || [];
        if (state.selected === m.id && !$("detail").hidden) renderPicks(m);
        if (stallFor === m.id && stallMode === "free" && stalls.length && view.showPicks) view.showPicks(pickPins(m));
      });
  }
  // 網友投稿（審核通過的），依夜市存
  var comm = {};
  function nameCore(x) { return String(x || "").replace(/[（(].*?[）)]/g, "").replace(/\s+/g, "").toLowerCase(); }
  // 同一家店：名字互相包含，或短的那個有六成以上的兩字詞出現在長的裡（「鍾記生煎包」對「鍾記原上海生煎包」）
  function sameName(a, b) {
    a = nameCore(a); b = nameCore(b);
    if (!a || !b) return false;
    if (a.indexOf(b) >= 0 || b.indexOf(a) >= 0) return true;
    var s = a.length <= b.length ? a : b, l = s === a ? b : a, n = 0;
    if (s.length < 3) return false;
    for (var i = 0; i < s.length - 1; i++) if (l.indexOf(s.slice(i, i + 2)) >= 0) n++;
    return n / (s.length - 1) >= 0.6;
  }
  // 每筆投稿對到哪個推薦攤位（對不到就是網友新增的攤位）
  function commSplit(m) {
    var picks = picksOf(m), byPick = {}, extra = [];
    (comm[m.id] || []).forEach(function (c) {
      var i = -1;
      picks.forEach(function (p, k) { if (i < 0 && sameName(p.zh, c.stall)) i = k; });
      if (i >= 0) (byPick[i] = byPick[i] || []).push(c);
      else {
        var g = extra.filter(function (e) { return sameName(e.stall, c.stall); })[0];
        if (g) g.items.push(c); else extra.push({ stall: c.stall, items: [c] });
      }
    });
    return { byPick: byPick, extra: extra };
  }
  // 還沒連上資料庫時，投稿先存在這支手機（照片縮小成內嵌圖），連線後自動送出
  var pending = load("nm-pending", []);
  function localFor(mid) { return pending.filter(function (c) { return c.market === mid; }); }
  function savePending() {
    try { localStorage.setItem("nm-pending", JSON.stringify(pending)); return true; } catch (e) { return false; }
  }
  function remoteComm(mid) {
    return (window.NMCommunity && NMCommunity.enabled() ? NMCommunity.load(mid) : Promise.resolve([])).then(function (list) { return (list || []).concat(localFor(mid)); });
  }
  function flushPending() {
    if (!pending.length || !window.NMCommunity || !NMCommunity.enabled()) return;
    toast(t("fSyncing")(pending.length));
    pending.slice().reduce(function (p, c) {
      return p.then(function () {
        var urls = [];
        return c.photos.filter(Boolean).reduce(function (q, d) {
          return q.then(function () { return fetch(d).then(function (r) { return r.blob(); }).then(NMCommunity.uploadPhoto).then(function (u) { urls.push(u); }); });
        }, Promise.resolve()).then(function () {
          var row = {};
          Object.keys(c).forEach(function (k) { if (k !== "id" && k !== "local" && k !== "created_at") row[k] = c[k]; });
          row.photos = urls;
          return NMCommunity.submit(row);
        }).then(function () { pending.splice(pending.indexOf(c), 1); savePending(); });
      });
    }, Promise.resolve()).catch(function (e) { console.warn("[pending]", e); });
  }
  function loadComm(m) {
    remoteComm(m.id).then(function (list) {
      comm[m.id] = list;
      if (state.selected !== m.id) return;
      renderPicks(m);
      if (stallMode === "free" && stalls.length && view.showPicks) view.showPicks(pickPins(m));
    });
  }
  // 四項評分加權成 0–10 分：好不好吃最重要，其次是划不划算
  var WEIGHTS = { taste: 0.35, cp: 0.25, aroma: 0.12, attitude: 0.12, visual: 0.08, vibe: 0.08 };
  var SCORE_KEYS = ["taste", "aroma", "attitude", "cp", "visual", "vibe"];
  function scored(c) { return ["taste", "aroma", "attitude", "cp"].every(function (k) { return c[k] != null; }); }
  // 早期投稿沒有視覺、氛圍，就用有的項目按比例算
  function score(c) {
    var w = 0, s = 0;
    Object.keys(WEIGHTS).forEach(function (k) { if (c[k] != null) { w += WEIGHTS[k]; s += WEIGHTS[k] * c[k]; } });
    return w ? s / w : 0;
  }
  var PHOTO_RE = /^(https:\/\/|data:image\/)/;
  function hasPhoto(c) { return (c.photos || []).some(function (u) { return PHOTO_RE.test(u); }); }
  // 勳章：依投稿先後。開拓者＝第一個新增攤位（或替沒位置的攤位補上位置）的人；探險家＝第一個踩點的人；兩者都要照片＋評分。朝聖者＝其他有評分的人
  function medals(items, newStall, hadLoc) {
    var gold = false, silver = false;
    return items.slice().sort(function (a, b) { return String(a.created_at).localeCompare(String(b.created_at)); }).reduce(function (o, c) {
      if (!scored(c)) return o;
      // 開拓者是發掘新點位：一定要標位置，而且要審核通過才算（還沒送出或審核中的只顯示「審核中」）
      var pioneer = (newStall || !hadLoc) && c.lat != null;
      if (!gold && pioneer && hasPhoto(c)) { if (c.local) o[c.id] = "review"; else { gold = true; o[c.id] = "gold"; } }
      else if (!silver && !pioneer && hasPhoto(c)) { silver = true; o[c.id] = "silver"; }
      else o[c.id] = "bronze";
      return o;
    }, {});
  }
  var MEDAL_ICON = { gold: "🥇", silver: "🥈", bronze: "🥉", review: "🥇" };
  function medalHtml(k) { return k === "review" ? '<span class="medal review">🥇 ' + esc(t("medalReview")) + "</span>" : k ? '<span class="medal ' + k + '">' + MEDAL_ICON[k] + " " + esc(t("medal" + k.charAt(0).toUpperCase() + k.slice(1))) + "</span>" : ""; }
  function commHtml(items, newStall, hadLoc) {
    var md = medals(items, newStall, hadLoc);
    return '<details class="pick-comm-wrap"><summary>' + esc(t("commTitle")) + " · " + esc(t("commCount")(items.length)) + '</summary><ul class="pick-comm">' + items.map(function (c) {
      var photos = (c.photos || []).filter(function (u) { return PHOTO_RE.test(u); });
      return '<li' + (c.local ? ' class="local"' : "") + ">" + (c.local ? '<span class="local-tag">' + esc(t("localTag")) + "</span> " : "") + (scored(c) ? '<b class="score">' + score(c).toFixed(1) + "</b> " : c.rating ? stars(c.rating) + " " : "") + medalHtml(md[c.id]) + '<span class="who">' + esc(t("commBy")(c.nickname || "", String(c.created_at || "").slice(0, 10))) + "</span>" +
        (scored(c) ? radarSvg([c], true) : "") +
        (c.review ? '<p class="comm-text">' + esc(c.review) + "</p>" : "") +
        (photos.length ? '<div class="comm-photos">' + photos.map(function (u) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener"><img src="' + esc(u) + '" alt="" loading="lazy"></a>'; }).join("") + "</div>" : "") +
        "</li>";
    }).join("") + "</ul></details>";
  }

  // 推薦攤位在地圖上的位置（資料檔裡用 Google 地點編號對到的座標）
  function pickLoc(m) {
    var db = window.NM_STALL_DB, e = db && db.markets && db.markets[m.id], out = {};
    ((e && e.picks) || []).forEach(function (r) { out[r[0]] = { id: r[1], lat: r[2], lng: r[3] }; });
    return out;
  }
  function pickPins(m) {
    var loc = pickLoc(m), en = lang === "en";
    var cs = commSplit(m);
    function commLoc(items) { return items.filter(function (c) { return c.lat != null && c.lng != null; })[0]; }
    var pins = picksOf(m).map(function (p, i) {
      var l = loc[p.zh] || commLoc(cs.byPick[i] || []);
      return l ? { key: i, no: i + 1, name: en ? (p.en || p.zh) : p.zh, id: l.id || "", lat: l.lat, lng: l.lng } : null;
    });
    cs.extra.forEach(function (g, j) {
      var l = commLoc(g.items);
      if (l) pins.push({ key: "c" + j, no: "+", name: g.stall, id: "", lat: l.lat, lng: l.lng, kind: "community" });
    });
    return pins.filter(Boolean);
  }
  function openPick(i) {
    if (!stallFor) return;
    if ($("detail").hidden) openDetail(stallFor);
    var el = $("pick-" + i);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  }
  // 店名旁的評分：還沒有網友評分時預設 10 分（開發者給的），有了就顯示網友的綜合分數
  function devScore(p, items) {
    var rs = (items || []).filter(scored);
    var v = rs.length ? (rs.reduce(function (s, c) { return s + score(c); }, 0) / rs.length).toFixed(1) : (p.dev != null ? p.dev : 10);
    return '<span class="dev-score">' + esc(t("devShort")) + " <b>" + v + "</b></span>";
  }
  // 六角雷達圖：六項平均分數，沒人評過的項目用預設 10 分
  function radarSvg(items, small) {
    var rs = (items || []).filter(scored), R = 70, cx = 110, cy = 92;
    var total = rs.length ? rs.reduce(function (s, c) { return s + score(c); }, 0) / rs.length : 10;
    var vals = SCORE_KEYS.map(function (k) { var v = rs.filter(function (c) { return c[k] != null; }); return v.length ? v.reduce(function (s, c) { return s + c[k]; }, 0) / v.length : total; });
    function pt(i, r) { var a = -Math.PI / 2 + i * Math.PI / 3; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
    function poly(r) { return SCORE_KEYS.map(function (k, i) { return pt(i, typeof r === "function" ? r(i) : r).map(function (n) { return n.toFixed(1); }).join(","); }).join(" "); }
    var grid = [0.25, 0.5, 0.75, 1].map(function (f) { return '<polygon class="rg" points="' + poly(R * f) + '"/>'; }).join("");
    var axes = SCORE_KEYS.map(function (k, i) { var e = pt(i, R); return '<line class="rg" x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) + '"/>'; }).join("");
    var labels = SCORE_KEYS.map(function (k, i) {
      var e = pt(i, R + 16), anchor = Math.abs(e[0] - cx) < 4 ? "middle" : e[0] > cx ? "start" : "end";
      return '<text x="' + e[0].toFixed(1) + '" y="' + (e[1] + 4).toFixed(1) + '" text-anchor="' + anchor + '">' + esc(t("s" + k.charAt(0).toUpperCase() + k.slice(1))) + " " + vals[i].toFixed(vals[i] % 1 ? 1 : 0) + "</text>";
    }).join("");
    return '<div class="radar' + (small ? " small" : "") + '"><svg viewBox="0 0 220 184" role="img" aria-label="' + esc(t("devShort")) + '">' + grid + axes +
      '<polygon class="rv" points="' + poly(function (i) { return R * vals[i] / 10; }) + '"/>' + labels +
      '<text class="rt" x="' + cx + '" y="' + (cy + 9) + '" text-anchor="middle">' + total.toFixed(total % 1 ? 1 : 0) + "</text></svg>" +
      (small ? "" : '<p class="fine">' + esc(rs.length ? t("radarFrom")(rs.length) : t("radarDefault")) + "</p>") + "</div>";
  }
  function visitBtn(zh) { return window.NMCommunity ? '<button class="btn visit-btn" type="button" data-visit="' + esc(zh) + '">' + esc(t("visitBtn")) + "</button>" : ""; }
  function renderPicks(m) {
    var list = picksOf(m).slice(), cs = commSplit(m);
    $("dPicksWrap").hidden = !list.length && !cs.extra.length;
    $("dContrib").hidden = !window.NMCommunity;
    var en = lang === "en";
    // 主頁搜尋的關鍵字（例如「臭豆腐」）對到的攤位排前面
    var words = state.q.trim().toLowerCase().split(/\s+/).filter(function (w) { return w && (m.zh + " " + m.en + " " + cityName(m.city)).toLowerCase().indexOf(w) < 0; });
    function hit(p) { var h = [p.zh, p.en].concat(p.foods || [], p.foodsEn || []).join(" ").toLowerCase(); return words.length && words.some(function (w) { return h.indexOf(w) >= 0; }); }
    var loc = pickLoc(m), all = picksOf(m);
    function liked(p) { return state.likes.indexOf(m.id + "|" + p.zh) >= 0; }
    // 搜尋命中的排最前面，再來是自己按過愛心的
    list.sort(function (a, b) { return (hit(b) ? 2 : 0) + (liked(b) ? 1 : 0) - (hit(a) ? 2 : 0) - (liked(a) ? 1 : 0); });
    $("dPicks").innerHTML = list.map(function (p) {
      var name = en ? (p.en || p.zh) : p.zh, sub = en ? (p.en ? p.zh : "") : (p.en || "");
      var foods = (en && p.foodsEn && p.foodsEn.length ? p.foodsEn : p.foods) || [];
      var meta = [p.price, p.where, p.mentions ? t("picksMentions")(p.mentions) : ""].filter(Boolean).join(" · ");
      var gq = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.zh + " " + m.zh.replace(/（.*）/, ""));
      // Apple 地圖：在夜市附近搜尋這家店，免費、不用金鑰
      var aq = "https://maps.apple.com/?q=" + encodeURIComponent(p.zh) + "&sll=" + m.lat + "," + m.lng + "&z=16";
      var src = (p.sources || []).map(function (x, i) { return '<a href="' + esc(x.url) + '" target="_blank" rel="noopener" title="' + esc(x.title || "") + '">' + (i + 1) + "</a>"; }).join(" ");
      var ph = p.photo && p.photo.url ? '<figure class="pick-ph"><img src="' + esc(p.photo.url) + '" alt="' + esc(name) + '" loading="lazy" onerror="this.parentNode.remove()"><figcaption><a href="' + esc(p.photo.page || p.photo.url) + '" target="_blank" rel="noopener">' + esc(t("photoBy")) + " " + esc(p.photo.author || "") + " · " + esc(p.photo.license || "") + "</a></figcaption></figure>" : "";
      var no = all.indexOf(p);
      var lk = liked(p);
      return '<li class="pick' + (hit(p) ? " hit" : "") + '" id="pick-' + no + '">' + ph + '<div class="pick-body">' +
        '<button class="like-btn" type="button" data-like="' + esc(p.zh) + '" aria-pressed="' + lk + '" aria-label="' + esc(t(lk ? "unlike" : "like")) + '">' + (lk ? "♥" : "♡") + "</button><h4>" + (loc[p.zh] ? '<span class="pick-no">' + (no + 1) + "</span>" : "") + esc(name) + (sub ? " <small>" + esc(sub) + "</small>" : "") + devScore(p, cs.byPick[no]) + "</h4>" + radarSvg(cs.byPick[no]) +
        (foods.length ? '<ul class="foods">' + foods.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" : "") +
        '<p class="pick-sum">' + esc(en ? (p.summaryEn || p.summaryZh) : p.summaryZh) + "</p>" +
        // 網友原文只引用一兩句（合理引用），一定附上出處
        (p.quotes || []).filter(function (q) { return q.text && p.sources && p.sources[q.src]; }).slice(0, 2).map(function (q) {
          var sx = p.sources[q.src];
          return '<blockquote class="pick-q">「' + esc(q.text) + '」<cite><a href="' + esc(sx.url) + '" target="_blank" rel="noopener">' + esc(sx.title || t("picksSrc")) + "</a></cite></blockquote>";
        }).join("") +
        (meta ? '<p class="pick-meta">' + esc(meta) + "</p>" : "") +
        '<p class="pick-links"><a href="' + gq + '" target="_blank" rel="noopener">' + esc(t("picksMap")) + '</a><a href="' + aq + '" target="_blank" rel="noopener">' + esc(t("picksApple")) + "</a>" + (src ? ' <span>' + esc(t("picksSrc")) + " " + src + "</span>" : "") + "</p>" + visitBtn(p.zh) +
        (cs.byPick[no] ? commHtml(cs.byPick[no], false, !!loc[p.zh]) : window.NMCommunity ? '<details class="pick-comm-wrap"><summary>' + esc(t("commTitle")) + " · " + esc(t("commCount")(0)) + '</summary><ul class="pick-comm"><li class="empty">' + esc(t("commEmpty")) + "</li></ul></details>" : "") + "</div></li>";
    }).join("") + cs.extra.map(function (g, j) {
      var foods = [];
      g.items.forEach(function (c) { (c.foods || []).forEach(function (f) { if (foods.indexOf(f) < 0) foods.push(f); }); });
      var first = g.items[0], hasLoc = g.items.some(function (c) { return c.lat != null; });
      var aq2 = "https://maps.apple.com/?q=" + encodeURIComponent(g.stall) + "&sll=" + m.lat + "," + m.lng + "&z=16";
      var gq2 = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(g.stall + " " + m.zh.replace(/（.*）/, ""));
      return '<li class="pick community" id="pick-c' + j + '"><div class="pick-body"><h4>' + (hasLoc ? '<span class="pick-no">+</span>' : "") + esc(g.stall) + '<span class="pick-badge">' + esc(t("commBadge")) + "</span></h4>" + radarSvg(g.items) +
        (foods.length ? '<ul class="foods">' + foods.slice(0, 6).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" : "") +
        ([first.price, first.where_hint].filter(Boolean).length ? '<p class="pick-meta">' + esc([first.price, first.where_hint].filter(Boolean).join(" · ")) + "</p>" : "") +
        '<p class="pick-links"><a href="' + gq2 + '" target="_blank" rel="noopener">' + esc(t("picksMap")) + '</a><a href="' + aq2 + '" target="_blank" rel="noopener">' + esc(t("picksApple")) + "</a></p>" +
        visitBtn(g.stall) + commHtml(g.items, true) + "</div></li>";
    }).join("");
  }

  /* ---------- 篩選 ---------- */
  function matches(m, q) {
    if (!q) return true;
    var hay = [m.zh, m.en, cityName(m.city), CITIES.filter(function (c) { return c.key === m.city; }).map(function (c) { return c.zh + " " + c.en; }).join(" ")]
      .concat(m.foodsZh, m.foodsEn, (window.NM_CURATED_INDEX && NM_CURATED_INDEX.markets[m.id]) || "").join(" ").toLowerCase();
    hay = hay.replace(/臺/g, "台");
    return q.toLowerCase().replace(/臺/g, "台").split(/\s+/).every(function (w) { return wordHit(hay, w); });
  }
  // 搜尋同義詞：同一組裡任何一個詞都算命中
  var SYN = [
    ["蚵仔煎", "蚵煎", "oyster omelette", "oyster omelet"], ["雞排", "炸雞排", "chicken cutlet"], ["臭豆腐", "stinky tofu"],
    ["珍珠奶茶", "珍奶", "波霸", "bubble tea", "boba"], ["鹽酥雞", "鹹酥雞", "popcorn chicken"], ["大腸包小腸", "sausage"],
    ["地瓜球", "sweet potato ball"], ["刈包", "割包", "gua bao"], ["胡椒餅", "pepper bun"], ["蔥油餅", "蔥抓餅", "scallion pancake"],
    ["滷味", "滷", "braised"], ["豆花", "tofu pudding"], ["生煎包", "水煎包", "pan-fried bun"], ["肉圓", "bawan"],
    ["剉冰", "刨冰", "挫冰", "雪花冰", "shaved ice"], ["甜不辣", "天婦羅", "tempura"], ["章魚燒", "takoyaki"],
    ["麵線", "vermicelli"], ["烤玉米", "grilled corn"], ["四神湯", "four herb"], ["燒烤", "碳烤", "炭烤", "bbq"],
    ["牛排", "steak"], ["鴨頭", "東山鴨頭"], ["車輪餅", "紅豆餅", "wheel cake"], ["雞蛋糕", "egg cake"], ["炸物", "fried"]
  ];
  function wordHit(hay, w) {
    if (!w || hay.indexOf(w) >= 0) return true;
    for (var i = 0; i < SYN.length; i++) {
      if (SYN[i].indexOf(w) >= 0 && SYN[i].some(function (s) { return hay.indexOf(s) >= 0; })) return true;
    }
    return fuzzyHit(hay, w);
  }
  // 打錯一個字也算：三個字以上的詞，允許其中一個字不同
  function fuzzyHit(hay, w) {
    var n = w.length;
    if (n < 3 || /^[\x00-\x7f]+$/.test(w) && n < 5) return false;
    for (var i = 0; i + n <= hay.length; i++) {
      var miss = 0;
      for (var j = 0; j < n && miss < 2; j++) if (hay.charCodeAt(i + j) !== w.charCodeAt(j)) miss++;
      if (miss < 2) return true;
    }
    return false;
  }
  function foodHit(m, q) {
    if (!q) return false;
    return m.foodsZh.concat(m.foodsEn).some(function (f) { return f.toLowerCase().indexOf(q.toLowerCase()) >= 0; });
  }
  function visible() {
    var q = state.q.trim();
    var list = MARKETS.filter(function (m) {
      if (state.region !== "all" && regionOf(m.city) !== state.region) return false;
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
    onStallClick: function (id) { openStall(id); },
    onPickClick: function (key) { openPick(key); },
    onRegionClick: function (key) { state.region = key; state.city = "all"; renderChips(); render({ fit: true }); }
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
    if (view.setBubbles) view.setBubbles(bubbles(list));
  }
  function fitTo(list) {
    var pts = list.map(function (m) { return [m.lat, m.lng]; });
    if (state.me && state.near && state.region === "all") pts.push([state.me.lat, state.me.lng]);
    view.clearArea(); stalls = [];
    view.fit(pts, 15);
  }

  /* ---------- 清單 ---------- */
  var REGIONS = window.NM_REGIONS || [];
  // 全台視角時把夜市依大區合成數字泡泡（只在沒選大區、而且夜市夠多時）
  function bubbles(list) {
    if (state.region !== "all" || list.length <= 15) return [];
    var g = {};
    list.forEach(function (m) { var k = regionOf(m.city); if (!k) return; (g[k] = g[k] || []).push(m); });
    return REGIONS.filter(function (r) { return g[r.key]; }).map(function (r) {
      var ms = g[r.key];
      var at = r.at || [ms.reduce(function (s, m) { return s + m.lat; }, 0) / ms.length, ms.reduce(function (s, m) { return s + m.lng; }, 0) / ms.length];
      return { key: r.key, n: ms.length, label: r[lang], lat: at[0], lng: at[1] };
    });
  }
  function regionOf(city) { var r = REGIONS.filter(function (x) { return x.cities.indexOf(city) >= 0; })[0]; return r ? r.key : ""; }
  function chip(attr, key, label, n, on) {
    return '<button class="chip" type="button" ' + attr + '="' + key + '" aria-pressed="' + on + '">' + esc(label) + "<small>" + n + "</small></button>";
  }
  function renderChips() {
    var counts = {};
    MARKETS.forEach(function (m) { counts[m.city] = (counts[m.city] || 0) + 1; });
    function sum(r) { return r.cities.reduce(function (a, c) { return a + (counts[c] || 0); }, 0); }
    var html = '<div class="chips" role="group" aria-label="' + esc(t("regions")) + '">' + chip("data-region", "all", t("all"), MARKETS.length, state.region === "all");
    REGIONS.forEach(function (r) { if (sum(r)) html += chip("data-region", r.key, r[lang], sum(r), state.region === r.key); });
    html += "</div>";
    var r = REGIONS.filter(function (x) { return x.key === state.region; })[0];
    if (r && r.cities.length > 1) {
      html += '<div class="chips sub" role="group" aria-label="' + esc(t("cities")) + '">' + chip("data-city", "all", t("wholeRegion"), sum(r), state.city === "all");
      CITIES.forEach(function (c) { if (r.cities.indexOf(c.key) >= 0 && counts[c.key]) html += chip("data-city", c.key, c[lang], counts[c.key], state.city === c.key); });
      html += "</div>";
    }
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
    state.q = ""; state.region = "all"; state.city = "all"; state.today = false; state.favOnly = false;
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
    loadPicks(m);
    loadComm(m);
    $("dFoods").innerHTML = foods(m).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    $("dDays").textContent = daysText(m);
    $("dHours").textContent = m.hours;
    $("dTransit").textContent = lang === "zh" ? m.transitZh : m.transitEn;
    if (state.me) { $("dDistRow").hidden = false; $("dDist").textContent = t("km")(distKm(state.me, m)); } else { $("dDistRow").hidden = true; }
    $("dNav").href = "https://www.google.com/maps/dir/?api=1&destination=" + m.lat + "," + m.lng;
    $("dNavApple").href = "https://maps.apple.com/?daddr=" + m.lat + "," + m.lng + "&q=" + encodeURIComponent(m.zh);
    fillFavBtn(id);
    if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    render();
    if (mapH() < 120) setMapH(0.45);
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
    loadPicks(m);
    stallQ = carryQuery(m); $("dStallQ").value = stallQ; stallHits = {};
    if (FREE_STALLS) {
      stallMode = "free"; stallQ = ""; $("dStallQ").value = "";
      stalls = (view.previewArea && view.previewArea(m)) || [];
      if (stalls.length && view.showPicks) view.showPicks(pickPins(m));
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
    if (mapH() < 120) setMapH(0.45);
    if (el.getBoundingClientRect().top < 0) window.scrollTo({ top: 0, behavior: "smooth" });
  }
  // 手機：清單上方的把手。點一下在「地圖＋清單」和「只有清單」之間切換，也可以上下拖
  var wrap = document.querySelector(".map-wrap");
  function mapH() { return wrap.getBoundingClientRect().height; }
  function setMapH(f) {
    wrap.style.setProperty("--map-h", Math.round(f * window.innerHeight) + "px");
    setTimeout(function () { window.dispatchEvent(new Event("resize")); }, 300);
  }
  (function () {
    var hd = $("panelHandle"), y0 = 0, h0 = 0, moved = false;
    hd.addEventListener("click", function () { if (moved) return; setMapH(mapH() > 40 ? 0 : 0.45); });
    hd.addEventListener("touchstart", function (e) { y0 = e.touches[0].clientY; h0 = mapH(); moved = false; wrap.classList.add("dragging"); }, { passive: true });
    hd.addEventListener("touchmove", function (e) {
      var dy = e.touches[0].clientY - y0;
      if (Math.abs(dy) > 6) moved = true;
      wrap.style.setProperty("--map-h", Math.max(0, Math.min(window.innerHeight * 0.75, h0 + dy)) + "px");
      e.preventDefault();
    }, { passive: false });
    hd.addEventListener("touchend", function () {
      wrap.classList.remove("dragging");
      if (!moved) return;
      var f = mapH() / window.innerHeight;
      setMapH([0, 0.45, 0.72].reduce(function (b, s) { return Math.abs(s - f) < Math.abs(b - f) ? s : b; }, 0.45));
      setTimeout(function () { moved = false; }, 50);
    });
  })();

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
  // 白天／夜晚模式：夜晚用深色介面加夜市夜景地圖（index.html 開頭已依記住的選擇或台北時間先設好）
  var night = document.documentElement.getAttribute("data-skin") === "cyber";
  function applyNight() {
    document.querySelector(".map-wrap").classList.toggle("night", night);
    $("skinBtn").setAttribute("aria-pressed", night ? "true" : "false");
    $("skinBtn").title = t(night ? "toDay" : "toNight");
    if (view.setNight) view.setNight(night);
  }
  function applySkin(skin) {
    if (skin === "cyber") document.documentElement.setAttribute("data-skin", "cyber");
    else document.documentElement.removeAttribute("data-skin");
    document.querySelector('meta[name="theme-color"]').content = skin === "cyber" ? "#0d0a1c" : "#2a2620";
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
    var b = e.target.closest("[data-region],[data-city]"); if (!b) return;
    if (b.hasAttribute("data-region")) { state.region = b.getAttribute("data-region"); state.city = "all"; if (mapH() < 120) setMapH(0.45); }
    else state.city = b.getAttribute("data-city");
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

  setTimeout(flushPending, 3000);
  $("reloadBtn").onclick = function () { location.reload(); };

  /* ---------- 網友投稿表單 ---------- */
  var formFor = null, formLoc = null;
  function fMsg(text, kind) { $("fMsg").textContent = text || ""; $("fMsg").className = "f-msg" + (kind ? " " + kind : ""); }
  function openSubmit(visit) {
    var m = byId(stallFor || state.selected);
    if (!m || !window.NMCommunity) return;
    if (formFor !== m.id || visit || $("fForm").classList.contains("visit")) { $("fForm").reset(); formLoc = null; $("fLoc").textContent = ""; formFor = m.id; }
    // 從店家卡片的「踩點評分」進來：店名先填好，只留評分、照片、留言
    $("fForm").classList.toggle("visit", !!visit);
    $("fStall").value = visit || $("fStall").value;
    $("fStall").readOnly = !!visit;
    $("fTitle").textContent = t(visit ? "visitTitle" : "contribTitle");
    if (!$("fNick").value) $("fNick").value = load("nm-nick", "");
    fMsg("");
    $("fMarket").textContent = name(m);
    var names = picksOf(m).map(function (p) { return p.zh; });
    (comm[m.id] || []).forEach(function (c) { if (names.indexOf(c.stall) < 0) names.push(c.stall); });
    $("fStallList").innerHTML = names.map(function (x) { return '<option value="' + esc(x) + '">'; }).join("");
    $("detail").hidden = true;
    formHint();
    openSheet("submit");
  }
  function formScores() {
    var o = {};
    return SCORE_KEYS.every(function (k) { var v = $("f_" + k).value; o[k] = +v; return v !== ""; }) ? o : null;
  }
  function deviceId() {
    var d = load("nm-device", "");
    if (!d) { d = (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)); save("nm-device", d); }
    return d;
  }
  // 預估這篇會拿到哪個勳章（還在審核中的別人投稿看不到，所以只是預估）
  function formHint() {
    var m = byId(formFor), stall = $("fStall").value.trim(), sc = formScores();
    if (!m || !stall) { $("fMedal").textContent = ""; return; }
    var picks = picksOf(m), i = -1;
    picks.forEach(function (p, k) { if (i < 0 && sameName(p.zh, stall)) i = k; });
    var mine = { id: "_me", created_at: "9999", local: false, photos: ($("fPhotos").files || []).length ? ["https://x"] : [], lat: formLoc ? formLoc.lat : null };
    SCORE_KEYS.forEach(function (k) { mine[k] = sc ? sc[k] : 0; });
    var items = (comm[m.id] || []).filter(function (c) { return sameName(c.stall, i >= 0 ? picks[i].zh : stall); }).concat([mine]);
    var k = medals(items, i < 0, i >= 0 && !!pickLoc(m)[picks[i].zh])._me;
    var label = MEDAL_ICON[k] + " " + t("medal" + k.charAt(0).toUpperCase() + k.slice(1));
    var tip = k === "gold" ? t("fGoldReview") : k === "bronze" && !mine.photos.length ? t("fNeedPhoto") : i < 0 && !formLoc ? t("fNeedLoc") : "";
    $("fMedal").textContent = t("fWillGet")(label) + (tip ? "　" + tip : "");
  }
  ["fStall", "fPhotos"].concat(SCORE_KEYS.map(function (k) { return "f_" + k; })).forEach(function (id) { $(id).addEventListener("change", formHint); });
  $("fStall").addEventListener("input", formHint);
  function endPicking() {
    $("pickBanner").hidden = true;
    document.querySelector(".map-wrap").classList.remove("picking");
    if (view.pickPoint) view.pickPoint(null);
    $("submit").hidden = false;
  }
  // 點推薦攤位卡片（不是點連結）：地圖上跳出那家店的圖標
  $("dPicks").addEventListener("click", function (e) {
    if (e.target.closest("a")) return;
    var vb = e.target.closest("[data-visit]");
    if (vb) { openSubmit(vb.getAttribute("data-visit")); return; }
    var lb = e.target.closest("[data-like]");
    if (lb) {
      var key = state.selected + "|" + lb.getAttribute("data-like"), i = state.likes.indexOf(key);
      if (i >= 0) state.likes.splice(i, 1); else state.likes.push(key);
      save("nm-likes", state.likes);
      var on = i < 0;
      lb.setAttribute("aria-pressed", String(on)); lb.textContent = on ? "♥" : "♡"; lb.setAttribute("aria-label", t(on ? "unlike" : "like"));
      if (on) { lb.classList.remove("pop"); void lb.offsetWidth; lb.classList.add("pop"); }
      return;
    }
    var li = e.target.closest("li.pick"); if (!li || !view.highlightPick) return;
    if (view.highlightPick(li.id.replace("pick-", ""))) {
      [].forEach.call(document.querySelectorAll("#dPicks li.pick.on"), function (x) { x.classList.remove("on"); });
      li.classList.add("on");
    }
  });
  // 點標題「台灣夜市地圖」：我的收藏（想去的夜市＋喜愛的店家）
  function openMine() {
    var favs = state.favs.map(byId).filter(Boolean);
    $("mineFavs").innerHTML = favs.length ? favs.map(function (m) {
      return '<li class="row"><button type="button" data-open="' + m.id + '"><b>' + esc(name(m)) + "</b><small>" + esc(cityName(m.city)) + " · " + esc(status(m).text) + '</small></button><button type="button" class="unmark star" data-unfav="' + m.id + '" aria-label="' + esc(t("unfav")) + '">★</button></li>';
    }).join("") : '<li class="empty">' + esc(t("mineNoFavs")) + "</li>";
    var likes = state.likes.map(function (k) { var i = k.indexOf("|"); return { m: byId(k.slice(0, i)), zh: k.slice(i + 1) }; }).filter(function (x) { return x.m; });
    $("mineLikes").innerHTML = likes.length ? likes.map(function (x) {
      return '<li class="row"><button type="button" data-open="' + x.m.id + '" data-stall="' + esc(x.zh) + '"><b>' + esc(x.zh) + "</b><small>" + esc(name(x.m)) + '</small></button><button type="button" class="unmark h" data-unlike="' + esc(x.m.id + "|" + x.zh) + '" aria-label="' + esc(t("unlike")) + '">♥</button></li>';
    }).join("") : '<li class="empty">' + esc(t("mineNoLikes")) + "</li>";
    openSheet("mine");
  }
  function loadMyMedals() {
    // 我的勳章：找出這支手機的投稿（含還沒送出的），載入那些夜市的投稿，照同樣規則算勳章
    NMCommunity.mine(deviceId()).then(function (rows) {
      rows = rows.concat(pending);
      return medalMap(rows).then(function (md) {
        var got = [], cur = seasonOf(new Date().toISOString()), pts = 0;
        rows.forEach(function (r) {
          var m = byId(r.market), k = md[r.id];
          if (!m || !k) return;
          got.push({ m: m, stall: r.stall, k: k });
          if (!r.local && seasonOf(r.created_at) === cur) pts += POINTS[k];
        });
        got.sort(function (a, b) { return "grsb".indexOf(a.k[0]) - "grsb".indexOf(b.k[0]); });
        $("minePts").textContent = t("seasonPts")(pts);
        $("mineMedals").innerHTML = got.length ? got.map(function (x) {
          return '<li><button type="button" data-open="' + x.m.id + '" data-stall="' + esc(x.stall) + '"><b>' + medalHtml(x.k) + " " + esc(x.stall) + "</b><small>" + esc(name(x.m)) + "</small></button></li>";
        }).join("") : '<li class="empty">' + esc(t("mineNoMedals")) + "</li>";
      });
    });
  }
  // 勳章積分：每季（台北時間的季度）重新計算
  var POINTS = { gold: 30, silver: 10, bronze: 3, review: 0 };
  function seasonOf(iso) { var d = new Date(Date.parse(iso) + 8 * 3600e3); return d.getUTCFullYear() + "Q" + (Math.floor(d.getUTCMonth() / 3) + 1); }
  // 依整個夜市的投稿歷史算勳章（金、銀牌可能在更早的季就被拿走），回傳 投稿 id → 勳章
  function medalMap(rows) {
    var ids = {}; rows.forEach(function (r) { ids[r.market] = 1; });
    return Promise.all(Object.keys(ids).filter(byId).map(function (mid) {
      return remoteComm(mid).then(function (list) { comm[mid] = list; return loadPicks(byId(mid)); });
    })).then(function () {
      var md = {};
      Object.keys(ids).filter(byId).forEach(function (mid) {
        var m = byId(mid), cs = commSplit(m), loc = pickLoc(m);
        function add(o) { Object.keys(o).forEach(function (k) { md[k] = o[k]; }); }
        Object.keys(cs.byPick).forEach(function (i) { add(medals(cs.byPick[i], false, !!loc[picksOf(m)[i].zh])); });
        cs.extra.forEach(function (g) { add(medals(g.items, true)); });
      });
      return md;
    });
  }
  function openRank() {
    var now = new Date().toISOString(), cur = seasonOf(now), me = deviceId();
    $("rankTitle").textContent = t("rankTitle")(cur.slice(0, 4), cur.slice(5));
    $("rankList").innerHTML = "";
    $("mineMedals").innerHTML = ""; $("minePts").textContent = "";
    loadMyMedals();
    $("rankNote").textContent = NMCommunity.enabled() ? "" : t("rankOffline");
    openSheet("rank");
    (NMCommunity.enabled() ? NMCommunity.all() : Promise.resolve([])).then(function (rows) {
      // 全部投稿都要拿來排勳章順序，但只加總本季的積分
      var all = rows.concat(pending);
      return medalMap(all).then(function (md) {
        var by = {};
        rows.forEach(function (r) {
          var k = md[r.id];
          if (!k || !POINTS[k] || seasonOf(r.created_at) !== cur) return;
          var key = r.device || ("n:" + r.nickname), u = by[key] = by[key] || { nick: r.nickname, pts: 0, gold: 0, silver: 0, bronze: 0, me: r.device === me };
          u.pts += POINTS[k]; u[k]++; u.nick = r.nickname || u.nick;
        });
        var list = Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.pts - a.pts || b.gold - a.gold || b.silver - a.silver; });
        $("rankList").innerHTML = list.length ? list.slice(0, 30).map(function (u, i) {
          return '<li class="' + (u.me ? "me" : "") + '"><span class="rk">' + (i + 1) + '</span><b>' + esc(u.nick || "?") + (u.me ? " <small>(" + esc(t("rankMe")) + ")</small>" : "") + "</b>" +
            '<span class="rm">' + (u.gold ? "🥇" + u.gold + " " : "") + (u.silver ? "🥈" + u.silver + " " : "") + (u.bronze ? "🥉" + u.bronze : "") + "</span><span class=\"rp\">" + esc(t("rankPts")(u.pts)) + "</span></li>";
        }).join("") : '<li class="empty">' + esc(t("rankEmpty")) + "</li>";
      });
    });
  }
  $("trophyBtn").onclick = function () { if (window.NMCommunity) openRank(); };
  $("mineBtn").onclick = openMine;
  $("mine").addEventListener("click", function (e) {
    // 星星、愛心：點一下取消收藏
    var u = e.target.closest("[data-unfav],[data-unlike]");
    if (u) {
      var f = u.getAttribute("data-unfav"), l = u.getAttribute("data-unlike");
      if (f) toggleFav(f);
      if (l) {
        state.likes = state.likes.filter(function (x) { return x !== l; }); save("nm-likes", state.likes);
        if (state.selected && byId(state.selected)) renderPicks(byId(state.selected));
      }
      openMine();
      return;
    }
    var b = e.target.closest("[data-open]"); if (!b) return;
    var id = b.getAttribute("data-open"), stall = b.getAttribute("data-stall");
    closeSheet($("mine"));
    openDetail(id);
    if (!stall) return;
    // 攤位資料是點開才下載，等它出現再捲過去
    var tries = 0;
    (function seek() {
      var idx = picksOf(byId(id)).map(function (p) { return p.zh; }).indexOf(stall);
      if (idx >= 0) { setTimeout(function () { openPick(idx); if (view.highlightPick) view.highlightPick(idx); }, 50); return; }
      if (++tries < 40) setTimeout(seek, 150);
    })();
  });
  $("dContrib").onclick = function () { openSubmit(); };
  $("fPick").onclick = function () {
    var m = byId(formFor);
    if (!m || !view.pickPoint) return;
    $("submit").hidden = true;
    revealMap();
    view.focus(m.lat, m.lng, 17);
    $("pickBanner").hidden = false;
    document.querySelector(".map-wrap").classList.add("picking");
    view.pickPoint(function (ll) {
      formLoc = { lat: +ll.lat.toFixed(6), lng: +ll.lng.toFixed(6) }; formHint();
      $("fLoc").textContent = t("fLocSet") + " (" + formLoc.lat + ", " + formLoc.lng + ")";
      endPicking();
    });
  };
  $("pickCancel").onclick = endPicking;
  $("fForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("fWebsite").value) return; // 機器人才會填這個隱藏欄位
    var stall = $("fStall").value.trim(), nick = $("fNick").value.trim(), files = [].slice.call($("fPhotos").files || []);
    var foodsList = $("fFoods").value.split(/[,，、]/).map(function (x) { return x.trim().slice(0, 20); }).filter(Boolean).slice(0, 6);
    var review = $("fReview").value.trim();
    if (!stall) return fMsg(t("fNeedStall"), "err");
    if (files.length > 4) return fMsg(t("fTooMany"), "err");
    var sc = formScores();
    if (!sc) return fMsg(t("fNeedScores"), "err");
    if (!nick) return fMsg(t("fNeedNick"), "err");
    if (!$("fConsent").checked) return fMsg(t("fNeedConsent"), "err");
    $("fSend").disabled = true;
    save("nm-nick", nick.slice(0, 30));
    var row = {
      market: formFor, stall: stall.slice(0, 40), foods: foodsList, price: $("fPrice").value.trim().slice(0, 30) || null,
      where_hint: $("fWhere").value.trim().slice(0, 60) || null, lat: formLoc ? formLoc.lat : null, lng: formLoc ? formLoc.lng : null,
      review: review.slice(0, 600) || null, photos: [], nickname: nick.slice(0, 30), consent: true,
      taste: sc.taste, aroma: sc.aroma, attitude: sc.attitude, cp: sc.cp, visual: sc.visual, vibe: sc.vibe, device: deviceId()
    };
    function done(msg) {
      var keepNick = nick, wasVisit = $("fForm").classList.contains("visit");
      $("fForm").reset(); $("fNick").value = keepNick; formLoc = null; $("fLoc").textContent = "";
      if (wasVisit) $("fStall").value = stall;
      fMsg(msg, "ok"); formHint();
    }
    if (!NMCommunity.enabled()) {
      Promise.all(files.map(function (f) { return NMCommunity.thumb(f); })).then(function (photos) {
        row.photos = photos.filter(Boolean); row.id = "local-" + Date.now(); row.local = true; row.created_at = new Date().toISOString();
        pending.push(row);
        if (!savePending()) { row.photos = []; savePending(); }
        comm[formFor] = (comm[formFor] || []).filter(function (c) { return !c.local; }).concat(localFor(formFor));
        if (state.selected === formFor) renderPicks(byId(formFor));
        done(t("fSaved"));
      }).then(function () { $("fSend").disabled = false; });
      return;
    }
    var urls = [];
    files.reduce(function (p, f, i) {
      return p.then(function () { fMsg(t("fUploading")(i + 1, files.length)); return NMCommunity.uploadPhoto(f).then(function (u) { urls.push(u); }); });
    }, Promise.resolve()).then(function () {
      fMsg(t("fSending"));
      row.photos = urls;
      return NMCommunity.submit(row);
    }).then(function () { done(t("fDone")); }).catch(function (err) {
      console.warn("[submit]", err);
      fMsg(err && err.limited ? t("fLimited") : t("fErr"), "err");
    }).then(function () { $("fSend").disabled = false; });
  });
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
  $("skinBtn").onclick = function () {
    night = !night;
    applySkin(night ? "cyber" : "beige");
    applyNight();
    try { localStorage.setItem("nm-theme", night ? "night" : "day"); } catch (e) { /* 忽略 */ }
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
