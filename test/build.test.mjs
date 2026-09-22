import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Invariants of the built output, as opposed to the copy (copy.test.mjs) or
// the shape of a translation (languages.test.mjs). Each one here answers a
// mutation that the other two files passed: every nav anchor could be renamed
// in both languages at once, <main> could be deleted out from under the skip
// link, and a locale could be linked in the header with no page behind it.
const builtPages = () => {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name === 'index.html') out.push(p);
    }
  };
  walk('dist');
  return out;
};

const idsIn = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

test('every fragment link lands on an element that exists', () => {
  for (const page of builtPages()) {
    const html = readFileSync(page, 'utf8');
    const ids = idsIn(html);
    for (const [, href] of html.matchAll(/href="#([^"]*)"/g)) {
      assert.ok(ids.has(href), `${page}: #${href} is linked but no element has that id`);
    }
  }
});

test('every internal link lands on a page that was built', () => {
  const base = (process.env.npm_package_config_base ?? '/allmenninger-no').replace(/\/$/, '');
  for (const page of builtPages()) {
    const html = readFileSync(page, 'utf8');
    for (const [, href] of html.matchAll(/href="(\/[^"#]*)"/g)) {
      if (!href.startsWith(`${base}/`)) continue;
      const rel = href.slice(base.length + 1);
      const target = rel.endsWith('/') || rel === '' ? join('dist', rel, 'index.html') : join('dist', rel);
      assert.ok(existsSync(target), `${page}: links ${href}, but ${target} was not built`);
    }
  }
});

test('the skip link lands on the main landmark', () => {
  for (const page of builtPages()) {
    const html = readFileSync(page, 'utf8');
    const skip = html.match(/<a[^>]*class="skip-link"[^>]*href="#([^"]+)"|<a[^>]*href="#([^"]+)"[^>]*class="skip-link"/);
    assert.ok(skip, `${page}: no skip link`);
    const target = skip[1] ?? skip[2];
    const main = html.match(/<main\b[^>]*>/g) ?? [];
    assert.equal(main.length, 1, `${page}: expected exactly one <main>, found ${main.length}`);
    assert.match(main[0], new RegExp(`id="${target}"`), `${page}: the skip link points at #${target}, which is not the <main>`);
  }
});

test('the preview flags and the base path agree with the domain', () => {
  // Going live is two edits in astro.config.mjs - `site` and `base` - and the
  // noindex meta keys off the first. Half the switch would either publish the
  // live site as noindex or point the preview at allmenninger.no.
  for (const page of builtPages()) {
    const html = readFileSync(page, 'utf8');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.ok(canonical, `${page}: no canonical URL`);
    const live = canonical.includes('allmenninger.no');
    assert.equal(/<meta name="robots" content="noindex">/.test(html), !live,
      `${page}: noindex is ${live ? 'still set' : 'missing'} for ${canonical}`);
    assert.equal(canonical.includes('/allmenninger-no/'), !live,
      `${page}: the preview base path and the domain disagree in ${canonical}`);
  }
});
