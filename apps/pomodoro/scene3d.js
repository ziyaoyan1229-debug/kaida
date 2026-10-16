/* 番茄讀書會：3D 原木風讀書房（three.js）
   window.KaidaScene3D.mount(el) → 是否成功；.update(members)；members: [{ id, name, look, act, me, bubble, up }] */
import * as THREE from "./vendor/three.module.min.js";

const ACTS3 = ["read", "novel", "homework", "research", "report", "code", "pc", "draw", "vocab", "journal", "calligraphy", "lesson"];
const WRITE_ACTS = ["homework", "draw", "report", "vocab", "journal", "calligraphy"];
const SKINS = ["#f6d7bd", "#e9b994", "#c98e64"];
const HAIRS = ["#3b2a20", "#7a4a2a", "#c58b4c", "#2c2c34"];
const TOPS = { "tee-blue": "#7fa6c9", "tee-pink": "#e7a6a8", stripe: "#f3efe6", hoodie: "#8fae7a", sweater: "#e0b04f", cardigan: "#e6d3b3", plaid: "#c8574a", sport: "#3f6f6a", overalls: "#f3efe6" };

/* ===== 小工具 ===== */
const mats = {};
function mat(color, opt) {
  const key = color + JSON.stringify(opt || {});
  if (!mats[key]) mats[key] = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, opt || {}));
  return mats[key];
}
function box(w, h, d, m, x, y, z, parent) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof m === "string" ? mat(m) : m);
  o.position.set(x || 0, y || 0, z || 0); o.castShadow = true; o.receiveShadow = true;
  if (parent) parent.add(o);
  return o;
}
function cyl(rt, rb, h, m, x, y, z, parent, seg) {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), typeof m === "string" ? mat(m) : m);
  o.position.set(x || 0, y || 0, z || 0); o.castShadow = true; o.receiveShadow = true;
  if (parent) parent.add(o);
  return o;
}
function sph(r, m, x, y, z, parent, ws, hs) {
  const o = new THREE.Mesh(new THREE.SphereGeometry(r, ws || 20, hs || 14), typeof m === "string" ? mat(m) : m);
  o.position.set(x || 0, y || 0, z || 0); o.castShadow = true;
  if (parent) parent.add(o);
  return o;
}
function cap(r, len, m, parent) {
  const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 12), typeof m === "string" ? mat(m) : m);
  o.castShadow = true; if (parent) parent.add(o);
  return o;
}

/* 原木紋理 */
function woodTexture(base, dark, planks, vertical, w, h) {
  const c = document.createElement("canvas"); c.width = w || 512; c.height = h || 512;
  const g = c.getContext("2d");
  g.fillStyle = base; g.fillRect(0, 0, c.width, c.height);
  const n = planks, size = (vertical ? c.width : c.height) / n;
  for (let i = 0; i < n; i++) {
    const shade = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    g.fillStyle = "rgba(" + (shade > 0 ? "255,240,220," + (Math.abs(shade) * 0.12) : "60,30,10," + (Math.abs(shade) * 0.14)) + ")";
    if (vertical) g.fillRect(i * size, 0, size, c.height); else g.fillRect(0, i * size, c.width, size);
    // 木紋
    g.strokeStyle = dark; g.globalAlpha = 0.18; g.lineWidth = 1.2;
    for (let k = 0; k < 5; k++) {
      g.beginPath();
      const off = (k + 1) * size / 6;
      for (let t = 0; t <= (vertical ? c.height : c.width); t += 16) {
        const wob = Math.sin(t * 0.02 + i * 3 + k) * 2.2;
        if (vertical) { if (t === 0) g.moveTo(i * size + off + wob, t); else g.lineTo(i * size + off + wob, t); }
        else { if (t === 0) g.moveTo(t, i * size + off + wob); else g.lineTo(t, i * size + off + wob); }
      }
      g.stroke();
    }
    // 木節
    g.globalAlpha = 0.25; g.fillStyle = dark;
    const kx = ((i * 97) % 83) / 83 * (vertical ? c.height : c.width);
    g.beginPath(); if (vertical) g.ellipse(i * size + size / 2, kx, size / 7, size / 4, 0, 0, 7); else g.ellipse(kx, i * size + size / 2, size / 4, size / 7, 0, 0, 7); g.fill();
    // 接縫
    g.globalAlpha = 0.55; g.fillStyle = dark;
    if (vertical) g.fillRect(i * size, 0, 2, c.height); else g.fillRect(0, i * size, c.width, 2);
    // 錯開的短接縫
    const cut = ((i * 53) % 71) / 71 * (vertical ? c.height : c.width);
    if (vertical) g.fillRect(i * size, cut, size, 2); else g.fillRect(cut, i * size, 2, size);
    g.globalAlpha = 1;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 4;
  return tex;
}
function rugTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#c9825e"; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#f3e3c6"; g.lineWidth = 6; g.setLineDash([14, 10]);
  g.beginPath(); g.arc(128, 128, 104, 0, 7); g.stroke();
  g.setLineDash([]); g.strokeStyle = "#e8b07a"; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 70, 0, 7); g.stroke();
  g.fillStyle = "#f3e3c6"; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.beginPath(); g.arc(128 + Math.cos(a) * 40, 128 + Math.sin(a) * 40, 6, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function skyTexture(kind) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 192;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 0, 192);
  if (kind === "day") { grad.addColorStop(0, "#8cc4ec"); grad.addColorStop(1, "#d8eef7"); }
  else if (kind === "sunset") { grad.addColorStop(0, "#f1a56b"); grad.addColorStop(0.6, "#f8cf98"); grad.addColorStop(1, "#fbe3bd"); }
  else { grad.addColorStop(0, "#14203a"); grad.addColorStop(1, "#33476e"); }
  g.fillStyle = grad; g.fillRect(0, 0, 256, 192);
  if (kind === "night") {
    g.fillStyle = "#fff"; for (let i = 0; i < 50; i++) { g.globalAlpha = 0.4 + (i % 5) / 8; g.fillRect((i * 73) % 256, (i * 41) % 120, 1.6, 1.6); }
    g.globalAlpha = 1; g.fillStyle = "#fff4d2"; g.beginPath(); g.arc(190, 50, 16, 0, 7); g.fill();
    g.fillStyle = "#33476e"; g.beginPath(); g.arc(198, 45, 14, 0, 7); g.fill();
  } else {
    g.fillStyle = kind === "day" ? "#fff8dc" : "#fff1c9"; g.beginPath(); g.arc(kind === "day" ? 70 : 128, kind === "day" ? 50 : 120, 18, 0, 7); g.fill();
    g.fillStyle = "rgba(255,255,255,.75)";
    [[40, 90], [150, 60], [210, 100]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 26, 9, 0, 0, 7); g.ellipse(x + 14, y - 6, 16, 9, 0, 0, 7); g.fill(); });
  }
  // 遠山與樹
  g.fillStyle = kind === "night" ? "#1c2a44" : "#9cbf8a";
  g.beginPath(); g.moveTo(0, 160); g.quadraticCurveTo(60, 120, 120, 150); g.quadraticCurveTo(190, 115, 256, 150); g.lineTo(256, 192); g.lineTo(0, 192); g.fill();
  g.fillStyle = kind === "night" ? "#15213a" : "#6f9a62";
  for (let i = 0; i < 8; i++) { const x = 10 + i * 34; g.beginPath(); g.moveTo(x, 192); g.lineTo(x + 10, 150 + (i % 3) * 8); g.lineTo(x + 20, 192); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function glowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.4, "rgba(255,255,255,.45)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* ===== 房間配置 ===== */
// 六個座位散在房間各處：x, z 是人坐的位置，ry 是面向（0 = 面向鏡頭那一側）
const SEATS = [
  { x: 0.9, z: 0.6, ry: -0.35, booth: "plants" },  // 房間中間（綠植隔開）
  { x: 3.6, z: 3.7, ry: -0.6, booth: "board" },     // 前面右邊（有隔板）
  { x: 5.0, z: 0.1, ry: 1.3, booth: "board" },      // 右邊靠牆角（有隔板）
  { x: -1.55, z: -1.55, ry: 0.45 },              // 書櫃旁
  { x: -0.4, z: 4.3, ry: 0.25, booth: "plants" },    // 前面左邊（有隔板）
  { x: 0.2, z: -2.72, ry: Math.PI }              // 窗邊書桌（面向窗外）
];
const DESK_D = 0.58;
SEATS.forEach((s) => { s.dx = s.x + Math.sin(s.ry) * DESK_D; s.dz = s.z + Math.cos(s.ry) * DESK_D; });
const SPOTS = [
  { x: -3.85, z: -1.6, ry: -Math.PI / 2, pose: "warm" },              // 火爐前
  { x: -2.95, z: 1.45, ry: -Math.PI / 2, pose: "sofa", seat: 0.5 },   // 沙發看電視
  { x: -2.95, z: 2.35, ry: -Math.PI / 2, pose: "sofa", seat: 0.5 },
  { x: 2.55, z: -2.95, ry: Math.PI, pose: "mug" },                    // 飲料吧
  { x: 4.3, z: -3.05, ry: Math.PI, pose: "snack" },                   // 零食櫃
  { x: -2.95, z: -3.05, ry: Math.PI, pose: "book" },                  // 書櫃
  { x: -3.45, z: -2.45, ry: -2.3, pose: "pet" },                      // 摸貓窩裡的貓
  { x: 6.0, z: 2.4, ry: -1.0, pose: "sofa", seat: 0.3 },             // 懶骨頭
  { x: -3.0, z: -0.85, ry: -2.09, pose: "sofa", seat: 0.48 },         // 單人沙發烤火
  { x: -3.25, z: 3.75, ry: Math.PI, pose: "sofa", seat: 0.48 },       // 雙人沙發
  { x: -2.45, z: 3.75, ry: Math.PI, pose: "sofa", seat: 0.48 },
  { x: -4.05, z: 0.45, ry: -Math.PI / 2, pose: "music" },             // 換唱片
  { x: -1.1, z: -3.05, ry: Math.PI, pose: "stand" },                  // 看窗外
  { x: 1.9, z: -0.9, ry: -0.4, pose: "stretch" },
  { x: 5.6, z: 5.2, ry: -0.3, pose: "stand" },
  { x: 2.4, z: 1.9, ry: 0.6, pose: "stretch" },
  { x: 6.3, z: -2.6, ry: -0.8, pose: "stand" },
  { x: -1.75, z: 0.75, ry: 0.4, pose: "stretch" }
];
// 走路用格子（0.25 一格）
const GRID = { x0: -5, z0: -4, cell: 0.25, cols: 50, rows: 44 };
const OBST = [
  [-5, -2.7, -4.15, -0.5],     // 火爐 x1,z1,x2,z2
  [-5, 0.7, -4.45, 3.1],       // 電視櫃與音響
  [-4.05, 1.45, -3.45, 2.35],  // 茶几
  [-3.25, 0.8, -2.25, 3.0],    // 沙發
  [-3.75, -4, -2.2, -3.5],     // 書櫃
  [1.7, -4, 3.45, -3.35],      // 飲料吧
  [1.95, -3.25, 2.25, -2.95], [2.85, -3.25, 3.15, -2.95], // 吧台椅
  [3.65, -4, 4.95, -3.45],     // 零食櫃
  [-4.1, -3.05, -3.6, -2.55],  // 貓窩
  [6.75, 5.45, 7.4, 6.2],       // 盆栽
  [-5, -4, -4.3, -3.3],        // 角落盆栽
  [-4.95, 3.35, -4.15, 4.15],  // 龜背芋
  [4.35, -2.65, 4.85, -2.15],  // 小盆栽
  [6.6, -3.95, 7.4, -3.1],     // 右後盆栽
  [1.95, 5.65, 2.45, 6.15],    // 前面盆栽
  [4.85, 2.95, 6.35, 4.25],    // 小圓咖啡桌
  [6.3, -2.35, 6.9, -1.65],    // 黑板
  [-2.75, 0.4, -2.45, 0.7],    // 落地燈
  [5.85, 2.15, 6.3, 2.65],     // 懶骨頭
  [-3.4, -1.3, -2.6, -0.4],    // 單人沙發
  [-3.75, 3.3, -1.95, 4.3]     // 雙人沙發
];
SEATS.forEach((s) => {
  const c = Math.abs(Math.cos(s.ry)), sn = Math.abs(Math.sin(s.ry));
  const hx = c * 0.56 + sn * 0.32, hz = sn * 0.56 + c * 0.32;
  OBST.push([s.dx - hx, s.dz - hz, s.dx + hx, s.dz + hz]);
  OBST.push([s.x - 0.26, s.z - 0.26, s.x + 0.26, s.z + 0.26]);
  if (s.booth === "plants") { const px = s.dx + Math.sin(s.ry) * 0.55, pz = s.dz + Math.cos(s.ry) * 0.55, ex = c * 0.66 + sn * 0.15, ez = sn * 0.66 + c * 0.15; OBST.push([px - ex, pz - ez, px + ex, pz + ez]); }
});

let blocked = null;
function buildGrid() {
  blocked = new Uint8Array(GRID.cols * GRID.rows);
  for (let r = 0; r < GRID.rows; r++) for (let c = 0; c < GRID.cols; c++) {
    const x = GRID.x0 + (c + 0.5) * GRID.cell, z = GRID.z0 + (r + 0.5) * GRID.cell;
    let b = x < -4.75 || x > 7.3 || z < -3.75 || z > 6.4;
    for (const o of OBST) if (x > o[0] - 0.18 && x < o[2] + 0.18 && z > o[1] - 0.18 && z < o[3] + 0.18) { b = true; break; }
    blocked[r * GRID.cols + c] = b ? 1 : 0;
  }
}
function cellOf(x, z) { return [Math.max(0, Math.min(GRID.cols - 1, Math.floor((x - GRID.x0) / GRID.cell))), Math.max(0, Math.min(GRID.rows - 1, Math.floor((z - GRID.z0) / GRID.cell)))]; }
function centerOf(c, r) { return { x: GRID.x0 + (c + 0.5) * GRID.cell, z: GRID.z0 + (r + 0.5) * GRID.cell }; }
function free(c, r) { return c >= 0 && r >= 0 && c < GRID.cols && r < GRID.rows && !blocked[r * GRID.cols + c]; }
function nearestFree(c, r) {
  if (free(c, r)) return [c, r];
  for (let d = 1; d < 8; d++) for (let dc = -d; dc <= d; dc++) for (let dr = -d; dr <= d; dr++) if (free(c + dc, r + dr)) return [c + dc, r + dr];
  return [c, r];
}
function lineFree(a, b) {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.1);
  for (let i = 1; i < n; i++) { const [c, r] = cellOf(a.x + (b.x - a.x) * i / n, a.z + (b.z - a.z) * i / n); if (!free(c, r)) return false; }
  return true;
}
function findPath(from, to) {
  const [sc, sr] = nearestFree(...cellOf(from.x, from.z)), [ec, er] = nearestFree(...cellOf(to.x, to.z));
  const N = GRID.cols * GRID.rows, g = new Float32Array(N).fill(1e9), prev = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
  const open = [sr * GRID.cols + sc]; g[open[0]] = 0;
  const goal = er * GRID.cols + ec;
  const h = (i) => Math.hypot((i % GRID.cols) - ec, Math.floor(i / GRID.cols) - er);
  let guard = 0;
  while (open.length && guard++ < 4000) {
    let bi = 0; for (let i = 1; i < open.length; i++) if (g[open[i]] + h(open[i]) < g[open[bi]] + h(open[bi])) bi = i;
    const cur = open.splice(bi, 1)[0];
    if (cur === goal) break;
    closed[cur] = 1;
    const cc = cur % GRID.cols, cr = Math.floor(cur / GRID.cols);
    for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
      if (!dc && !dr) continue;
      const nc = cc + dc, nr = cr + dr; if (!free(nc, nr)) continue;
      if (dc && dr && (!free(cc + dc, cr) || !free(cc, cr + dr))) continue;
      const ni = nr * GRID.cols + nc; if (closed[ni]) continue;
      const ng = g[cur] + (dc && dr ? 1.414 : 1);
      if (ng < g[ni]) { g[ni] = ng; prev[ni] = cur; if (open.indexOf(ni) < 0) open.push(ni); }
    }
  }
  const pts = [];
  let cur = goal;
  if (prev[cur] < 0 && cur !== sr * GRID.cols + sc) return [{ x: to.x, z: to.z }];
  while (cur >= 0) { pts.unshift(centerOf(cur % GRID.cols, Math.floor(cur / GRID.cols))); cur = prev[cur]; }
  pts.push({ x: to.x, z: to.z });
  // 拉直
  const out = [{ x: from.x, z: from.z }];
  let i = 0;
  while (i < pts.length - 1) {
    let j = pts.length - 1;
    while (j > i + 1 && !lineFree(out[out.length - 1], pts[j])) j--;
    out.push(pts[j]); i = j;
  }
  out.shift();
  return out;
}

