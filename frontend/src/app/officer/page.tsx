"use client";

import { apiJson, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  FileText,
  Leaf,
  Loader2,
  LogOut,
  MapPinned,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

type Overview = {
  scope: { state: string | null; district: string | null; organisation: string | null };
  summary: {
    total_scans: number;
    unique_farmers: number;
    recent_disease_scans: number;
    high_risk_scans: number;
    top_disease: string | null;
  };
  disease_breakdown: { disease: string; count: number }[];
  crop_breakdown: { crop: string; count: number }[];
};

type Hotspot = {
  district: string;
  disease: string;
  scan_count: number;
  average_confidence: number;
  priority: "critical" | "high" | "watch";
};

type Advisory = {
  id: number;
  title: string;
  message: string;
  crop: string | null;
  state: string;
  district: string | null;
  language: string;
  created_at: string;
};

export default function OfficerPage() {
  const { user, logout } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [crop, setCrop] = useState("");

  async function loadDashboard({ quiet = false }: { quiet?: boolean } = {}) {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const [overviewData, hotspotData, advisoryData] = await Promise.all([
        apiJson<Overview>("/officer/overview"),
        apiJson<{ hotspots: Hotspot[] }>("/officer/hotspots"),
        apiJson<{ advisories: Advisory[] }>("/officer/advisories"),
      ]);
      setOverview(overviewData);
      setHotspots(hotspotData.hotspots);
      setAdvisories(advisoryData.advisories);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load officer dashboard.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const maxDiseaseCount = useMemo(
    () => Math.max(1, ...(overview?.disease_breakdown.map((item) => item.count) ?? [1])),
    [overview]
  );

  async function publishAdvisory(event: FormEvent) {
    event.preventDefault();
    setPublishing(true);
    setNotice(null);
    try {
      await apiJson("/officer/advisories", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          crop: crop.trim() || null,
          language: "en",
        }),
      });
      setTitle("");
      setMessage("");
      setCrop("");
      setNotice({ tone: "success", text: "Advisory published to farmers in your assigned region." });
      await loadDashboard({ quiet: true });
    } catch (err) {
      setNotice({
        tone: "error",
        text: err instanceof ApiError ? err.message : "Could not publish advisory.",
      });
    } finally {
      setPublishing(false);
    }
  }

  const scopeDistrict = overview?.scope.district || user?.access_district || "Assigned district";
  const scopeState = overview?.scope.state || user?.access_state || "Assigned state";

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-x-hidden bg-[#eef2ec] text-forest sm:min-h-[844px] sm:rounded-[32px]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-forest-deep text-white shadow-sm">
        <div className="flex w-full items-center justify-between gap-2 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-leaf text-forest-deep sm:h-11 sm:w-11">
              <Leaf size={22} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55 sm:text-xs">
                KrishiNayan Institutional
              </p>
              <h1 className="truncate text-lg font-bold sm:text-xl">Officer View</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
            aria-label="Sign out"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <div className="w-full px-4 pb-10 pt-4 sm:px-5 sm:pb-10 sm:pt-6">
        <section className="rounded-[20px] bg-white p-3.5 shadow-sm sm:rounded-[24px] sm:p-5">
          <div className="flex flex-col gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted sm:text-sm">
                <ShieldCheck size={17} className="shrink-0 text-forest" />
                Verified institutional access
              </div>
              <h2 className="mt-2 text-[22px] font-bold leading-tight sm:text-2xl">Regional crop intelligence</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                Aggregated farmer scan signals for your assigned geography. Individual farmer identities are not shown.
              </p>
            </div>

            <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-forest/10 bg-[#f8faf6] px-3 py-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted">Assigned scope</p>
                <p className="mt-1 truncate text-sm font-bold text-forest">{scopeDistrict}, {scopeState}</p>
              </div>
              <button
                type="button"
                onClick={() => void loadDashboard()}
                disabled={loading}
                className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-forest/10 bg-white px-3 text-xs font-bold text-forest disabled:opacity-50"
                aria-label="Refresh dashboard"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </section>

        {loading && (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-[22px] bg-white p-5 text-sm text-muted shadow-sm">
            <Loader2 className="animate-spin" size={20} /> Loading regional data...
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-danger/15 bg-danger/10 p-4 text-sm font-semibold text-danger">
            {error}
          </div>
        )}

        {!loading && overview && (
          <>
            <section className="mt-4 grid grid-cols-2 gap-3">
              <Metric icon={<BarChart3 size={18} />} label="Total scans" value={overview.summary.total_scans} />
              <Metric icon={<Users size={18} />} label="Farmers represented" value={overview.summary.unique_farmers} />
              <Metric icon={<AlertTriangle size={18} />} label="Disease scans · 7d" value={overview.summary.recent_disease_scans} />
              <Metric icon={<MapPinned size={18} />} label="High-risk scans" value={overview.summary.high_risk_scans} />
            </section>

            <section className="mt-4 grid grid-cols-1 gap-3 sm:mt-5">
              <div className="rounded-[20px] bg-white p-3.5 shadow-sm sm:rounded-[24px] sm:p-5">
                <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                  <div>
                    <h3 className="font-bold">Disease distribution</h3>
                    <p className="mt-1 text-xs leading-5 text-muted">Real stored scans in your assigned scope.</p>
                  </div>
                  <span className="w-fit rounded-full bg-forest/5 px-3 py-1 text-[11px] font-semibold text-muted">
                    Top: {overview.summary.top_disease?.replaceAll("_", " ") || "No data"}
                  </span>
                </div>
                <div className="mt-4 space-y-4">
                  {overview.disease_breakdown.length === 0 && (
                    <Empty text="No farmer scan data is available in this region yet. Metrics will populate automatically after scoped farmers submit scans." />
                  )}
                  {overview.disease_breakdown.map((item) => (
                    <div key={item.disease}>
                      <div className="mb-1 flex justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate font-semibold">{item.disease.replaceAll("_", " ")}</span>
                        <span className="shrink-0 text-muted">{item.count}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-forest/8">
                        <div
                          className="h-full rounded-full bg-forest"
                          style={{ width: `${Math.max(4, (item.count / maxDiseaseCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] bg-forest-deep p-3.5 text-white shadow-sm sm:rounded-[24px] sm:p-5">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={19} className="text-leaf" />
                  <h3 className="font-bold">Intervention priority</h3>
                </div>
                <p className="mt-1 text-xs leading-5 text-white/55">
                  Rule-based signal from scan volume. This is not an AI forecast.
                </p>
                <div className="mt-4 space-y-3">
                  {hotspots.length === 0 && (
                    <p className="rounded-2xl bg-white/5 p-4 text-sm leading-6 text-white/60">
                      No disease hotspots detected yet. Priority cards appear once disease scans are stored for this region.
                    </p>
                  )}
                  {hotspots.slice(0, 5).map((spot, index) => (
                    <div key={`${spot.district}-${spot.disease}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate font-bold">{index + 1}. {spot.district}</span>
                        <PriorityBadge level={spot.priority} />
                      </div>
                      <p className="mt-1 text-sm text-white/75">{spot.disease.replaceAll("_", " ")} · {spot.scan_count} scans</p>
                      <p className="mt-1 text-xs text-white/45">Avg. model confidence {Math.round(spot.average_confidence * 100)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-4 grid grid-cols-1 gap-3 sm:mt-5">
              <form onSubmit={publishAdvisory} className="rounded-[20px] bg-white p-3.5 shadow-sm sm:rounded-[24px] sm:p-5">
                <div className="flex items-center gap-2">
                  <Megaphone size={19} />
                  <h3 className="font-bold">Publish regional advisory</h3>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted">Delivered only to eligible farmers in your assigned region.</p>

                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-forest/75">Title</span>
                    <input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Late Blight Risk Alert"
                      className="min-h-12 w-full rounded-2xl border border-forest/15 bg-white px-4 py-3 text-base outline-none transition focus:border-forest sm:text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-forest/75">Crop <span className="font-normal text-muted">(optional)</span></span>
                    <input
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      placeholder="e.g. Tomato"
                      className="min-h-12 w-full rounded-2xl border border-forest/15 bg-white px-4 py-3 text-base outline-none transition focus:border-forest sm:text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-forest/75">Farmer-facing guidance</span>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write short, clear, actionable guidance..."
                      rows={5}
                      className="w-full resize-y rounded-2xl border border-forest/15 bg-white px-4 py-3 text-base leading-6 outline-none transition focus:border-forest sm:text-sm"
                    />
                  </label>
                </div>

                {notice && (
                  <p
                    role="status"
                    className={`mt-3 rounded-xl p-3 text-xs font-semibold ${
                      notice.tone === "success" ? "bg-forest/5 text-forest" : "bg-danger/10 text-danger"
                    }`}
                  >
                    {notice.text}
                  </p>
                )}

                <button
                  disabled={publishing || !title.trim() || !message.trim()}
                  className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3 text-sm font-bold text-forest-deep transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {publishing && <Loader2 size={17} className="animate-spin" />}
                  {publishing ? "Publishing..." : "Publish advisory"}
                </button>
              </form>

              <div className="rounded-[20px] bg-white p-3.5 shadow-sm sm:rounded-[24px] sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><FileText size={19} /><h3 className="font-bold">Recent advisories</h3></div>
                  <span className="rounded-full bg-forest/5 px-2.5 py-1 text-[10px] font-bold text-muted">{advisories.length} published</span>
                </div>
                <div className="mt-4 space-y-3">
                  {advisories.length === 0 && <Empty text="No advisories published from this account yet." />}
                  {advisories.slice(0, 6).map((item) => (
                    <article key={item.id} className="rounded-2xl border border-forest/10 p-4">
                      <div className="flex flex-col gap-1 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between min-[420px]:gap-3">
                        <h4 className="font-bold">{item.title}</h4>
                        <span className="shrink-0 text-[11px] text-muted">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted">{item.message}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-forest/70">
                        <span>{item.district || item.state}</span>
                        {item.crop && <span>· {item.crop}</span>}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-[24px] border border-forest/10 bg-white p-4 shadow-sm sm:mt-6 sm:p-5">
              <div className="flex items-center gap-2"><Building2 size={19} /><h3 className="font-bold">Access boundaries</h3></div>
              <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-muted">
                This account can access aggregated intelligence only for <strong>{scopeDistrict}, {scopeState}</strong>. Farmer phone numbers, emails and personal profiles are intentionally excluded from this dashboard.
              </p>
              <div className="mt-3 rounded-2xl bg-[#f8faf6] p-3 text-xs leading-5 text-muted sm:hidden">
                Signed in as <strong className="text-forest">{user?.organisation || user?.full_name}</strong>{user?.institutional_id ? ` · ${user.institutional_id}` : ""}
              </div>
            </section>
          </>
        )}
      </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-[18px] bg-white p-3 shadow-sm sm:rounded-[22px] sm:p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf/25 text-forest">{icon}</span>
      <p className="mt-2.5 text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1.5 break-words text-[11px] font-semibold leading-4 text-muted sm:text-xs">{label}</p>
    </div>
  );
}

function PriorityBadge({ level }: { level: "critical" | "high" | "watch" }) {
  const styles = level === "critical"
    ? "bg-danger/20 text-red-200"
    : level === "high"
      ? "bg-warning/20 text-yellow-100"
      : "bg-white/10 text-white/60";
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles}`}>{level}</span>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl bg-forest/5 p-4 text-sm leading-6 text-muted">{text}</p>;
}
