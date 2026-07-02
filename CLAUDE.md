# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

An Astro-based, Vietnamese-language portfolio site for a freelance filmmaker/photographer ("Cường Nguyễn Showreel"), with Supabase (via CDN ESM import, no SDK install) as the only backend. Migrated from a hand-maintained plain HTML/CSS/JS site (see git history before the Astro migration commit) — two pages (`/` and `/resume/`) that used to copy-paste their entire `<head>`/header/admin-bar now share one layout and a few components.

## Running the site

```bash
npm install
npm run dev       # dev server at http://localhost:4321
npm run build     # static build to dist/
npm run preview   # serve the dist/ build locally
```

Output is fully static (`astro.config.mjs` uses the default `output: 'static'`) — `dist/` can be deployed to any static host, same as before the migration. There is no lint, test, or CI setup in this repo.

## Image optimization utility

A separate Node script converts source images to responsive WebP variants — unrelated to the Astro build, kept for when real images get added:

```bash
npm run convert-images -- --input assets/images --output assets/optimized --widths 400,800,1200 --quality 80
```

- Script: [scripts/convert_images.js](scripts/convert_images.js)
- Reads all images (jpg/jpeg/png/tiff/webp) recursively from `--input`, writes resized `.webp` files plus a `-max.webp` fallback to `--output`, and emits `manifest.json` mapping each source's base name to its generated variants (see [README-optimize-images.md](README-optimize-images.md)).
- The `assets/` directories referenced here don't exist in the repo yet. Once real images exist, prefer Astro's built-in `astro:assets` (`<Image />`/`<Picture />`, backed by the `sharp` dependency already in `package.json`) over reviving this script — it does the same responsive/format optimization at build time with no separate step.

## Pages and shared layout

- [src/pages/index.astro](src/pages/index.astro) — the main page: anchor-linked sections (`#hero`, `#showreel`, `#explore`, `#services`, `#portfolio`, `#contact`).
- [src/pages/resume/index.astro](src/pages/resume/index.astro) — a second page (own pinned-scroll carousel, own `initResume()` call) at `/resume/`.
- [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) — shared by both pages: `<head>` (meta/title/description via props, fonts, `HeavyAnimationLoader`), background-glow divs, `SiteHeader`, `AdminBar`, a `<slot />` for page content, and the shared footer. Takes `title`, `description`, `page` (`'home' | 'resume'`), `initFn` (`'initExplore' | 'initResume'`), and `mediaGallery` (boolean, home page only) as props.
- [src/components/SiteHeader.astro](src/components/SiteHeader.astro) — logo + nav-pill. Takes a `page` prop and computes hrefs from it (e.g. the "Giới thiệu" tab points at `#intro` on the home page but `#about-me` on `/resume/`; "Dịch vụ"/"Dự án"/"Liên hệ" are bare anchors on the home page but `/#services`-style root-absolute links on `/resume/`) rather than duplicating two copies of the nav markup.
- [src/components/AdminBar.astro](src/components/AdminBar.astro) — text-admin bar; takes a `mediaAdmin` prop that also controls whether the Supabase login form and its extra buttons render (only true on the home page).
- [src/components/HeavyAnimationLoader.astro](src/components/HeavyAnimationLoader.astro) — the conditional GSAP/ScrollTrigger/Lenis CDN loader (see below), parametrized by `initFn` instead of existing as two near-identical inline scripts.
- The nav bar mixes same-page anchor links (scroll-spied) with cross-page links to `/resume/`; [src/scripts/site.js](src/scripts/site.js) normalizes trailing-slash variants to tell the two apart when highlighting the active tab (see the `normalizePath` logic near the top of the nav-indicator code) — this logic didn't need to change when moving off relative `../index.html`-style links to root-absolute ones.

## Architecture

Global styling lives in [src/styles/global.css](src/styles/global.css) (imported once from `BaseLayout.astro`, so Vite bundles/minifies it), using CSS custom properties defined on `:root` (colors, header height, shadows) as the theming layer. Behavior is split across three scripts under `src/scripts/`, each pulled in via a `<script>` tag with a relative `import` (not a raw `src=` path) so Astro's Vite pipeline bundles them:

### [src/scripts/site.js](src/scripts/site.js) — shared page behavior (imported by `BaseLayout.astro`, runs on both pages)

Structured as several independent, defensively-coded feature blocks rather than a single app object:

