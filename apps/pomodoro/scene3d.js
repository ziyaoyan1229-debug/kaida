/* 番茄讀書會：3D 原木風讀書房（three.js）
   window.KaidaScene3D.mount(el) → 是否成功；.update(members)；members: [{ id, name, look, act, me, bubble, up }] */
import * as THREE from "./vendor/three.module.min.js";

const ACTS3 = ["read", "novel", "homework", "research", "report", "code", "pc", "draw", "vocab", "journal", "calligraphy", "lesson", "music", "piano", "sing", "craft"];
const WRITE_ACTS = ["homework", "draw", "report", "vocab", "journal", "calligraphy", "craft"];
const SKINS = ["#f6d7bd", "#e9b994", "#c98e64", "#fbe6d4", "#d9a27a", "#a8704a", "#8a5532", "#5e3a24"];
const HAIRS = ["#3b2a20", "#7a4a2a", "#c58b4c", "#2c2c34", "#151515", "#e6c27a", "#b0302a", "#9a9aa0", "#f2efe8", "#e88aa8", "#5a7ad0", "#7a5ad0", "#4a8a6a"];
const TOPS = { "tee-blue": "#7fa6c9", "tee-pink": "#e7a6a8", stripe: "#f3efe6", hoodie: "#8fae7a", sweater: "#e0b04f", cardigan: "#e6d3b3", plaid: "#c8574a", sport: "#3f6f6a", overalls: "#f3efe6", denim: "#5d7fa8", turtle: "#3a3640" };

/* ===== 小工具 ===== */
const mats = {};
function mat(color, opt) {
  if (REMAP && REMAP[color]) color = REMAP[color];
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
    g.globalAlpha = 0.25; g.fillStyle = dark;
    const kx = ((i * 97) % 83) / 83 * (vertical ? c.height : c.width);
    g.beginPath(); if (vertical) g.ellipse(i * size + size / 2, kx, size / 7, size / 4, 0, 0, 7); else g.ellipse(kx, i * size + size / 2, size / 4, size / 7, 0, 0, 7); g.fill();
    g.globalAlpha = 0.55; g.fillStyle = dark;
    if (vertical) g.fillRect(i * size, 0, 2, c.height); else g.fillRect(0, i * size, c.width, 2);
    const cut = ((i * 53) % 71) / 71 * (vertical ? c.height : c.width);
    if (vertical) g.fillRect(i * size, cut, size, 2); else g.fillRect(cut, i * size, 2, size);
    g.globalAlpha = 1;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 4;
  return tex;
}
function rugTexture(rc) {
  rc = rc || ["#c9825e", "#f3e3c6", "#e8b07a"];
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = rc[0]; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = rc[1]; g.lineWidth = 6; g.setLineDash([14, 10]);
  g.beginPath(); g.arc(128, 128, 104, 0, 7); g.stroke();
  g.setLineDash([]); g.strokeStyle = rc[2]; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 70, 0, 7); g.stroke();
  g.fillStyle = rc[1]; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.beginPath(); g.arc(128 + Math.cos(a) * 40, 128 + Math.sin(a) * 40, 6, 0, 7); g.fill(); }
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
const BASE_SEATS = [
  { x: 0.9, z: 0.6, ry: -0.35, booth: "plants" },  // 房間中間（綠植隔開）
  { x: 3.6, z: 3.7, ry: -0.6, booth: "board" },     // 前面右邊（有隔板）
  { x: 5.0, z: 0.1, ry: 1.3, booth: "board" },      // 右邊靠牆角（有隔板）
  { x: -1.55, z: -1.55, ry: 0.45 },              // 書櫃旁
  { x: -0.4, z: 4.3, ry: 0.25, booth: "plants" },    // 前面左邊（有隔板）
  { x: 0.2, z: -2.72, ry: Math.PI }              // 窗邊書桌（面向窗外）
];
const DESK_D = 0.58;
const SEATS = [], SPOTS = [], OBST = [];
// m = 屬於哪一組家具（主題把那組藏起來時，這個點也一起拿掉）
const BASE_SPOTS = [
  { x: -3.85, z: -1.6, ry: -Math.PI / 2, pose: "warm", m: "fire" },              // 火爐前
  { x: -2.95, z: 1.45, ry: -Math.PI / 2, pose: "sofa", seat: 0.5, m: "sofa" },   // 沙發看電視
  { x: -2.95, z: 2.35, ry: -Math.PI / 2, pose: "sofa", seat: 0.5, m: "sofa" },
  { x: 2.55, z: -2.95, ry: Math.PI, pose: "mug", m: "bar" },                    // 飲料吧
  { x: 4.3, z: -3.05, ry: Math.PI, pose: "snack", m: "snack" },                   // 零食櫃
  { x: -2.95, z: -3.05, ry: Math.PI, pose: "book", m: "books" },                  // 書櫃
  { x: -3.45, z: -2.45, ry: -2.3, pose: "pet", m: "cat" },                      // 摸貓窩裡的貓
  { x: 6.0, z: 2.4, ry: -1.0, pose: "sofa", seat: 0.3, m: "bean" },             // 懶骨頭
  { x: -3.0, z: -0.85, ry: -2.09, pose: "sofa", seat: 0.48, m: "arm" },         // 單人沙發烤火
  { x: -3.25, z: 3.75, ry: Math.PI, pose: "sofa", seat: 0.48, m: "love" },       // 雙人沙發
  { x: -2.45, z: 3.75, ry: Math.PI, pose: "sofa", seat: 0.48, m: "love" },
  { x: -4.05, z: 0.45, ry: -Math.PI / 2, pose: "music", m: "tv" },             // 換唱片
  { x: -1.1, z: -3.05, ry: Math.PI, pose: "stand" },                  // 看窗外
  { x: 1.9, z: -0.9, ry: -0.4, pose: "stretch" },
  { x: 5.6, z: 5.2, ry: -0.3, pose: "stand" },
  { x: 2.4, z: 1.9, ry: 0.6, pose: "stretch" },
  { x: 6.3, z: -2.6, ry: -0.8, pose: "stand" },
  { x: -1.75, z: 0.75, ry: 0.4, pose: "stretch" }
];
// 走路用格子（0.25 一格）
const GRID = { x0: -5, z0: -4, cell: 0.25, cols: 50, rows: 44 };
const BASE_OBST = [
  [-5, -2.7, -4.15, -0.5, "fire"],     // 火爐 x1,z1,x2,z2
  [-5, 0.7, -4.45, 3.1, "tv"],       // 電視櫃與音響
  [-4.05, 1.45, -3.45, 2.35, "sofa"],  // 茶几
  [-3.25, 0.8, -2.25, 3.0, "sofa"],    // 沙發
  [-3.75, -4, -2.2, -3.5, "books"],     // 書櫃
  [1.7, -4, 3.45, -3.35, "bar"],      // 飲料吧
  [1.95, -3.25, 2.25, -2.95, "bar"], [2.85, -3.25, 3.15, -2.95, "bar"], // 吧台椅
  [3.65, -4, 4.95, -3.45, "snack"],     // 零食櫃
  [-4.1, -3.05, -3.6, -2.55, "cat"],  // 貓窩
  [6.75, 5.45, 7.4, 6.2],       // 盆栽
  [-5, -4, -4.3, -3.3],        // 角落盆栽
  [-4.95, 3.35, -4.15, 4.15],  // 龜背芋
  [4.35, -2.65, 4.85, -2.15],  // 小盆栽
  [6.6, -3.95, 7.4, -3.1],     // 右後盆栽
  [1.95, 5.65, 2.45, 6.15],    // 前面盆栽
  [4.85, 2.95, 6.35, 4.25, "cafeT"],    // 小圓咖啡桌
  [6.3, -2.35, 6.9, -1.65, "board"],    // 黑板
  [-2.75, 0.4, -2.45, 0.7, "lamp"],    // 落地燈
  [5.85, 2.15, 6.3, 2.65, "bean"],     // 懶骨頭
  [-3.4, -1.3, -2.6, -0.4, "arm"],    // 單人沙發
  [-3.75, 3.3, -1.95, 4.3, "love"]     // 雙人沙發
];
// 依主題重算這間房的座位、休息點和障礙物（家裡用原本的配置）
function applyLayout() {
  const L = LAYOUTS[THEME] || {}, hide = L.hide || [], mv = L.move || {};
  const off = (m) => mv[m] || [0, 0];
  SEATS.length = 0; OBST.length = 0; SPOTS.length = 0;
  (L.seats || BASE_SEATS).forEach((s0) => { const s = Object.assign({}, s0); s.dx = s.x + Math.sin(s.ry) * DESK_D; s.dz = s.z + Math.cos(s.ry) * DESK_D; SEATS.push(s); });
  BASE_OBST.forEach((o) => { if (hide.indexOf(o[4]) >= 0) return; const d = off(o[4]); OBST.push([o[0] + d[0], o[1] + d[1], o[2] + d[0], o[3] + d[1]]); });
  const RI = RICH[THEME] || {};
  (L.obst || []).concat(RI.obst || []).forEach((o) => OBST.push(o));
  SEATS.forEach((s) => {
    const c = Math.abs(Math.cos(s.ry)), sn = Math.abs(Math.sin(s.ry));
    const hx = c * 0.56 + sn * 0.32, hz = sn * 0.56 + c * 0.32;
    OBST.push([s.dx - hx, s.dz - hz, s.dx + hx, s.dz + hz]);
    OBST.push([s.x - 0.26, s.z - 0.26, s.x + 0.26, s.z + 0.26]);
    const booth = L.allBooth || T().allBooth ? "board" : s.booth;
    if (booth === "plants") { const px = s.dx + Math.sin(s.ry) * 0.55, pz = s.dz + Math.cos(s.ry) * 0.55, ex = c * 0.66 + sn * 0.15, ez = sn * 0.66 + c * 0.15; OBST.push([px - ex, pz - ez, px + ex, pz + ez]); }
  });
  // 沒有綁家具的站立點，被桌子或新家具壓到就不要
  const inObst = (x, z) => OBST.some((o) => x > o[0] - 0.12 && x < o[2] + 0.12 && z > o[1] - 0.12 && z < o[3] + 0.12);
  BASE_SPOTS.forEach((s) => {
    if (s.m && hide.indexOf(s.m) >= 0) return;
    if (!s.m && LAYOUTS[THEME] && inObst(s.x, s.z)) return;
    const d = off(s.m), o = Object.assign({}, s, { x: s.x + d[0], z: s.z + d[1] }); if (L.poses && L.poses[s.m]) o.pose = L.poses[s.m]; SPOTS.push(o);
  });
  (L.spots || []).concat(RI.spots || []).forEach((s) => { if (s.in || !inObst(s.x, s.z)) SPOTS.push(s); });
  buildGrid();
}

let blocked = null;
const COFFEE_SPOT = { x: 2.2, z: -2.75 }, BREW_MS = 5500;
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
// 角色外面描一圈深色邊，避免跟顏色相近的地板、牆壁糊在一起
const OUTLINE_M = new THREE.MeshBasicMaterial({ color: 0x2a1d16, side: THREE.BackSide });
const tmpBox = new THREE.Box3(), tmpSize = new THREE.Vector3();
function outline(root, t) {
  const list = [];
  root.traverse((o) => { if (o.isMesh && !o.material.isMeshBasicMaterial) list.push(o); });
  list.forEach((o) => {
    const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere();
    if (g.boundingSphere.radius < 0.05) return; // 眼睛、嘴巴這些小東西不描
    if (!g.boundingBox) g.computeBoundingBox();
    g.boundingBox.getSize(tmpSize);
    const e = new THREE.Mesh(g, OUTLINE_M);
    const pr = g.parameters || {};
    // 頭髮這種開口的半球殼：照外框盒縮放會把邊緣往外、往下撐開，看起來像頭髮岔開；改成以球心等比放大，邊才貼著
    if (g.type === "SphereGeometry" && (pr.phiLength < Math.PI * 2 - 1e-3 || pr.thetaLength < Math.PI - 1e-3)) e.scale.setScalar(1 + t / pr.radius);
    else if (g.type === "CylinderGeometry" && pr.openEnded) { const k = 1 + t / Math.max(pr.radiusTop, pr.radiusBottom); e.scale.set(k, 1, k); }
    else e.scale.set(1 + t / Math.max(tmpSize.x / 2, 0.04), 1 + t / Math.max(tmpSize.y / 2, 0.04), 1 + t / Math.max(tmpSize.z / 2, 0.04));
    e.castShadow = false; e.receiveShadow = false; e.userData.outline = true;
    o.add(e);
  });
}
function makeChar(look) {
  look = look || {};
  const skin = SKINS[look.skin] || SKINS[0], hair = HAIRS[look.hair] || HAIRS[0];
  const top = TOPS[look.top] || TOPS["tee-blue"], girl = look.g === "girl";
  const root = new THREE.Group();
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.28, 20), new THREE.MeshBasicMaterial({ color: 0x3a2a1a, transparent: true, opacity: 0.18, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01; root.add(shadow);
  const hips = new THREE.Group(); hips.position.y = 0.36; root.add(hips);
  const legs = [];
  [-0.085, 0.085].forEach((x) => {
    const p = new THREE.Group(); p.position.set(x, 0, 0); hips.add(p);
    const l = cap(0.07, 0.17, "#5b5f7a", p); l.position.y = -0.17;
    const shoe = sph(0.085, "#4a3a30", 0, -0.33, 0.03, p); shoe.scale.set(1, 0.6, 1.3);
    legs.push(p);
  });
  const torso = new THREE.Group(); hips.add(torso);
  const body = cap(0.17, 0.16, top, torso); body.position.y = 0.2; body.scale.set(1, 1, 0.85);
  if (look.top === "stripe") [0.12, 0.2, 0.28].forEach((y) => { const s = cyl(0.172, 0.172, 0.035, "#5d7fa8", 0, y, 0, torso); s.scale.z = 0.85; });
  if (look.top === "hoodie") { const hd = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.045, 8, 20), mat("#7a9a66")); hd.rotation.x = Math.PI / 2; hd.position.set(0, 0.4, -0.04); torso.add(hd); }
  if (look.top === "sweater") { const hm = cyl(0.175, 0.175, 0.05, "#c99a3e", 0, 0.06, 0, torso); hm.scale.z = 0.85; }
  if (look.top === "cardigan") { box(0.1, 0.3, 0.02, "#f8f4ec", 0, 0.2, 0.15, torso); [0.26, 0.18].forEach((y) => sph(0.012, "#a08a6a", -0.06, y, 0.155, torso, 6, 4)); }
  if (look.top === "plaid") { [0.1, 0.2, 0.3].forEach((y) => { const b2 = cyl(0.173, 0.173, 0.018, "#8a3a32", 0, y, 0, torso); b2.scale.z = 0.85; }); [-0.07, 0, 0.07].forEach((x) => box(0.016, 0.34, 0.02, "#8a3a32", x, 0.2, 0.142, torso)); }
  if (look.top === "sport") { box(0.012, 0.32, 0.02, "#f3efe6", 0, 0.2, 0.145, torso); }
  if (look.top === "overalls") { box(0.2, 0.16, 0.03, "#5d7fa8", 0, 0.14, 0.14, torso); const lw = cyl(0.172, 0.172, 0.12, "#5d7fa8", 0, 0.03, 0, torso); lw.scale.z = 0.85; [-0.07, 0.07].forEach((x) => { box(0.035, 0.22, 0.02, "#5d7fa8", x, 0.3, 0.13, torso); sph(0.015, "#e8b93a", x, 0.22, 0.15, torso, 6, 4); }); }
  if (look.top === "denim") { box(0.012, 0.32, 0.02, "#e8d6a8", 0, 0.2, 0.145, torso); [-0.08, 0.08].forEach((x) => box(0.06, 0.05, 0.02, "#4a6a90", x, 0.27, 0.145, torso)); }
  if (look.top === "turtle") cyl(0.12, 0.13, 0.09, "#2a2630", 0, 0.41, 0, torso, 16);
  if (look.back === "cape") { const cp2 = box(0.36, 0.44, 0.025, "#b0302a", 0, 0.18, -0.16, torso); cp2.rotation.x = 0.12; }
  if (look.neck === "tie") { box(0.05, 0.2, 0.02, "#3a5a8a", 0, 0.26, 0.15, torso); sph(0.03, "#3a5a8a", 0, 0.37, 0.15, torso, 8, 6); }
  if (look.back === "backpack") { const bp = box(0.3, 0.32, 0.16, "#e0b04f", 0, 0.22, -0.2, torso); box(0.22, 0.12, 0.04, "#c99a3e", 0, 0.14, -0.29, torso); [-0.09, 0.09].forEach((x) => box(0.035, 0.3, 0.02, "#b98a30", x, 0.24, 0.135, torso)); bp.castShadow = true; }
  if (look.back === "wings") { [-1, 1].forEach((sd) => { const w = sph(0.22, "#fffdf8", sd * 0.18, 0.3, -0.2, torso, 14, 10); w.scale.set(0.9, 0.55, 0.15); w.rotation.z = sd * -0.5; w.rotation.y = sd * 0.4; }); }
  if (look.neck === "bowtie") [-1, 1].forEach((sd) => { const b3 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.09, 8), mat("#c2453b")); b3.rotation.z = sd * Math.PI / 2; b3.position.set(sd * 0.045, 0.37, 0.15); torso.add(b3); });
  if (look.neck === "pearls") { for (let i = 0; i < 9; i++) { const a = Math.PI * (0.15 + i * 0.0875); sph(0.022, mat("#fffdf8", { roughness: 0.2 }), Math.cos(a) * 0.14, 0.35 - Math.sin(a) * 0.03, Math.sin(a) * 0.13, torso, 8, 6); } }
  if (look.neck === "scarf") { const sc = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.055, 8, 20), mat("#c2453b")); sc.rotation.x = Math.PI / 2; sc.position.y = 0.4; torso.add(sc); box(0.08, 0.18, 0.04, "#c2453b", 0.07, 0.3, 0.14, torso); }
  const arms = [];
  [-1, 1].forEach((s) => {
    const p = new THREE.Group(); p.position.set(0.2 * s, 0.36, 0); torso.add(p);
    const a = cap(0.055, 0.16, top, p); a.position.y = -0.13;
    sph(0.06, skin, 0, -0.26, 0, p);
    p.rotation.z = 0.12 * s;
    arms.push(p);
  });
  const head = new THREE.Group(); head.position.y = 0.72; torso.add(head);
  const hs = sph(0.3, skin, 0, 0, 0, head, 28, 20); hs.scale.set(1.05, 0.95, 1);
  const capG = new THREE.SphereGeometry(0.325, 28, 16, 0, Math.PI * 2, 0, Math.PI * (girl ? 0.5 : 0.46));
  const hairCap = new THREE.Mesh(capG, mat(hair)); hairCap.castShadow = true; hairCap.rotation.x = -0.32; hairCap.position.set(0, 0.02, -0.01); hairCap.scale.set(1.05, 1, 1.02); head.add(hairCap);
  // 後腦勺：髮帽往前傾會露出後腦的皮膚，補一片蓋住後半顆頭，頭髮才不會有斷層
  const backG = new THREE.SphereGeometry(0.322, 28, 16, Math.PI, Math.PI, 0, Math.PI * (girl ? 0.7 : 0.62));
  const hairBack = new THREE.Mesh(backG, mat(hair)); hairBack.castShadow = true; hairBack.position.set(0, 0.02, -0.012); hairBack.scale.set(1.05, 1, 1.02); head.add(hairBack);
  const style = look.style || "";
  // 女生頭髮：從頭頂一路包住兩側和後腦，臉前開一個窗，長髮再從同一圈往下垂，整頭是連著的，不是平頭後面黏一塊
  const shellLen = { "": 0.64, long: 0.62, bob: 0.64, pony: 0.74, twins: 0.74, buns: 0.74 };
  if (girl && shellLen[style] != null) {
    hairBack.visible = false;
    const R = 0.33, T = Math.PI * shellLen[style], W = 0.95, HS = [1.06, 1, 1.04];
    const shell = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 18, Math.PI / 2 + W, Math.PI * 2 - W * 2, 0, T), mat(hair, { side: THREE.DoubleSide }));
    shell.position.set(0, 0.02, -0.01); shell.scale.set(HS[0], HS[1], HS[2]); shell.castShadow = true; head.add(shell);
    const drop = { "": 0.14, long: 0.5, bob: 0.12 }[style];
    if (drop) {
      const r0 = R * Math.sin(T), y0 = 0.02 + R * Math.cos(T), flare = style === "long" ? 1.12 : style === "bob" ? 1.06 : 1.03;
      const cur = new THREE.Mesh(new THREE.CylinderGeometry(r0, r0 * flare, drop, 32, 1, true, W, Math.PI * 2 - W * 2), mat(hair, { side: THREE.DoubleSide }));
      cur.position.set(0, y0 - drop / 2, -0.01); cur.scale.set(HS[0], 1, HS[2]); cur.castShadow = true; head.add(cur);
      // 髮尾收一圈，看起來有厚度
      const tg = new THREE.TorusGeometry(r0 * flare, 0.016, 6, 32, Math.PI * 2 - W * 2); tg.rotateX(Math.PI / 2); tg.rotateY(-(Math.PI / 2 + W));
      const tip = new THREE.Mesh(tg, mat(hair)); tip.position.set(0, y0 - drop, -0.01); tip.scale.set(HS[0], 1, HS[2]); head.add(tip);
    }
  }
  const hatOn = look.hat === "cap" || look.hat === "beanie" || look.hat === "straw" || look.hat === "beret" || look.hat === "bucket";
  if (style === "bob") { if (!girl) { const b4 = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), mat(hair)); b4.rotation.x = -0.55; b4.position.set(0, 0.02, -0.03); b4.scale.set(1.08, 1, 1.02); head.add(b4); } const fr2 = box(0.46, 0.08, 0.06, hair, 0, 0.17, 0.26, head); fr2.rotation.x = -0.25; }
  else if (style === "long") { if (!girl) { const bk = cap(0.27, 0.42, hair, head); bk.position.set(0, -0.25, -0.12); bk.scale.set(1.1, 1, 0.6); } const fr2 = sph(0.12, hair, -0.1, 0.17, 0.22, head); fr2.scale.set(1.4, 0.55, 0.8); }
  else if (style === "pony") { sph(0.12, hair, 0, 0.12, -0.3, head); const tl = cap(0.08, 0.28, hair, head); tl.position.set(0, -0.12, -0.36); tl.rotation.x = 0.25; sph(0.045, "#e7a6a8", 0, 0.12, -0.2, head); const fr2 = sph(0.11, hair, 0.08, 0.17, 0.22, head); fr2.scale.set(1.4, 0.55, 0.8); }
  else if (style === "twins") { [-1, 1].forEach((sd) => { const tl = cap(0.075, 0.24, hair, head); tl.position.set(sd * 0.36, -0.1, -0.06); tl.rotation.z = sd * 0.3; sph(0.045, "#e7a6a8", sd * 0.31, 0.06, -0.06, head, 8, 6); }); const fr2 = sph(0.12, hair, 0, 0.17, 0.22, head); fr2.scale.set(1.6, 0.5, 0.8); }
  else if (style === "buzz") { hairCap.scale.set(0.98, 0.94, 0.97); hairBack.scale.set(0.98, 0.94, 0.97); }
  else if (style === "buns") { [-1, 1].forEach((sd) => sph(0.12, hair, sd * 0.2, 0.3, -0.03, head, 14, 10)); const fr2 = sph(0.12, hair, 0, 0.17, 0.22, head); fr2.scale.set(1.6, 0.5, 0.8); }
  else if (hatOn && (style === "curly" || style === "spiky" || style === "buns")) { /* 戴帽子時，頂上的捲髮、刺刺頭、包包頭收進帽子裡 */ }
  else if (style === "curly") { for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r0 = 0.28; sph(0.1, hair, Math.cos(a) * r0, 0.14 + Math.sin(i * 1.7) * 0.06, Math.sin(a) * r0 * 0.95 - 0.02, head, 10, 8); } for (let i = 0; i < 5; i++) sph(0.11, hair, -0.16 + i * 0.08, 0.3, -0.02 + (i % 2) * 0.05, head, 10, 8); }
  else if (style === "spiky") { for (let i = 0; i < 9; i++) { const k2 = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 6), mat(hair)); const a = (i - 4) * 0.28; k2.position.set(Math.sin(a) * 0.22, 0.3 + Math.cos(a) * 0.05, (i % 2 ? -0.05 : 0.08)); k2.rotation.z = -a * 0.9; k2.rotation.x = i % 2 ? -0.4 : 0.3; head.add(k2); } }
  else if (girl) {
    sph(0.06, "#e7a6a8", 0.24, 0.2, 0.08, head);
  } else {
    const fr = sph(0.11, hair, 0.1, 0.17, 0.22, head); fr.scale.set(1.3, 0.55, 0.8);
  }
  const eyeM = mat("#2f2622", { roughness: 0.3 });
  // 女生：大一點的眼睛、睫毛、粉嫩腮紅與嘴唇；男生：眉毛、小一點的眼睛、淡腮紅
  const eyes = [-0.1, 0.1].map((x) => {
    const e = sph(girl ? 0.042 : 0.032, eyeM, x, -0.01, 0.285, head, 10, 8); e.scale.set(0.9, 1.25, 0.6);
    const hl = sph(girl ? 0.013 : 0.009, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.012, 0.012, 0.03, e, 6, 4); hl.castShadow = false;
    if (girl) { const sd = Math.sign(x); [0, 1].forEach((k) => { const l = box(0.03, 0.008, 0.01, eyeM, sd * (0.034 + k * 0.01), 0.026 - k * 0.008, 0.008, e); l.rotation.z = sd * (0.5 + k * 0.45); l.castShadow = false; }); }
    return e;
  });
  if (!girl) [-0.1, 0.1].forEach((x) => { const br = box(0.085, 0.018, 0.012, hair === "#f2efe8" ? "#8a7a6a" : hair, x, 0.075, 0.29, head); br.rotation.z = -Math.sign(x) * 0.12; br.castShadow = false; });
  [-0.17, 0.17].forEach((x) => { const b = new THREE.Mesh(new THREE.CircleGeometry(girl ? 0.05 : 0.04, 14), new THREE.MeshBasicMaterial({ color: girl ? 0xf38c9a : 0xf0a0a0, transparent: true, opacity: girl ? 0.6 : 0.3 })); b.position.set(x, -0.08, 0.27); b.rotation.y = x * 1.6; head.add(b); });
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(girl ? 0.026 : 0.032, girl ? 0.01 : 0.008, 6, 12, Math.PI), mat(girl ? "#d0606a" : "#7a4a3a")); mouth.rotation.z = Math.PI; mouth.position.set(0, -0.1, 0.29); head.add(mouth);
  if (look.face === "glasses") [-0.1, 0.1].forEach((x) => { const gl = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.01, 6, 18), mat("#4a3a2c")); gl.position.set(x, -0.01, 0.3); head.add(gl); });
  if (look.face === "shades") { [-0.1, 0.1].forEach((x) => { const sg = cyl(0.07, 0.07, 0.02, "#2a2620", x, -0.005, 0.3, head, 16); sg.rotation.x = Math.PI / 2; }); box(0.06, 0.015, 0.015, "#2a2620", 0, 0.01, 0.31, head); }
  if (look.face === "star") { const st2 = cyl(0.04, 0.04, 0.01, "#e8b93a", 0.17, -0.06, 0.255, head, 5); st2.rotation.x = Math.PI / 2; st2.rotation.y = 0.3; }
  if (look.ears === "muffs") { const band = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.022, 8, 24, Math.PI), mat("#c98e9a")); band.position.y = 0.02; head.add(band); [-0.33, 0.33].forEach((x) => sph(0.1, "#f2c4c8", x, 0, 0, head, 12, 10)); }
  if (look.hat === "cap") { const cp = new THREE.Mesh(new THREE.SphereGeometry(0.37, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), mat("#5d7fa8")); cp.position.y = 0.03; cp.rotation.x = -0.12; cp.scale.set(1.06, 1, 1.05); head.add(cp); const brim = cyl(0.22, 0.22, 0.025, "#4a6a90", 0, 0.12, 0.34, head, 20); brim.scale.z = 0.8; brim.rotation.x = 0.15; sph(0.025, "#4a6a90", 0, 0.4, 0, head, 6, 4); }
  if (look.hat === "bunnyband") { const band = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.02, 6, 20, Math.PI), mat("#e7a6a8")); band.position.y = 0.05; band.rotation.y = Math.PI / 2; band.rotation.x = 0; head.add(band); [-1, 1].forEach((sd) => { const e = cap(0.055, 0.26, "#fffdf8", head); e.position.set(sd * 0.11, 0.48, -0.02); e.rotation.z = -sd * 0.18; const inn = cap(0.025, 0.2, "#f2c4c8", head); inn.position.set(sd * 0.11, 0.48, 0.03); inn.rotation.z = -sd * 0.18; }); }
  if (look.hat === "flower") { const fl = new THREE.Group(); fl.position.set(-0.24, 0.22, 0.12); head.add(fl); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; sph(0.04, "#e7a6a8", Math.cos(a) * 0.045, Math.sin(a) * 0.045, 0, fl, 8, 6); } sph(0.03, "#f2cc4a", 0, 0, 0.02, fl, 8, 6); }
  if (look.ears === "phones") {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 8, 24, Math.PI), mat("#5a6b7a")); band.position.y = 0.02; head.add(band);
    [-0.33, 0.33].forEach((x) => { const e = cyl(0.08, 0.08, 0.07, "#5a6b7a", x, 0.0, 0, head); e.rotation.z = Math.PI / 2; });
  }
  if (look.hat === "beanie") { const b = new THREE.Mesh(new THREE.SphereGeometry(0.37, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.47), mat("#c8574a")); b.position.y = 0.04; b.rotation.x = -0.15; b.scale.set(1.06, 1.05, 1.05); head.add(b); cyl(0.38, 0.38, 0.09, "#a9463c", 0, 0.07, -0.02, head).rotation.x = -0.15; sph(0.08, "#f3efe6", 0, 0.43, -0.04, head); }
  if (look.hat === "straw") { cyl(0.55, 0.55, 0.025, "#e6c27a", 0, 0.2, -0.02, head, 28); cyl(0.27, 0.33, 0.2, "#e6c27a", 0, 0.3, -0.02, head); cyl(0.322, 0.322, 0.04, "#c2453b", 0, 0.23, -0.02, head); }
  if (look.hat === "beret") { const b = sph(0.36, "#3d3a4a", 0.04, 0.27, -0.03, head); b.scale.set(1.08, 0.38, 1.05); sph(0.03, "#3d3a4a", 0.04, 0.4, -0.03, head); }
  if (look.hat === "catband") { const band = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.02, 6, 20, Math.PI), mat("#3d3a4a")); band.position.y = 0.05; band.rotation.y = Math.PI / 2; head.add(band); [-1, 1].forEach((sd) => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 4), mat("#3d3a4a")); e.position.set(sd * 0.19, 0.38, 0); e.rotation.z = -sd * 0.35; head.add(e); const inn = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.1, 4), mat("#f2c4c8")); inn.position.set(sd * 0.19, 0.37, 0.05); inn.rotation.z = -sd * 0.35; head.add(inn); }); }
  if (look.hat === "bucket") { const br = cyl(0.42, 0.48, 0.08, "#c9b48a", 0, 0.17, -0.02, head, 24); br.rotation.x = -0.1; cyl(0.3, 0.34, 0.22, "#c9b48a", 0, 0.3, -0.02, head, 22).rotation.x = -0.1; cyl(0.345, 0.345, 0.04, "#a8916a", 0, 0.22, -0.02, head, 22).rotation.x = -0.1; }
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
  outline(root, 0.022);
  if (cat) outline(cat, 0.012);
  return { root, hips, torso, head, legs, arms, eyes, cat, book, cup, cookie };
}

