"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AlertCircle, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth-session";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/format";
import { storeCheckoutSessionId } from "@/lib/payment-session";
import type { RentalRequest, User } from "@/types/rentnest";

type AuthSnapshot = {
  token: string | null;
  user: User | null;
};

const subscribeToAuthStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);

  return () => window.removeEventListener("storage", callback);
};

const getAuthSnapshot = () =>
  JSON.stringify({
    token: getStoredToken(),
    user: getStoredUser(),
  });

const getServerAuthSnapshot = () =>
  JSON.stringify({
    token: null,
    user: null,
  });

export function TenantPayPanel({ rentalRequestId }: { rentalRequestId: string }) {
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthStorage,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const { token } = JSON.parse(authSnapshot) as AuthSnapshot;
  const [request, setRequest] = useState<RentalRequest | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!token) {
      return () => {
        isActive = false;
      };
    }

    const loadRequest = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await api.rentals.details(token, rentalRequestId);

        if (isActive) {
          setRequest(data);
        }
      } catch (loadError) {
        if (isActive) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadRequest();

    return () => {
      isActive = false;
    };
  }, [rentalRequestId, token]);

  const handlePayment = async () => {
    if (!token) {
      setError("Please login as a tenant before starting payment.");
      return;
    }

    setIsPaying(true);
    setError("");
    setMessage("");

    try {
      const checkout = await api.payments.create(token, { rentalRequestId });

      if (!checkout.checkoutSession.url) {
        setError("Stripe did not return a checkout URL.");
        return;
      }

      storeCheckoutSessionId(checkout.checkoutSession.id);
      setMessage("Redirecting to Stripe Checkout.");
      window.location.href = checkout.checkoutSession.url;
    } catch (paymentError) {
      setError(getErrorMessage(paymentError));
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <main className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <Toast message={message} tone="success" />
      <Toast message={error} tone="error" />
      <div className="mx-auto max-w-3xl">
        <Link
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          href="/dashboard/tenant"
        >
          Back to tenant dashboard
        </Link>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Proceed to payment</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-slate-600">
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                Loading rental request
              </div>
            ) : null}

            {!isLoading && !token ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Login as a tenant before starting payment.
              </div>
            ) : null}

            {!isLoading && request ? (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={request.status === "APPROVED" ? "blue" : "slate"}>
                    {request.status}
                  </Badge>
                  <Badge tone="emerald">
                    {formatCurrency(Number(request.property?.rentAmount ?? 0) * request.rentalMonths)}
                  </Badge>
                </div>
                <h1 className="mt-4 text-2xl font-bold text-slate-950">
                  {request.property?.title ?? "Rental property"}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Payment is available only after landlord approval.
                </p>
                <Button
                  className="mt-6"
                  disabled={isPaying || request.status !== "APPROVED"}
                  onClick={handlePayment}
                >
                  {isPaying ? (
                    <Loader2 className="animate-spin" size={16} aria-hidden="true" />
                  ) : (
                    <CreditCard size={16} aria-hidden="true" />
                  )}
                  Pay with Stripe
                </Button>
              </div>
            ) : null}

            {!isLoading && !request && error ? (
              <div className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <p>{error}</p>
              </div>
            ) : null}

            {!isLoading && request?.status === "ACTIVE" ? (
              <div className="mt-4 flex gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <p>This rental is already active.</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
