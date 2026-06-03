import fs from "fs";
import path from "path";
import matter from "gray-matter";
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

  const metaTags = `<meta name="description" content="${escapeHtml(description)}" />
    <meta name="color-scheme" content="dark light" />
    <meta name="theme-color" content="#0B0B0D" media="(prefers-color-scheme: dark)" />
    <meta name="theme-color" content="#FDFBF7" media="(prefers-color-scheme: light)" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="alternate" type="application/atom+xml" title="log — Life Across The Edges" href="/feed.xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:site_name" content="log" />${articleTag}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta name="twitter:creator" content="@juanmanueldaza" />
    <script type="application/ld+json">${jsonLd}</script>`;

  // Replace the title
  let result = html.replace(
    /<title>.*?<\/title>/,
    `<title>${escapeHtml(title)} — log</title>`
  );

  // Remove ALL existing og/twitter/description/canonical/theme-color/color-scheme/apple-touch-icon/feed meta/link tags and comments from template
  result = result.replace(/<meta\s+property="og:[^"]*"[^>]*\/?\s*>\n?/g, "");
  result = result.replace(/<meta\s+name="twitter:[^"]*"[^>]*\/?\s*>\n?/g, "");
  result = result.replace(/<meta\s+name="description"[^>]*\/?\s*>\n?/g, "");
  result = result.replace(/<meta\s+name="theme-color"[^>]*\/?\s*>\n?/g, "");
  result = result.replace(/<meta\s+name="color-scheme"[^>]*\/?\s*>\n?/g, "");
  result = result.replace(/<link\s+rel="canonical"[^>]*\/?\s*>\n?/g, "");
  result = result.replace(/<link\s+rel="alternate"[^>]*\/?\s*>\n?/g, "");
  result = result.replace(/<link\s+rel="apple-touch-icon"[^>]*\/?\s*>\n?/g, "");
  result = result.replace(/<!--\s*(Open Graph|Twitter Card)\s*-->\n?/g, "");
  result = result.replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\n?/g, "");

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