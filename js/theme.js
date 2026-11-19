// Light/dark theme switching shared by every page.
// The initial theme is applied by a tiny inline script in each page's <head> (no flash of the wrong
// theme); this file wires up [data-theme-toggle] buttons and animates the switch.
(() => {
  const STORAGE_KEY = "theme";
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const THEME_COLORS = { light: "#ffffff", dark: "#0b1120" };

  const readStored = () => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } };
  const store = (value) => { try { localStorage.setItem(STORAGE_KEY, value); } catch { /* private mode */ } };
  const current = () => (root.dataset.theme === "dark" ? "dark" : "light");

  function apply(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    metaThemeColor?.setAttribute("content", THEME_COLORS[theme]);
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const next = theme === "dark" ? "light" : "dark";
      button.setAttribute("aria-label", `Switch to ${next} mode`);
      button.setAttribute("aria-pressed", String(theme === "dark"));
      button.title = `Switch to ${next} mode`;
    });
  }

  function switchTheme(theme, origin) {
    if (theme === current()) return;
    if (reducedMotion.matches) { apply(theme); return; }

    // Circular reveal that grows out of the toggle button.
    const rect = origin?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : innerHeight / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.style.setProperty("--theme-r", `${radius}px`);

    origin?.classList.remove("is-spinning");
    void origin?.offsetWidth;
    origin?.classList.add("is-spinning");

    if (document.startViewTransition) {
      root.classList.add("theme-switching");
      const transition = document.startViewTransition(() => apply(theme));
      transition.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 750, easing: "cubic-bezier(.65, 0, .35, 1)", pseudoElement: "::view-transition-new(root)" }
        );
        root.animate(
          { transform: ["scale(1)", "scale(.97)"], filter: ["blur(0)", "blur(2px)"] },
          { duration: 750, easing: "ease-in", pseudoElement: "::view-transition-old(root)" }
        );
      }).catch(() => {});
      transition.finished.finally(() => root.classList.remove("theme-switching"));
      return;
    }

    // Fallback: a coloured wave sweeps out from the button, the theme swaps underneath, then it fades.
    const wave = document.createElement("div");
    wave.className = `theme-wave theme-wave-${theme}`;
    document.body.append(wave);
    wave.addEventListener("animationend", (event) => {
      if (event.animationName === "theme-wave-grow") {
        apply(theme);
        wave.classList.add("is-fading");
      } else {
        wave.remove();
      }
    });
  }

  apply(current());

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-toggle]");
    if (!button) return;
    const next = current() === "dark" ? "light" : "dark";
    store(next);
    switchTheme(next, button);
  });

  // Follow the operating system until the visitor picks a theme themselves.
  systemDark.addEventListener("change", (event) => {
    if (!readStored()) switchTheme(event.matches ? "dark" : "light");
  });
})();
