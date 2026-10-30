/* 漂流燈島的小鎮建築（歐風石屋風格）：民宅、圖書館、咖啡廳、便利商店、學校、書店、麵包店、旅店、鐘樓
   每棟由 art.js 的零件拼起來：石基、灰泥、木骨架、木瓦屋頂、木格窗、花箱、藤蔓、招牌；窗戶晚上會亮，門口有光暈 */
import { THREE, mat, box, cyl, sph, outline } from "./chars.js";
import { M, FRAME, add, cone, torus, tileRoof, flatRoof, latticeWin, doorFrame, ivy, flowerBox, flowers, fenceLine, signBoard, smoke, tree, TAU } from "./art.js";

let C = null; // 由 game.js 傳進來：scene、lightPool、housePools、colliders、groundY、addLamp

function start(x, z, ry, r) { const g = new THREE.Group(); g.position.set(x, 0.55, z); g.rotation.y = ry; C.scene.add(g); C.colliders.push({ x, z, r }); return g; }
function timber(g, w, h, d, y, zf) {
  // 木骨架：直樑、斜撐、橫樑，貼在正面
  const n = Math.max(3, Math.round(w / 0.75)); for (let i = 0; i <= n; i++) box(0.1, h, 0.08, FRAME, -w / 2 + i * w / n, y, zf + 0.03, g);
  [[-w / 2 + w / n / 2, 1], [w / 2 - w / n / 2, -1]].forEach(([bx, sd]) => { const b = box(0.08, h * 0.7, 0.06, FRAME, bx, y, zf + 0.03, g); b.rotation.z = sd * 0.6; });
  box(w + 0.1, 0.1, 0.08, FRAME, 0, y + h / 2, zf + 0.03, g); box(w + 0.1, 0.1, 0.08, FRAME, 0, y - h / 2, zf + 0.03, g);
}
function pools(g, w, d) { const p = C.lightPool("#ffb060", Math.max(w, d) * 0.8, g, 0.03); p.position.z = d / 2 + 0.7; C.housePools.push(p); }
function finish(g, w, d, name, x, z, ry, frontPad) {
  pools(g, w, d);
  const dz = d / 2 + (frontPad || 0) + 0.9;
  return { name, x, z, ry, door: { x: x + Math.sin(ry) * dz, z: z + Math.cos(ry) * dz }, front: { x: x + Math.sin(ry) * (dz + 1.3), z: z + Math.cos(ry) * (dz + 1.3) }, r: Math.max(w, d) / 2 + 0.3 };
}
const PAL = [["#f0e2c8", "#6b4a3a", "#55392c"], ["#e8dcd0", "#5a6a7a", "#44525e"], ["#f2dcc4", "#8a4a3a", "#6a3a2a"], ["#e6e4dc", "#4a6a5a", "#3a5446"]];

/* 民宅：石基、灰泥木骨架、木瓦、閣樓窗、煙囪 */
function house(x, z, ry, v) {
  const [wallC, roofC, roofC2] = PAL[v % PAL.length]; const W = 2.8, D = 2.2, g = start(x, z, ry, 1.9);
  box(W + 0.2, 0.9, D + 0.2, M.stone, 0, 0.45, 0, g); box(W, 1.3, D, mat(wallC, { map: null }), 0, 1.55, 0, g);
  box(W + 0.15, 0.08, D + 0.15, FRAME, 0, 0.9, 0, g); timber(g, W, 1.3, D, 1.55, D / 2);
  [-0.8, 0.8].forEach((bz) => box(0.08, 1.3, 0.1, FRAME, W / 2 + 0.03, 1.55, bz, g));
  tileRoof(g, W + 0.2, D + 0.1, 1.25, 2.2, roofC, roofC2, 8, 12, "shingle", 0.35);
  if (v % 2) { const dor = new THREE.Group(); dor.position.set(0.5, 2.6, 0.7); g.add(dor); box(0.7, 0.6, 0.8, mat(wallC), 0, 0.3, 0, dor); tileRoof(dor, 0.7, 0.7, 0.4, 0.6, roofC, roofC2, 3, 5, "shingle", 0.12); latticeWin(dor, 0.4, 0.36, 0, 0.3, 0.41, 0, 2, 2, FRAME); }
  box(0.4, 1.3, 0.4, M.stone, -0.8, 3.1, -0.5, g); box(0.52, 0.1, 0.52, "#5a5048", -0.8, 3.78, -0.5, g); smoke(g, -0.8, 3.9, -0.5);
  doorFrame(g, 0.65, 1.3, 0.7, D / 2 + 0.11, 0, M.woodDark, FRAME);
  latticeWin(g, 0.55, 0.65, -0.7, 0.6, D / 2 + 0.11, 0, 2, 2, "#f3efe6", "#8a8278", "#c8574a", { shutters: "#3f6a5a", flowers: true });
  latticeWin(g, 0.5, 0.6, -0.7, 1.7, D / 2 + 0.05, 0, 2, 2, FRAME, "#8a7a6a", "#f3e4c8"); latticeWin(g, 0.5, 0.6, 0.7, 1.7, D / 2 + 0.05, 0, 2, 2, FRAME, "#8a7a6a", "#f3e4c8");
  latticeWin(g, 0.55, 0.65, W / 2 + 0.11, 0.6, 0.2, Math.PI / 2, 2, 2, "#f3efe6", "#8a8278", "#c8574a", { shutters: "#3f6a5a" });
  ivy(g, -W / 2 + 0.1, 0.2, D / 2 + 0.12, 0, 22);
  for (let i = 0; i < 6; i++) { const l = cyl(0.07, 0.07, 0.5, M.wood, -W / 2 - 0.35, 0.08 + Math.floor(i / 3) * 0.14, -0.4 + (i % 3) * 0.15, g, 7); l.rotation.z = Math.PI / 2; }
  return finish(g, W, D, "民宅", x, z, ry);
}