/* ===== 寵物 ===== */
function makePet(kind) {
  const g = new THREE.Group();
  const col = { cat: "#e3a35b", shiba: "#d9914a", bunny: "#fffdf8", chick: "#f2cc4a", panda: "#fffdf8", fox: "#e07a3a", hamster: "#e8c08a", blackcat: "#3c3842", calico: "#fffaf2", corgi: "#ec9a4e", poodle: "#c98a5a" }[kind] || "#e3a35b";
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
    else if (kind === "hamster") { [-0.06, 0.06].forEach((x) => sph(0.035, "#f2c4c8", x, 0.33, 0.12, g, 8, 6)); c1.scale.set(1, 0.95, 1.1); hd.scale.set(1.1, 1, 1); const bl = sph(0.08, "#fff4e4", 0, 0.1, 0.08, g, 8, 6); bl.scale.set(1, 0.9, 0.8); }
    else { [-0.05, 0.05].forEach((x) => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.035, kind === "fox" ? 0.1 : 0.07, 4), mat(col)); e.position.set(x, 0.35, 0.14); g.add(e); }); }
    if (kind === "fox") { const m2 = sph(0.055, "#fffdf8", 0, 0.22, 0.21, g, 8, 6); m2.scale.set(1.2, 0.8, 0.9); }
    if (kind === "shiba") { const m2 = sph(0.06, "#fff4e4", 0, 0.22, 0.21, g, 8, 6); m2.scale.set(1.2, 0.8, 0.8); }
    if (kind === "corgi") { const m2 = sph(0.06, "#fffaf2", 0, 0.22, 0.21, g, 8, 6); m2.scale.set(1.2, 0.8, 0.8); const ch = sph(0.08, "#fffaf2", 0, 0.12, 0.09, g, 8, 6); ch.scale.set(1, 1, 0.8); }
    if (kind === "calico") { sph(0.05, "#ee9a4a", -0.05, 0.31, 0.13, g, 8, 6); sph(0.045, "#3a3036", 0.05, 0.31, 0.13, g, 8, 6); sph(0.07, "#ee9a4a", 0.06, 0.18, -0.04, g, 8, 6); }
    if (kind === "poodle") { [[0, 0.34, 0.12, 0.06], [-0.09, 0.22, 0.12, 0.05], [0.09, 0.22, 0.12, 0.05], [0, 0.16, -0.1, 0.07]].forEach((p) => sph(p[3], "#a46a3c", p[0], p[1], p[2], g, 8, 6)); }
    if (kind !== "panda") [-0.04, 0.04].forEach((x) => sph(0.015, kind === "blackcat" ? "#e2b63a" : "#2f2622", x, 0.26, 0.23, g, 6, 6));
    if (kind === "bunny") { tail = sph(0.05, "#fffdf8", 0, 0.14, -0.17, g, 8, 6); }
    else if (kind === "shiba") { tail = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.022, 6, 12, Math.PI * 1.5), mat(col)); tail.position.set(0, 0.24, -0.15); tail.rotation.y = Math.PI / 2; g.add(tail); }
    else if (kind === "panda") { tail = sph(0.03, "#fffdf8", 0, 0.14, -0.16, g, 6, 6); }
    else if (kind === "hamster") { tail = sph(0.02, col, 0, 0.12, -0.15, g, 6, 6); }
    else if (kind === "fox") { tail = sph(0.08, col, 0, 0.2, -0.2, g, 10, 8); tail.scale.set(0.8, 0.8, 1.8); tail.rotation.x = -0.5; sph(0.045, "#fffdf8", 0, 0, 0.12, tail, 8, 6); }
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
  } else if (act === "music") {
    // 吉他抱在胸前，桌上攤著樂譜
    const gt = new THREE.Group(); gt.position.set(0.1, top + 0.08, -0.4); gt.rotation.z = 0.5; g.add(gt); g.userData.gtr = gt;
    [[0, 0, 0.17], [0.15, 0.0, 0.13]].forEach(([x, y, r]) => { const b2 = cyl(r, r, 0.07, "#d9903e", x - 0.08, y, 0, gt, 20); b2.rotation.x = Math.PI / 2; });
    const hole = cyl(0.045, 0.045, 0.072, "#3b2a20", 0.0, 0, 0, gt, 14); hole.rotation.x = Math.PI / 2;
    box(0.5, 0.05, 0.03, "#7a4a2a", 0.36, 0, 0, gt); box(0.1, 0.07, 0.035, "#5a3a26", 0.64, 0, 0, gt);
    box(0.05, 0.1, 0.02, "#5a3a26", -0.13, 0, 0.04, gt);
    box(0.34, 0.006, 0.24, "#fffaf0", -0.05, top + 0.003, 0.02, g);
    for (let i = 0; i < 5; i++) box(0.28, 0.002, 0.003, "#6a6a6a", -0.05, top + 0.008, -0.06 + i * 0.012, g);
    for (let i = 0; i < 5; i++) box(0.28, 0.002, 0.003, "#6a6a6a", -0.05, top + 0.008, 0.04 + i * 0.012, g);
  } else if (act === "piano") {
    // 桌上一台小電子琴
    box(0.7, 0.05, 0.2, "#2a2620", 0, top + 0.025, 0.02, g);
    for (let i = 0; i < 14; i++) box(0.042, 0.012, 0.11, "#fbf8f2", -0.295 + i * 0.0455, top + 0.055, -0.03, g);
    [0, 1, 3, 4, 5, 7, 8, 10, 11, 12].forEach((k) => box(0.026, 0.016, 0.065, "#1c1a18", -0.272 + k * 0.0455, top + 0.064, 0.0, g));
    box(0.66, 0.03, 0.06, "#3a3a44", 0, top + 0.06, 0.09, g);
    const sh = box(0.28, 0.18, 0.006, "#fffaf0", 0, top + 0.16, 0.13, g); sh.rotation.x = -0.25;
  } else if (act === "sing") {
    // 麥克風架 + 歌詞
    cyl(0.07, 0.07, 0.015, "#2a2620", 0.05, top + 0.008, 0.1, g, 14);
    const pole = cyl(0.008, 0.008, 0.36, "#4a4a50", 0.05, top + 0.18, 0.1, g, 6);
    const arm = cyl(0.007, 0.007, 0.2, "#4a4a50", 0.05, top + 0.36, 0.02, g, 6); arm.rotation.x = 1.1;
    sph(0.035, "#2a2a30", 0.05, top + 0.4, -0.07, g, 10, 8);
    box(0.24, 0.006, 0.3, "#fffaf0", -0.3, top + 0.003, 0.02, g).rotation.y = 0.2;
    for (let i = 0; i < 5; i++) box(0.16, 0.002, 0.006, "#c2453b", -0.3, top + 0.008, -0.07 + i * 0.04, g).rotation.y = 0.2;
  } else if (act === "craft") {
    // 打毛線：毛線球、棒針、織到一半的布
    sph(0.07, "#e7a6a8", 0.3, top + 0.07, 0.08, g, 14, 10);
    sph(0.05, "#7fa6c9", 0.4, top + 0.05, -0.04, g, 12, 8);
    box(0.22, 0.012, 0.14, "#e7a6a8", -0.02, top + 0.01, -0.06, g);
    [-1, 1].forEach((sd) => { const nd = cyl(0.006, 0.006, 0.3, "#c99a3e", sd * 0.05, top + 0.03, -0.1, g, 6); nd.rotation.z = Math.PI / 2 - sd * 0.5; nd.rotation.y = 0.3; });
    box(0.003, 0.003, 0.2, "#e7a6a8", 0.15, top + 0.02, 0.0, g).rotation.y = 0.6;
  } else {
    cyl(0.06, 0.05, 0.08, "#c98f6a", 0.3, top + 0.04, 0.05, g);
    sph(0.08, "#8fae7a", 0.3, top + 0.13, 0.05, g);
  }
  return g;
}

/* ===== 場景 ===== */
let renderer, scene, camera, container, overlay, clock, raf = 0, mounted = false;
let skyNext = 0, fillLight, envNext = 0, fireLight, fireMeshes = [], embers, dust, steam, bulbs = [], pendulum, curtains = [], beam, sunLight, hemi, lampLight, skyMat, plants = [];
let seatProps = [], chars = {}, reserved = {};
let barLight, tvTex, tvLight, record, speakers = [], notes = [], floorLight, houseCat;
// 一進房間就稍微放大，看不到房間外圍的邊
const ZOOM0 = 0.8;
let yaw = 0.64, pitch = 0.72, dragYaw = 0, dragPitch = 0, zoom = ZOOM0, zoomT = ZOOM0;
const panOff = new THREE.Vector3(), panT = new THREE.Vector3();
const target = new THREE.Vector3(1.1, 0.7, 1.2), tmpT = new THREE.Vector3();
let camR = 16.6;
// 進房間時鏡頭對準自己的座位（不是每個人都坐中間）
let focusMe = true;
let focusZoom = 0.66;

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
  if (T().sky === "space") {
    // 太空艙窗外：星空、慢慢轉的地球和月亮
    g.fillStyle = "#03050d"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 120; i++) { g.fillStyle = "#fff"; g.globalAlpha = 0.25 + (i % 6) / 8; g.fillRect((i * 73 + h * 3) % W, (i * 41) % H, 1.4, 1.4); }
    g.globalAlpha = 1; const ex = 60 + (h / 24) * 140;
    const gr = g.createRadialGradient(ex - 20, 160, 10, ex, 175, 80); gr.addColorStop(0, "#7ac8ff"); gr.addColorStop(0.75, "#2a5aa0"); gr.addColorStop(1, "#0a1a3a");
    g.fillStyle = gr; g.beginPath(); g.arc(ex, 190, 75, 0, 7); g.fill();
    g.fillStyle = "rgba(120,180,110,.85)"; g.beginPath(); g.ellipse(ex - 15, 150, 22, 10, 0.4, 0, 7); g.ellipse(ex + 25, 170, 14, 8, -0.3, 0, 7); g.fill();
    g.fillStyle = "#e8e4d8"; g.beginPath(); g.arc(200, 40, 12, 0, 7); g.fill();
    skyTex.needsUpdate = true; return;
  }
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
  if (T().rain) { g.fillStyle = "rgba(60,70,88,.5)"; g.fillRect(0, 0, W, H); }
  g.globalAlpha = 0.8 * (1 - e.dark * 0.8); g.fillStyle = lerpC("#ffffff", e.bot, 0.35);
  const drift = (h * 18) % 300;
  [[40, 90], [150, 60], [210, 100]].forEach(([x, y]) => { x = ((x + drift) % 300) - 30; g.beginPath(); g.ellipse(x, y, 26, 9, 0, 0, 7); g.ellipse(x + 14, y - 6, 16, 9, 0, 0, 7); g.fill(); });
  g.globalAlpha = 1;
  const land = LAND[T().sky];
  if (land) land(g, e, W, H, performance.now() / 1000);
  else {
  // 遠山與樹
  g.fillStyle = lerpC("#9cbf8a", "#1c2a44", e.dark);
  g.beginPath(); g.moveTo(0, 160); g.quadraticCurveTo(60, 120, 120, 150); g.quadraticCurveTo(190, 115, 256, 150); g.lineTo(256, 192); g.lineTo(0, 192); g.fill();
  g.fillStyle = lerpC("#6f9a62", "#15213a", e.dark);
  for (let i = 0; i < 8; i++) { const x = 10 + i * 34; g.beginPath(); g.moveTo(x, 192); g.lineTo(x + 10, 150 + (i % 3) * 8); g.lineTo(x + 20, 192); g.fill(); }
  // 遠方人家的燈
  if (e.dark > 0.3) { g.fillStyle = "#ffd27a"; g.globalAlpha = e.dark; [[60, 168], [150, 172], [205, 165]].forEach(([x, y]) => g.fillRect(x, y, 3, 3)); g.globalAlpha = 1; }
  }
  skyTex.needsUpdate = true;
}
// 各主題窗外的景色（天空、太陽月亮共用，這裡畫地面那一層）
function pine(g, x, base, h, col, snow) {
  g.fillStyle = col; for (let k = 0; k < 3; k++) { const w = h * (0.42 - k * 0.09), y = base - h * k * 0.28; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x, y - h * 0.5); g.lineTo(x + w, y); g.fill(); }
  if (snow) { g.fillStyle = snow; for (let k = 0; k < 3; k++) { const w = h * (0.2 - k * 0.04), y = base - h * k * 0.28 - h * 0.5 + h * 0.2; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x, y - h * 0.2); g.lineTo(x + w, y); g.fill(); } }
}
const LAND = {
  city: (g, e, W, H, t) => {
    const d = e.dark;
    let x = 0, i = 0; g.fillStyle = lerpC("#8a9bb0", "#1c2540", d);
    while (x < W) { const bw = 18 + (i * 7) % 16, bh = 50 + (i * 29) % 60; g.fillRect(x, H - bh - 10, bw, bh + 10); if (i % 4 === 1) g.fillRect(x + bw / 2 - 1, H - bh - 24, 2, 14); x += bw + 2; i++; }
    x = -6; i = 3;
    while (x < W) {
      const bw = 24 + (i * 11) % 20, bh = 30 + (i * 37) % 45;
      g.fillStyle = lerpC("#6f8098", "#121a2c", d); g.fillRect(x, H - bh, bw, bh);
      for (let wy = H - bh + 6; wy < H - 4; wy += 8) for (let wx = x + 4; wx < x + bw - 4; wx += 6) {
        const on = (wx * 7 + wy * 13 + i) % 5 < 3;
        g.fillStyle = on && d > 0.3 ? "rgba(255,214,130," + (0.4 + d * 0.6) + ")" : lerpC("#b8c6d4", "#1e2840", d); g.fillRect(wx, wy, 3, 4);
      }
      x += bw + 3; i++;
    }
    if (d > 0.3) { g.fillStyle = "#ff4a4a"; g.globalAlpha = (Math.sin(t * 3) + 1) / 2 * d; g.fillRect(60, H - 112, 3, 3); g.globalAlpha = 1; }
    if (T().rain) { g.strokeStyle = "rgba(200,220,255,.45)"; g.lineWidth = 1; const off = (t * 260) % H; for (let k = 0; k < 80; k++) { const rx = (k * 53) % W, ry = ((k * 97) % H + off) % H; g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - 3, ry + 12); g.stroke(); } }
  },
  sea: (g, e, W, H, t) => {
    const d = e.dark, hz = 118;
    const sea = g.createLinearGradient(0, hz, 0, H); sea.addColorStop(0, lerpC("#4aa0cc", "#16284a", d)); sea.addColorStop(1, lerpC("#2a7aa8", "#0c1830", d));
    g.fillStyle = sea; g.fillRect(0, hz, W, H - hz);
    g.strokeStyle = "rgba(255,255,255," + (0.55 - d * 0.3) + ")"; g.lineWidth = 1.5;
    for (let r = 0; r < 6; r++) { const y = hz + 8 + r * 9, ph = t * (0.8 + r * 0.2) + r; for (let k = 0; k < 5; k++) { const wx = ((k * 61 + r * 23 + ph * 12) % (W + 40)) - 20; g.beginPath(); g.moveTo(wx, y); g.quadraticCurveTo(wx + 6, y - 2, wx + 12, y); g.stroke(); } }
    const fx = 30 + ((t * 18) % 60); g.fillStyle = "rgba(255,255,255," + (0.8 - d * 0.4) + ")"; g.beginPath(); g.moveTo(0, 170); for (let k = 0; k <= 8; k++) g.quadraticCurveTo(k * 32 + 16, 166 + Math.sin(t * 1.5 + k) * 3, k * 32 + 32, 170); g.lineTo(W, 175); g.lineTo(0, 175); g.fill();
    g.fillStyle = lerpC("#f0d8a8", "#3a3448", d); g.beginPath(); g.moveTo(0, H); g.lineTo(0, 174); g.quadraticCurveTo(128, 168, 256, 178); g.lineTo(W, H); g.fill();
    // 椰子樹
    const pc = lerpC("#4a7a3a", "#0c1422", d), tc = lerpC("#8a6a4a", "#14141e", d);
    g.strokeStyle = tc; g.lineWidth = 5; g.beginPath(); g.moveTo(222, H); g.quadraticCurveTo(232, 140, 212, 100); g.stroke();
    g.fillStyle = pc; for (let k = 0; k < 6; k++) { const a = -Math.PI + k * Math.PI / 5 + Math.sin(t + k) * 0.05; g.beginPath(); g.moveTo(212, 100); g.quadraticCurveTo(212 + Math.cos(a) * 26, 100 + Math.sin(a) * 26 - 8, 212 + Math.cos(a) * 44, 108 + Math.sin(a) * 30); g.quadraticCurveTo(212 + Math.cos(a) * 22, 100 + Math.sin(a) * 20 + 4, 212, 100); g.fill(); }
    if (d < 0.5) { g.fillStyle = "#fff"; g.fillRect(70 + ((t * 4) % 120), hz - 9, 2, 9); g.beginPath(); g.moveTo(72 + ((t * 4) % 120), hz - 9); g.lineTo(80 + ((t * 4) % 120), hz - 2); g.lineTo(72 + ((t * 4) % 120), hz - 2); g.fill(); }
  },
  forest: (g, e, W, H, t) => {
    const d = e.dark;
    [["#7ea880", "#1a2a30", 120, 34, 13], ["#5e8a5e", "#121e24", 150, 46, 21], ["#3f6a44", "#0a141a", 182, 64, 29]].forEach(([a, b, base, h, step], L) => {
      for (let x = -10, k = 0; x < W + 20; x += step, k++) pine(g, x + (k % 2) * 4, base + (k % 3) * 4, h + (k * 7 % 3) * 8, lerpC(a, b, d));
      g.fillStyle = lerpC(a, b, d); g.fillRect(0, base, W, H - base);
    });
    if (d > 0.4) for (let k = 0; k < 18; k++) { const fx = (k * 47 + Math.sin(t * 0.7 + k) * 14 + 256) % W, fy = 110 + (k * 29) % 70 + Math.cos(t * 0.9 + k * 2) * 8; g.globalAlpha = d * (0.4 + 0.6 * Math.max(0, Math.sin(t * 2.2 + k * 1.7))); g.fillStyle = "#e8ff8a"; g.beginPath(); g.arc(fx, fy, 1.8, 0, 7); g.fill(); }
    g.globalAlpha = 1;
  },
  bamboo: (g, e, W, H, t) => {
    const d = e.dark;
    g.fillStyle = lerpC("#cfc8b0", "#2a2a30", d); g.fillRect(0, 168, W, H - 168);
    g.fillStyle = lerpC("#e8e2d0", "#3a3a40", d); for (let k = 0; k < 60; k++) g.fillRect((k * 41) % W, 170 + (k * 13) % 20, 2, 1);
    for (let k = 0; k < 14; k++) {
      const x = (k * 37 + (k % 3) * 9) % W, sw = 4 + (k % 3) * 2, sway = Math.sin(t * 0.8 + k) * 2;
      g.fillStyle = lerpC(k % 2 ? "#6a9a4a" : "#88b05a", "#14261e", d);
      g.beginPath(); g.moveTo(x, 172); g.lineTo(x + sway, 0); g.lineTo(x + sway + sw, 0); g.lineTo(x + sw, 172); g.fill();
      g.fillStyle = lerpC("#4a7a34", "#0c1a14", d); for (let y = 20 + (k * 13) % 30; y < 168; y += 34) g.fillRect(x + sway * (1 - y / 172) - 1, y, sw + 2, 2);
      g.fillStyle = lerpC("#5a8a3e", "#10201a", d); for (let y = 30 + (k * 17) % 40; y < 140; y += 46) { g.beginPath(); g.ellipse(x + sw + 8 + sway, y, 10, 3, 0.4, 0, 7); g.ellipse(x - 8 + sway, y + 10, 10, 3, -0.4, 0, 7); g.fill(); }
    }
    // 石燈籠
    g.fillStyle = lerpC("#9a968a", "#3a3a40", d); g.fillRect(186, 150, 8, 22); g.fillRect(178, 140, 24, 10); g.beginPath(); g.moveTo(174, 140); g.lineTo(190, 128); g.lineTo(206, 140); g.fill();
    if (d > 0.3) { g.fillStyle = "rgba(255,200,110," + d + ")"; g.fillRect(185, 142, 10, 6); }
  },
  snow: (g, e, W, H, t) => {
    const d = e.dark;
    g.fillStyle = lerpC("#b8c8d8", "#2a3450", d); g.beginPath(); g.moveTo(0, 150); g.lineTo(60, 80); g.lineTo(110, 140); g.lineTo(170, 70); g.lineTo(256, 150); g.lineTo(256, H); g.lineTo(0, H); g.fill();
    g.fillStyle = lerpC("#ffffff", "#c8d0e0", d); [[60, 80, 18], [170, 70, 22]].forEach(([x, y, w]) => { g.beginPath(); g.moveTo(x - w, y + w * 0.9); g.lineTo(x, y); g.lineTo(x + w, y + w * 0.9); g.lineTo(x + w * 0.4, y + w * 0.7); g.lineTo(x, y + w); g.lineTo(x - w * 0.4, y + w * 0.7); g.fill(); });
    g.fillStyle = lerpC("#f4f8fc", "#8a96b0", d); g.beginPath(); g.moveTo(0, H); g.lineTo(0, 165); g.quadraticCurveTo(128, 150, 256, 168); g.lineTo(W, H); g.fill();
    for (let k = 0; k < 9; k++) pine(g, 8 + k * 30 + (k % 2) * 6, 178 + (k % 3) * 4, 40 + (k % 3) * 10, lerpC("#2f5a44", "#0e1a20", d), lerpC("#ffffff", "#b0bccc", d));
    if (d > 0.3) { g.fillStyle = "rgba(255,210,130," + d + ")"; g.fillRect(120, 160, 4, 3); g.fillRect(127, 160, 4, 3); }
    g.fillStyle = "#fff";
    for (let k = 0; k < 70; k++) { const sp = 14 + (k % 5) * 6, fy = ((k * 37) % H + t * sp) % H, fx = ((k * 59) % W + Math.sin(t + k) * 6 + W) % W; g.globalAlpha = 0.6 + (k % 3) * 0.13; g.beginPath(); g.arc(fx, fy, 0.8 + (k % 3) * 0.5, 0, 7); g.fill(); }
    g.globalAlpha = 1;
  }
};
function applyEnv(e) {
  hemi.intensity = e.hemi;
  sunLight.intensity = e.sun; sunLight.color.set(e.sunC);
  // 太陽從窗戶那邊慢慢移動，影子跟著轉
  const k = Math.max(0, Math.min(1, (e.h - 6) / 12.5));
  sunLight.position.set(-6 + k * 12, 3 + Math.sin(Math.PI * k) * 5, -9);
  fillLight.intensity = e.fill;
  const space = T().sky === "space";
  beam.material.opacity = space ? 0 : e.beam; beam.material.color.set(e.beamC);
  scene.background.set(space ? "#05070f" : lerpC(e.bot, e.top, 0.35));
  if (!scene.fog) scene.fog = new THREE.Fog(0xffffff, 40, 80);
  scene.fog.color.copy(scene.background);
  if (space) { sunLight.color.set("#cfe0ff"); }
  renderer.toneMappingExposure = e.exp;
  drawSky(e);
}
function timeKind() { return env.dark > 0.6 ? "night" : "day"; }

/* ===== 房間主題 =====
   同一個格局（座位、走道、家具位置不變，角色走路才不會卡住），
   換掉地板、牆面、家具配色，再加上各主題自己的裝飾。 */
