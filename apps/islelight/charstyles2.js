/* 人物風格樣板第二批：比第一批精緻——眼睛有虹膜貼圖、頭髮分綹、衣服有層次和配件
   同一套骨架（root / hips / torso / head / legs / arms / hipY），animWalk 可以直接用
   - anime   : 日系動漫——大眼睛、分綹髮型、制服外套百褶裙、緞帶
   - steam   : 蒸汽龐克探險家——護目鏡、皮背心、皮帶口袋、背包掛提燈
   - witch   : 奇幻魔女——尖帽、披風、長裙、法杖、腰包
   - pixar   : 皮克斯風——圓潤比例、大眼睛虹膜、開襟衫牛仔褲球鞋
   - kimono  : 和風浪人——和服、腰帶、草鞋、髮髻、刀
   - robot   : 發條機器人——金屬板、發光眼、關節、天線 */
import { THREE, mat, box, cyl, sph, cap, outline } from "./chars.js";

function canvasTex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const eyeTexCache = {};
/* 眼睛貼圖：眼白、漸層虹膜、瞳孔、兩點高光 */
function eyeTex(iris) {
  return eyeTexCache[iris] || (eyeTexCache[iris] = canvasTex(64, 64, (g) => {
    g.fillStyle = "#fbfbfb"; g.fillRect(0, 0, 64, 64);
    const gr = g.createRadialGradient(32, 36, 4, 32, 34, 18); gr.addColorStop(0, "#1a1418"); gr.addColorStop(0.35, iris); gr.addColorStop(1, new THREE.Color(iris).multiplyScalar(0.45).getStyle());
    g.fillStyle = gr; g.beginPath(); g.ellipse(32, 36, 16, 20, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#120e12"; g.beginPath(); g.ellipse(32, 38, 7, 10, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(25, 28, 5, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(38, 44, 2.5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#2a2026"; g.lineWidth = 6; g.beginPath(); g.moveTo(8, 18); g.quadraticCurveTo(32, 2, 56, 18); g.stroke();
  }));
}
function eye(parent, x, y, z, w, h, iris) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: eyeTex(iris), roughness: 0.35, transparent: true })); m.position.set(x, y, z); m.rotation.y = x * 0.9; m.castShadow = false; m.userData.noOutline = true; parent.add(m); return m;
}
/* 一綹頭髮：彎曲的細長膠囊 */
function strand(parent, hairC, x, y, z, len, r, rx, rz, ry) { const s = cap(r, len, hairC, parent); s.position.set(x, y, z); s.rotation.set(rx || 0, ry || 0, rz || 0); return s; }
function base(hipY) {
  const root = new THREE.Group();
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.3, 20), new THREE.MeshBasicMaterial({ color: 0x3a2a1a, transparent: true, opacity: 0.18, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01; root.add(shadow);
  const hips = new THREE.Group(); hips.position.y = hipY; root.add(hips);
  const torso = new THREE.Group(); hips.add(torso);
  const dummy = () => { const g = new THREE.Group(); g.visible = false; return g; };
  return { root, hips, torso, legs: [], arms: [], eyes: [], cat: null, book: dummy(), cup: dummy(), cookie: dummy(), hipY };
}
function legsOf(c, x, r, len, col, shoe, shoeFn) { [-x, x].forEach((lx) => { const p = new THREE.Group(); p.position.set(lx, 0, 0); c.hips.add(p); const l = cap(r, len, col, p); l.position.y = -len / 2 - 0.02; if (shoeFn) shoeFn(p, -len - r - 0.02, Math.sign(lx)); else { const s = sph(r * 1.25, shoe, 0, -len - r - 0.02, 0.03, p, 12, 8); s.scale.set(1, 0.6, 1.5); } c.legs.push(p); }); }
function armsOf(c, x, y, r, len, col, hand, handR) { [-1, 1].forEach((s) => { const p = new THREE.Group(); p.position.set(x * s, y, 0); c.torso.add(p); const a = cap(r, len, col, p); a.position.y = -len / 2 - 0.02; sph(handR || r * 1.2, hand, 0, -len - 0.05, 0, p, 10, 8); p.rotation.z = 0.12 * s; c.arms.push(p); }); }
function hairShell(head, hairC, r, y, frontT, backT, sx, sy, sz) {
  const capG = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 16, 0, Math.PI * 2, 0, Math.PI * frontT), mat(hairC)); capG.position.set(0, y, -0.01); capG.rotation.x = -0.3; capG.scale.set(sx, sy, sz); capG.castShadow = true; head.add(capG);
  const backG = new THREE.Mesh(new THREE.SphereGeometry(r - 0.003, 28, 16, Math.PI, Math.PI, 0, Math.PI * backT), mat(hairC)); backG.position.set(0, y, -0.012); backG.scale.set(sx, sy, sz); backG.castShadow = true; head.add(backG);
  return capG;
}

