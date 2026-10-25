/* 番茄讀書會：我的家（three.js）
   空房間、地板分成方格；家具用小木頭買，擺在格子上，不能重疊。
   window.KaidaHome.mount(el)；.set({ owner, guest, items, edit })；.place(kind)；.rotate()；.store()；.select(i) */
import * as THREE from "./vendor/three.module.min.js";
import { makeChar, makePet, mat, box, cyl, sph, outline } from "./scene3d.js?v=20261025h"; // 版本號要跟 index.html 的 script 一樣，才會是同一份模組

const T = 0.5, GW = 10, GD = 8; // 一格 0.5，房間 10 × 8 格
const W = GW * T, D = GD * T;
const DOOR_X = 0, DOOR_CELLS = [{ x: 4, z: 0 }, { x: 5, z: 0 }]; // 二樓房門在後牆正中間（第 4、5 格前面）
// 家具：w × d 是佔幾格（沒旋轉時），price 是小木頭
// cat 是商店分類；wall 掛在牆上（不佔地板、不擋路）；out 只能擺在三樓露臺
const FURN = {
  rug: { w: 3, d: 2, price: 6, zh: "方地毯", en: "Rug", ic: "🟫", cat: "rug" },
  rugRound: { w: 2, d: 2, price: 6, zh: "圓地毯", en: "Round rug", ic: "⭕", cat: "rug" },
  runner: { w: 1, d: 4, price: 5, zh: "長條地毯", en: "Runner", ic: "➖", cat: "rug" },
  plant: { w: 1, d: 1, price: 3, zh: "小盆栽", en: "Plant", ic: "🪴", cat: "plant" },
  monstera: { w: 1, d: 1, price: 6, zh: "龜背芋", en: "Monstera", ic: "🌿", cat: "plant" },
  cactus: { w: 1, d: 1, price: 3, zh: "仙人掌", en: "Cactus", ic: "🌵", cat: "plant" },
  hanger: { w: 1, d: 1, price: 5, zh: "吊盆架", en: "Hanging plant", ic: "🌱", cat: "plant" },
  tree: { w: 1, d: 1, price: 9, zh: "室內小樹", en: "Indoor tree", ic: "🌳", cat: "plant" },
  tv: { w: 2, d: 1, price: 12, zh: "電視櫃", en: "TV stand", ic: "📺", cat: "elec" },
  fridge: { w: 1, d: 1, price: 14, zh: "冰箱", en: "Fridge", ic: "🧊", cat: "elec" },
  coffee: { w: 1, d: 1, price: 10, zh: "咖啡機", en: "Coffee maker", ic: "☕", cat: "elec" },
  fan: { w: 1, d: 1, price: 6, zh: "電風扇", en: "Fan", ic: "🌀", cat: "elec" },
  speaker: { w: 1, d: 1, price: 8, zh: "音響", en: "Speaker", ic: "🔊", cat: "elec" },
  piano: { w: 2, d: 1, price: 18, zh: "鋼琴", en: "Piano", ic: "🎹", cat: "elec" },
  painting: { w: 2, d: 1, price: 8, zh: "風景畫", en: "Painting", ic: "🖼️", cat: "gallery", wall: true },
  frame: { w: 1, d: 1, price: 4, zh: "相框", en: "Photo frame", ic: "🪞", cat: "gallery", wall: true },
  poster: { w: 1, d: 1, price: 4, zh: "海報", en: "Poster", ic: "📜", cat: "gallery", wall: true },
  clock: { w: 1, d: 1, price: 6, zh: "掛鐘", en: "Wall clock", ic: "🕰️", cat: "gallery", wall: true },
  desk: { w: 2, d: 1, price: 10, zh: "木書桌", en: "Desk", ic: "🗃️", cat: "desk" },
  deskWhite: { w: 2, d: 1, price: 10, zh: "白書桌", en: "White desk", ic: "🗂️", cat: "desk" },
  studyset: { w: 2, d: 2, price: 18, zh: "書桌椅組", en: "Study set", ic: "📖", cat: "desk", study: true },
  chair: { w: 1, d: 1, price: 4, zh: "木椅", en: "Chair", ic: "🪑", cat: "chair" },
  stool: { w: 1, d: 1, price: 3, zh: "圓凳", en: "Stool", ic: "🟤", cat: "chair" },
  armchair: { w: 1, d: 1, price: 10, zh: "單人沙發", en: "Armchair", ic: "💺", cat: "chair" },
  sofa: { w: 3, d: 1, price: 14, zh: "沙發", en: "Sofa", ic: "🛋️", cat: "chair" },
  beanbag: { w: 1, d: 1, price: 6, zh: "懶骨頭", en: "Beanbag", ic: "🟠", cat: "chair" },
  shelf: { w: 2, d: 1, price: 12, zh: "書櫃", en: "Bookshelf", ic: "📚", cat: "shelf" },
  shelfTall: { w: 1, d: 1, price: 8, zh: "窄高書櫃", en: "Tall shelf", ic: "📗", cat: "shelf" },
  shelfLow: { w: 2, d: 1, price: 8, zh: "矮書櫃", en: "Low shelf", ic: "📘", cat: "shelf" },
  lamp: { w: 1, d: 1, price: 5, zh: "落地燈", en: "Floor lamp", ic: "💡", cat: "lamp" },
  lampArc: { w: 1, d: 1, price: 8, zh: "弧形落地燈", en: "Arc lamp", ic: "🔦", cat: "lamp" },
  table: { w: 2, d: 2, price: 8, zh: "圓桌", en: "Round table", ic: "🍵", cat: "table" },
  coffeeTable: { w: 2, d: 1, price: 8, zh: "茶几", en: "Coffee table", ic: "🫖", cat: "table" },
  dining: { w: 2, d: 2, price: 12, zh: "餐桌", en: "Dining table", ic: "🍽️", cat: "table" },
  bed: { w: 2, d: 3, price: 16, zh: "單人床", en: "Bed", ic: "🛏️", cat: "bedroom" },
  bedDouble: { w: 3, d: 3, price: 24, zh: "雙人床", en: "Double bed", ic: "🛌", cat: "bedroom" },
  wardrobe: { w: 2, d: 1, price: 12, zh: "衣櫃", en: "Wardrobe", ic: "🚪", cat: "bedroom" },
  drawer: { w: 1, d: 1, price: 7, zh: "抽屜櫃", en: "Drawers", ic: "🗄️", cat: "bedroom" },
  curtain: { w: 2, d: 1, price: 6, zh: "窗簾", en: "Curtains", ic: "🪟", cat: "curtain", wall: true },
  curtainBlue: { w: 2, d: 1, price: 6, zh: "藍窗簾", en: "Blue curtains", ic: "🟦", cat: "curtain", wall: true },
  parasol: { w: 1, d: 1, price: 10, zh: "陽傘", en: "Parasol", ic: "⛱️", cat: "outdoor", out: true },
  lounger: { w: 1, d: 2, price: 10, zh: "躺椅", en: "Lounger", ic: "🏖️", cat: "outdoor", out: true },
  flowerbed: { w: 2, d: 1, price: 8, zh: "花圃", en: "Flower bed", ic: "🌷", cat: "outdoor", out: true },
  petbed: { w: 1, d: 1, price: 4, zh: "寵物窩", en: "Pet bed", ic: "🧺", cat: "pet" },
  catTree: { w: 1, d: 1, price: 10, zh: "貓跳台", en: "Cat tree", ic: "🐈", cat: "pet" },
  ball: { w: 1, d: 1, price: 2, zh: "玩具球", en: "Toy ball", ic: "⚽", cat: "pet" },
  xmasTree: { w: 1, d: 1, price: 12, zh: "聖誕樹", en: "Christmas tree", ic: "🎄", cat: "fest" },
  lights: { w: 2, d: 1, price: 5, zh: "燈串", en: "String lights", ic: "✨", cat: "fest", wall: true },
  pumpkin: { w: 1, d: 1, price: 4, zh: "南瓜燈", en: "Jack-o'-lantern", ic: "🎃", cat: "fest" },
  // 樓梯每層都有一座，不賣、不能收，可以搬
  stairs: { w: 2, d: 3, price: 0, zh: "上樓梯", en: "Stairs up", ic: "🪜", fixed: true },
  stairsDown: { w: 2, d: 3, price: 0, zh: "下樓梯口", en: "Stairs down", ic: "🕳️", fixed: true }
};
// 牆壁漆、地板：整層換，買一次就可以一直用；tex 是有花紋的（用畫的）
const PAINTS = {
  cream: { c: "#efe3cf", price: 0, zh: "奶油白", en: "Cream" }, rose: { c: "#f2e2e2", price: 0, zh: "淡玫瑰", en: "Rose" },
  mint: { c: "#d6eadb", price: 6, zh: "薄荷綠", en: "Mint" }, sky: { c: "#d7e6f2", price: 6, zh: "天空藍", en: "Sky blue" },
  lilac: { c: "#e4dcef", price: 6, zh: "薰衣草", en: "Lilac" }, sun: { c: "#f6e7b8", price: 6, zh: "暖陽黃", en: "Sunny" },
  sage: { c: "#c9d4bc", price: 6, zh: "灰綠", en: "Sage" }, panel: { c: "#c79a68", tex: "panel", price: 10, zh: "木牆板", en: "Wood panel" },
  brick: { c: "#c46a4f", tex: "brick", price: 10, zh: "紅磚牆", en: "Brick" }
};
const TILES = {
  oak: { c: "#c99a68", tex: "plank", price: 0, zh: "橡木地板", en: "Oak" }, maple: { c: "#d8b08a", tex: "plank", price: 0, zh: "楓木地板", en: "Maple" },
  stone: { c: "#cfc3b0", price: 0, zh: "石板", en: "Stone" }, walnut: { c: "#8a5e3c", tex: "plank", price: 8, zh: "胡桃木地板", en: "Walnut" },
  birch: { c: "#e6cfa6", tex: "plank", price: 8, zh: "白樺地板", en: "Birch" }, tile: { c: "#eeeae2", tex: "tile", price: 8, zh: "白磁磚", en: "White tile" },
  marble: { c: "#ece8e4", tex: "marble", price: 12, zh: "大理石", en: "Marble" }, tatami: { c: "#cdbf86", tex: "tatami", price: 10, zh: "榻榻米", en: "Tatami" },
  checker: { c: "#e9e2d6", tex: "checker", price: 10, zh: "黑白格", en: "Checker" }
};
const texCache = {};
function texOf(kind, base, rx, ry) {
  const key = kind + base + rx + ry; if (texCache[key]) return texCache[key];
  const cv = document.createElement("canvas"); cv.width = cv.height = 128; const g = cv.getContext("2d");
  g.fillStyle = base; g.fillRect(0, 0, 128, 128);
  const shade = (a) => `rgba(0,0,0,${a})`, lite = (a) => `rgba(255,255,255,${a})`;
  if (kind === "plank") { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? shade(0.05) : lite(0.04); g.fillRect(0, i * 32, 128, 32); g.fillStyle = shade(0.18); g.fillRect(0, i * 32, 128, 2); g.fillRect(((i * 53) % 128), i * 32, 2, 32); } }
  else if (kind === "tile") { g.fillStyle = shade(0.12); g.fillRect(0, 0, 128, 3); g.fillRect(0, 0, 3, 128); }
  else if (kind === "checker") { g.fillStyle = "#3a3633"; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64); }
  else if (kind === "marble") { g.strokeStyle = shade(0.12); g.lineWidth = 1.5; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(0, i * 30 + 6); g.bezierCurveTo(40, i * 30 + 30, 80, i * 30 - 10, 128, i * 30 + 14); g.stroke(); } g.fillStyle = shade(0.08); g.fillRect(0, 0, 128, 2); g.fillRect(0, 0, 2, 128); }
  else if (kind === "tatami") { g.fillStyle = "#3f6b3a"; g.fillRect(0, 0, 128, 6); g.fillRect(0, 64, 128, 6); for (let y = 8; y < 128; y += 4) { g.fillStyle = y % 8 ? shade(0.05) : lite(0.05); g.fillRect(0, y, 128, 2); } }
  else if (kind === "panel") { for (let i = 0; i < 4; i++) { g.fillStyle = shade(0.2); g.fillRect(i * 32, 0, 2, 128); g.fillStyle = i % 2 ? shade(0.05) : lite(0.04); g.fillRect(i * 32 + 2, 0, 30, 128); } }
  else if (kind === "brick") { g.fillStyle = "#e8dccb"; for (let r = 0; r < 4; r++) { g.fillRect(0, r * 32, 128, 3); for (let c = 0; c < 3; c++) g.fillRect(((r % 2) * 32 + c * 64) % 128, r * 32, 3, 32); } }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.colorSpace = THREE.SRGBColorSpace;
  return (texCache[key] = t);
}
const matCache = {};
function surfMat(spec, rx, ry) {
  if (!spec.tex) return mat(spec.c);
  const key = spec.tex + spec.c + rx + ry;
  return matCache[key] || (matCache[key] = new THREE.MeshStandardMaterial({ map: texOf(spec.tex, spec.c, rx, ry), roughness: 0.85 }));
}
const SEATS_K = ["chair", "stool", "armchair"], DESKS_K = ["desk", "deskWhite", "studyset"], BEDS_K = ["bed", "bedDouble"];
// 每層該有的樓梯：一樓只往上、二樓上下各一、頂樓只往下
// 二樓分成走廊（上下樓梯都在這）和房間（沒有樓梯，從房門進出）
function stairKinds(f, hall) { return f === 0 ? ["stairs"] : f === FLOORS.length - 1 ? ["stairsDown"] : hall ? ["stairs", "stairsDown"] : []; }
// 三層樓：一樓客廳、二樓房間、三樓露臺
const FLOORS = [
  { floor: "oak", wall: "cream", bg: "#d4ecf5", out: "garden" },
  { floor: "maple", wall: "rose", bg: "#f9dfcc", out: "sky" },
  { floor: "stone", wall: null, bg: "#bfe0f2" }
];

