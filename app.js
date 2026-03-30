"use strict";

const PITTSBURGH_COORDS = { latitude: 40.4406, longitude: -79.9959 };
const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=40.4406&longitude=-79.9959&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York";

const OUTFIT_PRESETS = {
  rain: { emoji: "🧥", label: "Rain jacket + boots", mood: "Grabbing an umbrella today!" },
  snow: { emoji: "🧣", label: "Puffer coat + beanie + scarf", mood: "Snow day mode: extra cozy layers." },
  cold: { emoji: "🧶", label: "Warm sweater + scarf", mood: "Chilly air means warm knitwear." },
  windy: { emoji: "🥽", label: "Windbreaker", mood: "Hold onto your hat — it is breezy out." },
  sunny: { emoji: "👒", label: "Sun hat + light tee", mood: "Bright skies call for light layers." },
  hot: { emoji: "🕶️", label: "Tank top + shades", mood: "Keeping it cool in the heat." },
  cloudy: { emoji: "🧥", label: "Comfy hoodie", mood: "Cloud cover means cozy comfort." }
};

const WEATHER_LABELS = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light rain showers",
  81: "Rain showers",
  82: "Heavy rain showers",
  85: "Light snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm"
};

const SEASON_CONFIG = {
  spring: { label: "Spring", decor: "🌸 🌿 🌸", className: "season-spring" },
  summer: { label: "Summer", decor: "🌞 🏞️ 🌻", className: "season-summer" },
  autumn: { label: "Autumn", decor: "🍂 🍁 🍂", className: "season-autumn" },
  winter: { label: "Winter", decor: "❄️ ⛄ ❄️", className: "season-winter" }
};

const state = {
  weatherOutfit: "cloudy",
  autoOutfit: true
};

const dom = {
  refreshWeatherBtn: document.querySelector("#refreshWeatherBtn"),
  weatherMeta: document.querySelector("#weatherMeta"),
  seasonScene: document.querySelector("#seasonScene"),
  seasonBadge: document.querySelector("#seasonBadge"),
  weatherBadge: document.querySelector("#weatherBadge"),
  sceneDecor: document.querySelector("#sceneDecor"),
  outfitEmoji: document.querySelector("#outfitEmoji"),
  outfitLabel: document.querySelector("#outfitLabel"),
  moodLine: document.querySelector("#moodLine"),
  forecastList: document.querySelector("#forecastList"),
  autoOutfitToggle: document.querySelector("#autoOutfitToggle"),
  manualOutfitSelect: document.querySelector("#manualOutfitSelect"),
  spotifyPresetSelect: document.querySelector("#spotifyPresetSelect"),
  spotifyUrlInput: document.querySelector("#spotifyUrlInput"),
  applySpotifyUrlBtn: document.querySelector("#applySpotifyUrlBtn"),
  spotifyUrlError: document.querySelector("#spotifyUrlError"),
  spotifyEmbed: document.querySelector("#spotifyEmbed")
};

function getSeason(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

function mapWeatherToOutfit(current) {
  const code = current.weather_code;
  const temp = current.temperature_2m;
  const wind = current.wind_speed_10m;

  const rainyCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82];
  const snowyCodes = [71, 73, 75, 77, 85, 86];
  const stormCodes = [95, 96, 99];
  const clearCodes = [0, 1];
  const cloudyCodes = [2, 3, 45, 48];

  if (snowyCodes.includes(code) || temp <= 30) return "snow";
  if (rainyCodes.includes(code) || stormCodes.includes(code)) return "rain";
  if (wind >= 20) return "windy";
  if (temp >= 86) return "hot";
  if (temp <= 45) return "cold";
  if (clearCodes.includes(code)) return "sunny";
  if (cloudyCodes.includes(code)) return "cloudy";
  return "cloudy";
}

function formatWeather(current) {
  const label = WEATHER_LABELS[current.weather_code] || "Unknown conditions";
  return `${label} • ${Math.round(current.temperature_2m)}°F (feels ${Math.round(
    current.apparent_temperature
  )}°F)`;
}

function applySeasonVisuals() {
  const season = getSeason();
  const config = SEASON_CONFIG[season];
  dom.seasonBadge.textContent = config.label;
  dom.sceneDecor.textContent = config.decor;

  dom.seasonScene.classList.remove("season-spring", "season-summer", "season-autumn", "season-winter");
  dom.seasonScene.classList.add(config.className);
}

