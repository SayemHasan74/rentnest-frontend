import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "RentNest | A calmer way to call Dhaka home",
  description:
    "Verified rental homes, transparent pricing, and a clearer way to find your next place in Dhaka.",
};

const areas = [
  { name: "Gulshan", homes: "340 homes", className: "from-[#1e3a34]" },
  { name: "Banani", homes: "212 homes", className: "from-[#2a2a1e]" },
  { name: "Dhanmondi", homes: "198 homes", className: "from-[#1e2a3a]" },
  { name: "Uttara", homes: "276 homes", className: "from-[#2a1e2e]" },
];

const roles = [
  {
    title: "Tenant",
    description:
      "Search with real filters, request rentals directly, and keep every home you have viewed in one place.",
    items: ["Save and compare listings", "Request a rental in-app", "Pay securely after approval"],
  },
  {
    title: "Landlord",
    description:
      "List a property in minutes, review interest, and manage every request from one clear dashboard.",
    items: ["Publish in under five minutes", "Track views and requests", "Approve tenants with confidence"],
  },
  {
    title: "Administrator",
    description:
      "Maintain a reliable marketplace with the tools to review users, listings, and activity at a glance.",
    items: ["Review marketplace activity", "Manage categories and users", "Keep listings trustworthy"],
  },
];

const tickerAreas = ["Gulshan", "Banani", "Dhanmondi", "Uttara", "Baridhara", "Mirpur"];

