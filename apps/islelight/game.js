/* 漂流燈島：白天撿漂流木、蓋燈，晚上用光守住燈塔
   小人和寵物沿用番茄讀書會（chars.js）；光影：即時陰影、泛光、燈塔光束、水面反光、日夜漸變 */
import { THREE, mat, box, cyl, sph, outline, makeChar, makePet } from "./chars.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { initArt, M, TEX, tree, pine, rock as rockE, lampPost, grassTufts, tickSmoke, signMats, smokes } from "./art.js";
import { buildTown } from "./town.js";

const SAVE_KEY = "kaida-islelight-v1";
const save = (() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "{}"); } catch (e) { return {}; } })();
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* 無痕模式存不了就算了 */ } }
const $ = (id) => document.getElementById(id);
const TAU = Math.PI * 2;
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => { const k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };

/* ===== 畫面 ===== */
let HIGH = save.quality !== "low";
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, HIGH ? 2 : 1));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x9cc4e4, 0.004);
// 環境反射：讓石頭、玻璃、水面有一點周圍的光
const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.3;
initArt();
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 500);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.8, 0.55, 0.85);
composer.addPass(bloom);
// 環境光遮蔽：角落、屋簷下自然變暗。粒子和光暈在算 AO 時要先藏起來，不然會變成一塊塊方形
const hideForAO = [];
let gtao = null;
if (HIGH) {
  gtao = new GTAOPass(scene, camera, innerWidth, innerHeight); gtao.output = GTAOPass.OUTPUT.Default; gtao.blendIntensity = 0.85;
  gtao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1, thickness: 1, scale: 1.1, samples: 12, distanceFallOff: 1, screenSpaceRadius: false });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 4, radiusExponent: 1, rings: 2, samples: 12 });
  const gr = gtao.render.bind(gtao); gtao.render = (...a) => { hideForAO.forEach((o) => o.visible = false); gr(...a); hideForAO.forEach((o) => o.visible = true); };
  composer.addPass(gtao);
}
composer.addPass(new OutputPass());

function glowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.55)"); gr.addColorStop(0.6, "rgba(255,255,255,.12)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const GLOW = glowTexture();
function glowSprite(color, size, parent, y) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  s.scale.set(size, size, 1); s.position.y = y || 0; s.userData.base = new THREE.Color(color);
  if (parent) parent.add(s); hideForAO.push(s);
  return s;
}
// 地上的光暈：假裝燈光照亮一圈地面，不用每盞燈都算陰影
function lightPool(color, r, parent, y) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: GLOW, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
  m.rotation.x = -Math.PI / 2; m.position.y = y || 0.03; m.renderOrder = 1;
  if (parent) parent.add(m); hideForAO.push(m);
  return m;
}
// 體積光束：錐尖在原點、往 +z 延伸，越靠近燈越亮，邊緣淡掉
function beamCone(len, radius, color) {
  const g = new THREE.ConeGeometry(radius, len, 40, 1, true); g.translate(0, -len / 2, 0); g.rotateX(-Math.PI / 2);
  const m = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0 } },
    vertexShader: "varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = uv.y; vec4 mv = modelViewMatrix * vec4(position,1.); vV = normalize(-mv.xyz); vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 uColor; uniform float uOpacity; varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float e = pow(abs(dot(vN, vV)), 1.6); float a = pow(vY, 1.4) * e * uOpacity; gl_FragColor = vec4(uColor, a); }",
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const o = new THREE.Mesh(g, m); o.renderOrder = 2; hideForAO.push(o); return o;
}

/* ===== 天空 ===== */
const skyU = { top: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunC: { value: new THREE.Color() }, sunA: { value: 1 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
  fragmentShader: "uniform vec3 top; uniform vec3 bot; uniform vec3 sunDir; uniform vec3 sunC; uniform float sunA; varying vec3 vP; void main(){ float h = clamp(vP.y * 1.6 + .08, 0., 1.); vec3 c = mix(bot, top, pow(h, .7)); float s = max(dot(vP, normalize(sunDir)), 0.); c += sunC * (pow(s, 600.) * 6. + pow(s, 12.) * .35) * sunA; gl_FragColor = vec4(c, 1.); }",
}));
scene.add(sky);
const stars = (() => {
  const n = 700, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = Math.random() * TAU, y = 0.08 + Math.random() * 0.92, r = Math.sqrt(1 - y * y); p.set([Math.cos(a) * r * 280, y * 280, Math.sin(a) * r * 280], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
  const s = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  scene.add(s); return s;
})();
const moon = new THREE.Group(); scene.add(moon);
const moonDisc = new THREE.Mesh(new THREE.CircleGeometry(7, 32), new THREE.MeshBasicMaterial({ color: 0xf4f0ff, fog: false, transparent: true }));
moon.add(moonDisc); const moonGlow = glowSprite(0x8aa4ff, 60, moon);

/* ===== 島 ===== */
const R = (a) => 21 + 1.4 * Math.sin(3 * a + 0.5) + 0.9 * Math.sin(5 * a + 2) + 0.5 * Math.sin(7 * a);
const RG = (a) => R(a) - 3.0;
function groundY(x, z) {
  const r = Math.hypot(x, z), a = Math.atan2(z, x), rr = R(a), rg = RG(a);
  if (r < rg) return 0.55;
  if (r < rg + 0.35) return lerp(0.55, 0.35, (r - rg) / 0.35);
  if (r < rr) return 0.35;
  if (r < rr + 1.6) return 0.35 - (r - rr) / 1.6 * 1.4;
  return -1.05;
}
function speckleTex(base, dots, n, size) {
  const c = document.createElement("canvas"); c.width = c.height = size || 256; const g = c.getContext("2d");
  g.fillStyle = base; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < n; i++) { g.fillStyle = dots[i % dots.length]; g.globalAlpha = 0.25 + Math.random() * 0.45; const s = 1 + Math.random() * 3; g.fillRect(Math.random() * c.width, Math.random() * c.height, s, s); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
}
function islandPart(r0, r1, h, topY, edge, color, tex) {
  const g = new THREE.CylinderGeometry(r0, r1, h, 96, 3);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
    if (r < 0.01) continue;
    const a = Math.atan2(z, x), nr = r - r0 + edge(a);
    p.setX(i, Math.cos(a) * nr); p.setZ(i, Math.sin(a) * nr);
  }
  g.translate(0, topY - h / 2, 0); g.computeVertexNormals();
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) { uv.setXY(i, p.getX(i) / 4, p.getZ(i) / 4); }
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, map: tex, roughness: 0.95 }));
  m.receiveShadow = true; m.castShadow = true; scene.add(m); return m;
}
const sand = islandPart(21, 22.6, 1.4, 0.35, R, "#ecd6a2", speckleTex("#ffffff", ["#c9a86a", "#fff4d8", "#b8955a"], 900));
const grass = islandPart(18, 18.4, 0.6, 0.55, RG, "#86b45e", speckleTex("#ffffff", ["#5f8f3e", "#a8cf74", "#4a7a32", "#c4dc8a"], 1600));

/* 海面：頂點著色器裡算波浪，太陽和燈光會在浪上反光 */
const waterU = { uTime: { value: 0 } };
const waterM = new THREE.MeshStandardMaterial({ color: "#2f8fa8", roughness: 0.22, metalness: 0.05, transparent: true, opacity: 0.94 });
waterM.onBeforeCompile = (sh) => {
  sh.uniforms.uTime = waterU.uTime;
  const fn = "uniform float uTime;\nfloat wv(vec2 p){ return sin(p.x*.32+uTime*1.1)*.09 + sin(p.y*.45+uTime*.8)*.07 + sin((p.x+p.y)*.9+uTime*1.7)*.035 + sin((p.x-p.y)*1.6-uTime*2.3)*.015; }\n";
  sh.vertexShader = fn + sh.vertexShader
    .replace("#include <beginnormal_vertex>", "float e = .15; vec2 q = position.xy; vec3 objectNormal = normalize(vec3(-(wv(q+vec2(e,0.))-wv(q-vec2(e,0.)))/(2.*e), -(wv(q+vec2(0.,e))-wv(q-vec2(0.,e)))/(2.*e), 1.));\n#ifdef USE_TANGENT\nvec3 objectTangent = vec3( tangent.xyz );\n#endif")
    .replace("#include <begin_vertex>", "vec3 transformed = vec3(position.xy, wv(position.xy));");
};
const water = new THREE.Mesh(new THREE.PlaneGeometry(320, 320, 220, 220), waterM);
water.rotation.x = -Math.PI / 2; water.receiveShadow = true; scene.add(water);
// 岸邊浪花：沿著海岸一圈，一波一波往岸上推
const foam = (() => {
  const seg = 160, pos = [], tv = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const a = i / seg * TAU, rr = R(a);
    [[rr + 0.1, 0], [rr + 2.0, 1]].forEach(([r, t]) => { pos.push(Math.cos(a) * r, 0.04, Math.sin(a) * r); tv.push(t); });
    if (i < seg) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("t", new THREE.Float32BufferAttribute(tv, 1)); g.setIndex(idx);
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: waterU.uTime, uLight: { value: 1 } }, transparent: true, depthWrite: false,
    vertexShader: "attribute float t; varying float vT; void main(){ vT = t; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: "uniform float uTime; uniform float uLight; varying float vT; void main(){ float w = fract(vT * 1.4 + uTime * .22); float band = smoothstep(.0,.08,w) * (1. - smoothstep(.08,.3,w)); float a = (band * .7 + (1. - vT) * .35) * (1. - vT); gl_FragColor = vec4(vec3(uLight), a * .85); }",
  });
  const o = new THREE.Mesh(g, m); o.renderOrder = 1; scene.add(o); return o;
})();

