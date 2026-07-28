# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

An Astro-based, bilingual (Vietnamese-default / English) portfolio site for a freelance filmmaker/photographer ("Cường Nguyễn Showreel"), with Supabase (via CDN ESM import, no SDK install) as the media backend. Migrated from a hand-maintained plain HTML/CSS/JS site (see git history before the Astro migration commit) into a shared layout + components.

**Content is CMS-driven, not inline-edited.** The old triple-tap "live editor" (contenteditable + localStorage) and its `AdminBar` were removed. **Sanity CMS is now integrated** with an embedded Studio at `/admin` (see the Sanity section below): `project`, `service`, `resume_experience` and `site_settings` are fetched via GROQ and drive the home teasers, `/portfolio/`, `/dich-vu/`, and the resume experience carousel. When Sanity isn't configured (no `SANITY_PROJECT_ID`) or a query is empty, every getter **falls back to the typed sample JSON in `src/data/`**, so the site always builds and renders. UI chrome strings live in `src/i18n/`. Do **not** reintroduce `class="editable"` / `data-key` attributes or any on-page text editor. Content lives in Sanity (via `/admin`); the editorial copy *not* covered by the Sanity schema (hero/showreel/about/explore/contact prose) still lives in `src/data/*.json`.

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
- The `assets/` directories referenced here don't exist in the repo yet. Project cover images now come from Sanity: `src/sanity/image.js` (`urlFor`, backed by `@sanity/image-url`) generates a Sanity-CDN URL, and `ProjectCard.astro` feeds that URL to Astro's `astro:assets` `<Image />` (with `cdn.sanity.io` allow-listed in `astro.config.mjs`'s `image.remotePatterns`). For genuinely *local* imported images, `<Image />`/`<Picture />` (backed by `sharp`) is still the tool over reviving this script. All runtime/remote images get `loading="lazy"` + `decoding="async"` (in `ProjectCard.astro`, `gallery.js`, and the catch-all pass in `site.js`).

## Sanity CMS (`/admin` embedded Studio + GROQ)

- **Integration:** `@sanity/astro` + `@astrojs/react` in [astro.config.mjs](astro.config.mjs) mount an embedded Sanity Studio at `/admin` (`studioBasePath`) — but **only when a real `SANITY_PROJECT_ID` is set** (`STUDIO_ENABLED`). A Studio pointed at the `'placeholder'` fallback can't initialize and **white-screens**, so when unconfigured the `studioBasePath` is omitted and [src/pages/admin/[...slug].astro](src/pages/admin/%5B...slug%5D.astro) serves a setup notice at `/admin` instead (its `getStaticPaths` returns `[]` when the Studio is enabled, so there's no route collision). A clear `console.warn` fires at config time when unconfigured. `projectId`/`dataset` are read from `.env` (`SANITY_PROJECT_ID`, `SANITY_DATASET`) via Vite's `loadEnv`, with the `'placeholder'` fallback so `dev`/`build` run before the real id is filled in. Those two (non-secret) values are exposed to client bundles via a **narrow `vite.define`** (not a broad `envPrefix`, so a future write token starting with `SANITY_` can never leak to the browser). `/admin` is excluded from the sitemap.
- **Studio config:** [sanity.config.ts](sanity.config.ts) (project root) — `structureTool` (with `site_settings` pinned as a singleton), `visionTool`, and the schema. It reads `import.meta.env.SANITY_PROJECT_ID`/`SANITY_DATASET` (defined by the vite.define above).
- **Schemas:** [src/sanity/schemaTypes/](src/sanity/schemaTypes/) — `project` (title, slug, featured, client, year, role, coverImage+hotspot, videoHoverUrl, mainVideoUrl, gallery, block `description`), `service` (title, description, icon, order), `resume_experience` (company, role, timeframe, skills[], outcomes, description, order), `site_settings` (SEO, contact, stats — singleton). **Monolingual** (plain strings), unlike the `{ vi, en }` `src/data` fallback — a deliberate call (the schema the client specified); `api.js` collapses the bilingual fallback to `vi`.
- **Data access:** [src/sanity/api.js](src/sanity/api.js) — `getServices()`, `getProjects()`, `getFeaturedProjects()`, `getResumeExperiences()`, `getSiteSettings()`. Each runs a GROQ query through `sanity:client` and returns a **normalized, plain-string** shape (image refs already resolved to URLs, Portable Text flattened to a card excerpt); on `!CONFIGURED` / fetch error / empty result it returns the `src/data` fallback in that same shape. Pages/components consume these — they no longer call `localize()` on Sanity-backed entities (only on the remaining `src/data` prose).
- **Types:** `sanity:client` is typed via [src/env.d.ts](src/env.d.ts) (`/// <reference types="@sanity/astro/module" />`).
- **Windows workaround (`SANITY_ASTRO_DISABLE_MODULE_DEDUPE`):** `@sanity/astro` 3.4.2's built-in `sanity:module-dedupe` plugin aliases the bare `sanity` / `styled-components` specifiers to their package dir via `require.resolve(pkg + '/package.json').replace(/\/package\.json$/, '')`. That regex is forward-slash-only, so on **Windows** (backslash paths) nothing is stripped and the alias lands on `package.json` itself — Vite then serves the *manifest* as the module, making `Studio`/`defineConfig`/`useClient` undefined, crashing the dep optimizer (284 `MISSING_EXPORT`s) so the `sanity_structure`/`@sanity_vision` chunks never build, `/admin` 504s on them, and **the Studio white-screens**. [astro.config.mjs](astro.config.mjs) therefore sets upstream's `SANITY_ASTRO_DISABLE_MODULE_DEDUPE` escape hatch and re-applies the same `resolve.alias` / `resolve.dedupe` / `optimizeDeps.include` with `path.dirname()`. The dedupe/include lists mirror 3.4.2 — **recheck them when bumping `@sanity/astro`, and delete the block once the upstream regex is fixed** (it was still broken in 3.4.2, the latest at the time). `optimizeDeps.include` also adds `sanity/structure` + `@sanity/vision`, which are imported only by `sanity.config.ts` (reached at runtime through the `sanity:studio` virtual module) and so are invisible to Vite's startup scanner.
- **First-run setup:** fill `SANITY_PROJECT_ID` in `.env`, then in the Sanity dashboard add CORS origins (`http://localhost:4321` + prod URL) for authenticated requests so `/admin` can log in.

