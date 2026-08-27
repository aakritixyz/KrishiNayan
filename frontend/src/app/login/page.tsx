"use client"; 

import Link from "next/link"; 
import { useRouter } from "next/navigation"; 
import { ApiError } from "@/lib/api"; 
import { useAuth } from "@/lib/auth-context"; 
import { 
  ArrowLeft, 
  Building2, 
  Eye, 
  EyeOff,
  Leaf, 
  Loader2, 
  Lock, 
  Sprout, 
  User, 
} from "lucide-react"; 
import { useEffect, useState, type FormEvent, type ReactNode } from "react"; 

type Mode = "choose" | "farmer" | "officer"; 

export default function LoginPage() { 
  const router = useRouter(); 
  const { login, officerLogin, continueAsGuest } = useAuth(); 
  const [mode, setMode] = useState<Mode>("choose"); 
  const [identifier, setIdentifier] = useState(""); 
  const [institutionalId, setInstitutionalId] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => { 
    const requested = new URLSearchParams(window.location.search).get("mode"); 
    if (requested === "farmer" || requested === "officer") setMode(requested); 
  }, []); 

  async function handleFarmerSubmit(event: FormEvent) { 
    event.preventDefault(); 
    setError(null); 
    setIsSubmitting(true); 
    try { 
      const user = await login(identifier.trim(), password); 
      router.push(user.profile_completed ? "/" : "/onboarding"); 
    } catch (submitError) { 
      setError(submitError instanceof ApiError ? submitError.message : "Couldn't reach the KrishiNayan backend."); 
    } finally { 
      setIsSubmitting(false); 
    } 
  } 

  async function handleOfficerSubmit(event: FormEvent) { 
    event.preventDefault(); 
    setError(null); 
    setIsSubmitting(true); 
    try { 
      await officerLogin(institutionalId.trim().toUpperCase(), password); 
      router.push("/officer"); 
    } catch (submitError) { 
      setError(submitError instanceof ApiError ? submitError.message : "Couldn't reach the KrishiNayan backend."); 
    } finally { 
      setIsSubmitting(false); 
    } 
  } 

  return ( 
    <main className="flex min-h-screen items-center justify-center bg-forest-deep px-5 py-8"> 
      <section className="w-full max-w-[420px] rounded-[32px] bg-cream p-6"> 
        <div className="flex items-center justify-between"> 
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-leaf"><Leaf size={26} /></span> 
          {mode !== "choose" && ( 
            <button type="button" onClick={() => { setMode("choose"); setError(null); }} className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-muted hover:bg-forest/5"> 
              <ArrowLeft size={16} /> Back 
            </button> 
          )} 
        </div> 

        {mode === "choose" && ( 
          <> 
            <h1 className="mt-5 text-2xl font-bold text-forest">How would you like to continue?</h1> 
            <p className="mt-1 text-sm leading-6 text-muted">Choose the space that matches how you use KrishiNayan.</p> 
            <div className="mt-6 grid gap-3"> 
              <button type="button" onClick={() => setMode("farmer")} className="flex items-center gap-4 rounded-2xl border border-forest/10 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-leaf hover:shadow-md"> 
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-leaf/25 text-forest"><Sprout size={23} /></span> 
                <span><span className="block font-bold text-forest">Farmer</span><span className="mt-1 block text-xs leading-5 text-muted">Sign in or create your farmer profile.</span></span> 
              </button> 
              <button type="button" onClick={() => setMode("officer")} className="flex items-center gap-4 rounded-2xl border border-forest/10 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-leaf hover:shadow-md"> 
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest text-leaf"><Building2 size={22} /></span> 
                <span><span className="block font-bold text-forest">Government / Organisation</span><span className="mt-1 block text-xs leading-5 text-muted">Verified institutional access only.</span></span> 
              </button> 
              <button 
                type="button" 
                onClick={() => { 
                  continueAsGuest(); 
                  router.replace("/"); 
                }} 
                className="flex items-center gap-4 rounded-2xl border border-dashed border-forest/20 p-4 text-left transition hover:bg-white" 
              > 
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest/5 text-forest"><Eye size={22} /></span> 
                <span><span className="block font-bold text-forest">Continue as Guest</span><span className="mt-1 block text-xs leading-5 text-muted">Preview features. Create a farmer profile when you want to use them.</span></span> 
              </button> 
            </div> 
          </> 
        )} 

        {mode === "farmer" && ( 
          <> 
            <h1 className="mt-5 text-2xl font-bold text-forest">Farmer login</h1> 
            <p className="mt-1 text-sm text-muted">Access your farm, scans, alerts and recovery history.</p> 
            <form onSubmit={handleFarmerSubmit} className="mt-6 space-y-4"> 
              <label className="block text-xs font-semibold text-muted">Email or phone 
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-forest/15 bg-white px-3 py-3"><User size={17} className="text-forest/50" /><input required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@example.com or 98765XXXXX" className="flex-1 bg-transparent text-sm text-forest outline-none placeholder:text-muted" /></div> 
              </label> 
              <PasswordInput value={password} onChange={setPassword} /> 
              <ErrorMessage error={error} /> 
              <SubmitButton loading={isSubmitting}>Log in as Farmer</SubmitButton> 
            </form> 
            <p className="mt-6 text-center text-sm text-muted">New farmer? <Link href="/register" className="font-bold text-forest">Create Farmer Profile</Link></p> 
          </> 
        )} 

        {mode === "officer" && ( 
          <> 
            <h1 className="mt-5 text-2xl font-bold text-forest">Institutional login</h1> 
            <p className="mt-1 text-sm leading-6 text-muted">For verified government departments and approved organisations. New institutional users can request an account.</p> 
            <form onSubmit={handleOfficerSubmit} className="mt-6 space-y-4"> 
              <label className="block text-xs font-semibold text-muted">Institutional ID 
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-forest/15 bg-white px-3 py-3"><Building2 size={17} className="text-forest/50" /><input required value={institutionalId} onChange={(e) => setInstitutionalId(e.target.value)} placeholder="e.g. MH-PUNE-AGRI-01" className="flex-1 bg-transparent text-sm uppercase text-forest outline-none placeholder:text-muted" /></div> 
              </label> 
              <PasswordInput value={password} onChange={setPassword} /> 
              <ErrorMessage error={error} /> 
              <SubmitButton loading={isSubmitting}>Sign in to Officer View</SubmitButton> 
            </form> 
            <p className="mt-5 rounded-2xl bg-forest/5 p-3 text-xs leading-5 text-muted"> 
              Institutional accounts are provisioned after verification and restricted to their assigned geography. 
            </p> 

            <div className="mt-4 text-center"> 
              <p className="text-sm text-muted">Don&apos;t have an institutional account?</p> 
              <Link 
                href="/officer-register" 
                className="mt-2 inline-flex items-center justify-center rounded-2xl border border-forest/15 bg-white px-5 py-3 text-sm font-bold text-forest transition hover:border-leaf hover:bg-leaf/10" 
              > 
                Create / Request Account 
              </Link> 
            </div> 
          </> 
        )} 
      </section> 
    </main> 
  ); 
} 

function PasswordInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block text-xs font-semibold text-muted">
      Password
      <div className="mt-1 flex items-center gap-2 rounded-2xl border border-forest/15 bg-white px-3 py-3">
        <Lock size={17} className="text-forest/50" />

        <input
          required
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your password"
          className="min-w-0 flex-1 bg-transparent text-sm text-forest outline-none placeholder:text-muted"
        />

        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="shrink-0 text-forest/50 transition hover:text-forest"
          aria-label={showPassword ? "Hide password" : "Show password"}
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}

function ErrorMessage({ error }: { error: string | null }) { return error ? <p className="rounded-xl bg-danger/10 p-3 text-xs font-semibold text-danger">{error}</p> : null; } 
function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) { return <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-4 py-3.5 text-sm font-bold text-forest-deep disabled:opacity-60">{loading && <Loader2 size={18} className="animate-spin" />}{children}</button>; } 
