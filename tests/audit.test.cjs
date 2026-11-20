'use strict';
// Site-wide audit: metadata, sitemap and robots, banned strings, images, local-only loading,
// favicons and link-preview image, removed files, color contrast.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { startServer, openPage, readSiteFile, listSiteFiles, listHtmlFiles, visibleText, SITE } = require('./helpers.cjs');

const isRedirectStub = (rel) => /http-equiv="refresh"/.test(readSiteFile(rel));
const PAGES = () => listHtmlFiles().filter((f) => !isRedirectStub(f));
const URL_FOR = (rel) => (rel === 'index.html' ? '/' : `/${rel.replace(/index\.html$/, '')}`);
const attr = (html, re) => (html.match(re) || [])[1];

let server;
let browser;

before(async () => {
  server = await startServer();
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  await server?.close();
});

test('the site has the six expected pages', () => {
  assert.deepEqual(PAGES(), [
    '404.html', 'experience/index.html', 'index.html', 'news/index.html', 'publications/index.html', 'research/index.html',
  ]);
});

test('each page: unique short <title>, meta description, canonical, og:image', () => {
  const titles = [];
  for (const rel of PAGES()) {
    const html = readSiteFile(rel);
    const title = attr(html, /<title>([^<]+)<\/title>/);
    assert.ok(title, `no <title> in ${rel}`);
    assert.ok(title.length <= 70, `title longer than 70 characters in ${rel}: ${title}`);
    titles.push(title);
    assert.ok(attr(html, /<meta name="description" content="([^"]+)"/), `no description in ${rel}`);
    assert.ok(attr(html, /<link rel="canonical" href="(https:\/\/mnyeasmin\.com\/[^"]*)"/), `no canonical in ${rel}`);
    assert.equal(attr(html, /<meta property="og:image" content="([^"]+)"/), 'https://mnyeasmin.com/assets/img/og-card.png', rel);
  }
  assert.equal(new Set(titles).size, titles.length, `duplicate titles: ${titles.join(' / ')}`);
  assert.equal(attr(readSiteFile('index.html'), /<title>([^<]+)<\/title>/),
    'Most Nilufa Yeasmin | Ph.D. Student, South Dakota State University');
});

test('link-preview image is a 1200x630 PNG', () => {
  const png = fs.readFileSync(path.join(SITE, 'assets/img/og-card.png'));
  assert.equal(png.toString('ascii', 1, 4), 'PNG');
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630]);
});

test('favicons are linked from every page and exist', () => {
  for (const rel of PAGES()) {
    const html = readSiteFile(rel);
    assert.match(html, /<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml">/, rel);
    assert.match(html, /<link rel="icon" href="\/favicon-32\.png" sizes="32x32" type="image\/png">/, rel);
    assert.match(html, /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png">/, rel);
  }
  for (const f of ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png']) assert.ok(listSiteFiles().includes(f), f);
});

test('sitemap.xml lists the five pages and no redirect stubs', () => {
  const xml = readSiteFile('sitemap.xml');
  for (const u of ['/', '/publications/', '/research/', '/experience/', '/news/']) {
    assert.match(xml, new RegExp(`<loc>https://mnyeasmin\\.com${u.replace(/\//g, '\\/')}</loc>`), u);
  }
  for (const stub of ['gallery.html', 'projects.html', 'service.html', 'awards.html', '404.html']) {
    assert.doesNotMatch(xml, new RegExp(stub.replace('.', '\\.')), stub);
  }
});

test('robots.txt points to https://mnyeasmin.com/sitemap.xml', () => {
  assert.match(readSiteFile('robots.txt'), /^Sitemap: https:\/\/mnyeasmin\.com\/sitemap\.xml$/m);
});

test('forbidden strings absent site-wide', () => {
  const banned = [/—/, /605-691/, /IEEE/, /Dissertation/, /Derek/, /Waite/, /WACV/, /2024 & 2025/, /\bfoe\b/, /Zhahidul/,
    /\b(leverage|transformative|seamless|unlock|streamline|robust\w*|synergy)\b/i];
  for (const rel of PAGES()) {
    const metaText = [...readSiteFile(rel).matchAll(/<meta [^>]*content="([^"]*)"/g)].map((m) => m[1]).join(' ');
    const text = `${visibleText(rel)} ${metaText}`;
    for (const re of banned) assert.ok(!re.test(text), `${re} in ${rel}`);
  }
});

test('every img has non-empty src and alt', () => {
  for (const rel of PAGES()) {
    for (const [tag] of readSiteFile(rel).matchAll(/<img\b[^>]*>/g)) {
      assert.match(tag, /\ssrc="[^"]+"/, `${rel}: ${tag}`);
      assert.match(tag, /\salt="[^"]+"/, `${rel}: ${tag}`);
    }
  }
});

test('no request leaves localhost on any page', async () => {
  for (const rel of PAGES()) {
    const { page, requests, context } = await openPage(browser, server.origin, URL_FOR(rel));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForLoadState('networkidle');
    assert.deepEqual(requests.filter((u) => !u.startsWith(server.origin) && !u.startsWith('data:')), [], rel);
    await context.close();
  }
});

test('old styles.css and script.js are gone from _site', () => {
  const files = listSiteFiles();
  for (const f of ['styles.css', 'script.js']) assert.ok(!files.includes(f), f);
});

test('text tokens meet WCAG AA (4.5:1)', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'assets/css/main.css'), 'utf8');
  const root = css.match(/:root\s*\{([\s\S]*?)\}/)[1];
  const token = (name) => {
    const m = root.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
    assert.ok(m, `token --${name} missing`);
    return m[1];
  };
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const pairs = [
    ['text', 'card'], ['text', 'bg'], ['muted', 'card'], ['muted', 'bg'], ['accent', 'card'], ['accent', 'bg'],
    ['accent', 'accent-soft'], ['accent-ink', 'accent-soft'], ['warm', 'warm-soft'], ['warm', 'card'],
    ['green', 'green-soft'], ['green', 'card'],
  ];
  for (const [fg, bg] of pairs) {
    const r = ratio(token(fg), token(bg));
    assert.ok(r >= 4.5, `--${fg} on --${bg}: ${r.toFixed(2)}:1`);
  }
  assert.ok(ratio('#FFFFFF', token('accent')) >= 4.5, 'white on --accent');
});