/* ===== 角色 ===== */
function makeChar(look) {
  look = look || {};
  const skin = SKINS[look.skin] || SKINS[0], hair = HAIRS[look.hair] || HAIRS[0];
  const top = TOPS[look.top] || TOPS["tee-blue"], girl = look.g === "girl";
  const root = new THREE.Group();
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.28, 20), new THREE.MeshBasicMaterial({ color: 0x3a2a1a, transparent: true, opacity: 0.18, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01; root.add(shadow);
  const hips = new THREE.Group(); hips.position.y = 0.36; root.add(hips);
  // 腿
  const legs = [];
  [-0.085, 0.085].forEach((x) => {
    const p = new THREE.Group(); p.position.set(x, 0, 0); hips.add(p);
    const l = cap(0.07, 0.17, "#5b5f7a", p); l.position.y = -0.17;
    const shoe = sph(0.085, "#4a3a30", 0, -0.33, 0.03, p); shoe.scale.set(1, 0.6, 1.3);
    legs.push(p);
  });
  // 身體
  const torso = new THREE.Group(); hips.add(torso);
  const body = cap(0.17, 0.16, top, torso); body.position.y = 0.2; body.scale.set(1, 1, 0.85);
  if (look.top === "stripe") [0.12, 0.2, 0.28].forEach((y) => { const s = cyl(0.172, 0.172, 0.035, "#5d7fa8", 0, y, 0, torso); s.scale.z = 0.85; });
  if (look.top === "hoodie") { const hd = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.045, 8, 20), mat("#7a9a66")); hd.rotation.x = Math.PI / 2; hd.position.set(0, 0.4, -0.04); torso.add(hd); }
  if (look.top === "sweater") { const hm = cyl(0.175, 0.175, 0.05, "#c99a3e", 0, 0.06, 0, torso); hm.scale.z = 0.85; }
  if (look.top === "cardigan") { box(0.1, 0.3, 0.02, "#f8f4ec", 0, 0.2, 0.15, torso); [0.26, 0.18].forEach((y) => sph(0.012, "#a08a6a", -0.06, y, 0.155, torso, 6, 4)); }
  if (look.top === "plaid") { [0.1, 0.2, 0.3].forEach((y) => { const b2 = cyl(0.173, 0.173, 0.018, "#8a3a32", 0, y, 0, torso); b2.scale.z = 0.85; }); [-0.07, 0, 0.07].forEach((x) => box(0.016, 0.34, 0.02, "#8a3a32", x, 0.2, 0.142, torso)); }
  if (look.top === "sport") { box(0.012, 0.32, 0.02, "#f3efe6", 0, 0.2, 0.145, torso); }
  if (look.top === "overalls") { box(0.2, 0.16, 0.03, "#5d7fa8", 0, 0.14, 0.14, torso); const lw = cyl(0.172, 0.172, 0.12, "#5d7fa8", 0, 0.03, 0, torso); lw.scale.z = 0.85; [-0.07, 0.07].forEach((x) => { box(0.035, 0.22, 0.02, "#5d7fa8", x, 0.3, 0.13, torso); sph(0.015, "#e8b93a", x, 0.22, 0.15, torso, 6, 4); }); }
  if (look.back === "backpack") { const bp = box(0.3, 0.32, 0.16, "#e0b04f", 0, 0.22, -0.2, torso); box(0.22, 0.12, 0.04, "#c99a3e", 0, 0.14, -0.29, torso); [-0.09, 0.09].forEach((x) => box(0.035, 0.3, 0.02, "#b98a30", x, 0.24, 0.135, torso)); bp.castShadow = true; }
  if (look.back === "wings") { [-1, 1].forEach((sd) => { const w = sph(0.22, "#fffdf8", sd * 0.18, 0.3, -0.2, torso, 14, 10); w.scale.set(0.9, 0.55, 0.15); w.rotation.z = sd * -0.5; w.rotation.y = sd * 0.4; }); }
  if (look.neck === "bowtie") [-1, 1].forEach((sd) => { const b3 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.09, 8), mat("#c2453b")); b3.rotation.z = sd * Math.PI / 2; b3.position.set(sd * 0.045, 0.37, 0.15); torso.add(b3); });
  if (look.neck === "pearls") { for (let i = 0; i < 9; i++) { const a = Math.PI * (0.15 + i * 0.0875); sph(0.022, mat("#fffdf8", { roughness: 0.2 }), Math.cos(a) * 0.14, 0.35 - Math.sin(a) * 0.03, Math.sin(a) * 0.13, torso, 8, 6); } }
  if (look.neck === "scarf") { const sc = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.055, 8, 20), mat("#c2453b")); sc.rotation.x = Math.PI / 2; sc.position.y = 0.4; torso.add(sc); box(0.08, 0.18, 0.04, "#c2453b", 0.07, 0.3, 0.14, torso); }
  // 手臂
  const arms = [];
  [-1, 1].forEach((s) => {
    const p = new THREE.Group(); p.position.set(0.2 * s, 0.36, 0); torso.add(p);
    const a = cap(0.055, 0.16, top, p); a.position.y = -0.13;
    sph(0.06, skin, 0, -0.26, 0, p);
    p.rotation.z = 0.12 * s;
    arms.push(p);
  });
  // 頭
  const head = new THREE.Group(); head.position.y = 0.72; torso.add(head);
  const hs = sph(0.3, skin, 0, 0, 0, head, 28, 20); hs.scale.set(1.05, 0.95, 1);
  // 頭髮
  const capG = new THREE.SphereGeometry(0.325, 28, 16, 0, Math.PI * 2, 0, Math.PI * (girl ? 0.5 : 0.46));
  const hairCap = new THREE.Mesh(capG, mat(hair)); hairCap.castShadow = true; hairCap.rotation.x = -0.32; hairCap.position.set(0, 0.02, -0.01); hairCap.scale.set(1.05, 1, 1.02); head.add(hairCap);
  const style = look.style || "";
  if (style === "bob") { const b4 = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), mat(hair)); b4.rotation.x = -0.55; b4.position.set(0, 0.02, -0.03); b4.scale.set(1.08, 1, 1.02); head.add(b4); const fr2 = box(0.46, 0.08, 0.06, hair, 0, 0.17, 0.26, head); fr2.rotation.x = -0.25; }
  else if (style === "long") { const bk = cap(0.27, 0.42, hair, head); bk.position.set(0, -0.25, -0.12); bk.scale.set(1.1, 1, 0.6); const fr2 = sph(0.12, hair, -0.1, 0.17, 0.22, head); fr2.scale.set(1.4, 0.55, 0.8); }
  else if (style === "pony") { sph(0.12, hair, 0, 0.12, -0.3, head); const tl = cap(0.08, 0.28, hair, head); tl.position.set(0, -0.12, -0.36); tl.rotation.x = 0.25; sph(0.045, "#e7a6a8", 0, 0.12, -0.2, head); const fr2 = sph(0.11, hair, 0.08, 0.17, 0.22, head); fr2.scale.set(1.4, 0.55, 0.8); }
  else if (style === "buns") { [-1, 1].forEach((sd) => sph(0.12, hair, sd * 0.2, 0.3, -0.03, head, 14, 10)); const fr2 = sph(0.12, hair, 0, 0.17, 0.22, head); fr2.scale.set(1.6, 0.5, 0.8); }
  else if (style === "curly") { for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r0 = 0.28; sph(0.1, hair, Math.cos(a) * r0, 0.14 + Math.sin(i * 1.7) * 0.06, Math.sin(a) * r0 * 0.95 - 0.02, head, 10, 8); } for (let i = 0; i < 5; i++) sph(0.11, hair, -0.16 + i * 0.08, 0.3, -0.02 + (i % 2) * 0.05, head, 10, 8); }
  else if (style === "spiky") { for (let i = 0; i < 9; i++) { const k2 = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 6), mat(hair)); const a = (i - 4) * 0.28; k2.position.set(Math.sin(a) * 0.22, 0.3 + Math.cos(a) * 0.05, (i % 2 ? -0.05 : 0.08)); k2.rotation.z = -a * 0.9; k2.rotation.x = i % 2 ? -0.4 : 0.3; head.add(k2); } }
  else if (girl) {
    const back = cap(0.25, 0.18, hair, head); back.position.set(0, -0.14, -0.1); back.scale.set(1.15, 1, 0.75);
    sph(0.06, "#e7a6a8", 0.24, 0.2, 0.08, head);
  } else {
    const fr = sph(0.11, hair, 0.1, 0.17, 0.22, head); fr.scale.set(1.3, 0.55, 0.8);
  }
  // 臉
  const eyeM = mat("#2f2622", { roughness: 0.3 });
  const eyes = [-0.1, 0.1].map((x) => { const e = sph(0.035, eyeM, x, -0.01, 0.285, head, 10, 8); e.scale.set(0.9, 1.25, 0.6); return e; });
  [-0.17, 0.17].forEach((x) => { const b = new THREE.Mesh(new THREE.CircleGeometry(0.045, 14), new THREE.MeshBasicMaterial({ color: 0xf0a0a0, transparent: true, opacity: 0.55 })); b.position.set(x, -0.08, 0.27); b.rotation.y = x * 1.6; head.add(b); });
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 12, Math.PI), mat("#7a4a3a")); mouth.rotation.z = Math.PI; mouth.position.set(0, -0.1, 0.29); head.add(mouth);
  // 配件
  if (look.face === "glasses") [-0.1, 0.1].forEach((x) => { const gl = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.01, 6, 18), mat("#4a3a2c")); gl.position.set(x, -0.01, 0.3); head.add(gl); });
  if (look.face === "shades") { [-0.1, 0.1].forEach((x) => { const sg = cyl(0.07, 0.07, 0.02, "#2a2620", x, -0.005, 0.3, head, 16); sg.rotation.x = Math.PI / 2; }); box(0.06, 0.015, 0.015, "#2a2620", 0, 0.01, 0.31, head); }
  if (look.face === "star") { const st2 = cyl(0.04, 0.04, 0.01, "#e8b93a", 0.17, -0.06, 0.255, head, 5); st2.rotation.x = Math.PI / 2; st2.rotation.y = 0.3; }
  if (look.ears === "muffs") { const band = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.022, 8, 24, Math.PI), mat("#c98e9a")); band.position.y = 0.02; head.add(band); [-0.33, 0.33].forEach((x) => sph(0.1, "#f2c4c8", x, 0, 0, head, 12, 10)); }
  if (look.hat === "cap") { const cp = new THREE.Mesh(new THREE.SphereGeometry(0.335, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), mat("#5d7fa8")); cp.position.y = 0.04; cp.rotation.x = -0.12; head.add(cp); const brim = cyl(0.2, 0.2, 0.025, "#4a6a90", 0, 0.12, 0.3, head, 20); brim.scale.z = 0.8; brim.rotation.x = 0.15; sph(0.025, "#4a6a90", 0, 0.36, 0, head, 6, 4); }
  if (look.hat === "bunnyband") { const band = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.02, 6, 20, Math.PI), mat("#e7a6a8")); band.position.y = 0.05; band.rotation.y = Math.PI / 2; band.rotation.x = 0; head.add(band); [-1, 1].forEach((sd) => { const e = cap(0.055, 0.26, "#fffdf8", head); e.position.set(sd * 0.11, 0.48, -0.02); e.rotation.z = -sd * 0.18; const inn = cap(0.025, 0.2, "#f2c4c8", head); inn.position.set(sd * 0.11, 0.48, 0.03); inn.rotation.z = -sd * 0.18; }); }
  if (look.hat === "flower") { const fl = new THREE.Group(); fl.position.set(-0.24, 0.22, 0.12); head.add(fl); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; sph(0.04, "#e7a6a8", Math.cos(a) * 0.045, Math.sin(a) * 0.045, 0, fl, 8, 6); } sph(0.03, "#f2cc4a", 0, 0, 0.02, fl, 8, 6); }
  if (look.ears === "phones") {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 8, 24, Math.PI), mat("#5a6b7a")); band.position.y = 0.02; head.add(band);
    [-0.33, 0.33].forEach((x) => { const e = cyl(0.08, 0.08, 0.07, "#5a6b7a", x, 0.0, 0, head); e.rotation.z = Math.PI / 2; });
  }
  if (look.hat === "beanie") { const b = new THREE.Mesh(new THREE.SphereGeometry(0.335, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), mat("#c8574a")); b.position.y = 0.05; b.rotation.x = -0.15; head.add(b); cyl(0.33, 0.33, 0.08, "#a9463c", 0, 0.08, -0.02, head).rotation.x = -0.15; sph(0.07, "#f3efe6", 0, 0.38, -0.04, head); }
  if (look.hat === "straw") { cyl(0.55, 0.55, 0.025, "#e6c27a", 0, 0.2, -0.02, head, 28); cyl(0.24, 0.27, 0.18, "#e6c27a", 0, 0.29, -0.02, head); cyl(0.272, 0.272, 0.04, "#c2453b", 0, 0.23, -0.02, head); }
  if (look.hat === "beret") { const b = sph(0.3, "#3d3a4a", 0.04, 0.24, -0.03, head); b.scale.set(1.05, 0.35, 1); sph(0.03, "#3d3a4a", 0.04, 0.34, -0.03, head); }
  if (look.hat === "crown") { const cr = cyl(0.16, 0.16, 0.12, mat("#e8b93a", { metalness: 0.5, roughness: 0.35 }), 0, 0.33, 0, head, 10); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const k = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.09, 6), mat("#e8b93a", { metalness: 0.5, roughness: 0.35 })); k.position.set(Math.cos(a) * 0.15, 0.43, Math.sin(a) * 0.15); head.add(k); } sph(0.03, "#c2453b", 0, 0.34, 0.16, head); cr.castShadow = true; }
  // 寵物夥伴
  const cat = look.pet ? makePet(look.pet) : null;
  // 手上的小東西：書（翻頁）、杯子、餅乾，依動作顯示
  const book = new THREE.Group(); book.position.set(0, 0.3, 0.26); book.rotation.x = -0.75; torso.add(book);
  box(0.36, 0.012, 0.24, "#7a5c8a", 0, -0.008, 0, book);
  [-1, 1].forEach((sd) => box(0.165, 0.02, 0.22, "#fffaf0", sd * 0.087, 0.006, 0, book));
  const page = new THREE.Group(); page.position.set(0, 0.018, 0); book.add(page);
  box(0.16, 0.004, 0.21, "#fff8e8", 0.08, 0, 0, page);
  book.visible = false; book.userData.page = page;
  const cup = new THREE.Group(); cup.position.set(0, -0.3, 0.06); arms[1].add(cup);
  cyl(0.055, 0.045, 0.11, "#f8f4ec", 0, 0, 0, cup, 12); cyl(0.05, 0.05, 0.005, "#7a4a2a", 0, 0.052, 0, cup, 12);
  const hdl = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 6, 10), mat("#f8f4ec")); hdl.position.set(0.06, 0, 0); cup.add(hdl);
  cup.visible = false;
  const cookie = new THREE.Group(); cookie.position.set(0, -0.31, 0.06); arms[1].add(cookie);
  const ck = cyl(0.06, 0.06, 0.02, "#c98f52", 0, 0, 0, cookie, 14); ck.rotation.x = Math.PI / 2;
  [[-0.02, 0.01], [0.02, -0.015], [0.015, 0.025]].forEach(([x, y]) => sph(0.009, "#5a3a22", x, y, 0.012, cookie, 6, 4));
  cookie.visible = false;
  return { root, hips, torso, head, legs, arms, eyes, cat, book, cup, cookie };
}

