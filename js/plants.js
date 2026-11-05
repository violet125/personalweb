/* 植物与玩偶 */

const PLANT = {};
const PLUSH = {};

function rand(seed) {
  let s = seed || 1;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const leafMats = [
  new THREE.MeshStandardMaterial({ color: 0x3f6b2f, roughness: 0.72, side: THREE.DoubleSide }),
  new THREE.MeshStandardMaterial({ color: 0x5b8542, roughness: 0.78, side: THREE.DoubleSide }),
  new THREE.MeshStandardMaterial({ color: 0x74954f, roughness: 0.8, side: THREE.DoubleSide }),
  new THREE.MeshStandardMaterial({ color: 0x2f5a2a, roughness: 0.7, side: THREE.DoubleSide })
];

const stemMats = [
  new THREE.MeshStandardMaterial({ color: 0x6f7f4a, roughness: 0.9 }),
  new THREE.MeshStandardMaterial({ color: 0x50602c, roughness: 0.9 })
];

/* 单位叶片几何：+X 为叶尖方向，宽 1、长 1，带轻微弧度 */
const LEAF_GEO = (function () {
  const L = 12, W = 6;
  const positions = [], indices = [];
  for (let i = 0; i <= L; i++) {
    const t = i / L;
    const w = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.82)), 0.6);
    for (let j = 0; j <= W; j++) {
      const u = j / W - 0.5;
      const cup = Math.pow(Math.abs(u) * 2, 2) * 0.16 + Math.sin(Math.PI * t) * 0.05;
      positions.push(t, u * w, cup * w);
    }
  }
  for (let i = 0; i < L; i++) {
    for (let j = 0; j < W; j++) {
      const a = i * (W + 1) + j;
      const b = a + W + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
})();

const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

/* yaw 控制水平朝向，pitch 为上扬角（>0 向上），roll 为叶面自转 */
function leafAt(parent, x, y, z, len, wid, yaw, pitch, mat, roll) {
  const m = new THREE.Mesh(LEAF_GEO, mat);
  m.position.set(x, y, z);
  m.scale.set(len, wid, wid);
  const qy = new THREE.Quaternion().setFromAxisAngle(AXIS_Y, yaw);
  const qz = new THREE.Quaternion().setFromAxisAngle(AXIS_Z, pitch);
  const qx = new THREE.Quaternion().setFromAxisAngle(AXIS_X, roll || 0);
  m.quaternion.copy(qy.multiply(qz).multiply(qx));
  m.castShadow = true;
  m.name = 'leaf';
  parent.add(m);
  return m;
}

/* 依据最大伸展半径收短叶片，避免叶片越过墙面 / 相邻物体 */
function fitLen(len, maxReach, baseOff, pitch, wid) {
  const allowance = (maxReach - baseOff - wid * 0.5) / Math.max(0.35, Math.cos(pitch));
  return Math.min(len, allowance);
}

