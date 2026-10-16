/* 番茄讀書會：四碼房號的即時房間（透過公開 MQTT 伺服器，只傳暱稱、角色和狀態） */
(function () {
  var BROKER = "wss://broker.hivemq.com:8884/mqtt";
  try {
    var q = new URLSearchParams(location.search).get("broker");
    if (q && /^wss?:\/\//.test(q)) BROKER = q; // 測試用
  } catch (e) {}
  var PREFIX = "kaida-pomo/v1/";
  var MAX = 6;
  var STALE = 100 * 1000;   // 超過 100 秒沒心跳視為離開
  var EXPIRE = 24 * 3600 * 1000; // 房間 24 小時沒人就過期

  function Room() {
    this.client = null; this.code = null; this.meId = null; this.meta = null;
    this.members = {}; this.onChange = function () {}; this.onStatus = function () {}; this.hb = null; this.me = null;
  }

  function parse(buf) {
    try { var s = typeof buf === "string" ? buf : new TextDecoder().decode(buf); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function cleanMember(id, m) {
    if (!m || typeof m !== "object") return null;
    var look = m.look && typeof m.look === "object" ? m.look : {};
    var L = {};
    ["g", "top", "hat", "face", "neck", "ears", "pet"].forEach(function (k) { if (typeof look[k] === "string") L[k] = look[k].slice(0, 16); });
    L.skin = Math.max(0, Math.min(2, +look.skin || 0)); L.hair = Math.max(0, Math.min(3, +look.hair || 0));
    return {
      id: id, name: String(m.name || "?").slice(0, 16), look: L, act: String(m.act || "read").slice(0, 16),
      joined: +m.joined || 0, ts: +m.ts || 0, up: !!m.up, av: typeof m.av === "string" ? m.av.slice(0, 4) : "", say: typeof m.say === "string" ? m.say.slice(0, 20) : "", sayAt: +m.sayAt || 0
    };
  }

  Room.prototype.fresh = function () {
    var now = Date.now(), out = [], self = this;
    Object.keys(this.members).forEach(function (id) {
      var m = self.members[id];
      if (id === self.meId || now - m.ts < STALE) out.push(m);
    });
    out.sort(function (a, b) { return a.joined - b.joined || (a.id < b.id ? -1 : 1); });
    return out;
  };

  /* opts: { code, create, me:{id,name,look,act}, cfg:{focus,brk} } → Promise<{ok, reason, meta}> */
  Room.prototype.join = function (opts) {
    var self = this;
    if (!window.mqtt) return Promise.resolve({ ok: false, reason: "offline" });
    this.code = opts.code; this.meId = opts.me.id; this.members = {}; this.meta = null;
    var base = PREFIX + opts.code;
    var mine = base + "/m/" + opts.me.id;
    this.me = { name: opts.me.name, look: opts.me.look, act: opts.me.act, joined: Date.now(), ts: Date.now() };
    return new Promise(function (resolve) {
      var done = false;
      function finish(r) { if (!done) { done = true; resolve(r); } }
      var c;
      try {
        c = window.mqtt.connect(BROKER, {
          clientId: "kp_" + opts.me.id + "_" + Math.random().toString(36).slice(2, 7),
          clean: true, keepalive: 30, reconnectPeriod: 4000, connectTimeout: 9000,
          will: { topic: mine, payload: "", retain: true, qos: 1 }
        });
      } catch (e) { finish({ ok: false, reason: "offline" }); return; }
      self.client = c;
      var timer = setTimeout(function () { if (!done) { self.leave(); finish({ ok: false, reason: "offline" }); } }, 12000);
      c.on("message", function (topic, payload) {
        if (topic === base + "/meta") { self.meta = parse(payload); }
        else if (topic.indexOf(base + "/m/") === 0) {
          var id = topic.slice((base + "/m/").length);
          var m = parse(payload);
          if (!m) delete self.members[id];
          else { var cm = cleanMember(id, m); if (cm) self.members[id] = cm; }
        }
        if (done) self.onChange();
      });
      c.on("connect", function () {
        self.onStatus("online");
        if (done) { self.publishMe(); return; } // 重新連線
        c.subscribe(base + "/#", { qos: 1 }, function (err) {
          if (err) { clearTimeout(timer); self.leave(); finish({ ok: false, reason: "offline" }); return; }
          // 等保留訊息進來
          setTimeout(function () {
            clearTimeout(timer);
            var now = Date.now();
            var others = self.fresh().filter(function (m) { return m.id !== self.meId; });
            var meta = self.meta;
            var alive = meta && (others.length || now - (meta.created || 0) < EXPIRE);
            if (opts.create) {
              if (alive) { self.leave(); finish({ ok: false, reason: "taken" }); return; }
              meta = { focus: opts.cfg.focus, brk: opts.cfg.brk, origin: now, created: now, test: !!opts.cfg.test };
              c.publish(base + "/meta", JSON.stringify(meta), { retain: true, qos: 1 });
              self.meta = meta;
            } else {
              if (!alive || !meta || !meta.focus) { self.leave(); finish({ ok: false, reason: "notfound" }); return; }
              if (others.length >= MAX) { self.leave(); finish({ ok: false, reason: "full" }); return; }
              // 有人在就延長房間壽命
              meta.created = now;
              c.publish(base + "/meta", JSON.stringify(meta), { retain: true, qos: 1 });
            }
            self.publishMe();
            self.hb = setInterval(function () { self.publishMe(); }, 30000);
            finish({ ok: true, meta: meta });
            self.onChange();
          }, 1600);
        });
      });
      c.on("offline", function () { self.onStatus("offline"); });
      c.on("reconnect", function () { self.onStatus("connecting"); });
      c.on("error", function () { if (!done) { clearTimeout(timer); self.leave(); finish({ ok: false, reason: "offline" }); } });
    });
  };

  Room.prototype.publishMe = function (patch) {
    if (!this.client || !this.me) return;
    if (patch) Object.keys(patch).forEach(function (k) { this.me[k] = patch[k]; }, this);
    this.me.ts = Date.now();
    var mine = PREFIX + this.code + "/m/" + this.meId;
    this.members[this.meId] = cleanMember(this.meId, this.me);
    this.client.publish(mine, JSON.stringify(this.me), { retain: true, qos: 1 });
  };

  Room.prototype.leave = function () {
    if (this.hb) { clearInterval(this.hb); this.hb = null; }
    var c = this.client; this.client = null;
    if (c) {
      try {
        if (c.connected && this.code && this.meId) c.publish(PREFIX + this.code + "/m/" + this.meId, "", { retain: true, qos: 1 }, function () { c.end(true); });
        else c.end(true);
      } catch (e) {}
    }
    this.me = null;
  };

  /* 好友上線狀態與聊天：每個人有自己的狀態頻道和收件匣
     u/<id>/st  保留訊息 {focus, ts}；斷線時伺服器自動改成 {off:1}
     u/<id>/in  收件匣：{type:"chat"|"friend", from, n, av, text, t} */
  function Social() {
    this.client = null; this.meId = null; this.status = {}; this.friends = [];
    this.onMessage = function () {}; this.onStatus = function () {}; this.state = { focus: false };
  }
  Social.prototype.start = function (meId, friendIds) {
    if (!window.mqtt || this.client) { if (this.client) this.setFriends(friendIds); return; }
    var self = this; this.meId = meId; this.friends = [];
    var st = PREFIX + "u/" + meId + "/st";
    try {
      this.client = window.mqtt.connect(BROKER, {
        clientId: "ks_" + meId + "_" + Math.random().toString(36).slice(2, 7),
        clean: true, keepalive: 30, reconnectPeriod: 5000, connectTimeout: 9000,
        will: { topic: st, payload: JSON.stringify({ off: 1 }), retain: true, qos: 1 }
      });
    } catch (e) { this.client = null; return; }
    this.client.on("connect", function () {
      self.client.subscribe(PREFIX + "u/" + meId + "/in", { qos: 1 });
      var ids = self.friends; self.friends = []; self.setFriends(ids.length ? ids : friendIds);
      self.publishState();
    });
    this.client.on("message", function (topic, payload) {
      var m = parse(payload);
      var parts = topic.slice(PREFIX.length).split("/"); // u, id, kind
      if (parts[2] === "st") {
        var id = parts[1];
        self.status[id] = m && !m.off && Date.now() - (+m.ts || 0) < 15 * 60 * 1000 ? { online: true, focus: !!m.focus, ts: +m.ts || 0 } : { online: false };
        self.onStatus(id);
      } else if (parts[2] === "in" && m && typeof m.from === "string" && m.from !== meId) {
        self.onMessage({ type: m.type === "friend" ? "friend" : "chat", from: m.from.slice(0, 16), n: String(m.n || "?").slice(0, 16), av: String(m.av || "🍅").slice(0, 4), text: String(m.text || "").slice(0, 200), t: +m.t || Date.now() });
      }
    });
    this.hb = setInterval(function () { self.publishState(); }, 60000);
  };
  Social.prototype.setFriends = function (ids) {
    ids = (ids || []).filter(function (x) { return /^[a-z0-9]{4,16}$/i.test(x); });
    if (!this.client || !this.client.connected) { this.friends = ids; return; }
    var self = this;
    ids.forEach(function (id) { if (self.friends.indexOf(id) < 0) self.client.subscribe(PREFIX + "u/" + id + "/st", { qos: 1 }); });
    this.friends.forEach(function (id) { if (ids.indexOf(id) < 0) { self.client.unsubscribe(PREFIX + "u/" + id + "/st"); delete self.status[id]; } });
    this.friends = ids.slice();
  };
  Social.prototype.setState = function (patch) {
    var changed = false;
    Object.keys(patch).forEach(function (k) { if (this.state[k] !== patch[k]) { this.state[k] = patch[k]; changed = true; } }, this);
    if (changed) this.publishState();
  };
  Social.prototype.publishState = function () {
    if (!this.client || !this.client.connected) return;
    this.client.publish(PREFIX + "u/" + this.meId + "/st", JSON.stringify({ focus: !!this.state.focus, ts: Date.now() }), { retain: true, qos: 1 });
  };
  Social.prototype.send = function (to, msg) {
    if (!this.client || !this.client.connected) return false;
    this.client.publish(PREFIX + "u/" + to + "/in", JSON.stringify(msg), { qos: 1 });
    return true;
  };
  Social.prototype.online = function () { return !!(this.client && this.client.connected); };

  window.KaidaNet = { Room: Room, Social: Social, MAX: MAX, BROKER: function () { return BROKER; } };
})();
