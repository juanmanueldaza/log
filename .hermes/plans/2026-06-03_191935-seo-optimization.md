# SEO Optimization for log.daza.ar — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Make log.daza.ar a fully SEO-optimized personal blog that ranks for relevant queries (author name, linkedin2md, CLI tools, open source stories) and renders rich results in Google, LinkedIn, Twitter/X, and Discord previews.

**Architecture:** Build-time generation (Vite plugins + Node scripts). All SEO artifacts are static files produced during `npm run build`. No SSR, no server runtime.

**Tech Stack:** Vite (existing), react-helmet-async (already installed), Node scripts for sitemap/robots/JSON-LD generation.

---

## Current State Audit

| Area | Status |
|------|--------|
| Open Graph tags | Done (homepage + per-post via Helmet + pre-rendered) |
| Twitter Card tags | Done |
| Canonical URLs | Done |
| `robots.txt` | **Missing** |
| `sitemap.xml` | **Missing** |
| JSON-LD structured data | **Missing** |
| `<html lang>` | Present (`lang="en"`) |
| Heading hierarchy | H1 in header, H2+ in markdown — **missing `<article>` semantic wrapping** |
| `<time>` element | **Missing** — date shown as `<p>` instead of `<time datetime>` |
| Alt text on images | N/A (no images in current posts) |
| Font preloading | **Missing** — `font-display: swap` not explicitly set |
| Performance: render-blocking fonts | Google Fonts CSS is render-blocking |
| Accessibility: skip nav link | **Missing** |
| `og:image:width`/`og:image:height` | **Missing** — helps platforms cache/resize |
| `og:locale` | **Missing** |
| `twitter:creator` | **Missing** |
| RSS/Atom feed | **Missing** |
| Favicon (multiple sizes) | Only SVG — **missing apple-touch-icon, ico fallback** |
| Dark mode `meta theme-color` | **Missing** |
| `rel=me` links | Footer links exist but **lack `rel="me"`** for identity verification |

---

## Task Breakdown

### Task 1: Generate `robots.txt` at build time

**Objective:** Create `robots.txt` allowing all crawlers, pointing to sitemap.

**Files:**
- Create: `scripts/generate-seo-files.mjs` (consolidated script for all build-time SEO files)
- Modify: `package.json` (add to build script)

**Step 1:** Create `scripts/generate-seo-files.mjs`

```js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const publicDir = path.join(__dirname, "..", "public");

function generateRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: https://log.daza.ar/sitemap.xml
`;
}

function writeRobotsTxt() {
  const content = generateRobotsTxt();
  // Write to both public/ (for dev) and dist/ (for production)
  fs.writeFileSync(path.join(publicDir, "robots.txt"), content);
  fs.writeFileSync(path.join(distDir, "robots.txt"), content);
  console.log("Generated robots.txt");
}

export { generateRobotsTxt, writeRobotsTxt, distDir, publicDir };
```

**Step 2:** Add to build pipeline in `package.json`

The `generate-seo-files.mjs` script will grow as we add more files. For now, add it to the build:

```json
"build": "tsc -b && node scripts/generate-og-images.mjs && vite build && node scripts/generate-prerendered-pages.mjs && node scripts/generate-seo-files.mjs && cp dist/index.html dist/404.html"
```

**Step 3:** Build and verify

```bash
cd ~/Projects/log && npm run build && cat dist/robots.txt
```

Expected: robots.txt with User-agent: * and Sitemap line.

**Step 4:** Commit

```bash
git add scripts/ package.json public/robots.txt && git commit -m "feat: generate robots.txt at build time"
```

---

### Task 2: Generate `sitemap.xml` at build time

**Objective:** Auto-generate XML sitemap from blog posts with proper `<lastmod>`, `<changefreq>`, and `<priority>`.

**Files:**
- Modify: `scripts/generate-seo-files.mjs`

**Step 1:** Add sitemap generation to `scripts/generate-seo-files.mjs`

```js
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { format } from "date-fns";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const publicDir = path.join(__dirname, "..", "public");
const contentDir = path.join(__dirname, "..", "src", "content");

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemap() {
  const baseUrl = "https://log.daza.ar";
  const mdFiles = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));

  const postUrls = mdFiles.map((file) => {
    const fileContents = fs.readFileSync(path.join(contentDir, file), "utf8");
    const { data } = matter(fileContents);
    const slug = file.replace(".md", "");
    const lastmod = new Date(data.date).toISOString().split("T")[0]; // YYYY-MM-DD
    return `  <url>
    <loc>${baseUrl}/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${postUrls}
</urlset>`;
}

function writeSitemap() {
  const content = generateSitemap();
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), content);
  console.log("Generated sitemap.xml");
}

