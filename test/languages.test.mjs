import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// Languages are translations of one page, not separate pages. Nynorsk is the
// source and English is translated from it, so the two must keep the same
// shape: the same sections, the same number of cards, projects and photographs,
// and the same anchors. A half-finished translation passes the schema - every
// required field is present - and fails here.
const langs = readdirSync('src/content/pages');

const frontmatter = (lang) => {
  const raw = readFileSync(`src/content/pages/${lang}/home.md`, 'utf8');
  const body = raw.split('---')[1];
  return {
    navHrefs: [...body.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]),
    photos: [...body.matchAll(/src:\s*"([^"]+)"/g)].map((m) => m[1]),
    counts: {
      services: (body.match(/^\s+- num:/gm) ?? []).length,
      projects: (body.match(/^\s+- year:/gm) ?? []).length,
      // `- image:` starts a gallery item and nothing else; counting
      // `caption:` here would sweep up the hero's caption as a sixth.
      gallery: (body.match(/^\s+- image:/gm) ?? []).length,
    },
  };
};

test('every language has the same page shape as Nynorsk', () => {
  const nn = frontmatter('nn');
  for (const lang of langs.filter((l) => l !== 'nn')) {
    const other = frontmatter(lang);
    assert.deepEqual(other.counts, nn.counts, `${lang} has a different section count`);
    assert.deepEqual(other.navHrefs, nn.navHrefs, `${lang} points at different anchors`);
    // Photographs are the same files in the same order; only the alt text is
    // translated, so a drift here means a section moved or went missing.
    assert.deepEqual(other.photos, nn.photos, `${lang} uses different photographs`);
  }
});
