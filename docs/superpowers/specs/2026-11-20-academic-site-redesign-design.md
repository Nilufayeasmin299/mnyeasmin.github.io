# mnyeasmin.com redesign: design

Date: 2026-11-20 · Status: approved by the owner on 2026-11-20
Site owner: Most Nilufa Yeasmin · Written by Claude from the design conversation

## 1. Intent

The owner is a first-year Ph.D. student in Computer Science at South Dakota State University (since January 2026), advised by Dr. Ruyi Lian in the 3D Perception and Scientific Imaging Laboratory. The research is geometric computer vision: neural solvers for camera pose estimation (DeepOnP) and benchmarks that probe pose awareness in visual foundation models (PoseBench).

The site should present the owner as a credible early-career 3D vision researcher to the people who shape an academic career: prospective collaborators, internship hosts, fellowship committees and, later, faculty search committees.

The current site (repo `Nilufayeasmin299/mnyeasmin.github.io`, custom domain mnyeasmin.com) does not do this today:

- Only the homepage renders. The five other pages use 22 CSS classes that `styles.css` never defines, so they show as unstyled lists, and the homepage does not link to them.
- The menu, footer and publication lists are copied by hand into every page and have drifted apart.
- Several facts contradict the CV (author order, co-author names, email, memberships, dates). Section 9 lists the corrected facts.
- A missing `</strong>` makes most of the homepage news list render bold; images are up to 1.7 MB each; there is no CV link, favicon or link-preview metadata.

## 2. Goals

1. A two-column homepage modeled on amitkdas-08.github.io, which the owner chose, matching the approved mockup (section 7).
2. Current 3D vision work leads; earlier medical imaging, security, NLP and bioinformatics work stays visible but secondary.
3. Every fact matches the CV plus the owner's corrections in section 9.
4. Each paper, news item and position is stored once, in a data file, and appears everywhere it belongs.
5. A professional finish: fast, mobile-friendly, accessible, with proper metadata for search engines and link previews.
6. Easy upkeep: adding a paper or news item means editing one YAML entry, documented in a README.

## 3. Non-goals

- Blog, site search, comments, analytics, contact form.
- Dark mode (the color tokens make it cheap to add later).
- Gallery page (dropped until there are photos) and a Talks page (nothing to list yet).
- A papers-per-year chart like Amit's: with one to three papers a year it draws attention to the count rather than the work.
- Editing the CV PDF itself.

## 4. Anti-goals (these would count as failure even if the site works)