/* 日系動漫 */
export function makeAnime(look) {
  look = look || {}; const c = base(0.74), { hips, torso } = c;
  const skin = "#fbe3d2", hairC = look.hair || "#7a4a8a", jacket = "#2f3a5a", shirt = "#f8f6f0", skirt = "#8a3040", sock = "#2a2a34", shoe = "#3a2a2a";
  // 百褶裙：一圈 14 片薄板
  const sk = new THREE.Group(); sk.position.y = -0.02; hips.add(sk); cyl(0.15, 0.19, 0.2, skirt, 0, -0.08, 0, sk, 14);
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; const pl = box(0.07, 0.2, 0.012, skirt, Math.sin(a) * 0.185, -0.09, Math.cos(a) * 0.185, sk); pl.rotation.y = a; pl.rotation.x = 0.1; }
  legsOf(c, 0.07, 0.048, 0.42, skin, shoe, (p, y, sd) => { cyl(0.052, 0.05, 0.18, sock, 0, y + 0.18, 0, p, 10); const s = sph(0.062, shoe, 0, y - 0.01, 0.03, p, 12, 8); s.scale.set(1, 0.55, 1.5); });
  const body = cap(0.135, 0.26, shirt, torso); body.position.y = 0.26; body.scale.set(1, 1, 0.72);
  const jk = cyl(0.15, 0.145, 0.3, jacket, 0, 0.25, 0, torso, 18); jk.scale.z = 0.74; // 外套
  box(0.08, 0.3, 0.015, shirt, 0, 0.26, 0.108, torso); // 開襟露出襯衫
  [-1, 1].forEach((sd) => { const lap = box(0.045, 0.2, 0.012, jacket, sd * 0.055, 0.33, 0.112, torso); lap.rotation.z = sd * 0.25; });
  [-1, 1].forEach((sd) => { const rb = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 8), mat("#d8303a")); rb.rotation.z = sd * Math.PI / 2; rb.position.set(sd * 0.035, 0.4, 0.11); torso.add(rb); }); sph(0.02, "#d8303a", 0, 0.4, 0.115, torso, 8, 6);
  cyl(0.04, 0.045, 0.07, skin, 0, 0.46, 0, torso, 10);
  armsOf(c, 0.165, 0.41, 0.042, 0.32, jacket, skin, 0.048);
  const head = new THREE.Group(); head.position.y = 0.66; torso.add(head); c.head = head;
  const hs = sph(0.185, skin, 0, 0, 0, head, 28, 20); hs.scale.set(1, 1.06, 0.95);
  // 下巴尖一點
  const chin = sph(0.12, skin, 0, -0.1, 0.02, head, 16, 12); chin.scale.set(1.1, 0.8, 0.9);
  c.eyes.push(eye(head, -0.075, -0.01, 0.168, 0.085, 0.1, "#3a8ad0"), eye(head, 0.075, -0.01, 0.168, 0.085, 0.1, "#3a8ad0"));
  [-0.075, 0.075].forEach((x) => { const br = box(0.07, 0.01, 0.008, hairC, x, 0.075, 0.175, head); br.rotation.z = -Math.sign(x) * 0.1; });
  const mouth = box(0.028, 0.008, 0.006, "#c05060", 0, -0.085, 0.178, head);
  [-0.12, 0.12].forEach((x) => { const b = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), new THREE.MeshBasicMaterial({ color: 0xf7a0b0, transparent: true, opacity: 0.5 })); b.position.set(x, -0.05, 0.15); b.rotation.y = x * 2.4; head.add(b); });
  hairShell(head, hairC, 0.2, 0.02, 0.55, 0.9, 1.04, 1.06, 1.02);
  // 瀏海分綹、側邊長髮、後面雙馬尾
  [[-0.12, 0.3, 0.0], [-0.05, 0.1, 0.02], [0.03, -0.15, 0.02], [0.1, -0.35, 0.0]].forEach(([x, rz, dy]) => strand(head, hairC, x, 0.06 + dy, 0.15, 0.11, 0.028, 0.2, rz));
  [-1, 1].forEach((sd) => { strand(head, hairC, sd * 0.19, -0.1, 0.05, 0.3, 0.035, 0, sd * 0.08); const tail = strand(head, hairC, sd * 0.22, -0.2, -0.08, 0.5, 0.05, 0.15, sd * 0.25); const rb = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 8, 16), mat("#d8303a")); rb.position.set(sd * 0.2, 0.0, -0.08); rb.rotation.y = Math.PI / 2; head.add(rb); });
  outline(c.root, 0.013);
  return c;
}

