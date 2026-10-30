/* 漂流燈島：白天撿漂流木、蓋燈，晚上用光守住燈塔
   小人和寵物沿用番茄讀書會（chars.js）；光影：即時陰影、泛光、燈塔光束、水面反光、日夜漸變 */
import { THREE, mat, box, cyl, sph, outline, makeChar, makePet } from "./chars.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { makeInterior, ROOM_OF } from "./interior.js";
import { bakeStatic } from "./bake.js";
import { WIND, grassField, tallGrassField, flowerField, leafTree, bush, makeClouds, tickClouds, makeMountains } from "./foliage.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { initArt, M, TEX, tree, pine, rock as rockE, lampPost, grassTufts, tickSmoke, signMats, smokes, tallGrass, signPost } from "./art.js";
import { buildTown, buildExtras, windmills } from "./town.js";

const SAVE_KEY = "kaida-islelight-v1";
const save = (() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "{}"); } catch (e) { return {}; } })();
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* 無痕模式存不了就算了 */ } }
const $ = (id) => document.getElementById(id);
const TAU = Math.PI * 2;
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => { const k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };

/* ===== 畫面 ===== */
// 畫質三級：高（含環境光遮蔽、2x 解析度）、中（關環境光遮蔽、1.5x）、省電（1x、少光源少粒子）。第一次開會自動量測幀率挑一級
const QL = ["high", "mid", "low"].includes(save.quality) ? save.quality : "high";
let HIGH = QL !== "low"; const ULTRA = QL === "high";
const Q = { dpr: { high: 2, mid: 1.5, low: 1 }[QL], lights: { high: 20, mid: 12, low: 8 }[QL], lampLights: { high: 10, mid: 6, low: 3 }[QL], trees: { high: 230, mid: 200, low: 120 }[QL], grass: { high: 9000, mid: 7000, low: 3000 }[QL], motes: { high: 600, mid: 400, low: 200 }[QL], fogs: { high: 150, mid: 90, low: 50 }[QL] };
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.dpr));
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
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 700);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera); composer.addPass(renderPass);
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.8, 0.55, 0.85);
composer.addPass(bloom);
// 環境光遮蔽：角落、屋簷下自然變暗。粒子和光暈在算 AO 時要先藏起來，不然會變成一塊塊方形
const hideForAO = [];
let gtao = null;
if (ULTRA) {
  gtao = new GTAOPass(scene, camera, Math.round(innerWidth * 0.6), Math.round(innerHeight * 0.6)); gtao.output = GTAOPass.OUTPUT.Default; gtao.blendIntensity = 0.85;
  gtao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1, thickness: 1, scale: 1.1, samples: 8, distanceFallOff: 1, screenSpaceRadius: false });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 4, radiusExponent: 1, rings: 2, samples: 12 });
  const gr = gtao.render.bind(gtao); gtao.render = (...a) => { hideForAO.forEach((o) => o.visible = false); gr(...a); hideForAO.forEach((o) => o.visible = true); };
  composer.addPass(gtao);
}
// 色彩分級：飽和一點、對比一點、白天偏暖、邊角壓暗，整體像一張畫
const gradePass = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uVig: { value: 0.32 }, uSat: { value: 1.14 }, uWarm: { value: 0 }, uContrast: { value: 1.07 } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
  fragmentShader: "uniform sampler2D tDiffuse; uniform float uVig, uSat, uWarm, uContrast; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); float l = dot(c.rgb, vec3(.2126, .7152, .0722)); c.rgb = mix(vec3(l), c.rgb, uSat); c.rgb = max((c.rgb - .18) * uContrast + .18, 0.); c.rgb *= vec3(1. + uWarm * .07, 1. + uWarm * .025, 1. - uWarm * .06); vec2 d = vUv - .5; c.rgb *= 1. - uVig * smoothstep(.3, 1., dot(d, d) * 2.4); gl_FragColor = c; }",
});
composer.addPass(gradePass);
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
sky.userData.noBake = true; scene.add(sky);
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
const R = (a) => 48 + 3.2 * Math.sin(3 * a + 0.5) + 2.0 * Math.sin(5 * a + 2) + 1.1 * Math.sin(7 * a) + 0.6 * Math.sin(11 * a + 1);
const RG = (a) => R(a) - 4.0;
/* 地形起伏：燈塔在島中央的高台上，主街往碼頭一路下坡；西北是森林山脊，其他地方是緩緩起伏的草坡。海灘一圈保持平坦 */
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const gbump = (x, z, cx, cz, s) => Math.exp(-((x - cx) * (x - cx) + (z - cz) * (z - cz)) / (s * s));
function hill(x, z) {
  const r = Math.hypot(x, z), a = Math.atan2(z, x), rg = RG(a);
  const fade = 1 - sstep(rg - 8, rg - 1.5, r);
  if (fade <= 0) return 0;
  const h = 2.4 * (1 - sstep(5.5, 17, r)) + 3.4 * gbump(x, z, -27, -25, 12) + 1.5 * gbump(x, z, 26, -7, 11) + 1.3 * gbump(x, z, -21, 19, 9) + 1.2 * gbump(x, z, 15, 31, 8) + 0.9 * gbump(x, z, -8, 34, 7)
    + 0.75 + 0.45 * Math.sin(x * 0.23 + 1) * Math.sin(z * 0.19) + 0.3 * Math.sin(x * 0.11 - z * 0.14);
  return h * fade;
}
function groundY(x, z) {
  const r = Math.hypot(x, z), a = Math.atan2(z, x), rr = R(a), rg = RG(a);
  if (r < rg) return 0.55 + hill(x, z);
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
function islandPart(r0, r1, h, topY, edge, color, tex, open) {
  const g = new THREE.CylinderGeometry(r0, r1, h, 192, 3, !!open);
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
const sand = islandPart(48, 49.8, 1.4, 0.35, R, "#ecd6a2", speckleTex("#ffffff", ["#c9a86a", "#fff4d8", "#b8955a"], 900));
const grassTex = speckleTex("#ffffff", ["#5f8f3e", "#a8cf74", "#4a7a32", "#c4dc8a"], 1600);
const grassSkirt = islandPart(44, 44.5, 0.6, 0.55, RG, "#86b45e", grassTex, true);
// 草地本體：極座標網格，每個頂點照 groundY 抬高，邊緣剛好接在草地側壁上
const grass = (() => {
  const NR = 90, NS = 192, pos = [], uv = [], idx = [];
  for (let i = 0; i <= NR; i++) for (let j = 0; j < NS; j++) { const a = j / NS * TAU, r = RG(a) * i / NR, x = Math.cos(a) * r, z = Math.sin(a) * r; pos.push(x, groundY(x, z), z); uv.push(x / 4, z / 4); }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) { const j1 = (j + 1) % NS, a = i * NS + j, b = i * NS + j1, c = (i + 1) * NS + j, d = (i + 1) * NS + j1; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  if (g.attributes.normal.getY(NS * 40) < 0) { for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; } g.setIndex(idx); g.computeVertexNormals(); }
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#86b45e", map: grassTex, roughness: 0.95 })); m.receiveShadow = true; m.castShadow = true; scene.add(m); return m;
})();

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
const water = new THREE.Mesh(new THREE.PlaneGeometry(440, 440, 240, 240), waterM);
water.rotation.x = -Math.PI / 2; water.receiveShadow = true; water.userData.noBake = true; scene.add(water);
// 岸邊浪花：沿著海岸一圈，一波一波往岸上推
const foam = (() => {
  const seg = 320, pos = [], tv = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const a = i / seg * TAU, rr = R(a);
    [[rr + 0.1, 0], [rr + 2.6, 1]].forEach(([r, t]) => { pos.push(Math.cos(a) * r, 0.04, Math.sin(a) * r); tv.push(t); });
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
function roundTree(x, z, s) { const t = leafTree(scene, x, groundY(x, z), z, s, ["green", "green", "green", "dark", "autumn"][Math.floor(rnd() * 5)]); colliders.push({ x, z, r: 0.4 * s, cr: 1.2 * s }); return t; }
function pineTree(x, z, s) { const t = pine(scene, x, groundY(x, z), z, s); colliders.push({ x, z, r: 0.4 * s, cr: 1.0 * s }); return t; }
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
const TY = groundY(0, 0);
const tower = new THREE.Group(); scene.add(tower); tower.position.y = TY;
cyl(1.4, 1.55, 0.5, "#cfc6b4", 0, 0.25, 0, tower, 24);
cyl(0.78, 1.12, 4.6, "#f8f4ec", 0, 2.8, 0, tower, 28);
[1.6, 3.4].forEach((y) => { const k = (y - 0.5) / 4.6; cyl(lerp(1.12, 0.78, k + 0.08) + 0.02, lerp(1.12, 0.78, k - 0.08) + 0.02, 0.62, "#d0524a", 0, y, 0, tower, 28); });
cyl(1.1, 1.1, 0.14, "#3a3440", 0, 5.15, 0, tower, 28);
const rail = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.03, 6, 40), mat("#3a3440")); rail.rotation.x = Math.PI / 2; rail.position.y = 5.55; tower.add(rail);
for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; cyl(0.02, 0.02, 0.4, "#3a3440", Math.cos(a) * 1.05, 5.36, Math.sin(a) * 1.05, tower, 4); }
const lampGlassM = new THREE.MeshStandardMaterial({ color: "#fff2c8", emissive: "#ffcf6a", emissiveIntensity: 0.3, roughness: 0.2, transparent: true, opacity: 0.85 });
const lampGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.85, 20), lampGlassM); lampGlass.position.y = 5.65; tower.add(lampGlass);
const roofC = new THREE.Mesh(new THREE.ConeGeometry(0.78, 0.7, 20), mat("#d0524a")); roofC.position.y = 6.42; roofC.castShadow = true; tower.add(roofC);
const roofKnob = sph(0.1, "#3a3440", 0, 6.82, 0, tower, 8, 6);
box(0.5, 0.85, 0.1, "#6a4a32", 0, 0.92, 1.08, tower).rotation.x = -0.08;
[[0.85, 2.3], [-0.6, 3.6]].forEach(([a, y]) => { const r0 = lerp(1.12, 0.78, (y - 0.5) / 4.6); const w = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.32), windowM); w.position.set(Math.sin(a) * (r0 + 0.01), y, Math.cos(a) * (r0 + 0.01)); w.rotation.y = a; tower.add(w); });
outline(tower, 0.025);
colliders.push({ x: 0, z: 0, r: 1.6 });
box(0.62, 1.15, 0.14, "#4a3426", 0, 0.98, 1.06, tower); box(0.08, 0.08, 0.06, "#d8b060", 0.2, 0.95, 1.14, tower);
/* 登上燈塔頂：站在瞭望台上，小地圖會顯示全島的黑影 */
let ONTOP = false;
const TOP_Y = TY + 5.22;
const playerY = () => ONTOP ? TOP_Y : groundY(P.x, P.z);
let nearTower = false;
function climbTower() { fadeTo(() => { ONTOP = true; P.x = 0; P.z = 0.86; P.yaw = 0; P.tx = null; P.goDoor = null; camS.x = 0; camS.z = 0.86; camS.fyaw = Math.PI; camS.cdNow = null; camS.free = 0; banner("燈塔瞭望台", "小地圖上看得到島上所有黑影", 2600); }); }
function descendTower() { fadeTo(() => { ONTOP = false; P.x = 0; P.z = 2.3; P.yaw = 0; P.tx = null; camS.x = 0; camS.z = 2.3; camS.fyaw = Math.PI; camS.cdNow = null; camS.free = 0; }); }
const towerGlow = glowSprite(new THREE.Color(1.8, 1.3, 0.6), 5, tower, 5.65);
const towerLight = new THREE.PointLight("#ffc870", 0, 14, 1.4); towerLight.position.y = 5.65; tower.add(towerLight);
const towerPool = lightPool("#ffcf80", 5.5, scene, 0.58);
// 兩道旋轉光束
const beamRig = new THREE.Group(); beamRig.position.y = TY + 5.65; scene.add(beamRig);
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

