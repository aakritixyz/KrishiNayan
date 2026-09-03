"use client";

import BottomNav from "@/components/BottomNav";
import { API_BASE_URL, getStoredToken } from "@/lib/api";
import {
  fetchBrowserOpenMeteoWeather,
  shouldUseBrowserWeatherFallback,
} from "@/lib/live-weather";
import Image from "next/image";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  ScanLine,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useLanguage, type Language } from "@/lib/language-context";
import { tr } from "@/lib/static-translate";

const LANGUAGE_LABEL: Record<Language, string> = {
  en: "English",
  hi: "हिंदी",
  pa: "ਪੰਜਾਬੀ",
  mr: "मराठी",
};

const LANGUAGE_ORDER: Language[] = ["en", "hi", "pa", "mr"];

export default function ScanPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  const { language, setLanguage } = useLanguage();

  function toggleLanguage() {
    const currentIndex = LANGUAGE_ORDER.indexOf(language);
    const next = LANGUAGE_ORDER[(currentIndex + 1) % LANGUAGE_ORDER.length];
    setLanguage(next);
  }

  const scanSteps = useMemo(
    () => [
      tr("Uploading leaf photo", language),
      tr("Scanning crop", language),
      tr("Analyzing disease patterns", language),
      tr("Checking weather and soil context", language),
      tr("Forming recovery report", language),
    ],
    [language]
  );

  useEffect(() => {
    if (!isAnalyzing) {
      setScanStepIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setScanStepIndex((current) =>
        Math.min(current + 1, scanSteps.length - 1)
      );
    }, 2200);

    return () => window.clearInterval(interval);
  }, [isAnalyzing, scanSteps.length]);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    | "idle"
    | "requesting"
    | "matching"
    | "matched"
    | "no-match"
    | "denied"
    | "unsupported"
  >("idle");

  // Auto-detect device location, then reverse-geocode it (via the
  // free OpenStreetMap Nominatim API - no key needed) to a state +
  // district, and auto-select those in the dropdowns below if we
  // have soil/advisory data for them. The farmer can always change
  // the selection manually afterward - this only pre-fills it.
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("unsupported");
      return;
    }

    setLocationStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCoords({ latitude, longitude });
        setLocationStatus("matching");

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=8&addressdetails=1`,
            { headers: { Accept: "application/json" } }
          );

          const data = await response.json();
          const address = data?.address ?? {};

          const detectedState: string | undefined = address.state;
          const detectedDistrict: string | undefined =
            address.county ||
            address.state_district ||
            address.city_district ||
            address.city;

          if (detectedState) {
            setSelectedState(detectedState);

            // Wait a tick for the district list to load for this
            // state, then try to match the detected district in it.
            window.setTimeout(async () => {
              try {
                const districtsResponse = await fetch(
                  `${API_BASE_URL}/soil/districts?state=${encodeURIComponent(
                    detectedState
                  )}`
                );
                const districtsData = await districtsResponse.json();
                const availableDistricts: string[] =
                  districtsData.districts ?? [];

                const matchedDistrict = availableDistricts.find(
                  (district) =>
                    detectedDistrict &&
                    district.toLowerCase() ===
                      detectedDistrict.toLowerCase()
                );

                if (matchedDistrict) {
                  setSelectedDistrict(matchedDistrict);
                  setLocationStatus("matched");
                } else {
                  setLocationStatus("no-match");
                }
              } catch {
                setLocationStatus("no-match");
              }
            }, 300);
          } else {
            setLocationStatus("no-match");
          }
        } catch {
          setLocationStatus("no-match");
        }
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  type Crop = { id: string; label: string; available: boolean };
  type Plot = {
    id: number;
    name: string;
    crop: string;
    state: string | null;
    district: string | null;
    latitude: number | null;
    longitude: number | null;
  };

  const [crops, setCrops] = useState<Crop[]>([
    { id: "tomato", label: "Tomato", available: true },
  ]);
  const [selectedCrop, setSelectedCrop] = useState<string>("tomato");
  const [fieldLabel, setFieldLabel] = useState<string>("");
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlotId, setSelectedPlotId] = useState<string>("");

  const selectPlot = useCallback(function selectPlot(plot: Plot | null) {
    if (!plot) {
      setSelectedPlotId("");
      return;
    }

    setSelectedPlotId(String(plot.id));
    setSelectedCrop(plot.crop);
    setFieldLabel(plot.name);
    if (plot.state) setSelectedState(plot.state);
    if (plot.district) setSelectedDistrict(plot.district);
    if (plot.latitude !== null && plot.longitude !== null) {
      setCoords({ latitude: plot.latitude, longitude: plot.longitude });
    }
  }, []);

  useEffect(() => {
    async function loadCrops() {
      try {
        const response = await fetch(`${API_BASE_URL}/crops`);
        const data = await response.json();

        if (data.crops?.length) {
          setCrops(data.crops);
        }
      } catch {
        // Fall back to Tomato-only if the crops list can't be fetched.
      }
    }

    loadCrops();
  }, []);

  useEffect(() => {
    async function loadPlots() {
      const token = getStoredToken();
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/plots`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        const loadedPlots: Plot[] = data.plots ?? [];
        setPlots(loadedPlots);

        const requestedPlotId = new URLSearchParams(
          window.location.search
        ).get("plotId");
        const requested = loadedPlots.find(
          (plot) => String(plot.id) === requestedPlotId
        );
        if (requested) {
          selectPlot(requested);
        }
      } catch {
        setPlots([]);
      }
    }

    loadPlots();
  }, [selectPlot]);

  useEffect(() => {
    async function loadStates() {
      try {
        const response = await fetch(`${API_BASE_URL}/soil/states`);
        const data = await response.json();
        setStates(data.states ?? []);
      } catch {
        // Soil data is optional context — scanning still works without it.
        setStates([]);
      }
    }

    loadStates();
  }, []);

  useEffect(() => {
    if (!selectedState) {
      const timer = window.setTimeout(() => {
        setDistricts([]);
        setSelectedDistrict("");
      }, 0);

      return () => window.clearTimeout(timer);
    }

    async function loadDistricts() {
      setIsLoadingDistricts(true);
      setSelectedDistrict("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/soil/districts?state=${encodeURIComponent(
            selectedState
          )}`
        );
        const data = await response.json();
        setDistricts(data.districts ?? []);
      } catch {
        setDistricts([]);
      } finally {
        setIsLoadingDistricts(false);
      }
    }

    loadDistricts();
  }, [selectedState]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  const router = useRouter();

async function handleAnalyse() {
  if (!preview || !selectedFile || isAnalyzing) return;

  if (isOffline) {
    window.alert(
      tr(
        "You are offline. The app shell and saved records are available, but a new disease scan needs network.",
        language
      )
    );
    return;
  }

  setIsAnalyzing(true);
  setScanStepIndex(0);

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("crop", selectedCrop);

  if (selectedPlotId) {
    formData.append("plot_id", selectedPlotId);
  }

  if (coords) {
    formData.append("latitude", String(coords.latitude));
    formData.append("longitude", String(coords.longitude));
  }

  if (fieldLabel.trim()) {
    formData.append("field_label", fieldLabel.trim());
  }

  if (selectedState) {
    formData.append("state", selectedState);
  }

  if (selectedDistrict) {
    formData.append("district", selectedDistrict);
  }

  try {
    // Attach the auth token (if logged in) so the backend can fall
    // back to the farmer's saved state/district for the soil-context
    // lookup when they haven't picked one on this form. Anonymous
    // scans work exactly as before - this header is simply absent.
    const token = getStoredToken();

    const response = await fetch(
      `${API_BASE_URL}/predict`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.detail || "Unable to analyse this image."
      );
    }

    if (coords && shouldUseBrowserWeatherFallback(result.weather)) {
      try {
        const liveWeather = await fetchBrowserOpenMeteoWeather(
          coords.latitude,
          coords.longitude
        );

        result.weather = {
          ...result.weather,
          ...liveWeather,
          latitude: coords.latitude,
          longitude: coords.longitude,
          location_name: result.weather?.location_name,
        };
      } catch {
        // Prediction remains usable even if browser weather fallback fails.
      }
    }

    sessionStorage.setItem(
      "krishiNayanScanImage",
      preview
    );

    sessionStorage.setItem(
      "krishiNayanPrediction",
      JSON.stringify(result)
    );

    router.push("/result");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : tr("Backend connection failed.", language);

    window.alert(message);
  } finally {
    setIsAnalyzing(false);
  }
}

  return (
    <main className="app-main flex min-h-screen items-center justify-center bg-forest-deep sm:p-6 lg:items-start lg:justify-center">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden app-frame bg-cream px-5 pb-32 pt-8 sm:min-h-[844px] sm:rounded-[36px]">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">
          {tr("KrishiNayan Crop Scan", language)}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest">
          {tr("Check Crop Health", language)}
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted">
          {tr("Upload a clear leaf photo for disease analysis.", language)}
        </p>

        {isOffline && (
          <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm leading-6 text-forest">
            <strong>{tr("Offline mode:", language)}</strong>{" "}
            {tr(
              "saved pages and recent records are available, but new disease scans need network.",
              language
            )}
          </div>
        )}

        <div className="mt-7 overflow-hidden rounded-[28px] border-2 border-dashed border-forest/20 bg-white p-3">
          <input
            id="leaf-image"
            name="leaf-image"
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleImageChange}
            className="sr-only"
          />

          <input
            id="leaf-image-camera"
            name="leaf-image-camera"
            type="file"
            accept="image/png, image/jpeg"
            capture="environment"
            onChange={handleImageChange}
            className="sr-only"
          />

          {preview ? (
            <label
              htmlFor="leaf-image"
              className="relative block h-[340px] cursor-pointer overflow-hidden rounded-[22px]"
            >
              <Image
                src={preview}
                alt={tr("Selected leaf photo", language)}
                fill
                unoptimized
                className="object-cover"
              />

              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-forest-deep/80 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur">
                {tr("Tap here to choose another photo", language)}
              </div>
            </label>
          ) : (
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[22px] bg-forest/5 px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest text-leaf">
                <ImagePlus size={30} />
              </span>

              <h2 className="mt-5 text-lg font-bold text-forest">
                {tr("Add leaf photo", language)}
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                {tr("Take a clear photo or select one from your device.", language)}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <label
                  htmlFor="leaf-image-camera"
                  className="cursor-pointer rounded-full bg-forest px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
                >
                  {tr("Take Photo", language)}
                </label>

                <label
                  htmlFor="leaf-image"
                  className="cursor-pointer rounded-full bg-leaf px-6 py-3 text-sm font-bold text-forest-deep transition hover:opacity-90"
                >
                  {tr("Choose Photo", language)}
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="text-sm font-bold text-forest">{tr("Crop", language)}</p>

          {plots.length > 0 && (
            <label className="mb-3 mt-2 block text-xs font-semibold text-muted">
              {tr("Saved plot", language)}
              <select
                value={selectedPlotId}
                onChange={(event) => {
                  const plot = plots.find(
                    (item) => String(item.id) === event.target.value
                  );
                  selectPlot(plot ?? null);
                }}
                className="mt-1 w-full rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm font-medium text-forest"
              >
                <option value="">{tr("No plot selected", language)}</option>
                {plots.map((plot) => (
                  <option key={plot.id} value={plot.id}>
                    {plot.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <select
            value={selectedCrop}
            onChange={(event) => setSelectedCrop(event.target.value)}
            className="mt-2 w-full rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm font-medium text-forest"
          >
            {crops.map((crop) => (
              <option
                key={crop.id}
                value={crop.id}
                disabled={!crop.available}
              >
                {crop.label}
                {!crop.available ? ` (${tr("coming soon", language)})` : ""}
              </option>
            ))}
          </select>

          <label className="mt-3 block text-xs font-semibold text-muted">
            {tr("Field name (optional)", language)}
            <input
              value={fieldLabel}
              onChange={(event) => setFieldLabel(event.target.value)}
              placeholder={tr("e.g. North Plot", language)}
              className="mt-1 w-full rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm font-medium text-forest"
            />
          </label>
          <p className="mt-1 text-xs text-muted">
            {tr(
              "Name your field if you track more than one plot of the same crop - your Crop Health history is grouped by this.",
              language
            )}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-forest/10 bg-cream px-4 py-2 text-sm font-semibold text-forest">
              🌼 {tr("Flowering", language)}
            </span>

            <button
              type="button"
              onClick={toggleLanguage}
              className="rounded-full border border-forest/10 bg-cream px-4 py-2 text-sm font-semibold text-forest transition hover:border-leaf"
            >
              🌐 {LANGUAGE_LABEL[language]}
            </button>
          </div>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <MapPin size={14} className="text-leaf" />
          {locationStatus === "requesting" &&
            tr("Detecting your location...", language)}
          {locationStatus === "matching" &&
            tr("Location found — matching to your state/district...", language)}
          {locationStatus === "matched" &&
            `${tr("Auto-detected:", language)} ${selectedDistrict}, ${selectedState}. ${tr("Change below if needed.", language)}`}
          {locationStatus === "no-match" &&
            tr("Location detected, but we don't have soil data for your exact district yet — pick manually below.", language)}
          {locationStatus === "denied" &&
            tr("Location access denied — you can still pick state/district manually.", language)}
          {locationStatus === "unsupported" &&
            tr("Location isn't supported on this device — pick manually below.", language)}
        </p>

        <div className="mt-4 rounded-2xl bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-forest">
            <MapPin size={18} className="text-leaf" />
            {tr("Soil context (optional)", language)}
          </p>

          <p className="mt-1 text-xs leading-5 text-muted">
            {tr(
              "Choose your state and district to see how local soil conditions may be affecting your crop, alongside the leaf diagnosis.",
              language
            )}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <select
              value={selectedState}
              onChange={(event) => setSelectedState(event.target.value)}
              className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm font-medium text-forest"
            >
              <option value="">{tr("State", language)}</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(event) =>
                setSelectedDistrict(event.target.value)
              }
              disabled={!selectedState || isLoadingDistricts}
              className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm font-medium text-forest disabled:opacity-50"
            >
              <option value="">
                {isLoadingDistricts ? tr("Loading...", language) : tr("District", language)}
              </option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {states.length === 0 && (
            <p className="mt-2 text-xs text-muted">
              {tr(
                "Soil data is currently unavailable — diagnosis will still work without it.",
                language
              )}
            </p>
          )}
        </div>

        <div className="mt-5 rounded-[24px] border border-forest/10 bg-white p-4">
          <p className="font-bold text-forest">{tr("Scan quality checklist", language)}</p>

          <div className="mt-3 grid gap-2 text-sm text-muted">
            <p className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-forest" />
              {tr("Keep the full leaf visible", language)}
            </p>

            <p className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-forest" />
              {tr("Use natural or bright light", language)}
            </p>

            <p className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-forest" />
              {tr("Avoid a blurry image", language)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAnalyse}
          disabled={!preview || isAnalyzing || isOffline}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-5 py-4 font-bold text-forest-deep transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isAnalyzing ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <ScanLine size={22} />
          )}
          {isAnalyzing
            ? scanSteps[scanStepIndex]
            : isOffline
            ? tr("Scan needs network", language)
            : tr("Analyse Leaf", language)}
        </button>

        {isAnalyzing && (
          <div className="mt-3 rounded-2xl border border-forest/10 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-forest">
                {scanSteps[scanStepIndex]}...
              </p>
              <span className="text-xs font-semibold text-muted">
                {tr("Step", language)} {scanStepIndex + 1}/{scanSteps.length}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {scanSteps.map((step, index) => (
                <span
                  key={step}
                  className={`h-1.5 rounded-full ${
                    index <= scanStepIndex ? "bg-leaf" : "bg-forest/10"
                  }`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-muted">
              {tr(
                "Render Free can take a little longer while the ML model wakes up. Keep this page open.",
                language
              )}
            </p>
          </div>
        )}

        <BottomNav />
      </section>
    </main>
  );
}
