/* 温馨书桌一角 — 程序化贴图（Canvas 生成，无外部图片素材） */
const TEX = {};

(function () {
  const MAX = 1024;

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  function toTexture(c, opts) {
    opts = opts || {};
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 8;
    if (opts.repeat) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(opts.repeat[0], opts.repeat[1]);
    }
    t.encoding = THREE.sRGBEncoding;
    t.needsUpdate = true;
    return t;
  }

  function noise(ctx, w, h, amount, alpha) {
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() * 2 - 1) * amount;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
    if (alpha) {
      ctx.globalAlpha = alpha;
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- 墙面：暖米色、轻微颗粒 ---------- */
  TEX.wall = (function () {
    const c = canvas(256, 256), ctx = c.getContext('2d');
    ctx.fillStyle = '#efe2cf';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2200; i++) {
      ctx.fillStyle = 'rgba(190,170,145,' + (Math.random() * 0.10) + ')';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1.4, 1.4);
    }
    return toTexture(c, { repeat: [3, 2] });
  })();

  /* ---------- 木地板：长条拼板 + 木纹 ---------- */
  TEX.floor = (function () {
    const c = canvas(1024, 1024), ctx = c.getContext('2d');
    const rows = 8, rh = 1024 / rows;
    for (let r = 0; r < rows; r++) {
      const base = 152 + Math.random() * 16;
      ctx.fillStyle = 'rgb(' + base + ',' + (base - 38) + ',' + (base - 74) + ')';
      ctx.fillRect(0, r * rh, 1024, rh - 2);
      const off = (r % 2) * 512 + (Math.random() * 90 - 45);
      ctx.strokeStyle = 'rgba(120,82,44,.45)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(off, r * rh); ctx.lineTo(off, (r + 1) * rh); ctx.stroke();
      for (let g = 0; g < 26; g++) {
        const y = r * rh + Math.random() * rh;
        ctx.strokeStyle = 'rgba(135,95,55,' + (0.05 + Math.random() * 0.10) + ')';
        ctx.lineWidth = 0.6 + Math.random() * 1.4;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= 1024; x += 64) {
          ctx.lineTo(x, y + Math.sin((x + r * 37) / 90) * 3 + Math.random() * 2);
        }
        ctx.stroke();
      }
    }
    return toTexture(c, { repeat: [2, 2] });
  })();

  /* ---------- 便签：纸面 + 手写线条 ---------- */
  TEX.note = (function () {
    const c = canvas(128, 128), ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(90,80,70,.38)';
    for (let i = 0; i < 5; i++) {
      const y = 30 + i * 17 + Math.random() * 4;
      const w = 52 + Math.random() * 46;
      ctx.fillRect(20, y, w, 3);
      ctx.fillRect(20, y + 6, w * 0.6, 2);
    }
    ctx.fillStyle = 'rgba(120,110,100,.18)';
    ctx.fillRect(0, 0, 128, 3);
    return toTexture(c);
  })();

  /* ---------- 便签背面：手写短句 + 小涂鸦 ---------- */
  TEX.noteBacks = (function () {
    const backs = [
      { lines: ['刘洁', '软件工程', '2025届', '大二'], doodle: 'pen', cn: true, size: 34, lh: 44, startY: 60, dy: 224 },
      { lines: ['上海杉达学院'], doodle: 'star', cn: true, size: 30 },
      { lines: ['爱好', '看书 · 摄影', '养猫'], doodle: 'cat', cn: true, size: 28, lh: 46, startY: 96, dy: 222 },
      { lines: ['今天也要', '加油呀'], doodle: 'heart', cn: true },
      { lines: ['慢慢来', '比较快'], doodle: 'spiral', cn: true },
      { lines: ['dream', 'big'], doodle: 'star', cn: false },
      { lines: ['好好吃饭', '好好睡觉'], doodle: 'smile', cn: true },
      { lines: ['保持热爱', '奔赴山海'], doodle: 'flower', cn: true },
      { lines: ['be kind', 'to yourself'], doodle: 'heart', cn: false },
      { lines: ['早睡早起', '精神百倍'], doodle: 'sun', cn: true },
      { lines: ['一切都会', '好起来的'], doodle: 'sparkle', cn: true },
      { lines: ['记录', '生活'], doodle: 'pen', cn: true },
      { lines: ['stay', 'curious'], doodle: 'star', cn: false },
      { lines: ['记得', '多喝水'], doodle: 'drop', cn: true },
      { lines: ['明天', '会更好'], doodle: 'sun', cn: true }
    ];

    function doodle(ctx, kind, x, y) {
      ctx.save();
      ctx.strokeStyle = 'rgba(112,86,64,0.72)';
      ctx.fillStyle = 'rgba(112,86,64,0.72)';
      ctx.lineWidth = 3.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (kind === 'heart') {
        ctx.beginPath();
        ctx.moveTo(x, y + 15);
        ctx.bezierCurveTo(x - 24, y - 6, x - 13, y - 19, x, y - 7);
        ctx.bezierCurveTo(x + 13, y - 19, x + 24, y - 6, x, y + 15);
        ctx.stroke();
      } else if (kind === 'star') {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
          const b = a + Math.PI / 5;
          ctx.lineTo(x + Math.cos(a) * 15, y + Math.sin(a) * 15);
          ctx.lineTo(x + Math.cos(b) * 6.5, y + Math.sin(b) * 6.5);
        }
        ctx.closePath(); ctx.stroke();
      } else if (kind === 'smile') {
        ctx.beginPath(); ctx.arc(x, y, 15, 0.25, Math.PI - 0.25); ctx.stroke();
        ctx.beginPath(); ctx.arc(x - 6, y - 8, 1.6, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 6, y - 8, 1.6, 0, 7); ctx.fill();
      } else if (kind === 'flower') {
        for (let i = 0; i < 6; i++) {
          const a = i * Math.PI / 3;
          ctx.beginPath();
          ctx.ellipse(x + Math.cos(a) * 11, y + Math.sin(a) * 11, 6, 9, a, 0, 7);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 7); ctx.stroke();
      } else if (kind === 'sun') {
        ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.stroke();
        for (let i = 0; i < 8; i++) {
          const a = i * Math.PI / 4;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(a) * 15, y + Math.sin(a) * 15);
          ctx.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22);
          ctx.stroke();
        }
      } else if (kind === 'drop') {
        ctx.beginPath();
        ctx.moveTo(x, y - 16);
        ctx.bezierCurveTo(x + 14, y + 2, x + 11, y + 15, x, y + 15);
        ctx.bezierCurveTo(x - 11, y + 15, x - 14, y + 2, x, y - 16);
        ctx.stroke();
      } else if (kind === 'sparkle') {
        ctx.beginPath();
        ctx.moveTo(x, y - 16); ctx.lineTo(x + 4, y - 4); ctx.lineTo(x + 16, y);
        ctx.lineTo(x + 4, y + 4); ctx.lineTo(x, y + 16); ctx.lineTo(x - 4, y + 4);
        ctx.lineTo(x - 16, y); ctx.lineTo(x - 4, y - 4); ctx.closePath(); ctx.stroke();
      } else if (kind === 'spiral') {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 4.4; a += 0.2) {
          const r = 2 + a * 2.1;
          ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        }
        ctx.stroke();
      } else if (kind === 'pen') {
        ctx.beginPath();
        ctx.moveTo(x - 16, y + 16); ctx.lineTo(x + 12, y - 14);
        ctx.lineTo(x + 18, y - 8); ctx.lineTo(x - 10, y + 20); ctx.closePath();
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 16, y + 16); ctx.lineTo(x + 2, y + 12); ctx.stroke();
      } else if (kind === 'cat') {
        ctx.beginPath(); ctx.arc(x, y + 2, 14, 0, 7); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 13, y - 7); ctx.lineTo(x - 8, y - 19); ctx.lineTo(x - 2, y - 11); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 13, y - 7); ctx.lineTo(x + 8, y - 19); ctx.lineTo(x + 2, y - 11); ctx.stroke();
        ctx.beginPath(); ctx.arc(x - 5, y, 1.8, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 5, y, 1.8, 0, 7); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 2, y + 5); ctx.lineTo(x + 2, y + 5); ctx.lineTo(x, y + 8);
        ctx.closePath(); ctx.fill();
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - 18, y + 5); ctx.lineTo(x - 26, y + 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 18, y + 8); ctx.lineTo(x - 26, y + 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 18, y + 5); ctx.lineTo(x + 26, y + 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 18, y + 8); ctx.lineTo(x + 26, y + 10); ctx.stroke();
      }
      ctx.restore();
    }

    return backs.map(function (item) {
      const c = canvas(256, 256), ctx = c.getContext('2d');
      ctx.fillStyle = '#fffdf7';
      ctx.fillRect(0, 0, 256, 256);
      // 纸纤维
      for (let i = 0; i < 140; i++) {
        ctx.fillStyle = 'rgba(190,175,150,' + (0.04 + Math.random() * 0.05) + ')';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 3 + Math.random() * 9, 1);
      }
      // 顶部淡淡折痕
      ctx.fillStyle = 'rgba(150,130,105,.07)';
      ctx.fillRect(0, 24, 256, 2);
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.fillRect(0, 26, 256, 2);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(84,64,48,0.90)';
      const fs = item.size || (item.cn ? 46 : 50);
      ctx.font = item.cn
        ? fs + 'px "KaiTi", "STKaiti", "Microsoft YaHei", serif'
        : 'italic ' + fs + 'px "Segoe Script", "Brush Script MT", cursive';
      const lh = item.lh || 58, startY = item.startY || (item.lines.length > 1 ? 106 : 118);
      item.lines.forEach(function (line, i) {
        ctx.fillText(line, 128, startY + i * lh);
      });

      if (item.doodle) doodle(ctx, item.doodle, 128, item.dy || 184);
      return toTexture(c);
    });
  })();

  /* ---------- "Good Vibes Only" 手写卡片 ---------- */
  TEX.goodVibes = (function () {
    const c = canvas(512, 456), ctx = c.getContext('2d');
    ctx.fillStyle = '#fbf6ea';
    ctx.fillRect(0, 0, 512, 456);
    ctx.strokeStyle = '#cbbfa8'; ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, 484, 428);
    ctx.fillStyle = '#5b5148';
    ctx.textAlign = 'center';
    ctx.font = 'italic 84px "Segoe Script", "Brush Script MT", cursive';
    ctx.fillText('Good', 256, 150);
    ctx.fillText('Vibes', 256, 250);
    ctx.font = 'italic 62px "Segoe Script", "Brush Script MT", cursive';
    ctx.fillText('Only', 256, 340);
    ctx.strokeStyle = '#b9a98e'; ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(150, 375); ctx.quadraticCurveTo(256, 392, 362, 372);
    ctx.stroke();
    return toTexture(c);
  })();

  /* ---------- "Dream Big" 卡片 ---------- */
  TEX.dreamBig = (function () {
    const c = canvas(420, 340), ctx = c.getContext('2d');
    ctx.fillStyle = '#fbf7ec';
    ctx.fillRect(0, 0, 420, 340);
    ctx.fillStyle = '#58504a'; ctx.textAlign = 'center';
    ctx.font = 'italic 62px "Segoe Script", "Brush Script MT", cursive';
    ctx.fillText('Dream', 210, 118);
    ctx.font = 'italic 66px "Segoe Script", "Brush Script MT", cursive';
    ctx.fillText('Big', 152, 200);
    ctx.fillStyle = '#c9736a';
    heart(ctx, 268, 190, 18);
    ctx.fillStyle = '#8a7f74';
    ctx.font = 'italic 26px "Segoe Script", cursive';
    ctx.fillText('every day', 210, 270);
    return toTexture(c);
  })();

  function heart(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.5, y - s * 0.6, x - s * 0.9, y - s * 1.4, x, y - s * 0.5);
    ctx.bezierCurveTo(x + s * 0.9, y - s * 1.4, x + s * 1.5, y - s * 0.6, x, y + s * 0.9);
    ctx.fill();
  }

  /* ---------- 小风景明信片 ---------- */
  function postcard(sky1, sky2, hill1, hill2, sun) {
    const c = canvas(256, 320), ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 210);
    g.addColorStop(0, sky1); g.addColorStop(1, sky2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 210);
    if (sun) {
      ctx.fillStyle = 'rgba(255,238,200,.85)';
      ctx.beginPath(); ctx.arc(186, 62, 23, 0, 7); ctx.fill();
    }
    ctx.fillStyle = hill1;
    ctx.beginPath();
    ctx.moveTo(0, 210);
    ctx.bezierCurveTo(60, 150, 120, 175, 256, 190);
    ctx.lineTo(256, 320); ctx.lineTo(0, 320); ctx.closePath(); ctx.fill();
    ctx.fillStyle = hill2;
    ctx.beginPath();
    ctx.moveTo(0, 250);
    ctx.bezierCurveTo(80, 205, 170, 250, 256, 236);
    ctx.lineTo(256, 320); ctx.lineTo(0, 320); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    ctx.fillRect(0, 300, 256, 20);
    noise(ctx, 256, 320, 6);
    return toTexture(c);
  }
  TEX.posts = [
    postcard('#8ec5e6', '#cfe6ea', '#7e9c58', '#5d7f42', true),
    postcard('#a9cfe0', '#e3ecdf', '#8ca35f', '#6b8750', false),
    postcard('#f2c99b', '#f6e2c8', '#9c8a5c', '#6f6d43', true),
    postcard('#8fbcd2', '#d9e9dd', '#6f8f52', '#4f6b3b', false)
  ];

  /* ---------- 显示器壁纸：蓝天白云草原 ---------- */
  TEX.screen = (function () {
    const c = canvas(1024, 640), ctx = c.getContext('2d');
    const sky = ctx.createLinearGradient(0, 0, 0, 400);
    sky.addColorStop(0, '#3f9cd8');
    sky.addColorStop(0.55, '#7fc4e8');
    sky.addColorStop(1, '#cfe9f3');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 1024, 400);
    // 云
    for (let i = 0; i < 9; i++) {
      const cx = Math.random() * 1024, cy = 40 + Math.random() * 210, r = 34 + Math.random() * 62;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      for (let p = 0; p < 6; p++) {
        ctx.beginPath();
        ctx.arc(cx + p * r * 0.52, cy + Math.sin(p * 1.4) * r * 0.2, r * (0.75 + Math.random() * 0.45), 0, 7);
        ctx.fill();
      }
    }
    // 远处丘陵
    ctx.fillStyle = '#8fbf5e';
    ctx.beginPath();
    ctx.moveTo(0, 400);
    for (let x = 0; x <= 1024; x += 32) {
      ctx.lineTo(x, 380 - Math.sin(x / 120) * 26 - Math.sin(x / 46) * 8);
    }
    ctx.lineTo(1024, 640); ctx.lineTo(0, 640); ctx.closePath(); ctx.fill();
    // 草地明暗
    ctx.fillStyle = '#79ae4c';
    ctx.beginPath();
    ctx.moveTo(0, 470);
    for (let x = 0; x <= 1024; x += 32) ctx.lineTo(x, 452 - Math.sin(x / 90 + 2) * 18);
    ctx.lineTo(1024, 640); ctx.lineTo(0, 640); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,246,190,.18)';
    ctx.beginPath(); ctx.arc(760, 300, 260, 0, 7); ctx.fill();
    // 桌面图标
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(24, 24 + i * 92, 56, 56);
      ctx.fillStyle = 'rgba(60,110,160,.75)';
      ctx.fillRect(32, 32 + i * 92, 40, 40);
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.fillRect(22, 88 + i * 92, 60, 7);
    }
    // 任务栏
    ctx.fillStyle = 'rgba(28,42,58,.72)';
    ctx.fillRect(0, 600, 1024, 40);
    ctx.fillStyle = 'rgba(255,255,255,.65)';
    for (let i = 0; i < 7; i++) ctx.fillRect(20 + i * 44, 611, 22, 18);
    return toTexture(c);
  })();

  /* ---------- 书架上的山脉照片 ---------- */
  TEX.photo = (function () {
    const c = canvas(360, 280), ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 280);
    g.addColorStop(0, '#9fc4dd'); g.addColorStop(1, '#e9dfc8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 360, 280);
    ctx.fillStyle = '#6c7f96';
    ctx.beginPath(); ctx.moveTo(0, 200); ctx.lineTo(80, 96); ctx.lineTo(150, 200); ctx.lineTo(215, 120); ctx.lineTo(300, 200); ctx.lineTo(360, 150); ctx.lineTo(360, 280); ctx.lineTo(0, 280); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#98a9bd';
    ctx.beginPath(); ctx.moveTo(80, 96); ctx.lineTo(120, 160); ctx.lineTo(46, 170); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4f6f57';
    ctx.beginPath(); ctx.moveTo(0, 230); ctx.quadraticCurveTo(120, 205, 360, 240); ctx.lineTo(360, 280); ctx.lineTo(0, 280); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f7f3e6'; ctx.fillRect(0, 0, 360, 16); ctx.fillRect(0, 264, 360, 16); ctx.fillRect(0, 0, 16, 280); ctx.fillRect(344, 0, 16, 280);
    return toTexture(c);
  })();

  /* ---------- 托特包：猫咪线稿 ---------- */
  TEX.tote = (function () {
    const c = canvas(512, 560), ctx = c.getContext('2d');
    ctx.fillStyle = '#eddfc4';
    ctx.fillRect(0, 0, 512, 560);
    ctx.strokeStyle = 'rgba(120,100,75,.20)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(40 + i * 3, 0); ctx.lineTo(40 + i * 3 + 16, 560); ctx.stroke();
    }
    ctx.strokeStyle = '#6d6356'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(256, 250, 92, 0.05, Math.PI - 0.05, false); ctx.stroke();
    ctx.beginPath(); ctx.arc(256, 250, 92, Math.PI + 0.1, Math.PI * 2 - 0.1, false); ctx.stroke();
    // 耳朵
    ctx.beginPath(); ctx.moveTo(196, 186); ctx.lineTo(214, 128); ctx.lineTo(244, 176); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(316, 186); ctx.lineTo(298, 128); ctx.lineTo(268, 176); ctx.stroke();
    // 脸
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(222, 238, 6, 0, 7); ctx.fillStyle = '#6d6356'; ctx.fill();
    ctx.beginPath(); ctx.arc(290, 238, 6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(256, 250); ctx.lineTo(246, 258); ctx.lineTo(266, 258); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(256, 260); ctx.lineTo(256, 266); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(256, 266); ctx.quadraticCurveTo(236, 276, 226, 264); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(256, 266); ctx.quadraticCurveTo(276, 276, 286, 264); ctx.stroke();
    // 胡须
    ctx.lineWidth = 2;
    for (let s = -1; s <= 1; s += 2) {
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(256 + s * 18, 258 + k * 4);
        ctx.lineTo(256 + s * (86 + k * 8), 246 + k * 12);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = '#d9c9a8';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(256, 560, 120, Math.PI, Math.PI * 2); ctx.stroke();
    return toTexture(c);
  })();

  /* ---------- 日历：按真实日期动态绘制（可在跨天时刷新） ---------- */
  TEX.makeCalendar = function (date) {
    const now = date || new Date();
    const day = now.getDate();
    const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()];
    const monthUpper = monthAbbr.toUpperCase();

    // 日期面：大字“日” + 小字月份缩写
    const dayC = canvas(128, 160), dctx = dayC.getContext('2d');
    dctx.fillStyle = '#efe1c2';
    dctx.fillRect(0, 0, 128, 160);
    dctx.fillStyle = 'rgba(160,132,92,.25)';
    dctx.fillRect(0, 0, 128, 26);
    for (let i = 0; i < 700; i++) {
      dctx.fillStyle = 'rgba(150,120,80,' + (Math.random() * 0.05) + ')';
      dctx.fillRect(Math.random() * 128, Math.random() * 160, 1.2, 1.2);
    }
    dctx.fillStyle = '#6b5c4b';
    dctx.textAlign = 'center';
    dctx.font = 'bold ' + (day < 10 ? '72px' : '64px') + ' Georgia, "Times New Roman", serif';
    dctx.fillText(String(day), 64, 114);
    dctx.font = '17px Georgia, "Times New Roman", serif';
    dctx.fillText(monthUpper, 64, 146);
    dctx.strokeStyle = 'rgba(140,112,76,.45)';
    dctx.lineWidth = 1;
    dctx.beginPath(); dctx.moveTo(20, 130); dctx.lineTo(108, 130); dctx.stroke();

    // 月份面：月份缩写
    const monthC = canvas(160, 128), mctx = monthC.getContext('2d');
    mctx.fillStyle = '#f3e6ca';
    mctx.fillRect(0, 0, 160, 128);
    mctx.fillStyle = 'rgba(160,132,92,.16)';
    mctx.fillRect(0, 0, 160, 18);
    mctx.fillStyle = '#7b6a56';
    mctx.textAlign = 'center';
    mctx.font = 'italic 46px Georgia, "Times New Roman", serif';
    mctx.fillText(monthAbbr, 80, 82);

    return { day: toTexture(dayC), month: toTexture(monthC) };
  };

  /* ---------- 书脊 ---------- */
  TEX.spines = (function () {
    const colors = ['#7c8f6b', '#97a67f', '#c9be9a', '#8a6f52', '#b9ad8c', '#6f8579', '#d8cbae', '#93a58a'];
    const c = canvas(64, 256), ctx = c.getContext('2d');
    ctx.fillStyle = '#efe4cd'; ctx.fillRect(0, 0, 64, 256);
    const col = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillStyle = col; ctx.fillRect(6, 0, 52, 256);
    ctx.fillStyle = 'rgba(255,255,255,.32)';
    ctx.fillRect(12, 0, 36, 256);
    ctx.fillStyle = 'rgba(70,60,45,.55)';
    ctx.fillRect(12, 60, 36, 4); ctx.fillRect(12, 190, 36, 4);
    return toTexture(c);
  })();

  /* ---------- 地毯/桌垫 ---------- */
  TEX.mat = (function () {
    const c = canvas(512, 256), ctx = c.getContext('2d');
    ctx.fillStyle = '#d9cdb8'; ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = 'rgba(150,132,108,' + (Math.random() * 0.12) + ')';
      ctx.fillRect(Math.random() * 512, Math.random() * 256, 1.2, 1.2);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 240);
    return toTexture(c);
  })();

  /* ---------- 椅子网布 ---------- */
  TEX.meshFabric = (function () {
    const c = canvas(256, 256), ctx = c.getContext('2d');
    ctx.fillStyle = '#cfc4b2'; ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 4) {
      for (let x = 0; x < 256; x += 4) {
        ctx.fillStyle = (x + y) % 8 === 0 ? 'rgba(112,102,88,.55)' : 'rgba(255,255,255,.28)';
        ctx.fillRect(x, y, 2, 2);
      }
    }
    return toTexture(c, { repeat: [2, 2] });
  })();

  /* ---------- 百叶窗光带 ---------- */
  TEX.blinds = (function () {
    const c = canvas(256, 512), ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, '#fff3cf'); g.addColorStop(0.5, '#ffe4a8'); g.addColorStop(1, '#ffd88c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 512);
    for (let y = 0; y < 512; y += 26) {
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(0, y, 256, 9);
      ctx.fillStyle = 'rgba(190,150,96,.28)'; ctx.fillRect(0, y + 18, 256, 6);
    }
    return toTexture(c);
  })();

  /* ---------- 木纹桌面 ---------- */
  TEX.wood = (function () {
    const c = canvas(512, 512), ctx = c.getContext('2d');
    ctx.fillStyle = '#c39a6b'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = 'rgba(120,86,50,' + (0.06 + Math.random() * 0.12) + ')';
      ctx.lineWidth = 0.7 + Math.random() * 2;
      ctx.beginPath();
      const y = Math.random() * 512;
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) ctx.lineTo(x, y + Math.sin(x / 70 + i) * 5);
      ctx.stroke();
    }
    return toTexture(c, { repeat: [1, 1] });
  })();

  TEX.make = toTexture;
  TEX.canvas = canvas;
  TEX.heart = heart;
})();
