"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Camera,
  HeartPulse,
  Home,
  Landmark,
  Map,
  MessageCircle,
  UserRound,
} from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { useAuth } from "@/lib/auth-context";
import { useLanguage, type Language } from "@/lib/language-context";

const SIDEBAR_TEXT: Record<
  Language,
  Record<
    | "tagline"
    | "home"
    | "scanCrop"
    | "myFarm"
    | "outbreaks"
    | "recovery"
    | "askExpert"
    | "schemes"
    | "profile"
    | "signedInAs"
    | "browsingAs"
    | "guestFarmer"
    | "visitor"
    | "accountNote"
    | "signOut"
    | "desktopNavigation",
    string
  >
> = {
  en: {
    tagline: "Farmer-first crop care",
    home: "Home",
    scanCrop: "Scan crop",
    myFarm: "My farm",
    outbreaks: "Outbreaks",
    recovery: "Recovery",
    askExpert: "Ask expert",
    schemes: "Schemes",
    profile: "Profile",
    signedInAs: "Signed in as",
    browsingAs: "Browsing as",
    guestFarmer: "Guest farmer",
    visitor: "Visitor",
    accountNote:
      "Diagnosis, recovery and nearby alerts stay connected to each field.",
    signOut: "Sign out",
    desktopNavigation: "Desktop navigation",
  },
  hi: {
    tagline: "किसान-प्रथम फसल देखभाल",
    home: "होम",
    scanCrop: "फसल स्कैन",
    myFarm: "मेरा खेत",
    outbreaks: "प्रकोप",
    recovery: "रिकवरी",
    askExpert: "विशेषज्ञ से पूछें",
    schemes: "योजनाएँ",
    profile: "प्रोफ़ाइल",
    signedInAs: "साइन इन",
    browsingAs: "देख रहे हैं",
    guestFarmer: "अतिथि किसान",
    visitor: "आगंतुक",
    accountNote:
      "निदान, रिकवरी और आस-पास की चेतावनियाँ हर खेत से जुड़ी रहती हैं।",
    signOut: "साइन आउट",
    desktopNavigation: "डेस्कटॉप नेविगेशन",
  },
  pa: {
    tagline: "ਕਿਸਾਨ-ਪਹਿਲਾਂ ਫਸਲ ਸੰਭਾਲ",
    home: "ਹੋਮ",
    scanCrop: "ਫਸਲ ਸਕੈਨ",
    myFarm: "ਮੇਰਾ ਖੇਤ",
    outbreaks: "ਫੈਲਾਅ",
    recovery: "ਰਿਕਵਰੀ",
    askExpert: "ਮਾਹਿਰ ਨੂੰ ਪੁੱਛੋ",
    schemes: "ਯੋਜਨਾਵਾਂ",
    profile: "ਪ੍ਰੋਫ਼ਾਈਲ",
    signedInAs: "ਸਾਈਨ ਇਨ",
    browsingAs: "ਵੇਖ ਰਹੇ ਹੋ",
    guestFarmer: "ਮਹਿਮਾਨ ਕਿਸਾਨ",
    visitor: "ਵਿਜ਼ਟਰ",
    accountNote:
      "ਜਾਂਚ, ਰਿਕਵਰੀ ਅਤੇ ਨੇੜਲੇ ਅਲਰਟ ਹਰ ਖੇਤ ਨਾਲ ਜੁੜੇ ਰਹਿੰਦੇ ਹਨ।",
    signOut: "ਸਾਈਨ ਆਉਟ",
    desktopNavigation: "ਡੈਸਕਟਾਪ ਨੇਵੀਗੇਸ਼ਨ",
  },
  mr: {
    tagline: "शेतकरी-प्रथम पीक काळजी",
    home: "होम",
    scanCrop: "पीक स्कॅन",
    myFarm: "माझे शेत",
    outbreaks: "प्रादुर्भाव",
    recovery: "पुनर्प्राप्ती",
    askExpert: "तज्ज्ञाला विचारा",
    schemes: "योजना",
    profile: "प्रोफाइल",
    signedInAs: "साइन इन",
    browsingAs: "पाहत आहात",
    guestFarmer: "अतिथी शेतकरी",
    visitor: "पाहुणा",
    accountNote:
      "निदान, पुनर्प्राप्ती आणि जवळचे इशारे प्रत्येक शेताशी जोडलेले राहतात.",
    signOut: "साइन आउट",
    desktopNavigation: "डेस्कटॉप नेव्हिगेशन",
  },
};

type SidebarTextKey = keyof (typeof SIDEBAR_TEXT)["en"];

const NAV_ITEMS: Array<{
  href: string;
  key: SidebarTextKey;
  icon: typeof Home;
}> = [
  { href: "/", key: "home", icon: Home },
  { href: "/scan", key: "scanCrop", icon: Camera },
  { href: "/farm", key: "myFarm", icon: Map },
  { href: "/alerts", key: "outbreaks", icon: Bell },
  { href: "/recovery", key: "recovery", icon: HeartPulse },
  { href: "/chatbot", key: "askExpert", icon: MessageCircle },
  { href: "/policies", key: "schemes", icon: Landmark },
  { href: "/profile", key: "profile", icon: UserRound },
];

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isGuest, logout } = useAuth();
  const { language } = useLanguage();
  const t = SIDEBAR_TEXT[language];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-white/[0.06] bg-forest-deep px-4 py-6 text-white lg:flex">
      {/* Ambient backdrop: soft radial glow + hairline texture, no motion */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(120% 60% at 0% 0%, rgba(183,227,0,0.10), transparent 60%), radial-gradient(80% 50% at 100% 100%, rgba(15,92,63,0.35), transparent 60%)",
        }}
      />

      <Link
        href="/"
        className="relative z-10 flex items-center gap-3 rounded-2xl p-2 no-global-hover"
      >
        <BrandMark className="h-11 w-11 shrink-0 drop-shadow-[0_4px_18px_rgba(183,227,0,0.25)]" />
        <span>
          <span className="block font-display text-lg font-bold tracking-tight">
            KrishiNayan
          </span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
            {t.tagline}
          </span>
        </span>
      </Link>

      <div className="relative z-10 my-5 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

      <nav
        aria-label={t.desktopNavigation}
        className="relative z-10 flex-1 space-y-1"
      >
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                active
                  ? "bg-white/[0.06] text-leaf"
                  : "text-white/60 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-full bg-leaf transition-all duration-300 ${
                  active ? "w-[3px] opacity-100" : "w-0 opacity-0"
                }`}
              />
              <Icon
                size={18}
                strokeWidth={active ? 2.3 : 1.9}
                className={active ? "text-leaf" : "text-white/50 group-hover:text-white/80"}
              />
              <span className="font-body tracking-tight">{t[key]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
        <p className="section-eyebrow text-white/35">
          {user ? t.signedInAs : t.browsingAs}
        </p>
        <p className="mt-1.5 font-display font-bold text-white">
          {user ? user.full_name : isGuest ? t.guestFarmer : t.visitor}
        </p>
        <p className="mt-1.5 text-xs leading-5 text-white/50">
          {t.accountNote}
        </p>
        {user && (
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/70 hover:border-white/25 hover:text-white"
          >
            {t.signOut}
          </button>
        )}
      </div>
    </aside>
  );
}