/* ===== 船與出海打撈 ===== */
// 船停在碼頭旁，按 E 上船就能開出去；海上漂著木箱、油桶、沉船殘骸，靠近自動打撈
const boat = new THREE.Group(); boat.userData.noBake = true; scene.add(boat);
const SEA = { on: false, v: 0, yaw: 0, x: 0, z: 0, moor: null, lamp: null, glow: null, pool: null, bow: new THREE.Vector3(), spawnT: 0, foeT: 0 };
(() => {
  const w = new THREE.Vector3(); boatRef.o.parent.updateMatrixWorld(true); boatRef.o.getWorldPosition(w); boatRef.o.parent.remove(boatRef.o);
  SEA.moor = { x: w.x, z: w.z, yaw: -DOCK_A + Math.PI / 2 }; SEA.x = w.x; SEA.z = w.z; SEA.yaw = SEA.moor.yaw;
  boat.position.set(w.x, -0.05, w.z); boat.rotation.y = SEA.yaw;
  const hull = sph(0.7, "#c8574a", 0, 0, 0, boat, 18, 10); hull.scale.set(0.95, 0.5, 2.1);
  const rim = sph(0.72, "#f3efe6", 0, 0.1, 0, boat, 18, 10); rim.scale.set(0.97, 0.12, 2.14);
  box(1.1, 0.08, 2.4, "#a07a52", 0, 0.22, 0, boat); [-0.55, 0.55].forEach((z) => box(1.0, 0.06, 0.28, "#8e6a46", 0, 0.3, z, boat));
  cyl(0.04, 0.05, 1.9, "#5a3a22", 0, 1.0, -0.2, boat, 8); box(1.0, 0.05, 0.05, "#5a3a22", 0.45, 1.95, -0.2, boat);
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.15), new THREE.MeshStandardMaterial({ color: "#f3efe6", roughness: 0.9, side: THREE.DoubleSide })); sail.position.set(0.47, 1.35, -0.2); sail.castShadow = true; boat.add(sail);
  cyl(0.03, 0.03, 0.6, "#5a3a22", 0, 0.55, 1.1, boat, 6);
  const lampG = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.16), new THREE.MeshStandardMaterial({ color: "#fff2c8", emissive: "#ffcf6a", emissiveIntensity: 0.3, transparent: true, opacity: 0.85 })); lampG.position.set(0, 0.95, 1.1); boat.add(lampG); SEA.lampGlass = lampG;
  SEA.glow = glowSprite(new THREE.Color("#ffb860").multiplyScalar(1.6), 1.1, boat, 0.95); SEA.glow.position.z = 1.1;
  SEA.lamp = new THREE.PointLight("#ffc070", 0, 7, 1.4); SEA.lamp.position.set(0, 1.0, 1.1); boat.add(SEA.lamp);
  SEA.pool = lightPool("#ffb860", 3.0, scene, 0.1);
  outline(boat, 0.02);
})();
const flotsam = [];
function spawnFlotsam() {
  const a = Math.random() * TAU, far = Math.random(), r = 56 + far * 62, x = Math.cos(a) * r, z = Math.sin(a) * r;
  const roll = Math.random(), kind = roll < 0.55 - far * 0.3 ? "crate" : roll < 0.86 ? "barrel" : "wreck";
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.random() * TAU; scene.add(g);
  if (kind === "crate") { box(0.6, 0.5, 0.6, "#b98b5c", 0, 0.1, 0, g); [0.33, -0.1].forEach((y) => box(0.64, 0.06, 0.64, "#5a3a22", 0, y, 0, g)); box(0.06, 0.5, 0.64, "#5a3a22", 0, 0.1, 0, g); }
  else if (kind === "barrel") { const b = cyl(0.26, 0.26, 0.62, "#2f3e5a", 0, 0.12, 0, g, 12); b.rotation.z = Math.PI / 2; [-0.2, 0.2].forEach((x) => { const r = cyl(0.275, 0.275, 0.05, M.iron, x, 0.12, 0, g, 12); r.rotation.z = Math.PI / 2; }); sph(0.07, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.7, 0.6) }), 0.32, 0.12, 0, g, 8, 6); }
  else { [[0, 0.05, 0, 0.3], [0.2, 0.1, 0.25, -0.5], [-0.25, 0.0, -0.1, 1.2]].forEach(([x, y, z, ry]) => { const pl = box(1.1, 0.06, 0.22, "#6a4a32", x, y, z, g); pl.rotation.y = ry; pl.rotation.z = (ry - 0.3) * 0.1; }); cyl(0.2, 0.2, 0.06, M.brass, 0.1, 0.2, 0.1, g, 8); for (let i = 0; i < 6; i++) { const t = i / 6 * TAU; box(0.08, 0.06, 0.08, M.brass, 0.1 + Math.cos(t) * 0.22, 0.2, 0.1 + Math.sin(t) * 0.22, g); } }
  outline(g, 0.015);
  g.userData.noBake = true; flotsam.push({ kind, g, x, z, t: Math.random() * 10, drift: Math.random() * TAU });
}
for (let i = 0; i < 10; i++) spawnFlotsam();
let nearBoat = false, canLand = false;
function boardBoat() {
  if (SEA.on || IN) return;
  SEA.on = true; P.tx = null; SEA.v = 0;
  [player.root, pet].forEach((o) => { if (o.parent) o.parent.remove(o); boat.add(o); });
  player.root.position.set(0, 0.26, -0.5); player.root.rotation.y = 0; pet.position.set(0, 0.26, 0.45); pet.rotation.y = Math.PI;
  camS.x = SEA.x; camS.z = SEA.z; camS.fyaw = SEA.yaw + Math.PI; camS.cdNow = null; camS.free = 0;
  $("build").style.display = "none"; setBuild(null); banner("出海", "靠近漂浮物自動打撈，天黑前回港");
}
function landBoat() {
  if (!SEA.on) return;
  SEA.on = false; SEA.v = 0; SEA.x = SEA.moor.x; SEA.z = SEA.moor.z; SEA.yaw = SEA.moor.yaw; boat.rotation.set(0, SEA.yaw, 0);
  [player.root, pet].forEach((o) => { boat.remove(o); scene.add(o); });
  P.x = DOCK_X; P.z = DOCK_Z; P.yaw = Math.atan2(-P.x, -P.z); P.tx = null; petS.x = P.x + 0.5; petS.z = P.z + 0.3;
  camS.x = P.x; camS.z = P.z; camS.fyaw = P.yaw + Math.PI; camS.cdNow = null; camS.free = 0;
  $("build").style.display = "";
}

