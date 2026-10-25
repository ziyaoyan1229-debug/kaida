/* 番茄讀書會：我的家（three.js）
   空房間、地板分成方格；家具用小木頭買，擺在格子上，不能重疊。
   window.KaidaHome.mount(el)；.set({ owner, guest, items, edit })；.place(kind)；.rotate()；.store()；.select(i) */
import * as THREE from "./vendor/three.module.min.js";
import { makeChar, makePet, mat, box, cyl, sph, outline } from "./scene3d.js";

const T = 0.5, GW = 10, GD = 8; // 一格 0.5，房間 10 × 8 格
const W = GW * T, D = GD * T;
// 家具：w × d 是佔幾格（沒旋轉時），price 是小木頭
const FURN = {
  bed: { w: 2, d: 3, price: 16, zh: "單人床", en: "Bed", ic: "🛏️" },
  desk: { w: 2, d: 1, price: 10, zh: "書桌", en: "Desk", ic: "🗃️" },
  chair: { w: 1, d: 1, price: 4, zh: "椅子", en: "Chair", ic: "🪑" },
  shelf: { w: 2, d: 1, price: 12, zh: "書櫃", en: "Bookshelf", ic: "📚" },
  sofa: { w: 3, d: 1, price: 14, zh: "沙發", en: "Sofa", ic: "🛋️" },
  table: { w: 2, d: 2, price: 8, zh: "圓桌", en: "Round table", ic: "🍵" },
  lamp: { w: 1, d: 1, price: 5, zh: "立燈", en: "Floor lamp", ic: "💡" },
  plant: { w: 1, d: 1, price: 3, zh: "盆栽", en: "Plant", ic: "🪴" },
  rug: { w: 3, d: 2, price: 6, zh: "地毯", en: "Rug", ic: "🟫" },
  tv: { w: 2, d: 1, price: 12, zh: "電視櫃", en: "TV stand", ic: "📺" },
  wardrobe: { w: 2, d: 1, price: 12, zh: "衣櫃", en: "Wardrobe", ic: "🚪" },
  piano: { w: 2, d: 1, price: 18, zh: "鋼琴", en: "Piano", ic: "🎹" },
  petbed: { w: 1, d: 1, price: 4, zh: "寵物窩", en: "Pet bed", ic: "🧺" },
  beanbag: { w: 1, d: 1, price: 6, zh: "懶骨頭", en: "Beanbag", ic: "🟠" }
};