/* 圖書館：石造兩層、柱廊、拱窗、圓頂、門口階梯 */
function library(x, z, ry) {
  const W = 5.2, D = 3.2, g = start(x, z, ry, 3.0);
  box(W, 3.2, D, M.stoneLight, 0, 1.6, 0, g); box(W + 0.4, 0.25, D + 0.4, M.stone, 0, 0.12, 0, g);
  box(W + 0.3, 0.2, D + 0.3, M.stone, 0, 1.6, 0, g);
  flatRoof(g, W, D, 3.2, M.stone);
  const dome = sph(1.1, mat("#5f8a7a", { roughness: 0.5, metalness: 0.2 }), 0, 3.6, 0, g, 24, 14); dome.scale.y = 0.65; cyl(1.15, 1.15, 0.3, M.stoneLight, 0, 3.55, 0, g, 24); sph(0.1, M.brass, 0, 4.35, 0, g, 8, 6);
  // 柱廊
  [-1.9, -0.65, 0.65, 1.9].forEach((cx) => { cyl(0.16, 0.18, 2.6, M.stoneLight, cx, 1.45, D / 2 + 0.5, g, 12); box(0.42, 0.14, 0.42, M.stoneLight, cx, 2.8, D / 2 + 0.5, g); box(0.4, 0.1, 0.4, M.stone, cx, 0.2, D / 2 + 0.5, g); });
  box(W, 0.35, 0.9, M.stoneLight, 0, 3.0, D / 2 + 0.45, g); const ped = new THREE.Mesh(new THREE.ExtrudeGeometry((() => { const s = new THREE.Shape(); s.moveTo(-2.7, 0); s.lineTo(2.7, 0); s.lineTo(0, 0.9); s.closePath(); return s; })(), { depth: 0.95, bevelEnabled: false }), M.stoneLight); ped.position.set(0, 3.17, D / 2 + 0.0); ped.castShadow = ped.receiveShadow = true; g.add(ped);
  [-1.3, 1.3].forEach((cx) => latticeWin(g, 0.7, 1.2, cx, 1.0, D / 2 + 0.01, 0, 2, 3, "#f3efe6", "#8a8278", null, { arch: true }));
  [-1.3, 0, 1.3].forEach((cx) => latticeWin(g, 0.6, 0.8, cx, 2.45, D / 2 + 0.01, 0, 2, 2, "#f3efe6", "#8a8278"));
  doorFrame(g, 0.9, 1.6, 0, D / 2 + 0.01, 0, M.woodDark, FRAME, { arch: true, step: false });
  [-1.0, 1.0].forEach((cz) => [1, -1].forEach((s) => { latticeWin(g, 0.6, 1.0, s * (W / 2 + 0.01), 1.0, cz, s * Math.PI / 2, 2, 3, "#f3efe6", "#8a8278", null, { arch: true }); latticeWin(g, 0.5, 0.7, s * (W / 2 + 0.01), 2.45, cz, s * Math.PI / 2, 2, 2, "#f3efe6", "#8a8278"); }));
  signBoard(g, "圖書館", "#2f4a3a", "#f3efe6", 1.8, 0, 2.05, D / 2 + 0.06);
  // 階梯、石獅燈柱
  [0, 1, 2].forEach((i) => box(3.2 + i * 0.3, 0.12, 0.45, M.stoneLight, 0, 0.3 - i * 0.12, D / 2 + 1.0 + i * 0.4, g));
  [-1.9, 1.9].forEach((cx) => { cyl(0.22, 0.26, 0.9, M.stone, cx, 0.45, D / 2 + 1.5, g, 8); const l = C.addLamp(g, cx, 0.9, D / 2 + 1.5); });
  ivy(g, W / 2 + 0.05, 0.1, -1.4, Math.PI / 2, 18);
  return finish(g, W, D, "圖書館", x, z, ry, 1.5);
}

