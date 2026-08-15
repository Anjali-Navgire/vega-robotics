/* ==========================================================================
   VEGA ROBOTICS — script.js
   Handles: intro sequence, custom cursor, navbar, scroll reveal, counters,
   magnetic buttons, gentle 3D tilt cards, spotlight, forms.
   Tuned for a soft, natural feel — nothing snaps.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------------
     Footer year
  --------------------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     INTRO SEQUENCE (only present on index.html)
  --------------------------------------------------------------------- */
  const intro       = document.getElementById('intro');
  const startBtn    = document.getElementById('startBtn');
  const introPercent= document.getElementById('introPercent');
  const site        = document.getElementById('site');

  if (intro) {
    document.body.style.overflow = 'hidden';

    let pct = 0;
    const pctTimer = setInterval(() => {
      pct += Math.random() * 12;
      if (pct >= 100) { pct = 100; clearInterval(pctTimer); }
      if (introPercent) introPercent.textContent = String(Math.floor(pct)).padStart(2, '0') + '%';
    }, 160);

    const introParticlesWrap = document.getElementById('introParticles');
    if (introParticlesWrap) {
      for (let i = 0; i < 16; i++) {
        const p = document.createElement('span');
        const left = Math.random() * 100;
        const delay = Math.random() * 9;
        const duration = 9 + Math.random() * 9;
        p.style.left = left + 'vw';
        p.style.bottom = '-10px';
        p.style.animationDuration = duration + 's';
        p.style.animationDelay = delay + 's';
        introParticlesWrap.appendChild(p);
      }
    }

    function leaveIntro() {
      clearInterval(pctTimer);
      if (introPercent) introPercent.textContent = '100%';
      intro.classList.add('leaving');
      document.body.style.overflow = '';
      setTimeout(() => {
        intro.style.display = 'none';
        site.classList.add('revealed');
        revealOnLoad();
      }, 1300);
    }

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        startBtn.classList.add('rippling');
        setTimeout(leaveIntro, 340);
      });
    }
  }

  /* ---------------------------------------------------------------------
     CUSTOM CURSOR
  --------------------------------------------------------------------- */
  const cursorDot  = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    }
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    if (cursorRing) {
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
    }
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverTargets = 'a, button, input, textarea, .tilt-card, .magnetic';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets) && cursorRing) cursorRing.classList.add('grow');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets) && cursorRing) cursorRing.classList.remove('grow');
  });

  /* ---------------------------------------------------------------------
     SCROLL PROGRESS BAR
  --------------------------------------------------------------------- */
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if (scrollProgress) scrollProgress.style.width = (isFinite(scrolled) ? scrolled : 0) + '%';
  }

  /* ---------------------------------------------------------------------
     NAVBAR: scrolled state + active link + mobile toggle
  --------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTop = document.getElementById('backToTop');

  function updateNavbar() {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', y > 60);
    if (backToTop) backToTop.classList.toggle('visible', y > 700);
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });
  }
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle && navToggle.classList.remove('open');
      navMenu && navMenu.classList.remove('open');
    });
  });

  // active-link tracking only matters on the one-page index (sections live there)
  const sections = document.querySelectorAll('main section[id]');
  function updateActiveLink() {
    if (!sections.length) return;
    let currentId = sections[0].id;
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 140) currentId = sec.id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      link.classList.toggle('active', href === '#' + currentId || href === 'index.html#' + currentId);
    });
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------------------------
     SCROLL REVEAL (IntersectionObserver)
  --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  function revealOnLoad() {
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('in');
    });
  }

  // pages without an intro (product pages) should reveal immediately
  if (!intro) revealOnLoad();

  /* ---------------------------------------------------------------------
     ANIMATED COUNTERS
  --------------------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const isDecimal = target % 1 !== 0;
      const duration = 1600;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = (isDecimal ? value.toFixed(1) : Math.floor(value)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  /* ---------------------------------------------------------------------
     HERO PARTICLES (ambient floating dots, low density)
  --------------------------------------------------------------------- */
  const heroParticles = document.getElementById('heroParticles');
  if (heroParticles) {
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('span');
      p.style.left = Math.random() * 100 + '%';
      p.style.bottom = -10 + 'px';
      p.style.animationDuration = (11 + Math.random() * 12) + 's';
      p.style.animationDelay = (Math.random() * 12) + 's';
      heroParticles.appendChild(p);
    }
  }

  /* ---------------------------------------------------------------------
     MOUSE SPOTLIGHT
  --------------------------------------------------------------------- */
  const spotlight = document.getElementById('spotlight');
  window.addEventListener('mousemove', (e) => {
    if (spotlight) {
      spotlight.style.setProperty('--x', e.clientX + 'px');
      spotlight.style.setProperty('--y', e.clientY + 'px');
    }
  });

  /* ---------------------------------------------------------------------
     MAGNETIC BUTTONS — subtle pull, not a snap
  --------------------------------------------------------------------- */
  const magneticEls = document.querySelectorAll('.magnetic');
  magneticEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${relX * 0.16}px, ${relY * 0.2}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0,0)';
    });
  });

  /* ---------------------------------------------------------------------
     3D TILT CARDS — gentle, low-degree
  --------------------------------------------------------------------- */
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - py) * 5;
      const rotateY = (px - 0.5) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;

      card.style.setProperty('--mx', (px * 100) + '%');
      card.style.setProperty('--my', (py * 100) + '%');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  /* ---------------------------------------------------------------------
     CONTACT + NEWSLETTER FORMS (front-end only demo handling)
  --------------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      formNote.textContent = 'Message received — our team will reach out shortly.';
      contactForm.reset();
    });
  }

  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      if (input) input.value = 'Subscribed ✓';
      setTimeout(() => { if (input) input.value = ''; }, 2200);
    });
  }

  /* ---------------------------------------------------------------------
     TIMELINE FILL ON SCROLL
  --------------------------------------------------------------------- */
  const timelineFill = document.querySelector('.timeline-line-fill');
  const timeline = document.querySelector('.timeline');

  function updateTimelineFill() {
    if (!timelineFill || !timeline) return;
    const rect = timeline.getBoundingClientRect();
    const viewportCenter = window.innerHeight * 0.6;
    const progress = Math.min(Math.max((viewportCenter - rect.top) / rect.height, 0), 1);
    timelineFill.style.height = (progress * 100) + '%';
  }

  /* ---------------------------------------------------------------------
     MASTER SCROLL / RESIZE LOOP (throttled via rAF)
  --------------------------------------------------------------------- */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateScrollProgress();
        updateNavbar();
        updateActiveLink();
        updateTimelineFill();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll);
  window.addEventListener('resize', onScroll);

  // initialize on load
  updateScrollProgress();
  updateNavbar();
  updateActiveLink();
  updateTimelineFill();
});