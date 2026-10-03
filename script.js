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

/* ── 1. Realistic 3D Pine Tree Wind Sway Canvas ── */
function initTreesWind() {
  const canvas = q('#trees-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const darkImg = new Image();
  let darkLoaded = false;
  darkImg.onload = () => { darkLoaded = true; };
  darkImg.src = 'assets/hero-trees.png?v=7.0';
  if (darkImg.complete) darkLoaded = true;

  let width = 0, height = 0;
  function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let time = 0;
  const sliceCount = 80;

  function renderWind() {
    requestAnimationFrame(renderWind);
    if (!width || !height || !darkLoaded) return;

    ctx.clearRect(0, 0, width, height);
    time += 0.016;

    // Draw tree canopy in vertical slices with organic horizontal sway
    const sliceWidth = width / sliceCount;
    const imgSliceWidth = darkImg.naturalWidth / sliceCount;

    for (let i = 0; i < sliceCount; i++) {
      const xNorm = i / sliceCount;
      // Multi-harmonic gentle breeze function
      const windA = Math.sin(time * 1.1 + xNorm * 4.5) * 5;
      const windB = Math.sin(time * 2.3 + xNorm * 8.0) * 2;
      const totalSway = windA + windB;

      const sx = i * imgSliceWidth;
      const sy = 0;
      const sWidth = imgSliceWidth;
      const sHeight = darkImg.naturalHeight;

      const dx = i * sliceWidth + totalSway;
      const dy = 0;
      const dWidth = sliceWidth + 0.5; // avoid seams
      const dHeight = height;

      ctx.drawImage(darkImg, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }
  }
  renderWind();
}

/* ── 2. Atmospheric 3D Warm Orange Fireflies ── */
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

  const fireflyCount = 28;
  const fireflies = [];
  for (let i = 0; i < fireflyCount; i++) {
    fireflies.push({
      x: Math.random() * (window.innerWidth || 1200),
      y: Math.random() * (window.innerHeight || 800),
      z: 0.4 + Math.random() * 1.2,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 1.2 + Math.random() * 2.0,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 1.2 + Math.random() * 1.8,
      baseAlpha: 0.45 + Math.random() * 0.45,
      wanderTimer: Math.random() * 100,
    });
  }

  let lastTime = performance.now();

  function animateParticles(now) {
    requestAnimationFrame(animateParticles);
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);

    fireflies.forEach(f => {
      f.wanderTimer += dt;
      f.vx += Math.sin(f.wanderTimer * 1.5 + f.phase) * 0.035;
      f.vy += Math.cos(f.wanderTimer * 1.2 + f.phase) * 0.025;
      f.vx *= 0.985;
      f.vy *= 0.985;

      f.x += f.vx * f.z;
      f.y += f.vy * f.z;

      if (f.x < -40) f.x = width + 40;
      if (f.x > width + 40) f.x = -40;
      if (f.y < -40) f.y = height + 40;
      if (f.y > height + 40) f.y = -40;

      const pulse = Math.pow(Math.sin(now * 0.001 * f.pulseSpeed + f.phase), 2);
      const alpha = f.baseAlpha * (0.35 + 0.65 * pulse);

      const renderX = f.x;
      const renderY = f.y;
      const r = f.radius * f.z;

      const grad = ctx.createRadialGradient(renderX, renderY, 0, renderX, renderY, r * 5.5);
      grad.addColorStop(0, `rgba(255, 140, 60, ${alpha})`);
      grad.addColorStop(0.3, `rgba(232, 67, 26, ${alpha * 0.7})`);
      grad.addColorStop(1, 'rgba(232, 67, 26, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(renderX, renderY, r * 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 220, 180, ${alpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(renderX, renderY, r * 0.9, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  requestAnimationFrame(animateParticles);
}



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
  const blackout       = q('#hero-blackout');
  const firefliesCanvas = q('#fireflies-canvas');

  // Initial State Setup (Stage 1)
  if (portfolioWord) gsap.set(portfolioWord, { opacity: 0, y: 30, scale: 0.98 });
  if (charWrapper)   gsap.set(charWrapper, { opacity: 0, y: 40, scale: 0.95 });
  if (scrollHint)    gsap.set(scrollHint, { opacity: 0 });
  if (nav)           gsap.set(nav, { opacity: 0 });

  if (stage3Content) gsap.set(stage3Content, { opacity: 0, pointerEvents: 'none' });
  if (blackout)      gsap.set(blackout, { opacity: 0, pointerEvents: 'none' });
  if (sky)           gsap.set(sky, { filter: 'brightness(1) blur(0px)', opacity: 1 });
  if (trees)         gsap.set(trees, { filter: 'brightness(1) blur(0px)', opacity: 1 });

  // Rapid Counter Animation for Stats Card
  let countersAnimated = false;
  function animateStatCounters() {
    const elClients = q('#stat-clients');
    const elYears   = q('#stat-years');
    if (!elClients || !elYears) return;

    const obj = { clients: 0, years: 0 };
    gsap.to(obj, {
      clients: 100,
      years: 4,
      duration: 0.75,
      ease: 'power2.out',
      onUpdate: () => {
        elClients.textContent = Math.round(obj.clients) + '+';
        elYears.textContent   = Math.round(obj.years) + '+';
      }
    });
  }

  // Stage 1 Entrance Timeline (plays when preloader lifts)
  heroEntranceTL = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

  heroEntranceTL
    .to(portfolioWord, { opacity: 0.88, y: 0, scale: 1, duration: 1.1 }, 0.1)
    .to(charWrapper,   { opacity: 1, y: 0, scale: 1, duration: 1.2 }, 0.2)
    .to([nav, scrollHint], { opacity: 1, duration: 0.8 }, 0.6);

  // Multi-Stage Cinematic ScrollTrigger Parallax
  if (typeof ScrollTrigger !== 'undefined' && scrollTrack && stage) {
    const scrollTL = gsap.timeline({
      scrollTrigger: {
        trigger: scrollTrack,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        pin: stage,
        anticipatePin: 1,
        onUpdate: (self) => {
          // Trigger counter roll-up when details are in view
          if (self.progress >= 0.22 && self.progress <= 0.60 && !countersAnimated) {
            countersAnimated = true;
            animateStatCounters();
          } else if (self.progress < 0.15 || self.progress > 0.68) {
            countersAnimated = false;
          }
        }
      }
    });

    // ── PHASE 1: Smooth gradual shrink & disappearance of photo & word (0.04 to 0.24) ──
    scrollTL
      .to(scrollHint, {
        opacity: 0,
        duration: 0.04,
        ease: 'power1.out',
      }, 0)
      .fromTo(portfolioWord, {
        yPercent: 0,
        opacity: 0.88,
        scale: 1,
      }, {
        yPercent: 32,
        opacity: 0,
        scale: 0.92,
        duration: 0.18,
        ease: 'power1.out',
      }, 0.04)
      // Character holds briefly at top, then slowly shrinks and smoothly fades out
      .fromTo(charWrapper, {
        opacity: 1,
        scale: 1,
        yPercent: 0,
        autoAlpha: 1,
      }, {
        opacity: 0,
        scale: 0.64,
        yPercent: 8,
        autoAlpha: 0,
        duration: 0.20,
        ease: 'power1.out',
      }, 0.04)

      // ── PHASE 2: About Me details appear + Background softly dimmed (0.24 to 0.58) ──
      // Highlight details in focus
      .fromTo(stage3Content, {
        opacity: 0,
        y: 35,
        scale: 0.96,
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        pointerEvents: 'auto',
        duration: 0.10,
        ease: 'power2.out',
      }, 0.24)
      // Background brightness slightly dimmed (0.48 - bright enough to see sky & trees, but softly blurred)
      .to([sky, trees], {
        filter: 'brightness(0.48) blur(3.5px)',
        duration: 0.10,
        ease: 'power2.out',
      }, 0.24)

      // ── EXTENDED HOLD: Details comfortably held for 2+ scrolls (0.34 to 0.58) ──
      .to({}, { duration: 0.24 }, 0.34)

      // ── PHASE 3: Details slowly & gently disappear (0.58 to 0.70) ──
      .to(stage3Content, {
        opacity: 0,
        y: -22,
        scale: 0.98,
        pointerEvents: 'none',
        duration: 0.12,
        ease: 'power1.out',
      }, 0.58)
      // Restore background brightness and crystal sharpness for the 3D zoom
      .to([sky, trees], {
        filter: 'brightness(1) blur(0px)',
        duration: 0.10,
        ease: 'power1.inOut',
      }, 0.60)

      // ── PHASE 4: Forward zoom into the realistic 3D forest / trees (0.70 to 0.88) ──
      .to(trees, {
        scale: 3.5,
        yPercent: 24,
        transformOrigin: '50% 80%',
        duration: 0.18,
        ease: 'power1.inOut',
      }, 0.70)
      .to(sky, {
        scale: 1.5,
        yPercent: -12,
        transformOrigin: '50% 50%',
        duration: 0.18,
        ease: 'power1.inOut',
      }, 0.70)
      .to(firefliesCanvas, {
        scale: 2.2,
        opacity: 0,
        duration: 0.14,
        ease: 'power1.inOut',
      }, 0.70)

      // ── PHASE 5: Fade to fully dark / pitch black (0.86 to 0.96) ──
      .fromTo(blackout, {
        opacity: 0,
      }, {
        opacity: 1,
        duration: 0.10,
        ease: 'power2.inOut',
      }, 0.86)
      .to([trees, sky, firefliesCanvas], {
        opacity: 0,
        duration: 0.08,
        ease: 'power2.inOut',
      }, 0.88)

      // Hold on pure black before passing into works
      .to({}, { duration: 0.04 }, 0.96);
  }
}

function startHeroReveal() {
  if (heroEntranceTL) {
    heroEntranceTL.eventCallback('onComplete', () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
    heroEntranceTL.play();
  } else {
    gsap.set(['#nav', '#portfolio-word', '#character-wrapper', '#scroll-hint'], {
      opacity: 1, y: 0, scale: 1
    });
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }
  initNav();
}

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

  /* Active Nav Link Tracker */
  function updateActiveNav() {
    const scrollY = window.scrollY;
    const viewMid = window.innerHeight * 0.45;
    const docHeight = document.documentElement.scrollHeight;
    const isBottom = (window.innerHeight + scrollY) >= (docHeight - 60);

    let activeNavKey = 'about';

    const worksEl    = q('#works');
    const feedbackEl = q('#feedback');
    const contactEl  = q('#contact');

    if (isBottom) {
      activeNavKey = 'contact';
    } else if (contactEl && contactEl.getBoundingClientRect().top <= viewMid) {
      activeNavKey = 'contact';
    } else if (feedbackEl && feedbackEl.getBoundingClientRect().top <= viewMid) {
      activeNavKey = 'feedback';
    } else if (worksEl && worksEl.getBoundingClientRect().top <= viewMid) {
      activeNavKey = 'works';
    } else {
      activeNavKey = 'about';
    }

    navLinks.forEach(link => {
      if (link.getAttribute('data-nav') === activeNavKey) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* Scrolled class & active tracking */
  if (lenis) {
    lenis.on('scroll', ({ scroll }) => {
      nav.classList.toggle('nav-scrolled', scroll > 60);
      updateActiveNav();
    });
  } else {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav-scrolled', window.scrollY > 60);
      updateActiveNav();
    });
  }

  // Initial call
  updateActiveNav();

  /* Smooth scroll for all internal anchor links */
  qa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = q(targetId);
      if (targetEl) {
        e.preventDefault();

        // Immediate active feedback if nav link
        const navKey = anchor.getAttribute('data-nav');
        if (navKey) {
          navLinks.forEach(l => l.classList.remove('active'));
          anchor.classList.add('active');
        }

        if (lenis) {
          lenis.scrollTo(targetEl, { offset: 0, duration: 1.2 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

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
   TABLE OF CONTENTS — animations (Original Iconic Effect)
================================================ */
if (q('#works') && typeof ScrollTrigger !== 'undefined') {
  ScrollTrigger.create({
    trigger: '#works',
    start: 'top 75%',
    onEnter: () => {
      const box = q('#toc-box');
      if (box) {
        const handles = box.querySelectorAll('.h');
        gsap.fromTo(handles, 
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, stagger: 0.03, duration: 0.45, ease: 'back.out(2)', overwrite: 'auto' }
        );
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
          { opacity: 1, y: 0, rotateX: 0, color: '#ffffff', stagger: 0.025, duration: 0.45, ease: 'power4.out', overwrite: 'auto' }
        );
      }

      gsap.fromTo(qa('.toc-item'), 
        { opacity: 0, y: 60, rotateY: -30, transformOrigin: 'left center' },
        { opacity: 1, y: 0, rotateY: 0, stagger: 0.035, duration: 0.5, ease: 'power4.out', delay: 0.25, overwrite: 'auto' }
      );
    },
    once: false,
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
   APPLE UI SYSTEM SMOOTH DOCK WAVE ON HEADINGS
   (MY WORKS, BRANDING, SOCIAL MEDIA, PRINTING, PHOTOGRAPHY, CLIENT FEEDBACK)
   Letter under cursor lifts up; adjacent side letters gently curve up ("ready to up")
   with smooth Apple cosine interpolation and cohesive color shift.
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
    const chars = titleEl.querySelectorAll('.char');

    // Reset any leftover 3D perspective / rotation on box
    gsap.set(box, { transformPerspective: 'none', rotateX: 0, rotateY: 0 });

    const applyWave = (clientX, clientY) => {
      const radius = 125; // Area of smooth Apple wave influence

      chars.forEach(char => {
        const charRect = char.getBoundingClientRect();
        const charCenterX = charRect.left + charRect.width / 2;
        const charCenterY = charRect.top + charRect.height / 2;

        const dx = clientX - charCenterX;
        const dy = (clientY - charCenterY) * 1.2;
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          // Smooth Apple cosine bell curve (0 to 1)
          const norm = dist / radius;
          const power = 0.5 * (1 + Math.cos(norm * Math.PI));
          const liftY = -14 * power;

          // Liquid color interpolation towards accent orange (#E8431A)
          const r = Math.round(255 - 23 * power);
          const g = Math.round(255 - 188 * power);
          const b = Math.round(255 - 229 * power);

          gsap.to(char, {
            y: liftY,
            color: `rgb(${r}, ${g}, ${b})`,
            textShadow: power > 0.35 ? `0 0 ${(14 * power).toFixed(1)}px rgba(232, 67, 26, 0.4)` : 'none',
            rotate: 0,
            scale: 1,
            duration: 0.18,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        } else {
          gsap.to(char, {
            y: 0,
            color: '#ffffff',
            textShadow: 'none',
            rotate: 0,
            scale: 1,
            duration: 0.32,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      });
    };

    const resetChars = () => {
      chars.forEach(char => {
        gsap.to(char, {
          y: 0,
          color: '#ffffff',
          textShadow: 'none',
          rotate: 0,
          scale: 1,
          duration: 0.42,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      });
    };

    // Smooth Desktop Mousemove Wave
    box.addEventListener('mousemove', e => {
      applyWave(e.clientX, e.clientY);
    });

    // Reset when cursor leaves the heading box
    box.addEventListener('mouseleave', resetChars);

    // Touch support for mobile devices
    box.addEventListener('touchstart', e => {
      if (e.touches && e.touches[0]) {
        applyWave(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    box.addEventListener('touchmove', e => {
      if (e.touches && e.touches[0]) {
        applyWave(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    box.addEventListener('touchend', () => {
      setTimeout(resetChars, 300);
    }, { passive: true });
  });
}

// Initialize Interactive Heading Hover Effects
initHeadingHoverEffects();


/* ================================================
   WORK CARD GRID — smooth Apple-style reveal
================================================ */
qa('.work-grid').forEach(grid => {
  const cards = grid.querySelectorAll('.work-card');
  if (cards.length && typeof ScrollTrigger !== 'undefined') {
    gsap.from(cards, {
      scrollTrigger: { trigger: grid, start: 'top 82%', once: true },
      opacity: 0,
      y: 36,
      scale: 0.97,
      stagger: 0.04,
      duration: 0.55,
      ease: 'power2.out',
      clearProps: 'all',
    });
  }
});

/* ================================================
   WORK CARD APPLE-STYLE SOFT SPOTLIGHT SHEEN
================================================ */
qa('.tilt-card').forEach(card => {
  if (window.matchMedia('(hover: none)').matches) return;

  const shine = card.querySelector('.card-shine');
  let animFrame;

  card.addEventListener('mousemove', e => {
    if (!shine) return;
    cancelAnimationFrame(animFrame);
    animFrame = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = ((x / rect.width) * 100).toFixed(1) + '%';
      const py = ((y / rect.height) * 100).toFixed(1) + '%';
      card.style.setProperty('--mx', px);
      card.style.setProperty('--my', py);
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
   MAGNETIC BUTTONS — Apple UI Tactile Press & Follow
================================================ */
qa('.magnetic-btn').forEach(btn => {
  if (window.matchMedia('(hover: none)').matches) return;
  let isPressed = false;

  btn.addEventListener('mousedown', () => {
    isPressed = true;
    gsap.to(btn, { scale: 0.95, duration: 0.08, ease: 'power2.out', overwrite: 'auto' });
  });

  btn.addEventListener('mouseup', () => {
    isPressed = false;
    gsap.to(btn, { scale: 1.02, duration: 0.25, ease: 'back.out(2)', overwrite: 'auto' });
  });

  btn.addEventListener('mousemove', e => {
    if (isPressed) return;
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width  / 2) * 0.3;
    const y = (e.clientY - rect.top  - rect.height / 2) * 0.3;
    gsap.to(btn, { x, y, scale: 1.02, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
  });

  btn.addEventListener('mouseleave', () => {
    isPressed = false;
    gsap.to(btn, { x: 0, y: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
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
    avatar: '',
    attachedImg: ''
  },
  {
    id: 2,
    name: 'Michael Chang',
    project: 'SaaS Mobile App UI/UX',
    rating: 5,
    message: 'Working with Husni on our product redesign was an absolute pleasure. Intuitive UX layouts, state-of-the-art aesthetic, and prompt delivery on every milestone.',
    avatar: '',
    attachedImg: ''
  },
  {
    id: 3,
    name: 'Elena Rostova',
    project: 'Fashion Lookbook Photography',
    rating: 5,
    message: 'Incredible photographic eye and lighting direction! Captured our seasonal collection with cinematic mood and breathtaking editorial quality.',
    avatar: '',
    attachedImg: ''
  },
  {
    id: 4,
    name: 'David Silva',
    project: 'AI Generative Campaign',
    rating: 5,
    message: 'The AI content generation and custom prompt engineering Husni delivered gave our marketing campaign massive organic engagement. Highly recommended!',
    avatar: '',
    attachedImg: ''
  },
  {
    id: 5,
    name: 'Amina Al-Mansoor',
    project: 'Corporate Rebrand & Packaging',
    rating: 5,
    message: 'Husni’s creative vision and meticulous attention to detail gave our enterprise packaging a timeless luxury feel. Outstanding artist & director!',
    avatar: '',
    attachedImg: ''
  }
];

function getInitials(name) {
  const cleanName = (name || 'User').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  } else if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return 'U';
}

// Check if an email has a registered public avatar (Gravatar SHA-256), else return empty string
async function getEmailAvatar(email) {
  if (!email) return '';
  const normalized = email.trim().toLowerCase();

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Gravatar d=404 returns HTTP 404 if the email does not have a registered avatar
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404&s=160`;
    const exists = await new Promise(resolve => {
      const img = new Image();
      let finished = false;
      const timer = setTimeout(() => {
        if (!finished) { finished = true; resolve(false); }
      }, 2500);
      img.onload = () => {
        if (!finished) { finished = true; clearTimeout(timer); resolve(true); }
      };
      img.onerror = () => {
        if (!finished) { finished = true; clearTimeout(timer); resolve(false); }
      };
      img.src = gravatarUrl;
    });

    if (exists) {
      return gravatarUrl;
    }
  } catch (e) {
    // If Web Crypto or network fails, no avatar
  }

  return '';
}

function getStoredFeedbacks() {
  try {
    const saved = localStorage.getItem('husni_feedbacks');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(item => {
          let cleanAvatar = item.avatar || '';
          // Strip out ANY random unsplash image or mock data
          if (cleanAvatar.includes('unsplash.com') || cleanAvatar.includes('photo-') || cleanAvatar.includes('data:image')) {
            cleanAvatar = '';
          }
          return {
            ...item,
            avatar: cleanAvatar
          };
        });
      }
    }
  } catch(e) {}
  return defaultFeedbacks.map(item => ({ ...item, avatar: '' }));
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
    const hasAvatar = fb.avatar && !fb.avatar.includes('unsplash.com') && !fb.avatar.includes('data:image');
    const initials = getInitials(fb.name);
    const avatarMarkup = hasAvatar
      ? `<img src="${fb.avatar}" alt="${fb.name}" class="fb-avatar" loading="lazy" />`
      : `<div class="fb-avatar fb-avatar-initials">${initials}</div>`;

    return `
      <div class="fb-card panel" data-index="${idx % feedbacks.length}">
        <div class="fb-liquid-shine" aria-hidden="true"></div>
        <div class="panel-glow"></div>
        <div class="fb-header">
          ${avatarMarkup}
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

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = ((x / rect.width) * 100).toFixed(1) + '%';
      const py = ((y / rect.height) * 100).toFixed(1) + '%';
      card.style.setProperty('--mx', px);
      card.style.setProperty('--my', py);
    });
  });
}

function openFeedbackModal(fb) {
  const modal = q('#feedback-modal');
  if (!modal) return;

  const avatar = q('#modal-avatar');
  const avatarInitials = q('#modal-avatar-initials');
  const name = q('#modal-name');
  const project = q('#modal-project');
  const stars = q('#modal-stars');
  const text = q('#modal-text');
  const imgWrapper = q('#modal-image-wrapper');
  const attachedImg = q('#modal-attached-img');

  const hasAvatar = fb.avatar && !fb.avatar.includes('unsplash.com') && !fb.avatar.includes('data:image');

  if (hasAvatar) {
    if (avatar) {
      avatar.src = fb.avatar;
      avatar.alt = fb.name;
      avatar.classList.remove('hidden');
    }
    if (avatarInitials) avatarInitials.classList.add('hidden');
  } else {
    if (avatar) {
      avatar.src = '';
      avatar.classList.add('hidden');
    }
    if (avatarInitials) {
      avatarInitials.textContent = getInitials(fb.name);
      avatarInitials.classList.remove('hidden');
    }
  }

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
  // Proactively purge any legacy unsplash images in localStorage
  try {
    const raw = localStorage.getItem('husni_feedbacks');
    if (raw && (raw.includes('unsplash.com') || raw.includes('photo-') || raw.includes('data:image'))) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map(item => ({
          ...item,
          avatar: (item.avatar && (item.avatar.includes('unsplash.com') || item.avatar.includes('photo-') || item.avatar.includes('data:image'))) ? '' : (item.avatar || '')
        }));
        localStorage.setItem('husni_feedbacks', JSON.stringify(cleaned));
      }
    }
  } catch (e) {}

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
    feedbackForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = q('#fb-name').value.trim();
      const email = q('#fb-email').value.trim();
      const subject = q('#fb-subject').value;
      const rating = parseInt(q('#fb-rating').value || '5');
      const message = q('#fb-message').value.trim();
      const submitBtn = feedbackForm.querySelector('button[type="submit"]');

      if (!name || !email || !message) return;

      const origBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit Feedback ↗';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Submitting Feedback...';
      }

      // Check if user's email has a genuine registered avatar, else no image
      let userAvatar = '';
      try {
        userAvatar = await getEmailAvatar(email);
      } catch (err) {
        userAvatar = '';
      }

      const newFb = {
        id: Date.now(),
        name: name,
        email: email,
        project: subject,
        rating: rating,
        message: message,
        avatar: userAvatar,
        attachedImg: currentBase64Image || ''
      };

      const currentList = getStoredFeedbacks();
      currentList.unshift(newFb);
      saveFeedbacks(currentList);
      renderMarqueeTrack();

      const status = q('#form-status');
      if (status) {
        status.style.color = 'var(--acc)';
        status.innerHTML = `Thank you, ${name}! Your feedback is live. Have a Google account? <a href="https://g.page/r/CVcUJ5AXvozFECE/review" target="_blank" rel="noopener noreferrer" style="color:#ffffff;text-decoration:underline;margin-left:6px;font-weight:600;">Rate 5★ on Google too ↗</a>`;
        setTimeout(() => { status.textContent = ''; }, 12000);
      }

      feedbackForm.reset();
      currentBase64Image = '';
      if (previewContainer) previewContainer.classList.add('hidden');
      starOpts.forEach(s => s.classList.add('active'));
      if (hiddenRating) hiddenRating.value = 5;

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
    });
  }
}

/* ================================================
   CONTACT FORM HANDLER (Direct Automated Email Delivery)
================================================ */
function initContactForm() {
  const contactForm = q('#contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name = (q('#c-name') ? q('#c-name').value : '').trim();
    const phone = (q('#c-phone') ? q('#c-phone').value : '').trim();
    const email = (q('#c-email') ? q('#c-email').value : '').trim();
    const message = (q('#c-message') ? q('#c-message').value : '').trim();
    const status = q('#contact-status');
    const submitBtn = q('#c-submit-btn') || contactForm.querySelector('button[type="submit"]');

    if (!name || !email || !message) {
      if (status) {
        status.style.color = '#ff5c5c';
        status.textContent = 'Please fill in all required fields.';
      }
      return;
    }

    const origBtnHtml = submitBtn ? submitBtn.innerHTML : 'Send Message ↗';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending Message...';
    }
    if (status) {
      status.style.color = 'rgba(255, 255, 255, 0.7)';
      status.textContent = 'Sending your message to husnimujeeb.co@gmail.com...';
    }

    // Direct automated submission to husnimujeeb.co@gmail.com via FormSubmit AJAX API
    try {
      const response = await fetch('https://formsubmit.co/ajax/husnimujeeb.co@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          phone: phone || 'Not provided',
          email: email,
          message: message,
          _subject: `New Portfolio Message from ${name}`,
          _template: 'table',
          _captcha: 'false'
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && (data.success === 'true' || data.success === true)) {
        if (status) {
          status.style.color = 'var(--acc)';
          status.textContent = `✓ Message sent successfully! I will get back to you shortly at ${email}.`;
        }
        contactForm.reset();
      } else {
        const errMsg = data.message || 'Unable to submit directly.';
        console.warn('FormSubmit notice:', errMsg);

        if (window.location.protocol === 'file:') {
          const mailSubject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
          const mailBody = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${message}`);
          window.location.href = `mailto:husnimujeeb.co@gmail.com?subject=${mailSubject}&body=${mailBody}`;
          if (status) {
            status.style.color = 'var(--acc)';
            status.textContent = `Local file mode: opening your email client to send to husnimujeeb.co@gmail.com.`;
          }
          contactForm.reset();
        } else {
          if (status) {
            status.style.color = 'var(--acc)';
            status.innerHTML = `Message received! If you need immediate assistance, you can also email me directly at <a href="mailto:husnimujeeb.co@gmail.com" style="color:var(--acc);text-decoration:underline;">husnimujeeb.co@gmail.com</a>.`;
          }
          contactForm.reset();
        }
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      const mailSubject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const mailBody = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${message}`);
      window.location.href = `mailto:husnimujeeb.co@gmail.com?subject=${mailSubject}&body=${mailBody}`;
      if (status) {
        status.style.color = 'var(--acc)';
        status.textContent = `Opening your email client to send to husnimujeeb.co@gmail.com...`;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
      setTimeout(() => {
        if (status) status.textContent = '';
      }, 9000);
    }
  });
}

/* ================================================
   BRANDING PROJECT CASE STUDY MODAL SYSTEM
================================================ */
const BRANDING_PROJECTS = {
  'legacy-lence': {
    id: 'legacy-lence',
    name: 'Legacy Lense',
    category: 'Brand Identity',
    subtitle: 'Art Direction & Visual Storytelling',
    logo: 'assets/branding-legacy-clean.png?v=3',
    logoClass: '',
    glowColor: 'rgba(255, 255, 255, 0.16)',
    about: 'Legacy Lense is a photography brand created to capture meaningful moments and preserve them as lasting visual memories. The branding focuses on creating a timeless, elegant, and emotionally engaging visual identity that reflects the art of photography and visual storytelling.',
    guidelinesTitle: 'Visual Identity',
    guidelines: [
      {
        src: 'assets/legacy-guideline-01.png',
        title: 'Brand Guideline',
        page: 'Page 01',
        caption: 'Brand Guideline · Core Visual Identity & Concept Overview'
      },
      {
        src: 'assets/legacy-guideline-02.png',
        title: 'Logo System',
        page: 'Page 02',
        caption: 'Logo System · Primary Mark, Inverted & Signature Gold Variations'
      },
      {
        src: 'assets/legacy-guideline-03.png',
        title: 'Colour Palette',
        page: 'Page 03',
        caption: 'Colour Palette · Legacy Black (50%), Warm Ivory (25%), Signature Gold (25%)'
      }
    ]
  },
  'zoro-visuals': {
    id: 'zoro-visuals',
    name: 'Zoro Visuals',
    category: 'Brand Identity',
    subtitle: 'Photography & Videography Studio',
    logo: 'assets/branding-zoro-clean.png?v=3',
    logoClass: '',
    glowColor: 'rgba(232, 67, 26, 0.22)',
    about: 'Zoro Visuals is a photography and videography studio focused on creating high-quality visual stories for individuals, brands, and special events. The branding was developed to give the studio a modern, creative, and professional identity that represents its visual storytelling approach.',
    guidelinesTitle: 'Visual Identity',
    guidelines: []
  },
  'spaira-ceylon': {
    id: 'spaira-ceylon',
    name: 'Spaira Ceylon',
    category: 'Brand Identity',
    subtitle: 'Food Brand & Premium Spices',
    logo: 'assets/branding-spaira-clean.png?v=3',
    logoClass: '',
    glowColor: 'rgba(212, 160, 23, 0.22)',
    about: 'Spaira Ceylon is a food brand specializing in authentic spices and a variety of delicious food products. The branding was designed to create a distinctive and appealing identity that communicates the richness of its products while maintaining a warm, memorable, and premium food-brand feel.',
    guidelinesTitle: 'Visual Identity',
    guidelines: []
  },
  'mfyf': {
    id: 'mfyf',
    name: 'MFYF',
    category: 'Brand Identity',
    subtitle: 'Moving Forward Youth Foundation',
    logo: 'assets/branding-mfyf-clean.png?v=3',
    logoClass: 'logo-mfyf',
    glowColor: 'rgba(30, 150, 85, 0.22)',
    about: 'Moving Forward Youth Foundation (MFYF) is a non-profit foundation focused on supporting and empowering young people through educational, social, and community-focused initiatives. The branding was developed to create a positive, youthful, and trustworthy identity that represents the foundation’s vision of helping youth move forward and build a better future.',
    guidelinesTitle: 'Visual Identity',
    guidelines: []
  }
};

function openProjectModal(projectKey) {
  const project = BRANDING_PROJECTS[projectKey];
  if (!project) return;

  const modal = q('#project-modal');
  if (!modal) return;

  const logoEl = q('#project-modal-logo');
  const catEl = q('#project-modal-cat');
  const titleEl = q('#project-modal-title');
  const subEl = q('#project-modal-sub');
  const aboutEl = q('#project-modal-about');
  const glowEl = q('#project-modal-glow');
  const guidelinesSec = q('#project-guidelines-section');
  const guidelinesGrid = q('#project-guidelines-grid');
  const guidelinesTitle = q('#project-guidelines-title');
  const scrollArea = q('.project-modal-scroll');

  if (logoEl) {
    logoEl.src = project.logo;
    logoEl.alt = `${project.name} Logo`;
    logoEl.className = 'project-modal-logo ' + (project.logoClass || '');
  }
  if (catEl) catEl.textContent = project.category;
  if (titleEl) titleEl.textContent = project.name;
  if (subEl) subEl.textContent = project.subtitle;
  if (aboutEl) aboutEl.textContent = project.about;
  if (glowEl) glowEl.style.background = `radial-gradient(circle at 50% 50%, ${project.glowColor} 0%, transparent 70%)`;

  // Render Visual Identity / Guidelines if available
  if (guidelinesSec && guidelinesGrid) {
    if (project.guidelines && project.guidelines.length > 0) {
      guidelinesSec.style.display = 'block';
      if (guidelinesTitle) guidelinesTitle.textContent = project.guidelinesTitle || 'VISUAL IDENTITY';

      guidelinesGrid.innerHTML = project.guidelines.map((img, i) => `
        <div class="guideline-card" data-idx="${i}" tabindex="0" role="button" aria-label="View ${img.title}">
          <div class="guideline-card-img-wrap">
            <img src="${img.src}" alt="${img.title}" loading="lazy" />
            <div class="guideline-card-overlay">
              <span class="guideline-zoom-pill">Preview Fullscreen ↗</span>
            </div>
          </div>
          <div class="guideline-card-footer">
            <div class="guideline-card-info">
              <span class="guideline-card-page">${img.page}</span>
              <h4 class="guideline-card-name">${img.title}</h4>
            </div>
            <span class="guideline-card-icon" aria-hidden="true">↗</span>
          </div>
        </div>
      `).join('');

      qa('.guideline-card', guidelinesGrid).forEach(card => {
        const handleOpen = () => {
          const idx = parseInt(card.getAttribute('data-idx'), 10);
          const item = project.guidelines[idx];
          if (item) openGuidelineLightbox(item);
        };
        card.addEventListener('click', handleOpen);
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen();
          }
        });
      });
    } else {
      guidelinesSec.style.display = 'none';
      guidelinesGrid.innerHTML = '';
    }
  }

  if (scrollArea) {
    scrollArea.scrollTop = 0;
    setTimeout(() => {
      scrollArea.focus({ preventScroll: true });
    }, 50);
  }

  if (lenis) lenis.stop();
  document.body.style.overflow = 'hidden';

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeProjectModal() {
  const modal = q('#project-modal');
  if (!modal || !modal.classList.contains('active')) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');

  if (lenis) lenis.start();
  document.body.style.overflow = '';
}

function openGuidelineLightbox(item) {
  const lb = q('#guideline-lightbox');
  if (!lb) return;
  const img = q('#guideline-lightbox-img');
  const cap = q('#guideline-lightbox-caption');
  if (img) {
    img.src = item.src;
    img.alt = item.title;
  }
  if (cap) cap.textContent = item.caption || item.title;
  lb.classList.add('active');
  lb.setAttribute('aria-hidden', 'false');
}

function closeGuidelineLightbox() {
  const lb = q('#guideline-lightbox');
  if (!lb || !lb.classList.contains('active')) return;
  lb.classList.remove('active');
  lb.setAttribute('aria-hidden', 'true');
}

function initBrandingProjectModal() {
  const modal = q('#project-modal');
  const modalCard = q('.project-modal-card');
  const scrollArea = q('.project-modal-scroll');
  const closeBtn = q('#project-modal-close');
  const lb = q('#guideline-lightbox');
  const lbCloseBtn = q('#guideline-lightbox-close');

  qa('.branding-grid .work-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-project');
      if (key) openProjectModal(key);
    });
  });

  // Ensure mouse wheel and touch gestures scroll inside the modal without outer interference
  if (modalCard) {
    modalCard.addEventListener('wheel', e => {
      e.stopPropagation();
    }, { passive: true });

    modalCard.addEventListener('touchmove', e => {
      e.stopPropagation();
    }, { passive: true });
  }

  if (modal) {
    modal.addEventListener('wheel', e => {
      if (scrollArea && (e.target === modal || !scrollArea.contains(e.target))) {
        e.preventDefault();
        scrollArea.scrollTop += e.deltaY;
      }
    }, { passive: false });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeProjectModal);
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeProjectModal();
    });
  }

  if (lbCloseBtn) lbCloseBtn.addEventListener('click', closeGuidelineLightbox);
  if (lb) {
    lb.addEventListener('click', e => {
      if (e.target === lb || e.target.classList.contains('guideline-lightbox-content')) {
        closeGuidelineLightbox();
      }
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (lb && lb.classList.contains('active')) {
        closeGuidelineLightbox();
      } else if (modal && modal.classList.contains('active')) {
        closeProjectModal();
      }
    }
  });
}

/* Initialize Form & Modal Systems */
initFeedbackSystem();
initContactForm();
initBrandingProjectModal();

/* ================================================
   RESIZE — refresh ScrollTrigger
================================================ */
window.addEventListener('resize', () => {
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
});
