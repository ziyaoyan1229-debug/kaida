/* 漂流燈島的小鎮建築：圖書館、咖啡廳、便利商店、學校、書店、麵包店、神社、木屋、和室、民宅
   每棟都是程式畫的方塊模型，主題照番茄讀書會的各種讀書房；窗戶晚上會亮，門口有光暈 */
import { THREE, mat, box, cyl, sph, outline } from "./chars.js";

const TAU = Math.PI * 2;
let C = null; // 由 game.js 傳進來：scene、windowM、lightPool、housePools、colliders、groundY

function signTex(text, bg, fg, w, h) {
  const c = document.createElement("canvas"); c.width = w || 256; c.height = h || 96; const g = c.getContext("2d");
  g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = fg; g.font = `bold ${Math.floor(c.height * 0.56)}px "PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(text, c.width / 2, c.height / 2 + 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const signMats = {};
// 招牌：白天普通、晚上自己發光
function sign(g, text, bg, fg, w, x, y, z, ry) {
  const key = text + bg; if (!signMats[key]) { const t = signTex(text, bg, fg); signMats[key] = new THREE.MeshStandardMaterial({ map: t, emissive: "#ffffff", emissiveMap: t, emissiveIntensity: 0, roughness: 0.6 }); C.signs.push(signMats[key]); }
  const h = w * 0.375;
  const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), signMats[key]); s.position.set(x, y, z); s.rotation.y = ry || 0; g.add(s);
  const bk = box(w + 0.08, h + 0.08, 0.05, "#3a3440", x, y, z - 0.03, g); bk.rotation.y = ry || 0;
  return s;
}
function win(g, w, h, x, y, z, ry, frame) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), C.windowM); m.position.set(x, y, z); m.rotation.y = ry || 0; g.add(m);
  if (frame !== false) { const f = box(w + 0.08, h + 0.08, 0.03, frame || "#f3efe6", x, y, z, g); f.rotation.y = ry || 0; f.position.add(new THREE.Vector3(Math.sin(ry || 0), 0, Math.cos(ry || 0)).multiplyScalar(-0.02)); }
  return m;
}
function door(g, w, h, x, y, z, col) { box(w, h, 0.06, col || "#6a4a32", x, y + h / 2, z, g); sph(0.03, "#e8b93a", x + w * 0.3, y + h * 0.5, z + 0.04, g, 8, 6); }
function gableRoof(g, w, d, h, y, col, overhang) {
  const o = overhang || 0.2, sh = new THREE.Shape(); sh.moveTo(-w / 2 - o, 0); sh.lineTo(w / 2 + o, 0); sh.lineTo(0, h); sh.closePath();
  const rg = new THREE.ExtrudeGeometry(sh, { depth: d + o * 2, bevelEnabled: false }); rg.translate(0, 0, -(d + o * 2) / 2);
  const rf = new THREE.Mesh(rg, mat(col)); rf.position.y = y; rf.castShadow = rf.receiveShadow = true; g.add(rf); return rf;
}
function pools(g, w, d) {
  const p = C.lightPool("#ffb060", Math.max(w, d) * 0.9, g, 0.03); p.position.z = d / 2 + 0.6; C.housePools.push(p);
}
function start(x, z, ry, r) {
  const g = new THREE.Group(); g.position.set(x, 0.55, z); g.rotation.y = ry; C.scene.add(g);
  C.colliders.push({ x, z, r });
  return g;
}
function finish(g, w, d, name, x, z, ry) {
  outline(g, 0.02); pools(g, w, d);
  const dz = d / 2 + 0.9;
  return { name, x, z, ry, door: { x: x + Math.sin(ry) * dz, z: z + Math.cos(ry) * dz }, front: { x: x + Math.sin(ry) * (dz + 1.2), z: z + Math.cos(ry) * (dz + 1.2) }, r: Math.max(w, d) / 2 + 0.3 };
}

/* 民宅 */
function house(x, z, ry, wall, roof) {
  const w = 1.9, d = 1.6, g = start(x, z, ry, 1.35);
  box(w, 1.35, d, wall, 0, 0.675, 0, g); box(w + 0.1, 0.12, d + 0.1, "#8a6a4a", 0, 0.06, 0, g);
  gableRoof(g, d, w, 0.95, 1.35, roof).rotation.y = Math.PI / 2;
  box(0.3, 0.7, 0.3, "#9a8a7a", 0.45, 1.85, 0.3, g);
  door(g, 0.44, 0.78, 0, 0, d / 2 + 0.01);
  [[-0.6, 0.85, d / 2 + 0.005, 0], [0.6, 0.85, d / 2 + 0.005, 0], [w / 2 + 0.005, 0.8, 0, Math.PI / 2], [-w / 2 - 0.005, 0.8, 0, -Math.PI / 2]].forEach(([wx, wy, wz, wr]) => win(g, 0.42, 0.42, wx, wy, wz, wr));
  return finish(g, w, d, "民宅", x, z, ry);
}

/* 圖書館：石造、柱廊、拱窗、平頂 */
function library(x, z, ry) {
  const w = 4.6, d = 2.8, g = start(x, z, ry, 2.6);
  box(w, 2.3, d, "#e6dcc8", 0, 1.15, 0, g); box(w + 0.3, 0.2, d + 0.3, "#b8ae9a", 0, 0.1, 0, g);
  box(w + 0.4, 0.22, d + 0.4, "#b8ae9a", 0, 2.41, 0, g); box(w - 0.6, 0.5, d - 0.6, "#d8cfbc", 0, 2.75, 0, g);
  const dome = sph(0.9, "#5f8a6a", 0, 3.0, 0, g, 20, 12); dome.scale.y = 0.6;
  [-1.6, -0.55, 0.55, 1.6].forEach((cx) => cyl(0.14, 0.16, 2.1, "#f3efe6", cx, 1.15, d / 2 + 0.35, g, 10));
  box(w, 0.25, 0.7, "#e6dcc8", 0, 2.25, d / 2 + 0.3, g);
  [-1.1, 1.1].forEach((cx) => { win(g, 0.6, 1.0, cx, 1.2, d / 2 + 0.01, 0); const arch = cyl(0.33, 0.33, 0.04, "#f3efe6", cx, 1.7, d / 2 + 0.005, g, 16); arch.rotation.x = Math.PI / 2; win(g, 0.58, 0.3, cx, 1.68, d / 2 + 0.012, 0, false); });
  door(g, 0.7, 1.3, 0, 0, d / 2 + 0.01, "#4a3a2a");
  [-0.9, 0.9].forEach((cz) => [1, -1].forEach((s) => win(g, 0.5, 0.8, s * (w / 2 + 0.005), 1.2, cz, s * Math.PI / 2)));
  sign(g, "圖書館", "#2f4a3a", "#f3efe6", 1.6, 0, 2.1, d / 2 + 0.66);
  // 門口階梯
  box(2.2, 0.12, 0.5, "#c8c0b0", 0, 0.06, d / 2 + 0.25, g); box(2.4, 0.1, 0.5, "#b8ae9a", 0, 0.0, d / 2 + 0.65, g);
  return finish(g, w, d + 0.8, "圖書館", x, z, ry);
}

/* 咖啡廳：紅磚、條紋雨棚、大窗、戶外座位 */
function cafe(x, z, ry) {
  const w = 2.8, d = 2.3, g = start(x, z, ry, 1.9);
  box(w, 1.7, d, "#a8604a", 0, 0.85, 0, g); box(w + 0.1, 0.1, d + 0.1, "#6a4a3a", 0, 0.05, 0, g);
  box(w + 0.2, 0.18, d + 0.2, "#5a3a2a", 0, 1.79, 0, g); box(0.3, 0.6, 0.3, "#5a4a44", -0.9, 2.1, -0.5, g);
  // 雨棚
  const aw = new THREE.Group(); aw.position.set(0, 1.35, d / 2 + 0.35); aw.rotation.x = 0.35; g.add(aw);
  for (let i = 0; i < 7; i++) box(0.4, 0.04, 0.7, i % 2 ? "#f3efe6" : "#c8574a", -1.2 + i * 0.4, 0, 0, aw);
  win(g, 1.3, 0.8, -0.55, 0.9, d / 2 + 0.01, 0, "#3a2a1a"); door(g, 0.55, 1.15, 0.85, 0, d / 2 + 0.01, "#3a2a1a");
  win(g, 0.6, 0.6, w / 2 + 0.005, 1.0, 0.2, Math.PI / 2, "#3a2a1a");
  sign(g, "☕ 咖啡", "#3a2418", "#ffd9a0", 1.3, -0.3, 1.9, d / 2 + 0.12);
  // 戶外桌椅、盆栽
  cyl(0.3, 0.3, 0.04, "#f3efe6", -0.9, 0.6, d / 2 + 1.0, g, 12); cyl(0.04, 0.05, 0.6, "#3a3440", -0.9, 0.3, d / 2 + 1.0, g, 6);
  [-1.35, -0.45].forEach((cx) => { box(0.3, 0.04, 0.3, "#3f7a5a", cx, 0.42, d / 2 + 1.0, g); cyl(0.03, 0.03, 0.42, "#3a3440", cx, 0.21, d / 2 + 1.0, g, 5); });
  cyl(0.18, 0.14, 0.3, "#c8744a", 1.2, 0.15, d / 2 + 0.55, g, 10); sph(0.26, "#5f9a44", 1.2, 0.5, d / 2 + 0.55, g, 10, 8);
  return finish(g, w, d + 1.2, "咖啡廳", x, z, ry);
}

/* 便利商店：白色平頂、整面玻璃、三色條紋 */
function konbini(x, z, ry) {
  const w = 3.2, d = 2.2, g = start(x, z, ry, 2.0);
  box(w, 1.8, d, "#f6f3ea", 0, 0.9, 0, g); box(w + 0.1, 0.1, d + 0.1, "#9a968c", 0, 0.05, 0, g);
  box(w + 0.3, 0.3, d + 0.3, "#f6f3ea", 0, 1.95, 0, g);
  [["#3f7a8a", -0.1], ["#e8b93a", 0], ["#c8574a", 0.1]].forEach(([c, dy]) => box(w + 0.32, 0.1, d + 0.32, c, 0, 1.95 + dy, 0, g));
  const glass = win(g, w - 0.4, 1.2, 0, 0.85, d / 2 + 0.01, 0, "#8a8680"); glass.userData.bright = 1; C.brightWins.push(glass);
  [-0.9, 0, 0.9].forEach((cx) => box(0.05, 1.25, 0.02, "#8a8680", cx, 0.85, d / 2 + 0.03, g));
  box(0.55, 1.1, 0.02, "#4a6a8a", 0.5, 0.55, d / 2 + 0.03, g).material = mat("#aac8e0", { transparent: true, opacity: 0.4 });
  sign(g, "便利商店", "#2a6a5a", "#ffffff", 1.8, 0, 2.35, 0.2);
  // 門口的冰箱和垃圾桶
  box(0.5, 0.9, 0.4, "#3a6a8a", -1.35, 0.45, d / 2 + 0.5, g); cyl(0.18, 0.16, 0.5, "#4a4a50", 1.5, 0.25, d / 2 + 0.5, g, 10);
  return finish(g, w, d + 0.6, "便利商店", x, z, ry);
}

/* 學校：兩層樓、鐘塔、旗桿 */
function school(x, z, ry) {
  const w = 5.2, d = 2.4, g = start(x, z, ry, 2.9);
  box(w, 2.6, d, "#f3e2c4", 0, 1.3, 0, g); box(w + 0.1, 0.12, d + 0.1, "#8a7a5a", 0, 0.06, 0, g);
  gableRoof(g, d, w, 0.8, 2.6, "#8a4a3a").rotation.y = Math.PI / 2;
  // 鐘塔
  box(1.0, 1.4, 1.0, "#f3e2c4", 0, 3.3, 0, g); const ct = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.8, 4), mat("#8a4a3a")); ct.position.y = 4.4; ct.rotation.y = Math.PI / 4; ct.castShadow = true; g.add(ct);
  const clock = cyl(0.3, 0.3, 0.04, "#fffdf8", 0, 3.5, 0.52, g, 20); clock.rotation.x = Math.PI / 2; box(0.03, 0.22, 0.02, "#3a3440", 0, 3.58, 0.55, g); box(0.16, 0.03, 0.02, "#3a3440", 0.06, 3.5, 0.55, g);
  for (let f = 0; f < 2; f++) [-1.9, -1.1, 1.1, 1.9].forEach((cx) => win(g, 0.5, 0.6, cx, 0.85 + f * 1.15, d / 2 + 0.01, 0));
  [-0.6, 0.6].forEach((cz) => [1, -1].forEach((s) => win(g, 0.5, 0.6, s * (w / 2 + 0.005), 0.85, cz, s * Math.PI / 2)));
  door(g, 0.8, 1.3, 0, 0, d / 2 + 0.01, "#5a3a2a"); win(g, 0.8, 0.5, 0, 1.95, d / 2 + 0.01, 0);
  sign(g, "燈島小學", "#4a3a2a", "#ffe2a0", 1.6, 0, 2.45, d / 2 + 0.05);
  // 旗桿
  cyl(0.03, 0.03, 3.2, "#d8d4cc", 2.2, 1.6, d / 2 + 1.0, g, 6); box(0.5, 0.32, 0.02, "#c8574a", 2.47, 3.0, d / 2 + 1.0, g);
  return finish(g, w, d + 0.8, "學校", x, z, ry);
}

/* 書店：窄而高、門口堆書 */
function bookstore(x, z, ry) {
  const w = 2.2, d = 2.0, g = start(x, z, ry, 1.6);
  box(w, 2.4, d, "#5a7a9a", 0, 1.2, 0, g); box(w + 0.1, 0.1, d + 0.1, "#3a4a5a", 0, 0.05, 0, g);
  box(w + 0.2, 0.15, d + 0.2, "#3a4a5a", 0, 2.47, 0, g); gableRoof(g, w, d, 0.6, 2.55, "#3f5a7a", 0.1);
  win(g, 1.0, 0.9, -0.35, 0.85, d / 2 + 0.01, 0, "#f3efe6"); door(g, 0.5, 1.1, 0.65, 0, d / 2 + 0.01, "#2a3a4a");
  win(g, 0.5, 0.5, -0.5, 1.85, d / 2 + 0.01, 0); win(g, 0.5, 0.5, 0.5, 1.85, d / 2 + 0.01, 0);
  sign(g, "📚 書店", "#f3efe6", "#2a3a4a", 1.1, 0, 1.4, d / 2 + 0.12);
  // 門口一疊書
  [["#c8574a", 0], ["#e8b93a", 0.08], ["#3f7a5a", 0.16], ["#7a5a9a", 0.24]].forEach(([c, y], i) => { const b = box(0.36, 0.08, 0.26, c, -0.85, 0.04 + y, d / 2 + 0.5, g); b.rotation.y = i * 0.25; });
  return finish(g, w, d + 0.5, "書店", x, z, ry);
}

/* 麵包店：粉牆、圓窗、煙囪冒煙 */
function bakery(x, z, ry) {
  const w = 2.5, d = 2.1, g = start(x, z, ry, 1.75);
  box(w, 1.6, d, "#f6d8c8", 0, 0.8, 0, g); box(w + 0.1, 0.1, d + 0.1, "#a07a6a", 0, 0.05, 0, g);
  gableRoof(g, w, d, 1.0, 1.6, "#c8886a"); cyl(0.2, 0.2, 0.8, "#8a6a5a", 0.7, 2.2, -0.3, g, 8);
  const rw = cyl(0.35, 0.35, 0.03, "#ffffff", -0.55, 1.0, d / 2 + 0.01, g, 20); rw.rotation.x = Math.PI / 2; const rwin = new THREE.Mesh(new THREE.CircleGeometry(0.3, 20), C.windowM); rwin.position.set(-0.55, 1.0, d / 2 + 0.03); g.add(rwin);
  door(g, 0.5, 1.1, 0.6, 0, d / 2 + 0.01, "#8a5a4a");
  sign(g, "🥐 麵包", "#fff4e0", "#a0603a", 1.1, 0, 1.75, d / 2 + 0.12);
  // 窗台的麵包籃
  box(0.5, 0.2, 0.3, "#c8a070", -0.55, 0.55, d / 2 + 0.18, g); [[-0.68, 0.7], [-0.52, 0.72], [-0.4, 0.68]].forEach(([bx, by]) => sph(0.08, "#e0a860", bx, by, d / 2 + 0.2, g, 8, 6));
  return finish(g, w, d + 0.5, "麵包店", x, z, ry);
}

/* 神社：鳥居、小本殿、石燈籠 */
function shrine(x, z, ry) {
  const w = 2.4, d = 2.0, g = start(x, z, ry, 1.6);
  box(2.2, 0.3, 1.8, "#c8c0b0", 0, 0.15, 0, g); box(1.5, 1.1, 1.2, "#6a3a2a", 0, 0.85, 0, g);
  box(1.0, 0.6, 1.0, "#5a3a2a", 0, 1.1, 0.72, g);
  gableRoof(g, 2.2, 1.6, 0.7, 1.4, "#3a3a44", 0.1); box(2.6, 0.08, 0.12, "#3a3a44", 0, 1.42, 0.9, g);
  [-0.55, 0.55].forEach((cx) => cyl(0.06, 0.06, 1.1, "#c8574a", cx, 0.85, 0.65, g, 8));
  box(0.5, 0.5, 0.05, "#e8b93a", 0, 0.85, 0.63, g); cyl(0.05, 0.05, 0.3, "#f3efe6", 0, 1.25, 0.66, g, 6);
  // 鳥居
  const ty = 0, tz = d / 2 + 1.4;
  [-0.9, 0.9].forEach((cx) => cyl(0.09, 0.11, 2.0, "#c8574a", cx, 1.0, tz, g, 10));
  box(2.5, 0.16, 0.2, "#c8574a", 0, 2.05, tz, g).rotation.z = 0; box(2.1, 0.1, 0.14, "#c8574a", 0, 1.7, tz, g); box(0.1, 0.35, 0.1, "#c8574a", 0, 1.87, tz, g);
  // 石燈籠
  [-1.3, 1.3].forEach((cx) => { cyl(0.1, 0.12, 0.6, "#9a968c", cx, 0.3, tz - 0.6, g, 6); box(0.3, 0.3, 0.3, "#9a968c", cx, 0.75, tz - 0.6, g); const l = box(0.2, 0.2, 0.02, "#ffe2a0", cx, 0.75, tz - 0.44, g); l.material = C.windowM; const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.2, 4), mat("#8a8680")); cap.position.set(cx, 1.0, tz - 0.6); cap.rotation.y = Math.PI / 4; g.add(cap); });
  sign(g, "⛩ 燈島神社", "#f3efe6", "#8a3a32", 1.3, 0, 0.5, tz + 0.7);
  return finish(g, w, d + 2.6, "神社", x, z, ry);
}

/* 木屋：圓木牆、石煙囪 */
function cabin(x, z, ry) {
  const w = 2.4, d = 2.0, g = start(x, z, ry, 1.7);
  for (let i = 0; i < 7; i++) { const c = cyl(0.12, 0.12, w, i % 2 ? "#a07a4a" : "#8a6a3e", 0, 0.14 + i * 0.22, d / 2, g, 8); c.rotation.z = Math.PI / 2; const c2 = cyl(0.12, 0.12, w, i % 2 ? "#a07a4a" : "#8a6a3e", 0, 0.14 + i * 0.22, -d / 2, g, 8); c2.rotation.z = Math.PI / 2; const c3 = cyl(0.12, 0.12, d + 0.24, i % 2 ? "#8a6a3e" : "#a07a4a", w / 2, 0.14 + i * 0.22, 0, g, 8); c3.rotation.x = Math.PI / 2; const c4 = cyl(0.12, 0.12, d + 0.24, i % 2 ? "#8a6a3e" : "#a07a4a", -w / 2, 0.14 + i * 0.22, 0, g, 8); c4.rotation.x = Math.PI / 2; }
  box(w - 0.1, 1.6, d - 0.1, "#8a6a3e", 0, 0.8, 0, g);
  gableRoof(g, w, d, 0.9, 1.6, "#5a3a2a"); box(0.4, 1.0, 0.4, "#9a968c", -0.7, 2.0, -0.4, g);
  win(g, 0.5, 0.45, -0.6, 0.95, d / 2 + 0.13, 0); door(g, 0.5, 1.05, 0.55, 0, d / 2 + 0.13, "#4a2a1a");
  // 柴堆
  for (let i = 0; i < 6; i++) { const l = cyl(0.08, 0.08, 0.5, "#a07a4a", w / 2 + 0.35, 0.08 + Math.floor(i / 3) * 0.16, -0.5 + (i % 3) * 0.17, g, 6); l.rotation.z = Math.PI / 2; }
  return finish(g, w, d + 0.3, "木屋", x, z, ry);
}

/* 和室：灰瓦屋頂、紙門、緣側 */
function washitsu(x, z, ry) {
  const w = 3.0, d = 2.2, g = start(x, z, ry, 2.0);
  box(w, 0.35, d + 0.6, "#8a6a4a", 0, 0.17, 0.2, g); box(w - 0.2, 1.4, d, "#f3e8d0", 0, 1.05, 0, g);
  [-1.3, -0.45, 0.45, 1.3].forEach((cx) => box(0.12, 1.4, 0.12, "#5a3a2a", cx, 1.05, d / 2, g));
  gableRoof(g, w + 0.4, d + 0.6, 0.7, 1.75, "#5a5a66", 0.3);
  // 紙門（晚上透光）
  [-0.9, 0.0, 0.9].forEach((cx) => { const p = win(g, 0.7, 1.1, cx, 0.95, d / 2 + 0.01, 0, "#5a3a2a"); [0.3, 0.6].forEach((fy) => box(0.7, 0.02, 0.02, "#5a3a2a", cx, 0.4 + fy, d / 2 + 0.03, g)); box(0.02, 1.1, 0.02, "#5a3a2a", cx, 0.95, d / 2 + 0.03, g); });
  // 紅燈籠
  [-1.5, 1.5].forEach((cx) => { const l = sph(0.16, "#c8574a", cx, 1.55, d / 2 + 0.3, g, 10, 8); l.scale.y = 1.3; l.material = C.lanternM; cyl(0.01, 0.01, 0.2, "#3a3440", cx, 1.85, d / 2 + 0.3, g, 4); });
  // 石頭小徑
  [0.2, 0.7, 1.2].forEach((sz, i) => cyl(0.22, 0.22, 0.05, "#9a968c", (i % 2 ? 0.15 : -0.15), 0.02, d / 2 + 0.6 + sz, g, 8));
  return finish(g, w, d + 1.6, "和室", x, z, ry);
}

const KIND = { house, library, cafe, konbini, school, bookstore, bakery, shrine, cabin, washitsu };

/* 街道：環形主街＋四條放射路、中央廣場 */
function roads(ringR, roadW) {
  const stone = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    g.fillStyle = "#b9ae9c"; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 160; i++) { g.fillStyle = ["#a89d8b", "#c5bbab", "#9e9383"][i % 3]; g.globalAlpha = 0.6; const s = 14 + Math.random() * 18; g.fillRect(Math.random() * 256, Math.random() * 256, s, s * 0.7); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const m = new THREE.MeshStandardMaterial({ map: stone, color: "#d8d0c0", roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  const ring = new THREE.Mesh(new THREE.RingGeometry(ringR - roadW / 2, ringR + roadW / 2, 96), m); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.56; ring.receiveShadow = true; C.scene.add(ring);
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(3.4, 40), m); plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.56; plaza.receiveShadow = true; C.scene.add(plaza);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const sp = new THREE.Mesh(new THREE.PlaneGeometry(roadW, ringR - 3), m); sp.rotation.x = -Math.PI / 2; sp.rotation.z = -a; sp.position.set(Math.sin(a) * (ringR + 3) / 2, 0.565, Math.cos(a) * (ringR + 3) / 2); sp.rotation.set(-Math.PI / 2, 0, -a); sp.receiveShadow = true; C.scene.add(sp); }
  // 廣場的花圃和長椅
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; const bx = Math.sin(a) * 2.6, bz = Math.cos(a) * 2.6; const g = new THREE.Group(); g.position.set(bx, 0.56, bz); g.rotation.y = a; C.scene.add(g); box(1.0, 0.08, 0.35, "#a07a52", 0, 0.42, 0, g); box(1.0, 0.3, 0.06, "#a07a52", 0, 0.62, -0.17, g); [-0.4, 0.4].forEach((lx) => box(0.06, 0.42, 0.3, "#3a3440", lx, 0.21, 0, g)); outline(g, 0.015); C.colliders.push({ x: bx, z: bz, r: 0.45 }); }
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; const fx = Math.sin(a) * 2.9, fz = Math.cos(a) * 2.9; const pot = cyl(0.28, 0.22, 0.3, "#b8644a", fx, 0.71, fz, C.scene, 10); outline(pot, 0.012); for (let k = 0; k < 5; k++) { const fa = k / 5 * TAU; sph(0.07, ["#f07a8a", "#ffd27a", "#f3efe6", "#c8a0e0"][i % 4], fx + Math.cos(fa) * 0.12, 0.92, fz + Math.sin(fa) * 0.12, C.scene, 6, 5); } sph(0.1, "#5f9a44", fx, 0.86, fz, C.scene, 8, 6); }
}

export function buildTown(ctx) {
  C = ctx; C.signs = []; C.brightWins = [];
  C.lanternM = new THREE.MeshStandardMaterial({ color: "#c8574a", emissive: "#ff6a4a", emissiveIntensity: 0.1, roughness: 0.6 });
  roads(ctx.ringR, 1.6);
  const out = [];
  ctx.layout.forEach(([kind, x, z, ry, ...rest]) => out.push(KIND[kind](x, z, ry, ...rest)));
  return out;
}
