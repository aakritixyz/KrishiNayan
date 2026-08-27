"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Camera, House, LockKeyhole, Map, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import GuestGateModal from "@/components/GuestGateModal";
import { useState, type ReactNode } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [guestFeature, setGuestFeature] = useState<string | null>(null);

  function navColor(path: string) { return pathname === path ? "text-leaf" : "text-white/65 hover:text-white"; }
  function go(path: string, feature: string) { if (user) router.push(path); else setGuestFeature(feature); }

  return (
    <>
      <nav aria-label="Primary navigation" className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-5 items-end border-t border-white/10 bg-forest-deep/95 px-2 pb-4 pt-3 backdrop-blur">
        <Link href="/" className={`flex flex-col items-center gap-1 ${navColor("/")}`}><House size={20} /><span className="text-xs font-medium">Home</span></Link>
        <NavButton onClick={() => go("/farm", "My Farm")} active={pathname === "/farm"} icon={<Map size={20} />} label="Farm" locked={!user} />
        <button type="button" onClick={() => go("/scan", "crop scanning")} className="mt-[-28px] flex flex-col items-center gap-1 text-leaf"><span className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-forest-deep bg-leaf text-forest-deep shadow-lg"><Camera size={25} strokeWidth={2.4} />{!user && <LockKeyhole size={12} className="absolute -right-1 -top-1 rounded-full bg-forest p-0.5 text-leaf" />}</span><span className="text-xs font-semibold">Scan</span></button>
        <NavButton onClick={() => go("/alerts", "nearby alerts")} active={pathname === "/alerts"} icon={<Bell size={20} />} label="Alerts" locked={!user} />
        <NavButton onClick={() => go("/profile", "your farmer profile")} active={pathname === "/profile"} icon={<UserRound size={20} />} label="Profile" locked={!user} />
      </nav>
      <GuestGateModal open={Boolean(guestFeature)} onClose={() => setGuestFeature(null)} feature={guestFeature || undefined} />
    </>
  );
}

function NavButton({ onClick, active, icon, label, locked }: { onClick: () => void; active: boolean; icon: ReactNode; label: string; locked: boolean }) {
  return <button type="button" onClick={onClick} className={`relative flex flex-col items-center gap-1 ${active ? "text-leaf" : "text-white/65 hover:text-white"}`}>{icon}{locked && <LockKeyhole size={9} className="absolute right-[25%] top-0 text-leaf" />}<span className="text-xs font-medium">{label}</span></button>;
}
