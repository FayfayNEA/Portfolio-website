const ASSET_PATH = "./assets/";
const DESIGN_WIDTH = 1024;
const DESIGN_HEIGHT = 580;
const SCENE_Y_SHIFT_PERCENT = -54;
/** Extra leftward shift (px) so the map isn’t clipped on the right */
const SCENE_SHIFT_LEFT_EXTRA_PX = 20;

const portfolioAssets = [
  { name: "Jaguar", filename: "panther reflection.png", link: "about", hoverLabel: "About" },
  { name: "Rocks_Foliage", filename: "rock with leaves.png", link: "Jahn", hoverLabel: "Jahn" },
  {
    name: "Concrete_Block",
    filename: "colored block.png",
    link: "architecture",
    hoverLabel: "Architecture"
  },
  { name: "Large_Tree", filename: "bush tree.png", link: "branding", hoverLabel: "Branding" },
  { name: "Radio", filename: "radio color.png", link: "contact", hoverLabel: "Contact" },
  { name: "Orb", filename: "orb.png", link: "buddy", hoverLabel: "Buddy" },
  { name: "Screen_Tablet", filename: "glowing tablet.png", link: "eidolon", hoverLabel: "Eidolon" },
  {
    name: "Nether_Portal",
    filename: "nether portal.png",
    link: "nightterrors",
    hoverLabel: "Nightterrors"
  },
  { name: "Money_Tree", filename: "colored money tree.png", link: "etrade", hoverLabel: "E-Trade" }
];

// Jaguar, Rocks_Foliage, Concrete_Block, Large_Tree, Radio, Orb, Screen_Tablet, Nether_Portal, Money_Tree
const sceneLayout = [
  { top: 290, left: 537, width: 132 },
  { top: 389, left: 666, width: 80 },
  { top: 256, left: 653, width: 109 },
  { top: 126, left: 648, width: 230 },
  { top: 434, left: 56, width: 170 },
  { top: 367, left: 242, width: 63 },
  { top: 588, left: 370, width: 180 },
  { top: 233, left: 230, width: 138 },
  { top: 344, left: 349, width: 150 }
];

const layerByAsset = { Concrete_Block: 3, Large_Tree: 3, Jaguar: 5 };
const animationClassByAsset = {
  Large_Tree: "anim-sway",
  Money_Tree: "anim-sway",
  Rocks_Foliage: "anim-sway",
  Orb: "anim-orb-drift",
  Jaguar: "anim-breathe-dramatic",
  Concrete_Block: "anim-breathe"
};

const topOnlySwayAssets = new Set(["Large_Tree", "Money_Tree", "Rocks_Foliage"]);
const swaySplitByAsset = { Large_Tree: "60%", Money_Tree: "56%", Rocks_Foliage: "62%" };

const DUST_PARTICLE_COUNT = 18;
const LEAF_FILENAMES = ["leaf 1.png", "leaf 2.png", "leaf 3.png", "leaf 4.png", "leaf 5.png"];
const LEAF_SPIRAL_CLASSES = [
  "leaf-spiral-1",
  "leaf-spiral-2",
  "leaf-spiral-3",
  "leaf-spiral-4",
  "leaf-spiral-5"
];
const LEAF_ZONE_DEFINITIONS = [
  { sceneIndex: 1, heightPx: 92 },
  { sceneIndex: 3, heightPx: 268 },
  { sceneIndex: 8, heightPx: 128 }
];
const LEAF_COUNT_PER_ZONE = [4, 5, 4];

const SCREEN_TABLET_OVERLAY_FILENAME = "green layer.png";
const NETHER_PORTAL_OVERLAY_FILENAME = "purple portal.png";

const BIRD_FLIGHT_FRAMES = [
  "bird in flight 1.png",
  "bird in flight 2.png",
  "bird in flight 3.png"
];

const BIRD_CATCH_STORAGE_KEY = "birdCatchesEver";
/** Slower = longer linear move (seconds); end timer should run just after motion finishes */
const BIRD_FLIGHT_DURATION_SEC = 8;
const BIRD_FLIGHT_END_MS = Math.round(BIRD_FLIGHT_DURATION_SEC * 1000) + 180;

