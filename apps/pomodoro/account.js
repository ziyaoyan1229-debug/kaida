/* 番茄讀書會：Google 帳號登入 + 雲端備份（Firebase Auth + Realtime Database）
   存檔整份放在 users/{uid}：{ d: 存檔 JSON 字串, ts: 存檔時間, dev: 哪台裝置 }
   本機記錄在 localStorage "kaida-acct"：{ uid, email, name, photo, at: 上次同步的雲端時間, dirty: 本機有沒同步的改動 } */
const STORE = "kaida-pomodoro-v1", ACCT = "kaida-acct", DEV = "kaida-dev";
const CONFIG = {
  apiKey: "AIzaSyAw6IfcnDFUzvV_I7qQpFckQW_I8zn3JUU",
  authDomain: "kaida-pomodoro.firebaseapp.com",
  databaseURL: "https://kaida-pomodoro-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kaida-pomodoro",
  storageBucket: "kaida-pomodoro.firebasestorage.app",
  messagingSenderId: "1016286554055",
  appId: "1:1016286554055:web:43da8ccbc711e35ae05be2"
};
const K = window.Kaida, t = (k, v) => K.t(k, v);
const ls = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
K.addStrings({
  zh: { "ac.sec": "帳號", "ac.h": "用 Google 帳號登入", "ac.p": "自動備份到雲端，換手機也能找回角色、小木頭和家", "ac.in": "Google 登入", "ac.out": "登出",
    "ac.synced": "已同步", "ac.saving": "同步中…", "ac.pending": "等一下就同步", "ac.errS": "同步失敗，稍後再試", "ac.loaded": "已載入雲端的存檔",
    "ac.offline": "沒有網路，連上後會自動同步", "ac.err": "登入失敗", "ac.outQ": "要登出嗎？這台裝置的進度會留著，之後不會再自動備份。",
    "ac.pick": "這個帳號雲端已經有存檔了。\n\n雲端：{cw} 根小木頭、{cd} 天紀錄\n這台：{mw} 根小木頭、{md} 天紀錄\n\n按「確定」用雲端的存檔；按「取消」用這台的進度覆蓋雲端。",
    "ac.both": "另一台裝置也改過進度。\n\n雲端：{cw} 根小木頭、{cd} 天紀錄\n這台：{mw} 根小木頭、{md} 天紀錄\n\n按「確定」用雲端的；按「取消」用這台的。" },
  en: { "ac.sec": "Account", "ac.h": "Sign in with Google", "ac.p": "Back up to the cloud and get your character, logs and home back on any phone", "ac.in": "Sign in with Google", "ac.out": "Sign out",
    "ac.synced": "Synced", "ac.saving": "Syncing…", "ac.pending": "Will sync shortly", "ac.errS": "Sync failed, will retry", "ac.loaded": "Loaded your cloud save",
    "ac.offline": "You're offline. It'll sync when you're back online.", "ac.err": "Sign-in failed", "ac.outQ": "Sign out? Progress on this device stays, but it won't back up anymore.",
    "ac.pick": "This account already has a cloud save.\n\nCloud: {cw} logs, {cd} days\nThis device: {mw} logs, {md} days\n\nOK uses the cloud save. Cancel overwrites the cloud with this device.",
    "ac.both": "Another device changed your progress too.\n\nCloud: {cw} logs, {cd} days\nThis device: {mw} logs, {md} days\n\nOK uses the cloud. Cancel keeps this device." }
});
{ const h = document.querySelector("#settings [data-i18n='ac.sec']"); if (h) h.textContent = t("ac.sec"); }
let acct = null;
try { acct = JSON.parse(ls.get(ACCT) || "null"); } catch (e) {}
let dev = ls.get(DEV);
if (!dev) { dev = Math.random().toString(36).slice(2, 10); ls.set(DEV, dev); }
function saveAcct() { if (acct) ls.set(ACCT, JSON.stringify(acct)); else ls.del(ACCT); }

let fb = null, auth = null, db = null, user = null, busy = false, state = "idle", pushT = 0, frozen = false;
async function boot() {
  if (fb) return fb;
  // 測試時可以用 window.KaidaFirebase 換掉真的 SDK
  fb = window.KaidaFirebase || await import("./vendor/firebase.min.js?v=20261103a");
  const app = fb.initializeApp(CONFIG);
  auth = fb.getAuth(app); db = fb.getDatabase(app);
  fb.onAuthStateChanged(auth, (u) => {
    user = u;
    if (u) {
      const first = !acct || acct.uid !== u.uid;
      acct = Object.assign(first ? { at: 0, dirty: true } : acct, { uid: u.uid, email: u.email || "", name: u.displayName || "", photo: u.photoURL || "" });
      saveAcct(); sync(first);
    } else if (acct) { acct = null; saveAcct(); }
    render();
  });
  try { await fb.getRedirectResult(auth); } catch (e) { fail(e); }
  return fb;
}

