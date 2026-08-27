"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Leaf,
  Loader2,
  Mail,
  MapPin,
  User,
} from "lucide-react";

import { apiJson, ApiError } from "@/lib/api";

type RequestResponse = {
  request_id: number;
  status: string;
  message: string;
};

export default function OfficerRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    official_email: "",
    institutional_id: "",
    organisation: "",
    designation: "",
    state: "",
    district: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<RequestResponse | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await apiJson<RequestResponse>(
        "/auth/officer-register-request",
        {
          method: "POST",
          body: JSON.stringify({
            ...form,
            institutional_id: form.institutional_id.trim().toUpperCase(),
          }),
        }
      );

      setSuccess(result);
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

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-forest-deep px-5 py-8">
        <section className="w-full max-w-[420px] rounded-[32px] bg-cream p-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf/20 text-forest">
            <CheckCircle2 size={28} />
          </span>

          <h1 className="mt-5 text-2xl font-bold text-forest">
            Request submitted
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted">
            Your institutional account request is pending verification.
            You will be able to sign in only after the account is approved.
          </p>

          <div className="mt-5 rounded-2xl bg-forest/5 p-4 text-sm text-forest">
            <p><span className="font-bold">Request ID:</span> #{success.request_id}</p>
            <p className="mt-1"><span className="font-bold">Status:</span> {success.status}</p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/login?mode=officer")}
            className="mt-6 w-full rounded-2xl bg-leaf px-4 py-3.5 text-sm font-bold text-forest-deep"
          >
            Back to Officer Login
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep px-5 py-8">
      <section className="w-full max-w-[420px] rounded-[32px] bg-cream p-6">
        <div className="flex items-center justify-between">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-leaf">
            <Leaf size={26} />
          </span>

          <Link
            href="/login?mode=officer"
            className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-muted hover:bg-forest/5"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        <h1 className="mt-5 text-2xl font-bold text-forest">
          Create institutional account
        </h1>

        <p className="mt-1 text-sm leading-6 text-muted">
          Submit your official details. Access is activated only after
          institutional verification.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Full name" icon={<User size={17} />}>
            <input
              required
              value={form.full_name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  full_name: event.target.value,
                }))
              }
              placeholder="Officer name"
              className="flex-1 bg-transparent text-sm text-forest outline-none placeholder:text-muted"
            />
          </Field>

          <Field label="Official email" icon={<Mail size={17} />}>
            <input
              required
              type="email"
              value={form.official_email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  official_email: event.target.value,
                }))
              }
              placeholder="name@department.gov.in"
              className="flex-1 bg-transparent text-sm text-forest outline-none placeholder:text-muted"
            />
          </Field>

          <Field label="Institutional ID" icon={<Building2 size={17} />}>
            <input
              required
              value={form.institutional_id}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  institutional_id: event.target.value,
                }))
              }
              placeholder="e.g. MH-PUNE-AGRI-01"
              className="flex-1 bg-transparent text-sm uppercase text-forest outline-none placeholder:text-muted"
            />
          </Field>

          <Field label="Organisation" icon={<Building2 size={17} />}>
            <input
              required
              value={form.organisation}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  organisation: event.target.value,
                }))
              }
              placeholder="Department / organisation"
              className="flex-1 bg-transparent text-sm text-forest outline-none placeholder:text-muted"
            />
          </Field>

          <label className="block text-xs font-semibold text-muted">
            Designation
            <input
              required
              value={form.designation}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  designation: event.target.value,
                }))
              }
              placeholder="Agriculture Officer"
              className="mt-1 w-full rounded-2xl border border-forest/15 bg-white px-3 py-3 text-sm text-forest outline-none placeholder:text-muted"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Field label="State" icon={<MapPin size={17} />}>
              <input
                required
                value={form.state}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    state: event.target.value,
                  }))
                }
                placeholder="Maharashtra"
                className="min-w-0 flex-1 bg-transparent text-sm text-forest outline-none placeholder:text-muted"
              />
            </Field>

            <Field label="District" icon={<MapPin size={17} />}>
              <input
                required
                value={form.district}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    district: event.target.value,
                  }))
                }
                placeholder="Pune"
                className="min-w-0 flex-1 bg-transparent text-sm text-forest outline-none placeholder:text-muted"
              />
            </Field>
          </div>

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
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            Submit for Verification
          </button>
        </form>

        <p className="mt-5 rounded-2xl bg-forest/5 p-3 text-xs leading-5 text-muted">
          Creating a request does not immediately grant Officer View access.
          Institutional identity and geographic scope must be verified first.
        </p>
      </section>
    </main>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-semibold text-muted">
      {label}
      <div className="mt-1 flex items-center gap-2 rounded-2xl border border-forest/15 bg-white px-3 py-3">
        <span className="text-forest/50">{icon}</span>
        {children}
      </div>
    </label>
  );
}
