'use strict';
// Shared layout: menu, active state, footer, skip link, phone menu, local-only loading, no sideways scroll.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { startServer, openPage, hasHorizontalOverflow } = require('./helpers.cjs');

let server;
let browser;
let origin;
let page;
let requests;
let phone;

before(async () => {
  server = await startServer();
  origin = server.origin;
  browser = await chromium.launch();
  ({ page, requests } = await openPage(browser, origin, '/'));
  ({ page: phone } = await openPage(browser, origin, '/', { width: 390, height: 844, javaScriptEnabled: false }));
});

after(async () => {
  await browser?.close();
  await server?.close();
});

test('menu lists About, Publications, Research, Experience, News, CV', async () => {
  const items = await page.locator('header nav.menu a').allTextContents();
  assert.deepEqual(items.map((s) => s.trim()), ['About', 'Publications', 'Research', 'Experience', 'News', 'CV']);
  assert.equal(
    await page.locator('header nav.menu a', { hasText: 'CV' }).getAttribute('href'),
    '/assets/cv/Most_Nilufa_Yeasmin_CV.pdf',
  );
});

test('active item on / is About', async () => {
  assert.equal((await page.locator('header nav.menu a[aria-current="page"]').textContent()).trim(), 'About');
});

test('footer has copyright, last-updated month and four profile links', async () => {
  assert.match(
    await page.locator('footer').textContent(),
    /© \d{4} Most Nilufa Yeasmin · Last updated [A-Z][a-z]+ \d{4}/,
  );
  assert.equal(await page.locator('footer nav a').count(), 4);
});

test('navigation landmarks have unique names', async () => {
  const labels = await page.locator('nav').evaluateAll((navs) => navs.map((n) => n.getAttribute('aria-label')));
  assert.ok(labels.every(Boolean), `unnamed nav: ${JSON.stringify(labels)}`);
  assert.equal(new Set(labels).size, labels.length, `duplicate nav names: ${labels.join(', ')}`);
});

test('skip link targets main', async () => {
  assert.equal(await page.locator('a.skip').getAttribute('href'), '#main');
  assert.equal(await page.locator('main#main').count(), 1);
});

test('phone menu opens without JavaScript', async () => {
  await phone.locator('header details summary').click();
  assert.ok(await phone.locator('header details nav a', { hasText: 'Publications' }).isVisible());
});

test('only local requests on page load', async () => {
  assert.deepEqual(requests.filter((url) => !url.startsWith(origin) && !url.startsWith('data:')), []);
});

test('no horizontal overflow at 390 and 1440', async () => {
  assert.equal(await hasHorizontalOverflow(page), false, 'overflow at 1440px');
  assert.equal(await hasHorizontalOverflow(phone), false, 'overflow at 390px');
});
