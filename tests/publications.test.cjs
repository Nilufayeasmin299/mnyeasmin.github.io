'use strict';
// Publications page: sections, author bolding, statuses, links, BibTeX toggle/copy, redirect, phone width.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { startServer, openPage, hasHorizontalOverflow, readSiteFile } = require('./helpers.cjs');

const ENLEM_BIBTEX = `@article{enlem2025,
  title = {EnLeM: An Ensemble Learning-based Model for Detecting Phishing Websites},
  author = {Most Nilufa Yeasmin and Md Abu Rumman Refat and Bikash Chandra Singh and Zulfikar Alom and Zeyar Aung and Mohammad Abdul Azim},
  journal = {EURASIP Journal on Information Security},
  year = {2025},
  doi = {10.1186/s13635-025-00219-1}
}`;

const ISPCC_BIBTEX = `@inproceedings{ispcc2021,
  title = {A Comparative Analysis of Early-Stage Diabetes Prediction Using Machine Learning and Deep Learning Approach},
  author = {Md Abu Rumman Refat and Md Al Amin and Chetna Kaushal and Most Nilufa Yeasmin and Md Khairul Islam},
  booktitle = {6th International Conference on Signal Processing, Computing and Control (ISPCC)},
  pages = {654--659},
  year = {2021},
  doi = {10.1109/ISPCC53510.2021.9609364}
}`;

const POSEBENCH_BIBTEX = `@misc{posebench2026,
  title = {PoseBench: Probing Pose Awareness in Visual Foundation Models},
  author = {Most Nilufa Yeasmin and Draix Wyatt and Ruyi Lian},
  year = {2026},
  eprint = {2611.10347},
  archivePrefix = {arXiv}
}`;

const DOIS = [
  '10.1186/s13635-025-00219-1', '10.1016/j.array.2024.100357', '10.12688/f1000research.144871.1',
  '10.1177/11779322231186481', '10.3390/bdcc6020065', '10.1109/ICCIT57492.2022.10055421',
  '10.1109/ICCIT57492.2022.10054918', '10.1109/ISPCC53510.2021.9609364', '10.1109/ICRITO51393.2021.9596499',
];

let server;
let browser;
let page;
let context;
let phone;

before(async () => {
  server = await startServer();
  browser = await chromium.launch();
  ({ page, context } = await openPage(browser, server.origin, '/publications/'));
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: server.origin });
  ({ page: phone } = await openPage(browser, server.origin, '/publications/', { width: 390, height: 844 }));
});

after(async () => {
  await browser?.close();
  await server?.close();
});

const entry = (p, text) => p.locator('li.pub', { hasText: text });

test('three sections with 2, 5 and 4 entries', async () => {
  assert.deepEqual(
    (await page.locator('main h2').allTextContents()).map((s) => s.trim()),
    ['Preprints and under review', 'Journal articles', 'Conference papers'],
  );
  assert.deepEqual(
    await page.locator('section.pubs').evaluateAll((s) => s.map((x) => x.querySelectorAll('li.pub').length)),
    [2, 5, 4],
  );
});

test('entries are newest first within each section', async () => {
  const ids = await page.locator('section.pubs').evaluateAll((s) => s.map((x) => [...x.querySelectorAll('li.pub')].map((l) => l.id)));
  assert.deepEqual(ids, [
    ['posebench2026', 'deeponp2026'],
    ['enlem2025', 'cadreview2024', 'f1000research2024', 'bbi2023', 'bdcc2022'],
    ['iccit2022breast', 'iccit2022idh1', 'ispcc2021', 'icrito2021'],
  ]);
});

test('owner name bold exactly once per entry', async () => {
  const counts = await page.locator('li.pub').evaluateAll((ls) => ls.map(
    (l) => [...l.querySelectorAll('strong')].filter((s) => s.textContent === 'Most Nilufa Yeasmin').length,
  ));
  assert.equal(counts.length, 11);
  for (const n of counts) assert.equal(n, 1);
});

test('DeepOnP: Under review badge, Lu Pang first, no BibTeX, anchor for the homepage card', async () => {
  const e = entry(page, 'DeepOnP');
  assert.match(await e.textContent(), /Under review/);
  assert.match((await e.locator('.authors').textContent()).trim(), /^Lu Pang, Most Nilufa Yeasmin, Ruyi Lian$/);
  assert.equal(await e.locator('.bibtex').count(), 0);
  assert.equal(await page.locator('li.pub#deeponp2026').count(), 1);
});

test('PoseBench: Preprint badge, arXiv link, Draix Wyatt', async () => {
  const e = entry(page, 'PoseBench');
  assert.match(await e.textContent(), /Preprint/);
  assert.ok((await e.locator('a[href="https://arxiv.org/abs/2611.10347"]').count()) > 0);
  assert.match(await e.textContent(), /Draix Wyatt/);
});

test('every entry with a DOI links https://doi.org/<doi>', async () => {
  for (const doi of DOIS) {
    assert.ok((await page.locator(`main a[href="https://doi.org/${doi}"]`).count()) >= 1, doi);
  }
});

test('intro links to the Google Scholar profile', async () => {
  assert.ok((await page.locator('main a[href^="https://scholar.google.com/citations?user=TjeXLLMAAAAJ"]').count()) >= 1);
});

test('BibTeX is hidden until toggled, then shows the exact entry', async () => {
  const e = entry(page, 'EnLeM');
  assert.equal(await e.locator('pre.bibtex').isVisible(), false);
  await e.locator('button.bib-toggle').click();
  assert.equal(await e.locator('pre.bibtex').isVisible(), true);
  assert.equal(await e.locator('button.bib-toggle').getAttribute('aria-expanded'), 'true');
  assert.equal((await e.locator('pre.bibtex').textContent()).trim(), ENLEM_BIBTEX);
});

test('conference and preprint BibTeX use inproceedings and misc', async () => {
  assert.equal((await entry(page, 'Early-Stage Diabetes').locator('pre.bibtex').textContent()).trim(), ISPCC_BIBTEX);
  assert.equal((await entry(page, 'PoseBench').locator('pre.bibtex').textContent()).trim(), POSEBENCH_BIBTEX);
});

test('copy button puts the BibTeX on the clipboard', async () => {
  const e = entry(page, 'EnLeM');
  if (!(await e.locator('pre.bibtex').isVisible())) await e.locator('button.bib-toggle').click();
  await e.locator('button.bib-copy').click();
  await page.waitForFunction(() => document.querySelector('#enlem2025 .bib-copy').textContent.includes('Copied'));
  assert.equal((await page.evaluate(() => navigator.clipboard.readText())).trim(), ENLEM_BIBTEX);
});

test('/publications.html redirects to /publications/', async () => {
  assert.match(readSiteFile('publications.html'), /url=https:\/\/mnyeasmin\.com\/publications\//);
});

test('no horizontal overflow at 390 and 1440, even with BibTeX open', async () => {
  assert.equal(await hasHorizontalOverflow(page), false, 'overflow at 1440px');
  await entry(phone, 'Early-Stage Diabetes').locator('button.bib-toggle').click();
  assert.equal(await hasHorizontalOverflow(phone), false, 'overflow at 390px');
});
