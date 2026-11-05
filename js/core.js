/* 通用几何与材质工具 */
const U = {};

U.mat = {
  whitePaint: new THREE.MeshStandardMaterial({ color: 0xf6f2e9, roughness: 0.55, metalness: 0.0 }),
  whiteSoft: new THREE.MeshStandardMaterial({ color: 0xf8f4ec, roughness: 0.85 }),
  cream: new THREE.MeshStandardMaterial({ color: 0xefe2cf, roughness: 0.9 }),
  deskWood: new THREE.MeshStandardMaterial({ map: TEX.make ? TEX.wood : null, color: 0xffffff, roughness: 0.5, metalness: 0.0 }),
  darkWood: new THREE.MeshStandardMaterial({ color: 0x6e4f33, roughness: 0.6 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xb9bcbe, roughness: 0.35, metalness: 0.85 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: 0x505458, roughness: 0.45, metalness: 0.7 }),
  black: new THREE.MeshStandardMaterial({ color: 0x1b1d20, roughness: 0.55, metalness: 0.2 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xdfeff2, roughness: 0.12, metalness: 0.0, transparent: true, opacity: 0.35, transmission: 0.6 }),
  plantGreen: new THREE.MeshStandardMaterial({ color: 0x4d7a3a, roughness: 0.75, side: THREE.DoubleSide }),
  plantGreen2: new THREE.MeshStandardMaterial({ color: 0x6b9450, roughness: 0.8, side: THREE.DoubleSide }),
  potWhite: new THREE.MeshStandardMaterial({ color: 0xf2ede2, roughness: 0.65 }),
  potClay: new THREE.MeshStandardMaterial({ color: 0xb9a284, roughness: 0.8 }),
  soil: new THREE.MeshStandardMaterial({ color: 0x3a2d22, roughness: 1.0 })
};

U.box = function (w, h, d, mat, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
};

U.cyl = function (rt, rb, h, mat, x, y, z, parent, seg) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
};

U.sphere = function (r, mat, x, y, z, parent, seg) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg || 20, seg || 16), mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
};

U.plane = function (w, h, mat, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
};

/* 圆角盒子：用挤出几何实现，用于椅子、显示器等柔和外形 */
U.roundedBox = function (w, h, d, r, mat, parent) {
  const shape = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d, bevelEnabled: true, bevelThickness: Math.min(r * 0.8, d * 0.4),
    bevelSize: Math.min(r * 0.8, w * 0.2), bevelSegments: 3, curveSegments: 8
  });
  geo.center();
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true; m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
};

U.label = function (text, w, h, font, color, bg) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const ctx = c.getContext('2d');
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, 256, 128); }
  ctx.fillStyle = color || '#fff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = font || 'bold 48px Georgia, serif';
  ctx.fillText(text, 128, 64);
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  return t;
};

/* 叶片：带轻微弯曲的平面叶形 */
U.leafMesh = function (len, wid, mat, parent) {
  const geo = new THREE.PlaneGeometry(len, wid, 6, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i), py = pos.getY(i);
    const t = (px / len) + 0.5;
    pos.setZ(i, Math.sin(t * Math.PI) * 0.04 + Math.abs(py) * 0.02);
    // 叶尖收窄
    pos.setY(i, py * (0.35 + Math.sin(t * Math.PI) * 0.75));
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  if (parent) parent.add(m);
  return m;
};
