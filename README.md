# log.daza.ar

Personal blog of Juan M Daza. Retro 90s-web aesthetic, markdown-based, deployed via GitHub Pages.

## Tech

- React 18 + TypeScript + Vite
- react-markdown for post rendering
- gray-matter for frontmatter parsing
- GitHub Pages deployment via GitHub Actions
- Dark/light theme toggle with `localStorage` persistence
- Visitor counter (CountAPI with 90s fallback)

## Structure

```
src/
├── content/          # Blog posts as .md files with frontmatter
├── components/       # React components (BlogList, BlogPost, ThemeToggle, etc.)
├── contexts/         # Theme context
├── styles/           # CSS modules (each component has its own)
├── utils/            # Helpers (markdown.ts wraps the virtual:posts module)
├── scripts/          # Standalone build scripts
├── App.tsx           # Router
└── main.tsx          # Entry point
```

## Writing a Post

Create a new `.md` file in `src/content/` with frontmatter:

```markdown
---
title: My Post Title
date: 2025-05-27
description: A short summary for the blog list.
---

# Content here

Markdown goes here.
```

The virtual module plugin in `vite.config.ts` reads all `.md` files in `src/content/` and makes them available as an importable module. No build step for posts — just add a file and rebuild.

## Development

```bash
npm install
npm run dev     # Vite dev server at localhost:5173
npm run build   # TypeScript check + production build
npm run preview # Preview the production build
```

## Deployment

Push to `main` → GitHub Actions runs the deploy workflow → site publishes to GitHub Pages with `log.daza.ar` as the custom domain.

## DNS

`log.daza.ar` is configured as a CNAME pointing to `juanmanueldaza.github.io`. Set this in your DNS provider's dashboard.

---

© {new Date().getFullYear()} Juan M Daza | Best viewed with Netscape Navigator
