"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage, type Language } from "@/lib/language-context";

const OFFLINE_TEXT: Record<Language, { title: string; body: string }> = {
  en: {
    title: "Offline mode",
    body: "Saved pages and recent farm data are available. New scans need network.",
  },
  hi: {
    title: "ऑफ़लाइन मोड",
    body: "सहेजे गए पेज और हाल का खेत डेटा उपलब्ध है। नए स्कैन के लिए नेटवर्क चाहिए।",
  },
  pa: {
    title: "ਆਫ਼ਲਾਈਨ ਮੋਡ",
    body: "ਸੇਵ ਕੀਤੇ ਪੇਜ ਅਤੇ ਹਾਲੀਆ ਖੇਤ ਡਾਟਾ ਉਪਲਬਧ ਹੈ। ਨਵੇਂ ਸਕੈਨ ਲਈ ਨੈੱਟਵਰਕ ਚਾਹੀਦਾ ਹੈ।",
  },
  mr: {
    title: "ऑफलाइन मोड",
    body: "जतन केलेली पाने आणि अलीकडील शेत डेटा उपलब्ध आहे. नवीन स्कॅनसाठी नेटवर्क आवश्यक आहे.",
  },
};

export default function OfflineStatus() {
  const { language } = useLanguage();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);

    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  const t = OFFLINE_TEXT[language];

  return (
    <div className="fixed inset-x-4 top-4 z-[120] mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-leaf/30 bg-forest-deep/95 p-4 text-white shadow-2xl backdrop-blur lg:left-auto lg:right-6 lg:top-6 lg:mx-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf text-forest-deep">
        <WifiOff size={20} />
      </span>
      <span>
        <span className="block text-sm font-bold">{t.title}</span>
        <span className="mt-1 block text-xs leading-5 text-white/70">
          {t.body}
        </span>
      </span>
    </div>
  );
}
