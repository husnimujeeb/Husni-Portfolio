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
function initHero() {
  initParticles();

  const portrait   = q('#hero-portrait');
  const frameGroup = q('#frame-group');
  const selFrame   = q('#sel-frame');
  const handles    = qa('#sel-frame .sfh');
  const badgeAd    = q('#badge-ad');
  const badgeYr    = q('#badge-yr');
  const toolCursor = q('.hero-tool-cursor');
  const hint       = q('#scroll-hint');
  const hwTop      = q('#hw-top');
  const hwBot      = q('#hw-bot');

  /* Split background word chars */
  const topChars = splitChars(hwTop);
  const botChars = splitChars(hwBot);

  /* Initial states */
  gsap.set(topChars,   { opacity: 0, y: -60, rotateX: 60, transformOrigin: '50% 0%' });
  gsap.set(botChars,   { opacity: 0, y:  60, rotateX:-60, transformOrigin: '50% 100%' });
  gsap.set(portrait,   { opacity: 0, y: -80, scale: 0.95 });
  gsap.set(selFrame,   { scaleX: 0, scaleY: 0, transformOrigin: 'top left' });
  gsap.set(handles,    { scale: 0, opacity: 0 });
  gsap.set(badgeAd,    { opacity: 0, x: -30, y: 10 });
  gsap.set(badgeYr,    { opacity: 0, x:  30, y: -10 });
  gsap.set(toolCursor, { opacity: 0 });
  gsap.set(hint,       { opacity: 0 });

  const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'power4.out' } });

  /* 1. Background words fly in from top/bottom with 3D flip */
  tl.to(topChars, {
    opacity: 1, y: 0, rotateX: 0, stagger: 0.025, duration: 1,
  })
  .to(botChars, {
    opacity: 1, y: 0, rotateX: 0, stagger: 0.025, duration: 1,
  }, '<0.05')

  /* 2. Photo drops in */
  .to(portrait, {
    opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out',
  }, '-=0.7')

  /* 3. Selection frame border draws in */
  .to(selFrame, {
    scaleX: 1, scaleY: 1, duration: 0.35, ease: 'power3.inOut',
  }, '-=0.4')

  /* 4. Handles pop in with back.out */
  .to(handles, {
    scale: 1, opacity: 1,
    stagger: 0.03, duration: 0.4, ease: 'back.out(2.5)',
  }, '-=0.2')

  /* 5. Badges slide in */
  .to(badgeAd, {
    opacity: 1, x: 0, y: 0, duration: 0.4, ease: 'back.out(1.8)',
  }, '-=0.1')
  .to(badgeYr, {
    opacity: 1, x: 0, y: 0, duration: 0.4, ease: 'back.out(1.8)',
  }, '-=0.5')

  /* 6. Cursor + scroll hint */
  .to([toolCursor, hint], { opacity: 1, duration: 0.3 }, '-=0.2');

  /* ── Mouse parallax on hero ──────────────────── */
  const heroSec = q('.hero-section');
  heroSec.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    /* Photo tilts gently */
    gsap.to(portrait, {
      rotateX: dy * -6,
      rotateY: dx *  6,
      transformPerspective: 1200,
      duration: 0.5,
      ease: 'power2.out',
    });

    /* Background words drift opposite */
    gsap.to(hwTop, { x: dx * -18, y: dy * -10, duration: 1.2, ease: 'power2.out' });
    gsap.to(hwBot, { x: dx *  18, y: dy *  10, duration: 1.2, ease: 'power2.out' });

    /* Frame drifts slightly with photo */
    gsap.to(frameGroup, { x: dx * 8, y: dy * 6, duration: 1, ease: 'power2.out' });
  });

  heroSec.addEventListener('mouseleave', () => {
    gsap.to([portrait, hwTop, hwBot, frameGroup], {
      rotateX: 0, rotateY: 0, x: 0, y: 0,
      duration: 1.5,
      ease: 'elastic.out(1, 0.4)',
    });
  });
}

