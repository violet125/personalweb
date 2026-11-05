/* 书桌、显示器、桌面陈设、椅子 */
const DESK = { group: null, chair: null, lampLight: null, screenLight: null };
const DECOR = {};

DESK.build = function (scene) {
  const root = new THREE.Group();
  root.name = 'desk-corner';
  scene.add(root);
  DESK.group = root;

  DESK.buildTable(root);
  DESK.buildMonitor(root);
  DESK.buildKeyboardMouse(root);
  DESK.buildLamp(root);
  DESK.buildProps(root);
  DESK.buildSideShelf(root);
  DESK.buildChair(root);
};

/* ---------- 桌子本体 ---------- */
DESK.buildTable = function (root) {
  const topMat = new THREE.MeshStandardMaterial({ color: 0xf2ede3, roughness: 0.42, metalness: 0.02 });
  const W = 1.74, D = 0.66, T = 0.035;
  const topY = 0.748;
  const top = U.box(W, T, D, topMat, -0.08, topY, 0.34, root);
  top.name = 'desk-top';
  // 桌面圆角边
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 });
  U.box(W + 0.012, 0.012, D + 0.008, edgeMat, -0.08, topY - 0.021, 0.34, root);

  // 左侧三抽屉柜
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xf7f3ea, roughness: 0.55 });
  const drawerMat = new THREE.MeshStandardMaterial({ color: 0xfbf8f1, roughness: 0.5 });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.6, metalness: 0.25 });

  const cabX = -0.70, cabW = 0.46, cabDepth = 0.60, cabH = topY - 0.035 - 0.02;
  const cab = U.box(cabW, cabH, cabDepth, cabMat, cabX, cabH / 2 + 0.005, 0.35, root);
  cab.name = 'drawer-cabinet';

  for (let i = 0; i < 3; i++) {
    const dh = (cabH - 0.10) / 3;
    const dy = 0.09 + dh / 2 + i * (dh + 0.012);
    const front = U.box(cabW - 0.035, dh - 0.014, 0.022, drawerMat, cabX, dy, 0.35 + cabDepth / 2 + 0.008, root);
    front.name = 'drawer-front';
    const hd = U.box(0.16, 0.012, 0.018, handleMat, cabX, dy + dh * 0.22, 0.35 + cabDepth / 2 + 0.024, root);
    hd.name = 'drawer-handle';
  }

  // 右侧支撑柜（单抽屉）
  const cab2X = 0.56, cab2W = 0.30;
  const cab2H = cabH;
  U.box(cab2W, cab2H, cabDepth - 0.04, cabMat, cab2X, cab2H / 2 + 0.005, 0.36, root);
  U.box(cab2W - 0.03, 0.19, 0.022, drawerMat, cab2X, cab2H - 0.14, 0.36 + (cabDepth - 0.04) / 2 + 0.01, root);
  U.box(0.10, 0.010, 0.016, handleMat, cab2X, cab2H - 0.10, 0.36 + (cabDepth - 0.04) / 2 + 0.022, root);
  U.box(0.10, 0.010, 0.016, handleMat, cab2X, cab2H - 0.17, 0.36 + (cabDepth - 0.04) / 2 + 0.022, root);

  // 中部横梁
  U.box(0.62, 0.05, 0.03, cabMat, -0.05, cabH - 0.02, 0.60, root);

  ROOM.colliders.push({ name: 'desk', center: new THREE.Vector3(-0.08, 0.45, 0.34), half: new THREE.Vector3(0.87, 0.40, 0.33) });
};

