// Static site generator for Architecture Render Prompt Studio.
// Renders every tool in catalog.mjs plus dashboard, catalog and utility pages.
// Run with: node build.mjs
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TOOLS, CATEGORIES } from "./catalog.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const ADSENSE_CLIENT = "ca-pub-0268893833921284";
const AD_SLOT = "1234567890"; // placeholder display slot — replace with a real AdSense slot id
const DOMAIN = "https://render.ai-architect.com";
const THEME = "--bg:#eef1ec;--panel:#ffffff;--ink:#16201f;--accent:#137a6e;--accent-2:#c9772d;--line:#d8ded6";

// Flagship studio tool (the original render prompt tool) lives at /tool/.
const FLAGSHIP = {
  slug: "tool", title: "Render Prompt Studio", category: "Render Prompts", kind: "prompt",
  desc: "The flagship studio: build layered architectural render prompts with copy, save and JSON export.",
  howto: "Set the project, direction and constraints and the studio returns concept, technical and client prompt variants — buildable by design and ready to paste into any image model.",
  tags: ["render prompt", "flagship", "AI prompt"],
  fields: [
    { id: "projectType", label: "Project type", type: "text", default: "compact mixed-use building" },
    { id: "style", label: "Design direction", type: "select", options: ["quiet modern", "warm minimal", "urban adaptive reuse", "tropical contemporary"], default: "warm minimal" },
    { id: "constraints", label: "Constraints", type: "textarea", default: "narrow site, shaded entry, efficient circulation, realistic structure", rows: 4 },
    { id: "outputFormat", label: "Output format", type: "select", options: ["concept sketch", "render prompt", "diagram prompt", "client brief"], default: "render prompt" }
  ],
  engine: { variants: [
    { title: "Concept", body: "{{projectType}}, {{style}} architectural direction, {{constraints}}, clear massing, realistic structure, {{outputFormat}}, practical material logic." },
    { title: "Technical", body: "{{projectType}} with {{constraints}}. Produce a technical architecture diagram prompt with circulation, envelope, services, and review labels." },
    { title: "Client", body: "Client-facing {{outputFormat}} for {{projectType}}. Keep the language professional, avoid impossible structure, and emphasize buildable decisions." }
  ] },
  examples: [
    { title: "First working pass", body: "Turn a loose brief into a copy-ready prompt set you can review, save or export." },
    { title: "Repeat workflow", body: "Saved projects stay in this browser so you can return to the same workflow without a login." },
    { title: "Professional review", body: "Use the result as a structured starter, then confirm rules, standards and assumptions before final use." }
  ],
  faq: [
    { q: "Is the studio free?", a: "Yes — a free, browser-side tool with copy, save and JSON export." },
    { q: "Does it replace a professional?", a: "No. It creates a strong first pass; final decisions still need qualified review." },
    { q: "Where are projects saved?", a: "In this browser's local storage, for the static build." }
  ],
  limits: [
    "Do not treat generated outputs as legal, code, engineering, tax or safety certification.",
    "No private credentials are required by this static site.",
    "Ad placements stay outside primary action controls."
  ]
};

const ALL = [FLAGSHIP, ...TOOLS];
const bySlug = Object.fromEntries(ALL.map((t) => [t.slug, t]));

// ----------------------------------------------------------------------------
// SVG illustrations (inline, theme-aware, dependency-free)
// ----------------------------------------------------------------------------
const A = "#137a6e", B = "#c9772d", C = "#2b5c8a", INK = "#16201f", LINE = "#cfd6cd";

function heroArt() {
  return `<svg viewBox="0 0 520 420" role="img" aria-label="Isometric architectural study" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${A}" stop-opacity="0.14"/><stop offset="1" stop-color="${B}" stop-opacity="0.10"/>
    </linearGradient>
    <pattern id="hgrid" width="26" height="26" patternUnits="userSpaceOnUse">
      <path d="M26 0H0V26" fill="none" stroke="${A}" stroke-opacity="0.14" stroke-width="1"/>
    </pattern>
  </defs>
  <rect x="8" y="8" width="504" height="404" rx="20" fill="url(#hg)"/>
  <rect x="8" y="8" width="504" height="404" rx="20" fill="url(#hgrid)"/>
  <g fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M150 300 L260 240 L370 300 L260 360 Z" fill="#ffffff" fill-opacity="0.7"/>
    <path d="M150 300 L150 200 L260 140 L260 240" fill="${A}" fill-opacity="0.12"/>
    <path d="M260 240 L260 140 L370 200 L370 300" fill="${A}" fill-opacity="0.20"/>
    <path d="M150 200 L260 140 L370 200 L260 260 Z" fill="#ffffff" fill-opacity="0.85"/>
    <path d="M186 232 L186 188" stroke-opacity="0.5"/><path d="M222 252 L222 208" stroke-opacity="0.5"/>
    <path d="M300 220 L300 264" stroke-opacity="0.5"/><path d="M336 200 L336 244" stroke-opacity="0.5"/>
  </g>
  <g stroke="${B}" stroke-width="2.4" fill="none" stroke-linecap="round">
    <path d="M96 360 L96 120"/><path d="M96 120 L150 96"/>
    <circle cx="96" cy="120" r="5" fill="${B}"/>
  </g>
  <g stroke="${C}" stroke-width="1.6" stroke-dasharray="5 6" opacity="0.7">
    <path d="M370 300 L450 300"/><path d="M260 360 L260 396"/>
  </g>
  <g fill="${INK}" font-family="Inter, sans-serif" font-size="13" opacity="0.55">
    <text x="404" y="296">scale 1:100</text>
  </g>
</svg>`;
}

