/* ==========================================================================
   PLATON — 3D HERO
   ==========================================================================

   What this file does:
     1. Renders the model into <canvas id="scene">, sized to fill its own
        .hero__stage box — a large, centered square in the middle of the
        hero (see css/style.css).
     2. Loads assets/models/TEST RUN 1903.glb, centers it, and auto-fits
        the camera so it fills the stage.
     3. Turns it ONLY left/right (Y-axis) — no tilt on the other axis.
        Four things drive that rotation together: dragging directly on the
        model with the mouse (deliberate), the range slider under the stage
        (also deliberate, and stays in sync with dragging), a small ambient
        wobble that follows the cursor without dragging (subtle, layered on
        top), and a constant slow idle spin so the model is never fully
        still.
     4. Draws real DOM buttons ("hotspot markers") over the canvas, one per
        distinct part of the model, each precisely tracking where that
        part currently sits on screen as it turns, fitted to that part's
        actual sampled silhouette rather than its loose bounding box (see
        buildHotspots) — see the notes at the bottom for why this is a DOM
        overlay instead of relying on hit-testing the 3D mesh directly.
     5. Hovering a marker: highlights it, shows a small plaque next to the
        cursor previewing the project behind it, eases the camera in
        toward that part, and eases the model's own ambient motion
        (idle spin + cursor wobble) to a stop so the part holds still
        under the cursor instead of turning away from it. Clicking it
        goes to that project's page.

   If the model hasn't loaded (or isn't there yet), a simple placeholder
   shape fills in so the page still looks alive (with no hotspots).
   ========================================================================== */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { PROJECTS, projectUrl, coverSrc } from "./works-data.js?v=12";

const CONFIG = {
  modelPath: "assets/models/TEST RUN 1903.glb",

  // Rotation (Y-axis only). Four inputs feed the same target angle:
  // dragging (deliberate, biggest range), the slider (deliberate, mirrors
  // whatever dragging set), a small ambient wobble from the cursor when
  // NOT dragging (subtle, layered on top), and a constant idle spin
  // (below) that runs always, for a bit of motion on the page even when
  // nobody's touching it — dragging/the slider still fully override it
  // moment to moment since they set sliderTargetY directly, so it never
  // fights an active interaction, it just resumes once you let go.
  dragSensitivity: Math.PI * 1.1, // radians of rotation per full stage-width drag
  hoverRotationMax: 0.14,
  rotationEasing: 0.09,
  // Negative = clockwise as seen from above (three.js's rotation.y is
  // positive-counterclockwise from above; flip the sign here if that
  // reads as the wrong way on screen). ~1 full turn every 7 minutes —
  // meant to be noticed only as ambient life, not as an obvious spin.
  idleSpinSpeed: -0.015,

  cameraFov: 32,
  // Fraction of the limiting stage dimension the model's bounding box
  // should span. The stage is already a large, dedicated square (see css),
  // so this just needs a modest bleed rather than doing the "make it big"
  // work itself.
  fillFraction: 1.05,

  // Screen-space direction check used to hide a marker once its object has
  // rotated to the far side of the scene — higher = stricter (hides sooner).
  facingThreshold: 0.02,
  // Markers never render smaller than this on screen, so small parts (an
  // eyelet, a lace segment) stay comfortably clickable/tappable even once
  // decluttered down.
  markerMinSize: 34,
  // Each marker is drawn at this multiple of its own tight projected size
  // (see buildHotspots' point sampling — the projected rect already hugs
  // the part's actual sampled silhouette, not its loose bounding box, so
  // there's room to grow it back out on purpose for a chunkier, easier-to-
  // read/click box without it going back to floating over unrelated
  // geometry). 1 = exactly the tight projected size, less than 1 shrinks
  // toward the center, more than 1 grows from it.
  markerScale: 1.9,
  // A sneaker's ~20 named parts sit close together on a small stage, so
  // their tight projected boxes still overlap each other constantly — an
  // overlapped marker is effectively unclickable wherever a neighbor sits
  // on top of it in the DOM. See declutterMarkerRects: each frame, any
  // still-overlapping pair is first nudged apart (up to markerDeclutterMaxDrift,
  // as a multiple of the marker's own size, so it doesn't drift far enough
  // to stop reading as "that object's" marker), then whatever's still
  // overlapping after that is shrunk (by markerDeclutterShrink per pass,
  // down to markerMinSize) until every marker has some exclusive, clickable
  // area of its own. Whichever marker is currently hovered is exempt from
  // both — see the isHovered handling inside declutterMarkerRects — so
  // hovering one can never make it drift or shrink out from under the
  // cursor because a neighbor happened to need the room.
  markerDeclutterMaxDrift: 0.65,
  markerDeclutterIterations: 6,
  markerDeclutterShrink: 0.88,
  // How many points to sample from each mesh's actual vertices (not just
  // its bounding box corners) when building a hotspot's hit-test shape —
  // see buildHotspots. Higher = tighter fit to genuinely curved/sprawling
  // parts (a shoelace, a seam) at a small, constant per-frame cost; this is
  // per mesh, and a hotspot with several primitives sums across all of them.
  hotspotSamplePointsPerMesh: 48,
  // A sneaker model like this one comes in as a couple dozen named parts,
  // but most of them are small trim (an eyelet, a seam, a tiny logo badge)
  // that make poor hotspots even with a perfectly tight hit rect — packed
  // together at this scale, that many small, constantly-overlapping boxes
  // just reads as visual noise ("the screen ripples") no matter how well
  // each one individually tracks. See filterHotspotsBySize: kept only if
  // its own bounding diagonal is at least this fraction of the single
  // largest part's diagonal — e.g. 0.4 keeps only parts at least 40% as
  // big as the biggest one, which in practice means the half-dozen-plus
  // major panels (sole, tongue, heel counter, toe, main uppers) survive
  // and the small trim pieces don't.
  hotspotMinSizeRatio: 0.4,
  // Hard ceiling on how many hotspots ever get created, applied after the
  // ratio filter below — a backstop for exports where dozens/hundreds of
  // parts end up close enough in size that the ratio filter alone doesn't
  // thin them out (e.g. a duplicated part repeated many times at ~the same
  // scale). Keeps whichever survivors are largest, up to this count.
  hotspotMaxCount: 8,
  // A part more than this many times the *median* part's bounding
  // diagonal is treated as broken/degenerate geometry, not a genuinely
  // huge panel, and excluded outright before the ratio filter above runs
  // — see the comment on filterHotspotsBySize for why a median-relative
  // cutoff instead of the naive max.
  hotspotOutlierMedianMultiple: 8,

  // How long a pointerleave waits, in ms, before actually clearing the
  // hovered hotspot — cancelled if the same marker re-enters within the
  // window. The marker's own hit rect is perfectly stable while hovered
  // (see hotspotFocusEasing below), so this is purely a safety margin for
  // the literal pixel edge of the shape; without it, a cursor resting
  // exactly on that edge could flicker enter/leave/enter every frame.
  hoverLeaveGraceMs: 110,
  // While a hotspot is hovered, both the constant idle spin and the
  // ambient cursor-follow wobble (see the render loop) ease down toward
  // fully stopped, and ease back up once you leave — so the part you're
  // deliberately pointing at holds still under the cursor instead of
  // slowly turning out from under it, without the motion actually cutting
  // off/resuming abruptly. Higher = faster ease.
  hotspotFocusEasing: 0.12,

  hotspotEmissiveIntensity: 0.5,
  // Hover zoom: reframes the camera around just the hovered object (see
  // updateCameraZoom), clamped to a gentler range than a literal best-fit
  // would give — a tight, precise fit read as too aggressive a zoom.
  zoomFillFraction: 0.4,
  zoomMargin: 1.2, // extra clearance (world units) kept between camera and surface
  // Distance is clamped to this fraction of the whole scene's diagonal,
  // regardless of how small or large the individual hovered object is.
  zoomMinDistanceRatio: 0.22,
  zoomMaxDistanceRatio: 0.62,
  zoomEasing: 0.07,
  // The approach direction's vertical component is clamped to at least
  // this (0 = never negative) — the sneaker's sole/underside geometry
  // isn't fully closed up, so letting the camera dip below a part's own
  // height to approach from underneath could expose the hollow interior.
  // Clamping keeps every approach level with or above the part, from the
  // outside.
  zoomMinApproachY: 0,
};