/* ===== 建築與擺設 ===== */
const colliders = []; // { x, z, r }
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const windowM = new THREE.MeshStandardMaterial({ color: "#3a2a1a", emissive: "#ffae4a", emissiveIntensity: 0.1, roughness: 0.4 });
const housePools = [];
function roundTree(x, z, s) { const t = tree(scene, x, groundY(x, z), z, s, ["green", "green", "dark", "autumn"][Math.floor(rnd() * 4)]); colliders.push({ x, z, r: 0.4 * s }); return t; }
function pineTree(x, z, s) { const t = pine(scene, x, groundY(x, z), z, s); colliders.push({ x, z, r: 0.4 * s }); return t; }
function palm(x, z, s, lean) {
  const g = new THREE.Group(); g.position.set(x, groundY(x, z), z); g.scale.setScalar(s); g.rotation.y = lean; scene.add(g);
  let px = 0, py = 0;
  for (let i = 0; i < 6; i++) { const c = cyl(0.09 - i * 0.008, 0.11 - i * 0.008, 0.36, i % 2 ? "#a07a4a" : "#8a6a3e", px, py + 0.18, 0, g, 8); c.rotation.z = -0.1 - i * 0.05; px += 0.04 + i * 0.02; py += 0.34; }
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, l = sph(0.5, "#4f9a4a", px + Math.cos(a) * 0.42, py + 0.05, Math.sin(a) * 0.42, g, 10, 6); l.scale.set(1, 0.12, 0.35); l.rotation.y = -a; l.rotation.z = -0.35; }
  sph(0.09, "#6a4a2a", px + 0.05, py - 0.05, 0.05, g, 8, 6); sph(0.09, "#6a4a2a", px - 0.05, py - 0.07, -0.04, g, 8, 6);
  outline(g, 0.025); colliders.push({ x, z, r: 0.3 }); return g;
}
function rock(x, z, s) { const r = rockE(scene, x, groundY(x, z), z, s); outline(r, 0.015); colliders.push({ x, z, r: 0.35 * s }); }

/* 燈塔 */
const tower = new THREE.Group(); scene.add(tower); tower.position.y = 0.55;
cyl(1.4, 1.55, 0.5, "#cfc6b4", 0, 0.25, 0, tower, 24);
cyl(0.78, 1.12, 4.6, "#f8f4ec", 0, 2.8, 0, tower, 28);
[1.6, 3.4].forEach((y) => { const k = (y - 0.5) / 4.6; cyl(lerp(1.12, 0.78, k + 0.08) + 0.02, lerp(1.12, 0.78, k - 0.08) + 0.02, 0.62, "#d0524a", 0, y, 0, tower, 28); });
cyl(1.1, 1.1, 0.14, "#3a3440", 0, 5.15, 0, tower, 28);
const rail = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.03, 6, 40), mat("#3a3440")); rail.rotation.x = Math.PI / 2; rail.position.y = 5.55; tower.add(rail);
for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; cyl(0.02, 0.02, 0.4, "#3a3440", Math.cos(a) * 1.05, 5.36, Math.sin(a) * 1.05, tower, 4); }
const lampGlassM = new THREE.MeshStandardMaterial({ color: "#fff2c8", emissive: "#ffcf6a", emissiveIntensity: 0.3, roughness: 0.2, transparent: true, opacity: 0.85 });
const lampGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.85, 20), lampGlassM); lampGlass.position.y = 5.65; tower.add(lampGlass);
const roofC = new THREE.Mesh(new THREE.ConeGeometry(0.78, 0.7, 20), mat("#d0524a")); roofC.position.y = 6.42; roofC.castShadow = true; tower.add(roofC);
sph(0.1, "#3a3440", 0, 6.82, 0, tower, 8, 6);
box(0.5, 0.85, 0.1, "#6a4a32", 0, 0.92, 1.08, tower).rotation.x = -0.08;
[[0.85, 2.3], [-0.6, 3.6]].forEach(([a, y]) => { const r0 = lerp(1.12, 0.78, (y - 0.5) / 4.6); const w = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.32), windowM); w.position.set(Math.sin(a) * (r0 + 0.01), y, Math.cos(a) * (r0 + 0.01)); w.rotation.y = a; tower.add(w); });
outline(tower, 0.025);
colliders.push({ x: 0, z: 0, r: 1.6 });
const towerGlow = glowSprite(new THREE.Color(1.8, 1.3, 0.6), 5, tower, 5.65);
const towerLight = new THREE.PointLight("#ffc870", 0, 14, 1.4); towerLight.position.y = 5.65; tower.add(towerLight);
const towerPool = lightPool("#ffcf80", 5.5, scene, 0.58);
// 兩道旋轉光束
const beamRig = new THREE.Group(); beamRig.position.y = 6.2; scene.add(beamRig);
const beams = [0, Math.PI].map((a) => {
  const g = new THREE.Group(); g.rotation.y = a; beamRig.add(g);
  const c = beamCone(26, 3.4, "#ffe2a0"); c.rotation.x = 0.16; g.add(c);
  return c;
});
const beamSpot = new THREE.SpotLight("#ffe0a0", 0, 40, 0.2, 0.55, 1.1);
beamSpot.position.set(0, 6.2, 0); scene.add(beamSpot); scene.add(beamSpot.target);
beamSpot.castShadow = true; beamSpot.shadow.mapSize.set(1024, 1024); beamSpot.shadow.bias = -0.0004; beamSpot.shadow.camera.near = 1; beamSpot.shadow.camera.far = 40;

/* 碼頭和小船 */
const DOCK_A = Math.PI * 0.45;
const dockLampAt = new THREE.Vector3(), boatRef = {};
(() => {
  const g = new THREE.Group(); const r0 = R(DOCK_A) - 0.8; g.position.set(Math.cos(DOCK_A) * r0, 0.38, Math.sin(DOCK_A) * r0); g.rotation.y = -DOCK_A + Math.PI / 2; scene.add(g);
  for (let i = 0; i < 9; i++) box(1.3, 0.08, 0.36, i % 2 ? "#a07a52" : "#8e6a46", 0, 0, i * 0.4, g);
  [0.4, 1.6, 2.8].forEach((zz) => [-0.6, 0.6].forEach((xx) => cyl(0.07, 0.07, 1.4, "#6a4a32", xx, -0.55, zz, g, 8)));
  g.updateMatrixWorld(true); dockLampAt.set(0.6, 0, 3.2).applyMatrix4(g.matrixWorld);
  const boat = new THREE.Group(); boat.position.set(-1.4, -0.3, 2.6); g.add(boat); boatRef.o = boat;
  const hull = sph(0.55, "#c8574a", 0, 0, 0, boat, 16, 8); hull.scale.set(0.9, 0.45, 2); box(0.85, 0.06, 1.6, "#a07a52", 0, 0.15, 0, boat);
  outline(g, 0.02);
})();

