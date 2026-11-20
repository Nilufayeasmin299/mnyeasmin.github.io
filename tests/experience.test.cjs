'use strict';
// Experience page: timeline order and content, service/awards/certifications/skills, corrections, redirects.
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
  ({ page } = await openPage(browser, server.origin, '/experience/'));
  ({ page: phone } = await openPage(browser, server.origin, '/experience/', { width: 390, height: 844 }));
});

after(async () => {
  await browser?.close();
  await server?.close();
});

const entry = (text) => page.locator('.timeline > li', { hasText: text });

test('timeline: 7 entries as 4 research, 2 teaching, 1 industry, each with an icon', async () => {
  assert.deepEqual(
    await page.locator('.timeline > li').evaluateAll((l) => l.map((x) => x.dataset.category)),
    ['research', 'research', 'research', 'research', 'teaching', 'teaching', 'industry'],
  );
  assert.equal(await page.locator('.timeline > li .tl-icon svg').count(), 7);
});

test('timeline roles newest first within each category', async () => {
  assert.deepEqual(
    (await page.locator('.timeline > li .tl-role').allTextContents()).map((s) => s.trim()),
    ['Graduate Research Assistant', 'Research Assistant', 'Volunteer Research Assistant', 'Undergraduate Research Student',
      'Graduate Teaching Assistant', 'Mentor', 'Industrial Trainee, Data Center'],
  );
});

test('GRA entry: advisor Dr. Ruyi Lian, 3 bullets, reworded without "robust"', async () => {
  const e = entry('Graduate Research Assistant');
  const text = await e.first().textContent();
  assert.match(text, /Dr\. Ruyi Lian/);
  assert.match(text, /accuracy analysis under Gaussian image noise/);
  assert.doesNotMatch(text, /robust/i);
  assert.equal(await e.first().locator('ul.bullets > li').count(), 3);
});

test('CVII advisor spelled Dr. Md Zahidul Islam', async () => {
  assert.match(await entry('Computer Vision and Intelligent Interfacing Lab').textContent(), /Dr\. Md Zahidul Islam/);
});

test('lists: 8 service, 4 awards (first 2018 – 2019), 3 certifications, 6 skill rows', async () => {
  assert.equal(await page.locator('section.service ul > li').count(), 8);
  assert.equal(await page.locator('section.awards ul > li').count(), 4);
  const firstAward = await page.locator('section.awards ul > li').first().textContent();
  assert.match(firstAward, /University Merit Scholarship/);
  assert.match(firstAward, /2018 – 2019/);
  assert.equal(await page.locator('section.certs ul > li').count(), 3);
  assert.equal(await page.locator('section.skills dl > div').count(), 6);
});

test('ACM membership dated Sep 2026', async () => {
  assert.match(await page.locator('section.service li', { hasText: 'Association for Computing Machinery' }).textContent(), /Sep 2026/);
});

test('Experience is the active menu item', async () => {
  assert.equal((await page.locator('header nav.menu a[aria-current="page"]').textContent()).trim(), 'Experience');
});

test('/service.html and /awards.html redirect to /experience/', () => {
  for (const file of ['service.html', 'awards.html']) {
    assert.match(readSiteFile(file), /url=https:\/\/mnyeasmin\.com\/experience\//, file);
  }
});

test('no horizontal overflow at 390 and 1440', async () => {
  assert.equal(await hasHorizontalOverflow(page), false, 'overflow at 1440px');
  assert.equal(await hasHorizontalOverflow(phone), false, 'overflow at 390px');
});