/* ===== 家具模型：原點在佔地中心、朝 +z ===== */
function build(kind) {
  const g = new THREE.Group(), f = FURN[kind], w = f.w * T, d = f.d * T;
  const wood = "#b98a5a", dark = "#8a6040";
  if (kind === "bed") {
    box(w - 0.08, 0.22, d - 0.06, wood, 0, 0.11, 0, g);
    box(w - 0.14, 0.12, d - 0.16, "#f8f4ec", 0, 0.28, 0.02, g);
    box(w - 0.14, 0.05, d * 0.62, "#7fa6c9", 0, 0.35, d * 0.17, g);
    const p = box(w * 0.5, 0.09, 0.26, "#fffaf2", 0, 0.38, -d / 2 + 0.24, g); p.scale.y = 1;
    box(w - 0.08, 0.5, 0.06, dark, 0, 0.25, -d / 2 + 0.03, g);
  } else if (kind === "desk") {
    box(w - 0.06, 0.05, d - 0.08, wood, 0, 0.5, 0, g);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.05, 0.5, 0.05, dark, a * (w / 2 - 0.08), 0.25, b * (d / 2 - 0.08), g));
    box(0.3, 0.02, 0.22, "#fffaf0", -0.15, 0.535, 0, g);
    cyl(0.04, 0.04, 0.08, "#c2453b", 0.3, 0.565, -0.05, g, 12);
  } else if (kind === "chair") {
    box(0.34, 0.04, 0.34, wood, 0, 0.3, 0, g);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.04, 0.3, 0.04, dark, a * 0.14, 0.15, b * 0.14, g));
    box(0.34, 0.34, 0.04, wood, 0, 0.49, -0.15, g);
  } else if (kind === "shelf") {
    // 開放式書櫃：背板、兩側、頂板，書看得到
    box(w - 0.06, 1.1, 0.04, dark, 0, 0.55, -d / 2 + 0.08, g);
    [-1, 1].forEach((sd) => box(0.04, 1.1, d - 0.12, dark, sd * (w / 2 - 0.05), 0.55, -0.02, g));
    box(w - 0.06, 0.04, d - 0.12, dark, 0, 1.1, -0.02, g);
    const cols = ["#c2453b", "#5d7fa8", "#6a8f5a", "#d9a03a", "#8a5a9a", "#e7a6a8"];
    [0.2, 0.55, 0.9].forEach((y, r) => {
      box(w - 0.12, 0.03, d - 0.16, wood, 0, y - 0.13, 0.01, g);
      for (let i = 0; i < 7; i++) { const h = 0.18 + ((i * 7 + r * 3) % 5) * 0.02; box(0.08, h, 0.24, cols[(i + r * 2) % cols.length], -w / 2 + 0.14 + i * 0.11, y - 0.115 + h / 2, 0.02, g); }
    });
  } else if (kind === "sofa") {
    box(w - 0.06, 0.24, d - 0.06, "#c8574a", 0, 0.12, 0, g);
    box(w - 0.06, 0.38, 0.12, "#b04a3e", 0, 0.31, -d / 2 + 0.09, g);
    [-1, 1].forEach((s) => box(0.12, 0.34, d - 0.06, "#b04a3e", s * (w / 2 - 0.09), 0.2, 0, g));
    [-1, 0, 1].forEach((s) => box(w / 3 - 0.1, 0.07, d - 0.2, "#d86a5c", s * (w / 3 - 0.06), 0.27, 0.04, g));
  } else if (kind === "table") {
    cyl(0.42, 0.42, 0.04, wood, 0, 0.42, 0, g, 28);
    cyl(0.04, 0.06, 0.4, dark, 0, 0.21, 0, g, 12);
    cyl(0.18, 0.2, 0.03, dark, 0, 0.015, 0, g, 18);
    cyl(0.05, 0.04, 0.07, "#f8f4ec", 0.1, 0.475, 0.05, g, 12); cyl(0.045, 0.045, 0.004, "#7a4a2a", 0.1, 0.51, 0.05, g, 12);
  } else if (kind === "lamp") {
    cyl(0.12, 0.14, 0.03, dark, 0, 0.015, 0, g, 16);
    cyl(0.015, 0.015, 1.0, "#3a3036", 0, 0.5, 0, g, 8);
    const sh = cyl(0.1, 0.17, 0.2, mat("#f2dfb0", { emissive: "#7a5a20", emissiveIntensity: 0.6 }), 0, 1.02, 0, g, 18); sh.castShadow = false;
    const l = new THREE.PointLight(0xffd59a, 0.6, 2.4, 2); l.position.set(0, 0.9, 0); g.add(l);
  } else if (kind === "plant") {
    cyl(0.12, 0.09, 0.2, "#c98f52", 0, 0.1, 0, g, 14);
    [[0, 0.36, 0, 0.14], [0.08, 0.3, 0.05, 0.1], [-0.07, 0.31, -0.04, 0.1], [0.02, 0.46, -0.02, 0.09]].forEach((p) => sph(p[3], "#6a9a52", p[0], p[1], p[2], g, 10, 8));
  } else if (kind === "rug") {
    const r = box(w - 0.1, 0.02, d - 0.1, "#d9a03a", 0, 0.01, 0, g); r.castShadow = false;
    const r2 = box(w - 0.3, 0.022, d - 0.3, "#e6c27a", 0, 0.012, 0, g); r2.castShadow = false;
  } else if (kind === "tv") {
    box(w - 0.06, 0.34, d - 0.12, dark, 0, 0.17, 0, g);
    box(w - 0.3, 0.42, 0.04, "#26232b", 0, 0.58, -0.04, g);
    box(w - 0.36, 0.36, 0.01, mat("#3a5a7a", { emissive: "#1a3048", emissiveIntensity: 0.5 }), 0, 0.58, -0.015, g);
  } else if (kind === "wardrobe") {
    box(w - 0.08, 1.3, d - 0.1, wood, 0, 0.65, 0, g);
    box(0.01, 1.2, 0.01, dark, 0, 0.66, d / 2 - 0.045, g);
    [-1, 1].forEach((s) => sph(0.025, "#e8b93a", s * 0.06, 0.7, d / 2 - 0.04, g, 8, 6));
  } else if (kind === "piano") {
    box(w - 0.06, 0.9, 0.3, "#26232b", 0, 0.45, -0.08, g);
    box(w - 0.06, 0.06, 0.18, "#26232b", 0, 0.58, 0.14, g);
    box(w - 0.12, 0.02, 0.12, "#fffaf2", 0, 0.62, 0.16, g);
    for (let i = 0; i < 9; i++) box(0.03, 0.02, 0.07, "#151515", -w / 2 + 0.14 + i * 0.09, 0.635, 0.14, g);
  } else if (kind === "petbed") {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.06, 8, 20), mat("#c98f52")); r.rotation.x = Math.PI / 2; r.position.y = 0.07; r.castShadow = true; g.add(r);
    cyl(0.16, 0.16, 0.05, "#f2c4c8", 0, 0.04, 0, g, 18);
  } else if (kind === "beanbag") {
    const b = sph(0.22, "#e0904a", 0, 0.16, 0, g, 16, 12); b.scale.set(1, 0.75, 1);
  }
  outline(g, 0.012);
  return g;
}