/* 咖啡廳：紅磚一樓、灰泥二樓、條紋雨棚、大窗、戶外座位 */
function cafe(x, z, ry) {
  const W = 3.4, D = 2.6, g = start(x, z, ry, 2.3);
  box(W + 0.2, 0.5, D + 0.2, M.stone, 0, 0.25, 0, g); box(W, 1.3, D, M.brick, 0, 1.15, 0, g); box(W, 1.2, D, M.plasterWarm, 0, 2.4, 0, g); box(W + 0.15, 0.1, D + 0.15, FRAME, 0, 1.8, 0, g);
  timber(g, W, 1.2, D, 2.4, D / 2);
  tileRoof(g, W + 0.2, D + 0.1, 1.1, 3.0, "#6b4a3a", "#55392c", 7, 13, "shingle", 0.35);
  cyl(0.18, 0.2, 1.0, M.brick, 1.0, 3.6, -0.6, g, 8); smoke(g, 1.0, 4.1, -0.6);
  // 雨棚
  const aw = new THREE.Group(); aw.position.set(0, 1.7, D / 2 + 0.45); aw.rotation.x = 0.35; g.add(aw);
  for (let i = 0; i < 9; i++) box(0.38, 0.03, 0.85, i % 2 ? "#f3efe6" : "#c8574a", -1.52 + i * 0.38, 0, 0, aw); [-1.6, 1.6].forEach((ax) => cyl(0.02, 0.02, 0.9, M.iron, ax, -0.02, 0, aw, 6).rotation.x = Math.PI / 2);
  latticeWin(g, 1.5, 0.9, -0.65, 1.05, D / 2 + 0.01, 0, 3, 2, FRAME, "#8a7a6a"); doorFrame(g, 0.7, 1.4, 1.0, D / 2 + 0.01, 0, M.woodDark, FRAME, { glass: true });
  [-0.9, 0.9].forEach((cx) => latticeWin(g, 0.55, 0.65, cx, 2.4, D / 2 + 0.05, 0, 2, 2, FRAME, "#8a7a6a", "#f3e4c8", { flowers: true }));
  latticeWin(g, 0.7, 0.7, W / 2 + 0.01, 1.05, 0.2, Math.PI / 2, 2, 2, FRAME, "#8a7a6a");
  signBoard(g, "☕ 燈島咖啡", "#3a2418", "#ffd9a0", 1.6, -0.4, 2.0, D / 2 + 0.08);
  signBoard(g, "咖啡", "#3a2418", "#ffd9a0", 0.6, W / 2 + 0.3, 2.3, D / 2 - 0.2, Math.PI / 2, true);
  // 戶外桌椅、盆栽、黑板
  [[-1.2, 1.2], [-0.2, 1.4]].forEach(([tx, tz]) => { cyl(0.3, 0.3, 0.04, "#f3efe6", tx, 0.62, D / 2 + tz, g, 12); cyl(0.04, 0.05, 0.6, M.iron, tx, 0.3, D / 2 + tz, g, 6); cyl(0.045, 0.03, 0.09, "#f8f4ec", tx + 0.08, 0.69, D / 2 + tz, g, 10); [-0.45, 0.45].forEach((cx) => { box(0.3, 0.04, 0.3, "#3f7a5a", tx + cx, 0.44, D / 2 + tz, g); cyl(0.03, 0.03, 0.44, M.iron, tx + cx, 0.22, D / 2 + tz, g, 5); box(0.3, 0.3, 0.04, "#3f7a5a", tx + cx, 0.6, D / 2 + tz + (cx < 0 ? -0.14 : 0.14), g); }); });
  cyl(0.2, 0.16, 0.32, "#c8744a", 1.45, 0.16, D / 2 + 0.7, g, 10); sph(0.3, "#5f9a44", 1.45, 0.55, D / 2 + 0.7, g, 10, 8);
  const bb = box(0.5, 0.7, 0.04, "#2a2a2a", -1.55, 0.4, D / 2 + 0.45, g); bb.rotation.set(-0.2, 0.4, 0); box(0.56, 0.76, 0.03, M.wood, -1.55, 0.4, D / 2 + 0.43, g).rotation.set(-0.2, 0.4, 0);
  return finish(g, W, D, "咖啡廳", x, z, ry, 1.0);
}

/* 便利商店：石基、白牆、平頂、整面玻璃、三色條紋 */
function konbini(x, z, ry) {
  const W = 3.6, D = 2.6, g = start(x, z, ry, 2.3);
  box(W + 0.2, 0.4, D + 0.2, M.stone, 0, 0.2, 0, g); box(W, 1.9, D, M.plasterCool, 0, 1.35, 0, g);
  flatRoof(g, W, D, 2.3, M.stoneLight);
  box(W + 0.5, 0.36, 0.5, "#f6f3ea", 0, 2.5, D / 2 + 0.2, g); [["#3f7a8a", 0.12], ["#e8b93a", 0], ["#c8574a", -0.12]].forEach(([c, dy]) => box(W + 0.52, 0.11, 0.52, c, 0, 2.5 + dy, D / 2 + 0.2, g));
  const glass = latticeWin(g, W - 0.5, 1.4, 0, 1.2, D / 2 + 0.01, 0, 4, 1, "#8a8680", null, null, { cool: true }); glass.userData.bright = 1;
  doorFrame(g, 0.7, 1.5, 0.9, D / 2 + 0.02, 0, M.winCool, "#8a8680", { step: false });
  signBoard(g, "便利商店", "#2a6a5a", "#ffffff", 1.9, 0, 2.5, D / 2 + 0.47);
  latticeWin(g, 0.7, 0.7, W / 2 + 0.01, 1.3, 0.2, Math.PI / 2, 2, 2, "#8a8680", null, null, { cool: true });
  // 門口冰箱、垃圾桶、腳踏車架
  box(0.5, 1.0, 0.45, "#3a6a8a", -1.45, 0.5, D / 2 + 0.5, g); add(new THREE.PlaneGeometry(0.4, 0.8), M.winCool, -1.45, 0.55, D / 2 + 0.73, g).castShadow = false; cyl(0.18, 0.16, 0.5, "#4a4a50", 1.65, 0.25, D / 2 + 0.5, g, 10);
  for (let i = 0; i < 3; i++) { torus(0.2, 0.015, M.iron, W / 2 + 0.5, 0.25, -0.6 + i * 0.5, g, 16).rotation.y = Math.PI / 2; }
  C.addLamp(g, -1.9, 0, D / 2 + 1.1);
  return finish(g, W, D, "便利商店", x, z, ry, 0.6);
}

