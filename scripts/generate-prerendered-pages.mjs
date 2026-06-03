import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { format } from "date-fns";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "..", "src", "content");
const distDir = path.join(__dirname, "..", "dist");

// Read the built SPA index.html as a template
const spaTemplate = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function injectMetaTags(html, title, description, ogImage, canonicalUrl, dateISO) {
  const ogType = dateISO ? "article" : "website";
  const articleTag = dateISO
    ? `\n    <meta property="article:published_time" content="${dateISO}" />`
    : "";

  const metaTags = `<meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:site_name" content="log" />${articleTag}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />`;

  // Replace the title
  let result = html.replace(
    /<title>.*?<\/title>/,
    `<title>${escapeHtml(title)} — log</title>`
  );

  // Remove ALL existing og/twitter/description/canonical meta tags and comments from template
  result = result.replace(/<meta\s+property="og:[^"]*"[^>]*\/?\s*>\n?/g, "");
  result = result.replace(/<meta\s+name="twitter:[^"]*"[^>]*\/?\s*>\n?/g, "");
  result = result.replace(/<meta\s+name="description"[^>]*\/?\s*>\n?/g, "");
  result = result.replace(/<link\s+rel="canonical"[^>]*\/?\s*>\n?/g, "");
  result = result.replace(/<!--\s*(Open Graph|Twitter Card)\s*-->\n?/g, "");
  // Clean up blank lines left by removals
  result = result.replace(/\n\s*\n\s*\n/g, "\n\n");

  // Inject new meta tags right before </head>
  result = result.replace("</head>", `    ${metaTags}\n  </head>`);

  return result;
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

    const html = injectMetaTags(spaTemplate, title, description, ogImage, canonicalUrl, dateISO);

    // Write to /{slug}.html — GitHub Pages serves this for /{slug} requests
    // This is a full SPA entry point with per-post meta tags injected
    fs.writeFileSync(path.join(distDir, `${slug}.html`), html);
    console.log(`Generated ${slug}.html`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});