/* ===== 小鎮 ===== */
// 鎮上原本就有的路燈：模型＋光暈＋地面光，真正的點光源只給前幾盞（手機吃不消）
const townLamps = [];
function addLamp(parent, x, y, z) {
  const g = lampPost(parent, x, y, z); outline(g, 0.014);
  const glow = glowSprite(new THREE.Color("#ffb860").multiplyScalar(2.0), 1.3, g, 1.85);
  const pool = lightPool("#ffb860", 3.2, g, 0.04);
  const w = new THREE.Vector3(); g.updateMatrixWorld(true); g.getWorldPosition(w);
  townLamps.push({ g, glow, pool, light: null, x: w.x, z: w.z, y: w.y });
  colliders.push({ x: w.x, z: w.z, r: 0.3 });
  return g;
}
const RING_R = 11, ROAD_W = 2.0;
const A = (deg) => deg * Math.PI / 180;
const DOCK_T = Math.atan2(Math.cos(DOCK_A), Math.sin(DOCK_A)); // 碼頭在小鎮座標的方位（sin,cos）
const outer = (deg, r) => [Math.sin(A(deg)) * (r || 14.3), Math.cos(A(deg)) * (r || 14.3), A(deg) + Math.PI];
const inner = (deg, r) => [Math.sin(A(deg)) * (r || 7.3), Math.cos(A(deg)) * (r || 7.3), A(deg)];
const LAYOUT = [
  ["library", ...outer(40)], ["house", ...outer(68), 0], ["cafe", ...outer(100)], ["house", ...outer(130), 1],
  ["school", ...outer(165)], ["house", ...outer(200), 2], ["inn", ...outer(235)], ["house", ...outer(268), 3],
  ["chapel", ...outer(300)], ["konbini", ...outer(335)],
  ["bakery", ...inner(0)], ["bookstore", ...inner(90)], ["house", ...inner(180), 1], ["house", ...inner(270), 2],
];
const town = buildTown({ scene, lightPool, housePools, colliders, groundY, addLamp, ringR: RING_R, roadW: ROAD_W, y: 0.55, layout: LAYOUT, spokes: [A(45), A(135), A(225), A(315), DOCK_T] });
function freeSpot(x, z, pad) { return colliders.every((c) => Math.hypot(c.x - x, c.z - z) > c.r + pad); }
function onRoad(x, z, pad) {
  const r = Math.hypot(x, z); if (Math.abs(r - RING_R) < ROAD_W / 2 + pad || r < 4.8 + pad) return true;
  const t = Math.atan2(x, z);
  return [A(45), A(135), A(225), A(315), DOCK_T].some((sa) => { let d = Math.abs(((t - sa + Math.PI) % TAU + TAU) % TAU - Math.PI); return d * r < ROAD_W / 2 + pad && r < RING_R; });
}
for (let i = 0, n = 0; i < 2000 && n < 34; i++) {
  const a = rnd() * TAU, r = 5.5 + rnd() * (RG(a) - 6.5), x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (Math.abs(a - DOCK_A) < 0.2 || onRoad(x, z, 0.8) || !freeSpot(x, z, 1.3)) continue;
  (n % 4 === 3 ? pineTree : roundTree)(x, z, 0.85 + rnd() * 0.5); n++;
}
for (let i = 0, n = 0; i < 600 && n < 14; i++) {
  const a = rnd() * TAU, r = RG(a) + 0.6 + rnd() * 1.6, x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (Math.abs(a - DOCK_A) < 0.3 || !freeSpot(x, z, 1.4)) continue;
  palm(x, z, 0.9 + rnd() * 0.35, rnd() * TAU); n++;
}
for (let i = 0, n = 0; i < 400 && n < 18; i++) {
  const a = rnd() * TAU, r = R(a) - 0.4 + rnd() * 1.2, x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (Math.abs(a - DOCK_A) < 0.25 || !freeSpot(x, z, 0.6)) continue;
  rock(x, z, 0.6 + rnd() * 1.0); n++;
}
grassTufts(scene, HIGH ? 2600 : 1200, "#6aa047", () => { const a = rnd() * TAU, r = 4.5 + rnd() * (RG(a) - 5); const x = Math.cos(a) * r, z = Math.sin(a) * r; if (onRoad(x, z, 0.3) || !freeSpot(x, z, 0.2)) return null; return new THREE.Vector3(x, 0.55, z); });
smokes.forEach((s) => hideForAO.push(s.s));

/* ===== 光源 ===== */
const hemi = new THREE.HemisphereLight(0xbfdcff, 0x6a5a3a, 1); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 3); scene.add(sun); scene.add(sun.target);
sun.castShadow = true;
sun.shadow.mapSize.set(HIGH ? 2048 : 1024, HIGH ? 2048 : 1024);
Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
// 點光源先開好一池，蓋燈時拿來用，避免數量變動讓著色器重新編譯
const POINTS = [];
for (let i = 0; i < (HIGH ? 18 : 8); i++) { const l = new THREE.PointLight("#ffb860", 0, 8, 1.5); l.position.set(0, -50, 0); scene.add(l); POINTS.push({ l, used: false }); }
const SPOTS = [];
for (let i = 0; i < 4; i++) { const l = new THREE.SpotLight("#e8f0ff", 0, 16, 0.24, 0.5, 1.2); l.position.set(0, -50, 0); scene.add(l); scene.add(l.target); SPOTS.push({ l, used: false }); }
function takeLight(pool) { const s = pool.find((p) => !p.used); if (s) s.used = true; return s && s.l; }
// 鎮上的路燈：離燈塔近的先拿到真的點光源
townLamps.sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z)).slice(0, HIGH ? 8 : 3).forEach((l) => { l.light = takeLight(POINTS); if (l.light) { l.light.position.set(l.x, l.y + 1.95, l.z); l.light.distance = 7; } });

/* ===== 光的建築：路燈、探照燈、篝火 ===== */
const COST = { lamp: { wood: 2, oil: 0 }, search: { wood: 4, oil: 2 }, fire: { wood: 3, oil: 0 }, repair: { wood: 3, oil: 0 } };
const NAME = { lamp: "路燈", search: "探照燈", fire: "篝火" };
const LIMIT = { lamp: 9, search: 4, fire: 3 };
const RANGE = { lamp: 3.2, fire: 3.8, search: 9 };
const DPS = { lamp: 1.3, fire: 1.8, search: 2.6 };
const builds = [];
function buildModel(kind) {
  const g = new THREE.Group();
  if (kind === "lamp") {
    const l = lampPost(g, 0, 0, 0); l.userData.glass.material = l.userData.glass.material.clone(); g.userData.glass = l.userData.glass; g.userData.h = 1.85;
  } else if (kind === "search") {
    box(0.6, 0.25, 0.6, "#5a5660", 0, 0.12, 0, g); cyl(0.07, 0.07, 1.0, "#3a3440", 0, 0.7, 0, g, 8);
    const head = new THREE.Group(); head.position.y = 1.25; g.add(head);
    const body = cyl(0.22, 0.17, 0.5, "#4a6a8a", 0, 0, 0, head, 16); body.rotation.x = Math.PI / 2;
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20), new THREE.MeshStandardMaterial({ color: "#f4f8ff", emissive: "#cfe0ff", emissiveIntensity: 0.1 })); lens.position.z = 0.26; head.add(lens);
    g.userData.head = head; g.userData.glass = lens; g.userData.h = 1.25;
  } else {
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.13, 0), mat("#8a8680")); s.position.set(Math.cos(a) * 0.42, 0.08, Math.sin(a) * 0.42); s.castShadow = true; g.add(s); }
    [0, 1, 2].forEach((i) => { const l = cyl(0.06, 0.06, 0.7, "#6a4a2c", 0, 0.12, 0, g, 6); l.rotation.z = Math.PI / 2; l.rotation.y = i * Math.PI / 3; });
    const flame = new THREE.Group(); flame.position.y = 0.2; g.add(flame);
    [[0.2, 0.7, 0xff7a2a], [0.13, 0.5, 0xffc24a]].forEach(([r, h, c], i) => { const f = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(2.4), transparent: true, opacity: 0.9 })); f.position.y = h / 2 + i * 0.02; flame.add(f); });
    g.userData.flame = flame; g.userData.h = 0.6;
  }
  outline(g, 0.018);
  return g;
}
function addBuild(kind, x, z, free, y) {
  const g = buildModel(kind); g.position.set(x, y != null ? y : groundY(x, z), z); scene.add(g);
  const b = { kind, g, x, z, on: 0, flick: Math.random() * 10 };
  const col = kind === "fire" ? "#ff8a3a" : kind === "search" ? "#cfe0ff" : "#ffb860";
  b.glow = glowSprite(new THREE.Color(col).multiplyScalar(kind === "search" ? 1.6 : 2.2), kind === "fire" ? 2.6 : 1.4, g, g.userData.h);
  b.pool = lightPool(col, RANGE[kind === "search" ? "lamp" : kind] * 1.15, g, 0.04);
  if (kind === "search") {
    b.spot = takeLight(SPOTS); b.cone = beamCone(9, 1.5, "#dfe8ff"); g.userData.head.add(b.cone); b.cone.position.z = 0.25; b.yaw = Math.random() * TAU; b.pool.visible = false;
    b.light = takeLight(POINTS); if (b.light) { b.light.color.set("#cfe0ff"); b.light.distance = 4; }
  } else { b.light = takeLight(POINTS); if (b.light) { b.light.color.set(col); b.light.distance = kind === "fire" ? 9 : 8; } }
  if (b.light) b.light.position.set(x, g.position.y + g.userData.h + 0.15, z);
  builds.push(b); colliders.push({ x, z, r: kind === "fire" ? 0.55 : 0.35 });
  if (!free) { pop(g); burst(new THREE.Vector3(x, g.position.y + 0.6, z), 0xffd27a, 14, 1.4); }
  return b;
}
function pop(o) { o.userData.pop = 0; o.scale.setScalar(0.01); popping.push(o); }
const popping = [];

