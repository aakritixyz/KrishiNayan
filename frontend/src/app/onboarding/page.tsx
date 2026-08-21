"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { apiJson, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CheckCircle2,
  Landmark,
  Leaf,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useState, type ReactNode } from "react";

type ProfileUpdatePayload = {
  state?: string;
  district?: string;
  village?: string;
  farm_size_acres?: number;
  crops?: string[];
  irrigation_type?: string;
  language?: string;
  farmer_category?: string;
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

const CATEGORY_OPTIONS = [
  ["marginal", "Marginal (under 2.5 acres)"],
  ["small", "Small (2.5-5 acres)"],
  ["general", "General (above 5 acres)"],
];

const STEPS = ["Location & farm", "Preferences", "Verify identity"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-muted">
      {label}
      {children}
    </label>
  );
}

function OnboardingWizard() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [crops, setCrops] = useState("Tomato");
  const [irrigationType, setIrrigationType] = useState("drip");
  const [language, setLanguage] = useState("en");
  const [farmerCategory, setFarmerCategory] = useState("small");

  const [verificationStatus, setVerificationStatus] = useState<
    string | null
  >(null);
  const [isVerifying, setIsVerifying] = useState(false);

  async function saveProfile(payload: ProfileUpdatePayload) {
    setError(null);
    setIsSaving(true);

    try {
      await apiJson("/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } catch (saveError) {
      setError(
        saveError instanceof ApiError
          ? saveError.message
          : "Couldn't save your details. Check your connection."
      );
      throw saveError;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLocationNext() {
    try {
      await saveProfile({
        state: state.trim(),
        district: district.trim(),
        village: village.trim(),
        farm_size_acres: Number(farmSize) || undefined,
        crops: crops
          .split(",")
          .map((crop) => crop.trim())
          .filter(Boolean),
        irrigation_type: irrigationType,
      });
      setStep(1);
    } catch {
      // error already surfaced via `error` state
    }
  }

  async function handlePreferencesNext() {
    try {
      await saveProfile({
        language,
        farmer_category: farmerCategory,
      });
      setStep(2);
    } catch {
      // error already surfaced via `error` state
    }
  }

  async function handleVerifyIdentity() {
    setIsVerifying(true);
    setError(null);

    try {
      const result = await apiJson<{
        identity_verification_status: string;
      }>("/profile/verify-identity", { method: "POST" });
      setVerificationStatus(result.identity_verification_status);
    } catch (verifyError) {
      setError(
        verifyError instanceof ApiError
          ? verifyError.message
          : "Verification failed. You can try again later."
      );
    } finally {
      setIsVerifying(false);
    }
  }

  async function finishOnboarding() {
    await refreshUser();
    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep px-5 py-10">
      <section className="w-full max-w-[430px] rounded-[32px] bg-cream p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-leaf">
          <Leaf size={22} />
        </span>

        <h1 className="mt-4 text-xl font-bold text-forest">
          Set up your farm profile
        </h1>
        <p className="mt-1 text-sm text-muted">
          This personalizes your chatbot answers, scheme matches,
          and weather - takes about a minute.
        </p>

        <div className="mt-5 flex items-center gap-2">
          {STEPS.map((label, index) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  index <= step
                    ? "bg-leaf text-forest-deep"
                    : "bg-forest/10 text-muted"
                }`}
              >
                {index + 1}
              </span>
              {index < STEPS.length - 1 && (
                <span
                  className={`h-0.5 flex-1 rounded ${
                    index < step ? "bg-leaf" : "bg-forest/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>

        {error && (
          <p className="mt-4 rounded-xl bg-danger/10 p-3 text-xs font-semibold text-danger">
            {error}
          </p>
        )}

        {step === 0 && (
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="State">
                <input
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  placeholder="Maharashtra"
                  className="mt-1 w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm font-medium text-forest"
                />
              </Field>
              <Field label="District">
                <input
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  placeholder="Pune"
                  className="mt-1 w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm font-medium text-forest"
                />
              </Field>
            </div>

            <Field label="Village / town">
              <input
                value={village}
                onChange={(event) => setVillage(event.target.value)}
                placeholder="Wagholi"
                className="mt-1 w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm font-medium text-forest"
              />
            </Field>

            <Field label="Farm size (acres)">
              <input
                type="number"
                min={0}
                step={0.5}
                value={farmSize}
                onChange={(event) => setFarmSize(event.target.value)}
                placeholder="2.5"
                className="mt-1 w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm font-medium text-forest"
              />
            </Field>

            <Field label="Crops you grow (comma separated)">
              <input
                value={crops}
                onChange={(event) => setCrops(event.target.value)}
                placeholder="Tomato, Onion"
                className="mt-1 w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm font-medium text-forest"
              />
            </Field>

            <Field label="Irrigation type">
              <select
                value={irrigationType}
                onChange={(event) =>
                  setIrrigationType(event.target.value)
                }
                className="mt-1 w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm font-medium text-forest"
              >
                {IRRIGATION_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <button
              type="button"
              onClick={handleLocationNext}
              disabled={isSaving}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3.5 text-sm font-bold text-forest-deep disabled:opacity-60"
            >
              {isSaving && <Loader2 size={18} className="animate-spin" />}
              Continue
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="mt-5 space-y-3">
            <Field label="Preferred language">
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="mt-1 w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm font-medium text-forest"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </Field>

            <Field label="Farmer category">
              <select
                value={farmerCategory}
                onChange={(event) =>
                  setFarmerCategory(event.target.value)
                }
                className="mt-1 w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm font-medium text-forest"
              >
                {CATEGORY_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <p className="text-xs text-muted">
              Used to rank government schemes you&apos;re more
              likely to qualify for.
            </p>

            <button
              type="button"
              onClick={handlePreferencesNext}
              disabled={isSaving}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3.5 text-sm font-bold text-forest-deep disabled:opacity-60"
            >
              {isSaving && <Loader2 size={18} className="animate-spin" />}
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-forest/10 bg-white p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-forest" />
                <p className="font-bold text-forest">
                  Prototype identity check
                </p>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">
                This is a mock verification step for the prototype -
                it does not collect or store your Aadhaar or any
                other government ID number. A real, authorized e-KYC
                provider can be connected here later.
              </p>

              {verificationStatus === "verified" ? (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-leaf/20 p-3 text-sm font-bold text-forest">
                  <BadgeCheck size={18} className="text-leaf" />
                  Verified (prototype)
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleVerifyIdentity}
                  disabled={isVerifying}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {isVerifying && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Run mock verification
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={finishOnboarding}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3.5 text-sm font-bold text-forest-deep"
            >
              <CheckCircle2 size={18} />
              {verificationStatus === "verified"
                ? "Finish"
                : "Skip for now & finish"}
            </button>
          </div>
        )}

        <p className="mt-5 flex items-center gap-1.5 text-xs text-muted">
          <Landmark size={14} />
          Your profile also personalizes the Government Schemes tab.
        </p>
      </section>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingWizard />
    </ProtectedRoute>
  );
}
