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
