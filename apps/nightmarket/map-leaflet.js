/* 地圖：Leaflet + OpenStreetMap（沒有 Google 金鑰或 Google 載入失敗時使用） */
window.NMLeafletMap = function (el, opts) {
  "use strict";
  var map = L.map(el, { zoomControl: true, attributionControl: true, tap: true }).setView([23.75, 120.95], 7);
  map.attributionControl.setPrefix(false);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
  }).addTo(map);
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
    setSkin: function () { /* 圖磚用 CSS 濾鏡切換，不用重畫 */ },
    showArea: function () { return Promise.resolve(null); },
    clearArea: function () {},
    selectStall: function () {},
    destroy: function () { map.remove(); el.classList.remove("is-leaflet"); }
  };
};