/* ===== 家具模型：原點在佔地中心、朝 +z ===== */
// 掛牆的東西畫在格子後緣（貼著牆）、離地 0.7～1.1
const onWall = (d) => -d / 2 + 0.03;
function artPlane(g, kind, seed, w, h, x, y, z) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), artTex(kind, seed || 1)); m.position.set(x, y, z); g.add(m); return m; }
// 畫廊：每一幅都用編號（seed）隨機畫出來，同一個編號永遠畫出同一幅
const ART_K = ["painting", "frame", "poster"];
function newSeed() { return 1 + Math.floor(Math.random() * 2147483646); }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const PALS = [["#f2c4c8", "#e07a5f", "#3d405b", "#81b29a", "#f2cc8f"], ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"], ["#cdb4db", "#ffc8dd", "#ffafcc", "#bde0fe", "#a2d2ff"], ["#606c38", "#283618", "#fefae0", "#dda15e", "#bc6c25"], ["#0b132b", "#1c2541", "#3a506b", "#5bc0be", "#f7d35a"], ["#f8f4ec", "#d62828", "#003049", "#fcbf49", "#2a2620"]];
const artCache = {};
function artTex(kind, seed) {
  const key = kind + seed; if (artCache[key]) return artCache[key];
  const R = rng(seed), pick = (a) => a[Math.floor(R() * a.length)], pal = pick(PALS);
  const W2 = kind === "painting" ? 256 : 160, H2 = kind === "painting" ? 160 : 210;
  const cv = document.createElement("canvas"); cv.width = W2; cv.height = H2; const g = cv.getContext("2d");
  const style = kind === "frame" ? pick(["portrait", "flower", "land"]) : kind === "poster" ? pick(["blocks", "circles", "type", "wave"]) : pick(["land", "sea", "night", "blocks", "circles", "flower"]);
  const fill = (c) => { g.fillStyle = c; };
  if (style === "land" || style === "sea" || style === "night") {
    const sky = g.createLinearGradient(0, 0, 0, H2); const night = style === "night";
    sky.addColorStop(0, night ? "#0b132b" : pick(["#9cd0e8", "#f9dfcc", "#cfe8f7", "#ffd6a5"])); sky.addColorStop(1, night ? "#3a506b" : "#fffaf2");
    g.fillStyle = sky; g.fillRect(0, 0, W2, H2);
    fill(night ? "#f7f1d0" : pick(["#f7d35a", "#ffffff", "#e07a5f"])); g.beginPath(); g.arc(W2 * (0.2 + R() * 0.6), H2 * (0.18 + R() * 0.2), 10 + R() * 16, 0, 7); g.fill();
    if (night) for (let i = 0; i < 30; i++) { fill("rgba(255,255,255," + (0.4 + R() * 0.6) + ")"); g.fillRect(R() * W2, R() * H2 * 0.6, 1.5, 1.5); }
    const layers = 2 + Math.floor(R() * 3);
    for (let l = 0; l < layers; l++) {
      fill(style === "sea" && l === layers - 1 ? pick(["#2a9d8f", "#3a7ca5", "#5bc0be"]) : pal[(l + 1) % pal.length]);
      const base = H2 * (0.5 + l * 0.15); g.beginPath(); g.moveTo(0, H2);
      for (let x = 0; x <= W2; x += 8) g.lineTo(x, base + Math.sin(x / (20 + R() * 4) + l * 2 + seed % 7) * (6 + R() * 10));
      g.lineTo(W2, H2); g.fill();
    }
  } else if (style === "blocks") {
    fill(pal[0]); g.fillRect(0, 0, W2, H2);
    for (let i = 0; i < 7; i++) { fill(pal[1 + Math.floor(R() * 4)]); g.fillRect(R() * W2 * 0.8, R() * H2 * 0.8, 20 + R() * W2 * 0.5, 14 + R() * H2 * 0.4); }
    fill("#2a2620"); for (let i = 0; i < 3; i++) { g.fillRect(R() * W2, 0, 4, H2); g.fillRect(0, R() * H2, W2, 4); }
  } else if (style === "circles") {
    fill(pal[0]); g.fillRect(0, 0, W2, H2);
    for (let i = 0; i < 9; i++) { fill(pal[1 + Math.floor(R() * 4)]); g.globalAlpha = 0.6 + R() * 0.4; g.beginPath(); g.arc(R() * W2, R() * H2, 8 + R() * 40, 0, 7); g.fill(); }
    g.globalAlpha = 1;
  } else if (style === "flower") {
    fill(pick(["#fffaf2", "#f2e2c8", "#d6eadb"])); g.fillRect(0, 0, W2, H2);
    fill("#c98f52"); g.fillRect(W2 / 2 - 18, H2 * 0.72, 36, H2 * 0.24);
    for (let i = 0; i < 5; i++) { const x = W2 / 2 + (R() - 0.5) * W2 * 0.5, y = H2 * (0.25 + R() * 0.35); g.strokeStyle = "#4f7a3a"; g.lineWidth = 2; g.beginPath(); g.moveTo(W2 / 2, H2 * 0.74); g.lineTo(x, y); g.stroke(); fill(pal[1 + Math.floor(R() * 4)]); for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(x + Math.cos(k) * 7, y + Math.sin(k) * 7, 6, 0, 7); g.fill(); } fill("#f7d35a"); g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
  } else if (style === "portrait") {
    fill(pal[0]); g.fillRect(0, 0, W2, H2);
    fill(pal[2]); g.beginPath(); g.ellipse(W2 / 2, H2 * 1.02, W2 * 0.42, H2 * 0.32, 0, 0, 7); g.fill();
    fill(pick(["#f4c9a0", "#e0a878", "#b9805a", "#8d5a3b"])); g.beginPath(); g.arc(W2 / 2, H2 * 0.45, W2 * 0.22, 0, 7); g.fill();
    fill(pick(["#2a2620", "#7a4a2a", "#d9a03a", "#c2453b"])); g.beginPath(); g.arc(W2 / 2, H2 * 0.38, W2 * 0.24, Math.PI, 0); g.fill();
    fill("#2a2620"); [-1, 1].forEach((sd) => { g.beginPath(); g.arc(W2 / 2 + sd * 12, H2 * 0.47, 3, 0, 7); g.fill(); });
    g.strokeStyle = "#2a2620"; g.lineWidth = 2; g.beginPath(); g.arc(W2 / 2, H2 * 0.52, 8, 0.2, Math.PI - 0.2); g.stroke();
  } else if (style === "wave") {
    for (let i = 0; i < 6; i++) { fill(pal[i % 5]); g.beginPath(); g.moveTo(0, H2); for (let x = 0; x <= W2; x += 6) g.lineTo(x, H2 * (i / 6) + Math.sin(x / 18 + i + R()) * 10); g.lineTo(W2, H2); g.fill(); }
  } else {
    fill(pal[0]); g.fillRect(0, 0, W2, H2); fill(pal[3]); g.fillRect(12, 12, W2 - 24, H2 * 0.5);
    fill(pal[1]); g.beginPath(); g.arc(W2 / 2, H2 * 0.36, 26 + R() * 14, 0, 7); g.fill();
    fill(pal[4] === pal[0] ? "#2a2620" : pal[4]); g.font = "bold 26px sans-serif"; g.textAlign = "center"; g.fillText(pick(["FOCUS", "READ", "DREAM", "CALM", "專注", "讀書", "加油"]), W2 / 2, H2 * 0.82);
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return (artCache[key] = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, emissive: "#ffffff", emissiveMap: t, emissiveIntensity: 0.15 }));
}
const glow = (c, e, k) => mat(c, { emissive: e, emissiveIntensity: k || 0.6 });
const BUILD = {
  rugRound: (g, w) => { const a = cyl(w / 2 - 0.06, w / 2 - 0.06, 0.02, "#7fa6c9", 0, 0.01, 0, g, 32); a.castShadow = false; const b = cyl(w / 2 - 0.2, w / 2 - 0.2, 0.022, "#a9c6df", 0, 0.012, 0, g, 32); b.castShadow = false; },
  runner: (g, w, d) => { box(w - 0.1, 0.02, d - 0.1, "#b04a3e", 0, 0.01, 0, g).castShadow = false; box(w - 0.24, 0.022, d - 0.24, "#d9a03a", 0, 0.012, 0, g).castShadow = false; },
  monstera: (g) => { cyl(0.13, 0.1, 0.22, "#f2ece2", 0, 0.11, 0, g, 14); [[0, 0.62, 0.0, 0], [0.12, 0.5, 0.06, 0.9], [-0.12, 0.52, -0.04, -0.9], [0.05, 0.45, -0.13, 2.4], [-0.06, 0.42, 0.13, -2.2]].forEach(([x, y, z, a]) => { cyl(0.008, 0.008, y - 0.2, "#4f7a3a", x * 0.4, 0.2 + (y - 0.2) / 2, z * 0.4, g, 5); const l = sph(0.13, "#3f7a3f", x, y, z, g, 10, 6); l.scale.set(1, 0.2, 0.75); l.rotation.y = a; }); },
  cactus: (g) => { cyl(0.11, 0.09, 0.16, "#c98f52", 0, 0.08, 0, g, 14); cyl(0.07, 0.07, 0.36, "#5f9a50", 0, 0.34, 0, g, 12); sph(0.07, "#5f9a50", 0, 0.52, 0, g, 12, 8); cyl(0.04, 0.04, 0.14, "#5f9a50", 0.1, 0.36, 0, g, 10); sph(0.04, "#f2a7b8", 0, 0.6, 0, g, 8, 6); },
  hanger: (g, w, d, wood, dark) => { cyl(0.012, 0.012, 1.05, dark, 0, 0.52, -0.1, g, 6); box(0.24, 0.02, 0.02, dark, 0.1, 1.04, -0.1, g); cyl(0.003, 0.003, 0.25, "#3a3036", 0.2, 0.9, -0.1, g, 4); cyl(0.09, 0.07, 0.1, "#f2ece2", 0.2, 0.74, -0.1, g, 12); [[-0.06, 0.66], [0.06, 0.62], [0, 0.58]].forEach(([x, y]) => sph(0.06, "#6a9a52", 0.2 + x, y, -0.1, g, 8, 6)); cyl(0.12, 0.14, 0.03, dark, 0, 0.015, -0.1, g, 14); },
  tree: (g) => { cyl(0.14, 0.11, 0.26, "#8a6040", 0, 0.13, 0, g, 14); cyl(0.025, 0.03, 0.6, "#7a5a3a", 0, 0.55, 0, g, 8); [[0, 1.0, 0, 0.2], [0.12, 0.88, 0.05, 0.15], [-0.12, 0.9, -0.03, 0.15], [0.02, 1.15, 0.02, 0.13]].forEach((p) => sph(p[3], "#4f8a45", p[0], p[1], p[2], g, 10, 8)); },
  fridge: (g) => { box(0.4, 1.15, 0.38, "#eef2f3", 0, 0.575, 0, g); box(0.4, 0.01, 0.01, "#b8c2c6", 0, 0.78, 0.19, g); [0.95, 0.55].forEach((y) => box(0.02, 0.16, 0.02, "#9aa6ab", 0.15, y, 0.2, g)); box(0.08, 0.06, 0.005, "#f2a7b8", -0.08, 0.9, 0.193, g); },
  coffee: (g, w, d, wood, dark) => { box(0.42, 0.5, 0.38, wood, 0, 0.25, 0, g); box(0.2, 0.26, 0.2, "#3a3036", 0, 0.63, -0.04, g); box(0.16, 0.04, 0.06, "#26232b", 0, 0.71, 0.08, g); cyl(0.035, 0.03, 0.06, "#f8f4ec", 0, 0.53, 0.07, g, 10); sph(0.012, glow("#ff6a5a", "#ff3a2a", 1), 0.06, 0.66, 0.065, g, 6, 4); },
  fan: (g) => { cyl(0.13, 0.15, 0.03, "#eef2f3", 0, 0.015, 0, g, 16); cyl(0.015, 0.015, 0.7, "#cfd6d9", 0, 0.37, 0, g, 6); const h = new THREE.Group(); h.position.set(0, 0.76, 0.02); g.add(h); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.01, 6, 24), mat("#cfd6d9")); h.add(ring); sph(0.04, "#9cd0e8", 0, 0, 0, h, 8, 6); [0, 2.1, 4.2].forEach((a) => { const b = box(0.06, 0.14, 0.01, "#9cd0e8", Math.sin(a) * 0.08, Math.cos(a) * 0.08, 0.01, h); b.rotation.z = -a; }); },
  speaker: (g) => { box(0.3, 0.62, 0.28, "#3a3036", 0, 0.31, 0, g); [0.44, 0.2].forEach((y, i) => cyl(i ? 0.1 : 0.06, i ? 0.1 : 0.06, 0.02, "#151515", 0, y, 0.14, g, 18).rotation.x = Math.PI / 2); },
  // 畫面貼在一片薄板的正面；框的顏色也跟著編號變
  painting: (g, w, d, wood, dark, seed) => { const z = onWall(d), R = rng(seed + 7); box(w - 0.2, 0.52, 0.03, ["#8a5a38", "#e8b93a", "#2a2620", "#f8f4ec"][Math.floor(R() * 4)], 0, 0.95, z, g); artPlane(g, "painting", seed, w - 0.3, 0.42, 0, 0.95, z + 0.017); },
  frame: (g, w, d, wood, dark, seed) => { const z = onWall(d), R = rng(seed + 7); box(0.3, 0.38, 0.03, ["#e8b93a", "#8a5a38", "#f8f4ec", "#c2453b"][Math.floor(R() * 4)], 0, 0.9, z, g); artPlane(g, "frame", seed, 0.22, 0.29, 0, 0.9, z + 0.017); },
  poster: (g, w, d, wood, dark, seed) => { const z = onWall(d); box(0.34, 0.46, 0.012, "#f8f4ec", 0, 0.92, z, g); artPlane(g, "poster", seed, 0.3, 0.42, 0, 0.92, z + 0.008); },
  clock: (g, w, d) => { const z = onWall(d); const c = cyl(0.16, 0.16, 0.04, "#8a5a38", 0, 1.05, z + 0.01, g, 24); c.rotation.x = Math.PI / 2; const f = cyl(0.135, 0.135, 0.045, "#fffaf2", 0, 1.05, z + 0.012, g, 24); f.rotation.x = Math.PI / 2; box(0.012, 0.1, 0.05, "#26232b", 0, 1.09, z + 0.01, g); box(0.07, 0.012, 0.05, "#26232b", 0.035, 1.05, z + 0.01, g); },
  // 書桌椅組：後半格是書桌（有檯燈和書），前半格是椅子，坐上去面向書桌
  studyset: (g, w, d, wood, dark) => {
    box(w - 0.06, 0.05, 0.42, wood, 0, 0.5, -0.27, g);
    [-1, 1].forEach((a) => box(0.05, 0.5, 0.36, dark, a * (w / 2 - 0.08), 0.25, -0.27, g));
    box(w - 0.2, 0.3, 0.03, dark, 0, 0.25, -0.46, g);
    box(0.32, 0.02, 0.22, "#fffaf0", -0.05, 0.535, -0.22, g); box(0.06, 0.012, 0.012, "#c2453b", 0.06, 0.55, -0.2, g).rotation.y = 0.5;
    [["#5d7fa8", 0], ["#c2453b", 0.05], ["#6a8f5a", 0.1]].forEach(([c, x]) => box(0.04, 0.18, 0.14, c, -w / 2 + 0.16 + x, 0.615, -0.36, g));
    cyl(0.06, 0.07, 0.02, "#3a3036", w / 2 - 0.2, 0.535, -0.36, g, 12); cyl(0.01, 0.01, 0.22, "#3a3036", w / 2 - 0.2, 0.64, -0.36, g, 6);
    const sh = cyl(0.04, 0.08, 0.08, glow("#f7d35a", "#8a6a20"), w / 2 - 0.2, 0.76, -0.32, g, 12); sh.castShadow = false;
    const l = new THREE.PointLight(0xffd59a, 0.4, 1.6, 2); l.position.set(w / 2 - 0.2, 0.7, -0.25); g.add(l);
    box(0.36, 0.04, 0.34, "#c8574a", 0, 0.3, 0.27, g);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.04, 0.3, 0.04, dark, a * 0.15, 0.15, 0.27 + b * 0.14, g));
    box(0.36, 0.34, 0.04, "#c8574a", 0, 0.49, 0.43, g);
  },
  deskWhite: (g, w, d) => { box(w - 0.06, 0.05, d - 0.08, "#f2efe8", 0, 0.5, 0, g); [-1, 1].forEach((a) => box(0.05, 0.5, d - 0.14, "#d9d3c8", a * (w / 2 - 0.08), 0.25, 0, g)); box(0.3, 0.02, 0.22, "#fffaf0", -0.15, 0.535, 0, g); cyl(0.05, 0.06, 0.02, "#7fa6c9", 0.3, 0.535, -0.05, g, 12); },
  stool: (g, w, d, wood, dark) => { cyl(0.16, 0.16, 0.05, wood, 0, 0.32, 0, g, 18); [0, 2.1, 4.2].forEach((a) => { const l = cyl(0.018, 0.022, 0.32, dark, Math.sin(a) * 0.1, 0.15, Math.cos(a) * 0.1, g, 6); l.rotation.z = Math.sin(a) * 0.12; l.rotation.x = -Math.cos(a) * 0.12; }); },
  armchair: (g) => { box(0.44, 0.22, 0.42, "#6a8f5a", 0, 0.11, 0, g); box(0.44, 0.34, 0.1, "#5a7a4a", 0, 0.36, -0.17, g); [-1, 1].forEach((s) => box(0.08, 0.3, 0.42, "#5a7a4a", s * 0.19, 0.18, 0, g)); box(0.3, 0.06, 0.3, "#7aa060", 0, 0.25, 0.03, g); },
  shelfTall: (g, w, d, wood, dark) => { box(0.42, 1.4, 0.04, dark, 0, 0.7, -d / 2 + 0.08, g); [-1, 1].forEach((sd) => box(0.04, 1.4, 0.32, dark, sd * 0.2, 0.7, -0.02, g)); const cols = ["#c2453b", "#5d7fa8", "#6a8f5a", "#d9a03a", "#8a5a9a"]; [0.2, 0.55, 0.9, 1.25].forEach((y, r) => { box(0.38, 0.03, 0.3, wood, 0, y - 0.13, 0.0, g); for (let i = 0; i < 4; i++) { const h = 0.18 + ((i * 3 + r) % 3) * 0.02; box(0.07, h, 0.22, cols[(i + r) % 5], -0.13 + i * 0.085, y - 0.115 + h / 2, 0.0, g); } }); box(0.42, 0.04, 0.32, dark, 0, 1.4, -0.02, g); },
  shelfLow: (g, w, d, wood, dark) => { box(w - 0.06, 0.5, d - 0.12, wood, 0, 0.25, 0, g); box(w - 0.12, 0.42, 0.02, dark, 0, 0.25, d / 2 - 0.07, g).visible = false; const cols = ["#c2453b", "#5d7fa8", "#6a8f5a", "#d9a03a", "#8a5a9a", "#e7a6a8"]; for (let i = 0; i < 8; i++) { const h = 0.16 + (i % 3) * 0.02; box(0.08, h, 0.2, cols[i % 6], -w / 2 + 0.15 + i * 0.1, 0.5 + h / 2, -0.02, g); } sph(0.06, "#6a9a52", w / 2 - 0.12, 0.56, 0, g, 8, 6); },
  lampArc: (g, w, d, wood, dark) => { cyl(0.13, 0.15, 0.04, "#26232b", -0.12, 0.02, -0.1, g, 16); const arc = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.012, 6, 20, Math.PI * 0.7), mat("#cfd6d9")); arc.position.set(0.18, 0.75, -0.1); arc.rotation.z = Math.PI * 0.3; g.add(arc); cyl(0.012, 0.012, 0.75, "#cfd6d9", -0.12, 0.4, -0.1, g, 6); const sh = sph(0.11, glow("#fff1d0", "#8a6a30"), 0.22, 1.02, -0.1, g, 14, 8); sh.scale.y = 0.6; sh.castShadow = false; const l = new THREE.PointLight(0xffd59a, 0.6, 2.4, 2); l.position.set(0.22, 0.9, -0.1); g.add(l); },
  coffeeTable: (g, w, d, wood, dark) => { box(w - 0.12, 0.04, d - 0.14, wood, 0, 0.3, 0, g); box(w - 0.2, 0.03, d - 0.2, dark, 0, 0.12, 0, g); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.04, 0.3, 0.04, dark, a * (w / 2 - 0.1), 0.15, b * (d / 2 - 0.1), g)); cyl(0.06, 0.05, 0.08, "#f8f4ec", 0.2, 0.36, 0, g, 12); box(0.18, 0.03, 0.12, "#c2453b", -0.2, 0.335, 0, g); },
  dining: (g, w, d, wood, dark) => { box(w - 0.1, 0.05, d - 0.3, wood, 0, 0.55, 0, g); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.05, 0.55, 0.05, dark, a * (w / 2 - 0.12), 0.275, b * (d / 2 - 0.22), g)); [-1, 1].forEach((b) => { box(0.3, 0.04, 0.3, wood, 0, 0.3, b * (d / 2 - 0.12), g); box(0.3, 0.3, 0.04, wood, 0, 0.47, b * (d / 2 - 0.02), g); }); cyl(0.12, 0.1, 0.03, "#fffaf2", 0, 0.59, 0, g, 18); sph(0.05, "#e07a5f", 0, 0.62, 0, g, 8, 6); },
  bedDouble: (g, w, d, wood, dark) => { box(w - 0.08, 0.22, d - 0.06, wood, 0, 0.11, 0, g); box(w - 0.14, 0.12, d - 0.16, "#f8f4ec", 0, 0.28, 0.02, g); box(w - 0.14, 0.05, d * 0.62, "#e7a6a8", 0, 0.35, d * 0.17, g); [-1, 1].forEach((s) => box(w * 0.36, 0.09, 0.26, "#fffaf2", s * w * 0.22, 0.38, -d / 2 + 0.24, g)); box(w - 0.08, 0.6, 0.06, dark, 0, 0.3, -d / 2 + 0.03, g); },
  drawer: (g, w, d, wood, dark) => { box(0.42, 0.7, 0.38, wood, 0, 0.35, 0, g); [0.15, 0.36, 0.57].forEach((y) => { box(0.36, 0.17, 0.01, "#c79a68", 0, y, 0.19, g); sph(0.018, "#e8b93a", 0, y, 0.2, g, 6, 4); }); cyl(0.05, 0.04, 0.1, "#f2a7b8", 0.1, 0.75, 0, g, 10); },
  curtain: (g, w, d) => { const z = onWall(d) + 0.04; box(w - 0.1, 0.02, 0.02, "#8a5a38", 0, 1.3, z, g); [-1, 1].forEach((s) => { const c = box(0.3, 1.0, 0.04, "#f2c4c8", s * (w / 2 - 0.22), 0.8, z, g); c.castShadow = false; }); },
  curtainBlue: (g, w, d) => { const z = onWall(d) + 0.04; box(w - 0.1, 0.02, 0.02, "#8a5a38", 0, 1.3, z, g); [-1, 1].forEach((s) => { const c = box(0.3, 1.0, 0.04, "#7fa6c9", s * (w / 2 - 0.22), 0.8, z, g); c.castShadow = false; }); },
  parasol: (g) => { cyl(0.12, 0.14, 0.05, "#cfd6d9", 0, 0.025, 0, g, 14); cyl(0.015, 0.015, 1.1, "#f8f4ec", 0, 0.6, 0, g, 6); const top = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.22, 8), mat("#e07a5f")); top.position.y = 1.15; top.castShadow = true; g.add(top); },
  lounger: (g, w, d) => { box(0.38, 0.06, d - 0.2, "#f8f4ec", 0, 0.2, 0.08, g); const back = box(0.38, 0.06, 0.4, "#f8f4ec", 0, 0.33, -d / 2 + 0.2, g); back.rotation.x = 0.7; [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([a, b]) => box(0.03, 0.18, 0.03, "#cfd6d9", a * 0.16, 0.09, b * (d / 2 - 0.15), g)); box(0.36, 0.02, d - 0.3, "#7fa6c9", 0, 0.24, 0.1, g); },
  flowerbed: (g, w, d, wood) => { box(w - 0.08, 0.2, d - 0.1, wood, 0, 0.1, 0, g); box(w - 0.16, 0.02, d - 0.18, "#6a4a30", 0, 0.2, 0, g); const fc = ["#f2a7b8", "#f7d35a", "#c9a0e8", "#ffffff", "#e07a5f"]; for (let i = 0; i < 8; i++) { const x = -w / 2 + 0.15 + i * (w - 0.3) / 7; cyl(0.006, 0.006, 0.14, "#4f7a3a", x, 0.27, (i % 2 ? 0.06 : -0.06), g, 4); sph(0.04, fc[i % 5], x, 0.35, (i % 2 ? 0.06 : -0.06), g, 8, 6); } },
  catTree: (g, w, d, wood) => { box(0.42, 0.04, 0.42, "#e6d6bf", 0, 0.02, 0, g); cyl(0.05, 0.05, 1.0, "#d9c3a0", 0, 0.5, 0, g, 10); [[0.4, 0.1, 0.06], [0.75, -0.08, -0.05], [1.0, 0.0, 0.0]].forEach(([y, x, z]) => box(0.3, 0.04, 0.3, "#b98a5a", x, y, z, g)); sph(0.06, "#f2a7b8", 0.12, 0.3, 0.1, g, 8, 6); },
  ball: (g) => { sph(0.09, "#e07a5f", 0, 0.09, 0, g, 12, 10); const b = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 6, 16), mat("#fffaf2")); b.position.y = 0.09; g.add(b); },
  xmasTree: (g) => { cyl(0.1, 0.12, 0.16, "#b04a3e", 0, 0.08, 0, g, 12); [[0.36, 0.3, 0.34], [0.64, 0.24, 0.3], [0.88, 0.17, 0.26]].forEach(([y, r, h]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10), mat("#3f7a3f")); c.position.y = y; c.castShadow = true; g.add(c); }); sph(0.04, glow("#f7d35a", "#c09020", 1), 0, 1.04, 0, g, 8, 6); ["#e07a5f", "#7fa6c9", "#f7d35a", "#ffffff", "#c9a0e8"].forEach((c, i) => sph(0.022, glow(c, c, 0.5), Math.sin(i * 2.4) * (0.24 - i * 0.03), 0.3 + i * 0.12, Math.cos(i * 2.4) * (0.24 - i * 0.03), g, 6, 4)); const l = new THREE.PointLight(0xffd59a, 0.4, 2, 2); l.position.set(0, 0.7, 0.2); g.add(l); },
  lights: (g, w, d) => { const z = onWall(d) + 0.02; const n = 9; for (let i = 0; i < n; i++) { const x = -w / 2 + 0.1 + i * (w - 0.2) / (n - 1), y = 1.25 - Math.sin(i / (n - 1) * Math.PI) * 0.12; sph(0.025, glow(["#f7d35a", "#f2a7b8", "#9cd0e8"][i % 3], ["#f7d35a", "#f2a7b8", "#9cd0e8"][i % 3], 1), x, y, z, g, 6, 4).castShadow = false; } },
  pumpkin: (g) => { const p = sph(0.17, "#e8862a", 0, 0.15, 0, g, 14, 10); p.scale.y = 0.8; cyl(0.02, 0.025, 0.07, "#4f7a3a", 0, 0.3, 0, g, 6); [-0.06, 0.06].forEach((x) => box(0.04, 0.04, 0.02, glow("#ffd27a", "#ffa020", 1), x, 0.18, 0.165, g)); box(0.1, 0.025, 0.02, glow("#ffd27a", "#ffa020", 1), 0, 0.1, 0.165, g); const l = new THREE.PointLight(0xffa040, 0.3, 1.4, 2); l.position.set(0, 0.2, 0.25); g.add(l); }
};
function build(kind, seed) {
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
  } else if (kind === "stairsDown") {
    // 頂樓：地上一個往下的樓梯口，三面有欄杆
    const hole = box(w - 0.06, 0.01, d - 0.06, "#5a4030", 0, 0.005, 0, g); hole.castShadow = false;
    for (let i = 0; i < 5; i++) box(w - 0.2, 0.012, 0.06, "#8a6040", 0, 0.008, -d / 2 + 0.2 + i * (d - 0.4) / 4, g).castShadow = false;
    [-1, 1].forEach((sd) => { box(0.04, 0.04, d - 0.06, wood, sd * (w / 2 - 0.03), 0.55, 0, g); for (let i = 0; i < 4; i++) box(0.03, 0.55, 0.03, dark, sd * (w / 2 - 0.03), 0.275, -d / 2 + 0.06 + i * (d - 0.12) / 3, g); });
    box(w - 0.06, 0.04, 0.04, wood, 0, 0.55, -d / 2 + 0.03, g);
  } else if (kind === "stairs") {
    // 往後牆爬上去的木樓梯，前面是第一階
    const n = 7, sd = (d - 0.1) / n, sh = 1.4 / n;
    for (let i = 0; i < n; i++) box(w - 0.16, sh * (i + 1), sd, i % 2 ? wood : "#c79a68", 0, sh * (i + 1) / 2, d / 2 - 0.05 - sd * (i + 0.5), g);
    box(0.04, 1.6, 0.04, dark, w / 2 - 0.05, 0.8, -d / 2 + 0.05, g);
    const rail = box(0.04, 0.04, Math.hypot(d, 1.4), wood, w / 2 - 0.05, 0.4 + 0.7 + 0.15, 0, g); rail.rotation.x = Math.atan2(1.4, d);
    for (let i = 0; i < 4; i++) { const z = d / 2 - 0.15 - i * (d - 0.3) / 3, y = 1.4 * (d / 2 - z) / d; box(0.03, 0.55, 0.03, dark, w / 2 - 0.05, y + 0.275, z, g); }
  } else if (kind === "beanbag") {
    const b = sph(0.22, "#e0904a", 0, 0.16, 0, g, 16, 12); b.scale.set(1, 0.75, 1);
  } else if (BUILD[kind]) BUILD[kind](g, w, d, wood, dark, seed | 0);
  outline(g, 0.012);
  return g;
}

