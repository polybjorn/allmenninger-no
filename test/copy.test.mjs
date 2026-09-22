import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The rebuild's whole point is that the copy is Lene's, unchanged. This pins
// that: the visible text of the built page against the text of the snapshot
// the copy was taken from. A rewrite that reads perfectly well still fails
// here, which is the case a human reviewer is worst at catching.
//
// Reads dist/, so it needs a build first - `pretest` does that.
// Chrome this rebuild added, which her 2026-09-22 site therefore has no text
// for. Each is dropped before the comparison rather than pardoned line by line,
// and the test below holds every one of them to still existing - otherwise an
// exclusion here would quietly cover for the element disappearing.
const ADDED_CHROME = [
  { name: 'language switcher', re: /<div class="langswitch">[\s\S]*?<\/div>/g },
  { name: 'skip link', re: /<a[^>]*class="skip-link"[^>]*>[\s\S]*?<\/a>/g },
];

const visibleText = (html) => {
  let s = ADDED_CHROME.reduce((acc, { re }) => acc.replace(re, ''), html)
    .replace(/<(style|script|svg)\b[^>]*>[\s\S]*?<\/\1>/g, '')
    .replace(/data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+/g, '');
  s = s.slice(s.indexOf('<body'));
  return s
    // Block-level tags become line breaks, everything else just goes.
    .replace(/<(h1|h2|h3|p|li|div|section|figcaption|footer|a)\b[^>]*>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&([a-z]+|#\d+);/g, (m, e) => ({
      amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    }[e] ?? m))
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
};

test('page copy matches the 2026-09-22 snapshot of allmenninger.no', () => {
  const built = visibleText(readFileSync('dist/index.html', 'utf8'));
  const original = readFileSync('test/fixtures/original-2026-09-22.txt', 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Compare line by line first: the assertion message then names the line that
  // drifted instead of printing both documents.
  const n = Math.max(built.length, original.length);
  for (let i = 0; i < n; i += 1) {
    assert.equal(built[i], original[i], `line ${i + 1} differs from the snapshot`);
  }
  assert.equal(built.length, original.length);
});

test('every excluded element still exists to be excluded', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  for (const { name, re } of ADDED_CHROME) {
    assert.match(html, re, `${name} is gone, so its exclusion now hides nothing`);
  }
});
