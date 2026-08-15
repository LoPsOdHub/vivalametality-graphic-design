/* ==========================================================================
   Home page marquee — renders every PROJECT into #marqueeTrack, twice back
   to back so the CSS animation's -50% loop is seamless. Add or remove
   projects in js/works-data.js; this file never needs to change.
   ========================================================================== */

import { PROJECTS, projectUrl, coverSrc } from "./works-data.js?v=12";

const track = document.getElementById("marqueeTrack");

function renderItem(project, duplicate) {
  const a = document.createElement("a");
  a.className = "marquee__item";
  a.href = projectUrl(project);
  if (duplicate) {
    a.setAttribute("aria-hidden", "true");
    a.tabIndex = -1;
  }

  const img = document.createElement("img");
  img.src = coverSrc(project);
  img.alt = duplicate ? "" : project.title;
  img.loading = "lazy";
  a.appendChild(img);

  const caption = document.createElement("span");
  caption.className = "marquee__caption";
  caption.textContent = project.title;
  a.appendChild(caption);

  return a;
}

const fragment = document.createDocumentFragment();
PROJECTS.forEach((project) => fragment.appendChild(renderItem(project, false)));
PROJECTS.forEach((project) => fragment.appendChild(renderItem(project, true)));
track.appendChild(fragment);