/* ===== 場景 ===== */
let renderer, scene, camera, container, raf = 0, mounted = false, clock;
let floor, gridLines, selBox, ghostOK = true;
let state = { owner: null, guest: null, items: [], edit: false };
let meshes = [], sel = -1, onChange = null, ownerSt = null, guestSt = null;
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitP = new THREE.Vector3();

function dims(it) { const f = FURN[it.k]; return it.r % 2 ? { w: f.d, d: f.w } : { w: f.w, d: f.d }; }
function cellsOf(it) { const s = dims(it), out = []; for (let x = 0; x < s.w; x++) for (let z = 0; z < s.d; z++) out.push((it.x + x) + "," + (it.z + z)); return out; }
function fits(it, skip) {
  const s = dims(it);
  if (it.x < 0 || it.z < 0 || it.x + s.w > GW || it.z + s.d > GD) return false;
  const used = {};
  state.items.forEach((o, i) => { if (i !== skip) cellsOf(o).forEach((c) => { used[c] = 1; }); });
  return !cellsOf(it).some((c) => used[c]);
}
function worldOf(it) { const s = dims(it); return { x: -W / 2 + (it.x + s.w / 2) * T, z: -D / 2 + (it.z + s.d / 2) * T }; }
function cellAt(clientX, clientY) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  if (!ray.ray.intersectPlane(plane, hitP)) return null;
  return { x: Math.floor((hitP.x + W / 2) / T), z: Math.floor((hitP.z + D / 2) / T) };
}
function freeCells() {
  const used = {}; state.items.forEach((o) => cellsOf(o).forEach((c) => { used[c] = 1; }));
  const out = []; for (let x = 0; x < GW; x++) for (let z = 0; z < GD; z++) if (!used[x + "," + z]) out.push({ x, z });
  return out;
}

function buildRoom() {
  // 地板：木紋色 + 方格線；牆：後面和左邊
  floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat("#c99a68")); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const pts = [];
  for (let i = 0; i <= GW; i++) { const x = -W / 2 + i * T; pts.push(x, 0.003, -D / 2, x, 0.003, D / 2); }
  for (let j = 0; j <= GD; j++) { const z = -D / 2 + j * T; pts.push(-W / 2, 0.003, z, W / 2, 0.003, z); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  gridLines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xfff6e6, transparent: true, opacity: 0.85 })); scene.add(gridLines);
  const wallM = mat("#efe3cf");
  const back = box(W + 0.12, 1.5, 0.1, wallM, 0, 0.75, -D / 2 - 0.05, scene); back.castShadow = false;
  const left = box(0.1, 1.5, D, wallM, -W / 2 - 0.05, 0.75, 0, scene); left.castShadow = false;
  box(W + 0.12, 0.1, 0.12, "#b98a5a", 0, 0.05, -D / 2 - 0.04, scene).castShadow = false;
  box(0.12, 0.1, D, "#b98a5a", -W / 2 - 0.04, 0.05, 0, scene).castShadow = false;
  // 窗戶
  const win = new THREE.Group(); win.position.set(0.6, 0.95, -D / 2 + 0.01); scene.add(win);
  box(0.9, 0.7, 0.03, "#fffaf2", 0, 0, 0, win); box(0.8, 0.6, 0.035, mat("#bfe0f2", { emissive: "#6a98b8", emissiveIntensity: 0.35 }), 0, 0, 0.002, win);
  box(0.03, 0.6, 0.04, "#fffaf2", 0, 0, 0.004, win); box(0.8, 0.03, 0.04, "#fffaf2", 0, 0, 0.004, win);
  // 選取框
  selBox = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x4caf6a, transparent: true, opacity: 0.35, depthWrite: false }));
  selBox.rotation.x = -Math.PI / 2; selBox.position.y = 0.035; selBox.renderOrder = 2; selBox.visible = false; scene.add(selBox);
}
function lighting() {
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x8a5a38, 1.1));
  const sun = new THREE.DirectionalLight(0xfff2d8, 1.5); sun.position.set(3, 7, 5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  const sc = sun.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sun.shadow.bias = -0.0015;
  scene.add(sun);
  scene.background = new THREE.Color("#f3ece1");
}
function resize() {
  if (!container) return;
  const w = container.clientWidth || 300, h = container.clientHeight || 300;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  // 從右前方斜斜往下看；拉到整個房間（含牆頂）都在畫面裡
  const dir = new THREE.Vector3(0.62, 0.86, 0.78).normalize(), aim = new THREE.Vector3(-0.1, 0.35, 0);
  const pts = []; [-W / 2, W / 2].forEach((x) => [-D / 2, D / 2].forEach((z) => [0, x < 0 || z < 0 ? 1.5 : 0].forEach((y) => pts.push(new THREE.Vector3(x, y, z)))));
  let far = 4;
  for (let i = 0; i < 60; i++) {
    camera.position.copy(aim).addScaledVector(dir, far); camera.lookAt(aim); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
    if (pts.every((p) => { const v = p.clone().project(camera); return Math.abs(v.x) < 0.94 && Math.abs(v.y) < 0.92; })) break;
    far += 0.25;
  }
}

