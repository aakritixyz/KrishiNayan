"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ActivitySquare,
  Camera,
  CloudOff,
  CloudSun,
  Headphones,
  Landmark,
  Leaf,
  LockKeyhole,
  LogIn,
  MapPinned,
  UserRound,
} from "lucide-react";

import BottomNav from "@/components/BottomNav";
import LanguageSelector from "@/components/LanguageSelector";
import GuestGateModal from "@/components/GuestGateModal";
import { useAuth } from "@/lib/auth-context";
import { apiJson } from "@/lib/api";
import { useLanguage, type Language } from "@/lib/language-context";
import {
  fetchBrowserOpenMeteoWeather,
  shouldUseBrowserWeatherFallback,
} from "@/lib/live-weather";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const HOME_TEXT: Record<
  Language,
  {
    offlineReady: string;
    login: string;
    guestPreview: string;
    guestMode: string;
    finishProfile: string;
    copilot: string;
    subtitle: string;
    pune: string;
    locating: string;
    weatherUnavailable: string;
    scanCrop: string;
    myFarm: string;
    viewPlots: string;
    askExpert: string;
    expertSupport: string;
    cropHealth: string;
    cropHealthDesc: string;
    govtSchemes: string;
    govtSchemesDesc: string;
  }
> = {
  en: {
    offlineReady: "Offline Ready",
    login: "Log in",
    guestPreview: "Guest preview · features are locked",
    guestMode: "Guest mode · browse freely, actions are read-only",
    finishProfile: "Finish setting up your farm profile →",
    copilot: "AI Farming Copilot",
    subtitle: "From crop photo to clear action",
    pune: "Pune",
    locating: "Locating...",
    weatherUnavailable: "Weather unavailable",
    scanCrop: "Scan Crop",
    myFarm: "My Farm",
    viewPlots: "View your plots",
    askExpert: "Ask Expert",
    expertSupport: "AI chat + KVK support",
    cropHealth: "Crop Health Memory",
    cropHealthDesc: "Track health scores and trends over time",
    govtSchemes: "Government Schemes",
    govtSchemesDesc: "Check what you're eligible for",
  },
  hi: {
    offlineReady: "ऑफ़लाइन उपलब्ध",
    login: "लॉग इन",
    guestPreview: "अतिथि पूर्वावलोकन · सुविधाएँ लॉक हैं",
    guestMode: "अतिथि मोड · स्वतंत्र रूप से देखें, कार्रवाइयाँ केवल पढ़ने के लिए हैं",
    finishProfile: "अपनी खेत प्रोफ़ाइल पूरी करें →",
    copilot: "एआई खेती सहायक",
    subtitle: "फसल की फोटो से स्पष्ट समाधान तक",
    pune: "पुणे",
    locating: "स्थान खोजा जा रहा है...",
    weatherUnavailable: "मौसम उपलब्ध नहीं",
    scanCrop: "फसल स्कैन करें",
    myFarm: "मेरा खेत",
    viewPlots: "अपने खेत देखें",
    askExpert: "विशेषज्ञ से पूछें",
    expertSupport: "एआई चैट + केवीके सहायता",
    cropHealth: "फसल स्वास्थ्य रिकॉर्ड",
    cropHealthDesc: "समय के साथ स्वास्थ्य स्कोर और रुझान देखें",
    govtSchemes: "सरकारी योजनाएँ",
    govtSchemesDesc: "देखें कि आप किन योजनाओं के लिए पात्र हैं",
  },
  pa: {
    offlineReady: "ਆਫ਼ਲਾਈਨ ਤਿਆਰ",
    login: "ਲੌਗ ਇਨ",
    guestPreview: "ਮਹਿਮਾਨ ਝਲਕ · ਸੁਵਿਧਾਵਾਂ ਲੌਕ ਹਨ",
    guestMode: "ਮਹਿਮਾਨ ਮੋਡ · ਆਜ਼ਾਦੀ ਨਾਲ ਵੇਖੋ, ਕਾਰਵਾਈਆਂ ਸਿਰਫ਼ ਪੜ੍ਹਨ ਲਈ ਹਨ",
    finishProfile: "ਆਪਣੀ ਖੇਤ ਪ੍ਰੋਫ਼ਾਈਲ ਪੂਰੀ ਕਰੋ →",
    copilot: "ਏਆਈ ਖੇਤੀ ਸਹਾਇਕ",
    subtitle: "ਫਸਲ ਦੀ ਤਸਵੀਰ ਤੋਂ ਸਪਸ਼ਟ ਕਾਰਵਾਈ ਤੱਕ",
    pune: "ਪੁਣੇ",
    locating: "ਟਿਕਾਣਾ ਲੱਭਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
    weatherUnavailable: "ਮੌਸਮ ਉਪਲਬਧ ਨਹੀਂ",
    scanCrop: "ਫਸਲ ਸਕੈਨ ਕਰੋ",
    myFarm: "ਮੇਰਾ ਖੇਤ",
    viewPlots: "ਆਪਣੇ ਖੇਤ ਵੇਖੋ",
    askExpert: "ਮਾਹਿਰ ਨੂੰ ਪੁੱਛੋ",
    expertSupport: "ਏਆਈ ਚੈਟ + ਕੇਵੀਕੇ ਸਹਾਇਤਾ",
    cropHealth: "ਫਸਲ ਸਿਹਤ ਰਿਕਾਰਡ",
    cropHealthDesc: "ਸਮੇਂ ਨਾਲ ਸਿਹਤ ਸਕੋਰ ਅਤੇ ਰੁਝਾਨ ਵੇਖੋ",
    govtSchemes: "ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ",
    govtSchemesDesc: "ਵੇਖੋ ਤੁਸੀਂ ਕਿਹੜੀਆਂ ਯੋਜਨਾਵਾਂ ਲਈ ਯੋਗ ਹੋ",
  },
  mr: {
    offlineReady: "ऑफलाइन उपलब्ध",
    login: "लॉग इन",
    guestPreview: "अतिथी पूर्वदृश्य · सुविधा लॉक आहेत",
    guestMode: "अतिथी मोड · मोकळेपणाने पाहा, कृती फक्त वाचनासाठी आहेत",
    finishProfile: "तुमची शेत प्रोफाइल पूर्ण करा →",
    copilot: "एआय शेती सहाय्यक",
    subtitle: "पिकाच्या फोटोमधून स्पष्ट कृतीपर्यंत",
    pune: "पुणे",
    locating: "स्थान शोधत आहे...",
    weatherUnavailable: "हवामान उपलब्ध नाही",
    scanCrop: "पीक स्कॅन करा",
    myFarm: "माझे शेत",
    viewPlots: "तुमचे प्लॉट पहा",
    askExpert: "तज्ज्ञांना विचारा",
    expertSupport: "एआय चॅट + केव्हीके सहाय्य",
    cropHealth: "पीक आरोग्य नोंद",
    cropHealthDesc: "काळानुसार आरोग्य गुण आणि कल पहा",
    govtSchemes: "सरकारी योजना",
    govtSchemesDesc: "तुम्ही कोणत्या योजनांसाठी पात्र आहात ते पहा",
  },
};

