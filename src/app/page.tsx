import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  KeyRound,
  Search,
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
      <section className="relative min-h-[calc(86vh-4.5rem)] overflow-hidden bg-black text-white">
        <Image
          alt="Bright contemporary rental home interior"
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto flex min-h-[calc(86vh-4.5rem)] w-full max-w-[90rem] flex-col justify-end px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
          <p className="text-xs font-semibold uppercase text-white/70">
            Rentals, thoughtfully connected
          </p>
          <h1 className="mt-4 max-w-5xl text-5xl font-semibold leading-none text-white sm:text-7xl lg:text-8xl">
            RentNest
          </h1>
          <div className="mt-6 grid max-w-5xl gap-6 border-t border-white/50 pt-6 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Find a home that fits your life, or place your property in front of
              tenants ready to move.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className={buttonClasses({
                  size: "lg",
                  className: "!border-white !bg-white !text-black hover:!bg-slate-200",
                })}
                href="/home"
              >
                Find a home
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                className={buttonClasses({
                  variant: "outline",
                  size: "lg",
                  className:
                    "border-white/70 bg-transparent text-white hover:bg-white hover:text-black",
                })}
                href="/auth/register"
              >
                List a property
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
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

      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid w-full max-w-[90rem] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-10 lg:py-24">
          <div>
            <Building2 size={28} strokeWidth={1.5} aria-hidden="true" />
            <h2 className="mt-6 max-w-xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Built for both sides of the front door.
            </h2>
          </div>
          <div className="grid gap-5 border-t border-white/25 pt-6 text-sm leading-6 text-slate-300 sm:grid-cols-2">
            <div>
              <CheckCircle2 size={18} className="text-emerald-400" aria-hidden="true" />
              <h3 className="mt-4 font-semibold text-white">For tenants</h3>
              <p className="mt-2">Browse, request, pay securely, and review completed rentals.</p>
            </div>
            <div>
              <CheckCircle2 size={18} className="text-emerald-400" aria-hidden="true" />
              <h3 className="mt-4 font-semibold text-white">For landlords</h3>
              <p className="mt-2">Publish listings, manage availability, and decide requests quickly.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