let THEME = "home", REMAP = null;
function canvasTex(w, h, draw, rx, ry) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  if (rx) t.repeat.set(rx, ry || 1);
  return t;
}
function speckle(g, w, h, n, col, a) { g.fillStyle = col; for (let i = 0; i < n; i++) { g.globalAlpha = a * (0.4 + ((i * 37) % 10) / 10); g.fillRect((i * 97.3) % w, (i * 53.7) % h, 2, 2); } g.globalAlpha = 1; }
const TEX = {
  brick: () => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#6e4a3a"; g.fillRect(0, 0, w, h);
    const bh = 32, bw = 96;
    for (let r = 0; r < h / bh; r++) for (let k = -1; k < w / bw + 1; k++) {
      const x = k * bw + (r % 2 ? bw / 2 : 0), sh = (Math.sin(r * 7.1 + k * 3.3) + 1) / 2;
      g.fillStyle = "rgb(" + Math.round(150 + sh * 40) + "," + Math.round(80 + sh * 22) + "," + Math.round(58 + sh * 14) + ")";
      g.fillRect(x + 3, r * bh + 3, bw - 6, bh - 6);
    }
    speckle(g, w, h, 900, "#2a1a14", 0.25);
  }, 4, 1.6),
  paint: (base, dot) => canvasTex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); speckle(g, w, h, 500, dot, 0.08); }, 2, 1),
  vinyl: (a, b) => canvasTex(512, 512, (g, w, h) => {
    const s = 64; for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) { g.fillStyle = ((x + y) / s) % 2 ? a : b; g.fillRect(x, y, s, s); }
    g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = 2; for (let i = 0; i <= w; i += s) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
    speckle(g, w, h, 700, "#000", 0.06);
  }, 3.2, 2.7),
  carpet: () => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#2f5a48"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#3d6e58"; g.lineWidth = 3;
    for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x + 32, y + 8); g.lineTo(x + 56, y + 32); g.lineTo(x + 32, y + 56); g.lineTo(x + 8, y + 32); g.closePath(); g.stroke(); }
    g.fillStyle = "#c9a45a"; for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) g.fillRect(x + 30, y + 30, 4, 4);
    speckle(g, w, h, 1500, "#10261c", 0.15);
  }, 3.2, 2.7),
  panel: () => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#dfe4ea"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#a9b3bf"; g.lineWidth = 3; for (let x = 0; x <= w; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.beginPath(); g.moveTo(0, 170); g.lineTo(w, 170); g.moveTo(0, 340); g.lineTo(w, 340); g.stroke();
    g.fillStyle = "#9aa4b0"; for (let x = 0; x < w; x += 128) [12, 158, 182, 328, 352, 500].forEach((y) => { g.beginPath(); g.arc(x + 10, y, 3, 0, 7); g.arc(x + 118, y, 3, 0, 7); g.fill(); });
    g.fillStyle = "rgba(90,200,255,.35)"; g.fillRect(0, 252, w, 6);
  }, 3, 1),
  grid: () => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#3a4250"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#566174"; g.lineWidth = 2; for (let i = 0; i <= w; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
    g.fillStyle = "#4a5466"; for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) for (let k = 0; k < 4; k++) g.fillRect(x + 12 + k * 12, y + 28, 6, 6);
  }, 3.2, 2.7),
  school: () => canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = "#f1e7cf"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#7d9a86"; g.fillRect(0, h * 0.72, w, h * 0.28);       // 下半部油漆牆裙
    g.fillStyle = "#5c7766"; g.fillRect(0, h * 0.71, w, 8);
    speckle(g, w, h, 400, "#000", 0.05);
  }, 3, 1),
  books: (dark) => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = dark; g.fillRect(0, 0, w, h);
    const cols = ["#7a2a2a", "#2f4a6a", "#3f6a4a", "#8a6a2a", "#5a3a5a", "#a0522d", "#2a5a5a", "#6a2a3a", "#c9a45a"];
    for (let r = 0; r < 4; r++) {
      const y0 = r * 128 + 14; let x = 6, k = r * 3;
      while (x < w - 10) { const bw = 10 + ((k * 7) % 4) * 3, bh = 92 + ((k * 13) % 5) * 5; g.fillStyle = cols[k % cols.length]; g.fillRect(x, y0 + 100 - bh, bw, bh); g.fillStyle = "rgba(255,230,160,.5)"; g.fillRect(x + 2, y0 + 100 - bh + 12, bw - 4, 3); x += bw + 1; k++; }
      g.fillStyle = "#3a2216"; g.fillRect(0, y0 + 100, w, 14);
    }
  }, 1, 1),
  wood: (a, b, n) => { const t = woodTexture(a, b, n || 8, false, 512, 512); t.repeat.set(3.2, 2.7); return t; },
  // 便利商店：白牆加三色招牌條
  stripe: (base, bands) => canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); speckle(g, w, h, 300, "#90a0b0", 0.06);
    bands.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, h * 0.62 + i * 14, w, 10); });
  }, 3, 1),
  // 榻榻米：草蓆紋路加深色布邊
  tatami: () => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#c9c08a"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) { g.fillStyle = y % 6 ? "rgba(120,110,60,.10)" : "rgba(255,250,200,.10)"; g.fillRect(0, y, w, 2); }
    g.fillStyle = "#3a3a2a"; [[0, 0, w, 10], [0, h / 2 - 5, w, 10], [0, 0, 10, h], [w / 2 - 5, 0, 10, h / 2], [w - 10, 0, 10, h]].forEach((r) => g.fillRect(...r));
    speckle(g, w, h, 800, "#6a6030", 0.12);
  }, 3.2, 2.7),
  // 和室牆：米色土牆加木柱
  shoji: () => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#e8dcc0"; g.fillRect(0, 0, w, h); speckle(g, w, h, 1400, "#a08a60", 0.12);
    g.fillStyle = "#5a4030"; for (let x = 0; x < w; x += 256) g.fillRect(x, 0, 18, h);
    g.fillRect(0, h * 0.2, w, 12); g.fillRect(0, h - 26, w, 26);
  }, 3, 1),
  // 原木牆：一根根橫放的圓木
  logs: (base) => canvasTex(512, 512, (g, w, h) => {
    const n = 8, lh = h / n;
    for (let i = 0; i < n; i++) {
      const gr = g.createLinearGradient(0, i * lh, 0, (i + 1) * lh);
      gr.addColorStop(0, lerpC(base, "#000000", 0.35)); gr.addColorStop(0.3, lerpC(base, "#ffffff", 0.12)); gr.addColorStop(0.75, base); gr.addColorStop(1, lerpC(base, "#000000", 0.45));
      g.fillStyle = gr; g.fillRect(0, i * lh, w, lh);
      g.strokeStyle = lerpC(base, "#000000", 0.25); g.lineWidth = 1.5; for (let k = 0; k < 5; k++) { g.beginPath(); const y = i * lh + 8 + ((k * 17 + i * 5) % (lh - 16)); g.moveTo((k * 131 + i * 47) % w, y); g.lineTo(((k * 131 + i * 47) % w) + 60 + k * 9, y + 1); g.stroke(); }
    }
    speckle(g, w, h, 600, "#2a1a10", 0.15);
  }, 2.5, 1.6),
  // 頂樓水泥：灰色板塊和縫
  concrete: (base, s) => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); speckle(g, w, h, 2500, "#000", 0.08); speckle(g, w, h, 900, "#fff", 0.05);
    g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 3; for (let i = 0; i <= w; i += s) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
  }, 3.2, 2.7)
};
// 每個主題：地板、牆、家具換色（舊色 → 新色）、窗外、火的顏色、要不要每張桌子都有隔板
const THEMES = {
  home: {},
  cafe: {
    rug: ["#6e4a34", "#e8d3b0", "#a0603a"],
    floor: () => TEX.wood("#7a5038", "#3a2214", 10), wall: () => TEX.brick(),
    remap: { "#8a5a38": "#4a2f22", "#7a4a2a": "#3a2418", "#a06a42": "#5a3a28", "#b07a4f": "#6e4a34", "#9a6640": "#553524", "#c26f5e": "#3f5f4a", "#d27d6b": "#4f7058", "#c9746a": "#2f4a3c", "#b5655c": "#263d31", "#e0b04f": "#d9a050" },
    bg: "#2a1c16", decor: cafeDecor
  },
  library: {
    rug: ["#7a2a2a", "#c9a45a", "#5a1e1e"],
    floor: () => TEX.carpet(), wall: () => TEX.wood("#5a3a26", "#2a180e", 14),
    remap: { "#8a5a38": "#5a3424", "#7a4a2a": "#432418", "#a06a42": "#6a3a26", "#b07a4f": "#7a4a32", "#9a6640": "#5e3626", "#c26f5e": "#7a2a2a", "#d27d6b": "#8e3a34", "#c9746a": "#2f4a3c", "#b5655c": "#263d31", "#e0b04f": "#2f7a52", "#d9a77e": "#7a2a2a" },
    bg: "#24160e", decor: libraryDecor
  },
  study: {
    rug: null,
    floor: () => TEX.vinyl("#c9ccd0", "#bfc3c8"), wall: () => TEX.paint("#eef0f2", "#90a0b0"),
    remap: { "#8a5a38": "#8e96a0", "#7a4a2a": "#6e7884", "#a06a42": "#b9bfc7", "#b07a4f": "#e2dccf", "#9a6640": "#c8c2b4", "#5a3a22": "#4a525c", "#c26f5e": "#7c8ea0", "#d27d6b": "#8fa0b2", "#c9746a": "#c9d2da", "#b5655c": "#b4bec8", "#b4a08c": "#c9ccd0", "#d9a77e": "#9aa6b2" },
    allBooth: true, bg: "#5a6470", decor: studyDecor
  },
  space: {
    rug: ["#1a2440", "#4ad8ff", "#2f4a7a"],
    floor: () => TEX.grid(), wall: () => TEX.panel(),
    remap: { "#8a5a38": "#9aa4b0", "#7a4a2a": "#6c7684", "#a06a42": "#c9d0d8", "#b07a4f": "#e8ecf0", "#9a6640": "#b0b8c2", "#5a3a22": "#3e4654", "#6b4a32": "#4a5262", "#c26f5e": "#2f4a7a", "#d27d6b": "#3d5c90", "#c9746a": "#2a3550", "#b5655c": "#222c44", "#b4a08c": "#8a94a2", "#9c8b7a": "#6c7684", "#d9a77e": "#4a5a7a", "#c98f6a": "#9aa4b0" },
    sky: "space", fire: [0x4ad8ff, 0x8ae8ff, 0xd8f8ff], bg: "#0b1020", decor: spaceDecor
  },
  school: {
    rug: null,
    floor: () => TEX.wood("#d4a874", "#8a5a38", 12), wall: () => TEX.school(),
    remap: { "#b07a4f": "#d9b98a", "#9a6640": "#c9a878", "#8a5a38": "#6b7a88", "#a06a42": "#3f6fa0", "#7a4a2a": "#56636f", "#c26f5e": "#d98c4a", "#d27d6b": "#e3a060", "#c9746a": "#e8d8a8", "#b5655c": "#d8c898" },
    bg: "#8a7050", decor: schoolDecor
  },
  konbini: {
    rug: null, sky: "city", rain: true, skyAnim: true,
    floor: () => TEX.vinyl("#eceef0", "#e1e4e7"), wall: () => TEX.stripe("#f4f6f7", ["#2f9a6a", "#f08a3c", "#3a78c8"]),
    remap: { "#8a5a38": "#9aa2ab", "#7a4a2a": "#7d8792", "#a06a42": "#e8ecef", "#b07a4f": "#dfe3e6", "#9a6640": "#c4cad0", "#5a3a22": "#4a525c", "#c26f5e": "#2f9a6a", "#d27d6b": "#43b07e", "#c9746a": "#e6eef2", "#b5655c": "#cfd8de", "#b4a08c": "#a8b0b8", "#9c8b7a": "#8a929a", "#d9a77e": "#f08a3c", "#e0b04f": "#f6c445", "#6b4a32": "#7d8792" },
    bg: "#1e2632", decor: konbiniDecor
  },
  washitsu: {
    rug: null, sky: "bamboo", skyAnim: true,
    floor: () => TEX.tatami(), wall: () => TEX.shoji(),
    remap: { "#8a5a38": "#5a4030", "#7a4a2a": "#4a3426", "#a06a42": "#8a6a4a", "#b07a4f": "#a8835a", "#9a6640": "#7a5a3e", "#c26f5e": "#5e6e4a", "#d27d6b": "#7a8a5a", "#c9746a": "#f1ead8", "#b5655c": "#d8ccb0", "#b4a08c": "#8a8478", "#9c8b7a": "#6e6a60", "#e0b04f": "#f1ead8", "#d9a77e": "#a8b47a" },
    bg: "#2a2218", decor: washitsuDecor
  },
  cabin: {
    rug: ["#5a3a26", "#c9a45a", "#3f6a3a"], sky: "forest", skyAnim: true,
    floor: () => TEX.wood("#8a5a3a", "#4a2a18", 8), wall: () => TEX.logs("#9a6a42"),
    remap: { "#c26f5e": "#a83a2e", "#d27d6b": "#c25a44", "#c9746a": "#3f6a3a", "#b5655c": "#2f5230", "#d9a77e": "#8a6a4a" },
    bg: "#1e2416", decor: cabinDecor
  },
  beach: {
    rug: ["#7ac4c4", "#f6f2e8", "#f2a65a"], sky: "sea", skyAnim: true,
    floor: () => TEX.wood("#d8b88a", "#a07a50", 10), wall: () => { const t = woodTexture("#eef4f4", "#b8ccd0", 12, false, 512, 512); t.repeat.set(2.5, 1); return t; },
    remap: { "#8a5a38": "#e8eef0", "#7a4a2a": "#c8d4d8", "#a06a42": "#d8c8a8", "#b07a4f": "#e2cfa8", "#9a6640": "#c9b48a", "#5a3a22": "#7a6a50", "#c26f5e": "#3a8ab0", "#d27d6b": "#f2f0e6", "#c9746a": "#f6f2e8", "#b5655c": "#e6e0d0", "#e0b04f": "#f2a65a", "#d9a77e": "#7ac4c4", "#b4a08c": "#e0d6c4", "#9c8b7a": "#c4b8a4" },
    bg: "#3a6a8a", decor: beachDecor
  },
  rooftop: {
    rug: ["#2e3236", "#f2a65a", "#c94a6a"], sky: "city", skyAnim: true,
    floor: () => TEX.concrete("#8a8e94", 128), wall: () => { const t = TEX.concrete("#6e7278", 256); t.repeat.set(2.5, 1); return t; },
    remap: { "#8a5a38": "#3a3e44", "#7a4a2a": "#2e3236", "#a06a42": "#b08a5a", "#b07a4f": "#c49a68", "#9a6640": "#9a7a52", "#c26f5e": "#e8d8b8", "#d27d6b": "#f2a65a", "#c9746a": "#3a3e44", "#b5655c": "#2e3236", "#b4a08c": "#6a6e74", "#9c8b7a": "#4a4e54", "#d9a77e": "#c94a6a" },
    bg: "#1c2030", decor: rooftopDecor
  },
  lodge: {
    rug: ["#b0302a", "#f2ece0", "#2f5a44"], sky: "snow", skyAnim: true,
    floor: () => TEX.wood("#a8784a", "#5a3a20", 8), wall: () => TEX.logs("#b08458"),
    remap: { "#c26f5e": "#b0302a", "#d27d6b": "#e8e2d6", "#c9746a": "#a8302a", "#b5655c": "#7a2420", "#8fae7a": "#2f5a44", "#9cbf7a": "#3f6a54", "#e0b04f": "#e8e2d6" },
    bg: "#3a4458", decor: lodgeDecor
  }
};
function T() { return THEMES[THEME] || THEMES.home; }
function signTex(lines, opt) {
  opt = opt || {};
  return canvasTex(opt.w || 256, opt.h || 128, (g, w, h) => {
    g.fillStyle = opt.bg || "#2f3a34"; g.fillRect(0, 0, w, h);
    g.textAlign = "center"; g.textBaseline = "middle";
    lines.forEach((l, i) => { g.fillStyle = l.c || opt.fg || "#f3efe6"; g.font = (l.b ? "bold " : "") + (l.s || 22) + "px sans-serif"; if (opt.glow) { g.shadowColor = l.c || opt.fg; g.shadowBlur = 14; } g.fillText(l.t, w / 2, l.y != null ? l.y : (h / (lines.length + 1)) * (i + 1)); });
  });
}
function wallPlane(tex, w, h, x, y, z, side, basic) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: !!basic.t }) : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
  m.position.set(x, y, z); if (side === "left") m.rotation.y = Math.PI / 2; scene.add(m); return m;
}
function glowBulb(x, y, z, col, s) {
  const b = sph(0.045, new THREE.MeshBasicMaterial({ color: col }), x, y, z, scene, 8, 6); b.castShadow = false;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: col, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
  sp.scale.setScalar(s || 0.35); sp.position.set(x, y, z); scene.add(sp); bulbs.push({ sp, phase: x * 2 + z });
}
// 鏡頭看得到的牆面：後牆 x -2.15~-1.0 的中段、吧台上方的菜單板位置（主題房間蓋掉它），左牆電視上方 z 0.9~2.9
const SPOT_BACK = { x: -1.58, y: 1.62 }, SPOT_SNACK = { x: 2.55, y: 1.85 }, SPOT_LEFT = { z: 2.0, y: 1.98 };
function framed(tex, w, h, x, y, z, side, fc) {
  if (side === "left") { box(0.05, h + 0.1, w + 0.1, fc || "#3a2418", x + 0.01, y, z, scene); return wallPlane(tex, w, h, x + 0.04, y, z, "left"); }
  box(w + 0.1, h + 0.1, 0.05, fc || "#3a2418", x, y, z + 0.01, scene); return wallPlane(tex, w, h, x, y, z + 0.04, "back");
}
// 咖啡廳：霓虹招牌、手寫菜單牆、垂吊的愛迪生燈泡
function cafeDecor() {
  wallPlane(signTex([{ t: "COFFEE", s: 50, b: 1, c: "#ff9ec0" }, { t: "☕ & STUDY", s: 26, c: "#ffe08a" }], { bg: "#1a1210", glow: 1, w: 256, h: 160 }), 1.05, 0.66, SPOT_BACK.x, SPOT_BACK.y, -3.96, "back", {});
  const neon = new THREE.PointLight(0xff8fb8, 1.4, 3.5, 1.6); neon.position.set(SPOT_BACK.x, 2.2, -3.4); scene.add(neon);
  framed(signTex([{ t: "MENU", s: 30, b: 1 }, { t: "美式咖啡 ……… 60", s: 18 }, { t: "拿鐵 ………… 80", s: 18 }, { t: "焦糖瑪奇朵 … 95", s: 18 }, { t: "抹茶歐蕾 …… 85", s: 18 }, { t: "今日蛋糕 …… 70", s: 18, c: "#ffe08a" }], { w: 300, h: 160 }), 1.8, 0.78, -4.99, SPOT_LEFT.y, SPOT_LEFT.z, "left");
  wallPlane(signTex([{ t: "OPEN", s: 40, b: 1, c: "#7cffb2" }, { t: "每天 7:00 – 23:00", s: 16 }], { bg: "#1a1210", glow: 1, w: 256, h: 128 }), 0.6, 0.3, 4.3, 2.3, -3.97, "back", {});
  [[-1.7, 0.2], [0.9, -0.9], [3.2, 1.4], [-0.6, 3.0], [2.2, 3.9], [4.6, -1.0]].forEach(([x, z]) => { box(0.008, 1.7, 0.008, "#1a1210", x, 3.45, z, scene); glowBulb(x, 2.58, z, 0xffb060, 0.42); });
}
// 圖書館：書牆、地球儀、梯子、安靜標示
function libraryDecor() {
  const b1 = framed(TEX.books("#3a2216"), 1.05, 2.4, SPOT_BACK.x, 1.42, -3.99, "back", "#432418"); b1.material.map.repeat.set(0.5, 1.2);
  const b2 = framed(TEX.books("#3a2216"), 1.8, 0.78, -4.99, SPOT_LEFT.y, SPOT_LEFT.z, "left", "#432418"); b2.material.map.repeat.set(1, 0.5);
  const ld = new THREE.Group(); ld.position.set(-2.2, 0, -3.62); ld.rotation.x = -0.12; scene.add(ld);
  [-0.2, 0.2].forEach((x) => box(0.05, 2.5, 0.05, "#6a3a26", x, 1.25, 0, ld)); for (let i = 0; i < 6; i++) box(0.44, 0.04, 0.04, "#6a3a26", 0, 0.3 + i * 0.38, 0, ld);
  const gb = new THREE.Group(); gb.position.set(4.3, 2.03, -3.72); scene.add(gb);
  cyl(0.12, 0.15, 0.04, "#432418", 0, 0.02, 0, gb); cyl(0.02, 0.02, 0.2, "#432418", 0, 0.12, 0, gb, 6);
  const ge = sph(0.22, "#3d6e9a", 0, 0.42, 0, gb, 20, 14); ge.rotation.z = 0.4;
  sph(0.11, "#7a9a52", 0.12, 0.47, 0.11, gb, 10, 8).scale.set(1, 0.6, 0.6); sph(0.08, "#7a9a52", -0.1, 0.36, 0.15, gb, 10, 8).scale.set(1, 0.7, 0.5);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.012, 6, 32), mat("#c9a45a")); ring.position.y = 0.42; gb.add(ring); plants.push(gb);
  framed(signTex([{ t: "請保持安靜", s: 30, b: 1 }, { t: "SILENCE PLEASE", s: 16 }], { bg: "#2a180e", fg: "#e8d3a0", w: 256, h: 110 }), 0.9, 0.39, SPOT_SNACK.x, SPOT_SNACK.y, -3.94, "back", "#c9a45a");
  const warm = new THREE.PointLight(0xffc070, 0.7, 5, 1.6); warm.position.set(-1.6, 2.6, -3.2); scene.add(warm);
}
// 自習室：日光燈、大時鐘、公告欄、安靜標示
function studyDecor() {
  [[-1.0, 0.4], [2.4, 0.4], [-1.0, 3.6], [2.4, 3.6], [5.0, 1.8]].forEach(([x, z]) => {
    [-0.5, 0.5].forEach((d) => box(0.006, 1.3, 0.006, "#8e96a0", x + d, 3.4, z, scene));
    box(1.3, 0.06, 0.32, "#d8dde2", x, 2.75, z, scene).castShadow = false;
    const tube = box(1.2, 0.02, 0.24, new THREE.MeshBasicMaterial({ color: 0xf4fbff }), x, 2.715, z, scene); tube.castShadow = false;
  });
  const cool = new THREE.PointLight(0xe8f4ff, 1.4, 12, 1.2); cool.position.set(1.5, 2.8, 1.7); scene.add(cool);
  const cg = new THREE.Group(); cg.position.set(SPOT_BACK.x, SPOT_BACK.y + 0.1, -3.94); scene.add(cg);
  cyl(0.4, 0.4, 0.06, "#2a2f38", 0, 0, 0, cg, 32).rotation.x = Math.PI / 2;
  cyl(0.36, 0.36, 0.07, "#ffffff", 0, 0, 0.01, cg, 32).rotation.x = Math.PI / 2;
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; box(0.025, 0.07, 0.01, "#2a2f38", Math.sin(a) * 0.3, Math.cos(a) * 0.3, 0.05, cg).rotation.z = -a; }
  box(0.025, 0.24, 0.01, "#2a2f38", 0, 0.11, 0.06, cg); box(0.03, 0.16, 0.01, "#2a2f38", 0.06, -0.04, 0.06, cg).rotation.z = 2.2;
  box(0.05, 0.85, 1.9, "#b48a5a", -4.99, SPOT_LEFT.y, SPOT_LEFT.z, scene);
  [["#fff8dc", -0.6, 0.15, 0.1], ["#ffe08a", 0.05, -0.2, -0.08], ["#cfe8ff", 0.65, 0.18, 0.05], ["#ffd0d6", -0.3, -0.25, 0.12], ["#ffffff", 0.45, -0.22, -0.1]].forEach(([c, dz, dy, r]) => box(0.01, 0.3, 0.3, c, -4.955, SPOT_LEFT.y + dy * 0.7, SPOT_LEFT.z + dz, scene).rotation.x = r);
  framed(signTex([{ t: "請保持安靜", s: 30, b: 1 }, { t: "QUIET ZONE", s: 16 }], { bg: "#3f6fa0", w: 256, h: 110 }), 0.9, 0.39, SPOT_SNACK.x, SPOT_SNACK.y, -3.94, "back", "#d8dde2");
}
// 太空艙：圓窗看星空和地球、霓虹燈條、螢幕
function spaceDecor() {
  const stars = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#050814"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { g.fillStyle = "#fff"; g.globalAlpha = 0.3 + (i % 7) / 10; g.fillRect((i * 97) % w, (i * 61) % h, 1.5, 1.5); }
    g.globalAlpha = 1; const gr = g.createRadialGradient(170, 200, 10, 170, 200, 90); gr.addColorStop(0, "#5ab0ff"); gr.addColorStop(0.7, "#2a5aa0"); gr.addColorStop(1, "rgba(40,80,160,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(170, 200, 90, 0, 7); g.fill(); g.fillStyle = "#6aa86a"; g.beginPath(); g.ellipse(150, 180, 26, 14, 0.4, 0, 7); g.fill();
  });
  [1.45, 2.55].forEach((z, i) => {
    const pw = new THREE.Mesh(new THREE.CircleGeometry(0.36, 40), new THREE.MeshBasicMaterial({ map: stars })); pw.rotation.y = Math.PI / 2; pw.position.set(-4.96, SPOT_LEFT.y, z); if (i) pw.rotation.x = 1.4; scene.add(pw);
    const fr = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.06, 10, 40), mat("#9aa4b0", { metalness: 0.6, roughness: 0.3 })); fr.rotation.y = Math.PI / 2; fr.position.set(-4.95, SPOT_LEFT.y, z); scene.add(fr);
  });
  const neonM = new THREE.MeshBasicMaterial({ color: 0x4ad8ff });
  [[12.8, 0.04, 0.04, 1.4, 0.2, -3.95], [0.04, 0.04, 11, -4.95, 0.2, 1.5], [12.8, 0.04, 0.04, 1.4, 3.0, -3.93], [0.04, 0.04, 11, -4.93, 3.0, 1.5]].forEach(([w, h, d, x, y, z]) => { box(w, h, d, neonM, x, y, z, scene).castShadow = false; });
  const bl = new THREE.PointLight(0x4ad8ff, 1.0, 8, 1.4); bl.position.set(1.5, 2.8, -3.0); scene.add(bl);
  const scr = canvasTex(256, 160, (g, w, h) => { g.fillStyle = "#06121e"; g.fillRect(0, 0, w, h); g.strokeStyle = "#4ad8ff"; g.lineWidth = 2; g.beginPath(); for (let x = 0; x < w; x += 4) g.lineTo(x, 100 + Math.sin(x / 12) * 22); g.stroke(); g.fillStyle = "#7cffb2"; g.font = "bold 18px monospace"; g.fillText("O2 98%", 12, 28); g.fillText("FOCUS MODE ON", 12, 52); g.fillStyle = "#ffd84a"; g.fillText("ORBIT 421 km", 12, 150); });
  framed(scr, 1.05, 0.7, SPOT_BACK.x, SPOT_BACK.y, -3.99, "back", "#9aa4b0");
  framed(signTex([{ t: "🚀 KAIDA-1", s: 34, b: 1, c: "#4ad8ff" }], { bg: "#0b1020", glow: 1, w: 256, h: 90 }), 1.05, 0.37, SPOT_SNACK.x, SPOT_SNACK.y, -3.94, "back", "#9aa4b0");
}
// 學校：大黑板、時鐘、三角旗、班牌
function schoolDecor() {
  const today = new Date();
  const bt = signTex([{ t: (today.getMonth() + 1) + " 月 " + today.getDate() + " 日", s: 24, y: 34 }, { t: "今天的目標：專心讀書！", s: 36, b: 1, y: 110, c: "#fff8dc" }, { t: "值日生：小熊、Mia", s: 22, y: 180, c: "#ffd0d6" }, { t: "加油 ✿", s: 24, y: 226, c: "#ffe08a" }], { bg: "#2f5a46", w: 512, h: 256 });
  framed(bt, 1.9, 0.8, -4.99, SPOT_LEFT.y, SPOT_LEFT.z, "left", "#8a6a3a");
  box(0.16, 0.05, 1.9, "#8a6a3a", -4.88, SPOT_LEFT.y - 0.45, SPOT_LEFT.z, scene);
  [[1.4, "#f3efe6"], [1.55, "#ffe08a"], [2.6, "#ffd0d6"]].forEach(([z, c]) => box(0.05, 0.04, 0.12, c, -4.84, SPOT_LEFT.y - 0.4, z, scene));
  const cg = new THREE.Group(); cg.position.set(SPOT_BACK.x, SPOT_BACK.y + 0.1, -3.94); scene.add(cg);
  cyl(0.32, 0.32, 0.05, "#c2453b", 0, 0, 0, cg, 28).rotation.x = Math.PI / 2; cyl(0.28, 0.28, 0.06, "#ffffff", 0, 0, 0.01, cg, 28).rotation.x = Math.PI / 2;
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; box(0.02, 0.05, 0.01, "#2a2620", Math.sin(a) * 0.23, Math.cos(a) * 0.23, 0.05, cg).rotation.z = -a; }
  box(0.02, 0.18, 0.01, "#2a2620", 0, 0.08, 0.05, cg); box(0.025, 0.12, 0.01, "#2a2620", 0.05, -0.02, 0.05, cg).rotation.z = 1.9;
  const cols = ["#c2453b", "#e0b04f", "#5d7fa8", "#8fae7a", "#e7a6a8"];
  for (let i = 0; i < 15; i++) {
    const x = -4.5 + i * 0.68, y = 2.95 - Math.sin(i / 14 * Math.PI) * 0.2;
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.28, 3), mat(cols[i % cols.length])); f.rotation.z = Math.PI; f.position.set(x, y - 0.14, -3.9); scene.add(f);
  }
  framed(signTex([{ t: "三年二班", s: 36, b: 1 }], { bg: "#f8f4ec", fg: "#2a2620", w: 256, h: 90 }), 1.0, 0.35, SPOT_SNACK.x, SPOT_SNACK.y, -3.94, "back", "#8a6a3a");
}

