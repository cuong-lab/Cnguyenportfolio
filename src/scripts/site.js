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

// Absolute 3s Countdown Smart Header
let isHeaderHovered = false;
let autoHideTimer = null;
let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
let ticking = false;
let autoHiddenThisScrollUp = false;

function start3sAutoHideTimer() {
  clearTimeout(autoHideTimer);
  autoHideTimer = setTimeout(() => {
    if (!isHeaderHovered && window.scrollY > 50) {
      header?.classList.add('hidden');
      autoHiddenThisScrollUp = true; // Lock out further popups during same upward scroll gesture
    }
  }, 3000);
}

if (header) {
  header.addEventListener('mouseenter', () => {
    isHeaderHovered = true;
    clearTimeout(autoHideTimer);
    header.classList.remove('hidden');
    autoHiddenThisScrollUp = false;
  });

  header.addEventListener('mouseleave', () => {
    isHeaderHovered = false;
    if (window.scrollY > 50 && !header.classList.contains('hidden')) {
      start3sAutoHideTimer();
    }
  });
}

function onScroll() {
  if (!header) return;

  if (!ticking) {
    ticking = true;
    window.requestAnimationFrame(() => {
      const currentScrollY = Math.max(0, window.scrollY);
      const scrollDelta = currentScrollY - lastScrollY;

      // Ignore micro subpixel scroll jitter (< 2px)
      if (Math.abs(scrollDelta) < 2) {
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      // 1. Top of page (scrollY <= 50px): Always show header & reset flags
      if (currentScrollY <= 50) {
        clearTimeout(autoHideTimer);
        autoHiddenThisScrollUp = false;
        header.classList.remove('hidden');
      } else {
        // 2. Scroll DOWN (> 2px): Hide immediately & reset lockout
        if (scrollDelta > 2) {
          clearTimeout(autoHideTimer);
          autoHiddenThisScrollUp = false;
          if (!isHeaderHovered) {
            header.classList.add('hidden');
          }
        }
        // 3. Scroll UP (< -2px): Open ONLY if hidden & not locked out, start absolute 3s timer ONCE
        else if (scrollDelta < -2) {
          if (header.classList.contains('hidden') && !autoHiddenThisScrollUp) {
            header.classList.remove('hidden');
            start3sAutoHideTimer();
          }
        }
      }

      lastScrollY = currentScrollY;
      ticking = false;
    });
  }
}

// Guarantee ONLY ONE scroll listener is attached
if (window.__headerScrollHandler) {
  window.removeEventListener('scroll', window.__headerScrollHandler);
}
window.__headerScrollHandler = onScroll;
window.addEventListener('scroll', onScroll, { passive: true });

// Nav pill sliding indicator. The active tab is decided server-side in
// SiteHeader.astro (from Astro.url.pathname) and ships as `.nav-toggle.active`,
// so here we only position the indicator under it — never re-derive it.
const navToggles = document.querySelectorAll('.nav-toggle');
const navIndicatorPill = document.querySelector('.nav-indicator-pill');
const navIndicatorGlow = document.querySelector('.nav-indicator-glow');

// Move the sliding pill/glow under a toggle WITHOUT touching the active class —
// used both to seat the indicator under the active tab and to make it follow
// the hovered tab (the eased `left`/`width` transition on .nav-indicator-pill
// is what produces the visible slide, since real tabs are separate pages).
// The pill has a fixed 100px reference width in CSS; scaleX stretches it to the
// real tab width. Keep this in sync with `.nav-indicator-pill { width: 100px }`.
const PILL_REF_WIDTH = 100;

function positionIndicator(toggle) {
  if (!toggle) {
    if (navIndicatorPill) navIndicatorPill.style.opacity = '0';
    if (navIndicatorGlow) navIndicatorGlow.style.opacity = '0';
    return;
  }
  if (navIndicatorPill) {
    navIndicatorPill.style.opacity = '1';
    navIndicatorPill.style.transform =
      `translateX(${toggle.offsetLeft}px) scaleX(${toggle.offsetWidth / PILL_REF_WIDTH})`;
  }
  if (navIndicatorGlow) {
    navIndicatorGlow.style.opacity = '1';
    navIndicatorGlow.style.transform =
      `translateX(${toggle.offsetLeft + toggle.offsetWidth / 2 - 12}px)`;
  }
}

function setActiveNavToggle(toggle) {
  navToggles.forEach((t) => t.classList.remove('active'));
  if (toggle) toggle.classList.add('active');
  positionIndicator(toggle);
}

if (navToggles.length) {
  const activeToggle = document.querySelector('.nav-toggle.active');
  if (activeToggle) {
    // Glitch fix: position the indicator under the server-rendered active tab
    // with transitions OFF on first paint, so it appears in place instead of
    // visibly sliding across from the first tab. Re-enable transitions after
    // the position has painted (double rAF) so hover/resize moves still animate.
    if (navIndicatorPill) navIndicatorPill.style.transition = 'none';
    if (navIndicatorGlow) navIndicatorGlow.style.transition = 'none';
    setActiveNavToggle(activeToggle);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (navIndicatorPill) navIndicatorPill.style.transition = '';
        if (navIndicatorGlow) navIndicatorGlow.style.transition = '';
      });
    });

    // Slide the indicator to follow the hovered tab, then ease it back to the
    // active tab when the pointer leaves the nav. `.nav-toggle.active` stays the
    // source of truth — hover never changes it, only the indicator's position.
    const navPill = document.querySelector('.nav-pill');
    navToggles.forEach((toggle) => {
      toggle.addEventListener('mouseenter', () => positionIndicator(toggle));
    });
    if (navPill) {
      navPill.addEventListener('mouseleave', () => {
        const active = document.querySelector('.nav-toggle.active');
        if (active) positionIndicator(active);
      });
    }

    // Liquid-glass ambient specular: expose the pointer position over the bar as
    // CSS vars so the .nav-pill::after sheen can follow it ("light travels around
    // the material"). Fine-pointer + non-reduced-motion only, matching the custom
    // cursor's gating — touch / reduced-motion users just get the static glass.
    const navFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    const navReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Same ?motion=1 / force-motion bypass the rest of the site uses, so the
    // effect can be verified in dev browsers (e.g. VS Code's) that misreport
    // prefers-reduced-motion with no way to override it from DevTools.
    let navForceMotion = false;
    try {
      navForceMotion = /[?&]motion=1\b/.test(location.search) || localStorage.getItem('force-motion') === '1';
    } catch (e) { /* ignore */ }
    if (navPill && navFinePointer && (!navReducedMotion || navForceMotion)) {
      let navRect = null;
      navPill.addEventListener('pointerenter', () => {
        navRect = navPill.getBoundingClientRect();
        navPill.classList.add('is-lit');
      });
      navPill.addEventListener('pointermove', (e) => {
        if (!navRect) navRect = navPill.getBoundingClientRect();
        navPill.style.setProperty('--nav-mx', (e.clientX - navRect.left) + 'px');
        navPill.style.setProperty('--nav-my', (e.clientY - navRect.top) + 'px');
      });
      navPill.addEventListener('pointerleave', () => {
        navPill.classList.remove('is-lit');
        navRect = null;
      });
    }

    window.addEventListener('resize', () => {
      const active = document.querySelector('.nav-toggle.active');
      if (active) positionIndicator(active);
    });
  }
