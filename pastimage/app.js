const IS_MAC = (() => {
  if (navigator.userAgentData && navigator.userAgentData.platform) {
    return /mac|ios/i.test(navigator.userAgentData.platform);
  }
  return /Mac|iPhone|iPad/.test(navigator.userAgent || "");
})();

const COLORS = ["#ff3b30", "#ffcc00", "#34c759", "#0a84ff", "#ffffff"];
const STROKE_LEVELS = [1, 1.5, 2, 3, 4];
const SELECTION_COLOR = "rgba(120, 180, 255, 0.9)";
const MIN_RECT_SIZE = 4;
const MAX_HISTORY = 50;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const emptyEl = document.getElementById("empty");
const helpBar = document.getElementById("helpBar");
const toolbar = document.getElementById("toolbar");
const toastEl = document.getElementById("toast");
const sizeInput = document.getElementById("sizeInput");
const saveBtn = document.getElementById("saveBtn");
const strokeGroup = document.querySelector(".t-stroke-group");
const textGroup = document.querySelector(".t-text-group");
const fillGroup = document.querySelector(".t-fill-group");

const RECT_FILL_ALPHA = 1;
const TEXT_FILL_ALPHA = 1;

let image = null;
let annotations = [];
let selected = null;
let draft = null;
let dragMode = null;
let dragAnchor = null;
let resizeHandle = null;
let resizeOriginal = null;

let pendingColor = COLORS[0];
let pendingStroke = 2;
let pendingFontSize = 32;
let pendingFill = null;

let history = [];
let dragPreSnapshot = null;
let dragChanged = false;
let sizeInputSnapshot = null;

const baseStroke = () => Math.max(2, canvas.width / 500);
const strokeFor = (level) => baseStroke() * STROKE_LEVELS[level];

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function snapshot() {
  return {
    annotations: annotations.map((a) => ({ ...a })),
    selected,
  };
}

function pushHistory(snap) {
  history.push(snap !== undefined ? snap : snapshot());
  if (history.length > MAX_HISTORY) history.shift();
}

function undo() {
  if (dragMode !== null) return;
  if (history.length === 0) return;
  const s = history.pop();
  annotations = s.annotations;
  const sel = s.selected;
  selected = null;
  if (sel !== null && annotations[sel]) {
    selectIndex(sel);
  } else {
    selectIndex(null);
  }
  redraw();
}

function showCanvas() {
  emptyEl.classList.add("hidden");
  canvas.classList.remove("hidden");
  helpBar.classList.remove("hidden");
  saveBtn.classList.remove("hidden");
}

function updateToolbarVisibility() {
  if (selected === null || !annotations[selected]) {
    toolbar.classList.add("hidden");
    return;
  }
  const a = annotations[selected];
  toolbar.classList.remove("hidden");
  strokeGroup.classList.toggle("hidden", a.type !== "rect");
  textGroup.classList.toggle("hidden", a.type !== "text");
}

function getDisplayScale() {
  const rect = canvas.getBoundingClientRect();
  return rect.width / canvas.width;
}

function toCanvasCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * sx,
    y: (clientY - rect.top) * sy,
  };
}

