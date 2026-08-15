/* ==========================================================================
   works.html router — one page, three views, switched by the URL:

     ?p=<projectId>    PROJECT DETAIL — title, category, description, and
                        a full media gallery (images + video) for that one
                        project. Reached by clicking a project card, a
                        marquee item, or a 3D hotspot.
     ?cat=<categoryId> CATEGORY GRID — the tab's list of project cards
                        (cover image + title). Reached from the nav.
     (neither)          OVERVIEW — all three categories, stacked, each
                        with its own project grid. The page's default —
                        also where "Back to Works" links land.

   An unrecognized ?p= or ?cat= shows #notFound instead of silently
   rendering nothing.
   ========================================================================== */

import {
  CATEGORIES,
  PROJECTS,
  isVideo,
  projectUrl,
  categoryUrl,
  mediaSrc,
  coverSrc,
  findProjectById,
  findCategoryById,
  projectsInCategory,
} from "./works-data.js?v=12";

function renderProjectCard(project) {
  const article = document.createElement("article");
  article.className = "card";

  const a = document.createElement("a");
  a.className = "card__frame";
  a.href = projectUrl(project);

  const img = document.createElement("img");
  img.src = coverSrc(project);
  img.alt = project.title;
  img.loading = "lazy";

  a.appendChild(img);
  article.appendChild(a);

  const caption = document.createElement("span");
  caption.className = "card__caption";
  caption.textContent = project.title;
  article.appendChild(caption);

  return article;
}

function renderProjectGrid(container, projects) {
  const fragment = document.createDocumentFragment();
  projects.forEach((p) => fragment.appendChild(renderProjectCard(p)));
  container.appendChild(fragment);
}

/* A project's case-study page is a sequence of typed blocks (see the big
   comment in works-data.js) rather than one flat grid — that's what lets
   one image lead at full width, same-style shots sit together as a pair
   or a 2x2, and short paragraphs break up long runs of images instead of
   everything marching past at the same size. Each renderXBlock function
   below handles one block type; renderGallery just dispatches on it. */

// A single image, linking out to its full-size file (same pattern as this
// site's earlier canvas-detail gallery), or a video with native controls
// instead of a link, since there's nothing more "full size" to open.
function renderTile(project, file) {
  if (isVideo(file)) {
    const video = document.createElement("video");
    video.className = "gallery-tile__media";
    video.src = mediaSrc(project, file);
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    return video;
  }

  const a = document.createElement("a");
  a.className = "gallery-tile__media";
  a.href = mediaSrc(project, file);
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", `${project.title} — open full size`);

  const img = document.createElement("img");
  img.src = mediaSrc(project, file);
  img.alt = project.title;
  img.loading = "lazy";
  a.appendChild(img);
  return a;
}

// hero/video: one full-width tile, shown at its own natural aspect ratio
// (not cropped) — the point of "leading" is that it isn't just another
// same-shaped card in a row.
function renderHeroBlock(project, file) {
  const div = document.createElement("div");
  div.className = "gallery-block gallery-block--hero";
  div.appendChild(renderTile(project, file));
  return div;
}

// pair/quad: 2 or 4 tiles that share a visual style closely enough to sit
// together — cropped to a matching aspect ratio (unlike the hero) so the
// group reads as one deliberate grid instead of a ragged row.
function renderGroupBlock(project, files, modifier) {
  const div = document.createElement("div");
  div.className = `gallery-block gallery-block--${modifier}`;
  files.forEach((file) => {
    const tile = document.createElement("div");
    tile.className = "gallery-tile";
    tile.appendChild(renderTile(project, file));
    div.appendChild(tile);
  });
  return div;
}

// A short paragraph, no image — narrates rather than just captioning, and
// gives the eye a rest between image groups.
function renderTextBlock(body) {
  const p = document.createElement("p");
  p.className = "gallery-block gallery-block--text";
  p.textContent = body;
  return p;
}