function tubeLights(list, col) {
  list.forEach(([x, z]) => {
    [-0.5, 0.5].forEach((d) => box(0.006, 1.3, 0.006, "#8e96a1", x + d, 3.4, z, scene));
    box(1.3, 0.06, 0.32, "#d8dde3", x, 2.75, z, scene).castShadow = false;
    box(1.2, 0.02, 0.24, new THREE.MeshBasicMaterial({ color: col || 0xf4fbff }), x, 2.715, z, scene).castShadow = false;
  });
}
function hangLantern(x, y, z, body, glowC, s) {
  box(0.008, 3.3 - y, 0.008, "#2a2620", x, (3.3 + y) / 2 + 0.1, z, scene);
  const l = sph(0.16 * (s || 1), new THREE.MeshStandardMaterial({ color: body, emissive: body, emissiveIntensity: 0.55, roughness: 0.9 }), x, y, z, scene, 16, 12); l.scale.y = 1.25; l.castShadow = false;
  cyl(0.07 * (s || 1), 0.07 * (s || 1), 0.04, "#2a2620", x, y + 0.2 * (s || 1), z, scene, 10); cyl(0.07 * (s || 1), 0.07 * (s || 1), 0.04, "#2a2620", x, y - 0.2 * (s || 1), z, scene, 10);
  glowBulb(x, y, z, glowC, 0.7 * (s || 1));
}
// 深夜便利商店：發光飲料櫃、日光燈、招牌、特價海報
function konbiniDecor() {
  tubeLights([[-1.0, 0.4], [2.4, 0.4], [-1.0, 3.6], [2.4, 3.6], [5.0, 1.8]]);
  const cool = new THREE.PointLight(0xeef6ff, 1.6, 12, 1.2); cool.position.set(1.5, 2.8, 1.7); scene.add(cool);
  const fr = new THREE.Group(); fr.position.set(SPOT_BACK.x, 0, -3.82); scene.add(fr);
  box(1.12, 2.3, 0.34, "#dfe4e9", 0, 1.15, 0, fr);
  box(1.0, 2.0, 0.02, new THREE.MeshBasicMaterial({ color: 0xd8f0ff }), 0, 1.1, 0.06, fr).castShadow = false;
  const bc = ["#e8473a", "#3a8ad8", "#f6c445", "#43b07e", "#f08a3c", "#e86aa0", "#ffffff"];
  [0.35, 0.82, 1.29, 1.76].forEach((y, r) => { box(1.0, 0.02, 0.2, "#c4cad0", 0, y - 0.11, 0.08, fr); for (let k = 0; k < 8; k++) cyl(0.04, 0.04, 0.18 + (k % 2) * 0.04, new THREE.MeshBasicMaterial({ color: bc[(k + r * 3) % 7] }), -0.42 + k * 0.12, y, 0.1, fr, 8); });
  box(1.02, 2.02, 0.01, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, roughness: 0.05 }), 0, 1.1, 0.19, fr).castShadow = false;
  box(1.12, 0.14, 0.02, new THREE.MeshBasicMaterial({ color: 0x2f9a6a }), 0, 2.22, 0.18, fr);
  const fl = new THREE.PointLight(0xcfeaff, 0.9, 3, 1.6); fl.position.set(SPOT_BACK.x, 1.2, -3.2); scene.add(fl);
  wallPlane(signTex([{ t: "KAIDA MART", s: 40, b: 1, c: "#ffffff" }, { t: "24H · 讀書補給站", s: 20, c: "#ffe08a" }], { bg: "#2f9a6a", w: 256, h: 128 }), 0.9, 0.45, SPOT_SNACK.x, SPOT_SNACK.y, -3.93, "back", {});
  framed(signTex([{ t: "本日特價", s: 34, b: 1, c: "#e8473a" }, { t: "關東煮 ……… 2 串 50", s: 18, c: "#2a2620" }, { t: "飯糰 ………… 第二件 6 折", s: 18, c: "#2a2620" }, { t: "熱拿鐵 ……… 45", s: 18, c: "#2a2620" }, { t: "考生加油 ✿", s: 20, c: "#f08a3c" }], { bg: "#fff8dc", w: 300, h: 160 }), 1.8, 0.78, -4.99, SPOT_LEFT.y, SPOT_LEFT.z, "left", "#f08a3c");
}
// 日式和室：掛軸、紙拉門、燈籠
function washitsuDecor() {
  const scroll = canvasTex(128, 320, (g, w, h) => {
    g.fillStyle = "#4a6a5a"; g.fillRect(0, 0, w, h); g.fillStyle = "#f4ecd8"; g.fillRect(12, 30, w - 24, h - 60);
    g.fillStyle = "#1a1a1a"; g.font = "bold 76px serif"; g.textAlign = "center"; g.fillText("靜", w / 2, 130); g.fillText("心", w / 2, 220);
    g.fillStyle = "#c2302a"; g.fillRect(w / 2 + 18, 240, 14, 14);
  });
  wallPlane(scroll, 0.5, 1.25, SPOT_BACK.x, SPOT_BACK.y + 0.1, -3.96, "back");
  [0.75, -0.55].forEach((dy) => { const r = cyl(0.025, 0.025, 0.62, "#3a2618", SPOT_BACK.x, SPOT_BACK.y + 0.1 + dy * 0.98, -3.94, scene, 8); r.rotation.z = Math.PI / 2; });
  const shoji = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = "#fbf3dc"; g.fillRect(0, 0, w, h); g.strokeStyle = "#6a4a30"; g.lineWidth = 3;
    for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.lineWidth = 8; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  });
  framed(shoji, 1.9, 0.95, -4.99, SPOT_LEFT.y, SPOT_LEFT.z, "left", "#6a4a30").material = new THREE.MeshBasicMaterial({ map: shoji, color: 0xfff0d0 });
  framed(signTex([{ t: "一期一會", s: 40, b: 1, c: "#1a1a1a" }], { bg: "#e8d8b0", w: 256, h: 96 }), 0.9, 0.34, SPOT_SNACK.x, SPOT_SNACK.y, -3.94, "back", "#3a2618");
  [[-1.2, 0.8], [2.2, 1.5], [0.3, 3.4], [4.6, 0.3]].forEach(([x, z]) => hangLantern(x, 2.55, z, "#f4ecd8", 0xffd9a0));
  [[-3.2, -3.7], [3.6, -3.7]].forEach(([x, z]) => hangLantern(x, 2.35, z, "#d8402e", 0xff8a5a, 0.8));
  const warm = new THREE.PointLight(0xffd090, 0.9, 8, 1.5); warm.position.set(1.0, 2.4, 1.6); scene.add(warm);
}
// 森林木屋：木招牌、步道地圖、油燈、柴堆
function cabinDecor() {
  framed(signTex([{ t: "森林小屋", s: 40, b: 1, c: "#f4e2b8" }, { t: "歡迎光臨 · 慢慢讀", s: 18, c: "#e8c890" }], { bg: "#5a3a20", w: 256, h: 120 }), 0.9, 0.42, SPOT_SNACK.x, SPOT_SNACK.y, -3.94, "back", "#3a2414");
  const map = canvasTex(300, 160, (g, w, h) => {
    g.fillStyle = "#efe0bc"; g.fillRect(0, 0, w, h); speckle(g, w, h, 500, "#8a6a3a", 0.15);
    g.fillStyle = "#7aa070"; [[60, 60, 30], [120, 110, 26], [230, 50, 34], [200, 120, 22]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
    g.fillStyle = "#6aa0c8"; g.beginPath(); g.ellipse(160, 70, 26, 14, 0.3, 0, 7); g.fill();
    g.strokeStyle = "#c2302a"; g.setLineDash([6, 5]); g.lineWidth = 3; g.beginPath(); g.moveTo(20, 140); g.quadraticCurveTo(90, 60, 150, 100); g.quadraticCurveTo(220, 140, 270, 30); g.stroke(); g.setLineDash([]);
    g.fillStyle = "#3a2414"; g.font = "bold 18px sans-serif"; g.fillText("步道地圖", 12, 24); g.font = "14px sans-serif"; g.fillText("▲ 山頂", 248, 22); g.fillText("🏠 你在這裡", 16, 155);
  });
  framed(map, 1.8, 0.95, -4.99, SPOT_LEFT.y, SPOT_LEFT.z, "left", "#5a3a20");
  const leaf = canvasTex(128, 160, (g, w, h) => { g.fillStyle = "#f4ecd8"; g.fillRect(0, 0, w, h); [["#c25a2a", 40, 50, 0.4], ["#e0a030", 88, 70, -0.5], ["#6a8a3a", 60, 115, 0.1]].forEach(([c, x, y, r]) => { g.save(); g.translate(x, y); g.rotate(r); g.fillStyle = c; g.beginPath(); g.ellipse(0, 0, 14, 28, 0, 0, 7); g.fill(); g.strokeStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.moveTo(0, -26); g.lineTo(0, 34); g.stroke(); g.restore(); }); });
  framed(leaf, 0.6, 0.75, SPOT_BACK.x, SPOT_BACK.y + 0.1, -3.97, "back", "#5a3a20");
  [[-1.2, 0.8], [2.2, 1.5], [0.3, 3.4], [4.6, 0.3]].forEach(([x, z]) => {
    box(0.008, 0.75, 0.008, "#2a2620", x, 3.0, z, scene);
    box(0.16, 0.03, 0.16, "#2a2620", x, 2.6, z, scene); box(0.16, 0.03, 0.16, "#2a2620", x, 2.36, z, scene);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.012, 0.24, 0.012, "#2a2620", x + a * 0.07, 2.48, z + b * 0.07, scene));
    glowBulb(x, 2.48, z, 0xffb050, 0.55);
  });
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) { const l = cyl(0.07, 0.07, 0.55, "#6b4a32", -4.62, 0.08 + r * 0.13, -0.15 + k * 0.15 + r * 0.075, scene, 8); l.rotation.z = Math.PI / 2; }
  const warm = new THREE.PointLight(0xffb060, 0.8, 8, 1.5); warm.position.set(1.0, 2.3, 1.6); scene.add(warm);
}
// 海邊露台：衝浪板、救生圈、ALOHA 招牌、彩色小燈
function beachDecor() {
  const sb = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.4, 6, 16), mat("#f2a65a")); sb.scale.z = 0.14; sb.position.set(SPOT_BACK.x, 1.05, -3.86); sb.rotation.z = 0.12; sb.castShadow = true; scene.add(sb);
  const st = box(0.08, 1.6, 0.04, new THREE.MeshStandardMaterial({ color: 0x3a8ab0 }), SPOT_BACK.x - 0.09, 1.05, -3.82, scene); st.rotation.z = 0.12;
  framed(signTex([{ t: "ALOHA", s: 46, b: 1, c: "#e8574a" }, { t: "🌺 study by the sea 🌊", s: 16, c: "#2a7aa8" }], { bg: "#fff6e0", w: 256, h: 120 }), 0.9, 0.42, SPOT_SNACK.x, SPOT_SNACK.y, -3.94, "back", "#7ac4c4");
  const lb = new THREE.Group(); lb.position.set(-4.9, SPOT_LEFT.y, SPOT_LEFT.z - 0.45); lb.rotation.y = Math.PI / 2; scene.add(lb);
  for (let k = 0; k < 8; k++) { const seg = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.08, 10, 8, Math.PI / 4), mat(k % 2 ? "#ffffff" : "#e8473a")); seg.rotation.z = k * Math.PI / 4; lb.add(seg); }
  const pic = canvasTex(200, 140, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#ffb07a"); gr.addColorStop(0.55, "#ffd8a0"); gr.addColorStop(0.56, "#3a8ab0"); gr.addColorStop(1, "#1a5a80"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "#fff0c0"; g.beginPath(); g.arc(100, 78, 22, Math.PI, 0); g.fill(); g.fillStyle = "rgba(255,240,192,.6)"; for (let i = 0; i < 6; i++) g.fillRect(84 + (i % 2) * 8, 84 + i * 8, 32 - i * 4, 2); });
  framed(pic, 0.8, 0.56, -4.99, SPOT_LEFT.y, SPOT_LEFT.z + 0.5, "left", "#e8eef0");
  const cols = [0xff6a6a, 0xffd04a, 0x6ad0ff, 0x8aff9a, 0xff9ad8];
  for (let i = 0; i < 12; i++) { const x = -4.6 + i * 0.95, y = 2.95 - Math.sin(i / 11 * Math.PI) * 0.35; hangLantern(x, y, -2.9, "#" + cols[i % 5].toString(16).padStart(6, "0"), cols[i % 5], 0.45); }
  const sun = new THREE.PointLight(0xffc890, 0.8, 9, 1.4); sun.position.set(0.5, 2.5, -2.4); scene.add(sun);
}
// 頂樓天台：霓虹字、塗鴉牆、頭頂一串串燈泡
function rooftopDecor() {
  wallPlane(signTex([{ t: "ROOFTOP", s: 44, b: 1, c: "#ff6ab0" }, { t: "夜讀俱樂部", s: 26, c: "#6ae8ff" }], { bg: "#14161c", glow: 1, w: 256, h: 140 }), 1.05, 0.58, SPOT_BACK.x, SPOT_BACK.y, -3.96, "back", {});
  const neon = new THREE.PointLight(0xff6ab0, 1.2, 3.5, 1.6); neon.position.set(SPOT_BACK.x, 1.9, -3.4); scene.add(neon);
  wallPlane(signTex([{ t: "★ OPEN AIR ★", s: 30, b: 1, c: "#ffe06a" }], { bg: "#14161c", glow: 1, w: 256, h: 90 }), 0.9, 0.32, SPOT_SNACK.x, SPOT_SNACK.y, -3.94, "back", {});
  const graf = canvasTex(320, 160, (g, w, h) => {
    g.fillStyle = "#5a5e66"; g.fillRect(0, 0, w, h);
    [["#ff6ab0", 70, 70, 60], ["#6ae8ff", 180, 90, 70], ["#ffe06a", 270, 60, 46]].forEach(([c, x, y, r]) => { g.fillStyle = c; g.globalAlpha = 0.85; g.beginPath(); g.ellipse(x, y, r, r * 0.55, 0.3, 0, 7); g.fill(); });
    g.globalAlpha = 1; g.font = "bold 64px sans-serif"; g.textAlign = "center"; g.lineWidth = 8; g.strokeStyle = "#14161c"; g.strokeText("KAIDA", w / 2, 102); g.fillStyle = "#ffffff"; g.fillText("KAIDA", w / 2, 102);
    g.fillStyle = "#ffe06a"; g.font = "bold 20px sans-serif"; g.fillText("study hard · dream big", w / 2, 140);
  });
  wallPlane(graf, 1.9, 0.95, -4.98, SPOT_LEFT.y, SPOT_LEFT.z, "left");
  [[-4.6, -1.0, 6.6, 0.5], [-4.6, 1.8, 6.6, 2.8], [-4.6, 4.3, 6.6, 4.8]].forEach(([x0, z0, x1, z1], L) => {
    for (let i = 0; i <= 12; i++) { const k = i / 12, x = x0 + (x1 - x0) * k, z = z0 + (z1 - z0) * k, y = 3.0 - Math.sin(k * Math.PI) * 0.35; glowBulb(x, y, z, [0xffd27a, 0xffb8a0, 0xfff0c0][(i + L) % 3], 0.4); }
  });
  const warm = new THREE.PointLight(0xffc880, 1.0, 10, 1.4); warm.position.set(1.0, 2.6, 2.0); scene.add(warm);
}
// 雪山小屋：交叉的雪板、窗台積雪、熱可可招牌、雪花
function lodgeDecor() {
  [[-0.32, "#c2302a"], [0.32, "#2a5aa8"]].forEach(([r, c]) => { const sk = box(0.1, 1.7, 0.03, c, SPOT_BACK.x, SPOT_BACK.y, -3.94, scene); sk.rotation.z = r; box(0.11, 0.12, 0.04, "#2a2620", SPOT_BACK.x + Math.sin(-r) * 0.1, SPOT_BACK.y - 0.1, -3.92, scene).rotation.z = r; });
  [[-0.6, 0.15], [0.6, -0.15]].forEach(([dx, r]) => { const pl = cyl(0.012, 0.012, 1.3, "#c9c3b8", SPOT_BACK.x + dx * 0.55, SPOT_BACK.y - 0.1, -3.93, scene, 6); pl.rotation.z = r; });
  box(2.4, 0.06, 0.32, "#ffffff", 0.2, 1.25, -3.84, scene); box(2.3, 0.05, 0.1, "#ffffff", 0.2, 2.83, -3.88, scene);
  framed(signTex([{ t: "熱可可 ☕", s: 34, b: 1, c: "#f4e2b8" }, { t: "雪屋限定 · 暖暖讀書", s: 18, c: "#ffd0c0" }], { bg: "#6a2a20", w: 256, h: 120 }), 0.9, 0.42, SPOT_SNACK.x, SPOT_SNACK.y, -3.94, "back", "#3a2414");
  const flake = canvasTex(300, 160, (g, w, h) => {
    g.fillStyle = "#2f4a6a"; g.fillRect(0, 0, w, h); g.strokeStyle = "#ffffff"; g.lineWidth = 3;
    [[60, 70, 34], [160, 60, 24], [240, 100, 30], [110, 125, 16]].forEach(([x, y, r]) => { for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.moveTo(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6); g.lineTo(x + Math.cos(a + 0.5) * r * 0.85, y + Math.sin(a + 0.5) * r * 0.85); g.stroke(); } });
    g.fillStyle = "#ffffff"; g.font = "bold 26px sans-serif"; g.textAlign = "center"; g.fillText("SNOW LODGE", w / 2, 150);
  });
  framed(flake, 1.8, 0.95, -4.99, SPOT_LEFT.y, SPOT_LEFT.z, "left", "#5a3a20");
  const gw = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.07, 8, 20), mat("#2f5a44")); gw.position.set(-4.92, 2.45, -0.4); gw.rotation.y = Math.PI / 2; scene.add(gw);
  sph(0.04, "#c2302a", -4.88, 2.27, -0.4, scene);
  [[-1.2, 0.8], [2.2, 1.5], [0.3, 3.4], [4.6, 0.3]].forEach(([x, z]) => hangLantern(x, 2.6, z, "#f4e2b8", 0xffc070, 0.7));
  const warm = new THREE.PointLight(0xffb070, 0.9, 8, 1.5); warm.position.set(1.0, 2.3, 1.6); scene.add(warm);
}

/* ===== 各主題的房間配置 =====
   家裡用原本的擺設；其他主題各自決定：座位怎麼排、哪些家具不要、多放哪些專屬家具、休息時能去哪裡做什麼 */
function xg(x, z, ry) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; scene.add(g); return g; }
// 圓咖啡桌＋兩張椅子（椅子位置跟 cafeChairs 一樣）
const CAFE_CH = [[-0.6, 0.4], [0.55, -0.45]];
function cafeChairs(x, z) { return CAFE_CH.map(([a, b]) => ({ x: x + a, z: z + b, ry: Math.atan2(-a, -b), pose: "sitmug", seat: 0.45, in: true })); }
function xCafeTable(x, z, top, seat) {
  const g = xg(x, z);
  cyl(0.36, 0.36, 0.04, top || "#b07a4f", 0, 0.72, 0, g, 24); cyl(0.03, 0.03, 0.7, "#2a2620", 0, 0.36, 0, g, 8); cyl(0.2, 0.22, 0.03, "#2a2620", 0, 0.015, 0, g, 16);
  cyl(0.045, 0.04, 0.08, "#f8f4ec", -0.1, 0.78, 0.08, g, 12); sph(0.06, "#c98f52", 0.12, 0.76, -0.05, g, 10, 8).scale.y = 0.5;
  CAFE_CH.forEach(([a, b]) => { const c = new THREE.Group(); c.position.set(a, 0, b); c.rotation.y = Math.atan2(-a, -b); g.add(c); cyl(0.2, 0.2, 0.04, seat || "#c26f5e", 0, 0.45, 0, c, 16); box(0.36, 0.34, 0.03, "#2a2620", 0, 0.66, -0.18, c); [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]].forEach(([p, q]) => cyl(0.015, 0.015, 0.45, "#2a2620", p, 0.225, q, c, 6)); });
}
function xArmchair(x, z, ry, c1, c2) { const a = makeSofa(0.85, c1, c2); a.position.set(x, 0, z); a.rotation.y = ry; scene.add(a); return a; }
// 一座兩面都放書的書架（前面朝 +z）
function xShelf(x, z, ry, w, wood) {
  const g = xg(x, z, ry), wd = wood || "#5a3424", cols = ["#7a2a2a", "#2f5a7a", "#c9a45a", "#3f6a4a", "#8a5a8a", "#d98c4a", "#e8d3b0"];
  box(w, 2.2, 0.42, wd, 0, 1.1, 0, g).castShadow = true; box(w + 0.06, 0.06, 0.46, wd, 0, 2.22, 0, g);
  [0.12, 0.66, 1.2, 1.74].forEach((y, r) => [-1, 1].forEach((sd) => { let px = -w / 2 + 0.08; for (let k = 0; px < w / 2 - 0.12; k++) { const bw = 0.06 + ((k + r) % 3) * 0.025, bh = 0.3 + ((k * 3 + r) % 4) * 0.04; box(bw, bh, 0.06, cols[(k * 2 + r + (sd > 0 ? 0 : 3)) % cols.length], px + bw / 2, y + bh / 2 + 0.02, sd * 0.2, g); px += bw + 0.012; } }));
  return g;
}
function xMat(x, z, ry, col, bells) {
  const g = xg(x, z, ry);
  box(0.64, 0.015, 1.5, col, 0, 0.008, 0, g).castShadow = false;
  const roll = cyl(0.06, 0.06, 0.64, col, 0, 0.06, -0.8, g, 12); roll.rotation.z = Math.PI / 2;
  if (bells) [-0.42, 0.42].forEach((dx) => { const b = new THREE.Group(); b.position.set(dx, 0.05, 0.75); g.add(b); const h = cyl(0.015, 0.015, 0.22, "#5a5f6b", 0, 0, 0, b, 6); h.rotation.x = Math.PI / 2; [-0.11, 0.11].forEach((q) => { const w = cyl(0.05, 0.05, 0.04, bells, 0, 0, q, b, 12); w.rotation.x = Math.PI / 2; }); });
  return g;
}
function xBench(x, z, ry, len, col) {
  const g = xg(x, z, ry);
  box(len, 0.06, 0.42, col || "#a06a42", 0, 0.44, 0, g); box(len, 0.32, 0.05, col || "#a06a42", 0, 0.7, -0.19, g);
  [-1, 1].forEach((sd) => box(0.06, 0.44, 0.38, "#3a3e44", sd * (len / 2 - 0.08), 0.22, 0, g));
  return g;
}
function xLockers(x, z, ry, n) {
  const g = xg(x, z, ry), cols = ["#5d7fa8", "#7c8ea0", "#8fa0b2"];
  for (let i = 0; i < n; i++) {
    const lx = (i - (n - 1) / 2) * 0.5;
    box(0.48, 1.3, 0.45, cols[i % 3], lx, 0.65, 0, g);
    [0.35, 1.0].forEach((y) => { for (let k = 0; k < 3; k++) box(0.3, 0.015, 0.01, "#4a525c", lx, y + k * 0.05, 0.226, g); });
    box(0.03, 0.12, 0.02, "#d8dde2", lx + 0.17, 0.75, 0.23, g);
  }
  return g;
}
function xCooler(x, z, ry) {
  const g = xg(x, z, ry);
  box(0.4, 1.0, 0.4, "#e8ecef", 0, 0.5, 0, g); box(0.3, 0.12, 0.02, "#5d7fa8", 0, 0.75, 0.205, g);
  const jug = cyl(0.15, 0.15, 0.42, new THREE.MeshStandardMaterial({ color: 0x9ad0f0, transparent: true, opacity: 0.6, roughness: 0.1 }), 0, 1.22, 0, g, 16); jug.castShadow = false;
  [-0.07, 0.07].forEach((dx, i) => box(0.04, 0.05, 0.04, i ? "#3a78c8" : "#e8473a", dx, 0.62, 0.21, g));
  return g;
}
// 太空艙中間的控制台：一根柱子頂著發亮的全像地球
function xConsole(x, z) {
  const g = xg(x, z);
  cyl(0.5, 0.62, 0.8, "#9aa4b0", 0, 0.4, 0, g, 24); cyl(0.55, 0.55, 0.05, "#3e4654", 0, 0.82, 0, g, 24);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.02, 6, 40), new THREE.MeshBasicMaterial({ color: 0x4ad8ff })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.85; g.add(ring);
  const holo = sph(0.24, new THREE.MeshBasicMaterial({ color: 0x4ad8ff, transparent: true, opacity: 0.35, wireframe: true }), 0, 1.3, 0, g, 14, 10); holo.castShadow = false; plants.push(holo);
  const pl = new THREE.PointLight(0x4ad8ff, 0.8, 3.5, 1.6); pl.position.set(x, 1.4, z); scene.add(pl);
  return g;
}
function xTreadmill(x, z, ry) {
  const g = xg(x, z, ry);
  box(0.62, 0.12, 1.4, "#3e4654", 0, 0.06, 0, g); box(0.5, 0.02, 1.3, "#1a1e26", 0, 0.13, 0, g);
  [-1, 1].forEach((sd) => { const p = box(0.05, 1.0, 0.05, "#9aa4b0", sd * 0.28, 0.6, 0.62, g); p.rotation.x = -0.15; });
  box(0.62, 0.05, 0.05, "#9aa4b0", 0, 1.08, 0.7, g);
  box(0.4, 0.22, 0.05, "#3e4654", 0, 1.18, 0.72, g); box(0.34, 0.14, 0.01, new THREE.MeshBasicMaterial({ color: 0x7cffb2 }), 0, 1.18, 0.69, g);
  return g;
}
function xPodium(x, z, ry) {
  const g = xg(x, z, ry);
  box(1.2, 0.76, 0.6, "#a8835a", 0, 0.38, 0, g); box(1.26, 0.05, 0.66, "#7a5a3e", 0, 0.78, 0, g);
  box(0.36, 0.06, 0.26, "#c2453b", -0.3, 0.84, 0, g); box(0.3, 0.05, 0.22, "#5d7fa8", -0.28, 0.89, 0.02, g);
  cyl(0.06, 0.05, 0.12, "#f3efe6", 0.35, 0.86, -0.1, g, 12); [0, 0.04, 0.08].forEach((d, i) => box(0.02, 0.1, 0.02, ["#f3efe6", "#ffe08a", "#ffd0d6"][i], 0.33 + d * 0.3, 0.96, -0.1 + d * 0.2, g));
  return g;
}
// 便利商店的貨架（沿著自己的 x 方向，兩面都有商品）
function xGondola(x, z, ry, len) {
  const g = xg(x, z, ry), goods = ["#e8473a", "#3a8ad8", "#f6c445", "#43b07e", "#f08a3c", "#e86aa0", "#ffffff", "#8a5a38"];
  box(len, 1.35, 0.12, "#dfe4e9", 0, 0.675, 0, g); box(len, 0.1, 0.62, "#c4cad0", 0, 0.05, 0, g);
  [0.42, 0.82, 1.22].forEach((y, r) => [-1, 1].forEach((sd) => {
    box(len, 0.025, 0.26, "#c4cad0", 0, y - 0.13, sd * 0.18, g);
    for (let k = 0; k < Math.floor(len / 0.17); k++) box(0.13, 0.14 + ((k + r) % 3) * 0.04, 0.16, goods[(k * 3 + r + (sd > 0 ? 1 : 4)) % goods.length], -len / 2 + 0.1 + k * 0.17, y - 0.04, sd * 0.2, g);
  }));
  box(len, 0.16, 0.02, "#2f9a6a", 0, 1.43, 0.065, g); box(len, 0.16, 0.02, "#f08a3c", 0, 1.43, -0.065, g);
  return g;
}
// 和室的矮桌和坐墊
function xChabudai(x, z) {
  const g = xg(x, z);
  cyl(0.62, 0.62, 0.05, "#6a4a30", 0, 0.32, 0, g, 28); cyl(0.5, 0.5, 0.3, "#4a3426", 0, 0.15, 0, g, 4).rotation.y = Math.PI / 4;
  cyl(0.06, 0.05, 0.08, "#f4ecd8", 0.15, 0.38, 0.1, g, 12); cyl(0.06, 0.05, 0.08, "#f4ecd8", -0.2, 0.38, -0.12, g, 12);
  const pot = sph(0.1, "#3a5a4a", 0, 0.42, 0, g, 12, 10); pot.scale.y = 0.8;
  return g;
}
function xCushion(x, z, col) { box(0.5, 0.07, 0.5, col || "#7a3a4a", x, 0.035, z, scene).rotation.y = 0.05; }
function xBonsai(x, z) {
  const g = xg(x, z);
  box(0.5, 0.4, 0.5, "#3a2618", 0, 0.2, 0, g); box(0.42, 0.1, 0.3, "#5a6a7a", 0, 0.45, 0, g);
  const tr = cyl(0.03, 0.05, 0.4, "#5a3a26", 0.03, 0.68, 0, g, 6); tr.rotation.z = 0.35;
  [[-0.08, 0.86, 0, 0.16], [0.12, 0.8, 0.05, 0.12], [-0.18, 0.74, -0.04, 0.1]].forEach(([a, b, c, r]) => { const l = sph(r, "#4a7a3e", a, b, c, g, 10, 8); l.scale.y = 0.55; });
  plants.push(g); return g;
}
function xLounger(x, z, ry, col) {
  const g = xg(x, z, ry);
  box(0.6, 0.05, 1.1, col || "#f3efe6", 0, 0.28, 0.2, g); const bk = box(0.6, 0.05, 0.7, col || "#f3efe6", 0, 0.5, -0.52, g); bk.rotation.x = 0.85;
  [[-0.27, 0.65], [0.27, 0.65], [-0.27, -0.2], [0.27, -0.2]].forEach(([a, b]) => box(0.04, 0.28, 0.04, "#a07a50", a, 0.14, b, g));
  box(0.5, 0.06, 0.3, "#f2a65a", 0, 0.66, -0.62, g).rotation.x = 0.85;
  return g;
}
function xUmbrella(x, z, col) {
  const g = xg(x, z);
  cyl(0.025, 0.025, 2.2, "#f3efe6", 0, 1.1, 0, g, 6); cyl(0.18, 0.2, 0.06, "#c9c3b8", 0, 0.03, 0, g, 12);
  const top = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.4, 10), mat(col || "#e8473a")); top.position.y = 2.25; top.castShadow = true; g.add(top);
  return g;
}
function xTelescope(x, z, ry) {
  const g = xg(x, z, ry);
  [0, 2.1, 4.2].forEach((a) => { const l = cyl(0.015, 0.015, 1.1, "#2a2620", Math.sin(a) * 0.18, 0.52, Math.cos(a) * 0.18, g, 6); l.rotation.set(Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3); });
  const tb = new THREE.Group(); tb.position.y = 1.08; tb.rotation.x = -0.75; g.add(tb);
  cyl(0.07, 0.06, 0.9, "#f3efe6", 0, 0.2, 0, tb, 14); cyl(0.08, 0.08, 0.06, "#2a2620", 0, 0.66, 0, tb, 14); cyl(0.025, 0.025, 0.12, "#2a2620", 0, -0.28, 0, tb, 8);
  return g;
}

const R90 = Math.PI / 2, PI = Math.PI;
const LAYOUTS = {
  // 咖啡廳：拿掉電視、沙發和火爐，換成好幾張小圓桌
  cafe: {
    hide: ["tv", "sofa", "arm", "bean", "lamp", "fire"],
    seats: [
      { x: -1.5, z: -1.2, ry: 0.5 }, { x: 0.9, z: 0.7, ry: -0.35, booth: "plants" }, { x: 3.3, z: 0.0, ry: -0.9 },
      { x: -1.4, z: 2.4, ry: 0.25, booth: "plants" }, { x: 2.0, z: 3.0, ry: -0.5 }, { x: 0.2, z: -2.72, ry: PI }
    ],
    obst: [[-4.35, -0.35, -2.85, 1.15], [-4.15, 1.75, -2.65, 3.25]],
    spots: [...cafeChairs(-3.6, 0.4), ...cafeChairs(-3.4, 2.5), ...cafeChairs(5.6, 3.6)],
    build() { xCafeTable(-3.6, 0.4, "#6e4a34", "#3f5f4a"); xCafeTable(-3.4, 2.5, "#6e4a34", "#3f5f4a"); }
  },
  // 圖書館：一張長長的閱覽桌（兩排對坐），旁邊是書架和看書的單人沙發
  library: {
    hide: ["tv", "sofa", "bean", "cafeT", "board", "cat"],
    poses: { arm: "sitbook", love: "sitbook" },
    seats: [
      { x: -1.9, z: 1.0, ry: 0 }, { x: -0.7, z: 1.0, ry: 0 }, { x: 0.5, z: 1.0, ry: 0 },
      { x: -1.9, z: 2.78, ry: PI }, { x: -0.7, z: 2.78, ry: PI }, { x: 0.5, z: 2.78, ry: PI }
    ],
    obst: [[3.4, 0.15, 5.0, 0.65], [3.4, 2.15, 5.0, 2.65], [5.6, -1.0, 6.5, -0.1], [5.8, 1.2, 6.7, 2.1]],
    spots: [
      { x: 4.2, z: 1.1, ry: PI, pose: "book" }, { x: 4.2, z: 3.1, ry: PI, pose: "book" }, { x: 4.2, z: -0.3, ry: 0, pose: "book" },
      { x: 6.05, z: -0.55, ry: -0.6, pose: "sitbook", seat: 0.48, in: true }, { x: 6.25, z: 1.65, ry: -1.2, pose: "sitbook", seat: 0.48, in: true },
      { x: -2.2, z: -3.1, ry: PI, pose: "book" }
    ],
    build() { xShelf(4.2, 0.4, 0, 1.6); xShelf(4.2, 2.4, 0, 1.6); xArmchair(6.05, -0.55, -0.6, "#7a2a2a", "#8e3a34"); xArmchair(6.25, 1.65, -1.2, "#2f4a3c", "#3f5f4a"); }
  },
  // 自習室：整齊的隔板座位，左邊是置物櫃和伸展區
  study: {
    hide: ["fire", "tv", "sofa", "arm", "love", "bean", "cafeT", "board", "cat", "lamp"],
    seats: [
      { x: -0.6, z: -0.2, ry: 0 }, { x: 1.0, z: -0.2, ry: 0 }, { x: 2.6, z: -0.2, ry: 0 },
      { x: -0.6, z: 2.2, ry: 0 }, { x: 1.0, z: 2.2, ry: 0 }, { x: 2.6, z: 2.2, ry: 0 }
    ],
    obst: [[-4.75, 0.7, -4.25, 3.8], [5.35, -3.65, 5.85, -3.15], [3.75, 4.15, 5.25, 4.65], [-3.55, -2.3, -2.85, -0.7], [-2.35, -2.3, -1.65, -0.7]],
    spots: [
      { x: -3.2, z: -1.4, ry: 0.5, pose: "yoga", in: true }, { x: -2.0, z: -1.4, ry: 0.6, pose: "exercise", in: true },
      { x: 5.6, z: -2.85, ry: PI, pose: "mug" }, { x: 4.15, z: 4.4, ry: 0, pose: "sofa", seat: 0.45, in: true }, { x: 4.85, z: 4.4, ry: 0, pose: "sofa", seat: 0.45, in: true },
      { x: 5.4, z: 1.2, ry: -0.6, pose: "squat" }, { x: -3.8, z: 4.6, ry: 0.4, pose: "stretch" }
    ],
    build() { xLockers(-4.5, 2.25, R90, 6); xCooler(5.6, -3.4, 0); xBench(4.5, 4.4, 0, 1.6, "#7c8ea0"); xMat(-3.2, -1.5, 0, "#7c8ea0"); xMat(-2.0, -1.5, 0, "#d98c4a", "#3e4654"); }
  },
  // 太空艙：六個座位圍著中間的控制台，旁邊有跑步機和無重力區
  space: {
    hide: ["tv", "sofa", "arm", "love", "lamp", "bean", "cafeT", "board", "cat", "books"],
    seats: [0, 1, 2, 3, 4, 5].map((i) => { const a = PI / 6 + i * PI / 3; return { x: 1.3 + Math.sin(a) * 1.35, z: 1.5 + Math.cos(a) * 1.35, ry: a }; }),
    obst: [[0.75, 0.95, 1.85, 2.05], [-4.3, 1.1, -2.9, 1.8], [-4.3, 2.2, -2.9, 2.9]],
    spots: [
      { x: -3.6, z: 1.45, ry: -R90, pose: "run", in: true }, { x: -3.6, z: 2.55, ry: -R90, pose: "run", in: true },
      { x: 5.4, z: -0.6, ry: -0.8, pose: "float" }, { x: 5.8, z: 3.6, ry: -0.6, pose: "float" }, { x: 3.4, z: 5.0, ry: 0.3, pose: "float" },
      { x: 0.6, z: -3.0, ry: PI, pose: "gaze" }, { x: -3.6, z: -0.2, ry: -2.2, pose: "stretch" }
    ],
    build() { xConsole(1.3, 1.5); xTreadmill(-3.6, 1.45, -R90); xTreadmill(-3.6, 2.55, -R90); }
  },
  // 教室：三排兩列的課桌都朝著黑板，前面有講台，後面是體育角
  school: {
    hide: ["fire", "tv", "sofa", "arm", "love", "bean", "cafeT", "lamp", "cat"],
    seats: [
      { x: -1.4, z: 1.1, ry: -R90 }, { x: 0.2, z: 1.1, ry: -R90 }, { x: 1.8, z: 1.1, ry: -R90 },
      { x: -1.4, z: 2.9, ry: -R90 }, { x: 0.2, z: 2.9, ry: -R90 }, { x: 1.8, z: 2.9, ry: -R90 }
    ],
    obst: [[-4.1, 1.35, -3.3, 2.65]],
    spots: [
      { x: -4.25, z: 0.9, ry: -R90, pose: "chalk" }, { x: -4.25, z: 3.0, ry: -R90, pose: "chalk" },
      { x: 5.0, z: 0.8, ry: -0.7, pose: "exercise" }, { x: 5.8, z: 2.6, ry: -0.9, pose: "squat" }, { x: 4.4, z: 4.6, ry: -0.5, pose: "exercise" }
    ],
    build() { xPodium(-3.7, 2.0, R90); xMat(5.6, 1.6, -0.8, "#3f6fa0"); }
  },
  // 便利商店：窗邊的內用吧台、兩排貨架，還有幾張小桌
  konbini: {
    hide: ["fire", "tv", "sofa", "arm", "love", "bean", "lamp", "board", "cat", "books", "cafeT"],
    seats: [
      { x: -1.1, z: -2.66, ry: PI }, { x: 0.0, z: -2.66, ry: PI }, { x: 1.1, z: -2.66, ry: PI },
      { x: 2.8, z: 1.2, ry: -0.4 }, { x: 4.6, z: 2.6, ry: -0.7 }, { x: 1.2, z: 3.4, ry: 0.1 }
    ],
    obst: [[-2.2, -4, -0.98, -3.6], [-3.7, 0.25, -3.1, 2.95], [-2.2, 0.25, -1.6, 2.95]],
    spots: [
      { x: -2.65, z: 0.9, ry: -R90, pose: "snack" }, { x: -2.65, z: 2.3, ry: R90, pose: "book" },
      { x: -1.05, z: 1.6, ry: -R90, pose: "snack" }, { x: -4.2, z: 1.6, ry: R90, pose: "book" }
    ],
    build() { xGondola(-3.4, 1.6, R90, 2.6); xGondola(-1.9, 1.6, R90, 2.6); }
  },
  // 和室：書桌靠著牆和窗，中間是喝茶的矮桌，角落有打坐的坐墊和盆景
  washitsu: {
    hide: ["fire", "tv", "sofa", "arm", "love", "bean", "cafeT", "board", "lamp", "books", "snack"],
    seats: [
      { x: -1.5, z: -2.72, ry: PI }, { x: 0.2, z: -2.72, ry: PI },
      { x: -3.9, z: -0.8, ry: -R90 }, { x: -3.9, z: 0.9, ry: -R90 }, { x: -3.9, z: 2.6, ry: -R90 },
      { x: 5.0, z: 0.6, ry: R90 }
    ],
    obst: [[0.75, 0.95, 2.05, 2.25], [6.15, 1.75, 6.65, 2.25]],
    spots: [
      { x: 1.4, z: 0.75, ry: 0, pose: "tea", in: true }, { x: 1.4, z: 2.45, ry: PI, pose: "tea", in: true }, { x: 0.55, z: 1.6, ry: R90, pose: "tea", in: true }, { x: 2.25, z: 1.6, ry: -R90, pose: "tea", in: true },
      { x: 4.6, z: 3.6, ry: 0.6, pose: "zen" }, { x: 5.8, z: 4.4, ry: 0.6, pose: "zen" }, { x: 6.4, z: 2.6, ry: PI, pose: "gaze" }
    ],
    build() { xChabudai(1.4, 1.6); [[1.4, 0.75], [1.4, 2.45], [0.55, 1.6], [2.25, 1.6]].forEach(([x, z]) => xCushion(x, z, "#7a3a4a")); xCushion(4.6, 3.6, "#3f5a4a"); xCushion(5.8, 4.4, "#3f5a4a"); xBonsai(6.4, 2.0); }
  },
  // 森林木屋：留著火爐和沙發，書桌斜斜散開，有瑜伽墊和戶外伸展
  cabin: {
    hide: ["tv", "sofa", "bean", "cafeT", "board", "lamp"],
    poses: { arm: "sitmug", love: "sitmug" },
    seats: [
      { x: 0.2, z: -2.72, ry: PI }, { x: -1.0, z: 0.2, ry: -0.8 }, { x: 1.0, z: 1.4, ry: -0.2, booth: "plants" },
      { x: 3.2, z: 0.0, ry: 0.6 }, { x: 4.8, z: 1.9, ry: -1.0 }, { x: 2.4, z: 3.7, ry: 0.3 }
    ],
    obst: [[-3.95, 0.85, -3.3, 2.35]],
    spots: [
      { x: -3.6, z: 1.5, ry: 0.6, pose: "yoga", in: true }, { x: -3.6, z: 2.6, ry: 0.6, pose: "squat" },
      { x: 6.2, z: 4.6, ry: -0.6, pose: "exercise" }, { x: -3.85, z: -2.2, ry: -R90, pose: "warm" }
    ],
    build() { xMat(-3.6, 1.6, 0, "#3f6a3a"); }
  },
  // 海邊露台：書桌面向大海，旁邊有躺椅、陽傘和跳舞的空地
  beach: {
    hide: ["fire", "tv", "sofa", "arm", "love", "lamp", "cat", "books", "board"],
    seats: [
      { x: -1.6, z: -1.2, ry: 0.78 }, { x: 0.2, z: -1.8, ry: 0.78 }, { x: 2.2, z: -1.6, ry: 0.78 },
      { x: -1.0, z: 1.4, ry: 0.78 }, { x: 1.0, z: 0.8, ry: 0.78 }, { x: 3.0, z: 0.6, ry: 0.78 }
    ],
    obst: [[-4.1, -1.9, -3.1, -0.5], [-4.1, 0.0, -3.1, 1.4], [-4.1, 1.9, -3.1, 3.3]],
    spots: [
      { x: -3.6, z: -1.2, ry: 0.9, pose: "lounge", in: true }, { x: -3.6, z: 0.7, ry: 0.9, pose: "lounge", in: true }, { x: -3.6, z: 2.6, ry: 0.9, pose: "lounge", in: true },
      { x: -2.2, z: 4.4, ry: 0.8, pose: "yoga" }, { x: 3.4, z: 4.4, ry: 0.4, pose: "dance" }, { x: 1.6, z: 4.8, ry: 0.2, pose: "dance" }, { x: 4.6, z: 1.6, ry: 0.8, pose: "exercise" }
    ],
    build() { [[-3.6, -1.2, "#7ac4c4"], [-3.6, 0.7, "#f2a65a"], [-3.6, 2.6, "#7ac4c4"]].forEach(([x, z, c]) => xLounger(x, z, 0.9, c)); xUmbrella(-4.3, -0.25, "#e8473a"); xUmbrella(-4.3, 1.65, "#3a8ab0"); xMat(-2.2, 4.4, 0.8, "#f2a65a"); }
  },
  // 頂樓天台：座位沿著邊散開，有望遠鏡看星星和運動區
  rooftop: {
    hide: ["tv", "sofa", "books", "cat", "lamp", "board", "arm"],
    seats: [
      { x: -3.4, z: 0.6, ry: 0.7 }, { x: -1.6, z: 1.8, ry: 0.4, booth: "plants" }, { x: 0.6, z: 0.4, ry: -0.2 },
      { x: 1.2, z: 2.8, ry: -0.5 }, { x: 3.4, z: 1.4, ry: -0.9 }, { x: 0.2, z: -2.72, ry: PI }
    ],
    obst: [[5.15, -1.95, 5.65, -1.45], [1.75, 4.95, 3.45, 5.45]],
    spots: [
      { x: 5.4, z: -1.15, ry: PI, pose: "gaze" }, { x: 4.4, z: 4.0, ry: -0.4, pose: "exercise" }, { x: 6.2, z: 4.0, ry: -0.8, pose: "squat" },
      { x: 2.2, z: 5.2, ry: 0, pose: "sofa", seat: 0.45, in: true }, { x: 3.0, z: 5.2, ry: 0, pose: "sofa", seat: 0.45, in: true }, { x: -1.2, z: 4.8, ry: 0.4, pose: "dance" }
    ],
    build() { xTelescope(5.4, -1.7, 0); xBench(2.6, 5.2, 0, 1.6, "#b08a5a"); xMat(5.3, 4.6, -0.6, "#c94a6a", "#3a3e44"); }
  },
  // 雪山小屋：兩排書桌對著大窗看雪，沙發改成喝熱可可，門邊有長椅
  lodge: {
    hide: ["tv", "sofa", "bean", "cafeT", "board", "lamp"],
    poses: { love: "sitmug", arm: "sitmug" },
    seats: [
      { x: -1.4, z: -1.2, ry: PI }, { x: 0.2, z: -1.2, ry: PI }, { x: 1.8, z: -1.2, ry: PI },
      { x: -0.6, z: 1.4, ry: PI }, { x: 1.0, z: 1.4, ry: PI }, { x: 2.6, z: 1.4, ry: PI }
    ],
    obst: [[4.6, 2.9, 6.2, 3.9]],
    spots: [
      { x: 5.11, z: 3.2, ry: -0.6, pose: "sitmug", seat: 0.45, in: true }, { x: 5.69, z: 3.6, ry: -0.6, pose: "sitmug", seat: 0.45, in: true },
      { x: -3.85, z: -0.2, ry: -R90, pose: "warm" }, { x: 5.0, z: 0.6, ry: -0.7, pose: "squat" }, { x: -3.4, z: 1.8, ry: -R90, pose: "stretch" }
    ],
    build() { xBench(5.4, 3.4, -0.6, 1.6, "#8a5a3a"); }
  }
};

