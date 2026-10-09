/* ==========================================================================
   Portfolio data — three categories (UX/UI, Branding, Designs), each a
   folder under assets/portfolio/, each holding one subfolder per project.
   Used by: the home page's 3D hotspots + marquee (one hotspot per
   project), works.html (category tab → project grid → project detail),
   and nothing else needs to know the on-disk layout — everything else
   goes through the helpers at the bottom.

   CATEGORIES   the three tabs in the nav (UX/UI, Branding, Designs)
   PROJECTS     every project across all three categories, flat — each
                entry knows its own category id, so filtering by tab is
                just PROJECTS.filter(p => p.category === id)

   A project's `layout` is its own case-study page, top to bottom — an
   ordered list of blocks (see js/works-page.js's renderGallery for how
   each type renders):
     { type: "hero", file }          one image, full width
     { type: "pair", files: [a, b] } two images, side by side
     { type: "quad", files: [..4] }  four images, 2x2
     { type: "video", file }         one video, full width, native controls
     { type: "text", body }          a short paragraph, no image — used to
                                      break up long runs of images and to
                                      say something a filename can't
   `cover` is separate from `layout` — the one image used as this
   project's thumbnail everywhere else (grids, marquee, 3D hotspot plaque).
   It's usually also the opening hero in `layout`, but doesn't have to be.

   `brief` is optional and replaces `layout` for projects told as a
   structured process (every project) — a tagline, a few facts and
   a list of chapters, each a title, text and `blocks`. Blocks sit on one
   three-column grid: a `row` of three equal cells or a `single` piece
   across all three. See js/brief.js for the block and cell shapes. A brief
   can also carry a `pdf` and a `film` (a looping video pinned beside the
   page — Foreign Exchange).

   `site` is optional — { url, label } for a project with a live site of
   its own (Ubit, Everlost). Rendered as an outbound link under the
   description on that project's page — see js/works-page.js.
   ========================================================================== */

export const CATEGORIES = [
  { id: "ux-ui", dir: "UX UI", label: "UX/UI" },
  { id: "branding", dir: "Branding", label: "Branding" },
  { id: "designs", dir: "Designs", label: "Designs" },
];