const stageEl = document.querySelector(".hero__stage");
const canvas = document.getElementById("scene");
const loadingEl = document.querySelector(".hero__loading");
const sliderEl = document.querySelector(".hero__rotate-slider");
const markerLayer = document.querySelector(".hotspot-layer");
const plaqueEl = document.getElementById("hotspotPlaque");
const plaqueTitleEl = document.getElementById("hotspotPlaqueTitle");
const plaqueThumbEl = document.getElementById("hotspotPlaqueThumb");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------------- */
/* Renderer / scene / camera                                              */
/* ---------------------------------------------------------------------- */

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(CONFIG.cameraFov, 1, 0.1, 100);
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();

// A second camera, kept perfectly in sync with `camera`'s framing (fov,
// aspect, near/far, base position) EXCEPT it never moves for the hover
// zoom — see updateCameraZoom. Hotspot markers are projected through this
// one instead of the live `camera`. Projecting them through the zooming
// camera was a feedback loop: hovering a marker moved the camera toward
// it, which shifted (or shrank/hid, via the facing-direction check) that
// same marker's screen rect out from under the cursor, firing
// pointerleave, snapping the zoom back out, which put the marker back
// under the cursor and fired pointerenter again — visible as rapid
// flicker/judder right as you hovered a hotspot. Keeping marker layout on
// a camera that only ever reflects the model's own rotation (never the
// hover-triggered dolly) removes the loop entirely.
const layoutCamera = new THREE.PerspectiveCamera(CONFIG.cameraFov, 1, 0.1, 100);
layoutCamera.position.copy(camera.position);
layoutCamera.lookAt(0, 0, 0);
layoutCamera.updateMatrixWorld();

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

const keyLight = new THREE.DirectionalLight(0xfff3e0, 1.4);
keyLight.position.set(3, 4, 5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xffe3cc, 0.5);
rimLight.position.set(-4, 2, -3);
scene.add(rimLight);

scene.add(new THREE.AmbientLight(0xffffff, 0.45));

function readCssColor(varName, fallbackHex) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  try {
    return value ? new THREE.Color(value) : new THREE.Color(fallbackHex);
  } catch {
    return new THREE.Color(fallbackHex);
  }
}

/* ---------------------------------------------------------------------- */
/* The object that gets rotated — either your model or the placeholder    */
/* ---------------------------------------------------------------------- */

const rig = new THREE.Group();
scene.add(rig);

let currentSize = new THREE.Vector3(2, 2, 2);
let baseCameraPosition = camera.position.clone();
let currentLookTarget = new THREE.Vector3(0, 0, 0);

// Populated once the real model loads.
let hotspotMeshes = []; // one representative node per clickable object (for its matrixWorld) — a Mesh for single-primitive objects, a Group for multi-primitive ones
let hotspotLocalBox = []; // that object's own bounding box, in its own local space — used for camera-zoom framing and the facing check, both of which want the full forgiving extent
let hotspotLocalPoints = []; // a sampled cloud of that object's actual vertices, in the same local space — used for the marker hit rect/outline instead of the box, so it hugs the real silhouette (see buildHotspots)
let hotspotMaterials = []; // every material belonging to that object (tinted together on hover)
let markerEls = []; // the invisible, click/hover-handling DOM button for each hotspot (positioned via layoutCamera — see updateHotspotMarkers)
let markerBoxEls = []; // the visible dashed/solid outline for each hotspot (positioned via the live, possibly-zooming camera, so it always lines up with what's actually on screen)
let stageWidth = 1;
let stageHeight = 1;

function buildPlaceholder() {
  const geometry = new THREE.TorusKnotGeometry(1, 0.34, 180, 24);
  const material = new THREE.MeshStandardMaterial({
    color: readCssColor("--muted", 0x7c7360),
    roughness: 0.88,
    metalness: 0.04,
  });
  return new THREE.Mesh(geometry, material);
}

function centerAndMeasure(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  object.position.sub(center);
  return size;
}