/* ===== 各主題房間的小擺設 =====
   每間再多放一些符合場景的東西：obst 是放在地上的家具範圍，spots 是休息時可以去的新地方 */
function glowMat(c, k) { return new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k || 0.6, roughness: 0.6 }); }
function potPlant(x, z, s, pot, leaf) {
  const g = xg(x, z); g.scale.setScalar(s || 1);
  cyl(0.2, 0.15, 0.36, pot || "#c98f6a", 0, 0.18, 0, g, 14);
  for (let i = 0; i < 7; i++) { const l = sph(0.16, i % 2 ? (leaf || "#6f9a5a") : "#8fae7a", Math.cos(i * 0.9) * 0.14, 0.55 + (i % 3) * 0.16, Math.sin(i * 0.9) * 0.14, g, 10, 8); l.scale.set(0.8, 1.4, 0.8); }
  plants.push(g); return g;
}
function wallShelf(x, y, z, side, w, items) {
  // 牆上的小層板，items 是放在上面的東西 [顏色, 寬, 高, 形狀]
  const g = new THREE.Group(); g.position.set(x, y, z); if (side === "left") g.rotation.y = R90; scene.add(g);
  box(w, 0.04, 0.22, "#7a4a2a", 0, 0, 0.11, g);
  let px = -w / 2 + 0.08;
  items.forEach(([c, iw, ih, shape]) => { if (shape === "cup") cyl(iw / 2, iw / 2.4, ih, c, px + iw / 2, ih / 2 + 0.02, 0.12, g, 12); else if (shape === "ball") sph(iw / 2, c, px + iw / 2, iw / 2 + 0.02, 0.12, g, 10, 8); else box(iw, ih, 0.14, c, px + iw / 2, ih / 2 + 0.02, 0.12, g); px += iw + 0.05; });
  return g;
}
function wallPic(tex, w, h, x, y, z, side, fc) { return framed(tex, w, h, x, y, z, side, fc); }
function floorRug(x, z, rx, rz, c1, c2, ry) {
  const r = new THREE.Mesh(new THREE.CircleGeometry(1, 40), mat(c1)); r.rotation.x = -R90; r.rotation.z = ry || 0; r.scale.set(rx, rz, 1); r.position.set(x, 0.007, z); r.receiveShadow = true; scene.add(r);
  if (c2) { const r2 = new THREE.Mesh(new THREE.RingGeometry(0.8, 0.88, 40), mat(c2)); r2.rotation.x = -R90; r2.rotation.z = ry || 0; r2.scale.set(rx, rz, 1); r2.position.set(x, 0.009, z); scene.add(r2); }
}
function standLamp(x, z, shade, light) {
  const g = xg(x, z);
  cyl(0.14, 0.16, 0.04, "#2a2620", 0, 0.02, 0, g, 14); cyl(0.015, 0.015, 1.5, "#2a2620", 0, 0.77, 0, g, 6);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.26, 18, 1, true), mat(shade || "#f3e3c6", { side: THREE.DoubleSide, emissive: 0xffc070, emissiveIntensity: 0.4 })); sh.position.y = 1.55; g.add(sh);
  if (light) { const l = new THREE.PointLight(light, 0.6, 3, 1.6); l.position.set(x, 1.4, z); scene.add(l); }
  return g;
}
function crate(x, z, ry, c, n) { const g = xg(x, z, ry); for (let i = 0; i < (n || 1); i++) { box(0.4, 0.3, 0.4, c || "#a07a50", 0, 0.15 + i * 0.31, 0, g); box(0.42, 0.04, 0.05, "#7a5a3e", 0, 0.15 + i * 0.31, 0.2, g); } return g; }

