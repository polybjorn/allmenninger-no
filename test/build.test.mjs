import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { glue } from '../src/plugins/rehype-nbsp.mjs';

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

test('smart punctuation stays off, so the copy keeps the marks it was typed with', () => {
  // `markdown.smartypants: false` is what holds this, and Astro has deprecated
  // that flag: on the major that drops it, straight quotes and double hyphens
  // start being rewritten. The Nynorsk page is pinned against her snapshot and
  // would fail loudly. The translated pages have no snapshot, so this is what
  // catches them - the English body has two apostrophes that would turn.
  const smart = { '\u2018': 'left single quote', '\u2019': 'right single quote',
    '\u201c': 'left double quote', '\u201d': 'right double quote', '\u2026': 'ellipsis' };
  for (const page of builtPages()) {
    const html = readFileSync(page, 'utf8');
    const body = html.slice(html.indexOf('<body'));
    for (const [ch, name] of Object.entries(smart)) {
      assert.ok(!body.includes(ch), `${page}: found a ${name}, so smart punctuation is on`);
    }
  }
});

test('the no-break rules glue a dash, a price, a phone number and a size', () => {
  assert.equal(glue('samarbeidsprosjekt – dette kan'), 'samarbeidsprosjekt\u00a0– dette kan');
  assert.equal(glue('7 800 kr'), '7\u00a0800\u00a0kr');
  assert.equal(glue('480 05 508'), '480\u00a005\u00a0508');
  assert.equal(glue('20 år som rådgjevar, ca 1 måned'), '20\u00a0år som rådgjevar, ca\u00a01\u00a0måned');
  for (const text of ['2025–2026', 'over 20 års erfaring', 'ENK, starta i 2025.']) assert.equal(glue(text), text);
});

// The rehype pass reaches the markdown body only, and Page.astro glues the
// frontmatter; text written into a component reaches the page around both, so
// the built page is what this reads.
test('no line on a built page can start with a dash or split a number', () => {
  const off = [];
  for (const page of builtPages()) {
    const body = readFileSync(page, 'utf8').match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? '';
    const text = body.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '').replace(/&nbsp;|&#160;/g, '\u00a0');
    for (const run of text.split(/<[^>]*>/)) {
      if (glue(run) !== run) off.push(`${page}: "${run.trim()}"`);
    }
  }
  assert.deepEqual(off, []);
});
