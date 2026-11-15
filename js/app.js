import { projects, projectMarkup } from "./projects.js";
import { calculatorMarkup, initCalculator } from "./calculator.js";
import { calendarMarkup, initCalendar } from "./calendar.js";
import { weatherMarkup, initWeather } from "./weather.js";
import { WindowManager } from "./window-manager.js";

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
const introStatus = document.querySelector(".startup-status");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let introTimer;
let desktopTimer;
let statusTimers = [];
let introStarted = false;

function startIntro() {
  if (introStarted) return;
  introStarted = true;
  startup.classList.add("is-running");
  startup.querySelector(".startup-sequence").setAttribute("aria-hidden", "false");
  const statusSteps = reducedMotion ? [] : [[350, "Mapping data pipelines"], [1250, "Loading intelligence models"], [2350, "Securing system perimeter"], [3450, "Connecting creative tools"], [4250, "Technology stack ready"]];
  statusSteps.forEach(([delay, text]) => statusTimers.push(setTimeout(() => { introStatus.textContent = text; }, delay)));
  introStatus.textContent = reducedMotion ? "System ready" : "Initializing technology stack";
  introTimer = setTimeout(finishIntro, reducedMotion ? 800 : 5400);
}

function hideStartup() {
  if (startup.hidden) return;
  startup.hidden = true;
  document.querySelector(".desktop-icon").focus();
}

function finishIntro() {
  if (startup.classList.contains("is-leaving")) return;
  clearTimeout(introTimer);
  statusTimers.forEach(clearTimeout);
  statusTimers = [];
  startup.classList.add("is-leaving");
  document.body.classList.add("desktop-entering");
  document.body.classList.remove("intro-active");
  desktop.removeAttribute("inert");
  startup.addEventListener("transitionend", (event) => {
    if (event.target === startup && event.propertyName === "opacity") hideStartup();
  });
  setTimeout(hideStartup, reducedMotion ? 50 : 950);
  desktopTimer = setTimeout(() => {
    document.body.classList.remove("desktop-entering");
    document.body.classList.add("desktop-ready");
  }, reducedMotion ? 50 : 1450);
}

skipIntro.addEventListener("click", finishIntro);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !startup.hidden) finishIntro();
});
startIntro();
skipIntro.focus();