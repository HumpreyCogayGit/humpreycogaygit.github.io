import { projects, projectMarkup } from "./projects.js";
import { calculatorMarkup, initCalculator } from "./calculator.js";
import { calendarMarkup, initCalendar } from "./calendar.js";
import { weatherMarkup, initWeather } from "./weather.js";
import { WindowManager } from "./window-manager.js";
import { playIntroLines, LINES_REVEAL_AT } from "./intro-lines.js";

const apps = Object.fromEntries(Object.entries(projects).map(([id, project]) => [id, { title: project.title, shortTitle: project.name, accent: project.accent, render: () => projectMarkup(project) }]));
Object.assign(apps, {
  calculator: { title: "Calculator", accent: "#70f0c4", width: 390, render: calculatorMarkup, init: initCalculator },
  calendar: { title: "Calendar", accent: "#f06b7b", width: 650, render: calendarMarkup, init: initCalendar },
  weather: { title: "Weather", accent: "#6cccf2", width: 510, render: weatherMarkup, init: initWeather }
});

const manager = new WindowManager({ layer: document.querySelector("#window-layer"), taskbar: document.querySelector("#taskbar-apps"), template: document.querySelector("#window-template"), apps });
document.addEventListener("click", (event) => { const trigger = event.target.closest("[data-open]"); if (trigger) manager.open(trigger.dataset.open); });
document.querySelectorAll(".desktop-icon").forEach((icon) => icon.addEventListener("dblclick", (event) => event.preventDefault()));

const iconNav = document.querySelector(".desktop-icons"); const launcher = document.querySelector("#launcher");
launcher.addEventListener("click", () => {
  if (innerWidth > 720) return;
  const collapsed = iconNav.classList.toggle("is-collapsed");
  launcher.setAttribute("aria-expanded", String(!collapsed));
});

function updateClock() {
  const now = new Date(); document.querySelector("#clock-time").textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); document.querySelector("#clock-date").textContent = now.toLocaleDateString([], { month: "short", day: "numeric" });
  document.querySelector("#calendar-icon-month").textContent = now.toLocaleDateString([], { month: "short" }).toUpperCase(); document.querySelector("#calendar-icon-day").textContent = now.getDate();
}
updateClock(); setInterval(updateClock, 30000);

const startup = document.querySelector("#startup");
const desktop = document.querySelector("#desktop");
const skipIntro = document.querySelector("#startup-skip");
const introStatus = startup.querySelector(".startup-status");
const introName = document.querySelector("#startup-name");
const introCount = document.querySelector("#startup-count");
const introProgress = document.querySelector("#startup-progress");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const INTRO_MIN = 4400; // long enough for the line prelude and name sequence to play once
const INTRO_MAX = 6000; // never wait longer than this for assets
const statusSteps = [[0, "Starting up"], [.25, "Loading projects"], [.55, "Preparing workspace"], [.85, "Almost there"], [1, "Ready"]];
let introTimer;
let introFrame;
let revealTimer;
let stopIntroLines = () => {};
let introStarted = false;
let pageLoaded = document.readyState === "complete";
window.addEventListener("load", () => { pageLoaded = true; }, { once: true });

function setIntroProgress(value) {
  value = Math.min(Math.max(value, 0), 1);
  const percent = Math.round(value * 100);
  startup.style.setProperty("--p", value.toFixed(4));
  if (introCount.textContent !== String(percent)) {
    introCount.textContent = percent;
    introProgress.setAttribute("aria-valuenow", percent);
  }
  const status = statusSteps.findLast(([at]) => value >= at)[1];
  if (introStatus.textContent !== status) introStatus.textContent = status;
}

function revealName() {
  clearTimeout(revealTimer);
  startup.classList.add("is-revealed");
}

function startIntro() {
  if (introStarted) return;
  introStarted = true;
  startup.classList.add("is-running");
  if (reducedMotion) {
    revealName();
    setIntroProgress(1);
    introTimer = setTimeout(finishIntro, 800);
    return;
  }
  stopIntroLines = playIntroLines(document.querySelector("#startup-lines"), [...introName.querySelectorAll(".startup-name-line")]);
  revealTimer = setTimeout(revealName, LINES_REVEAL_AT);
  const startedAt = performance.now();
  let shown = 0;
  const tick = (now) => {
    const elapsed = Math.max(0, now - startedAt); // the first frame's timestamp can predate startedAt
    const paced = 1 - Math.pow(1 - Math.min(elapsed / INTRO_MIN, 1), 3);
    // Hold just short of done until the page's assets have actually loaded.
    const target = Math.min(paced, pageLoaded || elapsed > INTRO_MAX ? 1 : .92);
    shown += (target - shown) * .14;
    if (target - shown < .002) shown = target;
    setIntroProgress(shown);
    if (shown >= 1) { introTimer = setTimeout(finishIntro, 320); return; }
    introFrame = requestAnimationFrame(tick);
  };
  introFrame = requestAnimationFrame(tick);
}

// Move the loader's name onto the desktop heading so the two screens share one element.
function flyNameToHeading() {
  const heading = document.querySelector(".desktop-heading h1");
  if (reducedMotion || !heading || !heading.offsetParent || !introName.animate) return null;
  const from = introName.getBoundingClientRect();
  let x = 0; let y = 0;
  for (let node = heading; node && node !== desktop; node = node.offsetParent) { x += node.offsetLeft; y += node.offsetTop; }
  const scale = parseFloat(getComputedStyle(heading).fontSize) / parseFloat(getComputedStyle(introName).fontSize);
  return introName.animate(
    [{ transform: "none" }, { transform: `translate(${x - from.left}px, ${y - from.top}px) scale(${scale})` }],
    { duration: 850, easing: "cubic-bezier(.65,0,.2,1)", fill: "forwards" }
  );
}

function hideStartup() {
  if (startup.hidden) return;
  startup.hidden = true;
  document.body.classList.remove("intro-flying");
  document.querySelector(".desktop-icon").focus();
}

function finishIntro() {
  if (startup.classList.contains("is-leaving")) return;
  clearTimeout(introTimer);
  cancelAnimationFrame(introFrame);
  stopIntroLines();
  revealName(); // skipping mid-prelude still needs the name on screen for its flight
  const flight = flyNameToHeading();
  if (flight) {
    startup.classList.add("is-handoff");
    document.body.classList.add("intro-handoff", "intro-flying");
    flight.finished.then(hideStartup, hideStartup);
  }
  startup.classList.add("is-leaving");
  document.body.classList.add("desktop-entering");
  document.body.classList.remove("intro-active");
  desktop.removeAttribute("inert");
  setTimeout(hideStartup, reducedMotion ? 50 : 950);
  setTimeout(() => {
    document.body.classList.remove("desktop-entering", "intro-handoff");
    document.body.classList.add("desktop-ready");
  }, reducedMotion ? 50 : 1450);
}

if (!reducedMotion) {
  startup.addEventListener("pointermove", (event) => {
    startup.style.setProperty("--mx", (event.clientX / innerWidth - .5).toFixed(3));
    startup.style.setProperty("--my", (event.clientY / innerHeight - .5).toFixed(3));
  });
}
skipIntro.addEventListener("click", finishIntro);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !startup.hidden) finishIntro();
});
startIntro();
skipIntro.focus();
