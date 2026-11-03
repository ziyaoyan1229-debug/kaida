/* 漂流燈島的室內場景：圖書館、咖啡廳、民宅三種（其他建築先借用相近的）
   每個室內是獨立的 THREE.Scene，有自己的燈光：窗光隨白天黑夜變化、吊燈／檯燈／壁爐是暖色點光源 */
import { THREE, mat, box, cyl, sph, outline } from "./chars.js";
import { M, FRAME, add, cone, torus, tex, TAU } from "./art.js";

const rnd = Math.random;
const H = 3.3;                 // 天花板高度
const FLOOR_Y = 0.55;          // 跟島上廣場同高，玩家的腳步邏輯不用改

function walls(S, w, d, wallM, floorM) {
  const g = new THREE.Group(); g.position.y = FLOOR_Y; S.add(g);
  const fl = add(new THREE.PlaneGeometry(w, d), floorM, 0, 0, 0, g); fl.rotation.x = -Math.PI / 2; fl.castShadow = false;
  const ce = add(new THREE.PlaneGeometry(w, d), mat("#efe6d6", { roughness: 1 }), 0, H, 0, g); ce.rotation.x = Math.PI / 2; ce.castShadow = false;
  for (let i = 0; i < Math.floor(w / 1.6); i++) box(0.16, 0.18, d, M.woodDark, -w / 2 + 0.8 + i * 1.6, H - 0.09, 0, g);
  box(w, H, 0.2, wallM, 0, H / 2, -d / 2 - 0.1, g);                                   // 後牆
  box(0.2, H, d, wallM, -w / 2 - 0.1, H / 2, 0, g); box(0.2, H, d, wallM, w / 2 + 0.1, H / 2, 0, g); // 側牆
  const dw = 1.2; // 前牆留門洞。前牆只做朝內的單面板，鏡頭退到牆外時可以直接看進房間
  const front = new THREE.Group(); front.position.y = FLOOR_Y; S.add(front);
  const fw = new THREE.MeshStandardMaterial({ map: wallM.map, color: wallM.color, roughness: 0.9, side: THREE.FrontSide });
  [[-w / 4 - dw / 4, H / 2, (w - dw) / 2, H], [w / 4 + dw / 4, H / 2, (w - dw) / 2, H], [0, 2.2 + (H - 2.2) / 2, dw + 0.3, H - 2.2]].forEach(([x, y, pw, ph]) => { const pl = add(new THREE.PlaneGeometry(pw, ph), fw, x, y, d / 2 + 0.02, front); pl.rotation.y = Math.PI; pl.castShadow = false; });
  const frame = new THREE.Group(); front.add(frame); // 門框：鏡頭退到門外時隱藏，不擋視線
  box(dw + 0.16, 0.1, 0.26, FRAME, 0, 2.2, d / 2 + 0.1, frame); [-1, 1].forEach((s) => box(0.1, 2.2, 0.26, FRAME, s * (dw / 2 + 0.03), 1.1, d / 2 + 0.1, frame));
  // 門外：一塊會隨天色變化的板子，從門看出去不會是黑的
  const outside = add(new THREE.PlaneGeometry(dw + 0.4, 2.4), new THREE.MeshBasicMaterial({ color: "#bcd8ee" }), 0, 1.2, d / 2 + 0.9, g); outside.rotation.y = Math.PI; outside.castShadow = false;
  // 踢腳線
  [[0, -d / 2 + 0.11, w, 0.2], [-w / 2 + 0.11, 0, 0.2, d], [w / 2 - 0.11, 0, 0.2, d]].forEach(([x, z, bw, bd]) => box(bw, 0.12, bd, M.woodDark, x, 0.06, z, g));
  return { g, outside, ceiling: ce, floor: fl, frame };
}

