import fs from "fs";
import path from "path";
import matter from "gray-matter";
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

// --- robots.txt ---
function generateRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: https://log.daza.ar/sitemap.xml
`;
}

function writeRobotsTxt() {
  const content = generateRobotsTxt();
  fs.writeFileSync(path.join(publicDir, "robots.txt"), content);
  fs.writeFileSync(path.join(distDir, "robots.txt"), content);
  console.log("Generated robots.txt");
}

// --- sitemap.xml ---
function generateSitemap() {
  const baseUrl = "https://log.daza.ar";
  const mdFiles = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));

  const postUrls = mdFiles.map((file) => {
    const fileContents = fs.readFileSync(path.join(contentDir, file), "utf8");
    const { data } = matter(fileContents);
    const slug = file.replace(".md", "");
    const lastmod = new Date(data.date).toISOString().split("T")[0];
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

// --- Atom feed (feed.xml) ---
function generateAtomFeed() {
  const baseUrl = "https://log.daza.ar";
  const mdFiles = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));

  const entries = mdFiles.map((file) => {
    const fileContents = fs.readFileSync(path.join(contentDir, file), "utf8");
    const { data } = matter(fileContents);
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

// --- Run all ---
writeRobotsTxt();
writeSitemap();
writeAtomFeed();