function applyOutfit(outfitKey) {
  const outfit = OUTFIT_PRESETS[outfitKey] || OUTFIT_PRESETS.cloudy;
  dom.outfitEmoji.textContent = outfit.emoji;
  dom.outfitLabel.textContent = outfit.label;
  dom.moodLine.textContent = outfit.mood;
  dom.manualOutfitSelect.value = outfitKey;
}

function renderForecast(daily) {
  dom.forecastList.innerHTML = "";
  const totalDays = Math.min(4, daily.time.length);
  for (let i = 0; i < totalDays; i += 1) {
    const date = new Date(`${daily.time[i]}T12:00:00`);
    const dayLabel = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    const weatherLabel = WEATHER_LABELS[daily.weather_code[i]] || "Mixed";
    const line = document.createElement("li");
    line.innerHTML = `<span>${dayLabel}</span><span>${Math.round(daily.temperature_2m_min[i])}° - ${Math.round(
      daily.temperature_2m_max[i]
    )}° • ${weatherLabel}</span>`;
    dom.forecastList.appendChild(line);
  }
}

async function loadWeather() {
  dom.weatherMeta.textContent = "Refreshing Pittsburgh forecast...";
  dom.weatherBadge.textContent = "Loading...";

  try {
    const response = await fetch(WEATHER_URL);
    if (!response.ok) {
      throw new Error(`Weather request failed: ${response.status}`);
    }

    const weatherData = await response.json();
    const current = weatherData.current;
    state.weatherOutfit = mapWeatherToOutfit(current);

    dom.weatherMeta.textContent = `Pittsburgh, PA (${PITTSBURGH_COORDS.latitude.toFixed(
      2
    )}, ${PITTSBURGH_COORDS.longitude.toFixed(2)})`;
    dom.weatherBadge.textContent = formatWeather(current);
    renderForecast(weatherData.daily);

    if (state.autoOutfit) {
      applyOutfit(state.weatherOutfit);
    }
  } catch (error) {
    dom.weatherMeta.textContent = "Could not fetch weather. Using a cozy fallback outfit.";
    dom.weatherBadge.textContent = "Weather unavailable";
    dom.forecastList.innerHTML =
      "<li><span>Tip</span><span>Check your internet connection and refresh.</span></li>";
    if (state.autoOutfit) {
      applyOutfit("cloudy");
    }
    console.error(error);
  }
}

function toSpotifyEmbedUrl(rawUrl) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  const url = new URL(trimmed);
  if (url.hostname !== "open.spotify.com") return null;

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const [type, id] = parts;
  const supported = ["track", "album", "playlist", "episode", "show", "artist"];
  if (!supported.includes(type)) return null;

  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
}

function applySpotifyUrl(url) {
  dom.spotifyEmbed.src = url;
  dom.spotifyPresetSelect.value = url;
}

function setupEvents() {
  dom.refreshWeatherBtn.addEventListener("click", () => {
    loadWeather();
  });

  dom.autoOutfitToggle.addEventListener("change", (event) => {
    state.autoOutfit = event.target.checked;
    dom.manualOutfitSelect.disabled = state.autoOutfit;
    if (state.autoOutfit) {
      applyOutfit(state.weatherOutfit);
    } else {
      applyOutfit(dom.manualOutfitSelect.value);
    }
  });

  dom.manualOutfitSelect.addEventListener("change", (event) => {
    if (!state.autoOutfit) {
      applyOutfit(event.target.value);
    }
  });

  dom.spotifyPresetSelect.addEventListener("change", (event) => {
    applySpotifyUrl(event.target.value);
    dom.spotifyUrlError.textContent = "";
  });

  dom.applySpotifyUrlBtn.addEventListener("click", () => {
    dom.spotifyUrlError.textContent = "";
    try {
      const embedUrl = toSpotifyEmbedUrl(dom.spotifyUrlInput.value);
      if (!embedUrl) {
        dom.spotifyUrlError.textContent = "Please enter a valid Spotify URL (track, playlist, album, etc.).";
        return;
      }
      applySpotifyUrl(embedUrl);
      dom.spotifyUrlInput.value = "";
    } catch {
      dom.spotifyUrlError.textContent = "Invalid URL format. Paste a full Spotify URL.";
    }
  });
}

function init() {
  applySeasonVisuals();
  applyOutfit("cloudy");
  dom.manualOutfitSelect.disabled = true;
  setupEvents();
  loadWeather();
}

init();
