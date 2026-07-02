# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A static, Vietnamese-language portfolio site for a freelance filmmaker/photographer ("Cường Nguyễn Showreel"). There is no build step, bundler, or framework — it's plain HTML/CSS/JS served directly, with Supabase (via CDN ESM import, no SDK install) as the only backend. The only tooling in `package.json` is a standalone Node utility for image optimization; it is unrelated to running the site itself.

## Running the site

There is no dev server or build command. Because `gallery.js`/`supabase-client.js` are loaded as `type="module"`, opening `index.html` via `file://` will hit CORS restrictions on the module imports — serve the directory instead:

```bash
npx serve .
```

There is no lint, test, or CI setup in this repo.

## Image optimization utility

A separate Node script converts source images to responsive WebP variants:

```bash
npm install
npm run convert-images -- --input assets/images --output assets/optimized --widths 400,800,1200 --quality 80
```

- Script: [scripts/convert_images.js](scripts/convert_images.js)
- Reads all images (jpg/jpeg/png/tiff/webp) recursively from `--input`, writes resized `.webp` files plus a `-max.webp` fallback to `--output`, and emits `manifest.json` mapping each source's base name to its generated variants (see [README-optimize-images.md](README-optimize-images.md)).
- The `assets/` directories referenced here don't exist in the repo yet — this script is meant to be run once source images are added.

## Pages

- [index.html](index.html) — the main page: anchor-linked sections (`#hero`, `#showreel`, `#explore`, `#about`, `#services`, `#portfolio`, `#contact`).
- [resume/index.html](resume/index.html) — a second, separate page (own pinned-scroll section, own `initResume()` init call) that shares `../styles.css` and `../script.js` with the main page.
- The nav bar mixes same-page anchor links (scroll-spied) with cross-page links to `resume/`; `script.js` normalizes `index.html`/trailing-slash variants to tell the two apart when highlighting the active tab (see the `normalizePath` logic near the top of the nav-indicator code).

## Architecture

Styling lives entirely in [styles.css](styles.css), using CSS custom properties defined on `:root` (colors, header height, shadows) as the theming layer. Behavior is split across three JS files:

### [script.js](script.js) — shared page behavior (loaded on both `index.html` and `resume/index.html`)

Structured as several independent, defensively-coded feature blocks rather than a single app object:

1. **Header scroll behavior** — sets `--header-height` CSS var dynamically and toggles a `.scrolled` class via a rAF-throttled scroll listener.
2. **Nav scroll-spy / active tab** — highlights the current section for anchor links, or the current page for cross-page links (see Pages above).
3. **Reveal-on-scroll animations** — `IntersectionObserver` adds `.is-visible` to `.reveal` elements. Skipped entirely (all reveals shown immediately) on reduced-motion preference or detected low-power devices (checked via `navigator.deviceMemory`, `hardwareConcurrency`, and `navigator.connection`).
4. **Text admin editing** — triple-tapping the logo (`#logo`) within 700ms toggles admin mode (`enterAdmin`/`exitAdmin`) that makes all `.editable` elements `contenteditable` and persists edits to `localStorage` keyed by each element's `data-key` attribute. `loadSaved()` restores persisted content on every page load. This is a client-only, no-backend CMS — there is no server persistence. The logo is also a real nav link, so the tap handler always calls `preventDefault()` and only follows the link if a 3rd tap doesn't land within the 700ms window.
5. **Media admin gate** — the `#media-admin-btn` and `#admin-signout` buttons in the text-admin bar just delegate to `window.__openMediaAdmin` / `window.__gallerySignOut`, which are defined by `gallery.js` (see below). Text admin and media admin are separate, independently-toggled capabilities that happen to share one admin bar.
6. **Shared low-power gate** — `shouldSkipHeavyAnimation()` centralizes the reduced-motion/save-data/low-memory/low-core checks so every GSAP-driven pin section (Explore on the main page, the Resume page's own section) skips animation consistently. Keep any new heavy-animation feature wired through this same function rather than re-implementing the checks.
7. **Shared Lenis/ScrollTrigger setup** — `setupSmoothScroll()` creates a single page-global `Lenis` instance (guarded by `window.__lenisInstance`) since Lenis scrolls the real document; both pin sections reuse it rather than creating their own.
8. **`window.initExplore()`** — wires up the pinned horizontal-scroll `#explore` panels on the main page. Called by the conditional CDN loader below, only if GSAP/ScrollTrigger/Lenis loaded successfully.
9. **`window.initResume()`** — the equivalent pinned-scroll init for the Resume page, called by an analogous inline loader in `resume/index.html`'s `<head>`.
10. **Image/video lazy-loading** — adds `loading="lazy"`/`decoding="async"` to all `<img>` and `preload="metadata"` to all `<video>` at load time.

### Conditional heavy-animation loader (inline, per-page)

Both `index.html` and `resume/index.html` have their own small inline `<script>` in `<head>` (before `script.js`/`gallery.js` load) that decides whether to fetch GSAP, ScrollTrigger, and Lenis from CDNs, based on `prefers-reduced-motion`, `navigator.connection` (saveData/effectiveType), `navigator.deviceMemory`, and `navigator.hardwareConcurrency`. If loaded, it calls the matching `window.initExplore()`/`window.initResume()`. This means the pin-scroll effect silently never activates on constrained devices/networks or if the CDN scripts fail — that's intentional, not a bug. Both loaders also support a `?motion=1` query param / `localStorage.force-motion=1` escape hatch to bypass the reduced-motion gate — some dev environments (e.g. VS Code's embedded browser) misreport `prefers-reduced-motion` with no way to override it from DevTools, so this exists purely to let animation be verified locally without weakening the real accessibility gate. `shouldSkipHeavyAnimation()` in `script.js` must stay in sync with each loader's inline copy of this same check.

### [supabase-client.js](supabase-client.js) + [gallery.js](gallery.js) — media gallery (Supabase-backed, main page only)

- `supabase-client.js` imports `@supabase/supabase-js` from a CDN ESM URL (no npm dependency) and exports a configured `supabase` client plus `SUPABASE_CONFIGURED` (false until the placeholder `SUPABASE_URL`/`SUPABASE_ANON_KEY` are replaced with a real project's values). The anon key is safe to commit — Supabase RLS policies on the `media_items` table and `media` storage bucket are the actual access control, not secrecy of the key.
- `gallery.js` renders three kinds of media slots against a single `media_items` table (columns include `category`, `media_type`, `storage_path`, `title`, `description`, `sort_order`) and a `media` storage bucket:
  - **Portfolio** — open-ended list (`#portfolio-grid`), admin can add/delete/reorder.
  - **Hero** — single replaceable slot (`#hero-media`).
  - **Explore** — exactly 3 fixed, independently replaceable slots (`.panel-1/2/3`), matching the pinned Explore panels driven by `initExplore()`.
  - While `SUPABASE_CONFIGURED` is false (i.e. the placeholder credentials haven't been replaced), the portfolio grid falls back to hardcoded `MOCK_PORTFOLIO` placeholder cards so the page still looks populated in local/dev preview.
  - Media-admin controls (upload/delete/reorder buttons, `.admin-only` elements) are gated behind Supabase Auth, not the triple-tap text-admin mode: `checkSessionAndMaybeEnterMediaAdmin()` checks for an existing session and shows a login form (`#admin-login`) if none exists; a successful `signInWithPassword` toggles the `media-admin` body class that reveals `.admin-only` controls in CSS.

When editing static content copy, prefer editing the `data-key`-tagged elements in `index.html`/`resume/index.html` directly rather than relying on the text-admin/localStorage editing flow, since localStorage edits are per-browser and won't affect the shipped source. Media content (hero/explore/portfolio images & video), by contrast, is meant to be managed live through the Supabase-backed gallery admin, not by hand-editing HTML.

When touching performance-sensitive code paths (scroll handlers, animation init, either CDN loader), preserve the existing low-power/reduced-motion/save-data gating pattern used throughout — it's the site's core performance strategy for low-end devices and slow networks.
