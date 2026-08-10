import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Handshake, ShieldCheck } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About RentNest | RentNest",
  description: "Learn how RentNest supports clearer rental decisions for tenants and landlords.",
};

const principles = [
  { icon: Building2, title: "Clear property discovery", text: "Browse rental homes with the location, price, and property details needed to make an informed shortlist." },
  { icon: Handshake, title: "A shared rental workflow", text: "Tenants can send requests, landlords can respond, and each role can follow the status of the rental journey." },
  { icon: ShieldCheck, title: "Role-aware administration", text: "Administrators can manage users, categories, and listed properties in one workspace." },
];

export default function AboutPage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-300 bg-surface">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">About RentNest</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">A more considered way to find and manage a rental home.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">RentNest brings browsing, rental requests, property management, and payment history into one role-aware marketplace.</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-[90rem] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {principles.map(({ icon: Icon, title, text }) => (
            <article className="rounded-md border border-slate-300 bg-surface p-6 shadow-sm" key={title}>
              <Icon className="text-emerald-700" size={25} aria-hidden="true" />
              <h2 className="mt-6 text-xl font-semibold text-slate-950">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
        <div className="mt-14 rounded-md bg-black px-6 py-10 text-white sm:px-10">
          <h2 className="text-2xl font-semibold">Ready to explore?</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Start with available properties, then create an account when you are ready to send a rental request.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className={buttonClasses({ variant: "primary", size: "lg" })} href="/properties">Browse properties</Link>
            <Link className={buttonClasses({ variant: "outline", size: "lg", className: "border-white/50 text-white hover:border-white hover:bg-white/10 hover:text-white" })} href="/contact">Contact RentNest</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
