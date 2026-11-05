/* 房间：地面、墙体、窗户、门、墙面软木板、置物架 */
const ROOM = { colliders: [] };

ROOM.build = function (scene) {
  const G = new THREE.Group();
  G.name = 'room';
  scene.add(G);

  /* ---- 地板 ---- */
  const floorMat = new THREE.MeshStandardMaterial({ map: TEX.floor, roughness: 0.62, metalness: 0.0, color: 0xffffff });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.8), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.001, 2.1);
  floor.receiveShadow = true;
  floor.name = 'floor';
  G.add(floor);

  /* ---- 墙面 ---- */
  const wallMat = new THREE.MeshStandardMaterial({ map: TEX.wall, roughness: 0.92, color: 0xf0e3cd });
  const backWall = U.plane(3.6, 2.8, wallMat, 0, 1.4, 0, G);
  backWall.name = 'back-wall';
  const leftWall = U.plane(4.4, 2.8, wallMat, -1.62, 1.4, 2.1, G);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.name = 'left-wall';
  const rightWall = U.plane(4.4, 2.8, wallMat, 1.62, 1.4, 2.1, G);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.name = 'right-wall';

  // 踢脚线
  const baseMat = U.mat.whitePaint;
  U.box(3.3, 0.085, 0.02, baseMat, 0, 0.045, 0.012, G);
  U.box(0.02, 0.085, 4.4, baseMat, -1.606, 0.045, 2.1, G);
  U.box(0.02, 0.085, 4.4, baseMat, 1.606, 0.045, 2.1, G);

  ROOM.buildWindow(G);
  ROOM.buildDoor(G);
  ROOM.buildPinboard(G);
  ROOM.buildWallShelf(G);
};

/* ============ 左侧百叶窗 ============ */
ROOM.buildWindow = function (G) {
  const win = new THREE.Group();
  win.position.set(0, 0, 0);
  win.name = 'window';
  G.add(win);

  const z0 = 0.10, z1 = 1.18, y0 = 1.00, y1 = 2.04;
  const cz = (z0 + z1) / 2, cy = (y0 + y1) / 2, h = y1 - y0, w = z1 - z0;

  // 窗洞发光面（百叶窗）
  const blindMat = new THREE.MeshBasicMaterial({ map: TEX.blinds, color: 0xffe6bd });
  const blind = new THREE.Mesh(new THREE.PlaneGeometry(w, h), blindMat);
  blind.rotation.y = Math.PI / 2;
  blind.position.set(-1.605, cy, cz);
  blind.name = 'blinds';
  win.add(blind);

  // 外框
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xfbf5ea, roughness: 0.5 });
  const fw = 0.055;
  U.box(0.05, h + fw * 2, fw, frameMat, -1.585, cy, z0 - fw / 2, win);
  U.box(0.05, h + fw * 2, fw, frameMat, -1.585, cy, z1 + fw / 2, win);
  U.box(0.05, fw, w, frameMat, -1.585, y1 + fw / 2, cz, win);
  U.box(0.05, fw, w, frameMat, -1.585, y0 - fw / 2, cz, win);
  // 上部小窗格
  U.box(0.04, fw * 0.7, w, frameMat, -1.585, 1.58, cz, win);

  // 窗台
  const sill = U.box(0.24, 0.045, w + 0.12, frameMat, -1.48, y0 - 0.035, cz, win);
  sill.name = 'windowsill';

  ROOM.colliders.push({ name: 'window', center: new THREE.Vector3(-1.55, 1.5, cz), half: new THREE.Vector3(0.06, 0.55, 0.55) });
};