/* 學校：兩層紅磚、鐘塔、旗桿、拱門 */
function school(x, z, ry) {
  const W = 6.0, D = 2.8, g = start(x, z, ry, 3.4);
  box(W + 0.2, 0.5, D + 0.2, M.stone, 0, 0.25, 0, g); box(W, 2.9, D, M.brick, 0, 1.95, 0, g);
  box(W + 0.15, 0.1, D + 0.15, M.stoneLight, 0, 1.9, 0, g);
  tileRoof(g, W + 0.2, D + 0.1, 1.1, 3.4, "#55392c", "#443024", 7, 20, "shingle", 0.35);
  // 鐘塔
  box(1.2, 1.8, 1.2, M.brick, 0, 4.3, 0, g); box(1.4, 0.12, 1.4, M.stoneLight, 0, 5.25, 0, g); const ct = cone(0.95, 1.0, "#55392c", 0, 5.8, 0, g, 4); ct.rotation.y = Math.PI / 4; sph(0.08, M.brass, 0, 6.35, 0, g, 8, 6);
  const clock = cyl(0.36, 0.36, 0.04, "#fffdf8", 0, 4.55, 0.62, g, 24); clock.rotation.x = Math.PI / 2; torus(0.36, 0.03, M.brass, 0, 4.55, 0.63, g, 24).rotation.x = 0; box(0.03, 0.26, 0.02, "#3a3440", 0, 4.64, 0.66, g); box(0.2, 0.03, 0.02, "#3a3440", 0.08, 4.55, 0.66, g);
  [-1, 1].forEach((sd) => { const bw = add(new THREE.PlaneGeometry(0.4, 0.6), M.win, sd * 0.61, 4.4, 0, g); bw.rotation.y = sd * Math.PI / 2; bw.castShadow = false; torus(0.2, 0.03, FRAME, sd * 0.62, 4.7, 0, g, 16, Math.PI).rotation.y = sd * Math.PI / 2; });
  for (let f = 0; f < 2; f++) [-2.3, -1.4, 1.4, 2.3].forEach((cx) => latticeWin(g, 0.55, 0.75, cx, 1.05 + f * 1.3, D / 2 + 0.01, 0, 2, 3, "#f3efe6", "#d8d0c0"));
  [-0.9, 0.9].forEach((cz) => [1, -1].forEach((s) => latticeWin(g, 0.55, 0.75, s * (W / 2 + 0.01), 1.05, cz, s * Math.PI / 2, 2, 3, "#f3efe6", "#d8d0c0")));
  doorFrame(g, 1.0, 1.7, 0, D / 2 + 0.01, 0, M.woodDark, "#d8d0c0", { arch: true, step: false }); latticeWin(g, 0.9, 0.6, 0, 2.5, D / 2 + 0.01, 0, 3, 2, "#f3efe6", "#d8d0c0");
  signBoard(g, "燈島小學", "#4a3a2a", "#ffe2a0", 1.8, 0, 3.05, D / 2 + 0.08);
  [0, 1].forEach((i) => box(2.0 + i * 0.4, 0.12, 0.4, M.stoneLight, 0, 0.3 - i * 0.12, D / 2 + 0.3 + i * 0.4, g));
  cyl(0.03, 0.03, 3.6, "#d8d4cc", 2.6, 1.8, D / 2 + 1.2, g, 6); box(0.55, 0.36, 0.02, "#c8574a", 2.9, 3.4, D / 2 + 1.2, g); sph(0.05, M.brass, 2.6, 3.62, D / 2 + 1.2, g, 8, 6);
  // 操場邊的長椅、樹
  box(1.1, 0.06, 0.35, M.wood, -2.6, 0.45, D / 2 + 1.2, g); [-0.45, 0.45].forEach((lx) => box(0.06, 0.42, 0.3, M.iron, -2.6 + lx, 0.22, D / 2 + 1.2, g));
  return finish(g, W, D, "學校", x, z, ry, 1.0);
}

/* 書店：窄高三層、凸窗、門口書堆 */
function bookstore(x, z, ry) {
  const W = 2.6, D = 2.2, g = start(x, z, ry, 1.9);
  box(W + 0.2, 0.5, D + 0.2, M.stone, 0, 0.25, 0, g); box(W, 2.9, D, mat("#5a7a9a"), 0, 1.95, 0, g);
  box(W + 0.15, 0.08, D + 0.15, FRAME, 0, 1.8, 0, g); box(W + 0.15, 0.08, D + 0.15, FRAME, 0, 2.9, 0, g);
  tileRoof(g, W, D, 0.8, 3.4, "#3f5a7a", "#2f4660", 6, 10, "shingle", 0.3);
  // 凸窗
  const bay = new THREE.Group(); bay.position.set(-0.6, 1.0, D / 2); g.add(bay); box(1.2, 1.0, 0.4, mat("#5a7a9a"), 0, 0, 0.2, bay); latticeWin(bay, 0.8, 0.75, 0, 0, 0.41, 0, 3, 2, "#f3efe6", "#8a8278"); [-1, 1].forEach((sd) => latticeWin(bay, 0.3, 0.75, sd * 0.61, 0, 0.2, sd * Math.PI / 2, 1, 2, "#f3efe6")); box(1.3, 0.08, 0.5, FRAME, 0, 0.55, 0.2, bay); box(1.3, 0.1, 0.5, FRAME, 0, -0.55, 0.2, bay);
  doorFrame(g, 0.65, 1.4, 0.75, D / 2 + 0.01, 0, M.woodDark, FRAME, { glass: true });
  [-0.6, 0.6].forEach((cx) => latticeWin(g, 0.5, 0.65, cx, 2.3, D / 2 + 0.05, 0, 2, 2, "#f3efe6", "#8a8278", "#f3e4c8"));
  latticeWin(g, 0.5, 0.65, W / 2 + 0.01, 1.1, 0.1, Math.PI / 2, 2, 2, "#f3efe6", "#8a8278");
  signBoard(g, "📚 書店", "#f3efe6", "#2a3a4a", 1.2, 0.3, 2.0, D / 2 + 0.08);
  signBoard(g, "書", "#f3efe6", "#2a3a4a", 0.5, W / 2 + 0.28, 2.3, D / 2 - 0.3, Math.PI / 2, true);
  [["#c8574a", 0], ["#e8b93a", 0.08], ["#3f7a5a", 0.16], ["#7a5a9a", 0.24], ["#3f5a7a", 0.32]].forEach(([c, y], i) => { const b = box(0.36, 0.08, 0.26, c, -1.5, 0.04 + y, D / 2 + 0.5, g); b.rotation.y = i * 0.25; });
  box(0.9, 0.5, 0.3, M.wood, 1.5, 0.25, D / 2 + 0.45, g); [0, 1, 2, 3, 4].forEach((i) => box(0.12, 0.3, 0.2, ["#c8574a", "#e8b93a", "#3f7a5a", "#7a5a9a", "#f3efe6"][i], 1.2 + i * 0.15, 0.65, D / 2 + 0.45, g));
  return finish(g, W, D, "書店", x, z, ry, 0.6);
}

