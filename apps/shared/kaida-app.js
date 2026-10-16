/* 開達 Kaida 封測作品共用小工具：外觀、語言、頂列、提示、本機儲存 */
(function () {
  var MARK = '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="22" style="fill:var(--surface)"/>' +
    '<defs><clipPath id="kcs"><rect x="0" y="14" width="100" height="72"/></clipPath></defs><g clip-path="url(#kcs)">' +
    '<path d="M13.5 96 V68 H36 V48 H58 V30 H68" fill="none" style="stroke:var(--ink)" stroke-width="11" stroke-linejoin="miter"/>' +
    '<circle cx="77" cy="23" r="9" style="fill:var(--signal)"/></g></svg>';

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  if (safeGet("kaida-skin") === "cyber") document.documentElement.setAttribute("data-skin", "cyber");
  var lang = safeGet("kaida-lang") === "en" ? "en" : "zh";
  document.documentElement.lang = lang === "en" ? "en" : "zh-Hant-TW";

  var dict = { zh: {}, en: {} };
  var listeners = [];

  var K = {
    MARK: MARK,
    lang: function () { return lang; },
    addStrings: function (d) {
      Object.keys(d.zh || {}).forEach(function (k) { dict.zh[k] = d.zh[k]; });
      Object.keys(d.en || {}).forEach(function (k) { dict.en[k] = d.en[k]; });
    },
    t: function (key, vars) {
      var s = (dict[lang][key] != null ? dict[lang][key] : dict.zh[key]);
      if (s == null) return key;
      if (vars) s = s.replace(/\{(\w+)\}/g, function (_, v) { return vars[v] != null ? vars[v] : ""; });
      return s;
    },
    onLang: function (fn) { listeners.push(fn); },
    setLang: function (l) {
      lang = l; safeSet("kaida-lang", l);
      document.documentElement.lang = l === "en" ? "en" : "zh-Hant-TW";
      K.applyStatic();
      listeners.forEach(function (fn) { fn(); });
    },
    /* data-i18n="key" 換文字；data-i18n-ph 換 placeholder；data-i18n-aria 換 aria-label */
    applyStatic: function (root) {
      root = root || document;
      root.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = K.t(el.getAttribute("data-i18n")); });
      root.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.placeholder = K.t(el.getAttribute("data-i18n-ph")); });
      root.querySelectorAll("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", K.t(el.getAttribute("data-i18n-aria"))); });
      var tt = document.querySelector("title[data-i18n-title]");
      if (tt) document.title = K.t(tt.getAttribute("data-i18n-title"));
      var lb = document.getElementById("k-lang"); if (lb) lb.textContent = lang === "en" ? "中文" : "EN";
      var sb = document.getElementById("k-skin"); if (sb) sb.textContent = K.t(document.documentElement.getAttribute("data-skin") === "cyber" ? "k.skin.beige" : "k.skin.cyber");
    },
    mountTopbar: function (el) {
      el.innerHTML =
        '<a class="brand" href="../../"><span>' + MARK + '</span><span><b>開達 Kaida</b> · <span data-i18n="k.beta">封測作品</span></span></a>' +
        '<div class="toggles"><button class="chip-btn" id="k-skin" type="button"></button>' +
        '<button class="chip-btn" id="k-lang" type="button"></button></div>';
      el.querySelector("#k-lang").addEventListener("click", function () { K.setLang(lang === "en" ? "zh" : "en"); });
      el.querySelector("#k-skin").addEventListener("click", function () {
        var cyber = document.documentElement.getAttribute("data-skin") === "cyber";
        if (cyber) document.documentElement.removeAttribute("data-skin"); else document.documentElement.setAttribute("data-skin", "cyber");
        safeSet("kaida-skin", cyber ? "beige" : "cyber");
        K.applyStatic();
      });
    },
    toast: function (msg) {
      var el = document.getElementById("k-toast");
      if (!el) { el = document.createElement("div"); el.id = "k-toast"; el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
      el.textContent = msg; el.classList.add("show");
      clearTimeout(K._tt); K._tt = setTimeout(function () { el.classList.remove("show"); }, 2600);
    },
    load: function (key, fallback) {
      var raw = safeGet(key);
      if (!raw) return fallback;
      try { return JSON.parse(raw); } catch (e) { return fallback; }
    },
    save: function (key, val) { return safeSet(key, JSON.stringify(val)); },
    esc: function (s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    },
    /* 本機日期字串 YYYY-MM-DD */
    dayKey: function (d) {
      d = d || new Date();
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    },
    /* 簡短提示音，需要使用者先點過一次頁面才會響 */
    chime: function (kind) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        K._ac = K._ac || new AC();
        var ac = K._ac; if (ac.state === "suspended") ac.resume();
        var notes = kind === "end" ? [784, 659, 523] : [523, 659, 784];
        notes.forEach(function (f, i) {
          var o = ac.createOscillator(), g = ac.createGain();
          o.type = "sine"; o.frequency.value = f;
          var t0 = ac.currentTime + i * 0.18;
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
          o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 0.55);
        });
      } catch (e) { /* 沒聲音也沒關係 */ }
      if (navigator.vibrate) navigator.vibrate([180, 80, 180]);
    },
    unlockAudio: function () {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC && !K._ac) K._ac = new AC();
        if (K._ac && K._ac.state === "suspended") K._ac.resume();
      } catch (e) {}
    },
    notify: function (title, body) {
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(title, { body: body, tag: title });
          return true;
        }
      } catch (e) {}
      return false;
    }
  };

  K.addStrings({
    zh: { "k.beta": "封測作品", "k.skin.cyber": "Cyber", "k.skin.beige": "米色" },
    en: { "k.beta": "Beta app", "k.skin.cyber": "Cyber", "k.skin.beige": "Beige" }
  });

  window.Kaida = K;
})();