const LOCATION_TRANSLATIONS: Record<
  string,
  Record<Language, string>
> = {
  pune: { en: "Pune", hi: "पुणे", pa: "ਪੁਣੇ", mr: "पुणे" },
  wagholi: { en: "Wagholi", hi: "वाघोली", pa: "ਵਾਘੋਲੀ", mr: "वाघोली" },
  mumbai: { en: "Mumbai", hi: "मुंबई", pa: "ਮੁੰਬਈ", mr: "मुंबई" },
  nagpur: { en: "Nagpur", hi: "नागपुर", pa: "ਨਾਗਪੁਰ", mr: "नागपूर" },
  nashik: { en: "Nashik", hi: "नासिक", pa: "ਨਾਸਿਕ", mr: "नाशिक" },
  kolhapur: { en: "Kolhapur", hi: "कोल्हापुर", pa: "ਕੋਲਹਾਪੁਰ", mr: "कोल्हापूर" },
  delhi: { en: "Delhi", hi: "दिल्ली", pa: "ਦਿੱਲੀ", mr: "दिल्ली" },
  "new delhi": { en: "New Delhi", hi: "नई दिल्ली", pa: "ਨਵੀਂ ਦਿੱਲੀ", mr: "नवी दिल्ली" },
  maharashtra: { en: "Maharashtra", hi: "महाराष्ट्र", pa: "ਮਹਾਰਾਸ਼ਟਰ", mr: "महाराष्ट्र" },
  bihar: { en: "Bihar", hi: "बिहार", pa: "ਬਿਹਾਰ", mr: "बिहार" },
  punjab: { en: "Punjab", hi: "पंजाब", pa: "ਪੰਜਾਬ", mr: "पंजाब" },
  haryana: { en: "Haryana", hi: "हरियाणा", pa: "ਹਰਿਆਣਾ", mr: "हरियाणा" },
  telangana: { en: "Telangana", hi: "तेलंगाना", pa: "ਤੇਲੰਗਾਨਾ", mr: "तेलंगणा" },
  "uttar pradesh": { en: "Uttar Pradesh", hi: "उत्तर प्रदेश", pa: "ਉੱਤਰ ਪ੍ਰਦੇਸ਼", mr: "उत्तर प्रदेश" },
};

