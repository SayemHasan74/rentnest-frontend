"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Home,
  Loader2,
  MapPin,
  ReceiptText,
  Star,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardContentSkeleton } from "@/components/ui/dashboard-content-skeleton";
import { Label, Textarea } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth-session";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/format";
import { getDashboardCache, setDashboardCache } from "@/lib/dashboard-cache";
import type { Payment, PaymentStatus, RentalRequest, RentalStatus, Review, User } from "@/types/rentnest";

type AuthSnapshot = {
  token: string | null;
  user: User | null;
};

type TenantDashboardCache = {
  requests: RentalRequest[];
  payments: Payment[];
};

const statusTone: Record<RentalStatus, "slate" | "emerald" | "blue" | "amber" | "red" | "purple"> = {
  PENDING: "amber",
  APPROVED: "blue",
  REJECTED: "red",
  ACTIVE: "emerald",
  COMPLETED: "slate",
  CANCELLED: "slate",
};

const statusIcon = {
  PENDING: Clock3,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  ACTIVE: Home,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
} satisfies Record<RentalStatus, typeof Clock3>;

const paymentTone: Record<PaymentStatus, "slate" | "emerald" | "blue" | "amber" | "red"> = {
  PENDING: "amber",
  COMPLETED: "emerald",
  FAILED: "red",
  CANCELLED: "slate",
  REFUNDED: "blue",
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

const formatDate = (value: string | null) => {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
  }).format(new Date(value));
};

const getRequestTotal = (request: RentalRequest) => {
  const monthlyRent = Number(request.property?.rentAmount ?? 0);

  return monthlyRent * request.rentalMonths;
};

function RequestStatusBadge({ status }: { status: RentalStatus }) {
  const Icon = statusIcon[status];

  return (
    <Badge className="gap-1.5" tone={statusTone[status]}>
      <Icon size={14} aria-hidden="true" />
      {status}
    </Badge>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge className="gap-1.5" tone={paymentTone[status]}>
      <ReceiptText size={14} aria-hidden="true" />
      {status}
    </Badge>
  );
}