function frameCameraToSize(size) {
  const halfFovY = THREE.MathUtils.degToRad(camera.fov / 2);
  const halfFovX = Math.atan(Math.tan(halfFovY) * camera.aspect);

  const distForHeight = size.y / 2 / Math.tan(halfFovY);
  const distForWidth = size.x / 2 / Math.tan(halfFovX);

  let distance = Math.max(distForHeight, distForWidth) / CONFIG.fillFraction;
  distance += size.z / 2;

  camera.position.set(0, 0, distance);
  camera.near = Math.max(0.01, distance / 100);
  camera.far = distance * 4 + size.length();
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  baseCameraPosition.copy(camera.position);
  currentLookTarget.set(0, 0, 0);

  // Keep the marker-layout camera framed identically to the base (unzoomed)
  // view — see the comment where layoutCamera is created.
  layoutCamera.fov = camera.fov;
  layoutCamera.aspect = camera.aspect;
  layoutCamera.near = camera.near;
  layoutCamera.far = camera.far;
  layoutCamera.position.copy(baseCameraPosition);
  layoutCamera.lookAt(0, 0, 0);
  layoutCamera.updateProjectionMatrix();
  layoutCamera.updateMatrixWorld();
}

function getBoxCorners(box) {
  const { min, max } = box;
  return [
    new THREE.Vector3(min.x, min.y, min.z), new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(min.x, max.y, min.z), new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z), new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, max.z), new THREE.Vector3(max.x, max.y, max.z),
  ];
}

// Some of this exporter's materials carry extra UV channels (up to
// TEXCOORD_4) that this version of three.js's shader chunks can't declare,
// which fails that material's shader compile outright — nothing using it
// renders. Forcing textures to channel 0 and dropping the unused UV sets
// sidesteps the bug (channel 0 / TEXCOORD_0 still has correct coordinates
// for every material seen so far).
function forceUvChannelZero(material) {
  Object.keys(material).forEach((key) => {
    const value = material[key];
    if (value && value.isTexture) value.channel = 0;
  });
}
function removeExtraUvSets(geometry) {
  ["uv1", "uv2", "uv3", "uv4"].forEach((name) => {
    if (geometry.attributes[name]) geometry.deleteAttribute(name);
  });
}

/* Every mesh in the model gets its own material (a clone of the imported
   one if it had a texture, so the real look survives; a flat fallback if
   not) plus an ink-line edge overlay. Returns the full mesh list. */
function styleAllMeshes(root) {
  const meshes = [];
  const fallbackColor = readCssColor("--muted", 0x7c7360);
  root.traverse((child) => {
    if (!child.isMesh) return;
    const hasTexture = child.material && child.material.map;
    const material = hasTexture
      ? child.material.clone()
      : new THREE.MeshStandardMaterial({ color: fallbackColor, roughness: 0.88, metalness: 0.04 });
    material.emissiveIntensity = 0;
    if (hasTexture) forceUvChannelZero(material);
    removeExtraUvSets(child.geometry);
    child.material = material;

    const edges = new THREE.EdgesGeometry(child.geometry, 25);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: readCssColor("--ink", 0x1b1712), transparent: true, opacity: 0.35 })
    );
    line.raycast = () => {};
    child.add(line);

    meshes.push(child);
  });
  return meshes;
}

/* Samples up to CONFIG.hotspotSamplePointsPerMesh points from a mesh's
   actual vertex positions (evenly strided through the buffer, not a
   random subset), converted from that mesh's own local space into
   `child`'s local space via meshToChild — so every sampled point lands in
   the same space the caller stores everything else in. Sampling the real
   geometry instead of just using its 8 bounding-box corners is what makes
   the hit-test shape hug a curved/sprawling part (a shoelace looping
   around the shoe, a thin seam) rather than the full loose box a lace's
   own AABB would otherwise imply. */
function sampleLocalPoints(mesh, meshToChild) {
  const position = mesh.geometry.attributes.position;
  if (!position) return [];
  const total = position.count;
  const stride = Math.max(1, Math.floor(total / CONFIG.hotspotSamplePointsPerMesh));
  const points = [];
  const v = new THREE.Vector3();
  for (let i = 0; i < total; i += stride) {
    v.fromBufferAttribute(position, i).applyMatrix4(meshToChild);
    points.push(v.clone());
  }
  return points;
}

/* One hotspot per top-level object in the scene — the sneaker model comes
   in as ~20 separate named parts (sole, tongue, shoelace, eyelets, logo,
   seams, etc.) rather than one continuous mesh, so unlike a single merged
   surface there's no "shell" to filter out: every part here is a
   legitimate, separately clickable thing, wherever it sits on the shoe. */
function buildHotspots(root) {
  const hotspots = [];
  root.children.forEach((child) => {
    const meshesInChild = [];
    child.traverse((c) => {
      if (c.isMesh) meshesInChild.push(c);
    });
    if (meshesInChild.length === 0) return;

    // IMPORTANT: the reference transform used every frame (in
    // getHotspotWorldBox / updateHotspotMarkers / updateCameraZoom) has to
    // be this same `child`, not one of its descendant meshes — for a node
    // whose mesh has multiple primitives, three.js wraps them in a Group
    // and each primitive Mesh happens to sit at an identity offset from
    // it, so using the first mesh's matrixWorld instead of the group's
    // would work today, but only by coincidence of that specific case.
    // Storing `child` itself removes that fragility outright.
    const childInverse = new THREE.Matrix4().copy(child.matrixWorld).invert();

    const box = new THREE.Box3();
    const points = [];
    meshesInChild.forEach((m) => {
      m.geometry.computeBoundingBox();
      box.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld));

      // mesh-local → world → child-local, combined into one matrix so
      // sampleLocalPoints only has to apply it once per point.
      const meshToChild = childInverse.clone().multiply(m.matrixWorld);
      points.push(...sampleLocalPoints(m, meshToChild));
    });
    // box is in world space at import time — convert to local space
    // relative to `child` for consistent per-frame re-projection later.
    const localBox = box.clone().applyMatrix4(childInverse);

    hotspots.push({
      representative: child,
      box: localBox,
      // Fall back to the box's own corners for any part whose geometry
      // had no position attribute to sample (shouldn't happen for a real
      // mesh, but leaves nothing unclickable if it ever does).
      points: points.length > 0 ? points : getBoxCorners(localBox),
      materials: meshesInChild.map((m) => m.material),
    });
  });
  return hotspots;
}

