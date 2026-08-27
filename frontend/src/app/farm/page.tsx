"use client";

import BottomNav from "@/components/BottomNav";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CloudRain,
  Droplets,
  MapPin,
  ScanLine,
  Sprout,
} from "lucide-react";

import { useLanguage } from "@/lib/language-context";
import { tr } from "@/lib/static-translate";

export default function FarmPage() {
  const router = useRouter();
  const { language } = useLanguage();

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-forest-deep pb-32 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-6 text-white">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur"
            aria-label={tr("Go back", language)}
          >
            <ArrowLeft size={21} />
          </button>

          <h1 className="text-lg font-bold">
            {tr("My Farm Map", language)}
          </h1>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur"
            aria-label={tr("Farm location", language)}
          >
            <MapPin size={21} />
          </button>
        </header>

        <div className="relative h-[560px]">
          <Image
            src="/images/tomato-field.png"
            alt={tr("Farm plots", language)}
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-forest-deep/35" />

          <div className="absolute left-5 right-5 top-24 z-10 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-forest-deep/75 p-3 text-white backdrop-blur">
              <p className="text-xs text-white/65">
                {tr("Plant age", language)}
              </p>
              <p className="mt-1 font-bold">
                44 {tr("Days", language)}
              </p>
            </div>

            <div className="rounded-2xl bg-forest-deep/75 p-3 text-white backdrop-blur">
              <p className="text-xs text-white/65">
                {tr("Total area", language)}
              </p>
              <p className="mt-1 font-bold">
                1.8 {tr("Acres", language)}
              </p>
            </div>
          </div>

          <div className="absolute left-8 right-8 top-48 z-10 h-[105px] rotate-[-3deg] rounded-[28px] border-2 border-dashed border-white/80 bg-leaf/15">
            <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-forest-deep/85 px-4 py-2 text-sm font-bold text-white">
              <Sprout size={17} className="text-leaf" />
              {tr("Paddy", language)}
            </span>
          </div>

          <div className="absolute left-8 right-8 top-[320px] z-10 h-[125px] rotate-[2deg] rounded-[28px] border-2 border-warning bg-warning/20">
            <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-forest-deep/90 px-4 py-2 text-sm font-bold text-white">
              🍅 {tr("Tomato Plot", language)}
            </span>

            <span className="absolute right-7 top-7 h-5 w-5 rounded-full bg-danger shadow-[0_0_0_12px_rgba(216,58,50,0.25)]" />
          </div>

          <div className="absolute inset-x-5 bottom-4 z-10 rounded-[26px] bg-forest-deep/90 p-3 text-white backdrop-blur">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-2xl bg-white/10 p-2">
                <Droplets className="mx-auto text-sky-300" size={20} />
                <p className="mt-2 text-[10px] text-white/65">
                  {tr("Soil Moisture", language)}
                </p>
                <p className="mt-1 font-bold">70%</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-2">
                <CloudRain className="mx-auto text-sky-200" size={20} />
                <p className="mt-2 text-[10px] text-white/65">
                  {tr("Humidity", language)}
                </p>
                <p className="mt-1 font-bold">80%</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-2">
                <AlertTriangle className="mx-auto text-warning" size={20} />
                <p className="mt-2 text-[10px] text-white/65">
                  {tr("Disease Risk", language)}
                </p>
                <p className="mt-1 font-bold text-warning">
                  {tr("High", language)}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-2">
                <CalendarDays className="mx-auto text-leaf" size={20} />
                <p className="mt-2 text-[10px] text-white/65">
                  {tr("Last Scan", language)}
                </p>
                <p className="mt-1 font-bold">
                  {tr("Today", language)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pt-5">
          <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/60">
                  {tr("Selected field", language)}
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {tr("Tomato Plot", language)}
                </h2>

                <p className="mt-1 text-sm text-white/65">
                  {tr(
                    "Early blight risk detected nearby",
                    language
                  )}
                </p>
              </div>

              <span className="rounded-full bg-danger/20 px-3 py-2 text-xs font-bold text-red-300">
                {tr("High Risk", language)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/scan")}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-5 py-4 font-bold text-forest-deep"
          >
            <ScanLine size={22} />
            {tr("Scan This Plot", language)}
          </button>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}