/* ============ 右侧房门 ============ */
ROOM.buildDoor = function (G) {
  const door = new THREE.Group();
  door.name = 'door';
  G.add(door);

  const zc = 1.15, w = 0.94, h = 2.10;
  const slabMat = new THREE.MeshStandardMaterial({ color: 0xf3ebdd, roughness: 0.58 });
  const slab = U.box(0.045, h, w, slabMat, 1.585, h / 2 + 0.01, zc, door);
  slab.name = 'door-slab';

  // 门板内凹边框
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xe5d9c5, roughness: 0.65 });
  const panel = function (y, ph, pz, pw) {
    U.box(0.012, ph, 0.018, lineMat, 1.556, y, pz - pw / 2, door);
    U.box(0.012, ph, 0.018, lineMat, 1.556, y, pz + pw / 2, door);
    U.box(0.012, 0.018, pw, lineMat, 1.556, y - ph / 2, pz, door);
    U.box(0.012, 0.018, pw, lineMat, 1.556, y + ph / 2, pz, door);
  };
  panel(1.62, 0.62, zc, 0.66);
  panel(0.78, 0.72, zc, 0.66);

  // 门把手
  const handleMat = U.mat.metal;
  U.cyl(0.026, 0.026, 0.05, handleMat, 1.55, 1.02, zc - 0.36, door, 12).rotation.z = Math.PI / 2;
  const lever = U.box(0.05, 0.022, 0.10, handleMat, 1.52, 1.02, zc - 0.31, door);
  lever.geometry.dispose();
  U.sphere(0.045, handleMat, 1.55, 1.02, zc - 0.36, door, 10);

  // 门框
  const frameMat = U.mat.whitePaint;
  U.box(0.06, h + 0.05, 0.05, frameMat, 1.58, h / 2, zc - w / 2 - 0.02, door);
  U.box(0.06, h + 0.05, 0.05, frameMat, 1.58, h / 2, zc + w / 2 + 0.02, door);
  U.box(0.06, 0.05, w + 0.1, frameMat, 1.58, h + 0.02, zc, door);

  // 墙钩 + 帆布托特包
  const hook = U.cyl(0.012, 0.012, 0.06, handleMat, 1.53, 1.74, 0.30, door, 8);
  hook.rotation.z = Math.PI / 2;
  ROOM.buildTote(door, 1.545, 1.43, 0.30);

  ROOM.colliders.push({ name: 'door', center: new THREE.Vector3(1.58, 1.05, zc), half: new THREE.Vector3(0.05, 1.05, 0.47) });
};

/* 挂在墙上的印花开衫帆布包 */
ROOM.buildTote = function (parent, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = -Math.PI / 2;
  g.name = 'tote-bag';
  parent.add(g);

  const bagMat = new THREE.MeshStandardMaterial({ map: TEX.tote, roughness: 0.85, side: THREE.DoubleSide, color: 0xdec6a4 });
  const geo = new THREE.PlaneGeometry(0.40, 0.46, 12, 8);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i), py = pos.getY(i);
    // 布料自然垂坠
    pos.setZ(i, Math.cos(px / 0.2 * Math.PI / 2) * 0.035 + Math.sin((py / 0.46 + 0.5) * Math.PI) * 0.02);
    pos.setX(i, px * (1 + (0.5 - py / 0.46) * 0.06));
  }
  geo.computeVertexNormals();
  const bag = new THREE.Mesh(geo, bagMat);
  bag.castShadow = true;
  bag.position.y = -0.05;
  bag.name = 'tote-canvas';
  g.add(bag);

  // 提手
  const strapMat = new THREE.MeshStandardMaterial({ color: 0xe4d4b4, roughness: 0.9 });
  [-0.11, 0.11].forEach(function (sx) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx - 0.035, 0.15, 0.01),
      new THREE.Vector3(sx - 0.03, 0.32, 0.02),
      new THREE.Vector3(sx, 0.36, 0.01),
      new THREE.Vector3(sx + 0.03, 0.32, 0.0),
      new THREE.Vector3(sx + 0.035, 0.15, 0.0)
    ]);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.012, 6, false), strapMat);
    tube.castShadow = true;
    g.add(tube);
  });
};

