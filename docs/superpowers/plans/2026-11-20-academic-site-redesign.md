# mnyeasmin.com Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild mnyeasmin.com as a Jekyll site with an Amit-style two-column homepage and data-driven Publications, Research, Experience and News pages, matching the approved design.

**Architecture:** GitHub Pages' classic Jekyll build renders every page through one shared layout and a few includes. All content lives in `_data/*.yml`, so each paper, news item and position is written once. Styling is one plain CSS file with design tokens, behavior is one small JS file, and fonts are self-hosted. Tests are Node `node:test` files that serve the built `_site/` on localhost and assert on the rendered pages with the preinstalled Playwright.

**Tech Stack:** Jekyll 3.10.0 via `github-pages` 233, Liquid, `jekyll-seo-tag` 2.9.1, `jekyll-sitemap` 1.4.0, `jekyll-redirect-from` 0.17.0, plain CSS, vanilla JS, Node 22 (`node:test`) with Playwright, Python 3 with Pillow for image preparation.

**Spec:** `docs/superpowers/specs/2026-11-20-academic-site-redesign-design.md` (approved 2026-11-20). Visual reference: `docs/superpowers/specs/2026-11-20-homepage-mockup.html` (self-contained copy of the approved mockup).

## Global Constraints

- `github-pages` gem 233 (Jekyll 3.10.0). Plugins: `jekyll-seo-tag`, `jekyll-sitemap`, `jekyll-redirect-from` only. No GitHub Actions, no custom plugins.
- `_config.yml`: `url: https://mnyeasmin.com`, `baseurl: ""`. Keep `CNAME` (`mnyeasmin.com`) unchanged.
- Repo `Nilufayeasmin299/mnyeasmin.github.io`, branch `claude/vibrant-johnson-c1iv1l`. Never push to `main`.
- No request to any host other than the site itself when a page loads (fonts, icons, scripts all local).
- Copy rules: no em dash (U+2014) anywhere in built HTML; none of the words leverage, transformative, seamless, unlock, streamline, robust, synergy; no emoji. En dashes are allowed in date ranges.
- Must never appear in built HTML: `605-691`, `IEEE`, `Dissertation`, `Derek`, `Waite`, `WACV`, `2024 & 2025`, `foe`, `Zhahidul`.
- Public email: `MostNilufa.Yeasmin@jacks.sdstate.edu`. It is shown obfuscated in HTML (`MostNilufa.Yeasmin [at] jacks [dot] sdstate [dot] edu`) and turned into a `mailto:` link by JS.
- Scholar stats: 316 citations, h-index 6, i10-index 4, labeled `Google Scholar · Nov 2026`.
- `profile.cv` is `/assets/cv/Most_Nilufa_Yeasmin_CV.pdf`, a copy of the owner's third CV (`Most_Nilufa_Yeasmin_CV_3.pdf`, checked: no phone number in text, links or metadata). The CV menu item and contact pill render only when `profile.cv` is non-empty. The first two CV files are never committed.
- Color tokens and fonts exactly as spec §7.
- Images are at most 2× display size, with `width`/`height` attributes, CSS `height:auto` and non-empty `alt`.
- Commit messages end with the session attribution lines (`Co-Authored-By: ...` and `Claude-Session: ...`) and contain no model identifier.

## Review Focus

1. **Phone width.** At 390px, pages with long titles, author lists or URLs must not scroll sideways. Every page task's tests include `hasHorizontalOverflow(page) === false` at 390px and 1440px.
2. **CV link.** The CV menu item and the homepage pill must both open the phone-free PDF, which must exist in `_site/` at exactly the linked path and be the only PDF there. Tested in Tasks 1 and 2.
3. **Year-only news.** A news item with no month (PLOS ONE reviewing, 2024) shows "2024", not "Jan 2024". Tested in Task 6.
4. **JavaScript disabled.** The email stays readable as obfuscated text, and the phone-width menu still opens, because it is a `<details>` element. Tested in Tasks 1 and 2.
5. **Images.** No `<img>` anywhere has an empty `src` or missing `alt`; a project without a figure renders no image. Tested site-wide in Task 7 and for projects in Task 4.

---

## File Structure

