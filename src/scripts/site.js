// Header sizing and scroll behavior
const header = document.querySelector('.site-header');
function updateHeaderHeightVar() {
  if (!header) return;
  const h = header.offsetHeight || 76;
  document.documentElement.style.setProperty('--header-height', h + 'px');
}
updateHeaderHeightVar();
let resizeTimeout = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(updateHeaderHeightVar, 180);
});

// Throttled scroll handler using rAF and passive listener
let ticking = false;
function onScroll() {
  if (!header) return;
  if (!ticking) {
    ticking = true;
    window.requestAnimationFrame(() => {
      if (window.scrollY > 12) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
      ticking = false;
    });
  }
}
window.addEventListener('scroll', onScroll, { passive: true });

// Nav pill: sliding glow + highlight tracks whichever section is in view
const navToggles = document.querySelectorAll('.nav-toggle');
const navIndicatorPill = document.querySelector('.nav-indicator-pill');
const navIndicatorGlow = document.querySelector('.nav-indicator-glow');

function setActiveNavToggle(toggle) {
  navToggles.forEach((t) => t.classList.remove('active'));
  if (!toggle) {
    if (navIndicatorPill) navIndicatorPill.style.opacity = '0';
    if (navIndicatorGlow) navIndicatorGlow.style.opacity = '0';
    return;
  }
  toggle.classList.add('active');
  if (navIndicatorPill) {
    navIndicatorPill.style.opacity = '1';
    navIndicatorPill.style.left = toggle.offsetLeft + 'px';
    navIndicatorPill.style.width = toggle.offsetWidth + 'px';
  }
  if (navIndicatorGlow) {
    navIndicatorGlow.style.opacity = '1';
    navIndicatorGlow.style.left = (toggle.offsetLeft + toggle.offsetWidth / 2 - 12) + 'px';
  }
}

if (navToggles.length) {
  // Nav now mixes same-page anchors (scroll-spy candidates) with links to
  // other pages (e.g. "Giới thiệu"/"Resume" point at resume/, served as
  // resume/index.html) — only hash hrefs are scroll-spied; a toggle whose
  // href resolves to the page we're currently on is the active tab instead.
  // Normalize away "index.html" and trailing slashes so "/resume/",
  // "/resume/index.html" and "/resume" all compare as the same page.
  const normalizePath = (path) => path.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
  const currentPath = normalizePath(window.location.pathname);

  const anchorToggles = Array.from(navToggles).filter((t) => t.getAttribute('href').startsWith('#'));
  const navSections = anchorToggles
    .map((toggle) => document.querySelector(toggle.getAttribute('href')))
    .filter(Boolean);

  const pageToggle = Array.from(navToggles).find((t) => {
    const href = t.getAttribute('href');
    if (href.startsWith('#')) return false;
    const resolvedPath = new URL(href, window.location.href).pathname;
    return normalizePath(resolvedPath) === currentPath;
  });

  if (navSections.length) {
    // Position-based scroll-spy: on every scroll tick, find the last section
    // (in document order) whose top has scrolled above the header line -
    // that's the section currently in view. This replaced two earlier
    // IntersectionObserver-based attempts (ratio comparison, then a tracked-
    // top-per-section Map) that both broke down on sections of very
    // different heights: a short teaser section could hit 100% visible and
    // beat a taller one only partially in view, and the #intro wrapper
    // (Hero + Showreel combined, taller than a viewport) could never cross
    // its intersection threshold at all when scrolled back to the very top,
    // leaving the pill stuck on whatever was last active instead of
    // returning to "Giới thiệu". Checking real-time position on every scroll
    // sidesteps threshold/ratio edge cases entirely.
    function recomputeActiveSection() {
      const line = (header ? header.offsetHeight : 76) + 20;
      let activeIndex = -1;
      navSections.forEach((section, i) => {
        if (section.getBoundingClientRect().top <= line) activeIndex = i;
      });
      setActiveNavToggle(pageToggle || (activeIndex !== -1 ? anchorToggles[activeIndex] : anchorToggles[0]));
    }

    // Clicking a tab should light it up immediately rather than waiting for
    // html's scroll-behavior: smooth to actually finish scrolling there —
    // recomputeActiveSection would otherwise keep showing the *previous*
    // tab active for the whole scroll animation. Suppress the position-based
    // recompute while that animation is still in flight (refreshed on every
    // scroll tick so it keeps holding for as long as the scroll is still
    // moving) and let it resume once scrolling has actually settled.
    let suppressSpy = false;
    let suppressSpyTimer = null;
    function holdSpySuppression() {
      suppressSpy = true;
      clearTimeout(suppressSpyTimer);
      suppressSpyTimer = setTimeout(() => { suppressSpy = false; }, 700);
    }
    anchorToggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        setActiveNavToggle(toggle);
        holdSpySuppression();
      });
    });

    let navSpyTicking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (navSpyTicking) return;
        navSpyTicking = true;
        window.requestAnimationFrame(() => {
          if (suppressSpy) holdSpySuppression();
          else recomputeActiveSection();
          navSpyTicking = false;
        });
      },
      { passive: true }
    );

    recomputeActiveSection();

    window.addEventListener('resize', recomputeActiveSection);
  } else if (pageToggle) {
    setActiveNavToggle(pageToggle);

    window.addEventListener('resize', () => {
      const active = document.querySelector('.nav-toggle.active');
      if (active) setActiveNavToggle(active);
    });
  }
}