function textBoundingBox(a) {
  ctx.font = `700 ${a.size}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  return { w: ctx.measureText(a.text).width, h: a.size };
}

function getResizeHandles(a) {
  if (a.type !== "rect") return [];
  return [
    { name: "nw", x: a.x,           y: a.y,           cursor: "nwse-resize" },
    { name: "n",  x: a.x + a.w / 2, y: a.y,           cursor: "ns-resize" },
    { name: "ne", x: a.x + a.w,     y: a.y,           cursor: "nesw-resize" },
    { name: "e",  x: a.x + a.w,     y: a.y + a.h / 2, cursor: "ew-resize" },
    { name: "se", x: a.x + a.w,     y: a.y + a.h,     cursor: "nwse-resize" },
    { name: "s",  x: a.x + a.w / 2, y: a.y + a.h,     cursor: "ns-resize" },
    { name: "sw", x: a.x,           y: a.y + a.h,     cursor: "nesw-resize" },
    { name: "w",  x: a.x,           y: a.y + a.h / 2, cursor: "ew-resize" },
  ];
}

function hitHandle(a, x, y) {
  if (a.type !== "rect") return null;
  const r = Math.max(10, canvas.width / 150);
  for (const h of getResizeHandles(a)) {
    if (Math.abs(x - h.x) <= r && Math.abs(y - h.y) <= r) return h;
  }
  return null;
}

function hitTest(x, y) {
  for (let i = annotations.length - 1; i >= 0; i--) {
    const a = annotations[i];
    if (a.type === "rect") {
      const sw = strokeFor(a.strokeLevel);
      const pad = Math.max(8, sw * 1.5);
      const inOuter =
        x >= a.x - pad && x <= a.x + a.w + pad &&
        y >= a.y - pad && y <= a.y + a.h + pad;
      if (!inOuter) continue;
      const ix = a.x + pad, iy = a.y + pad;
      const iw = a.w - pad * 2, ih = a.h - pad * 2;
      const inInner = iw > 0 && ih > 0 && x > ix && x < ix + iw && y > iy && y < iy + ih;
      if (!inInner) return i;
    } else if (a.type === "text") {
      const { w, h } = textBoundingBox(a);
      if (x >= a.x && x <= a.x + w && y >= a.y && y <= a.y + h) return i;
    }
  }
  return -1;
}

function drawAnnotations(target) {
  target.textBaseline = "top";
  for (const a of annotations) {
    if (a.type === "rect") {
      if (a.fill) {
        target.fillStyle = hexToRgba(a.fill, RECT_FILL_ALPHA);
        target.fillRect(a.x, a.y, a.w, a.h);
      }
      target.strokeStyle = a.color;
      target.lineWidth = strokeFor(a.strokeLevel);
      target.strokeRect(a.x, a.y, a.w, a.h);
    } else if (a.type === "text") {
      target.font = `700 ${a.size}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      if (a.fill) {
        const m = target.measureText(a.text);
        const padX = a.size * 0.18;
        const padY = a.size * 0.1;
        target.fillStyle = hexToRgba(a.fill, TEXT_FILL_ALPHA);
        target.fillRect(a.x - padX, a.y - padY, m.width + padX * 2, a.size + padY * 2);
      }
      target.fillStyle = a.color;
      target.fillText(a.text, a.x, a.y);
    }
  }
}

