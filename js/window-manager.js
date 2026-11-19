export class WindowManager {
  constructor({ layer, taskbar, template, apps }) {
    this.layer = layer; this.taskbar = taskbar; this.template = template; this.apps = apps; this.windows = new Map(); this.topZ = 20; this.cascade = 0;
    window.addEventListener("resize", () => this.keepWindowsVisible());
  }
  open(id) {
    const existing = this.windows.get(id);
    if (existing) { existing.element.classList.remove("is-minimized"); this.focus(id); return; }
    const app = this.apps[id]; if (!app) return;
    const element = this.template.content.firstElementChild.cloneNode(true); element.dataset.app = id; element.style.setProperty("--window-accent", app.accent); element.querySelector(".window-title").textContent = app.title; element.setAttribute("aria-label", app.title);
    element.querySelector(".window-content").innerHTML = app.render();
    const offset = this.cascade++ % 6; element.style.left = `${Math.max(10, (innerWidth - Math.min(app.width || 820, innerWidth - 40)) / 2 + offset * 18)}px`; element.style.top = `${Math.max(10, 30 + offset * 18)}px`;
    const taskButton = document.createElement("button"); taskButton.type = "button"; taskButton.className = "task-button"; taskButton.style.setProperty("--button-accent", app.accent); taskButton.innerHTML = `<span>${app.shortTitle || app.title}</span>`; taskButton.setAttribute("aria-label", `Show ${app.title}`);
    this.layer.append(element); this.taskbar.append(taskButton); this.windows.set(id, { element, taskButton, app });
    element.querySelector(".window-controls").addEventListener("click", (event) => { const action = event.target.closest("[data-window-action]")?.dataset.windowAction; if (action) this[action](id); });
    element.addEventListener("pointerdown", () => this.focus(id)); taskButton.addEventListener("click", () => { if (element.classList.contains("is-minimized")) { element.classList.remove("is-minimized"); this.focus(id); } else if (element.style.zIndex === String(this.topZ)) this.minimize(id); else this.focus(id); });
    this.makeDraggable(id); this.makeResizable(id); this.focus(id); app.init?.(element.querySelector(".window-content"));
    requestAnimationFrame(() => element.focus({ preventScroll: true }));
  }
  focus(id) {
    const record = this.windows.get(id); if (!record) return; this.topZ += 1; record.element.style.zIndex = this.topZ;
    this.windows.forEach(({ taskButton }, key) => taskButton.classList.toggle("is-active", key === id));
  }
  close(id) { const record = this.windows.get(id); if (!record) return; record.element.remove(); record.taskButton.remove(); this.windows.delete(id); }
  minimize(id) { const record = this.windows.get(id); if (!record) return; record.element.classList.add("is-minimized"); record.taskButton.classList.remove("is-active"); }
  maximize(id) { const record = this.windows.get(id); if (!record) return; record.element.classList.toggle("is-maximized"); this.focus(id); }
  makeDraggable(id) {
    const record = this.windows.get(id); const bar = record.element.querySelector(".window-titlebar"); let drag = null;
    bar.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button") || record.element.classList.contains("is-maximized") || innerWidth <= 720) return;
      const rect = record.element.getBoundingClientRect(); drag = { x: event.clientX - rect.left, y: event.clientY - rect.top }; bar.setPointerCapture(event.pointerId);
    });
    bar.addEventListener("pointermove", (event) => { if (!drag) return; const maxX = innerWidth - record.element.offsetWidth; const maxY = innerHeight - 80; record.element.style.left = `${Math.max(0, Math.min(maxX, event.clientX - drag.x))}px`; record.element.style.top = `${Math.max(0, Math.min(maxY, event.clientY - drag.y))}px`; });
    bar.addEventListener("pointerup", () => { drag = null; });
    bar.addEventListener("dblclick", (event) => { if (!event.target.closest("button")) this.maximize(id); });
  }
  // Windows-style resizing from any edge or corner.
  makeResizable(id) {
    const { element } = this.windows.get(id);
    const handles = document.createElement("div"); handles.className = "window-resize-handles"; handles.setAttribute("aria-hidden", "true");
    ["n", "e", "s", "w", "ne", "se", "sw", "nw"].forEach((dir) => { const handle = document.createElement("span"); handle.className = `window-resize window-resize-${dir}`; handle.dataset.dir = dir; handles.append(handle); });
    element.append(handles);
    let resize = null;
    handles.addEventListener("pointerdown", (event) => {
      const dir = event.target.dataset?.dir;
      if (!dir || event.button !== 0 || element.classList.contains("is-maximized") || innerWidth <= 720) return;
      event.preventDefault(); this.focus(id);
      const style = getComputedStyle(element);
      resize = { dir, id: event.pointerId, sx: event.clientX, sy: event.clientY, left: element.offsetLeft, top: element.offsetTop, width: element.offsetWidth, height: element.offsetHeight, minW: parseFloat(style.minWidth) || 310, minH: parseFloat(style.minHeight) || 350 };
      event.target.setPointerCapture(event.pointerId); element.classList.add("is-resizing");
    });
    handles.addEventListener("pointermove", (event) => {
      if (!resize || event.pointerId !== resize.id) return;
      const r = resize; const dx = event.clientX - r.sx; const dy = event.clientY - r.sy;
      const bounds = this.layer.getBoundingClientRect(); const maxW = bounds.width; const maxH = bounds.height;
      let { left, top, width, height } = r;
      if (r.dir.includes("e")) width = Math.min(maxW - left, Math.max(r.minW, r.width + dx));
      if (r.dir.includes("s")) height = Math.min(maxH - top, Math.max(r.minH, r.height + dy));
      if (r.dir.includes("w")) { const right = r.left + r.width; left = Math.max(0, Math.min(right - r.minW, r.left + dx)); width = right - left; }
      if (r.dir.includes("n")) { const bottom = r.top + r.height; top = Math.max(0, Math.min(bottom - r.minH, r.top + dy)); height = bottom - top; }
      Object.assign(element.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` });
    });
    const end = (event) => { if (!resize || event.pointerId !== resize.id) return; resize = null; element.classList.remove("is-resizing"); };
    handles.addEventListener("pointerup", end); handles.addEventListener("pointercancel", end);
  }
  keepWindowsVisible() { this.windows.forEach(({ element }) => { if (innerWidth <= 720 || element.classList.contains("is-maximized")) return; if (element.style.width && element.offsetWidth > innerWidth) element.style.width = `${innerWidth}px`; if (element.style.height && element.offsetHeight > this.layer.clientHeight) element.style.height = `${this.layer.clientHeight}px`; const rect = element.getBoundingClientRect(); element.style.left = `${Math.max(0, Math.min(innerWidth - 100, rect.left))}px`; element.style.top = `${Math.max(0, Math.min(innerHeight - 110, rect.top))}px`; }); }
}