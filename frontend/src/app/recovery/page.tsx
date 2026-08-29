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
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import {
  recoveryTitle,
  translateCrop,
  tx,
} from "@/lib/analysis-translations";

type StoredPrediction = {
  crop?: string;
  detected_issue?: string;
};

export default function RecoveryPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [completed, setCompleted] = useState(false);
  const [prediction, setPrediction] = useState<StoredPrediction | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("krishiNayanPrediction");
    if (!saved) return;

    try {
      setPrediction(JSON.parse(saved));
    } catch {
      setPrediction(null);
    }
  }, []);

  const crop = prediction?.crop || "Tomato";
  const disease = prediction?.detected_issue || "Early Blight";

  const timeline = [
    { day: 1, task: "Disease identified", done: true },
    { day: 2, task: "Remove affected leaves", done: completed },
    { day: 3, task: "Apply recommended treatment", done: false },
    { day: 5, task: "Check new leaf growth", done: false },
    { day: 7, task: "Scan crop again", done: false },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-forest"
            aria-label={tx("Go back", language)}
          >
            <ArrowLeft size={21} />
          </button>

          <h1 className="text-lg font-bold text-forest">
            {tx("Recovery Plan", language)}
          </h1>

          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf text-forest">
            <Leaf size={21} />
          </span>
        </header>

        <div className="mt-6 rounded-[28px] bg-forest p-5 text-white">
          <p className="text-xs uppercase tracking-widest text-white/60">
            {translateCrop(crop, language)}
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {recoveryTitle(disease, language)}
          </h2>

          <p className="mt-2 text-sm text-white/65">
            {language === "en"
              ? `Day 2 of your 7-day recovery plan`
              : language === "hi"
              ? `आपकी 7-दिन की रिकवरी योजना का दिन 2`
              : language === "pa"
              ? `ਤੁਹਾਡੀ 7-ਦਿਨਾਂ ਦੀ ਸੁਧਾਰ ਯੋਜਨਾ ਦਾ ਦਿਨ 2`
              : `तुमच्या 7-दिवसांच्या पुनर्प्राप्ती योजनेतील दिवस 2`}
          </p>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-[32%] rounded-full bg-leaf" />
          </div>

          <p className="mt-2 text-xs text-white/60">
            {language === "en"
              ? "32% complete • 5 days remaining"
              : language === "hi"
              ? "32% पूरा • 5 दिन शेष"
              : language === "pa"
              ? "32% ਪੂਰਾ • 5 ਦਿਨ ਬਾਕੀ"
              : "32% पूर्ण • 5 दिवस बाकी"}
          </p>
        </div>

        <div className="mt-5 flex gap-3 rounded-[22px] bg-warning/20 p-4">
          <CloudRain className="shrink-0 text-warning" size={25} />
          <div>
            <h3 className="font-bold text-forest">
              {tx("Rain expected tonight", language)}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {tx("Wait until tomorrow morning before treatment.", language)}
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-lg font-bold text-forest">
          {tx("Today's task", language)}
        </h2>

        <div className="mt-3 rounded-[24px] bg-white p-4">
          <div className="flex gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-leaf">
              <ShieldCheck size={24} />
            </span>

            <div>
              <h3 className="font-bold text-forest">
                {tx("Remove affected leaves", language)}
              </h3>

              <p className="mt-1 text-sm leading-5 text-muted">
                {tx(
                  "Remove infected leaves and keep them away from healthy plants.",
                  language
                )}
              </p>

              <p className="mt-3 flex items-center gap-2 text-xs font-bold text-forest">
                <CalendarDays size={16} />
                {tx("Best time", language)}: 7–9 AM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCompleted(!completed)}
            className="mt-4 w-full rounded-2xl bg-leaf px-4 py-3 font-bold text-forest-deep"
          >
            {completed
              ? tx("Task Completed ✓", language)
              : tx("Mark Task Complete", language)}
          </button>
        </div>

        <h2 className="mt-6 text-lg font-bold text-forest">
          {tx("Recovery timeline", language)}
        </h2>

        <div className="mt-3 rounded-[24px] bg-white p-4">
          {timeline.map((item) => (
            <div
              key={item.day}
              className="flex gap-3 border-b border-forest/10 py-3 last:border-0"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  item.done ? "bg-leaf text-forest" : "bg-forest/5 text-muted"
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
                  {tx("Day", language)} {item.day}
                </p>
                <p className="font-semibold text-forest">
                  {tx(item.task, language)}
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