// Drops the smaller trim parts (see CONFIG.hotspotMinSizeRatio), keeping
// only whichever hotspots are at least that fraction of the largest
// *normal* part's bounding diagonal. Order is preserved among survivors.
//
// "Largest normal part" is deliberately not just Math.max: some exports
// carry one degenerate part — a sliver of stray/duplicated geometry, or a
// helper mesh never meant to be seen — whose bounding box is wildly
// bigger than every real panel on the shoe (seen in practice: one part
// over 15x the next-largest). Sizing the whole filter off that single
// broken box would either keep only the broken part (ratio measured
// against it excludes everything real) or keep nothing (if it's excluded
// only after being counted as the max). So: first throw out anything more
// than hotspotOutlierMedianMultiple times the *median* diagonal — a
// median doesn't shift much for one outlier, unlike a max — then size the
// real filter off whatever's left.
function filterHotspotsBySize(hotspots) {
  if (hotspots.length === 0) return hotspots;
  const diag = (h) => h.box.getSize(new THREE.Vector3()).length();
  const diags = hotspots.map(diag);

  const sorted = [...diags].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const outlierCeiling = median * CONFIG.hotspotOutlierMedianMultiple;

  const normal = hotspots.filter((h, i) => median <= 0 || diags[i] <= outlierCeiling);
  const normalDiags = normal.map(diag);
  const maxDiag = Math.max(...normalDiags, 0);
  if (maxDiag <= 0) return normal;

  const threshold = maxDiag * CONFIG.hotspotMinSizeRatio;
  const bySize = normal.filter((h) => diag(h) >= threshold);
  if (bySize.length <= CONFIG.hotspotMaxCount) return bySize;

  // Still too many (a lot of parts sitting at similar sizes) — keep only
  // the largest CONFIG.hotspotMaxCount, in their original relative order
  // rather than sorted, so assignment order (see buildProjectAssignments)
  // isn't scrambled by this step.
  const keep = new Set(
    [...bySize].sort((a, b) => diag(b) - diag(a)).slice(0, CONFIG.hotspotMaxCount)
  );
  return bySize.filter((h) => keep.has(h));
}

function buildProjectAssignments(count) {
  return Array.from({ length: count }, (_, i) => PROJECTS[i % PROJECTS.length]);
}

function createMarkers(count) {
  markerLayer.innerHTML = "";
  markerBoxEls = [];
  const assignments = buildProjectAssignments(count);
  markerEls = assignments.map((project, i) => {
    // The visible outline. Purely decorative (pointer-events: none) — see
    // updateHotspotMarkers for why this is positioned separately from the
    // button below, via the live camera instead of the stable one.
    const box = document.createElement("span");
    box.className = "hotspot-marker__box";
    box.hidden = true;
    markerLayer.appendChild(box);
    markerBoxEls.push(box);

    // The actual clickable/hoverable element — invisible, positioned via
    // the stable layoutCamera so hovering it can never move it out from
    // under the cursor (see the layoutCamera comment near its declaration).
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hotspot-marker";
    btn.setAttribute("aria-label", `View ${project.title}`);
    btn.hidden = true;
    btn.addEventListener("pointerenter", () => {
      if (hasRealInteraction) activateHotspot(i, project);
    });
    btn.addEventListener("pointermove", (e) => positionPlaque(e.clientX, e.clientY));
    btn.addEventListener("pointerleave", () => requestHotspotLeave(i));
    btn.addEventListener("focus", () => {
      if (hasRealInteraction) activateHotspot(i, project, true);
    });
    btn.addEventListener("blur", () => requestHotspotLeave(i));
    btn.addEventListener("click", () => {
      window.location.href = projectUrl(project);
    });
    markerLayer.appendChild(btn);
    return btn;
  });
  return assignments;
}

let hoveredHotspot = -1;
let hoverLeaveTimer = null;

function clearHotspotVisuals(index) {
  if (index === -1) return;
  (hotspotMaterials[index] || []).forEach((m) => { m.emissiveIntensity = 0; });
  markerBoxEls[index]?.classList.remove("is-active");
}

// Sets the hovered hotspot, immediately — cancels any pending leave (its
// own, or a still-active neighbor's, see requestHotspotLeave) rather than
// waiting on it, so switching directly from one real hotspot to another
// stays instant. Only the "leaving to nothing" case gets a grace window.
function activateHotspot(index, project, isKeyboard = false) {
  if (hoverLeaveTimer !== null) {
    clearTimeout(hoverLeaveTimer);
    hoverLeaveTimer = null;
  }
  if (hoveredHotspot !== -1 && hoveredHotspot !== index) clearHotspotVisuals(hoveredHotspot);
  hoveredHotspot = index;

  (hotspotMaterials[index] || []).forEach((m) => {
    m.emissive.copy(readCssColor("--accent", 0xa23a2c));
    m.emissiveIntensity = CONFIG.hotspotEmissiveIntensity;
  });
  markerBoxEls[index]?.classList.add("is-active");
  plaqueTitleEl.textContent = project.title;
  plaqueThumbEl.src = coverSrc(project);
  plaqueThumbEl.alt = project.title;
  plaqueEl.classList.add("is-visible");
  if (isKeyboard) {
    const r = markerEls[index].getBoundingClientRect();
    positionPlaque(r.left + r.width / 2, r.top);
  }
}

// Doesn't clear the hover immediately — waits CONFIG.hoverLeaveGraceMs,
// cancelled by activateHotspot if the same marker re-enters within that
// window (see the CONFIG comment: the marker itself holds still while
// hovered, so this is just a margin for the cursor sitting exactly on its
// edge, not a fix for the marker moving).
function requestHotspotLeave(index) {
  if (hoveredHotspot !== index) return; // already superseded by a different hotspot — nothing to do
  if (hoverLeaveTimer !== null) clearTimeout(hoverLeaveTimer);
  hoverLeaveTimer = setTimeout(() => {
    hoverLeaveTimer = null;
    hoveredHotspot = -1;
    clearHotspotVisuals(index);
    plaqueEl.classList.remove("is-visible");
  }, CONFIG.hoverLeaveGraceMs);
}

