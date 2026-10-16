/*
 * 地圖：Google 地圖 + Places API（New）
 * 夜市範圍：用「夜市名稱＋小吃／攤位／美食」在夜市周邊搜尋 Google 上的店家，再用這些店的位置畫出外框。
 * 依 Google Maps Platform 條款，Places 資料只顯示在 Google 地圖上，也不長期存放（只在這次開啟期間暫存在記憶體）。
 */
(function () {
  "use strict";

  var loading = null;
  // 載入 Maps JavaScript API；金鑰錯誤時 Google 會呼叫 window.gm_authFailure
  window.NMLoadGoogle = function (key, lang, onAuthFail) {
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      window.__nmGoogleReady = function () { resolve(window.google); };
      window.gm_authFailure = function () { onAuthFail && onAuthFail(); };
      var s = document.createElement("script");
      s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(key) +
        "&v=weekly&loading=async&callback=__nmGoogleReady&region=TW&language=" + (lang === "en" ? "en" : "zh-TW");
      s.async = true;
      s.onerror = function () { reject(new Error("Google Maps failed to load")); };
      document.head.appendChild(s);
      setTimeout(function () { reject(new Error("Google Maps timed out")); }, 15000);
    });
    return loading;
  };

  var M_PER_DEG_LAT = 111320;
  function mPerDegLng(lat) { return M_PER_DEG_LAT * Math.cos(lat * Math.PI / 180); }
  function box(c, halfM) {
    var dLat = halfM / M_PER_DEG_LAT, dLng = halfM / mPerDegLng(c.lat);
    return { north: c.lat + dLat, south: c.lat - dLat, east: c.lng + dLng, west: c.lng - dLng };
  }
  function grow(b, m) {
    var c = { lat: (b.north + b.south) / 2 };
    var dLat = m / M_PER_DEG_LAT, dLng = m / mPerDegLng(c.lat);
    return { north: b.north + dLat, south: b.south - dLat, east: b.east + dLng, west: b.west - dLng };
  }
  function spanM(b) {
    var lat = (b.north + b.south) / 2;
    return Math.max((b.north - b.south) * M_PER_DEG_LAT, (b.east - b.west) * mPerDegLng(lat));
  }
  function distM(a, b) {
    var dy = (a.lat - b.lat) * M_PER_DEG_LAT, dx = (a.lng - b.lng) * mPerDegLng((a.lat + b.lat) / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }
  function ll(p) { return typeof p.lat === "function" ? { lat: p.lat(), lng: p.lng() } : { lat: p.lat, lng: p.lng }; }
  function bjson(b) { return typeof b.toJSON === "function" ? b.toJSON() : b; }

  // 凸包（Andrew monotone chain），再往外推一點，讓外框包住攤位而不是壓在攤位上
  function hull(points, padM) {
    var pts = points.map(function (p) { return [p.lng, p.lat]; }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    if (pts.length < 3) return null;
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lower = [], upper = [], i;
    for (i = 0; i < pts.length; i++) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pts[i]) <= 0) lower.pop(); lower.push(pts[i]); }
    for (i = pts.length - 1; i >= 0; i--) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[i]) <= 0) upper.pop(); upper.push(pts[i]); }
    var h = lower.slice(0, -1).concat(upper.slice(0, -1));
    if (h.length < 3) return null;
    var cx = 0, cy = 0;
    h.forEach(function (p) { cx += p[0]; cy += p[1]; });
    cx /= h.length; cy /= h.length;
    return h.map(function (p) {
      var dx = (p[0] - cx) * mPerDegLng(cy), dy = (p[1] - cy) * M_PER_DEG_LAT;
      var d = Math.sqrt(dx * dx + dy * dy) || 1, k = (d + padM) / d;
      return { lat: cy + (p[1] - cy) * k, lng: cx + (p[0] - cx) * k };
    });
  }

  // 照片網址：真的載入圖片時 Google 才計費，所以清單縮圖用 lazy loading
  function photoUrl(ph, size) {
    if (!ph || typeof ph.getURI !== "function") return "";
    try { return ph.getURI({ maxWidth: size, maxHeight: size }); } catch (e) { return ""; }
  }
  var FOOD = /restaurant|food|cafe|bakery|meal_|dessert|ice_cream|juice|tea|coffee|bar$|confection|snack|deli|candy|donut|sandwich|brunch|diner|buffet/;

  // 去掉離其他店太遠的幾家，外框才會貼著夜市的街道
  function trimOutliers(list) {
    if (list.length < 6) return list;
    var c = { lat: 0, lng: 0 };
    list.forEach(function (s) { c.lat += s.lat; c.lng += s.lng; });
    c.lat /= list.length; c.lng /= list.length;
    var d = list.map(function (s) { return distM(s, c); }).sort(function (a, b) { return a - b; });
    var limit = Math.max(d[Math.floor(d.length / 2)] * 2.2, 120);
    return list.filter(function (s) { return distM(s, c) <= limit; });
  }

  window.NMGoogleMap = async function (el, opts) {
    var g = window.google.maps;
    var mapsLib = await g.importLibrary("maps");
    var placesLib = await g.importLibrary("places");
    var Place = placesLib.Place;

    // 自訂 HTML 標記（OverlayView）：不需要地圖 ID，所以可以自己決定地圖配色
    function HtmlMarker(o) {
      this._pos = o.position; this.content = o.content; this._z = o.zIndex || 0; this.center = !!o.center;
      this.content.style.position = "absolute";
      if (o.title) this.content.title = o.title;
      var self = this;
      this.content.addEventListener("click", function (e) { e.stopPropagation(); (self._click || []).forEach(function (f) { f(); }); });
      if (o.map) this.setMap(o.map);
    }
    HtmlMarker.prototype = new g.OverlayView();
    HtmlMarker.prototype.onAdd = function () { this.getPanes().overlayMouseTarget.appendChild(this.content); };
    HtmlMarker.prototype.onRemove = function () { this.content.remove(); };
    HtmlMarker.prototype.draw = function () {
      var p = this.getProjection().fromLatLngToDivPixel(new g.LatLng(this._pos.lat, this._pos.lng));
      if (!p) return;
      this.content.style.left = p.x + "px"; this.content.style.top = p.y + "px";
      this.content.style.transform = this.center ? "translate(-50%,-50%)" : "translate(-50%,-100%)";
      this.content.style.zIndex = this._z;
    };
    HtmlMarker.prototype.addEventListener = function (type, fn) { (this._click = this._click || []).push(fn); };
    HtmlMarker.prototype.moveTo = function (p) { this._pos = p; if (this.getMap()) this.draw(); };
    HtmlMarker.prototype.setZ = function (z) { this._z = z; this.content.style.zIndex = z; };

    var map, skin = opts.skin, night = !!(opts.night && opts.night());
    var marketMarkers = {}, stallMarkers = [], polygon = null, meMarker = null, countyLabels = [];
    var cache = {}, qcache = {}, curArea = null;
    var token = 0;

    // 只看台灣（本島與澎湖）
    var TAIWAN = { north: 25.75, south: 21.55, west: 119.1, east: 122.45 };
    var DETAIL_ZOOM = 12;
    var NAME_ZOOM = 10; // 放大到這裡以上，夜市圖標旁顯示名稱 // 放大到這裡以上才顯示街道，縣市底色變淡
    function palette() {
      var cs = getComputedStyle(document.documentElement);
      var v = function (k) { return cs.getPropertyValue(k).trim(); };
      if (night) return { sea: "#0b0818", land: "#0b0818", county: "#35245c", line: "#ff4d2e", label: "#ffd25e", road: "#3a2850", roadHi: "#6b2f3a", night: ["#35245c", "#3e2763", "#4a2552"] };
      return skin === "cyber"
        ? { sea: "#05060a", land: "#0b0f17", county: "#0f1724", line: "#22e8ff", label: "#7fe9ff", road: "#1c2638", roadHi: "#26324a" }
        : { sea: v("--sunk") || "#ebe3d5", land: "#e9e0d0", county: "#f6efe2", line: "#9a7440", label: "#6b5434", road: "#e2d6c2", roadHi: "#d8c8ae" };
    }
    function mapStyles() {
      var c = palette();
      return [
        { elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "administrative", stylers: [{ visibility: "off" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ].concat(!night ? [] : [
        // 夜晚模式縮小看全台時不畫道路，只留縣市
        { featureType: "road", elementType: "geometry", stylers: [{ visibility: map && map.getZoom() >= DETAIL_ZOOM ? "on" : "off" }] },
        // 夜晚模式才換顏色；白天用 Google 地圖原本的色調
        { featureType: "water", stylers: [{ color: c.sea }] },
        { featureType: "landscape", stylers: [{ color: c.land }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: c.road }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: c.roadHi }] }
      ]);
    }
    function countyStyle(f) {
      var c = palette(), detail = map.getZoom() >= DETAIL_ZOOM;
      var fill = c.county;
      // 夜晚模式：相鄰縣市用三種深紫交錯，像一排排招牌
      if (c.night && f) { var h = 0, zh = f.getProperty("zh") || ""; for (var i = 0; i < zh.length; i++) h += zh.charCodeAt(i); fill = c.night[h % 3]; }
      return { fillColor: fill, fillOpacity: detail || !night ? 0 : 1, strokeColor: c.line, strokeOpacity: detail ? .35 : c.night ? .95 : .8, strokeWeight: detail ? 1 : c.night ? 1.4 : 1.2, clickable: false };
    }
    function drawCounties() {
      if (!window.NM_COUNTIES) return;
      map.data.addGeoJson(window.NM_COUNTIES);
      map.data.setStyle(countyStyle);
      window.NM_COUNTIES.features.forEach(function (f) {
        var p = f.properties;
        var small = /基隆|新竹市|嘉義市/.test(p.zh);
        var el = document.createElement("div");
        el.className = "county-label" + (small ? " small" : "");
        el.dataset.zh = p.zh; el.dataset.en = p.en;
        el.textContent = opts.lang() === "en" ? p.en : p.zh;
        countyLabels.push({ m: new HtmlMarker({ map: map, position: { lat: p.label[0], lng: p.label[1] }, content: el, center: true, zIndex: 0 }), el: el, small: small });
      });
      updateCountyLabels();
    }
    function updateCountyLabels() {
      var z = map.getZoom();
      countyLabels.forEach(function (c) {
        c.el.hidden = z >= DETAIL_ZOOM || (c.small && z < 9);
        c.el.textContent = opts.lang() === "en" ? c.el.dataset.en : c.el.dataset.zh;
      });
    }

    function lantern() { return getComputedStyle(el).getPropertyValue("--lantern").trim() || "#b5492f"; }
    function restyle() {
      map.setOptions({ styles: mapStyles(), backgroundColor: night ? palette().sea : "#aadaff" });
      map.data.setStyle(countyStyle);
      if (polygon) polygon.setOptions({ strokeColor: lantern(), fillColor: lantern() });
    }
    function makeMap() {
      map = new mapsLib.Map(el, {
        center: { lat: 23.7, lng: 120.95 }, zoom: 7, minZoom: 6,
        restriction: { latLngBounds: TAIWAN, strictBounds: false },
        styles: mapStyles(), backgroundColor: night ? palette().sea : "#aadaff",
        disableDefaultUI: true, zoomControl: true, clickableIcons: false, gestureHandling: "greedy", keyboardShortcuts: false
      });
      drawCounties();
      var wasDetail = false;
      // 換樣式要等地圖停下來再做，縮放途中呼叫 setOptions 會打斷 fitBounds
      map.addListener("idle", function () {
        var d = map.getZoom() >= DETAIL_ZOOM;
        if (d !== wasDetail && night) { wasDetail = d; map.setOptions({ styles: mapStyles() }); }
      });
      map.addListener("zoom_changed", function () {
        el.classList.toggle("show-names", map.getZoom() >= NAME_ZOOM);
        map.data.setStyle(countyStyle); updateCountyLabels();
      });
    }
    makeMap();
    el.classList.add("is-google");

    function onClick(mk, fn) { mk.addEventListener("gmp-click", fn); }
    function div(cls, html) { var d = document.createElement("div"); d.className = cls; d.innerHTML = html; return d; }

    function clearArea() {
      token++;
      stallMarkers.forEach(function (s) { s.marker.setMap(null); });
      stallMarkers = [];
      if (polygon) { polygon.setMap(null); polygon = null; }
      curArea = null;
    }

    function search(textQuery, fields, extra) {
      var req = { textQuery: textQuery, fields: fields, language: opts.lang() === "en" ? "en" : "zh-TW", region: "tw" };
      Object.keys(extra).forEach(function (k) { req[k] = extra[k]; });
      return Place.searchByText(req).then(function (r) { return r.places || []; }).catch(function (e) { console.warn("[places]", e); return []; });
    }

    function toStall(p) {
      var loc = ll(p.location);
      return {
        id: p.id, name: p.displayName || "", lat: loc.lat, lng: loc.lng,
        rating: p.rating || null, count: p.userRatingCount || 0, type: p.primaryTypeDisplayName || "",
        address: p.formattedAddress || "", url: p.googleMapsURI || "", place: p,
        thumb: photoUrl((p.photos || [])[0], 160), photos: (p.photos || []).slice(0, 6).map(function (ph) {
          var a = (ph.authorAttributions || [])[0] || {};
          return { url: photoUrl(ph, 900), author: a.displayName || "", authorUrl: a.uri || "" };
        }).filter(function (x) { return x.url; })
      };
    }
    var FIELDS = ["id", "displayName", "location", "types", "rating", "userRatingCount", "primaryTypeDisplayName", "formattedAddress", "googleMapsURI", "photos"];

    async function loadArea(m) {
      var center = { lat: m.lat, lng: m.lng };
      var market = (await search(m.zh, ["id", "location"], { locationBias: { center: center, radius: 2000 }, maxResultCount: 1 }))[0];
      var marketId = null;
      if (market && market.location && distM(ll(market.location), center) < 2000) {
        marketId = market.id;
        center = ll(market.location);
      }
      // 夜市常是一整條街，範圍抓大一點；搜尋字加上夜市名稱，結果就會是夜市裡的攤位
      var bounds = box(center, 650);
      var fields = FIELDS;
      var q = [m.zh + " 小吃", m.zh + " 攤位", m.zh + " 美食"];
      var lists = await Promise.all(q.map(function (text) { return search(text, fields, { locationRestriction: bounds, maxResultCount: 20 }); }));
      var seen = {}, stalls = [];
      lists.forEach(function (list) {
        list.forEach(function (p) {
          if (!p.location || seen[p.id] || p.id === marketId) return;
          // 只留吃的喝的（排除車站、飯店、商店等）
          if (p.types && p.types.length && !p.types.some(function (t) { return FOOD.test(t); })) return;
          seen[p.id] = true;
          stalls.push(toStall(p));
        });
      });
      // 先留下離夜市中心近的，避免外框被遠處一兩家店拉得很大
      stalls.sort(function (a, b) { return distM(a, center) - distM(b, center); });
      var keep = stalls.filter(function (s) { return distM(s, center) < 700; });
      keep = trimOutliers(keep);
      keep.sort(function (a, b) { return (b.count || 0) - (a.count || 0); });
      return { center: center, bounds: bounds, stalls: keep };
    }

    function addStallMarker(s, i) {
      var content = div("stall-pin", "<span>" + (i + 1) + "</span>");
      var mk = new HtmlMarker({ map: map, position: { lat: s.lat, lng: s.lng }, content: content, title: s.name, zIndex: 500 - i, gmpClickable: true });
      onClick(mk, function () { opts.onStallClick(s.id); });
      stallMarkers.push({ id: s.id, marker: mk, el: content });
    }

    function draw(area) {
      var path = hull(area.stalls, 25);
      if (!path) {
        var b = area.bounds;
        path = [{ lat: b.north, lng: b.west }, { lat: b.north, lng: b.east }, { lat: b.south, lng: b.east }, { lat: b.south, lng: b.west }];
      }
      var col = lantern();
      polygon = new mapsLib.Polygon({ paths: path, strokeColor: col, strokeOpacity: .9, strokeWeight: 2, fillColor: col, fillOpacity: .12, clickable: false, map: map });
      area.stalls.forEach(addStallMarker);
      var bb = new g.LatLngBounds();
      path.forEach(function (p) { bb.extend(p); });
      map.fitBounds(bb, 40);
    }

    return {
      supportsStalls: true,
      syncMarkets: function (all, visibleIds, selectedId, isOff) {
        all.forEach(function (m) {
          var mk = marketMarkers[m.id];
          var html = opts.pinHtml(selectedId === m.id, isOff(m), opts.label(m));
          if (!mk) {
            mk = marketMarkers[m.id] = new HtmlMarker({ position: { lat: m.lat, lng: m.lng }, content: div("gm-pin", html), title: opts.label(m), gmpClickable: true });
            onClick(mk, function () { opts.onMarketClick(m.id); });
          } else {
            mk.content.innerHTML = html;
            mk.content.title = opts.label(m);
          }
          mk.setZ(selectedId === m.id ? 1000 : 1);
          var show = visibleIds.indexOf(m.id) >= 0;
          if (show && !mk.getMap()) mk.setMap(map);
          if (!show && mk.getMap()) mk.setMap(null);
        });
      },
      fit: function (pts, maxZoom) {
        if (!pts.length) return;
        if (pts.length === 1) { map.setCenter({ lat: pts[0][0], lng: pts[0][1] }); map.setZoom(maxZoom || 15); return; }
        var b = new g.LatLngBounds();
        pts.forEach(function (p) { b.extend({ lat: p[0], lng: p[1] }); });
        // 先移到中心再縮放：從全台的低縮放直接 fitBounds，有時只放大不移動
        map.setCenter(b.getCenter());
        map.fitBounds(b, 40);
        g.event.addListenerOnce(map, "idle", function () {
          if (!map.getBounds() || !map.getBounds().contains(b.getCenter())) map.setCenter(b.getCenter());
          if (map.getZoom() > (maxZoom || 15)) map.setZoom(maxZoom || 15);
        });
      },
      focus: function (lat, lng, minZoom) { map.panTo({ lat: lat, lng: lng }); if (map.getZoom() < minZoom) map.setZoom(minZoom); },
      setMe: function (lat, lng) {
        if (meMarker) { meMarker.moveTo({ lat: lat, lng: lng }); return; }
        meMarker = new HtmlMarker({ map: map, position: { lat: lat, lng: lng }, content: div("me-dot", ""), zIndex: 2000 });
      },
      setSkin: function (s) {
        if (s === skin) return;
        skin = s;
        restyle();
      },
      setNight: function (on) {
        if (!!on === night) return;
        night = !!on;
        restyle();
      },
      setLang: updateCountyLabels,
      // 放大到夜市、畫外框和攤位；回傳攤位清單
      showArea: async function (m) {
        clearArea();
        var my = token;
        var key = m.id + ":" + opts.lang();
        if (!cache[key]) cache[key] = loadArea(m).catch(function (e) { delete cache[key]; throw e; });
        var area = await cache[key];
        if (my !== token) return area.stalls; // 使用者已經切到別的夜市
        curArea = area;
        draw(area);
        return area.stalls;
      },
      clearArea: clearArea,
      // 關鍵字找店：在夜市範圍內用 Google 地圖搜尋，新找到的店加進清單和地圖；回傳符合的店家 id
      searchStalls: async function (m, q) {
        var area = curArea;
        if (!area) return [];
        var where = { locationRestriction: box(area.center, 700), maxResultCount: 20 };
        function find(text) {
          var key = m.id + ":" + opts.lang() + ":" + text;
          if (!qcache[key]) qcache[key] = search(text, FIELDS, where);
          return qcache[key];
        }
        function keep(list, ids) {
          list.forEach(function (p) {
            if (!p.location || ids.indexOf(p.id) >= 0 || distM(ll(p.location), area.center) > 750) return;
            // 只留吃的喝的（關鍵字「香」會搜到香舖、金紙店）
            if (p.types && p.types.length && !p.types.some(function (t) { return FOOD.test(t); })) return;
            var have = area.stalls.filter(function (s) { return s.id === p.id; })[0];
            if (!have) {
              have = toStall(p);
              area.stalls.push(have);
              if (curArea === area && polygon) addStallMarker(have, area.stalls.length - 1);
            }
            ids.push(p.id);
          });
          return ids;
        }
        var ids = keep(await find(q), []);
        // 「釋迦冰品」這種組合詞常常整個找不到，就拆成前後兩個詞再找一次
        if (!ids.length && q.length >= 4) {
          var parts = await Promise.all([find(q.slice(0, 2)), find(q.slice(-2))]);
          keep(parts[0].concat(parts[1]), ids);
        }
        return ids;
      },
      // 有關鍵字時，不符合的攤位標記變淡
      filterStalls: function (ids) {
        stallMarkers.forEach(function (s) { s.el.classList.toggle("dim", !!ids && ids.indexOf(s.id) < 0); });
      },
      selectStall: function (id) {
        stallMarkers.forEach(function (s) { s.el.classList.toggle("sel", s.id === id); s.marker.setZ(s.id === id ? 900 : 500); });
      },
      // 評論：Google 每家店最多提供 5 則
      fetchReviews: function (stall) {
        return stall.place.fetchFields({ fields: ["reviews"] }).then(function () {
          return (stall.place.reviews || []).map(function (r) {
            var a = r.authorAttribution || {};
            return {
              author: a.displayName || "", authorUrl: a.uri || "", photo: a.photoURI || "",
              rating: r.rating || 0, when: r.relativePublishTimeDescription || "",
              text: typeof r.text === "string" ? r.text : (r.text && r.text.text) || ""
            };
          });
        });
      },
      destroy: function () { clearArea(); el.innerHTML = ""; el.classList.remove("is-google"); }
    };
  };
})();