export { generateSitemap, writeSitemap, distDir, publicDir, contentDir };
```

Add the main execution:

```js
// At bottom of generate-seo-files.mjs
writeRobotsTxt();
writeSitemap();
```

**Step 2:** Build and verify

```bash
cd ~/Projects/log && npm run build && cat dist/sitemap.xml
```

Expected: Valid XML sitemap with homepage + /0 entry.

**Step 3:** Commit

```bash
git add scripts/ && git commit -m "feat: generate sitemap.xml at build time"
```

---

### Task 3: Add JSON-LD structured data (BlogPosting + WebSite)

**Objective:** Inject JSON-LD schema.org markup for rich results in Google. Homepage gets `WebSite` schema, each post gets `BlogPosting` schema.

**Files:**
- Modify: `src/components/BlogList.tsx` (add WebSite JSON-LD)
- Modify: `src/components/BlogPost.tsx` (add BlogPosting JSON-LD)

**Step 1:** Add WebSite JSON-LD to BlogList

Inside `BlogList.tsx`, inside the `<Helmet>` tag, add a JSON-LD script:

```tsx
<Helmet>
  {/* ... existing meta tags ... */}
  <script type="application/ld+json">{JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "log",
    "alternateName": "Life Across The Edges",
    "url": "https://log.daza.ar",
    "description": "Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows.",
    "author": {
      "@type": "Person",
      "name": "Juan Manuel Daza",
      "url": "https://daza.ar"
    }
  })}</script>
</Helmet>
```

**Step 2:** Add BlogPosting JSON-LD to BlogPost

In `BlogPost.tsx`, add inside the `<Helmet>` tag:

```tsx
<script type="application/ld+json">{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.title,
  "description": post.description,
  "datePublished": post.dateISO,
  "author": {
    "@type": "Person",
    "name": "Juan Manuel Daza",
    "url": "https://daza.ar"
  },
  "url": canonicalUrl,
  "image": ogImage,
  "publisher": {
    "@type": "Organization",
    "name": "log",
    "logo": {
      "@type": "ImageObject",
      "url": "https://log.daza.ar/favicon.svg"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": canonicalUrl
  }
})}</script>
```

**Step 3:** Build and verify JSON-LD appears in page source

```bash
cd ~/Projects/log && npm run build
```

Open `dist/index.html` in browser, view source, verify `<script type="application/ld+json">` is present.

**Step 4:** Also add JSON-LD to the pre-rendered pages. Update `scripts/generate-prerendered-pages.mjs` to inject the same BlogPosting JSON-LD into `0.html`.

In the `injectMetaTags` function, before the `</head>` insertion, add:

```js
const jsonLd = dateISO ? JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": title,
  "description": description,
  "datePublished": dateISO,
  "author": {
    "@type": "Person",
    "name": "Juan Manuel Daza",
    "url": "https://daza.ar"
  },
  "url": canonicalUrl,
  "image": ogImage,
  "publisher": {
    "@type": "Organization",
    "name": "log",
    "logo": {
      "@type": "ImageObject",
      "url": "https://log.daza.ar/favicon.svg"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": canonicalUrl
  }
}) : JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "log",
  "alternateName": "Life Across The Edges",
  "url": canonicalUrl,
  "description": description,
  "author": {
    "@type": "Person",
    "name": "Juan Manuel Daza",
    "url": "https://daza.ar"
  }
});
```

Then inject: `<script type="application/ld+json">${jsonLd}</script>` before `</head>`.

**Step 5:** Commit

```bash
git add src/components/ scripts/ && git commit -m "feat: add JSON-LD structured data for WebSite and BlogPosting"
```

---

### Task 4: Add `<time>` element and `datetime` attribute

**Objective:** Replace the date `<p>` with a semantic `<time>` element carrying an ISO `datetime` attribute. Google uses this for article dates.

**Files:**
- Modify: `src/components/BlogPost.tsx`

**Step 1:** Change the date paragraph

```tsx
// Before:
<p className={styles.postMeta}>{post.date}</p>

