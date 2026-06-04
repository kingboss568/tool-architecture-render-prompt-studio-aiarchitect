// Catalog of functional tools for Architecture Render Prompt Studio.
// Each tool is rendered to /<slug>/index.html and driven by the shared engine
// in app.js via window.SITE_CONFIG. Every tool computes a real result.

const STD_LIMITS = [
  "Results are planning-stage estimates — confirm against local codes, manufacturer data, and a licensed professional before issuing for construction.",
  "No login or private credentials are required; saved projects stay in this browser's local storage.",
  "Advertising is kept clear of primary action controls and never blocks tool inputs."
];

// ---- Calculator factory ---------------------------------------------------
function calc(o) {
  return {
    slug: o.slug, title: o.title, category: o.category, kind: "calculator",
    desc: o.desc, tags: o.tags || [], howto: o.howto,
    fields: o.fields,
    engine: { outputs: o.outputs, rules: o.rules || [], defaultAdvice: o.defaultAdvice || "Inputs are within a typical planning range. Review assumptions before relying on the result." },
    examples: o.examples, faq: o.faq, limits: o.limits || STD_LIMITS
  };
}

// ---- Converter factory ----------------------------------------------------
function conv(o) {
  const labels = o.units.map((u) => u.label);
  return {
    slug: o.slug, title: o.title, category: "Converters", kind: "converter",
    desc: o.desc, tags: o.tags || ["unit converter"], howto: o.howto,
    fields: [
      { id: "value", label: "Value", type: "number", default: o.default ?? 1, step: "any" },
      { id: "from", label: "From unit", type: "select", options: labels, default: o.from || labels[0] },
      { id: "to", label: "To unit", type: "select", options: labels, default: o.to || labels[labels.length - 1] }
    ],
    engine: { units: o.units, precision: o.precision ?? 4 },
    examples: o.examples, faq: o.faq, limits: o.limits || STD_LIMITS
  };
}

// ---- Prompt factory -------------------------------------------------------
function prompt(o) {
  return {
    slug: o.slug, title: o.title, category: o.category || "Render Prompts", kind: "prompt",
    desc: o.desc, tags: o.tags || ["AI prompt"], howto: o.howto,
    fields: o.fields, engine: { variants: o.variants },
    examples: o.examples, faq: o.faq, limits: o.limits || STD_LIMITS
  };
}

const NUM = (id, label, def, extra = {}) => ({ id, label, type: "number", default: def, ...extra });
const SEL = (id, label, options, def) => ({ id, label, type: "select", options, default: def ?? options[0] });
const TXT = (id, label, def, hint) => ({ id, label, type: "text", default: def, hint: hint || "" });
const AREA = (id, label, def, rows = 4) => ({ id, label, type: "textarea", default: def, rows });

export const CATEGORIES = [
  { id: "Render Prompts", blurb: "Structured prompt builders for photoreal architectural visualisation." },
  { id: "Diagram Prompts", blurb: "Prompt builders for plans, sections, massing and analytical diagrams." },
  { id: "Briefs & Docs", blurb: "Turn a few inputs into a structured brief, statement or specification." },
  { id: "Calculators", blurb: "Code-aware planning maths: area, egress, structure, energy and cost." },
  { id: "Converters", blurb: "Fast, exact unit conversion for drawing, site and material work." },
  { id: "Schedules", blurb: "Paste rows and get costed, validated door, window and finish schedules." },
  { id: "Checklists", blurb: "Weighted readiness scoring for design, access and sustainability reviews." },
  { id: "Decision Matrix", blurb: "Weighted scoring to compare materials, sites and concept options." },
  { id: "Reference Library", blurb: "Searchable references for materials, styles and drawing symbols." },
  { id: "Accessibility", blurb: "Contrast and legibility checks for compliant, readable design." }
];

// Shared prompt field set
const promptFields = (subjectDefault, styles, contexts, outputs) => ([
  TXT("subject", "Subject / project", subjectDefault),
  SEL("style", "Design direction", styles, styles[0]),
  AREA("context", "Context & constraints", contexts),
  SEL("output", "Output format", outputs, outputs[0]),
  SEL("mood", "Light & mood", ["soft overcast", "golden hour", "bright midday", "blue hour", "dramatic side light"], "golden hour")
]);

