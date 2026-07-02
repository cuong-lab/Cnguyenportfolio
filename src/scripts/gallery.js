import { supabase, SUPABASE_CONFIGURED } from './supabase-client.js';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // Supabase free-tier per-file guidance
const EXPLORE_SLOTS = 3;

// Local-preview placeholders only, shown while Supabase isn't configured yet
// (see SUPABASE_CONFIGURED). Once supabase-client.js has a real URL/key,
// this stops rendering on its own — no manual cleanup needed.
const MOCK_PORTFOLIO = [
  { tag: 'Campaign', cardClass: 'card-1', title: 'Quiet Luxury', description: 'Series hình ảnh thương hiệu với tone màu muted và cảm giác sang trọng.' },
  { tag: 'Short Film', cardClass: 'card-2', title: 'After Rain', description: 'Storytelling nhẹ nhàng, lấy cảm hứng từ ánh sáng buổi chiều và nỗi nhớ.' },
  { tag: 'Editorial', cardClass: 'card-3', title: 'Golden Hour', description: 'Bộ ảnh cá nhân với phong cách cinematic và góc nhìn độc đáo.' },
];

function renderMockPortfolio(target) {
  if (!target) return;
  target.innerHTML = '';
  MOCK_PORTFOLIO.forEach((mock) => {
    const card = document.createElement('article');
    card.className = `portfolio-card ${mock.cardClass}`;
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

function mediaTypeFromFile(file) {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('image/')) return 'image';
  return null;
}

function createMediaElement(item, { autoplay = false } = {}) {
  if (item.media_type === 'video') {
    const video = document.createElement('video');
    video.src = publicUrlFor(item.storage_path);
    video.setAttribute('preload', 'metadata');
    video.playsInline = true;
    if (autoplay) { video.autoplay = true; video.muted = true; video.loop = true; }
    else video.controls = true;
    return video;
  }
  const img = document.createElement('img');
  img.src = publicUrlFor(item.storage_path);
  img.loading = 'lazy';
  img.decoding = 'async';
  img.alt = item.title || '';
  return img;
}

function iconButton(label, title, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'card-control-btn';
  btn.textContent = label;
  btn.title = title;
  btn.addEventListener('click', onClick);
  return btn;
}

async function fetchCategory(category) {
  const { data, error } = await supabase
    .from('media_items')
    .select('*')
    .eq('category', category)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

async function uploadFile(category, file) {
  const path = `${category}/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from('media').upload(path, file);
  if (error) throw error;
  return path;
}

function pickFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.addEventListener('change', () => resolve(input.files && input.files[0] ? input.files[0] : null));
    input.click();
  });
}

// ---------- Portfolio (full gallery at /portfolio/: add/delete/reorder) ----------

const portfolioGrid = document.getElementById('portfolio-grid');
const portfolioAddBtn = document.getElementById('portfolio-add-btn');
let portfolioItems = [];

function createPortfolioCardBase(item) {
  const card = document.createElement('article');
  card.className = 'portfolio-card';

  const media = createMediaElement(item);
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

function renderPortfolio() {
  if (!portfolioGrid) return;
  portfolioGrid.innerHTML = '';
  if (portfolioItems.length === 0) {
    renderEmptyMessage(portfolioGrid, 'Chưa có dự án nào.');
    return;
  }
  portfolioItems.forEach((item) => portfolioGrid.appendChild(createPortfolioCard(item)));
}

function createPortfolioCard(item) {
  const card = createPortfolioCardBase(item);

  const controls = document.createElement('div');
  controls.className = 'card-admin-controls admin-only';
  controls.append(
    iconButton('▲', 'Đưa lên trước', () => reorderPortfolio(item.id, -1)),
    iconButton('▼', 'Đưa xuống sau', () => reorderPortfolio(item.id, 1)),
    iconButton('✕', 'Xoá', () => deletePortfolioItem(item.id))
  );
  card.appendChild(controls);

  return card;
}

async function loadPortfolio() {
  if (!portfolioGrid) return;
  try {
    portfolioItems = await fetchCategory('portfolio');
  } catch (e) {
    console.warn('Portfolio fetch failed', e);
    portfolioItems = [];
    if (!SUPABASE_CONFIGURED) {
      renderMockPortfolio(portfolioGrid);
      return;
    }
    renderEmptyMessage(portfolioGrid, 'Không thể tải nội dung, vui lòng thử lại sau.');
    return;
  }
  renderPortfolio();
}

// ---------- Portfolio teaser (home page preview, read-only) ----------

const portfolioTeaserGrid = document.getElementById('portfolio-teaser-grid');
const PORTFOLIO_TEASER_LIMIT = 3;

async function loadPortfolioTeaser() {
  if (!portfolioTeaserGrid) return;
  let items;
  try {
    items = await fetchCategory('portfolio');
  } catch (e) {
    console.warn('Portfolio teaser fetch failed', e);
    if (!SUPABASE_CONFIGURED) {
      renderMockPortfolio(portfolioTeaserGrid);
      return;
    }
    renderEmptyMessage(portfolioTeaserGrid, 'Không thể tải nội dung, vui lòng thử lại sau.');
    return;
  }
  portfolioTeaserGrid.innerHTML = '';
  if (items.length === 0) {
    renderEmptyMessage(portfolioTeaserGrid, 'Chưa có dự án nào.');
    return;
  }
  items.slice(0, PORTFOLIO_TEASER_LIMIT).forEach((item) => {
    portfolioTeaserGrid.appendChild(createPortfolioCardBase(item));
  });
}

async function addPortfolioItem(file) {
  const mediaType = mediaTypeFromFile(file);
  if (!mediaType) { alert('Chỉ hỗ trợ file ảnh hoặc video.'); return; }
  if (file.size > MAX_FILE_SIZE) { alert('File quá lớn (tối đa 50MB).'); return; }

  let path;
  try {
    path = await uploadFile('portfolio', file);
  } catch (e) {
    alert('Upload thất bại: ' + e.message);
    return;
  }

  const title = window.prompt('Tiêu đề (tuỳ chọn):') || '';
  const maxSort = portfolioItems.reduce((m, it) => Math.max(m, it.sort_order), -1);
  const { data, error } = await supabase
    .from('media_items')
    .insert({ category: 'portfolio', media_type: mediaType, storage_path: path, title, sort_order: maxSort + 1 })
    .select()
    .single();
  if (error) { alert('Lưu thất bại: ' + error.message); return; }

  portfolioItems.push(data);
  renderPortfolio();
}

async function deletePortfolioItem(id) {
  if (!window.confirm('Xoá mục này?')) return;
  const item = portfolioItems.find((it) => it.id === id);
  if (!item) return;
  const { error } = await supabase.from('media_items').delete().eq('id', id);
  if (error) { alert('Xoá thất bại: ' + error.message); return; }
  await supabase.storage.from('media').remove([item.storage_path]);
  portfolioItems = portfolioItems.filter((it) => it.id !== id);
  renderPortfolio();
}

async function reorderPortfolio(id, direction) {
  const index = portfolioItems.findIndex((it) => it.id === id);
  const swapIndex = index + direction;
  if (index === -1 || swapIndex < 0 || swapIndex >= portfolioItems.length) return;

  const a = portfolioItems[index];
  const b = portfolioItems[swapIndex];
  const [aOrder, bOrder] = [a.sort_order, b.sort_order];

  const { error: e1 } = await supabase.from('media_items').update({ sort_order: bOrder }).eq('id', a.id);
  const { error: e2 } = await supabase.from('media_items').update({ sort_order: aOrder }).eq('id', b.id);
  if (e1 || e2) { alert('Sắp xếp thất bại.'); return; }

  a.sort_order = bOrder;
  b.sort_order = aOrder;
  portfolioItems.sort((x, y) => x.sort_order - y.sort_order);
  renderPortfolio();
}

portfolioAddBtn && portfolioAddBtn.addEventListener('click', async () => {
  const file = await pickFile();
  if (file) addPortfolioItem(file);
});

// ---------- Hero (single replaceable slot) ----------

const heroMedia = document.getElementById('hero-media');
const heroCard = document.querySelector('.reel-card');
let heroItem = null;

function renderHero() {
  if (!heroMedia) return;
  heroMedia.innerHTML = '';
  if (heroItem) heroMedia.appendChild(createMediaElement(heroItem, { autoplay: true }));
}

async function loadHero() {
  if (!heroMedia) return;
  try {
    const items = await fetchCategory('hero');
    heroItem = items[0] || null;
  } catch (e) {
    console.warn('Hero fetch failed', e);
    heroItem = null;
  }
  renderHero();
}

async function replaceHero() {
  const file = await pickFile();
  if (!file) return;
  const mediaType = mediaTypeFromFile(file);
  if (!mediaType) { alert('Chỉ hỗ trợ file ảnh hoặc video.'); return; }
  if (file.size > MAX_FILE_SIZE) { alert('File quá lớn (tối đa 50MB).'); return; }

  let path;
  try {
    path = await uploadFile('hero', file);
  } catch (e) {
    alert('Upload thất bại: ' + e.message);
    return;
  }

  const previous = heroItem;
  if (previous) {
    const { error } = await supabase.from('media_items')
      .update({ storage_path: path, media_type: mediaType })
      .eq('id', previous.id);
    if (error) { alert('Lưu thất bại: ' + error.message); return; }
    await supabase.storage.from('media').remove([previous.storage_path]);
    heroItem = { ...previous, storage_path: path, media_type: mediaType };
  } else {
    const { data, error } = await supabase.from('media_items')
      .insert({ category: 'hero', media_type: mediaType, storage_path: path, sort_order: 0 })
      .select()
      .single();
    if (error) { alert('Lưu thất bại: ' + error.message); return; }
    heroItem = data;
  }
  renderHero();
}

if (heroCard) {
  const btn = iconButton('Thay ảnh/video nền', 'Thay ảnh/video nền cho hero', replaceHero);
  btn.className = 'button ghost small admin-only hero-replace-btn';
  heroCard.appendChild(btn);
}

// ---------- Explore (3 fixed, independently replaceable slots) ----------

const exploreSlots = [null, null, null];

function renderExploreSlot(slotIndex, item) {
  const panel = document.querySelector(`.panel-${slotIndex + 1}`);
  if (!panel) return;

  if (item) {
    let content = panel.querySelector('.panel-content');
    if (!content) {
      content = document.createElement('div');
      content.className = 'panel-content';
      panel.insertBefore(content, panel.firstChild);
    }
    content.innerHTML = '';
    const media = createMediaElement(item);
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

  let controls = panel.querySelector('.panel-admin-controls');
  if (!controls) {
    controls = document.createElement('div');
    controls.className = 'panel-admin-controls admin-only';
    panel.appendChild(controls);
  }
  controls.innerHTML = '';
  controls.appendChild(iconButton(
    item ? 'Thay nội dung' : '+ Thêm nội dung',
    'Thay ảnh/video cho mục này',
    () => replaceExploreSlot(slotIndex)
  ));
}

async function loadExplore() {
  if (!document.querySelector('.panel-1')) return;
  try {
    const items = await fetchCategory('explore');
    items.slice(0, EXPLORE_SLOTS).forEach((item) => {
      const slot = Math.min(item.sort_order, EXPLORE_SLOTS - 1);
      exploreSlots[slot] = item;
    });
  } catch (e) {
    console.warn('Explore fetch failed', e);
  }
  exploreSlots.forEach((item, i) => renderExploreSlot(i, item));
}

async function replaceExploreSlot(slotIndex) {
  const file = await pickFile();
  if (!file) return;
  const mediaType = mediaTypeFromFile(file);
  if (!mediaType) { alert('Chỉ hỗ trợ file ảnh hoặc video.'); return; }
  if (file.size > MAX_FILE_SIZE) { alert('File quá lớn (tối đa 50MB).'); return; }

  const existing = exploreSlots[slotIndex];
  let path;
  try {
    path = await uploadFile('explore', file);
  } catch (e) {
    alert('Upload thất bại: ' + e.message);
    return;
  }

  const title = window.prompt('Tiêu đề (tuỳ chọn):', existing?.title || '') || '';

  if (existing) {
    const { error } = await supabase.from('media_items')
      .update({ storage_path: path, media_type: mediaType, title })
      .eq('id', existing.id);
    if (error) { alert('Lưu thất bại: ' + error.message); return; }
    await supabase.storage.from('media').remove([existing.storage_path]);
    exploreSlots[slotIndex] = { ...existing, storage_path: path, media_type: mediaType, title };
  } else {
    const { data, error } = await supabase.from('media_items')
      .insert({ category: 'explore', media_type: mediaType, storage_path: path, title, sort_order: slotIndex })
      .select()
      .single();
    if (error) { alert('Lưu thất bại: ' + error.message); return; }
    exploreSlots[slotIndex] = data;
  }
  renderExploreSlot(slotIndex, exploreSlots[slotIndex]);
}

// ---------- Auth / media-admin gate ----------

const adminLogin = document.getElementById('admin-login');
const adminLoginForm = document.getElementById('admin-login-form');
const adminLoginError = document.getElementById('admin-login-error');

function setMediaAdmin(enabled) {
  document.body.classList.toggle('media-admin', enabled);
}

async function checkSessionAndMaybeEnterMediaAdmin() {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    setMediaAdmin(true);
    return;
  }
  if (adminLogin) {
    adminLogin.hidden = false;
    adminLogin.setAttribute('aria-hidden', 'false');
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('admin-login-email').value;
  const password = document.getElementById('admin-login-password').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (adminLoginError) {
      adminLoginError.textContent = 'Sai email hoặc mật khẩu.';
      adminLoginError.hidden = false;
    }
    return;
  }
  if (adminLogin) {
    adminLogin.hidden = true;
    adminLogin.setAttribute('aria-hidden', 'true');
  }
  if (adminLoginError) adminLoginError.hidden = true;
  setMediaAdmin(true);
}

async function handleSignOut() {
  await supabase.auth.signOut();
  setMediaAdmin(false);
}

adminLoginForm && adminLoginForm.addEventListener('submit', handleLoginSubmit);

window.__openMediaAdmin = checkSessionAndMaybeEnterMediaAdmin;
window.__gallerySignOut = handleSignOut;

// ---------- Init ----------

loadPortfolio();
loadPortfolioTeaser();
loadHero();
loadExplore();