/* ===== 粒子：火花、螢火蟲、餘燼 ===== */
const sparks = [];
const sparkMats = {};
function burst(p, color, n, sp) {
  for (let i = 0; i < n; i++) {
    const key = color; if (!sparkMats[key]) sparkMats[key] = new THREE.SpriteMaterial({ map: GLOW, color: new THREE.Color(color).multiplyScalar(2.2), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
    const s = new THREE.Sprite(sparkMats[key].clone()); s.position.copy(p); const k = 0.18 + Math.random() * 0.22; s.scale.set(k, k, 1); scene.add(s);
    const a = Math.random() * TAU, u = Math.random();
    sparks.push({ s, v: new THREE.Vector3(Math.cos(a) * sp * u, 1 + Math.random() * sp * 1.4, Math.sin(a) * sp * u), life: 0.7 + Math.random() * 0.6, t: 0, k });
  }
}
const flies = [];
for (let i = 0; i < 80; i++) {
  const s = glowSprite(new THREE.Color(1.6, 2.2, 0.7), 0.22, scene); s.material.opacity = 0;
  const a = Math.random() * TAU, r = 3 + Math.random() * 15;
  flies.push({ s, x: Math.cos(a) * r, z: Math.sin(a) * r, y: 0.8 + Math.random() * 1.4, ph: Math.random() * 10, sp: 0.3 + Math.random() * 0.5 });
}

/* ===== 氛圍：早晨的光塵與光束、夜晚的地面濃霧 ===== */
const motes = [], fogs = [], shafts = [];
{
  const mm = new THREE.SpriteMaterial({ map: GLOW, color: new THREE.Color(2.2, 2.0, 1.5), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
  for (let i = 0; i < (HIGH ? 260 : 100); i++) { const sp = new THREE.Sprite(mm.clone()); const k = 0.04 + Math.random() * 0.06; sp.scale.set(k, k, 1); scene.add(sp); hideForAO.push(sp); const a = Math.random() * TAU, r = Math.random() * 19; motes.push({ sp, x: Math.cos(a) * r, y: 0.8 + Math.random() * 4, z: Math.sin(a) * r, ph: Math.random() * 10, v: 0.15 + Math.random() * 0.3 }); }
  const fm = new THREE.SpriteMaterial({ map: GLOW, color: new THREE.Color("#6f8f98"), depthWrite: false, transparent: true, opacity: 0, fog: false });
  for (let i = 0; i < (HIGH ? 90 : 40); i++) { const sp = new THREE.Sprite(fm.clone()); const k = 5 + Math.random() * 6; sp.scale.set(k, k * 0.35, 1); scene.add(sp); hideForAO.push(sp); const a = Math.random() * TAU, r = Math.random() * 24; fogs.push({ sp, x: Math.cos(a) * r, y: 0.6 + Math.random() * 0.5, z: Math.sin(a) * r, ph: Math.random() * 10, v: 0.04 + Math.random() * 0.06, k: 0.16 + Math.random() * 0.16 }); }
  const sm = new THREE.ShaderMaterial({ uniforms: { uC: { value: new THREE.Color("#fff4d8") }, uA: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: "uniform vec3 uC; uniform float uA; varying vec2 vUv; void main(){ float a = smoothstep(0.,.25,vUv.x)*smoothstep(1.,.75,vUv.x) * pow(vUv.y,1.6) * uA; gl_FragColor = vec4(uC*a, a); }" });
  for (let i = 0; i < 7; i++) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(2 + (i % 3), 16), sm); pl.renderOrder = 3; scene.add(pl); hideForAO.push(pl); const a = i / 7 * TAU, r = 6 + (i % 2) * 7; shafts.push({ pl, base: new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r), m: sm }); }
}

/* ===== 角色 ===== */
const player = makeChar({ g: "girl", skin: 0, hair: 1, style: "long", top: "hoodie", legs: "jeans", hat: "beanie" });
scene.add(player.root);
// 手提燈
const lantern = new THREE.Group(); lantern.position.set(0, -0.36, 0.04); player.arms[1].add(lantern);
cyl(0.004, 0.004, 0.12, "#3a3440", 0, 0.08, 0, lantern, 4);
const lanternGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.11, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.8, 0.8) })); lantern.add(lanternGlass);
cyl(0.075, 0.075, 0.025, "#3a3440", 0, 0.065, 0, lantern, 6);
const lanternGlow = glowSprite(new THREE.Color(1.3, 0.85, 0.4), 0.9, lantern);
const lanternLight = new THREE.PointLight("#ffc070", 0, 6, 1.5); scene.add(lanternLight);
const lanternPool = lightPool("#ffc070", 2.6, scene);
player.root.scale.setScalar(0.62);
const pet = makePet("shiba", 2); outline(pet, 0.012); pet.scale.multiplyScalar(0.85); scene.add(pet);
const P = { x: 0.5, z: 6.5, yaw: 0, tx: null, tz: null, moving: false, walk: 0 };
const petS = { x: 1, z: 7, yaw: 0, walk: 0 };
// 鎮民：白天在家門口晃，晚上回屋裡
const LOOKS = [
  { g: "boy", skin: 1, hair: 0, top: "plaid", legs: "khaki", hat: "straw" }, { g: "girl", skin: 3, hair: 5, style: "pony", top: "tee-pink", legs: "skirt" },
  { g: "boy", skin: 2, hair: 3, style: "curly", top: "overalls", legs: "jeans", face: "glasses" }, { g: "girl", skin: 0, hair: 9, style: "twins", top: "sweater", legs: "shorts", hat: "flower" },
  { g: "boy", skin: 4, hair: 2, top: "suit", legs: "suitp", neck: "tie" }, { g: "girl", skin: 1, hair: 4, style: "bob", top: "cardigan", legs: "jeans", face: "glasses" },
  { g: "boy", skin: 0, hair: 6, style: "spiky", top: "sport", legs: "trackp", hat: "cap" }, { g: "girl", skin: 2, hair: 7, style: "long", top: "denim", legs: "skirt" },
  { g: "boy", skin: 3, hair: 1, top: "sweater", legs: "khaki", hat: "beret" }, { g: "girl", skin: 5, hair: 0, style: "buns", top: "stripe", legs: "shorts" },
  { g: "boy", skin: 1, hair: 8, top: "cardigan", legs: "blackp", face: "glasses" }, { g: "girl", skin: 0, hair: 2, style: "pony", top: "hoodie", legs: "jeans", hat: "beanie" },
  { g: "boy", skin: 2, hair: 0, top: "turtle", legs: "jeans" }, { g: "girl", skin: 4, hair: 3, style: "bob", top: "plaid", legs: "khaki", hat: "bucket" },
];
const villagers = town.map((b, i) => {
  const c = makeChar(LOOKS[i % LOOKS.length]); c.root.scale.setScalar(0.62); scene.add(c.root);
  return { c, home: { x: b.front.x, z: b.front.z }, door: { x: b.door.x, z: b.door.z }, x: b.front.x, z: b.front.z, tx: b.front.x, tz: b.front.z, wait: Math.random() * 3, walk: 0, yaw: 0, inside: 0 };
});
function animWalk(c, walk, moving) {
  const s = moving ? Math.sin(walk) : 0;
  c.legs[0].rotation.x = s * 0.7; c.legs[1].rotation.x = -s * 0.7;
  c.arms[0].rotation.x = -s * 0.5; c.arms[1].rotation.x = moving ? s * 0.25 : 0;
  c.hips.position.y = 0.36 + (moving ? Math.abs(Math.cos(walk)) * 0.04 : 0);
}

/* ===== 撿東西：漂流木、燈油碎片 ===== */
const items = [];
function spawnWood(x, z) {
  const g = new THREE.Group(); g.position.set(x, groundY(x, z), z); g.rotation.y = Math.random() * TAU; scene.add(g);
  const l = cyl(0.08, 0.1, 0.7, "#9a7048", 0, 0.1, 0, g, 7); l.rotation.z = Math.PI / 2; cyl(0.04, 0.05, 0.25, "#8a6040", 0.12, 0.18, 0.08, g, 6).rotation.x = 0.9;
  outline(g, 0.015); pop(g);
  items.push({ kind: "wood", g, x, z, t: 0 });
}
function spawnShard(x, z) {
  const g = new THREE.Group(); g.position.set(x, groundY(x, z), z); scene.add(g);
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.8, 0.6) })); m.position.y = 0.45; g.add(m);
  glowSprite(new THREE.Color(1.4, 0.9, 0.3), 1.1, g, 0.45);
  items.push({ kind: "oil", g, x, z, t: 0, m });
}

