import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact RentNest | RentNest",
  description: "Contact RentNest for help with browsing properties, rental requests, or your account.",
};

export default function ContactPage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-300 bg-surface">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Contact</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">How can we help?</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">Send a message for help with property browsing, rental requests, accounts, or a question about RentNest.</p>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-[90rem] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-10 lg:py-20">
        <aside className="h-fit rounded-md bg-black p-6 text-white sm:p-8">
          <h2 className="text-xl font-semibold">Other ways to reach us</h2>
          <a className="mt-6 flex items-start gap-3 text-sm text-white/75 hover:text-white" href="mailto:sayemhasan4700@gmail.com">
            <Mail className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
            <span>sayemhasan4700@gmail.com</span>
          </a>
          <p className="mt-5 flex items-start gap-3 text-sm leading-6 text-white/75"><MapPin className="mt-0.5 shrink-0" size={18} aria-hidden="true" />Badda, Dhaka</p>
          <p className="mt-8 border-t border-white/20 pt-6 text-sm leading-6 text-white/60">For privacy, do not include passwords, payment card details, or other sensitive information in your message.</p>
        </aside>
        <div className="rounded-md border border-slate-300 bg-surface p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Send a message</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">All fields are required. We will use your email only to respond to this enquiry.</p>
          <div className="mt-7"><ContactForm /></div>
        </div>
      </section>
    </main>
  );
}