function drawSelection(a) {
  ctx.save();
  ctx.strokeStyle = SELECTION_COLOR;
  ctx.lineWidth = Math.max(1.5, canvas.width / 800);
  ctx.setLineDash([6, 4]);

  if (a.type === "rect") {
    const sw = strokeFor(a.strokeLevel);
    const pad = sw / 2 + 6;
    ctx.strokeRect(a.x - pad, a.y - pad, a.w + pad * 2, a.h + pad * 2);

    ctx.setLineDash([]);
    const r = Math.max(6, canvas.width / 200);
    for (const h of getResizeHandles(a)) {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = SELECTION_COLOR;
      ctx.lineWidth = Math.max(1.2, canvas.width / 800);
      ctx.beginPath();
      ctx.arc(h.x, h.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (a.type === "text") {
    const { w, h } = textBoundingBox(a);
    const pad = 4;
    ctx.strokeRect(a.x - pad, a.y - pad, w + pad * 2, h + pad * 2);
  }
  ctx.restore();
}

function redraw() {
  if (!image) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  drawAnnotations(ctx);

  if (draft) {
    ctx.strokeStyle = pendingColor;
    ctx.lineWidth = strokeFor(pendingStroke);
    ctx.strokeRect(draft.x, draft.y, draft.w, draft.h);
  }

  if (selected !== null && annotations[selected]) {
    drawSelection(annotations[selected]);
  }
}

async function loadImage(blob) {
  const bitmap = await createImageBitmap(blob);
  image = bitmap;
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  annotations = [];
  selected = null;
  draft = null;
  history = [];
  showCanvas();
  updateToolbarVisibility();
  redraw();
}

document.addEventListener("paste", async (e) => {
  const tag = e.target && e.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  if (!e.clipboardData) return;

  let imageItem = null;
  for (const item of e.clipboardData.items) {
    if (item.type && item.type.startsWith("image/")) {
      imageItem = item;
      break;
    }
  }
  if (!imageItem) {
    if (!image) toast("No image in clipboard", true);
    return;
  }
  e.preventDefault();
  const blob = imageItem.getAsFile();
  if (!blob) {
    toast("Failed to read image", true);
    return;
  }
  try {
    await loadImage(blob);
  } catch (err) {
    toast("Failed to load image: " + err.message, true);
  }
});

function selectIndex(i) {
  selected = i;
  if (i !== null && annotations[i]) {
    const a = annotations[i];
    pendingColor = a.color;
    pendingFill = a.fill || null;
    if (a.type === "rect") {
      pendingStroke = a.strokeLevel;
    } else if (a.type === "text") {
      pendingFontSize = a.size;
      sizeInput.value = Math.round(a.size);
    }
  }
  updateToolbarUI();
  updateToolbarVisibility();
}

canvas.addEventListener("mousedown", (e) => {
  if (!image || e.button !== 0) return;
  const { x, y } = toCanvasCoords(e.clientX, e.clientY);

  if (selected !== null && annotations[selected] && annotations[selected].type === "rect") {
    const handle = hitHandle(annotations[selected], x, y);
    if (handle) {
      const a = annotations[selected];
      dragMode = "resize";
      dragAnchor = { x, y };
      resizeHandle = handle.name;
      resizeOriginal = { x: a.x, y: a.y, w: a.w, h: a.h };
      dragPreSnapshot = snapshot();
      dragChanged = false;
      return;
    }
  }

  const hit = hitTest(x, y);
  if (hit >= 0) {
    selectIndex(hit);
    dragMode = "move";
    dragAnchor = { x, y };
    dragPreSnapshot = snapshot();
    dragChanged = false;
    redraw();
  } else {
    selectIndex(null);
    dragMode = "draw";
    dragAnchor = { x, y };
    draft = { type: "rect", x, y, w: 0, h: 0 };
    redraw();
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!image) return;
  const { x, y } = toCanvasCoords(e.clientX, e.clientY);

  if (!dragMode) {
    if (selected !== null && annotations[selected] && annotations[selected].type === "rect") {
      const handle = hitHandle(annotations[selected], x, y);
      if (handle) {
        canvas.style.cursor = handle.cursor;
        return;
      }
    }
    const hit = hitTest(x, y);
    canvas.style.cursor = hit >= 0 ? "move" : "crosshair";
    return;
  }

  if (dragMode === "draw" && draft) {
    draft.x = Math.min(dragAnchor.x, x);
    draft.y = Math.min(dragAnchor.y, y);
    draft.w = Math.abs(x - dragAnchor.x);
    draft.h = Math.abs(y - dragAnchor.y);
    redraw();
  } else if (dragMode === "move" && selected !== null) {
    if (!dragChanged) {
      pushHistory(dragPreSnapshot);
      dragChanged = true;
    }
    const dx = x - dragAnchor.x;
    const dy = y - dragAnchor.y;
    annotations[selected].x += dx;
    annotations[selected].y += dy;
    dragAnchor = { x, y };
    redraw();
  } else if (dragMode === "resize" && selected !== null) {
    if (!dragChanged) {
      pushHistory(dragPreSnapshot);
      dragChanged = true;
    }
    const a = annotations[selected];
    const dx = x - dragAnchor.x;
    const dy = y - dragAnchor.y;
    const o = resizeOriginal;
    let nx = o.x, ny = o.y, nw = o.w, nh = o.h;

    switch (resizeHandle) {
      case "nw": nx = o.x + dx; ny = o.y + dy; nw = o.w - dx; nh = o.h - dy; break;
      case "n":  ny = o.y + dy; nh = o.h - dy; break;
      case "ne": ny = o.y + dy; nw = o.w + dx; nh = o.h - dy; break;
      case "e":  nw = o.w + dx; break;
      case "se": nw = o.w + dx; nh = o.h + dy; break;
      case "s":  nh = o.h + dy; break;
      case "sw": nx = o.x + dx; nw = o.w - dx; nh = o.h + dy; break;
      case "w":  nx = o.x + dx; nw = o.w - dx; break;
    }

    if (nw < 0) { a.x = nx + nw; a.w = -nw; } else { a.x = nx; a.w = nw; }
    if (nh < 0) { a.y = ny + nh; a.h = -nh; } else { a.y = ny; a.h = nh; }

    redraw();
  }
});

window.addEventListener("mouseup", () => {
  if (dragMode === "draw" && draft && draft.w > 4 && draft.h > 4) {
    pushHistory();
    annotations.push({
      type: "rect",
      x: draft.x, y: draft.y, w: draft.w, h: draft.h,
      color: pendingColor,
      strokeLevel: pendingStroke,
      fill: pendingFill,
    });
    selectIndex(annotations.length - 1);
  }

  if (dragMode === "resize" && selected !== null) {
    const a = annotations[selected];
    if (a.w < MIN_RECT_SIZE) a.w = MIN_RECT_SIZE;
    if (a.h < MIN_RECT_SIZE) a.h = MIN_RECT_SIZE;
  }

  draft = null;
  dragMode = null;
  dragAnchor = null;
  resizeHandle = null;
  resizeOriginal = null;
  dragPreSnapshot = null;
  dragChanged = false;
  redraw();
});

canvas.addEventListener("dblclick", (e) => {
  if (!image) return;
  const coords = toCanvasCoords(e.clientX, e.clientY);
  const hit = hitTest(coords.x, coords.y);
  if (hit >= 0 && annotations[hit].type === "text") {
    editText(hit);
  } else {
    createText(coords, e.clientX, e.clientY);
  }
});

function createTextInput(clientX, clientY, fontSize, color, initialValue) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "text-input";
  input.style.left = clientX + "px";
  input.style.top = clientY + "px";
  input.style.fontSize = fontSize + "px";
  input.style.color = color;
  input.value = initialValue;
  document.body.appendChild(input);
  input.focus();
  input.select();
  return input;
}

function createText(canvasCoords, clientX, clientY) {
  const preCreate = snapshot();
  const cssSize = pendingFontSize * getDisplayScale();
  const input = createTextInput(clientX, clientY, cssSize, pendingColor, "");

  let done = false;
  const commit = () => {
    if (done) return;
    done = true;
    const text = input.value.trim();
    if (text) {
      pushHistory(preCreate);
      annotations.push({
        type: "text",
        x: canvasCoords.x,
        y: canvasCoords.y,
        text,
        color: pendingColor,
        size: pendingFontSize,
        fill: pendingFill,
      });
      selectIndex(annotations.length - 1);
    }
    input.remove();
    redraw();
  };
  const cancel = () => {
    if (done) return;
    done = true;
    input.remove();
  };

  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (ev) => {
    ev.stopPropagation();
    if (ev.key === "Enter") { ev.preventDefault(); commit(); }
    else if (ev.key === "Escape") { ev.preventDefault(); cancel(); }
  });
}

function editText(index) {
  const a = annotations[index];
  const preEdit = snapshot();
  const rect = canvas.getBoundingClientRect();
  const scale = getDisplayScale();
  const clientX = rect.left + a.x * scale;
  const clientY = rect.top + a.y * scale;
  const cssSize = a.size * scale;

  const removed = annotations.splice(index, 1)[0];
  selectIndex(null);
  redraw();

  const input = createTextInput(clientX, clientY, cssSize, a.color, a.text);

  let done = false;
  const commit = () => {
    if (done) return;
    done = true;
    const text = input.value.trim();
    if (text) {
      const updated = { ...removed, text };
      annotations.splice(index, 0, updated);
      if (text !== removed.text) pushHistory(preEdit);
      selectIndex(index);
    } else {
      pushHistory(preEdit);
      selectIndex(null);
    }
    input.remove();
    redraw();
  };
  const cancel = () => {
    if (done) return;
    done = true;
    annotations.splice(index, 0, removed);
    selectIndex(index);
    input.remove();
    redraw();
  };

  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (ev) => {
    ev.stopPropagation();
    if (ev.key === "Enter") { ev.preventDefault(); commit(); }
    else if (ev.key === "Escape") { ev.preventDefault(); cancel(); }
  });
}