/* ============ 软木板 + 便签 + 明信片 ============ */
ROOM.buildPinboard = function (G) {
  const board = new THREE.Group();
  board.name = 'pinboard';
  board.position.set(-0.12, 1.60, 0.028);
  G.add(board);

  const W = 1.42, H = 0.64;
  const corkMat = new THREE.MeshStandardMaterial({ color: 0xe6d5b6, roughness: 0.95 });
  U.box(W, H, 0.018, corkMat, 0, 0, 0, board);

  const frameMat = new THREE.MeshStandardMaterial({ color: 0xd7c4a2, roughness: 0.8 });
  U.box(W + 0.03, 0.02, 0.03, frameMat, 0, H / 2, 0, board);
  U.box(W + 0.03, 0.02, 0.03, frameMat, 0, -H / 2, 0, board);
  U.box(0.02, H + 0.03, 0.03, frameMat, -W / 2, 0, 0, board);
  U.box(0.02, H + 0.03, 0.03, frameMat, W / 2, 0, 0, board);

  // 便签：每张都是独立 Group（正面彩色纸 + 背面手写短句），供交互摘下展示
  const noteColors = [0xffd23e, 0xff9db4, 0x7fc8ea, 0xffb066, 0xa8dd8a, 0xf28f8f, 0xffe066];
  const noteMatBase = new THREE.MeshStandardMaterial({ map: TEX.note, roughness: 0.9 });
  const noteGeo = new THREE.PlaneGeometry(0.080, 0.080);
  const noteCount = 40, baseZ = 0.013;
  const backMats = TEX.noteBacks.map(function (tex, i) {
    const col = noteColors[i % noteColors.length];
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.9,
      color: new THREE.Color(col),
      emissive: new THREE.Color(col),
      emissiveIntensity: 0.12
    });
  });

  for (let i = 0; i < noteCount; i++) {
    const col = noteColors[i % noteColors.length];
    const note = new THREE.Group();

    const frontMat = noteMatBase.clone();
    frontMat.color = new THREE.Color(col);
    frontMat.emissive = new THREE.Color(col);
    frontMat.emissiveIntensity = 0.18;

    const front = new THREE.Mesh(noteGeo, frontMat);
    front.position.z = 0.0008;
    note.add(front);

    const back = new THREE.Mesh(noteGeo, backMats[i % backMats.length]);
    back.rotation.y = Math.PI;
    back.position.z = -0.0008;
    note.add(back);

    let colIdx = i % 8, rowIdx = Math.floor(i / 8);
    // “爱好”便签避开明信片遮挡，与其右侧的便签交换位置
    if (i === 2) colIdx = 4; else if (i === 4) colIdx = 2;
    const nx = -0.55 + colIdx * 0.157 + (Math.random() - 0.5) * 0.020;
    const ny = 0.205 - rowIdx * 0.088 + (Math.random() - 0.5) * 0.018;
    note.position.set(nx, ny, baseZ);
    note.rotation.z = (Math.random() - 0.5) * 0.12;
    note.name = 'sticky-note';
    note.userData.baseZ = baseZ;
    note.userData.homePos = note.position.clone();
    note.userData.homeQuat = note.quaternion.clone();
    note.userData.homeScale = note.scale.clone();
    board.add(note);
  }

  // 明信片
  const postPos = [
    [-0.16, 0.10, 0.20, 0.24],
    [0.06, 0.03, 0.17, 0.21],
    [0.46, -0.06, 0.19, 0.23],
    [0.24, 0.16, 0.16, 0.20]
  ];
  postPos.forEach(function (p, i) {
    const mat = new THREE.MeshStandardMaterial({ map: TEX.posts[i], roughness: 0.75 });
    const card = new THREE.Mesh(new THREE.PlaneGeometry(p[2], p[3]), mat);
    card.position.set(p[0], p[1], 0.016);
    card.rotation.z = (Math.random() - 0.5) * 0.05;
    card.name = 'postcard';
    board.add(card);
  });

  // "Good Vibes Only"
  const gvMat = new THREE.MeshStandardMaterial({ map: TEX.goodVibes, roughness: 0.85 });
  const gv = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.275), gvMat);
  gv.position.set(-0.47, 0.06, 0.020);
  gv.rotation.z = 0.015;
  gv.name = 'sign-good-vibes';
  board.add(gv);

  // "Dream Big"
  const dbMat = new THREE.MeshStandardMaterial({ map: TEX.dreamBig, roughness: 0.85 });
  const db = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.195), dbMat);
  db.position.set(0.50, 0.01, 0.020);
  db.rotation.z = -0.02;
  db.name = 'sign-dream-big';
  board.add(db);

  ROOM.colliders.push({ name: 'pinboard', center: new THREE.Vector3(-0.12, 1.60, 0.05), half: new THREE.Vector3(0.72, 0.33, 0.03) });
};