/* ===== 小鎮 ===== */
// 鎮上原本就有的路燈：模型＋光暈＋地面光，真正的點光源只給前幾盞（手機吃不消）
const townLamps = [];
function addLamp(parent, x, y, z) {
  const g = lampPost(parent, x, y, z); outline(g, 0.014);
  const glow = glowSprite(new THREE.Color("#ffb860").multiplyScalar(1.6), 1.1, g, 1.85);
  const pool = lightPool("#ffb860", 3.2, g, 0.04);
  const w = new THREE.Vector3(); g.updateMatrixWorld(true); g.getWorldPosition(w);
  townLamps.push({ g, glow, pool, light: null, x: w.x, z: w.z, y: w.y });
  colliders.push({ x: w.x, z: w.z, r: 0.3 });
  return g;
}
/* 劍盾式分區：燈塔廣場 → 主街（商店街，往南通碼頭）／北街（住宅區，盡頭是鐘樓）／橫街 → 兩側土路通往野外（高草、池塘、農田、風車） */
const A = (deg) => deg * Math.PI / 180;
const DOCK_T = Math.atan2(Math.cos(DOCK_A), Math.sin(DOCK_A));
const DOCK_X = Math.cos(DOCK_A) * (R(DOCK_A) - 1), DOCK_Z = Math.sin(DOCK_A) * (R(DOCK_A) - 1);
const HPI = Math.PI / 2;
const ROADS = [
  { x0: 0, z0: 4, x1: 0, z1: 32.5, w: 3.0, kind: "cobble" },            // 主街
  { x0: 0, z0: 32.5, x1: DOCK_X, z1: DOCK_Z, w: 2.4, kind: "cobble" },   // 碼頭路
  { x0: 0, z0: -4, x1: 0, z1: -27, w: 2.6, kind: "cobble" },             // 北街（住宅區）
  { x0: -22, z0: -15, x1: 22, z1: -15, w: 2.6, kind: "cobble" },         // 橫街
  { x0: -1.5, z0: 19.5, x1: -22.5, z1: 19.5, w: 2.2, kind: "dirt" },     // 西路線 → 池塘
  { x0: 1.5, z0: 18.7, x1: 17.5, z1: 18.7, w: 2.2, kind: "dirt" },       // 東路線 → 農田
  { x0: 17.5, z0: 18.7, x1: 17.5, z1: 34, w: 2.0, kind: "dirt" },        // 東路線往南 → 番茄田
  { x0: -22, z0: -15, x1: -33, z1: -27, w: 2.0, kind: "dirt" },          // 西北路線 → 風車、森林
  { x0: 22, z0: -15, x1: 27, z1: -12.5, w: 2.0, kind: "dirt" },          // 東北路線 → 小池塘
  { x0: 27, z0: -12.5, x1: 36, z1: -22, w: 2.0, kind: "dirt" },          // 東北路線 → 森林
];
const LAYOUT = [
  // 主街西側（面向東）／東側（面向西）
  ["library", -6.8, 9, HPI], ["cafe", -6.3, 16, HPI], ["bookstore", -6.3, 23.5, HPI], ["inn", -6.8, 30.5, HPI],
  ["bakery", 6.4, 9, -HPI], ["konbini", 6.4, 15, -HPI], ["school", 7.0, 23, -HPI], ["house", 6.3, 30, -HPI, 1],
  // 北街兩側
  ["house", -5.6, -8, HPI, 0], ["house", 5.6, -8, -HPI, 1], ["house", -5.6, -22, HPI, 2], ["house", 5.6, -22, -HPI, 3],
  // 橫街北側（面向南）／南側（面向北）
  ["house", -12, -19.6, 0, 1], ["cafe", -18.5, -19.6, 0], ["house", 12, -19.6, 0, 3], ["bookstore", 18.5, -19.6, 0],
  ["house", -12, -10.4, Math.PI, 2], ["inn", -18.5, -10.4, Math.PI], ["house", 12, -10.4, Math.PI, 0], ["bakery", 18.5, -10.4, Math.PI],
  ["chapel", 0, -30.5, 0],
];
const EXTRAS = [
  ["pond", -26.5, 21.5, 3.2], ["pond", 29, -8.5, 2.3],
  ["field", 22.5, 22.5, 0, 7, 5, "wheat"], ["field", 29.5, 16, 0, 5, 4, "cabbage"], ["field", 22.5, 32, 0, 5, 4, "tomato"],
  ["windmill", -29, -17.5, HPI],
];
// 高草叢：[x, z, 寬, 深, 轉角]
const TALL = [[-13, 14.5, 7, 4.5, 0], [-16, 25, 6, 5, 0.3], [-24, 11, 5, 5, -0.2], [-9, 27, 5, 4, 0.2], [11, 24.5, 5, 4, 0], [25, 10, 6, 4, 0.4], [12, 33, 6, 4.5, -0.3], [30, 2, 5, 5, 0], [-27, -5, 6, 6, 0.2], [-20, -32, 6, 4, 0], [28, -28, 5, 5, 0.3], [-14, -27, 5, 4, -0.2], [-33, 4, 5, 4, 0.1], [20, -2, 4.5, 4, 0], [-18, 34, 5, 4, 0.2], [33, 26, 5, 4, 0.1]];
const SIGNS = [[2.3, 5.2, A(200), ["主街", "碼頭 ⇣"]], [-2.3, -5.2, A(20), ["住宅區", "鐘樓 ⇡"]], [-2.6, 21.3, A(150), ["⇠ 池塘", "西野原"]], [2.6, 17, A(-150), ["農田 ⇢"]], [-23, -13.1, A(60), ["⇠ 風車", "森林"]], [23, -17, A(-100), ["小池塘 ⇢"]]];
const town = buildTown({ scene, lightPool, housePools, colliders, groundY, addLamp, roads: ROADS, coastR: R(DOCK_A) - 1, y: 0.55, layout: LAYOUT });
const extras = buildExtras(EXTRAS); extras.forEach((e) => { if (e && e.name) town.push(e); });
TALL.forEach(([x, z, w, d, ry]) => tallGrassField(scene, x, z, w, d, ry, groundY));
SIGNS.forEach(([x, z, ry, texts]) => { signPost(scene, x, z, ry, texts, groundY(x, z)); colliders.push({ x, z, r: 0.2 }); });
function freeSpot(x, z, pad) { return colliders.every((c) => Math.hypot(c.x - x, c.z - z) > c.r + pad); }
function segDist(x, z, r) { const dx = r.x1 - r.x0, dz = r.z1 - r.z0, l2 = dx * dx + dz * dz; const t = clamp(((x - r.x0) * dx + (z - r.z0) * dz) / l2, 0, 1); return Math.hypot(x - r.x0 - dx * t, z - r.z0 - dz * t); }
function onRoad(x, z, pad) { if (Math.hypot(x, z) < 4.8 + pad) return true; return ROADS.some((r) => segDist(x, z, r) < r.w / 2 + pad); }
function inTall(x, z) { return TALL.some(([tx, tz, w, d]) => Math.abs(x - tx) < w / 2 + 0.3 && Math.abs(z - tz) < d / 2 + 0.3); }
const FOREST = [[-46, -46, -13, -24], [13, -46, 46, -24], [-46, 26, -19, 46], [27, 30, 46, 46]]; // 森林：x0, z0, x1, z1
function inForest(x, z) { return FOREST.some(([x0, z0, x1, z1]) => x > x0 && x < x1 && z > z0 && z < z1); }
for (let i = 0, n = 0; i < 8000 && n < Q.trees; i++) {
  const a = rnd() * TAU, r = 5.5 + rnd() * (RG(a) - 6.5), x = Math.cos(a) * r, z = Math.sin(a) * r;
  const forest = inForest(x, z);
  if (!forest && rnd() < 0.7) continue;
  if (Math.abs(a - DOCK_A) < 0.12 || onRoad(x, z, 1.0) || inTall(x, z) || !freeSpot(x, z, forest ? 0.9 : 1.6)) continue;
  (forest ? (n % 3 ? pineTree : roundTree) : (n % 5 === 4 ? pineTree : roundTree))(x, z, 0.85 + rnd() * 0.6); n++;
}
for (let i = 0, n = 0; i < 1500 && n < 32; i++) {
  const a = rnd() * TAU, r = RG(a) + 0.6 + rnd() * 1.6, x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (Math.abs(a - DOCK_A) < 0.3 || !freeSpot(x, z, 1.4)) continue;
  palm(x, z, 0.9 + rnd() * 0.35, rnd() * TAU); n++;
}
for (let i = 0, n = 0; i < 1000 && n < 44; i++) {
  const a = rnd() * TAU, r = R(a) - 0.4 + rnd() * 1.2, x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (Math.abs(a - DOCK_A) < 0.25 || !freeSpot(x, z, 0.6)) continue;
  rock(x, z, 0.6 + rnd() * 1.0); n++;
}
grassField(scene, Math.round(Q.grass * 0.7), () => { const a = rnd() * TAU, r = 4.5 + rnd() * (RG(a) - 5); const x = Math.cos(a) * r, z = Math.sin(a) * r; if (onRoad(x, z, 0.3) || inTall(x, z) || !freeSpot(x, z, 0.2)) return null; return new THREE.Vector3(x, groundY(x, z), z); });
// 路邊：野花與灌木，沿著道路兩側長
flowerField(scene, HIGH ? 1400 : 500, () => { const a = rnd() * TAU, r = 4.5 + rnd() * (RG(a) - 5); const x = Math.cos(a) * r, z = Math.sin(a) * r; if (!onRoad(x, z, 2.6) || onRoad(x, z, 0.5) || inTall(x, z) || !freeSpot(x, z, 0.25)) return null; return new THREE.Vector3(x, groundY(x, z), z); });
for (let i = 0, n = 0; i < 3000 && n < (HIGH ? 130 : 60); i++) { const a = rnd() * TAU, r = 5 + rnd() * (RG(a) - 6), x = Math.cos(a) * r, z = Math.sin(a) * r; if (!onRoad(x, z, 2.0) || onRoad(x, z, 1.0) || inTall(x, z) || !freeSpot(x, z, 0.9)) continue; bush(scene, x, groundY(x, z), z, 0.7 + rnd() * 0.6, rnd() < 0.15 ? "autumn" : "green"); colliders.push({ x, z, r: 0.45 }); n++; }
const clouds = makeClouds(scene, HIGH ? 16 : 8), mountains = makeMountains(scene);
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
for (let i = 0; i < Q.lights; i++) { const l = new THREE.PointLight("#ffb860", 0, 8, 1.5); l.position.set(0, -50, 0); scene.add(l); POINTS.push({ l, used: false }); }
const SPOTS = [];
for (let i = 0; i < 4; i++) { const l = new THREE.SpotLight("#e8f0ff", 0, 16, 0.24, 0.5, 1.2); l.position.set(0, -50, 0); scene.add(l); scene.add(l.target); SPOTS.push({ l, used: false }); }
function takeLight(pool) { const s = pool.find((p) => !p.used); if (s) s.used = true; return s && s.l; }
// 鎮上的路燈：離燈塔近的先拿到真的點光源
townLamps.sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z)).slice(0, Q.lampLights).forEach((l) => { l.light = takeLight(POINTS); if (l.light) { l.light.position.set(l.x, l.y + 1.95, l.z); l.light.distance = 7; } });

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
  const g = buildModel(kind); g.position.set(x, y != null ? y : groundY(x, z), z); g.userData.noBake = true; scene.add(g);
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
// 粒子（螢火蟲、光塵）用 Points：幾百顆只算一個 draw call，亮度寫在頂點色
function makePoints(n, size, base) {
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3)); geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const m = new THREE.PointsMaterial({ map: GLOW, size, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, sizeAttenuation: true, fog: false });
  const pts = new THREE.Points(geo, m); pts.frustumCulled = false; pts.userData.noBake = true; scene.add(pts); hideForAO.push(pts);
  return { pts, pos: geo.attributes.position, col: geo.attributes.color, base };
}
const flies = [], fliesP = makePoints(160, 0.5, new THREE.Color(1.6, 2.2, 0.7));
for (let i = 0; i < 160; i++) { const a = Math.random() * TAU, r = 3 + Math.random() * 42; flies.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, y: 0.8 + Math.random() * 1.4, ph: Math.random() * 10, sp: 0.3 + Math.random() * 0.5 }); }