/* ===== 寵物 ===== */
function makePet(kind) {
  const g = new THREE.Group();
  const col = { cat: "#e3a35b", shiba: "#d9914a", bunny: "#fffdf8", chick: "#f2cc4a", panda: "#fffdf8" }[kind] || "#e3a35b";
  let tail;
  if (kind === "chick") {
    const b = sph(0.14, col, 0, 0.14, 0, g); b.scale.set(1, 0.95, 1.05);
    const bk = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 6), mat("#e0a830")); bk.rotation.x = Math.PI / 2; bk.position.set(0, 0.16, 0.15); g.add(bk);
    [-0.05, 0.05].forEach((x) => sph(0.015, "#2f2622", x, 0.2, 0.12, g, 6, 6));
    tail = sph(0.05, col, 0, 0.18, -0.12, g, 8, 6); tail.scale.set(1, 0.6, 1);
    [-0.1, 0.1].forEach((x) => { const w = sph(0.06, "#e8bf3a", x * 1.3, 0.13, 0, g, 8, 6); w.scale.set(0.4, 0.8, 1); });
  } else {
    const c1 = sph(0.13, col, 0, 0.12, 0, g); c1.scale.set(0.9, 0.8, 1.3);
    const hd = sph(0.1, col, 0, 0.25, 0.14, g);
    if (kind === "panda") { [-0.06, 0.06].forEach((x) => { sph(0.035, "#2a2620", x, 0.34, 0.12, g, 8, 6); const p2 = sph(0.028, "#2a2620", x * 0.7, 0.26, 0.225, g, 8, 6); p2.scale.set(0.8, 1, 0.5); }); [-0.08, 0.08].forEach((x) => sph(0.05, "#2a2620", x, 0.06, 0.1, g, 8, 6)); c1.scale.set(1, 0.85, 1.25); }
    else if (kind === "bunny") { [-0.035, 0.035].forEach((x) => { const e = cap(0.025, 0.14, "#fffdf8", g); e.position.set(x, 0.42, 0.12); e.rotation.z = x * 3; const inn = cap(0.012, 0.1, "#f2c4c8", g); inn.position.set(x, 0.42, 0.14); inn.rotation.z = x * 3; }); }
    else { [-0.05, 0.05].forEach((x) => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 4), mat(col)); e.position.set(x, 0.35, 0.14); g.add(e); }); }
    if (kind === "shiba") { const m2 = sph(0.06, "#fff4e4", 0, 0.22, 0.21, g, 8, 6); m2.scale.set(1.2, 0.8, 0.8); }
    if (kind !== "panda") [-0.04, 0.04].forEach((x) => sph(0.015, "#2f2622", x, 0.26, 0.23, g, 6, 6));
    if (kind === "bunny") { tail = sph(0.05, "#fffdf8", 0, 0.14, -0.17, g, 8, 6); }
    else if (kind === "shiba") { tail = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.022, 6, 12, Math.PI * 1.5), mat(col)); tail.position.set(0, 0.24, -0.15); tail.rotation.y = Math.PI / 2; g.add(tail); }
    else if (kind === "panda") { tail = sph(0.03, "#fffdf8", 0, 0.14, -0.16, g, 6, 6); }
    else { tail = cap(0.025, 0.18, col, g); tail.position.set(0, 0.22, -0.16); tail.rotation.x = -0.6; }
  }
  g.userData.tail = tail;
  return g;
}

/* ===== 書桌上的東西 ===== */
function makeSofa(w, c, c2) {
  const g = new THREE.Group();
  box(w, 0.36, 0.9, c, 0, 0.26, 0, g);
  box(w + 0.3, 0.75, 0.24, c, 0, 0.5, -0.36, g);
  [-1, 1].forEach((sd) => box(0.16, 0.55, 0.9, c, sd * (w / 2 + 0.07), 0.38, 0, g));
  const n = w > 1 ? 2 : 1;
  for (let i = 0; i < n; i++) box(w / n - 0.06, 0.12, 0.66, c2, -w / 2 + (i + 0.5) * w / n, 0.49, 0.08, g);
  [-1, 1].forEach((sd) => [-0.32, 0.32].forEach((z) => cyl(0.03, 0.025, 0.1, "#5a3a22", sd * (w / 2 + 0.07), 0.05, z, g, 6)));
  return g;
}

let _codeTex = null, _lessonTex = null;
function codeTex() {
  if (_codeTex) return _codeTex;
  const c = document.createElement("canvas"); c.width = 128; c.height = 84; const g = c.getContext("2d");
  g.fillStyle = "#23262e"; g.fillRect(0, 0, 128, 84);
  const cols = ["#8fd18c", "#7fb6e6", "#e6c07f", "#d79ad8", "#c9c3b8"];
  for (let i = 0; i < 9; i++) { let x = 6 + (i % 3) * 8; const y = 6 + i * 8.5; for (let k = 0; k < 3; k++) { const w = 8 + ((i * 7 + k * 13) % 26); g.fillStyle = cols[(i + k) % cols.length]; g.fillRect(x, y, w, 4); x += w + 4; } }
  _codeTex = new THREE.CanvasTexture(c); _codeTex.colorSpace = THREE.SRGBColorSpace; return _codeTex;
}
function lessonTex() {
  if (_lessonTex) return _lessonTex;
  const c = document.createElement("canvas"); c.width = 128; c.height = 88; const g = c.getContext("2d");
  g.fillStyle = "#e9efe6"; g.fillRect(0, 0, 128, 88);
  g.fillStyle = "#2f4f44"; g.fillRect(8, 8, 70, 48); g.fillStyle = "#f3efe6"; g.fillRect(14, 16, 40, 3); g.fillRect(14, 26, 54, 3); g.fillRect(14, 36, 30, 3);
  g.fillStyle = "#f6d7bd"; g.beginPath(); g.arc(102, 34, 12, 0, 7); g.fill(); g.fillStyle = "#3b2a20"; g.beginPath(); g.arc(102, 28, 12, Math.PI, 0); g.fill();
  g.fillStyle = "#7fa6c9"; g.fillRect(88, 48, 28, 20); g.fillStyle = "#c2453b"; g.beginPath(); g.arc(14, 76, 4, 0, 7); g.fill();
  _lessonTex = new THREE.CanvasTexture(c); _lessonTex.colorSpace = THREE.SRGBColorSpace; return _lessonTex;
}

function makeProp(act) {
  const g = new THREE.Group();
  const top = 0.66;
  if (act === "read") {
    [-1, 1].forEach((s) => { const p = box(0.2, 0.012, 0.26, "#f8f4ec", 0.1 * s, top + 0.02, -0.02, g); p.rotation.z = -0.12 * s; });
    box(0.42, 0.02, 0.28, "#5d7fa8", 0, top + 0.005, -0.02, g);
  } else if (act === "pc" || act === "code") {
    box(0.44, 0.02, 0.3, "#b9bec6", 0, top + 0.01, 0, g);
    const scr = new THREE.Group(); scr.position.set(0, top + 0.02, 0.15); scr.rotation.x = 0.25; g.add(scr);
    box(0.44, 0.3, 0.02, act === "code" ? "#3a3a44" : "#b9bec6", 0, 0.15, 0, scr);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.26), new THREE.MeshBasicMaterial(act === "code" ? { map: codeTex() } : { color: 0xbfe3ff })); glow.position.set(0, 0.15, -0.012); glow.rotation.y = Math.PI; scr.add(glow);
    sph(0.025, "#f2ece1", 0, 0.16, 0.012, scr, 8, 6);
    if (act === "code") { cyl(0.05, 0.045, 0.1, "#2a2620", 0.34, top + 0.05, 0.05, g); sph(0.03, "#e8b93a", -0.3, top + 0.03, 0.08, g, 8, 6); }
    else box(0.08, 0.1, 0.08, "#f3efe6", 0.34, top + 0.05, 0.05, g);
  } else if (act === "lesson") {
    // 平板立著上課，旁邊一本筆記
    const tab = new THREE.Group(); tab.position.set(0.05, top + 0.01, 0.16); tab.rotation.x = 0.3; g.add(tab);
    box(0.34, 0.24, 0.015, "#3a3a44", 0, 0.12, 0, tab);
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.21), new THREE.MeshBasicMaterial({ map: lessonTex() })); sc.position.set(0, 0.12, -0.009); sc.rotation.y = Math.PI; tab.add(sc);
    box(0.24, 0.01, 0.18, "#f8f4ec", -0.2, top + 0.005, -0.08, g); box(0.24, 0.012, 0.18, "#8fae7a", -0.2, top + 0.001, -0.08, g);
    const pen = cyl(0.01, 0.01, 0.15, "#5d7fa8", -0.12, top + 0.03, -0.08, g, 6); pen.rotation.z = 1.3;
  } else if (act === "novel") {
    [-1, 1].forEach((s) => { const p = box(0.13, 0.03, 0.19, "#fffaf0", 0.068 * s, top + 0.03, -0.04, g); p.rotation.z = -0.18 * s; });
    box(0.28, 0.012, 0.2, "#7a5c8a", 0, top + 0.006, -0.04, g);
    cyl(0.045, 0.04, 0.09, "#f3efe6", 0.3, top + 0.045, 0.08, g); cyl(0.04, 0.04, 0.005, "#8a5a38", 0.3, top + 0.088, 0.08, g);
    box(0.01, 0.002, 0.12, "#c2453b", 0.02, top + 0.05, 0.02, g);
  } else if (act === "research") {
    [-1, 1].forEach((s) => { const p = box(0.2, 0.012, 0.26, "#f8f4ec", 0.1 * s, top + 0.02, -0.02, g); p.rotation.z = -0.12 * s; });
    box(0.42, 0.02, 0.28, "#3f6f6a", 0, top + 0.005, -0.02, g);
    ["#c2453b", "#e0b04f", "#5d7fa8"].forEach((c, i) => box(0.24, 0.05, 0.18, c, -0.36, top + 0.025 + i * 0.05, 0.12, g).rotation.y = i * 0.15);
    const lens = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 6, 16), mat("#5a3a22")); lens.rotation.x = -Math.PI / 2; lens.position.set(0.3, top + 0.012, 0.0); g.add(lens);
    const hd = cyl(0.008, 0.008, 0.09, "#5a3a22", 0.36, top + 0.012, -0.06, g, 6); hd.rotation.x = Math.PI / 2; hd.rotation.z = 0.7;
    box(0.06, 0.002, 0.06, "#ffe08a", 0.2, top + 0.032, 0.1, g);
  } else if (act === "report") {
    box(0.3, 0.01, 0.38, "#f8f4ec", -0.05, top + 0.005, -0.02, g).rotation.y = 0.08;
    for (let i = 0; i < 7; i++) box(0.22, 0.002, 0.006, "#8a8a8a", -0.05, top + 0.012, -0.14 + i * 0.04, g);
    for (let i = 0; i < 4; i++) box(0.28, 0.008, 0.36, "#f3efe6", 0.3, top + 0.004 + i * 0.008, 0.06, g);
    box(0.02, 0.02, 0.12, "#ffe08a", 0.12, top + 0.012, 0.12, g).rotation.y = 0.4;
    const pen = cyl(0.012, 0.012, 0.18, "#2a2620", 0.05, top + 0.04, -0.02, g, 6); pen.rotation.z = 1.2; pen.rotation.y = 0.5; g.userData.pen = pen;
  } else if (act === "vocab") {
    for (let i = 0; i < 6; i++) box(0.14, 0.006, 0.09, i % 2 ? "#fff8dc" : "#f8f4ec", 0.25, top + 0.004 + i * 0.007, 0.05, g).rotation.y = (i - 3) * 0.06;
    box(0.14, 0.006, 0.09, "#e7a6a8", -0.02, top + 0.004, -0.05, g).rotation.y = 0.3;
    box(0.2, 0.03, 0.26, "#5d7fa8", -0.3, top + 0.015, 0.05, g);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.004, 6, 12), mat("#c9c3b8")); ring.position.set(0.19, top + 0.04, 0.05); g.add(ring);
  } else if (act === "journal") {
    [-1, 1].forEach((s) => box(0.16, 0.012, 0.22, "#fffaf0", 0.083 * s, top + 0.012, -0.02, g));
    box(0.35, 0.01, 0.24, "#e7a6a8", 0, top + 0.004, -0.02, g);
    for (let i = 0; i < 4; i++) box(0.12, 0.002, 0.005, "#c2453b", 0.08, top + 0.02, -0.08 + i * 0.04, g);
    cyl(0.03, 0.03, 0.02, "#8fae7a", -0.3, top + 0.01, 0.1, g, 12); cyl(0.03, 0.03, 0.02, "#e0b04f", -0.25, top + 0.01, 0.14, g, 12);
    const pen = cyl(0.01, 0.01, 0.16, "#7a5c8a", 0.05, top + 0.04, -0.02, g, 6); pen.rotation.z = 1.2; pen.rotation.y = 0.5; g.userData.pen = pen;
  } else if (act === "calligraphy") {
    box(0.5, 0.004, 0.24, "#fffaf0", -0.03, top + 0.002, -0.02, g);
    [[-0.18, 0.0], [-0.06, 0.02], [0.06, -0.01]].forEach(([x, z]) => { box(0.06, 0.002, 0.012, "#1c1a18", x, top + 0.006, z - 0.04, g).rotation.y = 0.3; box(0.012, 0.002, 0.08, "#1c1a18", x, top + 0.006, z, g); });
    box(0.12, 0.025, 0.08, "#3a3a34", 0.32, top + 0.012, 0.08, g); box(0.08, 0.004, 0.05, "#111", 0.32, top + 0.026, 0.08, g);
    const br = cyl(0.008, 0.008, 0.2, "#c99a3e", 0.1, top + 0.05, -0.02, g, 6); br.rotation.z = 1.1; br.rotation.y = 0.5; g.userData.pen = br;
    box(0.5, 0.012, 0.02, "#7a4a2a", -0.03, top + 0.008, -0.14, g);
  } else if (act === "homework") {
    box(0.34, 0.01, 0.24, "#f8f4ec", -0.05, top + 0.005, 0, g);
    for (let i = 0; i < 4; i++) box(0.28, 0.002, 0.008, "#9db4cf", -0.05, top + 0.012, -0.07 + i * 0.05, g);
    box(0.12, 0.03, 0.16, "#e0b04f", 0.28, top + 0.015, 0.02, g);
    const pen = cyl(0.012, 0.012, 0.18, "#e8b93a", 0.05, top + 0.04, -0.02, g, 6); pen.rotation.z = 1.2; pen.rotation.y = 0.5; g.userData.pen = pen;
  } else if (act === "draw") {
    box(0.38, 0.012, 0.28, "#ffffff", -0.04, top + 0.006, 0, g);
    [["#e7a6a8", -0.12, -0.04], ["#7fa6c9", 0.0, 0.05], ["#8fae7a", 0.06, -0.06]].forEach(([c, x, z]) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.045, 14), new THREE.MeshBasicMaterial({ color: c })); d.rotation.x = -Math.PI / 2; d.position.set(x, top + 0.014, z); g.add(d); });
    ["#c2453b", "#5d7fa8", "#e8b93a"].forEach((c, i) => { const p = cyl(0.01, 0.01, 0.16, c, 0.25 + i * 0.03, top + 0.012, 0, g, 6); p.rotation.x = Math.PI / 2; });
    const pen = cyl(0.012, 0.012, 0.18, "#5d7fa8", 0.05, top + 0.04, -0.02, g, 6); pen.rotation.z = 1.2; pen.rotation.y = 0.5; g.userData.pen = pen;
  } else {
    cyl(0.06, 0.05, 0.08, "#c98f6a", 0.3, top + 0.04, 0.05, g);
    sph(0.08, "#8fae7a", 0.3, top + 0.13, 0.05, g);
  }
  return g;
}