function getBirdCatchesEver() {
  try {
    const v = localStorage.getItem(BIRD_CATCH_STORAGE_KEY);
    const n = parseInt(v ?? "0", 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function incrementBirdCatchesEver() {
  const next = getBirdCatchesEver() + 1;
  try {
    localStorage.setItem(BIRD_CATCH_STORAGE_KEY, String(next));
  } catch {
    /* ignore quota / private mode */
  }
  return next;
}

function birdAssetUrl(filename) {
  return `${ASSET_PATH}${encodeURI(filename)}`;
}

BIRD_FLIGHT_FRAMES.forEach((name) => {
  const pre = new Image();
  pre.src = birdAssetUrl(name);
});

const viewport = document.getElementById("spatial-viewport");
const scene = document.createElement("div");
scene.id = "spatial-scene";
scene.style.width = `${DESIGN_WIDTH}px`;
scene.style.height = `${DESIGN_HEIGHT}px`;
viewport.appendChild(scene);

const BRANDING_TREE_SCENE_INDEX = portfolioAssets.findIndex((a) => a.name === "Large_Tree");

function getBrandingTreeScreenRect() {
  const tree = document.getElementById("branding-tree-anchor");
  if (!tree) return null;
  const r = tree.getBoundingClientRect();
  if (r.width >= 4 && r.height >= 4) return r;
  const layout = sceneLayout[BRANDING_TREE_SCENE_INDEX];
  if (!layout) return null;
  const sr = scene.getBoundingClientRect();
  const s = sr.width / DESIGN_WIDTH;
  return {
    left: sr.left + layout.left * s,
    top: sr.top + layout.top * s,
    width: layout.width * s,
    height: Math.max(48, layout.width * s * 1.05)
  };
}

const hoverBirdRoot = document.createElement("div");
hoverBirdRoot.className = "hover-bird";
hoverBirdRoot.setAttribute("aria-hidden", "true");
const hoverBirdImg = document.createElement("img");
hoverBirdImg.alt = "";
hoverBirdImg.decoding = "async";
hoverBirdImg.draggable = false;
hoverBirdImg.src = birdAssetUrl(BIRD_FLIGHT_FRAMES[0]);
hoverBirdRoot.appendChild(hoverBirdImg);
const birdSpeechBubble = document.createElement("div");
birdSpeechBubble.className = "bird-catch-bubble";
birdSpeechBubble.textContent = "I hope you have an amazing day";
birdSpeechBubble.setAttribute("aria-hidden", "true");
hoverBirdRoot.appendChild(birdSpeechBubble);
document.body.appendChild(hoverBirdRoot);
hoverBirdRoot.style.left = "-9999px";
hoverBirdRoot.style.top = "-9999px";

let birdFlightActive = false;
let birdFrameIntervalId = null;
let birdFlightEndTimer = null;
let birdCooldownUntil = 0;
let birdCatchConsumedThisFlight = false;
/** Only one bird flight per full page load (until refresh) */
let birdFlightAllowedOncePerLoad = true;

function hideBirdSpeechBubble() {
  birdSpeechBubble.classList.remove("is-visible");
  birdSpeechBubble.setAttribute("aria-hidden", "true");
}

function catchBird(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (!birdFlightActive || birdCatchConsumedThisFlight) return;

  birdCatchConsumedThisFlight = true;
  if (birdFrameIntervalId !== null) {
    window.clearInterval(birdFrameIntervalId);
    birdFrameIntervalId = null;
  }
  if (birdFlightEndTimer !== null) {
    window.clearTimeout(birdFlightEndTimer);
    birdFlightEndTimer = null;
  }

  const r = hoverBirdRoot.getBoundingClientRect();
  hoverBirdRoot.style.transition = "none";
  hoverBirdRoot.style.left = `${r.left}px`;
  hoverBirdRoot.style.top = `${r.top}px`;
  hoverBirdRoot.classList.remove("is-catchable");

  const total = incrementBirdCatchesEver();
  const countEl = document.getElementById("bird-catch-count");
  if (countEl) countEl.textContent = String(total);

  birdSpeechBubble.classList.add("is-visible");
  birdSpeechBubble.setAttribute("aria-hidden", "false");

  birdFlightActive = false;
  birdCooldownUntil = Date.now() + 2200;
}

/* pointerdown: catch on press — click often misses because the bird moves before mouseup */
hoverBirdRoot.addEventListener("pointerdown", catchBird);
hoverBirdRoot.addEventListener("click", catchBird);

function startBirdFlightFromBrandingTree() {
  if (birdFlightActive) return;
  if (Date.now() < birdCooldownUntil) return;
  if (!birdFlightAllowedOncePerLoad) return;

  const tr = getBrandingTreeScreenRect();
  if (!tr || tr.width < 2) return;

  birdFlightAllowedOncePerLoad = false;
  hideBirdSpeechBubble();
  birdCatchConsumedThisFlight = false;
  birdFlightActive = true;
  const startX = tr.left + tr.width * 0.78;
  const startY = tr.top + tr.height * 0.2;
  /* Fly left off-screen (opposite of the old rightward path) */
  const endX = -220;
  const endY = Math.max(-100, tr.top - 140);

  if (birdFrameIntervalId !== null) {
    window.clearInterval(birdFrameIntervalId);
    birdFrameIntervalId = null;
  }
  if (birdFlightEndTimer !== null) {
    window.clearTimeout(birdFlightEndTimer);
    birdFlightEndTimer = null;
  }

  hoverBirdRoot.style.transition = "none";
  hoverBirdRoot.style.left = `${startX}px`;
  hoverBirdRoot.style.top = `${startY}px`;
  hoverBirdImg.src = birdAssetUrl(BIRD_FLIGHT_FRAMES[0]);
  void hoverBirdRoot.offsetWidth;
  hoverBirdRoot.style.opacity = "1";
  hoverBirdRoot.classList.add("is-catchable");
  hoverBirdRoot.style.transition =
    `left ${BIRD_FLIGHT_DURATION_SEC}s linear, top ${BIRD_FLIGHT_DURATION_SEC}s linear, opacity 0.2s ease`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      hoverBirdRoot.style.left = `${endX}px`;
      hoverBirdRoot.style.top = `${endY}px`;
    });
  });

  let fi = 0;
  birdFrameIntervalId = window.setInterval(() => {
    fi = (fi + 1) % BIRD_FLIGHT_FRAMES.length;
    hoverBirdImg.src = birdAssetUrl(BIRD_FLIGHT_FRAMES[fi]);
  }, 250);

  birdFlightEndTimer = window.setTimeout(() => {
    if (birdCatchConsumedThisFlight) return;
    if (birdFrameIntervalId !== null) {
      window.clearInterval(birdFrameIntervalId);
      birdFrameIntervalId = null;
    }
    hoverBirdRoot.classList.remove("is-catchable");
    hideBirdSpeechBubble();
    hoverBirdRoot.style.opacity = "0";
    hoverBirdRoot.style.transition = "opacity 0.35s ease";
    birdCooldownUntil = Date.now() + 2200;
    window.setTimeout(() => {
      hoverBirdRoot.style.transition = "none";
      hoverBirdRoot.style.left = "-9999px";
      hoverBirdRoot.style.top = "-9999px";
      birdFlightActive = false;
    }, 380);
  }, BIRD_FLIGHT_END_MS);
}

