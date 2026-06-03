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
    const { data } = matter(fileContents);
    const slug = file.replace(".md", "");
    const date = format(new Date(data.date), "MMMM dd, yyyy");
    const title = data.title;
    const description = data.description;

    const svg = generatePostSvg(title, date, description);
    const outPath = path.join(publicDir, `og-${slug}.png`);
    await svgToPng(svg, outPath);
    console.log(`Generated og-${slug}.png`);
  }

  // Generate apple-touch-icon from favicon.svg
  const faviconSvg = fs.readFileSync(path.join(publicDir, "favicon.svg"));
  await sharp(faviconSvg).resize(180, 180).png().toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("Generated apple-touch-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});