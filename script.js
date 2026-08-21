/* ================================================
   HUSNI MUJEEB — PORTFOLIO
   Cinematic Animation & Interactive Engine
   ────────────────────────────────────────
   Stack:
   • GSAP 3 + ScrollTrigger (cinematic scroll animations)
   • Lenis (smooth inertial scrolling)
   • Three.js (interactive particle field)
   • Vanilla JS (custom cursor, 3D tilt, magnetic hover, feedback marquee & persistence)
================================================ */

'use strict';

/* ─── GSAP REGISTER ─────────────────────────── */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── LENIS SMOOTH SCROLL ─────────────────── */
let lenis = null;
if (typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 0.8,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
  });
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
  }
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ─── UTILITY HELPERS ────────────────────────── */
const q  = s => document.querySelector(s);
const qa = s => document.querySelectorAll(s);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* Split text into <span class="char"> elements */
function splitChars(el) {
  if (!el) return [];
  const txt = el.textContent;
  el.innerHTML = '';
  return txt.split('').map(ch => {
    const s = document.createElement('span');
    s.classList.add('char');
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(s);
    return s;
  });
}

/* ─── SCROLL PROGRESS BAR ───────────────────── */
if (lenis) {
  lenis.on('scroll', ({ progress }) => {
    const bar = q('#scroll-progress');
    if (bar) bar.style.width = (progress * 100) + '%';
  });
} else {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const bar = q('#scroll-progress');
    if (bar) bar.style.width = progress + '%';
  });
}

/* ================================================
   CINEMATIC 3-STAGE HERO — TREE WIND SWAY & FIREFLIES
================================================ */