// 46x46 line icons keyed by category
function catIcon(cat) {
  const s = (inner) => `<svg viewBox="0 0 44 44" width="44" height="44" fill="none" stroke="${A}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="41" height="41" rx="11" fill="${A}" fill-opacity="0.08" stroke="${A}" stroke-opacity="0.25"/>${inner}</svg>`;
  const I = {
    "Render Prompts": `<path d="M13 30 L20 18 L27 26 L31 22 L31 30 Z" fill="${A}" fill-opacity="0.15"/><circle cx="17" cy="16" r="2.4"/><rect x="12" y="13" width="20" height="18" rx="2"/>`,
    "Diagram Prompts": `<rect x="12" y="12" width="20" height="20" rx="2"/><path d="M12 22 H32 M22 12 V32"/><circle cx="17" cy="17" r="1.6" fill="${A}"/>`,
    "Briefs & Docs": `<rect x="13" y="11" width="18" height="22" rx="2"/><path d="M17 17 H27 M17 22 H27 M17 27 H23"/>`,
    "Calculators": `<rect x="13" y="11" width="18" height="22" rx="2"/><path d="M17 16 H27 M17 22 H19 M22 22 H24 M27 22 V28 M17 27 H19 M22 27 H24"/>`,
    "Converters": `<path d="M14 18 H30 L26 14 M30 26 H14 L18 30"/>`,
    "Schedules": `<rect x="12" y="13" width="20" height="18" rx="2"/><path d="M12 19 H32 M19 13 V31 M26 13 V31"/>`,
    "Checklists": `<path d="M14 16 l2 2 l4 -4 M14 24 l2 2 l4 -4 M24 16 H30 M24 24 H30 M14 31 l2 2 l4 -4 M24 32 H30"/>`,
    "Decision Matrix": `<rect x="12" y="12" width="9" height="9" rx="1.5"/><rect x="23" y="12" width="9" height="9" rx="1.5" fill="${A}" fill-opacity="0.18"/><rect x="12" y="23" width="9" height="9" rx="1.5"/><rect x="23" y="23" width="9" height="9" rx="1.5"/>`,
    "Reference Library": `<path d="M22 14 C18 11 14 12 13 13 V31 C14 30 18 29 22 31 C26 29 30 30 31 31 V13 C30 12 26 11 22 14 Z"/><path d="M22 14 V31"/>`,
    "Accessibility": `<circle cx="22" cy="15" r="3"/><path d="M14 21 H30 M22 21 V28 L18 33 M22 28 L26 33"/>`
  };
  return s(I[cat] || I["Calculators"]);
}

// medium 120-wide illustration for page-title panels
function catIllus(cat) {
  return `<svg viewBox="0 0 120 120" width="120" height="120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="114" height="114" rx="18" fill="${A}" fill-opacity="0.06" stroke="${A}" stroke-opacity="0.18"/>
    <g transform="translate(38,38) scale(2.3)" stroke="${A}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none">${catIconInner(cat)}</g>
  </svg>`;
}
function catIconInner(cat) {
  // reuse the inner paths from catIcon by stripping the wrapper
  const m = catIcon(cat).match(/<rect[^>]*\/>(.*)<\/svg>/s);
  return m ? m[1].replace(/transform="[^"]*"/g, "") : "";
}