// Reveal animations with offset for sticky header
const reveals = document.querySelectorAll('.reveal');

// Detect low-power / constrained devices and user preferences
const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
const isSaveData = connection && connection.saveData;
const isLowEndDevice = (() => {
  try {
    const cores = navigator.hardwareConcurrency || 4;
    const mem = navigator.deviceMemory || 4;
    const slowNet = connection && connection.effectiveType && (connection.effectiveType.includes('2g') || connection.effectiveType.includes('slow-2g'));
    return !!(isSaveData || slowNet || cores <= 2 || mem <= 2);
  } catch (e) {
    return false;
  }
})();

// .low-power strips GPU-costly visuals (blur, shadows) and is reserved for
// genuinely constrained hardware/network — prefers-reduced-motion is an
// accessibility setting about animation, not device capability, so it only
// skips the reveal animations below, not the static header blur.
if (isLowEndDevice) {
  document.body.classList.add('low-power');
}

if (isLowEndDevice || isReducedMotion) {
  // Immediately reveal all sections (no animation)
  reveals.forEach((el) => el.classList.add('is-visible'));
} else {
  function createObserver() {
    const headerH = header ? header.offsetHeight + 12 : 88;
    const rootMargin = `-${headerH}px 0px -10% 0px`;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin }
    );
    reveals.forEach((el) => observer.observe(el));
  }
  createObserver();
}

// Lightweight parallax for the two decorative background-glow blobs — purely
// cosmetic, so it's skipped under the same reduced-motion/low-power gate as
// the reveal animations rather than adding a separate check.
if (!isReducedMotion && !isLowEndDevice) {
  const glow1 = document.querySelector('.glow-1');
  const glow2 = document.querySelector('.glow-2');
  if (glow1 || glow2) {
    let parallaxTicking = false;
    function onParallaxScroll() {
      if (parallaxTicking) return;
      parallaxTicking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (glow1) glow1.style.transform = `translateY(${y * 0.08}px)`;
        if (glow2) glow2.style.transform = `translateY(${y * -0.06}px)`;
        parallaxTicking = false;
      });
    }
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
  }
}

// Admin inline editing (triple-tap logo to toggle)
const logo = document.getElementById('logo');
const adminBar = document.getElementById('admin-bar');
const adminStatus = document.getElementById('admin-status');
const adminSave = document.getElementById('admin-save');
const adminExit = document.getElementById('admin-exit');