function renderToOffscreen() {
  const off = document.createElement("canvas");
  off.width = canvas.width;
  off.height = canvas.height;
  const offCtx = off.getContext("2d");
  offCtx.drawImage(image, 0, 0);
  drawAnnotations(offCtx);
  return off;
}

function copyToClipboard() {
  if (!image) {
    toast("Nothing to copy", true);
    return;
  }
  const off = renderToOffscreen();

  const blobPromise = new Promise((resolve, reject) => {
    off.toBlob((blob) => {
      blob ? resolve(blob) : reject(new Error("toBlob returned null"));
    }, "image/png");
  });

  navigator.clipboard
    .write([new ClipboardItem({ "image/png": blobPromise })])
    .then(() => toast("Copied"))
    .catch((err) => toast("Copy failed: " + (err.message || err), true));
}

function defaultFilename() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `pastimage-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.png`;
}

async function saveAs() {
  if (!image) {
    toast("Nothing to save", true);
    return;
  }
  const off = renderToOffscreen();
  const blob = await new Promise((resolve) => off.toBlob(resolve, "image/png"));
  if (!blob) {
    toast("Failed to render image", true);
    return;
  }

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: defaultFilename(),
        types: [
          { description: "PNG image", accept: { "image/png": [".png"] } },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      toast("Saved");
    } catch (err) {
      if (err.name !== "AbortError") {
        toast("Save failed: " + (err.message || err), true);
      }
    }
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = defaultFilename();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast("Downloaded");
}

