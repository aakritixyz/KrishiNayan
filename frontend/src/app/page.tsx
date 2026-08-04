import Image from "next/image";
import {
  Camera,
  CloudOff,
  CloudSun,
  Headphones,
  MapPinned,
  Languages,
  Leaf,
} from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-deep sm:p-6">
      <section className="relative min-h-screen w-full max-w-[430px] overflow-hidden bg-forest-deep sm:min-h-[844px] sm:rounded-[32px]">
        <Image
          src="/images/tomato-field.png"
          alt="Tomato field during sunrise"
          fill
          priority
          sizes="(max-width: 640px) 100vw, 430px"
          className="object-cover"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-forest-deep/55"
        />

        <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 text-center sm:min-h-[844px]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-leaf backdrop-blur-sm">
            <Leaf size={34} strokeWidth={2.2} />
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
            <button className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <Languages size={16} />
                <span>हिंदी</span>
            </button>

           <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
               <CloudOff size={16} />
               <span>Offline Ready</span>
           </div>
           </div>

          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            AI Farming Copilot
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
            KrishiNayan
          </h1>

          <p className="mt-3 max-w-xs text-base leading-7 text-white/75">
            From crop photo to clear action
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-semibold text-forest-deep shadow-lg">
  <CloudSun size={20} className="text-warning" />
  <span>28°C · Pune</span>
</div>

          <button className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-leaf px-6 py-4 text-lg font-bold text-forest-deep transition hover:brightness-95">
            <Camera size={24} strokeWidth={2.2} />
            <span>Scan Crop</span>
          </button>

          <div className="mt-3 grid w-full grid-cols-2 gap-3">
            <button className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm transition hover:bg-white/15">
              <MapPinned size={24} className="shrink-0 text-leaf" />

              <span>
                <span className="block font-semibold">My Farm</span>
                <span className="mt-1 block text-xs text-white/65">
                  View your plots
                </span>
               </span>
            </button>

  <button className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white backdrop-blur-sm transition hover:bg-white/15">
    <Headphones size={24} className="shrink-0 text-leaf" />

    <span>
      <span className="block font-semibold">Ask Expert</span>
      <span className="mt-1 block text-xs text-white/65">
        Get KVK support
      </span>
    </span>
  </button>
</div>
</div>
      </section>
    </main>
  );
}