'use strict';
// Research page: groups, project order, images, paper and code links, redirect, phone width.
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
  ({ page } = await openPage(browser, server.origin, '/research/'));
  ({ page: phone } = await openPage(browser, server.origin, '/research/', { width: 390, height: 844 }));
});

after(async () => {
  await browser?.close();
  await server?.close();
});

const project = (text) => page.locator('article.project', { hasText: text });

test('three groups in order', async () => {
  assert.deepEqual(
    (await page.locator('main h2').allTextContents()).map((s) => s.trim()),
    ['3D vision and pose estimation', 'Medical image analysis', 'Earlier work'],
  );
});

test('projects per group, in order', async () => {
  const titles = await page.locator('section.group').evaluateAll((groups) => groups.map(
    (g) => [...g.querySelectorAll('article.project h3')].map((h) => h.textContent.trim()),
  ));
  assert.deepEqual(titles, [
    ['PoseBench: Probing Pose Awareness in Visual Foundation Models',
      'DeepOnP: Outlier-Resilient Neural Solver for the Orthographic-n-Point Problem'],
    ['Retinal Vessel Segmentation with Deep Learning',
      'Advances of AI in Image-Based Computer-Aided Diagnosis: A Review'],
    ['Ensemble Learning for Phishing Website Detection',
      'COVID-19 Twitter Sentiment Analysis',
      'High Throughput Biological Sequence Analysis Using Machine Learning-Based Integrative Pipeline for Extracting Functional Annotation and Visualization',
      'Molecular Biomarker Identification Using a Network-Based Bioinformatics Approach that Links COVID-19 with Smoking'],
  ]);
});

test('retinal project renders no image; every other image has alt text', async () => {
  assert.equal(await project('Retinal Vessel').locator('img').count(), 0);
  const imgs = await page.locator('main img').evaluateAll((els) => els.map((e) => ({ src: e.getAttribute('src'), alt: e.alt })));
  assert.equal(imgs.length, 7);
  for (const img of imgs) {
    assert.ok(img.src, 'empty src');
    assert.ok(img.alt.length > 0, `missing alt for ${img.src}`);
  }
});

test('paper and code links point to the right places', async () => {
  assert.equal(await project('PoseBench').locator('a[href="https://arxiv.org/abs/2611.10347"]').count(), 1);
  assert.equal(await project('Phishing').locator('a[href="https://doi.org/10.1186/s13635-025-00219-1"]').count(), 1);
  assert.equal(
    await project('Phishing').locator('a[href="https://github.com/Nilufayeasmin299/Ensemble-Learning-for-Phishing-Websites-Detection"]').count(),
    1,
  );
  assert.equal(await project('Twitter Sentiment').locator('a[href="https://doi.org/10.3390/bdcc6020065"]').count(), 1);
  assert.equal(
    await project('Twitter Sentiment').locator(
      'a[href="https://github.com/Nilufayeasmin299/Final-Year-Complete-Project-Covid19-twitter-sentiment-analysis-using-deep-learning-methods-"]',
    ).count(),
    1,
  );
});

test('Research is the active menu item', async () => {
  assert.equal((await page.locator('header nav.menu a[aria-current="page"]').textContent()).trim(), 'Research');
});

test('/projects.html redirects to /research/', () => {
  assert.match(readSiteFile('projects.html'), /url=https:\/\/mnyeasmin\.com\/research\//);
});

test('no horizontal overflow at 390 and 1440', async () => {
  assert.equal(await hasHorizontalOverflow(page), false, 'overflow at 1440px');
  assert.equal(await hasHorizontalOverflow(phone), false, 'overflow at 390px');
});