/* 桌面小绿植：茎顶叶 + 盆口外扩叶，整体控制在 maxReach 内 */
PLANT.pottedPlant = function (parent, x, y, z, scale, seed, potMat, opts) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.name = 'potted-plant';
  parent.add(g);

  scale = scale || 1;
  opts = opts || {};
  const r = rand(seed || 7);
  const potR = 0.072 * scale, potH = 0.115 * scale;
  const pot = U.cyl(potR, potR * 0.86, potH, potMat || U.mat.potWhite, 0, potH / 2, 0, g, 24);
  pot.name = 'plant-pot';
  U.cyl(potR * 0.94, potR * 0.94, 0.008, U.mat.soil, 0, potH - 0.004, 0, g, 20);

  const maxReach = opts.maxReach != null ? opts.maxReach : 0.30 * scale;
  const facing = opts.facing;
  const spread = opts.spread != null ? opts.spread : 1.05;
  const stemMat = stemMats[Math.floor(r() * stemMats.length)];
  const stems = 7 + Math.floor(r() * 4);

  for (let s = 0; s < stems; s++) {
    const ang = (s / stems) * Math.PI * 2 + (r() - 0.5) * 0.4;
    const lean = (0.02 + r() * 0.08) * scale;
    const h = (0.18 + r() * 0.13) * scale;
    const bx = Math.cos(ang) * potR * 0.5;
    const bz = Math.sin(ang) * potR * 0.5;
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0035 * scale, 0.0055 * scale, h, 5), stemMat
    );
    stem.position.set(bx + Math.cos(ang) * lean * 0.5, potH + h / 2, bz + Math.sin(ang) * lean * 0.5);
    stem.rotation.z = -Math.cos(ang) * lean * 0.5;
    stem.rotation.x = Math.sin(ang) * lean * 0.5;
    stem.castShadow = true;
    g.add(stem);

    const topX = bx + Math.cos(ang) * lean;
    const topZ = bz + Math.sin(ang) * lean;
    const yaw = facing == null ? ang : facing + (r() - 0.5) * spread * 0.6;
    const pitch = 0.85 + r() * 0.35;
    const wid = (0.060 + r() * 0.030) * scale;
    let len = (0.10 + r() * 0.05) * scale;
    len = fitLen(len, maxReach, Math.hypot(topX, topZ), pitch, wid);
    if (len > 0.025 * scale) {
      leafAt(g, topX, potH + h + 0.004, topZ, len, wid,
        yaw, pitch,
        leafMats[Math.floor(r() * leafMats.length)], (r() - 0.5) * 0.3);
    }

    // 茎中段的叶片，避免下半截露出光杆
    const midX = bx + Math.cos(ang) * lean * 0.45;
    const midZ = bz + Math.sin(ang) * lean * 0.45;
    const midPitch = 0.50 + r() * 0.30;
    const midWid = (0.050 + r() * 0.025) * scale;
    let midLen = (0.085 + r() * 0.040) * scale;
    midLen = fitLen(midLen, maxReach, Math.hypot(midX, midZ), midPitch, midWid);
    if (midLen > 0.025 * scale) {
      leafAt(g, midX, potH + h * 0.60, midZ, midLen, midWid,
        yaw + (r() - 0.5) * 0.45, midPitch,
        leafMats[Math.floor(r() * leafMats.length)], (r() - 0.5) * 0.25);
    }
  }

  // 盆口叶片：靠近墙面时统一朝开阔方向生长
  const outer = 12 + Math.floor(r() * 4);
  for (let i = 0; i < outer; i++) {
    const baseAng = facing == null
      ? (i / outer) * Math.PI * 2 + (r() - 0.5) * 0.25
      : facing + ((i + 0.5) / outer - 0.5) * spread * 2 + (r() - 0.5) * 0.12;
    const baseR = potR * (0.78 + r() * 0.16);
    const pitch = 0.35 + r() * 0.30;
    const wid = (0.065 + r() * 0.030) * scale;
    let len = (0.11 + r() * 0.06) * scale;
    len = fitLen(len, maxReach, baseR, pitch, wid);
    if (len < 0.03 * scale) continue;
    leafAt(g, Math.cos(baseAng) * baseR, potH + 0.004, Math.sin(baseAng) * baseR, len, wid,
      baseAng + (r() - 0.5) * 0.3, pitch,
      leafMats[Math.floor(r() * leafMats.length)], (r() - 0.5) * 0.2);
  }
  return g;
};

