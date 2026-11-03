"""用 Blender（bpy）做居民外觀的帽子、頭髮、配件，匯出成 glb 放在 assets/acc/
座標：在頭骨座標系裡建模，Blender 的 Z 往上、-Y 往前（匯出 glTF 後會變成 three.js 的 Y 往上、+Z 往前）
跑法：python make_accessories.py <輸出資料夾>"""
import bpy, bmesh, math, sys, random
from mathutils import Vector

OUT = sys.argv[-1]
random.seed(7)

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def mat(name, rgb, rough=0.7, metal=0.0, emit=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*srgb(rgb), 1)
    b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*srgb(emit), 1); b.inputs["Emission Strength"].default_value = 1.0
    return m

def srgb(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]

def finish(o, m, sub=2, smooth=True, bevel=0.0):
    o.data.materials.append(m)
    if bevel:
        b = o.modifiers.new("bevel", "BEVEL"); b.width = bevel; b.segments = 2
    if sub:
        s = o.modifiers.new("sub", "SUBSURF"); s.levels = sub; s.render_levels = sub
    if smooth:
        for p in o.data.polygons: p.use_smooth = True
    return o

def cyl(r1, r2, depth, z, verts=32, name="c"):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=(0, 0.02, z))
    o = bpy.context.object; o.name = name; return o

def sphere(r, loc, scale=(1, 1, 1), name="s", seg=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=loc)
    o = bpy.context.object; o.scale = scale; o.name = name; return o

def dome(r, z, name="dome", scale=(1, 1, 1)):
    o = sphere(r, (0, 0.02, z), scale, name)
    bm = bmesh.new(); bm.from_mesh(o.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.001], context="VERTS")
    bm.to_mesh(o.data); bm.free(); return o

def noise(o, amt):
    for v in o.data.vertices: v.co += Vector((random.uniform(-amt, amt), random.uniform(-amt, amt), random.uniform(-amt, amt)))

def export(name):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=f"{OUT}/{name}.glb", export_format="GLB", use_selection=True, export_apply=True, export_yup=True)

# 廚師帽：圓頂帽身＋鼓鼓的皺摺帽頂
reset()
W = mat("white", "#f6f3ec", 0.85)
finish(dome(0.64, 0.5, "base", (1, 1, 1.0)), W, 1)
band = cyl(0.66, 0.66, 0.16, 0.62, 48, "band"); finish(band, W, 0, bevel=0.03)
body = cyl(0.56, 0.62, 0.66, 0.98, 48, "body")
for v in body.data.vertices:  # 直向皺摺
    a = math.atan2(v.co.y, v.co.x); k = 1 + 0.05 * math.sin(a * 10)
    v.co.x *= k; v.co.y *= k
finish(body, W, 0, bevel=0.03)
for i in range(7):
    a = i / 7 * math.tau
    s = sphere(0.27, (math.cos(a) * 0.3, 0.02 + math.sin(a) * 0.3, 1.3), (1, 1, 0.8), f"puff{i}"); finish(s, W, 1)
finish(sphere(0.32, (0, 0.02, 1.36), (1, 1, 0.8), "puffc"), W, 1)
export("chef")

# 水手帽：深藍帽身＋白色平頂＋黑帽簷＋金色徽章
reset()
N = mat("navy", "#1f3462", 0.7); Wt = mat("white", "#f4f4f2", 0.8); B = mat("black", "#12182a", 0.4); G = mat("gold", "#f2c230", 0.35, 0.8)
finish(dome(0.63, 0.5, "cap", (1, 1, 1.0)), N, 1)
finish(cyl(0.64, 0.62, 0.14, 0.6, 48, "band"), N, 0, bevel=0.02)
top = cyl(0.78, 0.64, 0.34, 0.9, 48, "top"); finish(top, Wt, 0, bevel=0.04)
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.36, depth=0.04, location=(0, -0.52, 0.53))
v = bpy.context.object; v.scale = (1.1, 0.75, 1); v.rotation_euler = (math.radians(-14), 0, 0); finish(v, B, 0, bevel=0.01)
finish(sphere(0.085, (0, -0.64, 0.66), (1, 0.5, 1), "badge"), G, 1)
export("sailor")

