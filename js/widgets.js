import { resolveLocationPlace, weatherConditions } from "./weather.js?v=3";

const defaultWeatherPlace = { name: "Manila", latitude: 14.5995, longitude: 120.9842 };

function initCalendarWidget() {
  const now = new Date();
  document.querySelector("#widget-calendar-day").textContent = now.toLocaleDateString([], { weekday: "long" });
  document.querySelector("#widget-calendar-date").textContent = now.getDate();
}

function initWeatherWidget() {
  const location = document.querySelector("#widget-weather-location");
  const icon = document.querySelector("#widget-weather-icon");
  const temperature = document.querySelector("#widget-weather-temp");
  const condition = document.querySelector("#widget-weather-condition");
  const range = document.querySelector("#widget-weather-range");
  let units = "celsius";
  try { units = localStorage.getItem("portfolio-weather-units") || units; } catch { /* Use Celsius when browser storage is unavailable. */ }

  async function loadWeather(place) {
    const params = new URLSearchParams({
      latitude: place.latitude, longitude: place.longitude,
      current: "temperature_2m,weather_code",
      daily: "temperature_2m_max,temperature_2m_min",
      temperature_unit: units, timezone: "auto", forecast_days: "1"
    });
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      const [label, symbol] = weatherConditions[data.current.weather_code] || ["Current conditions", "🌡️"];
      location.textContent = place.name;
      icon.textContent = symbol;
      temperature.textContent = `${Math.round(data.current.temperature_2m)}°`;
      condition.textContent = label;
      range.textContent = `H:${Math.round(data.daily.temperature_2m_max[0])}°  L:${Math.round(data.daily.temperature_2m_min[0])}°`;
      if (place !== defaultWeatherPlace) {
        try { localStorage.setItem("portfolio-weather-place", JSON.stringify(place)); } catch { /* Weather still works without caching. */ }
      }
    } catch {
      temperature.textContent = "Unavailable";
      condition.textContent = "Weather unavailable";
      range.textContent = "Open Weather to retry";
    }
  }

  let saved;
  try { saved = JSON.parse(localStorage.getItem("portfolio-weather-place")); } catch { /* Ignore malformed local cache. */ }
  window.addEventListener("portfolio-weather-change", ({ detail }) => {
    if (!detail?.place) return;
    units = detail.units || units;
    loadWeather(detail.place);
  });
  if (saved?.latitude && saved?.longitude) {
    if (saved.name === "Your location") resolveLocationPlace(saved.latitude, saved.longitude).then(loadWeather);
    else loadWeather(saved);
    return;
  }
  // Show useful weather immediately; visitors can choose another city or location in the Weather app.
  loadWeather(defaultWeatherPlace);
}

export function initDesktopWidgets() {
  initCalendarWidget();
  initWeatherWidget();
}