- Looking like a copy of Amit's site. The palette, fonts and logo mark are deliberately different.
- An industry-portfolio feel: hero banners, "View my work" or "Hire me" buttons.
- Any claim that is not in the CV or confirmed by the owner. No invented results, venues, metrics or paper descriptions.
- Publishing the owner's phone number or the referees' contact details.
- Emoji in headings or news, or Unicode "bold" letters in text.
- Em dashes in site copy, and the words leverage, transformative, seamless, unlock, streamline, robust or synergy (the owner's writing preferences). En dashes in date ranges are fine.
- Any change to the live site before the owner merges.

## 5. Constraints

- Hosting: GitHub Pages, deployed from the `main` branch with the classic Jekyll build. That means the `github-pages` gem (v233): Jekyll 3.10.0 and whitelisted plugins only. This design uses `jekyll-seo-tag` 2.9.1, `jekyll-sitemap` 1.4.0 and `jekyll-redirect-from` 0.17.0. No custom plugins and no GitHub Actions.
- Keep the `CNAME` file (mnyeasmin.com) at the repo root. In `_config.yml`, `url` is `https://mnyeasmin.com` and `baseurl` is empty.
- All work happens on branch `claude/vibrant-johnson-c1iv1l` of `Nilufayeasmin299/mnyeasmin.github.io`. The owner merges it into `main`.
- Old URLs must keep working: `/publications.html`, `/projects.html`, `/service.html`, `/awards.html`, `/gallery.html`.
- No third-party requests when a page loads. Fonts are self-hosted: Newsreader, Inter and JetBrains Mono, all SIL Open Font License, as latin-subset variable woff2 files from the `@fontsource-variable` npm packages.
- Images are resized to at most twice their display size, saved as JPEG (or WebP), with `width`/`height` attributes plus CSS `height:auto`.
- The build container cannot reach most external hosts, but Ruby 3.3 and rubygems.org are available, so the site can be built locally with the exact `github-pages` gem before pushing.

## 6. Approaches considered

| Approach | Trade-off | Decision |
|---|---|---|
| Jekyll layouts plus `_data` YAML files, built natively by GitHub Pages | Menu and footer defined once; content stored once; nothing for the owner to install; output is static HTML. Liquid is a little harder to read than plain HTML, and a Liquid error fails the Pages build. | Chosen. The owner handed over the "how"; Claude picked this and the owner did not object. |
| Hand-written HTML, as now | Easiest to read, but every page repeats the menu, footer and paper lists. That repetition is how the current pages broke and drifted apart. | Rejected |
| Stock academic theme (al-folio, AcademicPages) | Many features, but it fights the Amit layout, is heavy, and looks like thousands of other sites. The advisor's site already uses AcademicPages. | Rejected |

## 7. Visual design (decided)

The approved mockup is the spec for the homepage look: `mockup/index.html` in Claude's scratchpad, with screenshots `mockup-desktop.png` and `mockup-phone.png`. The build should match it closely. Where the mockup and this document differ, this document wins. For example, the mockup shows the news "Preprint" label in blue, but it should be amber like every other preprint and under-review status.

- Header bar: logo mark plus "M. N. Yeasmin" on the left, menu on the right. The current page is highlighted with a soft pill. The bar is sticky with a translucent white background.
- Desktop (wider than 960px): content max-width 1200px; a grid with a 300px left column and a flexible right column, about 52px apart. The left column holds the photo card (4:5 ratio) and then the facts card. The right column holds the name block, contact buttons, bio, interest tags, news card and research highlights (2 columns).
- Tablet and phone (960px and narrower): one column, ordered photo, main content, facts card. The menu collapses into a "Menu" button that opens a dropdown. At 600px and narrower, highlights stack in one column and news dates sit above the text.
- Color tokens:

  | Token | Value | Use |
  |---|---|---|
  | bg | `#F4F6F9` | page background |
  | card | `#FFFFFF` | cards, header |
  | ink | `#0E1A2B` | headings |
  | text | `#3B4657` | body text |
  | muted | `#687386` | secondary text |
  | line | `#E2E7EE` | borders |
  | accent | `#1F4FA0` | links, active states, icons |
  | accent-ink | `#173C7A` | hover, tag text |
  | accent-soft | `#EAF0FA` | pills, tags |
  | warm / warm-soft | `#9A5410` / `#FBF1E4` | "Preprint" and "Under review" only |
  | green / green-soft | `#1D6B47` / `#E6F4EC` | "Paper" (published) news label |

- Fonts: Newsreader for the name, headings and stat numbers; Inter for text and interface; JetBrains Mono for dates and small uppercase labels. Body text is 16 to 16.5px with line height around 1.7.
- Logo mark: a small three-axis "pose gizmo" SVG (two blue axes, one amber, dark origin dot). It doubles as the favicon.
- Icons: inline SVG with Lucide-style strokes. No icon font, no emoji.
- Paper thumbnails: a 16:9 box with `object-fit: contain` on a near-white background.

## 8. Site structure

| Page | URL | Content |
|---|---|---|
| About (home) | `/` | As in the mockup, plus a short "Outside the lab" note at the end (section 9) |
| Publications | `/publications/` | Full list |
| Research | `/research/` | Projects, grouped |
| Experience | `/experience/` | Timeline, then service, awards, certifications, skills |
| News | `/news/` | Full archive |
| CV | menu item linking to `/assets/cv/Most_Nilufa_Yeasmin_CV.pdf` | Public PDF supplied by the owner (section 9) |
| Not found | `/404.html` | Short message with links home |

Redirects, via `jekyll-redirect-from`: `/publications.html` to `/publications/`, `/projects.html` to `/research/`, `/service.html` and `/awards.html` to `/experience/`, and `/gallery.html` to `/`.

Footer on every page: "© 2026 Most Nilufa Yeasmin · Last updated <build month and year>", plus Scholar, GitHub, LinkedIn and ORCID links.

**Homepage.** Exactly as in the mockup, with the corrected data:
- Left column: photo; Education (Ph.D. Computer Science, SDSU, 2026 to present; B.Sc. Information & Communication Technology, Islamic University, Bangladesh, 2016 to 2020); At a glance (316 citations, h-index 6, i10-index 4, labeled "Google Scholar · Nov 2026"); Quick facts (Graduate Research Assistant, SDSU; Teaching Assistant, CSC 325 and CSC 445; Ad hoc reviewer, PLOS ONE; ACM Professional Member; Brookings, South Dakota).
- Right column: the latest six news items, and four highlights (PoseBench, DeepOnP, EnLeM, AI-for-CAD review) chosen by a `highlight` flag in the publication data, in that order.

**Publications.** Three sections: "Preprints and under review", "Journal articles", "Conference papers", each newest first. Each entry shows:
- the title, linked to the DOI or arXiv page when one exists;
- the authors, with the owner's name in bold;
- the venue in italics, with the year;
- a status badge (Preprint or Under review) where relevant;
- small link buttons (Paper, arXiv, Code);
- a "BibTeX" toggle generated from the data fields, with a copy button.

No thumbnails on this page, so it stays easy to scan. A line at the top links to Google Scholar.

**Research.** One intro sentence, then three groups:
1. "3D vision and pose estimation": PoseBench and DeepOnP.
2. "Medical image analysis": the retinal vessel segmentation project and the AI-for-CAD review.
3. "Earlier work": EnLeM phishing detection, COVID-19 Twitter sentiment, and the two bioinformatics papers (F1000Research 2024, Bioinformatics and Biology Insights 2023).

Each project shows its figure (if any), title, period, topic tags, one to three sentences drawn only from the CV (for PoseBench, from its arXiv abstract), and links.

**Experience.** A vertical timeline with a category icon per entry, inspired by shaikhulhadi.github.io/tabs/experience.html:
- Research: 4 positions.
- Teaching: 2.
- Industry: 1.

Each entry shows role, organization, location, dates, advisor (where the CV names one), the CV bullets and optional skill tags. Below the timeline come compact lists: Service and leadership, Awards and honors, Certifications, Technical skills.

**News.** Every item from the appendix, grouped by year, in the same style as the homepage.

## 9. Content: source and corrections

The content source is the CV the owner uploaded (`Most_Nilufa_Yeasmin_CV_1.pdf`), with these corrections confirmed by the owner:

1. DeepOnP:
   - Authors: Lu Pang, Most Nilufa Yeasmin, Ruyi Lian.
   - Title: "DeepOnP: Outlier-Resilient Neural Solver for the Orthographic-n-Point Problem".
   - Status: under review at Pattern Recognition Letters, submitted June 2026.
   - No "Dissertation: DeepOnP" line anywhere.
2. PoseBench:
   - Authors: Most Nilufa Yeasmin, Draix Wyatt, Ruyi Lian.
   - arXiv:2611.10347 (November 2026).
   - Labeled as a preprint only. Never name a conference.
3. Public email: MostNilufa.Yeasmin@jacks.sdstate.edu.
4. The owner is not an IEEE member. No IEEE claim anywhere.
5. University Merit Scholarship, Islamic University: 2018 and 2019. The CV's "2024 & 2025" is wrong.
6. "Undergraduate Research Student, Data Privacy and Security Research Lab": keep the CV dates, Jan 2019 to May 2024.
7. Lab and advisor links:
   - Lab: 3D Perception and Scientific Imaging Laboratory, https://www.sdstate.edu/mccomish-electrical-engineering-computer-science/3d-perception-scientific-imaging-laboratory
   - Advisor: Dr. Ruyi Lian, https://ruyilian.github.io/
8. Google Scholar, November 2026: 316 citations, h-index 6, i10-index 4. Store these in data with an "as of" date.
9. ACM Professional Member since September 2026, as on the CV.
10. Profile links:
    - Scholar: https://scholar.google.com/citations?user=TjeXLLMAAAAJ&hl=en
    - GitHub: https://github.com/Nilufayeasmin299
    - LinkedIn: https://www.linkedin.com/in/nilufayeasmin299/
    - ORCID: https://orcid.org/0009-0009-0889-1470

**Claude's content calls (the owner can overrule):**
- **Two extra papers.** Two ICCIT 2022 conference papers appear on the current site and on Google Scholar (Scholar counts 4 conference papers) but not on the CV. They are listed on the Publications page and not highlighted:
  - "A Comparative Analysis of Machine Learning Techniques on Breast Cancer Diagnosis Using WEKA", DOI 10.1109/ICCIT57492.2022.10055421.
  - "Prediction of IDH1 Gene Expression in Glioblastoma Using Machine Learning Techniques", DOI 10.1109/ICCIT57492.2022.10054918.
- **Name spelling.** The Islamic University CVII lab advisor is written "Dr. Md Zahidul Islam", matching the publications. The CV spells it "Zhahidul".
- **News removals.** "Crossed 300+ citations" is dropped, since the stat tile covers it. The old scholarship item is dropped too; it's now dated 2018 to 2019 and lives under Awards.
- **Personal note.** The "More about me" section becomes a two-sentence "Outside the lab" note at the end of the homepage, with no favorites list: "Outside research, I love cinema, mostly Bollywood dramas but also international films from Korean thrillers to quiet arthouse dramas. Away from the keyboard you will usually find me on a long walk, cooking Bangladeshi dishes like bhuna khichuri, or listening to old Bangla folk songs."
- **Code links.** EnLeM links to `github.com/Nilufayeasmin299/Ensemble-Learning-for-Phishing-Websites-Detection` and COVID-19 sentiment to `github.com/Nilufayeasmin299/Final-Year-Complete-Project-Covid19-twitter-sentiment-analysis-using-deep-learning-methods-`. Each is linked only after checking the repo's README matches the paper.
- **Bio.** Uses the mockup's two paragraphs, verbatim.

**Internship line (owner said yes):** the homepage carries one short callout under the contact buttons saying the owner is looking for summer 2027 research internships in 3D computer vision and pose estimation, inviting contact by email. No emoji; an inline SVG icon is fine.

**Assets from the owner:**
- Fig. 2 ("Overall architecture of CAD") of the Array review, supplied as a 661×323 PNG. It replaces the Fig. 1 tree diagram as the review's thumbnail.
- CV: the owner's third version (`Most_Nilufa_Yeasmin_CV_3.pdf`) has no phone number in its text, links or metadata, fixes the scholarship years (2018 & 2019), and lists referees with institutional emails only. It is published as `/assets/cv/Most_Nilufa_Yeasmin_CV.pdf`, and the CV button and menu item point to it. The first two versions, which contain phone numbers, are never committed.

## 10. Data model (shape decided; exact field names left to the builder)

- `_data/profile.yml`: name, short name, role line, affiliation, advisor (name, url), lab (name, url), email, profile links, CV path (empty hides the CV button), location, Scholar stats with an as-of date, interests, quick facts, education.
- `_data/publications.yml`, one entry per paper:
  - key, title, authors (list), venue, short venue, year, month;
  - type: journal, conference or preprint;
  - status: published, under_review or preprint;
  - doi, arxiv, code, image;
  - highlight (true/false) with highlight order, plus a one-sentence summary for highlight cards.
- `_data/news.yml`: date (YYYY-MM), kind (paper, preprint, review, teaching, milestone, member), text (Markdown), optional link.
- `_data/experience.yml`: positions (category, role, organization, location, start, end, advisor, bullets, tags), then lists for service, awards, certifications and skills.
- `_data/research.yml`: projects (group, title, period, tags, text, image, links, optional publication key).

The homepage takes the six newest news items by date and the publications with `highlight: true`, in highlight order.

## 11. Metadata, accessibility, performance

- **Search and link previews.**
  - `jekyll-seo-tag` handles the title, description, canonical URL, Open Graph, Twitter card and JSON-LD. Add a Person schema with `sameAs` (Scholar, ORCID, GitHub, LinkedIn) and the SDSU affiliation.
  - A 1200×630 link-preview image (name, role, photo), generated once and committed.
  - A favicon: SVG, plus a 32px PNG and an apple-touch-icon.
  - `jekyll-sitemap`, plus a `robots.txt` pointing to the sitemap.
- **Accessibility:**
  - semantic landmarks and a skip link;
  - alt text on every image;
  - visible focus styles;
  - `aria-current` on the active menu item;
  - a menu button with `aria-expanded`;
  - WCAG AA contrast for every text color.
- **Performance:**
  - preload the fonts (`font-display: swap`);
  - lazy-load images below the fold;
  - keep the homepage under about 600 KB in total.
- **Targets** (Lighthouse, mobile): Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+.

## 12. Verification

- Build locally with `github-pages` 233 (Jekyll 3.10.0), with no errors or warnings.
- Screenshot every page at 1440px and at 390px wide. Check for horizontal overflow and compare the homepage with the mockup.
- Check every internal link and each redirect. Validate the HTML.
- Run Lighthouse in the container if possible.
- Audit content against section 9. A search of the built site must find no "IEEE", "Derek", "Waite", "Dissertation", "2024 & 2025", "foe", "WACV", phone number or em dash in copy.

## 13. Delivery

- Commit to branch `claude/vibrant-johnson-c1iv1l` and push it to `Nilufayeasmin299/mnyeasmin.github.io`. No pull request unless the owner asks. The owner merges into `main` and Pages deploys.
- Remove the obsolete `styles.css`, `script.js` and old page files (redirect stubs replace them). Keep `CNAME`.
- Write a `README.md` explaining how to add a paper or news item, update the Scholar numbers, replace the CV and preview locally.
- Commit this document as `docs/superpowers/specs/2026-11-20-academic-site-redesign-design.md`, excluded from the Jekyll build so it is never published on mnyeasmin.com.

## 14. Left to the builder

- Folder layout, Liquid structure, include names and exact field names.
- CSS organization and exact spacing, within the mockup's look.
- How BibTeX is generated, and the email obfuscation approach.
- Wording of short page intros, following section 4 and using CV facts only.
- Image formats and sizes, within section 5.

## Appendix: news items (newest first)

| Date | Label | Text |
|---|---|---|
| Nov 2026 | Preprint | "PoseBench: Probing Pose Awareness in Visual Foundation Models" is now on arXiv (link to arXiv:2611.10347). |
| Sep 2026 | Member | Joined the ACM as a Professional Member. |
| Aug 2026 | Teaching | Started as a Graduate Teaching Assistant for CSC 325 (Management Information Systems) and CSC 445 (Introduction to Theory of Computation). |
| Jun 2026 | Under review | DeepOnP, with Lu Pang and Ruyi Lian, submitted to *Pattern Recognition Letters*. |
| Jan 2026 | Milestone | Began my Ph.D. in Computer Science at South Dakota State University, advised by Dr. Ruyi Lian. |
| Dec 2025 | Paper | "EnLeM: An Ensemble Learning-based Model for Detecting Phishing Websites" published in *EURASIP Journal on Information Security*. |
| Dec 2025 | Milestone | Completed a research assistantship at the BUBT Research and Innovation Center, Dhaka. |
| Jul 2024 | Paper | Review "Advances of AI in Image-Based Computer-Aided Diagnosis" published in *Array* (Elsevier). |
| Mar 2024 | Paper | Co-authored paper on high-throughput biological sequence analysis published in *F1000Research*. |
| 2024 | Service | Began reviewing for *PLOS ONE*. |
| Jun 2023 | Paper | Co-authored article linking COVID-19 and smoking through network-based biomarkers published in *Bioinformatics and Biology Insights*. |