/* 蒸汽龐克探險家 */
export function makeSteam(look) {
  look = look || {}; const c = base(0.72), { hips, torso } = c;
  const skin = "#f0cfb0", hairC = "#8a5a30", leather = "#5a3a22", shirt = "#d8c8a8", pants = "#4a4a50", brass = mat("#c9a24a", { metalness: 0.7, roughness: 0.3 });
  legsOf(c, 0.075, 0.055, 0.4, pants, leather, (p, y, sd) => { cyl(0.065, 0.06, 0.2, leather, 0, y + 0.16, 0, p, 12); const s = sph(0.065, leather, 0, y, 0.03, p, 12, 8); s.scale.set(1, 0.6, 1.5); [0.1, 0.2].forEach((h) => { const bk = box(0.14, 0.02, 0.14, "#2a2020", 0, y + h, 0, p); sph(0.012, brass, 0, y + h, 0.07, p, 6, 4); }); });
  const body = cap(0.145, 0.28, shirt, torso); body.position.y = 0.26; body.scale.set(1, 1, 0.78);
  const vest = cyl(0.158, 0.15, 0.3, leather, 0, 0.24, 0, torso, 18); vest.scale.z = 0.8; box(0.06, 0.3, 0.012, shirt, 0, 0.25, 0.123, torso);
  [0.33, 0.25, 0.17].forEach((y) => sph(0.013, brass, 0.03, y, 0.125, torso, 6, 4));
  box(0.33, 0.04, 0.26, "#2a2020", 0, 0.08, 0, torso); box(0.05, 0.05, 0.012, brass, 0, 0.08, 0.13, torso);
  const belt2 = box(0.04, 0.42, 0.26, "#2a2020", -0.08, 0.26, 0, torso); belt2.rotation.z = 0.35; // 斜背帶
  [-0.1, 0.1].forEach((x) => box(0.08, 0.08, 0.05, leather, x, 0.05, 0.12, torso)); // 口袋
  cyl(0.045, 0.05, 0.08, skin, 0, 0.47, 0, torso, 10);
  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.03, 8, 18), mat("#a8382a")); scarf.rotation.x = Math.PI / 2; scarf.position.y = 0.44; torso.add(scarf);
  // 背包＋掛著的小提燈
  const bp = box(0.22, 0.26, 0.12, leather, 0, 0.26, -0.17, torso); box(0.18, 0.08, 0.04, "#6a4a30", 0, 0.34, -0.24, torso); cyl(0.04, 0.04, 0.16, "#8a7a68", 0.08, 0.42, -0.2, torso, 10).rotation.z = Math.PI / 2;
  const lan = new THREE.Group(); lan.position.set(-0.15, 0.12, -0.18); torso.add(lan); box(0.05, 0.08, 0.05, "#2a2a30", 0, 0, 0, lan); const lg = cyl(0.02, 0.02, 0.05, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.5, 0.6) }), 0, 0, 0, lan, 6); cyl(0.004, 0.004, 0.06, "#2a2a30", 0, 0.07, 0, lan, 4);
  armsOf(c, 0.18, 0.42, 0.048, 0.3, shirt, skin, 0.052);
  c.arms.forEach((p) => { cyl(0.052, 0.05, 0.12, leather, 0, -0.26, 0, p, 10); });
  const head = new THREE.Group(); head.position.y = 0.66; torso.add(head); c.head = head;
  sph(0.18, skin, 0, 0, 0, head, 28, 20);
  c.eyes.push(eye(head, -0.065, -0.005, 0.165, 0.06, 0.06, "#4a7a3a"), eye(head, 0.065, -0.005, 0.165, 0.06, 0.06, "#4a7a3a"));
  [-0.065, 0.065].forEach((x) => { const br = box(0.06, 0.012, 0.01, hairC, x, 0.065, 0.17, head); br.rotation.z = -Math.sign(x) * 0.2; });
  cyl(0.01, 0.022, 0.05, skin, 0, -0.05, 0.175, head, 6).rotation.x = 0.4;
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 6, 12, Math.PI), mat("#9a5a4a")); mouth.rotation.z = Math.PI; mouth.position.set(0, -0.09, 0.172); head.add(mouth);
  // 鬍渣
  const stub = sph(0.12, mat("#c8a890"), 0, -0.1, 0.06, head, 16, 10); stub.scale.set(1.1, 0.6, 0.95); stub.visible = false;
  hairShell(head, hairC, 0.19, 0.02, 0.5, 0.65, 1.04, 1.02, 1.02);
  // 報童帽＋護目鏡
  const hat = new THREE.Group(); hat.position.set(0, 0.1, 0); hat.rotation.x = -0.1; head.add(hat);
  const crown = sph(0.215, "#4a3a30", 0, 0.03, -0.02, hat, 24, 14); crown.scale.set(1.05, 0.6, 1.05); cyl(0.14, 0.14, 0.02, "#3a2a22", 0, 0.03, 0.2, hat, 20).scale.z = 0.8;
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.018, 8, 28), mat("#2a2020")); strap.rotation.x = Math.PI / 2; strap.position.y = 0.02; hat.add(strap);
  [-0.07, 0.07].forEach((x) => { const gg = cyl(0.05, 0.05, 0.035, brass, x, 0.04, 0.2, hat, 16); gg.rotation.x = Math.PI / 2; const lens = cyl(0.035, 0.035, 0.04, mat("#7ac0d0", { metalness: 0.3, roughness: 0.1, transparent: true, opacity: 0.8 }), x, 0.04, 0.205, hat, 16); lens.rotation.x = Math.PI / 2; });
  outline(c.root, 0.012);
  return c;
}