let tapTimes = [];
let logoNavTimeout = null;
function onLogoTap(e) {
  // The logo is also a real navigation link (e.g. resume/index.html's logo
  // points back to ../index.html#hero); without preventDefault the first
  // click would navigate away before a 2nd/3rd tap could ever register.
  // So always intercept, and only follow the link if 3 taps don't land
  // within the window — this keeps single-click "go home" working with a
  // brief delay while letting the triple-tap admin toggle work on any page.
  e.preventDefault();
  const now = Date.now();
  tapTimes.push(now);
  // keep taps within 700ms window
  tapTimes = tapTimes.filter((t) => now - t < 700);
  if (tapTimes.length >= 3) {
    if (logoNavTimeout) { clearTimeout(logoNavTimeout); logoNavTimeout = null; }
    toggleAdmin();
    tapTimes = [];
    return;
  }
  if (logoNavTimeout) clearTimeout(logoNavTimeout);
  const href = logo.getAttribute('href');
  logoNavTimeout = setTimeout(() => {
    logoNavTimeout = null;
    if (tapTimes.length < 3 && href) window.location.href = href;
  }, 700);
}
logo && logo.addEventListener('click', onLogoTap);

function setEditable(enabled) {
  const items = document.querySelectorAll('.editable');
  items.forEach((el) => {
    if (enabled) {
      el.setAttribute('contenteditable', 'true');
      el.classList.add('editing');
      el.addEventListener('blur', saveOne);
    } else {
      el.removeAttribute('contenteditable');
      el.classList.remove('editing');
      el.removeEventListener('blur', saveOne);
    }
  });
}

function saveOne(e) {
  const el = e.target;
  const key = el.dataset.key;
  if (!key) return;
  try { localStorage.setItem(key, el.innerHTML); }
  catch (err) { console.warn('Save failed', err); }
}

function saveAll() {
  const items = document.querySelectorAll('.editable');
  items.forEach((el) => {
    const key = el.dataset.key;
    if (!key) return;
    try { localStorage.setItem(key, el.innerHTML); }
    catch (err) { console.warn('Save failed', err); }
  });
  adminStatus.textContent = 'Admin: saved';
  setTimeout(() => adminStatus.textContent = 'Admin: on', 1200);
}

function exitAdmin() {
  document.body.classList.remove('admin');
  adminBar.setAttribute('aria-hidden', 'true');
  adminStatus.textContent = 'Admin: off';
  setEditable(false);
}

function enterAdmin() {
  document.body.classList.add('admin');
  adminBar.setAttribute('aria-hidden', 'false');
  adminStatus.textContent = 'Admin: on';
  setEditable(true);
}

function toggleAdmin() {
  if (document.body.classList.contains('admin')) exitAdmin();
  else enterAdmin();
}

adminSave && adminSave.addEventListener('click', saveAll);
adminExit && adminExit.addEventListener('click', exitAdmin);

// Media (photo/video) admin is a separate, Supabase-auth-gated capability
// layered on top of this text-editing admin mode (see gallery.js).
const mediaAdminBtn = document.getElementById('media-admin-btn');
const adminSignout = document.getElementById('admin-signout');
mediaAdminBtn && mediaAdminBtn.addEventListener('click', () => {
  window.__openMediaAdmin && window.__openMediaAdmin();
});
adminSignout && adminSignout.addEventListener('click', () => {
  window.__gallerySignOut && window.__gallerySignOut();
});

// Load saved content
function loadSaved() {
  const items = document.querySelectorAll('.editable');
  items.forEach((el) => {
    const key = el.dataset.key;
    if (!key) return;
    const v = localStorage.getItem(key);
    if (v !== null) el.innerHTML = v;
  });
}
loadSaved();

// Lazy-load images and optimize decoding on supported browsers
try {
  document.querySelectorAll('img').forEach((img) => {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  });
  document.querySelectorAll('video').forEach((v) => {
    if (!v.hasAttribute('preload')) v.setAttribute('preload', 'metadata');
  });
} catch (e) {
  // ignore
}

// Initialize after a short delay (no GSAP pin-section active)
window.addEventListener('load', () => {
  // no-op for pin-section (GSAP demo removed)
});