function renderGallery(container, project) {
  const fragment = document.createDocumentFragment();
  project.layout.forEach((block) => {
    switch (block.type) {
      case "hero":
      case "video":
        fragment.appendChild(renderHeroBlock(project, block.file));
        break;
      case "pair":
        fragment.appendChild(renderGroupBlock(project, block.files, "pair"));
        break;
      case "quad":
        fragment.appendChild(renderGroupBlock(project, block.files, "quad"));
        break;
      case "text":
        fragment.appendChild(renderTextBlock(block.body));
        break;
    }
  });
  container.appendChild(fragment);
}

function renderOverview(container) {
  CATEGORIES.forEach((cat) => {
    const projects = projectsInCategory(cat.id);
    if (projects.length === 0) return;

    const section = document.createElement("section");
    section.className = "section section--continued";

    const head = document.createElement("div");
    head.className = "section__head";
    const heading = document.createElement("h2");
    heading.className = "section__title";
    const link = document.createElement("a");
    link.href = categoryUrl(cat.id);
    link.textContent = cat.label;
    heading.appendChild(link);
    head.appendChild(heading);
    section.appendChild(head);

    const grid = document.createElement("div");
    grid.className = "grid";
    renderProjectGrid(grid, projects);
    section.appendChild(grid);

    container.appendChild(section);
  });
}

/* ---- Router ---- */

const params = new URLSearchParams(location.search);
const projectId = params.get("p");
const categoryId = params.get("cat");

const projectDetailEl = document.getElementById("projectDetail");
const categoryViewEl = document.getElementById("categoryView");
const overviewViewEl = document.getElementById("overviewView");
const notFoundEl = document.getElementById("notFound");

// Underlines whichever nav tab matches the category actually showing —
// same treatment the hover state gets (see .nav__links a.is-active in
// css/style.css), just left on instead of needing the cursor over it.
function markActiveTab(categoryId) {
  if (!categoryId) return;
  const href = categoryUrl(categoryId);
  document.querySelectorAll(".nav__links a").forEach((a) => {
    if (a.getAttribute("href") === href) a.classList.add("is-active");
  });
}

// The not-found message says "see the full list below" — this renders
// that list under it, same as the plain overview, so the promise holds.
function showNotFound() {
  document.title = "Platon — Not found";
  notFoundEl.hidden = false;
  renderOverview(overviewViewEl);
  overviewViewEl.hidden = false;
}

if (projectId) {
  const project = findProjectById(projectId);
  if (project) {
    document.title = `Platon — ${project.title}`;
    document.getElementById("projectMedium").textContent = project.medium;
    document.getElementById("projectTitle").textContent = project.title;
    document.getElementById("projectDesc").textContent = project.desc || "";
    const siteEl = document.getElementById("projectSite");
    if (project.site) {
      siteEl.href = project.site.url;
      siteEl.textContent = `Visit ${project.site.label} ↗`;
      siteEl.hidden = false;
    } else {
      siteEl.hidden = true;
    }
    document.getElementById("projectBack").href = categoryUrl(project.category);
    document.getElementById("projectBack").textContent = `Back to ${findCategoryById(project.category)?.label || "Works"}`;
    renderGallery(document.getElementById("projectGallery"), project);
    projectDetailEl.hidden = false;
    markActiveTab(project.category);
  } else {
    showNotFound();
  }
} else if (categoryId) {
  const category = findCategoryById(categoryId);
  if (category) {
    document.title = `Platon — ${category.label}`;
    document.getElementById("categoryTitle").textContent = category.label;
    renderProjectGrid(document.getElementById("categoryGrid"), projectsInCategory(category.id));
    categoryViewEl.hidden = false;
    markActiveTab(category.id);
  } else {
    showNotFound();
  }
} else {
  renderOverview(overviewViewEl);
  overviewViewEl.hidden = false;
}
