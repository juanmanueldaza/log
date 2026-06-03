# SDD Spec: log.daza.ar — Editorial Terminal Redesign
change_id: editorial-terminal-redesign

## Goal
Redesign log.daza.ar by blending the current retro-terminal monospace spirit with l06_p0s3's editorial avant-garde design system.

## Constraints
- React components stay structurally the same (App.tsx, BlogPost.tsx, BlogList.tsx, ThemeToggle.tsx, VisitorCounter.tsx)
- Markdown rendering unchanged (react-markdown)
- Build process unchanged (Vite, build-posts.js, GitHub Actions deploy)
- No new dependencies
- Existing routes preserved (/ and /post/:slug)

## Design System (l06_p0s3 tokens)

### Colors
```
Dark mode:
  --bg: #0B0B0D
  --bg-alt: #141416
  --text-loud: rgba(255,255,255,0.92)
  --text-body: rgba(255,255,255,0.78)
  --text-soft: rgba(255,255,255,0.48)
  --text-dim: rgba(255,255,255,0.22)
  --ghost: rgba(255,255,255,0.04)
  --ghost-hover: rgba(255,255,255,0.08)
  --rule: rgba(255,255,255,0.06)
  --crimson: #CC0000
  --serif: "Playfair Display", Georgia, serif
  --sans: "Inter", system-ui, sans-serif
  --mono: "JetBrains Mono", "Fira Code", monospace

Light mode:
  --bg: #FDFBF7
  --bg-alt: #F5F2ED
  --text-loud: rgba(0,0,0,0.90)
  --text-body: rgba(0,0,0,0.72)
  --text-soft: rgba(0,0,0,0.44)
  --text-dim: rgba(0,0,0,0.22)
  --ghost: rgba(0,0,0,0.03)
  --ghost-hover: rgba(0,0,0,0.06)
  --rule: rgba(0,0,0,0.07)
```

### Typography
- Headlines (h1, h2, h3): Playfair Display serif — weighty, editorial
- Body, metadata, nav, code: monospace (JetBrains Mono / Fira Code fallback)
- Small labels: Inter sans-serif, uppercase, wide letter-spacing (8-10px, 0.12em tracking)
- Code blocks: monospace on ghost background

### Layout
- Max reading width: 720px (not 800px) — tighter column
- No visible borders anywhere — structure from whitespace and subtle rules
- Generous padding: 2rem body, 3rem+ on post pages
- Thin left spine (optional, v2): site name vertical, theme toggle — skip for v1

### Links
- Color: crimson (#CC0000) in both modes
- No underline by default, underline on hover
- No >> prefix, no [brackets]
- Visited: slightly dimmer crimson

### Components

#### BlogList (Home)
- Site title: "log" in Playfair Display, large, centered
- Tagline below: small monospace, dim
- Post list: each post is a clean card:
  - Date: small uppercase sans-serif label, dim
  - Title: Playfair Display h2, crimson link
  - Description: monospace body text, soft
  - No border, no background — just spaced by generous margins
- Footer: "© YYYY · Visitors: N" in small monospace, dim, centered
- Theme toggle: small icon top-right

#### BlogPost
- Wide margins, centered column
- Title: Playfair Display h1, loud, left-aligned
- Date: small uppercase sans-serif, dim, below title
- Rule (subtle 1px var(--rule)) after metadata
- Body: monospace, 1.7 line-height, text-body color
- Headings within content: Playfair Display
- Code blocks: monospace, ghost background, no border
- Back link at bottom: simple crimson "← Home"
- Theme toggle: same as BlogList

### What to KEEP from current log
- Monospace body text (terminal soul)
- Visitor counter
- Simple two-route structure
- No JavaScript framework bloat
- Vite build, GitHub Pages deploy

### What to DROP from current log
- Bordered boxes (1px solid border-color)
- Blue/purple link colors (use crimson)
- >> link prefix and [Read More] brackets
- Dashed underlines
- "Best viewed with Netscape Navigator" joke
- 800px max-width (use 720px)
- background: var(--bg-secondary) on articles

## Files to Modify
1. `src/styles/theme.css` — full redesign with l06_p0s3 tokens
2. `src/styles/base.css` — typography, body, headings
3. `src/styles/links.css` — crimson links
4. `src/styles/layout.css` — reading column, margins
5. `src/styles/retro.css` — keep scrollbar, drop the rest
6. `src/styles/BlogList.module.css` — editorial post list
7. `src/styles/BlogPost.module.css` — editorial post layout
8. `src/styles/reset.css` — may need minor adjustments
9. `src/styles/blink.css` — keep if still used
10. `src/styles/ThemeToggle.module.css` — match new theme
11. `src/components/BlogList.tsx` — remove Netscape joke, adjust markup
12. `src/components/BlogPost.tsx` — adjust markup if needed
13. `src/index.html` — add Google Fonts link for Playfair Display + Inter + JetBrains Mono

## Success Criteria
- Both light and dark themes look cohesive
- Playfair Display loads and renders for headlines
- No borders visible anywhere
- Crimson links functional in both themes
- Monospace body text preserved
- Visitor counter still works
- Build succeeds (`npm run build`)
- Site renders correctly at log.daza.ar
- Mobile: readable at 320px width