/* ===== 場景 ===== */
let renderer, scene, camera, container, raf = 0, mounted = false, clock;
let floor, gridLines, selBox, ghostOK = true;
let state = { owner: null, guest: null, items: [], edit: false, floor: 0, locked: false, hall: false, paint: "", tile: "" }, roomG = null, doorG = null, backG = null, leftG = null, clouds = [];
let meshes = [], sel = -1, onChange = null, ownerSt = null, guestSt = null;
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitP = new THREE.Vector3();

function dims(it) { const f = FURN[it.k]; return it.r % 2 ? { w: f.d, d: f.w } : { w: f.w, d: f.d }; }
function cellsOf(it) { const s = dims(it), out = []; for (let x = 0; x < s.w; x++) for (let z = 0; z < s.d; z++) out.push((it.x + x) + "," + (it.z + z)); return out; }
const isWall = (k) => !!(FURN[k] && FURN[k].wall), RUGS_K = ["rug", "rugRound", "runner"];
// 牆上不能掛的格子：門的位置
function doorCells() { return state.floor === 0 ? ["0,6,3", "0,7,3"] : state.floor === 1 ? ["4,0,0", "5,0,0"] : []; }
function fits(it, skip) {
  const s = dims(it), f = FURN[it.k];
  if (it.x < 0 || it.z < 0 || it.x + s.w > GW || it.z + s.d > GD) return false;
  if (f.out && state.floor !== FLOORS.length - 1) return false;
  if (f.wall) {
    // 掛在後牆（朝房間）或左牆上；露臺沒有牆
    if (!FLOORS[state.floor].wall || !((it.z === 0 && it.r === 0) || (it.x === 0 && it.r === 3))) return false;
    const dc = doorCells(); if (cellsOf(it).some((c) => dc.indexOf(c + "," + it.r) >= 0)) return false;
  }
  const used = {};
  state.items.forEach((o, i) => { if (i !== skip && isWall(o.k) === !!f.wall && (!f.wall || o.r === it.r)) cellsOf(o).forEach((c) => { used[c] = 1; }); });
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
  const used = {}; state.items.forEach((o) => { if (!isWall(o.k)) cellsOf(o).forEach((c) => { used[c] = 1; }); });
  const out = []; for (let x = 0; x < GW; x++) for (let z = 0; z < GD; z++) if (!used[x + "," + z]) out.push({ x, z });
  return out;
}

