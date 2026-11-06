import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// The two findings of the site audit that live in the markup: every language
// needs a title of its own, and a link preview needs an image to show.
const pages = ['dist/index.html', 'dist/en/index.html'];
const read = (p) => readFileSync(p, 'utf8');
const meta = (html, prop) => html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`))?.[1];

test('each language has a title of its own', () => {
  const titles = pages.map((p) => read(p).match(/<title>([^<]*)<\/title>/)?.[1]);
  assert.ok(titles.every(Boolean), `missing title: ${titles}`);
  assert.equal(new Set(titles).size, titles.length, `shared title: ${titles}`);
});

test('every page names a share image that the build actually wrote', () => {
  for (const p of pages) {
    const html = read(p);
    const src = meta(html, 'og:image');
    assert.match(src ?? '', /^https:\/\/[^/]+\/.+\.jpg$/, `${p}: og:image ${src}`);
    // The absolute URL carries the site and base; the file sits under dist.
    const file = join('dist', new URL(src).pathname.replace(/^\/allmenninger-no\//, ''));
    assert.ok(existsSync(file), `${p}: ${file} not built`);
    assert.equal(meta(html, 'og:image:width'), '1200');
    assert.equal(meta(html, 'og:image:height'), '630');
    assert.ok(meta(html, 'og:image:alt'), `${p}: no og:image:alt`);
  }
});
