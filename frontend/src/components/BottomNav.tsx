"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Camera, House, LockKeyhole, Map, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage, type Language } from "@/lib/language-context";
import GuestGateModal from "@/components/GuestGateModal";
import { useState, type ReactNode } from "react";

const NAV_TEXT: Record<Language, { home: string; farm: string; scan: string; alerts: string; profile: string; nearbyAlerts: string; farmerProfile: string; cropScanning: string }> = {
  en: { home: "Home", farm: "Farm", scan: "Scan", alerts: "Alerts", profile: "Profile", nearbyAlerts: "nearby alerts", farmerProfile: "your farmer profile", cropScanning: "crop scanning" },
  hi: { home: "होम", farm: "खेत", scan: "स्कैन", alerts: "अलर्ट", profile: "प्रोफ़ाइल", nearbyAlerts: "आस-पास के अलर्ट", farmerProfile: "आपकी किसान प्रोफ़ाइल", cropScanning: "फसल स्कैन" },
  pa: { home: "ਹੋਮ", farm: "ਖੇਤ", scan: "ਸਕੈਨ", alerts: "ਅਲਰਟ", profile: "ਪ੍ਰੋਫਾਈਲ", nearbyAlerts: "ਨੇੜਲੇ ਅਲਰਟ", farmerProfile: "ਤੁਹਾਡੀ ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ", cropScanning: "ਫਸਲ ਸਕੈਨ" },
  mr: { home: "होम", farm: "शेत", scan: "स्कॅन", alerts: "अलर्ट", profile: "प्रोफाइल", nearbyAlerts: "जवळचे अलर्ट", farmerProfile: "तुमचे शेतकरी प्रोफाइल", cropScanning: "पीक स्कॅन" },
};

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const { language } = useLanguage();
  const t = NAV_TEXT[language];
  const [guestFeature, setGuestFeature] = useState<string | null>(null);

  function navColor(path: string) { return pathname === path ? "text-leaf" : "text-white/65 hover:text-white"; }
  function go(path: string, feature: string) { if (user || isGuest) router.push(path); else setGuestFeature(feature); }

  return (
    <>
      <nav aria-label="Primary navigation" className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-5 items-end border-t border-white/10 bg-forest-deep/95 px-2 pb-4 pt-3 backdrop-blur lg:hidden">
        <Link href="/" className={`flex flex-col items-center gap-1 ${navColor("/")}`}><House size={20} /><span className="text-xs font-medium">{t.home}</span></Link>
        <NavButton onClick={() => go("/farm", t.farm)} active={pathname === "/farm"} icon={<Map size={20} />} label={t.farm} locked={!user && !isGuest} />
        <button type="button" onClick={() => go("/scan", t.cropScanning)} className="mt-[-28px] flex flex-col items-center gap-1 text-leaf"><span className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-forest-deep bg-leaf text-forest-deep shadow-lg"><Camera size={25} strokeWidth={2.4} />{!user && !isGuest && <LockKeyhole size={12} className="absolute -right-1 -top-1 rounded-full bg-forest p-0.5 text-leaf" />}</span><span className="text-xs font-semibold">{t.scan}</span></button>
        <NavButton onClick={() => go("/alerts", t.nearbyAlerts)} active={pathname === "/alerts"} icon={<Bell size={20} />} label={t.alerts} locked={!user && !isGuest} />
        <NavButton onClick={() => go("/profile", t.farmerProfile)} active={pathname === "/profile"} icon={<UserRound size={20} />} label={t.profile} locked={!user && !isGuest} />
      </nav>
      <GuestGateModal open={Boolean(guestFeature)} onClose={() => setGuestFeature(null)} feature={guestFeature || undefined} />
    </>
  );
}

function NavButton({ onClick, active, icon, label, locked }: { onClick: () => void; active: boolean; icon: ReactNode; label: string; locked: boolean }) {
  return <button type="button" onClick={onClick} className={`relative flex flex-col items-center gap-1 ${active ? "text-leaf" : "text-white/65 hover:text-white"}`}>{icon}{locked && <LockKeyhole size={9} className="absolute right-[25%] top-0 text-leaf" />}<span className="text-xs font-medium">{label}</span></button>;
}