## Content model (`src/data/`) and i18n (`src/i18n/`)

- [src/data/](src/data/) holds the editorial content as typed sample JSON: `home.json`, `services.json`, `projects.json`, `about.json` (drives the Resume page), `contact.json`. [src/data/types.ts](src/data/types.ts) defines the interfaces; [src/data/index.ts](src/data/index.ts) is the typed barrel (`import { home, services, ... } from '../data'`). This is now the **fallback** source behind Sanity (see the Sanity section): `services`/`projects`/`about.experiences`/`contact` are the fallbacks for the corresponding GROQ getters, while the prose *not* modeled in Sanity (hero, showreel, explore, about copy, contact text, page meta) is still consumed directly. Every user-facing string field is `Localized` = `{ vi, en }`.
- [src/i18n/](src/i18n/) holds UI chrome/labels (nav, buttons, form labels, resume field labels, footer) in `vi.json` / `en.json`. [src/i18n/config.ts](src/i18n/config.ts) defines `locales`/`defaultLocale` (`vi`); [src/i18n/utils.ts](src/i18n/utils.ts) exports `getLocale(url)`, `useTranslations(locale)` → `t('dot.path')`, and `localize(field, locale)` for `{ vi, en }` content, plus the `Locale` type.
- **Split rule:** reusable chrome/labels → `src/i18n`; specific editorial sentences, paragraphs, lists, and page `<title>`/`description` → `src/data`. `getLocale()` currently always returns `vi` (no `/en/` routes exist yet) but already reads a leading path segment, so `/en/` routing lights up for free when added — that's the intended Part-2 follow-up, not done here.
- `gallery.js` is a plain client script, so a small handful of user-facing *runtime* strings (empty/error messages) remain hardcoded Vietnamese there rather than going through the SSR `t()` helper — de-hardcode those if/when the gallery grows a locale-aware runtime path.

## Pages and shared layout

