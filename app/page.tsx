import { th } from "@/locales/th";

// Placeholder until Phase 3 (Home screen from /design/Main.dc.html).
export default function Home() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-1 bg-hero px-5 text-white">
      <p className="text-[15px] text-white/90">{th.home.welcome}</p>
      <h1 className="font-display text-[28px] font-bold leading-tight">
        {th.home.heading}
      </h1>
      <p className="text-sm text-white/90">{th.app.description}</p>
    </main>
  );
}