const tooltip = document.createElement("div");
tooltip.className = "asset-tooltip";
tooltip.setAttribute("aria-hidden", "true");
document.body.appendChild(tooltip);

let tooltipTypewriterTimer = null;
function stopTooltipTypewriter() {
  if (tooltipTypewriterTimer !== null) {
    window.clearInterval(tooltipTypewriterTimer);
    tooltipTypewriterTimer = null;
  }
}
function dismissTooltip() {
  stopTooltipTypewriter();
  tooltip.classList.remove("visible");
  tooltip.replaceChildren();
}
function setTooltipPosition(source) {
  const padding = 10;
  const x = source.clientX;
  const y = source.clientY;
  tooltip.style.left = `${Math.min(window.innerWidth - padding, Math.max(padding, x))}px`;
  tooltip.style.top = `${Math.min(window.innerHeight - padding, Math.max(padding, y))}px`;
}
function startTooltipTypewriter(text, pos) {
  stopTooltipTypewriter();
  tooltip.replaceChildren();
  const textEl = document.createElement("span");
  textEl.className = "tooltip-type-text";
  const caretEl = document.createElement("span");
  caretEl.className = "tooltip-type-caret";
  caretEl.textContent = "|";
  caretEl.setAttribute("aria-hidden", "true");
  tooltip.appendChild(textEl);
  tooltip.appendChild(caretEl);
  tooltip.classList.add("visible");
  setTooltipPosition(pos);
  let idx = 0;
  tooltipTypewriterTimer = window.setInterval(() => {
    idx += 1;
    textEl.textContent = text.slice(0, idx);
    if (idx >= text.length) {
      stopTooltipTypewriter();
      caretEl.remove();
    }
  }, 52);
}

