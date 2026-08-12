import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | RentNest",
  description: "How RentNest collects, uses, and protects account and rental data.",
};

const sections = [
  {
    title: "Information we collect",
    text: "RentNest stores the profile details you submit, such as your name, email address, role, phone number, and address. We also store property listings, rental requests, payment records, and reviews created through the service. If you use Google or Facebook login, we receive the provider account identifier and the basic profile information you approve, such as your name, email address, and profile image.",
  },
  {
    title: "How information is used",
    text: "We use this information to authenticate accounts, show the correct tenant, landlord, or administrator workspace, operate rental requests and payments, prevent unauthorized access, and provide support. RentNest does not sell personal information.",
  },
  {
    title: "Storage and sharing",
    text: "Account and marketplace data is stored in the RentNest database and is only shared with service providers needed to operate the application, including hosting, database, authentication, and payment providers. Payment card details are handled by Stripe and are not stored by RentNest.",
  },
  {
    title: "Retention and your choices",
    text: "We retain information while an account is active and as needed to preserve rental and payment records. You may ask us to correct or delete your account data. Some transaction records may be retained when required for security, legal, or accounting purposes.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-300 bg-surface">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:py-20">
          <ShieldCheck className="text-emerald-700" size={30} aria-hidden="true" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Privacy policy</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">Your information, explained clearly.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">Effective August 12, 2026. This policy applies to the RentNest website and its tenant, landlord, and administrator services.</p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-14 sm:px-6 lg:py-20">
        {sections.map((section) => (
          <article className="border-t border-slate-950 pt-6" key={section.title}>
            <h2 className="text-2xl font-semibold text-slate-950">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{section.text}</p>
          </article>
        ))}

        <article className="rounded-md bg-black p-6 text-white sm:p-8">
          <h2 className="text-2xl font-semibold">Privacy questions</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">Contact the RentNest maintainer for privacy requests. Never send a password or payment card number by email.</p>
          <a className="mt-5 inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-semibold" href="mailto:sayemhasan4700@gmail.com?subject=RentNest%20privacy%20request">
            <Mail size={16} aria-hidden="true" />
            sayemhasan4700@gmail.com
          </a>
          <p className="mt-5 text-sm text-white/65">To remove your account, follow the <Link className="font-semibold text-white underline" href="/data-deletion">data deletion instructions</Link>.</p>
        </article>
      </section>
    </main>
  );
}
