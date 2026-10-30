/* 漂流燈島的美術共用件（歐風石屋風格）：紋理、瓦片屋頂、木格窗、門、藤蔓、花箱、籬笆、樹、路燈、草叢、炊煙
   建築在 town.js 用這些拼起來；game.js 負責燈光與時間 */
import { THREE, mat, box, cyl, sph } from "./chars.js";

export const TAU = Math.PI * 2;
export const add = (geo, m, x, y, z, p) => { const o = new THREE.Mesh(geo, typeof m === "string" ? mat(m) : m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; (p || null) && p.add(o); return o; };
export const cone = (r, h, m, x, y, z, p, s) => add(new THREE.ConeGeometry(r, h, s || 12), m, x, y, z, p);
export const torus = (r, t, m, x, y, z, p, seg, arc) => add(new THREE.TorusGeometry(r, t, 6, seg || 16, arc || TAU), m, x, y, z, p);

/* ===== 紋理（canvas 畫出來，不用載圖） ===== */
export function tex(w, h, fn, rep) { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); t.anisotropy = 4; return t; }
export function bump(t, scale) { const b = t.clone(); b.colorSpace = THREE.NoColorSpace; b.needsUpdate = true; return { bumpMap: b, bumpScale: scale }; }
const rnd = (() => { let s = 12345; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
export const TEX = {};
export const M = {};
export function initArt() {
  TEX.stone = tex(512, 512, (g, w, h) => { g.fillStyle = "#6f675c"; g.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let i = 0; i < 7; i++) { const x = (i + (r % 2) * 0.5) * 74 + (rnd() - 0.5) * 8, y = r * 64 + (rnd() - 0.5) * 6, sw = 62 + rnd() * 10, sh = 52 + rnd() * 8; g.fillStyle = ["#9a9288", "#8d857a", "#a59d92", "#8a8278", "#b0a89c"][(r * 7 + i) % 5]; g.beginPath(); g.roundRect(x, y, sw, sh, 12); g.fill(); g.fillStyle = "rgba(255,255,255,.12)"; g.beginPath(); g.roundRect(x + 4, y + 4, sw - 8, sh * 0.4, 8); g.fill(); } });
  TEX.plaster = tex(256, 256, (g, w, h) => { g.fillStyle = "#efe4cf"; g.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { g.fillStyle = i % 3 ? "#e6d9c0" : "#f7eedc"; g.globalAlpha = 0.5; g.fillRect(rnd() * w, rnd() * h, 2, 2); } g.globalAlpha = 0.15; g.fillStyle = "#c8b89a"; for (let i = 0; i < 30; i++) g.fillRect(rnd() * w, rnd() * h, 20 + rnd() * 40, 2); });
  TEX.wood = tex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#b98b5c" : "#c99a68"; g.fillRect(0, i * 32, w, 32); g.strokeStyle = "rgba(90,50,20,.35)"; g.lineWidth = 1.5; for (let k = 0; k < 7; k++) { g.beginPath(); const y = i * 32 + 3 + k * 4.2; g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.05 + k + i) * 1.6); g.stroke(); } g.fillStyle = "rgba(60,30,10,.5)"; g.fillRect(0, i * 32, w, 1.5); } });
  TEX.cobble = tex(512, 512, (g, w, h) => { g.fillStyle = "#8d8273"; g.fillRect(0, 0, w, h); for (let r = 0; r < 12; r++) for (let i = 0; i < 12; i++) { const x = (i + (r % 2) * 0.5) * 44 + (rnd() - 0.5) * 6, y = r * 44 + (rnd() - 0.5) * 6; g.fillStyle = ["#b3a797", "#a89c8b", "#c1b5a4", "#9f9484"][(r + i) % 4]; g.beginPath(); g.ellipse(x + 20, y + 20, 19, 17, 0, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.14)"; g.beginPath(); g.ellipse(x + 17, y + 15, 10, 7, -0.5, 0, 7); g.fill(); } });
  TEX.grass = tex(512, 512, (g, w, h) => { g.fillStyle = "#77a84f"; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { g.fillStyle = ["#5f8f3e", "#8fc264", "#a8d178", "#4f7a32", "#6fa347"][i % 5]; g.globalAlpha = 0.55; g.fillRect(rnd() * w, rnd() * h, 2, 4 + rnd() * 5); } }, [12, 12]);
  TEX.sand = tex(256, 256, (g, w, h) => { g.fillStyle = "#e8d4a4"; g.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { g.fillStyle = ["#c9a86a", "#fff4d8", "#b8955a", "#f0e0b8"][i % 4]; g.globalAlpha = 0.5; g.fillRect(rnd() * w, rnd() * h, 2, 2); } }, [10, 10]);
  M.stone = new THREE.MeshStandardMaterial({ map: TEX.stone, roughness: 0.95, ...bump(TEX.stone, 0.025) });
  M.stoneLight = new THREE.MeshStandardMaterial({ map: TEX.stone, color: "#d8d0c4", roughness: 0.95, ...bump(TEX.stone, 0.02) });
  M.plaster = new THREE.MeshStandardMaterial({ map: TEX.plaster, roughness: 0.9, ...bump(TEX.plaster, 0.012) });
  M.plasterWarm = new THREE.MeshStandardMaterial({ map: TEX.plaster, color: "#f3dcc0", roughness: 0.9, ...bump(TEX.plaster, 0.012) });
  M.plasterCool = new THREE.MeshStandardMaterial({ map: TEX.plaster, color: "#d8e0e8", roughness: 0.9, ...bump(TEX.plaster, 0.012) });
  M.brick = new THREE.MeshStandardMaterial({ map: TEX.stone, color: "#b86a52", roughness: 0.95, ...bump(TEX.stone, 0.02) });
  M.wood = new THREE.MeshStandardMaterial({ map: TEX.wood, roughness: 0.9 });
  M.woodDark = new THREE.MeshStandardMaterial({ map: TEX.wood, color: "#8a5a3a", roughness: 0.85 });
  M.bark = new THREE.MeshStandardMaterial({ map: TEX.wood, color: "#7a5a44", roughness: 0.95 });
  M.cobble = new THREE.MeshStandardMaterial({ map: TEX.cobble, roughness: 0.92, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  // 窗戶：晚上會亮，game.js 每格調 emissiveIntensity
  M.win = new THREE.MeshStandardMaterial({ color: "#2a2018", emissive: "#ffb24e", emissiveIntensity: 0.06, roughness: 0.25, metalness: 0.1 });
  M.winCool = new THREE.MeshStandardMaterial({ color: "#2a2018", emissive: "#dfeeff", emissiveIntensity: 0.06, roughness: 0.25, metalness: 0.1 });
  M.lampGlass = new THREE.MeshStandardMaterial({ color: "#fff2c8", emissive: "#ffb24a", emissiveIntensity: 0.08, roughness: 0.2, transparent: true, opacity: 0.9 });
  M.brass = mat("#d8b050", { metalness: 0.8, roughness: 0.3 });
  M.iron = mat("#2f2b30", { roughness: 0.6, metalness: 0.3 });
}
export const FRAME = "#5a3a22";

/* ===== 建築零件 ===== */
// 一排排的瓦片屋頂：rows×cols 片獨立瓦（InstancedMesh），底下墊實心板免得漏光
export function tileRoof(g, w, d, h, y, col, col2, rows, cols, kind, over) {
  over = over || 0.3; const slope = Math.atan2(h, w / 2 + over), L = Math.hypot(h, w / 2 + over);
  const geo = kind === "kawara" ? new THREE.CylinderGeometry(0.07, 0.07, L / rows + 0.05, 10) : kind === "scale" ? new THREE.CylinderGeometry(0.17, 0.17, 0.035, 14) : new THREE.BoxGeometry(L / rows + 0.03, 0.035, (d + over * 2) / cols + 0.01);
  const n = rows * cols * 2, im1 = new THREE.InstancedMesh(geo, mat(col), Math.ceil(n / 2)), im2 = new THREE.InstancedMesh(geo, mat(col2), Math.ceil(n / 2)); im1.castShadow = im2.castShadow = im1.receiveShadow = im2.receiveShadow = true;
  const Mx = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3(), e = new THREE.Euler(); let c1 = 0, c2 = 0;
  for (let side = -1; side <= 1; side += 2) for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = (r + 0.5) / rows, along = (1 - k) * L; const x = side * along * Math.cos(slope), yy = y + h - along * Math.sin(slope) + (kind === "kawara" ? 0 : 0.02); const z = -(d + over * 2) / 2 + (c + 0.5 + (r % 2 ? 0.5 : 0)) * ((d + over * 2) / cols);
    p.set(x, yy, z);
    if (kind === "kawara") e.set(0, 0, -side * (Math.PI / 2 + slope)); else e.set(0, 0, -side * slope);
    q.setFromEuler(e); Mx.compose(p, q, s);
    if ((r + c) % 2) im1.setMatrixAt(c1++, Mx); else im2.setMatrixAt(c2++, Mx);
  }
  im1.count = c1; im2.count = c2; g.add(im1); g.add(im2);
  const sh = new THREE.Shape(); sh.moveTo(-w / 2 - over, 0); sh.lineTo(w / 2 + over, 0); sh.lineTo(0, h); sh.closePath();
  const rg = new THREE.ExtrudeGeometry(sh, { depth: d + over * 2, bevelEnabled: false }); rg.translate(0, 0, -(d + over * 2) / 2);
  const base = new THREE.Mesh(rg, mat(col2)); base.position.y = y - 0.02; base.castShadow = base.receiveShadow = true; g.add(base);
  box(0.14, 0.12, d + over * 2 + 0.06, col2, 0, y + h + 0.02, 0, g);
  return base;
}
// 平屋頂：石簷＋女兒牆
export function flatRoof(g, w, d, y, col) { box(w + 0.4, 0.2, d + 0.4, col || M.stoneLight, 0, y + 0.1, 0, g); [[0, d / 2 + 0.15], [0, -d / 2 - 0.15]].forEach(([x, z]) => box(w + 0.4, 0.3, 0.1, col || M.stoneLight, x, y + 0.35, z, g)); [[w / 2 + 0.15, 0], [-w / 2 - 0.15, 0]].forEach(([x, z]) => box(0.1, 0.3, d + 0.4, col || M.stoneLight, x, y + 0.35, z, g)); }
// 木格窗：外框、格條、亮玻璃，可加窗台、窗簾、百葉、花箱
export function latticeWin(g, w, h, x, y, z, ry, cols, rows, frame, sill, curtain, opt) {
  opt = opt || {}; const W = new THREE.Group(); W.position.set(x, y, z); W.rotation.y = ry; g.add(W);
  const pane = add(new THREE.PlaneGeometry(w, h), opt.cool ? M.winCool : M.win, 0, 0, 0, W); pane.castShadow = false;
  if (curtain) { [-1, 1].forEach((sd) => { const c = box(w * 0.3, h * 0.95, 0.02, curtain, sd * w * 0.3, 0, 0.012, W); c.castShadow = false; }); }
  box(w + 0.1, 0.05, 0.07, frame, 0, h / 2 + 0.025, 0.02, W); box(w + 0.1, 0.05, 0.07, frame, 0, -h / 2 - 0.025, 0.02, W);
  box(0.05, h + 0.1, 0.07, frame, -w / 2 - 0.025, 0, 0.02, W); box(0.05, h + 0.1, 0.07, frame, w / 2 + 0.025, 0, 0.02, W);
  for (let i = 1; i < cols; i++) box(0.025, h, 0.03, frame, -w / 2 + i * w / cols, 0, 0.03, W);
  for (let i = 1; i < rows; i++) box(w, 0.025, 0.03, frame, 0, -h / 2 + i * h / rows, 0.03, W);
  if (sill) box(w + 0.24, 0.06, 0.16, sill, 0, -h / 2 - 0.08, 0.07, W);
  if (opt.shutters) [-1, 1].forEach((sd) => { box(0.2, h + 0.08, 0.04, opt.shutters, sd * (w / 2 + 0.15), 0, 0.0, W); for (let i = 0; i < 5; i++) box(0.17, 0.02, 0.03, opt.shutterLine || "#355a4c", sd * (w / 2 + 0.15), -h * 0.4 + i * h * 0.2, 0.02, W); });
  if (opt.flowers) flowerBox(W, 0, -h / 2 - 0.14, 0.05, 0, w + 0.3);
  if (opt.arch) { const a = torus(w / 2, 0.05, frame, 0, h / 2, 0.02, W, 20, Math.PI); const pane2 = add(new THREE.CircleGeometry(w / 2 - 0.02, 20, 0, Math.PI), M.win, 0, h / 2, 0, W); pane2.castShadow = false; }
  return W;
}
export function doorFrame(g, w, h, x, z, ry, col, frame, opt) {
  opt = opt || {}; const D = new THREE.Group(); D.position.set(x, 0, z); D.rotation.y = ry; g.add(D);
  box(w, h, 0.06, col || M.woodDark, 0, h / 2, 0, D); box(w + 0.14, 0.07, 0.1, frame || FRAME, 0, h + 0.03, 0.02, D); [-1, 1].forEach((sd) => box(0.07, h + 0.07, 0.1, frame || FRAME, sd * (w / 2 + 0.035), h / 2, 0.02, D));
  for (let i = 0; i < 3; i++) box(0.02, h - 0.2, 0.02, frame || FRAME, -w / 3 + i * w / 3, h / 2, 0.035, D);
  sph(0.035, M.brass, w * 0.3, h * 0.48, 0.05, D, 10, 8);
  if (opt.glass) { const p = add(new THREE.PlaneGeometry(w * 0.6, h * 0.35), M.win, 0, h * 0.68, 0.035, D); p.castShadow = false; }
  if (opt.step !== false) box(w + 0.3, 0.08, 0.5, "#8a8278", 0, 0.04, 0.25, D);
  if (opt.arch) { torus(w / 2 + 0.03, 0.06, frame || FRAME, 0, h, 0.02, D, 20, Math.PI); add(new THREE.CircleGeometry(w / 2, 20, 0, Math.PI), M.win, 0, h, 0.0, D).castShadow = false; }
  return D;
}
export function ivy(g, x, y, z, ry, n, col) { const I = new THREE.Group(); I.position.set(x, y, z); I.rotation.y = ry; g.add(I); col = col || ["#3f7a30", "#4f8a3c", "#5f9a44"]; for (let i = 0; i < n; i++) { const t = i / n, px = Math.sin(t * 9) * 0.35, py = t * 1.6; const l = sph(0.09 + rnd() * 0.05, col[i % col.length], px, py, 0.05, I, 8, 6); l.scale.set(1, 0.7, 0.5); } }
export function flowerBox(g, x, y, z, ry, w) { const B = new THREE.Group(); B.position.set(x, y, z); B.rotation.y = ry; g.add(B); box(w, 0.2, 0.22, M.wood, 0, 0, 0.11, B); box(w + 0.04, 0.04, 0.26, FRAME, 0, 0.1, 0.11, B); const n = Math.max(3, Math.round(w / 0.15)); for (let i = 0; i < n; i++) { const fx = -w / 2 + 0.07 + i * (w - 0.14) / (n - 1); sph(0.07, "#5f9a44", fx, 0.14, 0.11, B, 8, 6); sph(0.055, ["#f06a7a", "#ffd24a", "#f8f0e8", "#d08ae0", "#ff8a5a"][i % 5], fx, 0.24, 0.1, B, 8, 6); } }
export function flowers(parent, cx, cz, r, n, cols, y0) { for (let i = 0; i < n; i++) { const a = rnd() * TAU, d = rnd() * r; const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; cyl(0.012, 0.012, 0.22, "#4f7a32", x, (y0 || 0) + 0.11, z, parent, 4); sph(0.045, cols[i % cols.length], x, (y0 || 0) + 0.24, z, parent, 8, 6); } }
export function fenceLine(parent, x0, z0, x1, z1, posts, col, y0) { y0 = y0 || 0; col = col || "#a08a6a"; for (let i = 0; i <= posts; i++) { const k = i / posts, x = x0 + (x1 - x0) * k, z = z0 + (z1 - z0) * k; box(0.08, 0.62, 0.08, col, x, y0 + 0.31, z, parent); cone(0.06, 0.08, col, x, y0 + 0.66, z, parent, 4); } const len = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(x1 - x0, z1 - z0); [0.2, 0.46].forEach((y) => { const r = box(0.04, 0.07, len, col, (x0 + x1) / 2, y0 + y, (z0 + z1) / 2, parent); r.rotation.y = a; }); }
// 樹：分枝樹幹＋很多層扁葉叢，顏色隨機偏移
export function tree(parent, x, y, z, s, kind) {
  const t = new THREE.Group(); t.position.set(x, y, z); t.scale.setScalar(s); t.rotation.y = rnd() * TAU; parent.add(t);
  cyl(0.11, 0.2, 1.3, M.bark, 0, 0.65, 0, t, 9);
  [[0.3, 1.25, 0.05, -0.75, 0.0], [-0.28, 1.3, -0.1, 0.7, 0.3], [0.05, 1.5, 0.3, 0.1, 0.9]].forEach(([bx, by, bz, rz, rx]) => { const b = cyl(0.05, 0.08, 0.7, M.bark, bx, by, bz, t, 7); b.rotation.set(rx, 0, rz); });
  const cols = kind === "cherry" ? ["#f4b6c8", "#f8c9d6", "#ee9fb8", "#fbdce4"] : kind === "autumn" ? ["#d88a3a", "#e8a84a", "#c86a2a", "#f0c060"] : kind === "dark" ? ["#3a6a30", "#44783a", "#2f5a28", "#4a8040"] : ["#4f8a3c", "#64a24a", "#7ab65c", "#8cc46a", "#3f7a30"];
  const base = new THREE.Color();
  const n = kind === "small" ? 12 : 20;
  for (let i = 0; i < n; i++) { const a = i * 2.39996, r = 0.15 + Math.sqrt(i / n) * 0.75, yy = 1.35 + (i % 6) * 0.2 + (i > 15 ? 0.3 : 0); const c = base.set(cols[i % cols.length]).offsetHSL((rnd() - 0.5) * 0.02, 0, (rnd() - 0.5) * 0.08).getStyle(); const l = sph(0.36 - (i % 3) * 0.05, c, Math.cos(a) * r, yy, Math.sin(a) * r, t, 10, 7); l.scale.set(1, 0.6, 1); l.rotation.set(rnd() * 0.4, rnd() * 3, rnd() * 0.4); }
  return t;
}
export function pine(parent, x, y, z, s) {
  const t = new THREE.Group(); t.position.set(x, y, z); t.scale.setScalar(s); t.rotation.y = rnd() * TAU; parent.add(t);
  cyl(0.09, 0.14, 0.7, M.bark, 0, 0.35, 0, t, 7);
  [[0.8, 1.0, 0.8, "#3f7a4a"], [0.65, 0.9, 1.35, "#447f50"], [0.5, 0.8, 1.85, "#4a8a58"], [0.32, 0.7, 2.3, "#519560"]].forEach(([r, h, yy, c]) => { const k = cone(r, h, c, 0, yy, 0, t, 8); k.rotation.y = rnd(); });
  return t;
}
export function rock(parent, x, y, z, s) { const r = add(new THREE.DodecahedronGeometry(0.4 * s, 1), M.stone, x, y + 0.1 * s, z, parent); r.rotation.set(rnd(), rnd() * TAU, 0); r.scale.y = 0.65; return r; }
export function lampPost(parent, x, y, z) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  cyl(0.18, 0.22, 0.12, M.iron, 0, 0.06, 0, g, 12); cyl(0.07, 0.1, 0.25, M.iron, 0, 0.24, 0, g, 10); cyl(0.04, 0.06, 1.3, M.iron, 0, 1.0, 0, g, 10);
  torus(0.07, 0.015, M.iron, 0, 0.42, 0, g, 14).rotation.x = Math.PI / 2;
  box(0.26, 0.03, 0.26, M.iron, 0, 1.66, 0, g); [[-0.11, -0.11], [0.11, -0.11], [-0.11, 0.11], [0.11, 0.11]].forEach(([a, b]) => box(0.02, 0.32, 0.02, M.iron, a, 1.82, b, g));
  const glass = add(new THREE.BoxGeometry(0.2, 0.3, 0.2), M.lampGlass, 0, 1.82, 0, g); glass.castShadow = false;
  cone(0.2, 0.18, M.iron, 0, 2.07, 0, g, 4).rotation.y = Math.PI / 4; sph(0.03, M.iron, 0, 2.18, 0, g, 8, 6);
  g.userData.glass = glass; g.userData.h = 1.82;
  return g;
}
// 一叢叢草：InstancedMesh，避開建築與道路
export function grassTufts(parent, n, col, sampler) {
  const geo = new THREE.ConeGeometry(0.1, 0.11, 5); geo.translate(0, 0.05, 0);
  const im = new THREE.InstancedMesh(geo, mat(col), n); im.receiveShadow = true; const Mx = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), e = new THREE.Euler();
  let i = 0, tries = 0;
  while (i < n && tries++ < n * 20) { const p = sampler(); if (!p) continue; e.set((rnd() - 0.5) * 0.4, rnd() * TAU, (rnd() - 0.5) * 0.4); q.setFromEuler(e); s.setScalar(0.7 + rnd() * 0.8); Mx.compose(p, q, s); im.setMatrixAt(i++, Mx); }
  im.count = i; parent.add(im); return im;
}
// 炊煙：幾顆慢慢上升變大的半透明球，game.js 每格呼叫 tickSmoke
export const smokes = [];
export function smoke(parent, x, y, z) { for (let i = 0; i < 6; i++) { const s = sph(0.12, new THREE.MeshStandardMaterial({ color: "#e8e4dc", transparent: true, opacity: 0.3, roughness: 1 }), x, y, z, parent, 8, 6); s.castShadow = s.receiveShadow = false; s.userData.noAO = true; smokes.push({ s, x, y, z, t: i / 6 }); } }
export function tickSmoke(dt, k0) { smokes.forEach((s) => { s.t = (s.t + dt * 0.18) % 1; const k = s.t; s.s.position.set(s.x + Math.sin(k * 6 + s.y) * 0.25 * k, s.y + k * 1.6, s.z + Math.cos(k * 5) * 0.2 * k); s.s.scale.setScalar(0.6 + k * 2.2); s.s.material.opacity = 0.3 * (1 - k) * Math.min(1, k * 6) * (k0 == null ? 1 : k0); }); }
// 招牌：canvas 文字，晚上會發光
export const signMats = [];
export function signBoard(g, text, bg, fg, w, x, y, z, ry, hang) {
  const t = tex(256, 96, (c) => { c.fillStyle = bg; c.fillRect(0, 0, 256, 96); c.fillStyle = fg; c.font = "bold 50px 'PingFang TC','Noto Sans TC','Microsoft JhengHei',sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, 128, 50); });
  const m = new THREE.MeshStandardMaterial({ map: t, emissive: "#ffffff", emissiveMap: t, emissiveIntensity: 0, roughness: 0.6 }); signMats.push(m);
  const h = w * 0.375, S = new THREE.Group(); S.position.set(x, y, z); S.rotation.y = ry || 0; g.add(S);
  const s = add(new THREE.PlaneGeometry(w, h), m, 0, 0, 0.03, S); s.castShadow = false;
  box(w + 0.08, h + 0.08, 0.05, FRAME, 0, 0, 0, S);
  if (hang) { box(w + 0.2, 0.05, 0.05, FRAME, 0, h / 2 + 0.12, 0, S); [-0.3, 0.3].forEach((cx) => cyl(0.008, 0.008, 0.1, M.iron, cx * w, h / 2 + 0.06, 0, S, 4)); }
  return S;
}
