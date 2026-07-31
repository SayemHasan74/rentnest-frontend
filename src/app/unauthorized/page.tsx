import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Unauthorized | RentNest",
  description: "You do not have permission to access this RentNest page.",
};

export default function UnauthorizedPage() {
  return (
    <main className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-red-700">
          <ShieldAlert size={24} aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
          You cannot access this page
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          RentNest dashboards are role-specific. Login with the correct tenant,
          landlord, or admin account to continue.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className={buttonClasses()} href="/auth/login">
            Login again
          </Link>
          <Link className={buttonClasses({ variant: "outline" })} href="/">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
