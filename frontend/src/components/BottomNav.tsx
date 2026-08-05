"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Camera,
  House,
  Map,
  UserRound,
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  function navColor(path: string) {
    return pathname === path
      ? "text-leaf"
      : "text-white/65 hover:text-white";
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-5 items-end border-t border-white/10 bg-forest-deep/95 px-2 pb-4 pt-3 backdrop-blur"
    >
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 ${navColor("/")}`}
      >
        <House size={20} />
        <span className="text-xs font-medium">Home</span>
      </Link>

      <Link
        href="/farm"
        className={`flex flex-col items-center gap-1 ${navColor("/farm")}`}
      >
        <Map size={20} />
        <span className="text-xs font-medium">Farm</span>
      </Link>

      <Link
        href="/scan"
        className="mt-[-28px] flex flex-col items-center gap-1 text-leaf"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-forest-deep bg-leaf text-forest-deep shadow-lg">
          <Camera size={25} strokeWidth={2.4} />
        </span>

        <span className="text-xs font-semibold">Scan</span>
      </Link>

      <Link
        href="/alerts"
        className={`flex flex-col items-center gap-1 ${navColor("/alerts")}`}
      >
        <Bell size={20} />
        <span className="text-xs font-medium">Alerts</span>
      </Link>

      <Link
        href="/profile"
        className={`flex flex-col items-center gap-1 ${navColor("/profile")}`}
      >
        <UserRound size={20} />
        <span className="text-xs font-medium">Profile</span>
      </Link>
    </nav>
  );
}