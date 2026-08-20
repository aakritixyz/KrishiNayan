"use client";

import BottomNav from "@/components/BottomNav";
import { API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  ChevronDown,
  ExternalLink,
  FileCheck2,
  Landmark,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";

type Scheme = {
  id: string;
  name: string;
  category: string;
  administering_body: string;
  short_description: string;
  benefits: string;
  required_documents: string[];
  official_link: string;
  application_mode: string;
  helpline?: string;
  source_urls: string[];
  last_verified: string;
};

type EligibilityResult = {
  scheme: Scheme;
  eligible: boolean;
  relevance_score: number;
  match_reasons: string[];
};

type FarmerProfileForm = {
  state: string;
  land_holding_acres: number;
  crop: string;
  category: string;
  has_bank_account: boolean;
  has_aadhaar: boolean;
};

const DEFAULT_PROFILE: FarmerProfileForm = {
  state: "Maharashtra",
  land_holding_acres: 2,
  crop: "Tomato",
  category: "small",
  has_bank_account: true,
  has_aadhaar: true,
};

export default function PoliciesPage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<FarmerProfileForm>(DEFAULT_PROFILE);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<EligibilityResult[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );

  async function fetchEligibleSchemes(
    currentProfile: FarmerProfileForm
  ) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/policies/eligible`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentProfile),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load schemes right now.");
      }

      const data = await response.json();
      setResults(data.results as EligibilityResult[]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Backend connection failed.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchEligibleSchemes(DEFAULT_PROFILE);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const eligibleCount =
    results?.filter((result) => result.eligible).length ?? 0;

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"
            aria-label="Go back"
          >
            <ArrowLeft size={21} />
          </button>

          <h1 className="text-lg font-bold text-forest">
            Government Schemes
          </h1>

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"
            aria-label="Edit farmer profile"
          >
            <SlidersHorizontal size={19} />
          </button>
        </header>

        <p className="mt-4 text-sm leading-6 text-muted">
          Schemes ranked for your profile, with eligibility,
          benefits, documents and the official link to apply.
        </p>

        <div className="mt-4 flex items-center gap-3 rounded-[22px] bg-forest p-4 text-white">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-leaf text-forest-deep">
            <Landmark size={22} />
          </span>

          <div>
            <p className="font-bold">
              {isLoading
                ? "Checking eligibility..."
                : `${eligibleCount} schemes you likely qualify for`}
            </p>
            <p className="mt-0.5 text-xs text-white/65">
              {profile.crop} • {profile.land_holding_acres} acres •{" "}
              {profile.state}
            </p>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 rounded-[24px] border border-forest/10 bg-white p-4">
            <p className="font-bold text-forest">Your profile</p>
            <p className="mt-1 text-xs text-muted">
              Used only to rank schemes on this screen.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-muted">
                State
                <input
                  value={profile.state}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      state: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
                />
              </label>

              <label className="text-xs font-semibold text-muted">
                Land holding (acres)
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={profile.land_holding_acres}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      land_holding_acres: Number(
                        event.target.value
                      ),
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
                />
              </label>

              <label className="text-xs font-semibold text-muted">
                Crop
                <input
                  value={profile.crop}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      crop: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
                />
              </label>

              <label className="text-xs font-semibold text-muted">
                Farmer category
                <select
                  value={profile.category}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-forest/15 bg-cream px-3 py-2 text-sm font-medium text-forest"
                >
                  <option value="marginal">Marginal</option>
                  <option value="small">Small</option>
                  <option value="general">General</option>
                </select>
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-forest">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={profile.has_bank_account}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      has_bank_account: event.target.checked,
                    }))
                  }
                />
                Have bank account
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={profile.has_aadhaar}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      has_aadhaar: event.target.checked,
                    }))
                  }
                />
                Have Aadhaar
              </label>
            </div>

            <button
              type="button"
              onClick={() => fetchEligibleSchemes(profile)}
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3 text-sm font-bold text-forest-deep disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : null}
              Update schemes
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-[20px] bg-danger/10 p-4 text-sm font-semibold text-danger">
            {errorMessage} Make sure the KrishiNayan backend is
            running.
          </div>
        )}

        <div className="mt-5 flex flex-col gap-4">
          {isLoading && !results ? (
            <div className="flex items-center justify-center gap-2 rounded-[24px] border border-forest/10 bg-white p-8 text-sm font-semibold text-muted">
              <Loader2 size={18} className="animate-spin" />
              Loading schemes...
            </div>
          ) : (
            results?.map((result) => (
              <SchemeCard key={result.scheme.id} result={result} />
            ))
          )}
        </div>

        <BottomNav />
      </section>
    </main>
  );
}

function SchemeCard({ result }: { result: EligibilityResult }) {
  const { scheme, eligible, relevance_score, match_reasons } =
    result;

  return (
    <div
      className={`rounded-[26px] border p-4 ${
        eligible
          ? "border-leaf/40 bg-white"
          : "border-forest/10 bg-white/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-forest/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-forest">
            {scheme.category}
          </span>

          <h2 className="mt-2 text-lg font-bold leading-tight text-forest">
            {scheme.name}
          </h2>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <Building2 size={13} />
            {scheme.administering_body}
          </p>
        </div>

        {eligible ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-leaf px-3 py-1.5 text-xs font-bold text-forest-deep">
            <BadgeCheck size={14} />
            {relevance_score}% match
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-forest/10 px-3 py-1.5 text-xs font-bold text-muted">
            Likely not eligible
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-muted">
        {scheme.short_description}
      </p>

      <div className="mt-3 rounded-2xl bg-forest/5 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-forest/70">
          Benefits
        </p>
        <p className="mt-1 text-sm leading-6 text-forest">
          {scheme.benefits}
        </p>
      </div>

      {match_reasons.length > 0 && (
        <ul className="mt-3 space-y-1">
          {match_reasons.map((reason) => (
            <li
              key={reason}
              className="flex items-start gap-2 text-xs leading-5 text-muted"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
              {reason}
            </li>
          ))}
        </ul>
      )}

      <details className="group mt-3">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-forest">
          Documents &amp; how to apply
          <ChevronDown
            size={16}
            className="transition group-open:rotate-180"
          />
        </summary>

        <div className="mt-2 space-y-3">
          <div className="flex flex-wrap gap-2">
            {scheme.required_documents.map((document) => (
              <span
                key={document}
                className="flex items-center gap-1 rounded-full border border-forest/10 bg-cream px-3 py-1.5 text-xs font-semibold text-forest"
              >
                <FileCheck2 size={13} className="text-leaf" />
                {document}
              </span>
            ))}
          </div>

          <p className="text-xs leading-5 text-muted">
            {scheme.application_mode}
          </p>

          {scheme.helpline && (
            <p className="text-xs font-semibold text-forest">
              Helpline: {scheme.helpline}
            </p>
          )}
        </div>
      </details>

      <div className="mt-4 flex items-center justify-between border-t border-forest/10 pt-3">
        <p className="text-[11px] text-muted">
          Source verified {scheme.last_verified}
        </p>

        <a
          href={scheme.official_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-bold text-white"
        >
          Apply on official site
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