export const TOOLS = [
  // ================= RENDER PROMPTS =================
  prompt({
    slug: "exterior-render-prompt", title: "Exterior Render Prompt Builder",
    desc: "Compose a controlled, buildable exterior visualisation prompt from massing, materials, context and light.",
    howto: "Describe the building, pick a design direction and lighting, and the builder assembles three layered prompts — a concept render, a photoreal pass, and a technical control prompt — each keeping structure realistic and avoiding impossible geometry.",
    tags: ["exterior render", "AI prompt", "visualisation"],
    fields: promptFields("three-storey brick townhouse", ["warm minimal", "quiet modern", "adaptive reuse", "tropical contemporary", "mass timber"],
      "corner site, street trees, recessed entry, deep window reveals, durable materials", ["photoreal render", "concept render", "competition board"]),
    variants: [
      { title: "Concept render", body: "Architectural exterior of {{subject}}, {{style}} direction, {{context}}, clear massing, realistic structure, {{mood}} lighting, {{output}}, accurate proportions, no warped geometry." },
      { title: "Photoreal pass", body: "Photorealistic exterior render of {{subject}}, {{style}}, {{context}}, physically based materials, true-to-scale openings, {{mood}}, soft contact shadows, 35mm lens, eye-level view, buildable detailing." },
      { title: "Technical control", body: "Exterior of {{subject}} as a controlled study: consistent storey heights, real material thicknesses, {{context}}. Label key materials and entries. Avoid floating elements and impossible cantilevers." }
    ],
    examples: [
      { title: "Street-level approval view", body: "Generate an eye-level, golden-hour view of a corner townhouse to test how brick, glazing and the recessed entry read from the pavement before committing to a material palette." },
      { title: "Two-option comparison", body: "Run the same subject with 'warm minimal' and 'adaptive reuse' directions to put two facade strategies side by side for a client decision." },
      { title: "Consistent series", body: "Keep the subject and context fixed while changing only the light setting to produce a coherent day-to-dusk render series for a presentation." }
    ],
    faq: [
      { q: "Does this generate the image itself?", a: "No. It builds the text prompt you paste into your image model of choice (Midjourney, SDXL, Firefly, etc.). The structure keeps the brief consistent and buildable." },
      { q: "Why three variants?", a: "Concept explores the idea, the photoreal pass pushes realism, and the technical control prompt reins in geometry so the AI does not invent impossible structure." },
      { q: "Can I save a prompt set?", a: "Yes. Use Save project to keep the inputs in this browser, or Download JSON / Copy output to move them into your render pipeline." }
    ]
  }),
  prompt({
    slug: "interior-render-prompt", title: "Interior Render Prompt Builder",
    desc: "Build interior visualisation prompts with controlled materials, furniture, lighting temperature and lens.",
    howto: "Set the room, palette and light, and the tool returns concept, photoreal and detailing prompts tuned for believable interiors — correct ceiling heights, real furniture scale and coherent material reflections.",
    tags: ["interior render", "AI prompt", "FF&E"],
    fields: [
      TXT("subject", "Room / space", "open-plan living and kitchen"),
      SEL("style", "Interior direction", ["warm minimal", "japandi", "mid-century", "soft industrial", "coastal contemporary"], "warm minimal"),
      AREA("context", "Materials & furniture", "oak floor, plaster walls, linen sofa, stone island, layered lighting"),
      SEL("output", "Output format", ["photoreal render", "concept render", "FF&E mood frame"], "photoreal render"),
      SEL("mood", "Light & mood", ["soft morning", "warm evening", "bright daylight", "moody low-key"], "warm evening")
    ],
    variants: [
      { title: "Concept render", body: "Interior of {{subject}}, {{style}} direction, {{context}}, {{mood}} lighting, realistic ceiling height and furniture scale, {{output}}, calm composition." },
      { title: "Photoreal pass", body: "Photorealistic interior of {{subject}}, {{style}}, {{context}}, physically based materials, accurate reflections, {{mood}}, 24mm lens, balanced exposure, true human scale." },
      { title: "Material & FF&E", body: "Close framing of {{subject}} emphasising {{context}}. Show real material joints, plausible furniture proportions and layered {{mood}} light. No distorted perspective." }
    ],
    examples: [
      { title: "Palette test", body: "Lock the room and furniture, swap the interior direction to compare 'japandi' against 'mid-century' before sourcing finishes." },
      { title: "Lighting study", body: "Hold all inputs and cycle light settings to see how the same living space reads in morning versus warm evening light." },
      { title: "Client mood frame", body: "Use the FF&E output to produce a tight, furniture-led frame for a moodboard rather than a wide architectural shot." }
    ],
    faq: [
      { q: "Will furniture scale look right?", a: "The control language asks for true human scale and plausible proportions, which reduces the oversized-sofa problem common in raw prompts." },
      { q: "Can I target a specific lens?", a: "The photoreal pass specifies a 24mm interior lens; edit the copied prompt if you want a tighter focal length." },
      { q: "Is it free?", a: "Yes — it runs entirely in your browser with copy, save and JSON export." }
    ]
  }),
  prompt({
    slug: "landscape-render-prompt", title: "Landscape & Site Render Prompt",
    desc: "Generate prompts for planting, hardscape and site context that stay seasonal and climate-appropriate.",
    howto: "Describe the site, climate and planting intent. The builder returns concept, photoreal and planting-plan prompts that keep species and seasons coherent.",
    tags: ["landscape", "site render", "AI prompt"],
    fields: [
      TXT("subject", "Site / landscape", "courtyard garden between two pavilions"),
      SEL("style", "Landscape character", ["naturalistic planting", "formal geometry", "dry / xeriscape", "tropical lush", "productive / edible"], "naturalistic planting"),
      AREA("context", "Climate, materials & planting", "temperate climate, permeable paving, native grasses, multi-stem trees, rain garden"),
      SEL("output", "Output format", ["photoreal render", "concept render", "planting plan view"], "photoreal render"),
      SEL("mood", "Season & light", ["spring soft light", "summer midday", "autumn golden hour", "winter clear"], "autumn golden hour")
    ],
    variants: [
      { title: "Concept render", body: "Landscape view of {{subject}}, {{style}}, {{context}}, {{mood}}, believable plant scale and density, {{output}}, coherent ground plane." },
      { title: "Photoreal pass", body: "Photorealistic landscape of {{subject}}, {{style}}, {{context}}, seasonally accurate planting, soft shadows, {{mood}}, natural materials, eye-level view." },
      { title: "Planting logic", body: "Planting study for {{subject}} using {{context}}. Keep species climate-appropriate, group in drifts, show maturity in 3–5 years, avoid out-of-season blooms." }
    ],
    examples: [
      { title: "Seasonal series", body: "Hold the planting brief and change only the season to show a client how the courtyard evolves across the year." },
      { title: "Maturity preview", body: "Use the planting-logic variant to preview the scheme at a realistic 3–5 year maturity instead of day-one planting." },
      { title: "Climate fit", body: "Switch to 'dry / xeriscape' for an arid brief so the AI stops inserting water-hungry lawns." }
    ],
    faq: [
      { q: "Does it know real species?", a: "It nudges the model toward climate-appropriate, in-season planting; always confirm species choices with a landscape architect or local nursery." },
      { q: "Can I do plan views?", a: "Yes — choose 'planting plan view' for a top-down diagrammatic output rather than a perspective." },
      { q: "Where do exports go?", a: "Copy or download the prompt set, or save it locally to reuse on the next phase." }
    ]
  }),
  prompt({
    slug: "aerial-render-prompt", title: "Aerial & Masterplan Render Prompt",
    desc: "Build bird's-eye and masterplan prompts with believable urban grain, density and circulation.",
    howto: "Set the masterplan scope and density, and get aerial concept, photoreal and figure-ground prompts that keep block sizes and street hierarchy realistic.",
    tags: ["aerial", "masterplan", "urban"],
    fields: [
      TXT("subject", "Masterplan / district", "mixed-use waterfront district"),
      SEL("style", "Urban character", ["fine-grain walkable", "garden city", "dense urban blocks", "campus / pavilion", "transit-oriented"], "fine-grain walkable"),
      AREA("context", "Density, uses & movement", "perimeter blocks, central green spine, ground-floor retail, cycle network, waterfront edge"),
      SEL("output", "Output format", ["aerial render", "axonometric", "figure-ground"], "aerial render"),
      SEL("mood", "Light & mood", ["clear midday", "golden hour", "soft overcast"], "golden hour")
    ],
    variants: [
      { title: "Aerial concept", body: "Bird's-eye view of {{subject}}, {{style}}, {{context}}, realistic block sizes and street hierarchy, {{mood}}, {{output}}, coherent urban grain." },
      { title: "Photoreal pass", body: "Photorealistic aerial of {{subject}}, {{style}}, {{context}}, believable building heights, green network, {{mood}}, high-altitude camera, sharp street pattern." },
      { title: "Diagram control", body: "Axonometric / figure-ground of {{subject}} from {{context}}. Emphasise public space, connectivity and block rhythm. Keep scale legible and proportions consistent." }
    ],
    examples: [
      { title: "Density options", body: "Compare 'fine-grain walkable' with 'dense urban blocks' to show two density strategies for the same waterfront brief." },
      { title: "Connectivity story", body: "Use the diagram-control variant to foreground the green spine and cycle network for a planning submission." },
      { title: "Hero image", body: "Run the photoreal pass at golden hour for a single cover image of the district." }
    ],
    faq: [
      { q: "Will block sizes be sensible?", a: "The control language asks for realistic block sizes and street hierarchy, which curbs the AI's tendency to produce uniform mega-blocks." },
      { q: "Axonometric or perspective?", a: "Choose the output format — aerial render for perspective, axonometric or figure-ground for analytical diagrams." },
      { q: "Can I reuse the brief?", a: "Save the project locally and reload it when you iterate the masterplan." }
    ]
  }),
  prompt({
    slug: "night-render-prompt", title: "Night & Lighting Render Prompt",
    desc: "Compose after-dark render prompts with realistic luminaire placement, colour temperature and glow.",
    howto: "Choose the scene and lighting strategy to get concept, photoreal and lighting-control prompts that keep light sources plausible and glare under control.",
    tags: ["night render", "lighting", "AI prompt"],
    fields: [
      TXT("subject", "Scene", "civic plaza and entrance canopy"),
      SEL("style", "Lighting strategy", ["warm hospitality", "crisp civic", "theatrical accent", "minimal wash"], "warm hospitality"),
      AREA("context", "Fixtures & surfaces", "linear coves, uplit trees, glazed lobby glow, wet paving reflections"),
      SEL("output", "Output format", ["photoreal render", "concept render", "lighting study"], "photoreal render"),
      SEL("mood", "Sky & time", ["blue hour", "full night", "dusk transition"], "blue hour")
    ],
    variants: [
      { title: "Concept render", body: "Night view of {{subject}}, {{style}} lighting, {{context}}, {{mood}} sky, believable luminaire placement, {{output}}, controlled contrast." },
      { title: "Photoreal pass", body: "Photorealistic night render of {{subject}}, {{style}}, {{context}}, accurate colour temperature, soft glow falloff, {{mood}}, reflections on wet surfaces, no blown highlights." },
      { title: "Lighting control", body: "Lighting study of {{subject}} using {{context}}. Show realistic pools of light, layered ambient and accent, manage glare, keep dark sky away from spill." }
    ],
    examples: [
      { title: "Glare check", body: "Use the lighting-control variant to preview whether accent fixtures would create glare before specifying them." },
      { title: "Warm vs civic", body: "Swap 'warm hospitality' for 'crisp civic' to compare colour temperature strategies on the same plaza." },
      { title: "Dusk-to-night", body: "Hold the scene and change the sky setting to show the space across blue hour and full night." }
    ],
    faq: [
      { q: "Will fixtures be placed realistically?", a: "The prompt asks for believable luminaire placement and managed glare, which reduces random floating light sources." },
      { q: "Can I target a colour temperature?", a: "Edit the copied prompt to add a Kelvin value (e.g. 2700K) for precise warmth." },
      { q: "Does it export?", a: "Yes — copy, download JSON, or save the set locally." }
    ]
  }),
  prompt({
    slug: "material-board-prompt", title: "Material Board Prompt Builder",
    desc: "Generate cohesive material and finish board prompts with realistic textures and tonal balance.",
    howto: "List your palette and the board returns concept, photoreal and tactile-detail prompts that keep textures physically plausible and tonally balanced.",
    tags: ["material board", "finishes", "AI prompt"],
    fields: [
      TXT("subject", "Project / palette name", "warm minimal apartment palette"),
      SEL("style", "Tonal direction", ["warm neutral", "cool monochrome", "earthy natural", "high-contrast"], "warm neutral"),
      AREA("context", "Materials & finishes", "white oak, micro-cement, brushed brass, travertine, bouclé textile"),
      SEL("output", "Output format", ["flat lay board", "perspective vignette", "macro texture set"], "flat lay board"),
      SEL("mood", "Light", ["soft diffuse", "directional", "bright studio"], "soft diffuse")
    ],
    variants: [
      { title: "Board layout", body: "Material board for {{subject}}, {{style}}, samples of {{context}}, {{mood}} light, {{output}}, balanced composition, realistic sample sizes." },
      { title: "Photoreal pass", body: "Photorealistic {{output}} of {{context}}, {{style}} palette, physically based textures, accurate sheen and grain, {{mood}}, neutral background." },
      { title: "Tactile detail", body: "Macro details of {{context}} for {{subject}}. Show true material texture, edge thickness and finish reflectivity. Keep colours consistent across samples." }
    ],
    examples: [
      { title: "Palette sign-off", body: "Produce a flat-lay board of five finishes for a client to approve before ordering physical samples." },
      { title: "Tonal options", body: "Switch between 'warm neutral' and 'cool monochrome' to compare the same materials under two tonal strategies." },
      { title: "Texture close-ups", body: "Use the tactile-detail variant to generate macro shots for a specification appendix." }
    ],
    faq: [
      { q: "Can it replace physical samples?", a: "No — it helps communicate intent early. Always confirm colour and finish against real samples under project lighting." },
      { q: "How many materials?", a: "List as many as you like in the materials field; 4–6 reads most cleanly on a board." },
      { q: "Export?", a: "Copy or download the prompt set, or save it to revisit." }
    ]
  }),
  prompt({
    slug: "sketch-to-render-prompt", title: "Sketch-to-Render Prompt Builder",
    desc: "Turn a hand sketch or massing model into a controlled render prompt that respects your geometry.",
    howto: "Describe what your sketch shows and how faithful the render should be. The builder returns prompts that preserve your composition while adding material and light.",
    tags: ["sketch to render", "img2img", "AI prompt"],
    fields: [
      TXT("subject", "What the sketch shows", "two-storey house with gabled roof and porch"),
      SEL("style", "Render direction", ["faithful realism", "soft watercolour", "clean concept", "moody atmospheric"], "faithful realism"),
      AREA("context", "Materials & fidelity notes", "keep roof pitch and window positions, add timber cladding, brick base, soft daylight"),
      SEL("output", "Output format", ["photoreal render", "illustrative render", "concept sketch upgrade"], "photoreal render"),
      SEL("mood", "Light & mood", ["soft daylight", "golden hour", "overcast"], "soft daylight")
    ],
    variants: [
      { title: "Faithful pass", body: "Render based on a sketch of {{subject}}, {{style}}, preserve original composition and proportions, {{context}}, {{mood}}, {{output}}, do not invent new openings." },
      { title: "Material upgrade", body: "Upgrade the sketch of {{subject}} with {{context}}, keep geometry locked, add physically based materials and {{mood}} light, {{output}}." },
      { title: "Atmosphere pass", body: "Atmospheric interpretation of {{subject}} from sketch, {{style}}, respect massing and roof line, layer {{mood}} light and depth, keep structure believable." }
    ],
    examples: [
      { title: "Concept upgrade", body: "Feed a quick massing sketch and use the faithful pass to keep window positions while adding realistic cladding." },
      { title: "Two moods", body: "Run the atmosphere pass twice with different light settings to present a calm and a dramatic version." },
      { title: "Client-friendly", body: "Use 'soft watercolour' to soften an early sketch for a first client conversation." }
    ],
    faq: [
      { q: "Do I upload the sketch here?", a: "No — this builds the text prompt; pair it with your image model's image-to-image input to anchor the geometry." },
      { q: "How do I stop it changing windows?", a: "The faithful pass includes 'do not invent new openings'; keep your image-to-image strength moderate." },
      { q: "Free to use?", a: "Yes, with copy, save and export built in." }
    ]
  }),
  prompt({
    slug: "negative-prompt-builder", title: "Negative Prompt Builder",
    desc: "Assemble a tuned negative prompt to remove warped geometry, artefacts and unrealistic structure.",
    howto: "Pick the artefacts you keep seeing and the builder compiles a clean, deduplicated negative prompt for architectural renders.",
    tags: ["negative prompt", "quality", "AI prompt"],
    fields: [
      SEL("focus", "Primary subject", ["exterior building", "interior space", "landscape", "aerial / masterplan"], "exterior building"),
      AREA("issues", "Problems to remove", "warped windows, melted geometry, floating elements, extra floors, distorted perspective, blurry textures"),
      SEL("strength", "Strictness", ["balanced", "aggressive", "light touch"], "balanced")
    ],
    variants: [
      { title: "Negative prompt", body: "Negative prompt for {{focus}} render ({{strength}}): {{issues}}, impossible structure, extra columns, duplicated facades, text artefacts, watermark, lowres, oversaturation." },
      { title: "Geometry guard", body: "Suppress for {{focus}}: warped lines, non-orthogonal walls, bent roof, inconsistent storey heights, cloned windows, broken symmetry, AI distortion." },
      { title: "Render hygiene", body: "Quality negatives ({{strength}}): noise, banding, jpeg artefacts, blown highlights, muddy shadows, plastic materials, fake reflections, motion blur." }
    ],
    examples: [
      { title: "Stop melted windows", body: "Add your recurring artefacts to remove distorted glazing that keeps appearing on a tower facade." },
      { title: "Clean interiors", body: "Switch focus to interior to bias the negatives toward furniture and reflection problems." },
      { title: "Stack three", body: "Copy all three variants and combine them for a thorough negative when a render keeps failing." }
    ],
    faq: [
      { q: "Where does this go?", a: "Paste it into your model's negative prompt field. It pairs with any of the positive prompt builders here." },
      { q: "Is aggressive always better?", a: "No — over-long negatives can flatten an image. Start balanced and escalate only for stubborn artefacts." },
      { q: "Can I save presets?", a: "Yes, save the project locally to reuse your negative set." }
    ]
  }),
  prompt({
    slug: "style-modifier-prompt", title: "Style & Lens Modifier Builder",
    desc: "Append consistent style, lens and rendering modifiers to keep a render series visually coherent.",
    howto: "Choose a visual language, lens and render engine look; the builder produces a reusable modifier string to append to any base prompt.",
    tags: ["style modifiers", "lens", "AI prompt"],
    fields: [
      SEL("look", "Visual language", ["editorial architecture photo", "competition collage", "soft illustrative", "cinematic"], "editorial architecture photo"),
      SEL("lens", "Lens / camera", ["24mm wide", "35mm natural", "50mm portrait", "tilt-shift"], "35mm natural"),
      SEL("engine", "Render look", ["physically based", "Corona / V-Ray look", "matte illustration", "filmic"], "physically based"),
      TXT("extra", "Extra keywords", "balanced exposure, fine detail, true scale")
    ],
    variants: [
      { title: "Modifier string", body: ", {{look}}, {{lens}} lens, {{engine}} rendering, {{extra}}, sharp focus, accurate proportions, professional composition." },
      { title: "Photo realism", body: ", {{look}}, {{lens}}, {{engine}}, natural lighting, realistic materials, depth of field, {{extra}}." },
      { title: "Presentation", body: ", {{look}}, clean background, consistent palette, {{lens}}, {{extra}}, high production value." }
    ],
    examples: [
      { title: "Series consistency", body: "Append the same modifier string to every prompt in a set so all renders share one camera and look." },
      { title: "Switch the look", body: "Swap 'editorial' for 'competition collage' to repurpose a render for a board without rewriting the base prompt." },
      { title: "Lens test", body: "Try 24mm versus tilt-shift to see which framing suits an exterior hero shot." }
    ],
    faq: [
      { q: "Do I use this alone?", a: "No — append it to a base prompt from one of the render builders to keep the description and the styling separate and reusable." },
      { q: "Why separate modifiers?", a: "Keeping style in a reusable string makes a multi-image series consistent and easy to restyle." },
      { q: "Export?", a: "Copy the string or save the project locally." }
    ]
  }),
  // ================= DIAGRAM PROMPTS =================
  prompt({
    slug: "floorplan-prompt", title: "Floor Plan Diagram Prompt", category: "Diagram Prompts",
    desc: "Generate clean, labelled floor-plan diagram prompts with sensible room adjacencies and circulation.",
    howto: "Describe the programme and the builder returns plan-diagram prompts that ask for orthogonal walls, labelled rooms and clear circulation.",
    tags: ["floor plan", "diagram", "AI prompt"],
    fields: [
      TXT("subject", "Building / unit", "two-bedroom apartment"),
      SEL("style", "Plan style", ["clean line diagram", "coloured zoning", "furnished plan", "schematic bubble"], "clean line diagram"),
      AREA("context", "Programme & adjacencies", "open kitchen-living, two bedrooms, one bathroom, entry storage, balcony off living"),
      SEL("output", "Output format", ["top-down plan", "coloured zoning plan", "bubble diagram"], "top-down plan"),
      SEL("mood", "Drawing weight", ["minimal", "technical", "presentation"], "technical")
    ],
    variants: [
      { title: "Plan diagram", body: "Top-down floor plan of {{subject}}, {{style}}, {{context}}, orthogonal walls, labelled rooms, clear circulation, {{mood}} line weight, north arrow, no perspective." },
      { title: "Zoning diagram", body: "Coloured zoning plan of {{subject}} from {{context}}. Group public, private and service zones, show entry and circulation spine, {{mood}} presentation." },
      { title: "Adjacency logic", body: "Bubble / adjacency diagram for {{subject}} using {{context}}. Size bubbles by relative area, connect by access, keep wet rooms grouped." }
    ],
    examples: [
      { title: "Early layout", body: "Start with the bubble diagram to test adjacencies before committing to walls." },
      { title: "Zoning story", body: "Use the zoning variant to explain public-private separation to a client." },
      { title: "Furnished check", body: "Switch to 'furnished plan' to sanity-check that rooms hold real furniture." }
    ],
    faq: [
      { q: "Are these dimensioned?", a: "No — AI plan diagrams are conceptual. Use them to communicate intent, then draft accurately in CAD/BIM." },
      { q: "Can I get bubble diagrams?", a: "Yes, choose the bubble output for early adjacency studies." },
      { q: "Export?", a: "Copy, download or save the prompt set." }
    ]
  }),
  prompt({
    slug: "section-elevation-prompt", title: "Section & Elevation Prompt", category: "Diagram Prompts",
    desc: "Build section and elevation diagram prompts with consistent storey heights and material lines.",
    howto: "Set the building and what to cut through; the tool returns section, elevation and detail prompts that keep heights and ground line consistent.",
    tags: ["section", "elevation", "diagram"],
    fields: [
      TXT("subject", "Building", "three-storey timber house"),
      SEL("style", "Drawing style", ["clean line", "poché shaded", "rendered section", "material call-outs"], "clean line"),
      AREA("context", "What to show", "stair void, double-height living, roof build-up, ground line, foundation"),
      SEL("output", "Output format", ["long section", "front elevation", "section perspective"], "long section"),
      SEL("mood", "Line weight", ["minimal", "technical", "presentation"], "technical")
    ],
    variants: [
      { title: "Section diagram", body: "Architectural {{output}} of {{subject}}, {{style}}, showing {{context}}, consistent storey heights, true ground line, {{mood}} line weight, no perspective distortion." },
      { title: "Elevation", body: "Front elevation of {{subject}}, {{style}}, accurate openings and proportions, material lines for {{context}}, {{mood}}, flat orthographic projection." },
      { title: "Section perspective", body: "Section perspective of {{subject}} cut to reveal {{context}}. Keep storey heights and stair geometry believable, {{mood}} presentation." }
    ],
    examples: [
      { title: "Vertical story", body: "Use the section to explain a double-height living space and stair void to a client." },
      { title: "Facade rhythm", body: "Switch to elevation to study window proportion and material banding." },
      { title: "Build-up clarity", body: "Add material call-outs to communicate the roof and wall build-up." }
    ],
    faq: [
      { q: "Will heights be accurate?", a: "The prompt asks for consistent storey heights and a true ground line, but treat output as diagrammatic — dimension in CAD." },
      { q: "Section perspective too?", a: "Yes, choose the section-perspective output for a more explanatory cut." },
      { q: "Export?", a: "Copy or download the prompt set." }
    ]
  }),
  prompt({
    slug: "massing-prompt", title: "Massing & Concept Diagram Prompt", category: "Diagram Prompts",
    desc: "Produce massing-study prompts that explore form, subtraction and stacking while staying buildable.",
    howto: "Describe site and intent; get massing, transformation and stacking prompts that keep volumes simple and structurally plausible.",
    tags: ["massing", "concept", "diagram"],
    fields: [
      TXT("subject", "Project", "mixed-use corner block"),
      SEL("style", "Massing language", ["simple extrusion", "carved subtraction", "stacked volumes", "stepped terraces"], "simple extrusion"),
      AREA("context", "Site & drivers", "corner site, solar access from south, view to park, step down to neighbours"),
      SEL("output", "Output format", ["white massing model", "diagram series", "axonometric"], "white massing model"),
      SEL("mood", "Light", ["soft studio", "directional sun", "neutral"], "soft studio")
    ],
    variants: [
      { title: "Massing study", body: "White {{output}} of {{subject}}, {{style}}, responding to {{context}}, simple readable volumes, realistic proportions, {{mood}} light, no decoration." },
      { title: "Transformation", body: "Massing transformation diagram series for {{subject}}: extrude, then {{style}} moves driven by {{context}}. Show 3–4 clear steps." },
      { title: "Stacking logic", body: "Axonometric stacking diagram of {{subject}} from {{context}}. Separate programme by colour, keep cores aligned and structure plausible." }
    ],
    examples: [
      { title: "Concept narrative", body: "Use the transformation series to explain how the form responds to sun and views." },
      { title: "Programme stack", body: "Use the stacking variant to show retail, office and residential separation." },
      { title: "Neighbour fit", body: "Add 'step down to neighbours' so the massing respects the street's scale." }
    ],
    faq: [
      { q: "Will it stay buildable?", a: "The control language asks for plausible structure and aligned cores, but verify spans and stability with an engineer." },
      { q: "Diagram series?", a: "Yes — choose the transformation output for a step-by-step concept story." },
      { q: "Export?", a: "Copy, download or save the set." }
    ]
  }),
  prompt({
    slug: "site-plan-prompt", title: "Site Plan & Context Prompt", category: "Diagram Prompts",
    desc: "Generate site-plan prompts with accurate access, setbacks, landscape and north orientation.",
    howto: "Describe the site and the builder returns site-plan, access-diagram and landscape prompts that keep orientation and setbacks legible.",
    tags: ["site plan", "context", "diagram"],
    fields: [
      TXT("subject", "Site / building footprint", "house on a suburban corner lot"),
      SEL("style", "Plan style", ["clean line diagram", "coloured landscape", "figure-ground"], "clean line diagram"),
      AREA("context", "Site features", "driveway access, 4m setbacks, rear garden, existing trees, north to top-right"),
      SEL("output", "Output format", ["top-down site plan", "access diagram", "landscape plan"], "top-down site plan"),
      SEL("mood", "Drawing weight", ["minimal", "technical", "presentation"], "technical")
    ],
    variants: [
      { title: "Site plan", body: "Top-down {{output}} of {{subject}}, {{style}}, showing {{context}}, north arrow, clear setbacks and access, {{mood}} line weight, no perspective." },
      { title: "Access diagram", body: "Access and movement diagram for {{subject}} from {{context}}. Show vehicle, pedestrian and service routes with clear hierarchy." },
      { title: "Landscape plan", body: "Coloured landscape plan of {{subject}} using {{context}}. Indicate paving, planting beds, trees and permeable areas, {{mood}} presentation." }
    ],
    examples: [
      { title: "Planning context", body: "Use the site plan with setbacks for a planning conversation." },
      { title: "Movement clarity", body: "Use the access diagram to show how cars, people and services reach the building." },
      { title: "Soft landscape", body: "Switch to landscape plan to communicate planting and permeable surfaces." }
    ],
    faq: [
      { q: "Are setbacks to scale?", a: "Diagrammatically indicated only — confirm exact setbacks against your local planning rules and a measured survey." },
      { q: "Can I show north?", a: "Yes — note the north direction in the site-features field and it is carried into the prompt." },
      { q: "Export?", a: "Copy or download the set." }
    ]
  }),
  // ================= BRIEFS & DOCS =================
  {
    slug: "design-brief-builder", title: "Design Brief Builder", category: "Briefs & Docs", kind: "builder",
    desc: "Turn project basics into a structured, shareable design brief with goals, constraints and success measures.",
    howto: "Fill the project fields and the builder assembles a clean multi-section brief you can copy into a document, save locally or export as JSON.",
    tags: ["design brief", "document", "RIBA stage 0–1"],
    fields: [
      TXT("projectName", "Project name", "Maple Street House"),
      TXT("client", "Client", "private homeowner"),
      TXT("location", "Location & site", "corner lot, temperate climate, north-facing rear"),
      NUM("budget", "Budget (project currency)", 450000),
      NUM("area", "Target area (m²)", 180),
      AREA("goals", "Primary goals", "light-filled living, energy efficiency, room to grow, low maintenance"),
      AREA("constraints", "Known constraints", "tight side setbacks, heritage street character, 12-month timeline")
    ],
    engine: { sections: [
      { title: "{{projectName}} — Design Brief", body: "Client: {{client}}\nLocation: {{location}}\nTarget area: {{area}} m²\nIndicative budget: {{budget}}" },
      { title: "Project goals", body: "{{goals}}" },
      { title: "Constraints & context", body: "{{constraints}}" },
      { title: "Success measures", body: "The design will be considered successful when the goals above are met within budget and constraints, with a clear, buildable strategy agreed at the end of concept stage." }
    ] },
    examples: [
      { title: "Kick-off document", body: "Generate a one-page brief at project start so client and design team agree goals, budget and constraints before sketching." },
      { title: "Consultant hand-off", body: "Export the brief as JSON or copy it into your project folder to brief structural and services consultants consistently." },
      { title: "Scope guard", body: "Refer back to the success measures during reviews to keep scope and budget aligned." }
    ],
    faq: [
      { q: "Is this RIBA / AIA specific?", a: "It is framework-neutral and maps to early stages (RIBA 0–1, equivalent to pre-design). Adapt the wording to your standard." },
      { q: "Can I keep several briefs?", a: "Yes — save each as a project in this browser, or download JSON per project." },
      { q: "Does it store data online?", a: "No. Everything stays in your browser unless you export it yourself." }
    ],
    limits: STD_LIMITS
  },
  {
    slug: "client-brief-builder", title: "Client-Facing Brief Generator", category: "Briefs & Docs", kind: "builder",
    desc: "Produce a plain-language project summary clients can read and approve without jargon.",
    howto: "Enter the project story in everyday terms and the builder returns a friendly, structured summary for client sign-off.",
    tags: ["client brief", "communication", "document"],
    fields: [
      TXT("projectName", "Project name", "Garden Studio"),
      TXT("client", "Client", "the Patel family"),
      AREA("vision", "In one sentence, the vision", "a calm garden studio for work and guests that feels connected to the garden"),
      AREA("mustHaves", "Must-haves", "natural light, a quiet desk zone, a sofa bed, good insulation"),
      AREA("niceToHaves", "Nice-to-haves", "a small kitchenette, a green roof"),
      SEL("tone", "Tone", ["warm and friendly", "professional and concise", "aspirational"], "warm and friendly")
    ],
    engine: { sections: [
      { title: "{{projectName}}", body: "Prepared for {{client}}. {{vision}}" },
      { title: "What this needs to do", body: "{{mustHaves}}" },
      { title: "If budget allows", body: "{{niceToHaves}}" },
      { title: "Next step", body: "We'll translate this into a concept design for your review. Tone: {{tone}}. Please confirm the must-haves are right before we start." }
    ] },
    examples: [
      { title: "Sign-off summary", body: "Send a jargon-free summary so a client confirms must-haves before design time is spent." },
      { title: "Expectation setting", body: "Separate must-haves from nice-to-haves so budget conversations are honest from day one." },
      { title: "Shared language", body: "Use the same summary across the whole team so everyone describes the project the same way." }
    ],
    faq: [
      { q: "Why separate must vs nice-to-have?", a: "It protects the budget and makes trade-offs explicit, which keeps clients happy when value-engineering is needed." },
      { q: "Can I change the tone?", a: "Yes — pick a tone and the closing section adapts." },
      { q: "Export?", a: "Copy into an email or document, or download JSON." }
    ],
    limits: STD_LIMITS
  },
  {
    slug: "concept-statement-builder", title: "Concept Statement Builder", category: "Briefs & Docs", kind: "builder",
    desc: "Craft a concise design concept statement linking site, idea and experience.",
    howto: "Give the site reading, the central idea and the intended experience; the builder weaves them into a tight concept statement for boards and reports.",
    tags: ["concept statement", "narrative", "document"],
    fields: [
      TXT("projectName", "Project", "Riverside Pavilion"),
      AREA("site", "Site reading", "a quiet bend in the river, mature willows, low afternoon light"),
      AREA("idea", "Central idea", "a light timber frame that frames views and dissolves into the landscape"),
      AREA("experience", "Intended experience", "arrival through dappled shade, a calm threshold, then an open view to the water"),
      SEL("length", "Length", ["short (boards)", "medium (report)", "long (competition)"], "medium (report)")
    ],
    engine: { sections: [
      { title: "{{projectName}} — Concept", body: "Set against {{site}}, the project proposes {{idea}}." },
      { title: "Experience", body: "{{experience}}" },
      { title: "In one line", body: "{{projectName}}: {{idea}} — shaped by {{site}}. (Length target: {{length}})" }
    ] },
    examples: [
      { title: "Board text", body: "Generate tight statement text sized for a presentation board." },
      { title: "Report intro", body: "Use the medium length to open a design report with a clear narrative." },
      { title: "Competition voice", body: "Switch to long for a more lyrical competition statement." }
    ],
    faq: [
      { q: "How long should a concept statement be?", a: "For boards, two or three sentences; for reports, a short paragraph. Pick the length to match." },
      { q: "Can I edit the output?", a: "Yes — copy it out and refine the wording in your own voice." },
      { q: "Export?", a: "Copy or download the statement." }
    ],
    limits: STD_LIMITS
  },
  // ================= CALCULATORS =================
  calc({
    slug: "far-calculator", title: "Floor Area Ratio (FAR) Calculator", category: "Calculators",
    desc: "Check proposed floor area against an allowable FAR / plot ratio and see the remaining envelope instantly.",
    howto: "Enter the site area, your proposed gross floor area and the allowable FAR. The tool returns your actual ratio, the maximum permitted area, and how much capacity remains.",
    tags: ["FAR", "plot ratio", "zoning", "GFA"],
    fields: [NUM("siteArea", "Site area (m²)", 800), NUM("grossFloorArea", "Proposed GFA (m²)", 1800), NUM("allowableFar", "Allowable FAR", 2.5, { step: 0.1 })],
    outputs: [
      { label: "Floor Area Ratio", expr: "grossFloorArea / siteArea", digits: 2 },
      { label: "Max allowable GFA", expr: "siteArea * allowableFar", unit: "m²", digits: 0 },
      { label: "Remaining GFA", expr: "siteArea * allowableFar - grossFloorArea", unit: "m²", digits: 0 }
    ],
    rules: [
      { if: "grossFloorArea > siteArea * allowableFar", text: "Proposed GFA exceeds the allowable envelope. Reduce massing, increase the site area, or seek a planning variance." },
      { if: "grossFloorArea <= siteArea * allowableFar", text: "Within the allowable FAR. Capacity remains for additional floor area if the brief grows." }
    ],
    examples: [
      { title: "Feasibility check", body: "Before buying a site, enter its area and the local FAR to see the maximum buildable floor area in seconds." },
      { title: "Massing test", body: "Adjust proposed GFA up and down to find the point where the design hits the zoning ceiling." },
      { title: "Capacity story", body: "Use the remaining-GFA figure to justify a future extension within the existing allowance." }
    ],
    faq: [
      { q: "Is FAR the same as plot ratio?", a: "Yes — FAR, FSR and plot ratio all express gross floor area divided by site area. Definitions of what counts as GFA vary by jurisdiction." },
      { q: "Does GFA include balconies and cores?", a: "It depends on local rules. Confirm exactly which areas your authority counts toward GFA before relying on the result." }
    ]
  }),
  calc({
    slug: "parking-calculator", title: "Parking Requirement Calculator", category: "Calculators",
    desc: "Estimate required car stalls, accessible bays and EV-ready spaces from floor area and a provision ratio.",
    howto: "Enter the gross floor area and your local ratio of stalls per 100 m², plus accessible and EV percentages. The tool rounds up to whole stalls for each category.",
    tags: ["parking", "stalls", "accessible", "EV"],
    fields: [NUM("grossFloorArea", "Gross floor area (m²)", 1800), NUM("spacesPer100", "Stalls per 100 m²", 2.5, { step: 0.1 }), NUM("accessiblePct", "Accessible (%)", 4), NUM("evPct", "EV-ready (%)", 10)],
    outputs: [
      { label: "Required stalls", expr: "Math.ceil(grossFloorArea / 100 * spacesPer100)", format: "integer" },
      { label: "Accessible bays", expr: "Math.max(1, Math.ceil(Math.ceil(grossFloorArea / 100 * spacesPer100) * accessiblePct / 100))", format: "integer" },
      { label: "EV-ready stalls", expr: "Math.ceil(Math.ceil(grossFloorArea / 100 * spacesPer100) * evPct / 100)", format: "integer" }
    ],
    rules: [
      { if: "Math.ceil(grossFloorArea / 100 * spacesPer100) > 200", text: "Large stall count — confirm ramp grades, aisle widths and whether a traffic assessment is triggered." },
      { text: "Confirm the local provision ratio and accessible-bay minimum; many codes set a fixed minimum regardless of percentage." }
    ],
    examples: [
      { title: "Mixed-use block", body: "Size the basement by entering the GFA and the council's stalls-per-100 m² ratio." },
      { title: "Accessibility minimum", body: "Check that the calculated accessible bays meet your code's fixed minimum, not just the percentage." },
      { title: "EV readiness", body: "Set the EV percentage to your jurisdiction's new-build requirement to plan conduit and load." }
    ],
    faq: [
      { q: "Which ratio do I use?", a: "Provision ratios vary by use and city. Use your local development code's figure; the calculator simply applies it." },
      { q: "Why round up?", a: "Stalls are whole bays, so the tool ceilings each category to a buildable number." }
    ]
  }),
  calc({
    slug: "occupancy-load-calculator", title: "Occupancy Load & Egress Calculator", category: "Calculators",
    desc: "Estimate occupant load, exits required and total egress width from floor area and a load factor.",
    howto: "Enter the floor area and the occupant load factor (m² per person) for the use. The tool returns the occupant count, exits required and total egress width at 5 mm per person.",
    tags: ["occupancy", "egress", "life safety", "exits"],
    fields: [NUM("area", "Occupiable area (m²)", 300), NUM("loadFactor", "Load factor (m²/person)", 9.3, { step: 0.1 }), NUM("widthPerPerson", "Egress width (mm/person)", 5, { step: 0.5 })],
    outputs: [
      { label: "Occupant load", expr: "Math.ceil(area / loadFactor)", format: "integer" },
      { label: "Exits required", expr: "Math.ceil(area / loadFactor) > 500 ? 3 : (Math.ceil(area / loadFactor) > 50 ? 2 : 1)", format: "integer" },
      { label: "Total egress width", expr: "Math.ceil(area / loadFactor) * widthPerPerson", unit: "mm", digits: 0 }
    ],
    rules: [
      { if: "Math.ceil(area / loadFactor) > 50", text: "Occupant load over 50 typically requires at least two remote exits and doors that swing in the direction of egress." },
      { if: "Math.ceil(area / loadFactor) <= 50", text: "Lower occupant load — a single exit may be permitted, but confirm travel distance limits for the use." }
    ],
    examples: [
      { title: "Assembly check", body: "Test a function room's occupant load against the number of doors provided." },
      { title: "Exit sizing", body: "Use the total egress width to confirm door and corridor widths are adequate." },
      { title: "Use comparison", body: "Change the load factor to compare office versus assembly occupancy on the same floor." }
    ],
    faq: [
      { q: "Where do load factors come from?", a: "From the occupancy tables in your building code (IBC, NCC, local equivalents). Use the factor for the specific use." },
      { q: "Is 5 mm/person universal?", a: "No — egress width factors differ by code and whether stairs or level routes are involved. Adjust the field to match." }
    ]
  }),
  calc({
    slug: "stair-calculator", title: "Stair Rise & Run Calculator", category: "Calculators",
    desc: "Compute riser count, exact riser height, going and the 2R+T comfort check from a floor-to-floor height.",
    howto: "Enter the floor-to-floor height, a target riser and your tread going. The tool finds the nearest whole number of risers, the exact riser height, the run length and the 2R+T comfort value.",
    tags: ["stairs", "rise run", "2R+T", "going"],
    fields: [NUM("floorToFloor", "Floor to floor (mm)", 3200), NUM("targetRiser", "Target riser (mm)", 175), NUM("tread", "Going / tread (mm)", 280)],
    outputs: [
      { label: "Number of risers", expr: "Math.round(floorToFloor / targetRiser)", format: "integer" },
      { label: "Actual riser", expr: "floorToFloor / Math.round(floorToFloor / targetRiser)", unit: "mm", digits: 1 },
      { label: "Goings (treads)", expr: "Math.round(floorToFloor / targetRiser) - 1", format: "integer" },
      { label: "Total run", expr: "(Math.round(floorToFloor / targetRiser) - 1) * tread", unit: "mm", digits: 0 },
      { label: "Comfort 2R + T", expr: "2 * (floorToFloor / Math.round(floorToFloor / targetRiser)) + tread", unit: "mm", digits: 0 }
    ],
    rules: [
      { if: "2 * (floorToFloor / Math.round(floorToFloor / targetRiser)) + tread < 600 || 2 * (floorToFloor / Math.round(floorToFloor / targetRiser)) + tread > 640", text: "2R+T is outside the comfortable 600–640 mm range. Adjust the riser or going for a more comfortable stair." },
      { if: "floorToFloor / Math.round(floorToFloor / targetRiser) > 190", text: "Actual riser exceeds ~190 mm — many codes cap private stairs near this height. Add a riser." }
    ],
    examples: [
      { title: "Quick stair check", body: "Enter a 3.2 m floor height to instantly see how many risers and what run length the stair needs." },
      { title: "Comfort tuning", body: "Nudge the going until 2R+T lands in the 600–640 mm comfort band." },
      { title: "Headroom planning", body: "Use the total run to confirm the stair fits the available plan length and landing." }
    ],
    faq: [
      { q: "What is 2R+T?", a: "Twice the riser plus the going — a long-standing comfort rule of thumb. Around 620 mm walks comfortably." },
      { q: "Are riser limits code-specific?", a: "Yes. Maximum riser and minimum going vary by code and by public vs private stairs. Confirm against your local rules." }
    ]
  }),
  calc({
    slug: "ramp-slope-calculator", title: "Accessible Ramp Slope Calculator", category: "Calculators",
    desc: "Find the minimum ramp length, slope percentage and landing count for a given rise and gradient.",
    howto: "Enter the vertical rise and your target gradient (1 : x). The tool returns the run length, slope as a percentage and how many intermediate landings the rise needs.",
    tags: ["ramp", "accessibility", "slope", "ADA"],
    fields: [NUM("rise", "Vertical rise (mm)", 760), NUM("ratio", "Gradient 1 : x", 12), NUM("maxRisePerFlight", "Max rise per flight (mm)", 750)],
    outputs: [
      { label: "Minimum run", expr: "rise * ratio / 1000", unit: "m", digits: 2 },
      { label: "Slope", expr: "100 / ratio", format: "percent" },
      { label: "Landings needed", expr: "Math.max(0, Math.ceil(rise / maxRisePerFlight) - 1)", format: "integer" }
    ],
    rules: [
      { if: "ratio < 12", text: "Gradient steeper than 1:12 — many accessibility codes treat 1:12 as the maximum for ramps. Flatten the slope." },
      { if: "ratio >= 12", text: "Gradient at or gentler than 1:12. Confirm landing lengths (typically 1500 mm) and handrail requirements." }
    ],
    examples: [
      { title: "Entry ramp", body: "Size a ramp for a 760 mm rise at 1:12 to see it needs over 9 m of run plus landings." },
      { title: "Tight site", body: "Compare 1:12 and 1:14 to understand the length penalty of a gentler, more comfortable slope." },
      { title: "Landing layout", body: "Use the landings figure to plan rest platforms before drawing the ramp." }
    ],
    faq: [
      { q: "Is 1:12 always allowed?", a: "It is a common maximum but some uses and regions require gentler. Always confirm the governing accessibility standard." },
      { q: "Do landings count in the run?", a: "This tool reports the sloped run only. Add landing lengths (often 1500 mm each) to get the total." }
    ]
  }),
  calc({
    slug: "concrete-volume-calculator", title: "Concrete Volume Calculator", category: "Calculators",
    desc: "Calculate slab or footing concrete volume with waste allowance and approximate mass.",
    howto: "Enter length, width and thickness plus a waste percentage. The tool returns net volume, volume including waste and an approximate mass at 2400 kg/m³.",
    tags: ["concrete", "volume", "slab", "footing"],
    fields: [NUM("length", "Length (m)", 6, { step: 0.1 }), NUM("width", "Width (m)", 4, { step: 0.1 }), NUM("thickness", "Thickness (mm)", 150), NUM("wastePct", "Waste (%)", 5)],
    outputs: [
      { label: "Net volume", expr: "length * width * thickness / 1000", unit: "m³", digits: 2 },
      { label: "With waste", expr: "length * width * thickness / 1000 * (1 + wastePct / 100)", unit: "m³", digits: 2 },
      { label: "Approx. mass", expr: "length * width * thickness / 1000 * 2400", unit: "kg", digits: 0 }
    ],
    rules: [
      { if: "length * width * thickness / 1000 > 6", text: "Over ~6 m³ — likely a ready-mix delivery. Confirm pour rate, access and a continuous pour plan." },
      { text: "Order to the nearest practical batch and confirm reinforcement and cover separately." }
    ],
    examples: [
      { title: "Slab order", body: "Enter a 6 × 4 m slab at 150 mm to get the cubic metres to order, waste included." },
      { title: "Footing run", body: "Use a long, narrow footprint to size strip-footing concrete." },
      { title: "Logistics", body: "Use the mass figure to sense-check crane or barrow handling for small pours." }
    ],
    faq: [
      { q: "Does it include reinforcement?", a: "No — it sizes concrete volume only. Reinforcement, cover and mix design are separate." },
      { q: "What waste should I allow?", a: "5–10% is typical for spillage and over-excavation; adjust to your site conditions." }
    ]
  }),
  calc({
    slug: "paint-quantity-calculator", title: "Paint Quantity Calculator", category: "Calculators",
    desc: "Estimate litres of paint and the number of cans for a wall area, coat count and coverage rate.",
    howto: "Enter the wall area, number of coats, the paint's coverage rate and a waste allowance. The tool returns litres required and 5-litre cans to buy.",
    tags: ["paint", "coverage", "finishes", "litres"],
    fields: [NUM("wallArea", "Wall area (m²)", 60), NUM("coats", "Coats", 2), NUM("coverage", "Coverage (m²/L)", 11), NUM("wastePct", "Waste (%)", 10)],
    outputs: [
      { label: "Paint required", expr: "wallArea * coats / coverage * (1 + wastePct / 100)", unit: "L", digits: 1 },
      { label: "5 L cans", expr: "Math.ceil(wallArea * coats / coverage * (1 + wastePct / 100) / 5)", format: "integer" },
      { label: "Coats × area", expr: "wallArea * coats", unit: "m²", digits: 0 }
    ],
    rules: [
      { if: "coats < 2", text: "Single coat — most colours need two for even coverage, especially over a contrasting base." },
      { text: "Check the actual coverage on the tin; textured or porous surfaces use more paint." }
    ],
    examples: [
      { title: "Room repaint", body: "Enter the wall area and two coats to get the litres and cans to buy." },
      { title: "Primer pass", body: "Add a coat to account for a primer over new plaster." },
      { title: "Porous walls", body: "Lower the coverage rate for rough render so you don't under-order." }
    ],
    faq: [
      { q: "Should I subtract windows?", a: "For accuracy, subtract large openings from the wall area; the waste allowance covers small ones." },
      { q: "Why does coverage vary?", a: "Surface texture, porosity and colour change real-world coverage. Use the tin's figure as a starting point." }
    ]
  }),
  calc({
    slug: "tile-quantity-calculator", title: "Tile Quantity Calculator", category: "Calculators",
    desc: "Work out how many tiles a floor or wall needs from tile size, area and a cutting allowance.",
    howto: "Enter the area to tile, the tile dimensions and a waste percentage for cuts. The tool returns tiles needed and the area each tile covers.",
    tags: ["tiles", "flooring", "wall", "waste"],
    fields: [NUM("area", "Area to tile (m²)", 24, { step: 0.1 }), NUM("tileLength", "Tile length (mm)", 600), NUM("tileWidth", "Tile width (mm)", 600), NUM("wastePct", "Waste (%)", 10)],
    outputs: [
      { label: "Tile coverage", expr: "tileLength * tileWidth / 1000000", unit: "m²", digits: 3 },
      { label: "Tiles needed", expr: "Math.ceil(area / (tileLength * tileWidth / 1000000) * (1 + wastePct / 100))", format: "integer" },
      { label: "Area incl. waste", expr: "area * (1 + wastePct / 100)", unit: "m²", digits: 1 }
    ],
    rules: [
      { if: "wastePct < 10", text: "Under 10% waste is tight for diagonal or patterned layouts. Increase the allowance for complex rooms." },
      { text: "Buy from one batch / shade lot and keep spares for future repairs." }
    ],
    examples: [
      { title: "Bathroom floor", body: "Enter the floor area and 600 × 600 tiles to get the count, cuts included." },
      { title: "Feature wall", body: "Switch to the wall area and a smaller tile for a mosaic-style estimate." },
      { title: "Pattern allowance", body: "Raise waste to 15% for a herringbone or diagonal layout." }
    ],
    faq: [
      { q: "How much waste for patterns?", a: "Straight lay is ~10%; diagonal and herringbone often need 15% or more due to cuts." },
      { q: "Should I keep spares?", a: "Yes — a few extra tiles from the same batch save a colour-mismatch later." }
    ]
  }),
  calc({
    slug: "brick-quantity-calculator", title: "Brick & Block Quantity Calculator", category: "Calculators",
    desc: "Estimate bricks or blocks and mortar volume for a wall area with a breakage allowance.",
    howto: "Enter the wall area, bricks per square metre for your bond, and a waste percentage. The tool returns total units and approximate mortar volume.",
    tags: ["brick", "block", "masonry", "mortar"],
    fields: [NUM("wallArea", "Wall area (m²)", 30, { step: 0.1 }), NUM("unitsPerM2", "Units per m²", 60), NUM("wastePct", "Waste (%)", 5)],
    outputs: [
      { label: "Units needed", expr: "Math.ceil(wallArea * unitsPerM2 * (1 + wastePct / 100))", format: "integer" },
      { label: "Approx. mortar", expr: "wallArea * 0.03 * (1 + wastePct / 100)", unit: "m³", digits: 2 },
      { label: "Area incl. waste", expr: "wallArea * (1 + wastePct / 100)", unit: "m²", digits: 1 }
    ],
    rules: [
      { if: "unitsPerM2 < 50", text: "Low units/m² suggests blockwork or a thick joint. Confirm the unit size and bond." },
      { text: "Mortar volume is indicative for a standard 10 mm joint; adjust for joint thickness and frog." }
    ],
    examples: [
      { title: "Garden wall", body: "Standard bricks run about 60 per m²; enter the wall area to get the count plus breakage." },
      { title: "Blockwork", body: "Lower units/m² for concrete blocks to size a partition or retaining wall." },
      { title: "Mortar order", body: "Use the mortar volume to estimate sand and cement for the job." }
    ],
    faq: [
      { q: "How many bricks per m²?", a: "Standard metric brickwork is ~60 per m² in stretcher bond; blocks are far fewer. Use your unit's figure." },
      { q: "Is mortar exact?", a: "It is a rule-of-thumb at a 10 mm joint. Frogged bricks and thicker joints use more." }
    ]
  }),
  calc({
    slug: "roof-pitch-calculator", title: "Roof Pitch Calculator", category: "Calculators",
    desc: "Convert roof rise and run into pitch angle, slope percentage and rafter length.",
    howto: "Enter the vertical rise and horizontal run of the roof. The tool returns the pitch ratio, angle in degrees, slope percentage and the rafter (hypotenuse) length.",
    tags: ["roof", "pitch", "rafter", "slope"],
    fields: [NUM("rise", "Rise (m)", 3, { step: 0.1 }), NUM("run", "Run (m)", 6, { step: 0.1 })],
    outputs: [
      { label: "Pitch ratio", expr: "rise / run", digits: 2 },
      { label: "Angle", expr: "Math.atan(rise / run) * 180 / Math.PI", unit: "°", digits: 1 },
      { label: "Slope", expr: "rise / run * 100", format: "percent" },
      { label: "Rafter length", expr: "Math.sqrt(rise * rise + run * run)", unit: "m", digits: 2 }
    ],
    rules: [
      { if: "Math.atan(rise / run) * 180 / Math.PI < 10", text: "Shallow pitch under ~10° — confirm the roof covering is rated for low slope and check drainage." },
      { if: "Math.atan(rise / run) * 180 / Math.PI >= 45", text: "Steep pitch at or above 45° — consider wind loading, batten fixings and access for maintenance." }
    ],
    examples: [
      { title: "Covering check", body: "Confirm a tile or membrane is rated for your calculated slope before specifying." },
      { title: "Rafter take-off", body: "Use the rafter length to estimate timber and sheet lengths." },
      { title: "Angle conversion", body: "Translate a 3-in-6 roof into degrees for a detailer or fabricator." }
    ],
    faq: [
      { q: "Pitch as ratio or degrees?", a: "Trades use both. This tool shows the ratio, the angle and the percentage so you can match any drawing convention." },
      { q: "Does rafter length include overhang?", a: "No — it is the rise/run hypotenuse. Add eaves overhang separately." }
    ]
  }),
  calc({
    slug: "solar-panel-calculator", title: "Solar PV Sizing Calculator", category: "Calculators",
    desc: "Estimate array size, panel count and roof area from daily energy use and local sun hours.",
    howto: "Enter daily energy use, peak sun hours, panel wattage and a system-loss allowance. The tool sizes the array in kW, the number of panels and the roof area needed.",
    tags: ["solar", "PV", "renewables", "energy"],
    fields: [NUM("dailyKwh", "Daily energy use (kWh)", 18, { step: 0.5 }), NUM("sunHours", "Peak sun hours/day", 4.5, { step: 0.1 }), NUM("panelWatt", "Panel rating (W)", 450), NUM("lossPct", "System losses (%)", 20)],
    outputs: [
      { label: "Array size", expr: "dailyKwh / sunHours / (1 - lossPct / 100)", unit: "kW", digits: 2 },
      { label: "Panels needed", expr: "Math.ceil(dailyKwh / sunHours / (1 - lossPct / 100) * 1000 / panelWatt)", format: "integer" },
      { label: "Roof area (≈2 m²/panel)", expr: "Math.ceil(dailyKwh / sunHours / (1 - lossPct / 100) * 1000 / panelWatt) * 2", unit: "m²", digits: 0 }
    ],
    rules: [
      { if: "sunHours < 3.5", text: "Low sun hours — the array grows quickly. Verify local solar data and consider tilt/orientation gains." },
      { text: "Confirm available unshaded roof area and inverter sizing against the calculated array." }
    ],
    examples: [
      { title: "House sizing", body: "Enter 18 kWh/day and local sun hours to estimate panels and roof area for a home." },
      { title: "Loss sensitivity", body: "Raise system losses to see how shading and wiring derate the array." },
      { title: "Roof fit", body: "Use the roof-area figure to check the array physically fits before detailed design." }
    ],
    faq: [
      { q: "What are peak sun hours?", a: "The equivalent hours of full-strength sun per day for your location — pull it from a local solar resource map." },
      { q: "Why a loss factor?", a: "Real systems lose ~15–25% to temperature, wiring, inverter and soiling. Adjust for your conditions." }
    ]
  }),
  calc({
    slug: "rainwater-harvesting-calculator", title: "Rainwater Harvesting Calculator", category: "Calculators",
    desc: "Estimate annual and monthly harvestable rainwater from roof area, rainfall and a runoff coefficient.",
    howto: "Enter the catchment roof area, annual rainfall and a runoff coefficient for the surface. The tool returns yearly and monthly yield and a suggested tank size.",
    tags: ["rainwater", "WSUD", "tank", "runoff"],
    fields: [NUM("roofArea", "Catchment area (m²)", 120), NUM("rainfall", "Annual rainfall (mm)", 800), NUM("runoff", "Runoff coefficient", 0.85, { step: 0.05 })],
    outputs: [
      { label: "Annual yield", expr: "roofArea * rainfall * runoff", unit: "L", digits: 0 },
      { label: "Monthly average", expr: "roofArea * rainfall * runoff / 12", unit: "L", digits: 0 },
      { label: "Suggested tank", expr: "roofArea * rainfall * runoff / 12 * 1.5", unit: "L", digits: 0 }
    ],
    rules: [
      { if: "runoff > 0.9", text: "High runoff coefficient — valid for smooth metal roofs; reduce for tile, green or gravel surfaces." },
      { text: "Match tank size to demand and dry-spell length, not just average yield, to avoid oversizing." }
    ],
    examples: [
      { title: "Tank sizing", body: "Enter roof area and local rainfall to estimate yield and a starting tank size." },
      { title: "Surface effect", body: "Lower the runoff coefficient for a tiled roof to see the reduced capture." },
      { title: "Irrigation supply", body: "Compare monthly yield against garden demand to check self-sufficiency." }
    ],
    faq: [
      { q: "What runoff coefficient?", a: "Smooth metal roofs are ~0.9; tiles ~0.75; green roofs much lower. Pick the value for your surface." },
      { q: "Is the tank size firm?", a: "It is a starting point. Size against demand and the longest dry spell, not just average rainfall." }
    ]
  }),
  calc({
    slug: "u-value-calculator", title: "U-Value & R-Value Calculator", category: "Calculators",
    desc: "Convert a material layer's thickness and conductivity into its thermal resistance (R) and U-value.",
    howto: "Enter the layer thickness and the material's thermal conductivity (lambda). The tool returns the R-value and the corresponding U-value for that layer.",
    tags: ["U-value", "R-value", "thermal", "insulation"],
    fields: [NUM("thickness", "Thickness (mm)", 100), NUM("conductivity", "Conductivity λ (W/m·K)", 0.035, { step: 0.001 })],
    outputs: [
      { label: "R-value", expr: "(thickness / 1000) / conductivity", unit: "m²·K/W", digits: 2 },
      { label: "U-value", expr: "conductivity / (thickness / 1000)", unit: "W/m²·K", digits: 3 }
    ],
    rules: [
      { if: "conductivity / (thickness / 1000) > 0.30", text: "U-value above 0.30 W/m²·K is relatively poor for an insulation layer — increase thickness or use a lower-λ product." },
      { text: "This is the layer resistance only. Add surface resistances and other layers for the whole-element U-value." }
    ],
    examples: [
      { title: "Insulation depth", body: "See how 100 mm of mineral wool performs, then increase thickness to hit a target." },
      { title: "Product comparison", body: "Change λ to compare PIR against mineral wool at the same thickness." },
      { title: "Build-up start", body: "Use the R-value as the first term when summing a full wall build-up." }
    ],
    faq: [
      { q: "Is this the whole wall U-value?", a: "No — it is one layer. A full element adds surface resistances and every layer's R-value before inverting to U." },
      { q: "What is λ (lambda)?", a: "Thermal conductivity in W/m·K from the product datasheet. Lower is better-insulating." }
    ]
  }),
  calc({
    slug: "construction-cost-estimator", title: "Construction Cost Estimator", category: "Calculators",
    desc: "Produce an order-of-magnitude build cost from area, a rate per square metre and a contingency.",
    howto: "Enter the floor area, your cost per square metre and a contingency percentage. The tool returns base cost, contingency and total — formatted as currency.",
    tags: ["cost", "estimate", "budget", "rate"],
    fields: [NUM("area", "Floor area (m²)", 150), NUM("costPerM2", "Cost per m²", 2200), NUM("contingencyPct", "Contingency (%)", 12)],
    outputs: [
      { label: "Base cost", expr: "area * costPerM2", format: "money" },
      { label: "Contingency", expr: "area * costPerM2 * contingencyPct / 100", format: "money" },
      { label: "Total estimate", expr: "area * costPerM2 * (1 + contingencyPct / 100)", format: "money" }
    ],
    rules: [
      { if: "contingencyPct < 10", text: "Under 10% contingency is optimistic at early stages — design risk is highest before drawings are detailed." },
      { text: "Rates are regional and date-sensitive. Use current local benchmarks and exclude land, fees and tax unless added." }
    ],
    examples: [
      { title: "Feasibility budget", body: "Multiply area by a local rate to set an early budget expectation with the client." },
      { title: "Contingency view", body: "See the cash value of contingency at concept stage versus a detailed stage." },
      { title: "Option costing", body: "Change the rate to compare a basic versus high-spec finish level." }
    ],
    faq: [
      { q: "Are professional fees included?", a: "No — this is construction cost only. Add design fees, levies, tax and land separately." },
      { q: "Where do rates come from?", a: "Use current regional cost guides or recent tenders; rates move with market and location." }
    ]
  }),
  calc({
    slug: "daylight-factor-calculator", title: "Daylight Factor Estimator", category: "Calculators",
    desc: "Estimate average daylight factor and glazing ratio from window area, room area and glass transmittance.",
    howto: "Enter the glazing area, floor area, visible light transmittance and an obstruction factor. The tool returns an approximate average daylight factor and the glazing-to-floor ratio.",
    tags: ["daylight", "DF", "glazing", "comfort"],
    fields: [NUM("glazing", "Glazing area (m²)", 6, { step: 0.1 }), NUM("floorArea", "Floor area (m²)", 30, { step: 0.1 }), NUM("transmittance", "Visible transmittance", 0.7, { step: 0.05 }), NUM("obstruction", "Sky obstruction factor", 0.8, { step: 0.05 })],
    outputs: [
      { label: "Avg. daylight factor", expr: "glazing * transmittance * obstruction / floorArea * 45", format: "percent" },
      { label: "Glazing : floor ratio", expr: "glazing / floorArea * 100", format: "percent" }
    ],
    rules: [
      { if: "glazing * transmittance * obstruction / floorArea * 45 < 2", text: "Estimated DF below 2% reads as dim — increase glazing area, raise transmittance or reduce obstruction." },
      { if: "glazing * transmittance * obstruction / floorArea * 45 > 5", text: "DF above 5% is bright but risks glare and overheating — consider shading and solar control glass." }
    ],
    examples: [
      { title: "Window sizing", body: "Test whether a room's glazing gives a 2–5% daylight factor before finalising openings." },
      { title: "Glass choice", body: "Lower transmittance to see the daylight cost of a heavily tinted solar-control glass." },
      { title: "Context effect", body: "Reduce the obstruction factor to model a room facing a tall neighbour." }
    ],
    faq: [
      { q: "Is this a validated DF?", a: "It is a quick estimate for early decisions. For compliance, run a daylight simulation with real geometry and sky models." },
      { q: "What DF should I aim for?", a: "Around 2–5% suits most habitable rooms — enough light without glare or overheating." }
    ]
  }),
  calc({
    slug: "hvac-load-calculator", title: "Cooling Load Rough Estimator", category: "Calculators",
    desc: "Get a first-pass sensible cooling load from floor area, occupants, glazing and a climate factor.",
    howto: "Enter the floor area, occupant count, glazing percentage and a climate W/m² factor. The tool returns an indicative cooling load in watts, kilowatts and refrigeration tons.",
    tags: ["HVAC", "cooling", "load", "tons"],
    fields: [NUM("floorArea", "Floor area (m²)", 80), NUM("occupants", "Occupants", 4), NUM("glazingPct", "Glazing (% of floor)", 25), NUM("climateFactor", "Climate factor (W/m²)", 120)],
    outputs: [
      { label: "Cooling load", expr: "floorArea * climateFactor + occupants * 120 + floorArea * glazingPct / 100 * 60", unit: "W", digits: 0 },
      { label: "In kilowatts", expr: "(floorArea * climateFactor + occupants * 120 + floorArea * glazingPct / 100 * 60) / 1000", unit: "kW", digits: 2 },
      { label: "Refrigeration tons", expr: "(floorArea * climateFactor + occupants * 120 + floorArea * glazingPct / 100 * 60) / 3517", unit: "tons", digits: 1 }
    ],
    rules: [
      { if: "glazingPct > 40", text: "High glazing ratio drives cooling load up sharply — add external shading or solar-control glass before sizing plant." },
      { text: "This is a sizing sanity-check only. Use a full load calculation (e.g. ASHRAE/CIBSE method) for plant selection." }
    ],
    examples: [
      { title: "Plant sanity-check", body: "Compare a contractor's proposed unit size against this first-pass load." },
      { title: "Glazing impact", body: "Raise the glazing percentage to see how much extra cooling a glass facade demands." },
      { title: "Climate scaling", body: "Increase the climate factor for a hot, humid location to scale the load." }
    ],
    faq: [
      { q: "Is this good enough to size equipment?", a: "No — it is a rough check. Detailed selection needs a full hourly or block load with real constructions and schedules." },
      { q: "What climate factor do I use?", a: "Temperate offices sit near 80–120 W/m²; hot climates and high loads go higher. Calibrate to local experience." }
    ]
  }),
  calc({
    slug: "room-proportion-calculator", title: "Room Proportion & Golden Ratio Tool", category: "Calculators",
    desc: "Generate harmonious room lengths from a short side using golden, root-2 and 4:3 proportions.",
    howto: "Enter the short side of a room and the tool returns the matching long side for the golden ratio, root-2 and 4:3 proportional systems.",
    tags: ["proportion", "golden ratio", "design", "harmony"],
    fields: [NUM("shortSide", "Short side (m)", 3.0, { step: 0.1 })],
    outputs: [
      { label: "Golden (1:1.618)", expr: "shortSide * 1.618", unit: "m", digits: 2 },
      { label: "Root-2 (1:1.414)", expr: "shortSide * 1.414", unit: "m", digits: 2 },
      { label: "Four-thirds (3:4)", expr: "shortSide * 4 / 3", unit: "m", digits: 2 }
    ],
    rules: [
      { text: "Proportion is a guide, not a rule — adjust to furniture layout, circulation and structural grid." }
    ],
    examples: [
      { title: "Living room shape", body: "Enter a 3 m width to find golden and root-2 lengths for a balanced living space." },
      { title: "Facade panels", body: "Use the ratios to set pleasing window or panel proportions." },
      { title: "Quick harmony", body: "Compare three classical systems side by side before committing a plan dimension." }
    ],
    faq: [
      { q: "Does proportion guarantee good design?", a: "No — it is one tool among many. Function, light and structure matter more, but harmonious ratios help spaces feel resolved." },
      { q: "Which ratio is best?", a: "There's no single answer. Golden feels dynamic, root-2 relates to paper sizes, 4:3 is calm and practical." }
    ]
  }),
  // ================= CONVERTERS =================
  conv({
    slug: "length-converter", title: "Length Unit Converter",
    desc: "Convert between millimetres, metres, feet, inches and more with a full conversion table.",
    howto: "Enter a value, pick the from and to units, and the converter shows the result plus the same value in every supported unit.",
    units: [
      { label: "mm", factor: 1 }, { label: "cm", factor: 10 }, { label: "m", factor: 1000 },
      { label: "km", factor: 1000000 }, { label: "in", factor: 25.4 }, { label: "ft", factor: 304.8 },
      { label: "yd", factor: 914.4 }, { label: "mile", factor: 1609344 }
    ], from: "m", to: "ft", default: 1,
    examples: [
      { title: "Drawing units", body: "Convert a 2400 mm door height to feet and inches for an imperial-standard supplier." },
      { title: "Site dimensions", body: "Switch metres to yards when reading an older survey." },
      { title: "Quick table", body: "Read one value across every unit at once instead of converting twice." }
    ],
    faq: [
      { q: "How precise is it?", a: "Conversions use exact factors (e.g. 1 inch = 25.4 mm) and display to four decimals." },
      { q: "Imperial and metric together?", a: "Yes — the table lists both so you can cross-reference instantly." }
    ]
  }),
  conv({
    slug: "area-converter", title: "Area Unit Converter",
    desc: "Convert square metres, square feet, acres, hectares and more for sites and floor plates.",
    howto: "Enter an area, choose units, and see it expressed across every supported area unit.",
    units: [
      { label: "m²", factor: 1 }, { label: "cm²", factor: 0.0001 }, { label: "ft²", factor: 0.09290304 },
      { label: "in²", factor: 0.00064516 }, { label: "yd²", factor: 0.83612736 },
      { label: "acre", factor: 4046.8564224 }, { label: "hectare", factor: 10000 }
    ], from: "m²", to: "ft²", default: 100,
    examples: [
      { title: "Site area", body: "Convert a hectare site into square metres and acres for a feasibility note." },
      { title: "Floor plate", body: "Translate a square-metre floor plate into square feet for an international client." },
      { title: "Land parcels", body: "Read acres and hectares side by side when comparing parcels." }
    ],
    faq: [
      { q: "Is an acre exact here?", a: "Yes — it uses the international acre (4046.8564224 m²)." },
      { q: "Can I convert tiny areas?", a: "Yes, square centimetres and inches are included for detail work." }
    ]
  }),
  conv({
    slug: "volume-converter", title: "Volume Unit Converter",
    desc: "Convert litres, cubic metres, cubic feet and gallons for concrete, water and material take-offs.",
    howto: "Enter a volume, select units, and the converter lists the equivalent in every supported unit.",
    units: [
      { label: "L", factor: 1 }, { label: "mL", factor: 0.001 }, { label: "m³", factor: 1000 },
      { label: "cm³", factor: 0.001 }, { label: "ft³", factor: 28.316846592 },
      { label: "gal (US)", factor: 3.785411784 }, { label: "gal (UK)", factor: 4.54609 }
    ], from: "m³", to: "L", default: 1, precision: 3,
    examples: [
      { title: "Concrete order", body: "Convert a cubic-metre pour into litres or cubic feet for a supplier's form." },
      { title: "Tank capacity", body: "Read a rainwater tank in litres and gallons at once." },
      { title: "US vs UK gallons", body: "Compare US and imperial gallons to avoid a 20% ordering error." }
    ],
    faq: [
      { q: "US or UK gallons?", a: "Both are included separately — they differ by about 20%, so pick carefully." },
      { q: "Cubic metres to litres?", a: "1 m³ = 1000 L; the converter handles it and shows the full table." }
    ]
  }),
  calc({
    slug: "drawing-scale-converter", title: "Drawing Scale Converter", category: "Converters",
    desc: "Convert a measured length on a scaled drawing into its real-world dimension, and back.",
    howto: "Enter a length measured on the drawing in millimetres and the scale denominator (the x in 1 : x). The tool returns the real length in millimetres and metres.",
    tags: ["scale", "drawing", "1:100", "measure"],
    fields: [NUM("drawnLength", "Measured on drawing (mm)", 50), NUM("scale", "Scale 1 : x", 100)],
    outputs: [
      { label: "Real length", expr: "drawnLength * scale", unit: "mm", digits: 0 },
      { label: "In metres", expr: "drawnLength * scale / 1000", unit: "m", digits: 3 },
      { label: "Drawn at 1:50", expr: "drawnLength * scale / 50", unit: "mm", digits: 1 }
    ],
    rules: [
      { text: "Confirm the drawing is printed at true size — PDFs scaled to fit will read incorrectly." }
    ],
    examples: [
      { title: "Read a plan", body: "Measure 50 mm on a 1:100 plan to find the real 5 m dimension." },
      { title: "Re-scale check", body: "See what the same line would measure if the sheet were printed at 1:50." },
      { title: "Field verification", body: "Cross-check a dimension scaled off a drawing against a tape on site." }
    ],
    faq: [
      { q: "Why does scaling go wrong?", a: "Most errors come from drawings printed 'fit to page' rather than at true scale. Always verify a known dimension first." },
      { q: "Can I go from real to drawn?", a: "Yes — the third output shows the drawn length at 1:50; divide real length by any scale to get the paper size." }
    ]
  }),
  // ================= SCHEDULES =================
  {
    slug: "door-window-schedule", title: "Door & Window Schedule Builder", category: "Schedules", kind: "schedule",
    desc: "Paste door and window rows to get a validated, costed schedule with a CSV export.",
    howto: "Enter one item per line as Mark, Qty, Unit cost, Size/notes. The tool totals the cost, flags incomplete rows and outputs a clean CSV you can copy.",
    tags: ["door schedule", "window schedule", "CSV", "take-off"],
    fields: [AREA("rows", "Items (Mark, Qty, Unit cost, Size/notes)", "D01, 4, 320, 900x2100 solid core\nD02, 2, 540, 1800x2100 double glazed\nW01, 6, 410, 1200x1500 awning\nW02, 3, 690, 2400x1500 fixed", 8)],
    engine: { columns: ["Mark", "Qty", "Unit cost", "Size / notes"], qtyIndex: 1, costIndex: 2 },
    examples: [
      { title: "Tender take-off", body: "Paste the door and window marks with quantities and rates to get a quick costed total for pricing." },
      { title: "Gap check", body: "Incomplete rows are flagged so you don't tender a schedule with a missing size or rate." },
      { title: "Hand to estimator", body: "Copy the CSV straight into a spreadsheet for the cost plan." }
    ],
    faq: [
      { q: "What format are rows?", a: "Comma-separated: Mark, Qty, Unit cost, Size/notes — one item per line. Extra columns are kept." },
      { q: "Does it total cost?", a: "Yes — it multiplies quantity by unit cost across all rows and reports the estimated total." }
    ],
    limits: STD_LIMITS
  },
  {
    slug: "room-finish-schedule", title: "Room Finish Schedule Builder", category: "Schedules", kind: "schedule",
    desc: "Build a room-by-room finishes schedule for floor, wall and ceiling with validation.",
    howto: "Enter one room per line as Room, Floor, Wall, Ceiling. The tool tabulates the schedule and flags any room missing a finish.",
    tags: ["finishes", "room schedule", "FF&E", "CSV"],
    fields: [AREA("rows", "Rooms (Room, Floor, Wall, Ceiling)", "Living, oak engineered, painted plaster, painted plaster\nKitchen, porcelain tile, splashback + paint, painted plaster\nBathroom, mosaic tile, full tile, moisture-resistant board\nBedroom, wool carpet, painted plaster, painted plaster", 8)],
    engine: { columns: ["Room", "Floor", "Wall", "Ceiling"], qtyIndex: -1, costIndex: -1 },
    examples: [
      { title: "Spec coordination", body: "List every room's finishes in one table to coordinate the specification and avoid omissions." },
      { title: "Missing-finish flag", body: "Rows missing a column are flagged so no surface is left unspecified." },
      { title: "Client review", body: "Copy the table into a finishes document for client sign-off." }
    ],
    faq: [
      { q: "Why are cost columns empty?", a: "Finish schedules are descriptive, not costed, so totals aren't shown — use the door/window builder when you need pricing." },
      { q: "Can I add more columns?", a: "Add skirting or notes after the ceiling column; extra fields are preserved in the output." }
    ],
    limits: STD_LIMITS
  },
  {
    slug: "furniture-schedule", title: "Furniture & FF&E Schedule Builder", category: "Schedules", kind: "schedule",
    desc: "Cost a furniture, fixtures and equipment schedule from pasted rows with quantities and rates.",
    howto: "Enter one item per line as Item, Qty, Unit cost, Supplier/notes. The tool totals the FF&E budget and flags incomplete rows.",
    tags: ["FF&E", "furniture", "budget", "CSV"],
    fields: [AREA("rows", "Items (Item, Qty, Unit cost, Supplier/notes)", "Sofa, 1, 2400, linen 3-seat\nDining chair, 6, 180, oak\nPendant light, 3, 320, brushed brass\nDesk, 2, 540, height adjustable", 8)],
    engine: { columns: ["Item", "Qty", "Unit cost", "Supplier / notes"], qtyIndex: 1, costIndex: 2 },
    examples: [
      { title: "FF&E budget", body: "Paste the furniture list with quantities and rates to total the FF&E package." },
      { title: "Procurement list", body: "Use the CSV as a starting purchase order schedule." },
      { title: "Value engineering", body: "Adjust quantities and rates to bring the total within budget." }
    ],
    faq: [
      { q: "Is this only furniture?", a: "Use it for any costed item list — furniture, fixtures, equipment or loose items." },
      { q: "Export to spreadsheet?", a: "Yes — copy the generated CSV into Excel or Sheets." }
    ],
    limits: STD_LIMITS
  },
  // ================= CHECKLISTS =================
  {
    slug: "design-review-checklist", title: "Design Review Readiness Checklist", category: "Checklists", kind: "checklist",
    desc: "Score how ready a scheme is for design review by flagging the risks that remain open.",
    howto: "Tick every issue that is still unresolved. The tool weights each risk, scores overall readiness and lists what to close before the review.",
    tags: ["design review", "readiness", "QA", "risk"],
    fields: [{ id: "items", label: "Open risks (tick what is NOT yet resolved)", type: "checklist",
      options: ["Brief not signed off", "Budget not aligned to scope", "Planning constraints unconfirmed", "Structural strategy unclear", "Services / MEP coordination missing", "Accessibility not checked", "Fire / egress strategy missing", "Daylight not assessed", "Key dimensions uncoordinated", "Drawings not consistent"], default: ["Services / MEP coordination missing", "Fire / egress strategy missing"] }],
    data: { items: [
      { title: "Brief not signed off", weight: 5, category: "Process", note: "Agree the brief before review or feedback will reopen settled decisions." },
      { title: "Budget not aligned to scope", weight: 5, category: "Cost", note: "Reconcile cost plan and scope; surprises here derail reviews." },
      { title: "Planning constraints unconfirmed", weight: 4, category: "Statutory", note: "Confirm setbacks, height and use against local planning." },
      { title: "Structural strategy unclear", weight: 4, category: "Structure", note: "Have an outline structural concept and grid agreed." },
      { title: "Services / MEP coordination missing", weight: 3, category: "Services", note: "Locate risers, plant and routes before review." },
      { title: "Accessibility not checked", weight: 4, category: "Access", note: "Verify step-free access, ramps and clearances." },
      { title: "Fire / egress strategy missing", weight: 5, category: "Life safety", note: "Establish exits, travel distances and protected routes early." },
      { title: "Daylight not assessed", weight: 2, category: "Comfort", note: "Sanity-check daylight to key habitable rooms." },
      { title: "Key dimensions uncoordinated", weight: 3, category: "Coordination", note: "Align grid, levels and critical dimensions across drawings." },
      { title: "Drawings not consistent", weight: 3, category: "Documentation", note: "Resolve clashes between plans, sections and elevations." }
    ] },
    examples: [
      { title: "Pre-review gate", body: "Run the checklist before a design review so the team closes high-weight risks first." },
      { title: "Readiness score", body: "Use the percentage to decide whether the scheme is mature enough to present." },
      { title: "Action list", body: "Export the open items as the agenda for the next coordination meeting." }
    ],
    faq: [
      { q: "How is the score calculated?", a: "Each open risk carries a weight; readiness falls as more weighted risks remain unresolved, so safety and process items move the needle most." },
      { q: "Can I change the items?", a: "The list targets common review risks; treat it as a baseline and add project-specific items in your own notes." }
    ],
    limits: STD_LIMITS
  },
  {
    slug: "accessibility-checklist", title: "Accessibility Compliance Checklist", category: "Checklists", kind: "checklist",
    desc: "Flag unresolved accessibility items and score how close a design is to inclusive-access readiness.",
    howto: "Tick each accessibility item still outstanding. The tool weights them, scores readiness and lists what to resolve for an inclusive, compliant design.",
    tags: ["accessibility", "ADA", "inclusive", "step-free"],
    fields: [{ id: "items", label: "Outstanding access items", type: "checklist",
      options: ["No step-free entrance", "Ramp exceeds 1:12", "Doors below clear width", "No accessible WC", "Lift / vertical access missing", "Turning circles not provided", "Tactile / wayfinding missing", "Contrast / signage not checked", "Accessible parking missing", "Thresholds not level"], default: ["Tactile / wayfinding missing", "Contrast / signage not checked"] }],
    data: { items: [
      { title: "No step-free entrance", weight: 5, category: "Entry", note: "Provide at least one step-free, dignified entrance." },
      { title: "Ramp exceeds 1:12", weight: 4, category: "Circulation", note: "Flatten ramps to 1:12 or gentler with landings." },
      { title: "Doors below clear width", weight: 4, category: "Doors", note: "Ensure clear opening widths for wheelchair access." },
      { title: "No accessible WC", weight: 5, category: "Sanitary", note: "Provide a compliant accessible toilet with transfer space." },
      { title: "Lift / vertical access missing", weight: 5, category: "Vertical", note: "Multi-storey public areas need a compliant lift." },
      { title: "Turning circles not provided", weight: 3, category: "Clearance", note: "Allow turning space in key rooms and lobbies." },
      { title: "Tactile / wayfinding missing", weight: 2, category: "Wayfinding", note: "Add tactile cues and clear, legible wayfinding." },
      { title: "Contrast / signage not checked", weight: 2, category: "Visual", note: "Verify visual contrast for signage and surfaces." },
      { title: "Accessible parking missing", weight: 3, category: "Parking", note: "Provide accessible bays close to the entrance." },
      { title: "Thresholds not level", weight: 3, category: "Detail", note: "Keep thresholds level or within shallow tolerances." }
    ] },
    examples: [
      { title: "Early access audit", body: "Catch step-free, WC and lift issues at concept stage when they're cheap to fix." },
      { title: "Readiness score", body: "Track the access score improving as items are resolved through design." },
      { title: "Contrast follow-up", body: "Pair the contrast item with the Colour Contrast Checker to close it properly." }
    ],
    faq: [
      { q: "Does this guarantee compliance?", a: "No — accessibility law varies by country (ADA, Equality Act, NCC, etc.). Use it as a prompt, then verify against the governing standard." },
      { q: "Why weight the items?", a: "A missing accessible entrance or WC affects far more people than a signage detail, so it carries more weight in the score." }
    ],
    limits: STD_LIMITS
  },
  {
    slug: "sustainability-checklist", title: "Sustainability & Energy Checklist", category: "Checklists", kind: "checklist",
    desc: "Score a project's sustainability readiness by flagging passive-design and energy gaps.",
    howto: "Tick the sustainability measures not yet addressed. The tool weights them, scores readiness and highlights the highest-impact gaps to close.",
    tags: ["sustainability", "LEED", "passive", "energy"],
    fields: [{ id: "items", label: "Gaps to address", type: "checklist",
      options: ["Orientation not optimised", "No external shading", "Insulation below target", "Airtightness not specified", "No daylight strategy", "No natural ventilation", "High embodied-carbon materials", "No rainwater / water strategy", "No renewables considered", "No end-of-life / circularity plan"], default: ["No external shading", "Airtightness not specified"] }],
    data: { items: [
      { title: "Orientation not optimised", weight: 4, category: "Passive", note: "Orient main glazing and rooms for solar access and shading control." },
      { title: "No external shading", weight: 4, category: "Comfort", note: "External shading cuts cooling load far more than internal blinds." },
      { title: "Insulation below target", weight: 4, category: "Fabric", note: "Hit fabric U-value targets before adding services." },
      { title: "Airtightness not specified", weight: 3, category: "Fabric", note: "Specify and test airtightness to realise insulation gains." },
      { title: "No daylight strategy", weight: 2, category: "Comfort", note: "Plan daylight to reduce lighting energy and improve wellbeing." },
      { title: "No natural ventilation", weight: 3, category: "Air", note: "Provide cross or stack ventilation where climate allows." },
      { title: "High embodied-carbon materials", weight: 4, category: "Carbon", note: "Favour lower-carbon structure and finishes; measure embodied carbon." },
      { title: "No rainwater / water strategy", weight: 2, category: "Water", note: "Capture rainwater and reduce potable demand." },
      { title: "No renewables considered", weight: 3, category: "Energy", note: "Assess PV or other renewables against demand." },
      { title: "No end-of-life / circularity plan", weight: 2, category: "Circularity", note: "Design for disassembly, reuse and recyclability." }
    ] },
    examples: [
      { title: "Passive-first review", body: "Confirm orientation, shading and fabric are addressed before relying on services." },
      { title: "Carbon focus", body: "Surface embodied-carbon and insulation gaps as the highest-impact items." },
      { title: "Score tracking", body: "Re-run the checklist each stage to show sustainability readiness improving." }
    ],
    faq: [
      { q: "Is this a certification tool?", a: "No — it's a readiness prompt. For LEED, BREEAM or Green Star, follow the scheme's official criteria and assessor process." },
      { q: "Why prioritise passive design?", a: "Getting orientation, shading and fabric right reduces demand first, so renewables and services do less work." }
    ],
    limits: STD_LIMITS
  },
  {
    slug: "site-analysis-checklist", title: "Site Analysis Checklist", category: "Checklists", kind: "checklist",
    desc: "Make sure no critical site factor is missed before design begins, with a readiness score.",
    howto: "Tick every site factor you have not yet investigated. The tool weights the gaps and scores how ready you are to start designing on real information.",
    tags: ["site analysis", "context", "survey", "due diligence"],
    fields: [{ id: "items", label: "Not yet investigated", type: "checklist",
      options: ["No measured survey", "Orientation / sun path unknown", "Prevailing wind unknown", "Topography / levels unclear", "Access & services not located", "Flood / drainage risk unchecked", "Views & overlooking not mapped", "Neighbour heights unknown", "Soil / geotech unknown", "Planning context unconfirmed"], default: ["No measured survey", "Soil / geotech unknown"] }],
    data: { items: [
      { title: "No measured survey", weight: 5, category: "Survey", note: "Design on a measured survey, not assumptions." },
      { title: "Orientation / sun path unknown", weight: 4, category: "Climate", note: "Map sun path to drive room and glazing placement." },
      { title: "Prevailing wind unknown", weight: 2, category: "Climate", note: "Understand wind for ventilation and shelter." },
      { title: "Topography / levels unclear", weight: 4, category: "Ground", note: "Levels shape access, drainage and cut/fill." },
      { title: "Access & services not located", weight: 4, category: "Infrastructure", note: "Locate vehicle access and existing services early." },
      { title: "Flood / drainage risk unchecked", weight: 4, category: "Risk", note: "Check flood mapping and surface-water drainage." },
      { title: "Views & overlooking not mapped", weight: 2, category: "Amenity", note: "Map good views to capture and overlooking to screen." },
      { title: "Neighbour heights unknown", weight: 2, category: "Context", note: "Record neighbour heights for daylight and scale fit." },
      { title: "Soil / geotech unknown", weight: 4, category: "Ground", note: "Soil conditions drive foundation type and cost." },
      { title: "Planning context unconfirmed", weight: 3, category: "Statutory", note: "Confirm zoning, overlays and constraints." }
    ] },
    examples: [
      { title: "Due-diligence gate", body: "Run before sketching so design starts on surveyed, real-world information." },
      { title: "Survey trigger", body: "A low score signals you need a measured survey and geotech before proceeding." },
      { title: "Risk surfacing", body: "Flood and soil gaps surface as high-weight risks to close first." }
    ],
    faq: [
      { q: "When should I run this?", a: "At the very start of a project, before concept design — it stops costly assumptions baked into early decisions." },
      { q: "Why is survey weighted highest?", a: "Almost everything downstream depends on accurate levels and boundaries, so a missing survey is the biggest risk." }
    ],
    limits: STD_LIMITS
  },
  // ================= DECISION MATRIX =================
  {
    slug: "material-comparison-matrix", title: "Material Comparison Matrix", category: "Decision Matrix", kind: "matrix",
    desc: "Rank material options against weighted criteria for durability, cost and appearance.",
    howto: "Enter one option per line as Name, then a score (0–10) for each criterion. The tool applies the criteria weights and ranks the options.",
    tags: ["material selection", "weighted scoring", "comparison"],
    fields: [AREA("rows", "Options (Name, Durability, Cost-value, Appearance, Sustainability)", "Brick, 9, 7, 8, 6\nTimber cladding, 6, 8, 9, 8\nFibre cement, 8, 7, 6, 6\nMetal panel, 8, 5, 7, 7", 8)],
    engine: { weights: { Durability: 0.3, "Cost-value": 0.3, Appearance: 0.2, Sustainability: 0.2 } },
    examples: [
      { title: "Cladding choice", body: "Score brick, timber and metal against weighted criteria to defend a facade decision." },
      { title: "Transparent rationale", body: "Show a client the weighting and scores behind the recommended material." },
      { title: "Re-weight live", body: "Increase the sustainability weight to see how the ranking shifts toward lower-impact options." }
    ],
    faq: [
      { q: "How do I score options?", a: "Rate each option 0–10 on every criterion. Higher is better; the tool multiplies by the criterion weight and sums." },
      { q: "Can I change the weights?", a: "The weights reflect a balanced default; adjust your scores to emphasise what matters, or note custom weights in your report." }
    ],
    limits: STD_LIMITS
  },
  {
    slug: "site-selection-matrix", title: "Site Selection Matrix", category: "Decision Matrix", kind: "matrix",
    desc: "Compare candidate sites against weighted criteria like access, cost, planning and amenity.",
    howto: "Enter one site per line as Name then 0–10 scores for each criterion. The tool weights and ranks the sites to support an evidence-based decision.",
    tags: ["site selection", "feasibility", "weighted scoring"],
    fields: [AREA("rows", "Sites (Name, Access, Cost, Planning ease, Amenity)", "Riverside lot, 7, 6, 5, 9\nHigh Street infill, 9, 5, 6, 7\nEdge-of-town, 6, 9, 8, 5\nStation block, 9, 4, 5, 8", 8)],
    engine: { weights: { Access: 0.3, Cost: 0.3, "Planning ease": 0.2, Amenity: 0.2 } },
    examples: [
      { title: "Acquisition shortlist", body: "Score shortlisted sites to rank them objectively before committing capital." },
      { title: "Stakeholder clarity", body: "Use the ranked output to explain a site recommendation to a board." },
      { title: "Sensitivity test", body: "Adjust scores to see how robust the leading site is to changing priorities." }
    ],
    faq: [
      { q: "What scale do I score on?", a: "Score each criterion 0–10 where 10 is best. The tool applies the weights and ranks the totals." },
      { q: "Can I add criteria?", a: "Add more numeric columns; the matrix reads them in order against the configured weights." }
    ],
    limits: STD_LIMITS
  },
  {
    slug: "concept-comparison-matrix", title: "Concept Option Comparison Matrix", category: "Decision Matrix", kind: "matrix",
    desc: "Rank design concept options against weighted criteria to choose a direction with evidence.",
    howto: "Enter one concept per line as Name then 0–10 scores for each criterion. The tool weights and ranks the options so the chosen direction is defensible.",
    tags: ["concept options", "design decision", "weighted scoring"],
    fields: [AREA("rows", "Concepts (Name, Brief fit, Buildability, Cost, Wow factor)", "Courtyard scheme, 9, 7, 6, 8\nLinear bar, 7, 9, 8, 6\nStacked volumes, 8, 6, 5, 9\nPavilions, 6, 8, 7, 8", 8)],
    engine: { weights: { "Brief fit": 0.35, Buildability: 0.25, Cost: 0.2, "Wow factor": 0.2 } },
    examples: [
      { title: "Direction sign-off", body: "Score three concepts to choose a direction with a clear, recorded rationale." },
      { title: "Balance check", body: "See whether the most exciting option is buildable and affordable enough to proceed." },
      { title: "Workshop tool", body: "Score options live in a design workshop to focus the conversation." }
    ],
    faq: [
      { q: "Is the highest score always right?", a: "It's a structured prompt, not a verdict. Use it to surface trade-offs, then apply judgement on the qualitative factors a number can't capture." },
      { q: "Why weight brief fit highest?", a: "A concept that misses the brief fails regardless of how striking it looks, so brief fit carries the most weight by default." }
    ],
    limits: STD_LIMITS
  },
  // ================= REFERENCE LIBRARY =================
  {
    slug: "materials-library", title: "Architectural Materials Library", category: "Reference Library", kind: "library",
    desc: "Search common building materials with typical uses and the cautions that catch people out.",
    howto: "Type a keyword or pick a category to filter the materials. Each entry gives a typical use and a caution to check before specifying.",
    tags: ["materials", "specification", "reference"],
    fields: [TXT("query", "Search", "", "Try: timber, brick, glass"), SEL("category", "Category", ["All", "Structure", "Cladding", "Interior", "Glazing", "Finishes"], "All")],
    data: { items: [
      { title: "Reinforced concrete", category: "Structure", use: "Frames, slabs, foundations", note: "Strong in compression, formable, high thermal mass.", caution: "High embodied carbon — optimise mix and quantity; manage cover and curing." },
      { title: "Structural steel", category: "Structure", use: "Long spans, frames", note: "High strength-to-weight, fast erection, recyclable.", caution: "Needs fire protection; check corrosion exposure and connection design." },
      { title: "Glulam / mass timber", category: "Structure", use: "Beams, columns, CLT floors", note: "Renewable, warm, lower embodied carbon.", caution: "Detail for moisture and fire; confirm acoustic and code acceptance." },
      { title: "Facing brick", category: "Cladding", use: "Durable facades, garden walls", note: "Low maintenance, long life, good weathering.", caution: "Allow movement joints; confirm mortar and tie spacing." },
      { title: "Timber cladding", category: "Cladding", use: "Warm, natural facades", note: "Renewable, easy to work, ages attractively.", caution: "Plan for weathering and movement; detail rain-screen and fixings." },
      { title: "Fibre-cement panel", category: "Cladding", use: "Low-maintenance rain-screen", note: "Durable, fire-resistant, many finishes.", caution: "Cutting needs dust control; confirm fixing and panel jointing." },
      { title: "Insulated glazing unit", category: "Glazing", use: "Windows, curtain wall", note: "Daylight and views with thermal control.", caution: "Balance solar gain and glare; specify coatings and check condensation risk." },
      { title: "Polished concrete floor", category: "Interior", use: "Robust, seamless floors", note: "Durable, thermal mass, low maintenance.", caution: "Hard and cold underfoot; control cracking and slip resistance." },
      { title: "Engineered oak floor", category: "Finishes", use: "Warm residential floors", note: "Stable, real-wood surface, refinishable.", caution: "Acclimatise before laying; check wear layer and moisture limits." },
      { title: "Lime plaster", category: "Finishes", use: "Breathable wall finish", note: "Vapour-open, good for older buildings.", caution: "Slower to cure; needs compatible breathable build-up." },
      { title: "Natural stone", category: "Cladding", use: "Premium facades, floors", note: "Durable, unique, ages well.", caution: "Heavy and costly; confirm fixing, sealing and slip rating." },
      { title: "Acoustic plasterboard", category: "Interior", use: "Walls and ceilings", note: "Improves sound control, easy to finish.", caution: "Performance depends on the whole build-up and sealing of gaps." }
    ] },
    examples: [
      { title: "Spec sanity-check", body: "Search a material to recall its typical use and the caution to verify before writing the spec." },
      { title: "Category browse", body: "Filter to Cladding to compare facade options at a glance." },
      { title: "Risk awareness", body: "Use the caution field to brief a junior on what to check for each material." }
    ],
    faq: [
      { q: "Is this exhaustive?", a: "No — it's a starting reference of common materials. Always confirm performance against current manufacturer data and standards." },
      { q: "Can I search and filter together?", a: "Yes — combine a keyword with a category to narrow results quickly." }
    ],
    limits: STD_LIMITS
  },
  {
    slug: "architecture-style-glossary", title: "Architecture Style Glossary", category: "Reference Library", kind: "library",
    desc: "Browse architectural styles with defining features and the eras they belong to.",
    howto: "Search or filter by era to find a style. Each entry summarises its hallmark features so you can reference or describe it accurately.",
    tags: ["styles", "history", "glossary"],
    fields: [TXT("query", "Search", "", "Try: brutalist, art deco"), SEL("category", "Era", ["All", "Classical", "19th century", "Early modern", "Modern", "Contemporary"], "All")],
    data: { items: [
      { title: "Classical", category: "Classical", use: "Civic, institutional", note: "Columns, pediments, symmetry and clear proportion.", caution: "Orders and proportions carry meaning — use them coherently." },
      { title: "Gothic", category: "Classical", use: "Cathedrals, revival civic", note: "Pointed arches, ribbed vaults, verticality, tracery.", caution: "Structural logic drives the form; ornament follows it." },
      { title: "Art Nouveau", category: "19th century", use: "Decorative, residential", note: "Organic, flowing lines and natural motifs.", caution: "Bespoke detailing is craft-intensive and costly." },
      { title: "Art Deco", category: "Early modern", use: "Towers, cinemas, hotels", note: "Geometric ornament, stepped forms, rich materials.", caution: "Decoration is integral — don't strip it to a token." },
      { title: "Bauhaus / Modern", category: "Early modern", use: "Housing, schools, offices", note: "Function-led, clean lines, honest materials.", caution: "Simplicity demands precise detailing to read well." },
      { title: "International Style", category: "Modern", use: "Office towers", note: "Glass curtain walls, steel frames, no ornament.", caution: "Manage solar gain and human scale at street level." },
      { title: "Brutalism", category: "Modern", use: "Civic, university, housing", note: "Exposed concrete, bold sculptural mass.", caution: "Weathering and perception need careful handling." },
      { title: "Postmodern", category: "Modern", use: "Commercial, civic", note: "Historical references, colour, playful symbolism.", caution: "Irony can date quickly — commit to the idea." },
      { title: "Minimalism", category: "Contemporary", use: "Galleries, residential", note: "Reduction, light, precise junctions, restraint.", caution: "Every detail shows — tolerances must be tight." },
      { title: "High-tech", category: "Contemporary", use: "Civic, transport", note: "Expressed structure and services, flexibility.", caution: "Exposed systems demand durable, maintainable detailing." },
      { title: "Parametric", category: "Contemporary", use: "Cultural, landmark", note: "Computational, flowing geometry, complex curvature.", caution: "Fabrication and cost control are the real challenge." },
      { title: "Vernacular revival", category: "Contemporary", use: "Housing, rural", note: "Local materials, climate-responsive, contextual.", caution: "Reinterpret rather than copy to stay authentic." }
    ] },
    examples: [
      { title: "Describe a precedent", body: "Look up a style to use the right vocabulary in a concept statement or report." },
      { title: "Era browse", body: "Filter by era to trace how forms and priorities evolved." },
      { title: "Prompt vocabulary", body: "Borrow the feature words to enrich a render prompt's style direction." }
    ],
    faq: [
      { q: "Are styles ever pure?", a: "Rarely — most buildings blend influences. Use these as reference points, not rigid boxes." },
      { q: "Can I use this for prompts?", a: "Yes — the feature descriptions pair well with the render prompt builders to set a precise style direction." }
    ],
    limits: STD_LIMITS
  },
  {
    slug: "drawing-symbols-library", title: "Drawing Symbols & Conventions Library", category: "Reference Library", kind: "library",
    desc: "Reference common architectural drawing symbols and what they mean across plans and sections.",
    howto: "Search or filter by drawing type to find a symbol or convention and a note on how it is correctly used.",
    tags: ["symbols", "conventions", "drawings"],
    fields: [TXT("query", "Search", "", "Try: north, section, door"), SEL("category", "Drawing type", ["All", "Plan", "Section", "Annotation", "Electrical"], "All")],
    data: { items: [
      { title: "North arrow", category: "Plan", use: "Orientation", note: "Indicates plan orientation; place consistently on every plan.", caution: "Use true or project north consistently and state which." },
      { title: "Section cut line", category: "Plan", use: "Locating sections", note: "Heavy line with direction arrows and a reference tag.", caution: "Arrows must point the way the section is viewed." },
      { title: "Door swing", category: "Plan", use: "Door operation", note: "Arc showing leaf and swing direction.", caution: "Check swing clearance against walls and fixtures." },
      { title: "Window in plan", category: "Plan", use: "Openings", note: "Break in wall with glazing lines.", caution: "Show sill and head separately where needed." },
      { title: "Stair with arrow", category: "Plan", use: "Vertical circulation", note: "Treads with an up/down arrow and break line.", caution: "Label UP from the floor shown; show the break line correctly." },
      { title: "Level / spot height", category: "Section", use: "Heights", note: "Triangle or cross with a level value.", caution: "State the datum; keep levels consistent across drawings." },
      { title: "Grid line", category: "Annotation", use: "Setting out", note: "Lettered and numbered structural grid bubbles.", caution: "Keep grid consistent across all disciplines." },
      { title: "Dimension line", category: "Annotation", use: "Measurement", note: "Line with ticks/arrows and a dimension value.", caution: "Dimension to faces or centrelines consistently." },
      { title: "Revision cloud", category: "Annotation", use: "Changes", note: "Cloud with a revision tag marking updates.", caution: "Always pair with a revision note and date." },
      { title: "Power outlet", category: "Electrical", use: "Services layout", note: "Standard socket symbol on services plans.", caution: "Coordinate height and location with finishes." },
      { title: "Light fitting", category: "Electrical", use: "Lighting layout", note: "Symbol indicating fitting type and switching.", caution: "Coordinate with reflected ceiling plan." },
      { title: "Detail callout", category: "Annotation", use: "Cross-reference", note: "Circle/tag linking to an enlarged detail.", caution: "Keep the detail and sheet references accurate." }
    ] },
    examples: [
      { title: "Drawing standards", body: "Check a symbol's correct use when setting up an office drawing standard." },
      { title: "Onboarding", body: "Use it to teach a new team member how to read and annotate drawings." },
      { title: "QA pass", body: "Verify north arrows, grids and revision clouds are used consistently before issue." }
    ],
    faq: [
      { q: "Are symbols universal?", a: "Broadly, but conventions vary by office, country and standard (e.g. BS, ISO, US). Confirm against your project's drawing standard." },
      { q: "Does it draw the symbols?", a: "It explains meaning and correct usage; your CAD/BIM template provides the actual linework." }
    ],
    limits: STD_LIMITS
  },
  // ================= ACCESSIBILITY =================
  {
    slug: "color-contrast-checker", title: "Colour Contrast Checker", category: "Accessibility", kind: "contrast",
    desc: "Check foreground/background colour contrast against WCAG thresholds for legible signage and UI.",
    howto: "Pick a foreground and background colour. The tool computes the WCAG contrast ratio and tells you whether normal and large text pass.",
    tags: ["contrast", "WCAG", "signage", "legibility"],
    fields: [{ id: "foreground", label: "Foreground", type: "color", default: "#14201d" }, { id: "background", label: "Background", type: "color", default: "#ffffff" }],
    examples: [
      { title: "Signage legibility", body: "Test wayfinding text against its panel colour to ensure it reads for everyone." },
      { title: "UI compliance", body: "Check interface text meets the 4.5:1 ratio before sign-off." },
      { title: "Palette pairing", body: "Trial brand colours to find an accessible foreground/background pair." }
    ],
    faq: [
      { q: "What ratio do I need?", a: "WCAG AA wants 4.5:1 for normal text and 3:1 for large text; AAA is stricter at 7:1 and 4.5:1." },
      { q: "Does large text really pass lower?", a: "Yes — larger, heavier text stays legible at a lower ratio, so the threshold relaxes to 3:1 for AA." }
    ],
    limits: STD_LIMITS
  }
];