```
Gemfile                          github-pages 233 + webrick (local serve only)
_config.yml                      site settings, plugins, excludes
_layouts/default.html            shell: head, header, <main>, footer, script
_includes/head.html              meta, font preloads, CSS, {% seo %}, favicons
_includes/header.html            brand, desktop nav, phone <details> nav
_includes/footer.html            copyright + profile links
_includes/icon.html              inline SVG by name
_includes/email.html             obfuscated email link (JS upgrades it)
_includes/authors.html           author list, owner name in <strong>
_includes/news-item.html         one news row
_includes/highlight-card.html    homepage paper card
_includes/pub-entry.html         Publications page entry
_includes/bibtex.html            BibTeX text for one paper
_includes/person-jsonld.html     Person schema for the homepage
_data/navigation.yml             menu items
_data/profile.yml                identity, links, stats, bio pieces
_data/publications.yml           every paper (11)
_data/news.yml                   every news item (11), newest first
_data/research.yml               research groups and projects
_data/experience.yml             positions, service, awards, certifications, skills
index.html                       homepage
publications.html  research.html  experience.html  news.html  404.html
assets/css/main.css              all styles
assets/js/main.js                email, BibTeX toggle/copy
assets/fonts/*.woff2             Inter (normal+italic), Newsreader, JetBrains Mono
assets/img/headshot.jpg  assets/img/pubs/*.jpg  assets/img/og-card.png
favicon.svg  favicon-32.png  apple-touch-icon.png  robots.txt
tests/helpers.cjs                local server + Playwright helpers
tests/*.test.cjs                 one file per page or concern
README.md                        how to update the site
docs/superpowers/specs/*  docs/superpowers/plans/*
```

Removed: `styles.css`, `script.js`, the old `projects.html`, `service.html`, `awards.html`, `gallery.html`, the old `publications.html` (replaced by the new one in Task 3), and the original images in `assets/` once their optimized copies exist.

---

### Task 1: Repository setup, shared layout and test harness