// 每次存檔就記下「有改動」，幾秒後上傳
const save0 = K.save;
K.save = function (key, val) {
  if (key === STORE && frozen) return true; // 正在換成雲端存檔，不讓舊資料蓋回去
  const r = save0.apply(this, arguments);
  if (key === STORE && acct) { acct.dirty = true; saveAcct(); clearTimeout(pushT); pushT = setTimeout(push, 4000); }
  return r;
};
document.addEventListener("visibilitychange", () => {
  if (!user) return;
  if (document.hidden) { if (acct && acct.dirty) push(); } else sync(false);
});

function local() { return ls.get(STORE); }
function info(str) { try { const d = JSON.parse(str); return { wood: d.wood || 0, name: (d.me && d.me.name) || "", n: Object.keys(d.days || {}).length }; } catch (e) { return { wood: 0, name: "", n: 0 }; } }
const node = () => fb.ref(db, "users/" + user.uid);

async function push() {
  clearTimeout(pushT);
  if (!user || busy || frozen) return;
  const d = local(); if (!d) return;
  busy = true; state = "saving"; render();
  try {
    const ts = Date.now();
    await fb.set(node(), { d, ts, dev });
    acct.at = ts; acct.dirty = false; saveAcct(); state = "ok";
  } catch (e) { state = "err"; fail(e); }
  busy = false; render();
}

function adopt(cloud) {
  frozen = true;
  ls.set(STORE, cloud.d);
  acct.at = cloud.ts; acct.dirty = false; saveAcct();
  K.toast(t("ac.loaded"));
  setTimeout(() => location.reload(), 700);
}

async function sync(first) {
  if (!user || busy || frozen) return;
  busy = true; state = "saving"; render();
  let cloud = null;
  try { cloud = (await fb.get(node())).val(); } catch (e) { busy = false; state = "err"; fail(e); render(); return; }
  busy = false;
  const mine = local();
  if (!cloud || !cloud.d) return push();                       // 雲端沒有：上傳這台的
  if (cloud.d === mine) { acct.at = cloud.ts; acct.dirty = false; saveAcct(); state = "ok"; render(); return; }
  const fresh = !info(mine).name;                               // 這台是新的（還沒建角色）
  if (first) {
    if (fresh) return adopt(cloud);
    const c = info(cloud.d), m = info(mine);
    if (confirm(t("ac.pick", { cw: c.wood, cd: c.n, mw: m.wood, md: m.n }))) return adopt(cloud);
    return push();
  }
  if (cloud.ts > (acct.at || 0) && cloud.dev !== dev) {         // 別台裝置更新過
    if (!acct.dirty || fresh) return adopt(cloud);
    const c = info(cloud.d), m = info(mine);
    if (confirm(t("ac.both", { cw: c.wood, cd: c.n, mw: m.wood, md: m.n }))) return adopt(cloud);
    return push();
  }
  if (acct.dirty) return push();
  state = "ok"; render();
}

function fail(e) {
  const c = e && e.code || "";
  if (c === "auth/popup-closed-by-user" || c === "auth/cancelled-popup-request") return;
  console.warn("[account]", e);
  K.toast(c === "auth/network-request-failed" || /network|offline/i.test(String(e && e.message)) ? t("ac.offline") : t("ac.err") + (c ? "（" + c + "）" : ""));
}

async function signIn() {
  try {
    await boot();
    const p = new fb.GoogleAuthProvider(); p.setCustomParameters({ prompt: "select_account" });
    try { await fb.signInWithPopup(auth, p); }
    catch (e) {
      if (/popup-blocked|operation-not-supported|web-storage/.test(e.code || "")) await fb.signInWithRedirect(auth, p);
      else throw e;
    }
  } catch (e) { fail(e); }
}
async function signOut() {
  if (!confirm(t("ac.outQ"))) return;
  try { if (acct && acct.dirty) await push(); await fb.signOut(auth); } catch (e) { fail(e); }
  acct = null; user = null; saveAcct(); render();
}

function render() {
  const el = document.getElementById("acct"); if (!el) return;
  const esc = K.esc;
  if (acct && user) {
    const st = state === "saving" ? t("ac.saving") : state === "err" ? t("ac.errS") : acct.dirty ? t("ac.pending") : t("ac.synced");
    el.innerHTML = (acct.photo ? '<img class="ac-av" alt="" referrerpolicy="no-referrer" src="' + esc(acct.photo) + '">' : '<span class="ac-av">G</span>') +
      '<span class="ac-t"><b>' + esc(acct.name || acct.email) + '</b><small>' + esc(acct.email) + ' · ' + esc(st) + '</small></span>' +
      '<button type="button" class="btn ghost ac-out" id="ac-out">' + esc(t("ac.out")) + '</button>';
    el.querySelector("#ac-out").onclick = signOut;
  } else {
    el.innerHTML = '<span class="ac-t"><b>' + esc(t("ac.h")) + '</b><small>' + esc(t("ac.p")) + '</small></span>' +
      '<button type="button" class="ac-g" id="ac-in"' + (acct ? " disabled" : "") + '><svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>' + esc(t("ac.in")) + '</button>';
    el.querySelector("#ac-in").onclick = signIn;
  }
}

render();
if (acct) boot().catch(fail);
K.onLang(render);
window.KaidaAccount = { signIn, signOut, sync, push, state: () => ({ acct, user: !!user, state }) };