/* ============ 墙面置物架 ============ */
ROOM.buildWallShelf = function (G) {
  const shelf = new THREE.Group();
  shelf.name = 'wall-shelf';
  G.add(shelf);

  const y = 2.06, x0 = -1.16, x1 = 0.84, depth = 0.27;
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0xf1e6d3, roughness: 0.65 });
  const board = U.box(x1 - x0, 0.045, depth, shelfMat, (x0 + x1) / 2, y, depth / 2 + 0.002, shelf);

  // 支架
  const bracketMat = new THREE.MeshStandardMaterial({ color: 0xdccdb2, roughness: 0.6 });
  [x0 + 0.14, 0.0, x1 - 0.14].forEach(function (bx) {
    U.box(0.03, 0.13, 0.19, bracketMat, bx, y - 0.085, 0.10, shelf);
  });

  // 书排
  ROOM.buildBookRow(shelf, -0.68, y + 0.0225, 0.16, 0.045, 0.30, 13);

  // 猫咪玩偶
  PLUSH.cat(shelf, 0.22, y + 0.045, 0.13, 0.16, 0xffffff, 0.9);

  // 相框
  ROOM.buildFrame(shelf, 0.52, y + 0.045, 0.13, 0.30, 0.24);

  // 悬挂绿萝（挂在置物架前沿，叶片朝外生长）
  PLANT.hangingVine(shelf, -1.02, y + 0.02, 0.23, 0.62, 1);
  PLANT.hangingVine(shelf, 0.72, y + 0.02, 0.23, 0.72, 0);

  ROOM.colliders.push({ name: 'wall-shelf', center: new THREE.Vector3(-0.16, y, 0.14), half: new THREE.Vector3(1.0, 0.05, 0.14) });
};

/* 书架上的“书”对应的项目内容（点击书脊时弹出卡片） */
ROOM.bookProjects = [
  {
    title: '🎨 针笔绘梦', tag: '非遗宣传 · 项目',
    desc: '用针笔手绘讲述非遗故事，让传统纹样在网页上重新生长。',
    link: 'https://github.com/violet125/zhizhen-huimeng'
  },
  {
    title: '📱 Harmony 项目', tag: 'HarmonyOS · 应用',
    desc: '基于 HarmonyOS 的应用练习与多端适配实践。',
    link: 'https://github.com/violet125/harmony'
  },
  {
    title: '🏢 招商匹配空间交付项目', tag: '空间交付 · 项目',
    desc: '招商匹配空间项目的交付记录与流程整理。',
    link: 'https://github.com/violet125/11.5-assignments'
  }
];

ROOM.buildBookRow = function (parent, xStart, y, z, wTotal, maxH, count) {
  const colors = [0x7c8f6b, 0x97a67f, 0xc9be9a, 0x8a6f52, 0xb9ad8c, 0x6f8579, 0xd8cbae, 0x93a58a, 0xa8b49b];
  let x = xStart;
  for (let i = 0; i < count; i++) {
    const w = 0.026 + Math.random() * 0.030;
    const h = maxH * (0.72 + Math.random() * 0.28);
    const mat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.9 });
    const b = U.box(w, h, 0.155, mat, x + w / 2, y + h / 2, z, parent);
    b.rotation.z = Math.random() * 0.05 - 0.02;
    ROOM.bookSeq = (ROOM.bookSeq || 0) + 1;
    b.name = 'book_' + ROOM.bookSeq;
    b.userData.bookProject = ROOM.bookProjects[(ROOM.bookSeq - 1) % ROOM.bookProjects.length];
    b.userData.bookHome = b.position.clone();
    b.userData.bookHeight = h;
    if (i % 4 === 3) {
      // 书脊装饰线（作为书的子对象，随书一起滑出）
      const lineMat = new THREE.MeshStandardMaterial({ color: 0xe4d8bf, roughness: 0.9 });
      U.box(w * 0.8, 0.012, 0.158, lineMat, 0, h * 0.22, 0, b);
    }
    x += w + 0.004;
  }
  return x;
};

ROOM.buildFrame = function (parent, x, y, z, w, h) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = -0.12;
  parent.add(g);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xf4ead9, roughness: 0.5, metalness: 0.1 });
  U.box(w, h, 0.025, frameMat, 0, h / 2, 0, g);
  const mat = new THREE.MeshStandardMaterial({ map: TEX.photo, roughness: 0.4 });
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.04, h - 0.04), mat);
  photo.position.set(0, h / 2, 0.014);
  photo.name = 'photo-mountain';
  g.add(photo);
  return g;
};
