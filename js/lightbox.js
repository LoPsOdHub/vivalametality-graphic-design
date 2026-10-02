/* ==========================================================================
   Click-to-zoom lightbox. initLightbox(root) turns every <a data-zoom
   href="…image"> inside `root` into an opener for one shared overlay, in
   document order, so prev/next walks the page's images top to bottom.

   Inside: wheel / +/- / buttons / double-click to zoom (up to 5x), drag to
   pan once zoomed, two-finger pinch on touch, swipe or arrow keys to move
   between images, Esc or a backdrop click to close. Focus is trapped while
   open and handed back to the thumbnail that opened it.
   ========================================================================== */

const MAX_SCALE = 5;
const MIN_SCALE = 1;
const STEP = 1.4;

let overlay = null;
const ui = {};
let items = [];
let index = 0;
let opener = null;
const view = { s: 1, x: 0, y: 0 };

function mk(tag, className, attrs = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function iconButton(label, glyph, cls = "") {
  const b = mk("button", `lb__btn ${cls}`.trim(), { type: "button", "aria-label": label, title: label });
  b.textContent = glyph;
  return b;
}

function build() {
  overlay = mk("div", "lb", { role: "dialog", "aria-modal": "true", "aria-label": "Image viewer", tabindex: "-1", hidden: "" });

  ui.stage = mk("div", "lb__stage");
  ui.img = mk("img", "lb__img", { alt: "", draggable: "false" });
  ui.stage.appendChild(ui.img);

  ui.bar = mk("div", "lb__bar");
  ui.count = mk("span", "lb__count");
  ui.zoomOut = iconButton("Zoom out", "−");
  ui.zoomLevel = mk("span", "lb__level", { "aria-hidden": "true" });
  ui.zoomIn = iconButton("Zoom in", "+");
  ui.reset = iconButton("Fit to screen", "Fit", "lb__btn--text");
  ui.close = iconButton("Close", "×", "lb__btn--close");
  ui.bar.append(ui.count, ui.zoomOut, ui.zoomLevel, ui.zoomIn, ui.reset, ui.close);

  ui.prev = iconButton("Previous image", "‹", "lb__nav lb__nav--prev");
  ui.next = iconButton("Next image", "›", "lb__nav lb__nav--next");

  ui.cap = mk("div", "lb__cap", { "aria-live": "polite" });
  ui.capTitle = mk("strong", "lb__captitle");
  ui.capText = mk("span", "lb__captext");
  ui.cap.append(ui.capTitle, ui.capText);

  overlay.append(ui.stage, ui.bar, ui.prev, ui.next, ui.cap);
  document.body.appendChild(overlay);

  ui.zoomIn.addEventListener("click", () => zoomBy(STEP));
  ui.zoomOut.addEventListener("click", () => zoomBy(1 / STEP));
  ui.reset.addEventListener("click", resetView);
  ui.close.addEventListener("click", close);
  ui.prev.addEventListener("click", () => go(-1));
  ui.next.addEventListener("click", () => go(1));

  // A click on the empty area around the image (not on the image itself,
  // and not the tail end of a drag) closes it.
  ui.stage.addEventListener("click", (e) => {
    if (!drag.onImage && !drag.moved) close();
  });
  ui.stage.addEventListener("wheel", onWheel, { passive: false });
  ui.stage.addEventListener("dblclick", onDouble);
  ui.stage.addEventListener("pointerdown", onPointerDown);
  ui.stage.addEventListener("pointermove", onPointerMove);
  ui.stage.addEventListener("pointerup", onPointerUp);
  ui.stage.addEventListener("pointercancel", onPointerUp);
  ui.img.addEventListener("load", () => {
    ui.img.classList.add("is-ready");
    resetView();
  });
}

/* ---- View transform ---- */

function bounds() {
  const sw = ui.stage.clientWidth;
  const sh = ui.stage.clientHeight;
  const iw = ui.img.offsetWidth * view.s;
  const ih = ui.img.offsetHeight * view.s;
  return { x: Math.max(0, (iw - sw) / 2), y: Math.max(0, (ih - sh) / 2) };
}

function apply() {
  const b = bounds();
  view.x = Math.min(b.x, Math.max(-b.x, view.x));
  view.y = Math.min(b.y, Math.max(-b.y, view.y));
  ui.img.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.s})`;
  ui.stage.classList.toggle("is-zoomed", view.s > 1.001);
  ui.zoomLevel.textContent = `${Math.round(view.s * 100)}%`;
  ui.zoomOut.disabled = view.s <= MIN_SCALE + 0.001;
  ui.zoomIn.disabled = view.s >= MAX_SCALE - 0.001;
}

function resetView() {
  view.s = 1;
  view.x = 0;
  view.y = 0;
  apply();
}

// Zoom to `next`, keeping the point at (px, py) — measured from the stage
// centre, where the image's transform-origin sits — fixed under the cursor.
function zoomTo(next, px = 0, py = 0) {
  next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
  const k = next / view.s;
  view.x = px - (px - view.x) * k;
  view.y = py - (py - view.y) * k;
  view.s = next;
  if (next === MIN_SCALE) {
    view.x = 0;
    view.y = 0;
  }
  apply();
}

function zoomBy(factor) {
  zoomTo(view.s * factor);
}

function centreOffset(e) {
  const r = ui.stage.getBoundingClientRect();
  return { x: e.clientX - (r.left + r.width / 2), y: e.clientY - (r.top + r.height / 2) };
}

function onWheel(e) {
  e.preventDefault();
  const p = centreOffset(e);
  zoomTo(view.s * Math.exp(-e.deltaY * 0.0018), p.x, p.y);
}

function onDouble(e) {
  const p = centreOffset(e);
  if (view.s > 1.05) zoomTo(1);
  else zoomTo(2.5, p.x, p.y);
}

/* ---- Pointer: drag-pan, pinch, swipe ---- */

const pointers = new Map();
const drag = { moved: false, onImage: false, startX: 0, startY: 0, vx: 0, vy: 0, pinch: 0 };

function onPointerDown(e) {
  if (e.target.closest(".lb__btn")) return;
  ui.stage.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  drag.moved = false;
  drag.onImage = e.target === ui.img;
  drag.startX = e.clientX;
  drag.startY = e.clientY;
  drag.vx = view.x;
  drag.vy = view.y;
  if (pointers.size === 2) drag.pinch = pinchDistance();
}

function pinchDistance() {
  const [a, b] = [...pointers.values()];
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function onPointerMove(e) {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 2) {
    const d = pinchDistance();
    if (drag.pinch > 0) zoomBy(d / drag.pinch);
    drag.pinch = d;
    drag.moved = true;
    return;
  }

  const dx = e.clientX - drag.startX;
  const dy = e.clientY - drag.startY;
  if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
  if (view.s > 1.001) {
    view.x = drag.vx + dx;
    view.y = drag.vy + dy;
    apply();
  }
}

function onPointerUp(e) {
  const wasSingle = pointers.size === 1;
  pointers.delete(e.pointerId);
  if (pointers.size === 1) {
    // a pinch just ended — re-base the remaining finger so the image doesn't jump
    const [p] = [...pointers.values()];
    drag.startX = p.x;
    drag.startY = p.y;
    drag.vx = view.x;
    drag.vy = view.y;
  }
  if (wasSingle && view.s <= 1.001) {
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  }
  // let the click handler that follows this pointerup still see `moved`
  setTimeout(() => {
    if (pointers.size === 0) drag.moved = false;
  }, 0);
}

/* ---- Navigation ---- */

function show(i) {
  index = (i + items.length) % items.length;
  const a = items[index];
  ui.img.classList.remove("is-ready");
  ui.img.src = a.href;
  ui.img.alt = a.querySelector("img")?.alt || "";
  ui.count.textContent = `${index + 1} / ${items.length}`;
  ui.capTitle.textContent = a.dataset.title || "";
  ui.capText.textContent = a.dataset.caption || "";
  ui.cap.hidden = !(a.dataset.title || a.dataset.caption);
  const single = items.length < 2;
  ui.prev.hidden = single;
  ui.next.hidden = single;
  resetView();

  // warm the neighbours so stepping through feels instant
  [index - 1, index + 1].forEach((n) => {
    const pre = new Image();
    pre.src = items[(n + items.length) % items.length].href;
  });
}

function go(step) {
  if (items.length > 1) show(index + step);
}

/* ---- Open / close / keyboard ---- */

function onKey(e) {
  switch (e.key) {
    case "Escape":
      e.preventDefault();
      close();
      break;
    case "ArrowLeft":
      e.preventDefault();
      go(-1);
      break;
    case "ArrowRight":
      e.preventDefault();
      go(1);
      break;
    case "+":
    case "=":
      e.preventDefault();
      zoomBy(STEP);
      break;
    case "-":
    case "_":
      e.preventDefault();
      zoomBy(1 / STEP);
      break;
    case "0":
      e.preventDefault();
      resetView();
      break;
    case "Tab": {
      const f = [...overlay.querySelectorAll("button:not([hidden]):not(:disabled)")];
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (!overlay.contains(document.activeElement) || document.activeElement === overlay) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
      break;
    }
  }
}

function open(list, i, from) {
  if (!overlay) build();
  items = list;
  opener = from;
  overlay.hidden = false;
  document.documentElement.classList.add("lb-open");
  document.addEventListener("keydown", onKey);
  show(i);
  ui.close.focus();
}

function close() {
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  document.removeEventListener("keydown", onKey);
  pointers.clear();
  document.documentElement.classList.remove("lb-open");
  ui.img.removeAttribute("src");
  if (opener && document.contains(opener)) opener.focus();
  opener = null;
}

export function initLightbox(root) {
  const list = [...root.querySelectorAll("a[data-zoom]")];
  list.forEach((a, i) => {
    a.addEventListener("click", (e) => {
      // let ctrl/cmd/middle-click open the file in a tab like a normal link
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(list, i, a);
    });
  });
}
