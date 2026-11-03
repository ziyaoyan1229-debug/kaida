/* 手繪感的植物：葉叢面片組成的樹冠、交叉面片的草、灌木、雲
   貼圖都用 canvas 畫，顏色靠材質色／頂點色上色；草和葉子會隨風擺動（uWind） */
import { THREE, mat, cyl } from "./chars.js";
import { M, TAU } from "./art.js";

const rnd = Math.random;
export const WIND = { value: 0 };

function canvasTex(w, h, fn) { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

/* 草：一叢 9 根葉片，底深頂淺；用灰階畫，顏色由 instance color 決定 */
let grassTex = null, leafTex = null, cloudTex = null, flowerTex = null;
function getGrassTex() {
  return grassTex || (grassTex = canvasTex(128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 11; i++) {
      const x0 = 18 + i * 9 + (rnd() - 0.5) * 6, tip = 10 + rnd() * 30, lean = (rnd() - 0.5) * 50, wid = 5 + rnd() * 4;
      const gr = g.createLinearGradient(0, h, 0, tip); gr.addColorStop(0, "#5a5a5a"); gr.addColorStop(0.55, "#9a9a9a"); gr.addColorStop(1, "#e0e0e0");
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0 - wid, h); g.quadraticCurveTo(x0 + lean * 0.3, h * 0.55, x0 + lean, tip); g.quadraticCurveTo(x0 + lean * 0.4, h * 0.6, x0 + wid, h); g.closePath(); g.fill();
    }
  }));
}
/* 葉叢：一團重疊的小葉片，左上亮右下暗，邊緣透明 */
function getLeafTex() {
  return leafTex || (leafTex = canvasTex(128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 95; i++) {
      const a = rnd() * TAU, r = Math.sqrt(rnd()) * 46, x = 64 + Math.cos(a) * r, y = 64 + Math.sin(a) * r * 0.85;
      const lit = 0.5 + 0.5 * ((64 - x) / 64 * 0.5 + (64 - y) / 64 * 0.8); // 左上較亮
      const v = Math.round(95 + lit * 140 + (rnd() - 0.5) * 30);
      g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.ellipse(x, y, 7 + rnd() * 6, 5 + rnd() * 4, rnd() * TAU, 0, TAU); g.fill();
    }
  }));
}
/* 雲：幾團圓疊起來，上白下帶一點藍灰 */
function getCloudTex() {
  return cloudTex || (cloudTex = canvasTex(256, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const blobs = []; for (let i = 0; i < 16; i++) blobs.push([40 + rnd() * 176, 58 + rnd() * 40, 18 + rnd() * 26]);
    blobs.push([128, 60, 44], [90, 70, 36], [170, 72, 34]);
    // 先畫陰影層（下半偏藍灰），再畫亮層往上偏
    blobs.forEach(([x, y, r]) => { const gr = g.createRadialGradient(x, y + r * 0.3, r * 0.1, x, y + r * 0.3, r); gr.addColorStop(0, "rgba(176,190,214,1)"); gr.addColorStop(0.7, "rgba(176,190,214,.9)"); gr.addColorStop(1, "rgba(176,190,214,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y + r * 0.3, r, 0, TAU); g.fill(); });
    blobs.forEach(([x, y, r]) => { const gr = g.createRadialGradient(x - r * 0.2, y - r * 0.35, r * 0.05, x - r * 0.1, y - r * 0.2, r * 0.9); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.6, "rgba(252,252,255,.95)"); gr.addColorStop(1, "rgba(252,252,255,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x - r * 0.1, y - r * 0.2, r * 0.9, 0, TAU); g.fill(); });
  }));
}
function getFlowerTex() {
  return flowerTex || (flowerTex = canvasTex(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64); g.strokeStyle = "#4f7a32"; g.lineWidth = 3; g.beginPath(); g.moveTo(32, 64); g.quadraticCurveTo(36, 40, 30, 22); g.stroke();
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(30 + Math.cos(a) * 8, 20 + Math.sin(a) * 8, 6, 4.5, a, 0, TAU); g.fill(); }
    g.fillStyle = "#ffd25a"; g.beginPath(); g.arc(30, 20, 4.5, 0, TAU); g.fill();
  }));
}

/* 風：把 uWind 塞進材質，頂點沿 x/z 擺動，幅度隨 uv.y（越高擺越大） */
function windify(material, amp) {
  material.onBeforeCompile = (sh) => {
    sh.uniforms.uWind = WIND;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uWind;")
      .replace("#include <begin_vertex>", `vec3 transformed = vec3(position);
#ifdef USE_INSTANCING
  vec3 wpos = (instanceMatrix * vec4(position, 1.)).xyz;
#else
  vec3 wpos = position;
#endif
  float sway = (sin(uWind * 1.7 + wpos.x * 0.6 + wpos.z * 0.45) + sin(uWind * 2.9 + wpos.z * 1.3) * 0.4) * ${amp.toFixed(3)} * uv.y;
  transformed.x += sway; transformed.z += sway * 0.4;`);
  };
  material.customProgramCacheKey = () => "wind" + amp;
  return material;
}

/* 交叉草片的幾何：兩片互相垂直的矩形，法線朝上，讓草的明暗跟地面一致 */
function crossGeo(w, h) {
  const a = new THREE.PlaneGeometry(w, h), b = new THREE.PlaneGeometry(w, h);
  a.translate(0, h / 2, 0); b.rotateY(Math.PI / 2); b.translate(0, h / 2, 0);
  const pos = new Float32Array([...a.attributes.position.array, ...b.attributes.position.array]);
  const uv = new Float32Array([...a.attributes.uv.array, ...b.attributes.uv.array]);
  const idx = [...a.index.array, ...Array.from(b.index.array, (i) => i + a.attributes.position.count)];
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
  const n = new Float32Array(pos.length); for (let i = 0; i < n.length; i += 3) { n[i] = 0; n[i + 1] = 1; n[i + 2] = 0; } g.setAttribute("normal", new THREE.BufferAttribute(n, 3));
  return g;
}
let grassM = null;
function getGrassM() { return grassM || (grassM = windify(new THREE.MeshStandardMaterial({ map: getGrassTex(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.95, metalness: 0 }), 0.12)); }

/* 草地：n 叢草，sampler 回傳位置或 null。cols 是幾種綠，隨機挑 */
export function grassField(parent, n, sampler, opt) {
  opt = opt || {}; const sc = opt.scale || 1, cols = (opt.cols || ["#6aa84f", "#5c9a44", "#7ab65c", "#4f8a3c", "#8cc46a"]).map((c) => new THREE.Color(c));
  const im = new THREE.InstancedMesh(crossGeo(0.5 * sc, 0.42 * sc), getGrassM(), n); im.castShadow = false; im.receiveShadow = true; im.frustumCulled = false;
  const Mx = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), e = new THREE.Euler(), c = new THREE.Color();
  let i = 0, tries = 0;
  while (i < n && tries++ < n * 20) { const p = sampler(); if (!p) continue; e.set(0, rnd() * TAU, 0); q.setFromEuler(e); const k = 0.7 + rnd() * 0.7; s.set(k, k * (0.8 + rnd() * 0.5), k); Mx.compose(p, q, s); im.setMatrixAt(i, Mx); im.setColorAt(i, c.copy(cols[Math.floor(rnd() * cols.length)]).offsetHSL(0, 0, (rnd() - 0.5) * 0.06)); i++; }
  im.count = i; parent.add(im); return im;
}
/* 高草：一片區域塞滿較高的草 */
export function tallGrassField(parent, x, z, w, d, ry, y0) {
  const n = Math.floor(w * d * 3.2), cr = Math.cos(ry || 0), sr = Math.sin(ry || 0);
  return grassField(parent, n, () => { const lx = (rnd() - 0.5) * w, lz = (rnd() - 0.5) * d; const wx = x + lx * cr + lz * sr, wz = z - lx * sr + lz * cr; return new THREE.Vector3(wx, y0 == null ? 0.55 : typeof y0 === "function" ? y0(wx, wz) : y0, wz); }, { scale: 2.1, cols: ["#4f8a3c", "#5c9a44", "#457a34", "#6aa84f", "#3f7a30"] });
}
/* 野花：小面片 */
let flowerM = null;
export function flowerField(parent, n, sampler) {
  flowerM = flowerM || windify(new THREE.MeshStandardMaterial({ map: getFlowerTex(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 }), 0.06);
  const geo = crossGeo(0.26, 0.3);
  const im = new THREE.InstancedMesh(geo, flowerM, n); im.castShadow = false; im.frustumCulled = false;
  const Mx = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), e = new THREE.Euler(), c = new THREE.Color();
  const cols = ["#ffffff", "#ffd27a", "#f4a0b0", "#c8a0e0", "#ffffff"]; let i = 0, tries = 0;
  while (i < n && tries++ < n * 20) { const p = sampler(); if (!p) continue; e.set(0, rnd() * TAU, 0); q.setFromEuler(e); const k = 0.8 + rnd() * 0.5; s.set(k, k, k); Mx.compose(p, q, s); im.setMatrixAt(i, Mx); im.setColorAt(i, c.set(cols[Math.floor(rnd() * cols.length)])); i++; }
  im.count = i; parent.add(im); return im;
}

/* 樹冠：葉叢面片貼在橢球殼上朝外，上面的叢亮、下面的暗（頂點色），加一顆深色核心球撐住剪影 */
const LEAF_PAL = {
  green: ["#4f8a3c", "#64a24a", "#7ab65c", "#8cc46a"], dark: ["#3a6a30", "#44783a", "#2f5a28", "#4a8040"],
  autumn: ["#d88a3a", "#e8a84a", "#c86a2a", "#f0c060"], cherry: ["#f4b6c8", "#f8c9d6", "#ee9fb8", "#fbdce4"],
};
const leafMats = {};
function leafM(kind) {
  if (!leafMats[kind]) leafMats[kind] = windify(new THREE.MeshStandardMaterial({ map: getLeafTex(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9, metalness: 0, vertexColors: true }), 0.035);
  return leafMats[kind];
}
const cardGeo = (() => { const g = new THREE.PlaneGeometry(1, 0.85); return g; })();
function leafCards(group, cx, cy, cz, rx, ry, rz, n, kind, lift) {
  const pal = LEAF_PAL[kind] || LEAF_PAL.green, tmp = new THREE.Color(), dir = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < n; i++) {
    const t = i / n, phi = Math.acos(1 - 2 * (t * 0.9 + 0.05)), th = i * 2.39996 + rnd() * 0.4;
    dir.set(Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th));
    const p = new THREE.Vector3(cx + dir.x * rx * (0.85 + rnd() * 0.2), cy + dir.y * ry * (0.85 + rnd() * 0.2), cz + dir.z * rz * (0.85 + rnd() * 0.2));
    const g = cardGeo.clone();
    const lit = 0.55 + 0.45 * (dir.y * 0.7 + (lift || 0)) + (rnd() - 0.5) * 0.15; // 越上面越亮
    tmp.set(pal[Math.floor(rnd() * pal.length)]).multiplyScalar(Math.max(0.35, lit));
    const col = new Float32Array(g.attributes.position.count * 3); for (let k = 0; k < col.length; k += 3) { col[k] = tmp.r; col[k + 1] = tmp.g; col[k + 2] = tmp.b; }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m = new THREE.Mesh(g, leafM(kind)); m.position.copy(p); m.lookAt(p.clone().add(dir)); m.rotateZ(rnd() * TAU); const sc = 1.1 + rnd() * 0.5; m.scale.set(sc, sc, 1);
    m.castShadow = true; m.receiveShadow = true; m.userData.noOutline = true; group.add(m);
  }
}
export function leafTree(parent, x, y, z, s, kind) {
  const t = new THREE.Group(); t.position.set(x, y, z); t.scale.setScalar(s); t.rotation.y = rnd() * TAU; parent.add(t);
  cyl(0.12, 0.22, 1.5, M.bark, 0, 0.7, 0, t, 9);
  [[0.3, 1.4, 0.05, -0.7, 0.0], [-0.28, 1.45, -0.1, 0.65, 0.3], [0.05, 1.6, 0.3, 0.1, 0.9]].forEach(([bx, by, bz, rz, rx]) => { const b = cyl(0.05, 0.08, 0.8, M.bark, bx, by, bz, t, 7); b.rotation.set(rx, 0, rz); });
  const pal = LEAF_PAL[kind] || LEAF_PAL.green;
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.72, 10, 8), mat(pal[0], { roughness: 1 })); core.position.set(0, 2.05, 0); core.scale.set(1, 0.85, 1); core.castShadow = true; core.userData.noOutline = true; t.add(core);
  const coreCol = new THREE.Color(pal[0]).multiplyScalar(0.55); core.material = mat(coreCol.getStyle(), { roughness: 1 });
  leafCards(t, 0, 2.1, 0, 1.05, 0.95, 1.05, 26, kind, 0);
  leafCards(t, 0, 2.55, 0, 0.6, 0.45, 0.6, 8, kind, 0.15); // 頂上再補一撮
  return t;
}
export function bush(parent, x, y, z, s, kind) {
  const t = new THREE.Group(); t.position.set(x, y, z); t.scale.setScalar(s); t.rotation.y = rnd() * TAU; parent.add(t);
  const pal = LEAF_PAL[kind || "green"]; const core = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), mat(new THREE.Color(pal[0]).multiplyScalar(0.6).getStyle(), { roughness: 1 })); core.position.y = 0.35; core.scale.set(1.2, 0.8, 1.2); core.castShadow = true; core.userData.noOutline = true; t.add(core);
  leafCards(t, 0, 0.4, 0, 0.62, 0.45, 0.62, 10, kind || "green", 0.1);
  return t;
}