function positionPlaque(x, y) {
  plaqueEl.style.left = `${x + 18}px`;
  plaqueEl.style.top = `${y + 18}px`;
}

function loadModel() {
  const loader = new GLTFLoader();

  loader.load(
    encodeURI(CONFIG.modelPath),
    (gltf) => {
      const object = gltf.scene;
      currentSize = centerAndMeasure(object);
      styleAllMeshes(object); // materials/edges first, so hotspot.materials below point at the final (cloned) materials
      rig.add(object);
      // centerAndMeasure() just moved `object`, and buildHotspots() below
      // needs every descendant's matrixWorld to reflect that move — force
      // it here instead of assuming some earlier call already did.
      object.updateMatrixWorld(true);

      const hotspots = filterHotspotsBySize(buildHotspots(object));
      hotspotMeshes = hotspots.map((h) => h.representative);
      hotspotLocalBox = hotspots.map((h) => h.box);
      hotspotLocalPoints = hotspots.map((h) => h.points);
      hotspotMaterials = hotspots.map((h) => h.materials);

      createMarkers(hotspots.length);
      frameCameraToSize(currentSize);
      if (loadingEl) loadingEl.hidden = true;
      console.info(`[hero-3d] Loaded ${CONFIG.modelPath} — ${hotspots.length} clickable objects`);
    },
    (progress) => {
      if (loadingEl && progress.total) {
        loadingEl.textContent = `Loading scene… ${Math.round((progress.loaded / progress.total) * 100)}%`;
      }
    },
    (err) => {
      console.info(`[hero-3d] Couldn't load "${CONFIG.modelPath}" — using the placeholder shape.`, err);
      const placeholder = buildPlaceholder();
      currentSize = centerAndMeasure(placeholder);
      rig.add(placeholder);
      frameCameraToSize(currentSize);
      if (loadingEl) loadingEl.hidden = true;
    }
  );
}

loadModel();

/* ---------------------------------------------------------------------- */
/* Rotation: drag (deliberate) + slider (deliberate, synced) + cursor      */
/* (small ambient wobble, only when not dragging)                        */
/* ---------------------------------------------------------------------- */

let sliderTargetY = 0;
let sliderCurrentY = 0;
let hoverTargetY = 0;
let hoverCurrentY = 0;
let idleAngle = 0;
// Eases toward 0 while a hotspot is hovered and back to 1 once you leave —
// see CONFIG.hotspotFocusEasing and the render loop below. Scales down the
// idle spin and the ambient cursor-wobble (never the deliberate drag/slider
// rotation, which always fully overrides both anyway) so the part you're
// pointing at holds still under the cursor instead of slowly turning away
// from it.
let hotspotFocus = 1;

function setRotationTarget(radians) {
  sliderTargetY = radians;
  if (sliderEl) sliderEl.value = String(Math.round(THREE.MathUtils.radToDeg(radians)));
}

if (sliderEl) {
  sliderEl.addEventListener("input", () => {
    sliderTargetY = THREE.MathUtils.degToRad(Number(sliderEl.value));
  });
}

// Click-and-drag directly on the model to spin it.
let isDragging = false;
let dragStartX = 0;
let dragStartRotation = 0;

canvas.addEventListener("pointerdown", (event) => {
  isDragging = true;
  dragStartX = event.clientX;
  dragStartRotation = sliderTargetY;
  canvas.classList.add("is-dragging");
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", (event) => {
  if (!isDragging) return;
  const deltaX = (event.clientX - dragStartX) / stageWidth;
  setRotationTarget(dragStartRotation + deltaX * CONFIG.dragSensitivity);
});
function endDrag() {
  isDragging = false;
  canvas.classList.remove("is-dragging");
}
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

// Whether the visitor has done *something* — moved the pointer or pressed
// a key — since the page loaded. A real "pointermove" only ever fires on
// actual movement, never just because the cursor happens to already be
// resting somewhere; a real "keydown" only fires on an actual keypress,
// never just because focus landed somewhere. Both hotspot activation
// paths are gated on this (see createMarkers' pointerenter/focus
// listeners below): without it, a cursor left sitting over the stage
// from before the page finished loading, or focus placed on a hotspot
// button programmatically (assistive tooling walking the page, a
// same-origin script, browser automation) rather than by an actual Tab
// press, could hover-activate and hover-zoom into a hotspot nobody
// actually pointed at or tabbed to.
let hasRealInteraction = false;
window.addEventListener("keydown", () => { hasRealInteraction = true; }, { passive: true });

function onPointerMove(event) {
  hasRealInteraction = true;
  if (isDragging) return; // dragging already drives rotation directly
  const rect = stageEl.getBoundingClientRect();
  const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  hoverTargetY = THREE.MathUtils.clamp(nx, -1, 1) * CONFIG.hoverRotationMax;
}
window.addEventListener("pointermove", onPointerMove, { passive: true });
window.addEventListener("pointerleave", () => {
  hoverTargetY = 0;
});

/* ---------------------------------------------------------------------- */
/* Resize                                                                  */
/* ---------------------------------------------------------------------- */

function resize() {
  stageWidth = stageEl.clientWidth;
  stageHeight = stageEl.clientHeight;
  renderer.setSize(stageWidth, stageHeight, false);
  camera.aspect = stageWidth / stageHeight;
  frameCameraToSize(currentSize);
}
window.addEventListener("resize", resize);
resize();

/* ---------------------------------------------------------------------- */
/* Per-frame: marker projection + hover zoom                              */
/* ---------------------------------------------------------------------- */

// Reused every call below instead of allocating a fresh Vector3 per sampled
// point per frame — projectPointsToScreen can run over a couple thousand
// points a frame across every hotspot, and this keeps that GC-free.
const projectScratch = new THREE.Vector3();