// ----------------------------------------------------------------------------
// HTML helpers
// ----------------------------------------------------------------------------
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function head(title, description, canonical, up) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="theme-color" content="#137a6e">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta name="google-adsense-account" content="${ADSENSE_CLIENT}">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>
  <link rel="preconnect" href="https://rsms.me/">
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <link rel="stylesheet" href="${up}styles.css">
</head>
<body style="${THEME}">`;
}

function topbar(up) {
  return `<header class="topbar">
    <a class="brand" href="${up}"><span class="brand-mark">AR</span><span>Architecture Render Studio<small>ai-architect.com</small></span></a>
    <nav class="nav" aria-label="Primary">
      <a href="${up}tools/">All tools</a>
      <a href="${up}workspace/">Workspace</a>
      <a href="${up}plans/">Plans</a>
      <a href="${up}about/">About</a>
      <a class="cta" href="${up}tool/">Open studio</a>
    </nav>
  </header>`;
}

const SIDE = [
  { href: "", label: "Dashboard", key: "home" },
  { href: "tools/", label: "All tools", key: "tools" },
  { href: "tool/", label: "Render studio", key: "tool" },
  { href: "workspace/", label: "Workspace", key: "workspace" },
  { href: "reports/", label: "Reports", key: "reports" },
  { href: "templates/", label: "Templates", key: "templates" },
  { href: "settings/", label: "Settings", key: "settings" },
  { href: "integrations/", label: "Integrations", key: "integrations" },
  { href: "plans/", label: "Plans", key: "plans" },
  { href: "faq/", label: "FAQ", key: "faq" },
  { href: "about/", label: "About", key: "about" }
];

function sidebar(up, current) {
  const links = SIDE.map((s) => `<a href="${up}${s.href}"${s.key === current ? ' aria-current="page"' : ""}><span class="dot"></span>${esc(s.label)}</a>`).join("");
  return `<nav class="side-nav" aria-label="App sections"><span class="side-label">Workspace</span>${links}</nav>`;
}

function adUnit() {
  return `<div class="ad-unit" aria-label="Advertisement"><span>Advertisement</span>
      <ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE_CLIENT}" data-ad-slot="${AD_SLOT}" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>`;
}

function footer(up) {
  const cols = [
    { h: "Studio", links: [["Render studio", "tool/"], ["All tools", "tools/"], ["Workspace", "workspace/"], ["Plans", "plans/"]] },
    { h: "Popular", links: [["FAR calculator", "far-calculator/"], ["Stair calculator", "stair-calculator/"], ["Exterior render prompt", "exterior-render-prompt/"], ["Colour contrast", "color-contrast-checker/"]] },
    { h: "Company", links: [["About", "about/"], ["FAQ", "faq/"], ["Integrations", "integrations/"], ["Privacy", "privacy/"]] }
  ];
  return `<footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <a class="brand" href="${up}"><span class="brand-mark">AR</span><span>Architecture Render Studio</span></a>
        <p>A free, browser-side toolkit of ${ALL.length}+ architectural calculators, prompt builders and references. Nothing leaves your browser unless you export it.</p>
      </div>
      ${cols.map((c) => `<div class="footer-col"><h4>${c.h}</h4>${c.links.map((l) => `<a href="${up}${l[1]}">${esc(l[0])}</a>`).join("")}</div>`).join("")}
    </div>
    <div class="footer-base">
      <span>© ${new Date().getFullYear()} ai-architect.com · Planning-stage tools — verify with a licensed professional.</span>
      <span><a href="${up}privacy/">Privacy</a> · <a href="${up}sitemap.xml">Sitemap</a></span>
    </div>
  </footer>`;
}

function scripts(up, config) {
  return `<script>window.SITE_CONFIG = ${JSON.stringify(config)};</script>
  <script src="${up}app.js"></script>
  <script src="${up}saas.js"></script>
</body>
</html>`;
}

function toolConfig(t) {
  return {
    title: t.title, kind: t.kind, fields: t.fields, data: t.data || {},
    engine: t.engine || {}, examples: t.examples || [], faq: t.faq || [], limits: t.limits || []
  };
}