// Shared low-power/reduced-motion/save-data gate, reused by every GSAP-driven
// pin section (Explore, Resume, ...) so they all skip on the same conditions.
function shouldSkipHeavyAnimation() {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Keep in sync with the ?motion=1 / force-motion bypass in the <head>
  // loader — if that bypass let GSAP load, this must not immediately undo
  // it by bailing out of init anyway.
  const forceMotion = /[?&]motion=1\b/.test(location.search) || localStorage.getItem('force-motion') === '1';
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  const saveData = conn && conn.saveData;
  const slowNetwork = conn && conn.effectiveType && /2g|slow-2g/.test(conn.effectiveType);
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;
  const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  return !!((prefersReduced && !forceMotion) || saveData || slowNetwork || lowMemory || lowCores);
}

// Lenis + ScrollTrigger's scrollerProxy are page-global (one scroller), so this
// must only run once even though multiple pin sections (Explore, Resume) use it.
function setupSmoothScroll() {
  if (window.__lenisInstance || typeof Lenis === 'undefined') return window.__lenisInstance;
  // Lenis v1.x scrolls the real document by default (no virtual/proxied
  // scroller needed) — sync it with ScrollTrigger via its own recommended
  // pattern instead of the old v0.x scrollerProxy + requestAnimationFrame
  // loop, which relied on internals (lenis.scroll.instance.scroll.y,
  // lenis.update()) that no longer exist on this version.
  const lenis = new Lenis({ duration: 1.0, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
  window.__lenisInstance = lenis;
  return lenis;
}

// Exposed initializer: will be called by conditional loader if libs are available
window.initExplore = function initExplore() {
  try {
    if (shouldSkipHeavyAnimation()) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const pinInner = document.querySelector('.pin-inner');
    const panels = gsap.utils.toArray('.panel');
    const total = panels.length || 3;
    if (!pinInner || total < 2) return;

    setupSmoothScroll();

    const endDistance = () => window.innerHeight * total;
    gsap.to(pinInner, {
      xPercent: -100 * (total - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: '.pin-section',
        start: 'top top',
        end: () => `+=${endDistance()}`,
        pin: true,
        scrub: 0.8,
        anticipatePin: 1
      }
    });

    ScrollTrigger.refresh();
  } catch (e) {
    console.warn('initExplore failed', e);
  }
};

// Resume section: a fixed-viewport carousel between experience entries,
// driven directly by wheel input rather than a scroll-scrubbed pin — this
// mirrors the reference's real mechanism (read from its own bundled JS via
// DevTools/WebFetch): a raw `wheel` listener with a two-tier debounce
// (`on-wheel` short lock between ticks, `animating` lock for the duration
// of a transition), not GSAP ScrollTrigger pin/scrub/snap. The one
// deliberate deviation: the reference's page has nothing above/below the
// carousel so it just disables page scroll globally; ours has Giới thiệu +
// Kỹ năng above and a footer below, so engagement is scoped to only while
// this section fills the viewport, and released at the first/last entry so
// the surrounding page keeps scrolling normally.
window.initResume = function initResume() {
  try {
    if (shouldSkipHeavyAnimation()) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const pinSection = document.getElementById('resume-pin-section');
    const entries = Array.from(document.querySelectorAll('.resume-entry'));
    const total = entries.length;
    if (!pinSection || total < 2) return;

    const lenis = setupSmoothScroll();
    const paginationItems = document.querySelectorAll('.resume-pagination-item');
    const currentEl = document.querySelector('.resume-current');
    let activeIndex = 0;
    let engaged = false;
    let animating = false;
    let wheelLockTimer = null;

    // Text fields blur+fade in place (staggered); the visual panel does a
    // vertical push/slide instead — outgoing image slides fully off
    // (up if moving forward, down if moving back) while the incoming image
    // slides in from the opposite edge, matching the reference's actual
    // transition. The image reveal (clip-path polygon on --clip-in/--clip-out
    // driving a scale layer at transform-origin 25% 25%) is copied verbatim
    // from the reference's real computed CSS + JS, read directly from its
    // DevTools Styles panel and Sources — not guessed from video frames.
    const FIELD_SELECTOR = '.resume-entry-header, .resume-field-block, .resume-entry-desc, .resume-entry-footer';

    function setActive(index) {
      index = Math.max(0, Math.min(total - 1, index));
      if (index === activeIndex) return;
      const outgoing = entries[activeIndex];
      const incoming = entries[index];
      activeIndex = index;

      incoming.classList.add('active');
      incoming.style.zIndex = 2;
      if (outgoing) outgoing.style.zIndex = 1;

      const incomingScale = incoming.querySelector('.resume-entry-visual-scale');
      const incomingClip = incoming.querySelector('.resume-entry-visual-clip');

      if (outgoing) {
        const outgoingFields = outgoing.querySelectorAll(FIELD_SELECTOR);
        const outgoingScale = outgoing.querySelector('.resume-entry-visual-scale');
        const outgoingClip = outgoing.querySelector('.resume-entry-visual-clip');
        gsap.to(outgoingFields, {
          filter: 'blur(12px)',
          y: -18,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => {
            outgoing.classList.remove('active');
            outgoing.style.zIndex = '';
            gsap.set(outgoingFields, { clearProps: 'filter,transform,opacity' });
          }
        });
        if (outgoingClip) gsap.to(outgoingClip, { '--clip-in': '100%', duration: 1, ease: 'expo.inOut' });
        if (outgoingScale) gsap.to(outgoingScale, { '--img-scale': 0.6, duration: 1, ease: 'expo.inOut' });
      }

      gsap.fromTo(
        incoming.querySelectorAll(FIELD_SELECTOR),
        { filter: 'blur(12px)', y: 18, opacity: 0 },
        { filter: 'blur(0px)', y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.05 }
      );

      if (incomingClip) gsap.fromTo(incomingClip, { '--clip-in': '100%' }, { '--clip-in': '0%', duration: 1, ease: 'expo.inOut' });
      if (incomingScale) gsap.fromTo(incomingScale, { '--img-scale': 1.4 }, { '--img-scale': 1, duration: 1, ease: 'expo.inOut' });

      paginationItems.forEach((el, i) => el.classList.toggle('active', i === index));
      if (currentEl) currentEl.textContent = String(index + 1).padStart(2, '0');
    }

    function setEngaged(next) {
      if (next === engaged) return;
      engaged = next;
      if (lenis) { if (engaged) lenis.stop(); else lenis.start(); }
    }

    function goTo(index) {
      index = Math.max(0, Math.min(total - 1, index));
      if (index === activeIndex || animating) return;
      animating = true;
      setActive(index);
      gsap.delayedCall(1, () => { animating = false; });
    }

    // Only intercept wheel input while this section fully fills the
    // viewport. In-bounds ticks always call preventDefault (the page must
    // not scroll while cycling entries) but are silently swallowed during
    // the two locks; ticks that would go past the first/last entry release
    // engagement and are left unprevented, so the page resumes scrolling
    // into Kỹ năng (above) or the footer (below).
    function handleWheel(e) {
      if (!engaged) return;
      const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (!dir) return;
      const next = activeIndex + dir;
      if (next < 0 || next > total - 1) {
        setEngaged(false);
        return;
      }
      e.preventDefault();
      if (animating || wheelLockTimer) return;
      animating = true;
      setActive(next);
      wheelLockTimer = setTimeout(() => { wheelLockTimer = null; }, 150);
      gsap.delayedCall(1, () => { animating = false; });
    }
    window.addEventListener('wheel', handleWheel, { passive: false });

    const engageObserver = new IntersectionObserver(
      (obsEntries) => {
        obsEntries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.99) setEngaged(true);
        });
      },
      { threshold: [0.99] }
    );
    engageObserver.observe(pinSection);

    document.querySelector('.resume-arrow.prev')?.addEventListener('click', () => goTo(activeIndex - 1));
    document.querySelector('.resume-arrow.next')?.addEventListener('click', () => goTo(activeIndex + 1));
    paginationItems.forEach((el, i) => el.addEventListener('click', () => goTo(i)));
  } catch (e) {
    console.warn('initResume failed', e);
  }
};

// Year
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
