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
import dynamic from "next/dynamic";
import type { MapCase } from "@/components/AlertsMap";

// Leaflet touches `window` at import time, so it can only render on
// the client - loading it via next/dynamic with ssr disabled avoids
// the Next.js server-render crash this would otherwise cause.
const AlertsMap = dynamic(() => import("@/components/AlertsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[260px] w-full items-center justify-center rounded-[22px] bg-forest/5 text-sm text-muted">
      Loading map...
    </div>
  ),
});

// Demo data for the Delhi region. Hardcoded on purpose - this page
// is meant to always show something real-looking and reliable for
// a demo, without depending on login, live device location, or the
// scan-history database having real entries in it yet.
const DELHI_CENTER = { latitude: 28.6139, longitude: 77.209 };

const DELHI_CASES: MapCase[] = [
  {
    crop_label: "Tomato",
    disease: "Early Blight",
    severity: "High",
    distance_km: 3.2,
    latitude: 28.6304,
    longitude: 77.2177,
    created_at: "2026-08-27T09:00:00Z",
  },
  {
    crop_label: "Tomato",
    disease: "Early Blight",
    severity: "High",
    distance_km: 5.8,
    latitude: 28.5921,
    longitude: 77.2507,
    created_at: "2026-08-26T09:00:00Z",
  },
  {
    crop_label: "Tomato",
    disease: "Septoria Leaf Spot",
    severity: "Medium",
    distance_km: 7.4,
    latitude: 28.6692,
    longitude: 77.1174,
    created_at: "2026-08-26T09:00:00Z",
  },
  {
    crop_label: "Tomato",
    disease: "Late Blight",
    severity: "High",
    distance_km: 9.1,
    latitude: 28.5535,
    longitude: 77.191,
    created_at: "2026-08-25T09:00:00Z",
  },
  {
    crop_label: "Tomato",
    disease: "Early Blight",
    severity: "Medium",
    distance_km: 11.6,
    latitude: 28.7041,
    longitude: 77.1025,
    created_at: "2026-08-24T09:00:00Z",
  },
];

const DAILY_COUNTS = [
  { date: "2026-08-22", count: 1 },
  { date: "2026-08-23", count: 2 },
  { date: "2026-08-24", count: 2 },
  { date: "2026-08-25", count: 3 },
  { date: "2026-08-26", count: 3 },
  { date: "2026-08-27", count: 4 },
  { date: "2026-08-28", count: 5 },
];

export default function AlertsPage() {
  const router = useRouter();

  const maxDailyCount = Math.max(1, ...DAILY_COUNTS.map((d) => d.count));
  const affectedLocationCount = new Set(
    DELHI_CASES.map((c) => `${c.latitude},${c.longitude}`)
  ).size;

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"
          >
            <ArrowLeft size={21} />
          </button>

          <div className="text-center">
            <h1 className="text-lg font-bold text-forest">
              Nearby Crop Alerts
            </h1>
            <p className="text-[11px] text-muted">Delhi NCR region</p>
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"
          >
            <Filter size={20} />
          </button>
        </header>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <div className="rounded-[20px] border border-forest/10 bg-white p-3">
            <p className="text-2xl font-bold text-danger">
              {DELHI_CASES.length}
            </p>
            <p className="mt-1 text-xs font-semibold text-forest">Cases</p>
            <p className="text-[10px] text-muted">Last 7 days</p>
          </div>

          <div className="rounded-[20px] border border-forest/10 bg-white p-3">
            <p className="text-2xl font-bold text-warning">
              {affectedLocationCount}
            </p>
            <p className="mt-1 text-xs font-semibold text-forest">
              Locations
            </p>
            <p className="text-[10px] text-muted">Within 15 km</p>
          </div>

          <div className="rounded-[20px] border border-forest/10 bg-white p-3">
            <p className="text-xl font-bold text-danger">High</p>
            <p className="mt-1 text-xs font-semibold text-forest">Risk</p>
            <p className="text-[10px] text-muted">Current level</p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[22px] border border-forest/10">
          <AlertsMap
            centerLat={DELHI_CENTER.latitude}
            centerLon={DELHI_CENTER.longitude}
            radiusKm={15}
            cases={DELHI_CASES}
          />
        </div>

        <div className="mt-3 flex gap-4 text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6f9c13]" />
            Low
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f5a800]" />
            Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d83a32]" />
            High severity
          </span>
        </div>

        <div className="mt-5 rounded-[24px] border border-forest/10 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-forest">Cases in your area</p>
              <p className="text-xs text-muted">Last 7 days</p>
            </div>

            <TrendingUp size={21} className="text-danger" />
          </div>

          <div className="mt-5 flex h-28 items-end gap-3 border-b border-forest/10">
            {DAILY_COUNTS.map((day) => (
              <div
                key={day.date}
                className="relative flex-1 rounded-t-md bg-danger/20"
                style={{
                  height: `${(day.count / maxDailyCount) * 100}%`,
                }}
              >
                <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger" />
              </div>
            ))}
          </div>

          <div className="mt-2 flex justify-between text-[9px] text-muted">
            {DAILY_COUNTS.map((day) => (
              <span key={day.date}>{day.date.slice(5)}</span>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-forest/10 bg-white p-4">
          <p className="font-bold text-forest">Recent cases nearby</p>

          <div className="mt-3 space-y-3">
            {DELHI_CASES.map((c, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-forest/5 pb-2 text-sm last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold text-forest">{c.disease}</p>
                  <p className="text-xs text-muted">
                    {c.crop_label} &middot; {c.severity} severity
                  </p>
                </div>

                <span className="text-xs font-semibold text-muted">
                  {c.distance_km} km
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-3 rounded-[24px] border border-danger/20 bg-white p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-danger text-white">
            <AlertTriangle size={23} />
          </span>

          <div>
            <h2 className="font-bold text-forest">
              Early Blight cases increasing
            </h2>

            <p className="mt-1 text-sm leading-5 text-muted">
              Conditions currently favour disease spread across the
              Delhi NCR region.
            </p>

            <button
              type="button"
              onClick={() => router.push("/farm")}
              className="mt-3 flex items-center gap-2 text-sm font-bold text-danger"
            >
              <MapPin size={17} />
              Check my farm
            </button>
          </div>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
