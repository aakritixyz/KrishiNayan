"use client";

import BottomNav from "@/components/BottomNav";
import HealthTrendChart from "@/components/HealthTrendChart";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiJson, ApiError } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft,
  ChevronRight,
  Leaf,
  Minus,
  ScanLine,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

type ScanEntry = {
  id: number;
  disease: string;
  confidence: number;
  prediction_status: string;
  severity: string;
  health_score: number;
  created_at: string;
};

type CropHealthGroup = {
  crop: string;
  crop_label: string;
  field_label: string;
  scan_count: number;
  current: ScanEntry;
  previous: ScanEntry | null;
  point_change: number | null;
  percent_change: number | null;
  trend: "improving" | "deteriorating" | "stable" | "insufficient_data";
  next_estimate: {
    projected_next_score: number;
    direction: string;
    based_on_scans: number;
  } | null;
  history: ScanEntry[];
};

function TrendBadge({ trend }: { trend: CropHealthGroup["trend"] }) {
  if (trend === "improving") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-leaf/25 px-2.5 py-1 text-xs font-bold text-forest">
        <TrendingUp size={13} /> Improving
      </span>
    );
  }

  if (trend === "deteriorating") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-danger/15 px-2.5 py-1 text-xs font-bold text-danger">
        <TrendingDown size={13} /> Deteriorating
      </span>
    );
  }

  if (trend === "stable") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-1 text-xs font-bold text-forest">
        <Minus size={13} /> Stable
      </span>
    );
  }

  return (
    <span className="rounded-full bg-forest/10 px-2.5 py-1 text-xs font-bold text-muted">
      New
    </span>
  );
}

function healthScoreColorClass(score: number): string {
  if (score >= 70) return "text-forest";
  if (score >= 40) return "text-warning";
  return "text-danger";
}

