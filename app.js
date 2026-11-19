/* Countline — card pile hero */
(() => {
  'use strict';

  const APP_STORE_URL = 'https://apps.apple.com/app/id6771420862';
  const DAY = 86400000;
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  const today = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); })();
  const next = (m, d) => { let x = new Date(today.getFullYear(), m, d); if (x < today) x = new Date(today.getFullYear() + 1, m, d); return x; };
  const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const addMonths = (d, n) => { const r = new Date(d.getFullYear(), d.getMonth() + n, 1); const last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate(); r.setDate(Math.min(d.getDate(), last)); return r; };
  const fmtShort = d => MON[d.getMonth()] + ' ' + d.getDate() + (d.getFullYear() < today.getFullYear() ? ', ' + d.getFullYear() : '');

  // years + months, months + days, or days — like the app
  function natural(target) {
    if (sameDay(target, today)) return { parts: [['Today', '']], past: false };
    const past = target < today; const a = past ? target : today, b = past ? today : target;
    let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    if (addMonths(a, months) > b) months--;
    const days = Math.round((b - addMonths(a, months)) / DAY);
    const y = Math.floor(months / 12), m = months % 12;
    let parts = y ? [[y, 'y'], [m, 'm']] : months ? [[m, 'm'], [days, 'd']] : [[days, 'd']];
    parts = parts.filter((p, i) => p[0] || i === 0);
    return { parts, past };
  }

  /* ── 20 ideas the form cycles through after each drop ── */
  const IDEAS = [
    ['Daughter’s Birthday', 2, 14], ['Wedding Anniversary', 5, 21], ['Trip to Lisbon', 5, 26], ['Mom’s Birthday', 4, 9],
    ['Summer Vacation', 6, 15], ['First Day of School', 8, 1], ['Christmas', 11, 25], ['New Year’s Eve', 11, 31],
    ['Valentine’s Day', 1, 14], ['Halloween Party', 9, 31], ['Concert Night', 3, 18], ['Marathon Race', 9, 12],
    ['Graduation Day', 5, 5], ['Moving Day', 7, 30], ['Baby Due Date', 3, 2], ['Ski Weekend', 1, 7],
    ['Dad’s 60th', 10, 23], ['Paris Weekend', 4, 23], ['Team Offsite', 8, 18], ['Grandma’s Visit', 6, 4]
  ];
  const COLORS = ['lime', 'pink', 'blue', 'orange', 'purple', 'yellow', 'green'];

  /* ── Form + calendar ── */
  const form = document.getElementById('drop-form');
  const nameInput = document.getElementById('event-name');
  const dateBtn = document.getElementById('date-button');
  const dateLabel = document.getElementById('date-label');
  const cal = document.getElementById('calendar');
  const calTitle = document.getElementById('cal-title');
  const calDays = document.getElementById('cal-days');
  let ideaIndex = 0;
  let selected = next(IDEAS[0][1], IDEAS[0][2]);
  let pending = selected;
  let viewMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);

  const showDate = () => { dateLabel.textContent = fmtShort(selected); };
  showDate();

  function renderCalendar() {
    calTitle.textContent = MONTHS[viewMonth.getMonth()] + ' ' + viewMonth.getFullYear();
    const first = (viewMonth.getDay() + 6) % 7; // Monday first
    const start = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1 - first);
    let html = '';
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const cls = [d.getMonth() !== viewMonth.getMonth() ? 'out' : '', sameDay(d, today) ? 'today' : ''].join(' ').trim();
      html += `<button type="button" role="gridcell" class="${cls}" data-t="${+d}" aria-selected="${sameDay(d, pending)}" aria-label="${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}">${d.getDate()}</button>`;
    }
    calDays.innerHTML = html;
  }
  function placeCalendar() {
    if (matchMedia('(max-width: 640px)').matches) { cal.style.left = '0px'; return; }
    const right = dateBtn.offsetLeft + dateBtn.offsetWidth; // offsetParent is the form
    cal.style.left = Math.max(0, right - cal.offsetWidth) + 'px';
  }
  function openCalendar() {
    pending = selected;
    viewMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
    renderCalendar();
    cal.hidden = false;
    dateBtn.setAttribute('aria-expanded', 'true');
    placeCalendar();
    const sel = calDays.querySelector('[aria-selected="true"]');
    (sel || calDays.querySelector('button')).focus({ preventScroll: true });
  }
  function closeCalendar(apply) {
    if (cal.hidden) return;
    if (apply) { selected = pending; showDate(); }
    cal.hidden = true;
    dateBtn.setAttribute('aria-expanded', 'false');
    dateBtn.focus({ preventScroll: true });
  }
  dateBtn.addEventListener('click', () => (cal.hidden ? openCalendar() : closeCalendar(false)));
  document.getElementById('cal-prev').addEventListener('click', () => { viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1); renderCalendar(); });
  document.getElementById('cal-next').addEventListener('click', () => { viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1); renderCalendar(); });
  calDays.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    pending = new Date(+b.dataset.t);
    closeCalendar(true); // picking a day sets it and closes the calendar
  });
  cal.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeCalendar(false); return; }
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (step && e.target.closest('.cal-days')) {
      e.preventDefault();
      pending = new Date(pending.getFullYear(), pending.getMonth(), pending.getDate() + step);
      viewMonth = new Date(pending.getFullYear(), pending.getMonth(), 1);
      renderCalendar();
      calDays.querySelector('[aria-selected="true"]').focus({ preventScroll: true });
    }
    if (e.key === 'Enter' && e.target.closest('.cal-days')) { e.preventDefault(); pending = new Date(+e.target.dataset.t); closeCalendar(true); }
  });
  document.addEventListener('pointerdown', e => { if (!cal.hidden && !cal.contains(e.target) && !dateBtn.contains(e.target)) closeCalendar(false); });
  addEventListener('resize', () => { if (!cal.hidden) placeCalendar(); });

  /* ── Physics pile ── */
  const stage = document.getElementById('stage');
  if (!window.Matter) return; // the form still works without the pile
  const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Events, Query } = Matter;

  const engine = Engine.create({ gravity: { x: 0, y: 0.9 }, positionIterations: 10, velocityIterations: 8 });
  const world = engine.world;
  const items = [];
  let W = stage.clientWidth, H = stage.clientHeight, walls = [];
  const floor = document.querySelector('.pile-floor');
  // card size follows the width breakpoints and shrinks when the pile area is short
  const scale = () => {
    const byWidth = W <= 640 ? 0.56 : W <= 1100 ? 0.72 : 1;
    const byHeight = Math.max(0.45, Math.min(1, (floor ? floor.clientHeight : 640) / 600));
    return Math.min(byWidth, byHeight) * 1.2; // objects 20% larger than the Figma sizes
  };

  function buildWalls() {
    walls.forEach(w => Composite.remove(world, w));
    const t = 400;
    walls = [
      Bodies.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true }),
      Bodies.rectangle(-t / 2, H / 2 - 2000, t, H * 2 + 4000, { isStatic: true }),
      Bodies.rectangle(W + t / 2, H / 2 - 2000, t, H * 2 + 4000, { isStatic: true }),
      Bodies.rectangle(W / 2, -1200 - t / 2, W * 3, t, { isStatic: true }) // high ceiling: tilting can't lose cards
    ];
    Composite.add(world, walls);
  }

  function track(el, body, w, h, kind) {
    const it = { el, body, w, h, kind };
    items.push(it);
    return it;
  }

  // Event card: width is the Figma width scaled, never shorter than its content
  function addCard({ name, date, color, value, label, width, angle = 0, x, y }) {
    const s = scale();
    const el = document.createElement('div');
    el.className = 'card';
    el.style.setProperty('--s', s);
    el.style.background = `var(--${color})`;
    const n = value ? { parts: value, past: false } : natural(date);
    const val = n.parts.map(([v, u]) => `<b>${v}</b>${u ? `<sup>${u}</sup>` : ''}`).join('');
    el.innerHTML = `<div><div class="name"></div><div class="date"></div></div><div class="val">${val}</div>`;
    el.querySelector('.name').textContent = name;
    el.querySelector('.date').textContent = label || fmtShort(date);
    el.style.width = 'max-content';
    stage.appendChild(el);
    const h = Math.round(92 * s);
    const w = Math.min(W - 8, Math.max(Math.round(el.offsetWidth + 8 * s), Math.round((width || 380) * s)));
    el.style.width = w + 'px';
    const body = Bodies.rectangle(x ?? (w / 2 + Math.random() * Math.max(1, W - w)), y ?? (-h - Math.random() * 300), w, h,
      { chamfer: { radius: h / 2 - 1 }, restitution: 0.38, friction: 0.35, frictionAir: 0.02, density: 0.0016, slop: 0.02 });
    Body.setAngle(body, angle);
    Composite.add(world, body);
    trim();
    return track(el, body, w, h, 'card');
  }

  function addChip(kind, x, y) {
    const s = scale();
    const d = Math.round((kind === 'shake' ? 120 : 104) * s);
    const el = document.createElement('div');
    el.className = 'chip chip-' + kind;
    el.style.setProperty('--s', s);
    el.style.width = el.style.height = d + 'px';
    if (kind === 'plus') { el.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>'; el.title = 'Drop your event'; }
    if (kind === 'check') el.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    if (kind === 'shake') { el.innerHTML = '<div><b>Tap</b></div>'; el.title = 'Shake the pile'; }
    stage.appendChild(el);
    const body = Bodies.circle(x, y, d / 2, { restitution: 0.45, friction: 0.2, frictionAir: 0.015, density: 0.002 });
    Composite.add(world, body);
    return track(el, body, d, d, kind);
  }

  function addStoreCard(x, y, angle) {
    const s = scale();
    const h = Math.round(92 * s), w = Math.round(h * 186 / 60);
    const el = document.createElement('div');
    el.className = 'store-card';
    el.style.setProperty('--s', s);
    el.style.width = w + 'px'; el.style.height = h + 'px';
    el.title = 'Download on the App Store';
    el.innerHTML = '<img src="img/appstore-button.svg" alt="" draggable="false">';
    stage.appendChild(el);
    const body = Bodies.rectangle(x, y, w, h, { chamfer: { radius: 14 * s }, restitution: 0.38, friction: 0.35, frictionAir: 0.02, density: 0.0016 });
    Body.setAngle(body, angle);
    Composite.add(world, body);
    return track(el, body, w, h, 'store');
  }

  // keep the pile readable: the oldest card fades out when there are too many
  function trim() {
    const fh = floor ? floor.clientHeight : 640;
    const max = W <= 640 ? (fh < 340 ? 5 : 7) : W <= 1100 ? 12 : 16; // cards only; buttons stay
    const cards = items.filter(i => i.kind === 'card');
    if (cards.length <= max) return;
    fadeOut(cards[0]);
  }
  function fadeOut(it) {
    items.splice(items.indexOf(it), 1);
    it.el.style.transition = 'opacity .4s ease';
    it.el.style.opacity = '0';
    setTimeout(() => { Composite.remove(world, it.body); it.el.remove(); }, 400);
    // the faded card still needs drawing while it fades
    const draw = () => { if (!it.el.isConnected) return; const { x, y } = it.body.position; it.el.style.transform = `translate3d(${x - it.w / 2}px, ${y - it.h / 2}px, 0) rotate(${it.body.angle}rad)`; requestAnimationFrame(draw); };
    requestAnimationFrame(draw);
  }

  // Figma pile (desktop): name, date/value, color, width, rotation
  const DEG = Math.PI / 180;
  const SEED = [
    { name: 'Flight to Rome', date: next(7, 3), color: 'blue', width: 520, angle: 0 },
    { name: 'The day we met', date: new Date(2021, 7, 14), color: 'grey', width: 340, angle: 2 * DEG },
    { name: 'Morning run', value: [['18', 'days']], label: 'Habit', color: 'green', width: 300, angle: -2 * DEG },
    { name: 'Mom’s birthday', date: next(2, 14), color: 'pink', width: 530, angle: -9 * DEG },
    { name: 'New Year', date: next(0, 1), color: 'lime', width: 310, angle: 14 * DEG },
    { name: 'Marathon prep', value: [['2 / 3', '']], label: 'To-do', color: 'yellow', width: 450, angle: -9 * DEG },
    { name: 'Lisbon budget', value: [['5 900', '₴']], label: 'Calculator', color: 'orange', width: 390, angle: 5 * DEG },
    { name: 'Melania’s 30th', date: next(11, 2), color: 'purple', width: 350, angle: -24 * DEG }
  ];

  let started = false;
  function start() {
    if (started) return; started = true;
    buildWalls();
    const step = reduceMotion ? 0 : 130;
    // phones: fewer cards so the pile stays below the form
    const fh = floor ? floor.clientHeight : 640;
    const drop = W > 640 ? [] : fh < 340 ? ['The day we met', 'Lisbon budget', 'Morning run', 'Marathon prep', 'New Year'] : ['The day we met', 'Lisbon budget', 'Morning run'];
    const seed = SEED.filter(c => !drop.includes(c.name));
    seed.forEach((c, i) => setTimeout(() => addCard({ ...c, y: reduceMotion ? H - 60 - i * 30 : -140 - i * 50 }), i * step));
    setTimeout(() => {
      addStoreCard(W * 0.66, reduceMotion ? H - 200 : -160, -8 * DEG);
      addChip('plus', W * 0.06, reduceMotion ? H - 80 : -220);
      addChip('check', W * 0.93, reduceMotion ? H - 80 : -260);
      addChip('shake', W * 0.88, reduceMotion ? H - 200 : -420);
    }, seed.length * step + 60);
  }

  /* pointer: drag, throw, tap */
  const mouse = Mouse.create(stage);
  ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach(t => mouse.element.removeEventListener(t, mouse.mousewheel));
  // touch: only grab when the finger lands on an item, otherwise let the page scroll
  mouse.element.removeEventListener('touchmove', mouse.mousemove);
  mouse.element.removeEventListener('touchstart', mouse.mousedown);
  const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.06, damping: 0.25, render: { visible: false } } });
  Composite.add(world, mc);
  const pointAt = (clientX, clientY) => { const r = stage.getBoundingClientRect(); return { x: clientX - r.left, y: clientY - r.top }; };
  stage.addEventListener('touchstart', e => {
    const t = e.changedTouches[0];
    if (Query.point(items.map(i => i.body), pointAt(t.clientX, t.clientY)).length) mouse.mousedown(e);
  }, { passive: false });
  stage.addEventListener('touchmove', e => { if (mc.body) mouse.mousemove(e); }, { passive: false });
  Events.on(mc, 'startdrag', () => stage.classList.add('dragging'));
  Events.on(mc, 'enddrag', () => stage.classList.remove('dragging'));

  // tap detection for the buttons that live in the pile
  let press = null;
  stage.addEventListener('pointerdown', e => {
    const p = pointAt(e.clientX, e.clientY);
    const hit = items.find(i => i.kind !== 'card' && Query.point([i.body], p).length);
    press = hit ? { it: hit, x: e.clientX, y: e.clientY } : null;
  });
  stage.addEventListener('pointerup', e => {
    if (!press) return;
    const moved = Math.hypot(e.clientX - press.x, e.clientY - press.y);
    const it = press.it; press = null;
    if (moved > 8) return; // it was a drag, not a tap
    if (it.kind === 'plus') dropCurrent();
    if (it.kind === 'check') clearCards();
    if (it.kind === 'shake') shake();
    if (it.kind === 'store') window.open(APP_STORE_URL, '_blank', 'noopener');
  });

  // cards shy away from the mouse a little
  let pointer = null;
  stage.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') pointer = pointAt(e.clientX, e.clientY); });
  stage.addEventListener('pointerleave', () => { pointer = null; });
  Events.on(engine, 'beforeUpdate', () => {
    if (!pointer || mc.body || reduceMotion) return;
    for (const it of items) {
      const dx = it.body.position.x - pointer.x, dy = it.body.position.y - pointer.y, dist = Math.hypot(dx, dy);
      const R = Math.max(it.w, it.h) / 2 + 50;
      if (dist < R && dist > 1) { const f = 0.0006 * it.body.mass * (1 - dist / R); Body.applyForce(it.body, it.body.position, { x: dx / dist * f, y: dy / dist * f - f * 0.6 }); }
    }
  });

  // render at display rate, simulate in fixed 120 Hz steps
  function render() {
    for (const it of items) {
      const { x, y } = it.body.position;
      const rot = it.kind === 'card' || it.kind === 'store' ? ` rotate(${it.body.angle}rad)` : ''; // round buttons keep their icons upright
      it.el.style.transform = `translate3d(${x - it.w / 2}px, ${y - it.h / 2}px, 0)${rot}`;
    }
  }
  const STEP = 1000 / 120; let last = performance.now(), acc = 0;
  (function loop(t) {
    acc += Math.min(50, t - last); last = t;
    while (acc >= STEP) { Engine.update(engine, STEP); acc -= STEP; }
    render(); requestAnimationFrame(loop);
  })(last);

  /* actions */
  let colorIndex = 0;
  function clearCards() {
    const cards = items.filter(i => i.kind === 'card');
    const bottom = cards.sort((a, b) => b.body.position.y - a.body.position.y);
    const count = Math.min(bottom.length, 3);
    for (let i = 0; i < count; i++) setTimeout(() => fadeOut(bottom[i]), i * 120);
  }
  function dropCurrent() {
    const name = nameInput.value.trim() || IDEAS[ideaIndex][0];
    const s = scale();
    const it = addCard({ name, date: selected, color: COLORS[colorIndex++ % COLORS.length], width: 420, angle: (Math.random() - 0.5) * 0.6, x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: -120 * s });
    Body.setVelocity(it.body, { x: (Math.random() - 0.5) * 3, y: 4 });
    // next idea into the form
    ideaIndex = (ideaIndex + 1) % IDEAS.length;
    const [n, m, d] = IDEAS[ideaIndex];
    nameInput.value = n;
    selected = next(m, d);
    showDate();
  }
  function shake() {
    for (const it of items) { Body.setVelocity(it.body, { x: (Math.random() - 0.5) * 12, y: -8 - Math.random() * 10 }); Body.setAngularVelocity(it.body, (Math.random() - 0.5) * 0.2); }
  }
  form.addEventListener('submit', e => { e.preventDefault(); closeCalendar(false); dropCurrent(); });

  // every few seconds something from the bottom jumps and stirs the pile
  let stageVisible = true;
  new IntersectionObserver(es => { stageVisible = es[0].isIntersecting; }).observe(stage);
  function burst() {
    if (reduceMotion || document.hidden || !stageVisible || mc.body || items.length < 4) return;
    const bottom = items.slice().sort((p, q) => q.body.position.y - p.body.position.y).slice(0, 4);
    const it = bottom[Math.floor(Math.random() * bottom.length)], b = it.body;
    Body.setVelocity(b, { x: (W / 2 - b.position.x) / W * 8 + (Math.random() - 0.5) * 3, y: -(14 + Math.random() * 4) * Math.sqrt(scale()) });
    Body.setAngularVelocity(b, (Math.random() - 0.5) * (it.kind === 'card' ? 0.08 : 0.25));
    for (const o of items) {
      if (o === it) continue;
      const dx = o.body.position.x - b.position.x, dy = o.body.position.y - b.position.y, d = Math.hypot(dx, dy), R = 380 * scale();
      if (d < R) { const f = 1 - d / R; Body.setVelocity(o.body, { x: o.body.velocity.x + (dx / (d || 1)) * 4 * f, y: o.body.velocity.y - (5 + Math.random() * 4) * f }); }
    }
  }
  (function schedule() { setTimeout(() => { burst(); schedule(); }, 4500 + Math.random() * 3000); })();

  // a new idea falls into the pile every 5 seconds
  let autoIdea = 1;
  setInterval(() => {
    if (reduceMotion || document.hidden || !stageVisible || !started || mc.body) return;
    // if the settled pile already reaches the form, make room instead of adding
    const floorTop = H - (floor ? floor.clientHeight : 640);
    const settled = items.filter(i => i.kind === 'card' && i.body.speed < 0.6);
    const top = settled.length ? Math.min(...settled.map(i => i.body.bounds.min.y)) : H;
    if (top < floorTop + 24) { const oldest = items.find(i => i.kind === 'card'); if (oldest) fadeOut(oldest); return; }
    const [n, m, d] = IDEAS[autoIdea++ % IDEAS.length];
    const s = scale();
    addCard({ name: n, date: next(m, d), color: COLORS[colorIndex++ % COLORS.length], width: 300 + Math.random() * 220,
      angle: (Math.random() - 0.5) * 0.8, x: W * (0.15 + Math.random() * 0.7), y: -140 * s });
  }, 5000);

  /* phone tilt moves the pile (iOS asks for permission on the first tap) */
  const tiltHint = document.getElementById('tilt-hint');
  let tiltOn = false;
  function onOrientation(e) {
    if (e.gamma == null || e.beta == null) return;
    tiltOn = true;
    const landscape = Math.abs(window.orientation || (screen.orientation && screen.orientation.angle) || 0) === 90;
    const g = (landscape ? e.beta : e.gamma) * DEG, b = (landscape ? -e.gamma : e.beta) * DEG;
    engine.gravity.x = Math.max(-1, Math.min(1, Math.sin(g) * 1.4));
    engine.gravity.y = Math.max(0.25, Math.min(1.1, Math.sin(b) * 1.2));
  }
  let lastShake = 0;
  function onMotion(e) {
    const a = e.accelerationIncludingGravity; if (!a) return;
    const force = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
    if (force > 24 && performance.now() - lastShake > 900) { lastShake = performance.now(); shake(); }
  }
  function enableTilt() {
    window.addEventListener('deviceorientation', onOrientation);
    window.addEventListener('devicemotion', onMotion);
    if (tiltHint) { tiltHint.hidden = false; setTimeout(() => { tiltHint.hidden = true; }, 3500); }
  }
  if (coarse && !reduceMotion && 'DeviceOrientationEvent' in window) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const ask = () => {
        Promise.all([
          DeviceOrientationEvent.requestPermission().catch(() => 'denied'),
          typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function' ? DeviceMotionEvent.requestPermission().catch(() => 'denied') : 'granted'
        ]).then(([o]) => { if (o === 'granted') enableTilt(); });
      };
      document.addEventListener('touchend', ask, { once: true });
    } else {
      enableTilt();
    }
  }

  /* layout */
  new ResizeObserver(() => {
    const oldW = W;
    W = stage.clientWidth; H = stage.clientHeight;
    if (!started) return;
    buildWalls();
    for (const it of items) {
      if (it.body.position.x > W - 10 || oldW !== W) Body.setPosition(it.body, { x: Math.min(W - it.w / 2, it.body.position.x * (W / oldW)), y: Math.min(it.body.position.y, H - it.h / 2) - 40 });
    }
  }).observe(stage);

  start();
})();
