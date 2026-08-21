"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Leaf, Loader2, Lock, User } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(identifier.trim(), password);
      router.push("/");
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "Couldn't reach the KrishiNayan backend."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep px-5">
      <section className="w-full max-w-[400px] rounded-[32px] bg-cream p-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-leaf">
          <Leaf size={26} />
        </span>

        <h1 className="mt-4 text-2xl font-bold text-forest">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted">
          Log in to your KrishiNayan account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-xs font-semibold text-muted">
            Email or phone
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-forest/15 bg-white px-3 py-3">
              <User size={17} className="text-forest/50" />
              <input
                required
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="you@example.com or 98765XXXXX"
                className="flex-1 bg-transparent text-sm text-forest outline-none placeholder:text-muted"
              />
            </div>
          </label>

          <label className="block text-xs font-semibold text-muted">
            Password
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-forest/15 bg-white px-3 py-3">
              <Lock size={17} className="text-forest/50" />
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                className="flex-1 bg-transparent text-sm text-forest outline-none placeholder:text-muted"
              />
            </div>
          </label>

          {error && (
            <p className="rounded-xl bg-danger/10 p-3 text-xs font-semibold text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3.5 text-sm font-bold text-forest-deep disabled:opacity-60"
          >
            {isSubmitting && (
              <Loader2 size={18} className="animate-spin" />
            )}
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          New to KrishiNayan?{" "}
          <Link href="/register" className="font-bold text-forest">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
