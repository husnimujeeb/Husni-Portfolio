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
   THREE.JS PARTICLE FIELD (Hero background)
================================================ */
function initParticles() {
  const canvas = q('#hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  try {
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
    if (lenis) {
      lenis.on('scroll', ({ scroll }) => { scrollY = scroll; });
    } else {
      window.addEventListener('scroll', () => { scrollY = window.scrollY; });
    }

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
  } catch (err) {
    console.warn('Three.js initialization skipped:', err);
  }
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
   PRELOADER & HERO ANIMATION FLOW
   Workflow: Loading Page -> Animation Sequence -> Hero Page
================================================ */
let heroTL = null;

function initHeroAnimation() {
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

  /* Split background word chars */
  const topChars = splitChars(hwTop);

  /* Set initial hidden states immediately on page setup */
  if (openingLine) gsap.set(openingLine, { scaleX: 0, opacity: 1 });
  if (topChars.length) gsap.set(topChars, { opacity: 0, scale: 1.05 });
  if (titleFirst && titleLast) gsap.set([titleFirst, titleLast], { opacity: 0, y: 45, filter: 'blur(8px)' });
  if (tag) gsap.set(tag, { opacity: 0, y: 15 });
  if (bio && actions && skillsCard) gsap.set([bio, actions, skillsCard], { opacity: 0, y: 30 });
  if (portrait && ring) gsap.set([portrait, ring], { opacity: 0, y: 30, scale: 0.96 });
  if (statsCard && dnaCard) gsap.set([statsCard, dnaCard], { opacity: 0, y: 30 });
  if (hint && nav) gsap.set([hint, nav], { opacity: 0 });

  /* Build entrance animation timeline (starts paused) */
  heroTL = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

  /* STEP 1 & 2: Small Accent Line grows */
  if (openingLine) {
    heroTL.to(openingLine, { scaleX: 1, duration: 0.45, ease: 'power2.inOut' })
          .to(openingLine, { opacity: 0, duration: 0.25, ease: 'power2.out' }, '+=0.05');
  }

  /* STEP 3: Background Typography */
  if (topChars.length) {
    heroTL.to(topChars, { opacity: 1, scale: 1, stagger: 0.025, duration: 0.75, ease: 'power2.out' }, '-=0.15');
  }

  /* STEP 4 & 5: Main Name "HUSNI" and "MUJEEB" */
  if (titleFirst && titleLast) {
    heroTL.to(titleFirst, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75 }, '-=0.5')
          .to(titleLast,  { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75 }, '-=0.6');
  }

  /* STEP 6: ART DIRECTOR Label */
  if (tag) {
    heroTL.to(tag, { opacity: 1, y: 0, duration: 0.55 }, '-=0.5');
  }

  /* STEP 7: Portrait & Glowing Ring */
  if (portrait && ring) {
    heroTL.to([portrait, ring], { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out' }, '-=0.55');
  }

  /* STEP 8: Bio, Buttons, Skills, Stats, DNA Cards */
  if (bio && actions) {
    heroTL.to([bio, actions], { opacity: 1, y: 0, stagger: 0.08, duration: 0.65 }, '-=0.45');
  }
  if (skillsCard) {
    heroTL.to(skillsCard, { opacity: 1, y: 0, duration: 0.65, ease: 'back.out(1.2)' }, '-=0.4');
  }
  if (statsCard && dnaCard) {
    heroTL.to([statsCard, dnaCard], { opacity: 1, y: 0, stagger: 0.12, duration: 0.65, ease: 'back.out(1.2)' }, '-=0.45');
  }

  /* STEP 9: Navigation & Scroll Hint */
  if (nav && hint) {
    heroTL.to([nav, hint], { opacity: 1, duration: 0.55 }, '-=0.3');
  }

  /* ── Mouse Parallax on Hero ──────────────────── */
  if (!window.matchMedia('(hover: none)').matches) {
    const heroSec = q('.hero-section');
    if (heroSec) {
      heroSec.addEventListener('mousemove', e => {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;

        if (portrait) {
          gsap.to(portrait, {
            rotateX: dy * -4,
            rotateY: dx *  4,
            transformPerspective: 1000,
            duration: 0.8,
            ease: 'power2.out',
          });
        }
        if (hwTop) gsap.to(hwTop, { x: dx * -15, y: dy * -8, duration: 1, ease: 'power2.out' });
        const f1 = q('.float-1');
        const f2 = q('.float-2');
        if (f1) gsap.to(f1, { x: dx * 10, y: dy * 10, duration: 1.2 });
        if (f2) gsap.to(f2, { x: dx * -12, y: dy * -8, duration: 1.4 });
        if (skillsCard) gsap.to(skillsCard, { x: dx * -6, y: dy * -4, duration: 0.9 });
        if (statsCard && dnaCard) gsap.to([statsCard, dnaCard], { x: dx * 6, y: dy * 4, duration: 0.9 });
      });

      heroSec.addEventListener('mouseleave', () => {
        const resetElems = [portrait, hwTop, skillsCard, statsCard, dnaCard, q('.float-1'), q('.float-2')].filter(Boolean);
        gsap.to(resetElems, {
          rotateX: 0, rotateY: 0, x: 0, y: 0,
          duration: 1.2,
          ease: 'elastic.out(1, 0.4)',
        });
      });
    }
  }
}

function startHeroReveal() {
  if (heroTL) {
    heroTL.play();
  } else {
    // Fallback: make all elements visible if timeline wasn't created
    gsap.set(['#nav', '#hero-tag', '#hero-title', '#hero-bio', '#hero-actions', '#hero-skills', '#hero-portrait', '#portrait-ring', '#hero-stats', '#hero-dna', '#scroll-hint'], {
      opacity: 1, y: 0, scale: 1, filter: 'none'
    });
  }
  initNav();
}

// Prepare Hero upfront immediately
initHeroAnimation();

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
        // Smoothly trigger hero entrance animation as curtain begins lifting
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
        const chars = splitChars(titleEl);
        gsap.from(chars, {
          opacity: 0, y: 50, rotateX: -70,
          transformOrigin: '50% 100%',
          stagger: 0.025,
          duration: 0.4,
          ease: 'power4.out',
        });
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
        const chars = splitChars(titleEl);
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