function buildRoom() {
  // 地板 + 方格線；牆（後面和左邊）每層樓不一樣，放在 roomG 裡重蓋
  floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat("#c99a68")); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const pts = [];
  for (let i = 0; i <= GW; i++) { const x = -W / 2 + i * T; pts.push(x, 0.003, -D / 2, x, 0.003, D / 2); }
  for (let j = 0; j <= GD; j++) { const z = -D / 2 + j * T; pts.push(-W / 2, 0.003, z, W / 2, 0.003, z); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  gridLines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xfff6e6, transparent: true, opacity: 0.85 })); scene.add(gridLines);
  buildWalls();
  // 選取框
  selBox = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x4caf6a, transparent: true, opacity: 0.35, depthWrite: false }));
  selBox.rotation.x = -Math.PI / 2; selBox.position.y = 0.035; selBox.renderOrder = 2; selBox.visible = false; scene.add(selBox);
}
function buildWalls() {
  if (roomG) scene.remove(roomG);
  roomG = new THREE.Group(); scene.add(roomG);
  const F = FLOORS[state.floor] || FLOORS[0];
  floor.material = surfMat(TILES[state.tile] || TILES[F.floor], GW / 2, GD / 2);
  if (scene.background) scene.background.set(F.bg);
  clouds = [];
  // 雲：記下原本的位置，每一幀左右飄、上下浮
  const cloud = (x, y, z, r) => { const c = new THREE.Group(); c.position.set(x, y, z); roomG.add(c); clouds.push({ c, x, y, z, ph: clouds.length * 1.7, sp: 0.12 + (clouds.length % 3) * 0.04 }); [[0, 0, r], [r * 0.9, -0.1 * r, r * 0.7], [-r * 0.9, -0.12 * r, r * 0.65]].forEach(([a, b2, rr]) => { const m = sph(rr, mat("#ffffff", { emissive: "#ffffff", emissiveIntensity: 0.3 }), a, b2, 0, c, 12, 10); m.castShadow = false; }); };
  if (F.out === "garden") {
    // 一樓外面：一圈草地、石板路、矮樹叢和小花
    const g = new THREE.Mesh(new THREE.PlaneGeometry(W + 8, D + 8), mat("#9cc584")); g.rotation.x = -Math.PI / 2; g.position.y = -0.02; g.receiveShadow = true; roomG.add(g);
    for (let i = 0; i < 4; i++) { const st = cyl(0.16, 0.16, 0.02, "#d9cfbf", W / 2 + 0.45 + (i % 2) * 0.12, -0.01, D / 2 - 0.4 - i * 0.55, roomG, 14); st.castShadow = false; }
    [[W / 2 + 0.5, 0.7, 0.22], [W / 2 + 0.35, -D / 2 + 0.3, 0.28], [-W / 2 + 0.6, D / 2 + 0.5, 0.25], [0.8, D / 2 + 0.45, 0.2], [W / 2 + 0.55, D / 2 + 0.5, 0.3]].forEach(([x, z, r]) => { sph(r, "#5f9a50", x, r * 0.7, z, roomG, 12, 10); sph(r * 0.7, "#74b061", x + r * 0.5, r * 0.6, z + r * 0.3, roomG, 10, 8); });
    const fc = ["#f2a7b8", "#ffffff", "#f7d35a", "#c9a0e8"];
    for (let i = 0; i < 14; i++) { const x = -W / 2 + 0.3 + (i * 0.37) % W, z = D / 2 + 0.2 + (i % 3) * 0.18; if (i % 2) sph(0.04, fc[i % 4], x, 0.06, z, roomG, 8, 6); else sph(0.04, fc[i % 4], W / 2 + 0.2 + (i % 3) * 0.16, 0.06, -D / 2 + 0.3 + i * 0.28, roomG, 8, 6); }
  } else if (F.out === "sky") {
    // 二樓外面：房子的外牆往下延伸，旁邊飄著雲，像在半空中
    const slab = box(W + 0.12, 0.5, D + 0.12, "#e7c8a6", 0, -0.26, 0, roomG); slab.castShadow = false;
    box(W + 0.16, 0.06, D + 0.16, "#b98a5a", 0, -0.02, 0, roomG).castShadow = false;
    cloud(W / 2 + 1.0, -0.2, 0.4, 0.3); cloud(-0.6, -0.35, D / 2 + 1.0, 0.36); cloud(W / 2 + 0.7, 0.3, D / 2 + 0.6, 0.2); cloud(-W / 2 - 0.4, 1.9, -D / 2 - 0.6, 0.25); cloud(1.6, 2.2, -D / 2 - 1.2, 0.3); cloud(-W / 2 - 1.2, 0.6, 0.8, 0.28);
  }
  if (!F.wall) {
    // 露臺：沒有牆，四周一圈矮欄杆，外面是天空
    const rail = (x, z, len, alongX) => {
      box(alongX ? len : 0.05, 0.05, alongX ? 0.05 : len, "#b98a5a", x, 0.62, z, roomG);
      const n = Math.round(len / 0.5); for (let i = 0; i <= n; i++) { const o = -len / 2 + i * len / n; box(0.04, 0.6, 0.04, "#8a6040", alongX ? x + o : x, 0.3, alongX ? z : z + o, roomG); }
    };
    backG = leftG = doorG = null;
    rail(0, -D / 2 - 0.03, W, true); rail(-W / 2 - 0.03, 0, D, false); rail(0, D / 2 + 0.03, W, true); rail(W / 2 + 0.03, 0, D, false);
    const edge = box(W + 0.2, 0.12, D + 0.2, "#a89a88", 0, -0.065, 0, roomG); edge.castShadow = false; edge.receiveShadow = true;
    [[-1.9, 1.7, -3.0, 0.16], [0.6, 2.0, -3.3, 0.22], [2.3, 1.6, -2.9, 0.14], [W / 2 + 1.1, 0.5, 0.6, 0.24], [-0.8, -0.4, D / 2 + 1.1, 0.3], [-W / 2 - 1.0, 1.2, 1.2, 0.2]].forEach(([x, y, z, r]) => cloud(x, y, z, r));
    return;
  }
  // 後牆、左牆各一組；鏡頭轉到牆後面時把那面牆藏起來，才看得到房間
  const wallM = surfMat(PAINTS[state.paint] || PAINTS[F.wall], 4, 1);
  backG = new THREE.Group(); leftG = new THREE.Group(); roomG.add(backG, leftG);
  box(W + 0.12, 1.5, 0.1, wallM, 0, 0.75, -D / 2 - 0.05, backG).castShadow = false;
  box(0.1, 1.5, D, wallM, -W / 2 - 0.05, 0.75, 0, leftG).castShadow = false;
  box(W + 0.12, 0.1, 0.12, "#b98a5a", 0, 0.05, -D / 2 - 0.04, backG).castShadow = false;
  box(0.12, 0.1, D, "#b98a5a", -W / 2 - 0.04, 0.05, 0, leftG).castShadow = false;
  // 門：一樓大門在左牆；二樓房門在後牆、下樓梯口左邊（走廊和房間同一扇門）。鎖上時門把旁掛一個金色鎖頭
  doorG = new THREE.Group();
  if (state.floor === 0) { doorG.position.set(-W / 2 + 0.02, 0, D / 2 - 0.75); doorG.rotation.y = Math.PI / 2; leftG.add(doorG); }
  else { doorG.position.set(DOOR_X, 0, -D / 2 + 0.02); backG.add(doorG); }
  const dc = state.floor === 0 ? "#8a5a3a" : "#c98f6a";
  box(0.72, 1.2, 0.03, "#fffaf2", 0, 0.6, 0, doorG).castShadow = false;
  box(0.62, 1.12, 0.05, dc, 0, 0.56, 0.01, doorG).castShadow = false;
  [0.32, 0.8].forEach((y) => box(0.46, 0.3, 0.06, mat(dc, { emissive: "#000000" }), 0, y, 0.012, doorG).castShadow = false);
  sph(0.03, "#e8b93a", 0.22, 0.56, 0.05, doorG, 10, 8);
  const lk = new THREE.Group(); lk.position.set(0.22, 0.44, 0.06); doorG.add(lk); lk.name = "padlock";
  box(0.09, 0.08, 0.03, "#e8b93a", 0, 0, 0, lk);
  const sh = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 6, 14, Math.PI), mat("#c99a2a")); sh.position.y = 0.04; lk.add(sh);
  lk.visible = state.locked;
  // 窗戶：走廊沒有窗；房間的窗在右邊（門在中間）
  if (state.floor === 1 && state.hall) return;
  const win = new THREE.Group(); win.position.set(state.floor === 1 ? 1.75 : 0.6, 0.95, -D / 2 + 0.01); backG.add(win);
  box(0.9, 0.7, 0.03, "#fffaf2", 0, 0, 0, win); box(0.8, 0.6, 0.035, mat("#bfe0f2", { emissive: "#6a98b8", emissiveIntensity: 0.35 }), 0, 0, 0.002, win);
  box(0.03, 0.6, 0.04, "#fffaf2", 0, 0, 0.004, win); box(0.8, 0.03, 0.04, "#fffaf2", 0, 0, 0.004, win);
}
function lighting() {
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x8a5a38, 1.1));
  const sun = new THREE.DirectionalLight(0xfff2d8, 1.5); sun.position.set(3, 7, 5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  const sc = sun.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sun.shadow.bias = -0.0015;
  scene.add(sun);
  scene.background = new THREE.Color((FLOORS[state.floor] || FLOORS[0]).bg);
}
// 鏡頭：預設從右前方斜斜往下看；拖曳可以轉（yaw 左右、pitch 上下），兩指或滾輪縮放
const DIR0 = new THREE.Vector3(0.62, 0.86, 0.78).normalize(), AIM = new THREE.Vector3(-0.1, 0.35, 0);
const YAW0 = Math.atan2(DIR0.x, DIR0.z), PITCH0 = Math.asin(DIR0.y);
let yaw = YAW0, pitch = PITCH0, zoom = 1, baseFar = 8;
function applyCam() {
  pitch = Math.max(0.3, Math.min(1.45, pitch)); zoom = Math.max(0.45, Math.min(1.4, zoom));
  const cp = Math.cos(pitch), f = baseFar * zoom;
  camera.position.set(AIM.x + Math.sin(yaw) * cp * f, AIM.y + Math.sin(pitch) * f, AIM.z + Math.cos(yaw) * cp * f);
  camera.lookAt(AIM); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
}
function resize() {
  if (!container) return;
  const w = container.clientWidth || 300, h = container.clientHeight || 300;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  // 用預設角度量出剛好整個房間（含牆頂）都在畫面裡的距離
  const dir = DIR0, aim = AIM;
  const pts = []; [-W / 2, W / 2].forEach((x) => [-D / 2, D / 2].forEach((z) => [0, x < 0 || z < 0 ? 1.5 : 0].forEach((y) => pts.push(new THREE.Vector3(x, y, z)))));
  let far = 4;
  for (let i = 0; i < 60; i++) {
    camera.position.copy(aim).addScaledVector(dir, far); camera.lookAt(aim); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
    if (pts.every((p) => { const v = p.clone().project(camera); return Math.abs(v.x) < 0.94 && Math.abs(v.y) < 0.92; })) break;
    far += 0.25;
  }
  baseFar = far; applyCam();
}