export const PROJECTS = [
  {
    id: "ubit",
    category: "ux-ui",
    dir: "UX UI/Ubit - Cryptomining platform",
    title: "Ubit — Mining Platform",
    medium: "UX/UI",
    desc: "Product UI for a Bitcoin mining and hashrate-rental platform. Onboarding, dashboards, and the screens that show a return before they ask for money, built for mobile and desktop.",
    site: { url: "https://ubitcard.app/en/", label: "ubitcard.app" },
    cover: "Perspective App Screen Mockup.jpg",
    brief: {
      tagline: "Show the return before asking for money.",
      facts: [
        ["Product", "Bitcoin mining and hashrate rental"],
        ["Platforms", "Mobile and desktop"],
        ["Scope", "Onboarding, dashboards, payments"],
      ],
      chapters: [
        {
          id: "trust",
          title: "Trust the numbers first",
          text: "People need to trust the numbers before they trust the platform. Every screen here is built around showing the return clearly, before it asks for anything.",
          blocks: [
            { single: "Perspective App Screen Mockup.jpg", title: "Landing and app screens", caption: "The brand, the pitch and the product side by side." },
          ],
        },
        {
          id: "dashboard",
          title: "Reading the return",
          text: "Net ROI, the asset mix and the Bitcoin rate sit on one dashboard. Each number gets its own small chart, so nothing has to be worked out by hand.",
          blocks: [
            { single: "Untitled-1.jpg", title: "Dashboard", caption: "Return, investment stats and asset composition." },
          ],
        },
        {
          id: "renting",
          title: "Renting hashrate",
          text: "The core flow is three steps: choose an amount of hashrate, set the rental terms, pay. The price and the expected income stay in view on every one of them.",
          blocks: [
            {
              row: "4 / 5",
              items: [
                { file: "Untitled-2.jpg", title: "Choose an amount", caption: "From the package picker to the running balance." },
                { file: "ChatGPT Image Jun 13, 2026, 07_18_14 PM.png", title: "Set the terms", caption: "Hashrate, package price and expected income." },
                { file: "dbeda208-b227-4f9d-a591-687669f33d98.png", title: "Pay", caption: "The order, and payment in two steps." },
              ],
            },
          ],
        },
        {
          id: "system",
          title: "One system on every screen",
          text: "Onboarding, top-ups, payouts. Same visual system on mobile and desktop, so nothing feels different once you switch devices.",
          blocks: [
            {
              row: "4 / 3",
              fit: "cover",
              items: [
                { file: "Free_Iphone_14_Pro_Mockup_4.jpg", title: "Mobile" },
                { file: "Macbook_Air_Mockup_1.jpg", title: "Desktop" },
                { file: "Vertical-Rigid-Plastic-Rounded-Identity-Gravity-Cards-Free-psd-Mockup.jpg", title: "Hashrate cards", caption: "Each package as a card." },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "foreign-exchange",
    category: "branding",
    dir: "Branding/Foreign Exchange",
    title: "Foreign Exchange",
    medium: "Branding",
    desc: "A small social campaign for a café at 22 Leinster Terrace, made with young artists. The aim is to make Foreign Exchange the place in London where creative people come to sit, work and feel free to make things.",
    cover: "cover.webp",
    brief: {
      tagline: "Rates daily. Roasts weekly.",
      film: {
        file: "fx-final.mp4",
        poster: "fx-final-poster.webp",
        title: "Final film",
        caption: "The café builds itself brick by brick, fills up, and ends on the cup. 26 seconds, vertical.",
      },
      facts: [
        ["Place", "22 Leinster Terrace, London W2"],
        ["Type", "Social campaign"],
        ["Scope", "3D animation, posters, postcards"],
        ["Year", "2026"],
      ],
      chapters: [
        {
          id: "idea",
          title: "A café that trades in ideas",
          text: [
            "Foreign Exchange borrows its name and its rate board from the bureau de change, then swaps the currency. What changes hands here is work in progress: sketches, drafts and half-finished ideas, passed across a table with a coffee.",
            "The campaign works with young artists, who each bring their own take on the café, and shares that work across its social channels. The more people draw it, film it and photograph it, the more it reads as a place that belongs to them.",
            "The promise underneath is plain: a café where artists feel free to create. Nobody asks you to move on, and nobody minds a sketchbook taking up the table.",
          ],
        },
        {
          id: "film",
          title: "From sketch to final film",
          text: [
            "The first pass was a rough block-out: a low-poly street, a camera move down to the terrace and people arriving. It was only there to test the timing and the story.",
            "The final film keeps the idea and rebuilds everything else. The café assembles itself as a model, the palette settles into cream, terracotta and bottle green, and the last shot hands you the cup.",
          ],
          blocks: [
            {
              row: "1 / 1",
              items: [
                { file: "sketch-film-a.webp", title: "Sketchbook", caption: "The building, drawn in isometric view." },
                { file: "sketch-film-b.webp", title: "Sketchbook", caption: "The storyboard, in four frames." },
                { text: { head: "How the film started", body: "One drawing of the building and a four-frame storyboard. Bare ground, then the building rising brick by brick. The finished front, a close-up of two people with coffee, and an ending where the barista steps out as the rain starts." } },
              ],
            },
            { video: "fx-prototype.mp4", poster: "fx-prototype-poster.webp", title: "Prototype", caption: "Block-out pass. Square format, 40 seconds.", ratio: "1 / 1", loop: true },
          ],
        },
        {
          id: "print",
          title: "Posters and postcards",
          text: "The stills take the same miniature into print. One poster shows the whole building, the other pulls in close and sits you at a table on the terrace. The postcards carry that close-up on the front and leave the back clear for a note or a sketch.",
          blocks: [
            {
              row: "4 / 5",
              items: [
                { file: "poster-building.webp", title: "Campaign poster", caption: "The whole building as a miniature." },
                { file: "poster-terrace.webp", title: "Terrace poster", caption: "The rate board, the awning and the people outside." },
                { text: { head: "The campaign line", quote: "Rates daily. Roasts weekly.", body: "A bureau de change promise, rewritten for a coffee bar." } },
              ],
            },
            { single: "postcards.webp", title: "Postcards", caption: "Front and back. The name, the number and room to write." },
          ],
        },
      ],
    },
  },
  {
    id: "miro-drink",
    category: "branding",
    dir: "Branding/Miro Drink",
    title: "MIRO Drink",
    medium: "Branding",
    rev: 5,
    desc: "Brand identity, packaging and campaign for a sparkling ginger lemon drink. A grinning face mark, a hand-drawn alphabet and a painted landscape of stepped temples carry one voice from the can to the poster to the screen.",
    cover: "cover.webp",
    brief: {
      tagline: "A whole world in every can.",
      facts: [
        ["Brand", "MIRO Drink"],
        ["Flavour", "Ginger Lemon"],
        ["Scope", "Identity, packaging, campaign, motion"],
        ["Year", "2026"],
      ],
      pdf: { file: "MIRO-brand-book.pdf", pages: 16, label: "MIRO Drink brand book" },
      chapters: [
        {
          id: "directions",
          title: "Four routes to a face",
          text: "Before the final mark, four directions tested different balances of face, symbol and lettering. Each one had something worth keeping and one clear weakness.",
          blocks: [
            {
              row: "1 / 1",
              items: [
                { file: "dir-1.webp", title: "Split wordmark", caption: "The cut through the letters breaks them down as the mark shrinks, and parting face from name loses the smile." },
                { file: "dir-2.webp", title: "Ray-crowned face", caption: "Rays, face and name stack three levels high, and the smile stops being the centre." },
                { file: "dir-3.webp", title: "Geometric mask", caption: "Strict symmetry and tight lettering feel formal, and the fine detail blurs at small sizes." },
              ],
            },
            {
              row: "1 / 1",
              items: [
                { file: "dir-4.webp", title: "Eye-led signature", caption: "Keeps the eye but drops the grin, and the wide lettering drifts away from the block wordmark." },
                { text: { head: "Why the face won", body: "It lets the name sit inside the grin. The block wordmark was kept alongside it as a simpler signature for tight spaces." } },
                { file: "logo-face.webp", title: "The chosen face", caption: "Primary logomark. MIRO DRINK is lettered into the teeth." },
              ],
            },
          ],
        },
        {
          id: "logo",
          title: "Two signatures",
          text: "The final system holds just two marks: the full smiling face for the can and big moments, and the MIRO wordmark with its coral burst for small spaces. Earlier experiments stay as development work, not extra logos.",
          blocks: [
            {
              row: "1 / 1",
              items: [
                { file: "logo-wordmark.webp", title: "The wordmark", caption: "Compact signature, with a coral burst over the O." },
                { file: "logo-variations.webp", title: "Colour and one-colour versions", caption: "Full colour and single ink, on ivory and on deep teal." },
                { file: "logo-backgrounds.webp", title: "Approved grounds", caption: "Ivory, deep teal, yellow, turquoise, coral and the peach photo backdrop." },
              ],
            },
            {
              row: "1 / 1",
              items: [
                { file: "sketch-logo-a.webp", title: "Sketchbook", caption: "The brief, the name and the first faces." },
                { file: "sketch-logo-b.webp", title: "Sketchbook", caption: "The face, the eye and the lettering, tried several ways." },
                { text: { head: "How the logo started", body: "The name came first: Miro as mirror and reflection, and as world and connections. These pages set the brief, an energy drink for 18 to 35 year olds with BrewDog as the reference, then keep returning to one idea. A face is the central object, the eye sits at its centre, and the lettering has to be bold and clear." } },
              ],
            },
          ],
        },
        {
          id: "colour",
          title: "Five colours and a backdrop",
          text: "Deep teal, ivory and yellow give the structure. Turquoise paints the sky and the lower can, and coral adds small hot accents. Peach is kept for photo settings only.",
          blocks: [
            {
              swatches: [
                { name: "Deep teal", hex: "#102E33", rgb: "16 / 46 / 51", role: "Logo, type and outlines" },
                { name: "Ivory", hex: "#F5EED9", rgb: "245 / 238 / 217", role: "The main light field and breathing room" },
                { name: "Yellow", hex: "#EBB554", rgb: "235 / 181 / 84", role: "Flavour plaque and the landscape ground" },
                { name: "Turquoise", hex: "#50BCB8", rgb: "80 / 188 / 184", role: "Sky and the lower can panel" },
                { name: "Coral", hex: "#F3704F", rgb: "243 / 112 / 79", role: "Sun, rays, berries and stepped edges, used sparingly" },
                { name: "Peach", hex: "#FFD99B", rgb: "255 / 217 / 155", role: "Photo and mockup backdrops only" },
              ],
            },
            { note: { head: "A note on print", body: "These are digital values. Print colours depend on the production profile and need a proof." } },
          ],
        },
        {
          id: "type",
          title: "A drawn alphabet and two workhorses",
          text: "A custom uppercase alphabet carries short, loud statements and flavour names, kept with its natural irregularity. Barlow Condensed Bold handles headings and labels, and Manrope handles everything that has to be read.",
          blocks: [
            {
              row: "3 / 2",
              items: [
                { file: "type-display.webp", title: "MIRO display lettering", caption: "Drawn uppercase, used for short headlines and flavour names." },
                { file: "type-support.webp", title: "Barlow Condensed and Manrope", caption: "Headings and labels, then body copy and product details." },
                { text: { head: "Three typefaces, three jobs", body: "The drawn alphabet speaks, Barlow Condensed Bold labels, and Manrope explains." } },
              ],
            },
          ],
        },
        {
          id: "packaging",
          title: "The can",
          text: "The front sets the face on ivory, then a torn horizon drops into a turquoise sky, a yellow flavour plaque and a row of stepped temples. It is built for two formats, a 250 mL slim and a 355 mL standard.",
          blocks: [
            { single: "hero-can.webp", title: "Ginger Lemon, slim can", caption: "Front artwork on the 250 mL format." },
            {
              row: "5 / 6",
              items: [
                { file: "can-cutout.webp", title: "Ginger Lemon, cut out", caption: "The slim can on a transparent background." },
                { file: "flat-front.webp", title: "Flat artwork, front", caption: "The face, the flavour plaque and the landscape." },
                { file: "flat-back.webp", title: "Flat artwork, back", caption: "Wordmark, benefits and the nutrition panel." },
              ],
            },
            {
              row: "4 / 3",
              fit: "cover",
              items: [
                { file: "mockup-two-cans.webp", title: "Front and back", caption: "Two cans, with the nutrition and benefits panel on the back." },
                { file: "pack-hand.webp", title: "In hand", caption: "Condensation and close-up label detail." },
                { file: "pack-flat-art.webp", title: "Can and flat", caption: "The label system shown together." },
              ],
            },
            {
              specs: {
                head: "Production grid",
                cols: ["Format", "Diameter", "Trim", "With 3 mm bleed"],
                rows: [
                  ["250 mL slim", "53 mm", "172 × 105 mm", "178 × 111 mm"],
                  ["355 mL standard", "66 mm", "214 × 100 mm", "220 × 106 mm"],
                ],
              },
            },
            {
              row: "1 / 1",
              items: [
                { file: "sketch-pack-a.webp", title: "Sketchbook", caption: "The first can, with the face on the front." },
                { file: "sketch-pack-b.webp", title: "Sketchbook", caption: "Working out the lettering." },
                { text: { head: "How the can and the type started", body: "Can or bottle was still an open question here, and the flavour was pencilled in as strawberry watermelon. A note beside the can says the big face is good but may be too much. The facing page settles the lettering: blocky and stepped like the pyramids, punctuation as plain blocks, and soft angles added so the bold shapes do not turn harsh." } },
              ],
            },
          ],
        },
        {
          id: "campaign",
          title: "Out in the world",
          text: "One campaign, four poster formats, each aimed at a setting: a square feed post, a tall street display, a wide tube banner and a flavour-led social post. The lines stay short and warm, like \"Level up naturally\" and \"Next stop, your bright side\".",
          blocks: [
            {
              row: "5 / 6",
              fit: "cover",
              items: [
                { file: "poster-outdoor.webp", title: "Street display", caption: "A tall composition for the can and the name." },
                { file: "poster-zing.webp", title: "A little zing", caption: "Flavour-led campaign post." },
                { file: "social-post.webp", title: "Feed post", caption: "Rooted in good taste, at 1080 × 1350 for the feed." },
              ],
            },
            { single: "poster-tube.webp", title: "Tube banner", caption: "The wide format carries a short message across a journey." },
            {
              row: "3 / 2",
              fit: "cover",
              items: [
                { file: "context-tube.webp", title: "London Underground", caption: "The banner in a platform setting." },
                { file: "context-street.webp", title: "Outdoor", caption: "The street display in context." },
                { text: { head: "Social and stationery", body: "The profile uses the wordmark as its avatar, with a flavour-led bio and a feed that mixes people, flavour, cut-out campaign graphics and behind-the-scenes. Proposed rhythm: three feed posts, two reels and regular stories each week." } },
              ],
            },
            {
              row: "1 / 1",
              items: [
                { file: "poster-square.webp", title: "Social square", caption: "Bold graphic posts for the feed." },
                { file: "social-profile.webp", title: "Instagram profile", caption: "Avatar, bio, highlights and a mixed grid." },
                { file: "stationery.webp", title: "Business cards", caption: "95 × 55 mm. The face on the front, an ivory wordmark on deep teal on the back." },
              ],
            },
          ],
        },
        {
          id: "motion",
          title: "Into three dimensions",
          text: "The can, its painted world and the flavour cues move into 3D scenes, with condensation, warm light and geometric scenery taken straight from the pack. Two vertical pieces from the set.",
          blocks: [
            {
              row: "9 / 16",
              items: [
                { video: "miro-motion-1.mp4", poster: "miro-motion-1-poster.webp", title: "Citrus reveal", caption: "A close-up of the label pulls out to a lemon slice, a stepped pedestal and the campaign line." },
                { video: "miro-motion-2.mp4", poster: "miro-motion-2-poster.webp", title: "The pack unfolds", caption: "The stepped temples fold out of the label around the can, under a coral sun." },
                { text: { head: "The closing line", quote: "A whole world in every can.", body: "Both films end on the same words." } },
              ],
            },
            {
              row: "1 / 1",
              items: [
                { file: "sketch-poster-a.webp", title: "Sketchbook", caption: "Four poster layouts, each with a note." },
                { file: "sketch-poster-b.webp", title: "Sketchbook", caption: "The landscape and the icon pack." },
                { text: { head: "How the posters and the world started", body: "Four layouts, planned for outdoor and social at once: a can in a landscape with a bird on top, a close-up among leaves, a more painterly one with the drink at the top of a pyramid, and a wide banner for the Tube. \"Refresh yourself\" was only a placeholder line. The facing page draws the world the films move through: the pyramids, clouds, sun and plants, and the small icons for the product information." } },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "everlost",
    category: "branding",
    dir: "Branding/Everlost",
    title: "Everlost — Custom Nike Project",
    medium: "Branding",
    desc: "A custom Air Jordan 1 line and full brand system. The idea was simple and a little uncomfortable: take Nike's own visual language and run it through Soviet propaganda. Wordmark, packaging, site, social, all in the same red and yellow, hammer-and-sneaker identity.",
    site: { url: "https://everlost.online", label: "everlost.online" },
    cover: "Everlost — Custom Nike Project.jpg",
    brief: {
      tagline: "We believe art can be worn like shoes.",
      facts: [
        ["Brand", "Everlost"],
        ["Product", "Custom Air Jordan 1"],
        ["Pairs", "Deserter (001), Communike (002)"],
        ["Scope", "Identity, packaging, site, social, film"],
      ],
      chapters: [
        {
          id: "dare",
          title: "It started as a dare",
          text: "Communike began with a question. What if a sneaker brand looked like it came out of a Soviet print shop instead of a streetwear studio. The identity has to hold both of those at once.",
          blocks: [
            {
              row: "1 / 1",
              items: [
                { file: "LOGO WHITE DESIGN.jpg", title: "The mark", caption: "A striped E inside a ring, in one flat blue." },
                { file: "POSTER EVERLOST 1.jpg", title: "Communike poster", caption: "The statement, the pair and where to find it." },
                { text: { head: "From the poster", quote: "We believe art can be worn like shoes.", body: "It is why each pair is numbered as an artifact and not released as a drop." } },
              ],
            },
          ],
        },
        {
          id: "testing",
          title: "Testing it on the shoe",
          text: "Some of the early exploration used AI-generated renders before the real photography happened, mostly to test the palette and the iconography directly on the shoe.",
          blocks: [
            {
              row: "1 / 1",
              fit: "cover",
              items: [
                { file: "ChatGPT Image May 21, 2026, 12_17_48 AM.png", title: "Side" },
                { file: "ChatGPT Image May 21, 2026, 12_21_28 AM.png", title: "Front" },
                { file: "ChatGPT Image May 21, 2026, 12_21_32 AM.png", title: "Top" },
              ],
            },
            {
              row: "1 / 1",
              fit: "cover",
              items: [
                { file: "ChatGPT Image May 21, 2026, 12_22_45 AM.png", title: "Heel" },
                { file: "ChatGPT Image May 21, 2026, 12_24_49 AM.png", title: "Stitched swoosh" },
                { file: "ChatGPT Image May 21, 2026, 12_27_51 AM.png", title: "Maker's plate" },
              ],
            },
            {
              row: "4 / 5",
              items: [
                { file: "DGHJ.jpg", title: "Blueprint", caption: "The shoe drawn as parts that come apart and swap." },
                { file: "2.jpg", title: "Rebuild it your own way", caption: "The same idea as a poster." },
                { text: { head: "Built to be rebuilt", body: "Upper, midsole, outsole and details are drawn as separate pieces, so a pair can be taken apart and put back together differently." } },
              ],
            },
          ],
        },
        {
          id: "pairs",
          title: "Two artifacts",
          text: "Two pairs so far. Deserter, artifact 001, is printed camouflage with a swoosh cut from hatching. Communike, artifact 002, puts a hammer-and-sickle swoosh on red and yellow leather.",
          blocks: [
            {
              row: "1 / 1",
              fit: "cover",
              items: [
                { file: "EVERLOST POST 1.jpg", title: "Deserter", caption: "Artifact 001." },
                { file: "IMAGE 1.jpg", title: "Deserter, close", caption: "Printed camouflage and laces." },
                { file: "IMAGE 3.jpg", title: "Deserter, the swoosh", caption: "Hatched leather against the camouflage." },
              ],
            },
            {
              row: "1 / 1",
              fit: "cover",
              items: [
                { file: "COMMUNIKE CARD.jpg", title: "Communike", caption: "Artifact 002." },
                { file: "COMMUNIKE DESIGN.jpg", title: "Communike, close", caption: "The swoosh, stitched in yellow." },
                { file: "POST COMMUNIKE.jpg", title: "Communike, boxed", caption: "The pair with its clear case." },
              ],
            },
          ],
        },
        {
          id: "out",
          title: "Site and social",
          text: "Wordmark, packaging, social. Same mark, same red and yellow, every time, until it stops looking like decoration and starts looking like it was always there.",
          blocks: [
            { single: "website browser mockup.jpg", title: "everlost.online", caption: "Design as protest. The home page." },
            {
              row: "3 / 2",
              fit: "cover",
              items: [
                { file: "website browser mockup 1.jpg", title: "A love letter to the Swoosh", caption: "The about page." },
                { file: "website browser mockup 2.jpg", title: "Tanjin Cross", caption: "A product page in the dark theme." },
                { file: "Instagram Post Story Mockup.jpg", title: "The feed", caption: "Posts and stories together." },
              ],
            },
            {
              row: "4 / 5",
              items: [
                { file: "COMMUNIKE POST.jpg", title: "Communike post" },
                { file: "POST 4.jpg", title: "Deserter post" },
                { file: "DESETER SALE FINAL.jpg", title: "Deserter sale story" },
              ],
            },
          ],
        },
        {
          id: "film",
          title: "The film",
          text: "A separate collaboration handled the ad shoot for the shoe, filming it the way you'd film a real Nike release rather than a personal project.",
          blocks: [
            { video: "final export 4k.mp4", title: "Ad film", caption: "35 seconds.", ratio: "4096 / 1716" },
          ],
        },
      ],
    },
  },
  {
    id: "kuro",
    category: "branding",
    dir: "Branding/Kuro Portable Blender",
    title: "Kuro — Portable Blender",
    medium: "Branding",
    desc: "Brand identity and packaging for a 450ml travel blender. Wordmark, product renders, and the diagrams that show how it's built and how it ships.",
    cover: "Kuro — Portable Blender.jpg",
    brief: {
      tagline: "Blend. Drink. Go.",
      facts: [
        ["Brand", "Kuro"],
        ["Product", "450 ml portable blender"],
        ["Scope", "Identity, packaging, product renders"],
      ],
      chapters: [
        {
          id: "mark",
          title: "One mark, one bottle",
          text: "A travel blender only works if you stop noticing it's there. The identity follows the same idea: one mark, one bottle shape, nothing extra hanging off it.",
          blocks: [
            { single: "kuro-overview.png", title: "Brand sheet", caption: "The product, its parts, colourways and specs on one page." },
          ],
        },
        {
          id: "build",
          title: "How it comes apart, how it ships",
          text: [
            "The bottle splits into a cup and a blade base with the lid on top. The renders show it open, so the build is clear before anyone buys it.",
            "The box is one die-cut sleeve. The wordmark runs up the side, with the instructions and the specs on the panels around it.",
          ],
          blocks: [
            {
              row: "1 / 1",
              items: [
                { file: "kuro-parts.jpg", title: "Parts", caption: "Cup, blade base and lid." },
                { file: "kuro-packaging.jpg", title: "Packaging dieline", caption: "The flat layout, before folding." },
                { text: { head: "On the box", body: "A spec list and a few drawn steps sit on the side panels, so the outside of the box answers the first questions." } },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "mancraft",
    category: "branding",
    dir: "Branding/Mancraft",
    title: "Mancraft",
    medium: "Branding",
    desc: "A listing card system and product branding for a welding machine, built for a Russian online marketplace. Compact, cooling, and pro versions, each with its own spec card.",
    cover: "Mancraft.jpg",
    brief: {
      tagline: "One card format, every spec in its place.",
      facts: [
        ["Brand", "Mancraft"],
        ["Product", "MIG / MAG / TIG welding machine"],
        ["Market", "Russian online marketplace"],
        ["Scope", "Listing cards, product branding"],
      ],
      chapters: [
        {
          id: "lead",
          title: "The lead card",
          text: "The first card has to do the selling at thumbnail size. Name, weld types, voltage and current all sit around the machine, big enough to read in a search result.",
          blocks: [
            {
              row: "1 / 1",
              items: [
                { file: "Mancraft.jpg", title: "Lead card", caption: "The one a buyer sees first." },
                { span: 2, text: { head: "What it has to carry", body: "Brand and warranty along the top, the product name in the biggest type, then the three numbers a buyer looks for first: working voltage, full power and maximum current." } },
              ],
            },
          ],
        },
        {
          id: "system",
          title: "One format, card after card",
          text: "Every card after that takes a single point: size, cooling, the kit, the weight. Headline, figure and logo sit in the same place each time, so a buyer is comparing the products and not fighting the layout.",
          blocks: [
            {
              row: "1 / 1",
              items: [
                { file: "mancraft-compact.jpg", title: "Size", caption: "Light and compact, with dimensions." },
                { file: "mancraft-cooling.jpg", title: "Cooling", caption: "The fan and the thermal sensor." },
                { file: "mancraft-pro.jpg", title: "The kit", caption: "Professional equipment, shown with gloves and mask." },
              ],
            },
            {
              row: "1 / 1",
              items: [
                { file: "mancraft-weight.jpg", title: "Weight and current", caption: "5.3 kg, 220 A." },
                { span: 2, text: { head: "The same grid every time", body: "Headline top left, the machine bottom right, and one orange panel for the number that matters on that card." } },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "mary-jane-festival",
    category: "branding",
    dir: "Branding/Mary Jane Festival",
    title: "Mary Jane Festival",
    medium: "Branding",
    desc: "Festival branding for a cannabis culture event. Two mascots, a leaf and a bong, both grinning, carrying one loose hand-drawn identity across posters and merch.",
    cover: "posyer mj 2.jpg",
    brief: {
      tagline: "Two mascots, one loose line.",
      facts: [
        ["Event", "Mary Jane Festival"],
        ["Type", "Festival branding"],
        ["Scope", "Mascots, poster, bags, packaging"],
      ],
      chapters: [
        {
          id: "mascots",
          title: "The mascots",
          text: "Two mascots carry the whole thing, drawn loose enough that they still hold up after a bad photocopy or a cheap print run.",
          blocks: [
            {
              row: "4 / 5",
              items: [
                { file: "posyer mj 2.jpg", title: "The leaf", caption: "Festival poster." },
                { file: "Artboard 1.jpg", title: "The bong", caption: "Badge lockup with the festival name." },
                { text: { head: "Leaf and bong", body: "One mascot is a leaf, the other a bong. Both grin, and both are built from the same thick outline." } },
              ],
            },
          ],
        },
        {
          id: "merch",
          title: "On bags and boxes",
          text: [
            "The bags come first, because they are what people carry around the site. A paper tote takes the poster artwork whole, and a drawstring bag gets its own lettering.",
            "Then the things that leave with you: a flower box and a takeaway carrier, both in kraft, with the mascots printed straight onto the card.",
          ],
          blocks: [
            {
              row: "1 / 1",
              items: [
                { file: "BAG MOCK UP.png", title: "Paper tote" },
                { file: "BAG 12.png", title: "Drawstring bag" },
                { file: "Box_110x60x30.png", title: "Flower box" },
              ],
            },
            {
              row: "1 / 1",
              items: [
                { file: "3.jpg", title: "Carrier and bag" },
                { span: 2, text: { head: "Two palettes", body: "Teal and green for the leaf, yellow and black for the bong. Kraft card sits under both." } },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "publication-design",
    category: "designs",
    dir: "Designs/Publication Design",
    title: "Publication Design",
    medium: "Designs",
    desc: "A paperback cover for Under the Wave, a short story by Lauren Groff. Front, spine and back are built as one sheet of torn paper: a pale sky, a red ground, and two figures standing on the line between them.",
    cover: "cover.webp",
    brief: {
      tagline: "A cover made of torn paper.",
      facts: [
        ["Title", "Under the Wave"],
        ["Author", "Lauren Groff"],
        ["Format", "Paperback: front, spine, back"],
        ["Type", "Publication design"],
      ],
      chapters: [
        {
          id: "cover",
          title: "Front and back",
          text: [
            "A white horizon splits the front in two. Above it is a pale teal sky with two birds on a wire. Below it is a red ground. A woman and a child stand on the line, and their shadows run down into the red.",
            "The back keeps the same two halves and gives the calm upper one to the text.",
          ],
          blocks: [
            {
              row: "1226 / 2000",
              items: [
                { file: "cover-front.webp", title: "Front cover" },
                { file: "cover-back.webp", title: "Back cover" },
                { text: { head: "Torn, not cut", body: "Every edge on the cover is a tear. Strips of turquoise rip across the title, so the words \"Under the Wave\" sit partly under one." } },
              ],
            },
          ],
        },
        {
          id: "jacket",
          title: "The whole jacket",
          text: "Front, spine and back are one continuous sheet. The red ground and the torn sky carry straight across the spine, which holds the author, the title and the series line.",
          blocks: [
            { single: "jacket-spread.webp", title: "Full jacket", caption: "Back, spine and front, flat." },
            { single: "mockup.webp", title: "Mockup", caption: "Back and front as a printed book." },
          ],
        },
      ],
    },
  },
  {
    id: "childhood",
    category: "designs",
    dir: "Designs/Childhood",
    title: "Childhood",
    medium: "Designs",
    desc: "A collage and short film series about growing up. Bank statements, graffiti, carousel horses, spliced into one uneasy image. Personal stuff, treated like evidence.",
    cover: "Khrushchyovka.jpg",
    brief: {
      tagline: "Personal stuff, treated like evidence.",
      facts: [
        ["Type", "Collage and short film series"],
        ["Formats", "Posters, zine pages, film"],
        ["Label", "Vivalamentality"],
      ],
      chapters: [
        {
          id: "places",
          title: "Where it starts",
          text: "Bank statements, tower blocks, and the numbered zine pages that hold the whole project together. None of it was planned as one clean series, it collected over time.",
          blocks: [
            {
              row: "4 / 5",
              items: [
                { file: "Khrushchyovka.jpg", title: "Khrushchyovka" },
                { file: "INSTA EDITED.jpg", title: "Welcome to you" },
                { file: "werst.jpg", title: "Statement" },
              ],
            },
          ],
        },
        {
          id: "pages",
          title: "The numbered pages",
          text: "The pages mix English and Russian, prayer text and game menus, scaffolding and stairwells. Each one is a single memory pinned to a sheet.",
          blocks: [
            {
              row: "5 / 7",
              fit: "cover",
              items: [
                { file: "44.jpg", title: "No. 44" },
                { file: "47.jpg", title: "No. 47" },
                { file: "50.jpg", title: "No. 50" },
              ],
            },
            {
              row: "3 / 4",
              fit: "cover",
              items: [
                { file: "27.jpg", title: "No. 27" },
                { span: 2, text: { head: "Numbered like a zine", body: "Every page carries its own number, so the series can keep growing without needing a fixed order." } },
              ],
            },
          ],
        },
        {
          id: "film",
          title: "The film",
          text: "One page set in motion. A television rises through a sheet of text about screens and control.",
          blocks: [
            { video: "21.mp4", title: "Short film", caption: "6 seconds." },
          ],
        },
      ],
    },
  },
  {
    id: "war-on-culture",
    category: "designs",
    dir: "Designs/War On Culture",
    title: "War On Culture",
    medium: "Designs",
    desc: "A black and white protest poster series: Elegy, Under the Siege, When War Ends, We Are All Victims. Grunge type, torn paper, pencil crowds, turned into short blunt statements about war and memory. A short film runs alongside the prints.",
    cover: "Elegy.jpg",
    brief: {
      tagline: "Short, blunt statements about war and memory.",
      facts: [
        ["Type", "Protest poster series"],
        ["Formats", "Posters, short film"],
        ["Label", "Vivalamentality"],
      ],
      chapters: [
        {
          id: "scenes",
          title: "Two registers",
          text: "This one runs in two registers. Illustrated scenes built out of torn paper and pencil crowds, and plain typographic statements that don't try to illustrate anything, they just say it.",
          blocks: [
            {
              row: "3 / 4",
              items: [
                { file: "Elegy.jpg", title: "Elegy" },
                { file: "Under the Siege.jpg", title: "Under the Siege" },
                { file: "When War Ends.jpg", title: "When War Ends" },
              ],
            },
          ],
        },
        {
          id: "lines",
          title: "One line, the whole page",
          text: "Elegy, Warning, Under the Siege. Each poster picks one blunt line and gives it the whole page, nothing else competing for space.",
          blocks: [
            {
              row: "3 / 4",
              fit: "cover",
              items: [
                { file: "WE ARE ALL VICTIMS.jpg", title: "We Are All Victims" },
                { file: "Warning.jpg", title: "Warning" },
                { file: "PSDDPLPD (2).jpg", title: "War" },
              ],
            },
            {
              row: "3 / 2",
              items: [
                { file: "Untitled-4.jpg", title: "The true cost of war" },
                { file: "asas.jpg", title: "In the shadow of war" },
                { file: "What needs to be repair.jpg", title: "What needs to be repaired" },
              ],
            },
          ],
        },
        {
          id: "film",
          title: "The film",
          text: "Poster #31 is the one that moves. It runs alongside the prints as a short film.",
          blocks: [
            {
              row: "1080 / 1360",
              items: [
                { video: "31.mp4", title: "Short film", caption: "20 seconds." },
                { span: 2, text: { head: "Poster #31", body: "A soldier in silhouette behind a halftone screen, with single words flashing through underneath." } },
              ],
            },
          ],
        },
      ],
    },
  },
];

/** True for a filename that should render as <video> instead of <img>. */
export function isVideo(file) {
  return /\.mp4$/i.test(file);
}

/** Builds the URL that opens a project's own detail view (works.html reads
 *  ?p= — see js/works-page.js). */
export function projectUrl(project) {
  return `works.html?p=${encodeURIComponent(project.id)}`;
}

/** Builds the URL that opens a category's project grid. */
export function categoryUrl(categoryId) {
  return `works.html?cat=${encodeURIComponent(categoryId)}`;
}

/** Builds the actual asset path for one of a project's files. Each path
 *  segment is encoded separately — encoding the "/" inside project.dir
 *  would turn it into a literal, broken "UX%20UI%2FUbit...". */
export function mediaSrc(project, file) {
  const path = `assets/portfolio/${project.dir}/${file}`.split("/").map(encodeURIComponent).join("/");
  // `rev` is bumped whenever a project's files are replaced under the same
  // name, so browsers don't keep showing the old cached image.
  return project.rev ? `${path}?r=${project.rev}` : path;
}

/** A project's cover/thumbnail, used everywhere except its own page. */
export function coverSrc(project) {
  return mediaSrc(project, project.cover);
}

export function findProjectById(id) {
  return PROJECTS.find((p) => p.id === id) || null;
}

export function findCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}

export function projectsInCategory(categoryId) {
  return PROJECTS.filter((p) => p.category === categoryId);
}
