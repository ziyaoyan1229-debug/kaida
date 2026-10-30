/* 人物風格樣板：同一套骨架（root / hips / torso / head / legs / arms），不同畫風
   每個 make 回傳的物件和 chars.js 的 makeChar 一樣，animWalk 可以直接用；hipY 是臀部離地高度（身高不同）
   - gothic : 第五人格風格——拉長的細手腳、蒼白大臉、深眼窩、禮帽長外套、縫線
   - ghibli : 吉卜力／寫實比例——六頭身、柔和色、簡單五官
   - lowpoly: 低多邊形——切面感、不描邊、顏色飽和
   - voxel  : 方塊人——全部是方塊、像素臉
   - paper  : 紙片人——薄片＋手繪臉，像紙娃娃 */
import { THREE, mat, box, cyl, sph, cap, outline } from "./chars.js";

const F = (c) => mat(c, { flatShading: true, roughness: 0.9 });
function ico(r, m, x, y, z, parent, det) { const o = new THREE.Mesh(new THREE.IcosahedronGeometry(r, det == null ? 1 : det), typeof m === "string" ? F(m) : m); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; }
function canvasTex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t; }
function base(hipY) {
  const root = new THREE.Group();
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.3, 20), new THREE.MeshBasicMaterial({ color: 0x3a2a1a, transparent: true, opacity: 0.18, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01; root.add(shadow);
  const hips = new THREE.Group(); hips.position.y = hipY; root.add(hips);
  const torso = new THREE.Group(); hips.add(torso);
  const dummy = () => { const g = new THREE.Group(); g.visible = false; return g; };
  return { root, hips, torso, legs: [], arms: [], eyes: [], cat: null, book: dummy(), cup: dummy(), cookie: dummy(), hipY };
}

/* 第五人格風格 */
export function makeGothic(look) {
  look = look || {}; const c = base(0.86), { hips, torso } = c;
  const coat = look.coat || "#3a3340", skin = "#e9dfd6", glove = "#221c24", trim = look.trim || "#7a2a34", hairC = look.hair || "#1a1518";
  // 腿：細長，靴子
  [-0.09, 0.09].forEach((x) => { const p = new THREE.Group(); p.position.set(x, 0, 0); hips.add(p); const l = cap(0.045, 0.52, "#2a2630", p); l.position.y = -0.3; const bt = cap(0.055, 0.14, glove, p); bt.position.y = -0.7; const toe = box(0.1, 0.07, 0.17, glove, 0, -0.82, 0.05, p); toe.castShadow = true; c.legs.push(p); });
  // 軀幹：窄肩長外套，下擺開衩成兩片燕尾
  const body = cyl(0.13, 0.11, 0.56, coat, 0, 0.28, 0, torso, 14); body.scale.z = 0.8;
  cyl(0.15, 0.13, 0.06, coat, 0, 0.56, 0, torso, 14).scale.z = 0.8;
  [-1, 1].forEach((sd) => { const tail = box(0.11, 0.42, 0.02, coat, sd * 0.07, -0.2, -0.09, torso); tail.rotation.x = -0.08; tail.rotation.z = sd * 0.05; });
  [-1, 1].forEach((sd) => { const lap = box(0.05, 0.3, 0.015, trim, sd * 0.045, 0.4, 0.105, torso); lap.rotation.z = sd * 0.2; });
  [0.44, 0.36, 0.28, 0.2].forEach((y) => sph(0.012, mat("#b89a5a", { metalness: 0.6, roughness: 0.35 }), 0, y, 0.11, torso, 6, 4));
  box(0.26, 0.04, 0.2, "#1f1a20", 0, 0.08, 0, torso); sph(0.02, mat("#b89a5a", { metalness: 0.6, roughness: 0.35 }), 0, 0.08, 0.1, torso, 6, 4);
  cyl(0.045, 0.05, 0.08, skin, 0, 0.62, 0, torso, 10); // 脖子
  // 手臂：細長，手套
  [-1, 1].forEach((s) => { const p = new THREE.Group(); p.position.set(0.16 * s, 0.54, 0); torso.add(p); const a = cap(0.035, 0.4, coat, p); a.position.y = -0.24; const h = sph(0.045, glove, 0, -0.5, 0, p, 10, 8); h.scale.set(0.8, 1.2, 0.9); p.rotation.z = 0.1 * s; c.arms.push(p); });
  // 頭：偏大、略長的蒼白臉，深眼窩
  const head = new THREE.Group(); head.position.y = 0.9; torso.add(head); c.head = head;
  const hs = sph(0.22, skin, 0, 0, 0, head, 26, 18); hs.scale.set(1, 1.15, 0.98);
  // 臉：眼睛用高解析貼圖（厚眼線、淡紫虹膜、小瞳孔、眼下陰影一起畫），不再用球疊球，輪廓才清楚
  const eyeTex = (flip) => canvasTex(256, 256, (g) => {
    g.clearRect(0, 0, 256, 256);
    const sh = g.createRadialGradient(128, 150, 40, 128, 150, 128); sh.addColorStop(0, "rgba(70,50,70,.55)"); sh.addColorStop(0.6, "rgba(70,50,70,.25)"); sh.addColorStop(1, "rgba(70,50,70,0)"); g.fillStyle = sh; g.fillRect(0, 0, 256, 256);
    g.fillStyle = "#f4f0f2"; g.beginPath(); g.moveTo(30, 128); g.quadraticCurveTo(128, 30, 226, 128); g.quadraticCurveTo(128, 200, 30, 128); g.fill();
    const ir = g.createRadialGradient(128, 128, 6, 128, 128, 52); ir.addColorStop(0, "#2a2030"); ir.addColorStop(0.3, "#9a8ab8"); ir.addColorStop(0.85, "#5a4a74"); ir.addColorStop(1, "#2a2030"); g.fillStyle = ir; g.beginPath(); g.arc(128, 130, 52, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#100c12"; g.beginPath(); g.arc(128, 132, 18, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(108, 108, 12, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(150, 150, 5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#1a1218"; g.lineWidth = 18; g.lineCap = "round"; g.beginPath(); g.moveTo(24, 130); g.quadraticCurveTo(128, 22, 232, 126); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.moveTo(40, 136); g.quadraticCurveTo(128, 204, 220, 134); g.stroke();
    for (let k = 0; k < 3; k++) { const x = (flip ? 48 : 208) + (flip ? 1 : -1) * k * 22, y = 60 + k * 14; g.lineWidth = 7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (flip ? -16 : 16), y - 22); g.stroke(); }
  });
  [-0.085, 0.085].forEach((x) => { const e = new THREE.Mesh(new THREE.PlaneGeometry(0.125, 0.115), new THREE.MeshStandardMaterial({ map: eyeTex(x < 0), transparent: true, roughness: 0.3 })); e.position.set(x, 0.0, 0.207); e.rotation.y = x * 1.1; e.rotation.x = -0.05; e.castShadow = false; e.userData.noOutline = true; head.add(e); c.eyes.push(e); });
  [-0.085, 0.085].forEach((x) => { const br = box(0.085, 0.014, 0.012, "#1a1218", x, 0.095, 0.2, head); br.rotation.z = Math.sign(x) * 0.4; br.rotation.y = x * 1.0; });
  const nose = sph(0.02, mat("#ddd0c8"), 0, -0.055, 0.205, head, 12, 10); nose.scale.set(0.8, 1.7, 0.9); nose.userData.noOutline = true; const ntip = sph(0.02, mat("#d6c6be"), 0, -0.095, 0.215, head, 10, 8); ntip.userData.noOutline = true;
  // 嘴和臉頰縫線都畫在貼圖上貼到臉上，線條才銳利
  const mouthTex = canvasTex(256, 128, (g) => { g.clearRect(0, 0, 256, 128); g.strokeStyle = "#2a1a22"; g.lineCap = "round"; g.lineWidth = 9; g.beginPath(); g.moveTo(60, 64); g.quadraticCurveTo(128, 72, 196, 62); g.stroke(); g.lineWidth = 6; [150, 172, 194].forEach((x) => { g.beginPath(); g.moveTo(x, 48); g.lineTo(x + 6, 82); g.stroke(); }); });
  const mouthP = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.065), new THREE.MeshStandardMaterial({ map: mouthTex, transparent: true, roughness: 0.6 })); mouthP.position.set(0, -0.135, 0.212); mouthP.rotation.x = -0.15; mouthP.castShadow = false; mouthP.userData.noOutline = true; head.add(mouthP);
  const stitchTex = canvasTex(128, 256, (g) => { g.clearRect(0, 0, 128, 256); g.strokeStyle = "#2a1a22"; g.lineCap = "round"; g.lineWidth = 7; g.beginPath(); g.moveTo(44, 30); g.lineTo(84, 226); g.stroke(); g.lineWidth = 6; for (let k = 0; k < 5; k++) { const t = 50 + k * 40, x = 44 + (t - 30) / 196 * 40; g.beginPath(); g.moveTo(x - 22, t + 4); g.lineTo(x + 22, t - 4); g.stroke(); } g.strokeStyle = "rgba(120,60,80,.35)"; g.lineWidth = 16; g.beginPath(); g.moveTo(44, 30); g.lineTo(84, 226); g.stroke(); });
  const stitchP = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.14), new THREE.MeshStandardMaterial({ map: stitchTex, transparent: true, roughness: 0.6 })); stitchP.position.set(0.155, -0.04, 0.155); stitchP.rotation.y = 0.75; stitchP.castShadow = false; stitchP.userData.noOutline = true; head.add(stitchP);
  [-0.17, 0.17].forEach((x) => { const b = new THREE.Mesh(new THREE.CircleGeometry(0.045, 14), new THREE.MeshBasicMaterial({ color: 0x8a5a70, transparent: true, opacity: 0.22 })); b.position.set(x, -0.07, 0.19); b.rotation.y = x * 2.4; head.add(b); });
  // 頭髮：貼頭、側分，幾綹垂到額前
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.235, 26, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(hairC)); hairCap.position.y = 0.04; hairCap.scale.set(1.02, 1.1, 1.0); hairCap.rotation.x = -0.25; hairCap.castShadow = true; head.add(hairCap);
  const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.232, 26, 14, Math.PI, Math.PI, 0, Math.PI * 0.7), mat(hairC)); hairBack.position.y = 0.04; hairBack.scale.set(1.02, 1.1, 1.0); head.add(hairBack);
  [[-0.11, 0.0, 0.3], [-0.04, 0.02, 0.12], [0.05, 0.01, -0.15], [0.12, -0.01, -0.3]].forEach(([x, y, rz]) => { const lk = cap(0.018, 0.1, hairC, head); lk.position.set(x, 0.12 + y, 0.16); lk.rotation.z = rz; lk.rotation.x = 1.0; lk.scale.z = 0.5; lk.userData.noOutline = true; });
  // 禮帽
  if (look.hat !== false) { const hat = new THREE.Group(); hat.position.set(0, 0.2, -0.02); hat.rotation.x = -0.12; head.add(hat); cyl(0.3, 0.3, 0.025, "#1f1a22", 0, 0, 0, hat, 28); cyl(0.19, 0.17, 0.34, "#1f1a22", 0, 0.17, 0, hat, 24); cyl(0.195, 0.195, 0.06, trim, 0, 0.05, 0, hat, 24); cyl(0.19, 0.19, 0.02, "#1f1a22", 0, 0.34, 0, hat, 24); }
  // 脖子上的圍巾／領結
  const rib = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.025, 8, 18), mat(trim)); rib.rotation.x = Math.PI / 2; rib.position.y = 0.6; torso.add(rib);
  outline(c.root, 0.016);
  return c;
}

