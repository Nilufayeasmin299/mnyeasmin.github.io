# mnyeasmin.com

Personal academic website of Most Nilufa Yeasmin. It is a Jekyll site that GitHub Pages builds from the `main` branch; the custom domain is set in `CNAME`.

## Where things live

| What | File |
|---|---|
| Name, role, links, Google Scholar numbers, bio, education, quick facts, internship note | `_data/profile.yml` |
| Papers (homepage highlights, Publications page, Research links) | `_data/publications.yml` |
| News | `_data/news.yml` |
| Research projects | `_data/research.yml` |
| Positions, service, awards, certifications, skills | `_data/experience.yml` |
| Menu | `_data/navigation.yml` |
| Colors, fonts, layout | `assets/css/main.css` (color tokens at the top) |
| Photo and paper figures | `assets/img/` and `assets/img/pubs/` |
| CV | `assets/cv/Most_Nilufa_Yeasmin_CV.pdf` |

## Common updates

**Add a paper.** Copy an existing entry in `_data/publications.yml` and edit it. Every entry needs `key`, `title`, `authors`, `venue`, `venue_short`, `year`, `type` and `status`; add `doi`, `arxiv` and `code` when you have them. Write your name exactly as `Most Nilufa Yeasmin` so it shows in bold. To feature a paper on the homepage, give it `highlight` (its position, 1 to 4), a one-sentence `summary` and a figure (`image`, `image_alt`, `image_w`, `image_h`), and remove `highlight` from the paper it replaces.

**A paper under review gets accepted.** Change its `status` to `published` and add the `doi` (and the final `year` and `month`).

**Add news.** Add an item at the top of `_data/news.yml`. The homepage shows the first six. `kind` is one of `paper`, `preprint`, `review`, `teaching`, `milestone`, `member`, `service`.

**Update the Google Scholar numbers.** Edit `stats` in `_data/profile.yml` and change `as_of`.

**Replace the CV.** Overwrite `assets/cv/Most_Nilufa_Yeasmin_CV.pdf` with the new PDF, and keep your phone number out of it. Setting `cv: ""` in `_data/profile.yml` hides every CV link.

**Change or remove the internship note.** Edit `internship` in `_data/profile.yml`; an empty value hides it.

**Add a research project.** Add it under a group in `_data/research.yml`. `pub: <key>` takes the figure and the Paper, arXiv and Code links from that paper's entry in `publications.yml`.

## Preview locally

With Ruby 3 and Bundler installed:

```bash
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000. Pushing to `main` publishes the site; GitHub Pages rebuilds it in about a minute.

## Tests

The tests build the site and check every page in Chromium: content, links, phone-width layout, that nothing loads from other sites, and a list of strings that must never appear (such as a phone number). They need Node 22 and Playwright:

```bash
npm install --no-save playwright && npx playwright install chromium
```

```bash
bundle exec jekyll build && node --test "tests/*.test.cjs"
```

If the build stops with "Invalid US-ASCII character", run it with `LC_ALL=C.UTF-8` in front.

## Credits

Fonts: Inter, Newsreader and JetBrains Mono, under the SIL Open Font License (see `assets/fonts/`). Icons adapted from Lucide (ISC License) and Feather (MIT License).
