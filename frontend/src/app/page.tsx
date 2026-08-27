"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ActivitySquare,
  Camera,
  CloudOff,
  CloudSun,
  Headphones,
  Landmark,
<<<<<<< HEAD
  Languages,
=======
  MapPinned,
>>>>>>> origin/main
  Leaf,
  LockKeyhole,
  LogIn,
  MapPinned,
  UserRound,
} from "lucide-react";

import BottomNav from "@/components/BottomNav";
<<<<<<< HEAD
import GuestGateModal from "@/components/GuestGateModal";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [guestFeature, setGuestFeature] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user?.role === "officer") router.replace("/officer");
  }, [user, isLoading, router]);

  if (user?.role === "officer") return null;

  function gated(path: string, feature: string) {
    if (user) router.push(path);
    else setGuestFeature(feature);
  }
=======
import LanguageSelector from "@/components/LanguageSelector";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { tr } from "@/lib/static-translate";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { language } = useLanguage();
>>>>>>> origin/main

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-forest-deep sm:min-h-[844px] sm:rounded-[32px]">
        <Image src="/images/tomato-field.png" alt="Tomato field during sunrise" fill priority sizes="(max-width: 640px) 100vw, 430px" className="object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-forest-deep/55" />

        <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 pb-28 pt-8 text-center sm:min-h-[844px]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-leaf backdrop-blur-sm"><Leaf size={34} strokeWidth={2.2} /></div>

          <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
<<<<<<< HEAD
            <button className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"><Languages size={16} /><span>हिंदी</span></button>
            <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"><CloudOff size={16} /><span>Offline Ready</span></div>
            {!isLoading && (user ? (
              <button type="button" onClick={() => gated("/profile", "your profile")} className="flex items-center gap-2 rounded-full border border-leaf/50 bg-leaf/15 px-4 py-2 text-sm font-medium text-white"><UserRound size={16} className="text-leaf" /><span>{user.full_name.split(" ")[0]}</span></button>
            ) : (
              <Link href="/login" className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"><LogIn size={16} /><span>Log in</span></Link>
            ))}
          </div>

          {!user && !isLoading && (
            <div className="mb-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm">
              <LockKeyhole size={14} className="text-leaf" /> Guest preview · features are locked
            </div>
          )}

          {user && !user.profile_completed && <Link href="/onboarding" className="mb-4 flex items-center gap-2 rounded-full bg-leaf px-4 py-2 text-xs font-bold text-forest-deep shadow-lg">Finish setting up your farm profile →</Link>}

          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">AI Farming Copilot</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">KrishiNayan</h1>
          <p className="mt-3 max-w-xs text-base leading-7 text-white/75">From crop photo to clear action</p>
          <div className="mt-6 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-semibold text-forest-deep shadow-lg"><CloudSun size={20} className="text-warning" /><span>28°C · Pune</span></div>

          <FeatureButton onClick={() => gated("/scan", "crop scanning and saved diagnoses")} className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-leaf px-6 py-4 text-lg font-bold text-forest-deep shadow-lg"><Camera size={24} strokeWidth={2.2} /><span>Scan Crop</span>{!user && <LockKeyhole size={17} />}</FeatureButton>

          <div className="mt-3 grid w-full grid-cols-2 gap-3">
            <FeatureButton onClick={() => gated("/farm", "My Farm")} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm"><MapPinned size={24} className="shrink-0 text-leaf" /><span><span className="block font-semibold">My Farm</span><span className="mt-1 block text-xs text-white/65">View your plots</span></span>{!user && <LockKeyhole size={14} className="ml-auto" />}</FeatureButton>
            <FeatureButton onClick={() => gated("/chatbot", "AI expert support")} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm"><Headphones size={24} className="shrink-0 text-leaf" /><span><span className="block font-semibold">Ask Expert</span><span className="mt-1 block text-xs text-white/65">AI chat + KVK support</span></span>{!user && <LockKeyhole size={14} className="ml-auto" />}</FeatureButton>