function jsonLd(t, canonical) {
  const data = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    name: t.title, applicationCategory: "DesignApplication", operatingSystem: "Web browser",
    url: canonical, description: t.desc, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };
  if (t.faq && t.faq.length) {
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) })}</script>`;
  }
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

// ----------------------------------------------------------------------------
// Tool page
// ----------------------------------------------------------------------------
function relatedTools(t) {
  const same = ALL.filter((x) => x.category === t.category && x.slug !== t.slug && x.slug !== "tool").slice(0, 3);
  while (same.length < 3) {
    const pick = ALL.find((x) => x.slug !== t.slug && x.slug !== "tool" && !same.includes(x) && x.category !== t.category);
    if (!pick) break; same.push(pick);
  }
  return same;
}

function toolCard(t, up) {
  return `<a class="tool-card" href="${up}${t.slug}/"><span class="icon">${catIcon(t.category)}</span><span class="meta">${esc(t.category)}</span><h3>${esc(t.title)}</h3><p>${esc(t.desc)}</p><span class="open">Open tool →</span></a>`;
}

function toolPage(t) {
  const up = "../";
  const canonical = `${DOMAIN}/${t.slug}/`;
  const pill = t.kind === "prompt" ? "Prompt builder" : t.kind === "calculator" ? "Live calculator" : t.kind === "converter" ? "Unit converter" : t.kind === "checklist" ? "Scored checklist" : t.kind === "matrix" ? "Decision matrix" : t.kind === "schedule" ? "Schedule builder" : t.kind === "library" ? "Searchable library" : t.kind === "contrast" ? "WCAG checker" : "Builder";
  const related = relatedTools(t);
  const isDocLike = ["builder"].includes(t.kind);
  const inputHeading = t.kind === "checklist" ? "Select" : "Inputs";
  const resultPanel = `<div class="result-panel">
      <div class="result-toolbar">
        <h2>Result</h2>
        <div class="toolbar-row">
          <button class="button secondary" id="copyExport" type="button">Copy output</button>
          <button class="button secondary" type="button" data-save-current>Save project</button>
          <button class="button" type="button" data-download-current>Download JSON</button>
        </div>
      </div>
      <div id="toolResult"></div>
    </div>`;
  return [
    head(`${t.title} | Architecture Render Studio`, t.desc, canonical, up),
    `  ${jsonLd(t, canonical)}`,
    topbar(up),
    `  <main>`,
    `    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${up}">Home</a> / <a href="${up}tools/">Tools</a> / ${esc(t.title)}</nav>`,
    `    <section class="app-grid">${sidebar(up, "")}<div class="workspace-main">`,
    `      <div class="page-title-panel"><div><span class="category-chip">${esc(t.category)}</span><h1>${esc(t.title)}</h1><p class="lede">${esc(t.desc)}</p><div class="tag-row">${(t.tags || []).map((tag) => `<span class="tag">${esc(tag)}</span>`).join("")}</div></div><div class="illus">${catIllus(t.category)}</div></div>`,
    `      <section class="hero-tool" id="tool">`,
    `        <div class="tool-panel"><div class="panel-heading"><h2>${inputHeading}</h2><span class="pill">${esc(pill)}</span></div><div class="fields-grid" id="toolFields"></div></div>`,
    `        ${resultPanel}`,
    `      </section>`,
    `      <section class="content-band"><div class="section-heading"><h2>How it works</h2></div><p class="lede" style="max-width:78ch">${esc(t.howto)}</p></section>`,
    `      ${adUnit()}`,
    `      <section class="content-band"><div class="section-heading"><h2>Use cases</h2><p>Real, repeatable workflows — not filler.</p></div><div class="example-grid" id="examples"></div></section>`,
    `      <section class="content-band"><div class="section-heading"><h2>Good to know</h2><p>Every result is a planning-stage estimate that needs professional review.</p></div><ul class="checklist" id="limits"></ul></section>`,
    `      <section class="content-band"><div class="section-heading"><h2>FAQ</h2></div><div id="faq"></div></section>`,
    `      <section class="content-band"><div class="section-heading"><h2>Related tools</h2><p>Keep moving through the workflow.</p></div><div class="card-grid">${related.map((r) => toolCard(r, up)).join("")}</div></section>`,
    `    </div></section>`,
    `  </main>`,
    footer(up),
    scripts(up, toolConfig(t))
  ].join("\n");
}

// ----------------------------------------------------------------------------
// Dashboard (home)
// ----------------------------------------------------------------------------
function groupByCategory() {
  const map = new Map();
  CATEGORIES.forEach((c) => map.set(c.id, []));
  ALL.forEach((t) => { if (t.slug === "tool") return; if (!map.has(t.category)) map.set(t.category, []); map.get(t.category).push(t); });
  return map;
}

function homePage() {
  const up = "";
  const groups = groupByCategory();
  const grid = CATEGORIES.map((c) => {
    const items = groups.get(c.id) || [];
    if (!items.length) return "";
    return `<div class="cat-title"><span>${catIcon(c.id)}</span><h2>${esc(c.id)}</h2><span class="count">${items.length} tools</span><span class="rule"></span></div>
    <p class="lede" style="margin:-6px 0 14px">${esc(c.blurb)}</p>
    <div class="card-grid">${items.map((t) => toolCard(t, up)).join("")}</div>`;
  }).join("\n");
  const config = toolConfig(FLAGSHIP);
  return [
    head("Architecture Render Studio — 50+ free architecture tools & AI prompt builders", "A free, browser-side toolkit: render and diagram prompt builders, code-aware calculators, schedules, checklists and references for architects and designers.", `${DOMAIN}/`, up),
    `  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Architecture Render Studio", url: DOMAIN + "/", potentialAction: { "@type": "SearchAction", target: DOMAIN + "/tools/?q={query}", "query-input": "required name=query" } })}</script>`,
    topbar(up),
    `  <main>`,
    `    <section class="hero"><div class="hero-grid"><div>`,
    `      <p class="eyebrow">AI Architecture Toolkit</p>`,
    `      <h1>Design tools that actually compute.</h1>`,
    `      <p class="lede">${ALL.length}+ free, browser-based tools for architects and designers — layered render &amp; diagram prompt builders, code-aware calculators, costed schedules, weighted checklists and searchable references. No login, nothing uploaded.</p>`,
    `      <div class="action-row"><a class="button" href="${up}tool/">Open the studio</a><a class="button secondary" href="${up}tools/">Browse all tools</a></div>`,
    `      <div class="hero-stats"><div><span>Tools</span><strong>${ALL.length}+</strong></div><div><span>Categories</span><strong>${CATEGORIES.length}</strong></div><div><span>Price</span><strong>Free</strong></div><div><span>Account</span><strong>None</strong></div></div>`,
    `    </div><div class="hero-art">${heroArt()}</div></div></section>`,
    `    ${(() => { const a = adUnit(); return `<div class="wrap">${a}</div>`; })()}`,
    `    <section class="wrap" style="margin-top:8px">${grid}</section>`,
    `    <section class="content-band"><div class="section-heading"><h2>Why it's different</h2><p>Built for repeat professional workflows, not thin keyword pages.</p></div><div class="example-grid">
      <article><h3>Real computation</h3><p>Calculators apply genuine formulas — FAR, egress, stairs, U-values, solar — and update live as you type.</p></article>
      <article><h3>Buildable prompts</h3><p>Render and diagram builders add control language so AI keeps geometry, scale and structure realistic.</p></article>
      <article><h3>Yours to keep</h3><p>Save projects locally, copy output, or export JSON. No account, no server, no tracking of your work.</p></article>
    </div></section>`,
    `    <section class="content-band"><div class="section-heading"><h2>Questions</h2></div>
      <details open><summary>Is everything really free?</summary><p>Yes. Every tool runs in your browser at no cost, supported by unobtrusive advertising kept clear of the controls.</p></details>
      <details><summary>Do you store my projects?</summary><p>No. Saved projects live in your browser's local storage. Export them as JSON if you want a permanent copy.</p></details>
      <details><summary>Can I rely on the results for construction?</summary><p>Treat every output as a planning-stage estimate. Confirm against local codes, manufacturer data and a licensed professional before building.</p></details></section>`,
    `  </main>`,
    footer(up),
    scripts(up, config)
  ].join("\n");
}

