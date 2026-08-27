"use client";

import Link from "next/link";
import { LockKeyhole, X } from "lucide-react";
import { useLanguage, type Language } from "@/lib/language-context";

const MODAL_TEXT: Record<Language, { title: string; before: string; after: string; create: string; existing: string; later: string; close: string }> = {
  en: {
    title: "Create your Farmer Profile",
    before: "Create a farmer profile to use",
    after: "save your activity and receive recommendations based on your crops and farm context.",
    create: "Create Farmer Profile",
    existing: "I already have an account",
    later: "Maybe later",
    close: "Close",
  },
  hi: {
    title: "अपनी किसान प्रोफ़ाइल बनाएँ",
    before: "इस सुविधा का उपयोग करने के लिए किसान प्रोफ़ाइल बनाएँ:",
    after: "अपनी गतिविधि सहेजें और अपनी फसलों व खेत के अनुसार सुझाव प्राप्त करें।",
    create: "किसान प्रोफ़ाइल बनाएँ",
    existing: "मेरा पहले से खाता है",
    later: "बाद में",
    close: "बंद करें",
  },
  pa: {
    title: "ਆਪਣੀ ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ",
    before: "ਇਹ ਸੁਵਿਧਾ ਵਰਤਣ ਲਈ ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ:",
    after: "ਆਪਣੀ ਗਤੀਵਿਧੀ ਸੰਭਾਲੋ ਅਤੇ ਆਪਣੀਆਂ ਫਸਲਾਂ ਤੇ ਖੇਤ ਦੇ ਅਨੁਸਾਰ ਸਿਫਾਰਸ਼ਾਂ ਪ੍ਰਾਪਤ ਕਰੋ।",
    create: "ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ",
    existing: "ਮੇਰਾ ਪਹਿਲਾਂ ਹੀ ਖਾਤਾ ਹੈ",
    later: "ਬਾਅਦ ਵਿੱਚ",
    close: "ਬੰਦ ਕਰੋ",
  },
  mr: {
    title: "तुमचे शेतकरी प्रोफाइल तयार करा",
    before: "ही सुविधा वापरण्यासाठी शेतकरी प्रोफाइल तयार करा:",
    after: "तुमची क्रिया जतन करा आणि तुमच्या पिके व शेतानुसार शिफारसी मिळवा.",
    create: "शेतकरी प्रोफाइल तयार करा",
    existing: "माझ्याकडे आधीच खाते आहे",
    later: "नंतर",
    close: "बंद करा",
  },
};

export default function GuestGateModal({
  open,
  onClose,
  feature = "this feature",
}: {
  open: boolean;
  onClose: () => void;
  feature?: string;
}) {
  const { language } = useLanguage();
  const t = MODAL_TEXT[language];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="guest-gate-title">
      <div className="w-full max-w-[390px] rounded-[28px] bg-cream p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-leaf">
            <LockKeyhole size={22} />
          </span>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-forest/10" aria-label={t.close}>
            <X size={20} />
          </button>
        </div>
        <h2 id="guest-gate-title" className="mt-4 text-xl font-bold text-forest">{t.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {t.before} <strong>{feature}</strong>, {t.after}
        </p>
        <div className="mt-5 grid gap-3">
          <Link href="/register" className="rounded-2xl bg-leaf px-4 py-3 text-center text-sm font-bold text-forest-deep">{t.create}</Link>
          <Link href="/login?mode=farmer" className="rounded-2xl border border-forest/15 bg-white px-4 py-3 text-center text-sm font-bold text-forest">{t.existing}</Link>
          <button type="button" onClick={onClose} className="py-2 text-sm font-semibold text-muted">{t.later}</button>
        </div>
      </div>
    </div>
  );
}