/* 奇幻魔女 */
export function makeWitch(look) {
  look = look || {}; const c = base(0.7), { hips, torso } = c;
  const skin = "#f6dcc8", hairC = "#e8c070", dress = "#3a2a5a", cloak = "#5a2a3a", trimC = mat("#d8b050", { metalness: 0.5, roughness: 0.4 });
  // 長裙：上窄下寬，裙擺一圈褶
  const gown = cyl(0.15, 0.3, 0.62, dress, 0, -0.3, 0, hips, 20); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const f = box(0.08, 0.3, 0.015, dress, Math.sin(a) * 0.27, -0.46, Math.cos(a) * 0.27, hips); f.rotation.y = a; f.rotation.x = 0.12; }
  const hem = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 6, 28), trimC); hem.rotation.x = Math.PI / 2; hem.position.y = -0.6; hips.add(hem);
  [-0.07, 0.07].forEach((x) => { const p = new THREE.Group(); p.position.set(x, 0, 0); hips.add(p); const s = sph(0.055, "#2a2026", 0, -0.62, 0.08, p, 12, 8); s.scale.set(1, 0.5, 1.5); c.legs.push(p); });
  const body = cap(0.13, 0.26, dress, torso); body.position.y = 0.25; body.scale.set(1, 1, 0.78);
  box(0.26, 0.05, 0.22, "#2a2026", 0, 0.08, 0, torso); box(0.05, 0.05, 0.012, trimC, 0, 0.08, 0.11, torso);
  box(0.09, 0.1, 0.06, "#8a5a30", 0.14, 0.03, 0.06, torso); // 腰包
  // 披風：背後一大片，肩上扣環
  const cp = box(0.44, 0.62, 0.02, cloak, 0, 0.1, -0.14, torso); cp.rotation.x = 0.1; const col = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 8, 20), mat(cloak)); col.rotation.x = Math.PI / 2; col.position.y = 0.44; torso.add(col); sph(0.025, trimC, 0, 0.42, 0.14, torso, 8, 6);
  cyl(0.04, 0.045, 0.07, skin, 0, 0.46, 0, torso, 10);
  armsOf(c, 0.165, 0.41, 0.045, 0.3, dress, skin, 0.048);
  c.arms.forEach((p, i) => { const cuff = cyl(0.07, 0.05, 0.1, dress, 0, -0.28, 0, p, 12); });
  // 法杖（右手）
  const staff = new THREE.Group(); staff.position.set(0, -0.36, 0.04); c.arms[1].add(staff); cyl(0.012, 0.015, 1.1, "#6a4a2a", 0, 0.2, 0, staff, 8); const orb = sph(0.05, new THREE.MeshStandardMaterial({ color: "#8ad0ff", emissive: "#4aa0ff", emissiveIntensity: 1.2, roughness: 0.2 }), 0, 0.78, 0, staff, 14, 10); [0, 1, 2].forEach((k) => { const cl = cyl(0.006, 0.01, 0.1, "#6a4a2a", Math.sin(k * 2.1) * 0.04, 0.74, Math.cos(k * 2.1) * 0.04, staff, 5); cl.rotation.z = Math.sin(k * 2.1) * 0.5; cl.rotation.x = -Math.cos(k * 2.1) * 0.5; });
  const head = new THREE.Group(); head.position.y = 0.64; torso.add(head); c.head = head;
  const hs = sph(0.18, skin, 0, 0, 0, head, 28, 20); hs.scale.set(1, 1.05, 0.95);
  c.eyes.push(eye(head, -0.068, -0.01, 0.165, 0.07, 0.08, "#8a4ab0"), eye(head, 0.068, -0.01, 0.165, 0.07, 0.08, "#8a4ab0"));
  [-0.068, 0.068].forEach((x) => { const br = box(0.06, 0.01, 0.008, "#a08040", x, 0.07, 0.17, head); br.rotation.z = -Math.sign(x) * 0.15; });
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 12, Math.PI), mat("#b05060")); mouth.rotation.z = Math.PI; mouth.position.set(0, -0.085, 0.172); head.add(mouth);
  [-0.11, 0.11].forEach((x) => { const b = new THREE.Mesh(new THREE.CircleGeometry(0.03, 12), new THREE.MeshBasicMaterial({ color: 0xf7a0b0, transparent: true, opacity: 0.45 })); b.position.set(x, -0.05, 0.15); b.rotation.y = x * 2.4; head.add(b); });
  hairShell(head, hairC, 0.195, 0.02, 0.5, 0.9, 1.04, 1.04, 1.02);
  [[-0.1, 0.25], [0.0, 0.0], [0.09, -0.3]].forEach(([x, rz]) => strand(head, hairC, x, 0.06, 0.15, 0.1, 0.028, 0.2, rz));
  [-1, 1].forEach((sd) => { for (let k = 0; k < 3; k++) strand(head, hairC, sd * (0.14 + k * 0.03), -0.25 - k * 0.04, -0.08 + k * 0.05, 0.42, 0.035, 0.05, sd * (0.05 + k * 0.06)); });
  // 尖帽：寬簷＋彎曲帽尖
  const hat = new THREE.Group(); hat.position.set(0, 0.12, -0.02); hat.rotation.x = -0.15; head.add(hat);
  cyl(0.36, 0.36, 0.025, dress, 0, 0, 0, hat, 28); const hb = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.015, 6, 28), trimC); hb.rotation.x = Math.PI / 2; hat.add(hb);
  cyl(0.14, 0.2, 0.25, dress, 0, 0.13, 0, hat, 18); cyl(0.21, 0.21, 0.05, "#8a2a3a", 0, 0.04, 0, hat, 18); sph(0.02, trimC, 0, 0.04, 0.2, hat, 6, 4);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.38, 18), mat(dress)); tip.position.set(0.03, 0.43, 0.0); tip.rotation.z = -0.3; tip.castShadow = true; hat.add(tip);
  const tip2 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 12), mat(dress)); tip2.position.set(0.14, 0.62, 0.0); tip2.rotation.z = -0.9; hat.add(tip2);
  outline(c.root, 0.013);
  return c;
}