/* ===== 氛圍：早晨的光塵與光束、夜晚的地面濃霧 ===== */
const motes = [], fogs = [], shafts = [];
{
  const mm = new THREE.SpriteMaterial({ map: GLOW, color: new THREE.Color(2.2, 2.0, 1.5), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
  for (let i = 0; i < Q.motes; i++) { const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * 46; motes.push({ k: 0.6 + Math.random() * 0.8, x: Math.cos(a) * r, y: 0.8 + Math.random() * 4, z: Math.sin(a) * r, ph: Math.random() * 10, v: 0.15 + Math.random() * 0.3 }); }
  motes.P = makePoints(motes.length, 0.26, new THREE.Color(2.2, 2.0, 1.5)); mm.dispose();
  const fm = new THREE.SpriteMaterial({ map: GLOW, color: new THREE.Color("#6f8f98"), depthWrite: false, transparent: true, opacity: 0, fog: false });
  for (let i = 0; i < Q.fogs; i++) { const sp = new THREE.Sprite(fm.clone()); const k = 6 + Math.random() * 8; sp.scale.set(k, k * 0.35, 1); scene.add(sp); hideForAO.push(sp); const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * 52; fogs.push({ sp, x: Math.cos(a) * r, y: 0.6 + Math.random() * 0.5, z: Math.sin(a) * r, ph: Math.random() * 10, v: 0.04 + Math.random() * 0.06, k: 0.16 + Math.random() * 0.16 }); }
  const sm = new THREE.ShaderMaterial({ uniforms: { uC: { value: new THREE.Color("#fff4d8") }, uA: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: "uniform vec3 uC; uniform float uA; varying vec2 vUv; void main(){ float a = smoothstep(0.,.25,vUv.x)*smoothstep(1.,.75,vUv.x) * pow(vUv.y,1.6) * uA; gl_FragColor = vec4(uC*a, a); }" });
  for (let i = 0; i < 14; i++) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(2 + (i % 3), 18), sm); pl.renderOrder = 3; scene.add(pl); hideForAO.push(pl); const a = i / 14 * TAU, r = 8 + (i % 3) * 13; shafts.push({ pl, base: new THREE.Vector3(Math.cos(a) * r, groundY(Math.cos(a) * r, Math.sin(a) * r) - 0.5, Math.sin(a) * r), m: sm }); }
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
// 手持探照燈：從提燈射出一道光錐，照到的黑影會被溶掉
const TORCH = { len: 7.5, ang: 0.3 };
const torchCone = beamCone(TORCH.len, Math.tan(TORCH.ang) * TORCH.len, "#ffe6b0"); scene.add(torchCone);
const torchSpot = new THREE.SpotLight("#ffe6b0", 0, 10, TORCH.ang + 0.1, 0.55, 1.2); scene.add(torchSpot); scene.add(torchSpot.target);
torchSpot.castShadow = HIGH; torchSpot.shadow.mapSize.set(1024, 1024); torchSpot.shadow.bias = -0.0005; torchSpot.shadow.camera.near = 0.3; torchSpot.shadow.camera.far = 12;
const torchDir = new THREE.Vector3(), torchPos = new THREE.Vector3();
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
  const c = makeChar(LOOKS[i % LOOKS.length]); c.root.scale.setScalar(0.62); c.root.userData.noBake = true; scene.add(c.root);
  return { c, home: { x: b.front.x, z: b.front.z }, door: { x: b.door.x, z: b.door.z }, x: b.front.x, z: b.front.z, tx: b.front.x, tz: b.front.z, wait: Math.random() * 3, walk: 0, yaw: 0, inside: 0 };
});
/* ===== 進出建築 ===== */
// 室內是另一個 THREE.Scene；進門時把玩家、寵物、提燈搬過去，相機與移動改用房間的座標和碰撞
let IN = null; const rooms = {};
const fadeEl = $("fade");
function fadeTo(fn) { fadeEl.classList.add("on"); setTimeout(() => { fn(); setTimeout(() => fadeEl.classList.remove("on"), 60); }, 380); }
function roomFor(b) {
  const kind = ROOM_OF[b.kind] || ROOM_OF[b.name] || "house", key = kind + ":" + b.name;
  if (!rooms[key]) {
    const r = makeInterior(kind); r.hideAO = [];
    if (r.npc) { const c = makeChar(LOOKS[Math.abs(Math.round(b.x * 7 + b.z * 13)) % LOOKS.length]); c.root.scale.setScalar(0.62); c.root.position.set(r.npc.x, 0.55, r.npc.z); c.root.rotation.y = r.npc.yaw; r.scene.add(c.root); r.npcChar = c; }
    rooms[key] = r;
  }
  return rooms[key];
}
function moveActors(to) { [player.root, pet, lanternLight, lanternPool, torchCone, torchSpot, torchSpot.target].forEach((o) => { if (o.parent) o.parent.remove(o); to.add(o); }); }
function enterBuilding(b) {
  if (IN || G.over) return;
  const room = roomFor(b);
  fadeTo(() => {
    IN = { b, room }; moveActors(room.scene); renderPass.scene = room.scene; if (gtao) gtao.scene = room.scene;
    P.x = room.entry.x; P.z = room.entry.z; P.yaw = Math.PI; P.tx = null; petS.x = P.x + 0.6; petS.z = P.z + 0.3;
    camS.x = P.x; camS.z = P.z; camS.fyaw = 0; camS.cdNow = null; camS.free = 0; camS.fdistOut = camS.fdist; camS.fdist = Math.min(camS.fdist, 6);
    $("build").style.display = "none"; setBuild(null); banner(b.name, "按 E 或點門口離開", 1800); setTimeout(() => { if (IN && IN.b === b) renderShop(b); }, 500);
  });
}
function leaveBuilding() {
  if (!IN) return;
  const b = IN.b;
  fadeTo(() => {
    IN = null; moveActors(scene); renderPass.scene = scene; if (gtao) gtao.scene = scene;
    P.x = b.front.x; P.z = b.front.z; P.yaw = b.ry; P.tx = null; petS.x = P.x + Math.cos(b.ry) * 0.6; petS.z = P.z - Math.sin(b.ry) * 0.6;
    camS.x = P.x; camS.z = P.z; camS.fyaw = b.ry + Math.PI; camS.cdNow = null; camS.free = 0; if (camS.fdistOut) camS.fdist = camS.fdistOut;
    $("build").style.display = ""; $("shop").classList.remove("show");
  });
}
/* 室內商店：進建築後跳出面板，光晶（💎）和零件（🔩）換藍圖、升級、補給、buff */
const SHOP = {
  library: [
    { id: "bp", name: "探照燈藍圖", desc: "解鎖探照燈，會自動瞄準黑影", cost: { cry: 6 }, once: () => G.bp.search, buy: () => { G.bp.search = true; } },
    { id: "range", name: "燈塔鏡片 I：射程", desc: "光束射程 +5", cost: { cry: 10, parts: 2 }, once: () => G.up.range >= 1, buy: () => { G.up.range = 1; } },
    { id: "bright", name: "燈塔燈芯 II：亮度", desc: "光束傷害 +50%", cost: { cry: 16, parts: 3 }, once: () => G.up.bright >= 1, buy: () => { G.up.bright = 1; } },
  ],
  cafe: [
    { id: "coffee", name: "濃縮咖啡", desc: "今天移動速度 +30%", cost: { cry: 3 }, once: () => G.buff.speed, buy: () => { G.buff.speed = 1; } },
    { id: "cake", name: "蜂蜜蛋糕", desc: "燈塔修復 +20", cost: { cry: 4 }, once: () => G.hp >= 100, buy: () => { G.hp = Math.min(100, G.hp + 20); } },
  ],
  konbini: [
    { id: "oil", name: "燈油 ×1", desc: "探照燈的燃料", cost: { cry: 2 }, buy: () => { G.oil += 1; } },
    { id: "wood", name: "木頭 ×2", desc: "從對岸運來的", cost: { cry: 2 }, buy: () => { G.wood += 2; } },
    { id: "parts", name: "零件 ×1", desc: "燈塔升級用", cost: { cry: 8 }, buy: () => { G.parts += 1; } },
  ],
};
SHOP.school = SHOP.bookstore = SHOP.library; SHOP.bakery = SHOP.inn = SHOP.cafe;
const SHOP_TITLE = { library: "📚 圖書館：藍圖與燈塔升級", school: "📚 學校：藍圖與燈塔升級", bookstore: "📚 書店：藍圖與燈塔升級", cafe: "☕ 咖啡廳", bakery: "🥐 麵包店", inn: "🛏️ 旅店", konbini: "🏪 便利商店" };
const costText = (c) => Object.entries(c).map(([k, v]) => ({ cry: "💎", parts: "🔩" }[k] + v)).join(" ");
const canPay = (c) => Object.entries(c).every(([k, v]) => G[k] >= v);
function renderShop(b) {
  const list = SHOP[b.kind]; if (!list) { $("shop").classList.remove("show"); return; }
  $("shop").querySelector("h3").textContent = SHOP_TITLE[b.kind] || b.name;
  const ul = $("shop").querySelector("ul"); ul.innerHTML = "";
  list.forEach((it) => {
    const done = it.once && it.once(); const li = document.createElement("li");
    li.innerHTML = `<div><b>${it.name}</b><small>${it.desc}</small></div><button ${done || !canPay(it.cost) ? "disabled" : ""}>${done ? "已擁有" : costText(it.cost)}</button>`;
    li.querySelector("button").addEventListener("click", () => { if (done || !canPay(it.cost)) return; Object.entries(it.cost).forEach(([k, v]) => G[k] -= v); it.buy(); toastAt(P.x, P.z, it.name, "#ffe2a0", 1.4); renderShop(b); });
    ul.appendChild(li);
  });
  $("shop").classList.add("show");
}
$("shopclose").addEventListener("click", () => $("shop").classList.remove("show"));
let nearDoor = null;
function doorAction() { if (IN) { if (P.z > IN.room.exitZ - 0.9) leaveBuilding(); } else if (SEA.on) { if (canLand) landBoat(); } else if (ONTOP) descendTower(); else if (nearTower) climbTower(); else if (nearBoat) boardBoat(); else if (nearDoor) enterBuilding(nearDoor); }
$("prompt").addEventListener("click", doorAction);
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
  g.userData.noBake = true; items.push({ kind: "wood", g, x, z, t: 0 });
}
function spawnShard(x, z) {
  const g = new THREE.Group(); g.position.set(x, groundY(x, z), z); scene.add(g);
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.8, 0.6) })); m.position.y = 0.45; g.add(m);
  glowSprite(new THREE.Color(1.4, 0.9, 0.3), 1.1, g, 0.45);
  g.userData.noBake = true; items.push({ kind: "oil", g, x, z, t: 0, m });
}