// After:
<time className={styles.postMeta} dateTime={post.dateISO}>{post.date}</time>
```

**Step 2:** Verify `.postMeta` style still applies to `<time>` — it uses a class selector so it'll work on any element.

**Step 3:** Build and commit

```bash
cd ~/Projects/log && npm run build
git add src/components/BlogPost.tsx && git commit -m "feat: use semantic <time> element with datetime attribute"
```

---

### Task 5: Add `og:image:width`, `og:image:height`, `og:locale`, `twitter:creator`

**Objective:** Add missing OG image dimensions (helps platforms cache/resize), locale, and Twitter creator handle.

**Files:**
- Modify: `src/components/BlogList.tsx`
- Modify: `src/components/BlogPost.tsx`
- Modify: `scripts/generate-prerendered-pages.mjs`
- Modify: `index.html`

**Step 1:** Add to BlogList `<Helmet>`:

```tsx
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_US" />
<meta name="twitter:creator" content="@juanmanueldaza" />
```

**Step 2:** Add to BlogPost `<Helmet>`:

```tsx
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_US" />
<meta name="twitter:creator" content="@juanmanueldaza" />
```

**Step 3:** Add to `index.html` (static homepage tags) and `generate-prerendered-pages.mjs` (crawler fallback).

**Step 4:** Build and commit

```bash
git add src/components/ index.html scripts/ && git commit -m "feat: add og:image dimensions, locale, and twitter:creator"
```

---

### Task 6: Add `meta theme-color` and Apple touch icons

**Objective:** Dark theme color for browser chrome; Apple touch icon for iOS home screen bookmark.

**Files:**
- Modify: `index.html`
- Create: `public/apple-touch-icon.png` (generated from favicon.svg)
- Modify: `scripts/generate-og-images.mjs` (add apple-touch-icon generation)

**Step 1:** Add to `index.html` `<head>`:

```html
<meta name="theme-color" content="#0B0B0D" media="(prefers-color-scheme: dark)" />
<meta name="theme-color" content="#FDFBF7" media="(prefers-color-scheme: light)" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

**Step 2:** Generate 180x180 apple-touch-icon.png from favicon.svg in the OG image script:

```js
// In generate-og-images.mjs, add:
const faviconSvg = fs.readFileSync(path.join(publicDir, "favicon.svg"));
await sharp(faviconSvg).resize(180, 180).png().toFile(path.join(publicDir, "apple-touch-icon.png"));
console.log("Generated apple-touch-icon.png");
```

**Step 3:** Also add theme-color and apple-touch-icon to the pre-rendered pages script and the Helmet components.

**Step 4:** Commit

```bash
git add index.html public/apple-touch-icon.png scripts/ src/components/ && git commit -m "feat: add theme-color meta and apple-touch-icon"
```

---

### Task 7: Add `rel="me"` links to footer for identity verification

**Objective:** Add `rel="me"` to social links in the footer so search engines (and Mastodon/IndieAuth) can verify identity across platforms.

**Files:**
- Modify: `src/components/BlogList.tsx`

**Step 1:** Update footer links:

```tsx
<a href="https://linkedin.com/in/juanmanueldaza" rel="me">LinkedIn</a>
<a href="https://github.com/juanmanueldaza" rel="me">GitHub</a>
<a href="https://gitlab.com/juanmanueldaza" rel="me">GitLab</a>
<a href="https://pypi.org/user/juanmanueldaza/" rel="me">PyPI</a>
<a href="mailto:juanmanueldaza@gmail.com" rel="me">Email</a>
```

**Step 2:** Commit

```bash
git add src/components/BlogList.tsx && git commit -m "feat: add rel=me to social links for identity verification"
```

---

### Task 8: Add RSS/Atom feed generation

**Objective:** Generate an Atom feed at `/feed.xml` so readers can subscribe. Essential for blog discoverability.

**Files:**
- Modify: `scripts/generate-seo-files.mjs` (add feed generation)

**Step 1:** Add Atom feed generation:

```js
function generateAtomFeed() {
  const baseUrl = "https://log.daza.ar";
  const mdFiles = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));

  const entries = mdFiles.map((file) => {
    const fileContents = fs.readFileSync(path.join(contentDir, file), "utf8");
    const { data, content } = matter(fileContents);
    const slug = file.replace(".md", "");
    const dateISO = new Date(data.date).toISOString();
    const title = data.title;
    const description = data.description;

    return `  <entry>
    <title>${escapeXml(title)}</title>
    <link href="${baseUrl}/${slug}" />
    <id>${baseUrl}/${slug}</id>
    <updated>${dateISO}</updated>
    <summary>${escapeXml(description)}</summary>
  </entry>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>log — Life Across The Edges</title>
  <link href="${baseUrl}/" />
  <link href="${baseUrl}/feed.xml" rel="self" />
  <id>${baseUrl}/</id>
  <updated>${new Date().toISOString()}</updated>
  <author>
    <name>Juan Manuel Daza</name>
    <uri>${baseUrl}</uri>
  </author>
${entries}
</feed>`;
}

function writeAtomFeed() {
  const content = generateAtomFeed();
  fs.writeFileSync(path.join(distDir, "feed.xml"), content);
  console.log("Generated feed.xml");
}
```

Also add to `index.html`:
```html
<link rel="alternate" type="application/atom+xml" title="log — Life Across The Edges" href="/feed.xml" />
```

And add the same `<link>` to Helmet in `BlogList.tsx`.

**Step 2:** Build, verify feed at `/feed.xml`

**Step 3:** Commit

```bash
git add scripts/ src/components/ index.html && git commit -m "feat: generate Atom feed"
```

---

### Task 9: Add accessibility skip-nav link

**Objective:** Add a visually-hidden skip-to-content link for keyboard/screen reader users. Also benefits SEO by providing better navigation structure.

**Files:**
- Modify: `src/styles/layout.css` (add skip-link styles)
- Modify: `src/components/BlogList.tsx` (add skip link)
- Modify: `src/components/BlogPost.tsx` (add skip link)

**Step 1:** Add to `layout.css`:

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: var(--crimson);
  color: #fff;
  padding: 0.5rem 1rem;
  z-index: 100;
  font-family: var(--sans);
  font-size: 0.85rem;
  text-decoration: none;
}

