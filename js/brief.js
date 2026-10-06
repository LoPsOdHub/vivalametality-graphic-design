/* ==========================================================================
   Structured brief renderer — used by works-page.js for any project that
   has a `brief` in js/works-data.js (MIRO Drink) instead of a flat gallery.

   A brief is: a cover + facts + chapter index, then one section per
   chapter (numbered, in work-process order), then an inline PDF viewer.

   Chapter  { id, title, text (string or array of paragraphs), media, more?, note?, after? }
   Media    { type: "figure",  file, title, caption, wide? }
            { type: "figures", cols, items: [{ file, title, caption }], wide?: [fr, fr] }
            { type: "tiles",   cols, items: [...], crop?: "w / h" }
   `crop` (on tiles or figures) crops every image in the group to one
   aspect ratio, so mixed-shape shots still sit as an even grid.
            { type: "swatches", items: [{ name, hex, rgb, role }] }
            { type: "specs",   head, cols: [...], rows: [[...]] }
            { type: "videos",  items: [{ file, poster, title, caption, ratio?, loop? }], wide? }
   `loop: true` makes a video a silent, looping animation that plays while
   it is on screen (see makeLooping) instead of a click-to-play clip.
   `brief.film` is one such looping video pinned beside the whole page.
   `more` and `after` are extra media blocks shown after `media`, and after
   the chapter note, respectively.

   Every image is wrapped in a link carrying data-zoom, which
   js/lightbox.js picks up — it never needs to know about chapters.
   ========================================================================== */

import { mediaSrc } from "./works-data.js?v=16";
import { initLightbox } from "./lightbox.js?v=2";

function h(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  return el;
}

const pad2 = (n) => String(n).padStart(2, "0");

/* ---- Figures: a click-to-zoom image with a title and caption ---- */

function renderFigure(project, item, extraClass = "") {
  const fig = h("figure", `bfig ${extraClass}`.trim());

  const a = h("a", "bfig__link");
  a.href = mediaSrc(project, item.file);
  a.dataset.zoom = "";
  a.dataset.title = item.title || "";
  a.dataset.caption = item.caption || "";
  a.setAttribute("aria-label", `${item.title || project.title}: open larger`);

  const img = document.createElement("img");
  img.src = a.href;
  img.alt = [item.title, item.caption].filter(Boolean).join(". ") || project.title;
  img.loading = "lazy";
  img.decoding = "async";
  a.appendChild(img);
  fig.appendChild(a);

  if (item.title || item.caption) {
    const cap = h("figcaption", "bfig__cap");
    if (item.title) cap.appendChild(h("strong", "bfig__title", item.title));
    if (item.caption) cap.appendChild(h("span", "bfig__text", item.caption));
    fig.appendChild(cap);
  }
  return fig;
}

function renderFigures(project, media, modifier) {
  const grid = h("div", `bgrid bgrid--${modifier}`);
  grid.style.setProperty("--cols", String(media.cols || media.items.length));
  if (media.wide) grid.style.setProperty("--tracks", media.wide.map((n) => `${n}fr`).join(" "));
  if (media.crop) {
    grid.classList.add("bgrid--crop");
    grid.style.setProperty("--ratio", media.crop);
  }
  media.items.forEach((item) => grid.appendChild(renderFigure(project, item)));
  return grid;
}

/* ---- Swatches: click to copy the hex ---- */

function renderSwatches(media) {
  const wrap = h("div", "bswatches");
  const status = h("p", "bswatches__status");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  const list = h("ul", "bswatches__list");
  media.items.forEach((s) => {
    const li = h("li", "bswatch");
    const btn = h("button", "bswatch__btn");
    btn.type = "button";
    btn.setAttribute("aria-label", `${s.name}, ${s.hex}. Copy hex code`);

    const chip = h("span", "bswatch__chip");
    chip.style.background = s.hex;
    btn.appendChild(chip);
    btn.appendChild(h("span", "bswatch__name", s.name));
    btn.appendChild(h("span", "bswatch__hex", s.hex));
    btn.appendChild(h("span", "bswatch__rgb", `RGB ${s.rgb}`));
    btn.appendChild(h("span", "bswatch__role", s.role));

    let timer;
    btn.addEventListener("click", async () => {
      let ok = false;
      try {
        await navigator.clipboard.writeText(s.hex);
        ok = true;
      } catch (_) {
        /* clipboard blocked (http, old browser) — fall through to the hint */
      }
      status.textContent = ok ? `Copied ${s.hex}` : `${s.name} is ${s.hex}`;
      btn.classList.toggle("is-copied", ok);
      clearTimeout(timer);
      timer = setTimeout(() => {
        status.textContent = "";
        btn.classList.remove("is-copied");
      }, 1800);
    });

    li.appendChild(btn);
    list.appendChild(li);
  });

  wrap.appendChild(list);
  wrap.appendChild(status);
  return wrap;
}

/* ---- Specs table ---- */