const RICH = {
  cafe: {
    obst: [[6.25, 0.3, 6.95, 1.7], [-4.6, 4.9, -4.0, 5.5], [-4.75, 5.6, -4.05, 6.3]],
    spots: [{ x: 5.75, z: 1.0, ry: R90, pose: "snack" }],
    build() {
      // 甜點櫃：玻璃罩裡放蛋糕
      const pc = xg(6.6, 1.0, -R90);
      box(1.3, 0.85, 0.6, "#4a2f22", 0, 0.425, 0, pc); box(1.32, 0.04, 0.62, "#2a1c16", 0, 0.87, 0, pc);
      const gl = box(1.24, 0.45, 0.56, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, roughness: 0.05 }), 0, 1.12, 0, pc); gl.castShadow = false;
      [["#f6d6e0", -0.42], ["#c98f52", -0.14], ["#f3efe6", 0.14], ["#7a4a2a", 0.42]].forEach(([c, x], i) => { cyl(0.11, 0.11, 0.14, c, x, 0.97, 0, pc, 16); sph(0.025, "#c2453b", x, 1.06, 0, pc, 8, 6); cyl(0.13, 0.13, 0.01, "#f8f4ec", x, 0.9, 0, pc, 16); });
      const cl = new THREE.PointLight(0xffd9a0, 0.5, 2, 1.6); cl.position.set(6.6, 1.3, 1.0); scene.add(cl);
      // 牆上的馬克杯架、衣帽架、角落橄欖樹
      wallShelf(-4.98, 1.55, -1.6, "left", 1.6, [["#f8f4ec", 0.13, 0.13, "cup"], ["#c2453b", 0.13, 0.13, "cup"], ["#3f5f4a", 0.13, 0.13, "cup"], ["#e0b04f", 0.13, 0.13, "cup"], ["#f8f4ec", 0.13, 0.13, "cup"], ["#7a4a2a", 0.2, 0.26], ["#c9a45a", 0.2, 0.22]]);
      wallShelf(-4.98, 1.1, -1.6, "left", 1.6, [["#3a2418", 0.18, 0.32], ["#6e4a34", 0.18, 0.28], ["#e8d3b0", 0.18, 0.3], ["#3a2418", 0.18, 0.32], ["#9cbf7a", 0.2, 0.2, "ball"]]);
      const cr = xg(-4.3, 5.2); cyl(0.02, 0.025, 1.7, "#2a1c16", 0, 0.85, 0, cr, 6); cyl(0.2, 0.22, 0.03, "#2a1c16", 0, 0.015, 0, cr, 12);
      [0, 2.1, 4.2].forEach((a, i) => { const hk = cap(0.012, 0.12, "#2a1c16", cr); hk.position.set(Math.sin(a) * 0.08, 1.62, Math.cos(a) * 0.08); hk.rotation.set(Math.cos(a) * 0.8, 0, -Math.sin(a) * 0.8); });
      const coat = cap(0.13, 0.45, "#a0603a", cr); coat.position.set(0.1, 1.25, 0.05); coat.scale.z = 0.6; sph(0.1, "#c2453b", -0.08, 1.58, -0.05, cr, 10, 8).scale.y = 0.5;
      potPlant(-4.4, 5.95, 1.3, "#3a2418", "#7a8a5a");
      floorRug(6.0, 1.0, 0.6, 1.0, "#a0603a");
    }
  },
  library: {
    obst: [[-4.75, 0.7, -4.15, 1.7], [-4.75, 2.3, -4.25, 2.9], [5.5, 4.1, 6.3, 4.7], [6.5, -3.2, 7.0, -2.7]],
    spots: [{ x: 5.9, z: 5.1, ry: PI, pose: "book" }, { x: -3.8, z: 1.2, ry: -R90, pose: "book" }],
    build() {
      // 卡片目錄櫃（很多小抽屜）
      const cc = xg(-4.45, 1.2, R90);
      box(1.0, 1.1, 0.55, "#6a3a26", 0, 0.55, 0, cc);
      for (let r = 0; r < 5; r++) for (let k = 0; k < 4; k++) { box(0.2, 0.17, 0.02, "#8a5a3a", -0.33 + k * 0.22, 0.17 + r * 0.2, 0.28, cc); box(0.05, 0.02, 0.02, "#c9a45a", -0.33 + k * 0.22, 0.2 + r * 0.2, 0.3, cc); }
      box(0.3, 0.2, 0.25, "#3a2216", 0.25, 1.2, 0, cc); box(0.02, 0.3, 0.02, "#c9a45a", -0.25, 1.25, 0, cc); sph(0.06, glowMat("#3f7a52", 0.3), -0.25, 1.42, 0, cc, 10, 8).scale.y = 0.5;
      // 老爺鐘
      const gc = xg(-4.5, 2.6, R90);
      box(0.45, 2.0, 0.35, "#4a2416", 0, 1.0, 0, gc); box(0.5, 0.08, 0.4, "#3a1c10", 0, 2.04, 0, gc);
      const fc = cyl(0.17, 0.17, 0.02, "#f4ecd8", 0, 1.65, 0.18, gc, 24); fc.rotation.x = R90;
      box(0.012, 0.12, 0.01, "#2a2620", 0, 1.69, 0.2, gc); box(0.012, 0.09, 0.01, "#2a2620", 0.03, 1.63, 0.2, gc).rotation.z = 1.2;
      box(0.26, 0.9, 0.01, new THREE.MeshStandardMaterial({ color: 0xffe8c0, transparent: true, opacity: 0.25 }), 0, 0.85, 0.18, gc).castShadow = false;
      cyl(0.07, 0.07, 0.02, "#c9a45a", 0, 0.6, 0.15, gc, 16).rotation.x = R90;
      // 還書推車
      const bc = xg(5.9, 4.4, 0);
      box(0.8, 0.04, 0.45, "#5a3424", 0, 0.35, 0, bc); box(0.8, 0.04, 0.45, "#5a3424", 0, 0.75, 0, bc);
      [[-0.37, -0.2], [0.37, -0.2], [-0.37, 0.2], [0.37, 0.2]].forEach(([a, b]) => { box(0.03, 0.8, 0.03, "#2a2620", a, 0.42, b, bc); sph(0.04, "#2a2620", a, 0.04, b, bc, 8, 6); });
      [0.37, 0.77].forEach((y, r) => { for (let k = 0; k < 7; k++) { const bk = box(0.07, 0.24 + (k % 3) * 0.03, 0.3, ["#7a2a2a", "#2f5a7a", "#c9a45a", "#3f6a4a", "#8a5a8a"][(k + r) % 5], -0.32 + k * 0.1, y + 0.14, 0, bc); bk.rotation.z = (k % 4 === 3) ? 0.3 : 0; } });
      // 綠色檯燈的大書桌燈、地上的書堆、蕨類
      const gl = xg(6.75, -2.95); cyl(0.14, 0.16, 0.9, "#4a2416", 0, 0.45, 0, gl, 8);
      const fern = potPlant(6.75, -2.95, 1.0, "#5a3424", "#4a7a3e"); fern.position.y = 0.9;
      [[5.2, 1.0], [3.3, 3.3]].forEach(([x, z], j) => { for (let k = 0; k < 5; k++) { const b = box(0.32 - k * 0.02, 0.06, 0.24, ["#7a2a2a", "#2f5a7a", "#c9a45a", "#3f6a4a", "#e8d3b0"][(k + j) % 5], x, 0.03 + k * 0.06, z, scene); b.rotation.y = k * 0.3; } });
      standLamp(5.25, -0.8, "#2f5a44", 0xffd090);
      floorRug(6.1, 0.6, 1.1, 1.4, "#7a2a2a", "#c9a45a");
    }
  },
  study: {
    obst: [[6.3, 0.9, 7.0, 2.1], [6.45, 2.6, 7.0, 3.4], [6.1, -0.9, 6.7, -0.3], [-4.4, 4.9, -3.6, 5.7]],
    spots: [{ x: 5.8, z: 1.5, ry: R90, pose: "stand" }],
    build() {
      // 影印機桌
      const pr = xg(6.65, 1.5, -R90);
      box(1.1, 0.75, 0.6, "#b9bfc7", 0, 0.375, 0, pr);
      box(0.6, 0.32, 0.45, "#e8ecef", -0.15, 0.91, 0, pr); box(0.5, 0.04, 0.3, "#4a525c", -0.15, 1.08, 0.02, pr); box(0.4, 0.01, 0.3, "#ffffff", -0.15, 0.8, 0.25, pr);
      const led = sph(0.02, new THREE.MeshBasicMaterial({ color: 0x7cffb2 }), 0.08, 1.0, 0.23, pr, 8, 6); led.castShadow = false;
      for (let k = 0; k < 4; k++) box(0.28, 0.02, 0.36, "#ffffff", 0.32, 0.77 + k * 0.022, 0, pr);
      // 分類垃圾桶
      [["#3a78c8", 2.75], ["#43b07e", 3.0], ["#f08a3c", 3.25]].forEach(([c, z]) => { cyl(0.12, 0.1, 0.5, c, 6.72, 0.25, z, scene, 14); cyl(0.125, 0.125, 0.03, "#e8ecef", 6.72, 0.51, z, scene, 14); });
      // 考試倒數立牌
      const cd = xg(6.4, -0.6, -0.6);
      [-1, 1].forEach((sd) => box(0.03, 1.2, 0.03, "#4a525c", sd * 0.28, 0.6, 0, cd));
      const days = 12 + (new Date().getDate() % 18);
      wallPlaneIn(cd, signTex([{ t: "距離考試", s: 26, b: 1, c: "#2a2620" }, { t: days + " 天", s: 54, b: 1, c: "#c2453b" }, { t: "一起加油！", s: 20, c: "#3f6fa0" }], { bg: "#fff8dc", w: 200, h: 220 }), 0.56, 0.62, 0, 1.0, 0.02);
      // 時間表、飲水機旁的杯子、前面的大盆栽
      framed(signTex([{ t: "開放時間", s: 24, b: 1 }, { t: "08:00 – 22:00", s: 20 }, { t: "每 50 分鐘休息 10 分", s: 16, c: "#3f6fa0" }], { bg: "#f4f6f7", fg: "#2a2620", w: 256, h: 140 }), 0.9, 0.5, 6.2, 1.9, -3.94, "back", "#8e96a0");
      for (let k = 0; k < 5; k++) cyl(0.035, 0.03, 0.08, "#f3efe6", 5.25 + k * 0.01, 0.04 + k * 0.07, -3.55, scene, 10);
      potPlant(-4.0, 5.3, 1.3, "#e8ecef", "#5a8a4a"); potPlant(6.7, 5.4, 1.1, "#e8ecef", "#5a8a4a");
      box(1.4, 0.006, 0.8, "#d8dde2", -2.6, 0.004, -1.5, scene).castShadow = false;
    }
  },
  space: {
    obst: [[-3.9, -3.9, -1.8, -3.25], [6.3, -1.0, 7.0, 0.1], [6.35, 2.6, 7.05, 3.6], [-4.6, 4.6, -3.8, 5.4]],
    spots: [{ x: -2.85, z: -2.85, ry: PI, pose: "stand" }, { x: 5.85, z: -0.45, ry: R90, pose: "gaze" }],
    build() {
      // 牆邊的控制面板，一排會閃的按鈕
      const cp = xg(-2.85, -3.6);
      box(2.0, 0.95, 0.55, "#c9d0d8", 0, 0.475, 0, cp); const top = box(2.0, 0.06, 0.6, "#3e4654", 0, 0.98, 0.05, cp); top.rotation.x = 0.3;
      const blink = [];
      for (let k = 0; k < 14; k++) { const b = sph(0.03, new THREE.MeshBasicMaterial({ color: [0x4ad8ff, 0x7cffb2, 0xffd84a, 0xff6a6a][k % 4] }), -0.85 + k * 0.13, 1.03, 0.08 + (k % 2) * 0.1, cp, 8, 6); b.castShadow = false; blink.push(b); }
      const sc2 = canvasTex(256, 96, (g, w, h) => { g.fillStyle = "#06121e"; g.fillRect(0, 0, w, h); g.strokeStyle = "#7cffb2"; g.lineWidth = 2; g.beginPath(); for (let x = 0; x < w; x += 3) g.lineTo(x, 50 + Math.sin(x / 7) * 18 * Math.sin(x / 40)); g.stroke(); g.fillStyle = "#4ad8ff"; g.font = "bold 16px monospace"; g.fillText("NAV · OK", 8, 20); });
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.5), new THREE.MeshBasicMaterial({ map: sc2 })); scr.position.set(0, 1.55, -0.2); cp.add(scr);
      blink.forEach((b, i) => { b.userData.ph = i * 1.3; }); spaceBlinks = blink;
      // 太空衣展示架
      const su = xg(6.65, -0.45, -R90);
      cyl(0.25, 0.28, 0.06, "#3e4654", 0, 0.03, 0, su, 16); cyl(0.02, 0.02, 0.6, "#9aa4b0", 0, 0.3, 0, su, 6);
      [-0.09, 0.09].forEach((x) => { const l = cap(0.08, 0.35, "#f3efe6", su); l.position.set(x, 0.5, 0); });
      const bd = cap(0.2, 0.3, "#f3efe6", su); bd.position.y = 1.05; bd.scale.z = 0.8;
      [-1, 1].forEach((sd) => { const a = cap(0.065, 0.3, "#f3efe6", su); a.position.set(sd * 0.26, 1.05, 0); a.rotation.z = sd * 0.25; });
      box(0.12, 0.1, 0.03, "#c2453b", 0.07, 1.15, 0.18, su); box(0.16, 0.06, 0.02, "#2f4a7a", -0.06, 1.2, 0.18, su);
      const hl = sph(0.2, new THREE.MeshStandardMaterial({ color: 0xd8e8f8, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.3 }), 0, 1.5, 0, su, 18, 14); hl.castShadow = false;
      sph(0.14, "#f0c8a0", 0, 1.48, -0.02, su, 12, 10).visible = false;
      // 氧氣筒、火箭模型、吊在天花板的行星
      [[6.6, 2.85, "#e8e8f0"], [6.8, 3.2, "#f08a3c"], [6.55, 3.35, "#e8e8f0"]].forEach(([x, z, c]) => { cyl(0.13, 0.13, 0.95, c, x, 0.48, z, scene, 14); sph(0.13, c, x, 0.95, z, scene, 12, 8); cyl(0.03, 0.03, 0.1, "#3e4654", x, 1.1, z, scene, 8); });
      const rk = xg(-4.2, 5.0, 0.4);
      cyl(0.3, 0.35, 0.12, "#3e4654", 0, 0.06, 0, rk, 16); cyl(0.13, 0.15, 1.0, "#f3efe6", 0, 0.65, 0, rk, 16);
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.35, 16), mat("#c2453b")); nose.position.y = 1.32; rk.add(nose);
      [0, 2.1, 4.2].forEach((a) => { const f = box(0.02, 0.3, 0.22, "#c2453b", Math.sin(a) * 0.17, 0.3, Math.cos(a) * 0.17, rk); f.rotation.y = a; });
      const win = cyl(0.06, 0.06, 0.02, "#4ad8ff", 0, 0.85, 0.14, rk, 14); win.rotation.x = R90;
      [[-3.4, 3.3, -2.4, 0.35, "#f2a65a", 1], [5.6, 3.2, -2.3, 0.22, "#7a9ad8", 0], [6.2, 2.9, 5.2, 0.18, "#c9b48a", 0]].forEach(([x, y, z, r, c, ring]) => {
        box(0.006, 4.4 - y, 0.006, "#9aa4b0", x, (4.4 + y) / 2, z, scene);
        const pl = sph(r, c, x, y, z, scene, 18, 14); plants.push(pl);
        if (ring) { const rg = new THREE.Mesh(new THREE.TorusGeometry(r * 1.6, 0.02, 6, 36), mat("#e8d8b0")); rg.position.set(x, y, z); rg.rotation.x = 1.2; scene.add(rg); }
      });
      floorRug(5.8, 3.8, 1.2, 1.2, "#1a2440", "#4ad8ff");
    }
  },
  school: {
    obst: [[6.25, 3.3, 7.0, 4.2], [-4.75, -1.95, -4.15, -0.85], [6.2, 0.2, 7.0, 0.9], [-1.6, 5.5, 3.4, 6.1]],
    spots: [{ x: 5.75, z: 3.75, ry: R90, pose: "exercise" }, { x: -3.7, z: -1.4, ry: -R90, pose: "gaze" }],
    build() {
      // 體育角：裝球的籃子
      const bk = xg(6.6, 3.75);
      cyl(0.4, 0.35, 0.55, new THREE.MeshStandardMaterial({ color: 0x5a6a7a, wireframe: true }), 0, 0.28, 0, bk, 10).castShadow = false;
      [[-0.12, 0.22, -0.1, "#e86a2a"], [0.14, 0.24, 0.08, "#f3efe6"], [0.0, 0.48, 0.0, "#e86a2a"], [-0.1, 0.5, 0.15, "#f6c445"], [0.15, 0.5, -0.12, "#3a78c8"]].forEach(([x, y, z, c]) => sph(0.12, c, x, y, z, bk, 12, 10));
      // 班級魚缸
      const ft = xg(-4.45, -1.4, R90);
      box(1.0, 0.7, 0.5, "#8a6a3a", 0, 0.35, 0, ft);
      const tank = box(0.9, 0.5, 0.4, new THREE.MeshStandardMaterial({ color: 0x9ad8f0, transparent: true, opacity: 0.45, roughness: 0.05 }), 0, 0.96, 0, ft); tank.castShadow = false;
      box(0.88, 0.04, 0.38, "#d8c39a", 0, 0.73, 0, ft); [[-0.25, "#4a8a3a"], [0.2, "#6aa04a"]].forEach(([x, c]) => { const w = cap(0.03, 0.3, c, ft); w.position.set(x, 0.9, 0); });
      [[-0.1, 0.95, "#f08a3c"], [0.15, 1.05, "#f6c445"]].forEach(([x, y, c]) => { const f = sph(0.04, c, x, y, 0.05, ft, 8, 6); f.scale.set(1.6, 1, 0.6); });
      // 書包櫃、摺紙鶴、同學的畫
      const cub = xg(6.6, 0.55, -R90);
      box(1.4, 1.0, 0.5, "#c9a878", 0, 0.5, 0, cub);
      for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { box(0.3, 0.38, 0.02, "#a8835a", -0.5 + k * 0.33, 0.27 + r * 0.45, 0.24, cub); box(0.24, 0.26, 0.14, ["#c2453b", "#3a78c8", "#e0b04f", "#43b07e", "#e86aa0", "#f08a3c", "#5a5f6b", "#8a5a8a"][r * 4 + k], -0.5 + k * 0.33, 0.24 + r * 0.45, 0.25, cub); }
      for (let i = 0; i < 12; i++) { const x = -1.2 + (i % 6) * 0.9, z = i < 6 ? 0.2 : 3.9; box(0.004, 0.6, 0.004, "#f3efe6", x, 3.0, z, scene); const cr = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 3), mat(["#e86a7a", "#f6c445", "#6ad0ff", "#8ae08a"][i % 4])); cr.position.set(x, 2.68, z); cr.rotation.z = R90; scene.add(cr); }
      [[-0.55, "#ffd0d6", "🌈"], [0.0, "#cfe8ff", "🐱"], [0.55, "#fff8dc", "🌻"]].forEach(([dz, bg, em]) => framed(signTex([{ t: em, s: 64 }], { bg, w: 128, h: 128 }), 0.42, 0.42, -4.99, 1.75, -1.4 + dz, "left", "#e0b04f"));
      // 前面一排小盆栽和澆水壺
      const sill = xg(0.9, 5.8); box(5.0, 0.4, 0.5, "#c9a878", 0, 0.2, 0, sill);
      for (let k = 0; k < 7; k++) { cyl(0.1, 0.08, 0.14, ["#e86a7a", "#f6c445", "#6ad0ff"][k % 3], -2.1 + k * 0.7, 0.47, 0, sill, 12); sph(0.11, "#6f9a5a", -2.1 + k * 0.7, 0.6, 0, sill, 10, 8); }
      cyl(0.09, 0.1, 0.18, "#43b07e", 2.2, 0.49, 0.05, sill, 12);
    }
  },
  konbini: {
    obst: [[6.25, -1.6, 7.0, -0.8], [5.6, 3.4, 7.0, 4.2], [4.25, 5.35, 4.75, 5.85], [-4.75, 4.4, -3.55, 4.9]],
    spots: [{ x: 5.85, z: -1.2, ry: R90, pose: "stand" }, { x: 6.3, z: 3.0, ry: PI, pose: "snack" }],
    build() {
      // ATM／事務機
      const atm = xg(6.65, -1.2, -R90);
      box(0.75, 1.45, 0.6, "#3a78c8", 0, 0.725, 0, atm); box(0.6, 0.35, 0.02, new THREE.MeshBasicMaterial({ color: 0xbfe6ff }), 0, 1.05, 0.31, atm);
      box(0.55, 0.06, 0.2, "#2a2f38", 0, 0.78, 0.32, atm); box(0.75, 0.12, 0.62, "#f6c445", 0, 1.5, 0, atm);
      // 冰淇淋冰櫃
      const fz = xg(6.3, 3.8);
      box(1.3, 0.75, 0.7, "#f4f6f7", 0, 0.375, 0, fz); box(1.2, 0.02, 0.6, new THREE.MeshStandardMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.5, roughness: 0.05 }), 0, 0.76, 0, fz).castShadow = false;
      for (let k = 0; k < 8; k++) box(0.12, 0.08, 0.2, ["#f6d6e0", "#f6c445", "#8ad8a8", "#c98f52"][k % 4], -0.5 + k * 0.14, 0.7, (k % 2) * 0.2 - 0.1, fz);
      wallPlaneIn(fz, signTex([{ t: "ICE 🍦", s: 34, b: 1, c: "#3a78c8" }], { bg: "#ffffff", w: 200, h: 60 }), 0.9, 0.27, 0, 0.45, 0.36);
      // 關東煮鍋（放在吧台上）
      const od = xg(2.0, -3.62); box(0.5, 0.12, 0.36, "#9aa2ab", 0, 1.08, 0, od); box(0.46, 0.02, 0.32, "#c98f52", 0, 1.14, 0, od);
      [[-0.15, 0, "#f3efe6"], [0, 0.06, "#e8c070"], [0.14, -0.05, "#a0603a"]].forEach(([x, z, c]) => { cyl(0.004, 0.004, 0.2, "#c9a878", x, 1.24, z, od, 4); sph(0.04, c, x, 1.17, z, od, 8, 6); });
      // 雨傘架、分類垃圾桶、門口腳踏墊
      const ub = xg(4.5, 5.6); cyl(0.17, 0.15, 0.5, "#9aa2ab", 0, 0.25, 0, ub, 12);
      [["#e8473a", 0.4], ["#3a78c8", -0.3], ["#2a2620", 0.1]].forEach(([c, r], i) => { const u = cyl(0.02, 0.06, 0.8, c, Math.sin(i * 2) * 0.05, 0.6, Math.cos(i * 2) * 0.05, ub, 8); u.rotation.z = r * 0.3; });
      [["#3a78c8", -4.5], ["#43b07e", -4.15], ["#f08a3c", -3.8]].forEach(([c, x]) => { box(0.3, 0.75, 0.4, c, x, 0.375, 4.65, scene); box(0.16, 0.04, 0.02, "#ffffff", x, 0.65, 4.86, scene); });
      box(1.6, 0.01, 0.8, "#2f9a6a", 3.0, 0.006, 6.0, scene).castShadow = false;
    }
  },
  washitsu: {
    obst: [[6.3, -1.4, 7.0, -0.2], [-4.1, 4.5, -3.5, 5.1], [6.2, -3.3, 7.0, -2.6], [-1.6, 5.6, 0.0, 6.2]],
    spots: [{ x: -3.25, z: 4.8, ry: -R90, pose: "gaze" }],
    build() {
      // 屏風
      const by = xg(6.6, -0.8, -R90 + 0.1);
      for (let k = 0; k < 4; k++) { const p = new THREE.Group(); p.position.set(-0.45 + k * 0.3, 0, (k % 2) * 0.1); p.rotation.y = (k % 2 ? -1 : 1) * 0.3; by.add(p); box(0.3, 1.5, 0.03, "#3a2618", 0, 0.75, 0, p); box(0.26, 1.4, 0.035, ["#e8d8a8", "#f1ead8"][k % 2], 0, 0.78, 0, p); }
      const crane = canvasTex(128, 128, (g) => { g.fillStyle = "rgba(0,0,0,0)"; g.clearRect(0, 0, 128, 128); g.fillStyle = "#c2302a"; g.beginPath(); g.arc(80, 30, 14, 0, 7); g.fill(); g.strokeStyle = "#3a5a4a"; g.lineWidth = 6; g.beginPath(); g.moveTo(10, 120); g.quadraticCurveTo(50, 60, 120, 110); g.stroke(); });
      const cm = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: crane, transparent: true })); cm.position.set(0, 0.85, 0.12); by.add(cm);
      // 插花台
      const ik = xg(-3.8, 4.8);
      box(0.6, 0.5, 0.6, "#3a2618", 0, 0.25, 0, ik); cyl(0.12, 0.14, 0.1, "#2a3a3a", 0, 0.55, 0, ik, 16);
      [[0, 0.3, 0.0, "#5a8a3e"], [0.1, 0.22, 0.4, "#5a8a3e"], [-0.08, 0.18, -0.5, "#5a8a3e"]].forEach(([x, h, r, c]) => { const st = cyl(0.008, 0.008, h * 2, c, x, 0.6 + h, 0, ik, 4); st.rotation.z = r; });
      [[0.0, 1.2, 0.02, "#f2a0b8"], [0.32, 0.98, 0.0, "#ffffff"], [-0.24, 0.92, 0.04, "#f2a0b8"]].forEach(([x, y, z, c]) => sph(0.06, c, x, y, z, ik, 10, 8));
      // 衣櫃（簞笥）、門口的木屐、竹子盆栽
      const tn = xg(6.6, -2.95, -R90);
      box(1.2, 1.1, 0.55, "#6a4a30", 0, 0.55, 0, tn);
      for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) { box(0.55, 0.3, 0.02, "#7a5a3e", -0.28 + k * 0.56, 0.2 + r * 0.34, 0.28, tn); cyl(0.04, 0.04, 0.02, "#2a2620", -0.28 + k * 0.56, 0.2 + r * 0.34, 0.3, tn, 10).rotation.x = R90; }
      cyl(0.11, 0.1, 0.05, "#f4ecd8", 0.3, 1.13, 0, tn, 14); box(0.3, 0.2, 0.2, "#c2302a", -0.25, 1.2, 0, tn);
      [[-0.15, "#8a6a4a"], [0.15, "#8a6a4a"]].forEach(([dx, c]) => { box(0.12, 0.03, 0.26, c, -0.8 + dx, 0.05, 5.9, scene); box(0.1, 0.04, 0.02, "#2a2620", -0.8 + dx, 0.02, 5.8, scene); });
      const bm = xg(-0.6, 5.9); box(1.4, 0.3, 0.4, "#5a4030", 0, 0.15, 0, bm);
      for (let k = 0; k < 7; k++) { const h = 1.2 + (k % 3) * 0.35; cyl(0.025, 0.03, h, "#7aa04a", -0.6 + k * 0.2, 0.3 + h / 2, (k % 2) * 0.08 - 0.04, bm, 6); const lf = sph(0.12, "#5a8a3e", -0.6 + k * 0.2 + 0.08, 0.3 + h, 0, bm, 8, 6); lf.scale.set(1.6, 0.4, 0.6); }
      plants.push(bm);
    }
  },
  cabin: {
    obst: [[6.3, 2.6, 7.0, 3.4], [6.2, 4.6, 7.0, 5.3], [-4.6, 4.6, -3.8, 5.4], [6.35, -0.9, 7.0, -0.1]],
    spots: [{ x: 5.85, z: 3.0, ry: R90, pose: "music" }, { x: -3.35, z: -0.0, ry: -1.8, pose: "warm" }],
    build() {
      // 立在架上的吉他
      const gt = xg(6.65, 3.0, -R90);
      [-0.15, 0.15].forEach((x) => { const l = box(0.03, 0.5, 0.03, "#2a2620", x, 0.25, -0.1, gt); l.rotation.x = 0.2; });
      const body = cyl(0.2, 0.2, 0.09, "#c98f52", 0, 0.45, 0, gt, 20); body.rotation.x = R90; body.scale.set(1, 1, 1);
      const b2 = cyl(0.15, 0.15, 0.09, "#c98f52", 0, 0.75, 0, gt, 20); b2.rotation.x = R90;
      cyl(0.05, 0.05, 0.1, "#2a1c16", 0, 0.6, 0.01, gt, 14).rotation.x = R90;
      box(0.06, 0.6, 0.03, "#5a3a22", 0, 1.15, 0, gt); box(0.08, 0.14, 0.04, "#3a2414", 0, 1.5, 0, gt);
      // 鹿角、獎槳、雪鞋掛在牆上
      const ant = new THREE.Group(); ant.position.set(-4.95, 2.45, 0.1); ant.rotation.y = R90; scene.add(ant);
      cyl(0.2, 0.2, 0.05, "#5a3a20", 0, 0, 0, ant, 16).rotation.x = R90;
      [-1, 1].forEach((sd) => { const a = cyl(0.02, 0.025, 0.5, "#e8dcc4", sd * 0.18, 0.2, 0.08, ant, 6); a.rotation.z = sd * -0.7; [0.1, 0.25].forEach((t, k) => { const b = cyl(0.012, 0.015, 0.18, "#e8dcc4", sd * (0.1 + t * 0.6), 0.12 + t * 0.5, 0.08, ant, 5); b.rotation.z = sd * 0.3 * (k + 1); }); });
      [[5.6, "#a83a2e"], [6.3, "#3f6a3a"]].forEach(([x, c], i) => { const pd = new THREE.Group(); pd.position.set(x, 2.1, -3.93); pd.rotation.z = i ? -0.35 : 0.35; scene.add(pd); box(0.04, 1.3, 0.03, "#8a5a3a", 0, 0, 0, pd); const bl = sph(0.13, c, 0, -0.65, 0, pd, 12, 8); bl.scale.set(1, 1.8, 0.2); });
      // 背包、靴子、木箱、角落的小松樹
      const bp = xg(6.6, 4.95, -R90 + 0.3);
      box(0.4, 0.55, 0.25, "#a83a2e", 0, 0.32, 0, bp); box(0.3, 0.18, 0.08, "#7a2a20", 0, 0.25, 0.15, bp); const roll = cyl(0.08, 0.08, 0.42, "#3f6a3a", 0, 0.66, 0, bp, 10); roll.rotation.z = R90;
      [[0.35, 0.2], [0.55, 0.25]].forEach(([dx, dz]) => { box(0.12, 0.25, 0.14, "#5a3a20", dx, 0.125, dz, bp); box(0.14, 0.06, 0.24, "#3a2414", dx, 0.03, dz + 0.04, bp); });
      crate(6.65, -0.5, 0.2, "#a07a50", 2); sph(0.1, "#c2453b", 6.65, 0.72, -0.5, scene, 10, 8); sph(0.1, "#e0b04f", 6.75, 0.72, -0.38, scene, 10, 8);
      const pt = xg(-4.2, 5.0); cyl(0.2, 0.16, 0.3, "#8a5a3a", 0, 0.15, 0, pt, 12);
      [[0.45, 0.5, 0.55], [0.35, 0.45, 0.9], [0.22, 0.35, 1.2]].forEach(([r, h, y]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10), mat("#3f6a44")); c.position.y = y; c.castShadow = true; pt.add(c); });
      floorRug(-3.0, -0.2, 0.7, 0.5, "#e8dcc4");
    }
  },
  beach: {
    obst: [[6.3, -1.1, 7.0, 0.3], [-1.2, 5.55, 1.2, 6.25], [6.3, 4.8, 7.0, 5.6], [4.45, 2.6, 5.05, 3.0], [-4.5, 4.1, -4.1, 4.5], [-4.5, 5.4, -4.1, 5.8]],
    spots: [{ x: 0.0, z: 5.9, ry: 0.3, pose: "lounge", in: true }, { x: 5.85, z: -0.4, ry: R90, pose: "stand" }],
    build() {
      // 衝浪板架
      const sr = xg(6.65, -0.4, -R90);
      [-0.55, 0.55].forEach((x) => box(0.05, 1.3, 0.05, "#a07a50", x, 0.65, -0.2, sr));
      [["#f2a65a", 0.0], ["#7ac4c4", 0.17], ["#e8574a", 0.34]].forEach(([c, z], i) => { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.3, 6, 14), mat(c)); b.scale.z = 0.12; b.rotation.z = R90; b.position.set(0, 0.4 + i * 0.32, -0.15 + z * 0.2); b.castShadow = true; sr.add(b); });
      // 吊床：兩根柱子拉一張網
      const hm = xg(0, 5.9, 0.3);
      [-1.1, 1.1].forEach((x) => cyl(0.05, 0.06, 1.4, "#a07a50", x, 0.7, 0, hm, 8));
      const cloth = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.9, 16, 1, true, Math.PI * 0.55, Math.PI * 0.9), mat("#f2a65a", { side: THREE.DoubleSide })); cloth.rotation.z = R90; cloth.position.y = 0.75; cloth.scale.set(1, 1, 0.9); cloth.castShadow = true; hm.add(cloth);
      [-1, 1].forEach((sd) => { const r = cyl(0.01, 0.01, 0.35, "#f3efe6", sd * 1.0, 0.95, 0, hm, 4); r.rotation.z = sd * 0.9; });
      // 冰桶、海灘球、沙堡、火把
      const cb = xg(4.75, 2.8, 0.4); box(0.55, 0.38, 0.36, "#3a8ab0", 0, 0.19, 0, cb); box(0.57, 0.08, 0.38, "#f3efe6", 0, 0.42, 0, cb);
      [-0.12, 0.0, 0.12].forEach((x, i) => cyl(0.03, 0.03, 0.16, ["#e8473a", "#f6c445", "#8ad8a8"][i], x, 0.52, 0.05, cb, 8));
      const bb = sph(0.22, "#ffffff", 3.9, 0.22, 5.2, scene, 16, 12); [0, 1, 2].forEach((k) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.225, 16, 12, k * 2.1, 0.7), mat(["#e8473a", "#3a8ab0", "#f6c445"][k])); s.position.copy(bb.position); scene.add(s); });
      const sc = xg(6.65, 5.2); cyl(0.4, 0.45, 0.1, "#e8d0a0", 0, 0.05, 0, sc, 16); cyl(0.2, 0.25, 0.3, "#e8d0a0", 0, 0.25, 0, sc, 4).rotation.y = 0.78; [[-0.25, 0], [0.25, 0], [0, -0.25], [0, 0.25]].forEach(([a, b]) => cyl(0.07, 0.08, 0.25, "#e8d0a0", a, 0.22, b, sc, 6));
      const flag = box(0.12, 0.08, 0.005, "#e8473a", 0.06, 0.62, 0, sc); cyl(0.005, 0.005, 0.3, "#3a3a34", 0, 0.5, 0, sc, 4); cyl(0.12, 0.08, 0.15, "#f6c445", 0.4, 0.075, 0.3, sc, 12);
      [[-4.3, 4.3], [-4.3, 5.6]].forEach(([x, z]) => { cyl(0.04, 0.05, 1.5, "#8a6a40", x, 0.75, z, scene, 8); cyl(0.08, 0.06, 0.15, "#5a3a20", x, 1.55, z, scene, 8); const f = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 8), new THREE.MeshBasicMaterial({ color: 0xffa040 })); f.position.set(x, 1.72, z); scene.add(f); fireMeshes.push(f); f.userData.base = 0.2; glowBulb(x, 1.72, z, 0xffa040, 0.6); });
      floorRug(2.2, 4.5, 1.1, 0.7, "#f6f2e8", "#7ac4c4", 0.3);
    }
  },
  rooftop: {
    obst: [[6.3, 0.0, 7.0, 0.9], [-4.1, 5.0, -3.1, 5.8], [5.9, 2.0, 7.0, 2.8], [-1.0, 5.9, 1.4, 6.3]],
    spots: [{ x: 5.85, z: 0.45, ry: R90, pose: "snack" }, { x: -3.6, z: 4.6, ry: PI, pose: "warm" }],
    build() {
      // 自動販賣機
      const vm = xg(6.65, 0.45, -R90);
      box(0.85, 1.8, 0.65, "#c2302a", 0, 0.9, 0, vm); box(0.62, 0.95, 0.02, new THREE.MeshBasicMaterial({ color: 0xe8f4ff }), -0.06, 1.2, 0.33, vm);
      for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) cyl(0.035, 0.035, 0.16, new THREE.MeshBasicMaterial({ color: [0x3a78c8, 0xf6c445, 0x43b07e, 0xe8473a, 0xffffff][(k + r) % 5] }), -0.28 + k * 0.11, 0.95 + r * 0.28, 0.32, vm, 8);
      box(0.4, 0.12, 0.05, "#2a2620", -0.05, 0.35, 0.33, vm); box(0.1, 0.25, 0.03, "#2a2620", 0.33, 1.0, 0.33, vm);
      const vl = new THREE.PointLight(0xffffff, 0.5, 2.5, 1.6); vl.position.set(6.1, 1.2, 0.45); scene.add(vl);
      // 烤肉架
      const bq = xg(-3.6, 5.4);
      [0, 2.1, 4.2].forEach((a) => { const l = cyl(0.015, 0.015, 0.7, "#2a2620", Math.sin(a) * 0.2, 0.33, Math.cos(a) * 0.2, bq, 6); l.rotation.set(Math.cos(a) * 0.25, 0, -Math.sin(a) * 0.25); });
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat("#2a2620", { side: THREE.DoubleSide })); bowl.position.y = 0.75; bq.add(bowl);
      const grill = cyl(0.31, 0.31, 0.01, new THREE.MeshStandardMaterial({ color: 0x8a8e94, wireframe: true }), 0, 0.75, 0, bq, 12); grill.castShadow = false;
      [[-0.1, 0.05, "#a0603a"], [0.08, -0.08, "#c2453b"], [0.12, 0.1, "#6aa04a"]].forEach(([x, z, c]) => { const k = cap(0.03, 0.14, c, bq); k.rotation.z = R90; k.position.set(x, 0.78, z); });
      const coal = new THREE.PointLight(0xff7a3a, 0.7, 2, 1.6); coal.position.set(-3.6, 0.9, 5.4); scene.add(coal);
      // 一排盆栽、滑板、摺疊椅
      [-0.8, -0.1, 0.6, 1.2].forEach((x, i) => potPlant(x, 6.1, 0.9, ["#c94a6a", "#3a3e44", "#f2a65a", "#3a3e44"][i], "#6a9a50"));
      const sk = xg(6.4, 2.4, 0.5); box(0.22, 0.02, 0.8, "#f2a65a", 0, 0.1, 0, sk); [[-0.08, -0.28], [0.08, -0.28], [-0.08, 0.28], [0.08, 0.28]].forEach(([a, b]) => { const w = cyl(0.03, 0.03, 0.03, "#ffe06a", a, 0.04, b, sk, 10); w.rotation.z = R90; });
      const fc = xg(6.6, 2.4, -2.2); box(0.42, 0.04, 0.42, "#6ae8ff", 0, 0.42, 0, fc); box(0.42, 0.4, 0.04, "#6ae8ff", 0, 0.66, -0.2, fc); [[-0.18, -1], [0.18, -1]].forEach(([x]) => { const a = box(0.03, 0.6, 0.03, "#3a3e44", x, 0.3, 0, fc); a.rotation.x = 0.4; const b = box(0.03, 0.6, 0.03, "#3a3e44", x, 0.3, 0, fc); b.rotation.x = -0.4; });
      floorRug(-3.6, 5.0, 0.9, 0.7, "#3a3e44", "#f2a65a");
    }
  },
  lodge: {
    obst: [[6.3, -1.2, 7.0, 0.2], [-4.3, 4.8, -3.3, 5.8], [6.3, 4.4, 7.0, 5.4], [-4.75, -0.2, -4.2, 0.5]],
    spots: [{ x: -3.0, z: 5.3, ry: -1.6, pose: "gaze" }, { x: 5.85, z: -0.5, ry: R90, pose: "stand" }],
    build() {
      // 雪板架
      const sk = xg(6.65, -0.5, -R90);
      box(1.3, 0.06, 0.2, "#5a3a20", 0, 0.1, 0, sk); box(1.3, 0.06, 0.08, "#5a3a20", 0, 1.3, -0.1, sk);
      [["#c2302a", -0.45], ["#2a5aa8", -0.15], ["#f6c445", 0.15], ["#3f6a54", 0.45]].forEach(([c, x]) => { const s = box(0.1, 1.6, 0.03, c, x, 0.85, -0.04, sk); s.rotation.x = -0.08; });
      // 聖誕樹（掛燈和星星）
      const tr = xg(-3.8, 5.3);
      box(0.4, 0.3, 0.4, "#b0302a", 0, 0.15, 0, tr);
      [[0.75, 0.7, 0.6], [0.6, 0.6, 1.05], [0.42, 0.55, 1.45], [0.25, 0.4, 1.8]].forEach(([r, h, y]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 12), mat("#2f5a44")); c.position.y = y; c.castShadow = true; tr.add(c); });
      const star = sph(0.09, new THREE.MeshBasicMaterial({ color: 0xffd84a }), 0, 2.05, 0, tr, 10, 8); star.castShadow = false; glowBulb(-3.8, 2.05, 5.3, 0xffd84a, 0.5);
      for (let i = 0; i < 18; i++) { const a = i * 1.4, y = 0.45 + (i / 18) * 1.4, r = 0.68 - (i / 18) * 0.5; const b = sph(0.035, new THREE.MeshBasicMaterial({ color: [0xff5a4a, 0xffd84a, 0x6ad0ff, 0xffffff][i % 4] }), Math.cos(a) * r, y, Math.sin(a) * r, tr, 6, 5); b.castShadow = false; }
      [[0.5, 0.3, "#c2302a"], [-0.45, 0.4, "#2a5aa8"], [0.1, 0.55, "#f6c445"]].forEach(([x, z, c]) => { box(0.26, 0.2, 0.26, c, x, 0.1, z, tr); box(0.27, 0.03, 0.05, "#ffffff", x, 0.21, z, tr); });
      const tl = new THREE.PointLight(0xffc070, 0.6, 3, 1.6); tl.position.set(-3.8, 1.3, 5.3); scene.add(tl);
      // 木雪橇、門口的雪靴、牆上的駝鹿頭
      const sl = xg(6.65, 4.9, -R90);
      [-0.22, 0.22].forEach((x) => { box(0.04, 0.04, 1.0, "#5a3a20", x, 0.04, 0, sl); const tip = cyl(0.1, 0.1, 0.04, "#5a3a20", x, 0.12, 0.5, sl, 12, 0); tip.rotation.z = R90; });
      for (let k = 0; k < 5; k++) box(0.55, 0.03, 0.12, "#a8784a", 0, 0.2, -0.36 + k * 0.17, sl);
      [[-0.2, "#c2302a"], [0.2, "#ffffff"]].forEach(([x, c]) => box(0.18, 0.06, 0.14, c, x, 0.25, -0.2, sl));
      [[-4.55, 0.0], [-4.35, 0.2]].forEach(([x, z]) => { box(0.16, 0.28, 0.2, "#5a3a20", x, 0.14, z, scene); box(0.18, 0.08, 0.3, "#3a2414", x, 0.04, z + 0.06, scene); cyl(0.09, 0.09, 0.06, "#f2ece0", x, 0.3, z, scene, 10); });
      const mo = new THREE.Group(); mo.position.set(-4.92, 2.5, -2.3); mo.rotation.y = R90; scene.add(mo);
      cyl(0.18, 0.18, 0.05, "#5a3a20", 0, 0, 0, mo, 14).rotation.x = R90;
      const hd = sph(0.15, "#6a4a30", 0, -0.05, 0.15, mo, 12, 10); hd.scale.set(0.9, 1.0, 1.4); sph(0.07, "#3a2414", 0, -0.12, 0.33, mo, 8, 6);
      [-1, 1].forEach((sd) => { const an = sph(0.14, "#d8c8a8", sd * 0.25, 0.12, 0.1, mo, 10, 8); an.scale.set(1.3, 0.3, 0.8); });
      floorRug(-3.2, -1.8, 0.8, 0.6, "#f2ece0", "#b0302a");
    }
  }
};
let spaceBlinks = [];
function wallPlaneIn(g, tex, w, h, x, y, z) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })); m.position.set(x, y, z); g.add(m); return m; }

/* ===== 房間外面的景色 =====
   房間像一個放在戶外的模型：外面鋪一大片地面，再依主題擺樹、房子、海或星星，縮小時看得到 */
