import BottomNav from "@/components/BottomNav";
import {
  Bell,
  CloudOff,
  Languages,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function ProfilePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-cream px-5 pb-32 pt-8 sm:min-h-[844px] sm:rounded-[36px]">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">
          Farmer Profile
        </p>

        <h1 className="mt-2 text-3xl font-bold text-forest">
          Your Account
        </h1>

        <div className="mt-6 rounded-[28px] bg-forest p-5 text-white">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf text-forest-deep">
              <UserRound size={32} />
            </span>

            <div>
              <h2 className="text-xl font-bold">Bhumi Saxena</h2>

              <p className="mt-1 flex items-center gap-1 text-sm text-white/65">
                <MapPin size={15} />
                Pune, Maharashtra
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              ["3", "Fields"],
              ["12", "Scans"],
              ["2", "Alerts"],
            ].map(([number, label]) => (
              <div key={label} className="rounded-2xl bg-white/10 p-3">
                <p className="text-xl font-bold text-leaf">{number}</p>
                <p className="text-xs text-white/65">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-[22px] bg-white p-4">
          <CloudOff size={23} className="text-forest" />

          <div className="flex-1">
            <p className="font-bold text-forest">Offline Ready</p>
            <p className="text-xs text-muted">
              Farm information is available offline
            </p>
          </div>

          <span className="h-3 w-3 rounded-full bg-leaf" />
        </div>

        <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-widest text-muted">
          Preferences
        </h2>

        <div className="overflow-hidden rounded-[24px] border border-forest/10 bg-white">
          <div className="flex items-center gap-3 border-b border-forest/10 p-4">
            <Languages size={22} className="text-forest" />

            <div>
              <p className="font-semibold text-forest">Language</p>
              <p className="text-xs text-muted">English and Hindi</p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-forest/10 p-4">
            <Bell size={22} className="text-forest" />

            <div className="flex-1">
              <p className="font-semibold text-forest">Notifications</p>
              <p className="text-xs text-muted">
                Weather and disease alerts
              </p>
            </div>

            <span className="rounded-full bg-leaf px-3 py-1 text-xs font-bold text-forest">
              ON
            </span>
          </div>

          <div className="flex items-center gap-3 p-4">
            <ShieldCheck size={22} className="text-forest" />

            <div>
              <p className="font-semibold text-forest">
                Privacy and data
              </p>
              <p className="text-xs text-muted">
                Manage saved information
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 w-full rounded-2xl bg-forest px-5 py-4 font-bold text-white"
        >
          Officer Dashboard
        </button>

        <div className="mt-5 rounded-[22px] bg-white p-4 text-center">
          <p className="font-bold text-forest">KrishiNayan</p>
          <p className="mt-1 text-xs text-muted">
            AI Farming Copilot • Prototype v1.0
          </p>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}