export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-slate-300">
        <div className="pointer-events-none absolute inset-x-[-10%] top-[-20%] h-[38rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--rn-primary)_12%,transparent),transparent_60%)]" />
        <div className="relative mx-auto grid w-full max-w-[1180px] gap-10 px-6 py-20 sm:px-8 lg:grid-cols-[1.1fr_.8fr] lg:items-center lg:gap-16 lg:py-24">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 before:text-primary before:content-['✦']">
              Thoughtful rentals, Dhaka
            </p>
            <h1 className="mt-6 max-w-3xl font-serif text-5xl font-medium leading-[1.02] tracking-[-0.03em] text-slate-950 sm:text-7xl">
              A calmer way<br />to call Dhaka<br /><em className="font-normal text-primary">home.</em>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              No cold calls, no guessing games. Verified listings, transparent pricing, and a process built so you always know what happens next.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className={buttonClasses({ size: "lg", className: "rounded-full px-6" })} href="/properties">
                Explore homes <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className={buttonClasses({ variant: "outline", size: "lg", className: "rounded-full px-6" })} href="/auth/register">
                List your property
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {["No broker spam", "Verified owners only", "Free to browse"].map((item) => (
                <span className="flex items-center gap-2 text-xs text-slate-400" key={item}>
                  <i className="h-1.5 w-1.5 rounded-full bg-primary" />{item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-5 lg:pt-0">
            <div className="w-px bg-gradient-to-b from-slate-300 to-slate-400">
              <div className="h-[52px]" />
              <aside className="relative ml-[-140px] w-[280px] rotate-[-4deg] rounded-2xl border border-slate-300 bg-surface px-7 pb-7 pt-8 shadow-2xl shadow-black/20">
                <i className="absolute left-1/2 top-[-9px] h-4 w-4 -translate-x-1/2 rounded-full border border-slate-300 bg-background" />
                <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-slate-400">Move-in snapshot</p>
                {[['Verified homes', '2,400+'], ['Avg. owner reply', '4 min'], ['Neighborhoods', '12']].map(([label, value]) => (
                  <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-slate-300 pt-3 first:border-t-0 first:pt-0" key={label}>
                    <span className="text-xs text-slate-500">{label}</span><b className="font-mono text-lg font-semibold text-primary">{value}</b>
                  </div>
                ))}
              </aside>
            </div>
          </div>
        </div>
      </section>

      <div className="home-ticker border-b border-slate-300 bg-slate-100 py-4" aria-label="Featured Dhaka neighborhoods">
        <div className="home-ticker-track flex w-max">
          {[...tickerAreas, ...tickerAreas].map((area, index) => (
            <span className="flex items-center gap-7 px-7 font-mono text-xs text-slate-400 after:text-primary after:content-['·']" key={`${area}-${index}`}>{area}</span>
          ))}
        </div>
      </div>

      <section id="roles" className="mx-auto w-full max-w-[1180px] px-6 py-20 sm:px-8 lg:py-24">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">One marketplace</p>
          <h2 className="mt-3 font-serif text-4xl font-medium leading-tight tracking-[-0.02em] text-slate-950 sm:text-5xl">Three roles, each with a clear path.</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">Whoever you are in the rental, RentNest gives you a role-built view instead of one confusing dashboard.</p>
        </div>
        <div className="grid gap-6 border-t border-slate-300 pt-6 md:grid-cols-3">
          {roles.map((role, index) => (
            <article className="relative overflow-hidden rounded-2xl border border-slate-300 bg-surface p-7" key={role.title}>
              <div className="absolute inset-x-0 top-[78px] border-t border-dashed border-slate-300" />
              <i className="absolute -left-2 top-[69px] h-[18px] w-[18px] rounded-full border border-slate-300 bg-background" />
              <p className="font-mono text-xs text-slate-400">ROLE / 0{index + 1}</p>
              <h3 className="mt-10 font-serif text-2xl font-medium text-slate-950">{role.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{role.description}</p>
              <ul className="mt-5 grid gap-2 text-sm text-slate-500">
                {role.items.map((item) => <li className="flex gap-2" key={item}><ArrowRight className="mt-0.5 shrink-0 text-primary" size={15} aria-hidden="true" />{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-300 bg-slate-100">
        <div className="mx-auto grid w-full max-w-[1180px] sm:grid-cols-2 lg:grid-cols-4">
          {[['2,400+', 'Verified rental homes'], ['12', 'Neighborhoods covered'], ['4 min', 'Average owner response'], ['98%', 'Would search again']].map(([number, label], index) => (
            <div className={`border-slate-300 px-8 py-12 ${index > 0 ? 'border-t sm:border-l sm:border-t-0' : ''} ${index === 2 ? 'lg:border-t-0' : ''}`} key={label}>
              <b className="block font-serif text-4xl font-medium text-primary">{number}</b><span className="mt-1 block text-sm text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:px-8 lg:py-24">
        <blockquote className="font-serif text-2xl font-normal italic leading-relaxed text-slate-950 sm:text-3xl">I found a flat in Banani in four days without a single agent call. I actually knew what I was walking into before I saw it.</blockquote>
        <p className="mt-7 text-sm text-slate-500"><b className="font-semibold text-slate-950">Nusrat J.</b> — moved in March, Banani</p>
      </section>

      <section id="cities" className="mx-auto w-full max-w-[1180px] px-6 py-20 sm:px-8 lg:py-24">
        <div className="mb-14 max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Featured areas</p><h2 className="mt-3 font-serif text-4xl font-medium leading-tight tracking-[-0.02em] text-slate-950 sm:text-5xl">Start where you already know you want to be.</h2></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map((area) => (
            <Link className={`relative flex h-64 items-end overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-br ${area.className} to-background p-6 text-white after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/75 after:to-transparent`} href={`/properties?location=${area.name}&page=1`} key={area.name}>
              <span className="relative z-10"><b className="block font-serif text-2xl font-medium">{area.name}</b><small className="font-mono text-xs text-white/80">{area.homes}</small></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-4 mb-20 rounded-[28px] border border-slate-300 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--rn-primary)_12%,transparent),transparent_70%),var(--rn-surface)] px-6 py-20 text-center sm:mx-8 sm:px-12 lg:mx-12">
        <ShieldCheck className="mx-auto text-primary" size={28} aria-hidden="true" />
        <h2 className="mx-auto mt-5 max-w-2xl font-serif text-4xl font-medium leading-tight tracking-[-0.02em] text-slate-950 sm:text-5xl">Your next home is a calmer search away.</h2>
        <p className="mt-5 text-base text-slate-600">Create a free account and start browsing verified listings today.</p>
        <Link className={buttonClasses({ size: "lg", className: "mt-8 rounded-full px-7" })} href="/properties">Explore homes <ArrowRight size={18} aria-hidden="true" /></Link>
      </section>
    </main>
  );
}