/* ===== 場景 ===== */
let renderer, scene, camera, container, overlay, clock, raf = 0, mounted = false;
let fillLight, envNext = 0, fireLight, fireMeshes = [], embers, dust, steam, bulbs = [], pendulum, curtains = [], beam, sunLight, hemi, lampLight, skyMat, plants = [];
let seatProps = [], chars = {}, reserved = {};
let barLight, tvTex, tvLight, record, speakers = [], notes = [], floorLight, houseCat;
let yaw = 0.64, pitch = 0.72, dragYaw = 0, dragPitch = 0;
const target = new THREE.Vector3(1.0, 0.4, 1.0);
let camR = 13.6;

/* ===== 一天的光線：跟著真實時間的日出日落慢慢變 ===== */
let hourOverride = null;
try { const q = new URLSearchParams(location.search).get("hour"); if (q !== null && q !== "") hourOverride = +q; } catch (e) {}
function hourNow() { if (hourOverride !== null) return hourOverride; const d = new Date(); return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600; }
const NIGHT = { top: "#101a33", bot: "#2c3d63", hemi: 0.5, sun: 0.2, sunC: "#8aa0d0", fill: 0.3, lamp: 3.4, fire: 4.2, floor: 2.2, beam: 0, beamC: "#a0b8ff", bg: "#3a2a22", dark: 1, exp: 1.0 };
const DAYK = [
  [0, NIGHT], [5, NIGHT],
  [6, { top: "#6d7fb8", bot: "#f6b38a", hemi: 0.7, sun: 0.9, sunC: "#ffb488", fill: 0.45, lamp: 2.8, fire: 3.8, floor: 1.9, beam: 0.1, beamC: "#ffb488", bg: "#8a6248", dark: 0.5, exp: 1.02 }],
  [7.5, { top: "#8cc4ec", bot: "#f3e6c8", hemi: 0.95, sun: 1.6, sunC: "#ffe6c0", fill: 0.55, lamp: 2.3, fire: 3.3, floor: 1.5, beam: 0.13, beamC: "#ffe2b0", bg: "#c9a074", dark: 0, exp: 1.05 }],
  [12, { top: "#7fbdea", bot: "#d8eef7", hemi: 1.0, sun: 1.8, sunC: "#fff2d8", fill: 0.6, lamp: 2.2, fire: 3.2, floor: 1.4, beam: 0.12, beamC: "#ffe2b0", bg: "#c9a074", dark: 0, exp: 1.05 }],
  [16.5, { top: "#8cbfe0", bot: "#f3e3c0", hemi: 0.95, sun: 1.7, sunC: "#ffe2b8", fill: 0.58, lamp: 2.3, fire: 3.3, floor: 1.5, beam: 0.14, beamC: "#ffd8a0", bg: "#c29468", dark: 0, exp: 1.05 }],
  [18, { top: "#e98a5e", bot: "#fbd59a", hemi: 0.85, sun: 1.5, sunC: "#ffa060", fill: 0.5, lamp: 2.6, fire: 3.6, floor: 1.7, beam: 0.18, beamC: "#ffb070", bg: "#a8714a", dark: 0.2, exp: 1.04 }],
  [19.3, { top: "#3b3f72", bot: "#c47a7a", hemi: 0.65, sun: 0.5, sunC: "#c08aa0", fill: 0.4, lamp: 3.1, fire: 4.0, floor: 2.0, beam: 0.04, beamC: "#d0a0c0", bg: "#6a4836", dark: 0.7, exp: 1.0 }],
  [20.5, NIGHT], [24, NIGHT]
];
const cA = new THREE.Color(), cB = new THREE.Color();
function lerpC(a, b, k) { return "#" + cA.set(a).lerp(cB.set(b), k).getHexString(); }
function envAt(h) {
  h = ((h % 24) + 24) % 24;
  let i = 0; while (i < DAYK.length - 2 && DAYK[i + 1][0] <= h) i++;
  const [h0, a] = DAYK[i], [h1, b] = DAYK[i + 1], k = h1 > h0 ? (h - h0) / (h1 - h0) : 0, e = { h };
  Object.keys(a).forEach((key) => { e[key] = typeof a[key] === "string" ? lerpC(a[key], b[key], k) : a[key] + (b[key] - a[key]) * k; });
  return e;
}
let env = envAt(hourNow()), skyCanvas = null, skyTex = null, wallPicTex = null;
function drawSky(e) {
  const c = skyCanvas, g = c.getContext("2d"), W = 256, H = 192, h = e.h;
  const grad = g.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, e.top); grad.addColorStop(1, e.bot);
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  if (e.dark > 0.05) { g.fillStyle = "#fff"; for (let i = 0; i < 50; i++) { g.globalAlpha = e.dark * (0.35 + (i % 5) / 8); g.fillRect((i * 73) % W, (i * 41) % 120, 1.6, 1.6); } g.globalAlpha = 1; }
  // 太陽 6:00–18:30，月亮在晚上
  if (h >= 5.6 && h <= 18.9) {
    const k = (h - 5.6) / 13.3, x = 20 + k * 216, y = 165 - Math.sin(Math.PI * k) * 135;
    g.fillStyle = h < 7 || h > 17.3 ? "#ffd49a" : "#fff8dc"; g.globalAlpha = 0.35; g.beginPath(); g.arc(x, y, 30, 0, 7); g.fill(); g.globalAlpha = 1;
    g.beginPath(); g.arc(x, y, 17, 0, 7); g.fill();
  }
  if (h >= 18.6 || h <= 6.2) {
    const hh = h >= 18.6 ? h - 18.6 : h + 5.4, k = hh / 11.6, x = 20 + k * 216, y = 165 - Math.sin(Math.PI * k) * 130;
    g.globalAlpha = Math.min(1, e.dark * 1.3); g.fillStyle = "#fff4d2"; g.beginPath(); g.arc(x, y, 15, 0, 7); g.fill();
    g.fillStyle = e.top; g.beginPath(); g.arc(x + 7, y - 5, 13, 0, 7); g.fill(); g.globalAlpha = 1;
  }
  // 雲
  g.globalAlpha = 0.8 * (1 - e.dark * 0.8); g.fillStyle = lerpC("#ffffff", e.bot, 0.35);
  const drift = (h * 18) % 300;
  [[40, 90], [150, 60], [210, 100]].forEach(([x, y]) => { x = ((x + drift) % 300) - 30; g.beginPath(); g.ellipse(x, y, 26, 9, 0, 0, 7); g.ellipse(x + 14, y - 6, 16, 9, 0, 0, 7); g.fill(); });
  g.globalAlpha = 1;
  // 遠山與樹
  g.fillStyle = lerpC("#9cbf8a", "#1c2a44", e.dark);
  g.beginPath(); g.moveTo(0, 160); g.quadraticCurveTo(60, 120, 120, 150); g.quadraticCurveTo(190, 115, 256, 150); g.lineTo(256, 192); g.lineTo(0, 192); g.fill();
  g.fillStyle = lerpC("#6f9a62", "#15213a", e.dark);
  for (let i = 0; i < 8; i++) { const x = 10 + i * 34; g.beginPath(); g.moveTo(x, 192); g.lineTo(x + 10, 150 + (i % 3) * 8); g.lineTo(x + 20, 192); g.fill(); }
  // 遠方人家的燈
  if (e.dark > 0.3) { g.fillStyle = "#ffd27a"; g.globalAlpha = e.dark; [[60, 168], [150, 172], [205, 165]].forEach(([x, y]) => g.fillRect(x, y, 3, 3)); g.globalAlpha = 1; }
  skyTex.needsUpdate = true;
}
function applyEnv(e) {
  hemi.intensity = e.hemi;
  sunLight.intensity = e.sun; sunLight.color.set(e.sunC);
  // 太陽從窗戶那邊慢慢移動，影子跟著轉
  const k = Math.max(0, Math.min(1, (e.h - 6) / 12.5));
  sunLight.position.set(-6 + k * 12, 3 + Math.sin(Math.PI * k) * 5, -9);
  fillLight.intensity = e.fill;
  beam.material.opacity = e.beam; beam.material.color.set(e.beamC);
  scene.background.set(e.bg);
  renderer.toneMappingExposure = e.exp;
  drawSky(e);
}
function timeKind() { return env.dark > 0.6 ? "night" : "day"; }