=======
            <LanguageSelector />

            <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-leaf/70 hover:bg-white/20 hover:shadow-lg">
              <CloudOff size={16} />
              <span>{tr("Offline Ready", language)}</span>
            </div>

            {!isLoading &&
              (user ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-full border border-leaf/50 bg-leaf/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-leaf/25 hover:shadow-lg"
                >
                  <UserRound size={16} className="text-leaf" />
                  <span data-no-translate>
                    {user.full_name.split(" ")[0]}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-leaf/70 hover:bg-white/20 hover:shadow-lg"
                >
                  <LogIn size={16} />
                  <span>{tr("Log in", language)}</span>
                </Link>
              ))}
          </div>

          {user && !user.profile_completed && (
            <Link
              href="/onboarding"
              className="mb-4 flex items-center gap-2 rounded-full bg-leaf px-4 py-2 text-xs font-bold text-forest-deep shadow-lg"
            >
              {tr(
                "Finish setting up your farm profile →",
                language
              )}
            </Link>
          )}

          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            {tr("AI Farming Copilot", language)}
          </p>

          <h1
            data-no-translate
            className="mt-3 text-4xl font-bold tracking-tight text-white"
          >
            KrishiNayan
          </h1>

          <p className="mt-3 max-w-xs text-base leading-7 text-white/75">
            {tr("From crop photo to clear action", language)}
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-semibold text-forest-deep shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-white hover:shadow-xl">
            <CloudSun size={20} className="text-warning" />
            <span>
              28°C · {tr("Pune", language)}
            </span>
          </div>

          <Link
            href="/scan"
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-leaf px-6 py-4 text-lg font-bold text-forest-deep shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:brightness-105 hover:shadow-2xl active:scale-95"
          >
            <Camera size={24} strokeWidth={2.2} />
            <span>{tr("Scan Crop", language)}</span>
          </Link>

          <div className="mt-3 grid w-full grid-cols-2 gap-3">
            <Link
              href="/farm"
              className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-leaf/60 hover:bg-white/20 hover:shadow-xl active:scale-95"
            >
              <MapPinned size={24} className="shrink-0 text-leaf" />

              <span>
                <span className="block font-semibold">
                  {tr("My Farm", language)}
                </span>

                <span className="mt-1 block text-xs text-white/65">
                  {tr("View your plots", language)}
                </span>
              </span>
            </Link>

            <Link
              href="/chatbot"
              className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-leaf/60 hover:bg-white/20 hover:shadow-xl active:scale-95"
            >
              <Headphones size={24} className="shrink-0 text-leaf" />

              <span>
                <span className="block font-semibold">
                  {tr("Ask Expert", language)}
                </span>

                <span className="mt-1 block text-xs text-white/65">
                  {tr("AI chat + KVK support", language)}
                </span>
              </span>
            </Link>
>>>>>>> origin/main
          </div>

          <FeatureButton onClick={() => gated("/health", "Crop Health Memory")} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf/20 text-leaf"><ActivitySquare size={22} /></span><span><span className="block font-semibold">Crop Health Memory</span><span className="mt-1 block text-xs text-white/65">Track health scores and trends over time</span></span>{!user && <LockKeyhole size={14} className="ml-auto" />}</FeatureButton>

<<<<<<< HEAD
          <FeatureButton onClick={() => gated("/policies", "personalised government scheme eligibility")} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf/20 text-leaf"><Landmark size={22} /></span><span><span className="block font-semibold">Government Schemes</span><span className="mt-1 block text-xs text-white/65">Check what you&apos;re eligible for</span></span>{!user && <LockKeyhole size={14} className="ml-auto" />}</FeatureButton>
=======
            <span>
              <span className="block font-semibold">
                {tr("Crop Health Memory", language)}
              </span>

              <span className="mt-1 block text-xs text-white/65">
                {tr(
                  "Track health scores and trends over time",
                  language
                )}
              </span>
            </span>
          </Link>

          <Link
            href="/policies"
            className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-leaf/60 hover:bg-white/20 hover:shadow-xl active:scale-95"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf/20 text-leaf">
              <Landmark size={22} />
            </span>

            <span>
              <span className="block font-semibold">
                {tr("Government Schemes", language)}
              </span>

              <span className="mt-1 block text-xs text-white/65">
                {tr(
                  "Check what you're eligible for",
                  language
                )}
              </span>
            </span>
          </Link>
>>>>>>> origin/main
        </div>

        <BottomNav />
      </section>
      <GuestGateModal open={Boolean(guestFeature)} onClose={() => setGuestFeature(null)} feature={guestFeature || undefined} />
    </main>
  );
}

function FeatureButton({ onClick, className, children }: { onClick: () => void; className: string; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={`${className} transition-all duration-200 hover:-translate-y-0.5 hover:border-leaf/60 hover:shadow-lg active:scale-[0.98]`}>{children}</button>;
}