/* 麵包店：粉牆、圓窗、大煙囪、窗台麵包 */
function bakery(x, z, ry) {
  const W = 3.0, D = 2.3, g = start(x, z, ry, 2.0);
  box(W + 0.2, 0.5, D + 0.2, M.stone, 0, 0.25, 0, g); box(W, 1.6, D, mat("#f6d8c8"), 0, 1.3, 0, g); timber(g, W, 1.6, D, 1.3, D / 2);
  tileRoof(g, W + 0.2, D + 0.1, 1.2, 2.1, "#c8886a", "#a06a50", 8, 12, "shingle", 0.35);
  box(0.5, 1.6, 0.5, M.brick, 0.8, 2.9, -0.4, g); box(0.62, 0.1, 0.62, "#5a5048", 0.8, 3.72, -0.4, g); smoke(g, 0.8, 3.85, -0.4);
  const rw = new THREE.Group(); rw.position.set(-0.7, 1.35, D / 2 + 0.01); g.add(rw); add(new THREE.CircleGeometry(0.38, 24), M.win, 0, 0, 0, rw).castShadow = false; torus(0.38, 0.05, "#fbfaf4", 0, 0, 0.01, rw, 28); box(0.74, 0.03, 0.03, "#fbfaf4", 0, 0, 0.03, rw); box(0.03, 0.74, 0.03, "#fbfaf4", 0, 0, 0.03, rw);
  doorFrame(g, 0.65, 1.35, 0.75, D / 2 + 0.01, 0, mat("#8a5a4a"), FRAME, { glass: true });
  latticeWin(g, 0.55, 0.6, W / 2 + 0.01, 1.2, 0.2, Math.PI / 2, 2, 2, "#fbfaf4", "#8a8278", "#f3e4c8", { flowers: true });
  signBoard(g, "🥐 麵包坊", "#fff4e0", "#a0603a", 1.4, 0, 2.15, D / 2 + 0.08);
  // 窗台麵包籃、門口小桌
  box(0.7, 0.22, 0.3, M.wood, -0.7, 0.8, D / 2 + 0.2, g); [[-0.9, 0.95], [-0.7, 0.97], [-0.5, 0.93], [-0.8, 1.02], [-0.6, 1.02]].forEach(([bx, by]) => { const b = sph(0.09, "#e0a860", bx, by, D / 2 + 0.22, g, 8, 6); b.scale.set(1.3, 0.8, 1); });
  cyl(0.28, 0.28, 0.04, "#f3efe6", -1.5, 0.62, D / 2 + 0.9, g, 12); cyl(0.04, 0.05, 0.6, M.iron, -1.5, 0.3, D / 2 + 0.9, g, 6); cyl(0.1, 0.1, 0.03, "#fbf6ea", -1.5, 0.66, D / 2 + 0.9, g, 10); sph(0.06, "#e0a860", -1.5, 0.72, D / 2 + 0.9, g, 8, 6);
  return finish(g, W, D, "麵包店", x, z, ry, 0.8);
}

/* 旅店：三層、陽台、吊掛招牌、拱門馬車道 */
function inn(x, z, ry) {
  const W = 4.4, D = 3.0, g = start(x, z, ry, 2.8);
  box(W + 0.2, 1.1, D + 0.2, M.stone, 0, 0.55, 0, g); box(W, 2.5, D, M.plaster, 0, 2.35, 0, g);
  box(W + 0.15, 0.08, D + 0.15, FRAME, 0, 1.1, 0, g); box(W + 0.15, 0.08, D + 0.15, FRAME, 0, 2.3, 0, g); timber(g, W, 1.2, D, 1.7, D / 2); timber(g, W, 1.2, D, 2.95, D / 2);
  tileRoof(g, W + 0.2, D + 0.1, 1.5, 3.6, "#6b4a3a", "#55392c", 9, 16, "shingle", 0.4);
  [[-1.2, 0.5], [1.2, 0.5]].forEach(([dx, dz]) => { const dor = new THREE.Group(); dor.position.set(dx, 4.0, 0.9); g.add(dor); box(0.7, 0.6, 0.8, M.plaster, 0, 0.3, 0, dor); tileRoof(dor, 0.7, 0.7, 0.4, 0.6, "#6b4a3a", "#55392c", 3, 5, "shingle", 0.12); latticeWin(dor, 0.4, 0.36, 0, 0.3, 0.41, 0, 2, 2, FRAME); });
  box(0.45, 1.4, 0.45, M.stone, -1.6, 4.4, -0.6, g); box(0.58, 0.1, 0.58, "#5a5048", -1.6, 5.13, -0.6, g); smoke(g, -1.6, 5.25, -0.6);
  // 陽台
  box(W - 0.6, 0.1, 0.7, M.wood, 0, 2.3, D / 2 + 0.35, g); for (let i = 0; i < 12; i++) box(0.04, 0.5, 0.04, FRAME, -W / 2 + 0.45 + i * (W - 0.9) / 11, 2.6, D / 2 + 0.68, g); box(W - 0.55, 0.05, 0.05, FRAME, 0, 2.86, D / 2 + 0.68, g); [-1, 1].forEach((sd) => { const br = box(0.06, 0.06, 0.8, FRAME, sd * (W / 2 - 0.5), 1.95, D / 2 + 0.3, g); br.rotation.x = -0.7; });
  flowerBox(g, 0, 2.38, D / 2 + 0.7, 0, 1.6);
  doorFrame(g, 1.0, 1.6, 0, D / 2 + 0.11, 0, M.woodDark, FRAME, { arch: true });
  [-1.4, 1.4].forEach((cx) => latticeWin(g, 0.6, 0.7, cx, 0.8, D / 2 + 0.11, 0, 2, 2, "#f3efe6", "#8a8278", "#c8574a", { shutters: "#6b4a3a" }));
  [-1.4, 0, 1.4].forEach((cx) => { latticeWin(g, 0.55, 0.65, cx, 1.75, D / 2 + 0.05, 0, 2, 2, FRAME, "#8a7a6a", "#f3e4c8"); latticeWin(g, 0.55, 0.65, cx, 3.0, D / 2 + 0.05, 0, 2, 2, FRAME, "#8a7a6a", "#f3e4c8"); });
  [-1, 1].forEach((s) => [-0.9, 0.9].forEach((cz) => latticeWin(g, 0.55, 0.65, s * (W / 2 + 0.05), 1.75, cz, s * Math.PI / 2, 2, 2, FRAME, "#8a7a6a", "#f3e4c8")));
  signBoard(g, "燈島旅店", "#3a2a1a", "#ffd27a", 1.5, 0, 1.75, D / 2 + 0.08);
  const post = new THREE.Group(); post.position.set(W / 2 + 0.6, 0, D / 2 + 0.3); g.add(post); cyl(0.05, 0.06, 2.0, FRAME, 0, 1.0, 0, post, 7); box(0.7, 0.05, 0.05, FRAME, -0.3, 1.9, 0, post); signBoard(post, "🛏 旅店", "#3a2a1a", "#ffd27a", 0.6, -0.4, 1.55, 0, 0, true);
  ivy(g, -W / 2 - 0.05, 0.2, 0.8, -Math.PI / 2, 24);
  for (let i = 0; i < 2; i++) { cyl(0.16, 0.14, 0.4, M.wood, 1.9 + i * 0.4, 0.2, D / 2 + 0.6, g, 10); sph(0.22, "#4f8a3c", 1.9 + i * 0.4, 0.55, D / 2 + 0.6, g, 10, 8); }
  return finish(g, W, D, "旅店", x, z, ry, 0.9);
}

