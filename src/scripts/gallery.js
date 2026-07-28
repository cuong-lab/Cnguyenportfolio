// Public media rendering for the Supabase-backed gallery. Content management
// (upload / delete / reorder) has moved out of the page into the CMS dashboard,
// so this module is now read-only: it renders the hero slot, the 3 explore
// panels and the portfolio grid, falling back to the projects.json samples
// while Supabase isn't configured yet.
import { supabase, SUPABASE_CONFIGURED } from './supabase-client.js';
import projectsData from '../data/projects.json';

const EXPLORE_SLOTS = 3;

// Locale for the local-preview fallback copy. Mirrors the SSR default (vi);
// reads <html lang> so it follows the page if that ever becomes /en/.
const LOCALE = document.documentElement.lang === 'en' ? 'en' : 'vi';
const pick = (field) => (field && (field[LOCALE] ?? field.vi)) || '';

// Local-preview placeholders, shown while Supabase isn't configured (see
// SUPABASE_CONFIGURED). Sourced from the same projects.json the rest of the
// site uses, so dev preview matches the real content model. Once Supabase has
// a real URL/key this stops rendering on its own — no manual cleanup needed.
const MOCK_PORTFOLIO = projectsData.items.map((item) => ({
  cardClass: item.cardClass || '',
  tag: pick(item.tag),
  title: pick(item.title),
  description: pick(item.description),
}));

function renderMockPortfolio(target) {
  if (!target) return;
  target.innerHTML = '';
  MOCK_PORTFOLIO.forEach((mock) => {
    const card = document.createElement('article');
    card.className = `portfolio-card ${mock.cardClass}`.trim();
    const content = document.createElement('div');
    content.className = 'card-content';
    const span = document.createElement('span');
    span.textContent = mock.tag;
    const h3 = document.createElement('h3');
    h3.textContent = mock.title;
    const p = document.createElement('p');
    p.textContent = mock.description;
    content.append(span, h3, p);
    card.appendChild(content);
    target.appendChild(card);
  });
}

function renderEmptyMessage(target, text) {
  if (!target) return;
  target.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'gallery-empty';
  p.textContent = text;
  target.appendChild(p);
}

function publicUrlFor(path) {
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}

// `preview` cards get a hover-to-play video (muted/loop/playsinline, no
// controls) that site.js plays on pointer-enter; `autoplay` is for the hero
// slot; the default is a normal controllable video.
function createMediaElement(item, { autoplay = false, preview = false } = {}) {
  if (item.media_type === 'video') {
    const video = document.createElement('video');
    video.src = publicUrlFor(item.storage_path);
    video.setAttribute('preload', 'metadata');
    video.playsInline = true;
    if (autoplay) {
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
    } else if (preview) {
      video.muted = true;
      video.loop = true;
    } else {
      video.controls = true;
    }
    return video;
  }
  const img = document.createElement('img');
  img.src = publicUrlFor(item.storage_path);
  img.loading = 'lazy';
  img.decoding = 'async';
  img.alt = item.title || '';
  return img;
}

async function fetchCategory(category) {
  // Fail fast instead of waiting on a real network request (DNS lookup on
  // the placeholder your-project-ref.supabase.co domain) to time out — that
  // wait was the actual cause of pages feeling slow to load before Supabase
  // is configured for real.
  if (!SUPABASE_CONFIGURED) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('media_items')
    .select('*')
    .eq('category', category)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

// ---------- Portfolio (full gallery at /portfolio/, read-only) ----------

const portfolioGrid = document.getElementById('portfolio-grid');

function createPortfolioCard(item) {
  const card = document.createElement('article');
  card.className = 'portfolio-card';
  card.dataset.project = item.id || '';

  const media = createMediaElement(item, { preview: true });
  media.className = 'portfolio-card-media';
  card.appendChild(media);

  const content = document.createElement('div');
  content.className = 'card-content';
  if (item.title) {
    const h3 = document.createElement('h3');
    h3.textContent = item.title;
    content.appendChild(h3);
  }
  if (item.description) {
    const p = document.createElement('p');
    p.textContent = item.description;
    content.appendChild(p);
  }
  card.appendChild(content);

  return card;
}

async function loadPortfolio() {
  if (!portfolioGrid) return;
  let items;
  try {
    items = await fetchCategory('portfolio');
  } catch (e) {
    console.warn('Portfolio fetch failed', e);
    if (!SUPABASE_CONFIGURED) {
      renderMockPortfolio(portfolioGrid);
      return;
    }
    renderEmptyMessage(portfolioGrid, 'Không thể tải nội dung, vui lòng thử lại sau.');
    return;
  }
  portfolioGrid.innerHTML = '';
  if (items.length === 0) {
    renderEmptyMessage(portfolioGrid, 'Chưa có dự án nào.');
    return;
  }
  items.forEach((item) => portfolioGrid.appendChild(createPortfolioCard(item)));
}

// ---------- Hero (single slot) ----------

const heroMedia = document.getElementById('hero-media');

async function loadHero() {
  if (!heroMedia) return;
  let heroItem = null;
  try {
    const items = await fetchCategory('hero');
    heroItem = items[0] || null;
  } catch (e) {
    console.warn('Hero fetch failed', e);
  }
  heroMedia.innerHTML = '';
  if (heroItem) heroMedia.appendChild(createMediaElement(heroItem, { autoplay: true }));
}

// ---------- Explore (3 fixed slots) ----------

function renderExploreSlot(slotIndex, item) {
  const panel = document.querySelector(`.panel-${slotIndex + 1}`);
  if (!panel || !item) return;

  let content = panel.querySelector('.panel-content');
  if (!content) {
    content = document.createElement('div');
    content.className = 'panel-content';
    panel.insertBefore(content, panel.firstChild);
  }
  content.innerHTML = '';
  const media = createMediaElement(item, { preview: true });
  media.className = 'panel-media';
  content.appendChild(media);
  if (item.title) {
    const h3 = document.createElement('h3');
    h3.textContent = item.title;
    content.appendChild(h3);
  }
  if (item.description) {
    const p = document.createElement('p');
    p.textContent = item.description;
    content.appendChild(p);
  }
}

async function loadExplore() {
  if (!document.querySelector('.panel-1')) return;
  let items = [];
  try {
    items = await fetchCategory('explore');
  } catch (e) {
    console.warn('Explore fetch failed', e);
    return;
  }
  items.slice(0, EXPLORE_SLOTS).forEach((item) => {
    const slot = Math.min(item.sort_order, EXPLORE_SLOTS - 1);
    renderExploreSlot(slot, item);
  });
}

// ---------- Init ----------

loadPortfolio();
loadHero();
loadExplore();
