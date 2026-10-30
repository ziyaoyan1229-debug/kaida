/* 漂流燈島：沿用番茄讀書會的 3D 小人與寵物（從 apps/pomodoro/scene3d.js 複製，改動時兩邊對照） */
import * as THREE from "three";

const SKINS = ["#f6d7bd", "#e9b994", "#c98e64", "#fbe6d4", "#d9a27a", "#a8704a", "#8a5532", "#5e3a24"];
const HAIRS = ["#3b2a20", "#7a4a2a", "#c58b4c", "#2c2c34", "#151515", "#e6c27a", "#b0302a", "#9a9aa0", "#f2efe8", "#e88aa8", "#5a7ad0", "#7a5ad0", "#4a8a6a"];
const TOPS = { "tee-blue": "#7fa6c9", "tee-pink": "#e7a6a8", stripe: "#f3efe6", hoodie: "#8fae7a", sweater: "#e0b04f", cardigan: "#e6d3b3", plaid: "#c8574a", sport: "#3f6f6a", overalls: "#f3efe6", denim: "#5d7fa8", turtle: "#3a3640", suit: "#2f3445", pjtop: "#b9c9e6" };
const PANTS = { jeans: { c: "#4f6f9a" }, khaki: { c: "#c9b48a" }, blackp: { c: "#2f2d33" }, shorts: { c: "#e6d3b3", short: true }, skirt: { c: "#c8574a", skirt: true }, suitp: { c: "#2f3445" }, trackp: { c: "#3f6f6a" }, pjp: { c: "#b9c9e6" } };
const mats = {};
let REMAP = null;
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