/* 鐘樓小教堂：尖塔、彩繪玫瑰窗 */
function chapel(x, z, ry) {
  const W = 2.6, D = 3.6, g = start(x, z, ry, 2.3);
  box(W + 0.2, 0.5, D + 0.2, M.stone, 0, 0.25, 0, g); box(W, 2.6, D, M.stoneLight, 0, 1.8, 0, g);
  tileRoof(g, W, D - 0.1, 1.6, 3.1, "#55606e", "#434d58", 10, 14, "shingle", 0.25);
  // 塔
  box(1.2, 4.2, 1.2, M.stoneLight, 0, 2.6, D / 2 - 0.5, g); box(1.4, 0.15, 1.4, M.stone, 0, 4.75, D / 2 - 0.5, g);
  const sp = cone(0.85, 2.2, "#55606e", 0, 5.9, D / 2 - 0.5, g, 4); sp.rotation.y = Math.PI / 4; sph(0.06, M.brass, 0, 7.05, D / 2 - 0.5, g, 8, 6); box(0.04, 0.5, 0.04, M.brass, 0, 7.3, D / 2 - 0.5, g); box(0.3, 0.04, 0.04, M.brass, 0, 7.4, D / 2 - 0.5, g);
  [0, 1, 2, 3].forEach((i) => { const a = i * Math.PI / 2; const w = latticeWin(g, 0.35, 0.7, Math.sin(a) * 0.61, 4.0, D / 2 - 0.5 + Math.cos(a) * 0.61, a, 1, 2, FRAME, null, null, { arch: true }); });
  cyl(0.12, 0.16, 0.25, M.brass, 0, 4.0, D / 2 - 0.5, g, 10);
  // 玫瑰窗、拱門、側窗
  const rose = new THREE.Group(); rose.position.set(0, 2.1, D / 2 + 0.11); g.add(rose); add(new THREE.CircleGeometry(0.42, 24), M.winCool, 0, 0, 0, rose).castShadow = false; torus(0.42, 0.05, M.stoneLight, 0, 0, 0.01, rose, 28); for (let i = 0; i < 6; i++) { const sp2 = box(0.03, 0.8, 0.03, M.stoneLight, 0, 0, 0.03, rose); sp2.rotation.z = i * Math.PI / 6; }
  doorFrame(g, 0.8, 1.5, 0, D / 2 + 0.11, 0, M.woodDark, M.stoneLight, { arch: true });
  [-1, 1].forEach((s) => [-1.0, 0.0, 1.0].forEach((cz) => latticeWin(g, 0.4, 1.0, s * (W / 2 + 0.01), 1.6, cz, s * Math.PI / 2, 1, 3, M.stoneLight, null, null, { arch: true, cool: true })));
  [0, 1].forEach((i) => box(1.8 + i * 0.4, 0.12, 0.4, M.stoneLight, 0, 0.3 - i * 0.12, D / 2 + 0.3 + i * 0.4, g));
  ivy(g, W / 2 + 0.05, 0.1, -1.0, Math.PI / 2, 24);
  return finish(g, W, D, "鐘樓", x, z, ry, 0.9);
}

const KIND = { house, library, cafe, konbini, school, bookstore, bakery, inn, chapel };

