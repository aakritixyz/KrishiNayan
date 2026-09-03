"use client";

import BottomNav from "@/components/BottomNav";
import { apiJson, getStoredToken } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { recoveryTitle, translateCrop, tx } from "@/lib/analysis-translations";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CloudRain,
  Leaf,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RecoveryTask = {
  id: number;
  day: number;
  title: string;
  description: string;
  due_date: string | null;
  best_time: string | null;
  completed: boolean;
};

type RecoveryPlan = {
  id: number;
  crop: string;
  crop_label: string;
  disease: string;
  progress_percent: number;
  tasks: RecoveryTask[];
};

type StoredPrediction = {
  crop?: string;
  detected_issue?: string;
  recommended_action?: string;
  cost_estimate?: {
    min: number;
    max: number;
    note: string;
  } | null;
};

function fallbackTasks(action?: string): RecoveryTask[] {
  return [
    { id: 1, day: 1, title: "Disease identified", description: "Review the scan result.", due_date: null, best_time: null, completed: true },
    { id: 2, day: 2, title: "Remove affected leaves", description: "Remove infected leaves and keep them away from healthy plants.", due_date: null, best_time: "7-9 AM", completed: false },
    { id: 3, day: 3, title: "Apply recommended treatment", description: action || "Follow the recommended treatment from your scan.", due_date: null, best_time: "7-9 AM", completed: false },
    { id: 4, day: 7, title: "Scan crop again", description: "Upload a follow-up photo to compare recovery progress.", due_date: null, best_time: null, completed: false },
  ];
}

export default function RecoveryPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [plan, setPlan] = useState<RecoveryPlan | null>(null);
  const [fallback, setFallback] = useState<StoredPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = useCallback(async function loadPlan() {
    const savedPrediction = sessionStorage.getItem("krishiNayanPrediction");
    if (savedPrediction) {
      try {
        setFallback(JSON.parse(savedPrediction));
      } catch {
        setFallback(null);
      }
    }

    if (!getStoredToken()) return;

    try {
      const planId = new URLSearchParams(window.location.search).get("planId");
      const path = planId ? `/recovery/${planId}` : "/recovery/latest";
      const data = await apiJson<{ plan: RecoveryPlan | null }>(path);
      setPlan(data.plan);
    } catch {
      setError("Couldn't load your saved recovery plan.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPlan();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPlan]);

  async function toggleTask(task: RecoveryTask) {
    if (!plan) return;
    const data = await apiJson<{ plan: RecoveryPlan }>(`/recovery/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: !task.completed }),
    });
    setPlan(data.plan);
  }

  const crop = plan?.crop_label || fallback?.crop || "Tomato";
  const disease = plan?.disease || fallback?.detected_issue || "Early Blight";
  const tasks = plan?.tasks || fallbackTasks(fallback?.recommended_action);
  const completed = tasks.filter((task) => task.completed).length;
  const progress = plan?.progress_percent ?? Math.round((completed / tasks.length) * 100);
  const nextTask = tasks.find((task) => !task.completed) ?? tasks[tasks.length - 1];

  return (
    <main className="app-main flex min-h-screen items-center justify-center bg-forest-deep sm:p-6 lg:items-start lg:justify-center">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden app-frame bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <button type="button" onClick={() => router.back()} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest" aria-label={tx("Go back", language)}>
            <ArrowLeft size={21} />
          </button>
          <h1 className="text-lg font-bold text-forest">{tx("Recovery Plan", language)}</h1>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf text-forest">
            <Leaf size={21} />
          </span>
        </header>

        {error && <div className="mt-4 rounded-2xl border border-danger/20 bg-white p-3 text-sm font-semibold text-danger">{error}</div>}

        <div className="mt-6 rounded-[28px] bg-forest p-5 text-white">
          <p className="text-xs uppercase tracking-widest text-white/60">{translateCrop(crop, language)}</p>
          <h2 className="mt-2 text-2xl font-bold">{recoveryTitle(disease, language)}</h2>
          <p className="mt-2 text-sm text-white/65">{completed} of {tasks.length} tasks complete</p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-leaf" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/60">{progress}% complete</p>
        </div>

        {fallback?.cost_estimate && (
          <div className="mt-4 flex gap-3 rounded-[22px] bg-warning/20 p-4">
            <CloudRain className="shrink-0 text-warning" size={25} />
            <div>
              <h3 className="font-bold text-forest">Estimated treatment cost</h3>
              <p className="mt-1 text-sm text-muted">₹{fallback.cost_estimate.min} - ₹{fallback.cost_estimate.max}. {fallback.cost_estimate.note}</p>
            </div>
          </div>
        )}

        <h2 className="mt-6 text-lg font-bold text-forest">{tx("Today's task", language)}</h2>

        <div className="mt-3 rounded-[24px] bg-white p-4">
          <div className="flex gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-leaf">
              <ShieldCheck size={24} />
            </span>
            <div>
              <h3 className="font-bold text-forest">{tx(nextTask.title, language)}</h3>
              <p className="mt-1 text-sm leading-5 text-muted">{tx(nextTask.description, language)}</p>
              {nextTask.best_time && (
                <p className="mt-3 flex items-center gap-2 text-xs font-bold text-forest">
                  <CalendarDays size={16} />
                  {tx("Best time", language)}: {nextTask.best_time}
                </p>
              )}
            </div>
          </div>
          {plan && (
            <button type="button" onClick={() => void toggleTask(nextTask)} className="mt-4 w-full rounded-2xl bg-leaf px-4 py-3 font-bold text-forest-deep">
              {nextTask.completed ? tx("Task Completed", language) : tx("Mark Task Complete", language)}
            </button>
          )}
        </div>

        <h2 className="mt-6 text-lg font-bold text-forest">{tx("Recovery timeline", language)}</h2>

        <div className="mt-3 rounded-[24px] bg-white p-4">
          {tasks.map((item) => (
            <div key={item.id} className="flex gap-3 border-b border-forest/10 py-3 last:border-0">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.completed ? "bg-leaf text-forest" : "bg-forest/5 text-muted"}`}>
                {item.completed ? <CheckCircle2 size={18} /> : <Sprout size={18} />}
              </span>
              <div>
                <p className="text-xs font-bold text-muted">{tx("Day", language)} {item.day}{item.due_date ? ` - ${item.due_date}` : ""}</p>
                <p className="font-semibold text-forest">{tx(item.title, language)}</p>
                <p className="mt-1 text-sm text-muted">{tx(item.description, language)}</p>
              </div>
            </div>
          ))}
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