let toastTimer = null;
function toast(msg, isError = false) {
  toastEl.textContent = msg;
  toastEl.classList.toggle("error", isError);
  toastEl.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("visible"), 1400);
}

window.addEventListener("keydown", (e) => {
  const tag = e.target && e.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  const mod = e.metaKey || e.ctrlKey;

  if (mod && (e.key === "c" || e.key === "C")) {
    e.preventDefault();
    copyToClipboard();
  } else if (mod && (e.key === "s" || e.key === "S")) {
    e.preventDefault();
    saveAs();
  } else if (mod && (e.key === "z" || e.key === "Z")) {
    e.preventDefault();
    undo();
  } else if (e.key === "Delete" || e.key === "Backspace") {
    if (selected !== null) {
      e.preventDefault();
      pushHistory();
      annotations.splice(selected, 1);
      selectIndex(null);
      redraw();
    }
  } else if (e.key === "Escape") {
    if (selected !== null) {
      selectIndex(null);
      redraw();
    } else if (annotations.length > 0) {
      pushHistory();
      annotations = [];
      redraw();
      toast("Cleared");
    }
  }
});

document.querySelectorAll(".swatch").forEach((b) => {
  b.addEventListener("click", () => {
    const color = b.dataset.color;
    if (selected !== null && annotations[selected].color !== color) {
      pushHistory();
      annotations[selected].color = color;
    }
    pendingColor = color;
    updateToolbarUI();
    redraw();
  });
});

document.querySelectorAll(".stroke-btn").forEach((b) => {
  b.addEventListener("click", () => {
    const level = parseInt(b.dataset.stroke, 10);
    if (
      selected !== null &&
      annotations[selected].type === "rect" &&
      annotations[selected].strokeLevel !== level
    ) {
      pushHistory();
      annotations[selected].strokeLevel = level;
    }
    pendingStroke = level;
    updateToolbarUI();
    redraw();
  });
});

