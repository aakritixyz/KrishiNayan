"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Leaf, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!email.trim() && !phone.trim()) {
      setError("Enter at least an email or a phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password,
      });
      router.push("/onboarding");
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
    <main className="flex min-h-screen items-center justify-center bg-forest-deep px-5 py-10">
      <section className="w-full max-w-[400px] rounded-[32px] bg-cream p-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-leaf">
          <Leaf size={26} />
        </span>

        <h1 className="mt-4 text-2xl font-bold text-forest">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted">
          Takes a minute - you can fill in farm details after.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-xs font-semibold text-muted">
            Full name
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-forest/15 bg-white px-3 py-3">
              <User size={17} className="text-forest/50" />
              <input
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your name"
                className="flex-1 bg-transparent text-sm text-forest outline-none placeholder:text-muted"
              />
            </div>
          </label>

          <label className="block text-xs font-semibold text-muted">
            Email (optional if phone given)
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-forest/15 bg-white px-3 py-3">
              <Mail size={17} className="text-forest/50" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="flex-1 bg-transparent text-sm text-forest outline-none placeholder:text-muted"
              />
            </div>
          </label>

          <label className="block text-xs font-semibold text-muted">
            Phone (optional if email given)
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-forest/15 bg-white px-3 py-3">
              <Phone size={17} className="text-forest/50" />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="98765 43210"
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
                placeholder="At least 8 characters, letters + numbers"
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
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-forest">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
