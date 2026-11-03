/* 開源場景模型（KayKit Medieval Hexagon Pack，CC0）：建築、樹、石頭、道具
   - 全部共用同一張貼圖，載入後把材質換成同一個物件，bake.js 才能把同格子的模型合成一個網格
   - spawnModel(name, s) 回傳複製品（已縱放、開陰影），modelBox(name) 回傳原尺寸的包圍盒 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const CACHE = {}, BOX = {};
export let HEXMAT = null;
export async function loadModels(names) {
  const loader = new GLTFLoader();
  await Promise.all(names.map(async (name) => {
    if (CACHE[name]) return;
    const gltf = await loader.loadAsync("assets/hex/" + name + ".json");
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return;
      if (!HEXMAT) { HEXMAT = o.material; HEXMAT.roughness = 0.9; HEXMAT.metalness = 0; if (HEXMAT.map) { HEXMAT.map.anisotropy = 4; } }
      o.material = HEXMAT; o.castShadow = true; o.receiveShadow = true;
    });
    CACHE[name] = gltf.scene; BOX[name] = new THREE.Box3().setFromObject(gltf.scene);
  }));
}
export function modelBox(name) { return BOX[name]; }
export function spawnModel(name, s) {
  const src = CACHE[name]; if (!src) { console.warn("model missing", name); return new THREE.Group(); }
  const g = src.clone(); g.scale.setScalar(s || 1);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
/* 放在地面上：底部貼齊 y，模型水平置中 */
export function placeModel(parent, name, s, x, y, z, ry) {
  const g = spawnModel(name, s), bb = BOX[name]; const p = new THREE.Group(); p.position.set(x, y, z); p.rotation.y = ry || 0; p.add(g);
  if (bb) g.position.set(-(bb.min.x + bb.max.x) / 2 * s, -bb.min.y * s, -(bb.min.z + bb.max.z) / 2 * s);
  parent.add(p); return p;
}
