"use client";

import BottomNav from "@/components/BottomNav";
import { apiJson, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { tr } from "@/lib/static-translate";
import {
  ArrowLeft,
  Camera,
  MapPin,
  IndianRupee,
  Calendar,
  Check,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const EQUIPMENT_TYPES = [
  "tractor",
  "harvester",
  "sprayer",
  "sensor",
  "plow",
  "pump",
  "cultivator",
  "thresher",
];

const CONDITIONS = ["excellent", "good", "fair", "needs_repair"];

const EMPTY_FORM = {
  equipment_type: "tractor",
  equipment_name: "",
  brand: "",
  model: "",
  year_manufactured: "",
  condition: "good",
  rental_price_per_day: "",
  rental_price_per_hour: "",
  security_deposit: "",
  state: "",
  district: "",
  village: "",
  latitude: "",
  longitude: "",
  location_description: "",
  available_from: "",
  available_until: "",
  description: "",
};

export default function CreateEquipmentPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isGuest } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setForm((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        () => {
          // Use default location if geolocation fails
          setUserLocation({ lat: 30.9330, lon: 75.8527 });
        }
      );
    }
  }, []);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos((prev) => [...prev, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      setPreviewUrls((prev) => [...prev, url]);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isGuest) {
      setError("Guest mode is read-only. Create an account to list equipment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload photos first
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const formData = new FormData();
        formData.append("file", photo);
        formData.append("bucket", "equipment-photos");

        const uploadResponse = await apiJson<{ url: string }>("/storage/upload", {
          method: "POST",
          body: formData,
        });
        photoUrls.push(uploadResponse.url);
      }

      // Create equipment listing
      const data = await apiJson<{ listing: { id: number } }>("/equipment/listings", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          rental_price_per_day: Number(form.rental_price_per_day),
          rental_price_per_hour: form.rental_price_per_hour ? Number(form.rental_price_per_hour) : null,
          security_deposit: Number(form.security_deposit),
          year_manufactured: form.year_manufactured ? Number(form.year_manufactured) : null,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          photos: photoUrls,
          primary_photo: photoUrls[0] || null,
        }),
      });

      router.push(`/equipment/${data.listing.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "Couldn't create equipment listing."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-main flex min-h-screen items-center justify-center bg-forest-deep sm:p-6 lg:items-start lg:justify-center">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden app-frame bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest"
            aria-label={tr("Go back", language)}
          >
            <ArrowLeft size={21} />
          </button>
          <h1 className="text-lg font-bold text-forest">
            {tr("List Equipment", language)}
          </h1>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf text-forest-deep">
            <span className="text-sm font-bold">{step}/2</span>
          </div>
        </header>

        {error && (
          <div className="mt-4 rounded-2xl border border-danger/20 bg-white p-3 text-sm font-semibold text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="mt-5 space-y-4">
              {/* Photo Upload */}
              <div className="rounded-[22px] bg-white p-4">
                <h2 className="flex items-center gap-2 font-bold text-forest">
                  <Camera size={18} className="text-leaf" />
                  {tr("Add Photos", language)}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Show your equipment from different angles
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={url}
                        alt={`Equipment photo ${index + 1}`}
                        className="h-full w-full rounded-xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {previewUrls.length < 5 && (
                    <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-forest/20 bg-forest/5 hover:border-leaf">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Camera size={24} className="text-muted" />
                    </label>
                  )}
                </div>
              </div>

              {/* Equipment Type */}
              <div className="rounded-[22px] bg-white p-4">
                <h2 className="flex items-center gap-2 font-bold text-forest">
                  <Check size={18} className="text-leaf" />
                  {tr("Equipment Type", language)}
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {EQUIPMENT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, equipment_type: type })}
                      className={`rounded-xl border p-3 text-sm font-medium capitalize ${
                        form.equipment_type === type
                          ? "border-leaf bg-leaf/10 text-forest"
                          : "border-forest/15 bg-forest/5 text-forest"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Details */}
              <div className="rounded-[22px] bg-white p-4">
                <h2 className="flex items-center gap-2 font-bold text-forest">
                  <Check size={18} className="text-leaf" />
                  {tr("Basic Details", language)}
                </h2>
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    value={form.equipment_name}
                    onChange={(e) => setForm({ ...form, equipment_name: e.target.value })}
                    placeholder="Equipment name (e.g., Mahindra Tractor)"
                    required
                    className="w-full rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      placeholder="Brand"
                      className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      placeholder="Model"
                      className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={form.year_manufactured}
                      onChange={(e) => setForm({ ...form, year_manufactured: e.target.value })}
                      placeholder="Year (e.g., 2020)"
                      min="1990"
                      max={new Date().getFullYear()}
                      className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                    />
                    <select
                      value={form.condition}
                      onChange={(e) => setForm({ ...form, condition: e.target.value })}
                      className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                    >
                      {CONDITIONS.map((condition) => (
                        <option key={condition} value={condition}>
                          {condition.charAt(0).toUpperCase() + condition.slice(1).replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={photos.length === 0 || !form.equipment_name}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3 font-bold text-forest-deep disabled:opacity-50"
              >
                {tr("Next", language)}
                <ArrowLeft size={18} className="rotate-180" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-5 space-y-4">
              {/* Pricing */}
              <div className="rounded-[22px] bg-white p-4">
                <h2 className="flex items-center gap-2 font-bold text-forest">
                  <IndianRupee size={18} className="text-leaf" />
                  {tr("Pricing", language)}
                </h2>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <IndianRupee size={16} className="text-muted" />
                    <input
                      type="number"
                      value={form.rental_price_per_day}
                      onChange={(e) => setForm({ ...form, rental_price_per_day: e.target.value })}
                      placeholder="Price per day"
                      required
                      min="0"
                      className="flex-1 rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                    />
                    <span className="text-sm text-muted">/day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee size={16} className="text-muted" />
                    <input
                      type="number"
                      value={form.rental_price_per_hour}
                      onChange={(e) => setForm({ ...form, rental_price_per_hour: e.target.value })}
                      placeholder="Price per hour (optional)"
                      min="0"
                      className="flex-1 rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                    />
                    <span className="text-sm text-muted">/hr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee size={16} className="text-muted" />
                    <input
                      type="number"
                      value={form.security_deposit}
                      onChange={(e) => setForm({ ...form, security_deposit: e.target.value })}
                      placeholder="Security deposit (optional)"
                      min="0"
                      className="flex-1 rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                  />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="rounded-[22px] bg-white p-4">
                <h2 className="flex items-center gap-2 font-bold text-forest">
                  <MapPin size={18} className="text-leaf" />
                  {tr("Location", language)}
                </h2>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-2 rounded-xl bg-forest/5 p-2">
                    <MapPin size={16} className="text-leaf" />
                    <span className="text-sm text-forest">
                      {userLocation ? "Using your GPS location" : "Default: Punjab, India"}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.location_description}
                    onChange={(e) => setForm({ ...form, location_description: e.target.value })}
                    placeholder="Landmark (e.g., Near village temple)"
                    className="w-full rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      placeholder="District"
                      className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="State"
                      className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="rounded-[22px] bg-white p-4">
                <h2 className="flex items-center gap-2 font-bold text-forest">
                  <Calendar size={18} className="text-leaf" />
                  {tr("Availability", language)}
                </h2>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-xs text-muted">Available from</label>
                    <input
                      type="date"
                      value={form.available_from}
                      onChange={(e) => setForm({ ...form, available_from: e.target.value })}
                      required
                      className="w-full rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted">Available until (optional)</label>
                    <input
                      type="date"
                      value={form.available_until}
                      onChange={(e) => setForm({ ...form, available_until: e.target.value })}
                      className="w-full rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-[22px] bg-white p-4">
                <h2 className="flex items-center gap-2 font-bold text-forest">
                  <Check size={18} className="text-leaf" />
                  {tr("Description", language)}
                </h2>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your equipment, working condition, any special features..."
                  rows={3}
                  className="mt-3 w-full rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-forest/15 bg-white px-4 py-3 font-bold text-forest"
                >
                  <ArrowLeft size={18} />
                  {tr("Back", language)}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3 font-bold text-forest-deep disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      {tr("List Equipment", language)}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <BottomNav />
      </section>
    </main>
  );
}