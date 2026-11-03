/* 開源人物模型（KayKit Adventurers / Skeletons，CC0）：載入 glb、複製骨架、播內建動畫
   makeRig 回傳的物件跟原本 makeChar 一樣有 root / hips / torso / head / legs / arms，animWalk 看到 rig 就改播動畫
   - 武器、盾牌這些配件預設藏起來（小鎮生活不需要），keepGear 可以留
   - RIGS 是所有活著的骨架，每幀 tickRigs(dt) 更新動畫 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as skClone } from "three/addons/utils/SkeletonUtils.js";

const CACHE = {};
const GEAR = /Sword|Shield|Axe|Crossbow|Staff|Wand|Knife|Offhand|Throwable|Spellbook|Mug|Blade|Bow|Arrow|Quiver/i;
export const RIGS = [];
export async function loadRigs(names) {
  const loader = new GLTFLoader();
  await Promise.all(names.map(async (name) => { if (CACHE[name]) return; const url = (name.startsWith("Skeleton") ? "assets/foes/" : "assets/chars/") + name + ".glb"; CACHE[name] = await loader.loadAsync(url); }));
}
export function makeRig(name, opt) {
  opt = opt || {}; const src = CACHE[name];
  const root = new THREE.Group(); const hand = new THREE.Group(); const dummy = () => { const g = new THREE.Group(); g.visible = false; return g; };
  const c = { root, hips: new THREE.Group(), torso: new THREE.Group(), head: new THREE.Group(), legs: [], arms: [hand, hand], eyes: [], cat: null, book: dummy(), cup: dummy(), cookie: dummy(), hipY: 0, rig: true, name, mats: [], mixer: null, actions: {}, cur: null, dead: false, walkClip: opt.walk || "Walking_A", update() {}, play() {} };
  root.add(hand);
  if (!src) return c;
  const model = skClone(src.scene); root.add(model);
  const seen = new Set();
  model.traverse((o) => {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; if (opt.cloneMats) o.material = o.material.clone(); if (!seen.has(o.material)) { seen.add(o.material); c.mats.push(o.material); } }
    if (!opt.keepGear && GEAR.test(o.name) && !/Body|Head|Arm|Leg|Cape|Cloak|Helmet|Hood/.test(o.name)) o.visible = false;
  });
  const handBone = model.getObjectByName("handslot.l") || model.getObjectByName("hand.l"); if (handBone) handBone.add(hand);
  const headBone = model.getObjectByName("head"); if (headBone) c.head = headBone;
  c.mixer = new THREE.AnimationMixer(model);
  src.animations.forEach((clip) => { c.actions[clip.name] = c.mixer.clipAction(clip); });
  c.play = (n, fade, once) => { const a = c.actions[n]; if (!a || c.cur === a) return; const f = fade == null ? 0.2 : fade; a.reset(); if (once) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; } a.fadeIn(f).play(); if (c.cur) c.cur.fadeOut(f); c.cur = a; };
  c.update = (dt) => c.mixer.update(dt);
  c.play(opt.idle || "Idle", 0);
  RIGS.push(c);
  return c;
}
export function tickRigs(dt) { for (let i = RIGS.length - 1; i >= 0; i--) { const r = RIGS[i]; if (r.dead) { RIGS.splice(i, 1); continue; } r.update(dt); } }