/* 吉卜力／寫實比例 */
export function makeGhibli(look) {
  look = look || {}; const c = base(0.78), { hips, torso } = c;
  const skin = look.skin || "#f3d9c4", hairC = look.hair || "#5a3a28", shirt = look.shirt || "#e8dfcf", pants = look.pants || "#4f6f9a", girl = look.g === "girl";
  if (girl) { const sk = cyl(0.14, 0.2, 0.3, look.skirt || "#c8574a", 0, -0.12, 0, hips, 18); }
  [-0.075, 0.075].forEach((x) => { const p = new THREE.Group(); p.position.set(x, 0, 0); hips.add(p); const l = cap(0.055, 0.44, girl ? skin : pants, p); l.position.y = -0.28; const sh = sph(0.065, "#4a3a30", 0, -0.73, 0.03, p, 12, 8); sh.scale.set(1, 0.6, 1.5); c.legs.push(p); });
  const body = cap(0.14, 0.3, shirt, torso); body.position.y = 0.28; body.scale.set(1, 1, 0.75);
  cyl(0.15, 0.13, 0.06, shirt, 0, 0.1, 0, torso, 16).scale.z = 0.75;
  if (look.vest) { const v = cyl(0.148, 0.135, 0.3, look.vest, 0, 0.26, 0, torso, 16); v.scale.z = 0.78; }
  cyl(0.04, 0.045, 0.08, skin, 0, 0.52, 0, torso, 10);
  [-1, 1].forEach((s) => { const p = new THREE.Group(); p.position.set(0.17 * s, 0.46, 0); torso.add(p); const a = cap(0.045, 0.3, shirt, p); a.position.y = -0.19; const fa = cap(0.04, 0.1, skin, p); fa.position.y = -0.4; sph(0.05, skin, 0, -0.5, 0, p, 10, 8); p.rotation.z = 0.12 * s; c.arms.push(p); });
  const head = new THREE.Group(); head.position.y = 0.72; torso.add(head); c.head = head;
  const hs = sph(0.17, skin, 0, 0, 0, head, 26, 18); hs.scale.set(0.95, 1.05, 0.95);
  const eyeM = mat("#2f2622", { roughness: 0.3 });
  [-0.065, 0.065].forEach((x) => { const e = sph(0.025, eyeM, x, -0.01, 0.15, head, 10, 8); e.scale.set(0.8, 1.2, 0.5); const hl = sph(0.008, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.008, 0.01, 0.02, e, 6, 4); hl.castShadow = false; c.eyes.push(e); });
  [-0.065, 0.065].forEach((x) => { const br = box(0.06, 0.012, 0.01, hairC, x, 0.055, 0.155, head); br.rotation.z = -Math.sign(x) * 0.15; });
  [-0.11, 0.11].forEach((x) => { const b = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), new THREE.MeshBasicMaterial({ color: 0xf0a0a0, transparent: true, opacity: 0.45 })); b.position.set(x, -0.06, 0.135); b.rotation.y = x * 2.4; head.add(b); });
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 12, Math.PI), mat("#b05a5a")); mouth.rotation.z = Math.PI; mouth.position.set(0, -0.08, 0.155); head.add(mouth);
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.185, 26, 14, 0, Math.PI * 2, 0, Math.PI * (girl ? 0.55 : 0.5)), mat(hairC)); hairCap.position.y = 0.02; hairCap.rotation.x = -0.3; hairCap.scale.set(1.0, 1.05, 1.0); hairCap.castShadow = true; head.add(hairCap);
  const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.183, 26, 14, Math.PI, Math.PI, 0, Math.PI * (girl ? 0.85 : 0.65)), mat(hairC)); hairBack.position.y = 0.02; hairBack.scale.set(1.0, 1.05, 1.0); head.add(hairBack);
  const fringe = sph(0.07, hairC, 0.05, 0.1, 0.13, head, 12, 8); fringe.scale.set(1.5, 0.5, 0.8);
  if (girl) { [-1, 1].forEach((sd) => { const tl = cap(0.05, 0.3, hairC, head); tl.position.set(sd * 0.17, -0.15, -0.04); tl.rotation.z = sd * 0.1; }); }
  if (look.hat === "straw") { cyl(0.34, 0.34, 0.02, "#e6c27a", 0, 0.12, -0.01, head, 28); cyl(0.17, 0.2, 0.12, "#e6c27a", 0, 0.18, -0.01, head, 24); cyl(0.2, 0.2, 0.03, "#c2453b", 0, 0.14, -0.01, head, 24); }
  if (look.cap) { const cp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), mat(look.cap)); cp.position.y = 0.03; cp.rotation.x = -0.1; head.add(cp); const brim = cyl(0.13, 0.13, 0.02, look.cap, 0, 0.08, 0.2, head, 20); brim.scale.z = 0.8; brim.rotation.x = 0.15; }
  outline(c.root, 0.014);
  return c;
}

