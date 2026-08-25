"use client";

import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Filter,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { tr } from "@/lib/static-translate";

export default function AlertsPage() {
  const router = useRouter();
  const { language } = useLanguage();

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"
            aria-label={tr("Go back", language)}
          >
            <ArrowLeft size={21} />
          </button>

          <h1 className="text-lg font-bold text-forest">
            {tr("Nearby Crop Alerts", language)}
          </h1>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"
            aria-label={tr("Filter alerts", language)}
          >
            <Filter size={20} />
          </button>
        </header>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <div className="rounded-[20px] border border-forest/10 bg-white p-3">
            <p className="text-2xl font-bold text-danger">12</p>
            <p className="mt-1 text-xs font-semibold text-forest">{tr("Cases", language)}</p>
            <p className="text-[10px] text-muted">{tr("Last 7 days", language)}</p>
          </div>

          <div className="rounded-[20px] border border-forest/10 bg-white p-3">
            <p className="text-2xl font-bold text-warning">3</p>
            <p className="mt-1 text-xs font-semibold text-forest">{tr("Villages", language)}</p>
            <p className="text-[10px] text-muted">{tr("Affected", language)}</p>
          </div>

          <div className="rounded-[20px] border border-forest/10 bg-white p-3">
            <p className="text-xl font-bold text-danger">{tr("High", language)}</p>
            <p className="mt-1 text-xs font-semibold text-forest">{tr("Risk", language)}</p>
            <p className="text-[10px] text-muted">{tr("Current level", language)}</p>
          </div>
        </div>

        <div className="relative mt-5 h-[260px] overflow-hidden rounded-[26px] border border-forest/10 bg-[#e9efdc]">
          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(35deg,transparent_45%,#cad7bd_46%,#cad7bd_48%,transparent_49%),linear-gradient(125deg,transparent_45%,#cad7bd_46%,#cad7bd_48%,transparent_49%)] [background-size:80px_80px]" />

          <span className="absolute left-7 top-8 text-xs font-semibold text-forest">Kondhwa</span>
          <span className="absolute right-9 top-10 text-xs font-semibold text-forest">Pisoli</span>
          <span className="absolute bottom-12 left-8 text-xs font-semibold text-forest">Holkarwadi</span>

          <span className="absolute left-[46%] top-[42%] h-5 w-5 rounded-full bg-danger shadow-[0_0_0_9px_rgba(216,58,50,0.25),0_0_0_18px_rgba(216,58,50,0.12)]" />
          <span className="absolute right-14 top-24 h-4 w-4 rounded-full bg-warning shadow-[0_0_0_7px_rgba(245,168,0,0.18)]" />
          <span className="absolute bottom-14 right-20 h-4 w-4 rounded-full bg-danger shadow-[0_0_0_7px_rgba(216,58,50,0.18)]" />
          <span className="absolute bottom-12 left-24 h-4 w-4 rounded-full bg-[#6f9c13]" />

          <div className="absolute bottom-3 right-3 flex gap-3 rounded-full bg-white/90 px-3 py-2 text-[9px] text-forest">
            <span>🟢 {tr("Low", language)}</span>
            <span>🟠 {tr("Moderate", language)}</span>
            <span>🔴 {tr("High", language)}</span>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-forest/10 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-forest">
                {tr("Cases in your area", language)}
              </p>
              <p className="text-xs text-muted">{tr("Last 7 days", language)}</p>
            </div>

            <TrendingUp size={21} className="text-danger" />
          </div>

          <div className="mt-5 flex h-28 items-end gap-3 border-b border-forest/10">
            {[25, 42, 34, 58, 53, 70, 92].map((height, index) => (
              <div
                key={index}
                className="relative flex-1 rounded-t-md bg-danger/20"
                style={{ height: `${height}%` }}
              >
                <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger" />
              </div>
            ))}
          </div>

          <div className="mt-2 flex justify-between text-[9px] text-muted">
            <span>25 May</span>
            <span>27 May</span>
            <span>29 May</span>
            <span>31 May</span>
          </div>
        </div>

        <div className="mt-5 flex gap-3 rounded-[24px] border border-danger/20 bg-white p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-danger text-white">
            <AlertTriangle size={23} />
          </span>

          <div>
            <h2 className="font-bold text-forest">
              {tr("Early Blight cases increasing", language)}
            </h2>

            <p className="mt-1 text-sm leading-5 text-muted">
              {tr("Conditions currently favour disease spread near your farm.", language)}
            </p>

            <button
              type="button"
              onClick={() => router.push("/farm")}
              className="mt-3 flex items-center gap-2 text-sm font-bold text-danger"
            >
              <MapPin size={17} />
              {tr("Check my farm", language)}
            </button>
          </div>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}