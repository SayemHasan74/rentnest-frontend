import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, Trash2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Data Deletion | RentNest",
  description: "Instructions for requesting deletion of a RentNest account and associated data.",
};

const steps = [
  "Email the address below from the email connected to your RentNest account.",
  "Use the subject “RentNest account deletion request” and include your account email and role.",
  "We will verify the request, remove or anonymize eligible account data, and confirm completion by email.",
];

export default function DataDeletionPage() {
  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-300 bg-surface">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:py-20">
          <Trash2 className="text-emerald-700" size={30} aria-hidden="true" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Data deletion</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">Request removal of your RentNest data.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">These instructions apply to password, Google, and Facebook accounts. Disconnecting RentNest in Google or Facebook does not by itself delete data already stored in RentNest.</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
        <ol className="grid gap-5">
          {steps.map((step, index) => (
            <li className="flex gap-4 rounded-md border border-slate-300 bg-surface p-5" key={step}>
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={21} aria-hidden="true" />
              <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {index + 1}</p><p className="mt-1 text-sm leading-6 text-slate-700">{step}</p></div>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-md bg-black p-6 text-white sm:p-8">
          <h2 className="text-2xl font-semibold">Send your request</h2>
          <a className="mt-5 inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-semibold" href="mailto:sayemhasan4700@gmail.com?subject=RentNest%20account%20deletion%20request">
            <Mail size={16} aria-hidden="true" />
            sayemhasan4700@gmail.com
          </a>
          <p className="mt-5 text-sm leading-6 text-white/65">Requests are normally processed within 30 days. Rental or payment records may be retained or anonymized when necessary for fraud prevention, legal obligations, or accounting. Read the full <Link className="font-semibold text-white underline" href="/privacy">privacy policy</Link>.</p>
        </div>
      </section>
    </main>
  );
}