function rebuildItems() {
  meshes.forEach((m) => scene.remove(m)); meshes = [];
  state.items.forEach((it, i) => {
    const g = build(it.k, it.s), p = worldOf(it);
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
function blocked() { const u = {}; state.items.forEach((o) => { if (RUGS_K.indexOf(o.k) < 0 && !isWall(o.k)) cellsOf(o).forEach((c) => { u[c] = 1; }); }); return u; }
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
    // 剛上下樓：站在樓梯口
    const sti = state.items.find((it) => it.k === (arriveDir > 0 ? "stairsDown" : "stairs")) || state.items.find((it) => FURN[it.k].fixed);
    let stF = null;
    if (sti) { const fa = frontAngle(sti), fx = Math.round(Math.sin(fa)), fz = Math.round(Math.cos(fa)), mine = cellsOf(sti); const c0 = mine.map((c) => c.split(",").map(Number)).map(([x, z]) => ({ x: x + fx, z: z + fz })).find((c) => mine.indexOf(c.x + "," + c.z) < 0); stF = c0 || null; }
    if (arriveDir === 2) stF = { x: DOOR_CELLS[1].x, z: 1 }; // 剛從房門進出：站在門口
    const want = keep ? cur : stF || (k ? { x: GW - 2, z: GD - 1 } : { x: Math.floor(GW / 2), z: Math.floor(GD / 2) });
    free.sort((a, b) => Math.hypot(a.x - want.x, a.z - want.z) - Math.hypot(b.x - want.x, b.z - want.z));
    const c = free.shift() || want; st.pos.copy(cellPos(c));
    if (st.pet && !keep) st.pet.position.set(st.pos.x + 0.3, 0, st.pos.z + 0.2);
    if (!keep && arriveDir === 2) st.ry = 0;
  });
}
function setPeople() {
  dropPerson(ownerSt); dropPerson(guestSt); ownerSt = guestSt = null;
  if (state.owner) ownerSt = person(state.owner.look);
  if (state.guest) { guestSt = person(state.guest.look); guestSt.ry = Math.PI * 1.25; }
  placePeople(false);
}

