import { ReactNode } from 'react';
import CarArt from '../components/CarArt';
import ThemeToggle from '../components/ThemeToggle';

const perks = ['Live stock counts', 'One-click purchase', 'Admin controls'];

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 text-2xl font-extrabold tracking-tight ${dark ? 'text-fg' : 'text-white'}`}>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-plate text-xl font-extrabold text-ink shadow-lg">A</span>
      Autohaus
    </div>
  );
}

export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="relative grid min-h-screen lg:grid-cols-[1.15fr_1fr]">
      <div className="absolute right-4 top-4 z-10"><ThemeToggle /></div>
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#05110d] via-[#0a3d2f] to-[#14a07a] p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-28 -top-28 h-[28rem] w-[28rem] rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[30rem] w-[30rem] rounded-full bg-plate/20 blur-3xl" />

        <Brand />

        <div className="relative">
          <h1 className="max-w-lg text-5xl font-extrabold leading-[1.05]">Every car on the lot, one live inventory.</h1>
          <p className="mt-4 max-w-md text-lg text-white/75">Browse what is in stock, buy in one click, and keep the numbers honest.</p>
          <div className="relative mt-10">
            <CarArt className="drive-in w-full max-w-md text-white drop-shadow-[0_24px_18px_rgba(0,0,0,0.4)]" />
            <div className="mt-1 h-1 max-w-lg rounded-full bg-gradient-to-r from-white/50 via-white/10 to-transparent" />
          </div>
        </div>

        <ul className="relative flex flex-wrap gap-3">
          {perks.map((p) => (
            <li key={p} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">{p}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col items-center justify-center gap-8 p-6">
        <div className="lg:hidden"><Brand dark /></div>
        <div className="w-full max-w-sm rounded-2xl bg-surface/85 p-8 shadow-[0_30px_60px_-24px_rgba(13,92,70,0.45)] ring-1 ring-black/5 backdrop-blur">
          <h2 className="text-3xl font-extrabold">{title}</h2>
          <p className="mb-6 mt-1 text-fg/70">{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