1. **Header scroll behavior** — sets `--header-height` CSS var dynamically and toggles a `.scrolled` class via a rAF-throttled scroll listener.
2. **Nav scroll-spy / active tab** — highlights the current section for anchor links, or the current page for cross-page links (see Pages above).
3. **Reveal-on-scroll animations** — `IntersectionObserver` adds `.is-visible` to `.reveal` elements. Skipped entirely (all reveals shown immediately) on reduced-motion preference or detected low-power devices (checked via `navigator.deviceMemory`, `hardwareConcurrency`, and `navigator.connection`).
4. **Text admin editing** — triple-tapping the logo (`#logo`) within 700ms toggles admin mode (`enterAdmin`/`exitAdmin`) that makes all `.editable` elements `contenteditable` and persists edits to `localStorage` keyed by each element's `data-key` attribute. `loadSaved()` restores persisted content on every page load. This is a client-only, no-backend CMS — there is no server persistence. The logo is also a real nav link, so the tap handler always calls `preventDefault()` and only follows the link if a 3rd tap doesn't land within the 700ms window.
5. **Media admin gate** — the `#media-admin-btn` and `#admin-signout` buttons (only present when `AdminBar` renders with `mediaAdmin`) delegate to `window.__openMediaAdmin` / `window.__gallerySignOut`, which are defined by `gallery.js` (see below). Text admin and media admin are separate, independently-toggled capabilities that happen to share one admin bar.
6. **Shared low-power gate** — `shouldSkipHeavyAnimation()` centralizes the reduced-motion/save-data/low-memory/low-core checks so every GSAP-driven pin section (Explore on the home page, the Resume page's own section) skips animation consistently. Keep any new heavy-animation feature wired through this same function rather than re-implementing the checks.
7. **Shared Lenis/ScrollTrigger setup** — `setupSmoothScroll()` creates a single page-global `Lenis` instance (guarded by `window.__lenisInstance`) since Lenis scrolls the real document; both pin sections reuse it rather than creating their own.
8. **`window.initExplore()`** — wires up the pinned horizontal-scroll `#explore` panels on the home page. Called by `HeavyAnimationLoader` only if GSAP/ScrollTrigger/Lenis loaded successfully.
9. **`window.initResume()`** — the equivalent pinned-scroll init for the Resume page's experience carousel.
10. **Image/video lazy-loading** — adds `loading="lazy"`/`decoding="async"` to all `<img>` and `preload="metadata"` to all `<video>` at load time.

### `HeavyAnimationLoader.astro` — conditional heavy-animation loader

Renders one inline `<script>` (via `define:vars`, so it stays a plain non-module inline script like the original) that decides whether to fetch GSAP, ScrollTrigger, and Lenis from CDNs, based on `prefers-reduced-motion`, `navigator.connection` (saveData/effectiveType), `navigator.deviceMemory`, and `navigator.hardwareConcurrency`. If loaded, it calls `window[initFn]()` where `initFn` is the prop passed from each page (`initExplore` or `initResume`). This means the pin-scroll effect silently never activates on constrained devices/networks or if the CDN scripts fail — that's intentional, not a bug. It also supports a `?motion=1` query param / `localStorage.force-motion=1` escape hatch to bypass the reduced-motion gate — some dev environments (e.g. VS Code's embedded browser) misreport `prefers-reduced-motion` with no way to override it from DevTools, so this exists purely to let animation be verified locally without weakening the real accessibility gate. `shouldSkipHeavyAnimation()` in `site.js` must stay in sync with this same check — previously that meant keeping two inline copies in sync by hand; now there's only one copy to keep in sync with.

### [src/scripts/supabase-client.js](src/scripts/supabase-client.js) + [src/scripts/gallery.js](src/scripts/gallery.js) — media gallery (Supabase-backed, home page only)

- `supabase-client.js` imports `@supabase/supabase-js` from a CDN ESM URL (no npm dependency) and exports a configured `supabase` client plus `SUPABASE_CONFIGURED`. Credentials come from `import.meta.env.PUBLIC_SUPABASE_URL`/`PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`), falling back to placeholder strings when unset — `SUPABASE_CONFIGURED` is false until real values are supplied. The anon key is safe to commit if it ever ends up hardcoded — Supabase RLS policies on the `media_items` table and `media` storage bucket are the actual access control, not secrecy of the key; the env var split is purely so dev/staging/prod can point at different Supabase projects.
- `gallery.js` renders three kinds of media slots against a single `media_items` table (columns include `category`, `media_type`, `storage_path`, `title`, `description`, `sort_order`) and a `media` storage bucket:
  - **Portfolio** — open-ended list (`#portfolio-grid`), admin can add/delete/reorder.
  - **Hero** — single replaceable slot (`#hero-media`).
  - **Explore** — exactly 3 fixed, independently replaceable slots (`.panel-1/2/3`), matching the pinned Explore panels driven by `initExplore()`.
  - While `SUPABASE_CONFIGURED` is false, the portfolio grid falls back to hardcoded `MOCK_PORTFOLIO` placeholder cards so the page still looks populated in local/dev preview.
  - Media-admin controls (upload/delete/reorder buttons, `.admin-only` elements) are gated behind Supabase Auth, not the triple-tap text-admin mode: `checkSessionAndMaybeEnterMediaAdmin()` checks for an existing session and shows a login form (`#admin-login`) if none exists; a successful `signInWithPassword` toggles the `media-admin` body class that reveals `.admin-only` controls in CSS.
  - `gallery.js` is only imported (via `BaseLayout`'s `mediaGallery` prop) on the home page — the Resume page has no media slots and doesn't load it.

## Integrations

- **@astrojs/sitemap** — generates `sitemap-index.xml`/`sitemap-0.xml` at build time from `astro.config.mjs`'s `site` value. That `site` URL is still a placeholder (`https://example.com`) — update it to the real production domain once deployed, or the sitemap will emit wrong absolute URLs.
- Framework islands (React/Vue/Svelte) and `@astrojs/partytown` were deliberately not adopted — every interactive feature here is plain DOM JS, and Partytown's worker sandboxing is incompatible with ScrollTrigger's need for direct main-thread scroll/DOM access. Don't reach for either without a concrete new requirement that needs them.

When editing static content copy, prefer editing the `data-key`-tagged elements in the `.astro` pages directly rather than relying on the text-admin/localStorage editing flow, since localStorage edits are per-browser and won't affect the shipped source. Media content (hero/explore/portfolio images & video), by contrast, is meant to be managed live through the Supabase-backed gallery admin, not by hand-editing markup.

When touching performance-sensitive code paths (scroll handlers, animation init, `HeavyAnimationLoader`), preserve the existing low-power/reduced-motion/save-data gating pattern used throughout — it's the site's core performance strategy for low-end devices and slow networks.
