const svgNs = "http://www.w3.org/2000/svg";

const drawingSurface = document.getElementById("drawing-surface");
const mouseTrail = document.getElementById("mouse-trail");
const clearCanvasButton = document.getElementById("clear-canvas-button");
const enablePathToggle = document.getElementById("enable-path-toggle");
const themeToggleButton = document.getElementById("theme-toggle-button");
const rootElement = document.documentElement;
const themeStorageKey = "mouse-bounce-theme";

const counters = {
  leftPress: 0,
  leftRelease: 0,
  rightPress: 0,
  rightRelease: 0
};

const counterElements = {
  leftPress: document.getElementById("left-press-count"),
  leftRelease: document.getElementById("left-release-count"),
  rightPress: document.getElementById("right-press-count"),
  rightRelease: document.getElementById("right-release-count")
};

let pathData = "";
let lastPoint = null;
let isPathEnabled = enablePathToggle.checked;
let markerColors = {
  left: "",
  right: ""
};

function readThemeColors() {
  const styles = getComputedStyle(rootElement);
  return {
    left: styles.getPropertyValue("--left").trim(),
    right: styles.getPropertyValue("--right").trim()
  };
}

function updateThemeButton(theme) {
  const isDark = theme === "dark";
  themeToggleButton.textContent = isDark ? "Light theme" : "Dark theme";
  themeToggleButton.setAttribute("aria-pressed", String(isDark));
}

function recolorMarkers() {
  drawingSurface.querySelectorAll("circle").forEach((marker) => {
    const button = marker.getAttribute("data-button");
    const state = marker.getAttribute("data-state");
    const color = button === "left" ? markerColors.left : markerColors.right;
    marker.setAttribute("stroke", color);
    marker.setAttribute("fill", state === "press" ? color : "none");
  });
}

function applyTheme(theme) {
  rootElement.dataset.theme = theme;
  markerColors = readThemeColors();
  updateThemeButton(theme);
  recolorMarkers();
}

function saveTheme(theme) {
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Ignore storage failures and continue with in-memory theme.
  }
}

function loadTheme() {
  try {
    const stored = localStorage.getItem(themeStorageKey);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // Continue with default theme.
  }

  return "light";
}

function clearDrawing() {
  pathData = "";
  lastPoint = null;
  mouseTrail.setAttribute("d", "");

  drawingSurface.querySelectorAll("circle").forEach((marker) => {
    marker.remove();
  });
}

function updateCounter(name) {
  counterElements[name].textContent = String(counters[name]);
}

function toSvgCoords(event) {
  const rect = drawingSurface.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function inBounds(point) {
  return point.x >= 0 &&
    point.y >= 0 &&
    point.x <= drawingSurface.clientWidth &&
    point.y <= drawingSurface.clientHeight;
}

function addTrailPoint(point) {
  const x = point.x.toFixed(1);
  const y = point.y.toFixed(1);
  pathData += pathData === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
  mouseTrail.setAttribute("d", pathData);
}

function createMarker(point, button, isPress) {
  const color = button === "left" ? markerColors.left : markerColors.right;
  const marker = document.createElementNS(svgNs, "circle");
  marker.setAttribute("cx", point.x.toFixed(1));
  marker.setAttribute("cy", point.y.toFixed(1));
  marker.setAttribute("r", "7");
  marker.setAttribute("stroke", color);
  marker.setAttribute("stroke-width", "2");
  marker.setAttribute("fill", isPress ? color : "none");
  marker.setAttribute("data-button", button);
  marker.setAttribute("data-state", isPress ? "press" : "release");
  drawingSurface.appendChild(marker);
}

function handleTrail(event) {
  if (!isPathEnabled) {
    return;
  }

  const point = toSvgCoords(event);
  if (!inBounds(point)) {
    return;
  }

  if (lastPoint && lastPoint.x === point.x && lastPoint.y === point.y) {
    return;
  }

  addTrailPoint(point);
  lastPoint = point;
}

function handlePress(event) {
  const point = toSvgCoords(event);
  if (!inBounds(point)) {
    return;
  }

  if (event.button === 0) {
    counters.leftPress += 1;
    updateCounter("leftPress");
    createMarker(point, "left", true);
  } else if (event.button === 2) {
    counters.rightPress += 1;
    updateCounter("rightPress");
    createMarker(point, "right", true);
  }
}

function handleRelease(event) {
  const point = toSvgCoords(event);
  if (!inBounds(point)) {
    return;
  }

  if (event.button === 0) {
    counters.leftRelease += 1;
    updateCounter("leftRelease");
    createMarker(point, "left", false);
  } else if (event.button === 2) {
    counters.rightRelease += 1;
    updateCounter("rightRelease");
    createMarker(point, "right", false);
  }
}

applyTheme(loadTheme());

drawingSurface.addEventListener("mousemove", handleTrail);
drawingSurface.addEventListener("mousedown", handlePress);
drawingSurface.addEventListener("mouseup", handleRelease);
drawingSurface.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

clearCanvasButton.addEventListener("click", clearDrawing);

enablePathToggle.addEventListener("change", () => {
  isPathEnabled = enablePathToggle.checked;
  lastPoint = null;
});

themeToggleButton.addEventListener("click", () => {
  const currentTheme = rootElement.dataset.theme === "dark" ? "dark" : "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  saveTheme(nextTheme);
});

window.addEventListener("keydown", (event) => {
  if (event.code !== "Space") {
    return;
  }

  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable) {
    return;
  }

  event.preventDefault();
  clearDrawing();
});
