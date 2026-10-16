/* 地圖：Leaflet + OpenStreetMap（沒有 Google 金鑰或 Google 載入失敗時使用） */
window.NMLeafletMap = function (el, opts) {
  "use strict";
  // 只看台灣；縮小時只畫縣市，放大到街道層級才顯示 OpenStreetMap 圖磚
  var TAIWAN = L.latLngBounds([21.55, 119.1], [25.75, 122.45]);
  var DETAIL_ZOOM = 12;
  var map = L.map(el, { zoomControl: true, attributionControl: true, tap: true, minZoom: 6, maxBounds: TAIWAN.pad(0.1), maxBoundsViscosity: 0.8 }).setView([23.7, 120.95], 7);
  map.attributionControl.setPrefix(false);
  var tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
  });
  var counties = null, labels = [];
  if (window.NM_COUNTIES) {
    counties = L.geoJSON(window.NM_COUNTIES, { interactive: false, style: countyStyle }).addTo(map);
    window.NM_COUNTIES.features.forEach(function (f) {
      var p = f.properties, small = /基隆|新竹市|嘉義市/.test(p.zh);
      var mk = L.marker(p.label, { interactive: false, keyboard: false, icon: L.divIcon({ className: "", html: '<div class="county-label' + (small ? " small" : "") + '">' + (opts.lang() === "en" ? p.en : p.zh) + "</div>", iconSize: [0, 0] }) }).addTo(map);
      labels.push({ mk: mk, p: p, small: small });
    });
  }
  function countyStyle() {
    var detail = map.getZoom() >= DETAIL_ZOOM;
    var cs = getComputedStyle(el);
    return { color: cs.getPropertyValue("--signal").trim(), weight: detail ? 1 : 1.2, opacity: detail ? .35 : .8, fillColor: cs.getPropertyValue("--surface").trim(), fillOpacity: detail ? 0 : 1 };
  }
  function onZoom() {
    var z = map.getZoom(), detail = z >= DETAIL_ZOOM;
    if (detail && !map.hasLayer(tiles)) tiles.addTo(map);
    if (!detail && map.hasLayer(tiles)) map.removeLayer(tiles);
    if (counties) { counties.setStyle(countyStyle()); counties.bringToFront(); }
    labels.forEach(function (l) {
      var show = !detail && !(l.small && z < 9);
      var e = l.mk.getElement(); if (e) e.style.display = show ? "" : "none";
    });
  }
  map.on("zoomend", onZoom);
  setTimeout(onZoom, 0);
  el.classList.add("is-leaflet");

  var markers = {};
  var meMarker = null;
  function icon(m, sel, off) {
    return L.divIcon({ className: "", html: opts.pinHtml(sel, off), iconSize: [30, 38], iconAnchor: [15, 37] });
  }

  return {
    supportsStalls: false,
    syncMarkets: function (all, visibleIds, selectedId, isOff) {
      all.forEach(function (m) {
        var mk = markers[m.id];
        if (!mk) {
          mk = markers[m.id] = L.marker([m.lat, m.lng], { title: m.zh, keyboard: true, riseOnHover: true });
          mk.on("click", function () { opts.onMarketClick(m.id); });
        }
        if (visibleIds.indexOf(m.id) >= 0) {
          mk.setIcon(icon(m, selectedId === m.id, isOff(m)));
          mk.options.title = opts.label(m);
          if (!map.hasLayer(mk)) mk.addTo(map);
          mk.setZIndexOffset(selectedId === m.id ? 1000 : 0);
        } else if (map.hasLayer(mk)) {
          map.removeLayer(mk);
        }
      });
    },
    fit: function (pts, maxZoom) {
      if (!pts.length) return;
      if (pts.length === 1) { map.setView(pts[0], maxZoom || 15); return; }
      map.fitBounds(pts, { padding: [40, 40], maxZoom: maxZoom || 15 });
    },
    focus: function (lat, lng, minZoom) { map.setView([lat, lng], Math.max(map.getZoom(), minZoom), { animate: true }); },
    setMe: function (lat, lng) {
      if (meMarker) { meMarker.setLatLng([lat, lng]); return; }
      meMarker = L.marker([lat, lng], { icon: L.divIcon({ className: "", html: '<div class="me-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), interactive: false, zIndexOffset: 2000 }).addTo(map);
    },
    setSkin: function () { if (counties) counties.setStyle(countyStyle()); },
    setNight: function () { if (counties) counties.setStyle(countyStyle()); },
    setLang: function () {
      labels.forEach(function (l) { var e = l.mk.getElement(); if (e) e.firstChild.textContent = opts.lang() === "en" ? l.p.en : l.p.zh; });
    },
    showArea: function () { return Promise.resolve(null); },
    clearArea: function () {},
    selectStall: function () {},
    destroy: function () { map.remove(); el.classList.remove("is-leaflet"); }
  };
};