const OUT = { home: "garden", school: "garden", cafe: "street", library: "street", study: "street", konbini: "street", rooftop: "city", washitsu: "zen", cabin: "forest", lodge: "snow", beach: "beach", space: "space" };
function rnd(seed) { let x = seed; return () => { x = (x * 16807) % 2147483647; return x / 2147483647; }; }
function outsideSpots(n, seed, r0, r1) {
  const R = rnd(seed), out = [];
  let guard = 0;
  while (out.length < n && guard++ < n * 30) {
    const a = R() * Math.PI * 2, r = r0 + R() * (r1 - r0), x = 1.4 + Math.cos(a) * r, z = 1.5 + Math.sin(a) * r;
    if (x > -6.2 && x < 9 && z > -5.2 && z < 8.2) continue;
    out.push([x, z, R()]);
  }
  return out;
}
function roundTree(x, z, s, leaf, trunk) {
  const g = new THREE.Group(); g.position.set(x, -0.2, z); g.scale.setScalar(s); scene.add(g);
  cyl(0.12, 0.16, 1.2, trunk || "#7a5236", 0, 0.6, 0, g, 8);
  [[0, 1.6, 0, 0.75], [0.35, 1.35, 0.2, 0.5], [-0.3, 1.4, -0.15, 0.55]].forEach(([a, b, c, r]) => sph(r, leaf || "#7fae5e", a, b, c, g, 12, 10));
  plants.push(g); return g;
}
function pineTree(x, z, s, leaf, snow) {
  const g = new THREE.Group(); g.position.set(x, -0.2, z); g.scale.setScalar(s); scene.add(g);
  cyl(0.1, 0.14, 0.6, "#5a3a26", 0, 0.3, 0, g, 8);
  [[0.9, 1.1, 0.75], [0.7, 0.95, 1.35], [0.5, 0.8, 1.9]].forEach(([r, h, y]) => {
    const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10), mat(leaf || "#3f6a44")); c.position.y = y; c.castShadow = true; g.add(c);
    if (snow) { const sc = new THREE.Mesh(new THREE.ConeGeometry(r * 0.55, h * 0.45, 10), mat("#f6f9fc")); sc.position.y = y + h * 0.28; g.add(sc); }
  });
  return g;
}
function building(x, z, w, d, h, col, lit) {
  const tex = canvasTex(64, 128, (g, W, H) => {
    g.fillStyle = col; g.fillRect(0, 0, W, H);
    for (let y = 6; y < H - 4; y += 12) for (let k = 6; k < W - 6; k += 14) { g.fillStyle = lit && ((k * 7 + y * 3) % 5 < 3) ? "#ffd98a" : "rgba(170,200,230,.55)"; g.fillRect(k, y, 8, 7); }
  });
  tex.repeat.set(Math.max(1, Math.round(w / 1.2)), Math.max(1, Math.round(h / 2.4)));
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, emissive: lit ? 0x332a18 : 0x000000, emissiveMap: lit ? tex : null }));
  m.position.set(x, -0.2 + h / 2, z); scene.add(m); return m;
}
let outsideDark = [];
function buildOutside() {
  outsideDark = [];
  const kind = OUT[THEME] || "garden";
  if (kind === "space") {
    const n = 900, pos = new Float32Array(n * 3), R = rnd(7);
    for (let i = 0; i < n; i++) { const a = R() * Math.PI * 2, b = (R() - 0.3) * Math.PI, r = 45 + R() * 10; pos.set([1.4 + Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r, 1.5 + Math.sin(a) * Math.cos(b) * r], i * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })));
    const pl = sph(7, new THREE.MeshStandardMaterial({ color: 0x3a6ab0, emissive: 0x0a1a3a, roughness: 0.8 }), 30, -9, 30, scene, 40, 28); pl.castShadow = false;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(10, 0.5, 6, 60), new THREE.MeshBasicMaterial({ color: 0xc9b48a, transparent: true, opacity: 0.6 })); ring.position.copy(pl.position); ring.rotation.x = 1.2; scene.add(ring);
    const moon = sph(2, new THREE.MeshStandardMaterial({ color: 0xd8d4c8, roughness: 1 }), -18, 6, 28, scene, 24, 16); moon.castShadow = false;
    // 太空艙底座
    box(13.4, 0.5, 11.6, "#5a6270", 1.4, -0.45, 1.5, scene);
    return;
  }
  const G = { garden: "#8fb86a", street: "#9a9ea6", city: "#6e7278", zen: "#d8d0b8", forest: "#6a8a4a", snow: "#f2f6fa", beach: "#ead6a8" }[kind];
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), mat(G)); ground.rotation.x = -Math.PI / 2; ground.position.set(1.4, -0.21, 1.5); ground.receiveShadow = true; scene.add(ground);
  if (kind === "garden") {
    // 草地、步道、花、圍籬、樹
    const path = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 30), mat("#d8c39a")); path.rotation.x = -Math.PI / 2; path.position.set(4, -0.2, 22); path.receiveShadow = true; scene.add(path);
    outsideSpots(26, 11, 9, 30).forEach(([x, z, r], i) => i % 3 ? roundTree(x, z, 0.9 + r * 0.8, ["#7fae5e", "#6a9a50", "#9cc070"][i % 3]) : pineTree(x, z, 1 + r * 0.6, "#4f7a48"));
    outsideSpots(40, 5, 8, 18).forEach(([x, z, r], i) => { sph(0.12, ["#e86a7a", "#f6c445", "#ffffff", "#c08ae0"][i % 4], x, -0.08, z, scene, 8, 6); sph(0.18, "#6a9a50", x, -0.15, z, scene, 8, 6); });
    for (let i = 0; i < 26; i++) { const x = -7 + i * 0.75; box(0.08, 0.6, 0.08, "#f3efe6", x, 0.1, 9.6, scene); } box(19, 0.06, 0.05, "#f3efe6", 2.4, 0.25, 9.6, scene); box(19, 0.06, 0.05, "#f3efe6", 2.4, -0.02, 9.6, scene);
  } else if (kind === "street") {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(140, 6), mat("#4a4e56")); road.rotation.x = -Math.PI / 2; road.position.set(1.4, -0.205, 13); road.receiveShadow = true; scene.add(road);
    const road2 = new THREE.Mesh(new THREE.PlaneGeometry(6, 140), mat("#4a4e56")); road2.rotation.x = -Math.PI / 2; road2.position.set(14, -0.205, 1.5); road2.receiveShadow = true; scene.add(road2);
    for (let i = -10; i < 12; i++) { box(1.2, 0.01, 0.15, "#f3efe6", i * 3, -0.19, 13, scene); box(0.15, 0.01, 1.2, "#f3efe6", 14, -0.19, i * 3, scene); }
    for (let k = 0; k < 6; k++) box(0.5, 0.01, 4, "#f3efe6", 10.2 + k * 0.9, -0.19, 13, scene);
    [[9.5, 9.5], [9.5, -3], [3, 9.6], [-4, 9.6], [9.5, 4]].forEach(([x, z], i) => {
      cyl(0.05, 0.06, 3, "#3a3e44", x, 1.3, z, scene, 8); box(0.6, 0.08, 0.2, "#3a3e44", x - 0.25, 2.8, z, scene);
      const lb = sph(0.1, new THREE.MeshBasicMaterial({ color: 0xffe0a0 }), x - 0.45, 2.72, z, scene, 8, 6); lb.castShadow = false; outsideDark.push(glowBulbRet(x - 0.45, 2.7, z));
    });
    outsideSpots(14, 23, 10, 16).forEach(([x, z, r], i) => { if (Math.abs(z - 13) > 3.5 && Math.abs(x - 14) > 3.5) roundTree(x, z, 0.8 + r * 0.5, "#6a9a50"); });
    const lit = THEME === "konbini";
    [[-2, 20, 6, 4, 6, "#c9b8a0"], [6, 20, 5, 4, 9, "#a8b4c4"], [13, 21, 6, 5, 5, "#d8c8b0"], [22, 14, 4, 6, 8, "#b8a890"], [22, 4, 5, 6, 11, "#9aa8b8"], [21, -6, 5, 5, 7, "#c8b8a8"], [-12, 18, 6, 5, 12, "#a8a0b0"]].forEach(([x, z, w, d, h, c]) => building(x, z, w, d, h, c, lit));
  } else if (kind === "city") {
    // 頂樓：房子是建築物頂樓，四周是更高或更矮的大樓
    box(13.6, 0.6, 0.3, "#8a8e94", 1.4, 0.1, 7.3, scene); box(0.3, 0.6, 11.6, "#8a8e94", 8.1, 0.1, 1.5, scene);
    const R = rnd(3);
    for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2, r = 18 + R() * 14, x = 1.4 + Math.cos(a) * r, z = 1.5 + Math.sin(a) * r, h = 4 + R() * 22; building(x, z, 3 + R() * 3, 3 + R() * 3, h, ["#5a6070", "#6a7080", "#4a5060", "#7a7a88"][i % 4], true).position.y = h / 2 - 8; }
    ground.position.y = -8;
    const tank = new THREE.Group(); tank.position.set(10, 0, -2); scene.add(tank);
    cyl(0.9, 0.9, 1.6, "#9aa2ab", 0, 2.0, 0, tank, 16); [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(([a, b]) => box(0.08, 1.2, 0.08, "#4a4e54", a, 0.6, b, tank));
    box(5, 0.2, 5, "#8a8e94", 10, -0.3, -2, scene);
  } else if (kind === "zen") {
    // 枯山水：耙過的砂、石頭、竹林、石燈籠、小池塘
    for (let i = 0; i < 40; i++) { const r = 9 + i * 0.35; const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.05, 64), mat("#b8b098")); ring.rotation.x = -Math.PI / 2; ring.position.set(1.4, -0.2, 1.5); scene.add(ring); }
    [[10, 9, 0.9], [12, 3, 0.6], [-7, 10, 0.8], [6, 12, 0.5]].forEach(([x, z, s]) => { const st = sph(s, "#7a7870", x, -0.2 + s * 0.4, z, scene, 10, 8); st.scale.y = 0.6; });
    const pond = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), new THREE.MeshStandardMaterial({ color: 0x4a7a8a, roughness: 0.1, metalness: 0.2 })); pond.rotation.x = -Math.PI / 2; pond.position.set(11, -0.19, 12); scene.add(pond);
    [[10.4, 11.6, "#f08a3c"], [11.6, 12.4, "#ffffff"]].forEach(([x, z, c]) => { const f = sph(0.15, c, x, -0.15, z, scene, 8, 6); f.scale.set(1.6, 0.4, 0.7); });
    const lan = new THREE.Group(); lan.position.set(8.5, -0.2, 11); scene.add(lan);
    box(0.3, 0.9, 0.3, "#9a968a", 0, 0.45, 0, lan); box(0.7, 0.15, 0.7, "#9a968a", 0, 0.95, 0, lan); box(0.45, 0.4, 0.45, "#9a968a", 0, 1.22, 0, lan);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.35, 4), mat("#8a867a")); roof.position.y = 1.6; roof.rotation.y = Math.PI / 4; lan.add(roof);
    const R = rnd(9);
    outsideSpots(160, 31, 14, 32).forEach(([x, z, r], i) => { const h = 4 + r * 4; const b = cyl(0.07, 0.08, h, i % 2 ? "#6a9a4a" : "#88b05a", x, h / 2 - 0.2, z, scene, 6); b.rotation.z = (R() - 0.5) * 0.1; if (i % 3 === 0) { const lf = sph(0.6, "#5a8a3e", x, h - 0.4, z, scene, 8, 6); lf.scale.y = 0.5; } });
  } else if (kind === "forest" || kind === "snow") {
    const snow = kind === "snow";
    outsideSpots(70, snow ? 17 : 13, 8.5, 34).forEach(([x, z, r], i) => pineTree(x, z, 1.1 + r * 1.3, snow ? "#2f5a44" : ["#3f6a44", "#4f7a48", "#2f5a3a"][i % 3], snow));
    if (snow) {
      [[-20, -24, 14, 16], [8, -30, 18, 22], [30, -18, 12, 14], [36, 10, 10, 12]].forEach(([x, z, r, h]) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), mat("#c8d4e2")); m.position.set(x, h / 2 - 0.3, z); scene.add(m); const c = new THREE.Mesh(new THREE.ConeGeometry(r * 0.38, h * 0.38, 7), mat("#ffffff")); c.position.set(x, h - h * 0.19 - 0.3, z); scene.add(c); });
      const n = 500, pos = new Float32Array(n * 3), R = rnd(4); for (let i = 0; i < n; i++) pos.set([1.4 + (R() - 0.5) * 50, R() * 14, 1.5 + (R() - 0.5) * 50], i * 3);
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      snowPts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, map: glowTexture(), transparent: true, depthWrite: false })); scene.add(snowPts);
    } else {
      for (let i = 0; i < 8; i++) { const R = rnd(40 + i); const x = 9.5 + R() * 3, z = -2 + R() * 9; sph(0.25 + R() * 0.3, "#8a8578", x, -0.15, z, scene, 8, 6).scale.y = 0.6; }
      const camp = new THREE.Group(); camp.position.set(11.5, -0.2, 10); scene.add(camp);
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; sph(0.16, "#8a8578", Math.cos(a) * 0.55, 0.08, Math.sin(a) * 0.55, camp, 8, 6); }
      [0.4, -0.4].forEach((r) => { const l = cyl(0.06, 0.06, 0.7, "#6b4a32", 0, 0.1, 0, camp, 8); l.rotation.set(Math.PI / 2, r, 0); });
      outsideDark.push(glowBulbRet(11.5, 0.2, 10, 0xff9a4a, 1.2));
    }
  } else if (kind === "beach") {
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x3a9ac8, roughness: 0.25, metalness: 0.1 }));
    sea.rotation.x = -Math.PI / 2; sea.position.set(60, -0.24, 60); scene.add(sea); seaMesh = sea;
    ground.geometry = new THREE.PlaneGeometry(36, 36); ground.position.set(1.4, -0.21, 1.5);
    const foam = new THREE.Mesh(new THREE.RingGeometry(17.6, 18.6, 4, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })); foam.rotation.x = -Math.PI / 2; foam.rotation.z = Math.PI / 4; foam.position.set(1.4, -0.205, 1.5); foam.scale.set(1.42, 1.42, 1); scene.add(foam);
    [[10, 9], [-8, 11], [12, -3], [5, 13], [-9, -2]].forEach(([x, z], i) => {
      const g = new THREE.Group(); g.position.set(x, -0.2, z); scene.add(g);
      for (let k = 0; k < 6; k++) { const seg = cyl(0.14 - k * 0.012, 0.15 - k * 0.012, 0.75, "#a07a50", Math.sin(k * 0.35) * 0.4, 0.38 + k * 0.72, 0, g, 8); seg.rotation.z = -0.1 - k * 0.03; }
      for (let k = 0; k < 7; k++) { const lf = new THREE.Mesh(new THREE.ConeGeometry(0.22, 2.2, 4), mat("#4a8a3a")); const a = k / 7 * Math.PI * 2; lf.position.set(1.0 + Math.cos(a) * 0.9, 4.2, Math.sin(a) * 0.9); lf.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2 - Math.PI / 2 * 0); lf.rotation.z = Math.PI / 2 * Math.cos(a) * -1 + 0; lf.lookAt(1.0 + Math.cos(a) * 3, 3.4, Math.sin(a) * 3); lf.rotateX(Math.PI / 2); g.add(lf); }
      plants.push(g);
    });
    const um = new THREE.Group(); um.position.set(10, -0.2, 3); scene.add(um);
    cyl(0.03, 0.03, 2.2, "#f3efe6", 0, 1.1, 0, um, 6); const top = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.5, 12), mat("#e8473a")); top.position.y = 2.25; um.add(top);
    box(0.8, 0.1, 1.8, "#f3efe6", 0.9, 0.2, 0.5, um); box(0.8, 0.5, 0.1, "#f3efe6", 0.9, 0.45, -0.4, um).rotation.x = -0.5;
    const bl = sph(0.25, "#f6c445", 8, 0.05, 6.5, scene, 12, 10);
  }
}
let snowPts = null, seaMesh = null;
function glowBulbRet(x, y, z, col, s) { glowBulb(x, y, z, col || 0xffd27a, s || 0.8); return bulbs[bulbs.length - 1]; }

let MODS = {};
function grab(name, n0) {
  const g = MODS[name] || (MODS[name] = new THREE.Group());
  scene.children.slice(n0).forEach((k) => g.add(k));
  scene.add(g);
}
function buildRoom() {
  const TH = T(); REMAP = TH.remap || null;
  let floorTex, wallTex;
  if (TH.floor) floorTex = TH.floor(); else { floorTex = woodTexture("#c08a5a", "#6b3f20", 8, false, 512, 512); floorTex.repeat.set(3.2, 2.7); }
  if (TH.wall) wallTex = TH.wall(); else { wallTex = woodTexture("#dcb58a", "#8a5a38", 10, false, 512, 512); wallTex.repeat.set(2.5, 1); }
  const wallTex2 = wallTex.clone(); wallTex2.needsUpdate = true; wallTex2.repeat.set(wallTex.repeat.x * 0.64, wallTex.repeat.y);
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
  [[-1.25, 1], [1.65, -1]].forEach(([x, s]) => {
    const c = new THREE.Group(); c.position.set(x, 2.9, -3.86); scene.add(c);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.9, 0.05), mat("#c9746a")); m.position.y = -0.95; m.castShadow = true; c.add(m);
    for (let i = 0; i < 3; i++) box(0.04, 1.9, 0.07, "#b5655c", -0.15 + i * 0.15, -0.95, 0.01, c);
    c.userData.s = s; curtains.push(c);
  });
  box(3.4, 0.05, 0.05, "#5a3a22", 0.2, 2.92, -3.86, scene);
  beam = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.6), new THREE.MeshBasicMaterial({ color: 0xffe2b0, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  beam.position.set(0.5, 1.2, -2.6); beam.rotation.x = -0.95; scene.add(beam);

  // 家具分組：主題房間可以把某一組藏起來或移位置
  MODS = {}; let n0 = scene.children.length;
  // 火爐（左牆）
  const fp = new THREE.Group(); fp.position.set(-4.75, 0, -1.6); scene.add(fp);
  const stone = mat("#b4a08c");
  box(0.7, 1.5, 2.0, stone, 0.1, 0.75, 0, fp);
  box(0.9, 0.12, 2.3, "#7a4a2a", 0.15, 1.56, 0, fp);
  box(0.75, 0.08, 2.3, "#9c8b7a", 0.2, 0.04, 0, fp);
  const hole = box(0.2, 0.75, 1.1, "#2a1c16", 0.38, 0.5, 0, fp); hole.castShadow = false;
  for (let i = 0; i < 6; i++) box(0.04, 0.16, 0.3, "#a38f7b", 0.46, 0.25 + (i % 3) * 0.42, -0.75 + (i > 2 ? 1.5 : 0), fp);
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
  const clk = new THREE.Group(); clk.position.set(-4.95, 2.45, -1.6); clk.rotation.y = Math.PI / 2; scene.add(clk);
  cyl(0.3, 0.3, 0.06, "#8a5a38", 0, 0, 0, clk).rotation.x = Math.PI / 2;
  const face = cyl(0.25, 0.25, 0.07, "#f8f4ec", 0, 0, 0.01, clk); face.rotation.x = Math.PI / 2;
  box(0.02, 0.16, 0.02, "#2a2620", 0, 0.07, 0.05, clk); const hh = box(0.02, 0.11, 0.02, "#2a2620", 0.04, -0.02, 0.05, clk); hh.rotation.z = 1.9;
  pendulum = new THREE.Group(); pendulum.position.set(0, -0.28, 0.02); clk.add(pendulum);
  box(0.025, 0.4, 0.02, "#c99a3e", 0, -0.2, 0, pendulum); cyl(0.07, 0.07, 0.02, "#e8b93a", 0, -0.42, 0, pendulum).rotation.x = Math.PI / 2;

  grab("fire", n0); n0 = scene.children.length;
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

  grab("books", n0); n0 = scene.children.length;
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

  grab("bar", n0); n0 = scene.children.length;
  // 零食櫃
  const sn = new THREE.Group(); sn.position.set(4.3, 0, -3.72); scene.add(sn);
  box(0.06, 2.0, 0.5, "#8a5a38", -0.57, 1.0, 0, sn); box(0.06, 2.0, 0.5, "#8a5a38", 0.57, 1.0, 0, sn); box(1.2, 0.06, 0.5, "#8a5a38", 0, 1.97, 0, sn); box(1.2, 2.0, 0.04, "#7a4a2a", 0, 1.0, -0.23, sn); box(1.08, 1.88, 0.02, "#f3e3c6", 0, 1.0, -0.2, sn);
  [0.06, 0.62, 1.18, 1.74].forEach((y) => box(1.08, 0.05, 0.44, "#7a4a2a", 0, y, 0.02, sn));
  [["#e7a6a8", -0.35], ["#e0b04f", -0.12], ["#7fa6c9", 0.12], ["#c2453b", 0.35]].forEach(([c, x], i) => box(0.18, 0.3 + (i % 2) * 0.08, 0.2, c, x, 1.18 + 0.17 + (i % 2) * 0.04, 0.05, sn));
  [-0.3, 0, 0.3].forEach((x) => { const j = cyl(0.12, 0.12, 0.34, new THREE.MeshStandardMaterial({ color: 0xf8f4ec, transparent: true, opacity: 0.55, roughness: 0.2 }), x, 0.81, 0.05, sn); j.castShadow = false; sph(0.07, "#c98f52", x, 0.75, 0.05, sn); sph(0.06, "#c98f52", x + 0.04, 0.85, 0.05, sn); });
  [-0.3, 0.05, 0.35].forEach((x, i) => { const b = box(0.24, 0.18, 0.24, ["#e0b04f", "#e7a6a8", "#8fae7a"][i], x, 0.18, 0.05, sn); b.rotation.y = i * 0.2; });
  box(0.9, 0.25, 0.3, "#f8f4ec", 0, 1.88, 0.05, sn);

  grab("snack", n0); n0 = scene.children.length;
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
  const noteTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"); g.fillStyle = "#fff"; g.font = "bold 48px serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("♪", 32, 34); return new THREE.CanvasTexture(c); })();
  for (let i = 0; i < 4; i++) {
    const n = new THREE.Sprite(new THREE.SpriteMaterial({ map: noteTex, color: [0xc2453b, 0x5d7fa8, 0xe0b04f, 0x7b9c68][i], transparent: true, depthWrite: false }));
    n.scale.setScalar(0.22); n.userData = { ph: i / 4 }; scene.add(n); notes.push(n);
  }
  grab("tv", n0); n0 = scene.children.length;
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
  grab("sofa", n0); n0 = scene.children.length;
  // 單人沙發（面向火爐）和前面的小雙人沙發
  const arm1 = makeSofa(0.85, "#8fae7a", "#9cbf7a"); arm1.position.set(-3.0, 0, -0.85); arm1.rotation.y = -2.09; scene.add(arm1);
  box(0.3, 0.03, 0.4, "#e7a6a8", 0.1, 0.62, -0.1, arm1).rotation.y = 0.3;
  grab("arm", n0); n0 = scene.children.length;
  const love = makeSofa(1.5, "#d9a77e", "#e8c9a0"); love.position.set(-2.85, 0, 3.8); love.rotation.y = Math.PI; scene.add(love);
  box(0.32, 0.3, 0.14, "#c2453b", -0.5, 0.7, -0.2, love).rotation.x = -0.2;
  grab("love", n0); n0 = scene.children.length;
  // 落地燈（沙發旁）
  const fl = new THREE.Group(); fl.position.set(-2.6, 0, 0.55); scene.add(fl);
  cyl(0.16, 0.18, 0.04, "#5a3a22", 0, 0.02, 0, fl, 16); cyl(0.018, 0.018, 1.55, "#5a3a22", 0, 0.8, 0, fl, 6);
  const fsh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.24, 0.28, 20, 1, true), mat("#f3e3c6", { side: THREE.DoubleSide, emissive: 0xffc070, emissiveIntensity: 0.35 })); fsh.position.y = 1.62; fl.add(fsh);
  floorLight = new THREE.PointLight(0xffc98a, 1.4, 4, 1.6); floorLight.position.set(-2.6, 1.5, 0.55); scene.add(floorLight);
  grab("lamp", n0); n0 = scene.children.length;
  // 貓窩和一隻睡覺的貓
  const cb = new THREE.Group(); cb.position.set(-3.85, 0, -2.8); scene.add(cb);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.08, 10, 24), mat("#d9a77e")); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.08; cb.add(ring);
  cyl(0.24, 0.24, 0.05, "#e8c9a0", 0, 0.03, 0, cb, 20);
  houseCat = new THREE.Group(); houseCat.position.y = 0.06; cb.add(houseCat);
  const cbody = sph(0.15, "#8a8580", 0, 0.09, 0, houseCat); cbody.scale.set(1.1, 0.65, 0.9);
  sph(0.09, "#8a8580", 0.12, 0.1, 0.06, houseCat);
  [0.07, 0.17].forEach((x) => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 4), mat("#8a8580")); e.position.set(x, 0.18, 0.06); houseCat.add(e); });
  const ctail = cap(0.022, 0.2, "#8a8580", houseCat); ctail.position.set(-0.08, 0.05, 0.13); ctail.rotation.set(Math.PI / 2, 0, 1.2);
  grab("cat", n0); n0 = scene.children.length;
  const bb = sph(0.42, "#e0b04f", 6.05, 0.22, 2.4, scene, 20, 14); bb.scale.set(1, 0.55, 1);
  const bb2 = sph(0.3, "#e0b04f", 6.27, 0.42, 2.28, scene, 16, 12); bb2.scale.set(1, 0.9, 0.6); bb2.rotation.y = -1.0;
  grab("bean", n0); n0 = scene.children.length;
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
  grab("bar", n0); n0 = scene.children.length;
  const bd = new THREE.Group(); bd.position.set(6.6, 0, -2.0); bd.rotation.y = -0.7; scene.add(bd);
  [-1, 1].forEach((sd) => { const leg = box(0.04, 1.0, 0.04, "#7a4a2a", 0, 0.5, sd * 0.18, bd); leg.rotation.x = sd * 0.18; });
  box(0.03, 0.6, 0.45, "#2f3a34", 0, 0.75, 0, bd); box(0.035, 0.64, 0.49, "#8a5a38", -0.003, 0.75, 0, bd);
  const chalkC = document.createElement("canvas"); chalkC.width = 128; chalkC.height = 170; const cg = chalkC.getContext("2d");
  cg.fillStyle = "#2f3a34"; cg.fillRect(0, 0, 128, 170); cg.fillStyle = "#f3efe6"; cg.textAlign = "center";
  cg.font = "bold 22px sans-serif"; cg.fillText("CAFÉ", 64, 34); cg.font = "16px sans-serif"; cg.fillText("拿鐵 ☕", 64, 70); cg.fillText("可可 🍫", 64, 96); cg.fillText("鬆餅 🧇", 64, 122);
  cg.strokeStyle = "#e7a6a8"; cg.beginPath(); cg.moveTo(24, 44); cg.lineTo(104, 44); cg.stroke(); cg.fillStyle = "#ffe08a"; cg.fillText("今天也加油", 64, 154);
  const ctex = new THREE.CanvasTexture(chalkC); ctex.colorSpace = THREE.SRGBColorSpace;
  const cface = new THREE.Mesh(new THREE.PlaneGeometry(0.43, 0.58), new THREE.MeshBasicMaterial({ map: ctex })); cface.rotation.y = Math.PI / 2; cface.position.set(0.018, 0.75, 0); bd.add(cface);
  grab("board", n0); n0 = scene.children.length;
  // 小圓咖啡桌與兩張椅子
  const cafe = new THREE.Group(); cafe.position.set(5.6, 0, 3.6); scene.add(cafe);
  cyl(0.36, 0.36, 0.04, "#b07a4f", 0, 0.72, 0, cafe, 24); cyl(0.03, 0.03, 0.7, "#2a2620", 0, 0.36, 0, cafe, 8); cyl(0.2, 0.22, 0.03, "#2a2620", 0, 0.015, 0, cafe, 16);
  cyl(0.045, 0.04, 0.08, "#f8f4ec", 0.1, 0.78, 0.05, cafe, 12); cyl(0.06, 0.06, 0.006, "#f8f4ec", 0.1, 0.742, 0.05, cafe, 14);
  sph(0.06, "#c98f52", -0.12, 0.76, -0.05, cafe, 10, 8).scale.y = 0.5;
  [[-0.6, 0.4], [0.55, -0.45]].forEach(([x, z]) => { const st2 = new THREE.Group(); st2.position.set(x, 0, z); st2.rotation.y = Math.atan2(-x, -z); cafe.add(st2); cyl(0.2, 0.2, 0.04, "#c26f5e", 0, 0.45, 0, st2, 16); box(0.36, 0.34, 0.03, "#2a2620", 0, 0.66, -0.18, st2); [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]].forEach(([a, b]) => cyl(0.015, 0.015, 0.45, "#2a2620", a, 0.225, b, st2, 6)); });
  grab("cafeT", n0);

  [[1.62, -3.72, 2.35], [-4.72, -3.0, 2.4], [3.9, -3.72, 2.55]].forEach(([x, z, y]) => {
    const hp = new THREE.Group(); hp.position.set(x, 3.15, z); scene.add(hp);
    box(0.008, 3.15 - y, 0.008, "#5a3a22", 0, -(3.15 - y) / 2, 0, hp);
    cyl(0.12, 0.09, 0.14, "#f3efe6", 0, -(3.15 - y) - 0.07, 0, hp);
    for (let i = 0; i < 5; i++) { const v = cap(0.035, 0.25 + (i % 3) * 0.12, i % 2 ? "#7b9c68" : "#8fae7a", hp); v.position.set(Math.cos(i * 1.3) * 0.1, -(3.15 - y) - 0.2 - (i % 3) * 0.05, Math.sin(i * 1.3) * 0.1); }
    plants.push(hp);
  });

  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48), new THREE.MeshStandardMaterial({ map: rugTexture(TH.rug), roughness: 1 }));
  rug.visible = TH.rug !== null;
  rug.rotation.x = -Math.PI / 2; rug.position.set(0.3, 0.005, 1.1); rug.scale.set(1.35, 0.8, 1); rug.receiveShadow = true; scene.add(rug);
  const rug2 = new THREE.Mesh(new THREE.CircleGeometry(0.9, 32), mat("#d9a77e")); rug2.rotation.x = -Math.PI / 2; rug2.position.set(-3.6, 0.006, -1.6); rug2.scale.set(0.8, 1.2, 1); rug2.receiveShadow = true; scene.add(rug2);
  const LY = LAYOUTS[THEME] || {}, LH = LY.hide || [];
  Object.keys(MODS).forEach((k) => { MODS[k].visible = LH.indexOf(k) < 0; const d = (LY.move || {})[k]; if (d) MODS[k].position.set(d[0], 0, d[1]); });
  rug2.visible = LH.indexOf("fire") < 0;

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
  // 牆上的畫（主題房間換成自己的裝飾）
  if (!TH.decor) {
  box(0.7, 0.5, 0.04, "#8a5a38", -1.6, 2.2, -3.98, scene);
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.4), new THREE.MeshBasicMaterial({ map: skyTexture("day") })); pic.position.set(-1.6, 2.2, -3.955); scene.add(pic);
  box(0.6, 0.45, 0.04, "#8a5a38", 2.5, 2.25, -3.98, scene);
  const pic2 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), mat("#e7a6a8")); pic2.position.set(2.5, 2.25, -3.955); scene.add(pic2);
  sph(0.09, "#c2453b", 2.5, 2.25, -3.94, scene);
  }

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
    const booth = TH.allBooth ? "board" : st.booth;
    if (booth === "plants") {
      // 長條花槽擋在書桌前面，像咖啡廳的座位
      box(1.3, 0.42, 0.26, "#8a5a38", 0, 0.21, 0.55, d); box(1.24, 0.04, 0.2, "#5a3a22", 0, 0.42, 0.55, d);
      for (let k = 0; k < 6; k++) { const lf = sph(0.17, k % 2 ? "#7b9c68" : "#8fae7a", -0.52 + k * 0.21, 0.6 + (k % 3) * 0.1, 0.55 + (k % 2 ? 0.04 : -0.04), d, 12, 10); lf.scale.set(0.9, 1.5, 0.8); }
      [-1, 1].forEach((sd) => { const tall = cap(0.03, 0.5, "#6f9a62", d); tall.position.set(sd * 0.58, 0.85, 0.55); const top2 = sph(0.15, "#7b9c68", sd * 0.58, 1.15, 0.55, d, 10, 8); top2.scale.y = 1.4; });
      plants.push(d);
    } else if (booth) {
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
    d.userData.seat = i; ch.userData.seat = i;
    seatProps[i] = { group: d, chair: ch, prop, act: "" };
  });

  // 粒子：火星、灰塵、蒸氣
  embers = makeParticles(40, 0xffa040, 0.06, () => new THREE.Vector3(-4.25 + Math.random() * 0.15, 0.3 + Math.random() * 0.6, -1.6 + (Math.random() - 0.5) * 0.6));
  dust = makeParticles(70, 0xfff1d0, 0.035, () => new THREE.Vector3(-0.8 + Math.random() * 2.4, 0.2 + Math.random() * 2.4, -3.6 + Math.random() * 2.6));
  steam = makeParticles(14, 0xffffff, 0.1, () => new THREE.Vector3(2.2 + (Math.random() - 0.5) * 0.06, 1.62, -3.6));
  embers.pts.visible = LH.indexOf("fire") < 0; steam.pts.visible = LH.indexOf("bar") < 0;
  if (TH.fire) { fireMeshes.forEach((f, i) => f.material.color.setHex(TH.fire[i % 3])); fireLight.color.setHex(TH.fire[0]); embers.pts.material.color.setHex(TH.fire[1]); }
  if (TH.decor) TH.decor();
  REMAP = null;
  if (LY.build) LY.build();
  if (RICH[THEME]) RICH[THEME].build();
  snowPts = null; seaMesh = null; buildOutside();
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
const SIT_POSES = ["sofa", "pet", "sitmug", "sitbook"];
// 找一個做某些動作的空位置（運動、吃點心…），沒有就回 -1
function pickSpotPose(id, poses) {
  const ok = SPOTS.map((s, i) => i).filter((i) => poses.indexOf(SPOTS[i].pose) >= 0 && (!reserved[i] || reserved[i] === id));
  if (!ok.length) return -1;
  const i = ok[Math.floor(Math.random() * ok.length)];
  releaseSpot(id); reserved[i] = id; return i;
}
function releaseSpot(id) { Object.keys(reserved).forEach((k) => { if (reserved[k] === id) delete reserved[k]; }); }

