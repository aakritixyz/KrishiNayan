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
  Landmark,
  MessageCircle,
  ShieldCheck,
  Sprout,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getDiseaseHindi,
  LANGUAGE_STORAGE_KEY,
  type Language,
} from "@/lib/hindiTranslations";

type PredictionResult = {
  crop: string;
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
  soil_context: {
    state: string;
    district: string;
    soil_type: string;
    ph: number;
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    organic_carbon: string;
    moisture_retention: string;
    soil_risk_level: string;
    soil_risk_factors: string[];
    soil_recommendations: string[];
    summary: string;
  } | null;
  health: {
    field_label: string;
    health_score: number;
    previous_health_score: number | null;
    point_change: number | null;
    percent_change: number | null;
    trend: string;
  } | null;
  gradcam_image: string | null;
};


export default function ResultPage() {
  const router = useRouter();
  const [scanImage, setScanImage] = useState(
    "/images/tomato-field.png"
  );

  const [prediction, setPrediction] =
  useState<PredictionResult | null>(null);

  const [language, setLanguage] = useState<Language>("en");

 useEffect(() => {
  const timer = window.setTimeout(() => {
    const savedImage = sessionStorage.getItem(
      "krishiNayanScanImage"
    );

    const savedPrediction = sessionStorage.getItem(
      "krishiNayanPrediction"
    );

    const savedLanguage = sessionStorage.getItem(
      LANGUAGE_STORAGE_KEY
    );

    if (savedLanguage === "en" || savedLanguage === "hi") {
      setLanguage(savedLanguage);
    }

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
              {prediction
                ? language === "hi"
                  ? getDiseaseHindi(prediction.detected_issue).name_hi
                  : prediction.detected_issue
                : "No prediction"}
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

        {prediction?.gradcam_image && (
          <div className="mt-4 rounded-[22px] border border-forest/15 bg-white p-4">
            <h3 className="font-bold text-forest">
              Why the AI thinks this
            </h3>

            <p className="mt-1 text-sm leading-5 text-muted">
              The highlighted region shows which part of the leaf
              most influenced this diagnosis.
            </p>

            <div className="relative mt-3 h-[220px] overflow-hidden rounded-[18px] bg-forest/10">
              <Image
                src={prediction.gradcam_image}
                alt="Grad-CAM heatmap showing the diagnosed region"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        )}

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
                {language === "hi" ? "अनुशंसित कार्रवाई" : "Recommended action"}
              </h3>

              <p className="mt-1 text-sm leading-5 text-muted">
  {prediction
    ? language === "hi"
      ? getDiseaseHindi(prediction.detected_issue).advisory_hi
      : prediction.recommended_action
    : language === "hi"
    ? "सलाह पाने के लिए स्कैन पूरा करें।"
    : "Complete a scan to receive treatment advice."}
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

        {prediction?.soil_context && (
          <div className="mt-4 rounded-[22px] border border-forest/15 bg-white p-4">
            <div className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-leaf">
                <Sprout size={23} />
              </span>

              <div>
                <h3 className="font-bold text-forest">
                  Soil context —{" "}
                  {prediction.soil_context.district},{" "}
                  {prediction.soil_context.state}
                </h3>

                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                    prediction.soil_context.soil_risk_level === "High"
                      ? "bg-danger/15 text-danger"
                      : prediction.soil_context.soil_risk_level ===
                        "Medium"
                      ? "bg-warning/40 text-forest-deep"
                      : "bg-leaf/30 text-forest"
                  }`}
                >
                  {prediction.soil_context.soil_risk_level} soil risk
                </span>

                <p className="mt-2 text-sm leading-5 text-muted">
                  {prediction.soil_context.summary}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-forest/10 pt-3 text-center text-xs">
              <div>
                <p className="font-bold text-forest">
                  {prediction.soil_context.soil_type}
                </p>
                <p className="text-muted">Soil type</p>
              </div>

              <div>
                <p className="font-bold text-forest">
                  {prediction.soil_context.ph}
                </p>
                <p className="text-muted">pH</p>
              </div>

              <div>
                <p className="font-bold text-forest">
                  {prediction.soil_context.moisture_retention}
                </p>
                <p className="text-muted">Moisture</p>
              </div>

              <div>
                <p className="font-bold text-forest">
                  {prediction.soil_context.nitrogen}
                </p>
                <p className="text-muted">Nitrogen</p>
              </div>

              <div>
                <p className="font-bold text-forest">
                  {prediction.soil_context.phosphorus}
                </p>
                <p className="text-muted">Phosphorus</p>
              </div>

              <div>
                <p className="font-bold text-forest">
                  {prediction.soil_context.potassium}
                </p>
                <p className="text-muted">Potassium</p>
              </div>
            </div>

            {prediction.soil_context.soil_risk_factors.length > 0 && (
              <div className="mt-3 border-t border-forest/10 pt-3">
                <p className="text-xs font-bold text-forest">
                  Why soil is adding risk
                </p>

                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted">
                  {prediction.soil_context.soil_risk_factors.map(
                    (factor) => (
                      <li key={factor}>{factor}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            {prediction.soil_context.soil_recommendations.length >
              0 && (
              <div className="mt-3 border-t border-forest/10 pt-3">
                <p className="text-xs font-bold text-forest">
                  Soil-based recommendations
                </p>

                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted">
                  {prediction.soil_context.soil_recommendations.map(
                    (rec) => (
                      <li key={rec}>{rec}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {prediction?.health && (
          <div className="mt-4 rounded-[22px] border border-forest/15 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-forest">
                Crop Health Memory
              </h3>

              <button
                type="button"
                onClick={() => router.push("/health")}
                className="text-xs font-bold text-forest underline"
              >
                View full history
              </button>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-forest/5">
                <span className="text-xl font-bold text-forest">
                  {Math.round(prediction.health.health_score)}
                </span>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Health score for {prediction.health.field_label}
                </p>

                {prediction.health.previous_health_score === null ? (
                  <p className="mt-1 text-sm font-semibold text-forest">
                    First scan recorded — history starts now.
                  </p>
                ) : (
                  <p className="mt-1 text-sm font-semibold">
                    <span
                      className={
                        prediction.health.trend === "improving"
                          ? "text-forest"
                          : prediction.health.trend === "deteriorating"
                          ? "text-danger"
                          : "text-muted"
                      }
                    >
                      {prediction.health.point_change! > 0 ? "+" : ""}
                      {prediction.health.point_change} pts
                      {prediction.health.percent_change !== null &&
                        ` (${prediction.health.percent_change! > 0 ? "+" : ""}${
                          prediction.health.percent_change
                        }%)`}
                    </span>{" "}
                    <span className="text-muted">
                      vs last scan ·{" "}
                      {prediction.health.trend === "improving"
                        ? "Improving"
                        : prediction.health.trend === "deteriorating"
                        ? "Deteriorating"
                        : "Stable"}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              if (!prediction) return;

              const hindiText = getDiseaseHindi(
                prediction.detected_issue
              ).advisory_hi;

              if (!window.speechSynthesis) {
                window.alert(
                  "Voice playback isn't supported in this browser."
                );
                return;
              }

              window.speechSynthesis.cancel();

              const utterance = new SpeechSynthesisUtterance(
                hindiText
              );
              utterance.lang = "hi-IN";

              window.speechSynthesis.speak(utterance);
            }}
            disabled={!prediction}
            className="flex items-center justify-center gap-2 rounded-2xl bg-forest px-3 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
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

        <h3 className="mt-5 text-sm font-bold uppercase tracking-widest text-muted">
          Need more help?
        </h3>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push("/chatbot?fromAnalysis=1")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-forest/15 bg-white px-3 py-4 text-sm font-bold text-forest"
          >
            <MessageCircle size={19} className="text-leaf" />
            Get Help from Bot
          </button>

          <button
            type="button"
            onClick={() => router.push("/policies")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-forest/15 bg-white px-3 py-4 text-sm font-bold text-forest"
          >
            <Landmark size={19} className="text-leaf" />
            Govt. Schemes
          </button>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}