/* 低多邊形 */
export function makeLowPoly(look) {
  look = look || {}; const c = base(0.5), { hips, torso } = c;
  const skin = look.skin || "#f2c9a8", hairC = look.hair || "#3a2a20", shirt = look.shirt || "#ff7a4a", pants = look.pants || "#2f6fb0";
  [-0.08, 0.08].forEach((x) => { const p = new THREE.Group(); p.position.set(x, 0, 0); hips.add(p); const l = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.36, 6), F(pants)); l.position.y = -0.18; l.castShadow = true; p.add(l); const sh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.18), F("#3a2a20")); sh.position.set(0, -0.38, 0.03); sh.castShadow = true; p.add(sh); c.legs.push(p); });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.36, 7), F(shirt)); body.position.y = 0.2; body.castShadow = true; torso.add(body);
  [-1, 1].forEach((s) => { const p = new THREE.Group(); p.position.set(0.2 * s, 0.34, 0); torso.add(p); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.3, 6), F(shirt)); a.position.y = -0.14; a.castShadow = true; p.add(a); ico(0.055, skin, 0, -0.31, 0, p, 0); p.rotation.z = 0.15 * s; c.arms.push(p); });
  const head = new THREE.Group(); head.position.y = 0.62; torso.add(head); c.head = head;
  ico(0.27, skin, 0, 0, 0, head, 1);
  const hair = ico(0.29, hairC, 0, 0.06, -0.03, head, 1); hair.scale.set(1, 0.8, 1); hair.geometry = new THREE.IcosahedronGeometry(0.29, 1); hair.position.y = 0.07;
  [-0.09, 0.09].forEach((x) => { const e = new THREE.Mesh(new THREE.OctahedronGeometry(0.035), F("#1a1414")); e.position.set(x, 0.0, 0.245); e.scale.set(0.8, 1.2, 0.5); head.add(e); c.eyes.push(e); });
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.015, 0.02), F("#8a3a3a")); mouth.position.set(0, -0.1, 0.25); head.add(mouth);
  const nose = new THREE.Mesh(new THREE.TetrahedronGeometry(0.035), F(skin)); nose.position.set(0, -0.04, 0.26); nose.rotation.set(0.6, 0.8, 0); head.add(nose);
  if (look.hat !== false) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.26, 5), F(look.hat || "#3fb0a0")); h.position.y = 0.36; h.castShadow = true; head.add(h); }
  return c; // 刻意不描邊，保留切面感
}