sizeInput.addEventListener("focus", () => {
  if (selected !== null && annotations[selected] && annotations[selected].type === "text") {
    sizeInputSnapshot = snapshot();
  }
});

sizeInput.addEventListener("input", () => {
  const val = parseInt(sizeInput.value, 10);
  if (!isNaN(val) && val >= 8 && val <= 500) {
    if (selected !== null && annotations[selected] && annotations[selected].type === "text") {
      if (annotations[selected].size !== val) {
        if (sizeInputSnapshot) {
          pushHistory(sizeInputSnapshot);
          sizeInputSnapshot = null;
        }
        annotations[selected].size = val;
        redraw();
      }
    }
    pendingFontSize = val;
  }
});

sizeInput.addEventListener("blur", () => {
  sizeInputSnapshot = null;
});

sizeInput.addEventListener("keydown", (e) => {
  e.stopPropagation();
  if (e.key === "Enter" || e.key === "Escape") {
    sizeInput.blur();
  }
});

function updateToolbarUI() {
  document.querySelectorAll(".swatch").forEach((b) => {
    b.classList.toggle("active", b.dataset.color === pendingColor);
  });
  document.querySelectorAll(".stroke-btn").forEach((b) => {
    b.classList.toggle("active", parseInt(b.dataset.stroke, 10) === pendingStroke);
  });
  document.querySelectorAll(".fill-swatch").forEach((b) => {
    const val = b.dataset.fill === "none" ? null : b.dataset.fill;
    b.classList.toggle("active", val === pendingFill);
  });
}

document.querySelectorAll(".fill-swatch").forEach((b) => {
  b.addEventListener("click", () => {
    const fill = b.dataset.fill === "none" ? null : b.dataset.fill;
    if (selected !== null && annotations[selected].fill !== fill) {
      pushHistory();
      annotations[selected].fill = fill;
    }
    pendingFill = fill;
    updateToolbarUI();
    redraw();
  });
});

saveBtn.addEventListener("click", saveAs);

const SHARE_URL = "https://nakaicode.com/pastimage/";
const SHARE_TEXT =
  "pastimage — 最小手順で画像に注釈してコピー / ブラウザ完結のスクショ注釈ツール";

document.getElementById("shareTwitter").addEventListener("click", () => {
  const url =
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(SHARE_TEXT) +
    "&url=" +
    encodeURIComponent(SHARE_URL);
  window.open(url, "_blank", "noopener,noreferrer");
});

document.getElementById("copyLink").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(SHARE_URL);
    toast("リンクをコピーしました");
  } catch (err) {
    toast("コピー失敗: " + (err.message || err), true);
  }
});

let dragCounter = 0;
document.addEventListener("dragenter", (e) => {
  if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes("Files")) return;
  e.preventDefault();
  dragCounter++;
  document.body.classList.add("dragging");
});
document.addEventListener("dragover", (e) => {
  if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes("Files")) return;
  e.preventDefault();
});
document.addEventListener("dragleave", (e) => {
  if (!document.body.classList.contains("dragging")) return;
  dragCounter--;
  if (dragCounter <= 0) {
    dragCounter = 0;
    document.body.classList.remove("dragging");
  }
});
document.addEventListener("drop", async (e) => {
  if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) {
    document.body.classList.remove("dragging");
    dragCounter = 0;
    return;
  }
  e.preventDefault();
  dragCounter = 0;
  document.body.classList.remove("dragging");
  const file = e.dataTransfer.files[0];
  if (!file.type || !file.type.startsWith("image/")) {
    toast("Not an image file", true);
    return;
  }
  try {
    await loadImage(file);
  } catch (err) {
    toast("Failed to load image: " + err.message, true);
  }
});

if (!IS_MAC) {
  document.querySelectorAll("[data-other]").forEach((el) => {
    el.textContent = el.dataset.other;
  });
}
saveBtn.title = `save as (${IS_MAC ? "⌘S" : "Ctrl+S"})`;

updateToolbarUI();
updateToolbarVisibility();
