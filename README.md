# Architecture Render Studio

A free, browser-side toolkit for architects and designers, hosted as a static
site for ai-architect.com.

- Live domain: https://render.ai-architect.com/
- Repo: kingboss568/tool-architecture-render-prompt-studio-aiarchitect
- 52 functional tools across 10 categories, plus dashboard, catalog and utility pages (~63 pages total).

## What's inside

Every page is a real, working tool — not thin keyword content:

- **Render & diagram prompt builders** — exterior, interior, landscape, aerial,
  night, material board, sketch-to-render, negative prompts, floor plans,
  sections, massing and site plans.
- **Code-aware calculators** — FAR, parking, occupancy/egress, stairs, ramps,
  concrete, paint, tile, brick, roof pitch, solar PV, rainwater, U-value, cost,
  daylight, cooling load and room proportion. All compute live as you type.
- **Unit converters** — length, area, volume and drawing-scale.
- **Schedule builders** — door/window, room finish and FF&E with CSV export.
- **Weighted checklists** — design review, accessibility, sustainability and
  site analysis with readiness scoring.
- **Decision matrices** — material, site and concept comparison.
- **Reference libraries** — materials, architectural styles and drawing symbols.
- **Accessibility** — WCAG colour-contrast checker.

## Features

- Pure static site — no backend, no account, no upload. Saved projects and
  preferences live in the browser's local storage.
- Copy output, Save project and Download JSON on every tool.
- World-class, blueprint-inspired UI with inline SVG illustrations (no binary
  image dependencies).
- Google AdSense installed on every page (auto ads + an in-article unit), kept
  clear of the tool controls.
- SEO: per-page canonical, Open Graph, JSON-LD (SoftwareApplication + FAQ),
  sitemap and robots.

## Build

Pages are generated from data, so the site stays consistent and easy to extend.

```bash
node build.mjs
```

- `catalog.mjs` — the tool catalog (fields, engine config, copy, FAQ).
- `build.mjs` — the generator (page templates, SVG illustrations, sitemap).
- `app.js` — the config-driven tool engine (calculator, converter, prompt,
  builder, schedule, checklist, matrix, library, contrast).
- `saas.js` — local save / export / search behaviour.
- `styles.css` — the design system.

To add a tool, add an entry to `catalog.mjs` and re-run `node build.mjs`.

## AdSense

The publisher id is `ca-pub-0268893833921284`. Auto ads run from the head
script; an in-article `<ins class="adsbygoogle">` unit uses a placeholder slot
id (`AD_SLOT` in `build.mjs`) — replace it with a real AdSense slot id and
rebuild for explicitly placed units.

## Disclaimer

All results are planning-stage estimates and are not legal, code, engineering,
tax or safety certification. Always verify against local regulations, current
manufacturer data and a licensed professional before construction.