// ----------------------------------------------------------------------------
// Catalog (/tools/) — searchable
// ----------------------------------------------------------------------------
function catalogPage() {
  const up = "../";
  const groups = groupByCategory();
  const cards = CATEGORIES.map((c) => {
    const items = groups.get(c.id) || [];
    if (!items.length) return "";
    return `<div class="cat-title"><span>${catIcon(c.id)}</span><h2>${esc(c.id)}</h2><span class="count">${items.length}</span><span class="rule"></span></div>
    <div class="card-grid">${items.map((t) => `<a class="tool-card" data-template-card href="${up}${t.slug}/"><span class="icon">${catIcon(t.category)}</span><span class="meta">${esc(t.category)}</span><h3>${esc(t.title)}</h3><p>${esc(t.desc)}</p><span class="open">Open tool →</span></a>`).join("")}</div>`;
  }).join("\n");
  return [
    head("All tools | Architecture Render Studio", `Browse all ${ALL.length}+ architecture tools — prompt builders, calculators, converters, schedules, checklists and references. Search by name or keyword.`, `${DOMAIN}/tools/`, up),
    topbar(up),
    `  <main>`,
    `    <nav class="breadcrumb"><a href="${up}">Home</a> / Tools</nav>`,
    `    <section class="app-grid">${sidebar(up, "tools")}<div class="workspace-main">`,
    `      <div class="page-title-panel"><div><span class="category-chip">Catalog</span><h1>All tools</h1><p class="lede">${ALL.length}+ functional tools across ${CATEGORIES.length} categories. Type to filter instantly.</p><div class="toolbar-row" style="margin-top:16px"><input type="search" data-template-search placeholder="Search tools — e.g. stair, render, FAR, contrast" aria-label="Search tools"></div></div><div class="illus">${catIllus("Reference Library")}</div></div>`,
    `      ${adUnit()}`,
    `      <section class="wrap" style="width:auto;margin:0">${cards}</section>`,
    `    </div></section>`,
    `  </main>`,
    footer(up),
    scripts(up, toolConfig(FLAGSHIP))
  ].join("\n");
}

// ----------------------------------------------------------------------------
// Utility / content pages
// ----------------------------------------------------------------------------
function utilityShell(key, title, desc, illus, bodyHtml) {
  const up = "../";
  return [
    head(`${title} | Architecture Render Studio`, desc, `${DOMAIN}/${key}/`, up),
    topbar(up),
    `  <main>`,
    `    <nav class="breadcrumb"><a href="${up}">Home</a> / ${esc(title)}</nav>`,
    `    <section class="app-grid">${sidebar(up, key)}<div class="workspace-main">`,
    `      <div class="page-title-panel"><div><span class="category-chip">Workspace</span><h1>${esc(title)}</h1><p class="lede">${esc(desc)}</p></div><div class="illus">${catIllus(illus)}</div></div>`,
    bodyHtml,
    `    </div></section>`,
    `  </main>`,
    footer(up),
    scripts(up, toolConfig(FLAGSHIP))
  ].join("\n");
}

