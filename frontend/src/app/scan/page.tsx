"use client";

import BottomNav from "@/components/BottomNav";
import Image from "next/image";
import {
  CheckCircle2,
  ImagePlus,
  MapPin,
  ScanLine,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { LANGUAGE_STORAGE_KEY, type Language } from "@/lib/hindiTranslations";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function ScanPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const stored = sessionStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (stored === "en" || stored === "hi") {
      setLanguage(stored);
    }
  }, []);

  function toggleLanguage() {
    const next: Language = language === "en" ? "hi" : "en";
    setLanguage(next);
    sessionStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  }

  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  type Crop = { id: string; label: string; available: boolean };

  const [crops, setCrops] = useState<Crop[]>([
    { id: "tomato", label: "Tomato", available: true },
  ]);
  const [selectedCrop, setSelectedCrop] = useState<string>("tomato");

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
      setDistricts([]);
      setSelectedDistrict("");
      return;
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

  setIsAnalyzing(true);

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("crop", selectedCrop);

  if (selectedState) {
    formData.append("state", selectedState);
  }

  if (selectedDistrict) {
    formData.append("district", selectedDistrict);
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/predict`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.detail || "Unable to analyse this image."
      );
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
        : "Backend connection failed.";

    window.alert(message);
  } finally {
    setIsAnalyzing(false);
  }
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-cream px-5 pb-32 pt-8 sm:min-h-[844px] sm:rounded-[36px]">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">
          KrishiNayan AI Scan
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest">
          Check Crop Health
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted">
          Upload a clear leaf photo for disease analysis.
        </p>

        <label
          htmlFor="leaf-image"
          className="mt-7 block cursor-pointer overflow-hidden rounded-[28px] border-2 border-dashed border-forest/20 bg-white p-3 transition hover:border-leaf"
        >
          <input
            id="leaf-image"
            name="leaf-image"
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleImageChange}
            className="sr-only"
          />

          {preview ? (
            <div className="relative h-[340px] overflow-hidden rounded-[22px]">
              <Image
                src={preview}
                alt="Selected tomato leaf"
                fill
                unoptimized
                className="object-cover"
              />

              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-forest-deep/80 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur">
                Tap here to choose another photo
              </div>
            </div>
          ) : (
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[22px] bg-forest/5 px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest text-leaf">
                <ImagePlus size={30} />
              </span>

              <h2 className="mt-5 text-lg font-bold text-forest">
                Add tomato-leaf photo
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Take a clear photo or select one from your device.
              </p>

              <span className="mt-5 rounded-full bg-leaf px-6 py-3 text-sm font-bold text-forest-deep">
                Choose Photo
              </span>
            </div>
          )}
        </label>

        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="text-sm font-bold text-forest">Crop</p>

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
                {!crop.available ? " (coming soon)" : ""}
              </option>
            ))}
          </select>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-forest/10 bg-cream px-4 py-2 text-sm font-semibold text-forest">
              🌼 Flowering
            </span>

            <button
              type="button"
              onClick={toggleLanguage}
              className="rounded-full border border-forest/10 bg-cream px-4 py-2 text-sm font-semibold text-forest transition hover:border-leaf"
            >
              🌐 {language === "en" ? "English" : "हिंदी"}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-forest">
            <MapPin size={18} className="text-leaf" />
            Soil context (optional)
          </p>

          <p className="mt-1 text-xs leading-5 text-muted">
            Choose your state and district to see how local soil
            conditions may be affecting your crop, alongside the
            leaf diagnosis.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <select
              value={selectedState}
              onChange={(event) => setSelectedState(event.target.value)}
              className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm font-medium text-forest"
            >
              <option value="">State</option>
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
                {isLoadingDistricts ? "Loading..." : "District"}
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
              Soil data is currently unavailable — diagnosis will
              still work without it.
            </p>
          )}
        </div>

        <div className="mt-5 rounded-[24px] border border-forest/10 bg-white p-4">
          <p className="font-bold text-forest">Scan quality checklist</p>

          <div className="mt-3 grid gap-2 text-sm text-muted">
            <p className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-forest" />
              Keep the full leaf visible
            </p>

            <p className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-forest" />
              Use natural or bright light
            </p>

            <p className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-forest" />
              Avoid a blurry image
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAnalyse}
          disabled={!preview}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-5 py-4 font-bold text-forest-deep transition disabled:cursor-not-allowed disabled:opacity-40"
        >
        <ScanLine size={22} />
          Analyse Leaf
        </button>

        <BottomNav />
      </section>
    </main>
  );
}