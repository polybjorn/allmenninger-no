# allmenninger.no

Astro rebuild of [allmenninger.no](https://allmenninger.no), the site of
Allmenninger – LR Mathisen: advisory and project management for sustainable
transition, based on Vibrandsøy in Norway.

The site is one scrolling page with five sections: tenester, om, prosjekt,
galleri, kontakt. Nynorsk is the source and sits at the root; English is
translated from it and sits at `/en/`.

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
| `src/content/pages/<lang>/home.md` | All page copy, one file per language. Frontmatter holds the cards, timeline and gallery; the body is the Om prose |
| `src/i18n/locales.js` | Language registry. A locale with no content file is skipped rather than built empty, and drops out of the switcher and the hreflang tags with it |
| `src/components/Page.astro` | The whole document. The routes only choose which language to hand it |
| `src/layouts/Layout.astro` | Head, CSP and the hreflang set |
| `src/pages/index.astro` | Default locale at the root |
| `src/pages/[lang]/index.astro` | Every other language under its own prefix |
| `src/styles/global.css` | Ported from the original site's stylesheet, with the repairs marked where they appear |
| `src/assets/` | Photographs, capped at 1600 px on the long side |
| `test/` | Copy fidelity, translation shape and built-output invariants |

## Going live

Set `site` to `https://allmenninger.no` and drop `base` in `astro.config.mjs`.
The `noindex` meta and the skipped sitemap both key off that check, so they
resolve themselves, and `test/build.test.mjs` fails if only one of the two
edits is made. Point DNS at GitHub Pages and set the custom domain in the
repository's Pages settings.

## Licence

MIT for the code. The photographs and page text belong to Lene Røkke Mathisen
and are not covered by it.
