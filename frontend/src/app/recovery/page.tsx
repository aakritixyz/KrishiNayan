"use client";

import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CloudRain,
  Leaf,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { useState } from "react";

export default function RecoveryPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState(false);

  const timeline = [
    { day: "Day 1", task: "Disease identified", done: true },
    {
      day: "Day 2",
      task: "Remove affected leaves",
      done: completed,
    },
    {
      day: "Day 3",
      task: "Apply recommended treatment",
      done: false,
    },
    {
      day: "Day 5",
      task: "Check new leaf growth",
      done: false,
    },
    {
      day: "Day 7",
      task: "Scan crop again",
      done: false,
    },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest"
          >
            <ArrowLeft size={21} />
          </button>

          <h1 className="text-lg font-bold text-forest">
            Recovery Plan
          </h1>

          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf text-forest">
            <Leaf size={21} />
          </span>
        </header>

        <div className="mt-6 rounded-[28px] bg-forest p-5 text-white">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Tomato Plot
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Early Blight Recovery
          </h2>

          <p className="mt-2 text-sm text-white/65">
            Day 2 of your 7-day recovery plan
          </p>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-[32%] rounded-full bg-leaf" />
          </div>

          <p className="mt-2 text-xs text-white/60">
            32% complete • 5 days remaining
          </p>
        </div>

        <div className="mt-5 flex gap-3 rounded-[22px] bg-warning/20 p-4">
          <CloudRain className="shrink-0 text-warning" size={25} />

          <div>
            <h3 className="font-bold text-forest">
              Rain expected tonight
            </h3>

            <p className="mt-1 text-sm text-muted">
              Wait until tomorrow morning before treatment.
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-lg font-bold text-forest">
          Today&apos;s task
        </h2>

        <div className="mt-3 rounded-[24px] bg-white p-4">
          <div className="flex gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-leaf">
              <ShieldCheck size={24} />
            </span>

            <div>
              <h3 className="font-bold text-forest">
                Remove affected leaves
              </h3>

              <p className="mt-1 text-sm leading-5 text-muted">
                Remove infected leaves and keep them away from healthy
                plants.
              </p>

              <p className="mt-3 flex items-center gap-2 text-xs font-bold text-forest">
                <CalendarDays size={16} />
                Best time: 7–9 AM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCompleted(!completed)}
            className="mt-4 w-full rounded-2xl bg-leaf px-4 py-3 font-bold text-forest-deep"
          >
            {completed ? "Task Completed ✓" : "Mark Task Complete"}
          </button>
        </div>

        <h2 className="mt-6 text-lg font-bold text-forest">
          Recovery timeline
        </h2>

        <div className="mt-3 rounded-[24px] bg-white p-4">
          {timeline.map((item) => (
            <div
              key={item.day}
              className="flex gap-3 border-b border-forest/10 py-3 last:border-0"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  item.done
                    ? "bg-leaf text-forest"
                    : "bg-forest/5 text-muted"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Sprout size={18} />
                )}
              </span>

              <div>
                <p className="text-xs font-bold text-muted">
                  {item.day}
                </p>
                <p className="font-semibold text-forest">
                  {item.task}
                </p>
              </div>
            </div>
          ))}
        </div>

        <BottomNav />
      </section>
    </main>
  );
}