function buildRoom() {
  const floorTex = woodTexture("#c08a5a", "#6b3f20", 8, false, 512, 512); floorTex.repeat.set(3.2, 2.7);
  const wallTex = woodTexture("#dcb58a", "#8a5a38", 10, false, 512, 512); wallTex.repeat.set(2.5, 1);
  const wallTex2 = wallTex.clone(); wallTex2.needsUpdate = true; wallTex2.repeat.set(1.6, 1);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(12.8, 0.2, 11), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.75 }));
  floor.position.set(1.4, -0.1, 1.5); floor.receiveShadow = true; scene.add(floor);
  const back = new THREE.Mesh(new THREE.BoxGeometry(12.8, 4.6, 0.2), new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 }));
  back.position.set(1.4, 2.3, -4.1); back.receiveShadow = true; scene.add(back);
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.6, 11), new THREE.MeshStandardMaterial({ map: wallTex2, roughness: 0.9 }));
  left.position.set(-5.1, 2.3, 1.5); left.receiveShadow = true; scene.add(left);
  // 踢腳板、樑柱
  box(12.8, 0.18, 0.06, "#8a5a38", 1.4, 0.09, -3.98, scene); box(0.06, 0.18, 11, "#8a5a38", -4.98, 0.09, 1.5, scene);
  box(0.3, 4.6, 0.3, "#7a4a2a", -4.95, 2.3, -3.95, scene); box(12.8, 0.3, 0.3, "#7a4a2a", 1.4, 4.45, -3.95, scene); box(0.3, 0.3, 11, "#7a4a2a", -4.95, 4.45, 1.5, scene);
  box(12.8, 0.25, 0.3, "#7a4a2a", 1.4, 3.3, -3.95, scene); box(0.3, 0.25, 11, "#7a4a2a", -4.95, 3.3, 1.5, scene);
  // 窗戶
  skyCanvas = document.createElement("canvas"); skyCanvas.width = 256; skyCanvas.height = 192;
  skyTex = new THREE.CanvasTexture(skyCanvas); skyTex.colorSpace = THREE.SRGBColorSpace;
  skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), skyMat); sky.position.set(0.2, 1.95, -3.99); scene.add(sky);
  const fm = "#8a5a38";
  box(2.4, 0.12, 0.16, fm, 0.2, 2.75, -3.95, scene); box(2.5, 0.1, 0.35, fm, 0.2, 1.17, -3.86, scene);
  box(0.12, 1.6, 0.16, fm, -0.95, 1.95, -3.95, scene); box(0.12, 1.6, 0.16, fm, 1.35, 1.95, -3.95, scene);
  box(0.06, 1.5, 0.08, fm, 0.2, 1.95, -3.95, scene); box(2.2, 0.06, 0.08, fm, 0.2, 1.95, -3.95, scene);
  // 窗台盆栽
  cyl(0.09, 0.07, 0.14, "#c98f6a", -0.5, 1.29, -3.82, scene); const sp = sph(0.13, "#7b9c68", -0.5, 1.45, -3.82, scene); plants.push(sp);
  cyl(0.07, 0.06, 0.12, "#f3efe6", 0.9, 1.28, -3.82, scene); const sp2 = sph(0.1, "#9cbf7a", 0.9, 1.42, -3.82, scene); plants.push(sp2);
  // 窗簾
  [[-1.25, 1], [1.65, -1]].forEach(([x, s]) => {
    const c = new THREE.Group(); c.position.set(x, 2.9, -3.86); scene.add(c);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.9, 0.05), mat("#c9746a")); m.position.y = -0.95; m.castShadow = true; c.add(m);
    for (let i = 0; i < 3; i++) box(0.04, 1.9, 0.07, "#b5655c", -0.15 + i * 0.15, -0.95, 0.01, c);
    c.userData.s = s; curtains.push(c);
  });
  box(3.4, 0.05, 0.05, "#5a3a22", 0.2, 2.92, -3.86, scene);
  // 窗光
  beam = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.6), new THREE.MeshBasicMaterial({ color: 0xffe2b0, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  beam.position.set(0.5, 1.2, -2.6); beam.rotation.x = -0.95; scene.add(beam);

  // 火爐（左牆）
  const fp = new THREE.Group(); fp.position.set(-4.75, 0, -1.6); scene.add(fp);
  const stone = mat("#b4a08c");
  box(0.7, 1.5, 2.0, stone, 0.1, 0.75, 0, fp);
  box(0.9, 0.12, 2.3, "#7a4a2a", 0.15, 1.56, 0, fp);
  box(0.75, 0.08, 2.3, "#9c8b7a", 0.2, 0.04, 0, fp);
  const hole = box(0.2, 0.75, 1.1, "#2a1c16", 0.38, 0.5, 0, fp); hole.castShadow = false;
  for (let i = 0; i < 6; i++) box(0.04, 0.16, 0.3, "#a38f7b", 0.46, 0.25 + (i % 3) * 0.42, -0.75 + (i > 2 ? 1.5 : 0), fp);
  // 木柴與火
  [-0.18, 0.18].forEach((z) => { const l = cyl(0.06, 0.06, 0.6, "#6b4a32", 0.48, 0.18, z * 0.3, fp, 8); l.rotation.x = Math.PI / 2; l.rotation.z = z; });
  const fireG = new THREE.Group(); fireG.position.set(0.5, 0.2, 0); fp.add(fireG);
  [["#f08a3c", 0.18, 0.5, 0], ["#ffb347", 0.13, 0.38, 0.08], ["#ffe08a", 0.08, 0.26, -0.05], ["#f08a3c", 0.12, 0.36, -0.18], ["#ffb347", 0.1, 0.3, 0.2]].forEach(([c, r, h, z]) => {
    const f = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.92 }));
    f.position.set(0, h / 2, z); fireG.add(f); f.userData.base = h; fireMeshes.push(f);
  });
  fireLight = new THREE.PointLight(0xff9a4a, 3.2, 7, 1.6); fireLight.position.set(-4.0, 0.6, -1.6); scene.add(fireLight);
  // 火爐上的東西
  cyl(0.08, 0.07, 0.16, "#c98f6a", -4.6, 1.7, -2.4, scene); sph(0.13, "#7b9c68", -4.6, 1.88, -2.4, scene);
  box(0.06, 0.28, 0.36, "#f8f4ec", -4.62, 1.76, -0.7, scene); box(0.065, 0.2, 0.28, "#e7a6a8", -4.6, 1.76, -0.7, scene);
  // 時鐘
  const clk = new THREE.Group(); clk.position.set(-4.95, 2.45, -1.6); clk.rotation.y = Math.PI / 2; scene.add(clk);
  cyl(0.3, 0.3, 0.06, "#8a5a38", 0, 0, 0, clk).rotation.x = Math.PI / 2;
  const face = cyl(0.25, 0.25, 0.07, "#f8f4ec", 0, 0, 0.01, clk); face.rotation.x = Math.PI / 2;
  box(0.02, 0.16, 0.02, "#2a2620", 0, 0.07, 0.05, clk); const hh = box(0.02, 0.11, 0.02, "#2a2620", 0.04, -0.02, 0.05, clk); hh.rotation.z = 1.9;
  pendulum = new THREE.Group(); pendulum.position.set(0, -0.28, 0.02); clk.add(pendulum);
  box(0.025, 0.4, 0.02, "#c99a3e", 0, -0.2, 0, pendulum); cyl(0.07, 0.07, 0.02, "#e8b93a", 0, -0.42, 0, pendulum).rotation.x = Math.PI / 2;

  // 書櫃（背牆左）
  const bs = new THREE.Group(); bs.position.set(-2.95, 0, -3.78); scene.add(bs);
  box(0.06, 2.4, 0.42, "#8a5a38", -0.67, 1.2, 0, bs); box(0.06, 2.4, 0.42, "#8a5a38", 0.67, 1.2, 0, bs); box(1.4, 2.4, 0.04, "#7a4a2a", 0, 1.2, -0.19, bs); box(1.28, 2.28, 0.02, "#e9d6b4", 0, 1.2, -0.165, bs);
  const books = ["#c2453b", "#5d7fa8", "#e0b04f", "#8fae7a", "#e7a6a8", "#7a5c8a", "#d98c4a", "#3f6f6a"];
  [0.12, 0.66, 1.2, 1.74].forEach((y, ri) => {
    box(1.28, 0.05, 0.36, "#7a4a2a", 0, y, 0.02, bs);
    let x = -0.6;
    for (let k = 0; x < 0.55; k++) {
      const w = 0.07 + ((k + ri) % 3) * 0.025, h = 0.3 + ((k * 3 + ri) % 5) * 0.035;
      if (ri === 2 && k === 5) { sph(0.12, "#7b9c68", x + 0.1, y + 0.15, 0.02, bs); x += 0.24; continue; }
      if (ri === 1 && k === 7) { const lb = box(0.08, h, 0.26, books[(k + ri) % 8], x + 0.06, y + h / 2 + 0.01, 0.02, bs); lb.rotation.z = 0.35; x += 0.16; continue; }
      box(w, h, 0.26, books[(k * 2 + ri) % books.length], x + w / 2, y + 0.025 + h / 2, 0.02, bs);
      x += w + 0.01;
    }
  });
  box(1.28, 0.05, 0.36, "#7a4a2a", 0, 2.28, 0.02, bs);
  sph(0.14, "#9cbf7a", -0.4, 2.55, 0, bs); cyl(0.1, 0.08, 0.16, "#f3efe6", -0.4, 2.4, 0, bs);

  // 咖啡吧台
  const ct = new THREE.Group(); ct.position.set(2.55, 0, -3.68); scene.add(ct);
  box(1.7, 0.95, 0.62, "#a06a42", 0, 0.475, 0, ct); box(1.8, 0.07, 0.7, "#7a4a2a", 0, 0.98, 0, ct);
  box(0.02, 0.7, 0.01, "#7a4a2a", 0, 0.45, 0.31, ct); sph(0.03, "#e8d3b0", -0.08, 0.5, 0.32, ct); sph(0.03, "#e8d3b0", 0.08, 0.5, 0.32, ct);
  const cm = new THREE.Group(); cm.position.set(-0.35, 1.02, -0.05); ct.add(cm);
  box(0.42, 0.55, 0.4, "#5a5f6b", 0, 0.275, 0, cm); box(0.3, 0.12, 0.02, "#2a2f38", 0, 0.42, 0.2, cm);
  const led = sph(0.02, new THREE.MeshBasicMaterial({ color: 0x7cffb2 }), -0.1, 0.42, 0.215, cm, 8, 6); led.castShadow = false;
  box(0.24, 0.05, 0.2, "#2a2f38", 0, 0.22, 0.12, cm); cyl(0.05, 0.045, 0.1, "#f3efe6", 0, 0.08, 0.14, cm);
  cyl(0.07, 0.07, 0.22, "#f8f4ec", 0.25, 1.13, 0, ct); cyl(0.075, 0.075, 0.05, "#c98f6a", 0.25, 1.26, 0, ct);
  [[0.45, "#e7a6a8"], [0.6, "#7fa6c9"]].forEach(([x, c]) => { cyl(0.06, 0.05, 0.12, c, x, 1.07, 0.1, ct); });

  // 零食櫃
  const sn = new THREE.Group(); sn.position.set(4.3, 0, -3.72); scene.add(sn);
  box(0.06, 2.0, 0.5, "#8a5a38", -0.57, 1.0, 0, sn); box(0.06, 2.0, 0.5, "#8a5a38", 0.57, 1.0, 0, sn); box(1.2, 0.06, 0.5, "#8a5a38", 0, 1.97, 0, sn); box(1.2, 2.0, 0.04, "#7a4a2a", 0, 1.0, -0.23, sn); box(1.08, 1.88, 0.02, "#f3e3c6", 0, 1.0, -0.2, sn);
  [0.06, 0.62, 1.18, 1.74].forEach((y) => box(1.08, 0.05, 0.44, "#7a4a2a", 0, y, 0.02, sn));
  [["#e7a6a8", -0.35], ["#e0b04f", -0.12], ["#7fa6c9", 0.12], ["#c2453b", 0.35]].forEach(([c, x], i) => box(0.18, 0.3 + (i % 2) * 0.08, 0.2, c, x, 1.18 + 0.17 + (i % 2) * 0.04, 0.05, sn));
  [-0.3, 0, 0.3].forEach((x) => { const j = cyl(0.12, 0.12, 0.34, new THREE.MeshStandardMaterial({ color: 0xf8f4ec, transparent: true, opacity: 0.55, roughness: 0.2 }), x, 0.81, 0.05, sn); j.castShadow = false; sph(0.07, "#c98f52", x, 0.75, 0.05, sn); sph(0.06, "#c98f52", x + 0.04, 0.85, 0.05, sn); });
  [-0.3, 0.05, 0.35].forEach((x, i) => { const b = box(0.24, 0.18, 0.24, ["#e0b04f", "#e7a6a8", "#8fae7a"][i], x, 0.18, 0.05, sn); b.rotation.y = i * 0.2; });
  box(0.9, 0.25, 0.3, "#f8f4ec", 0, 1.88, 0.05, sn);

  // 電視櫃、小電視、音響（左牆）
  const tvc = new THREE.Group(); tvc.position.set(-4.72, 0, 1.9); scene.add(tvc);
  box(0.5, 0.5, 1.5, "#9a6640", 0, 0.25, 0, tvc); box(0.52, 0.04, 1.54, "#7a4a2a", 0, 0.51, 0, tvc);
  [-0.38, 0.38].forEach((z) => { box(0.02, 0.34, 0.66, "#b07a4f", 0.26, 0.25, z, tvc); sph(0.025, "#e8d3b0", 0.28, 0.25, z * 0.2, tvc, 8, 6); });
  const tv = new THREE.Group(); tv.position.set(0, 0.53, 0.15); tvc.add(tv);
  box(0.36, 0.5, 0.66, "#d9c3a0", 0, 0.3, 0, tv);                     // 復古小電視
  box(0.04, 0.05, 0.3, "#7a4a2a", 0, 0.03, 0, tv);
  const tvCanvas = document.createElement("canvas"); tvCanvas.width = 128; tvCanvas.height = 96;
  tvTex = new THREE.CanvasTexture(tvCanvas); tvTex.colorSpace = THREE.SRGBColorSpace; tvTex.userData = { c: tvCanvas };
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.34), new THREE.MeshBasicMaterial({ map: tvTex })); scr.rotation.y = Math.PI / 2; scr.position.set(0.185, 0.32, -0.05); tv.add(scr);
  [0.26, 0.18].forEach((y) => { const k = cyl(0.025, 0.025, 0.02, "#7a4a2a", 0.19, y + 0.12, 0.25, tv, 10); k.rotation.z = Math.PI / 2; });
  [-0.1, 0.1].forEach((z) => { const an = cyl(0.006, 0.006, 0.3, "#5a3a22", 0, 0.68, z, tv, 4); an.rotation.x = z * 4; });
  tvLight = new THREE.PointLight(0x9fd0ff, 0.6, 2.6, 2); tvLight.position.set(-4.2, 0.9, 1.85); scene.add(tvLight);
  // 唱盤
  const rp = new THREE.Group(); rp.position.set(0, 0.53, -0.45); tvc.add(rp);
  box(0.38, 0.08, 0.42, "#7a4a2a", 0, 0.04, 0, rp);
  record = new THREE.Group(); record.position.set(0.02, 0.09, 0); rp.add(record);
  cyl(0.16, 0.16, 0.012, "#2a2620", 0, 0, 0, record, 28);
  cyl(0.05, 0.05, 0.014, "#c2453b", 0, 0.001, 0, record, 16);
  box(0.03, 0.012, 0.012, "#e8d3b0", 0.11, 0.008, 0, record);
  const arm = box(0.012, 0.012, 0.2, "#c9c3b8", 0.12, 0.11, 0.06, rp); arm.rotation.y = 0.4;
  // 音響喇叭（兩邊）
  [-0.95, 0.95].forEach((z) => {
    const sp = new THREE.Group(); sp.position.set(-4.72, 0, 1.9 + z); scene.add(sp);
    box(0.36, 0.95, 0.34, "#8a5a38", 0, 0.475, 0, sp);
    [0.68, 0.32].forEach((y, i) => {
      const cone = cyl(i ? 0.12 : 0.07, i ? 0.12 : 0.07, 0.03, "#3a2f28", 0.18, y, 0, sp, 18); cone.rotation.z = Math.PI / 2;
      const dome = sph(i ? 0.05 : 0.03, "#5a4a3e", 0.19, y, 0, sp, 10, 8); speakers.push(dome);
    });
  });
  // 音符
  const noteTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"); g.fillStyle = "#fff"; g.font = "bold 48px serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("♪", 32, 34); return new THREE.CanvasTexture(c); })();
  for (let i = 0; i < 4; i++) {
    const n = new THREE.Sprite(new THREE.SpriteMaterial({ map: noteTex, color: [0xc2453b, 0x5d7fa8, 0xe0b04f, 0x7b9c68][i], transparent: true, depthWrite: false }));
    n.scale.setScalar(0.22); n.userData = { ph: i / 4 }; scene.add(n); notes.push(n);
  }
  // 茶几
  const tb = new THREE.Group(); tb.position.set(-3.75, 0, 1.9); scene.add(tb);
  cyl(0.38, 0.38, 0.05, "#b07a4f", 0, 0.36, 0, tb, 24).scale.set(0.8, 1, 1.25);
  cyl(0.05, 0.08, 0.34, "#8a5a38", 0, 0.17, 0, tb, 10);
  cyl(0.05, 0.04, 0.08, "#f8f4ec", 0.08, 0.42, -0.2, tb); box(0.2, 0.03, 0.25, "#e0b04f", -0.05, 0.4, 0.15, tb).rotation.y = 0.4;
  // 沙發（面向電視）
  const sf = new THREE.Group(); sf.position.set(-2.75, 0, 1.9); sf.rotation.y = Math.PI; scene.add(sf);
  const sc = mat("#c26f5e");
  box(0.95, 0.38, 2.1, sc, 0, 0.27, 0, sf); box(0.28, 0.85, 2.1, sc, -0.38, 0.5, 0, sf);
  box(0.95, 0.55, 0.22, sc, 0, 0.36, -1.12, sf); box(0.95, 0.55, 0.22, sc, 0, 0.36, 1.12, sf);
  [-0.5, 0.5].forEach((z) => box(0.7, 0.12, 0.95, "#d27d6b", 0.08, 0.5, z, sf));
  box(0.16, 0.36, 0.36, "#f3e3c6", -0.2, 0.72, -0.6, sf).rotation.x = 0.2;
  box(0.16, 0.32, 0.32, "#8fae7a", -0.2, 0.7, 0.75, sf).rotation.x = -0.2;
  box(0.5, 0.03, 0.6, "#e0b04f", -0.38, 0.95, 0.1, sf).rotation.y = 0.2;   // 披在椅背的毯子
  // 單人沙發（面向火爐）和前面的小雙人沙發
  const arm1 = makeSofa(0.85, "#8fae7a", "#9cbf7a"); arm1.position.set(-3.0, 0, -0.85); arm1.rotation.y = -2.09; scene.add(arm1);
  box(0.3, 0.03, 0.4, "#e7a6a8", 0.1, 0.62, -0.1, arm1).rotation.y = 0.3;
  const love = makeSofa(1.5, "#d9a77e", "#e8c9a0"); love.position.set(-2.85, 0, 3.8); love.rotation.y = Math.PI; scene.add(love);
  box(0.32, 0.3, 0.14, "#c2453b", -0.5, 0.7, -0.2, love).rotation.x = -0.2;
  // 落地燈（沙發旁）
  const fl = new THREE.Group(); fl.position.set(-2.6, 0, 0.55); scene.add(fl);
  cyl(0.16, 0.18, 0.04, "#5a3a22", 0, 0.02, 0, fl, 16); cyl(0.018, 0.018, 1.55, "#5a3a22", 0, 0.8, 0, fl, 6);
  const fsh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.24, 0.28, 20, 1, true), mat("#f3e3c6", { side: THREE.DoubleSide, emissive: 0xffc070, emissiveIntensity: 0.35 })); fsh.position.y = 1.62; fl.add(fsh);
  floorLight = new THREE.PointLight(0xffc98a, 1.4, 4, 1.6); floorLight.position.set(-2.6, 1.5, 0.55); scene.add(floorLight);
  // 貓窩和一隻睡覺的貓
  const cb = new THREE.Group(); cb.position.set(-3.85, 0, -2.8); scene.add(cb);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.08, 10, 24), mat("#d9a77e")); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.08; cb.add(ring);
  cyl(0.24, 0.24, 0.05, "#e8c9a0", 0, 0.03, 0, cb, 20);
  houseCat = new THREE.Group(); houseCat.position.y = 0.06; cb.add(houseCat);
  const cbody = sph(0.15, "#8a8580", 0, 0.09, 0, houseCat); cbody.scale.set(1.1, 0.65, 0.9);
  sph(0.09, "#8a8580", 0.12, 0.1, 0.06, houseCat);
  [0.07, 0.17].forEach((x) => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 4), mat("#8a8580")); e.position.set(x, 0.18, 0.06); houseCat.add(e); });
  const ctail = cap(0.022, 0.2, "#8a8580", houseCat); ctail.position.set(-0.08, 0.05, 0.13); ctail.rotation.set(Math.PI / 2, 0, 1.2);
  // 懶骨頭
  const bb = sph(0.42, "#e0b04f", 6.05, 0.22, 2.4, scene, 20, 14); bb.scale.set(1, 0.55, 1);
  const bb2 = sph(0.3, "#e0b04f", 6.27, 0.42, 2.28, scene, 16, 12); bb2.scale.set(1, 0.9, 0.6); bb2.rotation.y = -1.0;
  // 吧台椅
  [2.1, 3.0].forEach((x) => { cyl(0.17, 0.17, 0.06, "#c26f5e", x, 0.68, -3.1, scene, 16); cyl(0.03, 0.03, 0.66, "#5a3a22", x, 0.33, -3.1, scene, 6); cyl(0.15, 0.15, 0.02, "#5a3a22", x, 0.01, -3.1, scene, 12); });
  // 飲料吧：冰箱門、茶壺、果汁桶、菜單板
  box(0.5, 0.7, 0.02, new THREE.MeshStandardMaterial({ color: 0xdfeef0, transparent: true, opacity: 0.6, roughness: 0.15 }), 3.0, 0.45, -3.36, scene);
  [["#e0b04f", 2.88], ["#e7a6a8", 3.0], ["#8fae7a", 3.12]].forEach(([c, x]) => cyl(0.035, 0.035, 0.18, c, x, 0.3, -3.5, scene, 8));
  const jug = cyl(0.11, 0.11, 0.3, new THREE.MeshStandardMaterial({ color: 0xffd27a, transparent: true, opacity: 0.75, roughness: 0.15 }), 3.2, 1.17, -3.62, scene, 16); jug.castShadow = false;
  cyl(0.04, 0.04, 0.06, "#c9c3b8", 3.2, 1.35, -3.62, scene, 10);
  const kettle = sph(0.11, "#c2453b", 1.95, 1.11, -3.62, scene, 14, 10); kettle.scale.y = 0.85; cyl(0.015, 0.02, 0.12, "#c2453b", 2.05, 1.14, -3.62, scene, 6).rotation.z = -0.8;
  box(0.9, 0.55, 0.04, "#3a3a34", 2.55, 1.85, -3.97, scene);
  ["#f3efe6", "#e0b04f", "#f3efe6", "#e7a6a8"].forEach((c, i) => box(0.5 - (i % 2) * 0.15, 0.035, 0.01, c, 2.45 + (i % 2) * 0.07, 2.0 - i * 0.1, -3.945, scene));
  // 咖啡廳角落：吧台上方的吊燈、甜點罩、杯架、門口黑板
  [1.95, 2.55, 3.15].forEach((x, i) => {
    box(0.01, 0.9, 0.01, "#2a2620", x, 2.95, -3.55, scene);
    const sh = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.14, 16, 1, true), mat("#3a3a34", { side: THREE.DoubleSide })); sh.position.set(x, 2.45, -3.55); scene.add(sh);
    const bulb = sph(0.05, new THREE.MeshBasicMaterial({ color: 0xffd9a0 }), x, 2.36, -3.55, scene, 10, 8); bulb.castShadow = false;
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffc070, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(0.5); gl.position.set(x, 2.34, -3.55); scene.add(gl);
    bulbs.push({ sp: gl, phase: i * 1.7 });
  });
  barLight = new THREE.PointLight(0xffc98a, 1.2, 4, 1.6); barLight.position.set(2.55, 2.2, -3.2); scene.add(barLight);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.05 })); dome.position.set(2.85, 1.02, -3.5); scene.add(dome);
  cyl(0.18, 0.18, 0.02, "#f3efe6", 2.85, 1.02, -3.5, scene, 18);
  [[2.8, -3.47, "#e7a6a8"], [2.92, -3.53, "#c98f52"]].forEach(([x, z, c]) => cyl(0.045, 0.045, 0.05, c, x, 1.05, z, scene, 12));
  for (let k = 0; k < 3; k++) for (let j = 0; j <= k; j++) cyl(0.035, 0.03, 0.06, "#f8f4ec", 2.2 + j * 0.08 - k * 0.04, 1.03 + (2 - k) * 0.06, -3.82, scene, 10);
  const bd = new THREE.Group(); bd.position.set(6.6, 0, -2.0); bd.rotation.y = -0.7; scene.add(bd);
  [-1, 1].forEach((sd) => { const leg = box(0.04, 1.0, 0.04, "#7a4a2a", 0, 0.5, sd * 0.18, bd); leg.rotation.x = sd * 0.18; });
  box(0.03, 0.6, 0.45, "#2f3a34", 0, 0.75, 0, bd); box(0.035, 0.64, 0.49, "#8a5a38", -0.003, 0.75, 0, bd);
  const chalkC = document.createElement("canvas"); chalkC.width = 128; chalkC.height = 170; const cg = chalkC.getContext("2d");
  cg.fillStyle = "#2f3a34"; cg.fillRect(0, 0, 128, 170); cg.fillStyle = "#f3efe6"; cg.textAlign = "center";
  cg.font = "bold 22px sans-serif"; cg.fillText("CAFÉ", 64, 34); cg.font = "16px sans-serif"; cg.fillText("拿鐵 ☕", 64, 70); cg.fillText("可可 🍫", 64, 96); cg.fillText("鬆餅 🧇", 64, 122);
  cg.strokeStyle = "#e7a6a8"; cg.beginPath(); cg.moveTo(24, 44); cg.lineTo(104, 44); cg.stroke(); cg.fillStyle = "#ffe08a"; cg.fillText("今天也加油", 64, 154);
  const ctex = new THREE.CanvasTexture(chalkC); ctex.colorSpace = THREE.SRGBColorSpace;
  const cface = new THREE.Mesh(new THREE.PlaneGeometry(0.43, 0.58), new THREE.MeshBasicMaterial({ map: ctex })); cface.rotation.y = Math.PI / 2; cface.position.set(0.018, 0.75, 0); bd.add(cface);
  // 小圓咖啡桌與兩張椅子
  const cafe = new THREE.Group(); cafe.position.set(5.6, 0, 3.6); scene.add(cafe);
  cyl(0.36, 0.36, 0.04, "#b07a4f", 0, 0.72, 0, cafe, 24); cyl(0.03, 0.03, 0.7, "#2a2620", 0, 0.36, 0, cafe, 8); cyl(0.2, 0.22, 0.03, "#2a2620", 0, 0.015, 0, cafe, 16);
  cyl(0.045, 0.04, 0.08, "#f8f4ec", 0.1, 0.78, 0.05, cafe, 12); cyl(0.06, 0.06, 0.006, "#f8f4ec", 0.1, 0.742, 0.05, cafe, 14);
  sph(0.06, "#c98f52", -0.12, 0.76, -0.05, cafe, 10, 8).scale.y = 0.5;
  [[-0.6, 0.4], [0.55, -0.45]].forEach(([x, z]) => { const st2 = new THREE.Group(); st2.position.set(x, 0, z); st2.rotation.y = Math.atan2(-x, -z); cafe.add(st2); cyl(0.2, 0.2, 0.04, "#c26f5e", 0, 0.45, 0, st2, 16); box(0.36, 0.34, 0.03, "#2a2620", 0, 0.66, -0.18, st2); [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]].forEach(([a, b]) => cyl(0.015, 0.015, 0.45, "#2a2620", a, 0.225, b, st2, 6)); });

  // 吊掛植物
  [[1.62, -3.72, 2.35], [-4.72, -3.0, 2.4], [3.9, -3.72, 2.55]].forEach(([x, z, y]) => {
    const hp = new THREE.Group(); hp.position.set(x, 3.15, z); scene.add(hp);
    box(0.008, 3.15 - y, 0.008, "#5a3a22", 0, -(3.15 - y) / 2, 0, hp);
    cyl(0.12, 0.09, 0.14, "#f3efe6", 0, -(3.15 - y) - 0.07, 0, hp);
    for (let i = 0; i < 5; i++) { const v = cap(0.035, 0.25 + (i % 3) * 0.12, i % 2 ? "#7b9c68" : "#8fae7a", hp); v.position.set(Math.cos(i * 1.3) * 0.1, -(3.15 - y) - 0.2 - (i % 3) * 0.05, Math.sin(i * 1.3) * 0.1); }
    plants.push(hp);
  });

  // 地毯
  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48), new THREE.MeshStandardMaterial({ map: rugTexture(), roughness: 1 }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0.3, 0.005, 1.1); rug.scale.set(1.35, 0.8, 1); rug.receiveShadow = true; scene.add(rug);
  const rug2 = new THREE.Mesh(new THREE.CircleGeometry(0.9, 32), mat("#d9a77e")); rug2.rotation.x = -Math.PI / 2; rug2.position.set(-3.6, 0.006, -1.6); rug2.scale.set(0.8, 1.2, 1); rug2.receiveShadow = true; scene.add(rug2);

  // 盆栽
  [[7.05, 5.8, 1.0], [-4.65, -3.65, 0.8], [-4.55, 3.75, 1.15], [4.6, -2.4, 0.6], [7.0, -3.5, 1.1], [2.2, 5.9, 0.7]].forEach(([x, z, s]) => {
    const p = new THREE.Group(); p.position.set(x, 0, z); p.scale.setScalar(s); scene.add(p);
    cyl(0.22, 0.17, 0.4, "#c98f6a", 0, 0.2, 0, p);
    for (let i = 0; i < 6; i++) { const lf = sph(0.18, i % 2 ? "#7b9c68" : "#8fae7a", Math.cos(i) * 0.15, 0.6 + (i % 3) * 0.17, Math.sin(i) * 0.15, p); lf.scale.set(0.8, 1.4, 0.8); }
    plants.push(p);
  });

  // 吊燈與串燈
  const lamp = new THREE.Group(); lamp.position.set(0.3, 3.35, 1.1); scene.add(lamp);
  lampLight = new THREE.PointLight(0xffd9a0, 2.2, 9, 1.4); lampLight.position.set(0.3, 2.6, 1.1); scene.add(lampLight);
  const glow = glowTexture();
  for (let i = 0; i < 16; i++) {
    const t = i / 15, x = -4.7 + t * 12, y = 3.05 - Math.sin(t * Math.PI * 3) * 0.18 - 0.05;
    const col = [0xffd27a, 0xffb8a0, 0xc9e6a8][i % 3];
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: col }));
    b.position.set(x, y, -3.92); scene.add(b);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: col, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
    sp.scale.setScalar(0.32); sp.position.copy(b.position); scene.add(sp);
    bulbs.push({ sp, phase: i * 0.7 });
  }
  const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 16 }, (_, i) => { const t = i / 15; return new THREE.Vector3(-4.7 + t * 12, 3.05 - Math.sin(t * Math.PI * 3) * 0.18, -3.93); })), 64, 0.008, 4), mat("#5a3a22"));
  scene.add(wire);
  // 牆上的畫
  box(0.7, 0.5, 0.04, "#8a5a38", -1.6, 2.2, -3.98, scene);
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.4), new THREE.MeshBasicMaterial({ map: skyTexture("day") })); pic.position.set(-1.6, 2.2, -3.955); scene.add(pic);
  box(0.6, 0.45, 0.04, "#8a5a38", 2.5, 2.25, -3.98, scene);
  const pic2 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), mat("#e7a6a8")); pic2.position.set(2.5, 2.25, -3.955); scene.add(pic2);
  sph(0.09, "#c2453b", 2.5, 2.25, -3.94, scene);

  // 書桌與椅子
  SEATS.forEach((st, i) => {
    const d = new THREE.Group(); d.position.set(st.dx, 0, st.dz); d.rotation.y = st.ry; scene.add(d);
    box(1.1, 0.06, 0.62, "#b07a4f", 0, 0.63, 0, d);
    box(1.0, 0.16, 0.04, "#9a6640", 0, 0.52, 0.28, d);
    [[-0.5, -0.26], [0.5, -0.26], [-0.5, 0.26], [0.5, 0.26]].forEach(([lx, lz]) => box(0.06, 0.6, 0.06, "#8a5a38", lx, 0.3, lz, d));
    // 每張桌子一盞小檯燈或小盆栽，讓每個角落都不一樣
    if (i % 2 === 0) {
      cyl(0.07, 0.08, 0.02, "#5a3a22", -0.42, 0.67, 0.12, d, 10); cyl(0.01, 0.01, 0.3, "#5a3a22", -0.42, 0.82, 0.12, d, 4);
      const sh = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.1, 14, 1, true), mat("#e0b04f", { side: THREE.DoubleSide, emissive: 0xffc070, emissiveIntensity: 0.5 })); sh.position.set(-0.42, 0.98, 0.12); d.add(sh);
    } else { cyl(0.05, 0.04, 0.08, "#c98f6a", -0.42, 0.7, 0.14, d); sph(0.07, "#8fae7a", -0.42, 0.79, 0.14, d); }
    if (st.booth === "plants") {
      // 長條花槽擋在書桌前面，像咖啡廳的座位
      box(1.3, 0.42, 0.26, "#8a5a38", 0, 0.21, 0.55, d); box(1.24, 0.04, 0.2, "#5a3a22", 0, 0.42, 0.55, d);
      for (let k = 0; k < 6; k++) { const lf = sph(0.17, k % 2 ? "#7b9c68" : "#8fae7a", -0.52 + k * 0.21, 0.6 + (k % 3) * 0.1, 0.55 + (k % 2 ? 0.04 : -0.04), d, 12, 10); lf.scale.set(0.9, 1.5, 0.8); }
      [-1, 1].forEach((sd) => { const tall = cap(0.03, 0.5, "#6f9a62", d); tall.position.set(sd * 0.58, 0.85, 0.55); const top2 = sph(0.15, "#7b9c68", sd * 0.58, 1.15, 0.55, d, 10, 8); top2.scale.y = 1.4; });
      plants.push(d);
    } else if (st.booth) {
      // 自習室隔板：前面和兩側，矮一點才看得到人
      const pc = ["#e8d3b0", "#c9d8c0", "#d9c3d9"][i % 3];
      box(1.24, 0.42, 0.04, pc, 0, 0.88, 0.33, d); box(1.28, 0.03, 0.06, "#8a5a38", 0, 1.1, 0.33, d);
      [-1, 1].forEach((sd) => { box(0.04, 0.42, 0.66, pc, sd * 0.6, 0.88, 0.0, d); box(0.06, 0.03, 0.68, "#8a5a38", sd * 0.6, 1.1, 0.0, d); });
      box(0.16, 0.12, 0.004, ["#ffe08a", "#e7a6a8", "#9cd0e8"][i % 3], 0.3, 0.9, 0.307, d).rotation.z = 0.08;  // 便利貼
      box(0.12, 0.1, 0.004, "#fff8dc", -0.25, 0.95, 0.307, d).rotation.z = -0.1;
      const shelf = box(0.5, 0.02, 0.12, "#a06a42", -0.3, 1.0, 0.25, d);
      [["#c2453b", 0], ["#5d7fa8", 0.05], ["#e0b04f", 0.1]].forEach(([c, x]) => box(0.04, 0.14, 0.1, c, -0.48 + x, 1.08, 0.25, d));
    }
    const ch = new THREE.Group(); ch.position.set(st.x, 0, st.z); ch.rotation.y = st.ry; scene.add(ch);
    box(0.46, 0.05, 0.44, "#a06a42", 0, 0.36, 0, ch); box(0.46, 0.5, 0.05, "#a06a42", 0, 0.62, -0.21, ch);
    box(0.36, 0.06, 0.38, ["#e8c9a0", "#d27d6b", "#9cbf7a"][i % 3], 0, 0.4, 0.02, ch);
    [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]].forEach(([lx, lz]) => box(0.04, 0.36, 0.04, "#7a4a2a", lx, 0.18, lz, ch));
    const prop = makeProp(""); d.add(prop);
    seatProps[i] = { group: d, prop, act: "" };
  });

  // 粒子：火星、灰塵、蒸氣
  embers = makeParticles(40, 0xffa040, 0.06, () => new THREE.Vector3(-4.25 + Math.random() * 0.15, 0.3 + Math.random() * 0.6, -1.6 + (Math.random() - 0.5) * 0.6));
  dust = makeParticles(70, 0xfff1d0, 0.035, () => new THREE.Vector3(-0.8 + Math.random() * 2.4, 0.2 + Math.random() * 2.4, -3.6 + Math.random() * 2.6));
  steam = makeParticles(14, 0xffffff, 0.1, () => new THREE.Vector3(2.2 + (Math.random() - 0.5) * 0.06, 1.62, -3.6));
}
function makeParticles(n, color, size, spawn) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), life = [];
  for (let i = 0; i < n; i++) { const p = spawn(); pos.set([p.x, p.y, p.z], i * 3); life.push(Math.random()); }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color, size, map: glowTexture(), transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(geo, m); scene.add(pts);
  return { pts, pos, life, spawn, n };
}

