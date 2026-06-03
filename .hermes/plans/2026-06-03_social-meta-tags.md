# Social Meta Tags for log.daza.ar — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add comprehensive Open Graph + Twitter Card meta tags to log.daza.ar so that sharing any URL on LinkedIn, Twitter/X, Facebook, Slack, Discord, Telegram, iMessage, or any other platform produces a rich, branded card with title, description, and image.

**Architecture:** Since this is a Vite SPA deployed to GitHub Pages, we cannot do SSR. The approach is a **build-time static HTML generation** strategy: the Vite plugin that already reads `.md` files will also emit per-post HTML files (at `/0.html`, etc.) and inject `<meta>` tags into `index.html` for the homepage. These static files serve as fallbacks for crawlers that don't execute JavaScript. For the dynamic React app, we'll also add a runtime `<head>` manager (`react-helmet-async`) that updates `<title>` and meta tags on navigation. An OG image will be generated as an SVG at build time.

**Tech Stack:** Vite plugin (existing `virtual-posts`), react-helmet-async, static SVG→PNG OG image generation at build time

---

## Constraints & Decisions

1. **No SSR, no pre-rendering framework.** GitHub Pages serves static files only. We generate static meta-tag HTML files at build time alongside the SPA.
2. **Two-pronged approach:** (a) Static pre-rendered HTML pages for crawlers at `/0.html`, `/0/index.html`, etc. (b) Runtime `react-helmet-async` for the SPA once JS loads.
3. **OG image:** 1200×630 SVG generated at build time per post. We'll also create a per-post PNG via `sharp` or just serve SVG (LinkedIn and most crawlers handle SVG; Twitter requires PNG — we'll generate PNG too).
4. **Fallback:** The homepage `/` gets a generic "log — Life Across The Edges" card. Each post gets its own title, description, and OG image.
5. **The `404.html` trick:** GitHub Pages serves `404.html` for any unknown route. We already copy `index.html` → `404.html`. This means the SPA loads and React Router takes over. But crawlers hitting `/0` directly need the static meta tags immediately.

---

## Task Breakdown

### Task 1: Install react-helmet-async

**Objective:** Add the async head management library.

**Files:**
- Modify: `package.json`

**Step 1:** Install dependency

```bash
cd ~/Projects/log && npm install react-helmet-async
```

**Step 2:** Verify install

```bash
cd ~/Projects/log && npm ls react-helmet-async
```

Expected: `react-helmet-async@X.X.X` listed

**Step 3:** Commit

```bash
cd ~/Projects/log && git add package.json package-lock.json && git commit -m "chore: add react-helmet-async"
```

---

### Task 2: Wrap App with HelmetProvider

**Objective:** Enable react-helmet-async throughout the React tree.

**Files:**
- Modify: `src/main.tsx`

**Step 1:** Update main.tsx to wrap with HelmetProvider

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter basename="/">
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
```

**Step 2:** Verify build

```bash
cd ~/Projects/log && npm run build
```

Expected: Successful build with no errors.

**Step 3:** Commit

```bash
cd ~/Projects/log && git add src/main.tsx && git commit -m "feat: wrap app with HelmetProvider"
```

---

### Task 3: Add homepage meta tags with Helmet

**Objective:** Set up default meta tags for the homepage route `/`.

**Files:**
- Modify: `src/components/BlogList.tsx`

**Step 1:** Add Helmet to BlogList with homepage meta

```tsx
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getAllPosts } from "../utils/markdown";
import styles from "../styles/BlogList.module.css";

export function BlogList() {
  const posts = getAllPosts();

  return (
    <main role="main">
      <Helmet>
        <title>log — Life Across The Edges</title>
        <meta name="description" content="Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows." />
        <meta property="og:title" content="log — Life Across The Edges" />
        <meta property="og:description" content="Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://log.daza.ar" />
        <meta property="og:image" content="https://log.daza.ar/og-default.png" />
        <meta property="og:site_name" content="log" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="log — Life Across The Edges" />
        <meta name="twitter:description" content="Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows." />
        <meta name="twitter:image" content="https://log.daza.ar/og-default.png" />
        <link rel="canonical" href="https://log.daza.ar" />
      </Helmet>
      {/* ... rest of component unchanged ... */}
    </main>
  );
}
```

**Step 2:** Build and visually verify homepage title in browser tab changes.

```bash
cd ~/Projects/log && npm run build
```

**Step 3:** Commit

```bash
cd ~/Projects/log && git add src/components/BlogList.tsx && git commit -m "feat: add homepage meta tags with Helmet"
```

---

### Task 4: Add per-post meta tags with Helmet

**Objective:** Each blog post page gets its own OG title, description, image, and canonical URL.

**Files:**
- Modify: `src/components/BlogPost.tsx`

**Step 1:** Add Helmet to BlogPost

```tsx
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getAllPosts } from "../utils/markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "../styles/BlogPost.module.css";

