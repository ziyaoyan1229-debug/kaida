/* 把島上不會動的東西合併成少數幾個網格，draw call 從上萬降到幾十個，畫面完全一樣
   - 純色、沒貼圖的材質：顏色烤進頂點色，共用一個材質
   - 有貼圖或會變色的材質（石牆、木紋、窗戶、招牌）：同一個材質物件的合成一個
   - 依 24×24 的格子分塊，鏡頭看不到的區塊可以整塊剔除
   - userData.noBake 的物件（會動、會變）整棵跳過 */
import { THREE } from "./chars.js";

const CELL = 24;
export function bakeStatic(scene) {
  const groups = new Map();
  const VC = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 });
  const doomed = [];
  const wp = new THREE.Vector3();
  scene.updateMatrixWorld(true);
  const walk = (o) => {
    if (o.userData.noBake || !o.visible) return;
    if (o.isMesh && !o.isInstancedMesh && !o.isSprite && !o.isPoints) {
      const m = o.material;
      const ok = m && !Array.isArray(m) && (m.isMeshStandardMaterial || m.isMeshBasicMaterial) && !m.transparent && !m.onBeforeCompile.toString().includes("uTime") && !m.wireframe;
      if (ok) {
        const plain = m.isMeshStandardMaterial && !m.map && !m.emissiveMap && !m.bumpMap && !m.normalMap && m.emissive.getHex() === 0 && m.side === THREE.FrontSide && m.metalness === 0 && !m.vertexColors && !m.emissiveMap;
        o.getWorldPosition(wp);
        const key = (plain ? "vc" : m.uuid) + ":" + Math.floor(wp.x / CELL) + ":" + Math.floor(wp.z / CELL);
        let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        g.applyMatrix4(o.matrixWorld);
        const n = g.attributes.position.count;
        if (!g.attributes.normal) g.computeVertexNormals();
        if (!g.attributes.uv) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(n * 2), 2));
        if (plain) { const c = new Float32Array(n * 3), col = m.color; for (let i = 0; i < n; i++) { c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b; } g.setAttribute("color", new THREE.BufferAttribute(c, 3)); }
        const wantColor = plain || !!m.vertexColors;
        if (wantColor && !plain && !g.attributes.color) { const c = new Float32Array(n * 3).fill(1); g.setAttribute("color", new THREE.BufferAttribute(c, 3)); }
        let grp = groups.get(key); if (!grp) { grp = { mat: plain ? VC : m, geos: [], cast: false, recv: false, plain, wantColor }; groups.set(key, grp); }
        grp.geos.push(g); grp.cast = grp.cast || o.castShadow; grp.recv = grp.recv || o.receiveShadow;
        doomed.push(o);
      }
    }
    for (const c of o.children) walk(c);
  };
  walk(scene);
  doomed.forEach((o) => { if (o.parent) o.parent.remove(o); });
  let meshes = 0, tris = 0;
  groups.forEach((grp) => {
    const total = grp.geos.reduce((s, g) => s + g.attributes.position.count, 0);
    const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), uv = new Float32Array(total * 2), col = grp.wantColor ? new Float32Array(total * 3) : null;
    let off = 0;
    grp.geos.forEach((g) => { const n = g.attributes.position.count; pos.set(g.attributes.position.array, off * 3); nor.set(g.attributes.normal.array, off * 3); uv.set(g.attributes.uv.array, off * 2); if (col) col.set(g.attributes.color.array, off * 3); off += n; g.dispose(); });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    if (col) geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, grp.mat); mesh.castShadow = grp.cast; mesh.receiveShadow = grp.recv; mesh.userData.baked = true; scene.add(mesh);
    meshes++; tris += total / 3;
  });
  return { meshes, tris: Math.round(tris), removed: doomed.length };
}