# 雨帽：圓頂＋前短後長的帽簷
reset()
Y = mat("yellow", "#f2c230", 0.45)
finish(dome(0.6, 0.66, "crown", (1, 1, 0.9)), Y, 1)
br = cyl(0.98, 0.9, 0.05, 0.72, 48, "brim")
for vv in br.data.vertices:
    if vv.co.y > 0.2: vv.co.z -= (vv.co.y - 0.2) * 0.35  # 後面往下垂
finish(br, Y, 0, bevel=0.015)
export("sou")

# 高禮帽＋圓眼鏡
reset()
D = mat("hat", "#2a2020", 0.5); R = mat("ribbon", "#7a1e34", 0.6); F = mat("frame", "#2a1a10", 0.3, 0.6)
finish(cyl(0.68, 0.68, 0.06, 0.8, 48, "brim"), D, 0, bevel=0.02)
finish(cyl(0.42, 0.46, 0.55, 1.1, 48, "tube"), D, 0, bevel=0.03)
finish(cyl(0.465, 0.47, 0.1, 0.9, 48, "rib"), R, 1)
for x in (-0.2, 0.2):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.13, minor_radius=0.022, location=(x, -0.57, 0.4), rotation=(math.radians(90), 0, 0)); finish(bpy.context.object, F, 0)
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.016, depth=0.14, location=(0, -0.57, 0.42), rotation=(0, math.radians(90), 0)); finish(bpy.context.object, F, 0)
export("tophat")

# 貝雷帽
reset()
K = mat("beret", "#2a2a3a", 0.8)
b = sphere(0.64, (0.08, 0.05, 0.78), (1, 1, 0.36), "beret"); noise(b, 0.008); finish(b, K, 1)
finish(cyl(0.04, 0.03, 0.12, 1.01, 12, "stem"), K, 0)
export("beret")

# 船匠的頭髮：兩側和後腦一圈一束一束的灰髮
reset()
H = mat("hair", "#8c8880", 0.9)
for k in range(16):
    a = math.pi * (0.55 + k * 0.058)
    x, y = math.sin(a) * 0.6, -math.cos(a) * 0.55 + 0.05
    s = sphere(0.13, (x, y, 0.44 + (k % 3) * 0.03), (1, 1, 1.3), f"tuft{k}", 12)
    s.rotation_euler = (random.uniform(-0.3, 0.3), random.uniform(-0.3, 0.3), a); finish(s, H, 1)
export("fringe")

# 背包（掛在胸骨上，往後）
reset()
L = mat("leather", "#7a5634", 0.75); Bl = mat("roll", "#3a6a8a", 0.8); Bu = mat("buckle", "#c8b070", 0.3, 0.8)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.42, 0.45)); p = bpy.context.object; p.scale = (0.62, 0.34, 0.72); finish(p, L, 0, bevel=0.06)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.25, 0.62)); f = bpy.context.object; f.scale = (0.5, 0.06, 0.32); finish(f, L, 0, bevel=0.03)
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.16, depth=0.7, location=(0, 0.42, 0.92), rotation=(0, math.radians(90), 0)); finish(bpy.context.object, Bl, 1, bevel=0.02)
finish(sphere(0.05, (0, 0.21, 0.6), (1, 0.4, 1), "buckle"), Bu, 0)
export("pack")

# 圍裙（掛在胸骨上，往前）
reset()
A = mat("apron", "#ffffff", 0.85); S = mat("strap", "#c8a070", 0.7)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -0.43, -0.2), rotation=(math.radians(90), 0, 0)); ap = bpy.context.object; ap.scale = (0.58, 0.52, 1)
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.subdivide(number_cuts=6); bpy.ops.object.mode_set(mode="OBJECT")
for vv in ap.data.vertices: vv.co.z += 0.02 * math.sin(vv.co.x * 18)  # 布料波紋（平面局部 z = 前後）
so = ap.modifiers.new("thick", "SOLIDIFY"); so.thickness = 0.03
finish(ap, A, 1)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.42, 0.06)); st = bpy.context.object; st.scale = (0.62, 0.04, 0.06); finish(st, S, 1, bevel=0.01)
export("apron")
print("done")
