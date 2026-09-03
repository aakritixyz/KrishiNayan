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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-white/10 bg-forest-deep px-4 py-5 text-white lg:flex">
      <Link href="/" className="flex items-center gap-3 rounded-2xl p-2">
        <BrandMark className="h-12 w-12 shrink-0" />
        <span>
          <span className="block text-lg font-bold">KrishiNayan</span>
          <span className="block text-xs font-medium text-white/55">
            {t.tagline}
          </span>
        </span>
      </Link>

      <nav aria-label={t.desktopNavigation} className="mt-6 flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
                active
                  ? "bg-leaf text-forest-deep"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={19} />
              {t[key]}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
          {user ? t.signedInAs : t.browsingAs}
        </p>
        <p className="mt-1 font-bold">
          {user ? user.full_name : isGuest ? t.guestFarmer : t.visitor}
        </p>
        <p className="mt-1 text-xs leading-5 text-white/55">
          {t.accountNote}
        </p>
        {user && (
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="mt-3 rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-white/75"
          >
            {t.signOut}
          </button>
        )}
      </div>
    </aside>
  );
}
