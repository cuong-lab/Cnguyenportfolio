import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // TODO: replace with the real production domain once deployed — required
  // for @astrojs/sitemap to emit absolute URLs in sitemap.xml.
  site: 'https://example.com',
  integrations: [sitemap()],
});