const background = document.createElement("img");
background.className = "spatial-bg";
background.src = `${ASSET_PATH}background2.png`;
background.alt = "";
scene.appendChild(background);

background.addEventListener("load", refreshBackgroundPickBuffer);
if (background.complete && background.naturalWidth > 0) {
  refreshBackgroundPickBuffer();
}

const NETHER_SCENE_INDEX = portfolioAssets.findIndex((a) => a.name === "Nether_Portal");
const netherSlot = sceneLayout[NETHER_SCENE_INDEX];
const DONATE_GAP_LEFT_OF_PORTAL = 20;
const DONATE_GAP_ABOVE_PORTAL_TOP = 80;

const donateBtn = document.createElement("a");
donateBtn.id = "donate-btn";
donateBtn.className = "donate-btn";
donateBtn.href = "https://www.junglekeepers.org/cameras/remote-lake";
donateBtn.target = "_blank";
donateBtn.rel = "noopener noreferrer";
donateBtn.textContent = "DONATE";
{
  const rightEdgeX = netherSlot.left - DONATE_GAP_LEFT_OF_PORTAL;
  const buttonBottomY = netherSlot.top - DONATE_GAP_ABOVE_PORTAL_TOP;
  donateBtn.style.left = `${rightEdgeX}px`;
  donateBtn.style.bottom = `${DESIGN_HEIGHT - buttonBottomY}px`;
}
scene.appendChild(donateBtn);

const birdCatchPanel = document.createElement("div");
birdCatchPanel.id = "bird-catcher";
birdCatchPanel.className = "bird-catcher";
birdCatchPanel.setAttribute("aria-live", "polite");
birdCatchPanel.setAttribute("aria-label", "Catch the bird — total catches ever");
const birdCatchLine = document.createElement("p");
birdCatchLine.className = "bird-catcher__line";
birdCatchLine.appendChild(document.createTextNode("how many people caught the tucan?: "));
const birdCatchCountEl = document.createElement("span");
birdCatchCountEl.id = "bird-catch-count";
birdCatchCountEl.textContent = String(getBirdCatchesEver());
birdCatchLine.appendChild(birdCatchCountEl);
birdCatchPanel.appendChild(birdCatchLine);
scene.appendChild(birdCatchPanel);

const dustLayer = document.createElement("div");
dustLayer.className = "ambient-dust";
for (let i = 0; i < DUST_PARTICLE_COUNT; i += 1) {
  const p = document.createElement("span");
  p.className = "dust-particle";
  p.style.left = `${(Math.random() * 100).toFixed(2)}%`;
  const size = (Math.random() * 3 + 2).toFixed(2);
  p.style.width = `${size}px`;
  p.style.height = `${size}px`;
  p.style.animationDuration = `${(Math.random() * 8 + 8).toFixed(2)}s`;
  p.style.animationDelay = `-${(Math.random() * 12).toFixed(2)}s`;
  p.style.setProperty("--drift", `${(Math.random() * 24 - 12).toFixed(2)}px`);
  dustLayer.appendChild(p);
}
scene.appendChild(dustLayer);

const leavesRoot = document.createElement("div");
leavesRoot.className = "ambient-leaves-root";