/* ===== 點地板走過去、點家具做對應的事 ===== */
const SEAT_H = { sofa: 0.3, chair: 0.34, stool: 0.34, armchair: 0.3, beanbag: 0.26, lounger: 0.26, bed: 0.42, bedDouble: 0.42 };
const ACT_OF = { stairs: "", stairsDown: "", sofa: "sit", chair: "sit", stool: "sit", armchair: "sit", beanbag: "sit", lounger: "sit", bed: "sleep", bedDouble: "sleep",
  shelf: "book", shelfTall: "book", shelfLow: "book", desk: "write", deskWhite: "write", table: "mug", coffeeTable: "mug", dining: "mug", piano: "piano", tv: "watch",
  lamp: "lamp", lampArc: "lamp", fridge: "lamp", coffee: "mug", fan: "lamp", speaker: "lamp", plant: "water", monstera: "water", cactus: "water", hanger: "water", tree: "water", flowerbed: "water",
  wardrobe: "spin", drawer: "spin", petbed: "petbed", catTree: "petbed", ball: "petbed", xmasTree: "lamp", pumpkin: "lamp" };
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
    if (RUGS_K.indexOf(it.k) >= 0) best = findPath(from, cell);
    if (!best) return false;
    st.path = best.map(cellPos);
    const w = worldOf(it);
    if (SEAT_H[it.k] != null) onto = new THREE.Vector3(w.x, 0, w.z);
    const last = st.path[st.path.length - 1];
    st.spot = { onto, face: SEAT_H[it.k] != null ? fa : Math.atan2(w.x - last.x, w.z - last.z), item: itemIdx, k: it.k };
    // 床：先背對床坐到床邊，再躺下去
    if (BEDS_K.indexOf(it.k) >= 0) { const dx = w.x - last.x, dz = w.z - last.z, dl = Math.hypot(dx, dz) || 1; st.spot.onto = new THREE.Vector3(last.x + dx / dl * 0.34, 0, last.z + dz / dl * 0.34); st.spot.face = Math.atan2(-dx, -dz); }
  } else {
    const pth = findPath(from, target); if (!pth) return false;
    st.path = pth.map(cellPos); st.spot = null;
  }
  standUp(st); st.idle = 0;
  if (st.pet && st.petBed) st.petBed = null;
  return true;
}
function arrive(st) {
  const sp = st.spot; st.spot = null; if (!sp) return;
  if (sp.door) { st.ry = Math.PI; emitDoor(); return; }
  // 坐上沙發、椅子、床：從旁邊的格子慢慢挪進去，不是瞬間移過去
  if (sp.onto) { st.hop = { from: st.pos.clone(), to: sp.onto.clone(), t: 0 }; st.pos.copy(sp.onto); }
  st.ry = sp.k === "bed" ? sp.face : sp.face; st.act = sp.deskSit ? "sitwrite" : ACT_OF[sp.k] || ""; st.item = sp.item; st.actAt = clock.elapsedTime;
  if (ACT_OF[sp.k] === "lamp") { const m = meshes[sp.item]; m && m.traverse((o) => { if (o.isPointLight) o.visible = !o.visible; }); }
  if (FURN[sp.k].fixed && st.climb) { startClimb(st, sp.item); return; }
  if (FURN[sp.k].fixed) { window.dispatchEvent(new CustomEvent("kaida-home-stairs", { detail: { floor: state.floor, dir: sp.k === "stairs" ? 1 : -1 } })); }
  if (ACT_OF[sp.k] === "book") window.dispatchEvent(new CustomEvent("kaida-home-shelf", { detail: { k: sp.k } }));
  if (sp.k === "petbed" && st.pet) { const w = worldOf(state.items[sp.item]); st.petBed = new THREE.Vector3(w.x, 0.05, w.z); }
}
// 停下手邊的事；正躺在床上的話，先坐起來、站起來才開始走
function standUp(st) {
  if (st.act === "sleep" && state.items[st.item]) st.getUp = { t: 0, it: state.items[st.item], edge: st.pos.clone(), ry: st.ry };
  st.act = ""; st.item = -1;
}
function emitDoor() { window.dispatchEvent(new CustomEvent("kaida-home-door", { detail: { floor: state.floor, hall: state.hall } })); }
// 點二樓的房門：先走到門口，到了才開門（走不到就直接開）
function walkToDoor(st) {
  if (state.floor !== 1 || !st) return emitDoor();
  const from = cellOfPos(st.pos); let best = null;
  DOOR_CELLS.forEach((c) => { const p = findPath(from, c); if (p && (!best || p.length < best.length)) best = p; });
  if (!best) return emitDoor();
  st.path = best.map(cellPos); st.spot = { door: true }; standUp(st); st.idle = 0;
  if (!st.path.length) arrive(st);
}
// 按了書桌的「坐下」：書桌旁有椅子就坐上去寫字，沒有就站著寫
function sitDesk(i) {
  const st = guestSt || ownerSt, d = state.items[i]; if (!st || !d || st.climb) return false;
  if (d.k === "studyset") {
    // 書桌椅組：走到前面，坐上椅子（佔地前半格中間）面向書桌
    if (!goTo(st, cellOfPos(st.pos), i)) return false;
    const w = worldOf(d), fa = frontAngle(d);
    st.spot.onto = new THREE.Vector3(w.x + Math.sin(fa) * 0.27, 0, w.z + Math.cos(fa) * 0.27); st.spot.face = fa + Math.PI; st.spot.deskSit = true;
    if (!st.path.length) arrive(st);
    return true;
  }
  const dc = cellsOf(d);
  const ci = state.items.findIndex((o) => SEATS_K.indexOf(o.k) >= 0 && cellsOf(o).some((k) => { const [x, z] = k.split(",").map(Number); return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => dc.indexOf((x + a) + "," + (z + b)) >= 0); }));
  if (ci < 0) return goTo(st, cellOfPos(st.pos), i);
  if (!goTo(st, cellOfPos(st.pos), ci)) return false;
  const c = state.items[ci], cw = worldOf(c), dw = worldOf(d);
  st.spot.deskSit = true; st.spot.face = Math.atan2(dw.x - cw.x, dw.z - cw.z);
  if (!st.path.length) arrive(st);
  return true;
}
/* ===== 上下樓：走到樓梯口，一階一階爬上去（或往下走），畫面淡出再換樓層 ===== */
function climb(dir, done) {
  const st = guestSt || ownerSt, i = state.items.findIndex((o) => o.k === (dir > 0 ? "stairs" : "stairsDown"));
  if (!st || i < 0 || state.edit || (st.climb && st.climb.on)) return false;
  st.climb = { dir, done, on: false };
  if (!goTo(st, cellOfPos(st.pos), i)) { st.climb = null; return false; }
  if (!st.path.length) arrive(st);
  return true;
}
function startClimb(st, idx) {
  const it = state.items[idx], w = worldOf(it), fa = frontAngle(it), s = dims(it), len = (it.r % 2 ? s.w : s.d) * T;
  const fx = Math.sin(fa), fz = Math.cos(fa);
  const foot = new THREE.Vector3(w.x + fx * len / 2, 0, w.z + fz * len / 2), end = new THREE.Vector3(w.x - fx * (len / 2 - 0.2), 0, w.z - fz * (len / 2 - 0.2));
  // 往上：沿著樓梯爬到頂；往下：走進樓梯口，一階一階沉下去（地板會擋住下半身）
  const h = st.climb.dir > 0 ? 1.4 : -1.4;
  Object.assign(st.climb, { on: true, t: 0, from: st.pos.clone(), foot, to: end, h, dur: 2.0, faded: false });
  st.act = "climb"; st.ry = Math.atan2(end.x - st.pos.x, end.z - st.pos.z) || st.ry;
}
function climbStep(st, dt) {
  const cl = st.climb; cl.t += dt;
  const p = Math.min(1, cl.t / cl.dur), total = cl.from.distanceTo(cl.to) || 1, p0 = Math.min(0.9, cl.from.distanceTo(cl.foot) / total);
  st.pos.x = cl.from.x + (cl.to.x - cl.from.x) * p; st.pos.z = cl.from.z + (cl.to.z - cl.from.z) * p;
  const q = Math.max(0, (p - p0) / (1 - p0));
  st.pos.y = cl.h * Math.floor(q * 7) / 7 + cl.h * ((q * 7) % 1) / 7 * 0.6;
  if (p > 0.55 && !cl.faded) { cl.faded = true; renderer.domElement.style.opacity = "0"; }
  if (p >= 1) {
    st.climb = null; st.act = ""; st.pos.y = 0;
    setTimeout(() => { cl.done && cl.done(); requestAnimationFrame(() => { renderer.domElement.style.opacity = "1"; }); }, 260);
  }
}
// 床上的姿勢：u = 0 坐在床邊（背對床）、u = 1 躺平（頭朝床頭）
function bedPose(c, it, u, edge, outRy) {
  const w = worldOf(it), fa = frontAngle(it), s = dims(it), len = (it.r % 2 ? s.w : s.d) * T;
  const e = u * u * (3 - 2 * u), lx = w.x + Math.sin(fa) * (len / 2 - 0.12), lz = w.z + Math.cos(fa) * (len / 2 - 0.12);
  let dr = fa - outRy; dr = Math.atan2(Math.sin(dr), Math.cos(dr));
  c.root.position.set(edge.x + (lx - edge.x) * e, 0.4 * e, edge.z + (lz - edge.z) * e);
  c.root.rotation.x = -Math.PI / 2 * e; c.root.rotation.y = outRy + dr * e;
  c.hips.position.y = SEAT_H.bed + (0.36 - SEAT_H.bed) * e; c.legs.forEach((l) => { l.rotation.x = -1.45 * (1 - e); });
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
  if (st.getUp) { st.getUp.t += dt; if (st.getUp.t >= 1.3) { st.getUp = null; } }
  if (st.path.length && !st.getUp) {
    const to = st.path[0], dx = to.x - st.pos.x, dz = to.z - st.pos.z, dist = Math.hypot(dx, dz);
    if (dist < 0.02) { st.path.shift(); if (!st.path.length) arrive(st); }
    else { const step = Math.min(dist, dt * 1.6); st.pos.x += dx / dist * step; st.pos.z += dz / dist * step; st.ry = Math.atan2(dx, dz); walking = true; }
  }
  if (st.climb && st.climb.on) { climbStep(st, dt); walking = true; }
  if (st.hop) { st.hop.t += dt; if (st.hop.t >= 0.4) st.hop = null; else walking = true; }
  const gu = st.getUp;
  const c = st.c, act = walking ? "" : st.act, lie = act === "sleep";
  // 每一幀先站直，再擺姿勢
  c.hips.position.set(0, 0.36, 0); c.torso.rotation.set(0, 0, 0); c.head.rotation.set(0, 0, 0);
  c.legs.forEach((l) => l.rotation.set(0, 0, 0)); c.arms.forEach((a) => a.rotation.set(0, 0, 0));
  c.book.visible = act === "book"; c.cup.visible = act === "mug"; c.cookie.visible = false;
  let dr = st.ry - c.root.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); c.root.rotation.y += dr * Math.min(1, dt * 8);
  if (st.hop) c.root.position.lerpVectors(st.hop.from, st.hop.to, st.hop.t / 0.4); else c.root.position.copy(st.pos);
  c.root.rotation.x = 0; c.root.children[0].visible = !lie;
  const k = s - (st.actAt || 0);
  if (walking) {
    const sw = Math.sin(s * 10) * 0.55;
    c.legs[0].rotation.x = sw; c.legs[1].rotation.x = -sw; c.arms[0].rotation.x = -sw * 0.8; c.arms[1].rotation.x = sw * 0.8;
    c.hips.position.y = 0.36 + Math.abs(Math.sin(s * 10)) * 0.03;
  } else if (act === "sit") {
    c.hips.position.y = SEAT_H[(state.items[st.item] || {}).k] || 0.32; c.legs.forEach((l) => { l.rotation.x = -1.45; });
    c.arms.forEach((a) => { a.rotation.x = -0.5; }); c.head.rotation.y = Math.sin(s * 0.4) * 0.35;
  } else if (gu) {
    // 下床：躺 → 坐到床邊 → 站起來
    bedPose(c, gu.it, 1 - Math.min(1, gu.t / 0.8), gu.edge, gu.ry);
    if (gu.t > 0.8) { const q = Math.min(1, (gu.t - 0.8) / 0.5); c.hips.position.y = SEAT_H.bed + (0.36 - SEAT_H.bed) * q; c.legs.forEach((l) => { l.rotation.x = -1.45 * (1 - q); }); }
  } else if (lie) {
    // 上床：先坐在床邊，再往後躺下；躺好了頭朝床頭，眼睛閉起來
    const it = state.items[st.item], kk = k - 0.4;
    if (it) bedPose(c, it, kk < 0.6 ? 0 : Math.min(1, (kk - 0.6) / 0.8), st.pos, st.ry);
    c.torso.position.y = Math.sin(s * 1.2) * 0.008;
  } else if (act === "book") {
    c.arms.forEach((a, i) => { a.rotation.x = -1.25; a.rotation.z = (i ? -1 : 1) * 0.55; }); c.head.rotation.x = 0.38;
    const ph = (s % 3.2) / 0.7; c.book.userData.page.rotation.z = ph < 1 ? Math.PI * (1 - Math.cos(ph * Math.PI)) / 2 : 0;
  } else if (act === "sitwrite") {
    // 坐在書桌前的椅子上寫字
    c.hips.position.y = SEAT_H.chair; c.legs.forEach((l) => { l.rotation.x = -1.45; });
    c.torso.rotation.x = 0.22; c.head.rotation.x = 0.42; c.arms[0].rotation.x = -1.05; c.arms[1].rotation.x = -1.1 + Math.sin(s * 7) * 0.08;
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
    else { const off = new THREE.Vector3(0.32, 0, -0.1).applyAxisAngle(new THREE.Vector3(0, 1, 0), lie || act === "sit" || act === "sitwrite" ? st.ry + Math.PI : c.root.rotation.y); const base = lie || act === "sit" || act === "sitwrite" ? cellPos(cellOfPos(st.pos)) : st.pos; tx = base.x + off.x; tz = base.z + off.z; }
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
// 點地板的漣漪：兩圈往外擴散、慢慢變淡，表示要走到這裡
const ripples = [];
function ripple(sc, x, z) {
  for (let k = 0; k < 2; k++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.1, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.02, z); m.renderOrder = 3; sc.add(m);
    ripples.push({ m, sc, t: -k * 0.18 });
  }
}
function tickRipples(dt) {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i]; r.t += dt; const p = Math.max(0, r.t / 0.75);
    r.m.visible = r.t >= 0; r.m.scale.setScalar(1 + p * 2.6); r.m.material.opacity = 0.9 * (1 - p);
    if (p >= 1) { r.sc.remove(r.m); r.m.geometry.dispose(); r.m.material.dispose(); ripples.splice(i, 1); }
  }
}
function frame() {
  raf = requestAnimationFrame(frame);
  if (!container || !container.isConnected || container.offsetParent === null) return;
  const dt = Math.min(0.05, clock.getDelta()), s = clock.elapsedTime;
  tickRipples(dt);
  clouds.forEach((o) => { o.c.position.x = o.x + Math.sin(s * o.sp + o.ph) * 0.7; o.c.position.y = o.y + Math.sin(s * 0.5 + o.ph) * 0.06; });
  // 鏡頭轉到牆外面就藏起那面牆
  if (backG) backG.visible = camera.position.z > -D / 2;
  if (leftG) leftG.visible = camera.position.x > -W / 2;
  meshes.forEach((m, i) => { const it = state.items[i]; if (it && isWall(it.k)) m.visible = (it.r === 3 ? leftG : backG) ? (it.r === 3 ? leftG : backG).visible : false; });
  animPerson(ownerSt, dt, s, !state.edit && !!guestSt);
  animPerson(guestSt, dt, s, false);
  // 方格只在擺設、移動家具時出現
  gridLines.visible = state.edit;
  renderer.render(scene, camera);
  // 樓梯上的上下樓按鈕跟著樓梯走；擺設時收起來
  const busy = state.edit || [ownerSt, guestSt].some((p) => p && p.climb);
  Object.keys(pins).forEach((k) => {
    const el = pins[k];
    // 房門旁的鎖：只在二樓走廊、門看得到時出現
    if (k === "door") {
      if (busy || state.floor !== 1 || !state.hall || !doorG || !doorG.parent.visible) { el.hidden = true; return; }
      const v = new THREE.Vector3(0.62, 0.7, 0.1); doorG.localToWorld(v); v.project(camera);
      el.hidden = false; el.style.left = ((v.x + 1) / 2 * container.clientWidth) + "px"; el.style.top = ((1 - v.y) / 2 * container.clientHeight) + "px";
      return;
    }
    const it = state.items.find((o) => o.k === k);
    if (!it || busy) { el.hidden = true; return; }
    const w = worldOf(it), v = new THREE.Vector3(w.x, k === "stairs" ? 0.9 : 0.35, w.z).project(camera);
    el.hidden = false;
    el.style.left = ((v.x + 1) / 2 * container.clientWidth) + "px"; el.style.top = ((1 - v.y) / 2 * container.clientHeight) + "px";
  });
}
let pins = {}, arriveDir = 0;

