/* ==========================================================
   MY GARDEN FLOWERS — interactions (GSAP)
   ========================================================== */
(() => {
  "use strict";

  gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin, ScrollToPlugin);

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM   = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;

  const WA = 'https://wa.me/962790000000'; // IMPORTANT: replace with the real shop number
  let menuOpen = false, lbOpen = false;

  /* ---------------- preloader + hero intro ---------------- */
  const pre = $('#preloader');

  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero .hl', { yPercent: 0, duration: 1.15, stagger: 0.14 })
      .fromTo('.hero-fig', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.1)
      .fromTo('.hero-fig-clip img', { yPercent: -112 }, { yPercent: 0, duration: 1.25, ease: 'power4.inOut' }, 0.1)
      .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.6)
      .to('.site-head', { autoAlpha: 1, y: 0, duration: 0.8 }, 0.7);
    return tl;
  }

  if (RM) {
    pre.remove();
    document.body.classList.remove('is-loading');
  } else {
    gsap.set('.hero .hl', { yPercent: 112 });
    gsap.set('[data-hero-fade]', { opacity: 0, y: 24 });
    gsap.set('.site-head', { autoAlpha: 0, y: -16 });

    const counter = { v: 0 }, countEl = $('#preCount');
    gsap.timeline({
      onComplete() { pre.style.display = 'none'; document.body.classList.remove('is-loading'); }
    })
      .to('.pre-petal', { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.8)', stagger: 0.07 }, 0.15)
      .to('.pre-core',  { scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, '-=0.3')
      .to('.pre-word-in', { y: '0%', duration: 0.8, ease: 'power3.out' }, '-=0.25')
      .to(counter, { v: 100, duration: 1.5, ease: 'power2.inOut',
        onUpdate: () => countEl.textContent = String(Math.round(counter.v)).padStart(2, '0') }, 0.15)
      .to('.pre-inner', { yPercent: -10, opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=0.25')
      .to(pre, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '-=0.15')
      .add(heroIntro(), '-=0.55');
  }

  /* ---------------- custom cursor ---------------- */
  if (FINE) {
    document.body.classList.add('has-fine');
    const dot = $('.cursor-dot'), ringEl = $('.cursor-ring');
    const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }),  dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
    const rx = gsap.quickTo(ringEl, 'x', { duration: 0.35, ease: 'power3' });
    const ry = gsap.quickTo(ringEl, 'y', { duration: 0.35, ease: 'power3' });
    let seen = false;

    window.addEventListener('mousemove', e => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      if (!seen) { seen = true; gsap.to([dot, ringEl], { opacity: 1, duration: 0.3 }); }
    });
    const setC = c => { ringEl.classList.toggle('is-drag', c === 'is-drag'); ringEl.classList.toggle('is-link', c === 'is-link'); };
    document.addEventListener('mouseover', e => {
      if (e.target.closest('[data-cursor="drag"]')) setC('is-drag');
      else if (e.target.closest('a,button')) setC('is-link');
      else setC('');
    });
    window.addEventListener('mousedown', () => gsap.to(ringEl, { scale: 0.85, duration: 0.2 }));
    window.addEventListener('mouseup',   () => gsap.to(ringEl, { scale: 1, duration: 0.3 }));
  }

  /* ---------------- header + menu ---------------- */
  const head = $('#siteHead');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate(self) {
      head.classList.toggle('is-hidden', self.direction === 1 && self.scroll() > 160 && !menuOpen);
      head.classList.toggle('is-solid', self.scroll() > 60 && !menuOpen);
    }
  });

  const overlay = $('#menuOverlay'), menuBtn = $('#menuBtn');
  const menuTl = gsap.timeline({ paused: true })
    .set(overlay, { pointerEvents: 'auto' })
    .to(overlay, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'power4.inOut' })
    .fromTo('.menu-link', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' }, '-=0.25')
    .fromTo('.menu-foot', { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.3');
  menuTl.eventCallback('onReverseComplete', () => {
    document.body.classList.remove('is-locked');
    ScrollTrigger.refresh();
  });

  function toggleMenu(open) {
    menuOpen = open;
    menuBtn.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    overlay.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('menu-open', open);
    document.body.classList.toggle('is-locked', open);
    head.classList.remove('is-hidden', 'is-solid');
    open ? menuTl.play() : menuTl.reverse();
  }
  menuBtn.addEventListener('click', () => toggleMenu(!menuOpen));

  /* ---------------- smooth anchors ---------------- */
  $$('[data-scroll]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || !id.startsWith('#')) return;
    e.preventDefault();
    if (menuOpen) toggleMenu(false);
    gsap.to(window, {
      scrollTo: { y: id === '#top' ? 0 : id, offsetY: 64 },
      duration: 1.2, ease: 'power3.inOut'
    });
  }));
  $('#toTop').addEventListener('click', () =>
    gsap.to(window, { scrollTo: 0, duration: 1.4, ease: 'power3.inOut' }));

  /* ---------------- petal canvas (interactive wind) ---------------- */
  (function petals() {
    if (RM) return;
    const cv = $('#petalCanvas'), ctx = cv.getContext('2d');
    const COLORS = [[192,91,59],[228,199,180],[143,160,140],[222,205,178]];
    let W, H, list = [], running = false, raf = null;
    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999 };

    function resize() {
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(40, Math.max(16, W / 34)));
      while (list.length < n) list.push(make());
      list.length = n;
    }
    function make() {
      return {
        x: Math.random() * W, y: -20 - Math.random() * H,
        s: 5 + Math.random() * 9,
        a: Math.random() * Math.PI * 2, va: (Math.random() - 0.5) * 0.05,
        vy: 0.35 + Math.random() * 0.8,
        ph: Math.random() * Math.PI * 2, sw: 0.4 + Math.random() * 1.1,
        vx: 0, o: 0.35 + Math.random() * 0.45,
        c: COLORS[(Math.random() * COLORS.length) | 0]
      };
    }
    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.a);
      const s = p.s;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.4, s * 0.7, s * 0.8, 0, s);
      ctx.bezierCurveTo(-s * 0.7, s * 0.8, -s * 0.9, -s * 0.4, 0, -s);
      ctx.closePath();
      ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${p.o})`;
      ctx.fill();
      ctx.restore();
    }
    let t0 = 0;
    function loop(t) {
      if (!running) return;
      t0 = t;
      ctx.clearRect(0, 0, W, H);
      const wind = Math.sin(t * 0.0004) * 0.6;
      const mvx = mouse.x - mouse.px, mvy = mouse.y - mouse.py;
      mouse.px = mouse.x; mouse.py = mouse.y;
      for (const p of list) {
        p.ph += 0.012; p.a += p.va;
        p.x += Math.sin(p.ph) * p.sw + wind;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 130 && d > 0.1) {
          const f = (1 - d / 130) * 2.4;
          p.vx += (dx / d) * f + mvx * 0.02 * (1 - d / 130);
          p.y += (dy / d) * f * 0.4 + mvy * 0.01 * (1 - d / 130);
        }
        p.vx *= 0.92; p.x += p.vx; p.y += p.vy;
        if (p.y > H + 30 || p.x < -40 || p.x > W + 40) Object.assign(p, make());
        drawPetal(p);
      }
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    ScrollTrigger.create({
      trigger: '.hero', start: 'top bottom', end: 'bottom top',
      onToggle(self) {
        if (self.isActive && !running) { running = true; resize(); raf = requestAnimationFrame(loop); }
        else if (!self.isActive && running) { running = false; cancelAnimationFrame(raf); }
      }
    });
  })();

  /* ---------------- hero mouse tilt + scroll fade ---------------- */
  if (FINE && !RM) {
    const fig = $('#heroFig');
    gsap.set(fig, { transformPerspective: 800 });
    const rX = gsap.quickTo(fig, 'rotationX', { duration: 0.6, ease: 'power2' });
    const rY = gsap.quickTo(fig, 'rotationY', { duration: 0.6, ease: 'power2' });
    $('#hero').addEventListener('mousemove', e => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      rY(nx * 10); rX(-ny * 8);
    });
    $('#hero').addEventListener('mouseleave', () => { rY(0); rX(0); });

    gsap.to('#heroInner', {
      y: -70, opacity: 0.3, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------------- section heads: bloom + rule ---------------- */
  if (!RM) $$('.sec-head').forEach(h => {
    const b = h.querySelector('.sec-bloom'), r = h.querySelector('.sec-rule');
    const st = { trigger: h, start: 'top 86%' };
    if (b) gsap.from(b, { rotate: -120, scale: 0, duration: 0.9, ease: 'back.out(2)', scrollTrigger: st });
    if (r) gsap.from(r, { scaleX: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { ...st }, delay: 0.1 });
  });

  /* ---------------- generic reveals + split headings + parallax ---------------- */
  if (!RM) {
    $$('[data-reveal]').forEach(el => gsap.from(el, {
      y: 44, autoAlpha: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    }));
    if (window.SplitText) $$('[data-split]').forEach(el => {
      const st = new SplitText(el, { type: 'lines', mask: 'lines' });
      gsap.from(st.lines, {
        yPercent: 115, duration: 1, ease: 'power4.out', stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });
    $$('[data-plx]').forEach(img => {
      gsap.set(img, { scale: 1.18 });
      gsap.fromTo(img, { yPercent: -9 }, {
        yPercent: 9, ease: 'none',
        scrollTrigger: { trigger: img.closest('figure') || img, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------------- marquee (seamless loop) ---------------- */
  const mq = $('#marqueeTrack');
  mq.innerHTML += mq.innerHTML;

  /* ---------------- 3D ring gallery ---------------- */
  (function ring() {
    const stage = $('#ringStage'), ringEl = $('#ring'), panels = $$('.ring-panel');
    const idxEl = $('#ringIdx');
    const N = panels.length, STEP = 360 / N, FACTOR = 0.22, STEP_PX = STEP / FACTOR;
    let rot = 0, inView = true;

    function layout() {
      const R = Math.round((panels[0].offsetWidth / 2) / Math.tan(Math.PI / N)) + 42;
      panels.forEach((p, i) => p.style.transform = `rotateY(${i * STEP}deg) translateZ(${R}px)`);
    }
    function apply() {
      ringEl.style.transform = `rotateY(${rot}deg)`;
      const idx = ((Math.round(-rot / STEP) % N) + N) % N;
      idxEl.textContent = String(idx + 1).padStart(2, '0');
      panels.forEach((p, i) => {
        const a = ((i * STEP + rot) % 360 + 360) % 360;
        const f = (Math.cos(a * Math.PI / 180) + 1) / 2; // 1 front · 0 back
        p.style.opacity = (0.16 + 0.84 * f * f).toFixed(3);
        p.style.filter = `brightness(${(0.5 + 0.5 * f).toFixed(3)})`;
      });
    }
    layout(); apply();

    const proxy = document.createElement('div');
    proxy.style.cssText = 'position:fixed;top:-100px;left:0;width:10px;height:10px;';
    document.body.appendChild(proxy);
    gsap.set(proxy, { x: 0 });

    let moved = false;
    const drag = Draggable.create(proxy, {
      type: 'x', trigger: stage, inertia: true,
      edgeResistance: 0.78, minimumMovement: 3,
      snap: { x: v => Math.round(v / STEP_PX) * STEP_PX },
      onPress()      { this.pressed = true; moved = false; },
      onRelease()    { this.pressed = false; },
      onDrag()       { if (Math.abs(this.deltaX) > 2) moved = true; rot = this.x * FACTOR; apply(); },
      onThrowUpdate(){ rot = this.x * FACTOR; apply(); }
    })[0];

    stage.addEventListener('pointerdown', () => moved = false);
    panels.forEach((p, i) => p.addEventListener('click', () => { if (!moved) openLB(i); }));

    gsap.ticker.add(() => {
      if (RM || !inView || menuOpen || lbOpen) return;
      if (drag.pressed || drag.isDragging || drag.isThrowing) return;
      rot += 0.05; apply();
      gsap.set(proxy, { x: rot / FACTOR });
    });
    ScrollTrigger.create({
      trigger: stage, start: 'top bottom', end: 'bottom top',
      onToggle: s => inView = s.isActive
    });
    let rT; window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { layout(); apply(); }, 150); });
  })();

  /* ---------------- reels: pinned horizontal scroll + autoplay ---------------- */
  (function reels() {
    const track = $('#reelsTrack'), bar = $('#reelsBar'), vp = $('.reels-viewport');
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      if (RM) return;
      const dist = () => track.scrollWidth - innerWidth + innerWidth * 0.06;
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.reels', start: 'top top', pin: true, scrub: 1,
          end: () => '+=' + (dist() + 300), invalidateOnRefresh: true,
          onUpdate: s => bar.style.transform = `scaleX(${s.progress})`
        }
      });
    });
    vp.addEventListener('scroll', () => {
      const m = vp.scrollWidth - vp.clientWidth;
      if (m > 0) bar.style.transform = `scaleX(${vp.scrollLeft / m})`;
    }, { passive: true });

    const io = new IntersectionObserver(es => es.forEach(en => {
      en.isIntersecting ? en.target.play().catch(() => {}) : en.target.pause();
    }), { threshold: 0.25 });
    $$('.reel-card video').forEach(v => io.observe(v));
  })();

  /* ---------------- services floating preview ---------------- */
  (function services() {
    if (!FINE || RM) return;
    const prev = $('#servPreview'), img = prev.querySelector('img'), no = $('#servPreviewNo');
    const list = $('#servList');
    gsap.set(prev, { xPercent: -50, yPercent: -58, scale: 0.9, rotation: 0 });
    const xTo = gsap.quickTo(prev, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(prev, 'y', { duration: 0.45, ease: 'power3' });
    const rTo = gsap.quickTo(prev, 'rotation', { duration: 0.6, ease: 'power2' });
    let lastX = 0, active = false;

    $$('.serv-row').forEach(r => new Image().src = r.dataset.img); // preload

    list.addEventListener('mousemove', e => {
      xTo(e.clientX); yTo(e.clientY);
      rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    });
    $$('.serv-row').forEach(row => row.addEventListener('mouseenter', () => {
      img.src = row.dataset.img;
      no.textContent = row.querySelector('.serv-no').textContent;
      if (!active) { active = true; gsap.to(prev, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }); }
      else gsap.fromTo(img, { opacity: 0.4, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.4 });
    }));
    list.addEventListener('mouseleave', () => {
      active = false;
      gsap.to(prev, { opacity: 0, scale: 0.9, rotation: 0, duration: 0.35 });
    });
  })();

  /* ---------------- lightbox ---------------- */
  const CAPS = ['FRESH BOUQUET','STUDIO ARRANGEMENT','INDOOR GREENS','SEASONAL BLOOMS','BRIDAL FLOWERS',
                'TERRACOTTA TONES','GARDEN ROSES','WHITE PETALS','POTTED PLANTS','EVENT FLORALS','SIGNATURE VASE'];
  const N_IMG = 11;
  const src = i => `../Images/${i + 1}.png`;
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbCount = $('#lbCount');
  let lbIdx = 0;

  function lbSet() {
    lbImg.src = src(lbIdx);
    lbCap.textContent = `MY GARDEN — ${String(lbIdx + 1).padStart(2, '0')} · ${CAPS[lbIdx]}`;
    lbCount.textContent = `${String(lbIdx + 1).padStart(2, '0')} / ${N_IMG}`;
  }
  function openLB(i) {
    lbIdx = i; lbSet(); lbOpen = true;
    document.body.classList.add('is-locked');
    lb.setAttribute('aria-hidden', 'false');
    gsap.to(lb, { autoAlpha: 1, duration: 0.35 });
    gsap.fromTo(lbImg, { scale: 0.92, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'power3.out' });
  }
  function closeLB() {
    lbOpen = false;
    document.body.classList.remove('is-locked');
    lb.setAttribute('aria-hidden', 'true');
    gsap.to(lb, { autoAlpha: 0, duration: 0.3 });
  }
  function lbGo(dir) {
    lbIdx = (lbIdx + dir + N_IMG) % N_IMG;
    gsap.to(lbImg, {
      x: dir * -30, autoAlpha: 0, duration: 0.18, ease: 'power2.in',
      onComplete() {
        lbSet();
        gsap.fromTo(lbImg, { x: dir * 30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
      }
    });
  }
  $('#lbClose').addEventListener('click', closeLB);
  $('#lbPrev').addEventListener('click', () => lbGo(-1));
  $('#lbNext').addEventListener('click', () => lbGo(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', e => {
    if (!lbOpen) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') lbGo(-1);
    if (e.key === 'ArrowRight') lbGo(1);
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();