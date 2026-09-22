# allmenninger.no

Astro rebuild of [allmenninger.no](https://allmenninger.no), the site of
Allmenninger – LR Mathisen: advisory and project management for sustainable
transition, based on Vibrandsøy in Norway.

The site is one scrolling page in Nynorsk with five sections: tenester, om,
prosjekt, galleri, kontakt.

## Status

Preview, not live. The live site still runs from Netlify. This build deploys to
`polybjorn.github.io/allmenninger-no` and carries `noindex` so it never
competes with the original in search.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321/allmenninger-no
npm run build
npm run preview
```

## Structure

| Path | What |
|---|---|
| `src/content/pages/nn/home.md` | All page copy. Frontmatter holds the cards, timeline and gallery; the body is the Om prose |
| `src/i18n/locales.js` | Language registry. Nynorsk is the site; English is machinery only, no content yet |
| `src/pages/index.astro` | The page, built from the content entry |
| `src/styles/global.css` | Ported from the original site's stylesheet |
| `src/assets/` | Photographs, capped at 1600 px on the long side |

## Going live

Set `site` to `https://allmenninger.no` and drop `base` in `astro.config.mjs`.
The `noindex` meta and the skipped sitemap both key off that check, so they
resolve themselves. Point DNS at GitHub Pages and set the custom domain in the
repository's Pages settings.

## Licence

MIT for the code. The photographs and page text belong to Lene Røkke Mathisen
and are not covered by it.