// Projects one hotspot's sampled local-space points (see buildHotspots)
// through `cam`, returning their 2D screen-space bounding rect (in px)
// plus whether any point landed in front of the camera. Shared by the
// stable hit-area projection and the live visual one below — same math,
// different camera. Using the actual sampled silhouette instead of a
// bounding box's 8 corners is what lets the marker hug a curved/sprawling
// part instead of floating over its full loose AABB.
function projectPointsToScreen(mesh, points, cam) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let anyInFront = false;
  for (const localPoint of points) {
    const ndc = projectScratch.copy(localPoint).applyMatrix4(mesh.matrixWorld).project(cam);
    if (ndc.z > 1 || ndc.z < -1) continue;
    anyInFront = true;
    const sx = (ndc.x * 0.5 + 0.5) * stageWidth;
    const sy = (1 - (ndc.y * 0.5 + 0.5)) * stageHeight;
    if (sx < minX) minX = sx;
    if (sx > maxX) maxX = sx;
    if (sy < minY) minY = sy;
    if (sy > maxY) maxY = sy;
  }
  return { minX, minY, maxX, maxY, anyInFront };
}

// Scales a projected AABB from its own center — see CONFIG.markerScale —
// then enforces the minimum clickable/visible size.
function shapeMarkerRect(rect) {
  const cx0 = (rect.minX + rect.maxX) / 2;
  const cy0 = (rect.minY + rect.maxY) / 2;
  let w = (rect.maxX - rect.minX) * CONFIG.markerScale;
  let h = (rect.maxY - rect.minY) * CONFIG.markerScale;
  let minX = cx0 - w / 2;
  let minY = cy0 - h / 2;
  if (w < CONFIG.markerMinSize) {
    minX = cx0 - CONFIG.markerMinSize / 2;
    w = CONFIG.markerMinSize;
  }
  if (h < CONFIG.markerMinSize) {
    minY = cy0 - CONFIG.markerMinSize / 2;
    h = CONFIG.markerMinSize;
  }
  return { minX, minY, w, h };
}

// Given the current frame's shaped marker rects (see shapeMarkerRect),
// nudges/shrinks any that still overlap so every hotspot keeps some
// exclusive, clickable area — without this, several close-together
// objects (e.g. the ground-clutter cluster: bins, pile, cardboard) project
// to boxes that stack on top of each other, and only the topmost in DOM
// order can ever be clicked.
//
// Two passes, each bounded so a marker never drifts or shrinks far enough
// to stop reading as "that object's" marker:
//   1. Push overlapping pairs apart along whichever axis needs the least
//      movement to separate them (standard AABB separation), clamped to
//      CONFIG.markerDeclutterMaxDrift × the marker's own size, measured
//      from where it actually projects (its "anchor").
//   2. Whatever's still overlapping once every marker has used up its
//      drift budget gets shrunk instead, by CONFIG.markerDeclutterShrink
//      per pass, down to CONFIG.markerMinSize.
//
// `items` is mutated in place: each gets `cx`/`cy` (final center) and
// `w`/`h` (final size, ≤ its original rawW/rawH) written onto it. Any item
// with `isHovered` true is treated as immovable/unshrinkable — its
// neighbor absorbs the full push or shrink instead — so hovering a marker
// can never make declutter drift or shrink it out from under the cursor
// just because something next to it also needs room that frame.
function declutterMarkerRects(items) {
  if (items.length < 2) return;

  const maxDrift = (item) => Math.max(item.rawW, item.rawH) * CONFIG.markerDeclutterMaxDrift;

  const clampToAnchor = (item) => {
    if (item.isHovered) return;
    const dx = item.cx - item.anchorX;
    const dy = item.cy - item.anchorY;
    const drift = Math.hypot(dx, dy);
    const max = maxDrift(item);
    if (drift > max && drift > 0) {
      const k = max / drift;
      item.cx = item.anchorX + dx * k;
      item.cy = item.anchorY + dy * k;
    }
  };

  for (let iter = 0; iter < CONFIG.markerDeclutterIterations; iter++) {
    let anyOverlap = false;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j];
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const overlapX = (a.w + b.w) / 2 - Math.abs(dx);
        const overlapY = (a.h + b.h) / 2 - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;
        anyOverlap = true;
        // Normally split the push 50/50; if one side is hovered, give it
        // none of the movement and let the other absorb all of it.
        const aShare = a.isHovered ? 0 : b.isHovered ? 1 : 0.5;
        const bShare = 1 - aShare;
        if (overlapX < overlapY) {
          const dir = dx >= 0 ? 1 : -1;
          a.cx -= (overlapX + 1) * aShare * dir;
          b.cx += (overlapX + 1) * bShare * dir;
        } else {
          const dir = dy >= 0 ? 1 : -1;
          a.cy -= (overlapY + 1) * aShare * dir;
          b.cy += (overlapY + 1) * bShare * dir;
        }
        clampToAnchor(a);
        clampToAnchor(b);
      }
    }
    if (!anyOverlap) return;
  }

  for (let iter = 0; iter < CONFIG.markerDeclutterIterations; iter++) {
    let anyOverlap = false;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j];
        const overlapX = (a.w + b.w) / 2 - Math.abs(b.cx - a.cx);
        const overlapY = (a.h + b.h) / 2 - Math.abs(b.cy - a.cy);
        if (overlapX <= 0 || overlapY <= 0) continue;
        anyOverlap = true;
        if (!a.isHovered) {
          a.w = Math.max(CONFIG.markerMinSize, a.w * CONFIG.markerDeclutterShrink);
          a.h = Math.max(CONFIG.markerMinSize, a.h * CONFIG.markerDeclutterShrink);
        }
        if (!b.isHovered) {
          b.w = Math.max(CONFIG.markerMinSize, b.w * CONFIG.markerDeclutterShrink);
          b.h = Math.max(CONFIG.markerMinSize, b.h * CONFIG.markerDeclutterShrink);
        }
      }
    }
    if (!anyOverlap) return;
  }
}

