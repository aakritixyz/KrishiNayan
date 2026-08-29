"use client";

import BottomNav from "@/components/BottomNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiJson, ApiError } from "@/lib/api";
import { useAuth, type Profile } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CloudOff,
  LogOut,
  MapPin,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLanguage } from "@/lib/language-context";
import { tr } from "@/lib/static-translate";


const GUEST_PROFILE: Profile = {
  id: 0,
  full_name: "Guest Farmer",
  email: null,
  phone: null,
  language: "en",
  state: "Maharashtra",
  district: "Pune",
  village: "Wagholi",
  farm_size_acres: 2,
  crops: ["Tomato", "Rice"],
  irrigation_type: "drip",
  farmer_category: "small",
  profile_completed: true,
  completion_percent: 100,
  missing_fields: [],
  identity_verification_status: "verified",
  identity_verification_provider: "guest-sample",
  identity_verified_at: null,
};

const IRRIGATION_OPTIONS = [
  ["drip", "Drip"],
  ["sprinkler", "Sprinkler"],
  ["flood", "Flood"],
  ["rain-fed", "Rain-fed"],
  ["borewell", "Borewell"],
  ["canal", "Canal"],
  ["other", "Other"],
];

function ProfileView() {
  const router = useRouter();
  const { logout, isGuest } = useAuth();
  const { language } = useLanguage();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    state: "",
    district: "",
    village: "",
    farm_size_acres: "",
    crops: "",
    irrigation_type: "drip",
  });

  const loadProfile = useCallback(async function loadProfile() {
    setIsLoading(true);
    if (isGuest) {
      setProfile(GUEST_PROFILE);
      setForm({ state: GUEST_PROFILE.state ?? "", district: GUEST_PROFILE.district ?? "", village: GUEST_PROFILE.village ?? "", farm_size_acres: String(GUEST_PROFILE.farm_size_acres ?? ""), crops: GUEST_PROFILE.crops.join(", "), irrigation_type: GUEST_PROFILE.irrigation_type ?? "drip" });
      setIsLoading(false);
      return;
    }
    try {
      const data = await apiJson<Profile>("/profile");
      setProfile(data);
      setForm({
        state: data.state ?? "",
        district: data.district ?? "",
        village: data.village ?? "",
        farm_size_acres:
          data.farm_size_acres !== null
            ? String(data.farm_size_acres)
            : "",
        crops: data.crops.join(", "),
        irrigation_type: data.irrigation_type ?? "drip",
      });
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : "Couldn't load your profile."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  async function handleSave() {
    if (isGuest) { setError("Guest mode is read-only. Create a farmer profile to save changes."); return; }
    setIsSaving(true);
    setError(null);

    try {
      const updated = await apiJson<Profile>("/profile", {
        method: "PUT",
        body: JSON.stringify({
          state: form.state,
          district: form.district,
          village: form.village,
          farm_size_acres: Number(form.farm_size_acres) || undefined,
          crops: form.crops
            .split(",")
            .map((crop) => crop.trim())
            .filter(Boolean),
          irrigation_type: form.irrigation_type,
        }),
      });
      setProfile(updated);
      setIsEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof ApiError
          ? saveError.message
          : "Couldn't save your changes."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleVerifyIdentity() {
    if (isGuest) { setError("Identity verification is disabled in Guest mode."); return; }
    setError(null);
    try {
      await apiJson("/profile/verify-identity", { method: "POST" });
      await loadProfile();
    } catch (verifyError) {
      setError(
        verifyError instanceof ApiError
          ? verifyError.message
          : "Verification failed."
      );
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-forest-deep">
        <p className="text-sm font-semibold text-white/70">
          {tr("Loading profile...", language)}
        </p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-forest-deep px-6">
        <div className="w-full max-w-[360px] rounded-[24px] bg-cream p-5 text-center">
          <p className="text-lg font-bold text-forest">
            {tr("Profile could not load", language)}
          </p>
          <p className="mt-2 text-sm text-muted">
            {error
              ? tr(error, language)
              : tr("Backend is not reachable right now. Please try again.", language)}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={loadProfile}
              className="rounded-xl bg-leaf px-4 py-3 text-sm font-bold text-forest-deep"
            >
              {tr("Retry", language)}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm font-bold text-forest"
            >
              {tr("Log out", language)}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const locationLine = [profile.village, profile.district, profile.state]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-cream px-5 pb-32 pt-8 sm:min-h-[844px] sm:rounded-[36px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              {tr("Farmer Profile", language)}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-forest">
              {tr("Your Account", language)}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-danger"
            aria-label={tr("Log out", language)}
          >
            <LogOut size={19} />
          </button>
        </div>

        <div className="mt-6 rounded-[28px] bg-forest p-5 text-white">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf text-forest-deep">
              <UserRound size={32} />
            </span>

            <div>
              <h2 className="text-xl font-bold">{isGuest ? tr("Guest Farmer", language) : profile.full_name}</h2>

              <p className="mt-1 flex items-center gap-1 text-sm text-white/65">
                <MapPin size={15} />
                {locationLine
                  ? locationLine
                      .split(",")
                      .map((part) => tr(part.trim(), language))
                      .join(", ")
                  : tr("Location not set yet", language)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>{tr("Profile completion", language)}</span>
              <span className="font-bold text-leaf">
                {profile.completion_percent}%
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-leaf transition-all"
                style={{ width: `${profile.completion_percent}%` }}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-danger/10 p-3 text-xs font-semibold text-danger">
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center gap-3 rounded-[22px] bg-white p-4">
          <ShieldCheck
            size={23}
            className={
              profile.identity_verification_status === "verified"
                ? "text-leaf"
                : "text-forest"
            }
          />

          <div className="flex-1">
            <p className="font-bold text-forest">
              {tr("Identity verification", language)}
            </p>
            <p className="text-xs text-muted">
              {profile.identity_verification_status === "verified"
                ? tr("Verified (prototype mock check)", language)
                : tr("Not verified yet - prototype mock check", language)}
            </p>
          </div>

          {profile.identity_verification_status === "verified" || isGuest ? (
            <BadgeCheck size={20} className="text-leaf" />
          ) : (
            <button
              type="button"
              onClick={handleVerifyIdentity}
              className="rounded-full bg-forest px-3 py-1.5 text-xs font-bold text-white"
            >
              {tr("Verify", language)}
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-[22px] bg-white p-4">
          <CloudOff size={23} className="text-forest" />

          <div className="flex-1">
            <p className="font-bold text-forest">{tr("Offline Ready", language)}</p>
            <p className="text-xs text-muted">
              {tr("Farm information is available offline", language)}
            </p>
          </div>

          <span className="h-3 w-3 rounded-full bg-leaf" />
        </div>

        <div className="mb-3 mt-6 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted">
            {tr("Farm details", language)}
          </h2>

          {!isGuest && <button
            type="button"
            onClick={() => setIsEditing((value) => !value)}
            className="flex items-center gap-1 text-xs font-bold text-forest"
          >
            <Pencil size={13} />
            {isEditing ? tr("Cancel", language) : tr("Edit", language)}
          </button>}
        </div>

        {isEditing && !isGuest ? (
          <div className="space-y-3 rounded-[24px] border border-forest/10 bg-white p-4">
            <div className="grid grid-cols-2 gap-3">
              <EditField label={tr("State", language)}>
                <input
                  value={form.state}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      state: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
                />
              </EditField>
              <EditField label={tr("District", language)}>
                <input
                  value={form.district}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      district: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
                />
              </EditField>
            </div>

            <EditField label={tr("Village / town", language)}>
              <input
                value={form.village}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    village: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
              />
            </EditField>

            <EditField label={tr("Farm size (acres)", language)}>
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.farm_size_acres}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    farm_size_acres: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
              />
            </EditField>

            <EditField label={tr("Crops (comma separated)", language)}>
              <input
                value={form.crops}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    crops: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
              />
            </EditField>

            <EditField label={tr("Irrigation type", language)}>
              <select
                value={form.irrigation_type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    irrigation_type: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
              >
                {IRRIGATION_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {tr(label, language)}
                  </option>
                ))}
              </select>
            </EditField>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full rounded-xl bg-leaf px-4 py-3 text-sm font-bold text-forest-deep disabled:opacity-60"
            >
              {isSaving ? tr("Saving...", language) : tr("Save changes", language)}
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-forest/10 bg-white">
            <DetailRow
              label={tr("Farm size", language)}
              value={
                profile.farm_size_acres
                  ? `${profile.farm_size_acres} ${tr("acres", language)}`
                  : tr("Not set", language)
              }
            />
            <DetailRow
              label={tr("Crops", language)}
              value={
                profile.crops.length
                  ? profile.crops.map((crop) => tr(crop, language)).join(", ")
                  : tr("Not set", language)
              }
            />
            <DetailRow
              label={tr("Irrigation", language)}
              value={profile.irrigation_type ? tr(IRRIGATION_OPTIONS.find(([value]) => value === profile.irrigation_type)?.[1] ?? profile.irrigation_type, language) : tr("Not set", language)}
              last
            />
          </div>
        )}

        <div className="mt-5 rounded-[22px] bg-white p-4 text-center">
          <p className="font-bold text-forest">KrishiNayan</p>
          <p className="mt-1 text-xs text-muted">
            {tr("AI Farming Copilot", language)} &bull; Prototype v1.0
          </p>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}

function EditField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs font-semibold text-muted">
      {label}
      {children}
    </label>
  );
}

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 ${
        last ? "" : "border-b border-forest/10"
      }`}
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="text-sm font-semibold text-forest">{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileView />
    </ProtectedRoute>
  );
}