function renderSpecs(media) {
  const wrap = h("div", "bspecs");
  if (media.head) wrap.appendChild(h("h3", "bspecs__head", media.head));
  const scroller = h("div", "bspecs__scroll");
  const table = h("table", "bspecs__table");
  const thead = h("thead");
  const hr = h("tr");
  media.cols.forEach((c) => {
    const th = h("th", null, c);
    th.scope = "col";
    hr.appendChild(th);
  });
  thead.appendChild(hr);
  table.appendChild(thead);
  const tbody = h("tbody");
  media.rows.forEach((r) => {
    const tr = h("tr");
    r.forEach((cell, i) => {
      const td = h(i === 0 ? "th" : "td", null, cell);
      if (i === 0) td.scope = "row";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  scroller.appendChild(table);
  wrap.appendChild(scroller);
  return wrap;
}

/* ---- Videos ---- */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// A looping animation: muted (browsers only autoplay muted video), plays
// whenever at least a third of it is on screen and pauses when it isn't.
// Controls stay on, so anyone can pause it, scrub, or turn the sound on.
// With reduced motion requested it never starts by itself.
function makeLooping(video) {
  video.classList.add("bfig__video--loop");
  video.muted = true;
  video.loop = true;
  video.preload = "metadata";
  if (reduceMotion.matches || !("IntersectionObserver" in window)) return;
  let userPaused = false;
  let auto = false;
  video.addEventListener("pause", () => {
    if (!auto) userPaused = true;
  });
  video.addEventListener("play", () => {
    userPaused = false;
  });
  new IntersectionObserver(
    ([entry]) => {
      auto = true;
      if (entry.isIntersecting) {
        if (!userPaused) video.play().catch(() => {});
      } else {
        video.pause();
      }
      setTimeout(() => {
        auto = false;
      }, 0);
    },
    { threshold: 0.35 }
  ).observe(video);
}

function renderVideos(project, media) {
  const grid = h("div", `bgrid bgrid--videos${media.wide ? " bgrid--video-wide" : ""}`);
  media.items.forEach((item) => {
    const fig = h("figure", "bfig bfig--video");
    const video = document.createElement("video");
    video.className = "bfig__video";
    video.src = mediaSrc(project, item.file);
    if (item.poster) video.poster = mediaSrc(project, item.poster);
    video.controls = true;
    video.playsInline = true;
    video.preload = "none";
    video.setAttribute("aria-label", item.title);
    if (item.ratio) video.style.aspectRatio = item.ratio;
    if (item.loop) {
      makeLooping(video);
    } else {
      video.addEventListener("play", () => {
        document.querySelectorAll(".bfig__video:not(.bfig__video--loop)").forEach((v) => {
          if (v !== video) v.pause();
        });
      });
    }
    fig.appendChild(video);

    const cap = h("figcaption", "bfig__cap");
    cap.appendChild(h("strong", "bfig__title", item.title));
    cap.appendChild(h("span", "bfig__text", item.caption));
    fig.appendChild(cap);
    grid.appendChild(fig);
  });
  return grid;
}

function renderMedia(project, media) {
  switch (media.type) {
    case "figure":
      return renderFigure(project, media, media.wide ? "bfig--wide" : "");
    case "figures":
      return renderFigures(project, media, "figures");
    case "tiles":
      return renderFigures(project, media, "tiles");
    case "swatches":
      return renderSwatches(media);
    case "specs":
      return renderSpecs(media);
    case "videos":
      return renderVideos(project, media);
    default:
      return document.createDocumentFragment();
  }
}

/* ---- Chapters ---- */

function renderChapter(project, chapter, index) {
  const section = h("section", "bchapter");
  section.id = chapter.id;
  section.setAttribute("aria-labelledby", `${chapter.id}-title`);

  const head = h("header", "bchapter__head");
  head.appendChild(h("span", "stamp bchapter__num", pad2(index + 1)));
  const title = h("h2", "bchapter__title", chapter.title);
  title.id = `${chapter.id}-title`;
  head.appendChild(title);
  section.appendChild(head);

  [].concat(chapter.text).forEach((para) => section.appendChild(h("p", "bchapter__text", para)));

  const body = h("div", "bchapter__body");
  body.appendChild(renderMedia(project, chapter.media));
  (chapter.more || []).forEach((m) => body.appendChild(renderMedia(project, m)));
  section.appendChild(body);

  if (chapter.note) {
    const note = h("aside", "bnote");
    note.appendChild(h("h3", "bnote__head", chapter.note.head));
    note.appendChild(h("p", "bnote__body", chapter.note.body));
    section.appendChild(note);
  }
  if (chapter.after && chapter.after.length) {
    const after = h("div", "bchapter__body");
    chapter.after.forEach((m) => after.appendChild(renderMedia(project, m)));
    section.appendChild(after);
  }
  return section;
}

/* ---- Intro: cover, tagline, facts, chapter index ---- */

function renderIntro(project, brief) {
  const intro = h("div", brief.film ? "bintro bintro--plain" : "bintro");

  // With a pinned film the film is the lead image, so there's no cover here.
  if (!brief.film) {
    intro.appendChild(
      renderFigure(project, { file: project.cover, title: project.title, caption: brief.tagline }, "bintro__cover")
    );
  }

  const side = h("div", "bintro__side");
  side.appendChild(h("p", "bintro__tagline", brief.tagline));

  const dl = h("dl", "bintro__facts");
  brief.facts.forEach(([k, v]) => {
    const row = h("div", "bintro__fact");
    row.appendChild(h("dt", null, k));
    row.appendChild(h("dd", null, v));
    dl.appendChild(row);
  });
  side.appendChild(dl);

  const nav = h("nav", "bintro__nav");
  nav.setAttribute("aria-label", "Process");
  nav.appendChild(h("p", "bintro__navhead", "The process"));
  const ol = h("ol", "bintro__list");
  brief.chapters.forEach((c, i) => {
    const li = h("li");
    const a = h("a", null, c.title);
    a.href = `#${c.id}`;
    a.dataset.num = pad2(i + 1);
    li.appendChild(a);
    ol.appendChild(li);
  });
  if (brief.pdf) {
    const li = h("li");
    const a = h("a", null, "The full brand book");
    a.href = "#brand-book";
    a.dataset.num = "PDF";
    li.appendChild(a);
    ol.appendChild(li);
  }
  nav.appendChild(ol);
  side.appendChild(nav);

  intro.appendChild(side);
  return intro;
}

/* ---- PDF viewer: collapsed until asked for, so the 1.7 MB file is only
   fetched by someone who wants it. Open / download links are always
   there, since some mobile browsers won't render a PDF inside an iframe. */

function renderBook(project, pdf) {
  const src = mediaSrc(project, pdf.file);
  const section = h("section", "bbook");
  section.id = "brand-book";
  section.setAttribute("aria-labelledby", "brand-book-title");

  const head = h("header", "bchapter__head");
  head.appendChild(h("span", "stamp bchapter__num", "PDF"));
  const title = h("h2", "bchapter__title", "The full brand book");
  title.id = "brand-book-title";
  head.appendChild(title);
  section.appendChild(head);

  section.appendChild(
    h("p", "bchapter__text", `All ${pdf.pages} pages, from logo rules to campaign frames. Read it here, or take it with you.`)
  );

  const actions = h("div", "bbook__actions");
  const toggle = h("button", "bbook__btn bbook__btn--primary", "Read it here");
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "bookViewer");

  const open = h("a", "bbook__btn", "Open in a new tab");
  open.href = src;
  open.target = "_blank";
  open.rel = "noopener";

  const dl = h("a", "bbook__btn", "Download PDF");
  dl.href = src;
  dl.download = "";

  actions.append(toggle, open, dl);
  section.appendChild(actions);

  const viewer = h("div", "bbook__viewer");
  viewer.id = "bookViewer";
  viewer.hidden = true;
  section.appendChild(viewer);

  toggle.addEventListener("click", () => {
    const opening = viewer.hidden;
    if (opening && !viewer.firstChild) {
      const frame = document.createElement("iframe");
      frame.className = "bbook__frame";
      frame.title = pdf.label;
      frame.src = `${src}#view=FitH`;
      viewer.appendChild(frame);
      viewer.appendChild(
        h("p", "bbook__hint", "Not showing? Your browser may block embedded PDFs. Use Open in a new tab above.")
      );
    }
    viewer.hidden = !opening;
    toggle.setAttribute("aria-expanded", String(opening));
    toggle.textContent = opening ? "Hide the brand book" : "Read it here";
    if (opening) viewer.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });

  return section;
}

/* ---- Pinned film: stays beside the page and keeps looping while the
   chapters scroll past (stacks above them on narrow screens). ---- */

function renderFilm(project, film) {
  const fig = h("figure", "bfig bfilm");
  const video = document.createElement("video");
  video.className = "bfig__video bfilm__video";
  video.src = mediaSrc(project, film.file);
  if (film.poster) video.poster = mediaSrc(project, film.poster);
  video.controls = true;
  video.playsInline = true;
  video.setAttribute("aria-label", film.title);
  makeLooping(video);
  fig.appendChild(video);

  const cap = h("figcaption", "bfig__cap");
  cap.appendChild(h("strong", "bfig__title", film.title));
  cap.appendChild(h("span", "bfig__text", film.caption));
  fig.appendChild(cap);
  return fig;
}

export function renderBrief(container, project) {
  const brief = project.brief;
  const root = h("div", brief.film ? "brief brief--film" : "brief");

  // `main` is the scrolling column; without a film it is the root itself.
  let main = root;
  if (brief.film) {
    root.appendChild(renderFilm(project, brief.film));
    main = h("div", "brief__main");
    root.appendChild(main);
  }

  main.appendChild(renderIntro(project, brief));
  brief.chapters.forEach((c, i) => main.appendChild(renderChapter(project, c, i)));
  if (brief.pdf) main.appendChild(renderBook(project, brief.pdf));

  container.appendChild(root);
  initLightbox(root);
}