function HealthGroupDetail({ group }: { group: CropHealthGroup }) {
  const chartPoints = group.history.map((entry) => ({
    date: entry.created_at,
    score: entry.health_score,
    disease: entry.disease,
  }));

  return (
    <div className="mt-4 rounded-[24px] border border-forest/15 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-forest">
            {group.crop_label} — {group.field_label}
          </h3>
          <p className="text-xs text-muted">
            {group.scan_count} scan{group.scan_count === 1 ? "" : "s"} recorded
          </p>
        </div>

        <TrendBadge trend={group.trend} />
      </div>

      {group.scan_count < 2 ? (
        <p className="mt-3 rounded-xl bg-forest/5 p-3 text-xs leading-5 text-muted">
          This is your first scan for this crop/field — scan again
          later to start seeing a real trend here.
        </p>
      ) : (
        <>
          <div className="mt-3">
            <HealthTrendChart points={chartPoints} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-forest/5 p-3">
              <p className="text-xs text-muted">Since last scan</p>
              <p
                className={`mt-1 text-lg font-bold ${
                  (group.point_change ?? 0) > 0
                    ? "text-forest"
                    : (group.point_change ?? 0) < 0
                    ? "text-danger"
                    : "text-muted"
                }`}
              >
                {group.point_change !== null
                  ? `${group.point_change > 0 ? "+" : ""}${group.point_change} pts`
                  : "—"}
              </p>
              {group.percent_change !== null && (
                <p className="text-xs text-muted">
                  {group.percent_change > 0 ? "+" : ""}
                  {group.percent_change}%
                </p>
              )}
            </div>

            <div className="rounded-xl bg-forest/5 p-3">
              <p className="text-xs text-muted">Current score</p>
              <p
                className={`mt-1 text-lg font-bold ${healthScoreColorClass(
                  group.current.health_score
                )}`}
              >
                {Math.round(group.current.health_score)}/100
              </p>
              <p className="text-xs text-muted">
                {group.current.disease}
              </p>
            </div>
          </div>

          {group.next_estimate && (
            <div className="mt-3 rounded-xl bg-forest/5 p-3 text-xs leading-5">
              <p className="font-bold text-forest">What&apos;s likely next</p>
              <p className="mt-1 text-muted">
                Based on your last {group.next_estimate.based_on_scans}{" "}
                scans, the score looks{" "}
                <span className="font-semibold text-forest">
                  {group.next_estimate.direction}
                </span>
                , projecting to roughly{" "}
                <span className="font-semibold text-forest">
                  {Math.round(group.next_estimate.projected_next_score)}/100
                </span>{" "}
                next time — this is a simple estimate from your own
                scan history, not a guarantee.
              </p>
            </div>
          )}
        </>
      )}

      <div className="mt-3 border-t border-forest/10 pt-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">
          Scan history
        </p>

        <div className="mt-2 space-y-2">
          {[...group.history].reverse().map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-xl bg-forest/5 px-3 py-2 text-xs"
            >
              <span className="text-muted">
                {new Date(entry.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="font-semibold text-forest">
                {entry.disease}
              </span>
              <span
                className={`font-bold ${healthScoreColorClass(
                  entry.health_score
                )}`}
              >
                {Math.round(entry.health_score)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CropHealthView() {
  const router = useRouter();
  const { isGuest } = useAuth();

  const [groups, setGroups] = useState<CropHealthGroup[] | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest) {
      const sample: CropHealthGroup[] = [{ crop: "tomato", crop_label: "Tomato", field_label: "North Plot", scan_count: 3, current: { id: 3, disease: "Early Blight", confidence: 0.88, prediction_status: "complete", severity: "moderate", health_score: 72, created_at: "2026-08-26T10:00:00Z" }, previous: { id: 2, disease: "Early Blight", confidence: 0.84, prediction_status: "complete", severity: "moderate", health_score: 64, created_at: "2026-08-19T10:00:00Z" }, point_change: 8, percent_change: 12.5, trend: "improving", next_estimate: { projected_next_score: 78, direction: "improving", based_on_scans: 3 }, history: [{ id: 1, disease: "Early Blight", confidence: 0.81, prediction_status: "complete", severity: "high", health_score: 55, created_at: "2026-08-12T10:00:00Z" }, { id: 2, disease: "Early Blight", confidence: 0.84, prediction_status: "complete", severity: "moderate", health_score: 64, created_at: "2026-08-19T10:00:00Z" }, { id: 3, disease: "Early Blight", confidence: 0.88, prediction_status: "complete", severity: "moderate", health_score: 72, created_at: "2026-08-26T10:00:00Z" }] }];
      setGroups(sample);
      setSelectedKey("tomato::North Plot");
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const data = await apiJson<{ crops: CropHealthGroup[] }>(
          "/crop-health/overview"
        );
        setGroups(data.crops);

        if (data.crops.length > 0) {
          setSelectedKey(`${data.crops[0].crop}::${data.crops[0].field_label}`);
        }
      } catch (error) {
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Couldn't load your crop health history."
        );
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isGuest]);

  const selectedGroup = groups?.find(
    (group) => `${group.crop}::${group.field_label}` === selectedKey
  );

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
            Crop Health Memory
          </h1>

          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest">
            <Leaf size={19} />
          </span>
        </header>

        <p className="mt-4 text-sm leading-6 text-muted">
          Every scan builds your history — real health scores, real
          trends, no guessing.
        </p>

        {errorMessage && (
          <p className="mt-4 rounded-xl bg-danger/10 p-3 text-xs font-semibold text-danger">
            {errorMessage}
          </p>
        )}

        {groups === null && !errorMessage && (
          <p className="mt-8 text-center text-sm text-muted">
            Loading your history...
          </p>
        )}

        {groups !== null && groups.length === 0 && (
          <div className="mt-8 flex flex-col items-center rounded-[24px] border border-dashed border-forest/20 bg-white p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest/5 text-forest">
              <Leaf size={26} />
            </span>
            <h2 className="mt-4 font-bold text-forest">
              No scan history yet
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Analyse a crop to start building your Crop Health
              Memory. Scan the same crop or field again later to see
              real trends here.
            </p>
            <button
              type="button"
              onClick={() => router.push("/scan")}
              className="mt-5 flex items-center gap-2 rounded-2xl bg-leaf px-5 py-3 text-sm font-bold text-forest-deep"
            >
              <ScanLine size={18} />
              Scan a crop
            </button>
          </div>
        )}

        {groups !== null && groups.length > 0 && (
          <>
            <div className="mt-4 space-y-3">
              {groups.map((group) => {
                const key = `${group.crop}::${group.field_label}`;
                const isSelected = key === selectedKey;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedKey(key)}
                    className={`flex w-full items-center gap-3 rounded-[20px] border p-3 text-left transition ${
                      isSelected
                        ? "border-leaf bg-leaf/10"
                        : "border-forest/10 bg-white"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest/5">
                      <span
                        className={`font-bold ${healthScoreColorClass(
                          group.current.health_score
                        )}`}
                      >
                        {Math.round(group.current.health_score)}
                      </span>
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-forest">
                        {group.crop_label} — {group.field_label}
                      </p>
                      <p className="text-xs text-muted">
                        {group.current.disease} ·{" "}
                        {group.scan_count} scan
                        {group.scan_count === 1 ? "" : "s"}
                      </p>
                    </div>

                    <TrendBadge trend={group.trend} />

                    <ChevronRight
                      size={16}
                      className={
                        isSelected ? "text-forest" : "text-muted"
                      }
                    />
                  </button>
                );
              })}
            </div>

            {selectedGroup && <HealthGroupDetail group={selectedGroup} />}
          </>
        )}

        <BottomNav />
      </section>
    </main>
  );
}

export default function CropHealthPage() {
  return (
    <ProtectedRoute>
      <CropHealthView />
    </ProtectedRoute>
  );
}