function windowOn(S, g, side, w, d, z, dark0) {
  // side = -1 左牆 / 1 右牆，z 是窗戶在牆上的位置；回傳 { pane, shaft, light } 讓 tick 調亮度
  const x = side * (w / 2 - 0.02), ww = 1.1, wh = 1.3, y = 1.75;
  const W = new THREE.Group(); W.position.set(x, y, z); W.rotation.y = side * -Math.PI / 2; g.add(W);
  const paneM = new THREE.MeshStandardMaterial({ color: "#dff0ff", emissive: "#bcd8ee", emissiveIntensity: 1.2, roughness: 0.3 });
  const pane = add(new THREE.PlaneGeometry(ww, wh), paneM, 0, 0, 0, W); pane.castShadow = false;
  box(ww + 0.16, wh + 0.16, 0.08, "#f3efe6", 0, 0, -0.02, W); // 窗框（從裡面看）
  [[0, 0, 0.04, wh + 0.1, 0.06], [0, 0, ww + 0.1, 0.04, 0.06]].forEach(([fx, fy, bw, bh, bd]) => box(bw, bh, bd, "#f3efe6", fx, fy, 0.02, W));
  box(ww + 0.3, 0.08, 0.22, M.woodDark, 0, -wh / 2 - 0.08, 0.1, W);
  // 窗簾
  [-1, 1].forEach((s) => { const c = box(0.22, wh + 0.2, 0.06, mat("#c9876a", { roughness: 1 }), s * (ww / 2 + 0.08), 0.05, 0.1, W); c.castShadow = false; });
  // 光柱：從窗戶斜斜照到地板的半透明板
  const shaftM = new THREE.MeshBasicMaterial({ color: "#fff2d0", transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const shaft = add(new THREE.PlaneGeometry(ww * 0.95, 3.2), shaftM, x - side * 1.3, y - 0.9, z, g); shaft.rotation.set(0, side * -Math.PI / 2, side * 0.62); shaft.castShadow = false; shaft.renderOrder = 3;
  const light = new THREE.SpotLight("#fff0cc", 0, 9, 0.6, 0.6, 1); light.position.set(x - side * 0.3, y + 0.4, z); light.target.position.set(x - side * 2.6, 0, z); g.add(light); g.add(light.target);
  light.castShadow = true; light.shadow.mapSize.set(1024, 1024); light.shadow.bias = -0.0005;
  return { pane: paneM, shaft: shaftM, light };
}

function rug(g, x, z, w, d, col, col2) {
  const t = tex(256, 256, (c) => { c.fillStyle = col; c.fillRect(0, 0, 256, 256); c.strokeStyle = col2; c.lineWidth = 10; c.strokeRect(18, 18, 220, 220); c.lineWidth = 4; c.strokeRect(40, 40, 176, 176); c.fillStyle = col2; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(128 + Math.cos(i) * 40, 128 + Math.sin(i) * 40, 8, 0, TAU); c.fill(); } });
  const r = add(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }), x, 0.012, z, g); r.rotation.x = -Math.PI / 2; r.castShadow = false; return r;
}
function chair(g, x, z, ry, col) { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); box(0.42, 0.05, 0.42, col || M.wood, 0, 0.44, 0, c); box(0.42, 0.5, 0.05, col || M.wood, 0, 0.72, -0.19, c); [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].forEach(([lx, lz]) => box(0.05, 0.44, 0.05, FRAME, lx, 0.22, lz, c)); return c; }
function table(g, x, z, w, d, ry) { const t = new THREE.Group(); t.position.set(x, 0, z); t.rotation.y = ry || 0; g.add(t); box(w, 0.07, d, M.wood, 0, 0.74, 0, t); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => box(0.07, 0.72, 0.07, FRAME, sx * (w / 2 - 0.1), 0.36, sz * (d / 2 - 0.1), t)); return t; }
function roundTable(g, x, z) { const t = new THREE.Group(); t.position.set(x, 0, z); g.add(t); cyl(0.45, 0.45, 0.05, M.wood, 0, 0.74, 0, t, 18); cyl(0.05, 0.05, 0.72, FRAME, 0, 0.36, 0, t, 8); cyl(0.26, 0.3, 0.05, FRAME, 0, 0.03, 0, t, 12); return t; }
function books(g, x, y, z, w, ry, n) {
  // 一排書：InstancedMesh，顏色隨機
  const cols = ["#c8574a", "#3a78c8", "#e8a84a", "#4f8a3c", "#8a5aa8", "#f3efe6", "#2f3e5a", "#d88a3a"];
  const geo = new THREE.BoxGeometry(0.06, 0.24, 0.17); const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.8 }), n); im.castShadow = im.receiveShadow = true;
  const Mx = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  const cr = Math.cos(ry), sr = Math.sin(ry);
  for (let i = 0; i < n; i++) { const lx = -w / 2 + 0.05 + i * (w / n); p.set(x + lx * cr, y + 0.12 + (rnd() - 0.5) * 0.02, z - lx * sr); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry + (rnd() - 0.5) * 0.1); s.set(0.8 + rnd() * 0.6, 0.85 + rnd() * 0.3, 1); Mx.compose(p, q, s); im.setMatrixAt(i, Mx); im.setColorAt(i, c.set(cols[Math.floor(rnd() * cols.length)])); }
  g.add(im); return im;
}
function shelf(g, x, z, ry, w, rows) {
  const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = ry; g.add(s);
  const h = 0.5 + rows * 0.42;
  box(w, h, 0.05, M.woodDark, 0, h / 2, -0.17, s); [-1, 1].forEach((k) => box(0.05, h, 0.36, M.woodDark, k * (w / 2 - 0.025), h / 2, 0, s));
  for (let r = 0; r <= rows; r++) { const y = 0.08 + r * 0.42; box(w, 0.04, 0.36, M.woodDark, 0, y, 0, s); if (r < rows) books(s, 0, y + 0.02, 0, w - 0.1, 0, Math.floor((w - 0.1) / 0.075)); }
  box(w, 0.06, 0.4, M.woodDark, 0, h + 0.02, 0, s);
  return s;
}
function pendant(g, x, z, y, col) { const p = new THREE.Group(); p.position.set(x, y, z); g.add(p); cyl(0.01, 0.01, H - y - 0.1, M.iron, 0, (H - y) / 2, 0, p, 4); const sh = cone(0.28, 0.22, mat(col || "#2f3e5a", { side: THREE.DoubleSide, roughness: 0.6 }), 0, 0.11, 0, p, 16); sh.castShadow = false; const bulb = sph(0.06, new THREE.MeshStandardMaterial({ color: "#fff2c8", emissive: "#ffcf6a", emissiveIntensity: 1.4 }), 0, 0.02, 0, p, 8, 6); bulb.castShadow = false; const l = new THREE.PointLight("#ffd28a", 0, 7, 1.6); l.position.y = -0.1; p.add(l); return l; }
function deskLamp(g, x, z, y) { const p = new THREE.Group(); p.position.set(x, y, z); g.add(p); cyl(0.09, 0.11, 0.03, M.brass, 0, 0.015, 0, p, 10); cyl(0.015, 0.015, 0.34, M.brass, 0, 0.18, 0, p, 6); const sh = box(0.34, 0.12, 0.16, mat("#2f6a3a", { roughness: 0.4, metalness: 0.2 }), 0, 0.38, 0, p); const bulb = box(0.3, 0.02, 0.12, new THREE.MeshStandardMaterial({ color: "#fff2c8", emissive: "#ffe6a0", emissiveIntensity: 0.8 }), 0, 0.31, 0, p); bulb.castShadow = false; const l = new THREE.PointLight("#ffe6a0", 0, 3.5, 1.8); l.position.y = 0.28; l.userData.k = 0.4; p.add(l); return l; }
function plant(g, x, z) { const p = new THREE.Group(); p.position.set(x, 0, z); g.add(p); cyl(0.16, 0.13, 0.28, mat("#b86a4a", { roughness: 0.9 }), 0, 0.14, 0, p, 10); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; const l = sph(0.13, ["#4f8a3c", "#5c9a44", "#3f7a30"][i % 3], Math.cos(a) * 0.14, 0.42 + (i % 2) * 0.08, Math.sin(a) * 0.14, p, 8, 6); l.scale.set(1, 0.7, 1.3); l.rotation.y = -a; } return p; }
function picture(g, x, y, z, ry, w, h, col) { const P = new THREE.Group(); P.position.set(x, y, z); P.rotation.y = ry; g.add(P); box(w, h, 0.03, FRAME, 0, 0, 0, P); const c = add(new THREE.PlaneGeometry(w - 0.08, h - 0.08), mat(col), 0, 0, 0.02, P); c.castShadow = false; return P; }

