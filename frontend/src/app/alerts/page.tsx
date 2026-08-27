"use client";

import BottomNav from "@/components/BottomNav";
import { apiJson } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { tr } from "@/lib/static-translate";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Filter, Loader2, MapPin, Megaphone, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

type Advisory = { id: number; title: string; message: string; crop: string | null; district: string | null; state: string; created_at: string };

export default function AlertsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson<{ advisories: Advisory[] }>("/advisories/nearby")
      .then((data) => setAdvisories(data.advisories))
      .catch(() => setAdvisories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-forest-deep sm:flex sm:items-center sm:justify-center sm:p-6">
      <section className="relative min-h-screen w-full overflow-hidden bg-cream px-4 pb-32 pt-5 sm:max-w-[430px] sm:px-5 sm:pt-6 sm:min-h-[844px] sm:rounded-[36px]">
        <header className="flex items-center justify-between">
          <button type="button" onClick={() => router.back()} aria-label={tr("Go back", language)} className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"><ArrowLeft size={21} /></button>
          <h1 className="text-lg font-bold text-forest">{tr("Nearby Crop Alerts", language)}</h1>
          <button type="button" aria-label={tr("Filter alerts", language)} className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/10 bg-white text-forest"><Filter size={20} /></button>
        </header>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-6">
          <Stat value="12" label={tr("Cases", language)} hint={tr("Last 7 days", language)} tone="text-danger" />
          <Stat value="3" label={tr("Villages", language)} hint={tr("Affected", language)} tone="text-warning" />
          <Stat value={tr("High", language)} label={tr("Risk", language)} hint={tr("Current level", language)} tone="text-danger" />
        </div>

        {loading ? (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-[22px] bg-white p-4 text-sm text-muted"><Loader2 size={17} className="animate-spin" /> {tr("Loading official advisories...", language)}</div>
        ) : advisories.length > 0 ? (
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2"><Megaphone size={18} className="text-forest" /><h2 className="font-bold text-forest">{tr("Official advisories", language)}</h2></div>
            {advisories.slice(0, 3).map((item) => (
              <article key={item.id} className="rounded-[22px] border border-forest/10 bg-white p-4">
                <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf/25 text-forest"><Megaphone size={19} /></span><div><h3 className="font-bold text-forest">{tr(item.title, language)}</h3><p className="mt-1 text-sm leading-5 text-muted">{tr(item.message, language)}</p><p className="mt-2 text-[11px] font-semibold text-forest/60">{tr(item.district || item.state, language)}{item.crop ? ` · ${tr(item.crop, language)}` : ""} · {new Date(item.created_at).toLocaleDateString(language === "hi" ? "hi-IN" : language === "pa" ? "pa-IN" : language === "mr" ? "mr-IN" : "en-IN")}</p></div></div>
              </article>
            ))}
          </div>
        ) : null}

        <div className="relative mt-5 h-[260px] overflow-hidden rounded-[26px] border border-forest/10 bg-[#e9efdc]">
          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(35deg,transparent_45%,#cad7bd_46%,#cad7bd_48%,transparent_49%),linear-gradient(125deg,transparent_45%,#cad7bd_46%,#cad7bd_48%,transparent_49%)] [background-size:80px_80px]" />
          <span className="absolute left-7 top-8 text-xs font-semibold text-forest">{tr("Kondhwa", language)}</span><span className="absolute right-9 top-10 text-xs font-semibold text-forest">{tr("Pisoli", language)}</span><span className="absolute bottom-12 left-8 text-xs font-semibold text-forest">{tr("Holkarwadi", language)}</span>
          <span className="absolute left-[46%] top-[42%] h-5 w-5 rounded-full bg-danger shadow-[0_0_0_9px_rgba(216,58,50,0.25),0_0_0_18px_rgba(216,58,50,0.12)]" /><span className="absolute right-14 top-24 h-4 w-4 rounded-full bg-warning shadow-[0_0_0_7px_rgba(245,168,0,0.18)]" /><span className="absolute bottom-14 right-20 h-4 w-4 rounded-full bg-danger shadow-[0_0_0_7px_rgba(216,58,50,0.18)]" /><span className="absolute bottom-12 left-24 h-4 w-4 rounded-full bg-[#6f9c13]" />
          <div className="absolute bottom-3 right-3 flex gap-3 rounded-full bg-white/90 px-3 py-2 text-[9px] text-forest"><span>🟢 {tr("Low", language)}</span><span>🟠 {tr("Moderate", language)}</span><span>🔴 {tr("High", language)}</span></div>
        </div>

        <div className="mt-5 rounded-[24px] border border-forest/10 bg-white p-4">
          <div className="flex items-center justify-between"><div><p className="font-bold text-forest">{tr("Cases in your area", language)}</p><p className="text-xs text-muted">{tr("Last 7 days", language)}</p></div><TrendingUp size={21} className="text-danger" /></div>
          <div className="mt-5 flex h-28 items-end gap-3 border-b border-forest/10">{[25,42,34,58,53,70,92].map((height,index) => <div key={index} className="relative flex-1 rounded-t-md bg-danger/20" style={{height:`${height}%`}}><span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger" /></div>)}</div>
          <div className="mt-2 flex justify-between text-[9px] text-muted"><span>{tr("25 May", language)}</span><span>{tr("27 May", language)}</span><span>{tr("29 May", language)}</span><span>{tr("31 May", language)}</span></div>
        </div>

        <div className="mt-5 flex gap-3 rounded-[24px] border border-danger/20 bg-white p-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-danger text-white"><AlertTriangle size={23} /></span><div><h2 className="font-bold text-forest">{tr("Early Blight cases increasing", language)}</h2><p className="mt-1 text-sm leading-5 text-muted">{tr("Conditions currently favour disease spread near your farm.", language)}</p><button type="button" onClick={() => router.push("/farm")} className="mt-3 flex items-center gap-2 text-sm font-bold text-danger"><MapPin size={17} /> {tr("Check my farm", language)}</button></div></div>
        <BottomNav />
      </section>
    </main>
  );
}

function Stat({value,label,hint,tone}:{value:string;label:string;hint:string;tone:string}) { return <div className="min-w-0 rounded-[18px] border border-forest/10 bg-white p-2.5 sm:rounded-[20px] sm:p-3"><p className={`text-xl font-bold ${tone}`}>{value}</p><p className="mt-1 text-xs font-semibold text-forest">{label}</p><p className="text-[10px] text-muted">{hint}</p></div>; }