/* ===== 黑影 ===== */
const foes = [];
const foeBodyM = new THREE.MeshStandardMaterial({ color: "#0d0a18", emissive: "#2a1650", emissiveIntensity: 0.6, roughness: 1 });
function spawnFoe() {
  const a = Math.random() * TAU, r = R(a) + 4.5, x = Math.cos(a) * r, z = Math.sin(a) * r;
  const g = new THREE.Group(); scene.add(g);
  const bm = foeBodyM.clone();
  const body = sph(0.36, bm, 0, 0.42, 0, g, 16, 12); body.scale.set(1, 1.25, 1);
  const tips = [];
  for (let i = 0; i < 5; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 6), bm); const ta = i / 5 * TAU; t.position.set(Math.cos(ta) * 0.16, 0.86, Math.sin(ta) * 0.16); t.rotation.set(Math.sin(ta) * 0.5, 0, -Math.cos(ta) * 0.5); t.castShadow = true; g.add(t); tips.push(t); }
  const eyeM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.2, 0.9) });
  [-0.12, 0.12].forEach((ex) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), eyeM); e.position.set(ex, 0.52, 0.3); e.scale.y = 1.4; g.add(e); });
  const aura = glowSprite(new THREE.Color(0.5, 0.2, 1.1), 2.2, g, 0.5); aura.material.opacity = 0.7;
  const day = G.day;
  const f = { g, body, bm, tips, aura, x, z, hp: 2.2 + day * 0.45, max: 2.2 + day * 0.45, sp: 1.05 + Math.min(day, 8) * 0.08, t: Math.random() * 10, lit: 0, dying: 0 };
  f.g.position.set(x, -0.4, z); foes.push(f);
}
function killFoe(f, byTower) {
  f.dying = 0.001;
  const p = new THREE.Vector3(f.x, f.g.position.y + 0.5, f.z);
  if (byTower) burst(p, 0x8a5aff, 18, 1.8);
  else { burst(p, 0xffd27a, 16, 1.6); if (Math.random() < 0.65) spawnShard(f.x, f.z); }
}

/* ===== 時間與光影 ===== */
const PH = { day: 52, dusk: 10, night: 78, dawn: 8 };
const CYCLE = PH.day + PH.dusk + PH.night + PH.dawn;
function hourAt(t) {
  if (t < PH.day) return lerp(6.5, 17.5, t / PH.day);
  t -= PH.day; if (t < PH.dusk) return lerp(17.5, 20, t / PH.dusk);
  t -= PH.dusk; if (t < PH.night) return (20 + 8.5 * t / PH.night) % 24;
  t -= PH.night; return lerp(4.5, 6.5, t / PH.dawn);
}
function phaseAt(t) { return t < PH.day ? "day" : t < PH.day + PH.dusk ? "dusk" : t < PH.day + PH.dusk + PH.night ? "night" : "dawn"; }
// 一天的光：天空上下兩色、太陽顏色與強度、環境光、海水顏色、泛光強度
const KEYS = [
  [0, "#081028", "#1e3262", "#9ab4ff", 0.4, 0.17, "#12304e", 0.75],
  [4.5, "#0a1030", "#2a3260", "#9ab4ff", 0.3, 0.14, "#143452", 0.7],
  [5.6, "#2a3a78", "#f09a7a", "#ff9a6a", 0.8, 0.45, "#2a5a7a", 0.6],
  [7, "#5a94d8", "#ffd9b0", "#ffd2a0", 2.4, 0.85, "#2f8aa4", 0.3],
  [12, "#3a7cd4", "#c4e4ff", "#fff6e6", 3.1, 1.05, "#2a92b0", 0.22],
  [16, "#4a80c8", "#ffe2b8", "#ffe0b0", 2.6, 0.9, "#2f8aa4", 0.28],
  [17.6, "#3a4a8a", "#ff8a4a", "#ff7a3a", 1.8, 0.6, "#3a6a8a", 0.5],
  [19, "#1c1f4c", "#b0506a", "#ff5a4a", 0.6, 0.35, "#1a3550", 0.8],
  [20.5, "#0a1230", "#22386a", "#9ab4ff", 0.4, 0.17, "#12304e", 0.75],
  [24, "#081028", "#1e3262", "#9ab4ff", 0.4, 0.17, "#12304e", 0.75],
];
const cA = new THREE.Color(), cB = new THREE.Color();
function envAt(h) {
  let i = 0; while (i < KEYS.length - 2 && KEYS[i + 1][0] <= h) i++;
  const a = KEYS[i], b = KEYS[i + 1], k = smooth(0, 1, (h - a[0]) / (b[0] - a[0]));
  const C = (j) => new THREE.Color(a[j]).lerp(cB.set(b[j]), k);
  return { top: C(1), bot: C(2), sunC: C(3), sun: lerp(a[4], b[4], k), hemi: lerp(a[5], b[5], k), water: C(6), bloom: lerp(a[7], b[7], k) };
}
function darkAt(h) { return h >= 12 ? smooth(17.4, 19.8, h) : 1 - smooth(4.6, 6.6, h); }

/* ===== 遊戲狀態 ===== */
const G = { started: false, over: false, t: 0, day: 1, wood: 4, oil: 0, hp: 100, build: null, spawns: [], woodTimer: 0, shake: 0, lastPhase: "day" };
function planNight() {
  const n = 5 + G.day * 3, list = [];
  for (let i = 0; i < n; i++) { const k = i / n; list.push(PH.night * (0.04 + 0.66 * k + Math.random() * 0.06)); }
  G.spawns = list.sort((a, b) => a - b);
}
const startT = 0;
G.t = startT;
// 開場先送兩盞燈：一盞在碼頭、一盞在燈塔前
addBuild("lamp", dockLampAt.x, dockLampAt.z, true, 0.42);
addBuild("lamp", 3.0, 6.8, true);
for (let i = 0; i < 10; i++) { const a = Math.random() * TAU; spawnWood(Math.cos(a) * (R(a) - 0.7), Math.sin(a) * (R(a) - 0.7)); }

/* ===== 鏡頭與操作 ===== */
const camS = { yaw: 0.35, pitch: 0.8, dist: 26, x: 0, z: 5 };
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function groundHit(cx, cy) {
  ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  const h = ray.intersectObjects([grass, sand, water], false)[0];
  return h ? h.point : null;
}
const ptrs = new Map(); let drag = null, pinch = 0, hover = null;
const cvs = renderer.domElement;
cvs.addEventListener("pointerdown", (e) => { cvs.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY }); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); drag = "pinch"; } else drag = null; });
cvs.addEventListener("pointermove", (e) => {
  const p = ptrs.get(e.pointerId);
  if (!p) { hover = groundHit(e.clientX, e.clientY); return; }
  const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) camS.dist = clamp(camS.dist * pinch / d, 9, 46); pinch = d; return; }
  if (!drag && Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 8) drag = "rot";
  if (drag === "rot") { camS.yaw -= dx * 0.008; camS.pitch = clamp(camS.pitch + dy * 0.004, 0.45, 1.3); }
  if (e.pointerType === "mouse") hover = groundHit(e.clientX, e.clientY);
});
function endPtr(e) {
  const p = ptrs.get(e.pointerId); ptrs.delete(e.pointerId);
  if (!p || drag || !G.started || G.over) { if (!ptrs.size) drag = null; return; }
  const hit = groundHit(e.clientX, e.clientY); if (!hit) return;
  if (G.build) { tryPlace(hit.x, hit.z); return; }
  const a = Math.atan2(hit.z, hit.x), r = Math.min(Math.hypot(hit.x, hit.z), R(a) - 0.3);
  P.tx = Math.cos(a) * r; P.tz = Math.sin(a) * r; marker(P.tx, P.tz);
}
cvs.addEventListener("pointerup", endPtr); cvs.addEventListener("pointercancel", (e) => { ptrs.delete(e.pointerId); drag = null; });
cvs.addEventListener("wheel", (e) => { e.preventDefault(); camS.dist = clamp(camS.dist * (1 + Math.sign(e.deltaY) * 0.08), 9, 46); }, { passive: false });
const keys = {};
addEventListener("keydown", (e) => { keys[e.key.toLowerCase()] = true; if (e.key === "Escape") setBuild(null); });
addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });
const mk = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 24), new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0, depthWrite: false }));
mk.rotation.x = -Math.PI / 2; scene.add(mk);
function marker(x, z) { mk.position.set(x, groundY(x, z) + 0.05, z); mk.material.opacity = 0.9; mk.scale.setScalar(1.4); }