/* ===== 三種房間 ===== */
function library(S, g, w, d, L) {
  rug(g, 0, 0.6, 4.2, 3.0, "#8a4a3a", "#e8c07a");
  shelf(g, -1.9, -d / 2 + 0.22, 0, 3.4, 5); shelf(g, 1.9, -d / 2 + 0.22, 0, 3.4, 5);
  shelf(g, -w / 2 + 0.22, -1.2, Math.PI / 2, 2.6, 4); shelf(g, w / 2 - 0.22, 2.0, -Math.PI / 2, 2.2, 4);
  [[-1.5, 0.8], [1.5, 0.8]].forEach(([x, z]) => { table(g, x, z, 1.9, 0.9); chair(g, x - 0.5, z + 0.75, Math.PI); chair(g, x + 0.5, z + 0.75, Math.PI); chair(g, x - 0.5, z - 0.75, 0); chair(g, x + 0.5, z - 0.75, 0); L.warm.push(deskLamp(g, x + 0.55, z - 0.2, 0.78)); books(g, x - 0.5, 0.78, z + 0.1, 0.5, 0.3, 6); });
  // 地球儀、梯子
  const gl = new THREE.Group(); gl.position.set(w / 2 - 0.9, 0, -1.0); g.add(gl); cyl(0.2, 0.25, 0.06, M.brass, 0, 0.03, 0, gl, 12); cyl(0.03, 0.03, 0.8, M.brass, 0, 0.43, 0, gl, 6); sph(0.3, mat("#3a78c8", { roughness: 0.5 }), 0, 0.95, 0, gl, 16, 12); torus(0.34, 0.015, M.brass, 0, 0.95, 0, gl, 24).rotation.x = 0.4;
  const ld = new THREE.Group(); ld.position.set(-0.3, 0, -d / 2 + 0.55); ld.rotation.x = -0.22; g.add(ld); [-0.22, 0.22].forEach((lx) => box(0.05, 2.6, 0.05, M.wood, lx, 1.3, 0, ld)); for (let i = 0; i < 6; i++) box(0.44, 0.04, 0.05, M.wood, 0, 0.3 + i * 0.4, 0, ld);
  pendant(g, 0, -1.2, H - 0.9, "#2f3e5a"); L.warm.push(pendant(g, 0, 1.6, H - 0.9, "#2f3e5a"));
  L.win.push(windowOn(S, g, 1, w, d, -0.6), windowOn(S, g, -1, w, d, 1.6));
  picture(g, 0, 2.3, -d / 2 + 0.11, 0, 0.9, 0.6, "#7fbdea");
  L.colliders.push({ x: -1.5, z: 0.8, r: 1.1 }, { x: 1.5, z: 0.8, r: 1.1 }, { x: w / 2 - 0.9, z: -1.0, r: 0.4 });
  return { npc: { x: 0.8, z: -2.3, yaw: 0 } };
}
function cafe(S, g, w, d, L) {
  // 吧台在後方
  const bar = new THREE.Group(); bar.position.set(0, 0, -d / 2 + 1.1); g.add(bar);
  box(3.6, 1.0, 0.7, M.woodDark, 0, 0.5, 0, bar); box(3.8, 0.08, 0.9, mat("#e9dcc4", { roughness: 0.4 }), 0, 1.04, 0, bar);
  const machine = box(0.6, 0.45, 0.45, mat("#c8574a", { roughness: 0.3, metalness: 0.4 }), -0.9, 1.3, -0.1, bar); box(0.5, 0.05, 0.4, M.iron, -0.9, 1.55, -0.1, bar);
  box(0.9, 0.3, 0.4, mat("#dff0ff", { transparent: true, opacity: 0.5, roughness: 0.1 }), 0.7, 1.24, 0, bar); [[0.45, 0.1], [0.75, -0.05], [1.0, 0.08]].forEach(([x, z]) => { const c = sph(0.09, ["#e8a84a", "#f3efe6", "#c8574a"][Math.floor(x * 3) % 3], x, 1.17, z, bar, 8, 6); c.scale.y = 0.6; });
  for (let i = 0; i < 6; i++) cyl(0.04, 0.04, 0.3, mat(["#f3efe6", "#c8574a", "#3a78c8"][i % 3]), -1.6 + i * 0.22, 1.23, -0.2, bar, 8);
  // 後牆：杯架、黑板菜單
  box(3.2, 0.05, 0.3, M.woodDark, 0, 1.9, -d / 2 + 0.3, g); box(3.2, 0.05, 0.3, M.woodDark, 0, 2.4, -d / 2 + 0.3, g);
  for (let i = 0; i < 9; i++) cyl(0.06, 0.05, 0.1, mat(["#f3efe6", "#e8dcd0", "#c8a0e0"][i % 3]), -1.4 + i * 0.35, 1.98 + (i % 2) * 0.5, -d / 2 + 0.3, g, 10);
  const board = tex(256, 160, (c) => { c.fillStyle = "#2a3a2e"; c.fillRect(0, 0, 256, 160); c.fillStyle = "#f3efe6"; c.font = "bold 26px sans-serif"; c.fillText("☕ 拿鐵  5", 24, 46); c.fillText("🍰 蛋糕  4", 24, 86); c.fillText("🥐 可頌  3", 24, 126); });
  const bd = add(new THREE.PlaneGeometry(1.5, 0.95), new THREE.MeshStandardMaterial({ map: board, roughness: 0.9 }), 2.6, 2.1, -d / 2 + 0.12, g); bd.castShadow = false; box(1.6, 1.05, 0.04, FRAME, 2.6, 2.1, -d / 2 + 0.1, g);
  // 吧台椅、圓桌
  for (let i = 0; i < 3; i++) { const x = -1.1 + i * 1.1; cyl(0.18, 0.18, 0.06, mat("#c8574a"), x, 0.72, -d / 2 + 1.75, g, 12); cyl(0.03, 0.03, 0.7, M.iron, x, 0.35, -d / 2 + 1.75, g, 6); cyl(0.2, 0.2, 0.03, M.iron, x, 0.015, -d / 2 + 1.75, g, 12); }
  [[-2.2, 0.9], [0, 1.4], [2.2, 0.9]].forEach(([x, z], i) => { roundTable(g, x, z); chair(g, x - 0.6, z, Math.PI / 2, "#e8dcd0"); chair(g, x + 0.6, z, -Math.PI / 2, "#e8dcd0"); if (i !== 1) chair(g, x, z + 0.6, Math.PI, "#e8dcd0"); cyl(0.05, 0.04, 0.09, "#f3efe6", x - 0.15, 0.82, z, g, 10); L.warm.push(pendant(g, x, z, H - 1.0, ["#c8574a", "#e8a84a", "#4f8a3c"][i])); L.colliders.push({ x, z, r: 0.75 }); });
  rug(g, 0, 1.2, 3.0, 2.0, "#4a6a5a", "#e9dcc4");
  plant(g, -w / 2 + 0.5, d / 2 - 0.6); plant(g, w / 2 - 0.5, d / 2 - 0.6); plant(g, w / 2 - 0.5, -1.2);
  L.win.push(windowOn(S, g, -1, w, d, 0.4), windowOn(S, g, 1, w, d, 0.4));
  picture(g, -w / 2 + 0.12, 2.1, -1.6, Math.PI / 2, 0.8, 0.6, "#f4b6c8");
  L.colliders.push({ x: 0, z: -d / 2 + 1.1, r: 1.9 });
  return { npc: { x: 0, z: -d / 2 + 0.55, yaw: 0 } };
}
function house(S, g, w, d, L) {
  // 床、床頭櫃、衣櫃（左後）
  const bed = new THREE.Group(); bed.position.set(-w / 2 + 1.1, 0, -d / 2 + 1.3); g.add(bed);
  box(1.3, 0.3, 2.1, M.woodDark, 0, 0.3, 0, bed); box(1.2, 0.18, 2.0, mat("#f3efe6", { roughness: 1 }), 0, 0.52, 0, bed); box(1.2, 0.12, 1.3, mat("#8aa4d8", { roughness: 1 }), 0, 0.62, 0.3, bed); box(0.9, 0.14, 0.4, mat("#fbf7ee"), 0, 0.66, -0.75, bed).rotation.x = 0.2; box(1.3, 0.7, 0.08, M.woodDark, 0, 0.6, -1.05, bed);
  box(0.5, 0.6, 0.5, M.wood, 1.0, 0.3, -0.7, bed); L.warm.push(deskLamp(g, -w / 2 + 2.1, -d / 2 + 0.6, 0.6));
  box(1.2, 2.2, 0.6, M.woodDark, -w / 2 + 3.0, 1.1, -d / 2 + 0.32, g); [-0.28, 0.28].forEach((k) => { box(0.5, 2.0, 0.04, M.wood, -w / 2 + 3.0 + k, 1.1, -d / 2 + 0.64, g); sph(0.03, M.brass, -w / 2 + 3.0 + k * 0.3, 1.1, -d / 2 + 0.68, g, 6, 4); });
  // 壁爐（右牆）
  const fp = new THREE.Group(); fp.position.set(w / 2 - 0.35, 0, -0.6); fp.rotation.y = -Math.PI / 2; g.add(fp);
  box(1.6, 1.3, 0.7, M.stone, 0, 0.65, 0, fp); box(0.9, 0.8, 0.5, mat("#1a1410"), 0, 0.45, 0.15, fp); box(1.8, 0.1, 0.8, M.woodDark, 0, 1.35, 0, fp); box(1.1, H - 1.4, 0.5, M.stone, 0, 1.4 + (H - 1.4) / 2, -0.05, fp);
  for (let i = 0; i < 3; i++) cyl(0.07, 0.07, 0.6, M.bark, -0.2 + i * 0.2, 0.12 + (i % 2) * 0.1, 0.2, fp, 7).rotation.z = Math.PI / 2;
  const fire = new THREE.Group(); fire.position.set(0, 0.2, 0.2); fp.add(fire);
  const flames = [0, 1, 2].map((i) => { const f = cone(0.12 + i * 0.04, 0.4 + i * 0.1, new THREE.MeshBasicMaterial({ color: ["#ffd060", "#ff8a30", "#ff5a20"][i], transparent: true, opacity: 0.85 - i * 0.2 }), (i - 1) * 0.12, 0.2, (i - 1) * 0.05, fire, 7); f.castShadow = false; return f; });
  const fl = new THREE.PointLight("#ff9a40", 0, 6, 1.5); fl.position.set(0, 0.5, 0.4); fp.add(fl); L.fire = { light: fl, flames, t: 0 };
  cyl(0.5, 0.5, 0.04, mat("#c9876a"), w / 2 - 1.4, 0.02, -0.6, g, 16); // 爐前小毯
  // 餐桌、廚房
  table(g, 0.3, 1.0, 1.4, 0.9); chair(g, -0.2, 1.75, Math.PI); chair(g, 0.8, 1.75, Math.PI); chair(g, 0.3, 0.25, 0);
  cyl(0.12, 0.12, 0.02, "#f3efe6", 0.0, 0.78, 1.0, g, 12); sph(0.07, "#e8a84a", 0.0, 0.85, 1.0, g, 8, 6); cyl(0.06, 0.05, 0.14, "#dff0ff", 0.5, 0.84, 0.85, g, 8);
  const k = new THREE.Group(); k.position.set(1.6, 0, -d / 2 + 0.45); g.add(k); box(2.6, 0.9, 0.7, mat("#e8dcd0", { roughness: 0.8 }), 0, 0.45, 0, k); box(2.7, 0.06, 0.8, M.woodDark, 0, 0.93, 0, k); box(0.7, 0.08, 0.5, M.iron, -0.7, 1.0, 0, k); [[-0.85, -0.12], [-0.55, 0.12]].forEach(([x, z]) => cyl(0.1, 0.1, 0.03, "#1a1410", x, 1.05, z, k, 12)); box(0.6, 0.3, 0.55, mat("#c9ccd0", { roughness: 0.4, metalness: 0.3 }), 0.5, 0.95, 0, k); cyl(0.03, 0.03, 0.3, M.brass, 0.5, 1.2, -0.2, k, 6);
  for (let i = 0; i < 5; i++) cyl(0.06, 0.06, 0.12, mat(["#f3efe6", "#c8574a", "#3a78c8", "#e8a84a", "#4f8a3c"][i]), 0.1 + i * 0.25, 1.7, -0.25, k, 10); box(2.4, 0.05, 0.3, M.woodDark, 0.6, 1.62, -0.25, k);
  rug(g, 0.3, 1.0, 2.8, 2.4, "#4a6a7a", "#e8c07a");
  L.warm.push(pendant(g, 0.3, 1.0, H - 0.85, "#e8dcd0"));
  L.win.push(windowOn(S, g, -1, w, d, 1.2), windowOn(S, g, 1, w, d, 1.6));
  picture(g, 0.6, 2.2, -d / 2 + 0.11, 0, 0.7, 0.5, "#8cc46a"); plant(g, w / 2 - 0.5, d / 2 - 0.6);
  L.colliders.push({ x: -w / 2 + 1.1, z: -d / 2 + 1.3, r: 1.1 }, { x: 0.3, z: 1.0, r: 0.9 }, { x: w / 2 - 0.35, z: -0.6, r: 0.8 }, { x: 1.6, z: -d / 2 + 0.45, r: 1.2 }, { x: -w / 2 + 3.0, z: -d / 2 + 0.32, r: 0.6 });
  return { npc: { x: -1.2, z: 0.6, yaw: Math.PI / 2 } };
}