function localizeLocationName(
  locationName: string | null | undefined,
  language: Language
) {
  if (!locationName) return null;

  const clean = locationName.trim();
  const exact = LOCATION_TRANSLATIONS[clean.toLowerCase()];
  if (exact) return exact[language];

  // Handle responses such as "Wagholi, Pune" or "Pune, Maharashtra".
  const parts = clean.split(",").map((part) => part.trim()).filter(Boolean);

  return parts
    .map((part) => {
      const translated = LOCATION_TRANSLATIONS[part.toLowerCase()];
      return translated ? translated[language] : part;
    })
    .join(", ");
}

type HomeWeather = {
  latitude: number;
  longitude: number;
  temperature: number | null;
  humidity: number | null;
  wind_speed: number | null;
  rain: number | null;
  rain_expected: boolean;
  weather_code?: number | null;
  location_name?: string | null;
  source: string;
};

export default function Home() {
  const { user, isLoading, isGuest } = useAuth();
  const { language } = useLanguage();
  const t = HOME_TEXT[language];

  const router = useRouter();
  const [guestFeature, setGuestFeature] = useState<string | null>(null);
  const [weather, setWeather] = useState<HomeWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setWeatherLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const data = await apiJson<HomeWeather>(
            `/weather?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&language=${language}`
          );

          if (shouldUseBrowserWeatherFallback(data)) {
            try {
              const liveWeather = await fetchBrowserOpenMeteoWeather(
                latitude,
                longitude
              );

              setWeather({
                ...data,
                ...liveWeather,
                latitude,
                longitude,
                location_name: data.location_name,
              });
              return;
            } catch {
              // Keep the backend response if the browser-side provider call
              // is also unavailable.
            }
          }

          setWeather(data);
        } catch {
          setWeather(null);
        } finally {
          setWeatherLoading(false);
        }
      },
      () => {
        setWeather(null);
        setWeatherLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, [language]);

  useEffect(() => {
    if (!isLoading && user?.role === "officer") router.replace("/officer");
  }, [user, isLoading, router]);

  if (user?.role === "officer") return null;

  function gated(path: string, feature: string) {
    if (user || isGuest) router.push(path);
    else setGuestFeature(feature);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-forest-deep sm:min-h-[844px] sm:rounded-[32px]">
        <Image src="/images/tomato-field.png" alt="Tomato field during sunrise" fill priority sizes="(max-width: 640px) 100vw, 430px" className="object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-forest-deep/55" />

        <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 pb-28 pt-8 text-center sm:min-h-[844px]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-leaf backdrop-blur-sm">
            <Leaf size={34} strokeWidth={2.2} />
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
            <LanguageSelector variant="dark" />
            <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <CloudOff size={16} />
              <span>{t.offlineReady}</span>
            </div>

            {!isLoading && (user ? (
              <button type="button" onClick={() => gated("/profile", "your profile")} className="flex items-center gap-2 rounded-full border border-leaf/50 bg-leaf/15 px-4 py-2 text-sm font-medium text-white">
                <UserRound size={16} className="text-leaf" />
                <span>{user.full_name.split(" ")[0]}</span>
              </button>
            ) : (
              <Link href="/login" className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <LogIn size={16} />
                <span>{t.login}</span>
              </Link>
            ))}
          </div>

          {isGuest && !isLoading && (
            <div className="mb-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm">
              <LockKeyhole size={14} className="text-leaf" />
              {t.guestMode}
            </div>
          )}

          {user && !user.profile_completed && (
            <Link href="/onboarding" className="mb-4 flex items-center gap-2 rounded-full bg-leaf px-4 py-2 text-xs font-bold text-forest-deep shadow-lg">
              {t.finishProfile}
            </Link>
          )}

          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">{t.copilot}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">KrishiNayan</h1>
          <p className="mt-3 max-w-xs text-base leading-7 text-white/75">{t.subtitle}</p>

          <div className="mt-6 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-semibold text-forest-deep shadow-lg">
            <CloudSun size={20} className="text-warning" />
            <span>
              {weatherLoading
                ? t.locating
                : weather?.temperature !== null && weather?.temperature !== undefined
                ? `${Math.round(weather.temperature)}°C · ${localizeLocationName(weather.location_name, language) || t.weatherUnavailable}`
                : t.weatherUnavailable}
            </span>
          </div>

          <FeatureButton onClick={() => gated("/scan", "crop scanning and saved diagnoses")} className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-leaf px-6 py-4 text-lg font-bold text-forest-deep shadow-lg">
            <Camera size={24} strokeWidth={2.2} />
            <span>{t.scanCrop}</span>
            {!user && !isGuest && <LockKeyhole size={17} />}
          </FeatureButton>

          <div className="mt-3 grid w-full grid-cols-2 gap-3">
            <FeatureButton onClick={() => gated("/farm", "My Farm")} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm">
              <MapPinned size={24} className="shrink-0 text-leaf" />
              <span>
                <span className="block font-semibold">{t.myFarm}</span>
                <span className="mt-1 block text-xs text-white/65">{t.viewPlots}</span>
              </span>
              {!user && !isGuest && <LockKeyhole size={14} className="ml-auto" />}
            </FeatureButton>

            <FeatureButton onClick={() => gated("/chatbot", "AI expert support")} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm">
              <Headphones size={24} className="shrink-0 text-leaf" />
              <span>
                <span className="block font-semibold">{t.askExpert}</span>
                <span className="mt-1 block text-xs text-white/65">{t.expertSupport}</span>
              </span>
              {!user && !isGuest && <LockKeyhole size={14} className="ml-auto" />}
            </FeatureButton>
          </div>

          <FeatureButton onClick={() => gated("/health", "Crop Health Memory")} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf/20 text-leaf">
              <ActivitySquare size={22} />
            </span>
            <span>
              <span className="block font-semibold">{t.cropHealth}</span>
              <span className="mt-1 block text-xs text-white/65">{t.cropHealthDesc}</span>
            </span>
            {!user && !isGuest && <LockKeyhole size={14} className="ml-auto" />}
          </FeatureButton>

          <FeatureButton onClick={() => gated("/policies", "personalised government scheme eligibility")} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf/20 text-leaf">
              <Landmark size={22} />
            </span>
            <span>
              <span className="block font-semibold">{t.govtSchemes}</span>
              <span className="mt-1 block text-xs text-white/65">{t.govtSchemesDesc}</span>
            </span>
            {!user && !isGuest && <LockKeyhole size={14} className="ml-auto" />}
          </FeatureButton>
        </div>

        <BottomNav />
      </section>

      <GuestGateModal
        open={Boolean(guestFeature)}
        onClose={() => setGuestFeature(null)}
        feature={guestFeature || undefined}
      />
    </main>
  );
}

function FeatureButton({
  onClick,
  className,
  children,
}: {
  onClick: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} transition-all duration-200 hover:-translate-y-0.5 hover:border-leaf/60 hover:shadow-lg active:scale-[0.98]`}
    >
      {children}
    </button>
  );
}
