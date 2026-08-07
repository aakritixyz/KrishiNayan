"use client";

import BottomNav from "@/components/BottomNav";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CloudRain,
  Headphones,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

type PredictionResult = {
  detected_issue: string;
  confidence: number;
  prediction_status: string;
  severity: string;
  weather_risk: string;
  recommended_action: string;
  farmer_message: string;
  weather: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    rain_expected: boolean;
    source: string;
  };
};


export default function ResultPage() {
  const router = useRouter();
  const [scanImage, setScanImage] = useState(
    "/images/tomato-field.png"
  );

  const [prediction, setPrediction] =
  useState<PredictionResult | null>(null);

 useEffect(() => {
  const timer = window.setTimeout(() => {
    const savedImage = sessionStorage.getItem(
      "krishiNayanScanImage"
    );

    const savedPrediction = sessionStorage.getItem(
      "krishiNayanPrediction"
    );

    if (savedImage) {
      setScanImage(savedImage);
    }

    if (savedPrediction) {
      try {
        setPrediction(JSON.parse(savedPrediction));
      } catch {
        setPrediction(null);
      }
    }
  }, 0);

  return () => window.clearTimeout(timer);
}, []);

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
            Analysis Result
          </h1>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"
            aria-label="Result information"
          >
            <ShieldCheck size={21} />
          </button>
        </header>

        <div className="mt-6 flex items-center gap-5">
          <div
            className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "conic-gradient(#84bd00 0deg 313deg, #e5eadf 313deg 360deg)",
            }}
          >
            <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-cream">
              <strong className="text-2xl text-forest">
                {prediction ? `${prediction.confidence}%` : "--"}
              </strong>
              <span className="text-[11px] text-muted">
                Confidence
              </span>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-warning px-3 py-2 text-xs font-bold text-forest-deep">
              <AlertTriangle size={15} />
              {prediction
  ? `${prediction.severity} Risk`
  : "Risk unavailable"}
            </span>

            <h2 className="mt-3 text-2xl font-bold text-forest">
              {prediction?.detected_issue ?? "No prediction"}
            </h2>

            <p className="mt-1 text-sm italic text-muted">
            Prediction status:{" "}
{prediction?.prediction_status ?? "--"}
            </p>
          </div>
        </div>

        <div className="relative mt-6 h-[260px] overflow-hidden rounded-[26px] bg-forest/10">
          <Image
            src={scanImage}
            alt="Analysed tomato leaf"
            fill
            unoptimized
            className="object-cover"
          />

          <span className="absolute left-[40%] top-[32%] h-12 w-12 rounded-full border-2 border-warning bg-warning/30 shadow-[0_0_0_9px_rgba(245,168,0,0.2)]" />

          <span className="absolute right-[20%] top-[48%] h-9 w-9 rounded-full border-2 border-danger bg-danger/30 shadow-[0_0_0_8px_rgba(216,58,50,0.18)]" />

          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-forest-deep/85 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
            AI prediction generated from uploaded leaf image
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-[22px] bg-warning p-4 text-forest-deep">
          <CloudRain size={34} className="shrink-0" />

          <div>
            <p className="font-bold">
  {prediction?.weather_risk ?? "Weather unavailable"}
</p>
            <p className="mt-1 text-sm">
  Humidity • {prediction?.weather.humidity ?? "--"}%
</p>
            <p className="text-sm">
  Temperature •{" "}
  {prediction?.weather.temperature ?? "--"}°C
</p>
          </div>
        </div>

        <div className="mt-4 rounded-[22px] border border-forest/15 bg-white p-4">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-leaf">
              <ShieldCheck size={23} />
            </span>

            <div>
              <h3 className="font-bold text-forest">
               Recommended action
              </h3>

              <p className="mt-1 text-sm leading-5 text-muted">
  {prediction?.recommended_action ??
    "Complete a scan to receive treatment advice."}
</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-forest/10 pt-4">
            <CalendarClock size={20} className="text-forest" />

            <div>
      
              <p className="text-xs text-muted">Weather source</p>
<p className="font-bold text-forest">
  {prediction?.weather.source ?? "--"}
</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl bg-forest px-3 py-4 text-sm font-bold text-white"
          >
            <Headphones size={19} />
            Listen in Hindi
          </button>

          <button
            type="button"
            onClick={() => router.push("/recovery")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-leaf px-3 py-4 text-sm font-bold text-forest-deep"
            
          >
            <UserRound size={19} />
            Recovery Plan
          </button>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}