/* 街道：兩圈環形路、放射路、中央廣場 */
function roads(y) {
  const m = M.cobble; M.cobble.map.repeat.set(3, 3);
  const dirt = mat("#c6a77a", { roughness: 1 });
  const plaza = add(new THREE.CircleGeometry(4.6, 48), m, 0, y + 0.01, 0, C.scene); plaza.rotation.x = -Math.PI / 2; plaza.castShadow = false;
  // 路段：{ x0, z0, x1, z1, w, kind: "cobble" | "dirt" }。石板街兩旁有路燈，土路（野外路線）兩旁有圍欄
  C.roads.forEach((r) => {
    const dx = r.x1 - r.x0, dz = r.z1 - r.z0, len = Math.hypot(dx, dz), a = Math.atan2(dx, dz), nx = Math.cos(a), nz = -Math.sin(a);
    const pl = add(new THREE.PlaneGeometry(r.w, len + r.w * 0.9), r.kind === "dirt" ? dirt : m, (r.x0 + r.x1) / 2, y + (r.kind === "dirt" ? 0.011 : 0.012), (r.z0 + r.z1) / 2, C.scene); pl.rotation.set(-Math.PI / 2, 0, -a); pl.castShadow = false;
    if (r.kind === "dirt") {
      // 圍欄：每段 6 格、留 3 格缺口，從路口 2 格後開始
      for (let side = -1; side <= 1; side += 2) { const off = r.w / 2 + 0.55; let t = 2.2; while (t + 3 < len - 1) { const t1 = Math.min(t + 6, len - 1.2); fenceLine(C.scene, r.x0 + dx / len * t + nx * off * side, r.z0 + dz / len * t + nz * off * side, r.x0 + dx / len * t1 + nx * off * side, r.z0 + dz / len * t1 + nz * off * side, Math.max(1, Math.round((t1 - t) / 1.3)), "#a08a6a", y); t = t1 + 3; } }
    } else if (!r.noLamp) {
      for (let t = 3.5, k = 0; t < len - 1.5; t += 7, k++) { const side = k % 2 ? 1 : -1, off = r.w / 2 + 0.6; C.addLamp(C.scene, r.x0 + dx / len * t + nx * off * side, y, r.z0 + dz / len * t + nz * off * side); }
    }
  });
  // 廣場：長椅、花圃（燈塔在正中央）
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; const bx = Math.sin(a) * 3.3, bz = Math.cos(a) * 3.3; const g = new THREE.Group(); g.position.set(bx, y, bz); g.rotation.y = a; C.scene.add(g); box(1.1, 0.08, 0.35, M.wood, 0, 0.42, 0, g); box(1.1, 0.3, 0.06, M.wood, 0, 0.62, -0.17, g); [-0.45, 0.45].forEach((lx) => box(0.06, 0.42, 0.3, M.iron, lx, 0.21, 0, g)); C.colliders.push({ x: bx, z: bz, r: 0.5 }); }
  for (let i = 0; i < 2; i++) { const a = i * Math.PI + Math.PI / 2; const fx = Math.sin(a) * 3.4, fz = Math.cos(a) * 3.4; cyl(0.5, 0.45, 0.3, M.stoneLight, fx, y + 0.15, fz, C.scene, 10); flowers(C.scene, fx, fz, 0.35, 10, ["#f07a8a", "#ffd27a", "#f3efe6", "#c8a0e0"], y + 0.3); C.colliders.push({ x: fx, z: fz, r: 0.55 }); }
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; C.addLamp(C.scene, Math.sin(a) * 5.4, y, Math.cos(a) * 5.4); }
}