/* 雲：遠處幾朵大 sprite，慢慢繞著島飄，顏色跟著天色 */
export function makeClouds(scene, n) {
  const tex = getCloudTex(), list = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, opacity: 0.95 });
    // 一半高空大朵，一半貼近地平線的厚積雲，低鏡頭往前看才看得到雲
    const low = i % 2 === 1; const sp = new THREE.Sprite(m); const w = low ? 110 + rnd() * 120 : 80 + rnd() * 100; sp.scale.set(w, w * (low ? 0.42 : 0.5), 1); sp.userData.noBake = true; scene.add(sp);
    list.push({ sp, a: rnd() * TAU, r: low ? 235 + rnd() * 30 : 150 + rnd() * 90, y: low ? 26 + rnd() * 22 : 60 + rnd() * 60, v: (0.004 + rnd() * 0.006) * (rnd() < 0.5 ? 1 : -1) });
  }
  return list;
}
export function tickClouds(list, dt, tint, alpha) { list.forEach((c) => { c.a += c.v * dt; c.sp.position.set(Math.cos(c.a) * c.r, c.y, Math.sin(c.a) * c.r); c.sp.material.color.copy(tint); c.sp.material.opacity = alpha; }); }

/* 遠山：海平線上一圈淡淡的山影，被霧吃掉一半剛好 */
export function makeMountains(scene) {
  const g = new THREE.Group(); g.userData.noBake = true; scene.add(g);
  const m = new THREE.MeshStandardMaterial({ color: "#5a7a9a", roughness: 1 });
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + rnd() * 0.3, r = 215 + rnd() * 25, h = 14 + rnd() * 26, w = 30 + rnd() * 40; const c = new THREE.Mesh(new THREE.ConeGeometry(w, h, 7), m); c.position.set(Math.cos(a) * r, h / 2 - 2, Math.sin(a) * r); c.rotation.y = rnd(); c.scale.z = 0.5 + rnd() * 0.5; g.add(c); }
  return { g, m };
}