const OUTLINE_M = new THREE.MeshBasicMaterial({ color: 0x2a1d16, side: THREE.BackSide });
const tmpBox = new THREE.Box3(), tmpSize = new THREE.Vector3();
function outline(root, t) {
  const list = [];
  root.traverse((o) => { if (o.isMesh && !o.material.isMeshBasicMaterial && !o.material.transparent && !o.material.wireframe) list.push(o); });
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
function has(v, id) { return (" " + (v || "") + " ").indexOf(" " + id + " ") >= 0; }
function makeChar(look) {
  look = look || {};
  const skin = SKINS[look.skin] || SKINS[0], hair = HAIRS[look.hair] || HAIRS[0];
  const top = TOPS[look.top] || TOPS["tee-blue"], girl = look.g === "girl";
  const root = new THREE.Group();
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.28, 20), new THREE.MeshBasicMaterial({ color: 0x3a2a1a, transparent: true, opacity: 0.18, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01; root.add(shadow);
  const hips = new THREE.Group(); hips.position.y = 0.36; root.add(hips);
  const legs = [], pants = PANTS[look.legs], pcol = pants ? pants.c : "#5b5f7a";
  if (pants && pants.skirt) cyl(0.18, 0.25, 0.17, pcol, 0, -0.05, 0, hips, 16);
  [-0.085, 0.085].forEach((x) => {
    const p = new THREE.Group(); p.position.set(x, 0, 0); hips.add(p);
    const l = cap(0.07, 0.17, pants && (pants.short || pants.skirt) ? skin : pcol, p); l.position.y = -0.17;
    if (pants && pants.short) cyl(0.08, 0.08, 0.13, pcol, 0, -0.07, 0, p);
    const shoe = sph(0.085, "#4a3a30", 0, -0.33, 0.03, p); shoe.scale.set(1, 0.6, 1.3);
    legs.push(p);
  });
  const torso = new THREE.Group(); hips.add(torso);
  const body = cap(0.17, 0.16, top, torso); body.position.y = 0.2; body.scale.set(1, 1, 0.85);
  if (look.top === "stripe") [0.12, 0.2, 0.28].forEach((y) => { const s = cyl(0.172, 0.172, 0.035, "#5d7fa8", 0, y, 0, torso); s.scale.z = 0.85; });
  if (look.top === "hoodie") { const hd = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.045, 8, 20), mat("#7a9a66")); hd.rotation.x = Math.PI / 2; hd.position.set(0, 0.4, -0.04); torso.add(hd); }
  if (look.top === "sweater") { const hm = cyl(0.175, 0.175, 0.05, "#c99a3e", 0, 0.06, 0, torso); hm.scale.z = 0.85; }
  if (look.top === "suit") { box(0.09, 0.3, 0.02, "#f8f4ec", 0, 0.2, 0.15, torso); box(0.03, 0.16, 0.022, "#8a3a32", 0, 0.24, 0.16, torso); }
  if (look.top === "cardigan") { box(0.1, 0.3, 0.02, "#f8f4ec", 0, 0.2, 0.15, torso); [0.26, 0.18].forEach((y) => sph(0.012, "#a08a6a", -0.06, y, 0.155, torso, 6, 4)); }
  if (look.top === "plaid") { [0.1, 0.2, 0.3].forEach((y) => { const b2 = cyl(0.173, 0.173, 0.018, "#8a3a32", 0, y, 0, torso); b2.scale.z = 0.85; }); [-0.07, 0, 0.07].forEach((x) => box(0.016, 0.34, 0.02, "#8a3a32", x, 0.2, 0.142, torso)); }
  if (look.top === "sport") { box(0.012, 0.32, 0.02, "#f3efe6", 0, 0.2, 0.145, torso); }
  if (look.top === "overalls") { box(0.2, 0.16, 0.03, "#5d7fa8", 0, 0.14, 0.14, torso); const lw = cyl(0.172, 0.172, 0.12, "#5d7fa8", 0, 0.03, 0, torso); lw.scale.z = 0.85; [-0.07, 0.07].forEach((x) => { box(0.035, 0.22, 0.02, "#5d7fa8", x, 0.3, 0.13, torso); sph(0.015, "#e8b93a", x, 0.22, 0.15, torso, 6, 4); }); }
  if (look.top === "denim") { box(0.012, 0.32, 0.02, "#e8d6a8", 0, 0.2, 0.145, torso); [-0.08, 0.08].forEach((x) => box(0.06, 0.05, 0.02, "#4a6a90", x, 0.27, 0.145, torso)); }
  if (look.top === "turtle") cyl(0.12, 0.13, 0.09, "#2a2630", 0, 0.41, 0, torso, 16);
  if (has(look.back, "cape")) { const cp2 = box(0.36, 0.44, 0.025, "#b0302a", 0, 0.18, -0.16, torso); cp2.rotation.x = 0.12; }
  if (has(look.neck, "tie")) { box(0.05, 0.2, 0.02, "#3a5a8a", 0, 0.26, 0.15, torso); sph(0.03, "#3a5a8a", 0, 0.37, 0.15, torso, 8, 6); }
  if (has(look.back, "backpack")) { const bp = box(0.3, 0.32, 0.16, "#e0b04f", 0, 0.22, -0.2, torso); box(0.22, 0.12, 0.04, "#c99a3e", 0, 0.14, -0.29, torso); [-0.09, 0.09].forEach((x) => box(0.035, 0.3, 0.02, "#b98a30", x, 0.24, 0.135, torso)); bp.castShadow = true; }
  if (has(look.back, "wings")) { [-1, 1].forEach((sd) => { const w = sph(0.22, "#fffdf8", sd * 0.18, 0.3, -0.2, torso, 14, 10); w.scale.set(0.9, 0.55, 0.15); w.rotation.z = sd * -0.5; w.rotation.y = sd * 0.4; }); }
  if (has(look.neck, "bowtie")) [-1, 1].forEach((sd) => { const b3 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.09, 8), mat("#c2453b")); b3.rotation.z = sd * Math.PI / 2; b3.position.set(sd * 0.045, 0.37, 0.15); torso.add(b3); });
  if (has(look.neck, "pearls")) { for (let i = 0; i < 9; i++) { const a = Math.PI * (0.15 + i * 0.0875); sph(0.022, mat("#fffdf8", { roughness: 0.2 }), Math.cos(a) * 0.14, 0.35 - Math.sin(a) * 0.03, Math.sin(a) * 0.13, torso, 8, 6); } }
  if (has(look.neck, "scarf")) { const sc = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.055, 8, 20), mat("#c2453b")); sc.rotation.x = Math.PI / 2; sc.position.y = 0.4; torso.add(sc); box(0.08, 0.18, 0.04, "#c2453b", 0.07, 0.3, 0.14, torso); }
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
  if (has(look.face, "glasses")) [-0.1, 0.1].forEach((x) => { const gl = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.01, 6, 18), mat("#4a3a2c")); gl.position.set(x, -0.01, 0.3); head.add(gl); });
  if (has(look.face, "shades")) { [-0.1, 0.1].forEach((x) => { const sg = cyl(0.07, 0.07, 0.02, "#2a2620", x, -0.005, 0.3, head, 16); sg.rotation.x = Math.PI / 2; }); box(0.06, 0.015, 0.015, "#2a2620", 0, 0.01, 0.31, head); }
  if (has(look.face, "star")) { const st2 = cyl(0.04, 0.04, 0.01, "#e8b93a", 0.17, -0.06, 0.255, head, 5); st2.rotation.x = Math.PI / 2; st2.rotation.y = 0.3; }
  if (has(look.ears, "muffs")) { const band = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.022, 8, 24, Math.PI), mat("#c98e9a")); band.position.y = 0.02; head.add(band); [-0.33, 0.33].forEach((x) => sph(0.1, "#f2c4c8", x, 0, 0, head, 12, 10)); }
  if (look.hat === "cap") { const cp = new THREE.Mesh(new THREE.SphereGeometry(0.37, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), mat("#5d7fa8")); cp.position.y = 0.03; cp.rotation.x = -0.12; cp.scale.set(1.06, 1, 1.05); head.add(cp); const brim = cyl(0.22, 0.22, 0.025, "#4a6a90", 0, 0.12, 0.34, head, 20); brim.scale.z = 0.8; brim.rotation.x = 0.15; sph(0.025, "#4a6a90", 0, 0.4, 0, head, 6, 4); }
  if (look.hat === "bunnyband") { const band = new THREE.Mesh(new THREE.TorusGeometry(0.325, 0.02, 6, 20, Math.PI), mat("#e7a6a8")); band.position.set(0, 0.06, -0.03); band.rotation.x = -0.2; band.scale.set(1.04, 1, 1); band.rotation.x = 0; head.add(band); [-1, 1].forEach((sd) => { const e = cap(0.055, 0.26, "#fffdf8", head); e.position.set(sd * 0.11, 0.48, -0.02); e.rotation.z = -sd * 0.18; const inn = cap(0.025, 0.2, "#f2c4c8", head); inn.position.set(sd * 0.11, 0.48, 0.03); inn.rotation.z = -sd * 0.18; }); }
  if (look.hat === "flower") { const fl = new THREE.Group(); fl.position.set(-0.24, 0.22, 0.12); head.add(fl); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; sph(0.04, "#e7a6a8", Math.cos(a) * 0.045, Math.sin(a) * 0.045, 0, fl, 8, 6); } sph(0.03, "#f2cc4a", 0, 0, 0.02, fl, 8, 6); }
  if (has(look.ears, "phones")) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 8, 24, Math.PI), mat("#5a6b7a")); band.position.y = 0.02; head.add(band);
    [-0.33, 0.33].forEach((x) => { const e = cyl(0.08, 0.08, 0.07, "#5a6b7a", x, 0.0, 0, head); e.rotation.z = Math.PI / 2; });
  }
  if (look.hat === "beanie") { const b = new THREE.Mesh(new THREE.SphereGeometry(0.37, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.47), mat("#c8574a")); b.position.y = 0.04; b.rotation.x = -0.15; b.scale.set(1.06, 1.05, 1.05); head.add(b); cyl(0.38, 0.38, 0.09, "#a9463c", 0, 0.07, -0.02, head).rotation.x = -0.15; sph(0.08, "#f3efe6", 0, 0.43, -0.04, head); }
  if (look.hat === "straw") { cyl(0.55, 0.55, 0.025, "#e6c27a", 0, 0.2, -0.02, head, 28); cyl(0.27, 0.33, 0.2, "#e6c27a", 0, 0.3, -0.02, head); cyl(0.322, 0.322, 0.04, "#c2453b", 0, 0.23, -0.02, head); }
  if (look.hat === "beret") { const b = sph(0.36, "#3d3a4a", 0.04, 0.27, -0.03, head); b.scale.set(1.08, 0.38, 1.05); sph(0.03, "#3d3a4a", 0.04, 0.4, -0.03, head); }
  if (look.hat === "catband") { const band = new THREE.Mesh(new THREE.TorusGeometry(0.325, 0.02, 6, 20, Math.PI), mat("#3d3a4a")); band.position.set(0, 0.06, -0.03); band.rotation.x = -0.2; band.scale.set(1.04, 1, 1); head.add(band); [-1, 1].forEach((sd) => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 4), mat("#3d3a4a")); e.position.set(sd * 0.19, 0.38, 0); e.rotation.z = -sd * 0.35; head.add(e); const inn = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.1, 4), mat("#f2c4c8")); inn.position.set(sd * 0.19, 0.37, 0.05); inn.rotation.z = -sd * 0.35; head.add(inn); }); }
  if (look.hat === "bucket") { const br = cyl(0.42, 0.48, 0.08, "#c9b48a", 0, 0.17, -0.02, head, 24); br.rotation.x = -0.1; cyl(0.3, 0.34, 0.22, "#c9b48a", 0, 0.3, -0.02, head, 22).rotation.x = -0.1; cyl(0.345, 0.345, 0.04, "#a8916a", 0, 0.22, -0.02, head, 22).rotation.x = -0.1; }
  if (look.hat === "crown") { const cr = cyl(0.16, 0.16, 0.12, mat("#e8b93a", { metalness: 0.5, roughness: 0.35 }), 0, 0.33, 0, head, 10); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const k = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.09, 6), mat("#e8b93a", { metalness: 0.5, roughness: 0.35 })); k.position.set(Math.cos(a) * 0.15, 0.43, Math.sin(a) * 0.15); head.add(k); } sph(0.03, "#c2453b", 0, 0.34, 0.16, head); cr.castShadow = true; }
  // 寵物夥伴
  const cat = look.pet ? makePet(look.pet, look.ps, look.pm) : null;
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
const PET_SCALE = [0.72, 0.86, 1, 1.12];
function makePet(kind, ps, pm) {
  const g = new THREE.Group();
  const col = { cat: "#e3a35b", shiba: "#d9914a", bunny: "#fffdf8", chick: "#f2cc4a", panda: "#fffdf8", fox: "#e07a3a", hamster: "#e8c08a", blackcat: "#3c3842", calico: "#fffaf2", corgi: "#ec9a4e", poodle: "#c98a5a" }[kind] || "#e3a35b";
  let tail;
  if (kind === "chick") {
    const b = sph(0.14, col, 0, 0.14, 0, g); b.scale.set(1, 0.95, 1.05);
    const bk = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 6), mat("#e0a830")); bk.rotation.x = Math.PI / 2; bk.position.set(0, 0.16, 0.15); g.add(bk);
    [-0.05, 0.05].forEach((x) => { sph(0.015, "#2f2622", x, 0.2, 0.12, g, 6, 6).userData.eye = 1; });
    tail = sph(0.05, col, 0, 0.18, -0.12, g, 8, 6); tail.scale.set(1, 0.6, 1);
    [-0.1, 0.1].forEach((x) => { const w = sph(0.06, "#e8bf3a", x * 1.3, 0.13, 0, g, 8, 6); w.scale.set(0.4, 0.8, 1); w.userData.wing = 1; });
  } else {
    const c1 = sph(0.13, col, 0, 0.12, 0, g); c1.scale.set(0.9, 0.8, 1.3);
    const hd = sph(0.1, col, 0, 0.25, 0.14, g);
    if (kind === "panda") { [-0.06, 0.06].forEach((x) => { sph(0.035, "#2a2620", x, 0.34, 0.12, g, 8, 6); const p2 = sph(0.028, "#2a2620", x * 0.7, 0.26, 0.225, g, 8, 6); p2.scale.set(0.8, 1, 0.5); }); [-0.08, 0.08].forEach((x) => sph(0.05, "#2a2620", x, 0.06, 0.1, g, 8, 6)); c1.scale.set(1, 0.85, 1.25); }
    else if (kind === "bunny") { [-0.035, 0.035].forEach((x) => { const e = cap(0.025, 0.14, "#fffdf8", g); e.position.set(x, 0.42, 0.12); e.rotation.z = x * 3; const inn = cap(0.012, 0.1, "#f2c4c8", g); inn.position.set(x, 0.42, 0.14); inn.rotation.z = x * 3; e.userData.ear = inn.userData.ear = 1; }); }
    else if (kind === "hamster") { [-0.06, 0.06].forEach((x) => sph(0.035, "#f2c4c8", x, 0.33, 0.12, g, 8, 6)); c1.scale.set(1, 0.95, 1.1); hd.scale.set(1.1, 1, 1); const bl = sph(0.08, "#fff4e4", 0, 0.1, 0.08, g, 8, 6); bl.scale.set(1, 0.9, 0.8); }
    else { [-0.05, 0.05].forEach((x) => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.035, kind === "fox" ? 0.1 : 0.07, 4), mat(col)); e.position.set(x, 0.35, 0.14); e.userData.ear = 1; g.add(e); }); }
    if (kind === "fox") { const m2 = sph(0.055, "#fffdf8", 0, 0.22, 0.21, g, 8, 6); m2.scale.set(1.2, 0.8, 0.9); }
    if (kind === "shiba") { const m2 = sph(0.06, "#fff4e4", 0, 0.22, 0.21, g, 8, 6); m2.scale.set(1.2, 0.8, 0.8); }
    if (kind === "corgi") { const m2 = sph(0.06, "#fffaf2", 0, 0.22, 0.21, g, 8, 6); m2.scale.set(1.2, 0.8, 0.8); const ch = sph(0.08, "#fffaf2", 0, 0.12, 0.09, g, 8, 6); ch.scale.set(1, 1, 0.8); }
    if (kind === "calico") { sph(0.05, "#ee9a4a", -0.05, 0.31, 0.13, g, 8, 6); sph(0.045, "#3a3036", 0.05, 0.31, 0.13, g, 8, 6); sph(0.07, "#ee9a4a", 0.06, 0.18, -0.04, g, 8, 6); }
    if (kind === "poodle") { [[0, 0.34, 0.12, 0.06], [-0.09, 0.22, 0.12, 0.05], [0.09, 0.22, 0.12, 0.05], [0, 0.16, -0.1, 0.07]].forEach((p) => { sph(p[3], "#a46a3c", p[0], p[1], p[2], g, 8, 6).userData.pom = 1; }); }
    if (kind !== "panda") [-0.04, 0.04].forEach((x) => sph(0.015, kind === "blackcat" ? "#e2b63a" : "#2f2622", x, 0.26, 0.23, g, 6, 6).userData.eye = 1);
    if (kind === "bunny") { tail = sph(0.05, "#fffdf8", 0, 0.14, -0.17, g, 8, 6); }
    else if (kind === "shiba") { tail = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.022, 6, 12, Math.PI * 1.5), mat(col)); tail.position.set(0, 0.24, -0.15); tail.rotation.y = Math.PI / 2; g.add(tail); }
    else if (kind === "panda") { tail = sph(0.03, "#fffdf8", 0, 0.14, -0.16, g, 6, 6); }
    else if (kind === "hamster") { tail = sph(0.02, col, 0, 0.12, -0.15, g, 6, 6); }
    else if (kind === "fox") { tail = sph(0.08, col, 0, 0.2, -0.2, g, 10, 8); tail.scale.set(0.8, 0.8, 1.8); tail.rotation.x = -0.5; sph(0.045, "#fffdf8", 0, 0, 0.12, tail, 8, 6); }
    else { tail = cap(0.025, 0.18, col, g); tail.position.set(0, 0.22, -0.16); tail.rotation.x = -0.6; }
  }
  g.userData.tail = tail;
  if (ps === 0 || ps === 1) petStage(g, kind, ps, tail);
  // 頭上的表情泡泡（休息時玩耍、專注時睡覺）
  const ic = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false })); ic.scale.set(0.24, 0.24, 1); ic.position.set(0, 0.66, 0); ic.visible = false; g.add(ic);
  g.userData.icon = ic; g.userData.pm = pm;
  // 成長階段決定大小；進化後頭上有顆金星，心情用小愛心或眼淚表示
  g.scale.setScalar(PET_SCALE[ps != null ? ps : 2]);
  if (ps === 3) { const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), mat("#f2c94c", { metalness: 0.5, roughness: 0.3, emissive: "#6a4a00" })); st.position.set(0, 0.5, 0.1); g.add(st); g.userData.spark = st; }
  if (pm === "happy") { const h = new THREE.Group(); [-1, 1].forEach((sd) => sph(0.032, "#f07a8a", sd * 0.026, 0.02, 0, h, 8, 6)); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.06, 8), mat("#f07a8a")); tip.rotation.z = Math.PI; tip.position.y = -0.02; h.add(tip); h.position.set(0.1, 0.46, 0.1); g.add(h); g.userData.heart = h; }
  if (pm === "sad") { const d = sph(0.022, mat("#7fb7e6", { roughness: 0.2 }), -0.07, 0.22, 0.24, g, 8, 6); d.scale.set(0.8, 1.3, 0.8); }
  return g;
}

