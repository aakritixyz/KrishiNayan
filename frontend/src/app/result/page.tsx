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
  VolumeX,
  ShieldCheck,
  Sprout,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import {
  tx,
  translateCrop,
  translateDisease,
  translatePlace,
  translateRecommendedAction,
  translateSoilText,
  translateValue,
  translateWeatherRisk,
} from "@/lib/analysis-translations";

type PredictionResult = {
  crop: string;
  detected_issue: string;
  confidence: number;
  prediction_status: string;
  severity: string;
  weather_risk: string;
  recommended_action: string;
  cost_estimate: {
    min: number;
    max: number;
    unit: string;
    note: string;
  } | null;
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
  recovery: {
    id: number;
    progress_percent: number;
  } | null;
};

export default function ResultPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [scanImage, setScanImage] = useState("/images/tomato-field.png");
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedImage = sessionStorage.getItem("krishiNayanScanImage");
      const savedPrediction = sessionStorage.getItem("krishiNayanPrediction");

      if (savedImage) setScanImage(savedImage);

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

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const disease = prediction
    ? translateDisease(prediction.detected_issue, language)
    : tx("No prediction", language);

  const severity = prediction
    ? translateValue(prediction.severity, language)
    : "";

  const trendLabel = prediction?.health
    ? prediction.health.trend === "improving"
      ? tx("Improving", language)
      : prediction.health.trend === "deteriorating"
      ? tx("Deteriorating", language)
      : tx("Stable", language)
    : "";

  function speakAdvice() {
    if (!prediction || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = translateRecommendedAction(
      prediction.recommended_action,
      prediction.detected_issue,
      language
    );

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      language === "hi"
        ? "hi-IN"
        : language === "pa"
        ? "pa-IN"
        : language === "mr"
        ? "mr-IN"
        : "en-IN";
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <main className="app-main flex min-h-screen items-center justify-center bg-forest-deep sm:p-6 lg:items-start lg:justify-center">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden app-frame bg-cream px-5 pb-32 pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"
            aria-label={tx("Go back", language)}
          >
            <ArrowLeft size={21} />
          </button>

          <h1 className="text-lg font-bold text-forest">
            {tx("Analysis Result", language)}
          </h1>

          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest">
            <ShieldCheck size={21} />
          </span>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="flex items-center gap-5 rounded-[26px] border border-forest/10 bg-white p-4">
          <div
            className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "conic-gradient(#84bd00 0deg 313deg, #e5eadf 313deg 360deg)",
            }}
          >
            <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-cream">
              <strong className="text-2xl text-forest">
                {prediction ? `${Number(prediction.confidence).toFixed(1)}%` : "--"}
              </strong>
              <span className="text-[11px] text-muted">
                {tx("Confidence", language)}
              </span>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-warning px-3 py-2 text-xs font-bold text-forest-deep">
              <AlertTriangle size={15} />
              {prediction
                ? `${severity} ${tx("Risk", language)}`
                : tx("Risk unavailable", language)}
            </span>

            <h2 className="mt-3 text-2xl font-bold text-forest">{disease}</h2>

              <p className="mt-1 text-sm font-semibold text-muted">
              {tx("Prediction status", language)}:{" "}
              {prediction
                ? translateValue(prediction.prediction_status, language)
                : "--"}
            </p>

            {prediction && (
              <p className={`mt-2 rounded-2xl px-3 py-2 text-xs font-semibold leading-5 ${
                prediction.prediction_status === "uncertain"
                  ? "bg-warning/25 text-forest"
                  : "bg-leaf/25 text-forest"
              }`}>
                {prediction.prediction_status === "uncertain"
                  ? "Below the 70% confidence threshold, so KrishiNayan asks for review instead of guessing."
                  : "Above the 70% confidence threshold. Low-confidence scans are marked uncertain."}
              </p>
            )}
          </div>
        </div>

        <div className="relative h-[260px] overflow-hidden rounded-[26px] bg-forest/10 lg:h-[330px]">
          <Image
            src={scanImage}
            alt="Analysed leaf"
            fill
            unoptimized
            className="object-cover"
          />

          <span className="absolute left-[40%] top-[32%] h-12 w-12 rounded-full border-2 border-warning bg-warning/30 shadow-[0_0_0_9px_rgba(245,168,0,0.2)]" />
          <span className="absolute right-[20%] top-[48%] h-9 w-9 rounded-full border-2 border-danger bg-danger/30 shadow-[0_0_0_8px_rgba(216,58,50,0.18)]" />

          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-forest-deep/85 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
            {tx("Model finding generated from uploaded leaf image", language)}
          </div>
        </div>
        </div>

        {prediction?.gradcam_image && (
          <div className="mt-4 rounded-[22px] border border-forest/15 bg-white p-4">
            <h3 className="font-bold text-forest">
              {tx("Why this result was flagged", language)}
            </h3>

            <p className="mt-1 text-sm leading-5 text-muted">
              {tx(
                "The highlighted region shows which part of the leaf most influenced this diagnosis.",
                language
              )}
            </p>

            <div className="relative mt-3 h-[220px] overflow-hidden rounded-[18px] bg-forest/10">
              <Image
                src={prediction.gradcam_image}
                alt="Grad-CAM heatmap"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="flex items-center gap-4 rounded-[22px] bg-warning p-4 text-forest-deep">
          <CloudRain size={34} className="shrink-0" />
          <div>
            <p className="font-bold">
              {prediction
                ? translateWeatherRisk(prediction.weather_risk, language)
                : tx("Weather unavailable", language)}
            </p>
            <p className="mt-1 text-sm">
              {tx("Humidity", language)} • {prediction?.weather.humidity ?? "--"}%
            </p>
            <p className="text-sm">
              {tx("Temperature", language)} •{" "}
              {prediction?.weather.temperature ?? "--"}°C
            </p>
          </div>
        </div>

        <div className="rounded-[22px] border border-forest/15 bg-white p-4">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-leaf">
              <ShieldCheck size={23} />
            </span>

            <div>
              <h3 className="font-bold text-forest">
                {tx("Recommended action", language)}
              </h3>

              <p className="mt-1 text-sm leading-5 text-muted">
                {prediction
                  ? translateRecommendedAction(
                      prediction.recommended_action,
                      prediction.detected_issue,
                      language
                    )
                  : tx("Complete a scan to receive treatment advice.", language)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-forest/10 pt-4">
            <CalendarClock size={20} className="text-forest" />
            <div>
              <p className="text-xs text-muted">{tx("Weather source", language)}</p>
              <p className="font-bold text-forest">
                {prediction?.weather.source ?? "--"}
              </p>
            </div>
          </div>
        </div>
        </div>

        {prediction?.cost_estimate && (
          <div className="mt-4 rounded-[22px] border border-forest/15 bg-white p-4">
            <h3 className="font-bold text-forest">Estimated treatment cost</h3>
            <p className="mt-1 text-2xl font-bold text-forest">
              ₹{prediction.cost_estimate.min} - ₹{prediction.cost_estimate.max}
            </p>
            <p className="mt-1 text-xs text-muted">
              {prediction.cost_estimate.note}
            </p>
          </div>
        )}

        {prediction?.soil_context && (
          <div className="mt-4 rounded-[22px] border border-forest/15 bg-white p-4">
            <div className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-leaf">
                <Sprout size={23} />
              </span>

              <div>
                <h3 className="font-bold text-forest">
                  {tx("Soil context", language)} —{" "}
                  {translatePlace(prediction.soil_context.district, language)},{" "}
                  {translatePlace(prediction.soil_context.state, language)}
                </h3>

                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                    prediction.soil_context.soil_risk_level === "High"
                      ? "bg-danger/15 text-danger"
                      : prediction.soil_context.soil_risk_level === "Medium"
                      ? "bg-warning/40 text-forest-deep"
                      : "bg-leaf/30 text-forest"
                  }`}
                >
                  {translateValue(
                    prediction.soil_context.soil_risk_level,
                    language
                  )}{" "}
                  {tx("soil risk", language)}
                </span>

                <p className="mt-2 text-sm leading-5 text-muted">
                  {translateSoilText(prediction.soil_context.summary, language)}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-forest/10 pt-3 text-center text-xs">
              <div>
                <p className="font-bold text-forest">
                  {translateValue(prediction.soil_context.soil_type, language)}
                </p>
                <p className="text-muted">{tx("Soil type", language)}</p>
              </div>

              <div>
                <p className="font-bold text-forest">{prediction.soil_context.ph}</p>
                <p className="text-muted">pH</p>
              </div>

              <div>
                <p className="font-bold text-forest">
                  {translateValue(
                    prediction.soil_context.moisture_retention,
                    language
                  )}
                </p>
                <p className="text-muted">{tx("Moisture", language)}</p>
              </div>

              <div>
                <p className="font-bold text-forest">
                  {translateValue(prediction.soil_context.nitrogen, language)}
                </p>
                <p className="text-muted">{tx("Nitrogen", language)}</p>
              </div>

              <div>
                <p className="font-bold text-forest">
                  {translateValue(prediction.soil_context.phosphorus, language)}
                </p>
                <p className="text-muted">{tx("Phosphorus", language)}</p>
              </div>

              <div>
                <p className="font-bold text-forest">
                  {translateValue(prediction.soil_context.potassium, language)}
                </p>
                <p className="text-muted">{tx("Potassium", language)}</p>
              </div>
            </div>

            {prediction.soil_context.soil_risk_factors.length > 0 && (
              <div className="mt-3 border-t border-forest/10 pt-3">
                <p className="text-xs font-bold text-forest">
                  {tx("Why soil is adding risk", language)}
                </p>

                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted">
                  {prediction.soil_context.soil_risk_factors.map((factor) => (
                    <li key={factor}>{translateSoilText(factor, language)}</li>
                  ))}
                </ul>
              </div>
            )}

            {prediction.soil_context.soil_recommendations.length > 0 && (
              <div className="mt-3 border-t border-forest/10 pt-3">
                <p className="text-xs font-bold text-forest">
                  {tx("Soil-based recommendations", language)}
                </p>

                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted">
                  {prediction.soil_context.soil_recommendations.map((rec) => (
                    <li key={rec}>{translateSoilText(rec, language)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {prediction?.health && (
          <div className="mt-4 rounded-[22px] border border-forest/15 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-forest">
                {tx("Crop Health Memory", language)}
              </h3>

              <button
                type="button"
                onClick={() => router.push("/health")}
                className="text-xs font-bold text-forest underline"
              >
                {tx("View full history", language)}
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
                  {tx("Health score for", language)}{" "}
                  {translateCrop(prediction.health.field_label, language)}
                </p>

                {prediction.health.previous_health_score === null ? (
                  <p className="mt-1 text-sm font-semibold text-forest">
                    {tx("First scan recorded — history starts now.", language)}
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
                      {prediction.health.point_change} {tx("points", language)}
                      {prediction.health.percent_change !== null &&
                        ` (${
                          prediction.health.percent_change! > 0 ? "+" : ""
                        }${prediction.health.percent_change}%)`}
                    </span>{" "}
                    <span className="text-muted">
                      {tx("vs last scan", language)} · {trendLabel}
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
            onClick={speakAdvice}
            disabled={!prediction}
            className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              isSpeaking ? "bg-danger" : "bg-forest"
            }`}
          >
            {isSpeaking ? <VolumeX size={19} /> : <Headphones size={19} />}
            {isSpeaking ? "Stop Listening" : tx("Listen", language)}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                prediction?.recovery?.id
                  ? `/recovery?planId=${prediction.recovery.id}`
                  : "/recovery"
              )
            }
            className="flex items-center justify-center gap-2 rounded-2xl bg-leaf px-3 py-4 text-sm font-bold text-forest-deep"
          >
            <UserRound size={19} />
            {tx("Recovery Plan", language)}
          </button>
        </div>

        <h3 className="mt-5 text-sm font-bold uppercase tracking-widest text-muted">
          {tx("Need more help?", language)}
        </h3>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push("/chatbot?fromAnalysis=1")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-forest/15 bg-white px-3 py-4 text-sm font-bold text-forest"
          >
            <MessageCircle size={19} className="text-leaf" />
            {tx("Get Help from Bot", language)}
          </button>

          <button
            type="button"
            onClick={() => router.push("/policies")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-forest/15 bg-white px-3 py-4 text-sm font-bold text-forest"
          >
            <Landmark size={19} className="text-leaf" />
            {tx("Govt. Schemes", language)}
          </button>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