function drawImageCover(context, image, canvasWidth, canvasHeight) {
  const imgW = image.naturalWidth || image.width;
  const imgH = image.naturalHeight || image.height;
  if (!imgW || !imgH) return;
  const imageRatio = imgW / imgH;
  const canvasRatio = canvasWidth / canvasHeight;
  let drawWidth;
  let drawHeight;
  let offsetX = 0;
  let offsetY = 0;
  if (imageRatio > canvasRatio) {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imageRatio;
    offsetX = (canvasWidth - drawWidth) / 2;
  } else {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imageRatio;
    offsetY = (canvasHeight - drawHeight) / 2;
  }
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

/** 1024×580 cover raster — used to skip “paper” for the bird (looser than leaf mask) */
let backgroundPickImageData = null;

function refreshBackgroundPickBuffer() {
  if (typeof background === "undefined" || !background.naturalWidth) return;
  const canvas = document.createElement("canvas");
  canvas.width = DESIGN_WIDTH;
  canvas.height = DESIGN_HEIGHT;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  try {
    drawImageCover(ctx, background, DESIGN_WIDTH, DESIGN_HEIGHT);
    backgroundPickImageData = ctx.getImageData(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  } catch {
    /* file://, CORS, or security — can’t read pixels; bird still works (see isPointerOverCollageArt) */
    backgroundPickImageData = null;
  }
}

function pixelIsMostlyWhitePaper(ix, iy, d) {
  if (ix < 0 || iy < 0 || ix >= DESIGN_WIDTH || iy >= DESIGN_HEIGHT) return true;
  const j = (iy * DESIGN_WIDTH + ix) * 4;
  const r = d[j];
  const g = d[j + 1];
  const b = d[j + 2];
  const lum = (r + g + b) / 3;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  /* Looser than leaves: only treat near-flat white as “paper” */
  return lum >= 249 && chroma <= 28;
}

function isPointerOverCollageArt(clientX, clientY) {
  if (!backgroundPickImageData) {
    /* No buffer → don’t block the bird (canvas taint / failed read) */
    return true;
  }
  const d = backgroundPickImageData.data;
  const sr = scene.getBoundingClientRect();
  const w = sr.width;
  const h = sr.height;
  if (w < 1 || h < 1) return true;
  const x = (clientX - sr.left) * (DESIGN_WIDTH / w);
  const y = (clientY - sr.top) * (DESIGN_HEIGHT / h);
  const ix0 = Math.floor(x);
  const iy0 = Math.floor(y);

  /* 5×5: any pixel “not paper” → collage (forgiving vs 1px misalignment / antialiasing) */
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      if (!pixelIsMostlyWhitePaper(ix0 + dx, iy0 + dy, d)) {
        return true;
      }
    }
  }
  return false;
}