/* ===== 黑影 ===== */
const foes = [];
const foeBodyM = new THREE.MeshStandardMaterial({ color: "#0d0a18", emissive: "#2a1650", emissiveIntensity: 0.6, roughness: 1 });
function spawnFoe(sx, sz, sea) {
  const a = Math.random() * TAU, r = R(a) + 4.5, x = sx == null ? Math.cos(a) * r : sx, z = sz == null ? Math.sin(a) * r : sz;
  const g = new THREE.Group(); scene.add(g);
  const bm = foeBodyM.clone();
  const body = sph(0.36, bm, 0, 0.42, 0, g, 16, 12); body.scale.set(1, 1.25, 1);
  const tips = [];
  for (let i = 0; i < 5; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 6), bm); const ta = i / 5 * TAU; t.position.set(Math.cos(ta) * 0.16, 0.86, Math.sin(ta) * 0.16); t.rotation.set(Math.sin(ta) * 0.5, 0, -Math.cos(ta) * 0.5); t.castShadow = true; g.add(t); tips.push(t); }
  const eyeM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.2, 0.9) });
  [-0.12, 0.12].forEach((ex) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), eyeM); e.position.set(ex, 0.52, 0.3); e.scale.y = 1.4; g.add(e); });
  const aura = glowSprite(new THREE.Color(0.5, 0.2, 1.1), 2.2, g, 0.5); aura.material.opacity = 0.7;
  const day = G.day;
  const f = { g, body, bm, tips, aura, x, z, hp: 2.2 + day * 0.35, max: 2.2 + day * 0.35, sp: 1.7 + Math.min(day, 8) * 0.1, t: Math.random() * 10, lit: 0, dying: 0, sea: !!sea, boss: sea === "boss" };
  if (f.boss) { f.hp = f.max = 30 + day * 6; f.sp = 1.0; g.scale.setScalar(2.6); aura.scale.multiplyScalar(1.4); bm.emissive.set("#4a1a80"); f.sea = false; }
  f.g.position.set(x, -0.4, z); foes.push(f); return f;
}
function killFoe(f, byTower) {
  f.dying = 0.001;
  const p = new THREE.Vector3(f.x, f.g.position.y + 0.5, f.z);
  if (byTower) burst(p, 0x8a5aff, 18, 1.8);
  else {
    burst(p, 0xffd27a, 16, 1.6); if (Math.random() < 0.65) spawnShard(f.x, f.z);
    if (f.boss) { G.cry += 12; G.parts += 3; banner("魔王消散了", "光晶 +12，零件 +3"); burst(p, 0xffffff, 40, 3); }
    else { G.cry += 1; G.lightKills++; }
  }
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
  [7, "#3f7fd0", "#ffd9b0", "#ffd2a0", 2.4, 0.85, "#2f8aa4", 0.3],
  [12, "#2862c4", "#bfe0ff", "#fff6e6", 3.1, 1.05, "#2a92b0", 0.22],
  [16, "#3670c0", "#ffe2b8", "#ffe0b0", 2.6, 0.9, "#2f8aa4", 0.28],
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
const G = { started: false, over: false, won: false, t: 0, day: 1, wood: 4, oil: 0, parts: 0, cry: 0, bp: { search: false }, up: { range: 0, bright: 0 }, buff: { speed: 0, calm: 0 }, lightKills: 0, hp: 100, build: null, spawns: [], woodTimer: 0, shake: 0, lastPhase: "day" };
// 難度曲線：前三夜教學坡度，之後每三夜一個小高峰，第 15 夜是魔王夜，過關後進無盡模式線性加碼
const WEEKEND = [0, 6].includes(new Date().getDay());
function nightCount(day) { if (day > 15) return 28 + (day - 15) * 3; return Math.round(4 + day * 1.6 + (day % 3 === 0 ? 2 + day * 0.3 : 0)); }
function planNight() {
  const n = nightCount(G.day), list = [];
  for (let i = 0; i < n; i++) { const k = i / n; list.push(PH.night * (0.04 + 0.66 * k + Math.random() * 0.06)); }
  G.spawns = list.sort((a, b) => a - b);
  G.boss = (WEEKEND || G.day === 15 || (G.day > 15 && G.day % 5 === 0)) ? PH.night * 0.45 : null; // 魔王出現的時間點
}
const startT = 0;
G.t = startT;
// 開場先送兩盞燈：一盞在碼頭、一盞在燈塔前
addBuild("lamp", dockLampAt.x, dockLampAt.z, true, 0.42);
addBuild("lamp", 3.0, 6.8, true);
for (let i = 0; i < 18; i++) { const a = Math.random() * TAU; spawnWood(Math.cos(a) * (R(a) - 0.7), Math.sin(a) * (R(a) - 0.7)); }

/* ===== 鏡頭與操作 ===== */
const camS = { yaw: 0.35, pitch: 0.8, dist: 34, x: 0, z: 5, mode: save.cam || "follow", fyaw: 0.2, fpitch: 0.2, fdist: 6.2, free: 0 };
const camLimits = () => camS.mode === "follow" ? { dmin: 4, dmax: 16, pmin: 0.08, pmax: 0.95 } : { dmin: 9, dmax: 110, pmin: 0.45, pmax: 1.3 };
function setCamMode(m) { camS.mode = m; save.cam = m; persist(); $("cam").textContent = m === "follow" ? "視角：跟隨" : "視角：俯視"; }
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function groundHit(cx, cy) {
  ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  const h = ray.intersectObjects(IN ? [IN.room.floor] : [grass, sand, water], false)[0];
  return h ? h.point : null;
}
const ptrs = new Map(); let drag = null, pinch = 0, hover = null;
const cvs = renderer.domElement;
cvs.addEventListener("pointerdown", (e) => { cvs.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY }); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); drag = "pinch"; } else drag = null; });
cvs.addEventListener("pointermove", (e) => {
  const p = ptrs.get(e.pointerId);
  if (!p) { hover = groundHit(e.clientX, e.clientY); return; }
  const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) { const L = camLimits(); if (camS.mode === "follow") camS.fdist = clamp(camS.fdist * pinch / d, L.dmin, L.dmax); else camS.dist = clamp(camS.dist * pinch / d, L.dmin, L.dmax); } pinch = d; return; }
  if (!drag && Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 8) drag = "rot";
  if (drag === "rot") { const L = camLimits(); if (camS.mode === "follow") { camS.fyaw -= dx * 0.008; camS.fpitch = clamp(camS.fpitch + dy * 0.004, L.pmin, L.pmax); camS.free = 2.5; } else { camS.yaw -= dx * 0.008; camS.pitch = clamp(camS.pitch + dy * 0.004, L.pmin, L.pmax); } }
  if (e.pointerType === "mouse") hover = groundHit(e.clientX, e.clientY);
});
function endPtr(e) {
  const p = ptrs.get(e.pointerId); ptrs.delete(e.pointerId);
  if (!p || drag || !G.started || G.over) { if (!ptrs.size) drag = null; return; }
  const hit = groundHit(e.clientX, e.clientY); if (!hit) return;
  if (G.build) { tryPlace(hit.x, hit.z); return; }
  if (IN) { P.tx = hit.x; P.tz = hit.z; return; }
  if (SEA.on) { P.tx = hit.x; P.tz = hit.z; mk.position.set(hit.x, 0.14, hit.z); mk.material.opacity = 0.9; mk.scale.setScalar(1.4); return; }
  // 點到建築門口附近：走過去並自動進門
  let gb = null, gd = 3.2; town.forEach((b) => { const d = Math.hypot(hit.x - b.door.x, hit.z - b.door.z); if (d < gd) { gd = d; gb = b; } });
  if (gb) { P.goDoor = gb; P.tx = gb.door.x; P.tz = gb.door.z; marker(P.tx, P.tz); tip(`走去 ${gb.name}…`); return; }
  P.goDoor = null;
  const a = Math.atan2(hit.z, hit.x), r = Math.min(Math.hypot(hit.x, hit.z), R(a) - 0.3);
  P.tx = Math.cos(a) * r; P.tz = Math.sin(a) * r; marker(P.tx, P.tz);
}
cvs.addEventListener("pointerup", endPtr); cvs.addEventListener("pointercancel", (e) => { ptrs.delete(e.pointerId); drag = null; });
cvs.addEventListener("wheel", (e) => { e.preventDefault(); const L = camLimits(), k = 1 + Math.sign(e.deltaY) * 0.08; if (camS.mode === "follow") camS.fdist = clamp(camS.fdist * k, L.dmin, L.dmax); else camS.dist = clamp(camS.dist * k, L.dmin, L.dmax); }, { passive: false });
/* 手機虛擬搖桿：左下角，拖多遠走多快；電腦用 WASD／方向鍵＋滑鼠 */
const stick = $("stick"), knob = stick.firstElementChild, JOY = { x: 0, z: 0, id: null };
if (matchMedia("(pointer: coarse)").matches) document.body.classList.add("touch");
function joyMove(e) { const r = stick.getBoundingClientRect(), R0 = r.width / 2; let dx = e.clientX - (r.left + R0), dy = e.clientY - (r.top + R0); const d = Math.hypot(dx, dy), m = Math.min(d, R0 * 0.72); if (d > 0) { dx *= m / d; dy *= m / d; } knob.style.transform = `translate(${dx}px, ${dy}px)`; const k = Math.min(1, m / (R0 * 0.55)); JOY.x = d > 3 ? dx / m * k : 0; JOY.z = d > 3 ? dy / m * k : 0; }
const joyEnd = (e) => { if (e.pointerId !== JOY.id) return; JOY.id = null; JOY.x = JOY.z = 0; knob.style.transform = ""; };
stick.addEventListener("pointerdown", (e) => { e.preventDefault(); JOY.id = e.pointerId; stick.setPointerCapture(e.pointerId); joyMove(e); });
stick.addEventListener("pointermove", (e) => { if (e.pointerId === JOY.id) joyMove(e); });
stick.addEventListener("pointerup", joyEnd); stick.addEventListener("pointercancel", joyEnd); stick.addEventListener("lostpointercapture", joyEnd);

/* 左上角小地圖：島形、路、房子、燈塔、你和船。黑影只畫你附近的；站上燈塔頂就全部畫出來 */
const mapC = $("map"), mapG = mapC.getContext("2d"), MAPS = 132, MAPR = 60; mapC.width = mapC.height = MAPS * 2;
const mX = (x) => MAPS + x * (MAPS / MAPR), mZ = (z) => MAPS + z * (MAPS / MAPR), mS = MAPS / MAPR;
const mapBase = (() => {
  const c = document.createElement("canvas"); c.width = c.height = MAPS * 2; const g = c.getContext("2d");
  g.fillStyle = "rgba(18,40,66,.6)"; g.beginPath(); g.arc(MAPS, MAPS, MAPS - 1, 0, TAU); g.fill();
  const ring = (fn, col) => { g.fillStyle = col; g.beginPath(); for (let i = 0; i <= 180; i++) { const a = i / 180 * TAU, r = fn(a); i ? g.lineTo(mX(Math.cos(a) * r), mZ(Math.sin(a) * r)) : g.moveTo(mX(Math.cos(a) * r), mZ(Math.sin(a) * r)); } g.closePath(); g.fill(); };
  ring(R, "#e6d4a2"); ring(RG, "#79ad55");
  // 高地畫深一點，看得出山坡
  for (let i = 0; i < 2600; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * 46, x = Math.cos(a) * r, z = Math.sin(a) * r; const h = hill(x, z); if (h > 1.6) { g.fillStyle = `rgba(40,90,40,${Math.min(0.5, (h - 1.6) * 0.18)})`; g.fillRect(mX(x) - 2, mZ(z) - 2, 4, 4); } }
  EXTRAS.forEach((e) => { if (e[0] === "pond") { g.fillStyle = "#4aa0c8"; g.beginPath(); g.arc(mX(e[1]), mZ(e[2]), e[3] * mS, 0, TAU); g.fill(); } else if (e[0] === "field") { const [, x, z, ry, w, d, crop] = e; g.save(); g.translate(mX(x), mZ(z)); g.rotate(-ry); g.fillStyle = crop === "wheat" ? "#d9b24a" : crop === "cabbage" ? "#8fbf60" : "#c8705a"; g.fillRect(-w * mS / 2, -d * mS / 2, w * mS, d * mS); g.restore(); } });
  ROADS.forEach((r) => { g.strokeStyle = r.kind === "dirt" ? "#c9a97a" : "#d8d2c6"; g.lineWidth = Math.max(2, r.w * mS); g.lineCap = "round"; g.beginPath(); g.moveTo(mX(r.x0), mZ(r.z0)); g.lineTo(mX(r.x1), mZ(r.z1)); g.stroke(); });
  g.fillStyle = "#d8d2c6"; g.beginPath(); g.arc(MAPS, MAPS, 4.6 * mS, 0, TAU); g.fill();
  town.forEach((b) => { const s = Math.max(3, b.r * 1.5 * mS); g.save(); g.translate(mX(b.x), mZ(b.z)); g.rotate(-b.ry); g.fillStyle = b.kind === "house" ? "#d9655a" : b.kind === "chapel" ? "#8a6ab0" : b.name === "風車" ? "#8a7a68" : "#c08a52"; g.fillRect(-s / 2, -s / 2, s, s); g.restore(); });
  g.fillStyle = "#ffffff"; g.beginPath(); g.arc(MAPS, MAPS, 3, 0, TAU); g.fill(); g.strokeStyle = "#d0524a"; g.lineWidth = 2; g.stroke();
  return c;
})();
function drawMap() {
  const g = mapG; g.clearRect(0, 0, MAPS * 2, MAPS * 2); g.drawImage(mapBase, 0, 0);
  const clampM = (x, z) => { const d = Math.hypot(x, z), lim = MAPR - 3; return d > lim ? [x * lim / d, z * lim / d] : [x, z]; };
  builds.forEach((b) => { g.fillStyle = b.kind === "fire" ? "#ff9a4a" : "#ffd27a"; g.fillRect(mX(b.x) - 1.5, mZ(b.z) - 1.5, 3, 3); });
  if (SEA.on) flotsam.forEach((f) => { const [x, z] = clampM(f.x, f.z); g.fillStyle = "#f0e0b0"; g.fillRect(mX(x) - 1.5, mZ(z) - 1.5, 3, 3); });
  const pulse = 0.65 + 0.35 * Math.sin(performance.now() / 180);
  foes.forEach((f) => { if (f.dying) return; if (!ONTOP && Math.hypot(f.x - P.x, f.z - P.z) > 14) return; const [x, z] = clampM(f.x, f.z); g.fillStyle = f.boss ? `rgba(200,90,255,${pulse})` : `rgba(255,70,70,${pulse})`; g.beginPath(); g.arc(mX(x), mZ(z), f.boss ? 5 : 3, 0, TAU); g.fill(); });
  if (!SEA.on) { const [x, z] = clampM(SEA.x, SEA.z); g.fillStyle = "#c8574a"; g.beginPath(); g.arc(mX(x), mZ(z), 3, 0, TAU); g.fill(); }
  if (!ONTOP) { g.strokeStyle = "rgba(255,240,200,.35)"; g.lineWidth = 1; g.beginPath(); g.arc(mX(P.x), mZ(P.z), 14 * mS, 0, TAU); g.stroke(); }
  const [px, pz] = clampM(P.x, P.z); g.save(); g.translate(mX(px), mZ(pz)); g.rotate(Math.atan2(Math.sin(P.yaw), -Math.cos(P.yaw)) + Math.PI); g.fillStyle = "#fff6d0"; g.strokeStyle = "#3a2410"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -7); g.lineTo(5, 5); g.lineTo(0, 2.5); g.lineTo(-5, 5); g.closePath(); g.fill(); g.stroke(); g.restore();
  if (ONTOP) { g.fillStyle = "rgba(255,255,255,.85)"; g.font = "bold 13px sans-serif"; g.textAlign = "center"; g.fillText("瞭望中：全島黑影", MAPS, MAPS * 2 - 10); }
}

