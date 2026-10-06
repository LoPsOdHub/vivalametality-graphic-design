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
   structured process (MIRO Drink) — a tagline, a few facts, a list of
   chapters (text + typed media), an optional PDF, and an optional `film`
   (a looping video pinned beside the page — Foreign Exchange). See js/brief.js for
   the chapter/media shapes it understands.

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
    layout: [
      { type: "hero", file: "Perspective App Screen Mockup.jpg" },
      { type: "text", body: "People need to trust the numbers before they trust the platform. Every screen here is built around showing the return clearly, before it asks for anything." },
      { type: "pair", files: ["Free_Iphone_14_Pro_Mockup_4.jpg", "Macbook_Air_Mockup_1.jpg"] },
      { type: "text", body: "Onboarding, top-ups, payouts. Same visual system on mobile and desktop, so nothing feels different once you switch devices." },
      { type: "hero", file: "Untitled-1.jpg" },
      { type: "hero", file: "Untitled-2.jpg" },
      { type: "pair", files: ["ChatGPT Image Jun 13, 2026, 07_18_14 PM.png", "dbeda208-b227-4f9d-a591-687669f33d98.png"] },
      { type: "hero", file: "Vertical-Rigid-Plastic-Rounded-Identity-Gravity-Cards-Free-psd-Mockup.jpg" },
    ],
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
          media: { type: "figure", file: "poster-building.webp", title: "Campaign poster", caption: "The whole building as a miniature, under the campaign line." },
        },
        {
          id: "film",
          title: "From prototype to final film",
          text: [
            "The first pass was a rough block-out: a low-poly street, a camera move down to the terrace and people arriving. It was only there to test the timing and the story.",
            "The final film keeps the idea and rebuilds everything else. The café assembles itself as a model, the palette settles into cream, terracotta and bottle green, and the last shot hands you the cup.",
          ],
          media: {
            type: "videos",
            wide: true,
            items: [
              { file: "fx-prototype.mp4", poster: "fx-prototype-poster.webp", title: "Prototype", caption: "Block-out pass. Square format, 40 seconds.", ratio: "1 / 1", loop: true },
            ],
          },
        },
        {
          id: "print",
          title: "Posters and postcards",
          text: "The stills take the same miniature into print. One poster shows the whole building, the other pulls in close and sits you at a table on the terrace. The postcards carry that close-up on the front and leave the back clear for a note or a sketch.",
          media: { type: "figure", file: "poster-terrace.webp", title: "Terrace poster", caption: "A closer crop: the rate board, the awning and the people outside." },
          more: [
            { type: "figure", file: "postcards.webp", title: "Postcards", caption: "Front and back. The name, the number and room to write.", wide: true },
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
          media: {
            type: "tiles",
            cols: 4,
            items: [
              { file: "dir-1.webp", title: "Split wordmark", caption: "The cut through the letters breaks them down as the mark shrinks, and parting face from name loses the smile." },
              { file: "dir-2.webp", title: "Ray-crowned face", caption: "Rays, face and name stack three levels high, and the smile stops being the centre." },
              { file: "dir-3.webp", title: "Geometric mask", caption: "Strict symmetry and tight lettering feel formal, and the fine detail blurs at small sizes." },
              { file: "dir-4.webp", title: "Eye-led signature", caption: "Keeps the eye but drops the grin, and the wide lettering drifts away from the block wordmark." },
            ],
          },
          note: { head: "Why the face won", body: "It lets the name sit inside the grin. The block wordmark was kept alongside it as a simpler signature for tight spaces." },
        },
        {
          id: "logo",
          title: "Two signatures",
          text: "The final system holds just two marks: the full smiling face for the can and big moments, and the MIRO wordmark with its coral burst for small spaces. Earlier experiments stay as development work, not extra logos.",
          media: {
            type: "figures",
            cols: 2,
            items: [
              { file: "logo-face.webp", title: "The face", caption: "Primary logomark. MIRO DRINK is lettered into the teeth." },
              { file: "logo-wordmark.webp", title: "The wordmark", caption: "Compact signature, with a coral burst over the O." },
            ],
          },
          more: [
            { type: "figure", file: "logo-variations.webp", title: "Colour and one-colour versions", caption: "Full colour and single ink, on ivory and on deep teal." },
            { type: "figure", file: "logo-backgrounds.webp", title: "Approved grounds", caption: "Ivory, deep teal, yellow, turquoise, coral and the peach photo backdrop." },
          ],
        },
        {
          id: "colour",
          title: "Five colours and a backdrop",
          text: "Deep teal, ivory and yellow give the structure. Turquoise paints the sky and the lower can, and coral adds small hot accents. Peach is kept for photo settings only.",
          media: {
            type: "swatches",
            items: [
              { name: "Deep teal", hex: "#102E33", rgb: "16 / 46 / 51", role: "Logo, type and outlines" },
              { name: "Ivory", hex: "#F5EED9", rgb: "245 / 238 / 217", role: "The main light field and breathing room" },
              { name: "Yellow", hex: "#EBB554", rgb: "235 / 181 / 84", role: "Flavour plaque and the landscape ground" },
              { name: "Turquoise", hex: "#50BCB8", rgb: "80 / 188 / 184", role: "Sky and the lower can panel" },
              { name: "Coral", hex: "#F3704F", rgb: "243 / 112 / 79", role: "Sun, rays, berries and stepped edges, used sparingly" },
              { name: "Peach", hex: "#FFD99B", rgb: "255 / 217 / 155", role: "Photo and mockup backdrops only" },
            ],
          },
          note: { head: "A note on print", body: "These are digital values. Print colours depend on the production profile and need a proof." },
        },
        {
          id: "type",
          title: "A drawn alphabet and two workhorses",
          text: "A custom uppercase alphabet carries short, loud statements and flavour names, kept with its natural irregularity. Barlow Condensed Bold handles headings and labels, and Manrope handles everything that has to be read.",
          media: {
            type: "figures",
            cols: 2,
            wide: [0.9, 1.1],
            items: [
              { file: "type-display.webp", title: "MIRO display lettering", caption: "Drawn uppercase, used for short headlines and flavour names." },
              { file: "type-support.webp", title: "Barlow Condensed and Manrope", caption: "Headings and labels, then body copy and product details." },
            ],
          },
        },
        {
          id: "packaging",
          title: "The can",
          text: "The front sets the face on ivory, then a torn horizon drops into a turquoise sky, a yellow flavour plaque and a row of stepped temples. It is built for two formats, a 250 mL slim and a 355 mL standard.",
          media: { type: "figure", file: "hero-can.webp", title: "Ginger Lemon, slim can", caption: "Front artwork on the 250 mL format.", wide: true },
          more: [
            { type: "figure", file: "mockup-two-cans.webp", title: "Front and back", caption: "355 mL cans, with the nutrition and benefits panel on the back." },
            { type: "figure", file: "packaging-flats.webp", title: "Flat artwork", caption: "Front and back panels for both can formats.", wide: true },
            {
              type: "figures",
              cols: 2,
              items: [
                { file: "pack-hand.webp", title: "In hand", caption: "Condensation and close-up label detail." },
                { file: "pack-flat-art.webp", title: "Can and flat", caption: "The label system shown together." },
              ],
            },
            {
              type: "specs",
              head: "Production grid",
              cols: ["Format", "Diameter", "Trim", "With 3 mm bleed"],
              rows: [
                ["250 mL slim", "53 mm", "172 × 105 mm", "178 × 111 mm"],
                ["355 mL standard", "66 mm", "214 × 100 mm", "220 × 106 mm"],
              ],
            },
          ],
        },
        {
          id: "campaign",
          title: "Out in the world",
          text: "One campaign, four poster formats, each aimed at a setting: a square feed post, a tall street display, a wide tube banner and a flavour-led social post. The lines stay short and warm, like \"Level up naturally\" and \"Next stop, your bright side\".",
          media: {
            type: "tiles",
            cols: 3,
            items: [
              { file: "poster-square.webp", title: "Social square", caption: "Bold graphic posts for the feed." },
              { file: "poster-outdoor.webp", title: "Street display", caption: "A tall composition for the can and the name." },
              { file: "poster-zing.webp", title: "A little zing", caption: "Flavour-led campaign post." },
            ],
          },
          more: [
            { type: "figure", file: "poster-tube.webp", title: "Tube banner", caption: "The wide format carries a short message across a journey.", wide: true },
            {
              type: "figures",
              cols: 2,
              items: [
                { file: "context-tube.webp", title: "London Underground", caption: "The banner in a platform setting." },
                { file: "context-street.webp", title: "Outdoor", caption: "The street display in context." },
              ],
            },
          ],
          note: { head: "Social and stationery", body: "The profile uses the wordmark as its avatar, with a flavour-led bio and a feed that mixes people, flavour, cut-out campaign graphics and behind-the-scenes. Proposed rhythm: three feed posts, two reels and regular stories each week." },
          after: [
            {
              type: "figures",
              cols: 3,
              items: [
                { file: "social-profile.webp", title: "Instagram profile", caption: "Avatar, bio, highlights and a mixed grid." },
                { file: "social-post.webp", title: "Feed post", caption: "Campaign art with a short, playful caption." },
                { file: "stationery.webp", title: "Business cards", caption: "95 × 55 mm. The face on the front, an ivory wordmark on deep teal on the back." },
              ],
            },
          ],
        },
        {
          id: "motion",
          title: "Into three dimensions",
          text: "The can, its painted world and the flavour cues move into 3D scenes, with condensation, warm light and geometric scenery taken straight from the pack. Two vertical pieces from the set.",
          media: {
            type: "videos",
            items: [
              { file: "miro-motion-1.mp4", poster: "miro-motion-1-poster.webp", title: "Citrus reveal", caption: "A close-up of the label pulls out to a lemon slice, a stepped pedestal and the campaign line." },
              { file: "miro-motion-2.mp4", poster: "miro-motion-2-poster.webp", title: "The pack unfolds", caption: "The stepped temples fold out of the label around the can, under a coral sun." },
            ],
          },
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
    layout: [
      { type: "hero", file: "Everlost — Custom Nike Project.jpg" },
      { type: "text", body: "Communike started as a bit of a dare. What if a sneaker brand looked like it came out of a Soviet print shop instead of a streetwear studio. The identity has to hold both of those at once." },
      { type: "hero", file: "website browser mockup.jpg" },
      { type: "pair", files: ["website browser mockup 1.jpg", "website browser mockup 2.jpg"] },
      { type: "quad", files: ["COMMUNIKE CARD.jpg", "COMMUNIKE DESIGN.jpg", "COMMUNIKE POST.jpg", "POST COMMUNIKE.jpg"] },
      { type: "text", body: "Wordmark, packaging, social. Same mark, same red and yellow, every time, until it stops looking like decoration and starts looking like it was always there." },
      { type: "pair", files: ["LOGO WHITE DESIGN.jpg", "POSTER EVERLOST 1.jpg"] },
      { type: "quad", files: ["EVERLOST POST 1.jpg", "POST 4.jpg", "DESETER SALE FINAL.jpg", "Instagram Post Story Mockup.jpg"] },
      { type: "pair", files: ["IMAGE 1.jpg", "IMAGE 3.jpg"] },
      { type: "text", body: "Some of the early exploration used AI-generated renders before the real photography happened, mostly to test the palette and the iconography directly on the shoe." },
      { type: "quad", files: [
        "ChatGPT Image May 21, 2026, 12_17_48 AM.png",
        "ChatGPT Image May 21, 2026, 12_21_28 AM.png",
        "ChatGPT Image May 21, 2026, 12_21_32 AM.png",
        "ChatGPT Image May 21, 2026, 12_22_45 AM.png",
      ] },
      { type: "quad", files: [
        "ChatGPT Image May 21, 2026, 12_24_49 AM.png",
        "ChatGPT Image May 21, 2026, 12_27_51 AM.png",
        "ChatGPT Image May 21, 2026, 12_28_41 AM.png",
        "2.jpg",
      ] },
      { type: "hero", file: "DGHJ.jpg" },
      { type: "text", body: "A separate collaboration handled the ad shoot for the shoe, filming it the way you'd film a real Nike release rather than a personal project." },
      { type: "video", file: "final export 4k.mp4" },
    ],
  },
  {
    id: "kuro",
    category: "branding",
    dir: "Branding/Kuro Portable Blender",
    title: "Kuro — Portable Blender",
    medium: "Branding",
    desc: "Brand identity and packaging for a 450ml travel blender. Wordmark, product renders, and the diagrams that show how it's built and how it ships.",
    cover: "Kuro — Portable Blender.jpg",
    layout: [
      { type: "hero", file: "Kuro — Portable Blender.jpg" },
      { type: "text", body: "A travel blender only works if you stop noticing it's there. The identity follows the same idea: one mark, one bottle shape, nothing extra hanging off it." },
      { type: "pair", files: ["kuro-overview.png", "kuro-parts.jpg"] },
      { type: "hero", file: "kuro-packaging.jpg" },
    ],
  },
  {
    id: "mancraft",
    category: "branding",
    dir: "Branding/Mancraft",
    title: "Mancraft",
    medium: "Branding",
    desc: "A listing card system and product branding for a welding machine, built for a Russian online marketplace. Compact, cooling, and pro versions, each with its own spec card.",
    cover: "Mancraft.jpg",
    layout: [
      { type: "hero", file: "Mancraft.jpg" },
      { type: "text", body: "Three versions, one card format. Spec, price, and logo sit in the same place on every card, so a buyer is comparing the products and not fighting three different layouts." },
      { type: "quad", files: ["mancraft-pro.jpg", "mancraft-compact.jpg", "mancraft-cooling.jpg", "mancraft-weight.jpg"] },
    ],
  },
  {
    id: "mary-jane-festival",
    category: "branding",
    dir: "Branding/Mary Jane Festival",
    title: "Mary Jane Festival",
    medium: "Branding",
    desc: "Festival branding for a cannabis culture event. Two mascots, a leaf and a bong, both grinning, carrying one loose hand-drawn identity across posters and merch.",
    cover: "posyer mj 2.jpg",
    layout: [
      { type: "hero", file: "posyer mj 2.jpg" },
      { type: "text", body: "Two mascots carry the whole thing, drawn loose enough that they still hold up after a bad photocopy or a cheap print run." },
      { type: "pair", files: ["Artboard 1.jpg", "3.jpg"] },
      { type: "pair", files: ["BAG MOCK UP.png", "BAG 12.png"] },
      { type: "hero", file: "Box_110x60x30.png" },
    ],
  },
  {
    id: "childhood",
    category: "designs",
    dir: "Designs/Childhood",
    title: "Childhood",
    medium: "Designs",
    desc: "A collage and short film series about growing up. Bank statements, graffiti, carousel horses, spliced into one uneasy image. Personal stuff, treated like evidence.",
    cover: "Khrushchyovka.jpg",
    layout: [
      { type: "hero", file: "Khrushchyovka.jpg" },
      { type: "text", body: "Bank statements, tower blocks, and the numbered zine pages that hold the whole project together. None of it was planned as one clean series, it collected over time." },
      { type: "pair", files: ["werst.jpg", "INSTA EDITED.jpg"] },
      { type: "quad", files: ["27.jpg", "44.jpg", "47.jpg", "50.jpg"] },
      { type: "video", file: "21.mp4" },
    ],
  },
  {
    id: "war-on-culture",
    category: "designs",
    dir: "Designs/War On Culture",
    title: "War On Culture",
    medium: "Designs",
    desc: "A black and white protest poster series: Elegy, Under the Siege, When War Ends, We Are All Victims. Grunge type, torn paper, pencil crowds, turned into short blunt statements about war and memory. A short film runs alongside the prints.",
    cover: "Elegy.jpg",
    layout: [
      { type: "hero", file: "Elegy.jpg" },
      { type: "text", body: "This one runs in two registers. Illustrated scenes built out of torn paper and pencil crowds, and plain typographic statements that don't try to illustrate anything, they just say it." },
      { type: "quad", files: ["Under the Siege.jpg", "When War Ends.jpg", "What needs to be repair.jpg", "PSDDPLPD (2).jpg"] },
      { type: "text", body: "Elegy, Warning, Under the Siege. Each poster picks one blunt line and gives it the whole page, nothing else competing for space." },
      { type: "quad", files: ["WE ARE ALL VICTIMS.jpg", "Warning.jpg", "Untitled-4.jpg", "asas.jpg"] },
      { type: "video", file: "31.mp4" },
    ],
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
  return `assets/portfolio/${project.dir}/${file}`.split("/").map(encodeURIComponent).join("/");
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
