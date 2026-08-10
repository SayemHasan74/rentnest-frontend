"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { buttonClasses } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  getPaymentResultAction,
  AUTH_SESSION_EVENT,
  getStoredToken,
  getStoredUser,
} from "@/lib/auth-session";
import { getErrorMessage } from "@/lib/errors";
import {
  clearCheckoutSessionId,
  getCheckoutSessionId,
} from "@/lib/payment-session";
import type { User } from "@/types/rentnest";

type ResultState = "idle" | "verifying" | "confirmed" | "cancelled" | "error";

const subscribeToAuthSession = (callback: () => void) => {
  window.addEventListener(AUTH_SESSION_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
};

const getAuthUserSnapshot = () => JSON.stringify(getStoredUser());
const getServerAuthUserSnapshot = () => "null";

export function PaymentResult({ status }: { status: "success" | "cancel" }) {
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get("session_id");
  const isSuccess = status === "success";
  const hasStartedVerification = useRef(false);
  const [resultState, setResultState] = useState<ResultState>("idle");
  const [error, setError] = useState("");
  const userSnapshot = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthUserSnapshot,
    getServerAuthUserSnapshot,
  );
  const dashboardAction = getPaymentResultAction(
    JSON.parse(userSnapshot) as User | null,
  );

  useEffect(() => {
    if (hasStartedVerification.current) {
      return;
    }

    hasStartedVerification.current = true;
    const confirmResult = async () => {
      const providerSessionId = sessionIdFromUrl ?? getCheckoutSessionId();
      const token = getStoredToken();

      if (!providerSessionId || !token) {
        return;
      }

      setResultState("verifying");

      try {
        await api.payments.confirm(token, {
          providerSessionId,
          status: isSuccess ? "COMPLETED" : "CANCELLED",
        });
        clearCheckoutSessionId();
        if (sessionIdFromUrl) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        setResultState(isSuccess ? "confirmed" : "cancelled");
      } catch (confirmationError) {
        setError(getErrorMessage(confirmationError));
        setResultState("error");
      }
    };

    void confirmResult();
  }, [isSuccess, sessionIdFromUrl]);

  const isVerifying = resultState === "verifying";
  const isConfirmed = resultState === "confirmed";
  const hasError = resultState === "error";
  const Icon = isVerifying
    ? Loader2
    : hasError
      ? AlertCircle
      : isSuccess
        ? CheckCircle2
        : XCircle;
  const title = isVerifying
    ? isSuccess
      ? "Verifying payment"
      : "Cancelling payment"
    : hasError
      ? "Payment status delayed"
      : isConfirmed
        ? "Payment successful"
        : isSuccess
          ? "Payment processing"
          : "Payment cancelled";
  const description = isVerifying
    ? "Please wait while RentNest updates your payment status."
    : hasError
      ? `${error} Your Stripe payment remains protected; check the tenant dashboard before trying again.`
      : isConfirmed
        ? "Stripe payment was verified and your rental is now active."
        : isSuccess
          ? "Stripe returned successfully. Backend verification will update your dashboard shortly."
          : "The checkout was cancelled. You can restart payment from your tenant dashboard.";

  return (
    <main className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl border-y border-slate-950 bg-surface p-8 text-center">
        <Icon
          className={
            isVerifying
              ? "mx-auto animate-spin text-emerald-700"
              : hasError
                ? "mx-auto text-amber-600"
                : isSuccess
                  ? "mx-auto text-emerald-700"
                  : "mx-auto text-red-600"
          }
          size={42}
          aria-hidden="true"
        />
        <h1 className="mt-5 text-3xl font-semibold text-slate-950">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {description}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link className={buttonClasses()} href={dashboardAction.href}>
            {dashboardAction.label}
          </Link>
          <Link className={buttonClasses({ variant: "outline" })} href="/properties">
            Browse properties
          </Link>
        </div>
      </div>
    </main>
  );
}