/* ---------- 显示器 ---------- */
DESK.buildMonitor = function (root) {
  const g = new THREE.Group();
  g.position.set(-0.16, 0, 0.12);
  g.name = 'monitor';
  root.add(g);

  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x141619, roughness: 0.45, metalness: 0.1 });
  const W = 0.70, H = 0.415, D = 0.026;
  const bezel = U.roundedBox(W, H, D, 0.012, bezelMat, g);
  bezel.position.set(0, 1.045, 0);
  bezel.name = 'monitor-bezel';

  const screenMat = new THREE.MeshBasicMaterial({ map: TEX.screen, toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.022, H - 0.030), screenMat);
  screen.position.set(0, 1.050, 0.027);
  screen.name = 'monitor-screen';
  g.add(screen);

  // 屏幕底部品牌条
  U.box(W - 0.06, 0.032, 0.004, new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.6 }), 0, 0.852, 0.028, g);
  U.cyl(0.008, 0.008, 0.004, new THREE.MeshStandardMaterial({ color: 0x9fd8a0, roughness: 0.4 }), W / 2 - 0.08, 0.852, 0.030, g, 8).rotation.x = Math.PI / 2;

  // 支架
  const neckMat = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.45, metalness: 0.25 });
  const neck = U.box(0.075, 0.20, 0.048, neckMat, 0, 0.855, -0.005, g);
  neck.name = 'monitor-neck';
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x2d3035, roughness: 0.4, metalness: 0.2 });
  const base = U.cyl(0.135, 0.155, 0.018, baseMat, 0, 0.764, 0.01, g, 28);
  base.name = 'monitor-base';
  base.scale.set(1.35, 1, 0.72);

  // 屏幕冷光（营造参考图里屏幕的亮度）
  DESK.screenLight = new THREE.PointLight(0xbfe4ff, 0.45, 1.6, 2);
  DESK.screenLight.position.set(-0.16, 1.05, 0.35);
  root.add(DESK.screenLight);

  ROOM.colliders.push({ name: 'monitor', center: new THREE.Vector3(-0.16, 1.05, 0.13), half: new THREE.Vector3(0.35, 0.21, 0.03) });
};

/* ---------- 键盘与鼠标 ---------- */
DESK.buildKeyboardMouse = function (root) {
  const matMat = new THREE.MeshStandardMaterial({ map: TEX.mat, roughness: 0.85 });
  const deskMat = U.box(0.86, 0.006, 0.36, matMat, -0.10, 0.7685, 0.435, root);
  deskMat.name = 'desk-mat';

  const kb = new THREE.Group();
  kb.position.set(-0.14, 0, 0.40);
  kb.name = 'keyboard';
  root.add(kb);

  const caseMat = new THREE.MeshStandardMaterial({ color: 0xefe7d6, roughness: 0.55 });
  const caseBox = U.roundedBox(0.44, 0.028, 0.158, 0.008, caseMat, kb);
  caseBox.position.set(0, 0.784, 0);
  const keyMat = new THREE.MeshStandardMaterial({ color: 0xe4d9c2, roughness: 0.5 });
  const keyDark = new THREE.MeshStandardMaterial({ color: 0xcdbfa4, roughness: 0.55 });

  // 键帽下方的深色衬板，让按键间隙清晰可辨
  U.box(0.402, 0.004, 0.132, new THREE.MeshStandardMaterial({ color: 0xa79a83, roughness: 0.7 }), 0, 0.7995, 0, kb);

  const rows = 5, cols = 14;
  const keyGeo = new THREE.BoxGeometry(0.0230, 0.0105, 0.0205);
  const keys = new THREE.InstancedMesh(keyGeo, keyMat, rows * cols);
  keys.castShadow = true;
  const dummy = new THREE.Object3D();
  let k = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dummy.position.set(-0.175 + c * 0.0262, 0.8055, -0.052 + r * 0.0262);
      dummy.updateMatrix();
      keys.setMatrixAt(k++, dummy.matrix);
    }
  }
  kb.add(keys);

  // 空格键
  const space = U.box(0.15, 0.011, 0.0205, keyDark, 0.0, 0.8055, 0.052, kb);
  space.castShadow = true;

  // 鼠标
  const mouse = U.roundedBox(0.062, 0.026, 0.102, 0.026, new THREE.MeshStandardMaterial({ color: 0xf6f2e8, roughness: 0.5 }), root);
  mouse.position.set(0.20, 0.782, 0.40);
  mouse.rotation.y = 0.08;
  mouse.name = 'mouse';
  U.sphere(0.010, new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.6 }), 0.20, 0.792, 0.40, root, 8);
};