/* 方塊人 */
export function makeVoxel(look) {
  look = look || {}; const c = base(0.56), { hips, torso } = c;
  const skin = look.skin || "#f0c8a0", hairC = look.hair || "#4a2a18", shirt = look.shirt || "#2fa05a", pants = look.pants || "#3a4a8a";
  const V = (col) => mat(col, { roughness: 1 });
  [-0.08, 0.08].forEach((x) => { const p = new THREE.Group(); p.position.set(x, 0, 0); hips.add(p); box(0.14, 0.44, 0.14, V(pants), 0, -0.22, 0, p); box(0.14, 0.1, 0.16, V("#2a2020"), 0, -0.49, 0.01, p); c.legs.push(p); });
  box(0.32, 0.4, 0.16, V(shirt), 0, 0.2, 0, torso);
  box(0.12, 0.08, 0.17, V("#f3efe6"), 0, 0.34, 0, torso); // 領口
  [-1, 1].forEach((s) => { const p = new THREE.Group(); p.position.set(0.23 * s, 0.38, 0); torso.add(p); box(0.13, 0.3, 0.13, V(shirt), 0, -0.14, 0, p); box(0.13, 0.1, 0.13, V(skin), 0, -0.34, 0, p); c.arms.push(p); });
  const head = new THREE.Group(); head.position.y = 0.66; torso.add(head); c.head = head;
  box(0.44, 0.44, 0.44, V(skin), 0, 0, 0, head);
  box(0.46, 0.14, 0.46, V(hairC), 0, 0.17, 0, head); box(0.46, 0.18, 0.1, V(hairC), 0, 0.02, -0.19, head); box(0.46, 0.1, 0.12, V(hairC), 0, 0.08, 0.18, head);
  [-0.1, 0.1].forEach((x) => { const w = box(0.1, 0.06, 0.02, V("#ffffff"), x, -0.01, 0.225, head); const e = box(0.05, 0.06, 0.021, V("#1a2a4a"), x + Math.sign(x) * 0.02, -0.01, 0.226, head); c.eyes.push(e); });
  box(0.12, 0.03, 0.02, V("#9a4a3a"), 0, -0.12, 0.225, head);
  box(0.06, 0.05, 0.03, V("#e0b088"), 0, -0.06, 0.23, head);
  if (look.hat) { box(0.5, 0.1, 0.5, V(look.hat), 0, 0.28, 0, head); box(0.36, 0.14, 0.36, V(look.hat), 0, 0.38, 0, head); }
  return c;
}