/* 皮克斯風 */
export function makePixar(look) {
  look = look || {}; const c = base(0.56), { hips, torso } = c;
  const skin = "#f4cfb2", hairC = "#2a1a12", cardigan = "#c9a24a", tee = "#f3efe6", jeans = "#4a6a9a", shoe = "#f8f6f0";
  legsOf(c, 0.085, 0.07, 0.3, jeans, shoe, (p, y, sd) => { const s = sph(0.085, shoe, 0, y - 0.005, 0.03, p, 14, 10); s.scale.set(1, 0.6, 1.5); const sole = sph(0.087, "#c84a3a", 0, y - 0.03, 0.03, p, 14, 10); sole.scale.set(1, 0.3, 1.5); box(0.06, 0.02, 0.08, "#c84a3a", 0, y + 0.03, 0.1, p); });
  const body = cap(0.2, 0.2, tee, torso); body.position.y = 0.22; body.scale.set(1, 1, 0.78);
  const cd = cyl(0.21, 0.2, 0.24, cardigan, 0, 0.22, 0, torso, 20); cd.scale.z = 0.8; box(0.1, 0.26, 0.012, tee, 0, 0.23, 0.165, torso);
  [0.3, 0.22, 0.14].forEach((y) => sph(0.012, "#6a4a2a", -0.06, y, 0.17, torso, 6, 4));
  cyl(0.055, 0.06, 0.07, skin, 0, 0.42, 0, torso, 12);
  armsOf(c, 0.23, 0.36, 0.06, 0.26, cardigan, skin, 0.065);
  const head = new THREE.Group(); head.position.y = 0.64; torso.add(head); c.head = head;
  const hs = sph(0.27, skin, 0, 0, 0, head, 32, 24); hs.scale.set(1, 1.08, 0.98);
  const cheekL = sph(0.1, skin, -0.14, -0.1, 0.17, head, 16, 12), cheekR = sph(0.1, skin, 0.14, -0.1, 0.17, head, 16, 12); // 腮幫子
  c.eyes.push(eye(head, -0.1, 0.0, 0.245, 0.1, 0.11, "#4a8a5a"), eye(head, 0.1, 0.0, 0.245, 0.1, 0.11, "#4a8a5a"));
  [-0.1, 0.1].forEach((x) => { const br = box(0.09, 0.02, 0.012, hairC, x, 0.1, 0.25, head); br.rotation.z = -Math.sign(x) * 0.25; });
  const nose = sph(0.035, skin, 0, -0.06, 0.26, head, 12, 8);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.01, 6, 14, Math.PI), mat("#b05a5a")); mouth.rotation.z = Math.PI; mouth.position.set(0, -0.12, 0.245); head.add(mouth);
  [-0.18, 0.18].forEach((x) => { const b = new THREE.Mesh(new THREE.CircleGeometry(0.045, 12), new THREE.MeshBasicMaterial({ color: 0xf7a0a0, transparent: true, opacity: 0.4 })); b.position.set(x, -0.07, 0.21); b.rotation.y = x * 2.0; head.add(b); });
  [-0.26, 0.26].forEach((x) => { const e = sph(0.05, skin, x, -0.02, 0, head, 10, 8); e.scale.set(0.5, 1, 0.8); });
  hairShell(head, hairC, 0.285, 0.03, 0.48, 0.6, 1.02, 1.0, 1.0);
  // 蓬鬆捲髮
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; sph(0.075, hairC, Math.cos(a) * 0.25, 0.14 + Math.sin(i * 1.3) * 0.05, Math.sin(a) * 0.24 - 0.02, head, 10, 8); }
  for (let i = 0; i < 7; i++) sph(0.085, hairC, -0.2 + i * 0.066, 0.26 + (i % 2) * 0.03, -0.02 + (i % 3) * 0.05, head, 10, 8);
  // 眼鏡
  [-0.1, 0.1].forEach((x) => { const gl = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.009, 6, 20), mat("#3a2a2a")); gl.position.set(x, 0, 0.26); head.add(gl); }); box(0.05, 0.01, 0.01, "#3a2a2a", 0, 0, 0.265, head);
  outline(c.root, 0.012);
  return c;
}