function createLeafBackgroundMaskDataUrl(image) {
  const canvas = document.createElement("canvas");
  canvas.width = DESIGN_WIDTH;
  canvas.height = DESIGN_HEIGHT;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  try {
    drawImageCover(context, image, DESIGN_WIDTH, DESIGN_HEIGHT);
    const imageData = context.getImageData(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    const { data } = imageData;
    const lumCut = 247;
    const chromaCut = 22;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (r + g + b) / 3;
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      const isPaper = lum >= lumCut && chroma <= chromaCut;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = isPaper ? 0 : 255;
    }
    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function applyLeavesRootMask(dataUrl) {
  if (!dataUrl) return;
  const value = `url("${dataUrl}")`;
  leavesRoot.style.webkitMaskImage = value;
  leavesRoot.style.maskImage = value;
  leavesRoot.style.webkitMaskSize = "100% 100%";
  leavesRoot.style.maskSize = "100% 100%";
  leavesRoot.style.webkitMaskRepeat = "no-repeat";
  leavesRoot.style.maskRepeat = "no-repeat";
  leavesRoot.style.webkitMaskPosition = "center";
  leavesRoot.style.maskPosition = "center";
}

let ambientLeavesBuilt = false;
let leavesLayerMounted = false;
function buildAmbientLeaves() {
  if (ambientLeavesBuilt) return;
  ambientLeavesBuilt = true;
  let globalLeafIndex = 0;
  LEAF_ZONE_DEFINITIONS.forEach((zone, zoneIndex) => {
    const count = LEAF_COUNT_PER_ZONE[zoneIndex] ?? 0;
    const coords = sceneLayout[zone.sceneIndex];
    if (!coords || count <= 0) return;
    const zoneEl = document.createElement("div");
    zoneEl.className = "leaf-zone";
    zoneEl.style.top = `${coords.top}px`;
    zoneEl.style.left = `${coords.left}px`;
    zoneEl.style.width = `${coords.width}px`;
    zoneEl.style.height = `${zone.heightPx}px`;
    leavesRoot.appendChild(zoneEl);
    for (let k = 0; k < count; k += 1) {
      const wrapper = document.createElement("div");
      const spiralClass = LEAF_SPIRAL_CLASSES[Math.floor(Math.random() * LEAF_SPIRAL_CLASSES.length)];
      wrapper.className = `leaf-floater ${spiralClass}`;
      wrapper.style.left = `${(Math.random() * 78 + 8).toFixed(2)}%`;
      wrapper.style.top = `${(Math.random() * 72 + 10).toFixed(2)}%`;
      const widthPx = Math.random() * 9 + 9;
      wrapper.style.width = `${widthPx.toFixed(1)}px`;
      wrapper.style.animationDuration = `${(Math.random() * 8 + 12).toFixed(2)}s`;
      wrapper.style.animationDelay = `-${(Math.random() * 18).toFixed(2)}s`;

      const leafImg = document.createElement("img");
      const leafFile = LEAF_FILENAMES[globalLeafIndex % LEAF_FILENAMES.length] ?? LEAF_FILENAMES[0];
      globalLeafIndex += 1;
      leafImg.className = "leaf-floater__img";
      leafImg.src = `${ASSET_PATH}${leafFile}`;
      leafImg.alt = "";
      leafImg.setAttribute("aria-hidden", "true");
      leafImg.loading = "lazy";
      if (Math.random() < 0.5) leafImg.style.transform = "scaleX(-1)";
      wrapper.appendChild(leafImg);
      zoneEl.appendChild(wrapper);
    }
  });
}

function mountLeavesLayer() {
  if (leavesLayerMounted) return;
  leavesLayerMounted = true;
  const maskUrl = createLeafBackgroundMaskDataUrl(background);
  applyLeavesRootMask(maskUrl);
  buildAmbientLeaves();
  scene.appendChild(leavesRoot);
  refreshBackgroundPickBuffer();
}

function applyCoordinates(node, coords) {
  node.style.top = `${coords.top}px`;
  node.style.left = `${coords.left}px`;
  node.style.width = `${coords.width}px`;
}

function attachStaticPulseOverlay(anchor, overlayFilename, topOffsetPx = 0, leftOffsetPx = 0, scale = 1) {
  const pulseOverlay = document.createElement("img");
  pulseOverlay.className = "asset-color-pulse asset-color-pulse-synced";
  pulseOverlay.alt = "";
  pulseOverlay.setAttribute("aria-hidden", "true");
  pulseOverlay.style.animationDelay = "0s";
  if (topOffsetPx !== 0) pulseOverlay.style.top = `${topOffsetPx}px`;
  if (leftOffsetPx !== 0) pulseOverlay.style.left = `${leftOffsetPx}px`;
  if (scale !== 1) {
    pulseOverlay.style.transform = `scale(${scale})`;
    pulseOverlay.style.transformOrigin = "center";
  }
  pulseOverlay.src = `${ASSET_PATH}${overlayFilename}`;
  anchor.appendChild(pulseOverlay);
}

const RADIO_NOTE_SYMBOLS = ["♪", "♫", "♪", "♫"];
const RADIO_NOTE_CLASSES = [
  "radio-music-note",
  "radio-music-note radio-note-a",
  "radio-music-note radio-note-b",
  "radio-music-note radio-note-c"
];
function addRadioMusicNotes(anchor) {
  const leftPositions = [42, 52, 62, 48];
  for (let i = 0; i < RADIO_NOTE_CLASSES.length; i += 1) {
    const note = document.createElement("span");
    note.className = RADIO_NOTE_CLASSES[i];
    note.textContent = RADIO_NOTE_SYMBOLS[i % RADIO_NOTE_SYMBOLS.length];
    note.setAttribute("aria-hidden", "true");
    note.style.left = `${leftPositions[i]}%`;
    note.style.animationDelay = `${(i * 0.48).toFixed(2)}s`;
    anchor.appendChild(note);
  }
}

portfolioAssets.forEach((asset, index) => {
  const anchor = document.createElement("a");
  anchor.className = "asset-link";
  anchor.href = `https://failennaselta.com/${asset.link}`;
  anchor.setAttribute("aria-label", `${asset.name} — ${asset.hoverLabel ?? asset.link}`);
  anchor.style.zIndex =
    asset.name === "Orb"
      ? "35"
      : String(layerByAsset[asset.name] ?? 4);
  const animationClass = animationClassByAsset[asset.name];
  if (animationClass && !topOnlySwayAssets.has(asset.name)) anchor.classList.add(animationClass);
  anchor.style.animationDelay = `-${(Math.random() * 5).toFixed(2)}s`;
  applyCoordinates(anchor, sceneLayout[index]);
  if (asset.name === "Large_Tree") anchor.id = "branding-tree-anchor";

  if (topOnlySwayAssets.has(asset.name)) {
    anchor.classList.add("has-top-only-sway");
    anchor.style.setProperty("--sway-split", swaySplitByAsset[asset.name] ?? "58%");
    const baseImage = document.createElement("img");
    baseImage.className = "asset-image asset-image-base";
    baseImage.src = `${ASSET_PATH}${asset.filename}`;
    baseImage.alt = asset.name.replaceAll("_", " ");
    baseImage.loading = "lazy";
    const topImage = document.createElement("img");
    topImage.className = "asset-image asset-image-top anim-sway";
    topImage.src = `${ASSET_PATH}${asset.filename}`;
    topImage.alt = "";
    topImage.setAttribute("aria-hidden", "true");
    topImage.loading = "lazy";
    topImage.style.animationDelay = `-${(Math.random() * 5).toFixed(2)}s`;
    anchor.appendChild(baseImage);
    anchor.appendChild(topImage);
  } else {
    const image = document.createElement("img");
    image.className = "asset-image";
    image.src = `${ASSET_PATH}${asset.filename}`;
    image.alt = asset.name.replaceAll("_", " ");
    image.loading = "lazy";
    anchor.appendChild(image);

    if (asset.name === "Nether_Portal") {
      anchor.id = "nether-portal-anchor";
      anchor.style.opacity = "0.9";
      attachStaticPulseOverlay(anchor, NETHER_PORTAL_OVERLAY_FILENAME, -64, 12, .26);
    } else if (asset.name === "Screen_Tablet") {
      attachStaticPulseOverlay(anchor, SCREEN_TABLET_OVERLAY_FILENAME, -8, 2, .3);
    }
  }

  if (asset.name === "Radio") addRadioMusicNotes(anchor);
  if (asset.name === "Orb") {
    const pause = () => anchor.classList.add("orb-motion-paused");
    const resume = () => anchor.classList.remove("orb-motion-paused");
    anchor.addEventListener("mouseenter", pause);
    anchor.addEventListener("mouseleave", resume);
    anchor.addEventListener("focus", pause);
    anchor.addEventListener("blur", resume);
  }

  const hoverTitle = asset.hoverLabel ?? asset.link;
  anchor.addEventListener("mouseenter", (event) => startTooltipTypewriter(hoverTitle, event));
  anchor.addEventListener("mousemove", (event) => {
    if (tooltip.classList.contains("visible")) setTooltipPosition(event);
  });
  anchor.addEventListener("mouseleave", dismissTooltip);
  anchor.addEventListener("focus", () => {
    const rect = anchor.getBoundingClientRect();
    startTooltipTypewriter(hoverTitle, { clientX: rect.left + rect.width / 2, clientY: rect.top });
  });
  anchor.addEventListener("blur", dismissTooltip);

  scene.appendChild(anchor);
});

function bindBirdBackgroundTrigger() {
  let lastBirdHoverAt = 0;
  const throttleMs = 850;

  function tryStartFromPointer(e) {
    if (e.pointerType === "touch") return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    if (el.closest(".asset-link")) return;
    if (el.closest(".donate-btn")) return;
    if (el !== background) return;
    if (!isPointerOverCollageArt(e.clientX, e.clientY)) return;
    if (Date.now() - lastBirdHoverAt < throttleMs) return;
    lastBirdHoverAt = Date.now();
    startBirdFlightFromBrandingTree();
  }

  viewport.addEventListener("pointermove", tryStartFromPointer, { passive: true });
  background.addEventListener("mouseenter", (e) => {
    if (Date.now() - lastBirdHoverAt < throttleMs) return;
    if (!isPointerOverCollageArt(e.clientX, e.clientY)) return;
    lastBirdHoverAt = Date.now();
    startBirdFlightFromBrandingTree();
  });
}

bindBirdBackgroundTrigger();

if (background.complete && background.naturalWidth > 0) {
  mountLeavesLayer();
} else {
  background.addEventListener("load", mountLeavesLayer, { once: true });
  background.addEventListener(
    "error",
    () => {
      if (!leavesLayerMounted) {
        leavesLayerMounted = true;
        buildAmbientLeaves();
        scene.appendChild(leavesRoot);
      }
    },
    { once: true }
  );
}

let lastViewportKey = "";

function refreshSceneScale() {
  // clientWidth/Height avoids scrollbar vs innerWidth mismatch that can cause edge seams
  const iw = document.documentElement.clientWidth;
  const ih = document.documentElement.clientHeight;
  const viewportKey = `${iw}x${ih}`;
  if (viewportKey !== lastViewportKey) {
    lastViewportKey = viewportKey;
    if (birdFlightActive) {
      hideBirdSpeechBubble();
      hoverBirdRoot.classList.remove("is-catchable");
      hoverBirdRoot.style.opacity = "0";
      if (birdFrameIntervalId !== null) {
        window.clearInterval(birdFrameIntervalId);
        birdFrameIntervalId = null;
      }
      if (birdFlightEndTimer !== null) {
        window.clearTimeout(birdFlightEndTimer);
        birdFlightEndTimer = null;
      }
      birdFlightActive = false;
      hoverBirdRoot.style.transition = "none";
      hoverBirdRoot.style.left = "-9999px";
      hoverBirdRoot.style.top = "-9999px";
    }
  }

  const rawScale = Math.min(iw / DESIGN_WIDTH, ih / DESIGN_HEIGHT);
  const scale = Math.round(rawScale * 1e6) / 1e6;

  // Minimal inset — maximize visible map; viewport inset shadow handles hairlines
  const edgeInset = 0.35 / Math.max(iw, ih);
  const finalScale = scale * (1 - edgeInset);

  const scaledW = DESIGN_WIDTH * finalScale;
  const scaledH = DESIGN_HEIGHT * finalScale;

  const marginX = Math.max(0, (iw - scaledW) / 2 - 2);
  const marginY = Math.max(0, (ih - scaledH) / 2 - 2);
  const horizontalNudge = Math.min(70, marginX);
  const verticalNudge = Math.min(50, marginY);

  let txPx = -DESIGN_WIDTH / 2 - horizontalNudge - SCENE_SHIFT_LEFT_EXTRA_PX;
  let tyPx = (SCENE_Y_SHIFT_PERCENT / 100) * DESIGN_HEIGHT - verticalNudge;
  const dpr = window.devicePixelRatio || 1;
  // Extra nudge downward at sizes where a black hairline appears along the top edge
  const needsTopSeamFix =
    (iw <= 940 && ih <= 894) || (iw > 1680 && ih <= 910);
  if (needsTopSeamFix) {
    tyPx += 3 / dpr;
  }
  const snap = (v) => Math.round(v * dpr) / dpr;
  txPx = snap(txPx);
  tyPx = snap(tyPx);

  scene.style.transform = `translate3d(${txPx}px, ${tyPx}px, 0) scale(${finalScale})`;
}

window.addEventListener("resize", refreshSceneScale);
refreshSceneScale();