/* ---------- 球形台灯（暖光） ---------- */
DESK.buildLamp = function (root) {
  const g = new THREE.Group();
  g.position.set(-0.90, 0.766, 0.36);
  g.name = 'globe-lamp';
  root.add(g);

  const woodMat = new THREE.MeshStandardMaterial({ map: TEX.wood, color: 0xc98a4a, roughness: 0.55 });
  U.cyl(0.105, 0.115, 0.035, woodMat, 0, 0.018, 0, g, 28);
  const stem = U.cyl(0.075, 0.082, 0.115, woodMat, 0, 0.09, 0, g, 26);

  const globeMat = new THREE.MeshStandardMaterial({
    color: 0xffdca6, emissive: 0xffa347, emissiveIntensity: 0.30, roughness: 0.92
  });
  const globe = U.sphere(0.118, globeMat, 0, 0.275, 0, g, 32);
  globe.name = 'lamp-globe';

  DESK.lampLight = new THREE.PointLight(0xffb264, 0.55, 1.8, 2);
  DESK.lampLight.position.set(-0.90, 1.02, 0.50);
  DESK.lampLight.castShadow = false;
  root.add(DESK.lampLight);
};

/* ---------- 桌面小物 ---------- */
DESK.buildProps = function (root) {
  const deskY = 0.766;

  // 台灯后侧的桌面绿植（叶片朝侧向展开，避开后墙与灯罩）
  PLANT.pottedPlant(root, -0.90, deskY, 0.13, 0.85, 4, U.mat.potWhite,
    { maxReach: 0.24, facing: 0, spread: 0.55 });

  // 耳机（平放）
  const hp = new THREE.Group();
  hp.position.set(-0.85, deskY, 0.55);
  hp.rotation.y = 0.32;
  hp.name = 'headphones';
  root.add(hp);
  const hpMat = new THREE.MeshStandardMaterial({ color: 0xf3f0e8, roughness: 0.55 });
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0xe7e0d2, roughness: 0.85 });
  [-1, 1].forEach(function (sgn) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.016, 10, 20), cushionMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(sgn * 0.066, 0.016, 0);
    ring.castShadow = true;
    hp.add(ring);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.022, 20), hpMat);
    cup.position.set(sgn * 0.066, 0.028, 0);
    cup.castShadow = true;
    hp.add(cup);
  });
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.076, 0.012, 8, 28, Math.PI), hpMat);
  band.position.set(0, 0.026, 0);
  band.rotation.z = 0;
  band.rotation.x = Math.PI / 2;
  band.rotation.y = Math.PI / 2;
  hp.add(band);

  // 笔筒 + 画笔
  const cupG = new THREE.Group();
  cupG.position.set(-0.64, deskY, 0.19);
  cupG.name = 'pen-cup';
  root.add(cupG);
  U.cyl(0.047, 0.043, 0.098, U.mat.potWhite, 0, 0.049, 0, cupG, 24);
  const penColors = [0xd8c8a8, 0x8a6b4a, 0xb5b09a, 0x6b7b5a, 0xcf9f68, 0x9a8c74];
  const rnd = rand(9);
  for (let i = 0; i < 9; i++) {
    const pm = new THREE.MeshStandardMaterial({ color: penColors[i % penColors.length], roughness: 0.7 });
    const len = 0.17 + rnd() * 0.08;
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0035, len, 6), pm);
    pen.position.set((rnd() - 0.5) * 0.05, 0.06 + len / 2, (rnd() - 0.5) * 0.05);
    pen.rotation.z = (rnd() - 0.5) * 0.35;
    pen.rotation.x = (rnd() - 0.5) * 0.35;
    cupG.add(pen);
  }

  // 猫咪玩偶（显示器左侧）
  PLUSH.cat(root, -0.47, deskY, 0.26, 0.115, 0xfdfbf4, 0.25);
  // 猫咪玩偶（显示器右前）
  PLUSH.cat(root, 0.02, deskY, 0.185, 0.080, 0xf7ead6, -0.35);

  // 日历（日期由 CanvasTexture 按真实时间生成，跨天可刷新）
  const calG = new THREE.Group();
  calG.position.set(0.115, deskY, 0.20);
  calG.rotation.y = -0.06;
  calG.name = 'calendar';
  root.add(calG);
  const calTex = TEX.makeCalendar(new Date());
  const matDay = new THREE.MeshStandardMaterial({ map: calTex.day, roughness: 0.75 });
  const matMonth = new THREE.MeshStandardMaterial({ map: calTex.month, roughness: 0.75 });
  const sideMat = new THREE.MeshStandardMaterial({ color: 0xd8c59e, roughness: 0.8 });
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.072, 0.052),
    [sideMat, sideMat, sideMat, sideMat, matDay, sideMat]);
  b1.position.set(-0.026, 0.036, 0);
  b1.castShadow = true;
  calG.add(b1);
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.060, 0.060, 0.050),
    [sideMat, sideMat, sideMat, sideMat, matMonth, sideMat]);
  b2.position.set(0.035, 0.030, 0.004);
  b2.castShadow = true;
  calG.add(b2);

  const calKey = function (d) {
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  };
  DESK.calendar = { dateKey: calKey(new Date()) };
  DESK.updateCalendar = function (date) {
    const d = date || new Date();
    const key = calKey(d);
    if (key === DESK.calendar.dateKey) return false;
    const tex = TEX.makeCalendar(d);
    matDay.map.dispose();
    matDay.map = tex.day;
    matDay.needsUpdate = true;
    matMonth.map.dispose();
    matMonth.map = tex.month;
    matMonth.needsUpdate = true;
    DESK.calendar.dateKey = key;
    return true;
  };

  // 绿色饮品
  const drink = new THREE.Group();
  drink.position.set(0.255, deskY, 0.45);
  drink.name = 'green-drink';
  root.add(drink);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8f4ec, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.4,
    transmission: 0.7
  });
  const liquidMat = new THREE.MeshStandardMaterial({ color: 0x7fae5c, roughness: 0.45 });
  U.cyl(0.040, 0.036, 0.165, glassMat, 0, 0.0825, 0, drink, 24);
  U.cyl(0.037, 0.034, 0.125, liquidMat, 0, 0.072, 0, drink, 22);
  U.cyl(0.041, 0.041, 0.018, new THREE.MeshStandardMaterial({ color: 0xf4efe2, roughness: 0.7 }), 0, 0.172, 0, drink, 24);
  const straw = U.cyl(0.005, 0.005, 0.20, new THREE.MeshStandardMaterial({ color: 0xf0e6cd, roughness: 0.6 }), 0.014, 0.19, 0, drink, 8);
  straw.rotation.z = 0.15;

  // 雏菊花瓶
  PLANT.daisyBouquet(root, 0.345, deskY, 0.20, 12);

  // 桌面小绿植（与右侧书架保持间隙）
  PLANT.pottedPlant(root, 0.72, deskY, 0.55, 0.82, 5, U.mat.potWhite, { maxReach: 0.17 });

  // 靠墙的小照片（显示器右侧）
  const photoMat = new THREE.MeshStandardMaterial({ map: TEX.posts[3], roughness: 0.6 });
  const smallPhoto = new THREE.Mesh(new THREE.PlaneGeometry(0.10, 0.13), photoMat);
  smallPhoto.position.set(0.34, 1.06, 0.02);
  smallPhoto.rotation.z = -0.06;
  root.add(smallPhoto);

  ROOM.colliders.push({ name: 'desk-props', center: new THREE.Vector3(-0.1, 0.85, 0.35), half: new THREE.Vector3(0.8, 0.1, 0.25) });
};

