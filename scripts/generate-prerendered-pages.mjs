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

function generateHtml(title, description, ogImage, canonicalUrl, dateISO) {
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

    // Write to /{slug}.html
    fs.writeFileSync(path.join(distDir, `${slug}.html`), html);
    console.log(`Generated ${slug}.html`);

    // Write to /{slug}/index.html
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