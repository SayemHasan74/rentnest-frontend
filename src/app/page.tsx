import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  KeyRound,
  MapPin,
  MoveRight,
  Search,
  Sparkles,
} from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "RentNest | Find and List Rental Homes",
  description:
    "A connected rental marketplace for tenants, landlords, and platform administrators.",
};

const journey = [
  {
    number: "01",
    title: "Discover",
    description: "Search real rental listings by location, price, type, and amenities.",
    icon: Search,
  },
  {
    number: "02",
    title: "Request",
    description: "Connect with landlords and track every approval decision clearly.",
    icon: KeyRound,
  },
  {
    number: "03",
    title: "Move in",
    description: "Complete secure Stripe payment and keep the full rental history together.",
    icon: CreditCard,
  },
];

export default function LandingPage() {
  return (
    <main>
      <section className="landing-editorial-hero overflow-hidden text-white">
        <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] w-full max-w-[90rem] gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-10 lg:py-10">
          <div className="flex flex-col justify-between py-7 lg:py-12">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                <Sparkles size={14} aria-hidden="true" /> Thoughtful rentals, Dhaka
              </p>
              <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
                A home search with better instincts.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                Discover considered homes, understand the details, and make your next move with confidence.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className={buttonClasses({ size: "lg" })} href="/home">
                  Explore homes <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className={buttonClasses({ variant: "outline", size: "lg", className: "border-white/35 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white" })} href="/auth/register">
                  List your property
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-2">
                {["Gulshan", "Banani", "Dhanmondi", "Uttara"].map((area) => (
                  <Link className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-xs font-medium text-white/75 transition hover:border-white/45 hover:bg-white/10 hover:text-white" href={`/properties?location=${area}&page=1`} key={area}>
                    {area}<MoveRight className="transition-transform group-hover:translate-x-0.5" size={14} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 border-t border-white/15 pt-5">
              {[['One place', 'to search'], ['Clear steps', 'to move in'], ['Three roles', 'one marketplace']].map(([value, label], index) => (
                <div className={index > 0 ? "border-l border-white/15 pl-4" : ""} key={value}>
                  <p className="text-lg font-semibold tracking-[-0.04em] sm:text-xl">{value}</p><p className="mt-1 text-xs text-white/55">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="home-editorial-visual relative min-h-80 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/25 lg:min-h-full">
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-xs font-medium text-white/80"><span className="rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm">A calmer rental journey</span><span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">RentNest</span></div>
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7"><div className="max-w-sm rounded-xl border border-white/15 bg-[#0d172a]/80 p-5 shadow-xl backdrop-blur-md"><p className="flex items-center gap-2 text-xs text-white/60"><MapPin size={14} aria-hidden="true" /> Dhaka, Bangladesh</p><p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">A place to begin well.</p><Link className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-emerald-200" href="/properties">Browse current rentals <ArrowRight size={15} aria-hidden="true" /></Link></div></div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-surface">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">How it works</p>
              <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                One clear rental journey.
              </h2>
            </div>
            <div className="border-t border-slate-300">
              {journey.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    className="grid gap-4 border-b border-slate-300 py-6 sm:grid-cols-[3rem_12rem_1fr] sm:items-center"
                    key={item.number}
                  >
                    <span className="text-sm text-slate-500">{item.number}</span>
                    <div className="flex items-center gap-3">
                      <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                      <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-inverse text-inverse-foreground">
        <div className="mx-auto grid w-full max-w-[90rem] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-10 lg:py-24">
          <div>
            <Building2 size={28} strokeWidth={1.5} aria-hidden="true" />
            <h2 className="mt-6 max-w-xl text-3xl font-semibold leading-tight text-inverse-foreground sm:text-5xl">
              Built for both sides of the front door.
            </h2>
          </div>
          <div className="grid gap-5 border-t border-inverse-foreground/25 pt-6 text-sm leading-6 text-inverse-muted sm:grid-cols-2">
            <div>
              <CheckCircle2 size={18} className="text-inverse-foreground" aria-hidden="true" />
              <h3 className="mt-4 font-semibold text-inverse-foreground">For tenants</h3>
              <p className="mt-2">Browse, request, pay securely, and review completed rentals.</p>
            </div>
            <div>
              <CheckCircle2 size={18} className="text-inverse-foreground" aria-hidden="true" />
              <h3 className="mt-4 font-semibold text-inverse-foreground">For landlords</h3>
              <p className="mt-2">Publish listings, manage availability, and decide requests quickly.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