/* ================================================
   NAV — active state tracker
================================================ */
function initNav() {
  const nav      = q('#nav');
  const sections = qa('section[id]');
  const navLinks = qa('.nav-link');

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
qa('.photo-item').forEach((item, i) => {
  const speed = (i % 3 === 0) ? -40 : (i % 3 === 1) ? -20 : -60;
  gsap.to(item, {
    y: speed,
    ease: 'none',
    scrollTrigger: {
      trigger: item,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.65,
    },
  });
});

/* ================================================
   MAGNETIC BUTTONS
================================================ */
qa('.magnetic-btn').forEach(btn => {
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
/* Background PORTFOLIO words drift as you scroll */
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
gsap.to('#hw-bot', {
  y: 60,
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
   RESIZE — refresh ScrollTrigger
================================================ */
window.addEventListener('resize', () => ScrollTrigger.refresh());

/* CLIENT FEEDBACK MODAL AND PROJECT GALLERY */
(function initFeedbackExperience() {
  const track = q('.feedback-track');
  qa('.feedback-card').forEach(card => track.appendChild(card.cloneNode(true)));

  const modal = q('#feedback-modal');
  const close = q('.feedback-modal-close');
  const quote = q('#feedback-modal-quote');
  const client = q('#feedback-modal-client');
  const role = q('#feedback-modal-role');
  const avatar = q('#feedback-modal-avatar');
  const stars = q('#feedback-modal-stars');
  const preview = q('#feedback-work-preview');
  const previewImage = q('#feedback-work-preview-image');

  const gallery = q('#work-gallery');
  const galleryImage = q('#gallery-image');
  const galleryCaption = q('#gallery-caption');
  const galleryClose = q('.gallery-close');
  const galleryPrevious = q('.gallery-prev');
  const galleryNext = q('.gallery-next');
  let images = [];
  let currentImage = 0;

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (!gallery.classList.contains('is-open')) document.body.classList.remove('modal-open');
  }

  function renderGallery() {
    galleryImage.src = images[currentImage];
    galleryCaption.textContent = 'Project preview ' + (currentImage + 1) + ' of ' + images.length;
    galleryPrevious.disabled = images.length < 2;
    galleryNext.disabled = images.length < 2;
  }

  function closeGallery() {
    gallery.classList.remove('is-open');
    gallery.setAttribute('aria-hidden', 'true');
    if (!modal.classList.contains('is-open')) document.body.classList.remove('modal-open');
    preview.focus();
  }

  qa('.feedback-card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.client;
      const rating = Number(card.dataset.rating);
      images = card.dataset.workImages.split(',').map(src => src.trim()).filter(Boolean);
      currentImage = 0;
      quote.textContent = '“' + card.dataset.feedback + '”';
      client.textContent = name;
      role.textContent = card.dataset.role;
      avatar.src = card.dataset.avatar || '';
      avatar.alt = name + ' profile image';
      stars.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      previewImage.src = images[0] || '';
      previewImage.alt = name + ' project preview';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      close.focus();
    });
  });

  preview.addEventListener('click', () => {
    if (!images.length) return;
    renderGallery();
    gallery.classList.add('is-open');
    gallery.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    galleryClose.focus();
  });

  galleryPrevious.addEventListener('click', () => { currentImage = (currentImage - 1 + images.length) % images.length; renderGallery(); });
  galleryNext.addEventListener('click', () => { currentImage = (currentImage + 1) % images.length; renderGallery(); });
  close.addEventListener('click', closeModal);
  galleryClose.addEventListener('click', closeGallery);
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  gallery.addEventListener('click', event => { if (event.target === gallery) closeGallery(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (gallery.classList.contains('is-open')) closeGallery();
      else if (modal.classList.contains('is-open')) closeModal();
    }
    if (gallery.classList.contains('is-open') && event.key === 'ArrowLeft') galleryPrevious.click();
    if (gallery.classList.contains('is-open') && event.key === 'ArrowRight') galleryNext.click();
  });
})();