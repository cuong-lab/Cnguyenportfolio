// In-page video lightbox for the gallery. Reads the #projects-data JSON island
// (rendered by ProjectModal.astro, same order as the cards), and opens a modal
// player over the current page when a .portfolio-card is clicked — no
// navigation. Supports prev/next to switch projects without closing, keyboard
// (Esc / ArrowLeft / ArrowRight), backdrop close, scroll lock, and returns
// focus to the opening card. The player is torn down on close so audio stops.

import { getEmbedUrl, isDirectVideoFile, isEmbeddable, isShortsUrl } from '../lib/video.js';

const dataEl = document.getElementById('projects-data');
const overlay = document.getElementById('project-modal');

if (dataEl && overlay) {
  let projects = [];
  try {
    projects = JSON.parse(dataEl.textContent || '[]');
  } catch {
    projects = [];
  }

  if (projects.length) {
    const dialog = overlay.querySelector('.pm-dialog');
    const scrollEl = overlay.querySelector('[data-pm-scroll]');
    const thumbEl = overlay.querySelector('[data-pm-scrollthumb]');
    const playerEl = overlay.querySelector('[data-pm-player]');
    const titleEl = overlay.querySelector('.pm-title');
    const descEl = overlay.querySelector('[data-pm-desc]');
    const descSection = overlay.querySelector('[data-pm-desc-section]');
    const metaEl = overlay.querySelector('[data-pm-meta]');
    const metaValueEls = {
      client: overlay.querySelector('[data-pm-client]'),
      year: overlay.querySelector('[data-pm-year]'),
      role: overlay.querySelector('[data-pm-role]'),
    };
    const counterEl = overlay.querySelector('.pm-counter');
    const prevBtn = overlay.querySelector('.pm-prev');
    const nextBtn = overlay.querySelector('.pm-next');
    const closeBtn = overlay.querySelector('.pm-close');

    let current = -1;
    let lastFocused = null;
    let scrollRaf = null;

    // Drive the custom liquid scroll indicator: size + position the droplet
    // thumb from the scroll area's metrics, and only reveal it when content
    // actually overflows.
    function updateScrollbar() {
      if (!scrollEl || !thumbEl) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      if (scrollHeight <= clientHeight + 1) {
        dialog.classList.remove('is-scrollable');
        return;
      }
      dialog.classList.add('is-scrollable');
      const trackH = thumbEl.parentElement.clientHeight;
      const thumbH = Math.max(32, (clientHeight / scrollHeight) * trackH);
      const maxTop = trackH - thumbH;
      const top = maxTop * (scrollTop / (scrollHeight - clientHeight));
      thumbEl.style.height = `${thumbH}px`;
      thumbEl.style.top = `${top}px`;
    }

    function onScroll() {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        updateScrollbar();
      });
    }

    if (scrollEl) scrollEl.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      if (overlay.classList.contains('open')) updateScrollbar();
    });

    // Direct file -> <video>; YouTube/Vimeo/embed link -> iframe (URL normalized
    // by getEmbedUrl, no forced autoplay params — YouTube rejects those). The
    // viewer presses play in the embedded player.
    function toEmbed(url) {
      if (isDirectVideoFile(url)) return { type: 'file', src: url };
      if (isEmbeddable(url)) return { type: 'iframe', src: getEmbedUrl(url) };
      return { type: null };
    }

    function buildPlayer(project) {
      const embed = toEmbed(project.videoUrl);
      if (embed.type === 'iframe') {
        const iframe = document.createElement('iframe');
        iframe.src = embed.src;
        iframe.title = project.title || '';
        iframe.className = 'main-player';
        iframe.setAttribute('frameborder', '0');
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;
        return iframe;
      }
      if (embed.type === 'file') {
        const video = document.createElement('video');
        video.src = embed.src;
        if (project.cover) video.poster = project.cover;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        return video;
      }
      // No playable video: fall back to the cover image (or nothing).
      if (project.cover) {
        const img = document.createElement('img');
        img.src = project.cover;
        img.alt = project.title || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        return img;
      }
      return null;
    }

    function teardownPlayer() {
      // Clearing the node stops iframe playback and releases the <video>.
      playerEl.replaceChildren();
    }

    // Fill a metadata value and reveal its row, or hide the row when empty.
    function setMetaRow(key, value) {
      const valueEl = metaValueEls[key];
      const row = overlay.querySelector(`[data-pm-row="${key}"]`);
      const has = value !== null && value !== undefined && value !== '';
      if (valueEl && has) valueEl.textContent = String(value);
      if (row) row.hidden = !has;
    }

    function renderCurrent() {
      const project = projects[current];
      if (!project) return;

      teardownPlayer();
      // Vertical (9:16 TikTok/Reels) vs default landscape framing. A YouTube
      // Shorts URL is inherently vertical, so treat it as 9:16 even when the
      // manual aspectRatio field wasn't set — avoids black pillarbox bars.
      const isVertical = project.aspectRatio === '9:16' || isShortsUrl(project.videoUrl);
      playerEl.classList.toggle('is-vertical', isVertical);
      const node = buildPlayer(project);
      if (node) playerEl.appendChild(node);

      titleEl.textContent = project.title || '';

      // Structured Sanity fields as separated rows (each row hides when empty;
      // the whole block hides when none are set, avoiding a stray divider).
      setMetaRow('client', project.client);
      setMetaRow('year', project.year);
      setMetaRow('role', project.role);
      const hasMeta = [project.client, project.year, project.role].some(
        (v) => v !== null && v !== undefined && v !== ''
      );
      if (metaEl) metaEl.hidden = !hasMeta;

      const paras = project.desc || [];
      descEl.replaceChildren();
      paras.forEach((para) => {
        const p = document.createElement('p');
        p.textContent = para;
        descEl.appendChild(p);
      });
      if (descSection) descSection.hidden = paras.length === 0;

      // Prev/Next only when there's somewhere to go ("chỉ khi cần thiết").
      const multi = projects.length > 1;
      prevBtn.hidden = !multi;
      nextBtn.hidden = !multi;
      counterEl.hidden = !multi;
      if (multi) {
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === projects.length - 1;
        const pad = (n) => String(n).padStart(2, '0');
        counterEl.textContent = `${pad(current + 1)} / ${pad(projects.length)}`;
      }

      // New entry starts at the top; refresh the indicator after layout settles.
      if (scrollEl) scrollEl.scrollTop = 0;
      requestAnimationFrame(updateScrollbar);
    }

    function openAt(index) {
      if (index < 0 || index >= projects.length) return;
      lastFocused = document.activeElement;
      current = index;
      renderCurrent();
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (window.__lenisInstance) window.__lenisInstance.stop();
      closeBtn.focus();
    }

    function close() {
      teardownPlayer();
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (window.__lenisInstance) window.__lenisInstance.start();
      current = -1;
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    function go(delta) {
      const next = current + delta;
      if (next < 0 || next >= projects.length) return;
      current = next;
      renderCurrent();
    }

    // Card click -> open (delegated so it also covers any cards added later).
    document.addEventListener('click', (e) => {
      const card = e.target.closest && e.target.closest('.portfolio-card');
      if (!card || !card.hasAttribute('data-index')) return;
      const idx = parseInt(card.getAttribute('data-index'), 10);
      if (!Number.isNaN(idx)) openAt(idx);
    });

    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));
    closeBtn.addEventListener('click', close);

    // Backdrop click (outside the dialog) closes.
    overlay.addEventListener('click', (e) => {
      if (!dialog.contains(e.target)) close();
    });

    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'Tab') {
        // Minimal focus trap: keep Tab within the dialog's focusable controls.
        const focusable = dialog.querySelectorAll('button:not([hidden]):not([disabled])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }
}
