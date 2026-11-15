const conditions = {
  0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"], 48: ["Rime fog", "🌫️"], 51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Heavy drizzle", "🌧️"],
  61: ["Light rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"], 71: ["Light snow", "🌨️"], 73: ["Snow", "🌨️"], 75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"], 81: ["Rain showers", "🌧️"], 82: ["Heavy showers", "⛈️"], 95: ["Thunderstorm", "⛈️"], 96: ["Storm with hail", "⛈️"], 99: ["Storm with hail", "⛈️"]
};

export function weatherMarkup() {
  return `<div class="weather-app">
    <form class="weather-search" role="search"><input type="search" name="city" placeholder="Search for a city" aria-label="City name" autocomplete="off"><button type="submit">Search</button></form>
    <div class="weather-card" aria-live="polite">
      <div><div class="weather-icon">🌤️</div><h3 class="weather-location">Weather</h3><p class="weather-condition">Search a city or use your location</p><div class="weather-temp">--°</div></div>
      <div class="weather-details"><div class="weather-detail"><span>HIGH</span><strong data-weather="high">--</strong></div><div class="weather-detail"><span>LOW</span><strong data-weather="low">--</strong></div><div class="weather-detail"><span>WIND</span><strong data-weather="wind">--</strong></div></div>
    </div>
    <div class="weather-actions"><button type="button" data-weather-action="locate">⌖ Use my location</button><button type="button" data-weather-action="units">°F</button></div>
    <p class="weather-status" aria-live="polite">Live data from Open-Meteo</p>
  </div>`;
}

export function initWeather(root) {
  let units = localStorage.getItem("portfolio-weather-units") || "celsius";
  let currentPlace = null;
  const status = root.querySelector(".weather-status"); const unitsButton = root.querySelector('[data-weather-action="units"]');
  unitsButton.textContent = units === "celsius" ? "°F" : "°C";
  const setStatus = (message) => { status.textContent = message; };
  async function loadWeather(place) {
    currentPlace = place; setStatus("Loading current weather…");
    const params = new URLSearchParams({ latitude: place.latitude, longitude: place.longitude, current: "temperature_2m,weather_code,wind_speed_10m", daily: "temperature_2m_max,temperature_2m_min", temperature_unit: units === "celsius" ? "celsius" : "fahrenheit", wind_speed_unit: units === "celsius" ? "kmh" : "mph", timezone: "auto", forecast_days: "1" });
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`); if (!response.ok) throw new Error("Weather service unavailable");
      const data = await response.json(); const [label, icon] = conditions[data.current.weather_code] || ["Current conditions", "🌡️"]; const degree = units === "celsius" ? "C" : "F";
      root.querySelector(".weather-icon").textContent = icon; root.querySelector(".weather-location").textContent = place.name; root.querySelector(".weather-condition").textContent = label;
      root.querySelector(".weather-temp").textContent = `${Math.round(data.current.temperature_2m)}°`;
      root.querySelector('[data-weather="high"]').textContent = `${Math.round(data.daily.temperature_2m_max[0])}°${degree}`;
      root.querySelector('[data-weather="low"]').textContent = `${Math.round(data.daily.temperature_2m_min[0])}°${degree}`;
      root.querySelector('[data-weather="wind"]').textContent = `${Math.round(data.current.wind_speed_10m)} ${units === "celsius" ? "km/h" : "mph"}`;
      setStatus(`Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Open-Meteo`);
      localStorage.setItem("portfolio-weather-place", JSON.stringify(place));
    } catch (error) { setStatus(`${error.message}. Check your connection and try again.`); }
  }
  async function searchCity(query) {
    setStatus(`Searching for ${query}…`);
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`); if (!response.ok) throw new Error("Search unavailable");
      const data = await response.json(); if (!data.results?.length) throw new Error("No matching city found"); const result = data.results[0];
      await loadWeather({ name: `${result.name}${result.country_code ? `, ${result.country_code}` : ""}`, latitude: result.latitude, longitude: result.longitude });
    } catch (error) { setStatus(error.message); }
  }
  root.querySelector(".weather-search").addEventListener("submit", (event) => { event.preventDefault(); const query = new FormData(event.currentTarget).get("city").trim(); if (query) searchCity(query); });
  root.querySelector('[data-weather-action="locate"]').addEventListener("click", () => {
    if (!navigator.geolocation) { setStatus("Geolocation is not supported. Search for a city instead."); return; }
    setStatus("Requesting your location…");
    navigator.geolocation.getCurrentPosition((position) => loadWeather({ name: "Your location", latitude: position.coords.latitude, longitude: position.coords.longitude }), () => setStatus("Location was unavailable. Search for a city instead."), { timeout: 10000 });
  });
  unitsButton.addEventListener("click", () => { units = units === "celsius" ? "fahrenheit" : "celsius"; localStorage.setItem("portfolio-weather-units", units); unitsButton.textContent = units === "celsius" ? "°F" : "°C"; if (currentPlace) loadWeather(currentPlace); });
  try { const saved = JSON.parse(localStorage.getItem("portfolio-weather-place")); if (saved?.latitude) loadWeather(saved); } catch { /* Ignore malformed local cache. */ }
}