function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

onReady(() => {
  const reveals = document.querySelectorAll('.reveal');
  
  if (isLowEndDevice || isReducedMotion) {
    // Immediately reveal all sections (no animation)
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    function createObserver() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px 100px 0px' }
      );
      reveals.forEach((el) => observer.observe(el));
    }
    createObserver();
  }

  function initStatCounters() {
    const stats = document.querySelectorAll('.stat-value');
    if (!stats.length || isReducedMotion || isLowEndDevice) return;

    const parse = (text) => {
      const m = text.match(/^(\D*)(\d+)(.*)$/s);
      return m ? { prefix: m[1], target: parseInt(m[2], 10), suffix: m[3] } : null;
    };

    stats.forEach((el) => {
      const parsed = parse((el.textContent || '').trim());
      if (!parsed) return;
      const { prefix, target, suffix } = parsed;
      let started = false;
      const run = () => {
        if (started) return;
        started = true;
        const duration = 1100;
        const start = performance.now();
        el.textContent = prefix + '0' + suffix;
        const step = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = prefix + target + suffix;
        };
        requestAnimationFrame(step);
      };
      const obs = new IntersectionObserver(
        (entries) => entries.forEach((entry) => {
          if (entry.isIntersecting) { run(); obs.disconnect(); }
        }),
        { threshold: 0.5 }
      );
      obs.observe(el);
    });
  }
  initStatCounters();
});

// Custom cursor: a small dot that follows the pointer and grows into an
// "active" ring over interactive elements. Fine-pointer devices only (never on
// touch), and skipped under reduced-motion. Uses mouseover/mouseout delegation
// so it also covers gallery cards injected later by gallery.js.
function initCustomCursor() {
  const dot = document.querySelector('.cursor-dot');
  if (!dot) return;
  const finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (!finePointer || isReducedMotion) return;

  document.body.classList.add('has-custom-cursor');
  const interactiveSel = 'a, button, input, textarea, select, label, [role="button"]';
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let raf = null;

  window.addEventListener('mousemove', (e) => {
    x = e.clientX;
    y = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = null;
    });
  }, { passive: true });

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest && e.target.closest(interactiveSel)) dot.classList.add('is-active');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest && e.target.closest(interactiveSel)) dot.classList.remove('is-active');
  });
  document.addEventListener('mouseleave', () => dot.classList.remove('is-visible'), true);
  window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) dot.classList.remove('is-visible');
  });
  window.addEventListener('mousemove', () => dot.classList.add('is-visible'), { passive: true, once: true });
}
initCustomCursor();


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

// Hidden admin shortcut: triple-tap / triple-click the logo to jump to the
// Sanity Studio dashboard at /admin. This is a *navigation* gesture only — NOT
// a revival of the removed on-page contenteditable editor (see CLAUDE.md); it
// just routes to an existing page. Because a normal single click on the logo
// must still go home, every activation is debounced within a short window: 3+
// taps route to /admin, anything less falls through to the logo's real href.
// Modified clicks (cmd/ctrl/shift/alt — i.e. open-in-new-tab) are left alone.
// Year in footer
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Kích hoạt loading overlay khi bắt đầu chuyển trang
document.addEventListener('astro:before-preparation', () => {
  const overlay = document.getElementById('page-transition-overlay');
  if (overlay) overlay.classList.add('is-active');
});

// Tắt loading overlay khi trang đã load xong
document.addEventListener('astro:page-load', () => {
  const overlay = document.getElementById('page-transition-overlay');
  if (overlay) {
    overlay.classList.add('is-active');
    setTimeout(() => overlay.classList.remove('is-active'), 150);
  }
});

// Vì header được persist qua các trang (SPA), server sẽ không ghi đè lại header.
// Chúng ta tự bắt click trên nav-toggle để làm slide mượt mà.
document.addEventListener('click', (e) => {
  const toggle = e.target.closest('.nav-toggle');
  if (toggle && typeof setActiveNavToggle === 'function') {
    setActiveNavToggle(toggle);
  }
});
