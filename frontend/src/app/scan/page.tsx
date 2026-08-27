"use client";

import BottomNav from "@/components/BottomNav";
import { API_BASE_URL, getStoredToken } from "@/lib/api";
import Image from "next/image";
import {
  CheckCircle2,
  ImagePlus,
  MapPin,
  ScanLine,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/lib/language-context";
import { tr } from "@/lib/static-translate";

export default function ScanPage() {
  const { language } = useLanguage();
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
  const [fieldLabel, setFieldLabel] = useState<string>("");

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

  setIsAnalyzing(true);

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("crop", selectedCrop);

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
        result.detail || tr("Unable to analyse this image.", language)
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
        : tr("Backend connection failed.", language);

    window.alert(message);
  } finally {
    setIsAnalyzing(false);
  }
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-cream px-5 pb-32 pt-8 sm:min-h-[844px] sm:rounded-[36px]">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">
          {tr("KrishiNayan AI Scan", language)}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest">
          {tr("Check Crop Health", language)}
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted">
          {tr("Upload a clear leaf photo for disease analysis.", language)}
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
                alt={tr("Selected tomato leaf", language)}
                fill
                unoptimized
                className="object-cover"
              />

              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-forest-deep/80 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur">
                {tr("Tap here to choose another photo", language)}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[22px] bg-forest/5 px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest text-leaf">
                <ImagePlus size={30} />
              </span>

              <h2 className="mt-5 text-lg font-bold text-forest">
                {tr("Add tomato-leaf photo", language)}
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                {tr("Take a clear photo or select one from your device.", language)}
              </p>

              <span className="mt-5 rounded-full bg-leaf px-6 py-3 text-sm font-bold text-forest-deep">
                {tr("Choose Photo", language)}
              </span>
            </div>
          )}
        </label>

        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="text-sm font-bold text-forest">{tr("Crop", language)}</p>

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
                {tr(crop.label, language)}
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

            <LanguageSelector variant="light" />
          </div>
        </div>

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
          disabled={!preview || isAnalyzing}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-5 py-4 font-bold text-forest-deep transition disabled:cursor-not-allowed disabled:opacity-40"
        >
        <ScanLine size={22} />
          {isAnalyzing ? tr("Analysing Leaf...", language) : tr("Analyse Leaf", language)}
        </button>

        <BottomNav />
      </section>
    </main>
  );
}