function updateHotspotMarkers() {
  // Pass 1: figure out each hotspot's visibility and, for the visible
  // ones, its raw (pre-declutter) stable hit rect — gathered up front
  // because decluttering needs every marker's rect at once, not one at a
  // time. `frame[i]` stays null for hidden hotspots.
  const frame = [];
  const declutterItems = [];

  for (let i = 0; i < hotspotMeshes.length; i++) {
    const mesh = hotspotMeshes[i];
    const box = hotspotLocalBox[i];
    const points = hotspotLocalPoints[i];
    const btn = markerEls[i];
    if (!btn) { frame.push(null); continue; }

    // The clickable area's position AND its show/hide decision both come
    // from the stable layoutCamera — never the live, possibly-zooming
    // `camera` — so hovering a marker can't move or hide the very
    // element that's being hovered. See the layoutCamera comment above.
    const stableRect = projectPointsToScreen(mesh, points, layoutCamera);

    // The facing/visibility check still reasons about the full bounding
    // box's centroid, not the sampled points — a forgiving "is this part
    // roughly facing the camera" signal is what's wanted here, same as
    // before this file started hugging the marker shape more tightly.
    const centroidWorld = box.getCenter(new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);
    // If an object's centroid lands too close to the scene origin,
    // normalizing it is numerically unstable (a near-zero-length vector's
    // direction is mostly noise), which would make `facing` flicker at
    // random — treat that case as "always facing" instead of guessing.
    const centroidLenSq = centroidWorld.lengthSq();
    let facing = 1;
    if (centroidLenSq > 1e-6) {
      const outward = centroidWorld.clone().normalize();
      const viewDir = layoutCamera.position.clone().sub(centroidWorld).normalize();
      facing = outward.dot(viewDir);
    }

    const onScreen =
      stableRect.maxX > 0 && stableRect.minX < stageWidth && stableRect.maxY > 0 && stableRect.minY < stageHeight;
    const visible = stableRect.anyInFront && facing > CONFIG.facingThreshold && onScreen;

    if (!visible) {
      btn.hidden = true;
      if (markerBoxEls[i]) markerBoxEls[i].hidden = true;
      frame.push(null);
      continue;
    }

    const hitShape = shapeMarkerRect(stableRect);
    const item = {
      cx: hitShape.minX + hitShape.w / 2,
      cy: hitShape.minY + hitShape.h / 2,
      w: hitShape.w,
      h: hitShape.h,
      rawW: hitShape.w,
      rawH: hitShape.h,
      isHovered: i === hoveredHotspot,
    };
    item.anchorX = item.cx;
    item.anchorY = item.cy;
    declutterItems.push(item);
    frame.push({ mesh, points, item });
  }

  // Pass 2: resolve overlaps across every visible marker at once.
  declutterMarkerRects(declutterItems);

  // Pass 3: apply the (now decluttered) hit rect to each button, and the
  // same positional/size correction carried over to the live-camera
  // projection for its visible outline — so the outline still matches
  // where the clickable area actually ended up instead of drifting back
  // on top of a neighbor.
  for (let i = 0; i < hotspotMeshes.length; i++) {
    const meta = frame[i];
    const btn = markerEls[i];
    const boxEl = markerBoxEls[i];
    if (!meta || !btn) continue;

    const { mesh, points, item } = meta;
    btn.hidden = false;
    btn.style.left = `${item.cx - item.w / 2}px`;
    btn.style.top = `${item.cy - item.h / 2}px`;
    btn.style.width = `${item.w}px`;
    btn.style.height = `${item.h}px`;

    if (!boxEl) continue;

    // The visible outline tracks the LIVE camera instead, so it always
    // lines up with the object as actually rendered (including while the
    // hover zoom is dollying in on it). It's pointer-events: none, so
    // letting it move freely here can't reintroduce the feedback loop
    // that keeping the hit area on the live camera caused.
    const liveRect = projectPointsToScreen(mesh, points, camera);
    if (!liveRect.anyInFront) {
      boxEl.hidden = true;
      continue;
    }
    const liveShapeRaw = shapeMarkerRect(liveRect);
    const dx = item.cx - item.anchorX;
    const dy = item.cy - item.anchorY;
    const scaleW = item.rawW > 0 ? item.w / item.rawW : 1;
    const scaleH = item.rawH > 0 ? item.h / item.rawH : 1;
    const liveW = liveShapeRaw.w * scaleW;
    const liveH = liveShapeRaw.h * scaleH;
    const liveCx = liveShapeRaw.minX + liveShapeRaw.w / 2 + dx;
    const liveCy = liveShapeRaw.minY + liveShapeRaw.h / 2 + dy;
    boxEl.hidden = false;
    boxEl.style.left = `${liveCx - liveW / 2}px`;
    boxEl.style.top = `${liveCy - liveH / 2}px`;
    boxEl.style.width = `${liveW}px`;
    boxEl.style.height = `${liveH}px`;
  }
}

function isFiniteVector3(v) {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}

// World-space AABB of one hotspot, recomputed every call since the model
// (and therefore the mesh's matrixWorld) keeps turning.
function getHotspotWorldBox(index) {
  const mesh = hotspotMeshes[index];
  const corners = getBoxCorners(hotspotLocalBox[index]).map((c) => c.applyMatrix4(mesh.matrixWorld));
  return new THREE.Box3().setFromPoints(corners);
}