export function BlogPost() {
  const { slug } = useParams();
  const posts = getAllPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <main>
        <div className={styles.notFound}>
          <h1>404</h1>
          <p>Post not found.</p>
          <p>
            <Link to="/">&larr; Home</Link>
          </p>
        </div>
      </main>
    );
  }

  const ogImage = `https://log.daza.ar/og-${post.slug}.png`;
  const canonicalUrl = `https://log.daza.ar/${post.slug}`;

  return (
    <main>
      <Helmet>
        <title>{post.title} — log</title>
        <meta name="description" content={post.description} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="log" />
        <meta property="article:published_time" content="2026-06-03T12:00:00Z" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <header className={styles.header}>
        <h1>{post.title}</h1>
      </header>
      <article className={styles.post}>
        <p className={styles.postMeta}>{post.date}</p>
        <div className={styles.content}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
        <footer className={styles.backLink}>
          <Link to="/">&larr; Home</Link>
        </footer>
      </article>
    </main>
  );
}
```

**Step 2:** Build and verify

```bash
cd ~/Projects/log && npm run build
```

**Step 3:** Commit

```bash
cd ~/Projects/log && git add src/components/BlogPost.tsx && git commit -m "feat: add per-post meta tags with Helmet"
```

---

### Task 5: Embed published_time in markdown frontmatter and expose it

**Objective:** Make `article:published_time` dynamic per post, not hardcoded. Add `publishedTime` to the BlogPost interface and derive it from frontmatter.

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/utils/markdown.ts`
- Modify: `src/components/BlogPost.tsx`

**Step 1:** Update `vite.config.ts` to include raw date in the virtual module

In the `load()` function, change the return object:

```ts
return {
  slug: file.replace(".md", ""),
  title: data.title,
  date: format(new Date(data.date), "MMMM dd, yyyy"),
  dateISO: new Date(data.date).toISOString(),
  description: data.description,
  content: content,
};
```

**Step 2:** Update `src/utils/markdown.ts`

```ts
import postsData from "virtual:posts";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  dateISO: string;
  description: string;
  content: string;
}

export function getAllPosts(): BlogPost[] {
  return postsData;
}
```

**Step 3:** Update BlogPost.tsx to use `post.dateISO`

```tsx
<meta property="article:published_time" content={post.dateISO} />
```

**Step 4:** Build and verify

```bash
cd ~/Projects/log && npm run build
```

**Step 5:** Commit

```bash
cd ~/Projects/log && git add vite.config.ts src/utils/markdown.ts src/components/BlogPost.tsx && git commit -m "feat: expose dateISO from frontmatter for article:published_time"
```

---

### Task 6: Generate OG images at build time

**Objective:** Create SVG OG images per post and a default one for the homepage, then convert to PNG. The images use the blog's design tokens (Playfair Display, crimson #CC0000, dark #0B0B0D background).

**Files:**
- Create: `scripts/generate-og-images.mjs`
- Modify: `vite.config.ts` (add post-build hook to run the script)
- Output: `public/og-default.png`, `public/og-0.png`

**Step 1:** Install sharp for SVG→PNG conversion

```bash
cd ~/Projects/log && npm install --save-dev sharp
```

**Step 2:** Create `scripts/generate-og-images.mjs`

