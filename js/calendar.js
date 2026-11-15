const monthFormat = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const fullDateFormat = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

export function calendarMarkup() {
  return `<div class="calendar-app">
    <div class="calendar-toolbar">
      <div class="calendar-heading"><p>CALENDAR</p><h3 data-calendar-heading></h3></div>
      <div class="calendar-nav">
        <button type="button" data-calendar-nav="-1" aria-label="Previous month">←</button>
        <button type="button" data-calendar-nav="today">Today</button>
        <button type="button" data-calendar-nav="1" aria-label="Next month">→</button>
      </div>
    </div>
    <div class="calendar-weekdays" aria-hidden="true">${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => `<span>${day}</span>`).join("")}</div>
    <div class="calendar-grid" role="grid" aria-label="Calendar dates"></div>
    <p class="selected-date" aria-live="polite"></p>
  </div>`;
}

export function initCalendar(root) {
  const now = new Date(); let shown = new Date(now.getFullYear(), now.getMonth(), 1); let selected = new Date(now);
  const grid = root.querySelector(".calendar-grid"); const heading = root.querySelector("[data-calendar-heading]"); const selectedLabel = root.querySelector(".selected-date");
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  function render() {
    heading.textContent = monthFormat.format(shown);
    selectedLabel.textContent = fullDateFormat.format(selected);
    const start = new Date(shown.getFullYear(), shown.getMonth(), 1 - shown.getDay());
    grid.innerHTML = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start); date.setDate(start.getDate() + index);
      const classes = ["calendar-day"];
      if (date.getMonth() !== shown.getMonth()) classes.push("other-month");
      if (sameDay(date, now)) classes.push("today");
      if (sameDay(date, selected)) classes.push("selected");
      return `<button type="button" role="gridcell" class="${classes.join(" ")}" data-date="${date.getFullYear()}-${date.getMonth()}-${date.getDate()}" aria-label="${fullDateFormat.format(date)}">${date.getDate()}</button>`;
    }).join("");
  }
  root.addEventListener("click", (event) => {
    const nav = event.target.closest("[data-calendar-nav]");
    if (nav) {
      if (nav.dataset.calendarNav === "today") { shown = new Date(now.getFullYear(), now.getMonth(), 1); selected = new Date(now); }
      else shown = new Date(shown.getFullYear(), shown.getMonth() + Number(nav.dataset.calendarNav), 1);
      render(); return;
    }
    const day = event.target.closest("[data-date]");
    if (day) { const [year, month, date] = day.dataset.date.split("-").map(Number); selected = new Date(year, month, date); shown = new Date(year, month, 1); render(); }
  });
  render();
}