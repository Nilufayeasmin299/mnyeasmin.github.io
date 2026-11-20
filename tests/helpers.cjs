'use strict';
// Shared test helpers: serve the built _site/ on localhost and open pages in Chromium.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const SITE = path.join(__dirname, '..', '_site');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

// Map a URL path to a file in _site the way GitHub Pages does:
// "/x/" -> x/index.html; "/x" -> x, then x.html, then x/index.html.
function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const rel = clean.replace(/^\/+/, '');
  const candidates = clean.endsWith('/')
    ? [path.join(rel, 'index.html')]
    : [rel, `${rel}.html`, path.join(rel, 'index.html')];
  for (const candidate of candidates) {
    const full = path.join(SITE, candidate);
    if (!full.startsWith(SITE)) continue;
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const file = resolveFile(req.url);
      if (file) {
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
        fs.createReadStream(file).pipe(res);
        return;
      }
      const notFound = path.join(SITE, '404.html');
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not found');
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        origin: `http://127.0.0.1:${port}`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

async function openPage(browser, origin, urlPath, { width = 1440, height = 900, javaScriptEnabled = true } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, javaScriptEnabled });
  context.setDefaultTimeout(5000); // static pages: anything missing after 5s is missing
  const page = await context.newPage();
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  const response = await page.goto(origin + urlPath, { waitUntil: 'load' });
  return { page, context, requests, response };
}

async function hasHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
}

function readSiteFile(rel) {
  return fs.readFileSync(path.join(SITE, rel), 'utf8');
}

function listSiteFiles(dir = SITE) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listSiteFiles(full));
    else out.push(path.relative(SITE, full).split(path.sep).join('/'));
  }
  return out.sort();
}

function listHtmlFiles() {
  return listSiteFiles().filter((file) => file.endsWith('.html'));
}

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–',
  hellip: '…', middot: '·', copy: '©', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
};

// Text a reader sees: no tags, no <script>/<style> contents, entities decoded, whitespace collapsed.
function visibleText(rel) {
  return readSiteFile(rel)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match)
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = {
  SITE, startServer, openPage, hasHorizontalOverflow, readSiteFile, listSiteFiles, listHtmlFiles, visibleText,
};