```js
import sharp from "sharp";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { format } from "date-fns";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "..", "src", "content");
const publicDir = path.join(__dirname, "..", "public");

// Design tokens matching theme.css
const BG = "#0B0B0D";
const CRIMSON = "#CC0000";
const WHITE = "#FFFFFF";
const SOFT = "rgba(255, 255, 255, 0.55)";

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generatePostSvg(title, date, description) {
  // Word-wrap title to ~35 chars per line
  const words = title.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > 35 && current.length > 0) {
      lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current.trim());

  const titleYStart = 180;
  const lineSpacing = 72;
  const titleLines = lines
    .map((line, i) => {
      const y = titleYStart + i * lineSpacing;
      return `<text x="80" y="${y}" font-family="'Playfair Display', Georgia, serif" font-size="52" font-weight="700" fill="${WHITE}">${escapeXml(line)}</text>`;
    })
    .join("\n    ");

  const dateY = titleYStart + lines.length * lineSpacing + 40;
  const descY = dateY + 80;

  // Truncate description to ~90 chars
  const shortDesc = description.length > 90 ? description.slice(0, 87) + "..." : description;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BG}"/>
      <stop offset="100%" stop-color="#151518"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="80" y="120" width="5" height="${lines.length * lineSpacing - 10}" rx="2" fill="${CRIMSON}"/>
  ${titleLines}
  <text x="80" y="${dateY}" font-family="'Inter', system-ui, sans-serif" font-size="16" font-weight="500" fill="${SOFT}" letter-spacing="0.12em">${escapeXml(date.toUpperCase())}</text>
  <text x="80" y="${descY}" font-family="'JetBrains Mono', monospace" font-size="22" fill="${SOFT}">${escapeXml(shortDesc)}</text>
  <text x="80" y="590" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="600" fill="${CRIMSON}" letter-spacing="0.06em">log.daza.ar</text>
</svg>`;
}

function generateDefaultSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BG}"/>
      <stop offset="100%" stop-color="#151518"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="280" font-family="'Playfair Display', Georgia, serif" font-size="120" font-weight="900" fill="${WHITE}" text-anchor="middle">log</text>
  <text x="600" y="360" font-family="'Inter', system-ui, sans-serif" font-size="24" font-weight="400" fill="${SOFT}" text-anchor="middle" letter-spacing="0.3em">LIFE ACROSS THE EDGES</text>
  <text x="600" y="440" font-family="'JetBrains Mono', monospace" font-size="18" fill="${SOFT}" text-anchor="middle">by Juan Manuel Daza</text>
  <text x="600" y="590" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="600" fill="${CRIMSON}" text-anchor="middle" letter-spacing="0.06em">log.daza.ar</text>
