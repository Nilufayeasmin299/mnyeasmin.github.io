'use strict';
// News archive by year, year-only dates, the 404 page and the gallery redirect.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { startServer, openPage, hasHorizontalOverflow, readSiteFile } = require('./helpers.cjs');

let server;
let browser;
let page;
let phone;

before(async () => {
  server = await startServer();
  browser = await chromium.launch();
  ({ page } = await openPage(browser, server.origin, '/news/'));
  ({ page: phone } = await openPage(browser, server.origin, '/news/', { width: 390, height: 844 }));
});

after(async () => {
  await browser?.close();
  await server?.close();
});

test('11 items under 2026, 2025, 2024, 2023 (5, 2, 3, 1)', async () => {
  assert.deepEqual((await page.locator('main h2').allTextContents()).map((s) => s.trim()), ['2026', '2025', '2024', '2023']);
  assert.equal(await page.locator('main li.news-item').count(), 11);
  assert.deepEqual(
    await page.locator('section.news-year').evaluateAll((s) => s.map((x) => x.querySelectorAll('li.news-item').length)),
    [5, 2, 3, 1],
  );
});

test('PLOS ONE item shows 2024, not Jan 2024', async () => {
  const t = await page.locator('li.news-item', { hasText: 'PLOS ONE' }).locator('time').textContent();
  assert.equal(t.trim(), '2024');
});

test('News is the active menu item', async () => {
  assert.equal((await page.locator('header nav.menu a[aria-current="page"]').textContent()).trim(), 'News');
});

test('unknown page returns 404 with links home and to Publications', async () => {
  const { page: missing, response } = await openPage(browser, server.origin, '/no-such-page/');
  assert.equal(response.status(), 404);
  assert.equal(await missing.locator('main a[href="/"]').count(), 1);
  assert.equal(await missing.locator('main a[href="/publications/"]').count(), 1);
  assert.equal(await missing.locator('header nav.menu').count(), 1);
});

test('/gallery.html redirects to the homepage', () => {
  assert.match(readSiteFile('gallery.html'), /url=https:\/\/mnyeasmin\.com\/"/);
});

test('no horizontal overflow at 390 and 1440', async () => {
  assert.equal(await hasHorizontalOverflow(page), false, 'overflow at 1440px');
  assert.equal(await hasHorizontalOverflow(phone), false, 'overflow at 390px');
});