**Files:**
- Create: `Gemfile`, `_config.yml`, `.gitignore`, `_layouts/default.html`, `_includes/head.html`, `_includes/header.html`, `_includes/footer.html`, `_includes/icon.html`, `_includes/email.html`, `_data/navigation.yml`, `_data/profile.yml` (identity, links, email, `cv: /assets/cv/Most_Nilufa_Yeasmin_CV.pdf`), `assets/cv/Most_Nilufa_Yeasmin_CV.pdf` (copy of the owner's third CV), `assets/css/main.css` (tokens, base, header, footer), `assets/js/main.js`, `assets/fonts/*.woff2`, `index.html` (temporary: layout plus `<h1>`), `tests/helpers.cjs`, `tests/layout.test.cjs`, `docs/superpowers/specs/2026-11-20-academic-site-redesign-design.md`, `docs/superpowers/specs/2026-11-20-homepage-mockup.html`, `docs/superpowers/plans/2026-11-20-academic-site-redesign.md`
- Delete: `styles.css`, `script.js`, `projects.html`, `service.html`, `awards.html`, `gallery.html`, old `publications.html`, old `index.html`

**Interfaces:**
- Produces:
  - `_data/navigation.yml`: list of `{ key, title, url }` with keys `about /`, `publications /publications/`, `research /research/`, `experience /experience/`, `news /news/`. The CV item comes from `site.data.profile.cv` and appears last, only when non-empty.
  - Page front matter `nav: <key>` marks the active menu item with `aria-current="page"`.
  - `{% include icon.html name="..." %}` names: `mail scholar github linkedin orcid file briefcase book check users pin flask cap building arrow-right external copy`.
  - `{% include email.html class="..." %}` outputs `<a class="js-email ..." data-user="MostNilufa.Yeasmin" data-domain="jacks.sdstate.edu">MostNilufa.Yeasmin [at] jacks [dot] sdstate [dot] edu</a>`, which `main.js` rewrites to a `mailto:` href. A `label` parameter replaces the visible text after the rewrite (used by the "Email" pill).
  - `_data/profile.yml` keys used later: `name`, `short_name`, `email.user`, `email.domain`, `cv`, `links.scholar|github|linkedin|orcid`.
  - CSS custom properties `--bg --card --ink --text --muted --line --accent --accent-ink --accent-soft --warm --warm-soft --green --green-soft --serif --sans --mono`, with the spec §7 values.
  - `tests/helpers.cjs` exports:
    - `SITE`;
    - `startServer(): Promise<{origin, close}>`;
    - `openPage(browser, origin, path, {width=1440, height=900, javaScriptEnabled=true}): Promise<{page, context, requests}>`;
    - `hasHorizontalOverflow(page): Promise<boolean>`;
    - `readSiteFile(rel): string`;
    - `listSiteFiles(): string[]` (every file under `_site/`, relative paths);
    - `listHtmlFiles(): string[]` (the `.html` subset);
    - `visibleText(rel): string` (the file's text with tags and the contents of `<script>`/`<style>` removed).

    The server maps `/x/` to `x/index.html`, tries `x` then `x.html`, and otherwise serves `404.html` with status 404. `requests` collects every request URL.
  - The layout starts `<body>` with a skip link `<a class="skip" href="#main">Skip to content</a>` and wraps page content in `<main id="main">`.

- [ ] **Step 1: Attach and clone the repo.** Call `add_repo` (owner `Nilufayeasmin299`, repo `mnyeasmin.github.io`, access `push`). Clone to `/home/user/mnyeasmin.github.io` and run `git checkout -b claude/vibrant-johnson-c1iv1l`.
- [ ] **Step 2: Install the toolchain.** Write the `Gemfile` (`gem "github-pages", "~> 233", group: :jekyll_plugins`, `gem "webrick", "~> 1.8"`) and run `bundle config set path vendor/bundle && bundle install`. `.gitignore` lists `_site/ vendor/ .bundle/ .jekyll-cache/ node_modules/ .sass-cache/`.
- [ ] **Step 3: Write `tests/helpers.cjs` and the failing `tests/layout.test.cjs`.**

```js
test('menu lists About, Publications, Research, Experience, News, CV', async () => {
  const items = await page.locator('header nav.menu a').allTextContents();
  assert.deepEqual(items.map(s => s.trim()), ['About','Publications','Research','Experience','News','CV']);
  assert.equal(await page.locator('header nav.menu a', { hasText: 'CV' }).getAttribute('href'), '/assets/cv/Most_Nilufa_Yeasmin_CV.pdf');
});
test('active item on / is About', async () => {
  assert.equal(await page.locator('header nav.menu a[aria-current="page"]').textContent(), 'About');
});
test('footer has copyright, last-updated month and four profile links', async () => {
  assert.match(await page.locator('footer').textContent(), /© 2026 Most Nilufa Yeasmin · Last updated [A-Z][a-z]+ \d{4}/);
  assert.equal(await page.locator('footer nav a').count(), 4);
});
test('skip link targets main', async () => {
  assert.equal(await page.locator('a.skip').getAttribute('href'), '#main');
  assert.equal(await page.locator('main#main').count(), 1);
});
test('phone menu opens without JavaScript', async () => {   // 390x844, javaScriptEnabled:false
  await phone.locator('header details summary').click();
  assert.ok(await phone.locator('header details nav a', { hasText: 'Publications' }).isVisible());
});
test('only local requests on page load', async () => {
  assert.deepEqual(requests.filter(u => !u.startsWith(origin) && !u.startsWith('data:')), []);
});
test('no horizontal overflow at 390 and 1440', async () => { /* both widths → false */ });
```

- [ ] **Step 4: Run them to see them fail.** Run `bundle exec jekyll build && node --test tests/`. Expected: FAIL (no layout yet; the old index has no `nav.menu`).
- [ ] **Step 5: Copy the fonts.** `npm pack @fontsource-variable/inter @fontsource-variable/newsreader @fontsource-variable/jetbrains-mono` in a temp directory, then copy into `assets/fonts/`: `inter-latin-wght-normal.woff2`, `inter-latin-wght-italic.woff2`, `newsreader-latin-standard-normal.woff2` (wght plus opsz axes; if its size suggests otherwise, use `newsreader-latin-opsz-normal.woff2`), `jetbrains-mono-latin-wght-normal.woff2`. Declare them with `@font-face` (`font-display: swap`) in `main.css` and preload Inter and Newsreader in `head.html`.
- [ ] **Step 6: Implement the layout, includes, tokens, header and footer, and delete the old files.** Port the mockup's header, nav pill and footer styles.
  - Desktop shows `nav.menu` above 960px.
  - At 960px and narrower it is hidden and `<details class="menu-mobile"><summary>Menu</summary><nav>…</nav></details>` shows instead.
  - `_config.yml` contains: title `Most Nilufa Yeasmin`, the description sentence from Task 7, `url`/`baseurl` (Global Constraints), `lang: en`, the three plugins, and `exclude: [README.md, Gemfile, Gemfile.lock, vendor, tests, docs, node_modules, package.json, package-lock.json]`.
- [ ] **Step 7: Run the tests to see them pass.** Run `bundle exec jekyll build && node --test tests/`. Expected: all `layout.test.cjs` tests PASS. If the build prints GitHub Metadata network warnings, they are expected offline; there must be no Liquid errors.
- [ ] **Step 8: Commit.** Include the spec, mockup and plan under `docs/`.

```bash
git add -A && git commit -m "Set up Jekyll site shell, shared layout and page tests"
```

---

### Task 2: Homepage

**Files:**
- Create or complete: `_data/profile.yml`, `_data/news.yml`, `_data/publications.yml`, `_includes/news-item.html`, `_includes/highlight-card.html`, `_includes/authors.html`, `_includes/person-jsonld.html`, `index.html`, `assets/img/headshot.jpg`, `assets/img/pubs/{posebench,deeponp,enlem,cad-architecture}.jpg`, `tests/home.test.cjs`
- Modify: `assets/css/main.css` (home section)
- Delete: `assets/headshot.png`, `assets/posebench.png`, `assets/deeponp.png`, `assets/enlem.png`, `assets/cad-review.jpg`

**Interfaces:**
- Consumes: Task 1 layout, `icon.html`, `email.html`, helpers.
- Produces:
  - `_data/profile.yml` keys:
    - `role` = "Ph.D. Student in Computer Science", `field` = "Geometric Computer Vision";
    - `affiliation{name,url}`, `advisor{name,url}`, `lab{name,url}`, all from spec §9;
    - `location`, `photo`, `stats{citations,h_index,i10_index,as_of}`, `internship`, `interests[]`, `education[{degree,school,years}]`, `quick_facts[{icon,text}]`, `bio[]` (paragraphs as HTML strings), `outside`.
  - `_data/publications.yml`: list of
    - `key, title, authors[], venue, venue_short, year, month, type (journal|conference|preprint), status (published|under_review|preprint)`;
    - optional `doi, arxiv, code, publisher, pages, image, image_alt, highlight (1–4), summary`.
  - `_data/news.yml`: list, newest first, of `date (YYYY-MM-DD), kind (paper|preprint|review|teaching|milestone|member|service), text (Markdown)`, optional `display` that overrides the shown date. `news-item.html` maps each kind to its label and color:
    - paper → Paper (green);
    - preprint → Preprint (warm);
    - review → Under review (warm);
    - others → Teaching, Milestone, Member, Service (accent).
  - `{% include authors.html authors=pub.authors %}` wraps exactly the author equal to `site.data.profile.name` in `<strong>`.
  - `news-item.html` renders `<li class="news-item"><time>…</time><div><span class="kind …">…</span>…</div></li>`.
  - DOM hooks the tests use:
    - `.hero` wraps h1, `.role` and the affiliation lines;
    - `.pills`, `.callout`, `.stats .stat strong`, `.stats-note`;
    - `.tl li` (education), `.qf li` (quick facts);
    - `.news`, `.hl` (highlight cards with `h3` and `img`), `.outside`.

Data values:
- **Publications:** 11 entries, copied from the owner's CV for the 9 CV papers with the spec §9 corrections, plus the 2 ICCIT 2022 papers:
  - Rashid, S. S. Binta Farhad, A. Bhuyian, Most Nilufa Yeasmin, M. A. Azim, Z. Alom. "A Comparative Analysis of Machine Learning Techniques on Breast Cancer Diagnosis Using WEKA". pp. 663–668, DOI `10.1109/ICCIT57492.2022.10055421`.
  - S. S. Shawon, S. Afrin, Most Nilufa Yeasmin, M. A. Azim, Z. Alom. "Prediction of IDH1 Gene Expression in Glioblastoma Using Machine Learning Techniques". pp. 336–341, DOI `10.1109/ICCIT57492.2022.10054918`.
  - Both: venue "25th International Conference on Computer and Information Technology (ICCIT)", year 2022, no month.
- **Highlights:** order 1 PoseBench, 2 DeepOnP, 3 EnLeM, 4 the CAD review. Summaries are the mockup's four sentences verbatim. The CAD review image is the owner's Fig. 2, saved as `cad-architecture.jpg`.
- **News:** the spec appendix's 11 items in that order. PLOS ONE is `date: 2024-01-01, display: "2024"`.
- **Exact copy:** the bio is the mockup's two paragraphs. The internship callout and outside note are the strings below.

```yaml
internship: "I am looking for summer 2027 research internships in 3D computer vision and pose estimation. If your team has an opening, I would be glad to hear from you."
outside: "Outside research, I love cinema, mostly Bollywood dramas but also international films from Korean thrillers to quiet arthouse dramas. Away from the keyboard you will usually find me on a long walk, cooking Bangladeshi dishes like bhuna khichuri, or listening to old Bangla folk songs."
```

- [ ] **Step 1: Write the failing `tests/home.test.cjs`.**

```js
test('hero: name, role line, affiliation, advisor and lab links', async () => {
  assert.equal(await page.locator('main h1').textContent(), 'Most Nilufa Yeasmin');
  assert.match(await page.locator('.role').textContent(), /Ph\.D\. Student in Computer Science · Geometric Computer Vision/);
  for (const href of ['https://www.sdstate.edu/', 'https://ruyilian.github.io/',
    'https://www.sdstate.edu/mccomish-electrical-engineering-computer-science/3d-perception-scientific-imaging-laboratory'])
    assert.equal(await page.locator(`.hero a[href="${href}"]`).count(), 1);
});
test('contact pills end with the CV pill; the CV is the only PDF', async () => {
  assert.deepEqual((await page.locator('.pills a').allTextContents()).map(s => s.trim()),
    ['Email','Google Scholar','GitHub','LinkedIn','ORCID','CV (PDF)']);
  assert.equal(await page.locator('.pills a.cv').getAttribute('href'), '/assets/cv/Most_Nilufa_Yeasmin_CV.pdf');
  assert.deepEqual(listSiteFiles().filter(f => f.endsWith('.pdf')), ['assets/cv/Most_Nilufa_Yeasmin_CV.pdf']);
});
test('email becomes mailto with JS and stays readable without it', async () => {
  assert.equal(await page.locator('.pills a.js-email').getAttribute('href'), 'mailto:MostNilufa.Yeasmin@jacks.sdstate.edu');
  assert.match(await noJsPage.locator('.pills a.js-email').textContent(), /MostNilufa\.Yeasmin \[at\] jacks \[dot\] sdstate \[dot\] edu/);
});
test('internship callout', async () => { assert.match(await page.locator('.callout').textContent(), /summer 2027 research internships/); });
test('stats 316 / 6 / 4 with source note', async () => {
  assert.deepEqual(await page.locator('.stat strong').allTextContents(), ['316','6','4']);
  assert.match(await page.locator('.stats-note').textContent(), /Google Scholar · Nov 2026/);
});
test('education has 2 entries, quick facts has 5', async () => { /* counts 2 and 5 */ });
test('six newest news items in file order', async () => {
  const dates = await page.locator('.news li time').allTextContents();
  assert.deepEqual(dates, ['Nov 2026','Sep 2026','Aug 2026','Jun 2026','Jan 2026','Dec 2025']);
  assert.match(await page.locator('.news li').nth(5).textContent(), /EnLeM/);
});
test('four highlights in order, each image with alt', async () => {
  const titles = await page.locator('.hl h3').allTextContents();
  assert.deepEqual(titles.map(t => t.split(':')[0]), ['PoseBench','DeepOnP','EnLeM','Advances of AI in Image-Based Computer-Aided Diagnosis']);
  for (const alt of await page.locator('.hl img').evaluateAll(els => els.map(e => e.alt))) assert.ok(alt.length > 0);
});
test('outside-the-lab note', async () => { assert.match(await page.locator('.outside').textContent(), /bhuna khichuri/); });
test('Person JSON-LD with four sameAs links and SDSU affiliation', async () => { /* parse script[type="application/ld+json"] with @type Person */ });
test('homepage transfer under 600 KB', async () => { /* sum of response body sizes < 600*1024 */ });
test('no horizontal overflow at 390 and 1440', async () => {});
```

- [ ] **Step 2: Run the tests to see them fail.** Run `bundle exec jekyll build && node --test tests/home.test.cjs`. Expected: FAIL (temporary index has only an `<h1>`).
- [ ] **Step 3: Prepare the images.** Use Pillow (flatten alpha on white, LANCZOS, progressive JPEG q84):
  - `headshot.jpg`: 640×800;
  - `posebench.jpg` and `enlem.jpg`: original width;
  - `deeponp.jpg`: 737 wide;
  - `cad-architecture.jpg`: from the owner's 661×323 PNG at its native size.
  - Then delete the originals listed above.
- [ ] **Step 4: Write the data files and includes, then build `index.html`.** `index.html` uses `layout: default`, `nav: about`, `redirect_from` is added in Task 6. Port the mockup's grid and components into `main.css`, following spec §7 (preprint labels are warm). Place the callout directly under the pills and the outside note as the last element of the main column. Lazy-load the highlight images.
- [ ] **Step 5: Run the tests to see them pass.** Run `bundle exec jekyll build && node --test tests/`. Expected: all PASS.
- [ ] **Step 6: Commit.**

```bash
git add -A && git commit -m "Build two-column homepage from profile, news and publication data"
```

---

### Task 3: Publications page

**Files:**
- Create: `publications.html`, `_includes/pub-entry.html`, `_includes/bibtex.html`, `tests/publications.test.cjs`
- Modify: `assets/css/main.css`, `assets/js/main.js` (BibTeX toggle and copy)

**Interfaces:**
- Consumes: `_data/publications.yml` and `authors.html` from Task 2.
- Produces: front matter `permalink: /publications/`, `nav: publications`, `redirect_from: [/publications.html]`.
  - Sections:
    - "Preprints and under review": `status` is `preprint` or `under_review`.
    - "Journal articles": `type: journal` and `status: published`.
    - "Conference papers": `type: conference`.
    - Each is sorted by year, then month, newest first.
  - BibTeX:
    - `@article` with `journal` for published journals;
    - `@inproceedings` with `booktitle` (and `pages` when set) for conferences;
    - `@misc` with `eprint` and `archivePrefix={arXiv}` for preprints;
    - none for `under_review`.
    - Authors are joined with ` and `; `doi` is included when set; the citation key is the entry's `key`.

- [ ] **Step 1: Write the failing `tests/publications.test.cjs`.**

```js
test('three sections with 2, 5 and 4 entries', async () => {
  assert.deepEqual(await page.locator('main h2').allTextContents(), ['Preprints and under review','Journal articles','Conference papers']);
  assert.deepEqual(await page.locator('section.pubs').evaluateAll(s => s.map(x => x.querySelectorAll('li.pub').length)), [2,5,4]);
});
test('owner name bold exactly once per entry', async () => {
  for (const n of await page.locator('li.pub').evaluateAll(ls => ls.map(l => [...l.querySelectorAll('strong')].filter(s => s.textContent === 'Most Nilufa Yeasmin').length)))
    assert.equal(n, 1);
});
test('DeepOnP: Under review badge, Lu Pang first, no BibTeX', async () => {
  const e = page.locator('li.pub', { hasText: 'DeepOnP' });
  assert.match(await e.textContent(), /Under review/);
  assert.match(await e.locator('.authors').textContent(), /^Lu Pang, Most Nilufa Yeasmin, Ruyi Lian/);
  assert.equal(await e.locator('.bibtex').count(), 0);
});
test('PoseBench: Preprint, arXiv link, Draix Wyatt', async () => {
  const e = page.locator('li.pub', { hasText: 'PoseBench' });
  assert.equal(await e.locator('a[href="https://arxiv.org/abs/2611.10347"]').count() > 0, true);
  assert.match(await e.textContent(), /Draix Wyatt/);
});
test('every entry with a DOI links https://doi.org/<doi>', async () => { /* 9 entries */ });
test('intro links to the Google Scholar profile', async () => {
  assert.equal(await page.locator('main a[href^="https://scholar.google.com/citations?user=TjeXLLMAAAAJ"]').count() >= 1, true);
});
test('BibTeX toggle reveals @article{ for EnLeM and offers copy', async () => {
  const e = page.locator('li.pub', { hasText: 'EnLeM' });
  await e.locator('button.bib-toggle').click();
  assert.match(await e.locator('pre.bibtex').textContent(), /^@article\{/);
  assert.equal(await e.locator('button.bib-copy').count(), 1);
});
test('/publications.html redirects to /publications/', async () => {
  assert.match(readSiteFile('publications.html'), /url=https:\/\/mnyeasmin\.com\/publications\//);
});
test('no horizontal overflow at 390 and 1440', async () => {});
```

- [ ] **Step 2: Run the tests to see them fail.** Run `bundle exec jekyll build && node --test tests/publications.test.cjs`. Expected: FAIL (page missing).
- [ ] **Step 3: Implement the page, the two includes, the CSS and the JS toggle and copy.** The BibTeX `<pre>` is hidden until toggled. The toggle button has `aria-expanded`, and copying uses `navigator.clipboard.writeText` with the button text flashing "Copied".
- [ ] **Step 4: Run the tests to see them pass.** Run `bundle exec jekyll build && node --test tests/`. Expected: all PASS.
- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "Add data-driven Publications page with BibTeX"
```

---

### Task 4: Research page

**Files:**
- Create: `_data/research.yml`, `research.html`, `assets/img/pubs/{f1000,bbi,bdcc}.jpg`, `tests/research.test.cjs`
- Modify: `assets/css/main.css`
- Delete: `assets/f1000.gif`, `assets/bbi.jpg`, `assets/bdcc.png`

**Interfaces:**
- Consumes: `publications.yml` keys (a project may reference `pub: <key>` for its paper link).
- Produces: `_data/research.yml` as `groups: [{ title, intro?, projects: [{ title, period, tags[], text, image?, image_alt?, links: [{label, url}] }] }]`, plus front matter `permalink: /research/`, `nav: research`, `redirect_from: [/projects.html]`.

Content:
- Group titles: "3D vision and pose estimation", "Medical image analysis", "Earlier work".
- Projects in order:
  - Group 1: PoseBench; DeepOnP.
  - Group 2: Retinal Vessel Segmentation with Deep Learning (no image); the AI-for-CAD review.
  - Group 3: EnLeM; COVID-19 Twitter Sentiment Analysis; the F1000Research pipeline paper; the BBI biomarker paper.
- Text is drawn only from the CV bullets, with no use of "robust". PoseBench's text comes from its arXiv abstract, fetched with Firecrawl from `https://arxiv.org/abs/2611.10347`.
- Code links: only after a shallow clone of each candidate repo shows a README matching the paper.
  - EnLeM: `Nilufayeasmin299/Ensemble-Learning-for-Phishing-Websites-Detection`.
  - COVID-19 sentiment: `Nilufayeasmin299/Final-Year-Complete-Project-Covid19-twitter-sentiment-analysis-using-deep-learning-methods-`.

- [ ] **Step 1: Write the failing `tests/research.test.cjs`.**

```js
test('three groups in order', async () => {
  assert.deepEqual(await page.locator('main h2').allTextContents(), ['3D vision and pose estimation','Medical image analysis','Earlier work']);
});
test('projects per group', async () => {
  assert.deepEqual(await page.locator('section.group').evaluateAll(g => g.map(x => x.querySelectorAll('article.project').length)), [2,2,4]);
});
test('retinal project renders no image; every other img has alt', async () => {
  assert.equal(await page.locator('article.project', { hasText: 'Retinal Vessel' }).locator('img').count(), 0);
});
test('/projects.html redirects to /research/', async () => { /* readSiteFile match */ });
test('no horizontal overflow at 390 and 1440', async () => {});
```

- [ ] **Step 2: Run the tests to see them fail.** Run `bundle exec jekyll build && node --test tests/research.test.cjs`. Expected: FAIL.
- [ ] **Step 3: Prepare the images, fetch the abstract, check the repos, then write the data and the page.** For `f1000.jpg`, use the first GIF frame, flattened and capped at 800px wide. Cap `bbi.jpg` and `bdcc.jpg` at 800px wide.
- [ ] **Step 4: Run the tests to see them pass.** Run `bundle exec jekyll build && node --test tests/`. Expected: all PASS.
- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "Add Research page with grouped projects"
```

---

### Task 5: Experience page

**Files:**
- Create: `_data/experience.yml`, `experience.html`, `tests/experience.test.cjs`
- Modify: `assets/css/main.css` (timeline)

**Interfaces:**
- Produces:
  - `_data/experience.yml`:
    - `positions: [{category (research|teaching|industry), role, org, location, start, end, advisor?, bullets[], tags[]}]`;
    - `service: [{role, org, years}]`, `awards: [{title, org, years}]`, `certifications: [{title, provider, date}]`, `skills: [{area, items}]`.
  - Front matter: `permalink: /experience/`, `nav: experience`, `redirect_from: [/service.html, /awards.html]`.

Content:
- Every item from the CV's Research Experience, Teaching and Industry Experience, Awards, Service and Leadership, Certifications and Technical Skills sections, with spec §9 corrections:
  - the merit scholarship is "2018 – 2019";
  - the ACM membership is Sep 2026;
  - the CVII lab advisor is "Dr. Md Zahidul Islam".
- The timeline is grouped Research, Teaching, Industry, newest first within each group, and each entry carries its category icon (`flask`, `cap`, `building`).
- CV bullets are reworded only to remove "robust": "robustness analysis under Gaussian image noise" becomes "accuracy analysis under Gaussian image noise", and "research on robust geometric computer vision" becomes "research on geometric computer vision".

- [ ] **Step 1: Write the failing `tests/experience.test.cjs`.**

```js
test('timeline: 7 entries as 4 research, 2 teaching, 1 industry', async () => {
  assert.deepEqual(await page.locator('.timeline li').evaluateAll(l => l.map(x => x.dataset.category)),
    ['research','research','research','research','teaching','teaching','industry']);
});
test('GRA entry: advisor Dr. Ruyi Lian and 3 bullets', async () => {
  const e = page.locator('.timeline li', { hasText: 'Graduate Research Assistant' });
  assert.match(await e.textContent(), /Dr\. Ruyi Lian/);
  assert.equal(await e.locator('ul li').count(), 3);
});
test('CVII advisor spelled Dr. Md Zahidul Islam', async () => { /* text match */ });
test('lists: 8 service, 4 awards (first 2018 – 2019), 3 certifications, 6 skill rows', async () => {});
test('ACM membership dated Sep 2026', async () => {});
test('/service.html and /awards.html redirect to /experience/', async () => {});
test('no horizontal overflow at 390 and 1440', async () => {});
```

- [ ] **Step 2: Run the tests to see them fail.** Run `bundle exec jekyll build && node --test tests/experience.test.cjs`. Expected: FAIL.
- [ ] **Step 3: Write the data and the page, with timeline CSS following the Shaikhul reference.** Use a vertical rule, round category icon, small uppercase category label, role, organization line, location, date pill on the right (wrapping under the role on phones), bullets and tags.
- [ ] **Step 4: Run the tests to see them pass.** Run `bundle exec jekyll build && node --test tests/`. Expected: all PASS.
- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "Add Experience page with timeline, service, awards and skills"
```

---

### Task 6: News page, 404 page and gallery redirect

**Files:**
- Create: `news.html`, `404.html`, `tests/news.test.cjs`
- Modify: `index.html` (add `redirect_from: [/gallery.html]`), `assets/css/main.css`

**Interfaces:**
- Consumes: `_data/news.yml` and `news-item.html` from Task 2.
- Produces: `news.html` with `permalink: /news/`, `nav: news`, items grouped under `<h2>` year headings in file order. The year comes from `display` when set, else from `date`. `404.html` has `permalink: /404.html`.

- [ ] **Step 1: Write the failing `tests/news.test.cjs`.**

```js
test('11 items under 2026, 2025, 2024, 2023', async () => {
  assert.deepEqual(await page.locator('main h2').allTextContents(), ['2026','2025','2024','2023']);
  assert.equal(await page.locator('main li.news-item').count(), 11);
});
test('PLOS ONE item shows 2024, not Jan 2024', async () => {
  const t = await page.locator('li.news-item', { hasText: 'PLOS ONE' }).locator('time').textContent();
  assert.equal(t.trim(), '2024');
});
test('404 page links home and to Publications', async () => { /* response status 404 for /nope, links / and /publications/ */ });
test('/gallery.html redirects to the homepage', async () => {
  assert.match(readSiteFile('gallery.html'), /url=https:\/\/mnyeasmin\.com\//);
});
test('no horizontal overflow at 390 and 1440', async () => {});
```

- [ ] **Step 2: Run the tests to see them fail.** Run `bundle exec jekyll build && node --test tests/news.test.cjs`. Expected: FAIL.
- [ ] **Step 3: Implement the news page, the 404 page and the redirect.**
- [ ] **Step 4: Run the tests to see them pass.** Run `bundle exec jekyll build && node --test tests/`. Expected: all PASS.
- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "Add News archive, 404 page and gallery redirect"
```

---

### Task 7: Metadata, icons, link-preview image, README and site-wide audit

**Files:**
- Create: `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `assets/img/og-card.png`, `robots.txt`, `README.md`, `tests/audit.test.cjs`
- Modify: `_includes/head.html`, `_config.yml`, each page's front matter (`title`, `description`)

**Interfaces:**
- Produces: the site description, used as the `_config.yml` `description` and the homepage meta description: "Most Nilufa Yeasmin is a Ph.D. student in Computer Science at South Dakota State University working on geometric computer vision: camera pose estimation, neural solvers and pose awareness in visual foundation models."
  - `og-card.png`: 1200×630, rendered with Playwright from a temporary HTML card (photo, name in Newsreader, role line, mnyeasmin.com) and set as `image` in `_config.yml` defaults.
  - Favicons: the pose-gizmo SVG from the mockup, rasterized with Playwright to 32 and 180 px.

- [ ] **Step 1: Write the failing `tests/audit.test.cjs`.** Run it over every HTML file from `listHtmlFiles()` except redirect stubs.

```js
test('each page: unique <title>, meta description, canonical, og:image', async () => {});
test('sitemap.xml lists /, /publications/, /research/, /experience/, /news/', async () => {});
test('robots.txt points to https://mnyeasmin.com/sitemap.xml', async () => {});
test('forbidden strings absent site-wide', () => {
  const banned = [/\u2014/, /605-691/, /IEEE/, /Dissertation/, /Derek/, /Waite/, /WACV/, /2024 & 2025/, /\bfoe\b/, /Zhahidul/,
    /\b(leverage|transformative|seamless|unlock|streamline|robust\w*|synergy)\b/i];
  for (const f of listHtmlFiles()) for (const re of banned) assert.ok(!re.test(visibleText(f)), `${re} in ${f}`);
});
test('every img has non-empty src and alt', async () => {});
test('no request leaves localhost on any page', async () => {});
test('old styles.css and script.js are gone from _site', () => {});
test('text tokens meet WCAG AA (4.5:1)', () => {
  // relative-luminance contrast for each [foreground, background] pair read from :root in main.css:
  // text/card, text/bg, muted/card, muted/bg, accent/card, accent/bg, accent-ink/accent-soft,
  // warm/warm-soft, green/green-soft, white/accent (CV pill and active states)
});
```

- [ ] **Step 2: Run the tests to see them fail.** Run `bundle exec jekyll build && node --test tests/audit.test.cjs`. Expected: FAIL (no og:image, robots.txt or favicons yet).
- [ ] **Step 3: Implement the metadata, icons, OG card, `robots.txt` and README.** The README covers:
  - adding a paper (one YAML entry, `highlight` for the homepage);
  - adding news (top of `news.yml`; only the first six show on the homepage);
  - updating Scholar numbers and `as_of`;
  - replacing the CV (overwrite `assets/cv/Most_Nilufa_Yeasmin_CV.pdf`; emptying `profile.cv` hides every CV link);
  - previewing with `bundle exec jekyll serve`;
  - running the tests.
- [ ] **Step 4: Run the tests to see them pass.** Run `bundle exec jekyll build && node --test tests/`. Expected: all PASS.
- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "Add metadata, icons, link preview image, README and content audit"
```

---

### Task 8: Final verification and delivery

**Files:** none new (screenshots go to the scratchpad, not the repo).

- [ ] **Step 1: Clean build.** Run `rm -rf _site .jekyll-cache && bundle exec jekyll build`. Expected: "done", with no Liquid errors and no deprecation warnings other than offline GitHub Metadata notices.
- [ ] **Step 2: Full test run.** Run `node --test tests/`. Expected: every test PASS, 0 failures.
- [ ] **Step 2b: HTML validation.** Run `npx --yes html-validate "_site/**/*.html"` (use a small `.htmlvalidate.json` that extends `html-validate:recommended` and turns off only rules that conflict with the redirect stubs Jekyll generates). Expected: 0 errors.
- [ ] **Step 3: Screenshots.** Capture each page at 1440×900 and 390×844 (deviceScaleFactor 2), full page. Compare the homepage with the mockup side by side and fix any visible regression (re-run Steps 1–2 after a fix).
- [ ] **Step 4: Lighthouse.** Run Lighthouse (mobile) on the homepage with `npx lighthouse http://localhost:<port>/ --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`, Chrome at `/opt/pw-browsers/chromium`. Expected: 90+ / 95+ / 95+ / 95+, or the shortfall reported to the owner with the reason.
- [ ] **Step 5: Push.** Run `git push -u origin claude/vibrant-johnson-c1iv1l`, retrying network errors up to 4 times with backoff. Confirm with `git ls-remote origin claude/vibrant-johnson-c1iv1l`.
- [ ] **Step 6: Hand over.** Send the owner the screenshots and the branch name, and explain how to merge (a pull request or a merge into `main` on GitHub). Do not open a pull request unless asked.