function workspacePage() {
  const body = `      ${adUnit()}
      <div class="two-col"><article class="workspace-card"><span>Saved locally</span><h3>Your projects</h3><p>Every Save project action stores inputs and output in this browser. Reopen any tool and your work is still here.</p></article><article class="workspace-card"><span>Next action</span><h3>Run &amp; export</h3><p>Open a tool, run an input set, then save it or download JSON to move it into your project files.</p></article></div>
      <div class="cat-title"><h2>Saved projects</h2><span class="count" data-project-count>0</span><span class="rule"></span></div>
      <div class="card-grid" data-project-list></div>
      <section class="content-band"><div class="section-heading"><h2>Manage</h2></div><p class="lede" style="max-width:70ch">Saved projects are private to this browser and device. Use Download JSON on any project for a portable backup, or clear them below.</p><div class="action-row"><button class="button secondary" data-clear-projects type="button">Clear saved projects</button><a class="button" href="${"../"}tools/">Find a tool</a></div></section>`;
  return utilityShell("workspace", "Workspace", "Your saved projects and exports, kept privately in this browser.", "Reference Library", body);
}

function reportsPage() {
  const body = `      ${adUnit()}
      <div class="card-grid">
        <article class="module-card"><span>Saved projects</span><strong data-project-count>0</strong><p>Stored in this browser.</p></article>
        <article class="module-card"><span>Tools available</span><strong>${ALL.length}+</strong><p>Across ${CATEGORIES.length} categories.</p></article>
        <article class="module-card"><span>Export formats</span><strong>JSON / Copy</strong><p>Move output into your files.</p></article>
        <article class="module-card"><span>Status</span><strong><span class="status-dot"></span>Live</strong><p>All tools operational.</p></article>
      </div>
      <section class="content-band"><div class="section-heading"><h2>Recent activity</h2><p>Generated from your locally saved projects.</p></div><div class="card-grid" data-project-list></div></section>`;
  return utilityShell("reports", "Reports", "A snapshot of your saved work and the toolkit's status.", "Decision Matrix", body);
}

function settingsPage() {
  const body = `      ${adUnit()}
      <section class="content-band"><div class="section-heading"><h2>Preferences</h2><p>Stored locally — never sent anywhere.</p></div>
        <div class="mini-form" style="max-width:520px">
          <label>Display name<input type="text" data-setting="name" data-default="" placeholder="Your name or studio"></label>
          <label>Default currency<input type="text" data-setting="currency" data-default="USD" placeholder="USD"></label>
          <label>Measurement system<select data-setting="units"><option value="metric">Metric (m, mm)</option><option value="imperial">Imperial (ft, in)</option></select></label>
          <div class="action-row"><button class="button" type="button" data-save-settings>Save preferences</button><span data-settings-status class="lede" style="margin:0"></span></div>
        </div>
      </section>
      <section class="content-band"><div class="section-heading"><h2>Privacy</h2></div><p class="lede" style="max-width:70ch">No account is required and nothing you enter is uploaded. Preferences and saved projects live only in this browser. See the <a href="../privacy/">privacy page</a> for details.</p></section>`;
  return utilityShell("settings", "Settings", "Local preferences for currency, units and display name.", "Calculators", body);
}

function integrationsPage() {
  const body = `      ${adUnit()}
      <div class="card-grid">
        <article class="workspace-card"><span>Image models</span><h3>Midjourney · SDXL · Firefly</h3><p>Paste prompt-builder output straight into any text-to-image model. Pair positive prompts with the negative-prompt builder.</p></article>
        <article class="workspace-card"><span>Spreadsheets</span><h3>Excel · Google Sheets</h3><p>Schedule builders output CSV — copy it directly into a spreadsheet for cost plans and take-offs.</p></article>
        <article class="workspace-card"><span>BIM / CAD</span><h3>Revit · ArchiCAD · Rhino</h3><p>Use calculator results to sanity-check models and the JSON export to log assumptions alongside your files.</p></article>
        <article class="workspace-card"><span>Docs</span><h3>Word · Notion · Docs</h3><p>Brief and concept builders copy as clean text blocks ready to drop into reports and proposals.</p></article>
      </div>
      <section class="content-band"><div class="section-heading"><h2>How export works</h2></div><p class="lede" style="max-width:74ch">Every tool offers Copy output, Save project and Download JSON. There is no API key or connector to configure — the tools are designed to hand off cleanly to whatever software you already use.</p></section>`;
  return utilityShell("integrations", "Integrations", "How the studio hands off to image models, spreadsheets, BIM and docs.", "Converters", body);
}