/* 和風浪人 */
export function makeKimono(look) {
  look = look || {}; const c = base(0.72), { hips, torso } = c;
  const skin = "#f0d0b0", hairC = "#1a1414", kimono = "#3a4a6a", haori = "#6a2a2a", obi = "#d8b050";
  // 和服下擺：長筒，前面開衩
  cyl(0.15, 0.2, 0.6, kimono, 0, -0.28, 0, hips, 18); box(0.02, 0.55, 0.04, "#2a3a5a", 0, -0.3, 0.17, hips);
  [-0.07, 0.07].forEach((x) => { const p = new THREE.Group(); p.position.set(x, 0, 0); hips.add(p); cyl(0.04, 0.04, 0.2, "#f3efe6", 0, -0.5, 0.03, p, 8); const s = box(0.09, 0.03, 0.17, "#c8a870", 0, -0.61, 0.05, p); box(0.01, 0.04, 0.03, "#2a2020", 0, -0.58, 0.1, p); c.legs.push(p); });
  const body = cap(0.14, 0.26, kimono, torso); body.position.y = 0.25; body.scale.set(1, 1, 0.78);
  // 交叉衣襟
  [-1, 1].forEach((sd) => { const lap = box(0.1, 0.32, 0.015, "#f3efe6", sd * 0.04, 0.3, 0.11, torso); lap.rotation.z = sd * 0.45; });
  box(0.3, 0.1, 0.24, obi, 0, 0.1, 0, torso); box(0.12, 0.12, 0.08, obi, 0, 0.1, -0.14, torso); box(0.08, 0.02, 0.1, "#8a2a2a", 0, 0.1, 0.12, torso);
  // 羽織：寬袖外套
  const hr = cyl(0.165, 0.17, 0.28, haori, 0, 0.26, 0, torso, 18); hr.scale.z = 0.82; box(0.06, 0.28, 0.012, "#2a1a1a", 0, 0.26, 0.137, torso);
  cyl(0.045, 0.05, 0.07, skin, 0, 0.46, 0, torso, 10);
  armsOf(c, 0.17, 0.42, 0.045, 0.3, haori, skin, 0.05);
  c.arms.forEach((p) => { const sleeve = box(0.1, 0.26, 0.12, haori, 0, -0.16, 0, p); });
  // 刀：掛在左腰
  const sw = new THREE.Group(); sw.position.set(-0.14, 0.08, 0.02); sw.rotation.z = 0.25; sw.rotation.x = 0.25; torso.add(sw); cyl(0.02, 0.02, 0.6, "#1a1a22", 0, -0.2, 0, sw, 10); box(0.05, 0.015, 0.05, obi, 0, 0.12, 0, sw); cyl(0.015, 0.015, 0.16, "#3a2a5a", 0, 0.2, 0, sw, 8);
  const head = new THREE.Group(); head.position.y = 0.64; torso.add(head); c.head = head;
  const hs = sph(0.18, skin, 0, 0, 0, head, 28, 20); hs.scale.set(1, 1.08, 0.96);
  c.eyes.push(eye(head, -0.065, -0.005, 0.165, 0.06, 0.05, "#3a2a22"), eye(head, 0.065, -0.005, 0.165, 0.06, 0.05, "#3a2a22"));
  [-0.065, 0.065].forEach((x) => { const br = box(0.065, 0.012, 0.01, hairC, x, 0.065, 0.17, head); br.rotation.z = Math.sign(x) * 0.2; });
  cyl(0.01, 0.02, 0.05, skin, 0, -0.05, 0.175, head, 6).rotation.x = 0.4;
  box(0.04, 0.006, 0.006, "#8a4a3a", 0, -0.095, 0.172, head);
  // 疤
  box(0.004, 0.08, 0.004, "#c08a80", 0.09, 0.02, 0.165, head).rotation.z = 0.3;
  hairShell(head, hairC, 0.19, 0.02, 0.5, 0.7, 1.04, 1.02, 1.02);
  // 髮髻＋束帶
  const bun = cap(0.035, 0.12, hairC, head); bun.position.set(0, 0.22, -0.08); bun.rotation.x = 0.9; cyl(0.045, 0.045, 0.03, "#f3efe6", 0, 0.18, -0.03, head, 10);
  [[-0.1, 0.25], [0.08, -0.3]].forEach(([x, rz]) => strand(head, hairC, x, 0.06, 0.15, 0.09, 0.028, 0.2, rz));
  // 斗笠
  if (look.hat !== false) { const kasa = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.17, 24), mat("#c8a870")); kasa.position.set(0, 0.25, -0.02); kasa.castShadow = true; head.add(kasa); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const rb = box(0.006, 0.17, 0.006, "#8a6a40", Math.cos(a) * 0.2, 0.25, Math.sin(a) * 0.2 - 0.02, head); rb.rotation.z = Math.cos(a) * 1.1; rb.rotation.x = -Math.sin(a) * 1.1; } }
  outline(c.root, 0.012);
  return c;
}