// Reframes the camera around just the hovered object — fit-to-frame math
// like frameCameraToSize, aimed at a small world-space box instead of the
// whole scene, with the result clamped to a proportion of the whole
// scene's scale (see CONFIG.zoomMinDistanceRatio/zoomMaxDistanceRatio).
// That clamp is deliberately generous now (a gentler zoom reads better
// than a tight best-fit), and it's also what stops a small or oddly-shaped
// object from pulling the camera in dangerously close, which previously
// read as a sudden extreme zoom and caused lag. The approach direction is
// also clamped to never dip below horizontal (CONFIG.zoomMinApproachY),
// since this model has no underside geometry — without that, hovering an
// object low in the scene could pull the camera under it and look up into
// the hollow interior. Every step is guarded against non-finite results,
// with a final self-heal back to the base view if anything still slips
// through — a `lerp` toward a NaN target corrupts the camera permanently
// otherwise, since any math with NaN afterward stays NaN.
function updateCameraZoom() {
  let targetPos = baseCameraPosition;
  let targetLook = new THREE.Vector3(0, 0, 0);

  if (hoveredHotspot !== -1 && hotspotMeshes[hoveredHotspot]) {
    const worldBox = getHotspotWorldBox(hoveredHotspot);
    const size = worldBox.getSize(new THREE.Vector3());
    const center = worldBox.getCenter(new THREE.Vector3());

    const overallDiagonal = currentSize.length() || 1;
    const minDistance = Math.max(overallDiagonal * CONFIG.zoomMinDistanceRatio, camera.near * 20);
    const maxDistance = overallDiagonal * CONFIG.zoomMaxDistanceRatio;

    const halfFovY = THREE.MathUtils.degToRad(camera.fov / 2);
    const halfFovX = Math.atan(Math.tan(halfFovY) * camera.aspect);
    const distForHeight = size.y / 2 / Math.tan(halfFovY);
    const distForWidth = size.x / 2 / Math.tan(halfFovX);

    let distance = Math.max(distForHeight, distForWidth) / CONFIG.zoomFillFraction + size.z / 2 + CONFIG.zoomMargin;
    if (!Number.isFinite(distance)) distance = minDistance;
    distance = THREE.MathUtils.clamp(distance, minDistance, maxDistance);

    const outward = center.lengthSq() > 1e-6 ? center.clone().normalize() : baseCameraPosition.clone().normalize();
    // Never approach from below — this model isn't capped underneath, so a
    // camera position lower than the object looks up into open geometry.
    // Clamping the vertical component (then renormalizing, since clamping
    // a component of a unit vector leaves it no longer unit length) keeps
    // every approach angle level with or above the object instead.
    if (outward.y < CONFIG.zoomMinApproachY) {
      outward.y = CONFIG.zoomMinApproachY;
      if (outward.lengthSq() > 1e-6) outward.normalize();
    }

    const candidatePos = center.clone().addScaledVector(outward, distance);
    if (isFiniteVector3(candidatePos) && isFiniteVector3(center)) {
      targetPos = candidatePos;
      targetLook = center;
    }
  }

  camera.position.lerp(targetPos, CONFIG.zoomEasing);
  currentLookTarget.lerp(targetLook, CONFIG.zoomEasing);

  if (!isFiniteVector3(camera.position)) {
    camera.position.copy(baseCameraPosition);
    currentLookTarget.set(0, 0, 0);
  }

  camera.lookAt(currentLookTarget);
  camera.updateMatrixWorld();
}

/* ---------------------------------------------------------------------- */
/* Render loop                                                             */
/* ---------------------------------------------------------------------- */

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  if (prefersReducedMotion) {
    rig.rotation.set(0, sliderTargetY, 0);
  } else {
    const focusTarget = hoveredHotspot === -1 ? 1 : 0;
    hotspotFocus += (focusTarget - hotspotFocus) * CONFIG.hotspotFocusEasing;

    sliderCurrentY += (sliderTargetY - sliderCurrentY) * CONFIG.rotationEasing;
    hoverCurrentY += (hoverTargetY - hoverCurrentY) * CONFIG.rotationEasing;
    idleAngle += CONFIG.idleSpinSpeed * dt * hotspotFocus;
    rig.rotation.y = sliderCurrentY + hoverCurrentY * hotspotFocus + idleAngle;
    rig.rotation.x = 0;
  }
  rig.updateMatrixWorld(true);

  updateCameraZoom();
  if (hotspotMeshes.length > 0) updateHotspotMarkers();

  renderer.render(scene, camera);
}
animate();

/* ==========================================================================
   NOTES

   - This model is a set of distinct named parts (sole, tongue, laces,
     eyelets, logo badges, seams, etc.) rather than one continuous
     surface. buildHotspots() turns every part with geometry into a
     candidate hotspot, but filterHotspotsBySize() then drops whichever
     ones are small relative to the largest part (CONFIG.hotspotMinSizeRatio)
     — trim like eyelets, seams, and small logo badges make cramped,
     constantly-overlapping hotspots even with a perfectly tight hit rect,
     and a shoe-sized model reads as noisy/cluttered with all ~20 wired
     up at once. What survives is the half-dozen-plus major panels. Which
     project shows behind which surviving part is still just assignment
     order (see js/works-data.js), not a deliberate curatorial choice.

   - A marker's hit rect and visible outline both come from a sampled
     cloud of that part's actual vertices (buildHotspots'
     sampleLocalPoints), not its bounding box's 8 corners — a part that
     loops or sprawls through space (a shoelace, a seam) has a bounding
     box far bigger than what's actually visible there, which used to
     leave its marker floating over empty air. Sampling the real geometry
     every frame instead keeps the box on the part itself at any angle.

   - Flicker on hover (a marker rapidly entering/leaving as you point at
     it) had two causes, both addressed directly rather than papered
     over: (1) the model's own ambient motion — idle spin plus the
     cursor-follow wobble — never stopped, so even a perfectly still
     cursor was resting on a target that kept slowly drifting out from
     under it; hotspotFocus (see the render loop) eases both to a stop
     while a hotspot is hovered, and back up once you leave. (2) densely
     packed neighboring parts competing for the same screen space via
     declutterMarkerRects; the currently-hovered item is now exempt from
     being pushed or shrunk by that pass (its `isHovered` flag), so a
     neighbor claiming room can't nudge the one you're actually pointing
     at. requestHotspotLeave's short grace window (CONFIG.hoverLeaveGraceMs)
     is only a last-pixel-of-the-shape safety margin on top of those two
     fixes, not a substitute for them.

   - Hotspot markers are plain DOM <button> elements repositioned every
     frame from a 3D→2D projection of each object's bounding box, rather
     than raycasting into the 3D scene on click/hover — that gives crisp,
     always-visible-if-faint rectangular click zones instead of fuzzy
     per-triangle hit-testing, and keeps them fully keyboard-accessible
     since they're real buttons, not canvas pixels.

   - This page uses ES module imports and fetches the .glb over HTTP, which
     browsers block from a bare file:// path (CORS). Serve the folder with
     any static server, e.g. `npx serve .` or `python -m http.server 8000`,
     then open the printed http://localhost:... address. The file is
     ~74MB, so expect a real loading delay on anything other than
     localhost — the stage shows a loading percentage while it fetches.
   ========================================================================== */
