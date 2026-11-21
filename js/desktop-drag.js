// Desktop-style dragging for the shortcut groups and the whoami.txt icon.
// Items keep their natural layout position and are offset with the CSS `translate`
// property, so they don't fight the intro animations that use `transform`.
const STORAGE_KEY = "desktop-layout-v2";
const DRAG_THRESHOLD = 5;
const MOBILE_QUERY = matchMedia("(max-width: 720px)");

const load = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } };
const save = (layout) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(layout)); } catch {} };

export function initDesktopDrag(items) {
  const layout = load();
  let topZ = 1;

  const taskbarHeight = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--taskbar-height")) || 50;
  const offsetOf = (el) => ({ x: Number(el.dataset.dx) || 0, y: Number(el.dataset.dy) || 0 });
  const apply = (el, x, y) => { el.dataset.dx = x; el.dataset.dy = y; el.style.translate = x || y ? `${x}px ${y}px` : ""; };

  // Keep the item fully inside the desktop area (above the taskbar).
  const clamp = (el, x, y) => {
    const rect = el.getBoundingClientRect(); const cur = offsetOf(el);
    const left = rect.left - cur.x; const top = rect.top - cur.y;
    const maxX = innerWidth - rect.width - left; const maxY = innerHeight - taskbarHeight() - rect.height - top;
    return { x: Math.round(Math.max(-left, Math.min(maxX, x))), y: Math.round(Math.max(-top, Math.min(maxY, y))) };
  };

  const applyAll = () => {
    items.forEach(({ el, key }) => {
      if (MOBILE_QUERY.matches) { el.style.translate = ""; return; }
      const saved = layout[key]; apply(el, saved?.x || 0, saved?.y || 0);
    });
  };

  const reclampAll = () => {
    if (MOBILE_QUERY.matches) return applyAll();
    items.forEach(({ el, key }) => { const cur = offsetOf(el); const next = clamp(el, cur.x, cur.y); apply(el, next.x, next.y); if (layout[key]) layout[key] = next; });
    save(layout);
  };

  // Swallow the click that follows a drag so links/apps don't open.
  const suppressNextClick = () => {
    const stop = (event) => { event.preventDefault(); event.stopPropagation(); };
    window.addEventListener("click", stop, { capture: true, once: true });
    setTimeout(() => window.removeEventListener("click", stop, { capture: true }), 0);
  };

  items.forEach(({ el, key }) => {
    el.classList.add("is-draggable");
    el.querySelectorAll("a, img").forEach((node) => node.setAttribute("draggable", "false"));
    if (el.matches("a")) el.setAttribute("draggable", "false");
    let drag = null;

    el.addEventListener("pointerdown", (event) => {
      if (MOBILE_QUERY.matches || event.button !== 0) return;
      const start = offsetOf(el);
      drag = { id: event.pointerId, sx: event.clientX, sy: event.clientY, ox: start.x, oy: start.y, moving: false };
    });

    el.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.sx; const dy = event.clientY - drag.sy;
      if (!drag.moving) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        drag.moving = true; el.setPointerCapture(event.pointerId); el.classList.add("is-dragging"); el.style.zIndex = String(++topZ);
      }
      const next = clamp(el, drag.ox + dx, drag.oy + dy); apply(el, next.x, next.y);
    });

    const end = (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      if (drag.moving) {
        el.classList.remove("is-dragging"); layout[key] = offsetOf(el); save(layout);
        if (event.type === "pointerup") suppressNextClick();
      }
      drag = null;
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("dragstart", (event) => event.preventDefault());
  });

  applyAll();
  window.addEventListener("resize", reclampAll);
  MOBILE_QUERY.addEventListener("change", applyAll);

  return { reset() { items.forEach(({ el, key }) => { delete layout[key]; apply(el, 0, 0); }); save(layout); } };
}