function lighting() {
  hemi = new THREE.HemisphereLight(0xfff1dc, 0x8a5a38, 1); scene.add(hemi);
  sunLight = new THREE.DirectionalLight(0xfff2d8, 1.8);
  sunLight.position.set(1.5, 6, -9); sunLight.target.position.set(0.5, 0, 0.5);
  sunLight.castShadow = true; sunLight.shadow.mapSize.set(1024, 1024);
  const sc = sunLight.shadow.camera; sc.left = -7; sc.right = 7; sc.top = 7; sc.bottom = -7; sc.near = 1; sc.far = 25; sunLight.shadow.bias = -0.0015;
  scene.add(sunLight); scene.add(sunLight.target);
  fillLight = new THREE.DirectionalLight(0xffe8cc, 0.6); fillLight.position.set(6, 8, 8); scene.add(fillLight);
  scene.background = new THREE.Color();
  applyEnv(env);
}

/* ===== 角色狀態 ===== */
function seatPos(i) { const s = SEATS[i]; return { x: s.x, z: s.z }; }
function pickSpot(id) {
  const freeSpots = SPOTS.map((s, i) => i).filter((i) => !reserved[i] || reserved[i] === id);
  const i = freeSpots[Math.floor(Math.random() * freeSpots.length)];
  Object.keys(reserved).forEach((k) => { if (reserved[k] === id) delete reserved[k]; });
  reserved[i] = id;
  return i;
}
function releaseSpot(id) { Object.keys(reserved).forEach((k) => { if (reserved[k] === id) delete reserved[k]; }); }