/* 紙片人 */
export function makePaper(look) {
  look = look || {}; const c = base(0.52), { hips, torso } = c;
  const skin = look.skin || "#ffe0c8", hairC = look.hair || "#2a2a3a", shirt = look.shirt || "#ffd84a", pants = look.pants || "#5a4ad0";
  const P = (w, h, col, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), mat(col, { roughness: 1 })); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  [-0.08, 0.08].forEach((x) => { const p = new THREE.Group(); p.position.set(x, 0, 0); hips.add(p); P(0.11, 0.4, pants, 0, -0.2, 0, p); P(0.15, 0.08, "#2a2a3a", 0.01, -0.44, 0.005, p); c.legs.push(p); });
  P(0.34, 0.4, shirt, 0, 0.2, 0, torso); P(0.1, 0.08, "#ffffff", 0, 0.35, 0.01, torso); [0.28, 0.2, 0.12].forEach((y) => P(0.03, 0.03, "#2a2a3a", 0, y, 0.02, torso));
  [-1, 1].forEach((s) => { const p = new THREE.Group(); p.position.set(0.21 * s, 0.36, 0); torso.add(p); P(0.09, 0.3, shirt, 0, -0.15, 0, p); P(0.1, 0.1, skin, 0, -0.35, 0, p); p.rotation.z = 0.2 * s; c.arms.push(p); });
  const head = new THREE.Group(); head.position.y = 0.72; torso.add(head); c.head = head;
  const tex = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = skin; g.beginPath(); g.arc(64, 68, 54, 0, Math.PI * 2); g.fill();
    g.fillStyle = hairC; g.beginPath(); g.arc(64, 54, 56, Math.PI, Math.PI * 2); g.fill(); g.fillRect(8, 50, 20, 30); g.fillRect(100, 50, 20, 30); g.beginPath(); g.moveTo(30, 60); g.lineTo(60, 44); g.lineTo(95, 62); g.lineTo(100, 50); g.lineTo(28, 50); g.fill();
    g.fillStyle = "#1a1a24"; g.beginPath(); g.ellipse(46, 72, 7, 11, 0, 0, Math.PI * 2); g.ellipse(82, 72, 7, 11, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(49, 68, 3, 0, Math.PI * 2); g.arc(85, 68, 3, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,120,130,.6)"; g.beginPath(); g.arc(34, 88, 8, 0, Math.PI * 2); g.arc(94, 88, 8, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#8a3a3a"; g.lineWidth = 3; g.beginPath(); g.arc(64, 90, 10, 0.2, Math.PI - 0.2); g.stroke();
    g.strokeStyle = "#1a1a24"; g.lineWidth = 4; g.beginPath(); g.arc(64, 68, 54, 0, Math.PI * 2); g.stroke();
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.56), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 1 })); face.castShadow = true; head.add(face); face.userData.noOutline = true;
  c.eyes.push(face);
  return c;
}

export const STYLES = { gothic: makeGothic, ghibli: makeGhibli, lowpoly: makeLowPoly, voxel: makeVoxel, paper: makePaper };
