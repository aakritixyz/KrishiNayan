"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoading, isGuest } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && !isGuest) {
      router.replace("/login");
    }
  }, [isLoading, user, isGuest, router]);

  if (isLoading || (!user && !isGuest)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-forest-deep">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
          <Loader2 size={18} className="animate-spin" />
          Loading...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
