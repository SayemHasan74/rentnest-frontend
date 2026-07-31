"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function PaymentResult({ status }: { status: "success" | "cancel" }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const isSuccess = status === "success";
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <main className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Icon
          className={isSuccess ? "mx-auto text-emerald-700" : "mx-auto text-red-600"}
          size={42}
          aria-hidden="true"
        />
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
          {isSuccess ? "Payment processing" : "Payment cancelled"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {isSuccess
            ? "Stripe returned successfully. Your dashboard will show the latest payment status after backend verification."
            : "The checkout was cancelled. You can restart payment from your tenant dashboard."}
        </p>
        {sessionId ? (
          <p className="mt-4 rounded-md bg-slate-50 p-3 font-mono text-xs text-slate-600 ring-1 ring-slate-200">
            {sessionId}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link className={buttonClasses()} href="/dashboard/tenant">
            Tenant dashboard
          </Link>
          <Link className={buttonClasses({ variant: "outline" })} href="/properties">
            Browse properties
          </Link>
        </div>
      </div>
    </main>
  );
}