- [src/pages/index.astro](src/pages/index.astro) — home: `#hero` (count-up stats; the first two stat numbers come from `site_settings`), `#showreel`, `#explore` (pinned), `#services` and `#portfolio` **teasers** (server-side `getServices()` + `getFeaturedProjects(3)`), `#contact` teaser. Hero/showreel/explore/contact prose stays `src/data` (localized).
- [src/pages/dich-vu/](src/pages/dich-vu/index.astro), [src/pages/portfolio/](src/pages/portfolio/index.astro), [src/pages/lien-he/](src/pages/lien-he/index.astro) — dedicated Services / Work / Contact pages (routing rule: every nav target is a real `/path/`, never a `#hash`). Services and the portfolio grid render server-side from Sanity (`getServices()` / `getProjects()`). **The portfolio page no longer loads `gallery.js`/Supabase** — it's Sanity-driven now; Supabase only backs the home hero + explore media.
- [src/pages/resume/index.astro](src/pages/resume/index.astro) — Resume: About/Skills copy from `about.json`; the pinned-scroll experience carousel (`initResume()`) is fed by `getResumeExperiences()`.
- [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) — shared shell: `<head>` (meta/title/description via props, fonts, `HeavyAnimationLoader`), background-glow divs, the custom-cursor dot, `SiteHeader`, a `<slot />`, and the footer. Sets `<html lang>` from the resolved locale. Props: `title`, `description`, `initFn` (`'initExplore' | 'initResume'`), `mediaGallery` (boolean — home only now).
- [src/components/SiteHeader.astro](src/components/SiteHeader.astro) — logo + nav-pill. Nav labels come from `t('nav.*')`; the **active tab is resolved server-side** from `Astro.url.pathname` and shipped as `.nav-toggle.active` (this fixes the indicator "glitch" where it used to start on Home and slide across after hydration — `site.js` now only positions the indicator under the already-active tab).
- [src/components/ServiceCard.astro](src/components/ServiceCard.astro) / [src/components/ProjectCard.astro](src/components/ProjectCard.astro) — presentational cards taking **already-resolved plain-string props** (title/description/… + resolved image URL) from `api.js`, not `{ item, locale }`. `ProjectCard` supports a hover-to-play `<video muted loop playsinline>` (from `videoHoverUrl`), a Sanity cover via `astro:assets` `<Image>`, or the gradient `.cardClass` placeholder (fallback data).
- [src/components/ContactForm.astro](src/components/ContactForm.astro) + [src/scripts/contact.js](src/scripts/contact.js) — the real contact form (Name/Email/Project type/Message) that replaced the old `mailto:` link. Client-side validation only; there is **no backend yet** — a valid submit shows an inline success state. Wire the real POST into `contact.js`'s `submitForm()` when an endpoint exists. Localized runtime messages are passed in via `data-msg-*` attributes.
- [src/components/HeavyAnimationLoader.astro](src/components/HeavyAnimationLoader.astro) — the conditional GSAP/ScrollTrigger/Lenis CDN loader (see below), parametrized by `initFn`.

## Architecture

Global styling lives in [src/styles/global.css](src/styles/global.css) (imported once from `BaseLayout.astro`, so Vite bundles/minifies it), using CSS custom properties defined on `:root` (colors, header height, shadows) as the theming layer. Behavior is split across three scripts under `src/scripts/`, each pulled in via a `<script>` tag with a relative `import` (not a raw `src=` path) so Astro's Vite pipeline bundles them:

### [src/scripts/site.js](src/scripts/site.js) — shared page behavior (imported by `BaseLayout.astro`, runs on both pages)

Structured as several independent, defensively-coded feature blocks rather than a single app object:

1. **Header scroll behavior** — sets `--header-height` CSS var dynamically and toggles a `.scrolled` class via a rAF-throttled scroll listener.
2. **Nav indicator positioning** — the active tab is decided server-side in `SiteHeader.astro`; `site.js` only positions the sliding pill/glow under `.nav-toggle.active`, with `transition: none` on first paint (restored after a double-rAF) so it appears in place instead of sliding in — the glitch fix. It no longer re-derives the active tab client-side.
3. **Reveal-on-scroll animations** — `IntersectionObserver` adds `.is-visible` to `.reveal` elements. Skipped entirely (all reveals shown immediately) on reduced-motion preference or detected low-power devices (checked via `navigator.deviceMemory`, `hardwareConcurrency`, and `navigator.connection`).
4. **Hero stats count-up** (`initStatCounters`) — parses each `.stat-value` (`"+50"`, `"8+"`, `"24/7"`) into prefix+number+suffix and tweens the number when it scrolls into view. Left static under the reduced-motion/low-power gate.
5. **Custom cursor** (`initCustomCursor`) — a `.cursor-dot` that follows the pointer and grows over interactive elements. Fine-pointer devices only (`pointer: fine`), never on touch, skipped under reduced-motion; adds `.has-custom-cursor` to `<body>` which hides the native cursor. State toggled via `mouseover`/`mouseout` delegation so it also covers gallery cards injected later.
6. **Hover-to-play videos** (`initHoverVideos`) — `document`-level `mouseover`/`mouseout` delegation plays/pauses `.portfolio-card video`; delegation is deliberate so it covers both static teaser cards and the Supabase cards `gallery.js` injects after this script runs.
7. **Shared low-power gate** — `shouldSkipHeavyAnimation()` centralizes the reduced-motion/save-data/low-memory/low-core checks so every GSAP-driven pin section (Explore on the home page, the Resume page's own section) skips animation consistently. Keep any new heavy-animation feature wired through this same function rather than re-implementing the checks.
8. **Shared Lenis/ScrollTrigger setup** — `setupSmoothScroll()` creates a single page-global `Lenis` instance (guarded by `window.__lenisInstance`) since Lenis scrolls the real document; both pin sections reuse it rather than creating their own.
9. **`window.initExplore()`** — wires up the pinned horizontal-scroll `#explore` panels on the home page. Called by `HeavyAnimationLoader` only if GSAP/ScrollTrigger/Lenis loaded successfully.
10. **`window.initResume()`** — the equivalent pinned-scroll init for the Resume page's experience carousel.
11. **Image/video lazy-loading** — adds `loading="lazy"`/`decoding="async"` to all `<img>` and `preload="metadata"` to all `<video>` at load time.

Text admin editing (triple-tap-logo contenteditable + localStorage) and the media-admin gate were **removed** in this refactor — the logo is now a plain nav link and there is no on-page editor.

### `HeavyAnimationLoader.astro` — conditional heavy-animation loader

Renders one inline `<script>` (via `define:vars`, so it stays a plain non-module inline script like the original) that decides whether to fetch GSAP, ScrollTrigger, and Lenis from CDNs, based on `prefers-reduced-motion`, `navigator.connection` (saveData/effectiveType), `navigator.deviceMemory`, and `navigator.hardwareConcurrency`. If loaded, it calls `window[initFn]()` where `initFn` is the prop passed from each page (`initExplore` or `initResume`). This means the pin-scroll effect silently never activates on constrained devices/networks or if the CDN scripts fail — that's intentional, not a bug. It also supports a `?motion=1` query param / `localStorage.force-motion=1` escape hatch to bypass the reduced-motion gate — some dev environments (e.g. VS Code's embedded browser) misreport `prefers-reduced-motion` with no way to override it from DevTools, so this exists purely to let animation be verified locally without weakening the real accessibility gate. `shouldSkipHeavyAnimation()` in `site.js` must stay in sync with this same check — previously that meant keeping two inline copies in sync by hand; now there's only one copy to keep in sync with.