const keys = {};
addEventListener("keydown", (e) => { keys[e.key.toLowerCase()] = true; if (e.key === "Escape") setBuild(null); if (e.key.toLowerCase() === "v" && !e.repeat) setCamMode(camS.mode === "follow" ? "top" : "follow"); if (e.key.toLowerCase() === "e" && !e.repeat && G.started) doorAction(); });
addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });
const mk = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 24), new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0, depthWrite: false }));
mk.rotation.x = -Math.PI / 2; mk.userData.noBake = true; scene.add(mk);
function marker(x, z) { mk.position.set(x, groundY(x, z) + 0.05, z); mk.material.opacity = 0.9; mk.scale.setScalar(1.4); }

/* 蓋東西 */
let ghost = null;
function canAfford(k) { if (k === "search" && !G.bp.search) return false; return G.wood >= COST[k].wood && G.oil >= COST[k].oil; }
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
  if (k === "search" && !G.bp.search) { tip("探照燈要先到圖書館解鎖藍圖（6 光晶）"); setTimeout(() => tip(""), 2200); return; }
  if (k === "repair") {
    if (G.hp >= 100) { tip("燈塔很健康，不用修"); setTimeout(() => tip(""), 1600); return; }
    if (!canAfford(k)) { tip("需要 3 塊木頭"); setTimeout(() => tip(""), 1600); return; }
    G.wood -= 3; G.hp = Math.min(100, G.hp + 20); burst(new THREE.Vector3(0, 3, 0), 0xffe2a0, 20, 1.6); toastAt(0, 0, "燈塔 +20", "#ffe2a0", 4); return;
  }
  setBuild(G.build === k ? null : k);
}));
$("skipbtn").addEventListener("click", () => { if (G.started && phaseAt(G.t) === "day") G.t = PH.day - 0.01; });
$("quality").addEventListener("click", () => { save.quality = { high: "mid", mid: "low", low: "high" }[QL]; save.autoq = true; persist(); location.reload(); });
$("quality").textContent = "畫質：" + { high: "高", mid: "中", low: "省電" }[QL];
$("cam").addEventListener("click", () => setCamMode(camS.mode === "follow" ? "top" : "follow"));
setCamMode(camS.mode);

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
const tmpC = new THREE.Color(), tmpC2 = new THREE.Color();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05) * DBG.speed; now += dt;
  waterU.uTime.value = now;
  if (G.started && !G.over && !IN) G.t += dt;
  if (G.t >= CYCLE) { G.t -= CYCLE; }
  const h = hourAt(G.t), ph = phaseAt(G.t), dark = darkAt(h), E = envAt(h);

  // 階段切換
  if (ph !== G.lastPhase && G.started && !G.over) {
    if (ph === "dusk") banner("太陽下山了", SEA.on ? "天快黑了，快回港！" : "燈要亮了，黑影快來了");
    if (ph === "night") { planNight(); banner(`第 ${G.day} 夜`, G.day === 15 ? "最後一夜，魔王會來" : WEEKEND ? "週末，魔王會來" : "守住燈塔"); }
    if (ph === "dawn") { foes.forEach((f) => { if (!f.dying) killFoe(f, false); }); }
    if (ph === "day") { G.day++; G.wood += 2; const bonus = 3 + Math.floor(G.lightKills / 4); G.cry += bonus; G.lightKills = 0; G.buff.speed = 0; G.buff.calm = 0; if (G.day === 16 && !G.won) { G.won = true; banner("守住了 15 個夜晚！", `燈塔的光沒有熄滅 · 進入無盡模式 · 光晶 +${bonus}`, 4500); if (!save.won) { save.won = true; persist(); } } else banner(`撐過了第 ${G.day - 1} 夜`, `天亮了，木頭 +2，光晶 +${bonus}`); }
    G.lastPhase = ph;
  }

  // 天空、太陽、月亮
  skyU.top.value.copy(E.top); skyU.bot.value.copy(E.bot); scene.fog.color.copy(E.bot).lerp(E.top, 0.25);
  // 白天一點薄霧、晚上濃霧（偏青綠），遠處的東西沉進霧裡
  scene.fog.density = lerp(0.0035, 0.022, dark); if (dark > 0.5) scene.fog.color.lerp(tmpC.set("#142830"), (dark - 0.5) * 1.2);
  scene.environmentIntensity = lerp(0.35, 0.1, dark);
  const sa = (h - 6) / 12 * Math.PI, sunDir = new THREE.Vector3(Math.cos(sa) * 0.9, Math.sin(sa), -0.45).normalize();
  const moonDir = new THREE.Vector3(-0.35, 0.55, -0.75).normalize();
  const useMoon = sunDir.y < 0.08;
  const ld = useMoon ? moonDir : sunDir;
  skyU.sunDir.value.copy(sunDir); skyU.sunC.value.copy(E.sunC); skyU.sunA.value = smooth(-0.1, 0.05, sunDir.y);
  tickClouds(clouds, dt, tmpC.copy(E.bot).lerp(tmpC2.set("#ffffff"), 0.55 - dark * 0.35), 0.95 - dark * 0.55); mountains.m.color.copy(E.bot).lerp(tmpC2.set("#3a5070"), 0.55 + dark * 0.3);
  gradePass.uniforms.uWarm.value = (1 - dark) * 0.6; gradePass.uniforms.uSat.value = 1.14 - dark * 0.1; WIND.value = now;
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
  { const P = motes.P, pa = P.pos.array, ca = P.col.array, b = P.base; motes.forEach((m, i) => { m.ph += dt * m.v; pa[i * 3] = m.x + Math.sin(m.ph * 1.3) * 0.6; pa[i * 3 + 1] = m.y + Math.sin(m.ph * 0.9) * 0.4 + ((m.ph * 0.15) % 1.5); pa[i * 3 + 2] = m.z + Math.cos(m.ph) * 0.6; const o = dayK * m.k * (0.3 + 0.7 * Math.max(0, Math.sin(m.ph * 4.1 + m.x))); ca[i * 3] = b.r * o; ca[i * 3 + 1] = b.g * o; ca[i * 3 + 2] = b.b * o; }); P.pos.needsUpdate = P.col.needsUpdate = true; P.pts.visible = dayK > 0.01; }
  fogs.forEach((f) => { f.ph += dt * f.v; const fx = f.x + Math.sin(f.ph) * 2, fz = f.z + Math.cos(f.ph * 0.8) * 1.6; f.sp.position.set(fx, Math.max(groundY(fx, fz), 0) + f.y - 0.5 + Math.sin(f.ph * 1.7) * 0.1, fz); f.sp.material.opacity = dark * f.k; });
  const shaftA = dayK * smooth(0.05, 0.25, sunDir.y) * (1 - smooth(0.5, 0.9, sunDir.y)) * 0.16 + dayK * 0.03;
  shafts.forEach((s) => { s.m.uniforms.uA.value = shaftA; s.pl.position.copy(s.base).addScaledVector(sunDir, 8); s.pl.lookAt(s.base.clone().addScaledVector(sunDir, 16)); s.pl.rotateX(Math.PI / 2); s.pl.rotateY(0.6); });
  tickSmoke(dt, 1);
  windmills.forEach((h) => h.rotation.z += dt * 0.5);
  // 鎮上的路燈、招牌
  townLamps.forEach((l, i) => { const on = smooth(0.12 + (i % 5) * 0.05, 0.32 + (i % 5) * 0.05, dark); l.glow.material.opacity = on; l.pool.material.opacity = on * 0.35; if (l.light) l.light.intensity = on * 3.5; });
  M.lampGlass.emissiveIntensity = 0.08 + dark * 5;
  signMats.forEach((m) => m.emissiveIntensity = dark * 0.9);
  // 窗戶、燈塔
  windowM.emissiveIntensity = 0.05 + dark * 3.2; M.win.emissiveIntensity = 0.05 + dark * 3.0; M.winCool.emissiveIntensity = 0.05 + dark * 2.2;
  housePools.forEach((p) => p.material.opacity = dark * 0.55);
  lampGlass.visible = roofC.visible = roofKnob.visible = !ONTOP; // 站在瞭望台時燈室會擋住整個視線，先隱藏，只留欄杆
  const topK = ONTOP ? 0.12 : 1; // 站在瞭望台時燈室就在眼前，把泛光壓低免得整個畫面白掉
  lampGlassM.emissiveIntensity = (0.3 + dark * 4) * topK;
  towerGlow.material.opacity = (0.1 + dark * 0.8) * topK; towerGlow.scale.setScalar(2.5 + dark * 3 + Math.sin(now * 3) * 0.15);
  towerLight.intensity = dark * 7 * topK;
  towerPool.material.opacity = dark * 0.3;
  beamRig.rotation.y += dt * 0.55;
  beams.forEach((b) => b.material.uniforms.uOpacity.value = dark * 0.5);
  const by = beamRig.rotation.y;
  beamSpot.intensity = dark * 140 * (1 + G.up.bright * 0.4); beams.forEach((b) => { b.scale.z = 1 + G.up.range * 0.28; b.scale.x = b.scale.y = 1 + G.up.bright * 0.15; }); beamSpot.target.position.set(Math.sin(by) * 18, 0, Math.cos(by) * 18);
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
  if (JOY.id != null) { mx += JOY.x; mz += JOY.z; }
  let vx = 0, vz = 0;
  if (G.started && !G.over) {
    if (mx || mz) { P.tx = null; P.goDoor = null; const cy = camS.mode === "follow" ? camS.fyaw : camS.yaw; const c = Math.cos(cy), s = Math.sin(cy); vx = mx * c + mz * s; vz = -mx * s + mz * c; }
    else if (P.tx != null) { vx = P.tx - P.x; vz = P.tz - P.z; if (Math.hypot(vx, vz) < 0.08) { P.tx = null; vx = vz = 0; } }
  }
  const vl = Math.hypot(vx, vz); P.moving = vl > 0;
  if (SEA.on) {
    // 開船：有慣性、慢慢轉向；不能撞上島，也別開太遠
    if (P.moving) { const want = Math.atan2(vx, vz); let d = ((want - SEA.yaw + Math.PI) % TAU + TAU) % TAU - Math.PI; SEA.yaw += d * Math.min(1, dt * 2.2); SEA.v = Math.min(5.5, SEA.v + dt * 4); }
    else SEA.v = Math.max(0, SEA.v - dt * 3);
    SEA.x += Math.sin(SEA.yaw) * SEA.v * dt; SEA.z += Math.cos(SEA.yaw) * SEA.v * dt;
    const a = Math.atan2(SEA.z, SEA.x), r = Math.hypot(SEA.x, SEA.z), lim = R(a) + 1.4; if (r < lim) { SEA.x *= lim / r; SEA.z *= lim / r; SEA.v *= 0.5; } if (r > 150) { SEA.x *= 150 / r; SEA.z *= 150 / r; }
    P.x = SEA.x; P.z = SEA.z; P.yaw = SEA.yaw;
    boat.rotation.set(Math.sin(now * 1.1) * 0.03 + SEA.v * 0.012, SEA.yaw, Math.sin(now * 1.4) * 0.05);
    animWalk(player, 0, false);
  } else if (P.moving) {
    const sp = 3.4 * (G.buff.speed ? 1.3 : 1) * Math.min(1, vl); P.x += vx / vl * sp * dt; P.z += vz / vl * sp * dt;
    (IN ? IN.room.colliders : ONTOP ? [] : colliders).forEach((c) => { const dx = P.x - c.x, dz = P.z - c.z, d = Math.hypot(dx, dz), m = c.r + 0.22; if (d < m && d > 1e-4) { P.x = c.x + dx / d * m; P.z = c.z + dz / d * m; } });
    if (IN) { const hw = IN.room.w / 2 - 0.45, hd = IN.room.d / 2 - 0.45; P.x = clamp(P.x, -hw, hw); P.z = clamp(P.z, -hd, Math.abs(P.x) < 0.5 ? hd + 0.3 : hd); }
    else if (ONTOP) { const r = Math.hypot(P.x, P.z) || 0.86, rr = clamp(r, 0.76, 0.96); P.x *= rr / r; P.z *= rr / r; }
    else { const a = Math.atan2(P.z, P.x), r = Math.hypot(P.x, P.z), lim = R(a) - 0.3; if (r > lim) { P.x *= lim / r; P.z *= lim / r; } }
    const wy = Math.atan2(vx, vz); let d = ((wy - P.yaw + Math.PI) % TAU + TAU) % TAU - Math.PI; P.yaw += d * Math.min(1, dt * 12);
    P.walk += dt * 11;
  }
  if (!SEA.on) { player.root.position.set(P.x, playerY(), P.z); player.root.rotation.y = P.yaw; animWalk(player, P.walk, P.moving); }
  player.arms[1].rotation.z = -0.25;
  // 船：停泊或航行都隨浪起伏；船燈晚上亮
  boat.position.set(SEA.x, -0.05 + Math.sin(now * 1.6) * 0.05, SEA.z);
  SEA.lamp.intensity = dark * 6; SEA.glow.material.opacity = dark * 0.9; SEA.lampGlass.material.emissiveIntensity = 0.3 + dark * 3;
  SEA.bow.set(0, 0.9, 1.1); boat.localToWorld(SEA.bow); SEA.pool.position.set(SEA.bow.x, 0.12, SEA.bow.z); SEA.pool.material.opacity = dark * 0.5;
  // 漂浮物：白天慢慢補貨、隨浪漂；船靠近就撈起來
  if ((SEA.spawnT += dt) > 3 && ph === "day" && flotsam.length < 16) { SEA.spawnT = 0; spawnFlotsam(); }
  for (let i = flotsam.length - 1; i >= 0; i--) {
    const f = flotsam[i]; f.t += dt; f.x += Math.cos(f.drift) * 0.06 * dt; f.z += Math.sin(f.drift) * 0.06 * dt;
    f.g.position.set(f.x, Math.sin(now * 1.3 + f.t) * 0.1 - 0.02, f.z); f.g.rotation.z = Math.sin(now * 0.9 + f.t) * 0.08;
    if (SEA.on && Math.hypot(f.x - SEA.x, f.z - SEA.z) < 1.7) {
      if (f.kind === "crate") { G.wood += 3; toastAt(f.x, f.z, "+3 🪵", "#ffe2a0", 0.6); } else if (f.kind === "barrel") { G.oil += 2; toastAt(f.x, f.z, "+2 🛢️", "#ffd27a", 0.6); } else { G.parts++; G.wood += 1; toastAt(f.x, f.z, "+1 🔩 +1 🪵", "#ffd27a", 0.6); }
      burst(new THREE.Vector3(f.x, 0.5, f.z), 0xbfe0ff, 10, 1.2); scene.remove(f.g); flotsam.splice(i, 1);
    }
  }
  // 夜裡還在海上：黑影從船邊的水面冒出來追船
  if (SEA.on && ph === "night" && (SEA.foeT += dt) > 3.5) { SEA.foeT = 0; const a = Math.random() * TAU; spawnFoe(SEA.x + Math.cos(a) * 9, SEA.z + Math.sin(a) * 9, true); }
  mk.material.opacity = Math.max(0, mk.material.opacity - dt * 1.6); mk.scale.setScalar(Math.max(1, mk.scale.x - dt));
  // 提燈
  const lanternOn = 0.25 + dark * 0.75;
  lanternGlow.material.opacity = dark; lanternGlass.visible = true;
  lantern.getWorldPosition(v3); lanternLight.position.copy(v3); lanternLight.intensity = dark * 1.5;
  // 探照燈：跟著面向，晚上才看得到光束
  torchDir.set(Math.sin(P.yaw), -0.08, Math.cos(P.yaw)).normalize(); torchPos.copy(v3);
  torchCone.position.copy(torchPos); torchCone.rotation.set(0, P.yaw, 0); torchCone.rotateX(0.08); torchCone.material.uniforms.uOpacity.value = dark * 0.5;
  torchSpot.position.copy(torchPos); torchSpot.target.position.copy(torchPos).addScaledVector(torchDir, 6); torchSpot.intensity = dark * 55;
  lanternPool.position.set(P.x + torchDir.x * 3.2, SEA.on ? 0.1 : ONTOP ? TOP_Y + 0.02 : groundY(P.x, P.z) + 0.04, P.z + torchDir.z * 3.2); lanternPool.rotation.z = -P.yaw; lanternPool.scale.set(1.1, 2.0, 1); lanternPool.material.opacity = dark * 0.4;
  // 門口提示
  if (IN) { IN.room.tick(dt, dark, E.bot); if (IN.room.ceiling) IN.room.ceiling.visible = camS.mode === "follow"; if (IN.room.npcChar) { IN.room.npcChar.root.position.y = 0.55 + Math.sin(now * 2) * 0.01; animWalk(IN.room.npcChar, 0, false); } }
  else if (!SEA.on) { nearDoor = null; let bd = 2.3; if (!ONTOP) town.forEach((b) => { const d = Math.hypot(P.x - b.door.x, P.z - b.door.z); if (d < bd) { bd = d; nearDoor = b; } }); }
  nearTower = !IN && !SEA.on && !ONTOP && Math.hypot(P.x, P.z - 1.6) < 1.5;
  if (P.goDoor && !IN && !SEA.on) { const b = P.goDoor; if (Math.hypot(P.x - b.door.x, P.z - b.door.z) < 1.4) { P.goDoor = null; P.tx = null; tip(""); enterBuilding(b); } else if (P.tx == null) { P.goDoor = null; tip(""); } }
  nearBoat = !IN && !SEA.on && Math.hypot(P.x - SEA.x, P.z - SEA.z) < 2.6; canLand = SEA.on && Math.hypot(SEA.x - SEA.moor.x, SEA.z - SEA.moor.z) < 5;
  const pr = $("prompt"), want = IN ? (P.z > IN.room.exitZ - 0.9 ? "離開 ⏎" : "") : SEA.on ? (canLand ? "靠岸 ⏎" : "") : ONTOP ? "下燈塔 ⏎" : nearTower ? "登上燈塔 ⏎" : nearBoat ? "上船出海 ⏎" : nearDoor ? `進入 ${nearDoor.name} ⏎` : "";
  if (pr.dataset.t !== want) { pr.dataset.t = want; pr.textContent = want; pr.classList.toggle("show", !!want && G.started); }
  if (!SEA.on) {
  // 寵物跟著
  const fx = P.x - Math.sin(P.yaw) * 0.8 + Math.cos(P.yaw) * 0.5, fz = P.z - Math.cos(P.yaw) * 0.8 - Math.sin(P.yaw) * 0.5;
  const pdx = fx - petS.x, pdz = fz - petS.z, pd = Math.hypot(pdx, pdz);
  if (pd > 0.25) { const sp = Math.min(pd * 3, 4.2); petS.x += pdx / pd * sp * dt; petS.z += pdz / pd * sp * dt; petS.yaw = Math.atan2(pdx, pdz); petS.walk += dt * 14; }
  pet.position.set(petS.x, groundY(petS.x, petS.z) + (pd > 0.25 ? Math.abs(Math.sin(petS.walk)) * 0.06 : 0), petS.z); pet.rotation.y = petS.yaw;
  }
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
  if (G.started && !G.over && ph === "day" && (woodT += dt) > 1.6) { woodT = 0; if (items.filter((i) => i.kind === "wood").length < 22) { const a = Math.random() * TAU; if (Math.random() < 0.35) { for (let k = 0; k < 20; k++) { const fx = (Math.random() - 0.5) * 84, fz = (Math.random() - 0.5) * 84; if (inForest(fx, fz) && Math.hypot(fx, fz) < RG(Math.atan2(fz, fx)) - 1 && freeSpot(fx, fz, 0.4)) { spawnWood(fx, fz); break; } } } else spawnWood(Math.cos(a) * (R(a) - 0.6), Math.sin(a) * (R(a) - 0.6)); } }
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i]; it.t += dt;
    if (it.m) { it.m.rotation.y += dt * 2; it.m.position.y = 0.45 + Math.sin(now * 3 + i) * 0.08; }
    if (Math.hypot(it.x - P.x, it.z - P.z) < 0.85 && G.started) {
      if (it.kind === "wood") { G.wood++; toastAt(it.x, it.z, "+1 🪵", "#ffe2a0"); } else { G.oil++; toastAt(it.x, it.z, "+1 🛢️", "#ffd27a"); burst(new THREE.Vector3(it.x, 0.9, it.z), 0xffd27a, 8, 1); }
      scene.remove(it.g); items.splice(i, 1);
    } else if (it.kind === "oil" && it.t > 30) { scene.remove(it.g); items.splice(i, 1); }
  }

  // 黑影
  if (G.started && !G.over && ph === "night") { const nt = G.t - PH.day - PH.dusk; while (G.spawns.length && G.spawns[0] <= nt) { G.spawns.shift(); spawnFoe(); } if (G.boss != null && nt >= G.boss) { G.boss = null; spawnFoe(null, null, "boss"); banner(WEEKEND ? "週末魔王之夜" : "魔王來了", "把燈塔光束和探照燈都對準它"); G.shake = 0.6; } }
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
    const dp = Math.hypot(f.x - P.x, f.z - P.z); if (dark > 0.4) { const ang = Math.abs(((Math.atan2(f.x - P.x, f.z - P.z) - P.yaw + Math.PI) % TAU + TAU) % TAU - Math.PI); if (dp < 1.3 || (dp < TORCH.len && ang < TORCH.ang + 0.6 / Math.max(dp, 1))) light += 2.2 * (1.2 - dp / TORCH.len * 0.6); }
    const db = Math.hypot(f.x - SEA.bow.x, f.z - SEA.bow.z); if (db < 2.8 && dark > 0.4) light += 1.2 * (1.2 - db / 2.8 * 0.5);
    const fa = Math.atan2(f.x, f.z), fd = Math.hypot(f.x, f.z);
    [by, by + Math.PI].forEach((ba) => { const df = Math.abs(((fa - ba + Math.PI) % TAU + TAU) % TAU - Math.PI); if (df < 0.16 && fd > 2 && fd < 17 + G.up.range * 5) light += 1.3 * dark * (1 + G.up.bright * 0.5); });
    if (fd < 2.1) light += 1.0;
    f.lit = lerp(f.lit, light > 0 ? 1 : 0, Math.min(1, dt * 10));
    f.hp -= light * dt;
    f.bm.emissive.setRGB(0.16 + f.lit * 1.4, 0.09 + f.lit * 1.1, 0.3 + f.lit * 0.6);
    const k = 0.55 + 0.45 * f.hp / f.max; f.g.scale.setScalar(k);
    if (f.hp <= 0) { killFoe(f, false); continue; }
    // 往燈塔走；篝火會把附近的黑影引過去
    let tx = 0, tz = 0;
    if (f.sea && SEA.on) { tx = SEA.x; tz = SEA.z; } else f.sea = false;
    builds.forEach((b) => { if (b.kind === "fire" && b.on > 0.4 && Math.hypot(b.x - f.x, b.z - f.z) < 6.5) { tx = b.x; tz = b.z; } });
    const dx = tx - f.x, dz = tz - f.z, d = Math.hypot(dx, dz);
    const sp = f.sp * (1 - f.lit * 0.55), wob = Math.sin(f.t * 2.2) * 0.35;
    f.x += (dx / d + (-dz / d) * wob) * sp * dt; f.z += (dz / d + (dx / d) * wob) * sp * dt;
    f.g.position.set(f.x, Math.max(groundY(f.x, f.z), -0.45) + Math.sin(f.t * 4) * 0.05, f.z); f.g.rotation.y = Math.atan2(dx, dz);
    f.tips.forEach((t, j) => t.scale.y = 1 + Math.sin(f.t * 8 + j * 1.3) * 0.25);
    f.aura.material.opacity = 0.6 - f.lit * 0.4;
    if (f.sea && d < 1.5) { G.wood = Math.max(0, G.wood - 3); G.oil = Math.max(0, G.oil - 1); G.shake = 0.3; SEA.v *= 0.3; killFoe(f, true); toastAt(SEA.x, SEA.z, "船被撞！-3 🪵 -1 🛢️", "#ff9a8a", 1.4); continue; }
    if (tx === 0 && tz === 0 && d < (f.boss ? 3.2 : 1.7)) { const dmg = f.boss ? 25 : Math.min(16, 6 + G.day); G.hp -= dmg; G.shake = f.boss ? 0.8 : 0.35; killFoe(f, true); toastAt(0, 0, `燈塔 -${dmg}`, "#ff9a8a", 4); if (G.hp <= 0) { G.hp = 0; gameOver(); } }
  }

  // 螢火蟲
  { const P = fliesP, pa = P.pos.array, ca = P.col.array, b = P.base; flies.forEach((fl, i) => { fl.ph += dt * fl.sp; pa[i * 3] = fl.x + Math.sin(fl.ph * 1.3) * 0.8; pa[i * 3 + 1] = fl.y + Math.sin(fl.ph * 2.1) * 0.25; pa[i * 3 + 2] = fl.z + Math.cos(fl.ph) * 0.8; const o = dark * (0.4 + 0.6 * Math.max(0, Math.sin(fl.ph * 3.1))); ca[i * 3] = b.r * o; ca[i * 3 + 1] = b.g * o; ca[i * 3 + 2] = b.b * o; }); P.pos.needsUpdate = P.col.needsUpdate = true; P.pts.visible = dark > 0.01; }
  // 火花
  for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.t += dt; s.v.y -= dt * 1.2; s.s.position.addScaledVector(s.v, dt); const k = 1 - s.t / s.life; s.s.material.opacity = Math.max(0, k); s.s.scale.setScalar(s.k * (0.4 + k * 0.6)); if (s.t >= s.life) { scene.remove(s.s); s.s.material.dispose(); sparks.splice(i, 1); } }

  // 蓋東西的預覽
  if (ghost) { const p = hover; if (p) { ghost.visible = true; ghost.position.set(p.x, groundY(p.x, p.z), p.z); const ok = placeOk(p.x, p.z) && canAfford(G.build); ghost.traverse((o) => { if (o.isMesh && o.material.color) o.material.opacity = ok ? 0.55 : 0.25; }); } }

  // 鏡頭跟著玩家
  camS.x = lerp(camS.x, P.x, Math.min(1, dt * (camS.mode === "follow" ? 6 : 3))); camS.z = lerp(camS.z, P.z, Math.min(1, dt * (camS.mode === "follow" ? 6 : 3)));
  const shake = G.shake > 0 ? (G.shake -= dt, G.shake * 0.4) : 0;
  if (camS.mode === "follow") {
    // 劍盾式：鏡頭在人物後上方，走動時慢慢轉到背後；拖曳後幾秒內不自動回正
    if (camS.free > 0) camS.free -= dt;
    else if (P.moving) { let d = ((P.yaw + Math.PI - camS.fyaw + Math.PI) % TAU + TAU) % TAU - Math.PI; camS.fyaw += d * Math.min(1, dt * 0.9); }
    let cd = camS.fdist * clamp(1.0 / camera.aspect, 1, 1.5); const cp = Math.cos(camS.fpitch);
    // 鏡頭碰到房子或樹就往前拉，不要穿牆
    { const dx = Math.sin(camS.fyaw), dz = Math.cos(camS.fyaw); let best = cd * cp; // 先用水平距離算，最後再換回鏡頭距離
      for (const c of (IN ? IN.room.colliders : colliders)) { if (c.r < 0.38 || IN) continue; const rr = (c.cr || c.r) + 0.12, ox = camS.x - c.x, oz = camS.z - c.z;
        const bq = ox * dx + oz * dz, cq = ox * ox + oz * oz - rr * rr; if (cq < 0) continue; const disc = bq * bq - cq; if (disc < 0) continue;
        const t = -bq - Math.sqrt(disc); if (t > 0 && t < best) best = Math.max(2.0, t); }
      best /= Math.max(cp, 0.3);
      camS.cdNow = camS.cdNow == null ? best : (best < camS.cdNow ? best : lerp(camS.cdNow, best, Math.min(1, dt * 4))); cd = camS.cdNow; }
    const gy = ONTOP ? TOP_Y : groundY(camS.x, camS.z);
    if (ONTOP) { camS.fpitch = clamp(camS.fpitch, 0.05, 0.3); cd = Math.min(cd, 3.6); }
    let cx = camS.x + Math.sin(camS.fyaw) * cp * cd, cz = camS.z + Math.cos(camS.fyaw) * cp * cd, cy = gy + 0.9 + Math.sin(camS.fpitch) * cd;
    // 不要鑽到地面或海面下
    cy = Math.max(cy, groundY(cx, cz) + 0.9, 0.9);
    if (IN) { cx = clamp(cx, -IN.room.w / 2 + 0.35, IN.room.w / 2 - 0.35); cz = clamp(cz, -IN.room.d / 2 + 0.35, IN.room.d / 2 + 4); cy = Math.min(cy, 0.55 + 3.0); }
    if (IN) IN.room.frame.visible = cz < IN.room.d / 2 + 0.3;
    camera.position.set(cx + (Math.random() - 0.5) * shake, cy, cz + (Math.random() - 0.5) * shake);
    camera.lookAt(camS.x - Math.sin(camS.fyaw) * 0.6, gy + 1.0, camS.z - Math.cos(camS.fyaw) * 0.6);
  } else {
    const cd = camS.dist * clamp(1.15 / camera.aspect, 1, 1.9);
    const cp = Math.cos(camS.pitch);
    const cdd = IN ? Math.min(cd, 12) : cd;
    const gy = IN ? 0.55 : groundY(camS.x, camS.z);
    camera.position.set(camS.x + Math.sin(camS.yaw) * cp * cdd + (Math.random() - 0.5) * shake, Math.sin(camS.pitch) * cdd + gy, camS.z + Math.cos(camS.yaw) * cp * cdd + (Math.random() - 0.5) * shake);
    camera.lookAt(camS.x, gy + 0.3, camS.z);
  }

  // 介面
  if ((hudT += dt) > 0.1) {
    hudT = 0; drawMap();
    $("day").textContent = `第 ${G.day} ${ph === "night" || ph === "dusk" ? "夜" : "天"}`;
    $("phase").textContent = { day: h < 10 ? "早晨" : h < 14 ? "中午" : "下午", dusk: "黃昏", night: "夜晚 · 黑影 " + foes.filter((f) => !f.dying).length, dawn: "黎明" }[ph];
    const prog = ph === "day" ? G.t / PH.day : ph === "dusk" ? (G.t - PH.day) / PH.dusk : ph === "night" ? (G.t - PH.day - PH.dusk) / PH.night : 1;
    $("bar").firstElementChild.style.width = (prog * 100).toFixed(1) + "%";
    $("bar").firstElementChild.style.background = ph === "night" ? "linear-gradient(90deg,#8aa4ff,#c8d4ff)" : "";
    $("hpn").textContent = Math.ceil(G.hp); $("hp").firstElementChild.style.width = G.hp + "%";
    $("wood").textContent = G.wood; $("oil").textContent = G.oil; $("parts").textContent = G.parts; $("cry").textContent = G.cry;
    $("searchlock").style.display = G.bp.search ? "none" : "";
    document.querySelectorAll("#build button").forEach((b) => b.classList.toggle("no", !canAfford(b.dataset.b)));
    $("skipbtn").style.display = G.started && ph === "day" && !IN ? "" : "none";
  }

  composer.render();
}
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); if (gtao) gtao.setSize(Math.round(innerWidth * 0.6), Math.round(innerHeight * 0.6)); });
camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
// 測試用：在主控台調時間、加速
window.__islelight = { G, P, camS, foes, items, DBG, climbTower, descendTower, isTop: () => ONTOP, JOY, drawMap, setHour: (t) => { G.t = t; }, setCamMode, enterBuilding, leaveBuilding, town, isIn: () => !!IN, boardBoat, landBoat, SEA, flotsam, spawnFoe, renderShop, nightCount, WEEKEND, BAKE: () => BAKE, renderer, QL, THREE, camera };
player.root.userData.noBake = pet.userData.noBake = true; tower.userData.noBake = beamRig.userData.noBake = true; grass.userData.noBake = sand.userData.noBake = true;
const BAKE = bakeStatic(scene); console.log("islelight bake", BAKE);
// 第一次開：先量 3 秒幀率，太慢就自動降一級再重開（只做一次）
if (!save.autoq) {
  let n = 0, t0 = 0; const probe = () => { const t = performance.now(); if (!t0) t0 = t; else n++; if (t - t0 < 3000) requestAnimationFrame(probe); else { const fps = n / ((t - t0) / 1000); save.autoq = true; if (fps < 22 && QL !== "low") save.quality = "low"; else if (fps < 40 && QL === "high") save.quality = "mid"; persist(); if (save.quality && save.quality !== QL) location.reload(); } };
  setTimeout(() => requestAnimationFrame(probe), 2500);
}
frame();