/* 落地植物：冠层压低、叶形外扩，限定半径与总高度，避开墙、窗台和桌子 */
PLANT.floorPlant = function (parent, x, z, seed, opts) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.name = 'floor-plant';
  parent.add(g);

  opts = opts || {};
  const r = rand(seed || 21);
  const potH = 0.32, potR = 0.165;
  const maxReach = opts.maxReach != null ? opts.maxReach : 0.30;
  const maxHeight = opts.maxHeight != null ? opts.maxHeight : 0.90;
  const facing = opts.facing;
  const spread = opts.spread != null ? opts.spread : 1.12;

  U.cyl(potR, potR * 0.84, potH, U.mat.potWhite, 0, potH / 2, 0, g, 28);
  U.cyl(potR * 0.95, potR * 0.95, 0.01, U.mat.soil, 0, potH - 0.005, 0, g, 22);

  const stemMat = stemMats[1];
  const stems = 10 + Math.floor(r() * 4);
  const stemCap = Math.min(0.36, maxHeight - potH - 0.16);

  for (let s = 0; s < stems; s++) {
    const ang = (s / stems) * Math.PI * 2 + (r() - 0.5) * 0.35;
    const lean = 0.03 + r() * 0.06;
    const h = 0.28 + r() * Math.max(0.02, stemCap - 0.28);
    const bx = Math.cos(ang) * potR * 0.35;
    const bz = Math.sin(ang) * potR * 0.35;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.010, h, 5), stemMat);
    stem.position.set(bx + Math.cos(ang) * lean * 0.5, potH + h / 2, bz + Math.sin(ang) * lean * 0.5);
    stem.rotation.z = -Math.cos(ang) * lean * 0.5;
    stem.rotation.x = Math.sin(ang) * lean * 0.5;
    stem.castShadow = true;
    g.add(stem);

    const topX = bx + Math.cos(ang) * lean;
    const topZ = bz + Math.sin(ang) * lean;
    const baseOff = Math.hypot(topX, topZ);
    for (let l = 0; l < 2; l++) {
      const yaw = facing == null
        ? ang + (l === 0 ? 0.30 : -0.35) + (r() - 0.5) * 0.45
        : facing + (l === 0 ? 0.55 : -0.55) + (r() - 0.5) * 0.5;
      const pitch = 0.62 + r() * 0.24 - l * 0.10;
      const wid = 0.085 + r() * 0.035;
      let len = 0.15 + r() * 0.06;
      len = fitLen(len, maxReach, baseOff, pitch, wid);
      if (len < 0.06) continue;
      leafAt(g, topX, potH + h - l * 0.02, topZ, len, wid,
        yaw, pitch, leafMats[Math.floor(r() * leafMats.length)], (r() - 0.5) * 0.35);
    }

    // 茎中段叶片
    const midYaw = facing == null ? ang + (r() - 0.5) * 0.5 : facing + (r() - 0.5) * 1.0;
    const midPitch = 0.45 + r() * 0.25;
    const midWid = 0.075 + r() * 0.030;
    let midLen = 0.12 + r() * 0.05;
    midLen = fitLen(midLen, maxReach, baseOff, midPitch, midWid);
    if (midLen > 0.06) {
      leafAt(g, topX, potH + h * 0.55, topZ, midLen, midWid,
        midYaw, midPitch, leafMats[Math.floor(r() * leafMats.length)], (r() - 0.5) * 0.35);
    }
  }

  // 盆口附近的低位叶，补充体量
  const low = 6;
  for (let i = 0; i < low; i++) {
    const baseAng = facing == null
      ? (i / low) * Math.PI * 2 + (r() - 0.5) * 0.4
      : facing + ((i + 0.5) / low - 0.5) * spread * 2 + (r() - 0.5) * 0.2;
    const baseR = potR * (0.80 + r() * 0.15);
    const pitch = 0.55 + r() * 0.25;
    const wid = 0.080 + r() * 0.030;
    let len = 0.11 + r() * 0.05;
    len = fitLen(len, maxReach, baseR, pitch, wid);
    if (len < 0.055) continue;
    leafAt(g, Math.cos(baseAng) * baseR, potH + 0.005, Math.sin(baseAng) * baseR, len, wid,
      baseAng + (r() - 0.5) * 0.4, pitch,
      leafMats[Math.floor(r() * leafMats.length)], (r() - 0.5) * 0.3);
  }
  return g;
};

/* 从架子前沿垂下来的绿萝藤：叶片统一朝外，避免穿墙与穿板 */
PLANT.hangingVine = function (parent, x, y, z, len, variant) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.name = 'hanging-vine';
  parent.add(g);

  const r = rand(variant === 0 ? 33 : 47);
  const strands = 5 + Math.floor(r() * 3);
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x47702f, roughness: 0.8, side: THREE.DoubleSide });

  for (let s = 0; s < strands; s++) {
    const sx = (r() - 0.5) * 0.24;
    const sz = (r() - 0.5) * 0.05 + 0.01;
    const sl = len * (0.55 + r() * 0.45);
    const pts = [];
    for (let p = 0; p <= 8; p++) {
      const t = p / 8;
      pts.push(new THREE.Vector3(
        sx + Math.sin(t * 2.4 + s) * 0.045 * t,
        -t * sl,
        sz + Math.cos(t * 1.8 + s) * 0.03 * t
      ));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 14, 0.0045, 5, false),
      new THREE.MeshStandardMaterial({ color: 0x7a8a4e, roughness: 0.9 })
    );
    g.add(tube);

    const leaves = 10 + Math.floor(r() * 4);
    for (let l = 0; l < leaves; l++) {
      const t = 0.20 + (l / leaves) * 0.78;
      const p = curve.getPoint(t);
      const yaw = -Math.PI / 2 + (r() - 0.5) * 1.4;   // 统一朝 +Z 外扩
      const pitch = -0.38 + r() * 0.68;               // 以下垂/平展为主
      leafAt(g, p.x, p.y, p.z,
        0.042 + r() * 0.032, 0.030 + r() * 0.018,
        yaw, pitch, greenMat, (r() - 0.5) * 0.5);
    }
  }
  return g;
};