### [src/scripts/supabase-client.js](src/scripts/supabase-client.js) + [src/scripts/gallery.js](src/scripts/gallery.js) — media gallery (Supabase-backed, home page only)

- `supabase-client.js` imports `@supabase/supabase-js` from a CDN ESM URL (no npm dependency) and exports a configured `supabase` client plus `SUPABASE_CONFIGURED`. Credentials come from `import.meta.env.PUBLIC_SUPABASE_URL`/`PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`), falling back to placeholder strings when unset — `SUPABASE_CONFIGURED` is false until real values are supplied. The anon key is safe to commit if it ever ends up hardcoded — Supabase RLS policies on the `media_items` table and `media` storage bucket are the actual access control, not secrecy of the key; the env var split is purely so dev/staging/prod can point at different Supabase projects.
- `gallery.js` is **read-only** and, since projects moved to Sanity, now only backs the **home page's Hero + Explore media** (portfolio is Sanity-driven and no longer touches Supabase). It reads the `media_items` table (`category`, `media_type`, `storage_path`, `title`, `description`, `sort_order`) + `media` storage bucket:
  - **Hero** — single slot (`#hero-media`, wired on the home page's reel card).
  - **Explore** — up to 3 fixed slots (`.panel-1/2/3`), matching the pinned Explore panels driven by `initExplore()`.
  - `gallery.js` still contains a portfolio renderer + `MOCK_PORTFOLIO` (built from `src/data/projects.json`), but nothing mounts `#portfolio-grid` for it anymore — it's dormant unless a Supabase-backed grid is reintroduced. It's imported (via `BaseLayout`'s `mediaGallery` prop) on the **home page only**.

## Integrations

- **@astrojs/sitemap** — generates `sitemap-index.xml`/`sitemap-0.xml` at build time from `astro.config.mjs`'s `site` value (with `/admin` filtered out). That `site` URL is still a placeholder (`https://example.com`) — update it to the real production domain once deployed, or the sitemap will emit wrong absolute URLs.
- **@astrojs/react** is present but exists **solely to host the embedded Sanity Studio** at `/admin` (Sanity Studio is React). The public site is still plain DOM JS — don't add React islands to page components without a concrete need. `@astrojs/partytown` remains deliberately unadopted (its worker sandboxing is incompatible with ScrollTrigger's need for direct main-thread scroll/DOM access).

When editing static content copy, edit the `src/data/*.json` files (both the `vi` and `en` sides of each `{ vi, en }` field) — not the `.astro` markup, which now only maps data onto elements. UI labels live in `src/i18n/{vi,en}.json`. Media content (hero/explore/portfolio images & video) is managed in Supabase (and, going forward, the CMS dashboard), not by hand-editing markup.

When touching performance-sensitive code paths (scroll handlers, animation init, `HeavyAnimationLoader`), preserve the existing low-power/reduced-motion/save-data gating pattern used throughout — it's the site's core performance strategy for low-end devices and slow networks.
