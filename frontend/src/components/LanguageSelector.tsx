"use client";

import { Languages } from "lucide-react";
import { useLanguage, type Language } from "@/lib/language-context";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी" },
  { value: "pa", label: "ਪੰਜਾਬੀ" },
  { value: "mr", label: "मराठी" },
];

const LABEL_TEXT: Record<Language, string> = {
  en: "Select language",
  hi: "भाषा चुनें",
  pa: "ਭਾਸ਼ਾ ਚੁਣੋ",
  mr: "भाषा निवडा",
};

export default function LanguageSelector({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { language, setLanguage } = useLanguage();
  const isLight = variant === "light";

  return (
    <label data-no-translate className="relative inline-flex items-center">
      <Languages size={16} className={`pointer-events-none absolute left-3 ${isLight ? "text-forest/70" : "text-white/80"}`} />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        aria-label={LABEL_TEXT[language]}
        className={`appearance-none rounded-full py-2 pl-9 pr-8 text-sm font-medium outline-none backdrop-blur-sm ${isLight ? "border border-forest/15 bg-white text-forest hover:bg-forest/5" : "border border-white/25 bg-white/10 text-white hover:bg-white/20"}`}
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-white text-forest">
            {option.label}
          </option>
        ))}
      </select>
      <span className={`pointer-events-none absolute right-3 text-xs ${isLight ? "text-forest/60" : "text-white/70"}`}>▾</span>
    </label>
  );
}
