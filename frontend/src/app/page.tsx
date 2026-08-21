"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  CloudOff,
  CloudSun,
  Headphones,
  Landmark,
  MapPinned,
  Languages,
  Leaf,
  LogIn,
  UserRound,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-forest-deep sm:min-h-[844px] sm:rounded-[32px]">
        <Image
          src="/images/tomato-field.png"
          alt="Tomato field during sunrise"
          fill
          priority
          sizes="(max-width: 640px) 100vw, 430px"
          className="object-cover"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-forest-deep/55"
        />

        <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 pb-28 pt-8 text-center sm:min-h-[844px]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-leaf backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/15">
            <Leaf size={34} strokeWidth={2.2} />
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
            <button className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-leaf/70 hover:bg-white/20 hover:shadow-lg active:scale-95">
              <Languages size={16} />
              <span>हिंदी</span>
            </button>

            <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-leaf/70 hover:bg-white/20 hover:shadow-lg">
              <CloudOff size={16} />
              <span>Offline Ready</span>
            </div>

            {!isLoading &&
              (user ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-full border border-leaf/50 bg-leaf/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-leaf/25 hover:shadow-lg"
                >
                  <UserRound size={16} className="text-leaf" />
                  <span>{user.full_name.split(" ")[0]}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-leaf/70 hover:bg-white/20 hover:shadow-lg"
                >
                  <LogIn size={16} />
                  <span>Log in</span>
                </Link>
              ))}
          </div>

          {user && !user.profile_completed && (
            <Link
              href="/onboarding"
              className="mb-4 flex items-center gap-2 rounded-full bg-leaf px-4 py-2 text-xs font-bold text-forest-deep shadow-lg"
            >
              Finish setting up your farm profile →
            </Link>
          )}

          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            AI Farming Copilot
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
            KrishiNayan
          </h1>

          <p className="mt-3 max-w-xs text-base leading-7 text-white/75">
            From crop photo to clear action
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-semibold text-forest-deep shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-white hover:shadow-xl">
            <CloudSun size={20} className="text-warning" />
            <span>28°C · Pune</span>
          </div>

          <Link
            href="/scan"
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-leaf px-6 py-4 text-lg font-bold text-forest-deep shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:brightness-105 hover:shadow-2xl active:scale-95"
          >
            <Camera size={24} strokeWidth={2.2} />
            <span>Scan Crop</span>
          </Link>

          <div className="mt-3 grid w-full grid-cols-2 gap-3">
            <button className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-leaf/60 hover:bg-white/20 hover:shadow-xl active:scale-95">
              <MapPinned size={24} className="shrink-0 text-leaf" />

              <span>
                <span className="block font-semibold">My Farm</span>
                <span className="mt-1 block text-xs text-white/65">
                  View your plots
                </span>
              </span>
            </button>

            <Link
              href="/chatbot"
              className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-leaf/60 hover:bg-white/20 hover:shadow-xl active:scale-95"
            >
              <Headphones size={24} className="shrink-0 text-leaf" />

              <span>
                <span className="block font-semibold">Ask Expert</span>
                <span className="mt-1 block text-xs text-white/65">
                  AI chat + KVK support
                </span>
              </span>
            </Link>
          </div>

          <Link
            href="/policies"
            className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-leaf/60 hover:bg-white/20 hover:shadow-xl active:scale-95"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf/20 text-leaf">
              <Landmark size={22} />
            </span>

            <span>
              <span className="block font-semibold">
                Government Schemes
              </span>
              <span className="mt-1 block text-xs text-white/65">
                Check what you&apos;re eligible for
              </span>
            </span>
          </Link>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}