function addChar(m, seat) {
  const c = makeChar(m.look);
  scene.add(c.root);
  if (c.cat) scene.add(c.cat);
  c.root.userData.cid = m.id;
  const tag = document.createElement("div"); tag.className = "k3-tag" + (m.me ? " me" : ""); tag.textContent = m.name;
  tag.addEventListener("click", () => window.dispatchEvent(new CustomEvent("kaida3d-pick", { detail: { id: st.m.id } })));
  const bub = document.createElement("div"); bub.className = "k3-bubble"; bub.hidden = true;
  overlay.appendChild(tag); overlay.appendChild(bub);
  const st = { m, seat, c, tag, bub, lookKey: JSON.stringify(m.look || {}), mode: "sit", path: [], spot: -1, waitUntil: 0, pos: new THREE.Vector3(), ry: 0, t: Math.random() * 10 };
  if (m.up) { const si = pickSpot(m.id), s = SPOTS[si]; st.spot = si; st.pos.set(s.x, 0, s.z); st.ry = s.ry; st.mode = "idle"; st.waitUntil = performance.now() + 4000 + Math.random() * 6000; }
  else { const p = seatPos(seat); st.pos.set(p.x, 0, p.z); st.ry = SEATS[seat].ry; st.mode = "sit"; }
  chars[m.id] = st;
  return st;
}
function removeChar(id) {
  const st = chars[id]; if (!st) return;
  scene.remove(st.c.root); if (st.c.cat) scene.remove(st.c.cat);
  st.tag.remove(); st.bub.remove(); releaseSpot(id);
  delete chars[id];
}

function walkTo(st, to, then) {
  st.treat = Math.random() < 0.6 ? "drink" : "eat";
  st.path = findPath({ x: st.pos.x, z: st.pos.z }, to);
  st.mode = "walk"; st.after = then;
}

function update(members) {
  if (!mounted) return;
  const list = members.slice(0, 6), ids = {};
  list.forEach((m, i) => {
    ids[m.id] = 1;
    let st = chars[m.id];
    const lk = JSON.stringify(m.look || {});
    if (st && st.lookKey !== lk) { const keep = { pos: st.pos.clone(), ry: st.ry, mode: st.mode, spot: st.spot }; removeChar(m.id); st = addChar(m, i); if (keep.mode !== "sit" || m.up) { st.pos.copy(keep.pos); st.ry = keep.ry; st.mode = keep.mode === "walk" ? "idle" : keep.mode; st.spot = keep.spot; if (keep.spot >= 0) reserved[keep.spot] = m.id; } }
    if (!st) st = addChar(m, i);
    const wasUp = st.m.up;
    st.m = m; st.tag.textContent = m.name;
    if (st.seat !== i) { st.seat = i; if (!m.up) { const p = seatPos(i); walkTo(st, p, "sit"); } }
    if (m.up && !wasUp) {
      // 起身：從椅子後面站起來，走去一個地方
      if (st.mode === "sit") st.pos.z -= 0.0;
      const si = pickSpot(m.id); st.spot = si; walkTo(st, SPOTS[si], "idle");
    } else if (!m.up && wasUp) {
      releaseSpot(m.id); st.spot = -1; walkTo(st, seatPos(st.seat), "sit");
    }
    st.bub.textContent = m.bubble || ""; st.bub.hidden = !m.bubble;
  });
  Object.keys(chars).forEach((id) => { if (!ids[id]) removeChar(id); });
  // 書桌上的東西：誰坐哪裡就放他的活動道具
  for (let i = 0; i < 6; i++) {
    const m = list[i], act = m ? (ACTS3.indexOf(m.act) >= 0 ? m.act : "read") : "";
    const sp = seatProps[i];
    if (sp.act !== act) { sp.group.remove(sp.prop); sp.prop = makeProp(act); sp.group.add(sp.prop); sp.act = act; }
  }
}