/* 蓋東西 */
let ghost = null;
function canAfford(k) { return G.wood >= COST[k].wood && G.oil >= COST[k].oil; }
function setBuild(k) {
  if (ghost) { scene.remove(ghost); ghost = null; }
  G.build = k;
  document.querySelectorAll("#build button").forEach((b) => b.classList.toggle("on", b.dataset.b === k));
  if (k) {
    ghost = buildModel(k); ghost.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.5; o.castShadow = false; } }); scene.add(ghost); ghost.visible = false;
    tip(`點島上的空地放${NAME[k]}，再點一次按鈕取消`);
  } else tip("");
}
function placeOk(x, z) { const a = Math.atan2(z, x), r = Math.hypot(x, z); return r < R(a) - 0.4 && r > 2.4 && freeSpot(x, z, 0.4); }
function tryPlace(x, z) {
  const k = G.build;
  // 點到樹或房子旁邊時，自動往旁邊挪到最近的空地
  if (!placeOk(x, z)) {
    let found = null;
    for (let rr = 0.3; rr <= 1.5 && !found; rr += 0.3) for (let i = 0; i < 12 && !found; i++) { const a = i / 12 * TAU, nx = x + Math.cos(a) * rr, nz = z + Math.sin(a) * rr; if (placeOk(nx, nz)) found = [nx, nz]; }
    if (!found) { toastAt(x, z, "這裡不能蓋", "#ffb0a0"); return; }
    [x, z] = found;
  }
  if (!canAfford(k)) { toastAt(x, z, "材料不夠", "#ffb0a0"); setBuild(null); return; }
  if (builds.filter((b) => b.kind === k).length >= LIMIT[k]) { toastAt(x, z, `${NAME[k]}最多 ${LIMIT[k]} 座`, "#ffb0a0"); setBuild(null); return; }
  G.wood -= COST[k].wood; G.oil -= COST[k].oil;
  addBuild(k, x, z); setBuild(canAfford(k) ? k : null);
}
document.querySelectorAll("#build button").forEach((b) => b.addEventListener("click", () => {
  if (!G.started || G.over) return;
  const k = b.dataset.b;
  if (k === "repair") {
    if (G.hp >= 100) { tip("燈塔很健康，不用修"); setTimeout(() => tip(""), 1600); return; }
    if (!canAfford(k)) { tip("需要 3 塊木頭"); setTimeout(() => tip(""), 1600); return; }
    G.wood -= 3; G.hp = Math.min(100, G.hp + 20); burst(new THREE.Vector3(0, 3, 0), 0xffe2a0, 20, 1.6); toastAt(0, 0, "燈塔 +20", "#ffe2a0", 4); return;
  }
  setBuild(G.build === k ? null : k);
}));
$("skipbtn").addEventListener("click", () => { if (G.started && phaseAt(G.t) === "day") G.t = PH.day - 0.01; });
$("quality").addEventListener("click", () => { save.quality = HIGH ? "low" : "high"; persist(); location.reload(); });
$("quality").textContent = "畫質：" + (HIGH ? "高" : "省電");

/* 提示文字 */
const v3 = new THREE.Vector3();
function toastAt(x, z, text, color, y) {
  v3.set(x, groundY(x, z) + (y || 1.2), z).project(camera);
  const d = document.createElement("div"); d.className = "toast"; d.textContent = text; d.style.color = color || "#fff";
  d.style.left = (v3.x + 1) / 2 * innerWidth + "px"; d.style.top = (1 - v3.y) / 2 * innerHeight + "px";
  $("toasts").appendChild(d); setTimeout(() => d.remove(), 1200);
}
let tipT = 0;
function tip(t) { $("tip").textContent = t; $("tip").classList.toggle("show", !!t); }
function banner(t, sub, ms) { $("banner").innerHTML = t + (sub ? `<small>${sub}</small>` : ""); $("banner").classList.add("show"); clearTimeout(banner.h); banner.h = setTimeout(() => $("banner").classList.remove("show"), ms || 2400); }

/* ===== 開始、結束 ===== */
$("best").textContent = save.best ? `最佳紀錄：撐過 ${save.best} 夜` : "";
$("start").addEventListener("click", () => {
  if (G.over) { location.reload(); return; }
  $("overlay").classList.add("hide"); G.started = true; banner("第 1 天", "天黑前多撿點木頭、蓋幾盞燈");
});
function gameOver() {
  G.over = true; const nights = G.day - 1;
  if (nights > (save.best || 0)) { save.best = nights; persist(); }
  $("card").innerHTML = `<h1>燈塔熄滅了</h1><p class="sub">你撐過了 ${nights} 個夜晚</p><button id="start">再守一次</button><div class="best">最佳紀錄：撐過 ${save.best || 0} 夜</div>`;
  $("start").addEventListener("click", () => location.reload());
  $("overlay").classList.remove("hide");
}