/* 發條機器人 */
export function makeRobot(look) {
  look = look || {}; const c = base(0.62), { hips, torso } = c;
  const plate = mat("#8a9aa8", { metalness: 0.7, roughness: 0.35 }), dark = mat("#3a424c", { metalness: 0.6, roughness: 0.5 }), brass = mat("#c9a24a", { metalness: 0.8, roughness: 0.3 }), glow = new THREE.MeshStandardMaterial({ color: "#8ae0ff", emissive: "#4ac8ff", emissiveIntensity: 1.6, roughness: 0.2 });
  [-0.1, 0.1].forEach((x) => { const p = new THREE.Group(); p.position.set(x, 0, 0); hips.add(p); sph(0.06, brass, 0, 0, 0, p, 12, 8); cyl(0.045, 0.05, 0.22, dark, 0, -0.14, 0, p, 10); sph(0.05, brass, 0, -0.27, 0, p, 10, 8); cyl(0.05, 0.06, 0.14, plate, 0, -0.36, 0, p, 10); const ft = box(0.13, 0.05, 0.2, plate, 0, -0.45, 0.03, p); c.legs.push(p); });
  box(0.3, 0.08, 0.22, dark, 0, 0.0, 0, torso);
  const chest = cyl(0.2, 0.17, 0.3, plate, 0, 0.22, 0, torso, 18); chest.scale.z = 0.8;
  // 胸口發條錶盤＋螺絲
  const dial = cyl(0.07, 0.07, 0.02, brass, 0, 0.24, 0.15, torso, 20); dial.rotation.x = Math.PI / 2; const dg = cyl(0.05, 0.05, 0.022, glow, 0, 0.24, 0.152, torso, 20); dg.rotation.x = Math.PI / 2; box(0.01, 0.04, 0.025, dark, 0, 0.25, 0.155, torso);
  [[-0.14, 0.34], [0.14, 0.34], [-0.14, 0.1], [0.14, 0.1]].forEach(([x, y]) => sph(0.015, dark, x, y, 0.14, torso, 6, 4));
  const key = new THREE.Group(); key.position.set(0, 0.26, -0.18); torso.add(key); cyl(0.02, 0.02, 0.1, brass, 0, 0, 0, key, 8).rotation.x = Math.PI / 2; const kb = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 16), brass); kb.position.z = -0.08; kb.rotation.y = Math.PI / 2; key.add(kb); box(0.12, 0.03, 0.02, brass, 0, 0, -0.09, key);
  c.key = key;
  cyl(0.05, 0.05, 0.08, dark, 0, 0.42, 0, torso, 10);
  [-1, 1].forEach((s) => { const p = new THREE.Group(); p.position.set(0.23 * s, 0.38, 0); torso.add(p); sph(0.065, brass, 0, 0, 0, p, 12, 8); cyl(0.04, 0.045, 0.2, dark, 0, -0.13, 0, p, 10); sph(0.045, brass, 0, -0.25, 0, p, 10, 8); cyl(0.045, 0.05, 0.1, plate, 0, -0.32, 0, p, 10); [-1, 1].forEach((f) => box(0.025, 0.08, 0.03, plate, f * 0.025, -0.41, 0, p)); p.rotation.z = 0.1 * s; c.arms.push(p); });
  const head = new THREE.Group(); head.position.y = 0.62; torso.add(head); c.head = head;
  const hd = box(0.36, 0.3, 0.3, plate, 0, 0.02, 0, head); const face = box(0.3, 0.2, 0.02, dark, 0, 0.0, 0.15, head);
  [-0.08, 0.08].forEach((x) => { const e = cyl(0.045, 0.045, 0.03, glow, x, 0.02, 0.165, head, 16); e.rotation.x = Math.PI / 2; c.eyes.push(e); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.008, 6, 16), brass); rim.position.set(x, 0.02, 0.17); head.add(rim); });
  for (let i = 0; i < 5; i++) box(0.02, 0.02, 0.01, glow, -0.06 + i * 0.03, -0.07, 0.165, head);
  [-0.19, 0.19].forEach((x) => { const ear = cyl(0.05, 0.05, 0.04, brass, x, 0.02, 0, head, 12); ear.rotation.z = Math.PI / 2; });
  box(0.38, 0.03, 0.32, dark, 0, 0.17, 0, head); // 頭頂板
  cyl(0.01, 0.01, 0.2, dark, 0.1, 0.28, -0.05, head, 6); sph(0.03, glow, 0.1, 0.39, -0.05, head, 10, 8); // 天線
  [[-0.12, 0.1], [0.12, 0.1], [-0.12, -0.1], [0.12, -0.1]].forEach(([x, y]) => sph(0.012, dark, x, y, 0.155, head, 6, 4));
  return c; // 金屬材質不描邊
}

export const STYLES2 = { anime: makeAnime, steam: makeSteam, witch: makeWitch, pixar: makePixar, kimono: makeKimono, robot: makeRobot };