/* ===== 操作：點家具選取，拖曳或點格子移動 ===== */
let drag = null, tapStart = null, orbit = null, pinch = null, gesture = false;
const touches = new Map();
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
  let r = it.r;
  // 掛牆的東西：拖到哪面牆比較近就掛哪面
  if (isWall(it.k)) r = cell.x < cell.z ? 3 : 0;
  const s = dims({ k: it.k, r }), cand = { k: it.k, r, x: cell.x - Math.floor((s.w - 1) / 2), z: cell.z - Math.floor((s.d - 1) / 2) };
  cand.x = Math.max(0, Math.min(GW - s.w, cand.x)); cand.z = Math.max(0, Math.min(GD - s.d, cand.z));
  if (isWall(it.k)) { if (r === 3) cand.x = 0; else cand.z = 0; }
  const ok = fits(cand, sel);
  if (commit) {
    if (ok) { it.x = cand.x; it.z = cand.z; it.r = cand.r; }
    ghostOK = true; rebuildItems(); if (ok && onChange) onChange(state.items);
    return ok;
  }
  // 拖曳中：家具跟著手指，格子框綠色可以放、紅色放不下
  ghostOK = ok;
  const p = worldOf(cand), m = meshes[sel]; m.position.x = p.x; m.position.z = p.z; m.position.y = 0.06; m.rotation.y = -cand.r * Math.PI / 2;
  selBox.scale.set(s.w * T, s.d * T, 1); selBox.position.x = p.x; selBox.position.z = p.z; selBox.material.color.set(ok ? 0x4caf6a : 0xd9534f); selBox.visible = true;
  return ok;
}
function bindInput(el) {
  el.addEventListener("pointerdown", (e) => {
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    // 兩指：縮放；這次手勢不算點擊
    if (touches.size === 2) { const [a, b] = [...touches.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: zoom }; orbit = null; drag = null; gesture = true; return; }
    if (touches.size > 2) return;
    tapStart = { x: e.clientX, y: e.clientY }; gesture = false;
    el.setPointerCapture && el.setPointerCapture(e.pointerId);
    const i = state.edit ? pickItem(e) : -1;
    if (state.edit) drag = { x: e.clientX, y: e.clientY, i, moved: false, id: e.pointerId };
    // 擺設時拖選中的家具是搬家具，其他拖曳都是轉鏡頭
    orbit = state.edit && i >= 0 && i === sel ? null : { x: e.clientX, y: e.clientY, yaw, pitch, on: false };
  });
  const endTouch = (e) => { touches.delete(e.pointerId); if (touches.size < 2) pinch = null; if (!touches.size) orbit = null; };
  // 點兩下回到原本的角度
  el.addEventListener("dblclick", () => { yaw = YAW0; pitch = PITCH0; zoom = 1; applyCam(); });
  el.addEventListener("pointercancel", (e) => { endTouch(e); drag = null; gesture = false; });
  el.addEventListener("wheel", (e) => { e.preventDefault(); zoom *= Math.exp(e.deltaY * 0.0012); applyCam(); }, { passive: false });
  el.addEventListener("pointermove", (e) => {
    if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && touches.size === 2) { const [a, b] = [...touches.values()]; zoom = pinch.z * pinch.d / (Math.hypot(a.x - b.x, a.y - b.y) || 1); applyCam(); return; }
    if (orbit && touches.size === 1) {
      const dx = e.clientX - orbit.x, dy = e.clientY - orbit.y;
      if (!orbit.on && Math.hypot(dx, dy) < 8) return;
      orbit.on = true; gesture = true; e.preventDefault();
      yaw = orbit.yaw - dx * 0.007; pitch = orbit.pitch + dy * 0.006; applyCam();
      return;
    }
    if (!drag || !state.edit || drag.i < 0 || drag.i !== sel) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
    drag.moved = true; e.preventDefault();
    moveSelTo(cellAt(e.clientX, e.clientY), false);
  });
  el.addEventListener("pointerup", (e) => {
    endTouch(e);
    if (gesture) { if (!touches.size) { gesture = false; drag = null; } return; }
    if (!state.edit) {
      // 逛家模式：點地板走過去，點家具做對應的事（自己家動自己，去別人家動客人）
      if (doorG && doorG.parent && doorG.parent.visible && tapStart && Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) <= 10) {
        const r = renderer.domElement.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
        if (ray.intersectObject(doorG, true).length) { const st = guestSt || ownerSt; if (st && st.climb) return; walkToDoor(st); return; }
      }
      const st = guestSt || ownerSt; if (!st || st.climb || !tapStart || Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) > 10) return;
      let i = pickItem(e); const cell = cellAt(e.clientX, e.clientY);
      // 點到家具佔的格子（家具中間的空隙）也算點到那件家具
      if (i < 0 && cell) { const bl = blocked(); if (bl[cell.x + "," + cell.z]) i = state.items.findIndex((o) => RUGS_K.indexOf(o.k) < 0 && !isWall(o.k) && cellsOf(o).indexOf(cell.x + "," + cell.z) >= 0); }
      // 點書桌：先浮出「坐下」按鈕，按了才去坐
      if (i >= 0 && DESKS_K.indexOf(state.items[i].k) >= 0) { const w = worldOf(state.items[i]), v = new THREE.Vector3(w.x, 0.6, w.z).project(camera); window.dispatchEvent(new CustomEvent("kaida-home-desk", { detail: { i, k: state.items[i].k, x: (v.x + 1) / 2 * container.clientWidth, y: (1 - v.y) / 2 * container.clientHeight } })); return; }
      if (i >= 0) goTo(st, cell, i); else if (cell && cell.x >= 0 && cell.z >= 0 && cell.x < GW && cell.z < GD) { if (goTo(st, cell, -1)) { const c = cellPos(cell); ripple(scene, c.x, c.z); } else { const bl = blocked(); if (bl[cell.x + "," + cell.z]) { const j = state.items.findIndex((o) => cellsOf(o).indexOf(cell.x + "," + cell.z) >= 0); if (j >= 0) goTo(st, cell, j); } } }
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
  const fl = Math.max(0, Math.min(FLOORS.length - 1, o.floor | 0)), hall = fl === 1 && !!o.hall, floorChanged = fl !== state.floor || hall !== state.hall;
  state.hall = hall;
  const surfChanged = (o.paint || "") !== state.paint || (o.tile || "") !== state.tile; state.paint = o.paint || ""; state.tile = o.tile || "";
  state.owner = o.owner || null; state.guest = o.guest || null; state.edit = !!o.edit; state.floor = fl; state.locked = !!o.locked;
  if (doorG) { const lk = doorG.getObjectByName("padlock"); if (lk) lk.visible = state.locked; }
  state.items = (o.items || []).filter((it) => FURN[it.k]).map((it) => { const c = { k: it.k, x: it.x | 0, z: it.z | 0, r: (it.r | 0) % 4 }; if (ART_K.indexOf(it.k) >= 0) c.s = it.s | 0 || newSeed(); return c; });
  const seeded = state.items.some((it, i) => it.s && !((o.items || [])[i] || {}).s);
  // 每層該有的樓梯：舊的頂樓樓梯改成樓梯口、多的拿掉、少的自己擺（右後角優先）
  let added = false;
  const want = stairKinds(fl, hall);
  state.items.forEach((it) => { if (it.k === "stairs" && want.indexOf("stairs") < 0) { it.k = "stairsDown"; added = true; } });
  state.items = state.items.filter((it, i) => { if (!FURN[it.k].fixed) return true; const keep = want.indexOf(it.k) >= 0 && state.items.findIndex((o) => o.k === it.k) === i; if (!keep) added = true; return keep; });
  want.forEach((k) => {
    if (state.items.some((it) => it.k === k)) return;
    const tries = [{ x: GW - 2, z: 0 }, { x: GW - 2, z: GD - 3 }, { x: 0, z: GD - 3 }];
    let c = tries.map((t) => ({ k, r: 0, x: t.x, z: t.z })).find((t) => fits(t, -1));
    if (!c) for (let x = GW - 2; x >= 0 && !c; x--) for (let z = 0; z <= GD - 3 && !c; z++) { const t = { k, r: 0, x, z }; if (fits(t, -1)) c = t; }
    if (c) { state.items.push(c); added = true; }
  });
  if (seeded && !o.guest) added = true; // 舊的畫還沒有編號：補上之後存起來，下次看到的是同一幅
  arriveDir = o.arrive | 0;
  if (!state.edit) sel = -1; else if (sel >= state.items.length) sel = -1;
  if (!mounted) { if (added && onChange) onChange(state.items); return; }
  if (floorChanged || surfChanged) buildWalls();
  if (peopleChanged || floorChanged) setPeople();
  rebuildItems(); emitSel();
  if (added && onChange) onChange(state.items);
}
// 新買的家具：先靠後牆（朝房間）、再靠左牆，最後才放中間，留出走道
function place(kind) {
  const f = FURN[kind]; if (!f) return false;
  const cand = [];
  [0, 3, 1, 2].forEach((r) => { for (let x = 0; x < GW; x++) for (let z = 0; z < GD; z++) {
    const c = { k: kind, x, z, r }, s = dims(c);
    const wall = z === 0 && r === 0 ? 0 : x === 0 && r === 3 ? 1 : RUGS_K.indexOf(kind) >= 0 ? 2 : 3;
    const mid = Math.hypot(x + s.w / 2 - GW / 2, z + s.d / 2 - GD / 2);
    cand.push({ c, score: wall * 100 + (wall < 2 ? x + z : wall === 2 ? mid : -mid) });
  } });
  cand.sort((a, b) => a.score - b.score);
  const ok = cand.find((o) => fits(o.c, -1));
  if (!ok) return false;
  if (ART_K.indexOf(kind) >= 0) ok.c.s = newSeed();
  state.items.push(ok.c); sel = state.items.length - 1; rebuildItems(); emitSel(); if (onChange) onChange(state.items);
  return true;
}
function rotate() {
  const it = state.items[sel]; if (!it) return false;
  // 掛牆的東西：轉一下就換到另一面牆
  if (isWall(it.k)) { const c = it.r === 0 ? { k: it.k, r: 3, x: 0, z: Math.min(GD - FURN[it.k].w, it.x) } : { k: it.k, r: 0, z: 0, x: Math.min(GW - FURN[it.k].w, it.z) }; if (!fits(c, sel)) return false; Object.assign(it, c); rebuildItems(); if (onChange) onChange(state.items); return true; }
  // 原地轉 90 度；轉了放不下就在附近找位置，都不行就不轉
  const s0 = dims(it), cx = it.x + s0.w / 2, cz = it.z + s0.d / 2, r = (it.r + 1) % 4;
  const s1 = it.r % 2 ? { w: FURN[it.k].w, d: FURN[it.k].d } : { w: FURN[it.k].d, d: FURN[it.k].w };
  const base = { k: it.k, r, x: Math.round(cx - s1.w / 2), z: Math.round(cz - s1.d / 2) };
  const tries = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
  for (const [ox, oz] of tries) { const c = { k: it.k, r, x: base.x + ox, z: base.z + oz }; if (fits(c, sel)) { Object.assign(it, c); rebuildItems(); if (onChange) onChange(state.items); return true; } }
  return false;
}
function store() {
  if (sel < 0 || FURN[state.items[sel].k].fixed) return "";
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
// 門在畫面上的位置（測試用）
function doorAt() { if (!doorG || !doorG.parent || !doorG.parent.visible) return null; const v = new THREE.Vector3(0, 0.7, 0); doorG.localToWorld(v); v.project(camera); const r = renderer.domElement.getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }; }
window.KaidaHome = { PAINTS, TILES, sitDesk, doorAt, climb, pin: (map) => { pins = map; }, who, screenOf, mount, set, place, rotate, store, select, FURN, FLOORS, GW, GD, onChange: (cb) => { onChange = cb; } };
window.dispatchEvent(new Event("kaida-home-ready"));
