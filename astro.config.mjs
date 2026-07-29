import { createRequire } from 'node:module';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';
import react from '@astrojs/react';

// Read Sanity env at config time. loadEnv (empty prefix) picks up SANITY_* from
// .env even though they aren't PUBLIC_-prefixed. Falls back to a syntactically
// valid placeholder projectId so `dev`/`build` still run before the real
// project id is filled in — Sanity fetches simply fail and the frontend keeps
// falling back to the src/data samples until the id is set.
const loadedEnv = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
const projectId = process.env.SANITY_PROJECT_ID || loadedEnv.SANITY_PROJECT_ID || 'yrg3sjk0';
const dataset = process.env.SANITY_DATASET || loadedEnv.SANITY_DATASET || 'production';

// Only mount the embedded Studio when a real project id is present. A Studio
// pointed at a nonexistent project ('placeholder') can't initialize and
// white-screens on load, so when unconfigured we DON'T mount it — src/pages/
// admin/[...slug].astro serves a setup notice at /admin instead (it emits no
// route when the Studio is enabled, avoiding a collision).
const STUDIO_ENABLED = !!projectId && projectId !== 'placeholder';
if (!STUDIO_ENABLED) {
  console.warn(
    '\n⚠️  [sanity] SANITY_PROJECT_ID is empty — the embedded Studio at /admin is DISABLED\n' +
    '    (a setup notice is shown there instead of a white screen).\n' +
    '    Set SANITY_PROJECT_ID in .env and add CORS origins in the Sanity dashboard to enable it.\n'
  );
}

// Pin one API version everywhere (integration client, GROQ helpers, Vision).
export const SANITY_API_VERSION = '2025-05-01';

// --- Workaround: @sanity/astro 3.4.2 module-dedupe is broken on Windows ------
//
// @sanity/astro injects a `sanity:module-dedupe` Vite plugin that aliases the
// bare `sanity` / `styled-components` specifiers to their package DIRECTORY. It
// builds that path with:
//
//     require.resolve(`${pkg}/package.json`).replace(/\/package\.json$/, '')
//
// The regex is forward-slash only. On Windows require.resolve returns
// backslashes (...\node_modules\sanity\package.json), so nothing is stripped and
// the alias points at package.json ITSELF. Vite then serves the manifest as a
// module — `import { Studio } from 'sanity'` yields the package.json *fields*
// (name, version, ...), so Studio/defineConfig/useClient are all undefined. The
// dep optimizer dies with 284 MISSING_EXPORT errors, the sanity_structure /
// @sanity_vision chunks are never emitted, /admin 504s on them, the island's
// dynamic import fails — and the Studio renders a blank page.
//
// Upstream ships an env escape hatch for this plugin, so we disable it and
// re-apply the exact same config below with path.dirname() (platform-correct).
// Lists mirror @sanity/astro 3.4.2 — recheck them when bumping the package, and
// drop this whole block once the upstream regex is fixed.
process.env.SANITY_ASTRO_DISABLE_MODULE_DEDUPE = '1';

const require_ = createRequire(import.meta.url);
const canResolve = (spec) => {
  try {
    require_.resolve(spec);
    return true;
  } catch {
    return false;
  }
};
const pkgDir = (name) => {
  try {
    return path.dirname(require_.resolve(`${name}/package.json`));
  } catch {
    return undefined;
  }
};

// Single copy of each — multiple React/styled-components instances break the
// Studio's context and styling.
const SANITY_DEDUPE = ['react', 'react-dom', 'react-dom/client', 'styled-components', 'sanity', '@sanity/ui'].filter(canResolve);
const SANITY_OPTIMIZE_INCLUDE = ['react', 'react-dom', 'react-dom/client', 'react-compiler-runtime', 'react-is', 'styled-components', 'lodash/startCase.js'].filter(canResolve);
const SANITY_ALIAS = [
  { find: /^sanity$/, replacement: pkgDir('sanity') },
  { find: /^styled-components$/, replacement: pkgDir('styled-components') },
].filter((entry) => entry.replacement);

export default defineConfig({
  // TODO: replace with the real production domain once deployed — required
  // for @astrojs/sitemap to emit absolute URLs in sitemap.xml.
  site: 'https://example.com',
  integrations: [
    sanity({
      projectId,
      dataset,
      // Static build: don't serve stale CDN content at build time.
      useCdn: false,
      apiVersion: SANITY_API_VERSION,
      // Embedded Sanity Studio at /admin (same domain) — only when a real
      // project id is configured (see STUDIO_ENABLED above).
      ...(STUDIO_ENABLED && { studioBasePath: '/admin' }),
    }),
    react(),
    // Keep the admin Studio route out of the public sitemap.
    sitemap({ filter: (page) => !page.includes('/admin') }),
  ],
  image: {
    // Allow astro:assets <Image /> to optimize Sanity-hosted and YouTube cover images.
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  vite: {
    // Expose exactly these two non-secret values to client bundles (the
    // embedded Studio's sanity.config.ts reads them in the browser). A narrow
    // define — NOT a broad envPrefix — so a future write token that happens to
    // start with SANITY_ can never leak to the client.
    define: {
      'import.meta.env.SANITY_PROJECT_ID': JSON.stringify(projectId),
      'import.meta.env.SANITY_DATASET': JSON.stringify(dataset),
    },
    // Replaces the disabled upstream sanity:module-dedupe plugin (see the
    // Windows-path note above). The anchored regexes redirect ONLY the bare
    // specifiers — subpaths (sanity/structure, sanity/router, ...) keep
    // resolving through the package's exports map as normal.
    resolve: {
      alias: SANITY_ALIAS,
      dedupe: SANITY_DEDUPE,
    },
    optimizeDeps: {
      // Upstream's list, plus the two Studio plugins. sanity/structure and
      // @sanity/vision are imported only by sanity.config.ts, which Vite's
      // startup scanner never crawls (it reaches the config at runtime via the
      // `sanity:studio` virtual module) — without this they get discovered
      // mid-request and re-trigger the optimizer on first /admin hit.
      include: [...SANITY_OPTIMIZE_INCLUDE, 'sanity/structure', '@sanity/vision'],
    },
  },
});
