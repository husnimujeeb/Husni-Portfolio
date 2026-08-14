/* ================================================
   HUSNI MUJEEB — PORTFOLIO
   Cinematic Animation Engine
   ─────────────────────────
   Stack:
   • GSAP 3 + ScrollTrigger (scroll animations)
   • Lenis (smooth scroll)
   • Three.js (particle field background)
   • Vanilla JS (cursor, tilt, magnetic, parallax)
================================================ */

'use strict';

/* ─── GSAP REGISTER ─────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ─── LENIS SMOOTH SCROLL ─────────────────── */
const lenis = new Lenis({
  duration: 0.8,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  smooth: true,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ─── UTILITY ────────────────────────────────── */
const q  = s => document.querySelector(s);
const qa = s => document.querySelectorAll(s);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* Split text into <span class="char"> elements */
function splitChars(el) {
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
lenis.on('scroll', ({ progress }) => {
  q('#scroll-progress').style.width = (progress * 100) + '%';
});

/* ================================================
   PRELOADER
================================================ */
(function preloader() {
  const fill    = q('#pre-fill');
  const numEl   = q('#pre-num');
  const loader  = q('#preloader');
  const firstName = q('.pre-first');
  const lastName  = q('.pre-last');

  // Initial state
  gsap.set([firstName, lastName], { opacity: 0, y: 40 });
  gsap.set(q('.pre-role'),        { opacity: 0 });

  // Stagger name reveal
  gsap.to([firstName, lastName], {
    opacity: 1, y: 0,
    duration: 0.45,
    stagger: 0.035,
    ease: 'power3.out',
    delay: 0.2,
  });
  gsap.to(q('.pre-role'), { opacity: 1, duration: 0.35, delay: 0.7 });

  // Counter
  let count = 0;
  const tick = setInterval(() => {
    const step = Math.random() * 4 + 1;
    count = Math.min(count + step, 100);
    const rounded = Math.floor(count);
    numEl.textContent = rounded;
    fill.style.width  = rounded + '%';
    if (count >= 100) {
      clearInterval(tick);
      setTimeout(exitPreloader, 300);
    }
  }, 28);

  function exitPreloader() {
    const tl = gsap.timeline();
    tl.to([firstName, lastName, q('.pre-role'), q('.pre-bar-row')], {
      y: -50, opacity: 0, stagger: 0.035, duration: 0.3, ease: 'power3.in',
    })
    .to(loader, {
      yPercent: -102, duration: 1, ease: 'power4.inOut',
      onComplete: () => {
        loader.style.display = 'none';
        initHero();
        initNav();
      }
    }, '+=0.05');
  }
})();

/* ================================================
   THREE.JS PARTICLE FIELD (Hero background)
================================================ */
function initParticles() {
  const canvas   = q('#hero-canvas');
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /* Dot grid */
  const count = 1800;
  const pos   = new Float32Array(count * 3);
  const col   = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 22;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 12;

    const accent = Math.random() > 0.85;
    col[i * 3]     = accent ? 0.91 : 0.25;
    col[i * 3 + 1] = accent ? 0.26 : 0.25;
    col[i * 3 + 2] = accent ? 0.10 : 0.25;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);
  camera.position.z = 6;

  let mX = 0, mY = 0;
  document.addEventListener('mousemove', e => {
    mX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let scrollY = 0;
  lenis.on('scroll', ({ scroll }) => { scrollY = scroll; });

  function animate() {
    requestAnimationFrame(animate);
    points.rotation.y += 0.0004;
    points.rotation.x += 0.0001;
    camera.position.x += (mX * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (-mY * 0.4 - camera.position.y) * 0.04;
    points.position.y = -scrollY * 0.001;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ================================================
   CUSTOM CURSOR
================================================ */
(function initCursor() {
  const dot  = q('#c-dot');
  const ring = q('#c-ring');
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
  qa('a, button, .toc-item, .work-card, .photo-item, .social-card').forEach(el => {
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
   HERO ANIMATIONS (called after preloader exits)
================================================ */
/* ================================================
   HERO ANIMATIONS (called after preloader exits)
================================================ */
function initHero() {
  initParticles();

  const openingLine = q('#opening-line');
  const hwTop       = q('#hw-top');
  const tag         = q('#hero-tag');
  const titleFirst  = q('#hero-first');
  const titleLast   = q('#hero-last');
  const bio         = q('#hero-bio');
  const actions     = q('#hero-actions');
  const skillsCard  = q('#hero-skills');
  const portrait    = q('#hero-portrait');
  const ring        = q('#portrait-ring');
  const statsCard   = q('#hero-stats');
  const dnaCard     = q('#hero-dna');
  const hint        = q('#scroll-hint');
  const nav         = q('#nav');

  /* Split background word chars if needed */
  const topChars = splitChars(hwTop);

  /* Set initial hidden states */
  gsap.set(openingLine, { scaleX: 0, opacity: 1 });
  gsap.set(topChars,    { opacity: 0, scale: 1.05 });
  gsap.set([titleFirst, titleLast], { opacity: 0, y: 50, filter: 'blur(8px)' });
  gsap.set(tag,         { opacity: 0, y: 15 });
  gsap.set([bio, actions, skillsCard], { opacity: 0, y: 30 });
  gsap.set([portrait, ring], { opacity: 0, y: 30, scale: 0.96 });
  gsap.set([statsCard, dnaCard], { opacity: 0, y: 30 });
  gsap.set([hint, nav], { opacity: 0 });

  const tl = gsap.timeline({ delay: 0.2, defaults: { ease: 'power3.out' } });

  /* STEP 1 & 2: Small Accent Line grows */
  tl.to(openingLine, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' })
    .to(openingLine, { opacity: 0, duration: 0.3, ease: 'power2.out' }, '+=0.1')

  /* STEP 3: Background Typography */
    .to(topChars, { opacity: 1, scale: 1, stagger: 0.03, duration: 0.8, ease: 'power2.out' }, '-=0.2')

  /* STEP 4 & 5: Main Name "HUSNI" and "MUJEEB" */
    .to(titleFirst, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, '-=0.5')
    .to(titleLast,  { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, '-=0.6')

  /* STEP 6: ART DIRECTOR Label */
    .to(tag, { opacity: 1, y: 0, duration: 0.6 }, '-=0.5')

  /* STEP 7: Portrait & Glowing Ring */
    .to([portrait, ring], { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }, '-=0.6')

  /* STEP 8: Bio, Buttons, Skills, Stats, DNA Cards */
    .to([bio, actions], { opacity: 1, y: 0, stagger: 0.1, duration: 0.7 }, '-=0.5')
    .to(skillsCard, { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.2)' }, '-=0.4')
    .to([statsCard, dnaCard], { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: 'back.out(1.2)' }, '-=0.5')

  /* STEP 9: Navigation & Scroll Hint */
    .to([nav, hint], { opacity: 1, duration: 0.6 }, '-=0.3');

  /* ── Mouse Parallax on Hero ──────────────────── */
  if (!window.matchMedia('(hover: none)').matches) {
    const heroSec = q('.hero-section');
    heroSec.addEventListener('mousemove', e => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      /* Portrait tilts gently */
      gsap.to(portrait, {
        rotateX: dy * -4,
        rotateY: dx *  4,
        transformPerspective: 1000,
        duration: 0.8,
        ease: 'power2.out',
      });

      /* Background word drifts opposite */
      gsap.to(hwTop, { x: dx * -15, y: dy * -8, duration: 1, ease: 'power2.out' });

      /* Floating elements drift */
      gsap.to(q('.float-1'), { x: dx * 10, y: dy * 10, duration: 1.2 });
      gsap.to(q('.float-2'), { x: dx * -12, y: dy * -8, duration: 1.4 });

      /* Cards drift slightly */
      gsap.to(skillsCard, { x: dx * -6, y: dy * -4, duration: 0.9 });
      gsap.to([statsCard, dnaCard], { x: dx * 6, y: dy * 4, duration: 0.9 });
    });

    heroSec.addEventListener('mouseleave', () => {
      gsap.to([portrait, hwTop, skillsCard, statsCard, dnaCard, q('.float-1'), q('.float-2')], {
        rotateX: 0, rotateY: 0, x: 0, y: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.4)',
      });
    });
  }
}


/* ================================================
   NAV — active state tracker
================================================ */
function initNav() {
  const nav      = q('#nav');
  const sections = qa('section[id]');
  const navLinks = qa('.nav-link');
  const toggle   = q('#nav-toggle');
  const linksContainer = q('.nav-links');

  /* Scrolled class */
  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('nav-scrolled', scroll > 60);
  });

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
ScrollTrigger.create({
  trigger: '#toc',
  start: 'top 70%',
  onEnter: () => {
    /* Box border draw */
    const box = q('#toc-box');
    const handles = box.querySelectorAll('.h');
    gsap.from(handles, {
      scale: 0, opacity: 0, stagger: 0.03,
      duration: 0.4, ease: 'back.out(2)',
    });

    /* Title chars */
    const titleEl = q('#toc-title');
    const chars = splitChars(titleEl);
    gsap.from(chars, {
      opacity: 0, y: 50, rotateX: -70,
      transformOrigin: '50% 100%',
      stagger: 0.025,
      duration: 0.4,
      ease: 'power4.out',
    });

    /* TOC items 3D flip */
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

/* ================================================
   SECTION INTRO BLOCKS — cinematic reveal
================================================ */
qa('.sec-intro').forEach((intro, i) => {
  const box     = intro.querySelector('.handles-box');
  const handles = box.querySelectorAll('.h');
  const border  = box.querySelector('.hb-border');
  const titleEl = box.querySelector('.big-title');
  const cursor  = intro.querySelector('.sec-cursor');
  const desc    = intro.querySelector('.sec-desc');
  const stags   = intro.querySelectorAll('.stag');

  /* Set initial border invisible by CSS clip */
  gsap.set(border, { scaleX: 0, scaleY: 0, transformOrigin: 'top left' });
  gsap.set(handles, { scale: 0, opacity: 0 });
  if (cursor) gsap.set(cursor, { opacity: 0, x: -10 });

  ScrollTrigger.create({
    trigger: intro,
    start: 'top 72%',
    onEnter: () => {
      const chars = splitChars(titleEl);
      gsap.set(chars, { opacity: 0, y: 100, rotateX: -90, transformOrigin: '50% 100%' });

      const tl = gsap.timeline();

      /* Border draw */
      tl.to(border, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'power3.inOut' })
        /* Handles bounce in */
        .to(handles, {
          scale: 1, opacity: 1,
          stagger: 0.025,
          duration: 0.35,
          ease: 'back.out(2.5)',
        }, '-=0.3')
        /* Title chars 3D fly-in */
        .to(chars, {
          opacity: 1, y: 0, rotateX: 0,
          stagger: 0.03,
          duration: 0.42,
          ease: 'power4.out',
        }, '-=0.1')
        /* Cursor arrow */
        .to(cursor, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3')
        /* Description fade up */
        .from(desc, {
          opacity: 0, y: 30,
          duration: 0.4,
          ease: 'power2.out',
        }, '-=0.2')
        /* Service tags */
        .from(stags, {
          opacity: 0, y: 16, scale: 0.9,
          stagger: 0.035,
          duration: 0.4,
          ease: 'power2.out',
        }, '-=0.4');
    },
    once: true,
  });
});

/* ================================================
   WORK CARD GRID — stagger reveal
================================================ */
qa('.work-grid').forEach(grid => {
  const cards = grid.querySelectorAll('.work-card');
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
});

/* ================================================
   WORK CARD 3D TILT (on mousemove)
================================================ */
qa('.tilt-card').forEach(card => {
  // Disable 3D tilt on touch/no-hover screens to prevent sticky hover states
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

      /* Shine follow */
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
   PHOTOGRAPHY GRID — reveal + parallax
================================================ */
gsap.from(qa('.photo-item'), {
  scrollTrigger: { trigger: '.photo-grid', start: 'top 80%', once: true },
  opacity: 0, y: 60, scale: 0.95,
  stagger: { each: 0.1, from: 'random' },
  duration: 0.45,
  ease: 'power3.out',
});

/* Individual photo parallax (different speeds for depth) */
if (!window.matchMedia('(max-width: 580px)').matches) {
  qa('.photo-item').forEach((item, i) => {
    const speed = (i % 3 === 0) ? -40 : (i % 3 === 1) ? -20 : -60;
    gsap.to(item, {
      y: speed,
      ease: 'none',
      scrollTrigger: {
        trigger: item,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  });
}

/* ================================================
   MAGNETIC BUTTONS
================================================ */
qa('.magnetic-btn').forEach(btn => {
  // Disable magnetic movement on touch/no-hover screens to avoid jumpiness
  if (window.matchMedia('(hover: none)').matches) return;

  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width  / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    gsap.to(btn, {
      x: x * 0.28,
      y: y * 0.28,
      duration: 0.4,
      ease: 'power2.out',
    });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      x: 0, y: 0,
      duration: 0.4,
      ease: 'elastic.out(1, 0.35)',
    });
  });
});


/* ================================================
   CONTACT SECTION — cinematic reveal
================================================ */
ScrollTrigger.create({
  trigger: '#contact',
  start: 'top 70%',
  once: true,
  onEnter: () => {
    const headline = q('#contact-headline');
    const chars    = splitChars(headline);

    const tl = gsap.timeline();
    tl.from(q('.contact-eyebrow'), {
      opacity: 0, y: 20, duration: 0.3, ease: 'power2.out',
    })
    .from(chars, {
      opacity: 0, y: 60, rotateX: -60,
      transformOrigin: '50% 100%',
      stagger: 0.012,
      duration: 0.4,
      ease: 'power4.out',
    }, '-=0.2')
    .from(qa('.contact-links, .socials-row, .site-footer'), {
      opacity: 0, y: 30, stagger: 0.035, duration: 0.35, ease: 'power3.out',
    }, '-=0.3');
  },
});

/* ================================================
   SCROLL-TRIGGERED FLOATING (subtle ambient)
================================================ */
/* Background CREATIVE DIRECTOR word drifts as you scroll */
gsap.to('#hw-top', {
  y: -60,
  ease: 'none',
  scrollTrigger: {
    trigger: '#about',
    start: 'top top',
    end: 'bottom top',
    scrub: 0.65,
  },
});

/* Portrait photo parallax out on scroll */
gsap.to('#hero-portrait', {
  y: -80,
  ease: 'none',
  scrollTrigger: {
    trigger: '#about',
    start: 'top top',
    end: 'bottom top',
    scrub: 0.75,
  },
});

/* ================================================
   SECTION HEADINGS — hover parallax letters
================================================ */
qa('.big-title').forEach(title => {
  title.addEventListener('mousemove', e => {
    const chars = title.querySelectorAll('.char');
    const rect  = title.getBoundingClientRect();
    chars.forEach((ch, i) => {
      const x   = e.clientX - rect.left;
      const chX = ch.offsetLeft + ch.offsetWidth / 2;
      const d   = Math.abs(x - chX) / rect.width;
      const lift = clamp((1 - d) * 18, 0, 18);
      gsap.to(ch, { y: -lift, color: d < 0.12 ? '#E8431A' : '', duration: 0.3, ease: 'power2.out' });
    });
  });
  title.addEventListener('mouseleave', () => {
    title.querySelectorAll('.char').forEach(ch => {
      gsap.to(ch, { y: 0, color: '', duration: 0.35, ease: 'elastic.out(1, 0.4)' });
    });
  });
});

/* ================================================
   PANEL GLOW — follows mouse inside panel
================================================ */
qa('.panel').forEach(panel => {
  const glow = panel.querySelector('.panel-glow');
  panel.addEventListener('mousemove', e => {
    const rect = panel.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    gsap.to(glow, { x: x - 60, y: y - 60, duration: 0.3, ease: 'power2.out' });
  });
  panel.addEventListener('mouseleave', () => {
    gsap.to(glow, { x: -30, y: -30, duration: 1, ease: 'power2.out' });
  });
});

/* ================================================
   HANDLE PULSE ON HOVER (section boxes)
================================================ */
qa('.handles-box').forEach(box => {
  box.addEventListener('mouseenter', () => {
    gsap.to(box.querySelectorAll('.h'), {
      scale: 1.4,
      boxShadow: '0 0 16px rgba(232,67,26,0.8)',
      stagger: 0.03,
      duration: 0.3,
      ease: 'power2.out',
    });
  });
  box.addEventListener('mouseleave', () => {
    gsap.to(box.querySelectorAll('.h'), {
      scale: 1,
      boxShadow: '0 0 8px rgba(232,67,26,0.35)',
      stagger: 0.02,
      duration: 0.4,
      ease: 'power2.inOut',
    });
  });
});

/* ================================================
   FEEDBACK MARQUEE, MODAL & FORM SYSTEM
================================================ */
const defaultFeedbacks = [
  {
    id: 1,
    name: 'Sarah Lineker',
    email: 'sarah@brandtech.com',
    project: 'Branding & Visual Identity',
    rating: 5,
    message: 'Husni delivered an exceptional brand identity for our tech startup! High attention to detail, cinematic design sense, and fantastic communication throughout. Highly recommended!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    attachedImg: ''
  },
  {
    id: 2,
    name: 'Marcus Thorne',
    email: 'marcus@creativehub.io',
    project: 'UI/UX Redesign',
    rating: 5,
    message: 'Outstanding UI/UX work and photography. He captured our product vision perfectly and transformed our digital presence into a luxury aesthetic. Truly a top-tier Art Director.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    attachedImg: ''
  },
  {
    id: 3,
    name: 'Elena Rostova',
    email: 'elena@fashionvibe.com',
    project: 'Photography & Videography',
    rating: 5,
    message: 'Every frame tells a story! Husni directed our fashion campaign shoot with incredible lighting and color grading. The final visuals blew our entire team away.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    attachedImg: ''
  },
  {
    id: 4,
    name: 'David Kaluwa',
    email: 'david@aistudio.lk',
    project: 'AI & Vibe Coding',
    rating: 5,
    message: 'Brilliant execution on our interactive web platform! Combining AI prompt engineering with sleek UI animations made our project look world-class.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    attachedImg: ''
  }
];

function getStoredFeedbacks() {
  const stored = localStorage.getItem('husni_feedbacks');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  return defaultFeedbacks;
}

function saveFeedbacks(list) {
  localStorage.setItem('husni_feedbacks', JSON.stringify(list));
}

function renderMarqueeTrack() {
  const track = q('#marquee-track');
  if (!track) return;

  const feedbacks = getStoredFeedbacks();
  const listToRender = feedbacks.length < 6 ? [...feedbacks, ...feedbacks, ...feedbacks] : [...feedbacks, ...feedbacks];

  track.innerHTML = listToRender.map((fb, idx) => {
    const stars = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
    const shortMsg = fb.message.length > 90 ? fb.message.substring(0, 90) + '...' : fb.message;
    const avatarSrc = fb.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    return `
      <div class="fb-card" data-index="${idx % feedbacks.length}">
        <div class="fb-header">
          <img src="${avatarSrc}" alt="${fb.name}" class="fb-avatar" />
          <div class="fb-meta">
            <span class="fb-name">${fb.name}</span>
            <span class="fb-project">${fb.project}</span>
          </div>
        </div>
        <div class="fb-stars">${stars}</div>
        <p class="fb-text">"${shortMsg}"</p>
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

  q('#modal-avatar').src = fb.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
  q('#modal-name').textContent = fb.name;
  q('#modal-project').textContent = fb.project;
  q('#modal-stars').textContent = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
  q('#modal-text').textContent = `"${fb.message}"`;

  const imgWrapper = q('#modal-image-wrapper');
  const attachedImg = q('#modal-attached-img');
  if (fb.attachedImg) {
    attachedImg.src = fb.attachedImg;
    imgWrapper.classList.remove('hidden');
  } else {
    attachedImg.src = '';
    imgWrapper.classList.add('hidden');
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

/* Call init handlers */
initFeedbackSystem();
initContactForm();

/* ================================================
   RESIZE — refresh ScrollTrigger
================================================ */
window.addEventListener('resize', () => ScrollTrigger.refresh());


