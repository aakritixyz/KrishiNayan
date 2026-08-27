"use client";

import Link from "next/link";
import { LockKeyhole, X } from "lucide-react";

export default function GuestGateModal({
  open,
  onClose,
  feature = "this feature",
}: {
  open: boolean;
  onClose: () => void;
  feature?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="guest-gate-title">
      <div className="w-full max-w-[390px] rounded-[28px] bg-cream p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-leaf">
            <LockKeyhole size={22} />
          </span>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-forest/10" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <h2 id="guest-gate-title" className="mt-4 text-xl font-bold text-forest">Create your Farmer Profile</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Create a farmer profile to use {feature}, save your activity and receive recommendations based on your crops and farm context.
        </p>
        <div className="mt-5 grid gap-3">
          <Link href="/register" className="rounded-2xl bg-leaf px-4 py-3 text-center text-sm font-bold text-forest-deep">Create Farmer Profile</Link>
          <Link href="/login?mode=farmer" className="rounded-2xl border border-forest/15 bg-white px-4 py-3 text-center text-sm font-bold text-forest">I already have an account</Link>
          <button type="button" onClick={onClose} className="py-2 text-sm font-semibold text-muted">Maybe later</button>
        </div>
      </div>
    </div>
  );
}