const ROOMS = { library: [library, 9, 7, "#e9dcc4", "#7a5038"], cafe: [cafe, 9, 7, "#f3dcc4", "#c9ccd0"], house: [house, 8, 6.5, "#efe4cf", "#b98b5c"] };
export const ROOM_OF = { library: "library", school: "library", bookstore: "library", cafe: "cafe", bakery: "cafe", konbini: "cafe", inn: "cafe", house: "house", chapel: "house", "風車": "house" };

/* 建一個室內場景。回傳 { scene, w, d, colliders, entry, npc, tick(dt, dark) } */
export function makeInterior(kind) {
  const [build, w, d, wallCol, floorCol] = ROOMS[kind] || ROOMS.house;
  const S = new THREE.Scene(); S.background = new THREE.Color("#2a2420");
  const wallM = new THREE.MeshStandardMaterial({ map: M.plaster.map, color: wallCol, roughness: 0.9 });
  const floorM = kind === "cafe" ? mat(floorCol, { roughness: 0.5 }) : new THREE.MeshStandardMaterial({ map: M.wood.map, color: floorCol, roughness: 0.85 });
  if (kind === "cafe") { const t = tex(256, 256, (c) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? "#cfd3d8" : "#efe9dc"; c.fillRect(x * 64, y * 64, 64, 64); } }); t.repeat.set(w, d); floorM.map = t; floorM.needsUpdate = true; }
  const { g, outside, ceiling, floor, frame } = walls(S, w, d, wallM, floorM);
  const L = { warm: [], win: [], fire: null, colliders: [] };
  const info = build(S, g, w, d, L) || {};
  outline(g, 0.012);
  const hemi = new THREE.HemisphereLight("#fff4e0", "#5a4a3a", 0.5); S.add(hemi);
  const amb = new THREE.AmbientLight("#ffe8c8", 0.25); S.add(amb);
  const tmp = new THREE.Color();
  return {
    scene: S, w, d, colliders: L.colliders, ceiling, floor, frame, npc: info.npc,
    entry: { x: 0, z: d / 2 - 1.1 }, exitZ: d / 2 - 1.2,
    tick(dt, dark, skyCol) {
      const day = 1 - dark;
      L.win.forEach((W) => { W.pane.emissive.copy(skyCol || tmp.set("#bcd8ee")); W.pane.emissiveIntensity = 0.3 + day * 1.4; W.shaft.opacity = day * 0.16; W.light.intensity = day * 18; });
      outside.material.color.copy(skyCol || tmp.set("#bcd8ee"));
      hemi.intensity = 0.35 + day * 0.5; amb.intensity = 0.15 + day * 0.2;
      L.warm.forEach((l) => { l.intensity = (2.2 + dark * 4.5) * (l.userData.k || 1); });
      if (L.fire) { const F = L.fire; F.t += dt; const fl = 0.8 + Math.sin(F.t * 11) * 0.12 + Math.sin(F.t * 23.7) * 0.08; F.light.intensity = (4 + dark * 5) * fl; F.flames.forEach((f, i) => { f.scale.set(1, fl + Math.sin(F.t * 9 + i * 2) * 0.15, 1); f.position.x = (i - 1) * 0.12 + Math.sin(F.t * 7 + i) * 0.02; }); }
    },
  };
}