function RentalRequestItem({
  onReviewCreated,
  payments,
  request,
  token,
}: {
  onReviewCreated: (requestId: string, review: Review) => void;
  payments: Payment[];
  request: RentalRequest;
  token: string | null;
}) {
  const completedPayment = payments.find((payment) => payment.status === "COMPLETED");
  const latestPayment = payments[0];
  const canPay = request.status === "APPROVED" && !completedPayment;

  return (
    <article className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <RequestStatusBadge status={request.status} />
            {latestPayment ? <PaymentBadge status={latestPayment.status} /> : null}
            <span className="text-xs font-medium text-slate-500">
              Requested {formatDate(request.createdAt)}
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950">
            {request.property?.title ?? "Rental property"}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={15} aria-hidden="true" />
            {request.property?.location ?? "Location unavailable"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {request.property?.id ? (
            <Link
              className={buttonClasses({ variant: "outline", size: "sm" })}
              href={`/properties/${request.property.id}`}
            >
              View property
            </Link>
          ) : null}
          {canPay ? (
            <Link
              className={buttonClasses({ size: "sm" })}
              href={`/dashboard/tenant/requests/${request.id}/pay`}
            >
              <CreditCard size={15} aria-hidden="true" />
              Pay now
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Move-in</p>
          <p className="mt-1 font-semibold text-slate-950">
            {formatDate(request.moveInDate)}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Duration</p>
          <p className="mt-1 font-semibold text-slate-950">
            {request.rentalMonths} months
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">
            Monthly rent
          </p>
          <p className="mt-1 font-semibold text-slate-950">
            {formatCurrency(request.property?.rentAmount ?? 0)}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">
            Estimated total
          </p>
          <p className="mt-1 font-semibold text-slate-950">
            {formatCurrency(getRequestTotal(request))}
          </p>
        </div>
      </div>

      {request.message ? (
        <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
          {request.message}
        </p>
      ) : null}

      {request.rejectionReason ? (
        <div className="mt-4 flex gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
          <p>{request.rejectionReason}</p>
        </div>
      ) : null}

      {completedPayment ? (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 size={16} aria-hidden="true" />
          Paid {formatCurrency(completedPayment.amount)} on {formatDate(completedPayment.paidAt)}
        </div>
      ) : null}

      {canPay ? (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          <ExternalLink size={16} aria-hidden="true" />
          Approved for payment. Pay now opens secure Stripe checkout.
        </div>
      ) : null}

      {request.status === "PENDING" ? (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <CalendarClock size={16} aria-hidden="true" />
          Waiting for landlord approval before payment.
        </div>
      ) : null}

      {request.status === "COMPLETED" ? (
        <ReviewPanel
          onReviewCreated={onReviewCreated}
          request={request}
          token={token}
        />
      ) : null}
    </article>
  );
}

function ReviewPanel({
  onReviewCreated,
  request,
  token,
}: {
  onReviewCreated: (requestId: string, review: Review) => void;
  request: RentalRequest;
  token: string | null;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Please login as a tenant before submitting a review.");
      return;
    }

    if (!request.property?.id) {
      setError("Property details are missing for this rental request.");
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const review = await api.reviews.create(token, {
        rentalRequestId: request.id,
        propertyId: request.property.id,
        rating,
        comment: comment.trim() || undefined,
      });

      onReviewCreated(request.id, review);
      setComment("");
    } catch (reviewError) {
      setError(getErrorMessage(reviewError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (request.review) {
    return (
      <div className="mt-4 rounded-md border border-purple-200 bg-purple-50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="gap-1.5" tone="purple">
            <Star size={14} fill="currentColor" aria-hidden="true" />
            Reviewed {request.review.rating}/5
          </Badge>
          <span className="text-xs font-medium text-purple-700">
            {formatDate(request.review.createdAt)}
          </span>
        </div>
        {request.review.comment ? (
          <p className="mt-3 text-sm leading-6 text-purple-800">
            {request.review.comment}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      className="mt-4 grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Leave a review</h3>
          <p className="mt-1 text-sm text-slate-600">
            Completed rentals can be reviewed once.
          </p>
        </div>
        <div className="flex gap-1" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              aria-label={`${value} star rating`}
              className="rounded-md p-1 text-amber-500 hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700"
              key={value}
              onClick={() => setRating(value)}
              type="button"
            >
              <Star
                size={22}
                fill={value <= rating ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor={`review-${request.id}`}>Review comment</Label>
        <Textarea
          id={`review-${request.id}`}
          maxLength={1000}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share your experience with this rental."
          value={comment}
        />
      </div>

      <Button className="w-full sm:w-fit" disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : null}
        Submit review
      </Button>
    </form>
  );
}

export function TenantRentalsDashboard() {
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthStorage,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const { token, user } = JSON.parse(authSnapshot) as AuthSnapshot;
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState("");
  const [refreshError, setRefreshError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const cacheKey = user ? `tenant:${user.id}` : null;

  useEffect(() => {
    let isActive = true;

    if (!token || !cacheKey) {
      return () => {
        isActive = false;
      };
    }
    const dashboardCacheKey = cacheKey ?? "";

    const loadRequests = async () => {
      const cached = getDashboardCache<TenantDashboardCache>(dashboardCacheKey);

      if (cached) {
        setRequests(cached.requests);
        setPayments(cached.payments);
      }

      setIsLoading(!cached);
      setError("");
      setRefreshError("");

      try {
        const [rentalData, paymentData] = await Promise.all([
          api.rentals.listMine(token),
          api.payments.listMine(token),
        ]);

        if (isActive) {
          setRequests(rentalData);
          setPayments(paymentData);
          setDashboardCache(dashboardCacheKey, {
            requests: rentalData,
            payments: paymentData,
          });
        }
      } catch (fetchError) {
        if (isActive) {
          const message = getErrorMessage(fetchError);
          if (cached) {
            setRefreshError(`${message} Showing saved dashboard data.`);
          } else {
            setError(message);
          }
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadRequests();

    return () => {
      isActive = false;
    };
  }, [cacheKey, token]);

  const visibleRequests = useMemo(() => (token ? requests : []), [requests, token]);
  const visiblePayments = useMemo(() => (token ? payments : []), [payments, token]);
  const paymentsByRequestId = useMemo(() => {
    const grouped = new Map<string, Payment[]>();

    visiblePayments.forEach((payment) => {
      const existing = grouped.get(payment.rentalRequestId) ?? [];

      grouped.set(payment.rentalRequestId, [...existing, payment]);
    });

    return grouped;
  }, [visiblePayments]);

  const stats = useMemo(() => {
    const pending = visibleRequests.filter((request) => request.status === "PENDING").length;
    const approved = visibleRequests.filter((request) => request.status === "APPROVED").length;
    const active = visibleRequests.filter((request) => request.status === "ACTIVE").length;
    const paid = visiblePayments.filter((payment) => payment.status === "COMPLETED").length;

    return [
      { label: "Total requests", value: visibleRequests.length },
      { label: "Pending", value: pending },
      { label: "Approved", value: approved },
      { label: "Paid rentals", value: active + paid },
    ];
  }, [visiblePayments, visibleRequests]);

  const handleReviewCreated = (requestId: string, review: Review) => {
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId ? { ...request, review } : request,
      ),
    );
  };

  return (
    <main className="bg-slate-50">
      <Toast message={refreshError} tone="error" />
      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <p className="text-xs font-semibold uppercase text-slate-500">Tenant dashboard</p>
          <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">
                Rental requests
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Track properties you requested, approval decisions, rental dates,
                and payment readiness.
              </p>
            </div>
            {user ? (
              <div className="border-l border-slate-300 px-4 py-2 text-sm">
                <p className="font-semibold text-slate-950">{user.name}</p>
                <p className="text-slate-600">{user.email}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[90rem] gap-6 px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <Card key={item.label}>
              <CardContent>
                <p className="text-sm font-medium text-slate-600">{item.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My rental requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <DashboardContentSkeleton label="Loading rental requests" />
            ) : null}

            {!isLoading && error ? (
              <div className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <p>{error}</p>
              </div>
            ) : null}

            {!isLoading && !error && visibleRequests.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Home className="mx-auto text-slate-400" size={34} aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                  No requests yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Browse available properties and submit a request from a property
                  detail page.
                </p>
                <Link
                  className={buttonClasses({ className: "mt-5" })}
                  href="/properties"
                >
                  Browse properties
                </Link>
              </div>
            ) : null}

            {!isLoading && !error && visibleRequests.length > 0 ? (
              <div className="grid gap-4">
                {visibleRequests.map((request) => (
                  <RentalRequestItem
                    key={request.id}
                    onReviewCreated={handleReviewCreated}
                    payments={paymentsByRequestId.get(request.id) ?? []}
                    request={request}
                    token={token}
                  />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment history</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <DashboardContentSkeleton label="Loading payments" />
            ) : null}

            {!isLoading && !error && visiblePayments.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <ReceiptText className="mx-auto text-slate-400" size={34} aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                  No payments yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Approved rental payments will appear here after checkout starts.
                </p>
              </div>
            ) : null}

            {!isLoading && !error && visiblePayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem] text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-3 pr-4 font-semibold">Property</th>
                      <th className="py-3 pr-4 font-semibold">Amount</th>
                      <th className="py-3 pr-4 font-semibold">Provider</th>
                      <th className="py-3 pr-4 font-semibold">Status</th>
                      <th className="py-3 pr-4 font-semibold">Paid at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {visiblePayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="py-3 pr-4 font-medium text-slate-950">
                          {payment.rentalRequest?.property.title ?? "Rental property"}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">{payment.provider}</td>
                        <td className="py-3 pr-4">
                          <PaymentBadge status={payment.status} />
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {formatDate(payment.paidAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