function rebuildItems() {
  meshes.forEach((m) => scene.remove(m)); meshes = [];
  state.items.forEach((it, i) => {
    const g = build(it.k), p = worldOf(it);
    g.position.set(p.x, 0, p.z); g.rotation.y = -it.r * Math.PI / 2; g.userData.idx = i;
    scene.add(g); meshes.push(g);
  });
  placePeople(true);
  showSel();
}
function showSel() {
  const it = state.items[sel];
  selBox.visible = !!(state.edit && it);
  if (!it) return;
  const s = dims(it), p = worldOf(it);
  selBox.scale.set(s.w * T, s.d * T, 1); selBox.position.x = p.x; selBox.position.z = p.z;
  selBox.material.color.set(ghostOK ? 0x4caf6a : 0xd9534f);
}
function person(look) {
  const c = makeChar(look || {});
  c.root.rotation.order = "YXZ";
  scene.add(c.root);
  const pt = look && look.pet ? makePet(look.pet, look.ps, look.pm) : null;
  if (pt) { outline(pt, 0.012); scene.add(pt); }
  return { c, pet: pt, pos: new THREE.Vector3(), path: [], ry: 0, act: "", item: -1, spot: null, idle: 0, petBed: null };
}
function dropPerson(st) { if (!st) return; scene.remove(st.c.root); if (st.pet) scene.remove(st.pet); }
function cellPos(c) { return new THREE.Vector3(-W / 2 + (c.x + 0.5) * T, 0, -D / 2 + (c.z + 0.5) * T); }
function cellOfPos(p) { return { x: Math.max(0, Math.min(GW - 1, Math.floor((p.x + W / 2) / T))), z: Math.max(0, Math.min(GD - 1, Math.floor((p.z + D / 2) / T))) }; }
// 能走的格子：地毯可以踩，其他家具擋路
function blocked() { const u = {}; state.items.forEach((o) => { if (o.k !== "rug") cellsOf(o).forEach((c) => { u[c] = 1; }); }); return u; }
function findPath(from, to) {
  const bl = blocked(), key = (c) => c.x + "," + c.z, prev = {}, q = [from]; prev[key(from)] = null;
  while (q.length) {
    const c = q.shift(); if (c.x === to.x && c.z === to.z) break;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dz]) => {
      const n = { x: c.x + dx, z: c.z + dz }, k = key(n);
      if (n.x < 0 || n.z < 0 || n.x >= GW || n.z >= GD || bl[k] || k in prev) return;
      prev[k] = c; q.push(n);
    });
  }
  if (!(key(to) in prev)) return null;
  const out = []; for (let c = to; c; c = prev[key(c)]) out.unshift(c);
  return out;
}
function placePeople(keep) {
  const bl = blocked(), free = [];
  for (let x = 0; x < GW; x++) for (let z = 0; z < GD; z++) if (!bl[x + "," + z]) free.push({ x, z });
  [ownerSt, guestSt].forEach((st, k) => {
    if (!st) return;
    const cur = cellOfPos(st.pos);
    if (keep && !st.act && !bl[cur.x + "," + cur.z]) return;
    // 家具搬動了就停下手邊的事；主人站房間中間，客人站門口（右前方）
    st.act = ""; st.item = -1; st.spot = null; st.path = [];
    const want = keep ? cur : k ? { x: GW - 2, z: GD - 1 } : { x: Math.floor(GW / 2), z: Math.floor(GD / 2) };
    free.sort((a, b) => Math.hypot(a.x - want.x, a.z - want.z) - Math.hypot(b.x - want.x, b.z - want.z));
    const c = free.shift() || want; st.pos.copy(cellPos(c));
    if (st.pet && !keep) st.pet.position.set(st.pos.x + 0.3, 0, st.pos.z + 0.2);
  });
}
function setPeople() {
  dropPerson(ownerSt); dropPerson(guestSt); ownerSt = guestSt = null;
  if (state.owner) ownerSt = person(state.owner.look);
  if (state.guest) { guestSt = person(state.guest.look); guestSt.ry = Math.PI * 1.25; }
  placePeople(false);
}

