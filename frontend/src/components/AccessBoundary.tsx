"use client";

import { useAuth } from "@/lib/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import GuestGateModal from "@/components/GuestGateModal";

const FARMER_ONLY_PREFIXES = [
  "/scan", "/farm", "/alerts", "/profile", "/onboarding", "/health",
  "/chatbot", "/recovery", "/result", "/policies"
];

export default function AccessBoundary({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const farmerOnly = FARMER_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const officerOnly = pathname === "/officer" || pathname.startsWith("/officer/");

  useEffect(() => {
    if (isLoading) return;
    if (farmerOnly && !user) setModalOpen(true);
    if (farmerOnly && user?.role === "officer") router.replace("/officer");
    if (officerOnly && user?.role === "farmer") router.replace("/");
    if (officerOnly && !user) router.replace("/login?mode=officer");
  }, [farmerOnly, officerOnly, user, isLoading, router]);

  if (isLoading && (farmerOnly || officerOnly)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-forest-deep text-white/75">
        <Loader2 size={20} className="mr-2 animate-spin" /> Checking access...
      </main>
    );
  }

  if (farmerOnly && !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-forest-deep px-5">
        <section className="w-full max-w-[390px] rounded-[28px] bg-cream p-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-leaf"><LockKeyhole size={24} /></span>
          <h1 className="mt-4 text-xl font-bold text-forest">Farmer profile required</h1>
          <p className="mt-2 text-sm leading-6 text-muted">You can preview KrishiNayan as a guest, but using farmer features requires a profile.</p>
          <button type="button" onClick={() => setModalOpen(true)} className="mt-5 w-full rounded-2xl bg-leaf px-4 py-3 text-sm font-bold text-forest-deep">Continue</button>
        </section>
        <GuestGateModal open={modalOpen} onClose={() => { setModalOpen(false); router.replace("/"); }} feature="this farmer feature" />
      </main>
    );
  }

  if ((farmerOnly && user?.role === "officer") || (officerOnly && user?.role !== "officer")) {
    return null;
  }

  return <>{children}</>;
}
