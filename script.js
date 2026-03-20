const ASSET_PATH = "./assets/";
const DESIGN_WIDTH = 1024;
const DESIGN_HEIGHT = 580;
const SCENE_Y_SHIFT_PERCENT = -54;

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
  { top: 290, left: 547, width: 132 },
  { top: 389, left: 626, width: 80 },
  { top: 256, left: 643, width: 109 },
  { top: 126, left: 638, width: 230 },
  { top: 434, left: 96, width: 170 },
  { top: 367, left: 252, width: 63 },
  { top: 500, left: 350, width: 180 },
  { top: 233, left: 240, width: 138 },
  { top: 344, left: 359, width: 150 }
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

const viewport = document.getElementById("spatial-viewport");
const scene = document.createElement("div");
scene.id = "spatial-scene";
scene.style.width = `${DESIGN_WIDTH}px`;
scene.style.height = `${DESIGN_HEIGHT}px`;
viewport.appendChild(scene);

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
  anchor.href = `/${asset.link}`;
  anchor.setAttribute("aria-label", `${asset.name} — ${asset.hoverLabel ?? asset.link}`);
  anchor.style.zIndex = String(layerByAsset[asset.name] ?? 4);
  const animationClass = animationClassByAsset[asset.name];
  if (animationClass && !topOnlySwayAssets.has(asset.name)) anchor.classList.add(animationClass);
  anchor.style.animationDelay = `-${(Math.random() * 5).toFixed(2)}s`;
  applyCoordinates(anchor, sceneLayout[index]);

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

function refreshSceneScale() {
  const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
  scene.style.transform = `translate(-50%, ${SCENE_Y_SHIFT_PERCENT}%) scale(${scale})`;
}

window.addEventListener("resize", refreshSceneScale);
refreshSceneScale();