function plansPage() {
  const tiers = [
    { name: "Free", price: "$0", tag: "Always", points: ["All " + ALL.length + "+ tools", "Copy & JSON export", "Local project saving", "No account required"], cta: "Start now", href: "../tools/" },
    { name: "Studio", price: "$0", tag: "This pilot", points: ["Everything in Free", "Workspace dashboard", "Reports overview", "Local preferences"], cta: "Open workspace", href: "../workspace/" },
    { name: "Teams", price: "Coming", tag: "Roadmap", points: ["Shared project library", "Branded exports", "Cloud sync (opt-in)", "Priority requests"], cta: "Register interest", href: "../about/" }
  ];
  const body = `      ${adUnit()}
      <div class="card-grid">${tiers.map((t) => `<article class="plan-card"><span class="category-chip">${esc(t.tag)}</span><h3 style="margin:14px 0 4px;font-size:1.3rem">${esc(t.name)}</h3><strong style="font-size:2rem;display:block;letter-spacing:-0.02em">${esc(t.price)}</strong><ul class="clean-list" style="margin:14px 0">${t.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul><a class="button${t.name === "Teams" ? " secondary" : ""}" href="${t.href}">${esc(t.cta)}</a></article>`).join("")}</div>
      <section class="content-band"><div class="section-heading"><h2>Honest pricing</h2></div><p class="lede" style="max-width:74ch">This is a free pilot. The whole toolkit is usable today at no cost. Team features such as shared libraries and cloud sync are on the roadmap and will always be opt-in.</p></section>`;
  return utilityShell("plans", "Plans", "Simple, honest pricing — the toolkit is free today.", "Decision Matrix", body);
}

function aboutPage() {
  const body = `      ${adUnit()}
      <section class="content-band"><div class="section-heading"><h2>What this is</h2></div><p class="lede" style="max-width:76ch">Architecture Render Studio is a free, browser-based toolkit for architects, students and designers. It brings together ${ALL.length}+ genuinely functional tools: layered render and diagram prompt builders, code-aware calculators for area, egress, structure and energy, costed schedules, weighted review checklists, and searchable material and style references.</p></section>
      <section class="content-band"><div class="section-heading"><h2>Principles</h2></div><div class="example-grid">
        <article><h3>Function over filler</h3><p>Every page does real work — a calculation, a generated document, a search or a score — rather than padding keywords.</p></article>
        <article><h3>Privacy by default</h3><p>No account, no upload. Your inputs and saved projects stay in your browser unless you export them.</p></article>
        <article><h3>Buildable by design</h3><p>Prompt builders steer AI toward realistic structure; calculators state their assumptions and limits plainly.</p></article>
      </div></section>
      <section class="content-band"><div class="section-heading"><h2>Disclaimer</h2></div><p class="lede" style="max-width:76ch">All results are planning-stage estimates. They are not legal, code, engineering, tax or safety certification. Always confirm against local regulations, current manufacturer data and a licensed professional before construction.</p><div class="action-row"><a class="button" href="../tools/">Explore the tools</a><a class="button secondary" href="../faq/">Read the FAQ</a></div></section>`;
  return utilityShell("about", "About", "A free, functional architecture toolkit built for real workflows.", "Briefs & Docs", body);
}

function faqPage() {
  const faqs = [
    ["Is Architecture Render Studio free?", "Yes — every tool is free to use in your browser. The site is supported by unobtrusive advertising kept clear of the tool controls."],
    ["Do I need an account?", "No. There is no sign-up, login or paywall. Tools work immediately."],
    ["Is my data uploaded anywhere?", "No. Inputs, preferences and saved projects are stored only in your browser's local storage. Export JSON if you want a portable copy."],
    ["Do the prompt builders generate images?", "No — they build high-quality text prompts you paste into an image model such as Midjourney, SDXL or Firefly. The structure keeps results consistent and buildable."],
    ["How accurate are the calculators?", "They apply real formulas and are accurate for the inputs given, but they are planning-stage tools. Code definitions and local rules vary — always verify before relying on a result."],
    ["Can I use these results for construction?", "Treat them as a first pass. Final design and construction decisions require checking against local codes, manufacturer data and a licensed professional."],
    ["What can I export?", "Every tool offers Copy output, Save project (local) and Download JSON. Schedule builders also produce CSV for spreadsheets."],
    ["How do I report a problem or request a tool?", "See the About page — we welcome requests for additional calculators, prompt types and references."]
  ];
  const body = `      ${adUnit()}
      <section class="content-band"><div class="section-heading"><h2>Frequently asked questions</h2><p>Everything about pricing, privacy and accuracy.</p></div>${faqs.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`).join("")}</section>`;
  const page = utilityShell("faq", "FAQ", "Answers on pricing, privacy, accuracy and exports.", "Checklists", body);
  // inject FAQ JSON-LD
  const ld = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f[0], acceptedAnswer: { "@type": "Answer", text: f[1] } })) })}</script>`;
  return page.replace("</head>", `  ${ld}\n</head>`);
}