/* ── 1. Realistic Pine Tree Wind Sway Canvas ──────── */
function initTreesWind() {
  const canvas = q('#trees-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.src = 'assets/hero-trees.png';

  let width = 0, height = 0;
  function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let isLoaded = false;
  img.onload = () => { isLoaded = true; };

  let time = 0;
  const sliceCount = 80;

  function renderWind() {
    requestAnimationFrame(renderWind);
    if (!isLoaded || !width || !height) return;

    ctx.clearRect(0, 0, width, height);
    time += 0.016;

    // Draw tree canopy in vertical slices with organic horizontal sway
    const sliceWidth = width / sliceCount;
    const imgSliceWidth = img.naturalWidth / sliceCount;

    for (let i = 0; i < sliceCount; i++) {
      const xNorm = i / sliceCount;
      // Multi-harmonic gentle breeze function
      const windA = Math.sin(time * 1.1 + xNorm * 4.5) * 5;
      const windB = Math.sin(time * 2.3 + xNorm * 8.0) * 2;
      const totalSway = windA + windB;

      const sx = i * imgSliceWidth;
      const sy = 0;
      const sWidth = imgSliceWidth;
      const sHeight = img.naturalHeight;

      const dx = i * sliceWidth + totalSway;
      const dy = 0;
      const dWidth = sliceWidth + 0.5; // avoid seams
      const dHeight = height;

      ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }
  }
  renderWind();
}

/* ── 2. 3D Warm Orange Fireflies Particle Field ─────── */
function initFireflies() {
  const canvas = q('#fireflies-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0, height = 0;
  function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const count = 26;
  const fireflies = [];

  for (let i = 0; i < count; i++) {
    fireflies.push({
      x: Math.random() * (window.innerWidth || 1200),
      y: Math.random() * (window.innerHeight || 800),
      z: 0.4 + Math.random() * 1.2, // depth factor
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.35,
      radius: 1.2 + Math.random() * 2.0,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 1.2 + Math.random() * 1.8,
      baseAlpha: 0.45 + Math.random() * 0.45,
      wanderTimer: Math.random() * 100,
    });
  }

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.03;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.03;
  });

  let lastTime = performance.now();

  function animateFireflies(now) {
    requestAnimationFrame(animateFireflies);
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    fireflies.forEach(f => {
      // Natural organic Brownian motion
      f.wanderTimer += dt;
      f.vx += Math.sin(f.wanderTimer * 1.5 + f.phase) * 0.04;
      f.vy += Math.cos(f.wanderTimer * 1.2 + f.phase) * 0.03;

      // Friction
      f.vx *= 0.98;
      f.vy *= 0.98;

      f.x += f.vx * f.z;
      f.y += f.vy * f.z;

      // Wrap around bounds with soft margin
      if (f.x < -40) f.x = width + 40;
      if (f.x > width + 40) f.x = -40;
      if (f.y < -40) f.y = height + 40;
      if (f.y > height + 40) f.y = -40;

      // Bioluminescent pulsing glow (warm orange #E8431A)
      const pulse = Math.pow(Math.sin(now * 0.001 * f.pulseSpeed + f.phase), 2);
      const alpha = f.baseAlpha * (0.35 + 0.65 * pulse);

      const renderX = f.x + mouseX * f.z;
      const renderY = f.y + mouseY * f.z;
      const r = f.radius * f.z;

      // Soft outer orange glow
      const grad = ctx.createRadialGradient(renderX, renderY, 0, renderX, renderY, r * 5.5);
      grad.addColorStop(0, `rgba(255, 140, 60, ${alpha})`);
      grad.addColorStop(0.3, `rgba(232, 67, 26, ${alpha * 0.7})`);
      grad.addColorStop(1, 'rgba(232, 67, 26, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(renderX, renderY, r * 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Sharp warm core
      ctx.fillStyle = `rgba(255, 220, 180, ${alpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(renderX, renderY, r * 0.9, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  requestAnimationFrame(animateFireflies);
}

/* ================================================
   CUSTOM CURSOR
================================================ */
(function initCursor() {
  const dot  = q('#c-dot');
  const ring = q('#c-ring');
  if (!dot || !ring || window.matchMedia('(hover: none)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.to(dot, { x: mx, y: my, duration: 0.08, ease: 'none' });
  });

  /* Ring lerp loop */
  (function lerpRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    gsap.set(ring, { x: rx, y: ry });
    requestAnimationFrame(lerpRing);
  })();

  /* Hover states */
  qa('a, button, .toc-item, .work-card, .photo-item, .social-card, .fb-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('c-hover');
      if (el.tagName === 'A') document.body.classList.add('c-link');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('c-hover', 'c-link');
    });
  });

  /* Hide when out of window */
  document.addEventListener('mouseleave', () => gsap.to([dot, ring], { opacity: 0 }));
  document.addEventListener('mouseenter', () => gsap.to([dot, ring], { opacity: 1 }));
})();

/* ================================================
   CINEMATIC 3-STAGE HERO SCROLLING ENGINE
================================================ */
let heroEntranceTL = null;

function initCinematicHero() {
  initTreesWind();
  initFireflies();

  const scrollTrack    = q('#hero-scroll-track');
  const stage          = q('#cinematic-stage');
  const sky            = q('#layer-sky');
  const portfolioWord  = q('#portfolio-word');
  const trees          = q('#layer-trees');
  const charWrapper    = q('#character-wrapper');
  const stage3Content  = q('#layer-stage3-content');
  const scrollHint     = q('#scroll-hint');
  const nav            = q('#nav');

  const heroTag        = q('#hero-tag');
  const heroTitle      = q('#hero-title');
  const heroBio        = q('#hero-bio');
  const heroActions    = q('#hero-actions');
  const heroSkills     = q('#hero-skills');
  const heroStats      = q('#hero-stats');
  const heroDna        = q('#hero-dna');

  // Initial State Setup (Stage 1)
  if (portfolioWord) gsap.set(portfolioWord, { opacity: 0, y: 30, scale: 0.98 });
  if (charWrapper)   gsap.set(charWrapper, { opacity: 0, y: 40, scale: 0.95 });
  if (scrollHint)    gsap.set(scrollHint, { opacity: 0 });
  if (nav)           gsap.set(nav, { opacity: 0 });

  if (stage3Content) gsap.set(stage3Content, { opacity: 0, pointerEvents: 'none' });
  const leftElements  = [heroTag, heroTitle, heroBio, heroActions, heroSkills].filter(Boolean);
  const rightElements = [heroStats, heroDna].filter(Boolean);
  if (leftElements.length)  gsap.set(leftElements, { opacity: 0, x: -40 });
  if (rightElements.length) gsap.set(rightElements, { opacity: 0, x: 40 });

  // Stage 1 Entrance Timeline (plays when preloader lifts)
  heroEntranceTL = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

  heroEntranceTL
    .to(portfolioWord, { opacity: 0.88, y: 0, scale: 1, duration: 1.1 }, 0.1)
    .to(charWrapper,   { opacity: 1, y: 0, scale: 1, duration: 1.2 }, 0.2)
    .to([nav, scrollHint], { opacity: 1, duration: 0.8 }, 0.6);

  // Multi-Stage ScrollTrigger Parallax
  if (typeof ScrollTrigger !== 'undefined' && scrollTrack && stage) {
    const isMobile = window.innerWidth <= 900;
    const targetScale = isMobile ? 0.52 : 0.58;
    const targetY     = isMobile ? 18 : 12;

    const scrollTL = gsap.timeline({
      scrollTrigger: {
        trigger: scrollTrack,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        pin: stage,
        anticipatePin: 1,
      }
    });

    // ── STAGE 1 -> STAGE 2 (0% to 50% scroll) ──
    scrollTL
      // "PORTFOLIO" stays fully visible at first, then moves down and fades (starts at 15% scroll)
      .fromTo(portfolioWord, {
        yPercent: 0,
        opacity: 0.88,
        scale: 1,
      }, {
        yPercent: 50,
        opacity: 0,
        scale: 0.9,
        ease: 'power1.inOut',
      }, 0.15)
      // Character scales down smoothly
      .to(charWrapper, {
        scale: 0.76,
        yPercent: 6,
        ease: 'power1.inOut',
      }, 0)
      // Sky deep parallax
      .to(sky, {
        yPercent: -10,
        scale: 1.03,
        ease: 'none',
      }, 0)
      // Trees midground shift
      .to(trees, {
        yPercent: 6,
        ease: 'none',
      }, 0)
      // Scroll hint fades out immediately
      .to(scrollHint, {
        opacity: 0,
        duration: 0.2,
      }, 0)

      // ── STAGE 2 -> STAGE 3 (50% to 90% scroll) ──
      .to(charWrapper, {
        scale: targetScale,
        yPercent: targetY,
        ease: 'power2.out',
      }, 0.5)
      .to(stage3Content, {
        opacity: 1,
        pointerEvents: 'auto',
        ease: 'power2.out',
      }, 0.5)
      .to(leftElements, {
        opacity: 1,
        x: 0,
        stagger: 0.04,
        ease: 'power2.out',
      }, 0.55)
      .to(rightElements, {
        opacity: 1,
        x: 0,
        stagger: 0.06,
        ease: 'power2.out',
      }, 0.55)

      // Hold Stage 3 in focus before passing to works
      .to({}, { duration: 0.1 }, 0.9);

  }

  // Interactive mouse subtle 3D tilt
  if (!window.matchMedia('(hover: none)').matches && stage) {
    stage.addEventListener('mousemove', e => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      if (charWrapper) {
        gsap.to(charWrapper, {
          rotateY: dx * 3.5,
          rotateX: dy * -3.0,
          transformPerspective: 1000,
          duration: 0.8,
          ease: 'power2.out',
        });
      }
      if (portfolioWord) {
        gsap.to(portfolioWord, {
          x: dx * -15,
          y: dy * -8,
          duration: 1.0,
          ease: 'power2.out',
        });
      }
      if (sky) {
        gsap.to(sky, {
          x: dx * -8,
          y: dy * -5,
          duration: 1.2,
          ease: 'power2.out',
        });
      }
    });

    stage.addEventListener('mouseleave', () => {
      if (charWrapper) gsap.to(charWrapper, { rotateX: 0, rotateY: 0, duration: 1.0, ease: 'elastic.out(1, 0.4)' });
      if (portfolioWord) gsap.to(portfolioWord, { x: 0, y: 0, duration: 1.0, ease: 'power2.out' });
      if (sky) gsap.to(sky, { x: 0, y: 0, duration: 1.0, ease: 'power2.out' });
    });
  }
}

function startHeroReveal() {
  if (heroEntranceTL) {
    heroEntranceTL.play();
  } else {
    gsap.set(['#nav', '#portfolio-word', '#character-wrapper', '#scroll-hint'], {
      opacity: 1, y: 0, scale: 1
    });
  }
  initNav();
}

// Prepare Hero upfront immediately
initCinematicHero();

/* Preloader Execution */
(function preloader() {
  const fill      = q('#pre-fill');
  const numEl     = q('#pre-num');
  const loader    = q('#preloader');
  const firstName = q('.pre-first');
  const lastName  = q('.pre-last');

  if (!loader) {
    startHeroReveal();
    return;
  }

  // Initial state for preloader text
  if (firstName && lastName) gsap.set([firstName, lastName], { opacity: 0, y: 40 });
  const role = q('.pre-role');
  if (role) gsap.set(role, { opacity: 0 });

  // Stagger name reveal in preloader
  if (firstName && lastName) {
    gsap.to([firstName, lastName], {
      opacity: 1, y: 0,
      duration: 0.45,
      stagger: 0.035,
      ease: 'power3.out',
      delay: 0.2,
    });
  }
  if (role) gsap.to(role, { opacity: 1, duration: 0.35, delay: 0.7 });

  // Counter
  let count = 0;
  const tick = setInterval(() => {
    const step = Math.random() * 4 + 1.5;
    count = Math.min(count + step, 100);
    const rounded = Math.floor(count);
    if (numEl) numEl.textContent = rounded;
    if (fill) fill.style.width  = rounded + '%';
    if (count >= 100) {
      clearInterval(tick);
      setTimeout(exitPreloader, 200);
    }
  }, 22);

  function exitPreloader() {
    const tl = gsap.timeline();
    const preElems = [firstName, lastName, q('.pre-role'), q('.pre-bar-row')].filter(Boolean);
    tl.to(preElems, {
      y: -40, opacity: 0, stagger: 0.03, duration: 0.28, ease: 'power3.in',
    })
    .to(loader, {
      yPercent: -102, duration: 0.85, ease: 'power4.inOut',
      onStart: () => {
        // Smoothly trigger cinematic hero entrance as curtain lifts
        startHeroReveal();
      },
      onComplete: () => {
        loader.style.display = 'none';
      }
    }, '+=0.02');
  }

  // Safety timer: Never leave user stranded if anything gets blocked
  setTimeout(() => {
    if (loader && loader.style.display !== 'none') {
      loader.style.display = 'none';
      startHeroReveal();
    }
  }, 4000);
})();

/* ================================================
   NAV — active state tracker & mobile menu
================================================ */
function initNav() {
  const nav            = q('#nav');
  const sections       = qa('section[id]');
  const navLinks       = qa('.nav-link');
  const toggle         = q('#nav-toggle');
  const linksContainer = q('.nav-links');

  if (!nav) return;

  /* Scrolled class */
  if (lenis) {
    lenis.on('scroll', ({ scroll }) => {
      nav.classList.toggle('nav-scrolled', scroll > 60);
    });
  } else {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav-scrolled', window.scrollY > 60);
    });
  }

  /* IntersectionObserver for active link */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = q(`[data-nav="${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));

  /* Mobile menu toggle */
  if (toggle && linksContainer) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('active');
      linksContainer.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);

      if (isOpen) {
        gsap.fromTo(navLinks,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power2.out', delay: 0.1 }
        );
      }
    });

    /* Auto-close on link click */
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        linksContainer.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    /* Close on clicking outside the container */
    document.addEventListener('click', e => {
      if (toggle.classList.contains('active') && !nav.contains(e.target)) {
        toggle.classList.remove('active');
        linksContainer.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* ================================================
   TABLE OF CONTENTS — animations
================================================ */
if (q('#toc') && typeof ScrollTrigger !== 'undefined') {
  ScrollTrigger.create({
    trigger: '#toc',
    start: 'top 70%',
    onEnter: () => {
      const box = q('#toc-box');
      if (box) {
        const handles = box.querySelectorAll('.h');
        gsap.from(handles, {
          scale: 0, opacity: 0, stagger: 0.03,
          duration: 0.4, ease: 'back.out(2)',
        });
      }

      const titleEl = q('#toc-title');
      if (titleEl) {
        let chars = titleEl.querySelectorAll('.char');
        if (!chars.length) {
          splitChars(titleEl);
          chars = titleEl.querySelectorAll('.char');
        }
        gsap.fromTo(chars,
          { opacity: 0, y: 50, rotateX: -70, transformOrigin: '50% 100%' },
          { opacity: 1, y: 0, rotateX: 0, color: '#ffffff', stagger: 0.025, duration: 0.45, ease: 'power4.out' }
        );
      }

      gsap.from(qa('.toc-item'), {
        opacity: 0, y: 60, rotateY: -30,
        transformOrigin: 'left center',
        stagger: 0.03,
        duration: 0.45,
        ease: 'power4.out',
        delay: 0.3,
      });
    },
    once: true,
  });
}

/* ================================================
   SECTION INTRO BLOCKS — cinematic reveal
================================================ */
qa('.sec-intro').forEach(intro => {
  const box     = intro.querySelector('.handles-box');
  if (!box) return;

  const handles = box.querySelectorAll('.h');
  const border  = box.querySelector('.hb-border');
  const titleEl = box.querySelector('.big-title');
  const cursor  = intro.querySelector('.sec-cursor');
  const desc    = intro.querySelector('.sec-desc');
  const stags   = intro.querySelectorAll('.stag');

  if (border) gsap.set(border, { scaleX: 0, scaleY: 0, transformOrigin: 'top left' });
  if (handles.length) gsap.set(handles, { scale: 0, opacity: 0 });
  if (cursor) gsap.set(cursor, { opacity: 0, x: -10 });

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: intro,
      start: 'top 72%',
      onEnter: () => {
        let chars = titleEl ? titleEl.querySelectorAll('.char') : [];
        if (titleEl && !chars.length) {
          splitChars(titleEl);
          chars = titleEl.querySelectorAll('.char');
        }
        if (chars.length) gsap.set(chars, { opacity: 0, y: 100, rotateX: -90, transformOrigin: '50% 100%' });

        const tl = gsap.timeline();

        if (border) tl.to(border, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'power3.inOut' });
        if (handles.length) {
          tl.to(handles, {
            scale: 1, opacity: 1,
            stagger: 0.025,
            duration: 0.35,
            ease: 'back.out(2.5)',
          }, '-=0.3');
        }
        if (chars.length) {
          tl.to(chars, {
            opacity: 1, y: 0, rotateX: 0,
            color: '#ffffff',
            stagger: 0.03,
            duration: 0.42,
            ease: 'power4.out',
          }, '-=0.1');
        }
        if (cursor) tl.to(cursor, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3');
        if (desc) {
          tl.from(desc, {
            opacity: 0, y: 30,
            duration: 0.4,
            ease: 'power2.out',
          }, '-=0.2');
        }
        if (stags.length) {
          tl.from(stags, {
            opacity: 0, y: 16, scale: 0.9,
            stagger: 0.035,
            duration: 0.4,
            ease: 'power2.out',
          }, '-=0.4');
        }
      },
      once: true,
    });
  }
});

/* ================================================
   DYNAMIC INTERACTIVE CURSOR ANIMATION ON HEADINGS
   (MY WORKS, BRANDING, SOCIAL MEDIA, PRINTING, PHOTOGRAPHY, CLIENT FEEDBACK)
================================================ */
function initHeadingHoverEffects() {
  const handleBoxes = qa('.handles-box');

  handleBoxes.forEach(box => {
    const titleEl = box.querySelector('.big-title');
    if (!titleEl) return;

    // Pre-split characters if not split yet
    if (!titleEl.querySelectorAll('.char').length) {
      splitChars(titleEl);
    }
    const chars   = titleEl.querySelectorAll('.char');
    const handles = box.querySelectorAll('.h');
    const border  = box.querySelector('.hb-border');

    // Desktop Mouse Kinetic Interaction
    box.addEventListener('mousemove', e => {
      const boxRect = box.getBoundingClientRect();
      const mouseX  = e.clientX;
      const mouseY  = e.clientY;

      chars.forEach(char => {
        const charRect = char.getBoundingClientRect();
        const charCenterX = charRect.left + charRect.width / 2;
        const charCenterY = charRect.top + charRect.height / 2;

        const dx = mouseX - charCenterX;
        const dy = mouseY - charCenterY;
        const dist = Math.hypot(dx, dy);
        const radius = 135; // area of kinetic influence

        if (dist < radius) {
          const power = 1 - (dist / radius); // 0 to 1
          const liftY = -14 * power;
          const scale = 1 + 0.18 * power;
          const tilt  = (dx / radius) * 12 * power;

          gsap.to(char, {
            y: liftY,
            scale: scale,
            rotate: tilt,
            color: '#E8431A',
            textShadow: `0 0 ${18 * power}px rgba(232, 67, 26, 0.9), 0 0 ${36 * power}px rgba(232, 67, 26, 0.5)`,
            duration: 0.18,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        } else {
          gsap.to(char, {
            y: 0,
            scale: 1,
            rotate: 0,
            color: '#ffffff',
            textShadow: 'none',
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      });

      // Subtle 3D tilt on the entire box container
      const cx = boxRect.left + boxRect.width / 2;
      const cy = boxRect.top + boxRect.height / 2;
      const tiltX = ((mouseY - cy) / (boxRect.height / 2)) * -4;
      const tiltY = ((mouseX - cx) / (boxRect.width / 2)) * 4;

      gsap.to(box, {
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 800,
        duration: 0.3,
        ease: 'power2.out',
      });

      if (handles.length) {
        gsap.to(handles, {
          scale: 1.35,
          duration: 0.25,
          ease: 'power2.out',
        });
      }
    });

    // Reset when cursor leaves the heading box
    box.addEventListener('mouseleave', () => {
      chars.forEach(char => {
        gsap.to(char, {
          y: 0,
          scale: 1,
          rotate: 0,
          color: '#ffffff',
          textShadow: 'none',
          duration: 0.5,
          ease: 'elastic.out(1, 0.35)',
          overwrite: 'auto',
        });
      });

      gsap.to(box, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)',
      });

      if (handles.length) {
        gsap.to(handles, {
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    });

    // Touch Ripple wave for mobile devices
    box.addEventListener('touchstart', () => {
      chars.forEach((char, idx) => {
        gsap.to(char, {
          y: -12,
          scale: 1.15,
          color: '#E8431A',
          textShadow: '0 0 18px rgba(232, 67, 26, 0.9)',
          duration: 0.22,
          delay: idx * 0.035,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
      });
    }, { passive: true });
  });
}

// Initialize Interactive Heading Hover Effects
initHeadingHoverEffects();


/* ================================================
   WORK CARD GRID — stagger reveal
================================================ */
qa('.work-grid').forEach(grid => {
  const cards = grid.querySelectorAll('.work-card');
  if (cards.length && typeof ScrollTrigger !== 'undefined') {
    gsap.from(cards, {
      scrollTrigger: { trigger: grid, start: 'top 80%', once: true },
      opacity: 0,
      y: 70,
      scale: 0.94,
      rotateX: 18,
      transformPerspective: 900,
      transformOrigin: '50% bottom',
      stagger: 0.0255,
      duration: 0.45,
      ease: 'power3.out',
    });
  }
});

/* ================================================
   WORK CARD 3D TILT (on mousemove)
================================================ */
qa('.tilt-card').forEach(card => {
  if (window.matchMedia('(hover: none)').matches) return;

  const shine = card.querySelector('.card-shine');
  let animFrame;

  card.addEventListener('mousemove', e => {
    cancelAnimationFrame(animFrame);
    animFrame = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      const cx   = rect.width  / 2;
      const cy   = rect.height / 2;
      const rx   = clamp(((y - cy) / cy) * -16, -16, 16);
      const ry   = clamp(((x - cx) / cx) *  16, -16, 16);

      gsap.to(card, {
        rotateX: rx, rotateY: ry,
        scale: 1.035,
        transformPerspective: 900,
        duration: 0.25,
        ease: 'power2.out',
      });

      if (shine) {
        const px = (x / rect.width  * 100).toFixed(1) + '%';
        const py = (y / rect.height * 100).toFixed(1) + '%';
        shine.style.setProperty('--mx', px);
        shine.style.setProperty('--my', py);
      }
    });
  });

  card.addEventListener('mouseleave', () => {
    cancelAnimationFrame(animFrame);
    gsap.to(card, {
      rotateX: 0, rotateY: 0, scale: 1,
      duration: 0.45,
      ease: 'elastic.out(1, 0.4)',
    });
  });
});

/* ================================================
   PHOTOGRAPHY GRID — reveal
================================================ */
const photoItems = qa('.photo-item');
if (photoItems.length && typeof ScrollTrigger !== 'undefined') {
  gsap.from(photoItems, {
    scrollTrigger: { trigger: '.photo-grid', start: 'top 80%', once: true },
    opacity: 0,
    y: 50,
    scale: 0.95,
    stagger: 0.03,
    duration: 0.4,
    ease: 'power3.out',
  });
}

/* ================================================
   MAGNETIC BUTTONS
================================================ */
qa('.magnetic-btn').forEach(btn => {
  if (window.matchMedia('(hover: none)').matches) return;

  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width  / 2) * 0.35;
    const y = (e.clientY - rect.top  - rect.height / 2) * 0.35;
    gsap.to(btn, { x, y, duration: 0.25, ease: 'power2.out' });
  });

  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  });
});

/* ================================================
   FEEDBACK MARQUEE & PERSISTENCE SYSTEM
================================================ */
const defaultFeedbacks = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    project: 'Luxury Brand Identity',
    rating: 5,
    message: 'Husni completely transformed our visual brand. The precision, cinematic typography, and creative direction exceeded every expectation. Truly world-class work!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    attachedImg: ''
  },
  {
    id: 2,
    name: 'Michael Chang',
    project: 'SaaS Mobile App UI/UX',
    rating: 5,
    message: 'Working with Husni on our product redesign was an absolute pleasure. Intuitive UX layouts, state-of-the-art aesthetic, and prompt delivery on every milestone.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    attachedImg: ''
  },
  {
    id: 3,
    name: 'Elena Rostova',
    project: 'Fashion Lookbook Photography',
    rating: 5,
    message: 'Incredible photographic eye and lighting direction! Captured our entire seasonal collection with cinematic mood and breathtaking editorial quality.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    attachedImg: ''
  },
  {
    id: 4,
    name: 'David Silva',
    project: 'AI Generative Campaign',
    rating: 5,
    message: 'The AI content generation and custom prompt engineering Husni delivered gave our marketing campaign massive organic engagement. Highly recommended!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    attachedImg: ''
  },
  {
    id: 5,
    name: 'Amina Al-Mansoor',
    project: 'Corporate Rebrand & Packaging',
    rating: 5,
    message: 'Husni’s creative vision and meticulous attention to detail gave our enterprise packaging a timeless luxury feel. Outstanding artist & director!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    attachedImg: ''
  }
];

function getStoredFeedbacks() {
  try {
    const saved = localStorage.getItem('husni_feedbacks');
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return [...defaultFeedbacks];
}

function saveFeedbacks(list) {
  try {
    localStorage.setItem('husni_feedbacks', JSON.stringify(list));
  } catch(e) {}
}

function renderMarqueeTrack() {
  const track = q('#marquee-track');
  if (!track) return;

  const feedbacks = getStoredFeedbacks();
  let displayList = [...feedbacks];
  while (displayList.length < 8) {
    displayList = displayList.concat(feedbacks);
  }

  track.innerHTML = displayList.map((fb, idx) => {
    const stars = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
    const avatarSrc = fb.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
    return `
      <div class="fb-card panel" data-index="${idx % feedbacks.length}">
        <div class="panel-glow"></div>
        <div class="fb-header">
          <img src="${avatarSrc}" alt="${fb.name}" class="fb-avatar" loading="lazy" />
          <div class="fb-meta">
            <h4 class="fb-name">${fb.name}</h4>
            <span class="fb-project">${fb.project}</span>
          </div>
        </div>
        <div class="fb-stars">${stars}</div>
        <p class="fb-text">"${fb.message}"</p>
        <span class="fb-click-hint">Click for details ↗</span>
      </div>
    `;
  }).join('');

  qa('.fb-card', track).forEach(card => {
    card.addEventListener('click', () => {
      const idx = card.getAttribute('data-index');
      const item = feedbacks[idx];
      if (item) openFeedbackModal(item);
    });
  });
}

function openFeedbackModal(fb) {
  const modal = q('#feedback-modal');
  if (!modal) return;

  const avatar = q('#modal-avatar');
  const name = q('#modal-name');
  const project = q('#modal-project');
  const stars = q('#modal-stars');
  const text = q('#modal-text');
  const imgWrapper = q('#modal-image-wrapper');
  const attachedImg = q('#modal-attached-img');

  if (avatar) avatar.src = fb.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
  if (name) name.textContent = fb.name;
  if (project) project.textContent = fb.project;
  if (stars) stars.textContent = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
  if (text) text.textContent = `"${fb.message}"`;

  if (imgWrapper && attachedImg) {
    if (fb.attachedImg) {
      attachedImg.src = fb.attachedImg;
      imgWrapper.classList.remove('hidden');
    } else {
      attachedImg.src = '';
      imgWrapper.classList.add('hidden');
    }
  }

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeFeedbackModal() {
  const modal = q('#feedback-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function initFeedbackSystem() {
  renderMarqueeTrack();

  const closeBtn = q('#modal-close');
  const modal = q('#feedback-modal');
  if (closeBtn) closeBtn.addEventListener('click', closeFeedbackModal);
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeFeedbackModal();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeFeedbackModal();
  });

  const starOpts = qa('.star-opt');
  const hiddenRating = q('#fb-rating');
  starOpts.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-rating'));
      if (hiddenRating) hiddenRating.value = val;
      starOpts.forEach((s, idx) => {
        if (idx < val) s.classList.add('active');
        else s.classList.remove('active');
      });
    });
  });

  const imageInput = q('#fb-image');
  const previewContainer = q('#image-preview-container');
  const previewImg = q('#image-preview');
  const removeBtn = q('#remove-image-btn');
  let currentBase64Image = '';

  if (imageInput) {
    imageInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          currentBase64Image = evt.target.result;
          if (previewImg) previewImg.src = currentBase64Image;
          if (previewContainer) previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      currentBase64Image = '';
      if (imageInput) imageInput.value = '';
      if (previewContainer) previewContainer.classList.add('hidden');
    });
  }

  const feedbackForm = q('#feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = q('#fb-name').value.trim();
      const email = q('#fb-email').value.trim();
      const subject = q('#fb-subject').value;
      const rating = parseInt(q('#fb-rating').value || '5');
      const message = q('#fb-message').value.trim();

      if (!name || !email || !message) return;

      const newFb = {
        id: Date.now(),
        name: name,
        email: email,
        project: subject,
        rating: rating,
        message: message,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        attachedImg: currentBase64Image
      };

      const currentList = getStoredFeedbacks();
      currentList.unshift(newFb);
      saveFeedbacks(currentList);
      renderMarqueeTrack();

      const status = q('#form-status');
      if (status) {
        status.style.color = 'var(--acc)';
        status.textContent = `Thank you, ${name}! Your feedback has been published live in the marquee.`;
        setTimeout(() => { status.textContent = ''; }, 6000);
      }

      feedbackForm.reset();
      currentBase64Image = '';
      if (previewContainer) previewContainer.classList.add('hidden');
      starOpts.forEach(s => s.classList.add('active'));
      if (hiddenRating) hiddenRating.value = 5;
    });
  }
}

/* ================================================
   CONTACT FORM HANDLER (Direct Email Trigger)
================================================ */
function initContactForm() {
  const contactForm = q('#contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = q('#c-name').value.trim();
    const phone = q('#c-phone').value.trim();
    const email = q('#c-email').value.trim();
    const message = q('#c-message').value.trim();
    const status = q('#contact-status');

    const subject = encodeURIComponent(`New Portfolio Inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    const mailtoUrl = `mailto:husnimujeeb.co@gmail.com?subject=${subject}&body=${body}`;

    window.location.href = mailtoUrl;

    if (status) {
      status.style.color = 'var(--acc)';
      status.textContent = `Thank you ${name}! Opening your email client to send message to husnimujeeb.co@gmail.com.`;
      setTimeout(() => { status.textContent = ''; }, 6000);
    }

    contactForm.reset();
  });
}

/* Initialize Form Systems */
initFeedbackSystem();
initContactForm();

/* ================================================
   RESIZE — refresh ScrollTrigger
================================================ */
window.addEventListener('resize', () => {
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
});