/* ===== 每一格 ===== */
const clock = new THREE.Clock();
const DBG = { speed: 1 };
let hudT = 0, woodT = 0, now = 0;
const tmpC = new THREE.Color();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05) * DBG.speed; now += dt;
  waterU.uTime.value = now;
  if (G.started && !G.over) G.t += dt;
  if (G.t >= CYCLE) { G.t -= CYCLE; }
  const h = hourAt(G.t), ph = phaseAt(G.t), dark = darkAt(h), E = envAt(h);

  // 階段切換
  if (ph !== G.lastPhase && G.started && !G.over) {
    if (ph === "dusk") banner("太陽下山了", "燈要亮了，黑影快來了");
    if (ph === "night") { planNight(); banner(`第 ${G.day} 夜`, "守住燈塔"); }
    if (ph === "dawn") { foes.forEach((f) => { if (!f.dying) killFoe(f, false); }); }
    if (ph === "day") { G.day++; G.wood += 2; banner(`撐過了第 ${G.day - 1} 夜`, "天亮了，木頭 +2"); }
    G.lastPhase = ph;
  }

  // 天空、太陽、月亮
  skyU.top.value.copy(E.top); skyU.bot.value.copy(E.bot); scene.fog.color.copy(E.bot).lerp(E.top, 0.25);
  // 白天一點薄霧、晚上濃霧（偏青綠），遠處的東西沉進霧裡
  scene.fog.density = lerp(0.0045, 0.03, dark); if (dark > 0.5) scene.fog.color.lerp(tmpC.set("#142830"), (dark - 0.5) * 1.2);
  scene.environmentIntensity = lerp(0.35, 0.1, dark);
  const sa = (h - 6) / 12 * Math.PI, sunDir = new THREE.Vector3(Math.cos(sa) * 0.9, Math.sin(sa), -0.45).normalize();
  const moonDir = new THREE.Vector3(-0.35, 0.55, -0.75).normalize();
  const useMoon = sunDir.y < 0.08;
  const ld = useMoon ? moonDir : sunDir;
  skyU.sunDir.value.copy(sunDir); skyU.sunC.value.copy(E.sunC); skyU.sunA.value = smooth(-0.1, 0.05, sunDir.y);
  sun.position.copy(ld).multiplyScalar(40).add(sun.target.position.set(camS.x, 0, camS.z)); sun.position.y = Math.max(sun.position.y, 6);
  sun.color.copy(E.sunC); sun.intensity = E.sun * (useMoon ? 1 : smooth(0.02, 0.15, sunDir.y));
  hemi.intensity = E.hemi; hemi.color.copy(E.top).lerp(tmpC.set("#ffffff"), 0.5); hemi.groundColor.set("#5a4a32").multiplyScalar(0.6 + 0.4 * (1 - dark));
  moon.position.copy(moonDir).multiplyScalar(270); moon.lookAt(0, 0, 0); moonDisc.material.opacity = dark; moonGlow.material.opacity = dark * 0.7;
  stars.material.opacity = dark;
  waterM.color.copy(E.water);
  foam.material.uniforms.uLight.value = lerp(1, 0.4, dark);
  bloom.strength = HIGH ? E.bloom : 0;
  renderer.toneMappingExposure = 1;

  // 粒子：光塵白天飄、光束在太陽低角度最明顯、地面霧夜晚起
  const dayK = 1 - dark;
  motes.forEach((m) => { m.ph += dt * m.v; m.sp.position.set(m.x + Math.sin(m.ph * 1.3) * 0.6, m.y + Math.sin(m.ph * 0.9) * 0.4 + ((m.ph * 0.15) % 1.5), m.z + Math.cos(m.ph) * 0.6); m.sp.material.opacity = dayK * (0.3 + 0.7 * Math.max(0, Math.sin(m.ph * 4.1 + m.x))); });
  fogs.forEach((f) => { f.ph += dt * f.v; f.sp.position.set(f.x + Math.sin(f.ph) * 2, f.y + Math.sin(f.ph * 1.7) * 0.1, f.z + Math.cos(f.ph * 0.8) * 1.6); f.sp.material.opacity = dark * f.k; });
  const shaftA = dayK * smooth(0.05, 0.25, sunDir.y) * (1 - smooth(0.5, 0.9, sunDir.y)) * 0.16 + dayK * 0.03;
  shafts.forEach((s) => { s.m.uniforms.uA.value = shaftA; s.pl.position.copy(s.base).addScaledVector(sunDir, 8); s.pl.lookAt(s.base.clone().addScaledVector(sunDir, 16)); s.pl.rotateX(Math.PI / 2); s.pl.rotateY(0.6); });
  tickSmoke(dt, 1);
  // 鎮上的路燈、招牌
  townLamps.forEach((l, i) => { const on = smooth(0.12 + (i % 5) * 0.05, 0.32 + (i % 5) * 0.05, dark); l.glow.material.opacity = on; l.pool.material.opacity = on * 0.35; if (l.light) l.light.intensity = on * 3.5; });
  M.lampGlass.emissiveIntensity = 0.08 + dark * 5;
  signMats.forEach((m) => m.emissiveIntensity = dark * 0.9);
  // 窗戶、燈塔
  windowM.emissiveIntensity = 0.05 + dark * 3.2; M.win.emissiveIntensity = 0.05 + dark * 3.0; M.winCool.emissiveIntensity = 0.05 + dark * 2.2;
  housePools.forEach((p) => p.material.opacity = dark * 0.55);
  lampGlassM.emissiveIntensity = 0.3 + dark * 4;
  towerGlow.material.opacity = 0.1 + dark * 0.8; towerGlow.scale.setScalar(2.5 + dark * 3 + Math.sin(now * 3) * 0.15);
  towerLight.intensity = dark * 7;
  towerPool.material.opacity = dark * 0.3;
  beamRig.rotation.y += dt * 0.55;
  beams.forEach((b) => b.material.uniforms.uOpacity.value = dark * 0.5);
  const by = beamRig.rotation.y;
  beamSpot.intensity = dark * 140; beamSpot.target.position.set(Math.sin(by) * 18, 0, Math.cos(by) * 18);
  beamSpot.castShadow = HIGH && dark > 0.2;

  // 光的建築：天黑時一盞一盞亮起來
  builds.forEach((b, i) => {
    const want = smooth(0.15 + (i % 6) * 0.06, 0.35 + (i % 6) * 0.06, dark);
    b.on = lerp(b.on, want, Math.min(1, dt * 3));
    let f = 1;
    if (b.kind === "fire") { f = 0.85 + Math.sin(now * 13 + b.flick) * 0.08 + Math.sin(now * 23 + b.flick) * 0.07; const fl = b.g.userData.flame; fl.scale.set(1 + (f - 1), 0.8 + b.on * 0.4 * f, 1 + (f - 1)); fl.visible = b.on > 0.05; if (b.on > 0.3 && Math.random() < dt * 6) burst(new THREE.Vector3(b.x, b.g.position.y + 0.7, b.z), 0xff9a3a, 1, 0.3); }
    if (b.g.userData.glass) b.g.userData.glass.material.emissiveIntensity = 0.1 + b.on * 5;
    b.glow.material.opacity = b.on * f; b.pool.material.opacity = b.on * 0.35 * f;
    if (b.light) b.light.intensity = b.on * (b.kind === "fire" ? 6 : b.kind === "search" ? 1.5 : 4) * f;
    if (b.kind === "search") {
      let tgt = null, best = RANGE.search;
      foes.forEach((e) => { if (e.dying) return; const d = Math.hypot(e.x - b.x, e.z - b.z); if (d < best) { best = d; tgt = e; } });
      const want = tgt ? Math.atan2(tgt.x - b.x, tgt.z - b.z) : b.yaw + dt * 0.6;
      let d = ((want - b.yaw + Math.PI) % TAU + TAU) % TAU - Math.PI; b.yaw += d * Math.min(1, dt * (tgt ? 5 : 1));
      b.target = tgt && Math.abs(d) < 0.25 ? tgt : null;
      const hd = b.g.userData.head; hd.rotation.y = b.yaw; hd.rotation.x = 0.12;
      b.cone.material.uniforms.uOpacity.value = b.on * 0.65;
      if (b.spot) { const hy = b.g.position.y + 1.25; b.spot.position.set(b.x, hy, b.z); b.spot.target.position.set(b.x + Math.sin(b.yaw) * 6, 0, b.z + Math.cos(b.yaw) * 6); b.spot.intensity = b.on * 40; }
    }
  });
  popping.forEach((o) => { o.userData.pop += dt * 3; const k = Math.min(1, o.userData.pop), c = 1.7; o.scale.setScalar(Math.max(0.01, 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2))); });
  for (let i = popping.length - 1; i >= 0; i--) if (popping[i].userData.pop >= 1) { popping[i].scale.setScalar(1); popping.splice(i, 1); }

  // 玩家移動
  let mx = 0, mz = 0;
  if (keys.w || keys.arrowup) mz -= 1; if (keys.s || keys.arrowdown) mz += 1; if (keys.a || keys.arrowleft) mx -= 1; if (keys.d || keys.arrowright) mx += 1;
  let vx = 0, vz = 0;
  if (G.started && !G.over) {
    if (mx || mz) { P.tx = null; const c = Math.cos(camS.yaw), s = Math.sin(camS.yaw); vx = mx * c + mz * s; vz = -mx * s + mz * c; }
    else if (P.tx != null) { vx = P.tx - P.x; vz = P.tz - P.z; if (Math.hypot(vx, vz) < 0.08) { P.tx = null; vx = vz = 0; } }
  }
  const vl = Math.hypot(vx, vz); P.moving = vl > 0;
  if (P.moving) {
    const sp = 3.4; P.x += vx / vl * sp * dt; P.z += vz / vl * sp * dt;
    colliders.forEach((c) => { const dx = P.x - c.x, dz = P.z - c.z, d = Math.hypot(dx, dz), m = c.r + 0.22; if (d < m && d > 1e-4) { P.x = c.x + dx / d * m; P.z = c.z + dz / d * m; } });
    const a = Math.atan2(P.z, P.x), r = Math.hypot(P.x, P.z), lim = R(a) - 0.3; if (r > lim) { P.x *= lim / r; P.z *= lim / r; }
    const wy = Math.atan2(vx, vz); let d = ((wy - P.yaw + Math.PI) % TAU + TAU) % TAU - Math.PI; P.yaw += d * Math.min(1, dt * 12);
    P.walk += dt * 11;
  }
  player.root.position.set(P.x, groundY(P.x, P.z), P.z); player.root.rotation.y = P.yaw; animWalk(player, P.walk, P.moving);
  player.arms[1].rotation.z = -0.25;
  mk.material.opacity = Math.max(0, mk.material.opacity - dt * 1.6); mk.scale.setScalar(Math.max(1, mk.scale.x - dt));
  // 提燈
  const lanternOn = 0.25 + dark * 0.75;
  lanternGlow.material.opacity = dark; lanternGlass.visible = true;
  lantern.getWorldPosition(v3); lanternLight.position.copy(v3); lanternLight.intensity = dark * 2.5;
  lanternPool.position.set(P.x, groundY(P.x, P.z) + 0.04, P.z); lanternPool.material.opacity = dark * 0.45;
  // 寵物跟著
  const fx = P.x - Math.sin(P.yaw) * 0.8 + Math.cos(P.yaw) * 0.5, fz = P.z - Math.cos(P.yaw) * 0.8 - Math.sin(P.yaw) * 0.5;
  const pdx = fx - petS.x, pdz = fz - petS.z, pd = Math.hypot(pdx, pdz);
  if (pd > 0.25) { const sp = Math.min(pd * 3, 4.2); petS.x += pdx / pd * sp * dt; petS.z += pdz / pd * sp * dt; petS.yaw = Math.atan2(pdx, pdz); petS.walk += dt * 14; }
  pet.position.set(petS.x, groundY(petS.x, petS.z) + (pd > 0.25 ? Math.abs(Math.sin(petS.walk)) * 0.06 : 0), petS.z); pet.rotation.y = petS.yaw;
  if (pet.userData.tail) pet.userData.tail.rotation.z = Math.sin(now * 12) * 0.4;

  // 鎮民
  villagers.forEach((v) => {
    const goIn = dark > 0.45;
    if (goIn) { v.tx = v.door.x; v.tz = v.door.z; }
    else if ((v.wait -= dt) < 0) { v.wait = 2 + Math.random() * 4; const a = Math.random() * TAU; v.tx = v.home.x + Math.cos(a) * 1.2; v.tz = v.home.z + Math.sin(a) * 1.2; }
    const dx = v.tx - v.x, dz = v.tz - v.z, d = Math.hypot(dx, dz), mv = d > 0.06;
    if (mv) { v.x += dx / d * 1.3 * dt; v.z += dz / d * 1.3 * dt; v.yaw = Math.atan2(dx, dz); v.walk += dt * 9; }
    v.inside = lerp(v.inside, goIn && !mv ? 1 : 0, Math.min(1, dt * 4));
    v.c.root.visible = v.inside < 0.95; v.c.root.scale.setScalar(0.62 * (1 - v.inside * 0.6));
    v.c.root.position.set(v.x, groundY(v.x, v.z), v.z); v.c.root.rotation.y = v.yaw; animWalk(v.c, v.walk, mv);
  });

  // 漂流木：白天沿著海岸漂上來
  if (G.started && !G.over && ph === "day" && (woodT += dt) > 3.2) { woodT = 0; if (items.filter((i) => i.kind === "wood").length < 9) { const a = Math.random() * TAU; spawnWood(Math.cos(a) * (R(a) - 0.6), Math.sin(a) * (R(a) - 0.6)); } }
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i]; it.t += dt;
    if (it.m) { it.m.rotation.y += dt * 2; it.m.position.y = 0.45 + Math.sin(now * 3 + i) * 0.08; }
    if (Math.hypot(it.x - P.x, it.z - P.z) < 0.85 && G.started) {
      if (it.kind === "wood") { G.wood++; toastAt(it.x, it.z, "+1 🪵", "#ffe2a0"); } else { G.oil++; toastAt(it.x, it.z, "+1 🛢️", "#ffd27a"); burst(new THREE.Vector3(it.x, 0.9, it.z), 0xffd27a, 8, 1); }
      scene.remove(it.g); items.splice(i, 1);
    } else if (it.kind === "oil" && it.t > 30) { scene.remove(it.g); items.splice(i, 1); }
  }

  // 黑影
  if (G.started && !G.over && ph === "night") { const nt = G.t - PH.day - PH.dusk; while (G.spawns.length && G.spawns[0] <= nt) { G.spawns.shift(); spawnFoe(); } }
  for (let i = foes.length - 1; i >= 0; i--) {
    const f = foes[i]; f.t += dt;
    if (f.dying) {
      f.dying += dt * 2.5; const k = 1 - f.dying; f.g.scale.setScalar(Math.max(0.01, k)); f.aura.material.opacity = k;
      if (f.dying >= 1) { scene.remove(f.g); foes.splice(i, 1); }
      continue;
    }
    if (G.over) continue;
    // 被光照到：受傷、變慢、閃白
    let light = 0;
    builds.forEach((b) => { if (b.on < 0.4) return; const d = Math.hypot(f.x - b.x, f.z - b.z); if (b.kind === "search") { if (b.target === f) light += DPS.search * b.on; } else if (d < RANGE[b.kind]) light += DPS[b.kind] * b.on * (1.2 - d / RANGE[b.kind] * 0.5); });
    const dp = Math.hypot(f.x - P.x, f.z - P.z); if (dp < 2.4 && dark > 0.4) light += 1.6 * (1.2 - dp / 2.4 * 0.5);
    const fa = Math.atan2(f.x, f.z), fd = Math.hypot(f.x, f.z);
    [by, by + Math.PI].forEach((ba) => { const df = Math.abs(((fa - ba + Math.PI) % TAU + TAU) % TAU - Math.PI); if (df < 0.16 && fd > 2 && fd < 17) light += 1.3 * dark; });
    if (fd < 2.1) light += 1.0;
    f.lit = lerp(f.lit, light > 0 ? 1 : 0, Math.min(1, dt * 10));
    f.hp -= light * dt;
    f.bm.emissive.setRGB(0.16 + f.lit * 1.4, 0.09 + f.lit * 1.1, 0.3 + f.lit * 0.6);
    const k = 0.55 + 0.45 * f.hp / f.max; f.g.scale.setScalar(k);
    if (f.hp <= 0) { killFoe(f, false); continue; }
    // 往燈塔走；篝火會把附近的黑影引過去
    let tx = 0, tz = 0;
    builds.forEach((b) => { if (b.kind === "fire" && b.on > 0.4 && Math.hypot(b.x - f.x, b.z - f.z) < 6.5) { tx = b.x; tz = b.z; } });
    const dx = tx - f.x, dz = tz - f.z, d = Math.hypot(dx, dz);
    const sp = f.sp * (1 - f.lit * 0.55), wob = Math.sin(f.t * 2.2) * 0.35;
    f.x += (dx / d + (-dz / d) * wob) * sp * dt; f.z += (dz / d + (dx / d) * wob) * sp * dt;
    f.g.position.set(f.x, Math.max(groundY(f.x, f.z), -0.45) + Math.sin(f.t * 4) * 0.05, f.z); f.g.rotation.y = Math.atan2(dx, dz);
    f.tips.forEach((t, j) => t.scale.y = 1 + Math.sin(f.t * 8 + j * 1.3) * 0.25);
    f.aura.material.opacity = 0.6 - f.lit * 0.4;
    if (tx === 0 && tz === 0 && d < 1.7) { G.hp -= 6 + G.day; G.shake = 0.35; killFoe(f, true); toastAt(0, 0, `燈塔 -${6 + G.day}`, "#ff9a8a", 4); if (G.hp <= 0) { G.hp = 0; gameOver(); } }
  }

  // 螢火蟲
  flies.forEach((fl) => { fl.ph += dt * fl.sp; fl.s.position.set(fl.x + Math.sin(fl.ph * 1.3) * 0.8, fl.y + Math.sin(fl.ph * 2.1) * 0.25, fl.z + Math.cos(fl.ph) * 0.8); fl.s.material.opacity = dark * (0.4 + 0.6 * Math.max(0, Math.sin(fl.ph * 3.1))); });
  // 火花
  for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.t += dt; s.v.y -= dt * 1.2; s.s.position.addScaledVector(s.v, dt); const k = 1 - s.t / s.life; s.s.material.opacity = Math.max(0, k); s.s.scale.setScalar(s.k * (0.4 + k * 0.6)); if (s.t >= s.life) { scene.remove(s.s); s.s.material.dispose(); sparks.splice(i, 1); } }

  // 蓋東西的預覽
  if (ghost) { const p = hover; if (p) { ghost.visible = true; ghost.position.set(p.x, groundY(p.x, p.z), p.z); const ok = placeOk(p.x, p.z) && canAfford(G.build); ghost.traverse((o) => { if (o.isMesh && o.material.color) o.material.opacity = ok ? 0.55 : 0.25; }); } }

  // 鏡頭跟著玩家
  camS.x = lerp(camS.x, P.x, Math.min(1, dt * 3)); camS.z = lerp(camS.z, P.z, Math.min(1, dt * 3));
  const cd = camS.dist * clamp(1.15 / camera.aspect, 1, 1.9);
  const cp = Math.cos(camS.pitch), shake = G.shake > 0 ? (G.shake -= dt, G.shake * 0.4) : 0;
  camera.position.set(camS.x + Math.sin(camS.yaw) * cp * cd + (Math.random() - 0.5) * shake, Math.sin(camS.pitch) * cd + 0.5, camS.z + Math.cos(camS.yaw) * cp * cd + (Math.random() - 0.5) * shake);
  camera.lookAt(camS.x, 0.8, camS.z);

  // 介面
  if ((hudT += dt) > 0.1) {
    hudT = 0;
    $("day").textContent = `第 ${G.day} ${ph === "night" || ph === "dusk" ? "夜" : "天"}`;
    $("phase").textContent = { day: h < 10 ? "早晨" : h < 14 ? "中午" : "下午", dusk: "黃昏", night: "夜晚 · 黑影 " + foes.filter((f) => !f.dying).length, dawn: "黎明" }[ph];
    const prog = ph === "day" ? G.t / PH.day : ph === "dusk" ? (G.t - PH.day) / PH.dusk : ph === "night" ? (G.t - PH.day - PH.dusk) / PH.night : 1;
    $("bar").firstElementChild.style.width = (prog * 100).toFixed(1) + "%";
    $("bar").firstElementChild.style.background = ph === "night" ? "linear-gradient(90deg,#8aa4ff,#c8d4ff)" : "";
    $("hpn").textContent = Math.ceil(G.hp); $("hp").firstElementChild.style.width = G.hp + "%";
    $("wood").textContent = G.wood; $("oil").textContent = G.oil;
    document.querySelectorAll("#build button").forEach((b) => b.classList.toggle("no", !canAfford(b.dataset.b)));
    $("skipbtn").style.display = G.started && ph === "day" ? "" : "none";
  }

  composer.render();
}
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); if (gtao) gtao.setSize(innerWidth, innerHeight); });
camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
// 測試用：在主控台調時間、加速
window.__islelight = { G, P, camS, foes, items, DBG, setHour: (t) => { G.t = t; } };
frame();