function privacyPage() {
  const up = "../";
  const body = `      ${adUnit()}
      <section class="content-band"><div class="section-heading"><h2>Privacy policy</h2></div>
        <p class="lede" style="max-width:76ch">Architecture Render Studio is a static website. We do not operate user accounts and do not collect personal information through forms. Everything you enter into a tool stays in your browser.</p>
        <h3 style="margin-top:18px">Local storage</h3><p class="lede" style="max-width:76ch">Saved projects and preferences are stored in your browser's local storage on your device. They are never transmitted to us. Clearing your browser data removes them.</p>
        <h3 style="margin-top:18px">Advertising</h3><p class="lede" style="max-width:76ch">This site displays ads via Google AdSense. Google and its partners may use cookies to serve ads based on your prior visits to this and other websites. You can manage personalised advertising in your Google Ad Settings. EU/UK/CH visitors are shown a consent prompt where required.</p>
        <h3 style="margin-top:18px">Analytics</h3><p class="lede" style="max-width:76ch">No first-party analytics or tracking scripts are added by this site beyond the advertising provider above.</p>
        <h3 style="margin-top:18px">Contact</h3><p class="lede" style="max-width:76ch">For privacy questions, contact the site owner via the channels listed on the About page.</p>
      </section>`;
  return [
    head("Privacy | Architecture Render Studio", "How Architecture Render Studio handles local storage, advertising and your data.", `${DOMAIN}/privacy/`, up),
    topbar(up),
    `  <main>`,
    `    <nav class="breadcrumb"><a href="${up}">Home</a> / Privacy</nav>`,
    `    <section class="app-grid">${sidebar(up, "")}<div class="workspace-main">`,
    `      <div class="page-title-panel"><div><span class="category-chip">Legal</span><h1>Privacy</h1><p class="lede">No accounts, no uploads — your work stays in your browser.</p></div><div class="illus">${catIllus("Briefs & Docs")}</div></div>`,
    body,
    `    </div></section>`,
    `  </main>`,
    footer(up),
    scripts(up, toolConfig(FLAGSHIP))
  ].join("\n");
}

// ----------------------------------------------------------------------------
// sitemap
// ----------------------------------------------------------------------------
function sitemap() {
  const urls = ["", "tools/", "tool/", "workspace/", "reports/", "templates/", "settings/", "integrations/", "plans/", "faq/", "about/", "privacy/"]
    .concat(TOOLS.map((t) => `${t.slug}/`));
  const items = urls.map((u) => `  <url><loc>${DOMAIN}/${u}</loc><changefreq>weekly</changefreq><priority>${u === "" ? "1.0" : u.includes("/") && TOOLS.find((t) => `${t.slug}/` === u) ? "0.8" : "0.6"}</priority></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}

// templates page reuses catalog but at /templates/ as "starting points"
function templatesPage() {
  const up = "../";
  const featured = ["exterior-render-prompt", "interior-render-prompt", "design-brief-builder", "far-calculator", "door-window-schedule", "design-review-checklist", "material-comparison-matrix", "materials-library", "color-contrast-checker"].map((s) => bySlug[s]).filter(Boolean);
  const body = `      ${adUnit()}
      <section class="content-band"><div class="section-heading"><h2>Starting points</h2><p>Hand-picked tools to begin a new project workflow.</p></div><div class="card-grid">${featured.map((t) => toolCard(t, up)).join("")}</div></section>
      <section class="content-band"><div class="section-heading"><h2>Looking for something specific?</h2></div><p class="lede" style="max-width:70ch">Browse the full, searchable catalog of ${ALL.length}+ tools.</p><div class="action-row"><a class="button" href="../tools/">Open the catalog</a></div></section>`;
  return utilityShell("templates", "Templates", "Curated starting points across the toolkit.", "Render Prompts", body);
}

// ----------------------------------------------------------------------------
// Write everything
// ----------------------------------------------------------------------------
function write(rel, content) {
  const full = join(ROOT, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}

let count = 0;
// tool pages
for (const t of TOOLS) { write(join(t.slug, "index.html"), toolPage(t)); count++; }
// flagship
write(join("tool", "index.html"), toolPage(FLAGSHIP)); count++;
// core pages
write("index.html", homePage()); count++;
write(join("tools", "index.html"), catalogPage()); count++;
write(join("workspace", "index.html"), workspacePage()); count++;
write(join("reports", "index.html"), reportsPage()); count++;
write(join("settings", "index.html"), settingsPage()); count++;
write(join("integrations", "index.html"), integrationsPage()); count++;
write(join("plans", "index.html"), plansPage()); count++;
write(join("about", "index.html"), aboutPage()); count++;
write(join("faq", "index.html"), faqPage()); count++;
write(join("privacy", "index.html"), privacyPage()); count++;
write(join("templates", "index.html"), templatesPage()); count++;
// remove obsolete pages that are no longer part of the catalog by overwriting with redirects
for (const old of ["checklists", "examples", "library"]) {
  write(join(old, "index.html"), redirectPage(old));
}
// sitemap & robots
write("sitemap.xml", sitemap());
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${DOMAIN}/sitemap.xml\n`);

function redirectPage(from) {
  const target = from === "checklists" ? "../tools/" : from === "library" ? "../tools/" : "../tools/";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved | Architecture Render Studio</title><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="canonical" href="${DOMAIN}/tools/"><meta http-equiv="refresh" content="0; url=${target}"><meta name="google-adsense-account" content="${ADSENSE_CLIENT}"><link rel="stylesheet" href="../styles.css"></head><body style="${THEME}"><main class="wrap" style="padding:80px 0;text-align:center"><h1>This page has moved</h1><p class="lede" style="margin-inline:auto">Find every tool in the catalog.</p><p><a class="button" href="${target}">Go to all tools</a></p></main></body></html>`;
}

console.log(`Generated ${count} pages + sitemap. Total tools: ${ALL.length}`);