.skip-link:focus {
  top: 0;
}
```

**Step 2:** Add skip link as first child of `<main>` in both components:

```tsx
<a href="#main-content" className="skip-link">Skip to content</a>
```

And add `id="main-content"` to the content wrapper.

**Step 3:** Commit

```bash
git add src/styles/ src/components/ && git commit -m "feat: add skip-nav link for accessibility and SEO"
```

---

### Task 10: Font preload and display optimization

**Objective:** Preload critical font files and add `font-display: swap` to avoid invisible text during load. This directly impacts Core Web Vitals (LCP, CLS).

**Files:**
- Modify: `index.html` (add preload links for critical fonts)
- Modify: `vite.config.ts` or add a small script to optimize font loading

**Step 1:** Add font preload links to `index.html`:

```html
<link rel="preload" as="font" type="font/woff2" href="https://fonts.gstatic.com/s/playfairdisplay/v36/nuFvD-vYSZviVYUb7jOESw.woff2" crossorigin />
<link rel="preload" as="font" type="font/woff2" href="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTcviYwY.woff2" crossorigin />
<link rel="preload" as="font" type="font/woff2" href="https://fonts.gstatic.com/s/jetbrainsmono/v20/tDbY2o-flEEny0FZhsfK.woff2" crossorigin />
```

Note: The exact URLs change with Google Fonts version updates. A more robust approach is to use the `&display=swap` parameter (already present via the Google Fonts URL) which handles this via CSS. The `preconnect` links already present are the main optimization needed. Adding preload for specific font URLs is fragile — skip the preload links and instead verify the Google Fonts URL already includes `display=swap` (it does).

**Better Step 1:** Add `<meta name="color-scheme" content="dark light">` to index.html for proper dark mode handling:

```html
<meta name="color-scheme" content="dark light" />
```

**Step 2:** Commit

```bash
git add index.html && git commit -m "feat: add color-scheme meta tag for proper dark mode"
```

---

### Task 11: Add Google Search Console verification

**Objective:** Add a meta tag for Google Search Console verification so you can monitor indexing and search performance.

**Files:**
- Modify: `index.html` (add verification meta tag)

**Step 1:** The user needs to first claim the property in Google Search Console. Then Google will provide a verification meta tag. For now, add a placeholder that will be updated:

```html
<!-- Google Search Console verification: replace with actual meta tag -->
<!-- <meta name="google-site-verification" content="YOUR_CODE_HERE" /> -->
```

Leave as a comment for now, with instructions in the plan. The user will uncomment after verifying with Google.

**Step 2:** Commit (when actual verification code is obtained)

---

## Verification Checklist

After all tasks are complete, verify:

- [ ] `robots.txt` accessible at `https://log.daza.ar/robots.txt`
- [ ] `sitemap.xml` accessible at `https://log.daza.ar/sitemap.xml` and valid
- [ ] `feed.xml` accessible at `https://log.daza.ar/feed.xml` and valid Atom
- [ ] JSON-LD validates at `https://validator.schema.org/`
- [ ] Google Rich Results Test passes for `https://log.daza.ar/0`
- [ ] LinkedIn Post Inspector shows rich card for `/0`
- [ ] Twitter Card Validator shows large image card for `/0`
- [ ] `<time>` element present in post page with `datetime` attribute
- [ ] `og:image:width`, `og:image:height`, `og:locale`, `twitter:creator` all present
- [ ] `theme-color` meta present
- [ ] `apple-touch-icon.png` accessible
- [ ] `rel="me"` on all social links
- [ ] Skip-nav link present and functional
- [ ] `color-scheme` meta tag present
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms (check with Lighthouse)
- [ ] Lighthouse SEO score > 95

## Risks & Tradeoffs

1. **Static generation fragility:** The pre-rendered pages and sitemap are generated at build time. If a post date is wrong, it propagates everywhere. The `dateISO` field from frontmatter is the single source of truth.
2. **Google Fonts preload URLs:** Font URLs change when Google updates their CDN. Preloading specific woff2 URLs is fragile and will break silently. The `display=swap` parameter (already in use) is the safer optimization. Preconnect is sufficient.
3. **JSON-LD in React Helmet:** Helmet injects `<script type="application/ld+json">` into the DOM at runtime. Crawlers that don't execute JS won't see it. The pre-rendered pages (`0.html`) include it statically, which covers most social crawlers. Googlebot does execute JS, so Helmet-injected JSON-LD will be picked up.
4. **Atom feed with HTML content:** The current feed only includes `<summary>` (the description). A richer feed would include `<content type="html">` with the full rendered HTML, but that requires running the markdown renderer at build time. This can be added later.