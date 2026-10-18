/*
 * 網友投稿：寫入和讀取 Supabase（設定在 config.js）。沒設定時 enabled() 是 false，網站不顯示投稿功能。
 */
(function () {
  var cfg = window.NM_CONFIG || {};
  var URL = String(cfg.supabaseUrl || "").replace(/\/+$/, ""), KEY = cfg.supabaseKey || "";
  var COLS = "id,created_at,market,stall,foods,price,where_hint,lat,lng,review,rating,photos,nickname,taste,aroma,attitude,cp,device";
  var cache = {};
  function headers(extra) {
    var h = { apikey: KEY, Authorization: "Bearer " + KEY };
    Object.keys(extra || {}).forEach(function (k) { h[k] = extra[k]; });
    return h;
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  // 照片先在手機上縮小（長邊 1600px、JPEG），省流量也省空間
  function shrink(file) {
    return new Promise(function (resolve) {
      if (!/^image\//.test(file.type) || !window.createImageBitmap) return resolve(file);
      createImageBitmap(file).then(function (bmp) {
        var k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
        var c = document.createElement("canvas");
        c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
        c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
        c.toBlob(function (b) { resolve(b || file); }, "image/jpeg", 0.85);
      }).catch(function () { resolve(file); });
    });
  }
  window.NMCommunity = {
    enabled: function () { return !!(URL && KEY); },
    // 審核通過的投稿
    load: function (market) {
      if (!this.enabled()) return Promise.resolve([]);
      if (!cache[market]) {
        cache[market] = fetch(URL + "/rest/v1/nm_submissions?select=" + COLS + "&market=eq." + encodeURIComponent(market) + "&order=created_at.asc", { headers: headers() })
          .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
          .catch(function (e) { delete cache[market]; console.warn("[community]", e); return []; });
      }
      return cache[market];
    },
    // 這支手機投過、已通過審核的投稿（算我的勳章用）
    // 沒連線時先存在手機的小圖（長邊 900px），連線後再上傳
    thumb: function (file) {
      return new Promise(function (resolve) {
        if (!window.createImageBitmap) return resolve("");
        createImageBitmap(file).then(function (bmp) {
          var k = Math.min(1, 900 / Math.max(bmp.width, bmp.height)), c = document.createElement("canvas");
          c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
          c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
          resolve(c.toDataURL("image/jpeg", 0.75));
        }).catch(function () { resolve(""); });
      });
    },
    mine: function (device) {
      if (!this.enabled() || !device) return Promise.resolve([]);
      return fetch(URL + "/rest/v1/nm_submissions?select=id,market,stall&device=eq." + encodeURIComponent(device), { headers: headers() })
        .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
    },
    uploadPhoto: function (file) {
      return shrink(file).then(function (blob) {
        var name = "u/" + uuid() + ".jpg";
        return fetch(URL + "/storage/v1/object/nm-photos/" + name, { method: "POST", headers: headers({ "Content-Type": blob.type || "image/jpeg" }), body: blob })
          .then(function (r) { if (!r.ok) throw new Error("photo HTTP " + r.status); return URL + "/storage/v1/object/public/nm-photos/" + name; });
      });
    },
    submit: function (row) {
      return fetch(URL + "/rest/v1/nm_submissions", { method: "POST", headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }), body: JSON.stringify(row) })
        .then(function (r) {
          if (r.ok) return true;
          return r.text().then(function (t) { var e = new Error(t || ("HTTP " + r.status)); e.status = r.status; e.limited = /too many|paused/.test(t); throw e; });
        });
    }
  };
})();