/* ---------- 桌面右侧三层小书架 ---------- */
DESK.buildSideShelf = function (root) {
  const g = new THREE.Group();
  g.position.set(0.615, 0.766, 0.235);
  g.name = 'side-shelf';
  root.add(g);

  const woodMat = new THREE.MeshStandardMaterial({ color: 0xf2e7d2, roughness: 0.6 });
  const W = 0.31, D = 0.245, H = 0.60;
  const t = 0.016;

  [0.19, 0.385, 0.585].forEach(function (y) {
    U.box(W, t, D, woodMat, 0, y, 0, g);
  });
  [-1, 1].forEach(function (sgn) {
    U.box(t, H, D, woodMat, sgn * W / 2, H / 2, 0, g);
  });
  U.box(W, H, 0.012, woodMat, 0, H / 2, -D / 2, g);
  // 底板与腿
  U.box(W, 0.018, D, woodMat, 0, 0.006, 0, g);
  [-1, 1].forEach(function (sgn) {
    [-1, 1].forEach(function (s2) {
      U.box(0.018, 0.012, 0.018, woodMat, sgn * (W / 2 - 0.02), 0.0, s2 * (D / 2 - 0.02), g);
    });
  });

  // 书
  ROOM.buildBookRow(g, -0.10, 0.19 + t / 2, 0.01, 0.04, 0.15, 7);
  ROOM.buildBookRow(g, -0.10, 0.385 + t / 2, 0.01, 0.04, 0.14, 6);
  ROOM.buildBookRow(g, -0.10, 0.585 + t / 2, 0.01, 0.04, 0.12, 5);

  // 顶部小盆栽
  PLANT.pottedPlant(g, 0.02, 0.585 + t, 0.02, 0.62, 19, U.mat.potClay);

  // 架子上猫咪摆件
  PLUSH.cat(g, 0.10, 0.385 + t, 0.04, 0.050, 0xf6d9a8, -0.5);
};