/* ===== 郊外：池塘、農田、風車 ===== */
export const windmills = [];
function pond(x, z, r) {
  const g = new THREE.Group(); g.position.set(x, 0.55, z); C.scene.add(g);
  const w = add(new THREE.CircleGeometry(r, 32), mat("#3f8fa8", { roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.9 }), 0, 0.02, 0, g); w.rotation.x = -Math.PI / 2; w.castShadow = false;
  const rim = add(new THREE.RingGeometry(r, r + 0.6, 32), mat("#c9b48a", { roughness: 1 }), 0, 0.015, 0, g); rim.rotation.x = -Math.PI / 2; rim.castShadow = false;
  for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, rr = r + 0.1 + (i % 3) * 0.2; cyl(0.015, 0.015, 0.7 + (i % 2) * 0.3, "#5f8f3e", Math.cos(a) * rr, 0.35, Math.sin(a) * rr, g, 4); if (i % 3 === 0) { const c = cyl(0.04, 0.04, 0.18, "#6a4a2a", Math.cos(a) * rr, 0.75, Math.sin(a) * rr, g, 6); } }
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.4; const rk = add(new THREE.DodecahedronGeometry(0.25 + (i % 2) * 0.12, 1), M.stone, Math.cos(a) * (r + 0.5), 0.1, Math.sin(a) * (r + 0.5), g); rk.scale.y = 0.6; }
  [[0.3, 0.2], [-0.5, -0.4], [0.1, -0.6]].forEach(([lx, lz]) => { const lp = add(new THREE.CircleGeometry(0.22, 12), mat("#4f8a3c"), lx * r, 0.03, lz * r, g); lp.rotation.x = -Math.PI / 2; lp.castShadow = false; sph(0.05, "#f8c0d0", lx * r, 0.08, lz * r, g, 8, 6); });
  const dock = box(0.8, 0.06, 2.2, M.wood, 0, 0.12, r - 0.2, g); [0.5, 1.4].forEach((dz) => [-0.3, 0.3].forEach((dx) => cyl(0.04, 0.04, 0.5, FRAME, dx, -0.1, r - 1.3 + dz, g, 6)));
  C.colliders.push({ x, z, r: r + 0.3 });
  return g;
}
function field(x, z, ry, w, d, crop) {
  const g = new THREE.Group(); g.position.set(x, 0.55, z); g.rotation.y = ry; C.scene.add(g);
  const soil = add(new THREE.PlaneGeometry(w, d), mat("#7a5a3a", { roughness: 1, polygonOffset: true, polygonOffsetFactor: -1 }), 0, 0.01, 0, g); soil.rotation.x = -Math.PI / 2; soil.castShadow = false;
  const rows = Math.floor(d / 0.7), per = Math.floor(w / 0.45);
  const geo = crop === "wheat" ? new THREE.ConeGeometry(0.08, 0.6, 5) : new THREE.SphereGeometry(0.16, 7, 5); if (crop === "wheat") geo.translate(0, 0.3, 0); else geo.translate(0, 0.14, 0);
  const im = new THREE.InstancedMesh(geo, mat(crop === "wheat" ? "#d9b24a" : crop === "cabbage" ? "#7fb35a" : "#c8574a"), rows * per); im.castShadow = im.receiveShadow = true;
  const Mx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3(); let n = 0;
  for (let r = 0; r < rows; r++) { box(w, 0.08, 0.3, "#6a4a2c", 0, 0.04, -d / 2 + 0.35 + r * 0.7, g); for (let i = 0; i < per; i++) { pos.set(-w / 2 + 0.25 + i * 0.45, 0.08, -d / 2 + 0.35 + r * 0.7); sc.setScalar(0.8 + ((r * 7 + i * 3) % 5) * 0.08); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), i); Mx.compose(pos, q, sc); im.setMatrixAt(n++, Mx); } }
  im.count = n; g.add(im);
  if (crop === "tomato") for (let r = 0; r < rows; r++) for (let i = 0; i < per; i += 2) cyl(0.015, 0.015, 0.5, FRAME, -w / 2 + 0.25 + i * 0.45, 0.3, -d / 2 + 0.35 + r * 0.7, g, 4);
  fenceLine(g, -w / 2 - 0.3, d / 2 + 0.3, w / 2 + 0.3, d / 2 + 0.3, Math.round(w / 1.2)); fenceLine(g, -w / 2 - 0.3, -d / 2 - 0.3, w / 2 + 0.3, -d / 2 - 0.3, Math.round(w / 1.2));
  fenceLine(g, -w / 2 - 0.3, -d / 2 - 0.3, -w / 2 - 0.3, d / 2 + 0.3, Math.round(d / 1.2)); fenceLine(g, w / 2 + 0.3, -d / 2 - 0.3, w / 2 + 0.3, d / 2 + 0.3, Math.round(d / 1.2));
  // 稻草人
  const sc2 = new THREE.Group(); sc2.position.set(w / 2 - 0.6, 0, -d / 2 + 0.6); g.add(sc2); cyl(0.04, 0.04, 1.4, FRAME, 0, 0.7, 0, sc2, 6); box(0.9, 0.05, 0.05, FRAME, 0, 1.1, 0, sc2); box(0.4, 0.5, 0.25, "#c8574a", 0, 1.0, 0, sc2); sph(0.16, "#e8c070", 0, 1.45, 0, sc2, 10, 8); cone(0.3, 0.2, "#c9b26a", 0, 1.62, 0, sc2, 10);
  C.colliders.push({ x, z, r: Math.max(w, d) / 2 + 0.5 });
  return g;
}
function windmill(x, z, ry) {
  const g = new THREE.Group(); g.position.set(x, 0.55, z); g.rotation.y = ry; C.scene.add(g);
  box(3.2, 0.5, 3.2, M.stone, 0, 0.25, 0, g); cyl(1.1, 1.5, 4.6, M.stoneLight, 0, 2.8, 0, g, 12);
  cyl(1.25, 1.25, 0.3, FRAME, 0, 5.2, 0, g, 12); const cap = cone(1.35, 1.4, "#6b4a3a", 0, 6.0, 0, g, 12);
  doorFrame(g, 0.7, 1.4, 0, 1.45, 0, M.woodDark, FRAME); latticeWin(g, 0.45, 0.6, 0, 2.6, 1.33, 0, 2, 2, "#f3efe6", "#8a8278"); latticeWin(g, 0.4, 0.5, 0, 4.0, 1.18, 0, 2, 2, "#f3efe6");
  const hub = new THREE.Group(); hub.position.set(0, 5.1, 1.5); hub.userData.noBake = true; g.add(hub); cyl(0.12, 0.12, 0.8, FRAME, 0, 0, 0, hub, 8).rotation.x = Math.PI / 2; sph(0.2, FRAME, 0, 0, 0.4, hub, 10, 8);
  for (let i = 0; i < 4; i++) { const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2; hub.add(arm); box(0.1, 3.4, 0.08, FRAME, 0, 1.7, 0.4, arm); const sail = box(0.9, 2.6, 0.02, "#f3efe6", 0.5, 2.0, 0.4, arm); for (let k = 0; k < 4; k++) box(0.9, 0.03, 0.04, FRAME, 0.5, 1.0 + k * 0.7, 0.42, arm); }
  windmills.push(hub);
  for (let i = 0; i < 5; i++) { const b = cyl(0.3, 0.3, 0.5, M.wood, 1.9 + (i % 3) * 0.65, 0.25 + Math.floor(i / 3) * 0.5, -1.2 + (i % 2) * 0.2, g, 10); b.rotation.x = 0; }
  C.colliders.push({ x, z, r: 2.0 });
  return { name: "風車", x, z, ry, door: { x: x + Math.sin(ry) * 2.5, z: z + Math.cos(ry) * 2.5 }, front: { x: x + Math.sin(ry) * 3.8, z: z + Math.cos(ry) * 3.8 }, r: 2 };
}
const EXTRA = { pond, field, windmill };
export function buildExtras(list) { return list.map(([kind, ...args]) => EXTRA[kind](...args)); }

export function buildTown(ctx) {
  C = ctx;
  roads(ctx.y);
  return ctx.layout.map(([kind, x, z, ry, ...rest]) => { const b = KIND[kind](x, z, ry, ...rest); b.kind = kind; return b; });
}
