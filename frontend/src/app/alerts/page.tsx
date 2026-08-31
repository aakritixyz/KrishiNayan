"use client";

import BottomNav from "@/components/BottomNav";
import { apiJson } from "@/lib/api";
import { AlertTriangle, ArrowLeft, Filter, MapPin, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MapCase } from "@/components/AlertsMap";

const AlertsMap = dynamic(() => import("@/components/AlertsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[260px] w-full items-center justify-center rounded-[22px] bg-forest/5 text-sm text-muted">
      Loading map...
    </div>
  ),
});

type AlertCase = MapCase & {
  id: number;
  state: string | null;
  district: string | null;
  distance_km: number | null;
};

type AlertsResponse = {
  summary: {
    case_count: number;
    affected_locations: number;
    risk_level: string;
    top_disease: string | null;
    radius_km: number;
  };
  daily_counts: { date: string; count: number }[];
  cases: AlertCase[];
};

const DEFAULT_CENTER = { latitude: 20.5937, longitude: 78.9629 };

export default function AlertsPage() {
  const router = useRouter();
  const [data, setData] = useState<AlertsResponse | null>(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);

  const loadAlerts = useCallback(async function loadAlerts(coords?: typeof DEFAULT_CENTER) {
    const params = new URLSearchParams({
      radius_km: "25",
    });
    if (coords?.latitude && coords?.longitude) {
      params.set("latitude", String(coords.latitude));
      params.set("longitude", String(coords.longitude));
    }
    let response = await apiJson<AlertsResponse>(`/alerts/nearby?${params}`);
    if (coords && response.summary.case_count === 0) {
      response = await apiJson<AlertsResponse>("/alerts/nearby?radius_km=25");
    }
    setData(response);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      void loadAlerts(undefined);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCenter(next);
        void loadAlerts(next);
      },
      () => void loadAlerts(undefined),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, [loadAlerts]);

  const cases = data?.cases ?? [];
  const mapCases = cases.filter(
    (item) => item.latitude !== null && item.longitude !== null
  ) as MapCase[];
  const dailyCounts = data?.daily_counts ?? [];
  const maxDailyCount = Math.max(1, ...dailyCounts.map((day) => day.count));

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <button type="button" onClick={() => router.back()} className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest">
            <ArrowLeft size={21} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-forest">Nearby Crop Alerts</h1>
            <p className="text-[11px] text-muted">Last 7 days from scan history</p>
          </div>
          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest">
            <Filter size={20} />
          </button>
        </header>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <div className="rounded-[20px] border border-forest/10 bg-white p-3">
            <p className="text-2xl font-bold text-danger">{data?.summary.case_count ?? 0}</p>
            <p className="mt-1 text-xs font-semibold text-forest">Cases</p>
            <p className="text-[10px] text-muted">Last 7 days</p>
          </div>
          <div className="rounded-[20px] border border-forest/10 bg-white p-3">
            <p className="text-2xl font-bold text-warning">{data?.summary.affected_locations ?? 0}</p>
            <p className="mt-1 text-xs font-semibold text-forest">Locations</p>
            <p className="text-[10px] text-muted">Within {data?.summary.radius_km ?? 25} km</p>
          </div>
          <div className="rounded-[20px] border border-forest/10 bg-white p-3">
            <p className="text-xl font-bold text-danger">{data?.summary.risk_level ?? "Low"}</p>
            <p className="mt-1 text-xs font-semibold text-forest">Risk</p>
            <p className="text-[10px] text-muted">Current level</p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[22px] border border-forest/10">
          <AlertsMap centerLat={center.latitude} centerLon={center.longitude} radiusKm={data?.summary.radius_km ?? 25} cases={mapCases} />
        </div>

        <div className="mt-5 rounded-[24px] border border-forest/10 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-forest">Cases in your area</p>
              <p className="text-xs text-muted">Real scan records, grouped by day</p>
            </div>
            <TrendingUp size={21} className="text-danger" />
          </div>

          {dailyCounts.length > 0 ? (
            <>
              <div className="mt-5 flex h-28 items-end gap-3 border-b border-forest/10">
                {dailyCounts.map((day) => (
                  <div key={day.date} className="relative flex-1 rounded-t-md bg-danger/20" style={{ height: `${(day.count / maxDailyCount) * 100}%` }}>
                    <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger" />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[9px] text-muted">
                {dailyCounts.map((day) => <span key={day.date}>{day.date.slice(5)}</span>)}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted">No nearby disease clusters found this week.</p>
          )}
        </div>

        <div className="mt-5 rounded-[24px] border border-forest/10 bg-white p-4">
          <p className="font-bold text-forest">Recent cases nearby</p>
          <div className="mt-3 space-y-3">
            {cases.length === 0 ? (
              <p className="text-sm text-muted">New scan records will appear here when disease cases are detected nearby.</p>
            ) : (
              cases.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-forest/5 pb-2 text-sm last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-forest">{item.disease}</p>
                    <p className="text-xs text-muted">{item.crop_label} - {item.severity} severity{item.district ? ` - ${item.district}` : ""}</p>
                  </div>
                  <span className="text-xs font-semibold text-muted">{item.distance_km !== null ? `${item.distance_km} km` : "same area"}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {data?.summary.top_disease && (
          <div className="mt-5 flex gap-3 rounded-[24px] border border-danger/20 bg-white p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-danger text-white">
              <AlertTriangle size={23} />
            </span>
            <div>
              <h2 className="font-bold text-forest">{data.summary.top_disease} cases increasing</h2>
              <p className="mt-1 text-sm leading-5 text-muted">Recent farmer scans show similar disease reports in the selected radius.</p>
              <button type="button" onClick={() => router.push("/farm")} className="mt-3 flex items-center gap-2 text-sm font-bold text-danger">
                <MapPin size={17} />
                Check my farm
              </button>
            </div>
          </div>
        )}

        <BottomNav />
      </section>
    </main>
  );
}