/* ===== 點地板走過去、點家具做對應的事 ===== */
const SEAT_H = { sofa: 0.3, chair: 0.34, beanbag: 0.26, bed: 0.42 };
const ACT_OF = { sofa: "sit", chair: "sit", beanbag: "sit", bed: "sleep", shelf: "book", desk: "write", table: "mug", piano: "piano", tv: "watch", lamp: "lamp", plant: "water", wardrobe: "spin", petbed: "petbed", rug: "" };
function frontAngle(it) { return -it.r * Math.PI / 2; }
function goTo(st, cell, itemIdx) {
  const it = state.items[itemIdx];
  const from = cellOfPos(st.pos);
  let target = cell, onto = null;
  if (it) {
    // 走到家具旁邊空著的格子，前面優先
    const bl = blocked(), cs = cellsOf(it).map((k) => k.split(",").map(Number)), fa = frontAngle(it);
    const fx = Math.round(Math.sin(fa)), fz = Math.round(Math.cos(fa)), cand = [];
    cs.forEach(([x, z]) => [[fx, fz], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dz], j) => {
      const n = { x: x + dx, z: z + dz, pri: j ? 1 : 0 };
      if (n.x < 0 || n.z < 0 || n.x >= GW || n.z >= GD || bl[n.x + "," + n.z]) return; cand.push(n);
    }));
    let best = null, bestLen = 1e9;
    cand.forEach((n) => { const pth = findPath(from, n); if (pth && pth.length + n.pri * 3 < bestLen) { bestLen = pth.length + n.pri * 3; best = pth; } });
    if (it.k === "rug") best = findPath(from, cell);
    if (!best) return false;
    st.path = best.map(cellPos);
    const w = worldOf(it);
    if (SEAT_H[it.k] != null) onto = new THREE.Vector3(w.x, 0, w.z);
    st.spot = { onto, face: it.k === "bed" || SEAT_H[it.k] != null ? fa : Math.atan2(w.x - st.path[st.path.length - 1].x, w.z - st.path[st.path.length - 1].z), item: itemIdx, k: it.k };
  } else {
    const pth = findPath(from, target); if (!pth) return false;
    st.path = pth.map(cellPos); st.spot = null;
  }
  st.act = ""; st.item = -1; st.idle = 0;
  if (st.pet && st.petBed) st.petBed = null;
  return true;
}
function arrive(st) {
  const sp = st.spot; st.spot = null; if (!sp) return;
  if (sp.onto) st.pos.copy(sp.onto);
  st.ry = sp.k === "bed" ? sp.face : sp.face; st.act = ACT_OF[sp.k] || ""; st.item = sp.item; st.actAt = clock.elapsedTime;
  if (sp.k === "lamp") { const m = meshes[sp.item]; m && m.traverse((o) => { if (o.isPointLight) o.visible = !o.visible; }); }
  if (sp.k === "petbed" && st.pet) { const w = worldOf(state.items[sp.item]); st.petBed = new THREE.Vector3(w.x, 0.05, w.z); }
}
function animPerson(st, dt, s, wander) {
  if (!st) return;
  st.idle += dt;
  if (wander && !st.act && !st.path.length && st.idle > 9) {
    st.idle = 0;
    const cur = cellOfPos(st.pos), bl = blocked(), near = [];
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) { const n = { x: cur.x + dx, z: cur.z + dz }; if (n.x >= 0 && n.z >= 0 && n.x < GW && n.z < GD && !bl[n.x + "," + n.z]) near.push(n); }
    if (near.length) goTo(st, near[Math.floor(Math.random() * near.length)], -1);
  }
  let walking = false;
  if (st.path.length) {
    const to = st.path[0], dx = to.x - st.pos.x, dz = to.z - st.pos.z, dist = Math.hypot(dx, dz);
    if (dist < 0.02) { st.path.shift(); if (!st.path.length) arrive(st); }
    else { const step = Math.min(dist, dt * 1.6); st.pos.x += dx / dist * step; st.pos.z += dz / dist * step; st.ry = Math.atan2(dx, dz); walking = true; }
  }
  const c = st.c, act = walking ? "" : st.act, lie = act === "sleep";
  // 每一幀先站直，再擺姿勢
  c.hips.position.set(0, 0.36, 0); c.torso.rotation.set(0, 0, 0); c.head.rotation.set(0, 0, 0);
  c.legs.forEach((l) => l.rotation.set(0, 0, 0)); c.arms.forEach((a) => a.rotation.set(0, 0, 0));
  c.book.visible = act === "book"; c.cup.visible = act === "mug"; c.cookie.visible = false;
  let dr = st.ry - c.root.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); c.root.rotation.y += dr * Math.min(1, dt * 8);
  c.root.position.copy(st.pos); c.root.rotation.x = 0; c.root.children[0].visible = !lie;
  const k = s - (st.actAt || 0);
  if (walking) {
    const sw = Math.sin(s * 10) * 0.55;
    c.legs[0].rotation.x = sw; c.legs[1].rotation.x = -sw; c.arms[0].rotation.x = -sw * 0.8; c.arms[1].rotation.x = sw * 0.8;
    c.hips.position.y = 0.36 + Math.abs(Math.sin(s * 10)) * 0.03;
  } else if (act === "sit") {
    c.hips.position.y = SEAT_H[(state.items[st.item] || {}).k] || 0.32; c.legs.forEach((l) => { l.rotation.x = -1.45; });
    c.arms.forEach((a) => { a.rotation.x = -0.5; }); c.head.rotation.y = Math.sin(s * 0.4) * 0.35;
  } else if (lie) {
    // 躺在床上：頭朝床頭，眼睛閉起來
    c.root.rotation.x = -Math.PI / 2;
    const it = state.items[st.item], w = it ? worldOf(it) : st.pos, fa = it ? frontAngle(it) : 0, half = it ? dims(it) : { w: 2, d: 3 };
    const len = (it && it.r % 2 ? half.w : half.d) * T;
    c.root.position.set(w.x + Math.sin(fa) * (len / 2 - 0.12), 0.4, w.z + Math.cos(fa) * (len / 2 - 0.12));
    c.root.rotation.y = fa; c.torso.position.y = Math.sin(s * 1.2) * 0.008;
  } else if (act === "book") {
    c.arms.forEach((a, i) => { a.rotation.x = -1.25; a.rotation.z = (i ? -1 : 1) * 0.55; }); c.head.rotation.x = 0.38;
    const ph = (s % 3.2) / 0.7; c.book.userData.page.rotation.z = ph < 1 ? Math.PI * (1 - Math.cos(ph * Math.PI)) / 2 : 0;
  } else if (act === "write") {
    c.torso.rotation.x = 0.25; c.head.rotation.x = 0.4; c.arms[0].rotation.x = -1.0; c.arms[1].rotation.x = -1.05 + Math.sin(s * 7) * 0.08;
  } else if (act === "mug") {
    const cyc = s % 4, up = cyc < 1.2 ? Math.sin(cyc / 1.2 * Math.PI) : 0;
    c.arms[1].rotation.x = -0.75 - up * 1.55; c.arms[1].rotation.z = -0.15 - up * 0.45; c.head.rotation.x = -up * 0.25;
  } else if (act === "piano") {
    c.head.rotation.x = 0.22; c.head.rotation.z = Math.sin(s * 1.6) * 0.06;
    c.arms[0].rotation.x = -1.2 + Math.max(0, Math.sin(s * 6)) * 0.14; c.arms[1].rotation.x = -1.2 + Math.max(0, Math.sin(s * 6 + 2)) * 0.14;
    c.arms[0].rotation.z = 0.25 + Math.sin(s * 0.9) * 0.12; c.arms[1].rotation.z = -0.25 + Math.sin(s * 0.9) * 0.12;
  } else if (act === "watch") {
    c.head.rotation.z = Math.sin(s * 0.7) * 0.08; c.arms.forEach((a) => { a.rotation.x = -0.3; });
    if (Math.sin(s * 0.9) > 0.9) { c.arms[0].rotation.z = -2.2; c.arms[1].rotation.z = 2.2; }
  } else if (act === "lamp") {
    c.arms[1].rotation.x = k < 0.8 ? -1.6 * Math.sin(k / 0.8 * Math.PI) : 0;
  } else if (act === "water") {
    c.torso.rotation.x = 0.3; c.arms[1].rotation.x = -1.3; c.arms[1].rotation.z = -0.2 + Math.sin(s * 3) * 0.1; c.head.rotation.x = 0.35;
  } else if (act === "spin") {
    // 在衣櫃前轉一圈，像在照鏡子
    if (k < 1.2) c.root.rotation.y = st.ry + k / 1.2 * Math.PI * 2;
    c.arms[0].rotation.z = -0.4; c.arms[1].rotation.z = 0.4;
  } else if (act === "petbed") {
    c.hips.position.y = 0.26; c.torso.rotation.x = 0.5; c.head.rotation.x = 0.2; c.legs.forEach((l) => { l.rotation.x = -0.9; });
    c.arms[1].rotation.x = -1.2 + Math.sin(s * 3) * 0.25;
  } else {
    c.hips.position.y = 0.36 + Math.sin(s * 2) * 0.005;
  }
  const blink = lie ? 0.15 : (s % 4.1) < 0.12 ? 0.15 : 1.25; c.eyes.forEach((e) => { e.scale.y = blink; });
  if (st.pet) {
    const P = st.pet;
    let tx, tz, ty = 0, rot = c.root.rotation.y;
    if (st.petBed) { tx = st.petBed.x; tz = st.petBed.z; ty = st.petBed.y; }
    else { const off = new THREE.Vector3(0.32, 0, -0.1).applyAxisAngle(new THREE.Vector3(0, 1, 0), lie || act === "sit" ? st.ry + Math.PI : c.root.rotation.y); const base = lie || act === "sit" ? cellPos(cellOfPos(st.pos)) : st.pos; tx = base.x + off.x; tz = base.z + off.z; }
    // 寵物不要卡進家具裡：目標格被佔住就待在主人身邊的空格
    const pc = cellOfPos({ x: tx, z: tz }); if (!st.petBed && blocked()[pc.x + "," + pc.z]) { const p2 = st.path.length ? st.pos : cellPos(cellOfPos(st.pos)); tx = p2.x + 0.18; tz = p2.z + 0.18; }
    const mv = Math.hypot(tx - P.position.x, tz - P.position.z) > 0.05;
    P.position.x += (tx - P.position.x) * Math.min(1, dt * 3);
    P.position.z += (tz - P.position.z) * Math.min(1, dt * 3);
    P.position.y = ty + (mv ? Math.abs(Math.sin(s * 10)) * 0.03 : 0);
    if (mv) P.rotation.y = Math.atan2(tx - P.position.x, tz - P.position.z); else if (!st.petBed) P.rotation.y = rot;
    if (P.userData.tail) P.userData.tail.rotation.z = Math.sin(s * (st.petBed ? 1 : 6)) * (st.petBed ? 0.15 : 0.5);
  }
}
function frame() {
  raf = requestAnimationFrame(frame);
  if (!container || !container.isConnected || container.offsetParent === null) return;
  const dt = Math.min(0.05, clock.getDelta()), s = clock.elapsedTime;
  animPerson(ownerSt, dt, s, !state.edit && !!guestSt);
  animPerson(guestSt, dt, s, false);
  // 方格只在擺設、移動家具時出現
  gridLines.visible = state.edit;
  renderer.render(scene, camera);
}

