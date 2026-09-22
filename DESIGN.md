# Design

The tokens live in `src/styles/global.css` under `:root`. That file is the
source of truth; this one explains the decisions behind it and the rules that
are not obvious from reading CSS.

## Palette

Green is the ground the work happens on. The reds are the fire she uses to
manage it: Lene works in nature, and lately on controlled burning as a way of
maintaining coastal heathland.

| Token | Value | Used for |
|---|---|---|
| `--moss` | `#3f5d47` | Primary. Filled buttons, card media backdrop |
| `--moss-dark` | `#2c4433` | Headings, the contact panel, ghost button border |
| `--moss-mid` | `#4e6b52` | Section kickers, card numbers |
| `--ember` | `#a8381a` | Accent on light surfaces: eyebrow, fact headings, nav hover, timeline dots, focus ring |
| `--ember-glow` | `#e8834f` | Accent on dark surfaces: the contact CTA |
| `--ember-glow-hover` | `#f0946a` | CTA hover. Brighter, not darker: darkening drops the ink label to 4.29:1 |
| `--cream` | `#faf6ee` | Page background, card fill |
| `--paper` | `#ffffff` | Alternating section background |
| `--ink` | `#2b2b26` | Body text, and the label on `--ember-glow` |
| `--on-dark` | `#f1efe6` | Text over photographs and dark overlays |
| `--muted` | `#6b6a5f` | Secondary text |
| `--line` | `#e4ddcc` | Borders and rules |

### The accent has two forms

This is the rule to get right. `--ember` is dark, which is what makes it work
as text and as a focus ring on cream. It cannot also be a filled control on the
moss-dark contact panel: against that panel it reaches 1.64:1 and reads as a
muddy smear. `--ember-glow` is the light form for that surface.

Pick by the surface, not by which red looks nicer in isolation.

### Contrast

Every pairing the page makes clears WCAG AA. These are the ones that were
below it before and are worth not regressing:

| Pairing | Ratio |
|---|---|
| `--ember` on `--cream` (eyebrow, fact headings, nav hover) | 6.00 |
| `--moss-mid` on `--cream` (kickers, card numbers) | 5.49 |
| `--ink` on `--ember-glow` (contact CTA label) | 5.28 |
| `--ember-glow` against `--moss-dark` (CTA boundary) | 3.93 |
| `--cream` focus ring against `--moss-dark` | 9.83 |

Small text needs 4.5:1. Focus rings and control boundaries need 3:1. If you
change a colour, check the pairing rather than the colour on its own.

`--clay` and `--moss-light` were the previous accent and kicker greens. Both
failed AA and both are gone. Do not reintroduce them.

The `rgba()` values in the file - the header wash, the caption overlays, the
box shadows, the hero tint - are literal forms of a palette colour rather than
tokens. If you change a token, check whether an overlay tracks it. The hero
tint was left pointing at `--moss-light` after that colour was deleted.

A custom property does not resolve inside an SVG presentation attribute, so the
card icon's stroke is set in CSS, not as `stroke="..."` on the element.

## Type

| Token | Stack |
|---|---|
| `--font-body` | `Source Serif 4`, then Iowan Old Style, Palatino Linotype, Georgia |
| `--font-ui` | `Mulish`, then Avenir Next, Helvetica Neue, Arial |

Both faces are self-hosted from `src/assets/fonts/`, SIL OFL, licences beside
them. Vite fingerprints them and rewrites the URLs, so the base path stays
correct when the site moves to its own domain. Both are preloaded in
`Layout.astro`, with `crossorigin` - a same-origin font preload still needs it
or the browser fetches the file twice.

They are self-hosted rather than linked because the CSP is `font-src 'self'`
and because a Google Fonts link would make every visitor's browser call a third
party. The original stacks led with Iowan Old Style and Avenir Next, both
macOS-only, so every visitor not on a Mac silently got Georgia and Arial
instead. Lene was the only person seeing the design.

`--font-ui` covers headings, buttons, nav, kickers, captions and anything else
set in the sans. It is one definition used in thirteen places; do not write the
stack out again at a call site.

Sizes are not a scale. The ported stylesheet uses 0.93, 0.95 and 0.97rem for
what is effectively the same body-small role, and 1.7 / 1.9 / 2.5rem for
headings. Rationalising that is a real change to her design and has not been
made.

## Layout

- One page, five sections as anchors. `.wrap` is `max-width: 1040px` with 24px
  gutters.
- Sections are `76px 0`, alternating `--cream` and `--paper`.
- The single breakpoint is 800px. Below it the nav links wrap onto their own
  centred row and the grids collapse to one column.
- The header is sticky, so `scroll-padding-top` offsets anchor targets: 8px on
  desktop, 32px below 800px where the header is a second row taller.

## Rules that bite

**No client-side JavaScript.** The original had none and the CSP is
`script-src 'self'` with no `'unsafe-inline'`. Anything interactive has to be
CSS or it does not ship. `style-src` is `'self'` too, so no inline `style`
attributes either.

**Astro images need `height:auto`.** Astro writes `width` and `height`
attributes for CLS. They are definite dimensions, so a rule that sets `width`
alone leaves `aspect-ratio` ignored. This shipped once: the Om photograph
rendered 353x1333 instead of 353x471 and `object-fit: cover` cropped it to a
strip.

**Smart punctuation must stay off.** `markdown.smartypants: false` keeps her
straight quotes and hyphens as typed. Astro has deprecated that flag and will
drop it in a future major. Migrating it to `processor: unified({...})` needs
`@astrojs/markdown-remark` as a direct dependency, which pulls in 132 packages
for a site this size, so it has not been done. `test/build.test.mjs` fails if
smart punctuation ever turns on, which is the risk the migration was for.

**Page copy is Lene's and is pinned.** `test/copy.test.mjs` diffs the built
text against a snapshot of her 2026-09-22 site. Reordering DOM text fails it.
The Om facts are laid out below the prose visually while staying before it in
the DOM for exactly that reason.
