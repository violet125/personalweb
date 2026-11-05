/* 场景装配、相机、灯光与交互 */
(function () {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf3e6d2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('app').appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(43, window.innerWidth / window.innerHeight, 0.1, 20);
  const HOME = { pos: new THREE.Vector3(0.15, 1.74, 3.42), target: new THREE.Vector3(0.0, 1.06, 0.12) };
  camera.position.copy(HOME.pos);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 1.3;
  controls.maxDistance = 5.5;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.minPolarAngle = Math.PI * 0.12;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.update();

  /* ---------------- 灯光 ---------------- */
  const hemi = new THREE.HemisphereLight(0xfff1de, 0xa6835e, 0.48);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffcf90, 1.18);
  sun.position.set(-3.2, 2.9, 2.4);
  sun.target.position.set(-0.3, 0.85, 0.45);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.4;
  sun.shadow.camera.far = 11;
  sun.shadow.camera.left = -3.2;
  sun.shadow.camera.right = 3.2;
  sun.shadow.camera.top = 3.2;
  sun.shadow.camera.bottom = -1.6;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  scene.add(sun.target);

  const fill = new THREE.DirectionalLight(0xffe9d4, 0.34);
  fill.position.set(2.6, 2.2, 3.0);
  fill.target.position.set(0, 1.0, 0.3);
  scene.add(fill);
  scene.add(fill.target);

  const ceil = new THREE.PointLight(0xffe2b8, 0.35, 5, 2);
  ceil.position.set(0.2, 2.6, 1.2);
  scene.add(ceil);

  /* ---------------- 装配 ---------------- */
  ROOM.build(scene);
  DESK.build(scene);

  // 窗台上的小盆栽（落在窗台面，叶片朝室内一侧生长）
  PLANT.pottedPlant(scene, -1.45, 0.988, 0.95, 0.9, 3, U.mat.potClay,
    { maxReach: 0.22, facing: 0, spread: 1.0 });
  // 落地绿植（桌角左侧，叶片朝开阔方向，避开左墙、窗台与桌体）
  PLANT.floorPlant(scene, -1.30, 0.34, 21,
    { maxReach: 0.30, maxHeight: 0.88, facing: 0, spread: 1.12 });

  scene.traverse(function (o) {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });

  /* ---------------- 交互：点击识别 ---------------- */
  const NAMES = {
    'desk-corner': '温馨书桌一角',
    'desk-top': '桌面',
    'drawer-cabinet': '抽屉柜',
    'drawer-front': '抽屉',
    'monitor': '显示器',
    'monitor-screen': '屏幕',
    'keyboard': '键盘',
    'mouse': '鼠标',
    'globe-lamp': '球形台灯',
    'headphones': '头戴耳机',
    'pen-cup': '笔筒',
    'calendar': '日历',
    'green-drink': '绿色饮品',
    'daisy-bouquet': '雏菊花瓶',
    'vase': '玻璃花瓶',
    'side-shelf': '小书架',
    'office-chair': '办公椅',
    'chair-back': '网布椅背',
    'pinboard': '软木板',
    'sticky-note': '便利贴',
    'postcard': '明信片',
    'sign-good-vibes': 'Good Vibes Only',
    'sign-dream-big': 'Dream Big',
    'wall-shelf': '墙面置物架',
    'window': '百叶窗',
    'blinds': '百叶窗',
    'door': '房门',
    'tote-bag': '猫咪帆布包',
    'floor-plant': '落地绿植',
    'potted-plant': '小盆栽',
    'hanging-vine': '垂坠绿萝',
    'cat-plush': '猫咪玩偶',
    'photo-mountain': '雪山照片',
    'windowsill': '窗台',
    'desk-mat': '桌垫'
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const chip = document.getElementById('chip');
  const chipName = document.getElementById('chip-name');

  function pick(ev) {
    pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(ev.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(scene.children, true);
    for (let i = 0; i < hits.length; i++) {
      let o = hits[i].object;
      while (o && !NAMES[o.name] && !o.userData.bookProject) o = o.parent;
      if (o && (NAMES[o.name] || o.userData.bookProject)) return o;
    }
    return null;
  }

  /* ---------------- 书架：点击抽拉 + HTML 项目卡片 ---------------- */
  const bookCard = document.getElementById('book-card');
  const bookCardTitle = document.getElementById('book-card-title');
  const bookCardTag = document.getElementById('book-card-tag');
  const bookCardDesc = document.getElementById('book-card-desc');
  const bookCardLink = document.getElementById('book-card-link');
  let bookActive = null;

  function showBookCard(book) {
    const p = book.userData.bookProject;
    bookCard.style.setProperty('--accent', '#' + book.material.color.getHexString());
    bookCardTitle.textContent = p.title;
    bookCardTag.textContent = p.tag;
    bookCardDesc.textContent = p.desc;
    bookCardLink.href = p.link;
    bookCard.classList.add('show');
  }

  function hideBookCard() {
    bookCard.classList.remove('show');
  }

  function slideBookHome(book, duration) {
    const home = book.userData.bookHome;
    gsap.killTweensOf(book.position);
    gsap.killTweensOf(book.scale);
    gsap.to(book.position, { x: home.x, y: home.y, z: home.z, duration: duration, ease: 'power3.inOut' });
    gsap.to(book.scale, { x: 1, y: 1, z: 1, duration: duration, ease: 'power3.inOut' });
  }

  function openBook(book) {
    if (!book || book === bookActive) return;
    if (bookActive) slideBookHome(bookActive, 0.4);
    bookActive = book;
    showBookCard(book);

    const home = book.userData.bookHome;
    const liftY = home.y + book.userData.bookHeight * 0.075;
    gsap.killTweensOf(book.position);
    gsap.killTweensOf(book.scale);
    // 沿自身 Z 轴（朝向镜头）滑出约 15cm，并稍微放大
    gsap.to(book.position, {
      x: home.x, y: liftY, z: home.z + 0.15,
      duration: 0.7, ease: 'power3.out'
    });
    gsap.to(book.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.7, ease: 'power3.out' });
  }

  function closeBook() {
    if (!bookActive) return;
    slideBookHome(bookActive, 0.5);
    bookActive = null;
    hideBookCard();
  }

  /* ---------------- 便利贴：悬停凸起 / 点击摘下 / 空白放回 ---------------- */
  const noteProxy = { t: 0, a: 0 };
  let activeNote = null;
  let hoverNote = null;
  let noteState = 'idle'; // idle | presenting | shown | returning

  const tmpQuat = new THREE.Quaternion();
  const tmpVec = new THREE.Vector3();
  const tmpMat = new THREE.Matrix4();

  function presentNote(note) {
    if (!note || noteState !== 'idle') return;
    activeNote = note;
    noteState = 'presenting';
    hoverNote = null;
    chip.classList.remove('show');
    controls.enabled = false;
    renderer.domElement.style.cursor = 'default';

    // 记录木板上的原始位置（用建造时保存的基准变换，避免带回悬停时的凸起）
    note.userData.home = {
      parent: note.parent,
      pos: note.userData.homePos.clone(),
      quat: note.userData.homeQuat.clone(),
      scale: note.userData.homeScale.clone()
    };

    // 保留世界变换，从木板脱离到场景中
    note.updateWorldMatrix(true, false);
    const startPos = new THREE.Vector3();
    const startQuat = new THREE.Quaternion();
    const startScale = new THREE.Vector3();
    note.matrixWorld.decompose(startPos, startQuat, startScale);
    scene.attach(note);
    note.position.copy(startPos);
    note.quaternion.copy(startQuat);
    note.scale.copy(startScale);

    // 目标：镜头正前方中央
    const dir = camera.getWorldDirection(tmpVec.clone());
    const targetPos = camera.position.clone().add(dir.multiplyScalar(0.55));
    const roll = (Math.random() - 0.5) * 0.10;
    const targetQuat = camera.quaternion.clone().multiply(
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll)
    );
    const targetScale = startScale.x * 2.3;

    gsap.killTweensOf(note.position);
    gsap.killTweensOf(note.scale);
    gsap.killTweensOf(noteProxy);

    const qFrom = startQuat.clone();
    noteProxy.t = 0;
    gsap.to(noteProxy, {
      t: 1, duration: 0.9, ease: 'power3.out',
      onUpdate: function () {
        tmpQuat.copy(qFrom).slerp(targetQuat, noteProxy.t);
        note.quaternion.copy(tmpQuat);
      },
      onComplete: function () {
        if (activeNote !== note) return;
        noteState = 'shown';
        // 落定后再旋转半圈，展示背面的手写短句
        const qLand = note.quaternion.clone();
        noteProxy.a = 0;
        gsap.to(noteProxy, {
          a: 1, duration: 1.0, ease: 'power2.inOut', delay: 0.12,
          onUpdate: function () {
            tmpQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * noteProxy.a);
            note.quaternion.copy(qLand).multiply(tmpQuat);
          }
        });
      }
    });
    gsap.to(note.position, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 0.9, ease: 'power3.out' });
    gsap.to(note.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 0.9, ease: 'power3.out' });
  }

  function returnNote() {
    if (!activeNote || noteState === 'returning') return;
    const note = activeNote;
    const home = note.userData.home;
    noteState = 'returning';

    gsap.killTweensOf(note.position);
    gsap.killTweensOf(note.scale);
    gsap.killTweensOf(noteProxy);

    // 用木板的当前世界变换换算出便签应回到的世界位置
    home.parent.updateWorldMatrix(true, false);
    tmpMat.compose(home.pos, home.quat, home.scale);
    tmpMat.premultiply(home.parent.matrixWorld);
    const endPos = new THREE.Vector3();
    const endQuat = new THREE.Quaternion();
    const endScale = new THREE.Vector3();
    tmpMat.decompose(endPos, endQuat, endScale);

    const qFrom = note.quaternion.clone();
    const proxy = { t: 0 };
    gsap.to(proxy, {
      t: 1, duration: 0.55, ease: 'power3.inOut',
      onUpdate: function () {
        tmpQuat.copy(qFrom).slerp(endQuat, proxy.t);
        note.quaternion.copy(tmpQuat);
      }
    });
    gsap.to(note.position, {
      x: endPos.x, y: endPos.y, z: endPos.z, duration: 0.55, ease: 'power3.inOut'
    });
    gsap.to(note.scale, {
      x: endScale.x, y: endScale.y, z: endScale.z, duration: 0.55, ease: 'power3.inOut',
      onComplete: function () {
        home.parent.add(note);
        note.position.copy(home.pos);
        note.quaternion.copy(home.quat);
        note.scale.copy(home.scale);
        activeNote = null;
        noteState = 'idle';
        controls.enabled = true;
        renderer.domElement.style.cursor = 'grab';
      }
    });
  }

  function hoverOut(note) {
    if (!note) return;
    gsap.killTweensOf(note.position);
    gsap.to(note.position, { z: note.userData.baseZ, duration: 0.2, ease: 'power2.out' });
  }

  renderer.domElement.addEventListener('pointermove', function (ev) {
    if (noteState !== 'idle') {
      renderer.domElement.style.cursor = 'default';
      return;
    }
    const o = pick(ev);
    const note = o && o.name === 'sticky-note' ? o : null;
    if (note !== hoverNote) {
      if (hoverNote) hoverOut(hoverNote);
      hoverNote = note;
      if (note) {
        gsap.killTweensOf(note.position);
        gsap.to(note.position, { z: note.userData.baseZ + 0.018, duration: 0.18, ease: 'power2.out' });
      }
    }
    renderer.domElement.style.cursor = o ? 'pointer' : 'grab';
  });

  renderer.domElement.addEventListener('pointerleave', function () {
    if (hoverNote) hoverOut(hoverNote);
    hoverNote = null;
  });

  let downX = 0, downY = 0;
  renderer.domElement.addEventListener('pointerdown', function (ev) {
    downX = ev.clientX; downY = ev.clientY;
  });

  renderer.domElement.addEventListener('click', function (ev) {
    // 拖拽旋转视角时不触发点击
    if (Math.abs(ev.clientX - downX) + Math.abs(ev.clientY - downY) > 8) return;

    const o = pick(ev);
    const clickedNote = o && o.name === 'sticky-note' ? o : null;
    const clickedBook = o && o.userData.bookProject ? o : null;

    // 便利贴展示中：点击其它位置先让它飞回
    if (noteState !== 'idle') {
      if (clickedNote === activeNote) return;
      returnNote();
      if (!clickedBook) return;
    }

    // 书本：点击抽拉，再次点击同一本或点击空白则复位
    if (clickedBook) {
      if (clickedBook === bookActive) closeBook();
      else openBook(clickedBook);
      return;
    }
    if (bookActive) closeBook();

    if (clickedNote) {
      if (noteState === 'idle') presentNote(clickedNote);
      return;
    }

    if (!o) {
      chip.classList.remove('show');
      return;
    }
    chipName.textContent = NAMES[o.name];
    chip.classList.add('show');
    clearTimeout(chip._t);
    chip._t = setTimeout(function () { chip.classList.remove('show'); }, 2600);
  });

  /* ---------------- 视角与灯光切换 ---------------- */
  const btnReset = document.getElementById('btn-reset');
  btnReset.addEventListener('click', function () {
    if (noteState !== 'idle') returnNote();
    closeBook();
    camera.position.copy(HOME.pos);
    controls.target.copy(HOME.target);
    controls.update();
  });

  const moods = {
    sun:    { sunColor: 0xffcf96, sunIntensity: 1.55, hemi: 0.55, exposure: 1.02, lamp: 1.5, bg: 0xf3e6d2, glow: 0.30 },
    sunset: { sunColor: 0xff9d5a, sunIntensity: 1.05, hemi: 0.40, exposure: 0.95, lamp: 2.0, bg: 0xe8c9a8, glow: 0.45 },
    night:  { sunColor: 0x7d8fc4, sunIntensity: 0.20, hemi: 0.22, exposure: 0.82, lamp: 2.4, bg: 0x2b2a3a, glow: 0.75 }
  };
  let mood = 'sun';
  const btnLight = document.getElementById('btn-light');
  btnLight.addEventListener('click', function () {
    mood = mood === 'sun' ? 'sunset' : mood === 'sunset' ? 'night' : 'sun';
    const m = moods[mood];
    sun.color.setHex(m.sunColor);
    sun.intensity = m.sunIntensity;
    hemi.intensity = m.hemi;
    renderer.toneMappingExposure = m.exposure;
    scene.background.setHex(m.bg);
    if (DESK.lampLight) DESK.lampLight.intensity = m.lamp;
    if (DESK.screenLight) DESK.screenLight.intensity = mood === 'night' ? 0.25 : 0.45;
    btnLight.textContent = mood === 'sun' ? '光线：暖阳' : mood === 'sunset' ? '光线：黄昏' : '光线：夜灯';
  });

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------------- 渲染循环 ---------------- */
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  document.getElementById('loading').classList.add('hide');

  /* ---------------- 日历：跨天自动刷新 ---------------- */
  setInterval(function () {
    if (DESK.updateCalendar) DESK.updateCalendar(new Date());
  }, 30000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && DESK.updateCalendar) DESK.updateCalendar(new Date());
  });
})();