/* 幼年、少年的造型：成年（現在的模型）改比例再加配件。
   幼年頭大身小、眼睛圓、尾巴短，含奶嘴；少年比例介於中間，脖子綁領巾 */
function petStage(g, kind, ps, tail) {
  const baby = ps === 0;
  const hs = baby ? 1.3 : 1.12, bs = baby ? 0.74 : 0.9;
  const P = new THREE.Vector3(0, 0.25, 0.14);
  const kids = g.children.slice();
  if (kind === "chick") {
    // 小雞沒有分頭身：整隻縮一點，眼睛放大
    kids.forEach((o) => { if (o.userData.eye) o.scale.multiplyScalar(baby ? 1.5 : 1.2); });
    if (baby) {
      const shell = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 8, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.48), mat("#fbf6ea", { side: THREE.DoubleSide }));
      shell.position.y = 0.13; g.add(shell);
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, t = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.05, 4), mat("#fbf6ea")); t.position.set(Math.sin(a) * 0.15, 0.13, Math.cos(a) * 0.15); g.add(t); }
      kids.forEach((o) => { if (o.userData.wing) o.visible = false; });
      if (tail) tail.visible = false;
    } else {
      [-0.03, 0.03].forEach((x, i) => { const f = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.08, 5), mat("#f2cc4a")); f.position.set(x, 0.31, 0.02); f.rotation.z = i ? -0.4 : 0.4; g.add(f); });
    }
    return;
  }
  kids.forEach((o) => {
    const p = o.position;
    if (o.userData.pom && (baby || p.y < 0.3)) { o.visible = false; return; }
    if (p.y >= 0.2 && p.z >= 0.08) {
      p.sub(P).multiplyScalar(hs).add(P.clone().multiplyScalar(bs));
      o.scale.multiplyScalar(hs * (o.userData.eye ? (baby ? 1.35 : 1.15) : 1));
      if (o.userData.ear && baby) { if (kind === "bunny") { o.rotation.x = -1.1; p.z -= 0.05; p.y -= 0.08; } else o.scale.multiplyScalar(0.75); }
    } else {
      p.multiplyScalar(bs); o.scale.multiplyScalar(bs * (o === tail && baby ? 0.6 : 1));
    }
  });
  const hy = P.y * bs, hz = P.z * bs;
  if (baby) {
    // 奶嘴
    const pc = new THREE.Group();
    const sh = cyl(0.032, 0.032, 0.012, "#7fc4e8", 0, 0, 0, pc); sh.rotation.x = Math.PI / 2;
    const rg = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.006, 6, 12), mat("#f2a0b4")); rg.position.z = 0.012; pc.add(rg);
    pc.position.set(0, hy - 0.045 * hs, hz + 0.1 * hs); g.add(pc);
  } else {
    petScarf(g, hy - 0.09, hz - 0.02, 0.075, 1);
    if (kind === "panda") { const b = cyl(0.012, 0.012, 0.22, "#7ab05a", 0.07, 0.12, 0.13, g); b.rotation.z = 0.5; [0.04, 0.1].forEach((y) => { const l = sph(0.025, "#8cc46a", 0.07 + y * 0.5, 0.12 + y, 0.13, g, 6, 4); l.scale.set(1.6, 0.4, 0.8); }); }
    if (kind === "hamster") { const sd = sph(0.03, "#5a4a3e", 0, 0.11, 0.17, g, 8, 6); sd.scale.set(0.7, 1.2, 0.6); }
  }
}
// 少年的紅色領巾：繞脖子一圈＋前面一個三角
function petScarf(g, y, z, r, k) {
  const sc = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.016, 6, 16), mat("#e0564a")); ring.rotation.x = Math.PI / 2 - 0.35; sc.add(ring);
  const tri = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.07, 3), mat("#e0564a")); tri.rotation.x = Math.PI; tri.rotation.y = Math.PI / 6; tri.position.set(0, -0.04, r * 0.95); sc.add(tri);
  sc.position.set(0, y, z); sc.scale.setScalar(k); g.add(sc);
}


export { THREE, mat, box, cyl, sph, cap, outline, makeChar, makePet };
