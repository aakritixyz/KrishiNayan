export type LiveWeather = {
  temperature: number | null;
  humidity: number | null;
  wind_speed: number | null;
  rain: number | null;
  rain_expected: boolean;
  weather_code?: number | null;
  source: string;
  cache_status?: string;
  weather_service_version?: string;
};

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_CURRENT_FIELDS =
  "temperature_2m,relative_humidity_2m,rain,precipitation,wind_speed_10m,weather_code";

export function shouldUseBrowserWeatherFallback(weather: {
  source?: string | null;
  provider_error?: string | null;
} | null | undefined): boolean {
  if (!weather) return true;

  return (
    weather.source !== "Open-Meteo" &&
    Boolean(weather.provider_error?.includes("429"))
  );
}

export async function fetchBrowserOpenMeteoWeather(
  latitude: number,
  longitude: number
): Promise<LiveWeather> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: OPEN_METEO_CURRENT_FIELDS,
    timezone: "auto",
    forecast_days: "1",
  });

  const response = await fetch(`${OPEN_METEO_URL}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo browser request failed: ${response.status}`);
  }

  const data = await response.json();
  const current = data?.current ?? {};
  const rain =
    current.rain ?? current.precipitation ?? 0;

  return {
    temperature: current.temperature_2m ?? null,
    humidity: current.relative_humidity_2m ?? null,
    wind_speed: current.wind_speed_10m ?? null,
    rain,
    rain_expected: rain > 0,
    weather_code: current.weather_code ?? null,
    source: "Open-Meteo",
    cache_status: "browser-live",
    weather_service_version: "open-meteo-browser-fallback-v1",
  };
}
