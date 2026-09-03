"use client";

import { useAuth } from "@/lib/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import GuestGateModal from "@/components/GuestGateModal";
import { useLanguage, type Language } from "@/lib/language-context";

const FARMER_ONLY_PREFIXES = [
  "/scan", "/farm", "/alerts", "/profile", "/onboarding", "/health",
  "/chatbot", "/recovery", "/result", "/policies"
];

const ACCESS_TEXT: Record<
  Language,
  {
    checking: string;
    required: string;
    preview: string;
    continue: string;
    farmerFeature: string;
  }
> = {
  en: {
    checking: "Checking access...",
    required: "Farmer profile required",
    preview:
      "You can preview KrishiNayan as a guest, but using farmer features requires a profile.",
    continue: "Continue",
    farmerFeature: "this farmer feature",
  },
  hi: {
    checking: "पहुँच जाँची जा रही है...",
    required: "किसान प्रोफ़ाइल ज़रूरी है",
    preview:
      "आप KrishiNayan को अतिथि के रूप में देख सकते हैं, लेकिन किसान सुविधाओं के लिए प्रोफ़ाइल चाहिए।",
    continue: "जारी रखें",
    farmerFeature: "यह किसान सुविधा",
  },
  pa: {
    checking: "ਪਹੁੰਚ ਜਾਂਚੀ ਜਾ ਰਹੀ ਹੈ...",
    required: "ਕਿਸਾਨ ਪ੍ਰੋਫ਼ਾਈਲ ਲਾਜ਼ਮੀ ਹੈ",
    preview:
      "ਤੁਸੀਂ KrishiNayan ਨੂੰ ਮਹਿਮਾਨ ਵਜੋਂ ਵੇਖ ਸਕਦੇ ਹੋ, ਪਰ ਕਿਸਾਨ ਸੁਵਿਧਾਵਾਂ ਲਈ ਪ੍ਰੋਫ਼ਾਈਲ ਚਾਹੀਦੀ ਹੈ।",
    continue: "ਜਾਰੀ ਰੱਖੋ",
    farmerFeature: "ਇਹ ਕਿਸਾਨ ਸੁਵਿਧਾ",
  },
  mr: {
    checking: "प्रवेश तपासत आहे...",
    required: "शेतकरी प्रोफाइल आवश्यक आहे",
    preview:
      "तुम्ही KrishiNayan अतिथी म्हणून पाहू शकता, पण शेतकरी सुविधा वापरण्यासाठी प्रोफाइल आवश्यक आहे.",
    continue: "पुढे",
    farmerFeature: "ही शेतकरी सुविधा",
  },
};

export default function AccessBoundary({ children }: { children: ReactNode }) {
  const { user, isLoading, isGuest } = useAuth();
  const { language } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const t = ACCESS_TEXT[language];

  const farmerOnly = FARMER_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const officerOnly = pathname === "/officer" || pathname.startsWith("/officer/");

  useEffect(() => {
    if (isLoading) return;
    if (farmerOnly && !user && !isGuest) setModalOpen(true);
    if (farmerOnly && user?.role === "officer") router.replace("/officer");
    if (officerOnly && user?.role === "farmer") router.replace("/");
    if (officerOnly && !user) router.replace("/login?mode=officer");
  }, [farmerOnly, officerOnly, user, isGuest, isLoading, router]);

  if (isLoading && (farmerOnly || officerOnly)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-forest-deep text-white/75">
        <Loader2 size={20} className="mr-2 animate-spin" /> {t.checking}
      </main>
    );
  }

  if (farmerOnly && !user && !isGuest) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-forest-deep px-5">
        <section className="w-full max-w-[390px] rounded-[28px] bg-cream p-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-leaf"><LockKeyhole size={24} /></span>
          <h1 className="mt-4 text-xl font-bold text-forest">{t.required}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{t.preview}</p>
          <button type="button" onClick={() => setModalOpen(true)} className="mt-5 w-full rounded-2xl bg-leaf px-4 py-3 text-sm font-bold text-forest-deep">{t.continue}</button>
        </section>
        <GuestGateModal open={modalOpen} onClose={() => { setModalOpen(false); router.replace("/"); }} feature={t.farmerFeature} />
      </main>
    );
  }

  if ((farmerOnly && user?.role === "officer") || (officerOnly && user?.role !== "officer")) {
    return null;
  }

  return <>{children}</>;
}
