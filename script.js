/* =========================================================
   Feliz día de las Flores Amarillas — lógica (mobile-first)
   Sin imágenes: estrellas, partículas y flores son SVG/Canvas.

   ESTADO 1: girasol + "PRESIÓNAME" sobre fondo negro.
   ESTADO 2: universo tipo sistema solar — una esfera-girasol
   en el centro y muchos girasoles orbitando a su alrededor.
   Se puede arrastrar con el dedo para girar todo el universo.
   ========================================================= */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Utilidades
     --------------------------------------------------------- */
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function pickWithoutRepeat(arr, lastValue) {
    if (arr.length === 1) return arr[0];
    var v = lastValue;
    while (v === lastValue) { v = pick(arr); }
    return v;
  }

  /* ---------------------------------------------------------
     Mensajes (tono de amistad, cortos para celular)
     --------------------------------------------------------- */
  var CENTRAL_MESSAGES = [
    'Te doy las flores digitales porque en persona no pude JAJAJA',
    'Para ti 🌻',
    'Coño qué difícil fue hacerlo 😅',
    'Feliz día de las flores amarillas ✨',
    'Una pequeña sorpresa para ti'
  ];

  var FIELD_MESSAGES = [
    'Para ti 🌻',
    'Espero que esto te saque una sonrisa',
    'Solo para ti 💛',
    'Una más para la colección',
    'Brillando por ti ✨',
    'Coño qué difícil fue hacerlo 😅',
    'Te doy las flores digitales porque en persona no pude JAJAJA'
  ];

  var lastCentralMsg = null;
  var lastFieldMsg = null;

  /* ---------------------------------------------------------
     Toast de mensajes
     --------------------------------------------------------- */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;

  function showToast(text) {
    clearTimeout(toastTimer);
    toastEl.textContent = text;
    toastEl.classList.remove('show');
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2200);
  }

  /* ---------------------------------------------------------
     Canvas de cielo: estrellas + polvo dorado flotando
     --------------------------------------------------------- */
  var skyCanvas = document.getElementById('sky');
  var skyCtx = skyCanvas.getContext('2d');
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var stars = [];
  var dust = [];
  var W = 0, H = 0;

  function sizeCanvas(canvas, ctx) {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function buildStars() {
    var count = Math.round((W * H) / 5500);
    count = Math.max(60, Math.min(count, 160));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: rand(0, W),
        y: rand(0, H * 0.85),
        r: rand(0.5, 1.6),
        base: rand(0.25, 0.85),
        speed: rand(0.6, 1.8),
        phase: rand(0, Math.PI * 2)
      });
    }
  }

  function buildDust() {
    dust = [];
    if (reduceMotion) return;
    var count = Math.max(16, Math.min(Math.round(W / 14), 36));
    for (var i = 0; i < count; i++) {
      dust.push(spawnDust());
    }
  }

  function spawnDust() {
    return {
      x: rand(0, W),
      y: H + rand(0, H * 0.3),
      r: rand(1, 2.6),
      speed: rand(10, 22),
      drift: rand(-8, 8),
      alpha: 0,
      alphaTarget: rand(0.35, 0.85),
      life: 0,
      maxLife: rand(6, 13),
      swayPhase: rand(0, Math.PI * 2)
    };
  }

  var lastSkyFrame = null;

  function drawSky(ts) {
    if (lastSkyFrame === null) lastSkyFrame = ts;
    var dt = Math.min((ts - lastSkyFrame) / 1000, 0.05);
    lastSkyFrame = ts;

    skyCtx.clearRect(0, 0, W, H);

    var grad = skyCtx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#06060d');
    grad.addColorStop(1, '#0c0c1a');
    skyCtx.fillStyle = grad;
    skyCtx.fillRect(0, 0, W, H);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = reduceMotion ? s.base : s.base + Math.sin(ts / 1000 * s.speed + s.phase) * 0.25;
      tw = clamp(tw, 0.1, 1);
      skyCtx.beginPath();
      skyCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      skyCtx.fillStyle = 'rgba(255, 248, 230, ' + tw.toFixed(3) + ')';
      skyCtx.fill();
    }

    if (!reduceMotion) {
      for (var j = 0; j < dust.length; j++) {
        var d = dust[j];
        d.life += dt;
        d.y -= d.speed * dt;
        d.x += Math.sin(ts / 1000 + d.swayPhase) * d.drift * dt;

        var fadeIn = Math.min(d.life / 1.2, 1);
        var fadeOut = Math.min((d.maxLife - d.life) / 1.2, 1);
        d.alpha = d.alphaTarget * Math.max(0, Math.min(fadeIn, fadeOut));

        skyCtx.beginPath();
        skyCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        skyCtx.fillStyle = 'rgba(255, 205, 90, ' + d.alpha.toFixed(3) + ')';
        skyCtx.shadowColor = 'rgba(255, 190, 60, 0.8)';
        skyCtx.shadowBlur = 4;
        skyCtx.fill();
        skyCtx.shadowBlur = 0;

        if (d.life >= d.maxLife || d.y < -10) {
          dust[j] = spawnDust();
        }
      }
    }

    requestAnimationFrame(drawSky);
  }

  function initSky() {
    sizeCanvas(skyCanvas, skyCtx);
    buildStars();
    buildDust();
    requestAnimationFrame(drawSky);
  }

  /* ---------------------------------------------------------
     Canvas de ráfagas (explosión de partículas al tocar)
     --------------------------------------------------------- */
  var burstCanvas = document.getElementById('burst');
  var burstCtx = burstCanvas.getContext('2d');
  var burstParticles = [];
  var burstRunning = false;
  var lastBurstFrame = null;
  var GOLD_TONES = ['255, 211, 77', '255, 182, 39', '255, 241, 194', '255, 150, 60'];

  function sizeBurstCanvas() {
    sizeCanvas(burstCanvas, burstCtx);
  }

  function spawnBurst(x, y, count, colorList) {
    for (var i = 0; i < count; i++) {
      var angle = rand(0, Math.PI * 2);
      var speed = rand(60, 220);
      burstParticles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(20, 60),
        r: rand(1.5, 3.6),
        life: 0,
        maxLife: rand(0.6, 1.1),
        color: pick(colorList)
      });
    }
    if (!burstRunning) {
      burstRunning = true;
      lastBurstFrame = null;
      requestAnimationFrame(drawBurst);
    }
  }

  function drawBurst(ts) {
    if (lastBurstFrame === null) lastBurstFrame = ts;
    var dt = Math.min((ts - lastBurstFrame) / 1000, 0.05);
    lastBurstFrame = ts;

    burstCtx.clearRect(0, 0, W, H);

    var stillAlive = false;
    for (var i = 0; i < burstParticles.length; i++) {
      var p = burstParticles[i];
      if (!p) continue;
      p.life += dt;
      if (p.life >= p.maxLife) { burstParticles[i] = null; continue; }
      stillAlive = true;

      p.vy += 140 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      var a = 1 - (p.life / p.maxLife);
      burstCtx.beginPath();
      burstCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      burstCtx.fillStyle = 'rgba(' + p.color + ', ' + a.toFixed(3) + ')';
      burstCtx.shadowColor = 'rgba(' + p.color + ', 0.9)';
      burstCtx.shadowBlur = 6;
      burstCtx.fill();
      burstCtx.shadowBlur = 0;
    }

    if (stillAlive) {
      burstParticles = burstParticles.filter(function (p) { return p !== null; });
      requestAnimationFrame(drawBurst);
    } else {
      burstParticles = [];
      burstRunning = false;
    }
  }

  /* ---------------------------------------------------------
     Generador de flores en SVG (sin imágenes)
     --------------------------------------------------------- */
  var svgIdCounter = 0;

  function makeFlowerSVG(opts) {
    svgIdCounter++;
    var gPetal = 'petalG' + svgIdCounter;
    var gCenter = 'centerG' + svgIdCounter;
    var gHi = 'hiG' + svgIdCounter;
    var petals = opts.petals || 12;
    var cx = 50, cy = 50;
    var petalLen = opts.petalLen || 34;
    var petalW = opts.petalW || 13;
    var centerR = opts.centerR || 17;

    var petalShapes = '';
    for (var i = 0; i < petals; i++) {
      var angle = (360 / petals) * i;
      petalShapes +=
        '<ellipse cx="' + cx + '" cy="' + (cy - centerR - petalLen / 2 + 4) + '" ' +
        'rx="' + (petalW / 2) + '" ry="' + (petalLen / 2) + '" ' +
        'fill="url(#' + gPetal + ')" ' +
        'transform="rotate(' + angle + ' ' + cx + ' ' + cy + ')" />';
    }

    var seedDots = '';
    var seedCount = 10;
    for (var s = 0; s < seedCount; s++) {
      var sa = (360 / seedCount) * s + 15;
      var sr = centerR * 0.6;
      var sx = cx + Math.cos(sa * Math.PI / 180) * sr;
      var sy = cy + Math.sin(sa * Math.PI / 180) * sr;
      seedDots += '<circle cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="1.3" fill="rgba(0,0,0,0.28)" />';
    }

    // pequeño brillo especular para dar sensación de volumen / esfera
    var hiX = cx - centerR * 0.32;
    var hiY = cy - centerR * 0.38;
    var hiRx = centerR * 0.34;
    var hiRy = centerR * 0.22;

    return (
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="' + gPetal + '" cx="50%" cy="15%" r="90%">' +
            '<stop offset="0%" stop-color="' + (opts.petalColor1 || '#fff1c2') + '"/>' +
            '<stop offset="55%" stop-color="' + (opts.petalColor2 || '#ffd34d') + '"/>' +
            '<stop offset="100%" stop-color="' + (opts.petalColor3 || '#ffb627') + '"/>' +
          '</radialGradient>' +
          '<radialGradient id="' + gCenter + '" cx="38%" cy="32%" r="75%">' +
            '<stop offset="0%" stop-color="' + (opts.centerColor0 || '#a9773c') + '"/>' +
            '<stop offset="30%" stop-color="' + (opts.centerColor1 || '#5b3a1c') + '"/>' +
            '<stop offset="70%" stop-color="' + (opts.centerColor2 || '#2a1a10') + '"/>' +
            '<stop offset="100%" stop-color="' + (opts.centerColor3 || '#140b05') + '"/>' +
          '</radialGradient>' +
          '<radialGradient id="' + gHi + '" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>' +
            '<stop offset="100%" stop-color="rgba(255,255,255,0)"/>' +
          '</radialGradient>' +
        '</defs>' +
        petalShapes +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + centerR + '" fill="url(#' + gCenter + ')" />' +
        seedDots +
        '<ellipse cx="' + hiX.toFixed(1) + '" cy="' + hiY.toFixed(1) + '" rx="' + hiRx.toFixed(1) + '" ry="' + hiRy.toFixed(1) + '" fill="url(#' + gHi + ')" />' +
      '</svg>'
    );
  }

  // La esfera-girasol central: centro grande y muy sombreado para que
  // se lea como un orbe con volumen (un "sol" hecho de girasol).
  function makeSunSVG() {
    return makeFlowerSVG({
      petals: 14,
      petalLen: 30,
      petalW: 14,
      centerR: 27,
      petalColor1: '#fff6d6',
      petalColor2: '#ffd34d',
      petalColor3: '#ffab1f',
      centerColor0: '#c99248',
      centerColor1: '#7a4d22',
      centerColor2: '#2c1a0d',
      centerColor3: '#0f0904'
    });
  }

  function makeOrbiterSVG() {
    return makeFlowerSVG({
      petals: Math.round(rand(9, 12)),
      petalLen: rand(28, 36),
      petalW: rand(10, 14),
      centerR: rand(13, 17),
      petalColor1: '#fff6d6',
      petalColor2: '#ffd34d',
      petalColor3: '#ffb627',
      centerColor0: '#a9773c',
      centerColor1: '#5b3a1c',
      centerColor2: '#2a1a10',
      centerColor3: '#140b05'
    });
  }

  /* ---------------------------------------------------------
     Construcción de la esfera-girasol central y del girasol
     inicial (estado 1)
     --------------------------------------------------------- */
  var centralBtn = document.getElementById('centralFlower');
  centralBtn.innerHTML = makeSunSVG();

  var startFlowerBtn = document.getElementById('startFlower');
  startFlowerBtn.innerHTML = makeSunSVG();

  /* ---------------------------------------------------------
     Sistema de órbitas 3D: girasoles girando alrededor del sol
     en coordenadas x,y,z reales (no solo 2D con sombreado falso).
     Se proyecta a pantalla con una cámara en perspectiva que el
     usuario puede rotar arrastrando (yaw = horizontal, pitch =
     vertical), así las flores pasan por delante/detrás del sol.
     --------------------------------------------------------- */
  var sceneEl = document.getElementById('scene');
  var orbitLayer = document.getElementById('orbitLayer');
  var orbiters = [];
  var MAX_ORBITERS = 34;
  var Z_BASE = 1000; // z-index del sol; los girasoles se ordenan alrededor de este valor

  var geom = { cx: 0, cy: 0, usableStart: 60, usableRange: 100, camDist: 400 };

  function computeGeometry() {
    var rect = sceneEl.getBoundingClientRect();
    geom.cx = rect.width / 2;
    geom.cy = rect.height / 2;
    var minDim = Math.min(rect.width, rect.height);
    var maxRadius = minDim / 2 - 16;
    var sunRect = centralBtn.getBoundingClientRect();
    var sunRadius = (sunRect.width || minDim * 0.42) / 2;
    geom.usableStart = sunRadius + 22;
    geom.usableRange = Math.max(maxRadius - geom.usableStart, 36);
    // distancia de cámara: cuanto más grande, más "plano"/suave la perspectiva
    geom.camDist = (geom.usableStart + geom.usableRange) * 2.3;
  }

  centralBtn.style.zIndex = String(Z_BASE);

  function addOrbiter(delayMs, ringFraction, inclinationDeg) {
    if (orbiters.length >= MAX_ORBITERS) return;

    var size = rand(34, 56);
    var fraction = (ringFraction !== undefined) ? ringFraction : rand(0.12, 1);
    var incl = (inclinationDeg !== undefined) ? inclinationDeg : rand(-22, 22);
    var speed = rand(4, 14) * (rand(0, 1) > 0.5 ? 1 : -1); // grados/seg, sentidos mixtos
    var baseAngle = rand(0, 360);
    var swayDeg = rand(3, 7);
    var swayDur = rand(3.5, 6.5);
    var swayDelay = rand(0, 2);

    var btn = document.createElement('button');
    btn.className = 'orbiter';
    btn.setAttribute('aria-label', 'Tocar girasol');
    btn.style.setProperty('--size', size + 'px');
    btn.style.setProperty('--sway-deg', swayDeg + 'deg');
    btn.style.setProperty('--sway-dur', swayDur + 's');
    btn.style.setProperty('--sway-delay', swayDelay + 's');
    btn.style.setProperty('--o', rand(0.85, 1));

    var inner = document.createElement('span');
    inner.className = 'orbiter-inner';
    inner.innerHTML = makeOrbiterSVG();
    btn.appendChild(inner);

    btn.addEventListener('click', onOrbiterTap);

    orbitLayer.appendChild(btn);

    var orbiter = {
      el: btn,
      fraction: fraction,
      baseAngle: baseAngle,
      speed: speed,
      size: size,
      inclRad: incl * Math.PI / 180
    };
    orbiters.push(orbiter);

    positionOrbiter(orbiter, 0);

    setTimeout(function () {
      btn.classList.add('show');
    }, delayMs || 20);
  }

  // Proyecta un punto del mundo 3D (x,y,z) a coordenadas de pantalla,
  // aplicando la rotación de cámara (yaw/pitch) y la perspectiva.
  function projectPoint(x, y, z) {
    // rotación de cámara alrededor del eje Y (arrastre horizontal)
    var cosY = Math.cos(camera.yaw), sinY = Math.sin(camera.yaw);
    var x1 = x * cosY + z * sinY;
    var z1 = -x * sinY + z * cosY;
    var y1 = y;

    // rotación de cámara alrededor del eje X (arrastre vertical)
    var cosP = Math.cos(camera.pitch), sinP = Math.sin(camera.pitch);
    var y2 = y1 * cosP - z1 * sinP;
    var z2 = y1 * sinP + z1 * cosP;
    var x2 = x1;

    var scale = geom.camDist / (geom.camDist - z2);
    return {
      x: geom.cx + x2 * scale,
      y: geom.cy + y2 * scale,
      scale: scale,
      depth: z2
    };
  }

  function positionOrbiter(o, elapsedSec) {
    var radius = geom.usableStart + geom.usableRange * o.fraction;
    var angleDeg = o.baseAngle + o.speed * elapsedSec;
    var rad = angleDeg * Math.PI / 180;

    // órbita en el plano XZ, luego inclinada para que los anillos
    // se vean como discos de un sistema solar, no todos planos
    var ox = radius * Math.cos(rad);
    var oz0 = radius * Math.sin(rad);
    var oy = -Math.sin(o.inclRad) * oz0;
    var oz = Math.cos(o.inclRad) * oz0;

    var p = projectPoint(ox, oy, oz);

    o.el.style.transform =
      'translate(' + (p.x - o.size / 2).toFixed(1) + 'px, ' + (p.y - o.size / 2).toFixed(1) + 'px) ' +
      'scale(' + p.scale.toFixed(3) + ')';
    o.el.style.zIndex = String(Z_BASE + Math.round(p.depth));
    o.el.style.opacity = String(clamp(0.55 + p.scale * 0.5, 0.35, 1));
  }

  var orbitStartTime = null;

  function orbitLoop(ts) {
    if (orbitStartTime === null) orbitStartTime = ts;
    var elapsedSec = (ts - orbitStartTime) / 1000;

    updateCamera(ts);

    for (var i = 0; i < orbiters.length; i++) {
      positionOrbiter(orbiters[i], elapsedSec);
    }

    requestAnimationFrame(orbitLoop);
  }

  /* ---------------------------------------------------------
     Cámara 3D: el usuario arrastra para girar/inclinar la vista
     de todo el universo (como rotar un globo terráqueo).
     --------------------------------------------------------- */
  var camera = {
    yaw: 0,
    pitch: -0.34, // ligera inclinación inicial para que se note el 3D desde ya
    yawVel: 0,
    pitchVel: 0
  };
  var PITCH_LIMIT = 0.9; // ~51°, evita que la cámara se voltee

  function updateCamera(ts) {
    var dt = updateCamera._lastTs ? (ts - updateCamera._lastTs) / 1000 : 0.016;
    updateCamera._lastTs = ts;

    if (!dragState.active) {
      if (Math.abs(camera.yawVel) > 0.001) {
        camera.yaw += camera.yawVel * dt;
        camera.yawVel *= Math.pow(0.02, dt);
      } else {
        camera.yawVel = 0;
      }
      if (Math.abs(camera.pitchVel) > 0.001) {
        camera.pitch += camera.pitchVel * dt;
        camera.pitch = clamp(camera.pitch, -PITCH_LIMIT, PITCH_LIMIT);
        camera.pitchVel *= Math.pow(0.02, dt);
      } else {
        camera.pitchVel = 0;
      }
    }
  }

  /* ---------------------------------------------------------
     Arrastre táctil: gira e inclina la cámara del universo
     --------------------------------------------------------- */
  var dragState = {
    active: false,
    pointerId: null,
    startX: 0, startY: 0,
    lastX: 0, lastY: 0, lastT: 0,
    moved: false,
    yawVelSample: 0,
    pitchVelSample: 0
  };

  function onScenePointerDown(e) {
    dragState.active = true;
    dragState.pointerId = e.pointerId;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
    dragState.lastX = e.clientX;
    dragState.lastY = e.clientY;
    dragState.lastT = performance.now();
    dragState.moved = false;
    camera.yawVel = 0;
    camera.pitchVel = 0;
  }

  function onScenePointerMove(e) {
    if (!dragState.active || e.pointerId !== dragState.pointerId) return;

    if (!dragState.moved) {
      var totalDx = e.clientX - dragState.startX;
      var totalDy = e.clientY - dragState.startY;
      if (Math.abs(totalDx) > 6 || Math.abs(totalDy) > 6) {
        dragState.moved = true;
      }
    }

    if (dragState.moved) {
      if (e.cancelable) e.preventDefault();
      var now = performance.now();
      var dt = Math.max(now - dragState.lastT, 1);
      var dx = e.clientX - dragState.lastX;
      var dy = e.clientY - dragState.lastY;

      var yawPerPx = 0.0075;   // radianes por pixel
      var pitchPerPx = 0.0065;

      camera.yaw += dx * yawPerPx;
      camera.pitch = clamp(camera.pitch - dy * pitchPerPx, -PITCH_LIMIT, PITCH_LIMIT);

      dragState.yawVelSample = (dx / dt) * yawPerPx * 1000;
      dragState.pitchVelSample = -(dy / dt) * pitchPerPx * 1000;

      dragState.lastX = e.clientX;
      dragState.lastY = e.clientY;
      dragState.lastT = now;
    }
  }

  function suppressNextClick() {
    var handler = function (ev) {
      ev.stopPropagation();
      window.removeEventListener('click', handler, true);
    };
    window.addEventListener('click', handler, true);
  }

  function onScenePointerUp(e) {
    if (!dragState.active || (dragState.pointerId !== null && e.pointerId !== dragState.pointerId)) return;
    dragState.active = false;
    if (dragState.moved) {
      camera.yawVel = clamp(dragState.yawVelSample, -6, 6);
      camera.pitchVel = clamp(dragState.pitchVelSample, -6, 6);
      suppressNextClick();
    }
  }

  sceneEl.addEventListener('pointerdown', onScenePointerDown);
  sceneEl.addEventListener('pointermove', onScenePointerMove, { passive: false });
  window.addEventListener('pointerup', onScenePointerUp);
  window.addEventListener('pointercancel', onScenePointerUp);

  /* ---------------------------------------------------------
     Interacciones (100% táctiles, sin hover)
     --------------------------------------------------------- */
  function onCentralTap() {
    var rect = centralBtn.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    centralBtn.classList.remove('bloom');
    void centralBtn.offsetWidth;
    centralBtn.classList.add('bloom');

    var glowRing = document.getElementById('glowRing');
    glowRing.classList.remove('burst');
    void glowRing.offsetWidth;
    glowRing.classList.add('burst');

    spawnBurst(cx, cy, 30, GOLD_TONES);

    addOrbiter(60);
    addOrbiter(220);

    var msg = pickWithoutRepeat(CENTRAL_MESSAGES, lastCentralMsg);
    lastCentralMsg = msg;
    showToast(msg);
  }

  function onOrbiterTap(e) {
    var btn = e.currentTarget;
    var rect = btn.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    btn.classList.remove('tapped');
    void btn.offsetWidth;
    btn.classList.add('tapped');

    spawnBurst(cx, cy, 12, GOLD_TONES);

    var msg = pickWithoutRepeat(FIELD_MESSAGES, lastFieldMsg);
    lastFieldMsg = msg;
    showToast(msg);
  }

  centralBtn.addEventListener('click', onCentralTap);

  /* ---------------------------------------------------------
     Secuencia del universo (estado 2)
     Primero el cielo (ya dibujándose), luego el sol, luego los
     girasoles que orbitan van apareciendo, y al final el mensaje.
     --------------------------------------------------------- */
  function playUniverseIntro() {
    var titleWrap = document.getElementById('titleWrap');
    var glowRing = document.getElementById('glowRing');
    var hint = document.getElementById('hint');

    computeGeometry();

    var t = 250;

    setTimeout(function () { glowRing.classList.add('show'); }, t);
    t += 450;

    setTimeout(function () { centralBtn.classList.add('show'); }, t);
    t += 400;

    var ringCounts = [7, 9, 10]; // anillo interior, medio, exterior
    var ringInclinations = [10, -16, 24]; // cada anillo inclinado distinto, como discos reales
    var idx = 0;
    for (var r = 0; r < ringCounts.length; r++) {
      var fractionBase = (r + 1) / (ringCounts.length + 0.4);
      for (var k = 0; k < ringCounts[r]; k++) {
        var fraction = clamp(fractionBase + rand(-0.06, 0.06), 0.1, 1);
        var incl = ringInclinations[r] + rand(-4, 4);
        addOrbiter(t + idx * 90, fraction, incl);
        idx++;
      }
    }
    t += idx * 90 + 350;

    setTimeout(function () { titleWrap.classList.add('show'); }, t);
    t += 1000;

    setTimeout(function () { hint.classList.add('show'); }, t);

    requestAnimationFrame(orbitLoop);
  }

  function startUniverse() {
    initSky();
    playUniverseIntro();
  }

  /* ---------------------------------------------------------
     Transición: estado 1 (girasol) → estado 2 (universo)
     --------------------------------------------------------- */
  var stage1 = document.getElementById('stage1');
  var appEl = document.getElementById('app');
  var flashOverlay = document.getElementById('flashOverlay');
  var transitioning = false;

  function onStartTap() {
    if (transitioning) return;
    transitioning = true;

    var rect = startFlowerBtn.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    spawnBurst(cx, cy, 30, GOLD_TONES);

    flashOverlay.classList.remove('play');
    void flashOverlay.offsetWidth;
    flashOverlay.classList.add('play');

    stage1.classList.add('fade-out');

    setTimeout(function () {
      stage1.style.display = 'none';
      appEl.classList.remove('hidden');
      void appEl.offsetWidth;
      appEl.classList.add('show');
      startUniverse();
    }, 700);
  }

  startFlowerBtn.addEventListener('click', onStartTap);

  /* ---------------------------------------------------------
     Resize / orientación
     --------------------------------------------------------- */
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      sizeCanvas(skyCanvas, skyCtx);
      buildStars();
      buildDust();
      sizeBurstCanvas();
      computeGeometry();
    }, 150);
  });

  /* ---------------------------------------------------------
     Arranque
     Solo preparamos el canvas de ráfagas (para las chispas del
     estado 1). El universo no se construye hasta que el usuario
     presiona el girasol inicial.
     --------------------------------------------------------- */
  sizeBurstCanvas();

})();
