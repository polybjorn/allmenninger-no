// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { locales, defaultLocale } from './src/i18n/locales.js';

// Preview deployment on GitHub Pages. At launch: site back to
// 'https://allmenninger.no' and drop `base`. Preview builds also skip the
// sitemap and carry a noindex meta (Layout.astro), both keyed on this check,
// so the preview never competes with the live Netlify site.
const site = 'https://polybjorn.github.io';
const isPreview = !site.includes('allmenninger.no');

export default defineConfig({
  site,
  base: '/allmenninger-no',
  integrations: isPreview ? [] : [
    sitemap({
      i18n: {
        defaultLocale,
        locales: Object.fromEntries(locales.map((l) => [l.code, l.intl])),
      },
    }),
  ],
  markdown: {
    // Page copy is Lene's own text, kept verbatim. Leave its punctuation
    // alone rather than letting smart quotes rewrite it.
    smartypants: false,
  },
  compressHTML: true,
  vite: {
    // Astro inlines small hoisted scripts into the HTML, which the CSP in
    // Layout.astro (script-src 'self') then blocks. Keep every script an
    // external file.
    build: { assetsInlineLimit: 0 },
  },
});
