import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Help & Support | RentNest",
  description: "Find practical answers about using RentNest as a tenant or landlord.",
};

const questions = [
  ["How do I find a property?", "Use Browse properties to filter available listings by location, price, property type, and amenities."],
  ["How do I send a rental request?", "Create a tenant account, open a property you are interested in, and submit the rental request form from the property details page."],
  ["What happens after I send a request?", "The landlord can approve or reject it. You can follow the current status from your tenant dashboard."],
  ["Where can I manage a listing?", "Landlord accounts can add properties, update availability, and review incoming rental requests from the landlord dashboard."],
  ["Where is payment history?", "Tenant accounts can view completed and pending payment activity from the tenant dashboard."],
];

export default function HelpPage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-300 bg-surface">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Help & support</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">Simple guidance for every step of the rental journey.</h1>
        </div>
      </section>
      <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="divide-y divide-slate-300 rounded-md border border-slate-300 bg-surface">
          {questions.map(([question, answer]) => (
            <article className="p-6 sm:p-8" key={question}>
              <h2 className="text-lg font-semibold text-slate-950">{question}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{answer}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 rounded-md border border-emerald-700/25 bg-emerald-50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div><h2 className="text-xl font-semibold text-slate-950">Still need help?</h2><p className="mt-2 text-sm leading-6 text-slate-700">Send us a message and include the details we need to understand your question.</p></div>
          <Link className={buttonClasses({ size: "lg", className: "mt-5 shrink-0 sm:mt-0" })} href="/contact">Contact us <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}