</svg>`;
}

async function svgToPng(svgStr, outputPath) {
  await sharp(Buffer.from(svgStr)).png().toFile(outputPath);
}

async function main() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generate default OG image
  const defaultSvg = generateDefaultSvg();
  await svgToPng(defaultSvg, path.join(publicDir, "og-default.png"));
  console.log("Generated og-default.png");

  // Generate per-post OG images
  const mdFiles = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));

  for (const file of mdFiles) {
    const fullPath = path.join(contentDir, file);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    const slug = file.replace(".md", "");
    const date = format(new Date(data.date), "MMMM dd, yyyy");
    const title = data.title;
    const description = data.description;

    const svg = generatePostSvg(title, date, description);
    const outPath = path.join(publicDir, `og-${slug}.png`);
    await svgToPng(svg, outPath);
    console.log(`Generated og-${slug}.png`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

**Step 3:** Add OG image generation to `package.json` build script

In `package.json`, change the build script:

```json
"build": "tsc -b && node scripts/generate-og-images.mjs && vite build && cp dist/index.html dist/404.html"
```

**Step 4:** Build and verify the PNG files exist

```bash
cd ~/Projects/log && npm run build && ls -la public/og-*.png
```

Expected: `og-default.png` and `og-0.png` in `public/`

**Step 5:** Verify PNG dimensions

```bash
cd ~/Projects/log && file public/og-default.png public/og-0.png
```

Expected: Each file should be ~1200x630 PNG.

**Step 6:** Commit

```bash
cd ~/Projects/log && git add scripts/ package.json package-lock.json public/og-default.png public/og-0.png && git commit -m "feat: generate OG images at build time"
```

---

### Task 7: Generate static pre-rendered HTML for crawler fallback

**Objective:** Generate `/0.html` (and `/0/index.html`) files with full meta tags embedded directly in the HTML `<head>`, so social media crawlers that don't execute JavaScript can still read the OG tags. These files sit alongside the SPA and redirect human visitors.

**Files:**
- Create: `scripts/generate-prerendered-pages.mjs`
- Modify: `package.json` (add to build script)

**Step 1:** Create `scripts/generate-prerendered-pages.mjs`

```js
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { format } from "date-fns";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "..", "src", "content");
const distDir = path.join(__dirname, "..", "dist");

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function generateHtml(title, description, ogImage, canonicalUrl, dateISO, siteTitle = "log — Life Across The Edges") {
  const ogType = dateISO ? "article" : "website";
  const articleTag = dateISO
    ? `<meta property="article:published_time" content="${dateISO}" />`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} — log</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:site_name" content="log" />
  ${articleTag}
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ogImage}" />
  <!-- Styles preserved from SPA for brief flash -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    body { margin: 0; background: #0B0B0D; color: rgba(255,255,255,0.78); font-family: 'JetBrains Mono', monospace; }
    .redirect-notice { max-width: 720px; margin: 40vh auto; text-align: center; color: rgba(255,255,255,0.48); font-size: 14px; }
  </style>
  <script>
    // Redirect human visitors to the SPA
    window.location.replace("${canonicalUrl}");
  </script>
</head>
<body>
  <div class="redirect-notice">Loading&hellip;</div>
</body>
</html>`;
}

async function main() {
  const mdFiles = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));

  for (const file of mdFiles) {
    const fullPath = path.join(contentDir, file);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);
    const slug = file.replace(".md", "");
    const dateISO = new Date(data.date).toISOString();
    const title = data.title;
    const description = data.description;
    const ogImage = `https://log.daza.ar/og-${slug}.png`;
    const canonicalUrl = `https://log.daza.ar/${slug}`;

    const html = generateHtml(title, description, ogImage, canonicalUrl, dateISO);

    // Write to /{slug}.html AND /{slug}/index.html
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // /{slug}.html
    fs.writeFileSync(path.join(distDir, `${slug}.html`), html);
    console.log(`Generated ${slug}.html`);

    // /{slug}/index.html
    const slugDir = path.join(distDir, slug);
    if (!fs.existsSync(slugDir)) {
      fs.mkdirSync(slugDir, { recursive: true });
    }
    fs.writeFileSync(path.join(slugDir, "index.html"), html);
    console.log(`Generated ${slug}/index.html`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

**Step 2:** Update `package.json` build script

```json
"build": "tsc -b && node scripts/generate-og-images.mjs && vite build && node scripts/generate-prerendered-pages.mjs && cp dist/index.html dist/404.html"
```

**Step 3:** Build and verify the pre-rendered files

```bash
cd ~/Projects/log && npm run build
```

```bash
cat ~/Projects/log/dist/0.html | head -20
```

Expected: HTML file with `<meta property="og:title" ...>` etc.

**Step 4:** Commit

```bash
cd ~/Projects/log && git add scripts/ package.json && git commit -m "feat: generate pre-rendered HTML for crawler meta tag fallback"
```

---

### Task 8: Add base meta tags to index.html for homepage crawler fallback

**Objective:** The main `index.html` needs static OG tags too — it's the only file crawlers see for the homepage URL. The Vite build preserves these since they're in the source template.

**Files:**
- Modify: `index.html`

**Step 1:** Add meta tags to `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>log — Life Across The Edges</title>
    <meta name="description" content="Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows." />
    <!-- Open Graph -->
    <meta property="og:title" content="log — Life Across The Edges" />
    <meta property="og:description" content="Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://log.daza.ar" />
    <meta property="og:image" content="https://log.daza.ar/og-default.png" />
    <meta property="og:site_name" content="log" />
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="log — Life Across The Edges" />
    <meta name="twitter:description" content="Juan Manuel Daza's blog. Shipping code, walking away, and watching what grows." />
    <meta name="twitter:image" content="https://log.daza.ar/og-default.png" />
    <link rel="canonical" href="https://log.daza.ar" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>
```

**Step 2:** Build and verify the homepage meta tags survive into dist

```bash
cd ~/Projects/log && npm run build && grep "og:title" dist/index.html
```

Expected: `<meta property="og:title" content="log — Life Across The Edges" />`

**Step 3:** Commit

```bash
cd ~/Projects/log && git add index.html && git commit -m "feat: add static OG meta tags to index.html"
```

---

### Task 9: Verify with LinkedIn Sharing Debugger and Twitter Card Validator

**Objective:** Deploy and confirm that social platforms pick up the meta tags correctly.

**Step 1:** Push all commits to trigger deployment

```bash
cd ~/Projects/log && git push
```

**Step 2:** Wait for deployment (~90s) and verify live

```bash
cd ~/Projects/log && gh run list --limit 1
```

**Step 3:** Test with Facebook Sharing Debugger

Open: `https://developers.facebook.com/tools/debug/?q=https://log.daza.ar`
Open: `https://developers.facebook.com/tools/debug/?q=https://log.daza.ar/0`

Verify: OG image, title, description all resolve.

**Step 4:** Test with LinkedIn Post Inspector

Open: `https://www.linkedin.com/post-inspector/inspect/https://log.daza.ar/0`

Verify: The card shows title "Six Months In: The Surprise of Shipping Code and Walking Away", description, and OG image.

**Step 5:** Test with Twitter Card Validator

Open: `https://cards-dev.twitter.com/validator?url=https://log.daza.ar/0`

Verify: Large image card renders correctly.

---

### Task 10: Add `.gitignore` entry for generated OG images

**Objective:** Don't track the build-generated PNG files in Git (they're regenerated at build/deploy time). But DO keep them in `dist/` since `peaceiris/actions-gh-pages` deploys from `dist/`.

**Files:**
- Modify: `.gitignore`

**Step 1:** Add OG image patterns to `.gitignore`

Append to `.gitignore`:

```
# Generated OG images (rebuilt at build time)
public/og-*.png
```

Note: `og-default.png` and `og-0.png` are generated before Vite build, which copies everything from `public/` into `dist/`. So they'll end up in `dist/` for deployment but won't be committed to the repo.

**Step 2:** The build script already generates them before `vite build`, so Vite's `publicDir` mechanism will copy them into `dist/`. Verify:

```bash
cd ~/Projects/log && npm run build && ls dist/og-*.png
```

Expected: `og-default.png` and `og-0.png` present in `dist/`.

**Step 3:** Commit

```bash
cd ~/Projects/log && git add .gitignore && git commit -m "chore: gitignore generated OG images"
```

---

## Verification Checklist

Before declaring done, verify:

- [ ] `npm run build` succeeds with no errors
- [ ] `dist/index.html` contains homepage OG meta tags
- [ ] `dist/0.html` contains post-specific OG meta tags with correct title, description, image
- [ ] `dist/0/index.html` contains same post-specific OG meta tags
- [ ] `dist/og-default.png` exists, is 1200x630, visually matches blog design
- [ ] `dist/og-0.png` exists, is 1200x630, shows "Six Months In: The Surprise of Shipping Code and Walking Away"
- [ ] `dist/404.html` exists (for SPA fallback)
- [ ] Live site at `https://log.daza.ar` has homepage OG tags
- [ ] Live site at `https://log.daza.ar/0` has post OG tags (via `0.html` or `0/index.html`)
- [ ] LinkedIn Post Inspector shows rich card for `https://log.daza.ar/0`
- [ ] Twitter Card Validator shows large image card for `https://log.daza.ar/0`
- [ ] Facebook Sharing Debugger resolves all OG properties
- [ ] `posts.json` content matches `0.md` frontmatter
- [ ] React app still works — SPA navigation between home and post works
- [ ] Date timezone bug stays fixed (shows June 03, not June 02)

## Risks & Tradeoffs

1. **SVG fonts in OG images:** Google Fonts aren't embedded in the SVG, so the PNG generated by sharp will use system fallbacks. This is fine — sharp renders with whatever fonts are available on the build machine. For the GitHub Actions runner, we should ensure the fonts are installed or accept that the OG image will use Georgia/system serif as fallback. The visual difference is negligible at social media card sizes.
2. **Pre-rendered page JavaScript redirect:** The `0.html` and `0/index.html` files include a JS redirect to the canonical URL. This means human visitors who land on these URLs will briefly see the redirect notice before being sent to the SPA. Social crawlers, which don't execute JS, will see the meta tags and stop.
3. **React Helmet duplicate meta tags:** When the SPA loads, `react-helmet-async` will inject its own meta tags. If the page already has static meta tags (from `index.html`), Helmet will manage them correctly, updating existing tags rather than duplicating.
4. **Future posts:** Each new `.md` file in `src/content/` will automatically get its own pre-rendered HTML and OG image on the next build. No manual steps needed.