/* ===== 每格動畫 ===== */
const tmpV = new THREE.Vector3();
function animChar(st, dt, now) {
  const c = st.c; st.t += dt;
  const s = st.t;
  if (st.mode === "walk") {
    const nxt = st.path[0];
    if (!nxt) {
      if (st.after === "sit") { const p = seatPos(st.seat); st.pos.set(p.x, 0, p.z); st.ry = SEATS[st.seat].ry; st.mode = "sit"; }
      else { const sp = SPOTS[st.spot] || { ry: st.ry }; st.mode = "idle"; st.ry = sp.ry; st.waitUntil = now + 6000 + Math.random() * 8000; }
    } else {
      const dx = nxt.x - st.pos.x, dz = nxt.z - st.pos.z, d = Math.hypot(dx, dz), sp = 1.15 * dt;
      if (d <= sp) { st.pos.x = nxt.x; st.pos.z = nxt.z; st.path.shift(); }
      else { st.pos.x += dx / d * sp; st.pos.z += dz / d * sp; }
      const want = Math.atan2(dx, dz);
      let diff = want - st.ry; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
      st.ry += diff * Math.min(1, dt * 10);
    }
  } else if (st.mode === "idle" && st.m.up && now > st.waitUntil) {
    const si = pickSpot(st.m.id); st.spot = si; walkTo(st, SPOTS[si], "idle");
  }
  c.root.position.copy(st.pos); c.root.rotation.y = st.ry;
  const pose0 = st.mode === "walk" ? "walk" : st.mode === "sit" ? "sit" : (SPOTS[st.spot] ? SPOTS[st.spot].pose : "stand");
  c.book.visible = pose0 === "book";
  c.cup.visible = pose0 === "mug" && st.treat !== "eat";
  c.cookie.visible = pose0 === "snack" || (pose0 === "mug" && st.treat === "eat");
  const pose = st.mode === "walk" ? "walk" : st.mode === "sit" ? "sit" : (SPOTS[st.spot] ? SPOTS[st.spot].pose : "stand");
  // 預設
  c.hips.position.y = 0.36; c.hips.position.z = 0; c.torso.rotation.x = 0; c.head.rotation.set(0, 0, 0);
  c.legs.forEach((l) => l.rotation.set(0, 0, 0));
  c.arms.forEach((a, i) => a.rotation.set(0, 0, (i ? 1 : -1) * 0.12));
  const breathe = Math.sin(s * 2) * 0.01;
  c.torso.position.y = breathe;
  if (pose === "walk") {
    const w = Math.sin(s * 9) * 0.6;
    c.legs[0].rotation.x = w; c.legs[1].rotation.x = -w;
    c.arms[0].rotation.x = -w * 0.7; c.arms[1].rotation.x = w * 0.7;
    c.hips.position.y = 0.36 + Math.abs(Math.cos(s * 9)) * 0.04;
  } else if (pose === "sit" || pose === "sofa") {
    c.hips.position.y = pose === "sofa" ? ((SPOTS[st.spot] && SPOTS[st.spot].seat) || 0.5) : 0.44;
    c.legs.forEach((l) => { l.rotation.x = -1.45; });
    if (pose === "sit") {
      const act = st.m.act;
      c.hips.position.z = 0.02;
      c.torso.rotation.x = 0.12;
      const typing = act === "pc" || act === "code", writing = WRITE_ACTS.indexOf(act) >= 0;
      c.head.rotation.x = typing || act === "lesson" ? 0.05 : 0.28 + Math.sin(s * 0.8) * 0.03;
      c.arms[0].rotation.x = -1.15; c.arms[1].rotation.x = -1.15;
      c.arms[0].rotation.z = 0.35; c.arms[1].rotation.z = -0.35;
      if (writing) c.arms[1].rotation.x = -1.2 + Math.sin(s * (act === "calligraphy" ? 2.5 : 7)) * 0.08;
      if (act === "lesson" && Math.sin(s * 0.7) > 0.6) c.arms[0].rotation.x = -1.2 + Math.sin(s * 7) * 0.08;
      if (typing) { c.arms[0].rotation.x = -1.25 + Math.sin(s * 11) * 0.05; c.arms[1].rotation.x = -1.25 + Math.cos(s * 12) * 0.05; }
      if ((act === "read" || act === "novel" || act === "research") && Math.sin(s * 0.5) > 0.97) c.arms[1].rotation.x = -1.5;
    } else {
      c.head.rotation.y = Math.sin(s * 0.4) * 0.4; c.arms.forEach((a) => { a.rotation.x = -0.5; });
    }
  } else if (pose === "book") {
    // 捧著書，每隔幾秒翻一頁
    c.arms.forEach((a, i) => { a.rotation.x = -1.25; a.rotation.z = (i ? -1 : 1) * 0.55; });
    c.head.rotation.x = 0.38 + Math.sin(s * 0.6) * 0.04; c.head.rotation.y = Math.sin(s * 0.3) * 0.08;
    const ph = (s % 3.2) / 0.7;
    c.book.userData.page.rotation.z = ph < 1 ? Math.PI * (1 - Math.cos(ph * Math.PI)) / 2 : 0;
    if (ph < 1) c.arms[1].rotation.x = -1.35 - Math.sin(ph * Math.PI) * 0.15;
  } else if (pose === "mug" || pose === "snack") {
    // 喝飲料或吃點心：手拿著，時不時送到嘴邊
    const cyc = s % 4, up = cyc < 1.2 ? Math.sin(cyc / 1.2 * Math.PI) : 0;
    c.arms[1].rotation.x = -0.75 - up * 1.55; c.arms[1].rotation.z = -0.15 - up * 0.45;
    c.arms[0].rotation.x = -0.2;
    const eating = st.treat === "eat" || pose === "snack";
    c.head.rotation.x = eating ? 0.05 + (up > 0.5 ? Math.sin(s * 14) * 0.05 : 0) : -up * 0.25;
  } else if (pose === "pet") {
    c.hips.position.y = 0.26; c.torso.rotation.x = 0.5; c.head.rotation.x = 0.2;
    c.legs.forEach((l) => { l.rotation.x = -0.9; });
    c.arms[1].rotation.x = -1.2 + Math.sin(s * 3) * 0.25; c.arms[1].rotation.z = -0.2;
  } else if (pose === "music") {
    c.head.rotation.z = Math.sin(s * 7.5 / 2) * 0.15; c.torso.rotation.z = Math.sin(s * 7.5 / 2) * 0.05;
    c.arms[1].rotation.x = -1.1; c.arms[1].rotation.z = -0.3;
  } else if (pose === "stretch") {
    const k = (Math.sin(s * 0.8) + 1) / 2;
    c.arms.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * (0.12 + k * 2.6); });
    c.torso.rotation.z = Math.sin(s * 0.4) * 0.12 * k;
  } else if (pose === "warm") {
    c.arms.forEach((a, i) => { a.rotation.x = -1.4; a.rotation.z = (i ? -1 : 1) * 0.35 + Math.sin(s * 3 + i) * 0.06; });
  } else {
    c.head.rotation.y = Math.sin(s * 0.5) * 0.5;
    c.arms.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * (0.12 + Math.sin(s * 1.2) * 0.04); });
  }
  // 眨眼
  const blink = (s % 4.3) < 0.12 ? 0.15 : 1;
  c.eyes.forEach((e) => { e.scale.y = 1.25 * blink; });
  // 小貓跟著
  if (c.cat) {
    const off = tmpV.set(0.45, 0, 0.25).applyAxisAngle(new THREE.Vector3(0, 1, 0), st.ry);
    const tx = st.pos.x + off.x, tz = st.pos.z + off.z;
    c.cat.position.x += (tx - c.cat.position.x) * Math.min(1, dt * 2.5);
    c.cat.position.z += (tz - c.cat.position.z) * Math.min(1, dt * 2.5);
    c.cat.rotation.y = st.ry;
    c.cat.userData.tail.rotation.z = Math.sin(s * 3) * 0.5;
  }
}

function tickParticles(p, dt, fn) {
  for (let i = 0; i < p.n; i++) {
    p.life[i] += dt * fn.rate;
    if (p.life[i] > 1) { p.life[i] = 0; const v = p.spawn(); p.pos[i * 3] = v.x; p.pos[i * 3 + 1] = v.y; p.pos[i * 3 + 2] = v.z; }
    fn.move(p.pos, i * 3, dt, p.life[i]);
  }
  p.pts.geometry.attributes.position.needsUpdate = true;
}

let tvNext = 0;
function drawTV(t) {
  const c = tvTex.userData.c, g = c.getContext("2d"), W = c.width, H = c.height;
  const ch = Math.floor(t / 12) % 3;
  if (ch === 0) { // 小山與雲
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#8ec5e8"); sky.addColorStop(1, "#d8eef5"); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = "#ffe08a"; g.beginPath(); g.arc(100, 22, 10, 0, 7); g.fill();
    g.fillStyle = "#fff"; for (let i = 0; i < 3; i++) { const x = ((t * 8 + i * 50) % (W + 40)) - 20; g.beginPath(); g.arc(x, 20 + i * 9, 8, 0, 7); g.arc(x + 9, 18 + i * 9, 10, 0, 7); g.arc(x + 19, 21 + i * 9, 7, 0, 7); g.fill(); }
    g.fillStyle = "#8fae7a"; g.beginPath(); g.moveTo(0, H); g.quadraticCurveTo(35, 40, 70, H); g.fill(); g.fillStyle = "#7b9c68"; g.beginPath(); g.moveTo(40, H); g.quadraticCurveTo(90, 50, 140, H); g.fill();
  } else if (ch === 1) { // 魚缸
    g.fillStyle = "#3f7f9a"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#e0c08a"; g.fillRect(0, H - 12, W, 12);
    [["#ffb347", 0], ["#e7a6a8", 2.1], ["#ffe08a", 4.2]].forEach(([col, ph]) => {
      const x = W / 2 + Math.sin(t * 0.6 + ph) * 44, y = 35 + Math.sin(t * 0.9 + ph) * 18, dir = Math.cos(t * 0.6 + ph) > 0 ? 1 : -1;
      g.fillStyle = col; g.beginPath(); g.ellipse(x, y, 9, 6, 0, 0, 7); g.fill();
      g.beginPath(); g.moveTo(x - 8 * dir, y); g.lineTo(x - 15 * dir, y - 5); g.lineTo(x - 15 * dir, y + 5); g.fill();
    });
    g.fillStyle = "rgba(255,255,255,.6)"; for (let i = 0; i < 5; i++) { const y = H - ((t * 20 + i * 19) % H); g.beginPath(); g.arc(20 + i * 22 + Math.sin(t + i) * 3, y, 2, 0, 7); g.fill(); }
  } else { // 下雨的窗
    g.fillStyle = "#5b6b7e"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#ffd27a"; for (let i = 0; i < 6; i++) g.fillRect(10 + i * 20, 50 + (i % 3) * 6, 8, 10);
    g.strokeStyle = "rgba(220,235,255,.7)"; g.lineWidth = 1; g.beginPath();
    for (let i = 0; i < 26; i++) { const x = (i * 13 + t * 30) % W, y = (i * 29 + t * 90) % H; g.moveTo(x, y); g.lineTo(x - 2, y + 7); } g.stroke();
  }
  g.fillStyle = "rgba(0,0,0,.08)"; for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
  tvTex.needsUpdate = true;
}

function frame() {
  raf = requestAnimationFrame(frame);
  if (!container.offsetParent || document.hidden) return;
  const dt = Math.min(0.05, clock.getDelta()), now = performance.now(), t = now / 1000;
  // 火
  fireMeshes.forEach((f, i) => { const k = 1 + Math.sin(t * (7 + i) + i) * 0.18 + Math.sin(t * 13 + i * 2) * 0.08; f.scale.set(1 - (k - 1) * 0.5, k, 1 - (k - 1) * 0.5); });
  fireLight.intensity = env.fire * (0.85 + Math.sin(t * 9) * 0.08 + Math.sin(t * 23) * 0.05 + Math.random() * 0.05);
  tickParticles(embers, dt, { rate: 0.6, move: (a, i, d) => { a[i + 1] += d * 0.9; a[i] += d * 0.15; a[i + 2] += Math.sin(t * 3 + i) * d * 0.2; } });
  tickParticles(dust, dt, { rate: 0.05, move: (a, i, d) => { a[i] += Math.sin(t * 0.3 + i) * d * 0.05; a[i + 1] += Math.cos(t * 0.2 + i) * d * 0.04; } });
  tickParticles(steam, dt, { rate: 0.5, move: (a, i, d, l) => { a[i + 1] += d * 0.35; a[i] += Math.sin(t * 2 + i) * d * 0.05; } });
  steam.pts.material.opacity = 0.45;
  bulbs.forEach((b) => { b.sp.material.opacity = 0.45 + Math.sin(t * 1.5 + b.phase) * 0.25; });
  pendulum.rotation.z = Math.sin(t * 2.2) * 0.22;
  if (now > tvNext) { drawTV(t); tvNext = now + 120; }
  tvLight.intensity = 0.5 + Math.sin(t * 5) * 0.08 + (Math.floor(t / 12) % 3 === 1 ? 0.15 : 0);
  record.rotation.y -= dt * 3.5;
  const beat = Math.max(0, Math.sin(t * 7.5)) ** 4;
  speakers.forEach((d) => d.scale.setScalar(1 + beat * 0.25));
  notes.forEach((n) => { const l = (t * 0.25 + n.userData.ph) % 1; n.position.set(-4.5 + l * 0.5 + Math.sin(l * 9 + n.userData.ph * 6) * 0.12, 1.15 + l * 1.3, 1.45 - n.userData.ph * 0.3); n.material.opacity = Math.sin(l * Math.PI) * 0.9; });
  houseCat.scale.y = 1 + Math.sin(t * 1.6) * 0.04;
  floorLight.intensity = env.floor + Math.sin(t * 0.7) * 0.05;
  lampLight.intensity = env.lamp;
  if (now > envNext) { env = envAt(hourNow()); applyEnv(env); envNext = now + 20000; }
  curtains.forEach((c) => { c.rotation.x = Math.sin(t * 0.8 + c.userData.s) * 0.03; c.rotation.z = Math.sin(t * 0.6) * 0.015 * c.userData.s; });
  plants.forEach((p, i) => { p.rotation.z = Math.sin(t * 0.7 + i) * 0.02; });
  // 角色
  Object.values(chars).forEach((st) => animChar(st, dt, now));
  // 鏡頭：慢慢晃動
  const yy = yaw + dragYaw + Math.sin(t * 0.12) * 0.05, pp = pitch + dragPitch;
  const r = camR;
  camera.position.set(target.x + Math.sin(yy) * Math.cos(pp) * r, target.y + Math.sin(pp) * r, target.z + Math.cos(yy) * Math.cos(pp) * r);
  camera.lookAt(target);
  renderer.render(scene, camera);
  // 名牌與對話泡泡
  const w = container.clientWidth, h = container.clientHeight;
  Object.values(chars).forEach((st) => {
    const sp0 = st.mode === "idle" && SPOTS[st.spot], sitting = st.mode === "sit" || (sp0 && (sp0.pose === "sofa" || sp0.pose === "pet"));
    tmpV.set(st.pos.x, sitting ? 1.62 : 1.72, st.pos.z).project(camera);
    const x = (tmpV.x * 0.5 + 0.5) * w, y = (-tmpV.y * 0.5 + 0.5) * h;
    st.tag.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(-50%,-100%)";
    st.bub.style.transform = "translate(" + x.toFixed(1) + "px," + (y - 22).toFixed(1) + "px) translate(-50%,-100%)";
  });
}

function resize() {
  const w = container.clientWidth, h = container.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 1.2 ? 38 : 32;
  camera.updateProjectionMatrix();
}

function mount(el) {
  if (mounted) { if (el !== container) { el.appendChild(renderer.domElement); el.appendChild(overlay); container = el; resize(); } return true; }
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" });
  } catch (e) { return false; }
  container = el;
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = "k3-canvas";
  el.appendChild(renderer.domElement);
  overlay = document.createElement("div"); overlay.className = "k3-overlay"; el.appendChild(overlay);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  buildGrid(); buildRoom(); lighting();
  clock = new THREE.Clock();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(el); else window.addEventListener("resize", resize);
  resize();
  // 拖曳轉視角
  let drag = null;
  el.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw: dragYaw, pitch: dragPitch }; });
  // 點人物看狀態
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  el.addEventListener("pointerup", (e) => {
    if (!drag || Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) return;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const roots = Object.values(chars).map((st) => st.c.root);
    const hit = ray.intersectObjects(roots, true)[0];
    let id = null;
    if (hit) { let o = hit.object; while (o && !o.userData.cid) o = o.parent; id = o && o.userData.cid; }
    if (!id) { // 點得不準時，找畫面上最近的人
      let best = 1e9; Object.values(chars).forEach((st) => { tmpV.set(st.pos.x, 0.9, st.pos.z).project(camera); const d = Math.hypot(tmpV.x - ndc.x, tmpV.y - ndc.y); if (d < best && d < 0.12) { best = d; id = st.m.id; } });
    }
    if (id) window.dispatchEvent(new CustomEvent("kaida3d-pick", { detail: { id } }));
  });
  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    dragYaw = Math.max(-0.3, Math.min(0.3, drag.yaw - (e.clientX - drag.x) * 0.005));
    dragPitch = Math.max(-0.12, Math.min(0.15, drag.pitch + (e.clientY - drag.y) * 0.003));
  });
  window.addEventListener("pointerup", () => { drag = null; });
  mounted = true;
  frame();
  return true;
}

window.KaidaScene3D = { mount, update, findPath, setHour: (h) => { hourOverride = h; envNext = 0; }, cam: (r, y, p) => { camR = r; yaw = y; pitch = p; } };
window.dispatchEvent(new Event("kaida3d-ready"));