/* ===== 操作：點家具選取，拖曳或點格子移動 ===== */
let drag = null, tapStart = null;
function pickItem(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(meshes, true)[0];
  if (!hit) return -1;
  let o = hit.object; while (o && o.userData.idx == null) o = o.parent;
  return o ? o.userData.idx : -1;
}
function emitSel() { window.dispatchEvent(new CustomEvent("kaida-home-sel", { detail: { i: sel, k: sel >= 0 ? state.items[sel].k : "" } })); }
function moveSelTo(cell, commit) {
  const it = state.items[sel]; if (!it || !cell) return false;
  const s = dims(it), cand = { k: it.k, r: it.r, x: cell.x - Math.floor((s.w - 1) / 2), z: cell.z - Math.floor((s.d - 1) / 2) };
  cand.x = Math.max(0, Math.min(GW - s.w, cand.x)); cand.z = Math.max(0, Math.min(GD - s.d, cand.z));
  const ok = fits(cand, sel);
  if (commit) {
    if (ok) { it.x = cand.x; it.z = cand.z; }
    ghostOK = true; rebuildItems(); if (ok && onChange) onChange(state.items);
    return ok;
  }
  // 拖曳中：家具跟著手指，格子框綠色可以放、紅色放不下
  ghostOK = ok;
  const p = worldOf(cand), m = meshes[sel]; m.position.x = p.x; m.position.z = p.z; m.position.y = 0.06;
  selBox.scale.set(s.w * T, s.d * T, 1); selBox.position.x = p.x; selBox.position.z = p.z; selBox.material.color.set(ok ? 0x4caf6a : 0xd9534f); selBox.visible = true;
  return ok;
}
function bindInput(el) {
  el.addEventListener("pointerdown", (e) => {
    tapStart = { x: e.clientX, y: e.clientY };
    if (!state.edit) return;
    const i = pickItem(e);
    drag = { x: e.clientX, y: e.clientY, i, moved: false, id: e.pointerId };
    if (i >= 0 && i === sel) { el.setPointerCapture && el.setPointerCapture(e.pointerId); }
  });
  el.addEventListener("pointermove", (e) => {
    if (!drag || !state.edit || drag.i < 0 || drag.i !== sel) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
    drag.moved = true; e.preventDefault();
    moveSelTo(cellAt(e.clientX, e.clientY), false);
  });
  el.addEventListener("pointerup", (e) => {
    if (!state.edit) {
      // 逛家模式：點地板走過去，點家具做對應的事（自己家動自己，去別人家動客人）
      const st = guestSt || ownerSt; if (!st || !tapStart || Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) > 10) return;
      const i = pickItem(e), cell = cellAt(e.clientX, e.clientY);
      if (i >= 0) goTo(st, cell, i); else if (cell && cell.x >= 0 && cell.z >= 0 && cell.x < GW && cell.z < GD) { if (!goTo(st, cell, -1)) { const bl = blocked(); if (bl[cell.x + "," + cell.z]) { const j = state.items.findIndex((o) => cellsOf(o).indexOf(cell.x + "," + cell.z) >= 0); if (j >= 0) goTo(st, cell, j); } } }
      return;
    }
    if (!drag) return;
    const d = drag; drag = null;
    if (d.moved) { const ok = moveSelTo(cellAt(e.clientX, e.clientY), true); if (!ok) window.dispatchEvent(new CustomEvent("kaida-home-blocked")); return; }
    // 點一下：點到家具就選它；已經選了家具再點空地，就搬過去
    if (d.i >= 0) { sel = d.i; showSel(); emitSel(); return; }
    if (sel >= 0) { const ok = moveSelTo(cellAt(e.clientX, e.clientY), true); if (!ok) window.dispatchEvent(new CustomEvent("kaida-home-blocked")); }
  });
  el.style.touchAction = "none";
}

