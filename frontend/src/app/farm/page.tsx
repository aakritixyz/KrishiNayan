"use client";

import BottomNav from "@/components/BottomNav";
import FarmPlotMap, { type FarmMapPlot } from "@/components/FarmPlotMap";
import { apiJson, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { tr } from "@/lib/static-translate";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  MapPin,
  Plus,
  ScanLine,
  Sprout,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Plot = {
  id: number;
  name: string;
  crop: string;
  crop_label: string;
  growth_stage: string | null;
  sowing_date: string | null;
  area_acres: number | null;
  state: string | null;
  district: string | null;
  village: string | null;
  latitude: number | null;
  longitude: number | null;
  latest_scan: {
    disease: string;
    severity: string;
    health_score: number;
    created_at: string;
  } | null;
};

const EMPTY_FORM = {
  name: "",
  crop: "tomato",
  growth_stage: "Flowering",
  sowing_date: "",
  area_acres: "",
  state: "",
  district: "",
  village: "",
  latitude: "",
  longitude: "",
};

export default function FarmPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isGuest } = useAuth();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadPlots = useCallback(async function loadPlots() {
    if (isGuest) {
      setPlots([]);
      return;
    }

    try {
      const data = await apiJson<{ plots: Plot[] }>("/plots");
      setPlots(data.plots);
      setSelectedId((current) => current ?? data.plots[0]?.id ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
        : "Couldn't load your plots."
      );
    }
  }, [isGuest]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPlots();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPlots]);

  async function createPlot(event: FormEvent) {
    event.preventDefault();
    if (isGuest) {
      setError("Guest mode is read-only. Create an account to save plots.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const data = await apiJson<{ plot: Plot }>("/plots", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          sowing_date: form.sowing_date || null,
          area_acres: form.area_acres ? Number(form.area_acres) : null,
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
        }),
      });
      setPlots((current) => [data.plot, ...current]);
      setSelectedId(data.plot.id);
      setForm(EMPTY_FORM);
    } catch (saveError) {
      setError(
        saveError instanceof ApiError
          ? saveError.message
          : "Couldn't save this plot."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePlot(plotId: number) {
    try {
      await apiJson(`/plots/${plotId}`, { method: "DELETE" });
      setPlots((current) => current.filter((plot) => plot.id !== plotId));
      setSelectedId((current) => (current === plotId ? null : current));
    } catch {
      setError("Couldn't delete this plot.");
    }
  }

  const selected = plots.find((plot) => plot.id === selectedId) ?? plots[0];
  const mapPlots: FarmMapPlot[] = plots.map((plot) => ({
    id: plot.id,
    name: plot.name,
    crop_label: plot.crop_label,
    health_score: plot.latest_scan?.health_score ?? null,
    latitude: plot.latitude,
    longitude: plot.longitude,
  }));

  return (
    <main className="app-main flex min-h-screen items-center justify-center bg-forest-deep sm:p-6 lg:items-start lg:justify-center">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden app-frame bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <button type="button" onClick={() => router.back()} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest" aria-label={tr("Go back", language)}>
            <ArrowLeft size={21} />
          </button>
          <h1 className="text-lg font-bold text-forest">{tr("My Farm Map", language)}</h1>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest">
            <MapPin size={21} />
          </span>
        </header>

        {error && <div className="mt-4 rounded-2xl border border-danger/20 bg-white p-3 text-sm font-semibold text-danger">{error}</div>}

        <form onSubmit={createPlot} className="mt-5 rounded-[22px] bg-white p-4">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-leaf" />
            <h2 className="font-bold text-forest">Add plot</h2>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="North Plot" required className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm" />
            <select value={form.crop} onChange={(event) => setForm({ ...form, crop: event.target.value })} className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm">
              <option value="tomato">Tomato</option>
              <option value="maize">Maize</option>
              <option value="rice">Rice</option>
            </select>
            <input value={form.growth_stage} onChange={(event) => setForm({ ...form, growth_stage: event.target.value })} placeholder="Growth stage" className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm" />
            <input type="number" min="0" step="0.1" value={form.area_acres} onChange={(event) => setForm({ ...form, area_acres: event.target.value })} placeholder="Acres" className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm" />
            <input type="date" value={form.sowing_date} onChange={(event) => setForm({ ...form, sowing_date: event.target.value })} className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm" />
            <input value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })} placeholder="District" className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm" />
            <input value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} placeholder="State" className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm" />
            <input value={form.village} onChange={(event) => setForm({ ...form, village: event.target.value })} placeholder="Village" className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm" />
            <input type="number" min="-90" max="90" step="0.000001" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} placeholder="Latitude" className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm" />
            <input type="number" min="-180" max="180" step="0.000001" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} placeholder="Longitude" className="rounded-xl border border-forest/15 bg-forest/5 px-3 py-2 text-sm" />
          </div>

          <button type="submit" disabled={isSaving} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3 font-bold text-forest-deep disabled:opacity-50">
            <Plus size={18} />
            {isSaving ? "Saving..." : "Save Plot"}
          </button>
        </form>

        <div className="mt-5 rounded-[24px] border border-forest/10 bg-white p-2">
          <FarmPlotMap plots={mapPlots} selectedId={selected?.id ?? null} />
          <p className="px-3 pb-2 pt-3 text-xs font-semibold text-muted">
            GPS coordinates stay inside KrishiNayan; this private map does not send field locations to an external tile service.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {plots.length === 0 ? (
            <div className="rounded-[22px] bg-white p-5 text-center">
              <Sprout className="mx-auto text-leaf" size={30} />
              <p className="mt-3 font-bold text-forest">No saved plots yet</p>
              <p className="mt-1 text-sm text-muted">Add your first plot to attach scans, recovery plans, and alerts.</p>
            </div>
          ) : (
            plots.map((plot) => (
              <button key={plot.id} type="button" onClick={() => setSelectedId(plot.id)} className={`w-full rounded-[22px] border p-4 text-left transition ${selected?.id === plot.id ? "border-leaf bg-white" : "border-forest/10 bg-white/70"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">{plot.crop_label} {plot.growth_stage ? `- ${plot.growth_stage}` : ""}</p>
                    <h2 className="mt-1 text-xl font-bold text-forest">{plot.name}</h2>
                    <p className="mt-1 text-sm text-muted">{[plot.village, plot.district, plot.state].filter(Boolean).join(", ") || "Location not set"}</p>
                  </div>
                  <span className="rounded-full bg-forest/5 px-3 py-1 text-xs font-bold text-forest">{plot.area_acres ?? "--"} ac</span>
                </div>

                {plot.latest_scan ? (
                  <div className="mt-3 flex items-center gap-3 rounded-2xl bg-forest/5 p-3">
                    <AlertTriangle size={18} className="text-warning" />
                    <div>
                      <p className="text-sm font-bold text-forest">{plot.latest_scan.disease}</p>
                      <p className="text-xs text-muted">Health {Math.round(plot.latest_scan.health_score)} - {plot.latest_scan.severity}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted">No scans recorded for this plot.</p>
                )}
              </button>
            ))
          )}
        </div>

        {selected && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => router.push(`/scan?plotId=${selected.id}`)} className="flex items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-4 font-bold text-forest-deep">
              <ScanLine size={20} />
              Scan Plot
            </button>
            <button type="button" onClick={() => void deletePlot(selected.id)} className="flex items-center justify-center gap-2 rounded-2xl border border-danger/20 bg-white px-4 py-4 font-bold text-danger">
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        )}

        <div className="mt-4 rounded-[22px] bg-forest p-4 text-white">
          <p className="flex items-center gap-2 text-sm font-bold">
            <CalendarDays size={18} className="text-leaf" />
            Plot memory
          </p>
          <p className="mt-2 text-sm text-white/70">New scans are now linked to the selected plot, so health trends, recovery, and alert context stay attached to the right field.</p>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
