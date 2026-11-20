'use strict';
// Homepage: hero, contact pills and CV, email, internship callout, stats, education,
// quick facts, news, highlights, outside note, Person schema, page weight, phone width.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { startServer, openPage, hasHorizontalOverflow, listSiteFiles } = require('./helpers.cjs');

const LINKS = {
  scholar: 'https://scholar.google.com/citations?user=TjeXLLMAAAAJ&hl=en',
  github: 'https://github.com/Nilufayeasmin299',
  linkedin: 'https://www.linkedin.com/in/nilufayeasmin299/',
  orcid: 'https://orcid.org/0009-0009-0889-1470',
};

let server;
let browser;
let page;
let noJsPage;
let phone;

before(async () => {
  server = await startServer();
  browser = await chromium.launch();
  ({ page } = await openPage(browser, server.origin, '/'));
  ({ page: noJsPage } = await openPage(browser, server.origin, '/', { javaScriptEnabled: false }));
  ({ page: phone } = await openPage(browser, server.origin, '/', { width: 390, height: 844 }));
});

after(async () => {
  await browser?.close();
  await server?.close();
});

test('hero: name, role line, affiliation, advisor and lab links', async () => {
  assert.equal(await page.locator('main h1').textContent(), 'Most Nilufa Yeasmin');
  assert.match(await page.locator('.role').textContent(), /Ph\.D\. Student in Computer Science · Geometric Computer Vision/);
  for (const href of [
    'https://www.sdstate.edu/',
    'https://ruyilian.github.io/',
    'https://www.sdstate.edu/mccomish-electrical-engineering-computer-science/3d-perception-scientific-imaging-laboratory',
  ]) {
    assert.equal(await page.locator(`.hero a[href="${href}"]`).count(), 1, href);
  }
});

test('contact pills end with the CV pill; the CV is the only PDF', async () => {
  assert.deepEqual(
    (await page.locator('.pills a').allTextContents()).map((s) => s.trim()),
    ['Email', 'Google Scholar', 'GitHub', 'LinkedIn', 'ORCID', 'CV (PDF)'],
  );
  assert.equal(await page.locator('.pills a.cv').getAttribute('href'), '/assets/cv/Most_Nilufa_Yeasmin_CV.pdf');
  assert.deepEqual(listSiteFiles().filter((f) => f.endsWith('.pdf')), ['assets/cv/Most_Nilufa_Yeasmin_CV.pdf']);
});

test('profile pills link to the four profiles', async () => {
  for (const [name, href] of Object.entries(LINKS)) {
    assert.equal(await page.locator(`.pills a[href="${href}"]`).count(), 1, name);
  }
});

test('email becomes mailto with JS and stays readable without it', async () => {
  assert.equal(await page.locator('.pills a.js-email').getAttribute('href'), 'mailto:MostNilufa.Yeasmin@jacks.sdstate.edu');
  assert.match(
    await noJsPage.locator('.pills a.js-email').textContent(),
    /MostNilufa\.Yeasmin \[at\] jacks \[dot\] sdstate \[dot\] edu/,
  );
});

test('internship callout', async () => {
  assert.match(await page.locator('.callout').textContent(), /summer 2027 research internships/);
});

test('stats 316 / 6 / 4 with source note', async () => {
  assert.deepEqual(await page.locator('.stats .stat strong').allTextContents(), ['316', '6', '4']);
  assert.match(await page.locator('.stats-note').textContent(), /Google Scholar · Nov 2026/);
});

test('education has 2 entries, quick facts has 5', async () => {
  assert.equal(await page.locator('.tl li').count(), 2);
  assert.equal(await page.locator('.qf li').count(), 5);
});

test('six newest news items in file order', async () => {
  const dates = await page.locator('.news li time').allTextContents();
  assert.deepEqual(dates.map((d) => d.trim()), ['Nov 2026', 'Sep 2026', 'Aug 2026', 'Jun 2026', 'Jan 2026', 'Dec 2025']);
  assert.match(await page.locator('.news li').nth(5).textContent(), /EnLeM/);
});

test('four highlights in order, each image with alt', async () => {
  const titles = await page.locator('.hl h3').allTextContents();
  assert.deepEqual(
    titles.map((t) => t.split(':')[0].trim()),
    ['PoseBench', 'DeepOnP', 'EnLeM', 'Advances of AI in Image-Based Computer-Aided Diagnosis'],
  );
  const alts = await page.locator('.hl img').evaluateAll((els) => els.map((e) => e.alt));
  assert.equal(alts.length, 4);
  for (const alt of alts) assert.ok(alt.length > 0);
});

test('personal section is a full-width band after the two-column layout', async () => {
  assert.equal(await page.locator('.main-col section.personal').count(), 0);
  assert.equal(await page.locator('main > section.personal').count(), 1);
  assert.equal(
    (await page.locator('section.personal h2').textContent()).replace(/\s+/g, ' ').trim(),
    'Outside the lab / Personal',
  );
});

test('personal section: four numbered facets with icons, reading instead of walks', async () => {
  assert.deepEqual(
    (await page.locator('.facets > li h3').allTextContents()).map((s) => s.trim()),
    ['Cinema', 'Cooking', 'Music', 'Reading'],
  );
  assert.deepEqual((await page.locator('.facets > li .num').allTextContents()).map((s) => s.trim()), ['01', '02', '03', '04']);
  assert.equal(await page.locator('.facets > li .art svg').count(), 4);
  const text = await page.locator('section.personal').textContent();
  assert.match(text, /bhuna khichuri/);
  assert.doesNotMatch(text, /walk/i);
});

test('Person JSON-LD with four sameAs links and SDSU affiliation', async () => {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const person = blocks.map((b) => JSON.parse(b)).find((o) => o['@type'] === 'Person');
  assert.ok(person, 'no Person JSON-LD block');
  assert.equal(person.name, 'Most Nilufa Yeasmin');
  assert.deepEqual([...person.sameAs].sort(), Object.values(LINKS).sort());
  assert.equal(person.affiliation.name, 'South Dakota State University');
});

test('homepage transfer under 600 KB', async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await context.newPage();
  const responses = [];
  p.on('response', (r) => responses.push(r));
  await p.goto(`${server.origin}/`, { waitUntil: 'load' });
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // pull in lazy images too
  await p.waitForLoadState('networkidle');
  let total = 0;
  for (const r of responses) total += (await r.body().catch(() => Buffer.alloc(0))).length;
  await context.close();
  assert.ok(total < 600 * 1024, `homepage transfer ${Math.round(total / 1024)} KB`);
});

test('no horizontal overflow at 390 and 1440', async () => {
  assert.equal(await hasHorizontalOverflow(page), false, 'overflow at 1440px');
  assert.equal(await hasHorizontalOverflow(phone), false, 'overflow at 390px');
});