function mount(el) {
  if (mounted) { if (el !== container) { el.appendChild(renderer.domElement); container = el; resize(); } return true; }
  try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" }); } catch (e) { return false; }
  container = el;
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = "home-canvas";
  el.appendChild(renderer.domElement);
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  buildRoom(); lighting(); clock = new THREE.Clock();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(el); else window.addEventListener("resize", resize);
  resize(); bindInput(renderer.domElement);
  mounted = true; frame();
  return true;
}
function set(o) {
  const lk = (x) => JSON.stringify(x && x.look || null);
  const peopleChanged = lk(o.owner) !== lk(state.owner) || lk(o.guest) !== lk(state.guest);
  state.owner = o.owner || null; state.guest = o.guest || null; state.edit = !!o.edit;
  state.items = (o.items || []).filter((it) => FURN[it.k]).map((it) => ({ k: it.k, x: it.x | 0, z: it.z | 0, r: (it.r | 0) % 4 }));
  if (!state.edit) sel = -1; else if (sel >= state.items.length) sel = -1;
  if (!mounted) return;
  if (peopleChanged) setPeople();
  rebuildItems(); emitSel();
}
// 新買的家具：先靠後牆（朝房間）、再靠左牆，最後才放中間，留出走道
function place(kind) {
  const f = FURN[kind]; if (!f) return false;
  const cand = [];
  [0, 3, 1, 2].forEach((r) => { for (let x = 0; x < GW; x++) for (let z = 0; z < GD; z++) {
    const c = { k: kind, x, z, r }, s = dims(c);
    const wall = z === 0 && r === 0 ? 0 : x === 0 && r === 3 ? 1 : kind === "rug" ? 2 : 3;
    const mid = Math.hypot(x + s.w / 2 - GW / 2, z + s.d / 2 - GD / 2);
    cand.push({ c, score: wall * 100 + (wall < 2 ? x + z : wall === 2 ? mid : -mid) });
  } });
  cand.sort((a, b) => a.score - b.score);
  const ok = cand.find((o) => fits(o.c, -1));
  if (!ok) return false;
  state.items.push(ok.c); sel = state.items.length - 1; rebuildItems(); emitSel(); if (onChange) onChange(state.items);
  return true;
}
function rotate() {
  const it = state.items[sel]; if (!it) return false;
  // 原地轉 90 度；轉了放不下就在附近找位置，都不行就不轉
  const s0 = dims(it), cx = it.x + s0.w / 2, cz = it.z + s0.d / 2, r = (it.r + 1) % 4;
  const s1 = it.r % 2 ? { w: FURN[it.k].w, d: FURN[it.k].d } : { w: FURN[it.k].d, d: FURN[it.k].w };
  const base = { k: it.k, r, x: Math.round(cx - s1.w / 2), z: Math.round(cz - s1.d / 2) };
  const tries = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
  for (const [ox, oz] of tries) { const c = { k: it.k, r, x: base.x + ox, z: base.z + oz }; if (fits(c, sel)) { Object.assign(it, c); rebuildItems(); if (onChange) onChange(state.items); return true; } }
  return false;
}
function store() {
  if (sel < 0) return "";
  const k = state.items[sel].k; state.items.splice(sel, 1); sel = -1; rebuildItems(); emitSel(); if (onChange) onChange(state.items); return k;
}
function select(i) { sel = i; showSel(); emitSel(); }

// 某件家具在畫面上的位置（測試和教學提示用）
function screenOf(kind) {
  const i = state.items.findIndex((it) => it.k === kind); if (i < 0) return null;
  const w = worldOf(state.items[i]), v = new THREE.Vector3(w.x, 0.3, w.z).project(camera), r = renderer.domElement.getBoundingClientRect();
  return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
}
function who() { const st = guestSt || ownerSt; return st ? { act: st.act, k: (state.items[st.item] || {}).k || "", walking: st.path.length, x: +st.pos.x.toFixed(2), z: +st.pos.z.toFixed(2) } : null; }
window.KaidaHome = { who, screenOf, mount, set, place, rotate, store, select, FURN, GW, GD, onChange: (cb) => { onChange = cb; } };
window.dispatchEvent(new Event("kaida-home-ready"));