/* ---------- 办公椅 ---------- */
DESK.buildChair = function (root) {
  const chair = new THREE.Group();
  chair.position.set(0.02, 0, 1.04);
  chair.rotation.y = 0.10;
  chair.name = 'office-chair';
  root.add(chair);
  DESK.chair = chair;

  const frameMat = new THREE.MeshStandardMaterial({ color: 0xf5f1e8, roughness: 0.5 });
  const padMat = new THREE.MeshStandardMaterial({ color: 0xe7dcc9, roughness: 0.85 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2c2e31, roughness: 0.6 });

  // 五星脚
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.028, 0.048), frameMat);
    arm.position.set(Math.cos(a) * 0.20, 0.10, Math.sin(a) * 0.20);
    arm.rotation.y = -a;
    arm.castShadow = true;
    chair.add(arm);
    const wheel = U.sphere(0.032, darkMat, Math.cos(a) * 0.355, 0.045, Math.sin(a) * 0.355, chair, 10);
    wheel.scale.set(1, 0.8, 1);
  }
  U.cyl(0.045, 0.055, 0.30, frameMat, 0, 0.26, 0, chair, 16);

  // 坐垫
  const seat = U.roundedBox(0.46, 0.085, 0.46, 0.035, padMat, chair);
  seat.position.set(0, 0.465, 0);
  seat.name = 'chair-seat';

  // 椅背网布（弯曲面）
  const backG = new THREE.Group();
  backG.position.set(0, 0.65, 0.22);
  backG.rotation.x = 0.10;
  backG.name = 'chair-back';
  chair.add(backG);

  const meshMat = new THREE.MeshStandardMaterial({
    map: TEX.meshFabric, roughness: 0.9, side: THREE.DoubleSide, color: 0xffffff
  });
  const backGeo = new THREE.PlaneGeometry(0.42, 0.42, 12, 10);
  const pos = backGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i), py = pos.getY(i);
    pos.setZ(i, -Math.pow(px / 0.20, 2) * 0.050 - Math.pow((py - 0.04) / 0.22, 2) * 0.018);
  }
  backGeo.computeVertexNormals();
  const backMesh = new THREE.Mesh(backGeo, meshMat);
  backMesh.castShadow = true;
  backMesh.position.y = 0.145;
  backG.add(backMesh);

  // 椅背外框（环绕网布的圆角边框）
  function rectPath(w, h, radius, asPath) {
    const p = asPath ? new THREE.Path() : new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    p.moveTo(x + radius, y);
    p.lineTo(x + w - radius, y);
    p.quadraticCurveTo(x + w, y, x + w, y + radius);
    p.lineTo(x + w, y + h - radius);
    p.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    p.lineTo(x + radius, y + h);
    p.quadraticCurveTo(x, y + h, x, y + h - radius);
    p.lineTo(x, y + radius);
    p.quadraticCurveTo(x, y, x + radius, y);
    return p;
  }
  const frameShape = rectPath(0.465, 0.445, 0.07, false);
  frameShape.holes.push(rectPath(0.395, 0.375, 0.055, true));
  const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
    depth: 0.030, bevelEnabled: false, curveSegments: 8
  });
  frameGeo.center();
  const rim = new THREE.Mesh(frameGeo, frameMat);
  rim.castShadow = true;
  rim.position.set(0, 0.145, -0.028);
  backG.add(rim);

  // 扶手
  [-1, 1].forEach(function (sgn) {
    const arm = new THREE.Group();
    arm.position.set(sgn * 0.255, 0, 0.02);
    chair.add(arm);
    U.box(0.045, 0.13, 0.05, frameMat, 0, 0.36, 0.13, arm);
    U.box(0.05, 0.035, 0.30, frameMat, 0, 0.432, 0.0, arm);
    const pad = U.roundedBox(0.055, 0.028, 0.24, 0.012, padMat, arm);
    pad.position.set(0, 0.462, -0.01);
  });
};