function tagText(m) { return m.name; }
function addChar(m, seat) {
  const c = makeChar(m.look);
  scene.add(c.root);
  if (c.cat) scene.add(c.cat);
  c.root.userData.cid = m.id;
  const tag = document.createElement("div"); tag.className = "k3-tag" + (m.me ? " me" : "");
  tag.nm = document.createElement("span"); tag.nm.textContent = tagText(m); tag.ft = document.createElement("span"); tag.ft.className = "k3-ft"; tag.append(tag.nm, tag.ft);
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
  lastList = members;
  if (!mounted) return;
  const list = members.slice(0, 6), ids = {};
  // 座位隨機：用「id + 進房時間」算出想坐的位子，被坐走就往下一個空位；每次進房都不同，但每台手機看到的一樣
  const used = {}, seatOf = {};
  // 自己點桌子選的位子優先（同一個位子有兩個人選，先進房的拿到）
  list.forEach((m) => { const s = m.seat; if (s >= 0 && s < SEATS.length && !used[s]) { used[s] = 1; seatOf[m.id] = s; } });
  list.forEach((m) => {
    if (seatOf[m.id] != null) return;
    let h = 7; const key = m.id + ":" + (m.joined || 0);
    for (let k = 0; k < key.length; k++) h = (h * 31 + key.charCodeAt(k)) % 1000003;
    let si = h % SEATS.length; while (used[si]) si = (si + 1) % SEATS.length;
    used[si] = 1; seatOf[m.id] = si;
  });
  list.forEach((m) => {
    const i = seatOf[m.id];
    ids[m.id] = 1;
    let st = chars[m.id];
    const lk = JSON.stringify(m.look || {});
    if (st && st.lookKey !== lk) { const keep = { pos: st.pos.clone(), ry: st.ry, mode: st.mode, spot: st.spot }; removeChar(m.id); st = addChar(m, i); if (keep.mode !== "sit" || m.up) { st.pos.copy(keep.pos); st.ry = keep.ry; st.mode = keep.mode === "walk" ? "idle" : keep.mode; st.spot = keep.spot; if (keep.spot >= 0) reserved[keep.spot] = m.id; } }
    if (!st) st = addChar(m, i);
    const wasUp = st.m.up;
    st.m = m; st.tag.nm.textContent = tagText(m);
    if (st.seat !== i) { st.seat = i; if (!m.up) { const p = seatPos(i); walkTo(st, p, "sit"); } }
    if (m.up && !wasUp) {
      // 起身：從椅子後面站起來，走去一個地方
      if (st.mode === "sit") st.pos.z -= 0.0;
      const si = pickSpot(m.id); st.spot = si; walkTo(st, SPOTS[si], "idle");
    } else if (!m.up && wasUp) {
      releaseSpot(m.id); st.spot = -1; walkTo(st, seatPos(st.seat), "sit");
    }
    st.bub.textContent = m.bubble || ""; st.bub.hidden = !m.bubble;
    // 說了快速對話就做對應的動作，做 3 秒
    if (m.emo && m.emoAt && m.emoAt !== st.emoAt) {
      st.emoAt = m.emoAt; st.emo = m.emo; st.emoT0 = performance.now();
      // 「有人要咖啡嗎」：走到咖啡機泡一杯，再端回座位
      if (m.emo === "coffee" && st.mode !== "walk" && st.mode !== "coffee") { st.emo = null; releaseSpot(m.id); st.spot = -1; walkTo(st, COFFEE_SPOT, "coffee"); }
      // 「我先喝口水」：不在座位上就先走回座位再喝
      else if (m.emo === "drink" && st.mode !== "sit" && st.mode !== "coffee") { st.emo = null; st.sip = true; releaseSpot(m.id); st.spot = -1; walkTo(st, seatPos(st.seat), "sit"); }
      // 「運動一下吧」「肚子好餓」：休息中就走去這間房能運動／吃東西的地方
      else if ((m.emo === "exercise" || m.emo === "hungry") && m.up && st.mode !== "coffee") {
        const si = pickSpotPose(m.id, m.emo === "exercise" ? ["exercise", "squat", "yoga", "run"] : ["snack", "mug", "sitmug"]);
        if (si >= 0) { st.emo = null; st.spot = si; walkTo(st, SPOTS[si], "idle"); }
      }
    }
  });
  Object.keys(chars).forEach((id) => { if (!ids[id]) removeChar(id); });
  const me = list.find((m) => m.me);
  if (focusMe && me && chars[me.id]) {
    focusMe = false;
    const p = seatPos(chars[me.id].seat);
    zoomT = focusZoom; panT.set((p.x - target.x) * 0.92, 0, (p.z - target.z) * 0.92); // 幾乎置中（座位隨機，角落的位子也要看得到自己）；clampPan 會擋住不讓看到房間外面 clampPan();
    zoom = zoomT; panOff.copy(panT);
  }
  // 書桌上的東西：誰坐哪張桌子，那張桌子就放他的活動道具（座位是隨機的，要照 st.seat 找人）
  const atSeat = {}; list.forEach((m) => { const st = chars[m.id]; if (st) atSeat[st.seat] = m; });
  for (let i = 0; i < SEATS.length; i++) {
    const m = atSeat[i], act = m ? (ACTS3.indexOf(m.act) >= 0 ? m.act : "read") : "";
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
      if (st.after === "sit") { const p = seatPos(st.seat); st.pos.set(p.x, 0, p.z); st.ry = SEATS[st.seat].ry; st.mode = "sit"; if (st.carry || st.sip) { st.carry = st.sip = false; st.emo = "drink"; st.emoT0 = now; if (st.m.up) st.resumeAt = now + 4000; } }
      else if (st.after === "coffee") { st.mode = "coffee"; st.ry = Math.PI; st.brewT0 = now; }
      else { const sp = SPOTS[st.spot] || { ry: st.ry }; st.mode = "idle"; st.ry = sp.ry; st.waitUntil = now + 6000 + Math.random() * 8000; }
    } else {
      const dx = nxt.x - st.pos.x, dz = nxt.z - st.pos.z, d = Math.hypot(dx, dz), sp = 1.15 * dt;
      if (d <= sp) { st.pos.x = nxt.x; st.pos.z = nxt.z; st.path.shift(); }
      else { st.pos.x += dx / d * sp; st.pos.z += dz / d * sp; }
      const want = Math.atan2(dx, dz);
      let diff = want - st.ry; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
      st.ry += diff * Math.min(1, dt * 10);
    }
  } else if (st.mode === "coffee" && now - st.brewT0 > BREW_MS) {
    st.carry = true;
    if (st.m.up) { const si = pickSpot(st.m.id); st.spot = si; walkTo(st, SPOTS[si], "idle"); } else walkTo(st, seatPos(st.seat), "sit");
  } else if (st.mode === "sit" && st.resumeAt && now > st.resumeAt) {
    // 休息中回座位喝完水，再起來走走
    st.resumeAt = 0;
    if (st.m.up) { const si = pickSpot(st.m.id); st.spot = si; walkTo(st, SPOTS[si], "idle"); }
  } else if (st.mode === "idle" && st.m.up && now > st.waitUntil) {
    const si = pickSpot(st.m.id); st.spot = si; walkTo(st, SPOTS[si], "idle");
  }
  c.root.position.copy(st.pos); c.root.rotation.y = st.ry;
  const pose0 = st.mode === "walk" ? "walk" : st.mode === "sit" ? "sit" : st.mode === "coffee" ? "brew" : (SPOTS[st.spot] ? SPOTS[st.spot].pose : "stand");
  const brewK = st.mode === "coffee" ? (now - st.brewT0) / BREW_MS : 0;
  if (st.carry && st.mode === "idle") st.carry = false;
  c.book.visible = pose0 === "book" || pose0 === "sitbook";
  c.cup.visible = (pose0 === "mug" && st.treat !== "eat") || pose0 === "sitmug" || (pose0 === "brew" && brewK > 0.55) || (pose0 === "walk" && !!st.carry);
  c.cookie.visible = pose0 === "snack" || (pose0 === "mug" && st.treat === "eat");
  const pose = pose0, sp = SPOTS[st.spot];
  let shut = false;
  c.hips.position.y = 0.36; c.hips.position.z = 0; c.torso.rotation.set(0, 0, 0); c.head.rotation.set(0, 0, 0);  // 每一幀都從站直開始，做完動作才不會歪
  c.legs.forEach((l) => l.rotation.set(0, 0, 0));
  c.arms.forEach((a, i) => a.rotation.set(0, 0, (i ? 1 : -1) * 0.12));
  const breathe = Math.sin(s * 2) * 0.01;
  c.torso.position.y = breathe;
  if (pose === "walk") {
    const w = Math.sin(s * 9) * 0.6;
    c.legs[0].rotation.x = w; c.legs[1].rotation.x = -w;
    c.arms[0].rotation.x = -w * 0.7; c.arms[1].rotation.x = w * 0.7;
    c.hips.position.y = 0.36 + Math.abs(Math.cos(s * 9)) * 0.04;
    if (st.carry) { c.arms[1].rotation.x = -1.2; c.arms[1].rotation.z = -0.2; }
  } else if (pose === "brew") {
    // 先按咖啡機、等一下，再把杯子拿起來
    if (brewK < 0.25) { c.arms[1].rotation.x = -1.6 + Math.sin(s * 10) * 0.12; c.arms[1].rotation.z = -0.1; }
    else if (brewK < 0.55) { c.head.rotation.y = Math.sin(s * 1.5) * 0.15; c.head.rotation.x = 0.12; c.arms[1].rotation.z = -0.25; }
    else { const up = Math.max(0, Math.sin((brewK - 0.55) * 9)); c.arms[1].rotation.x = -0.9 - up * 1.3; c.arms[1].rotation.z = -0.15 - up * 0.4; c.head.rotation.x = -up * 0.2; }
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
      if (act === "music") { c.head.rotation.x = 0.2; c.head.rotation.z = Math.sin(s * 2) * 0.06; c.arms[1].rotation.x = -1.25; c.arms[1].rotation.z = 0.45; c.arms[0].rotation.x = -0.8 + Math.sin(s * 9) * 0.12; c.arms[0].rotation.z = 0.3; }
      if (act === "piano") { c.head.rotation.x = 0.22; c.head.rotation.z = Math.sin(s * 1.6) * 0.05; c.arms[0].rotation.x = -1.2 + Math.max(0, Math.sin(s * 6)) * 0.12; c.arms[1].rotation.x = -1.2 + Math.max(0, Math.sin(s * 6 + 2)) * 0.12; c.arms[0].rotation.z = 0.25 + Math.sin(s * 0.9) * 0.12; c.arms[1].rotation.z = -0.25 + Math.sin(s * 0.9) * 0.12; }
      if (act === "sing") { c.head.rotation.x = -0.05 + Math.sin(s * 1.2) * 0.04; c.arms[0].rotation.x = -0.6; c.arms[1].rotation.x = -1.7 + Math.sin(s * 1.5) * 0.15; c.arms[1].rotation.z = -0.5; }
      if (act === "craft") { c.arms[0].rotation.x = -1.2 + Math.sin(s * 6) * 0.08; c.arms[1].rotation.x = -1.2 - Math.sin(s * 6) * 0.08; c.arms[0].rotation.z = 0.45; c.arms[1].rotation.z = -0.45; }
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
  } else if (pose === "sitmug" || pose === "sitbook") {
    // 坐著喝熱飲或看書
    c.hips.position.y = (sp && sp.seat) || 0.45; c.legs.forEach((l) => { l.rotation.x = -1.45; });
    if (pose === "sitmug") {
      const cyc = s % 4.5, up = cyc < 1.3 ? Math.sin(cyc / 1.3 * Math.PI) : 0;
      c.arms[1].rotation.x = -0.9 - up * 1.4; c.arms[1].rotation.z = -0.15 - up * 0.45; c.arms[0].rotation.x = -0.5;
      c.head.rotation.x = -up * 0.25; c.head.rotation.y = up ? 0 : Math.sin(s * 0.4) * 0.3;
    } else {
      c.arms.forEach((a, i) => { a.rotation.x = -1.2; a.rotation.z = (i ? -1 : 1) * 0.55; });
      c.head.rotation.x = 0.38; const ph = (s % 3.6) / 0.7;
      c.book.userData.page.rotation.z = ph < 1 ? Math.PI * (1 - Math.cos(ph * Math.PI)) / 2 : 0;
    }
  } else if (pose === "exercise") {
    // 開合跳
    const k = Math.abs(Math.sin(s * 4.5));
    c.arms[0].rotation.z = -(0.15 + k * 2.1); c.arms[1].rotation.z = 0.15 + k * 2.1; c.arms.forEach((a) => { a.rotation.x = -0.3 * k; });
    c.legs[0].rotation.z = -k * 0.3; c.legs[1].rotation.z = k * 0.3;
    c.hips.position.y = 0.36 + Math.abs(Math.cos(s * 4.5)) * 0.07;
  } else if (pose === "squat") {
    // 深蹲：屁股往後坐，手往前平舉
    const k = (1 - Math.cos(s * 2.6)) / 2, a = k * 1.1;
    c.legs.forEach((l) => { l.rotation.x = -a; });
    c.hips.position.y = 0.36 * Math.cos(a) + 0.01; c.hips.position.z = -Math.sin(a) * 0.3;
    c.torso.rotation.x = k * 0.45; c.arms.forEach((a2, i) => { a2.rotation.x = -1.5 * k; a2.rotation.z = (i ? 1 : -1) * 0.1; });
  } else if (pose === "yoga") {
    // 樹式：單腳站、雙手舉高，眼睛閉著
    const sw = Math.sin(s * 0.9) * 0.04;
    c.legs[1].rotation.z = 0.9; c.legs[1].rotation.x = -0.45;
    c.arms.forEach((a, i) => { a.rotation.x = -1.35; a.rotation.z = (i ? -1 : 1) * 0.55; }); c.torso.rotation.z = sw; shut = true; // 雙手合十
  } else if (pose === "run") {
    // 跑步機
    const w = Math.sin(s * 12) * 0.75;
    c.legs[0].rotation.x = w; c.legs[1].rotation.x = -w;
    c.arms[0].rotation.x = -0.6 - w * 0.6; c.arms[1].rotation.x = -0.6 + w * 0.6;
    c.hips.position.y = 0.36 + Math.abs(Math.cos(s * 12)) * 0.06; c.torso.rotation.x = 0.12;
  } else if (pose === "float") {
    // 無重力：飄在半空慢慢轉
    c.hips.position.y = 0.8 + Math.sin(s * 1.3) * 0.12;
    c.legs[0].rotation.x = -0.5 + Math.sin(s * 0.9) * 0.2; c.legs[1].rotation.x = -0.2 - Math.sin(s * 0.9) * 0.2;
    c.arms[0].rotation.z = -(1.0 + Math.sin(s * 1.1) * 0.3); c.arms[1].rotation.z = 1.0 + Math.cos(s * 1.1) * 0.3;
    c.torso.rotation.x = -0.15 + Math.sin(s * 0.7) * 0.1; c.torso.rotation.z = Math.sin(s * 0.5) * 0.15;
  } else if (pose === "lounge") {
    // 躺椅：往後躺，雙手枕在頭後面
    c.hips.position.y = 0.34; c.hips.position.z = -0.15; c.torso.rotation.x = -0.75; c.head.rotation.x = 0.35;
    c.legs.forEach((l) => { l.rotation.x = -1.35; });
    c.arms.forEach((a, i) => { a.rotation.x = -2.7; a.rotation.z = (i ? -1 : 1) * 0.8; });
    shut = Math.sin(s * 0.3) > 0.2;
  } else if (pose === "tea" || pose === "zen") {
    // 坐在坐墊上：泡茶或打坐
    c.hips.position.y = 0.17; c.legs.forEach((l, i) => { l.rotation.x = -1.45; l.rotation.z = pose === "zen" ? (i ? 0.4 : -0.4) : 0; });
    if (pose === "zen") { c.arms.forEach((a, i) => { a.rotation.x = -0.55; a.rotation.z = (i ? -1 : 1) * 0.5; }); c.torso.position.y = Math.sin(s * 0.8) * 0.015; shut = true; }
    else { c.head.rotation.x = 0.3; c.arms[0].rotation.x = -1.0; c.arms[0].rotation.z = 0.3; c.arms[1].rotation.x = -1.1 + Math.sin(s * 14) * 0.06; c.arms[1].rotation.z = -0.2 + Math.sin(s * 14) * 0.12; }
  } else if (pose === "gaze") {
    // 湊近望遠鏡（或窗）看外面
    c.torso.rotation.x = 0.25; c.head.rotation.x = 0.05;
    c.arms.forEach((a, i) => { a.rotation.x = -1.7; a.rotation.z = (i ? -1 : 1) * 0.35; });
    c.head.rotation.y = Math.sin(s * 0.3) * 0.1;
  } else if (pose === "chalk") {
    // 在黑板上寫字
    c.arms[1].rotation.x = -2.3 + Math.sin(s * 6) * 0.1; c.arms[1].rotation.z = -0.1 + Math.sin(s * 2.5) * 0.3;
    c.arms[0].rotation.x = -0.9; c.head.rotation.x = -0.1; c.head.rotation.y = Math.sin(s * 2.5) * 0.12;
  } else if (pose === "dance") {
    const w = Math.sin(s * 5);
    c.arms[0].rotation.z = -(1.3 + w * 0.8); c.arms[1].rotation.z = 1.3 - w * 0.8;
    c.torso.rotation.z = w * 0.15; c.head.rotation.z = -w * 0.1;
    c.hips.position.y = 0.36 + Math.abs(Math.sin(s * 10)) * 0.04;
    c.legs[0].rotation.x = Math.max(0, w) * -0.4; c.legs[1].rotation.x = Math.max(0, -w) * -0.4;
  } else {
    c.head.rotation.y = Math.sin(s * 0.5) * 0.5;
    c.arms.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * (0.12 + Math.sin(s * 1.2) * 0.04); });
  }
  // 快速對話的動作，疊在原本的姿勢上
  const emoK = st.emo ? (now - st.emoT0) / 3000 : 2;
  if (emoK < 1) {
    const e = st.emo, f = Math.sin(Math.min(1, emoK * 6) * Math.PI / 2) * Math.min(1, (1 - emoK) * 6); // 淡入淡出
    const L = c.arms[0], R = c.arms[1], mix = (o, k, v) => { o[k] = o[k] + (v - o[k]) * f; };
    if (e === "cheer") { mix(L.rotation, "z", -2.6 - Math.sin(s * 9) * 0.15); mix(R.rotation, "z", 2.6 + Math.sin(s * 9) * 0.15); mix(L.rotation, "x", 0); mix(R.rotation, "x", 0); if (pose !== "sit") c.hips.position.y += Math.abs(Math.sin(s * 9)) * 0.06 * f; }
    else if (e === "fist") { mix(R.rotation, "x", 0); mix(R.rotation, "z", 2.3 + Math.sin(s * 10) * 0.35); c.head.rotation.x -= 0.1 * f; }
    else if (e === "wave") { mix(R.rotation, "x", 0); mix(R.rotation, "z", 2.4 + Math.sin(s * 12) * 0.4); c.head.rotation.z = Math.sin(s * 3) * 0.08 * f; }
    else if (e === "yawn") { mix(R.rotation, "x", -2.5); mix(R.rotation, "z", -0.5); c.head.rotation.x -= 0.3 * f; c.torso.rotation.z = Math.sin(s * 2) * 0.05 * f; c.eyes.forEach((ey) => { ey.scale.y = 1.25 * (1 - 0.85 * f); }); }
    else if (e === "nod") { c.head.rotation.x += Math.sin(s * 8) * 0.25 * f; }
    else if (e === "drink" || e === "coffee") { const up = e === "drink" ? Math.max(0, Math.sin(s * 2.4)) : 0; mix(R.rotation, "x", e === "drink" ? -0.8 - up * 1.5 : -1.45); mix(R.rotation, "z", -0.15 - up * 0.45); c.cup.visible = c.cup.visible || f > 0.2; c.head.rotation.x -= up * 0.25 * f; }
    else if (e === "book") { mix(L.rotation, "x", -1.9); mix(R.rotation, "x", -1.9); mix(L.rotation, "z", 0.5); mix(R.rotation, "z", -0.5); c.book.visible = c.book.visible || f > 0.2; c.head.rotation.x -= 0.15 * f; }
    else if (e === "think") { mix(L.rotation, "x", -2.7); mix(R.rotation, "x", -2.7); mix(L.rotation, "z", 0.75); mix(R.rotation, "z", -0.75); c.head.rotation.y = Math.sin(s * 9) * 0.25 * f; }
    else if (e === "thumb") { mix(R.rotation, "x", -1.5); mix(R.rotation, "z", -0.1); c.head.rotation.z = 0.12 * f; }
    else if (e === "bow") { c.torso.rotation.x += 0.55 * f * Math.max(0, Math.sin(emoK * Math.PI * 2)); mix(L.rotation, "z", -0.05); mix(R.rotation, "z", 0.05); }
    else if (e === "exercise") { const k = Math.abs(Math.sin(s * 5)); mix(L.rotation, "x", 0); mix(R.rotation, "x", 0); mix(L.rotation, "z", -(0.2 + k * 2.0)); mix(R.rotation, "z", 0.2 + k * 2.0); if (pose !== "sit") c.hips.position.y += Math.abs(Math.cos(s * 5)) * 0.06 * f; }
    else if (e === "stretch") { mix(L.rotation, "x", -0.35); mix(R.rotation, "x", -0.35); mix(L.rotation, "z", -2.3); mix(R.rotation, "z", 2.3); c.torso.rotation.z += Math.sin(s * 1.6) * 0.12 * f; c.head.rotation.x -= 0.15 * f; shut = shut || f > 0.5; }
    else if (e === "clap") { const k = (Math.sin(s * 14) + 1) / 2; mix(L.rotation, "x", -1.35); mix(R.rotation, "x", -1.35); mix(L.rotation, "z", 0.05 + k * 0.45); mix(R.rotation, "z", -0.05 - k * 0.45); }
    else if (e === "dance") { const w = Math.sin(s * 5); mix(L.rotation, "x", 0); mix(R.rotation, "x", 0); mix(L.rotation, "z", -(1.3 + w * 0.8)); mix(R.rotation, "z", 1.3 - w * 0.8); c.torso.rotation.z += w * 0.15 * f; c.head.rotation.z = -w * 0.1 * f; }
    else if (e === "hungry") { mix(R.rotation, "x", -0.55); mix(R.rotation, "z", 0.55); mix(L.rotation, "x", -0.45); mix(L.rotation, "z", -0.45); c.head.rotation.z = 0.2 * f; c.head.rotation.x += 0.15 * f; c.torso.rotation.x += 0.12 * f; }
    else if (e === "breathe") { const k = (1 - Math.cos(emoK * Math.PI * 2)) / 2; mix(L.rotation, "x", 0); mix(R.rotation, "x", 0); mix(L.rotation, "z", -(0.2 + k * 2.0)); mix(R.rotation, "z", 0.2 + k * 2.0); c.head.rotation.x -= 0.15 * k * f; shut = shut || f > 0.5; }
  }
  const blink = (s % 4.3) < 0.12 ? 0.15 : 1;
  if (!(emoK < 1 && st.emo === "yawn")) c.eyes.forEach((e) => { e.scale.y = shut ? 0.15 : 1.25 * blink; });
  // 小貓跟著
  if (c.cat) {
    // 坐著時待在椅子旁邊偏後面，不要鑽到桌腳裡；走路時跟在旁邊
    const sitting = st.mode === "sit";
    const off = tmpV.set(sitting ? 0.6 : 0.45, 0, sitting ? -0.32 : 0.1).applyAxisAngle(new THREE.Vector3(0, 1, 0), st.ry);
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
  if (document.hidden) return;
  // 房間畫面沒顯示時（例如暫離）不畫圖，但人物照樣走動，回來時才看得到他慢慢走回座位
  if (!container.offsetParent) { const d0 = Math.min(0.05, clock.getDelta()), n0 = performance.now(); Object.values(chars).forEach((st) => animChar(st, d0, n0)); return; }
  const dt = Math.min(0.05, clock.getDelta()), now = performance.now(), t = now / 1000;
  fireMeshes.forEach((f, i) => { const k = 1 + Math.sin(t * (7 + i) + i) * 0.18 + Math.sin(t * 13 + i * 2) * 0.08; f.scale.set(1 - (k - 1) * 0.5, k, 1 - (k - 1) * 0.5); });
  fireLight.intensity = env.fire * (0.85 + Math.sin(t * 9) * 0.08 + Math.sin(t * 23) * 0.05 + Math.random() * 0.05);
  tickParticles(embers, dt, { rate: 0.6, move: (a, i, d) => { a[i + 1] += d * 0.9; a[i] += d * 0.15; a[i + 2] += Math.sin(t * 3 + i) * d * 0.2; } });
  tickParticles(dust, dt, { rate: 0.05, move: (a, i, d) => { a[i] += Math.sin(t * 0.3 + i) * d * 0.05; a[i + 1] += Math.cos(t * 0.2 + i) * d * 0.04; } });
  tickParticles(steam, dt, { rate: 0.5, move: (a, i, d, l) => { a[i + 1] += d * 0.35; a[i] += Math.sin(t * 2 + i) * d * 0.05; } });
  steam.pts.material.opacity = 0.45;
  bulbs.forEach((b) => { b.sp.material.opacity = 0.45 + Math.sin(t * 1.5 + b.phase) * 0.25; });
  spaceBlinks.forEach((b) => { b.visible = Math.sin(t * 2.2 + b.userData.ph) > -0.4; });
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
  else if (T().skyAnim && now > skyNext) { drawSky(env); skyNext = now + 80; }
  if (snowPts) { const a = snowPts.geometry.attributes.position.array; for (let i = 0; i < a.length; i += 3) { a[i + 1] -= dt * (0.6 + (i % 7) * 0.08); a[i] += Math.sin(t + i) * dt * 0.1; if (a[i + 1] < -0.2) a[i + 1] = 14; } snowPts.geometry.attributes.position.needsUpdate = true; }
  if (seaMesh) seaMesh.position.y = -0.24 + Math.sin(t * 0.8) * 0.02;
  curtains.forEach((c) => { c.rotation.x = Math.sin(t * 0.8 + c.userData.s) * 0.03; c.rotation.z = Math.sin(t * 0.6) * 0.015 * c.userData.s; });
  plants.forEach((p, i) => { p.rotation.z = Math.sin(t * 0.7 + i) * 0.02; });
  Object.values(chars).forEach((st) => animChar(st, dt, now));
  // 鏡頭：慢慢晃動
  zoom += (zoomT - zoom) * Math.min(1, dt * 10); panOff.lerp(panT, Math.min(1, dt * 10));
  const yy = yaw + dragYaw + Math.sin(t * 0.12) * 0.05, pp = pitch + dragPitch;
  const r = camR * zoom, tg = tmpT.copy(target).add(panOff);
  camera.position.set(tg.x + Math.sin(yy) * Math.cos(pp) * r, tg.y + Math.sin(pp) * r, tg.z + Math.cos(yy) * Math.cos(pp) * r);
  camera.lookAt(tg);
  renderer.render(scene, camera);
  // 名牌與對話泡泡
  const w = container.clientWidth, h = container.clientHeight;
  Object.values(chars).forEach((st) => {
    const sp0 = st.mode === "idle" && SPOTS[st.spot], sp0p = sp0 && sp0.pose, sitting = st.mode === "sit" || SIT_POSES.indexOf(sp0p) >= 0;
    tmpV.set(st.pos.x, sp0p === "float" ? 2.15 : sp0p === "tea" || sp0p === "zen" || sp0p === "lounge" ? 1.32 : sitting ? 1.62 : 1.72, st.pos.z).project(camera);
    const x = (tmpV.x * 0.5 + 0.5) * w, y = (-tmpV.y * 0.5 + 0.5) * h;
    st.tag.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(-50%,-100%)";
    st.bub.style.transform = "translate(" + x.toFixed(1) + "px," + (y - 22).toFixed(1) + "px) translate(-50%,-100%)";
  });
}

function clampYaw(v) { return Math.max(-0.55, Math.min(0.55, v)); }
function panBy(px, py) {
  const dx = px * 0.012 * zoomT, dy = py * 0.012 * zoomT, yy = yaw + dragYaw;
  panT.x -= Math.cos(yy) * dx + Math.sin(yy) * dy; panT.z -= -Math.sin(yy) * dx + Math.cos(yy) * dy;
  clampPan();
}
function setZoom(z) { zoomT = Math.max(0.4, Math.min(1.45, z)); if (zoomT >= 0.95) panT.multiplyScalar(0); clampPan(); }
function clampPan() { const k = Math.max(0, 1 - zoomT) * 9; panT.x = Math.max(-k, Math.min(k, panT.x)); panT.z = Math.max(-k, Math.min(k, panT.z)); panT.y = 0; }
function resize() {
  const w = container.clientWidth, h = container.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // 直式手機畫面比較高：保持左右看得到整間房，上下多看到房間外面
  const a = w / h;
  camera.fov = a < 1.2 ? 2 * Math.atan(Math.tan(19 * Math.PI / 180) * Math.min(1, 0.92 / a)) * 180 / Math.PI : 32;
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
  applyLayout(); buildRoom(); lighting();
  clock = new THREE.Clock();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(el); else window.addEventListener("resize", resize);
  resize();
  // 拖曳轉視角
  let drag = null;
  el.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, yaw: dragYaw, pitch: dragPitch, pan: e.button === 2 || e.shiftKey }; });
  el.addEventListener("contextmenu", (e) => e.preventDefault());
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
    if (id) { window.dispatchEvent(new CustomEvent("kaida3d-pick", { detail: { id } })); return; }
    // 點到空的桌子或椅子：問要不要坐過去
    const seatHit = ray.intersectObjects(seatProps.flatMap((sp) => [sp.group, sp.chair]), true)[0];
    let si = -1;
    if (seatHit) { let o = seatHit.object; while (o && o.userData.seat == null) o = o.parent; si = o ? o.userData.seat : -1; }
    const taken = Object.values(chars).some((st) => st.seat === si);
    window.dispatchEvent(new CustomEvent("kaida3d-seat", { detail: { seat: si >= 0 && !taken ? si : -1, x: e.clientX - r.left, y: e.clientY - r.top } }));
  });
  window.addEventListener("pointermove", (e) => {
    if (!drag || pinch) return;
    if (drag.pan) { panBy(e.clientX - drag.px, e.clientY - drag.py); drag.px = e.clientX; drag.py = e.clientY; return; }
    // 單指或滑鼠拖曳一律轉視角，放大時也一樣
    dragYaw = clampYaw(drag.yaw - (e.clientX - drag.x) * 0.005);
    dragPitch = Math.max(-0.28, Math.min(0.32, drag.pitch + (e.clientY - drag.y) * 0.004));
  });
  // 縮放：滾輪、兩指、雙擊還原
  el.addEventListener("wheel", (e) => { e.preventDefault(); setZoom(zoomT * Math.exp(e.deltaY * 0.0015)); }, { passive: false });
  let pinch = null;
  const tdist = (ts) => Math.hypot(ts[0].clientX - ts[1].clientX, ts[0].clientY - ts[1].clientY);
  const tang = (ts) => Math.atan2(ts[1].clientY - ts[0].clientY, ts[1].clientX - ts[0].clientX);
  const tmid = (ts) => ({ x: (ts[0].clientX + ts[1].clientX) / 2, y: (ts[0].clientY + ts[1].clientY) / 2 });
  // 兩指：開合縮放、扭轉旋轉、一起移動平移，可以同時做
  el.addEventListener("touchstart", (e) => { if (e.touches.length === 2) { pinch = { d: tdist(e.touches), z: zoomT, a: tang(e.touches), yaw: dragYaw, m: tmid(e.touches) }; drag = null; } }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    if (!pinch || e.touches.length !== 2) return;
    e.preventDefault();
    setZoom(pinch.z * pinch.d / Math.max(20, tdist(e.touches)));
    let da = tang(e.touches) - pinch.a; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
    dragYaw = clampYaw(pinch.yaw - da);
    const m = tmid(e.touches); panBy(m.x - pinch.m.x, m.y - pinch.m.y); pinch.m = m;
  }, { passive: false });
  el.addEventListener("touchend", (e) => { if (e.touches.length < 2) pinch = null; });
  el.addEventListener("dblclick", () => { setZoom(ZOOM0); panT.set(0, 0, 0); });
  window.addEventListener("pointerup", () => { drag = null; });
  mounted = true;
  frame();
  return true;
}

// 換主題：清掉整個房間重蓋，角色在下一次 update 時重新放回去
let lastList = null;
function setTheme(name) {
  if (!THEMES[name]) name = "home";
  if (name === THEME) return;
  THEME = name;
  if (!mounted) return;
  Object.keys(chars).forEach((id) => removeChar(id)); chars = {}; reserved = {};
  while (scene.children.length) scene.remove(scene.children[0]);
  fireMeshes = []; bulbs = []; curtains = []; plants = []; speakers = []; notes = []; seatProps = []; spaceBlinks = [];
  applyLayout(); buildRoom(); lighting(); envNext = 0; focusMe = true;
  if (lastList) update(lastList);
}
// 名牌下面的專注時間，index 每秒傳進來 { id: "00:25:13" }
function times(map) { Object.keys(chars).forEach((id) => { const st = chars[id], v = map[id] || ""; if (st.tag.ft.textContent !== v) st.tag.ft.textContent = v; }); }
window.KaidaScene3D = { times, mount, update, findPath, setTheme, themes: Object.keys(THEMES), setHour: (h) => { hourOverride = h; envNext = 0; }, cam: (r, y, p) => { camR = r; yaw = y; pitch = p; }, zoom: (z) => { setZoom(z); zoom = zoomT; }, focus: () => { focusMe = true; if (lastList) update(lastList); }, view: (z) => { focusZoom = z; focusMe = true; if (lastList) update(lastList); } };
window.dispatchEvent(new Event("kaida3d-ready"));