/* 桌面花瓶中的白色雏菊 */
PLANT.daisyBouquet = function (parent, x, y, z, seed) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.name = 'daisy-bouquet';
  parent.add(g);

  const r = rand(seed || 11);
  const vaseMat = new THREE.MeshPhysicalMaterial({
    color: 0xdcebea, roughness: 0.16, metalness: 0.0, transparent: true, opacity: 0.55,
    transmission: 0.5
  });
  const vase = U.cyl(0.045, 0.055, 0.20, vaseMat, 0, 0.10, 0, g, 22);
  vase.name = 'vase';
  U.cyl(0.043, 0.043, 0.02, new THREE.MeshStandardMaterial({ color: 0xbcd6d0, roughness: 0.2, transparent: true, opacity: 0.5 }), 0, 0.17, 0, g, 18);

  const stemMat = new THREE.MeshStandardMaterial({ color: 0x6b8a3e, roughness: 0.9 });
  const petalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75, emissive: 0xffffff, emissiveIntensity: 0.08 });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xe8b93f, roughness: 0.85 });
  const flowerCount = 18;

  for (let f = 0; f < flowerCount; f++) {
    const ang = r() * Math.PI * 2;
    const rad = 0.03 + r() * 0.10;
    const top = 0.26 + r() * 0.13;
    const fx = Math.cos(ang) * rad, fz = Math.sin(ang) * rad;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.004, top, 4), stemMat);
    stem.position.set(fx * 0.55, top / 2 + 0.02, fz * 0.55);
    stem.rotation.z = -fx * 2.2;
    stem.rotation.x = fz * 2.2;
    g.add(stem);

    const head = new THREE.Group();
    head.position.set(fx, top, fz);
    head.rotation.set((r() - 0.5) * 0.5, r() * Math.PI, (r() - 0.5) * 0.5);
    g.add(head);

    const c = U.sphere(0.017 + r() * 0.004, centerMat, 0, 0, 0, head, 12);
    const petals = 8;
    const petalGeo = new THREE.SphereGeometry(0.011, 8, 6);
    for (let p = 0; p < petals; p++) {
      const pa = (p / petals) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.scale.set(1.9, 0.35, 0.8);
      petal.position.set(Math.cos(pa) * 0.026, 0, Math.sin(pa) * 0.026);
      petal.rotation.y = -pa;
      head.add(petal);
    }
  }
  return g;
};

/* 猫咪玩偶 */
PLUSH.cat = function (parent, x, y, z, size, color, rotY) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotY || 0;
  g.name = 'cat-plush';
  parent.add(g);

  const bodyMat = new THREE.MeshStandardMaterial({ color: color || 0xffffff, roughness: 0.9 });
  const pinkMat = new THREE.MeshStandardMaterial({ color: 0xf0b9b0, roughness: 0.9 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x3d342c, roughness: 0.6 });

  const s = size;
  // 身体
  const body = U.sphere(s * 0.62, bodyMat, 0, s * 0.62, 0, g, 16);
  body.scale.set(1, 0.9, 0.95);
  // 头
  const head = U.sphere(s * 0.5, bodyMat, 0, s * 1.25, 0, g, 18);
  head.scale.set(1.08, 0.95, 0.98);
  // 耳朵
  const earGeo = new THREE.SphereGeometry(s * 0.19, 10, 8);
  [-1, 1].forEach(function (sgn) {
    const ear = new THREE.Mesh(earGeo, bodyMat);
    ear.position.set(sgn * s * 0.32, s * 1.62, 0);
    ear.scale.set(1, 1.3, 0.55);
    ear.rotation.z = sgn * 0.3;
    ear.castShadow = true;
    g.add(ear);
    const inner = new THREE.Mesh(new THREE.SphereGeometry(s * 0.10, 8, 6), pinkMat);
    inner.position.set(sgn * s * 0.32, s * 1.60, s * 0.06);
    inner.scale.set(1, 1.3, 0.4);
    g.add(inner);
  });
  // 眼睛
  [-1, 1].forEach(function (sgn) {
    const eye = U.sphere(s * 0.045, darkMat, sgn * s * 0.17, s * 1.30, s * 0.40, g, 8);
    eye.scale.set(1, 1.15, 0.6);
  });
  // 腮红
  [-1, 1].forEach(function (sgn) {
    const cheek = new THREE.Mesh(new THREE.CircleGeometry(s * 0.07, 12), pinkMat);
    cheek.position.set(sgn * s * 0.27, s * 1.19, s * 0.36);
    g.add(cheek);
  });
  // 鼻子
  const nose = new THREE.Mesh(new THREE.CircleGeometry(s * 0.035, 10), pinkMat);
  nose.position.set(0, s * 1.23, s * 0.47);
  nose.rotation.x = 0;
  g.add(nose);
  // 前爪
  [-1, 1].forEach(function (sgn) {
    U.sphere(s * 0.13, bodyMat, sgn * s * 0.36, s * 0.12, s * 0.36, g, 10);
  });
  return g;
};
