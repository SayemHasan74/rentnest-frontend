"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Home,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth-session";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/format";
import type { RentalRequest, RentalStatus, User } from "@/types/rentnest";

type AuthSnapshot = {
  token: string | null;
  user: User | null;
};

const statusTone: Record<RentalStatus, "slate" | "emerald" | "blue" | "amber" | "red" | "purple"> = {
  PENDING: "amber",
  APPROVED: "blue",
  REJECTED: "red",
  ACTIVE: "emerald",
  COMPLETED: "purple",
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

export function TenantRentalsDashboard() {
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthStorage,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const { token, user } = JSON.parse(authSnapshot) as AuthSnapshot;
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!token) {
      return () => {
        isActive = false;
      };
    }

    const loadRequests = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await api.rentals.listMine(token);

        if (isActive) {
          setRequests(data);
        }
      } catch (fetchError) {
        if (isActive) {
          setError(getErrorMessage(fetchError));
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
  }, [token]);

  const visibleRequests = useMemo(() => (token ? requests : []), [requests, token]);

  const stats = useMemo(() => {
    const pending = visibleRequests.filter((request) => request.status === "PENDING").length;
    const approved = visibleRequests.filter((request) => request.status === "APPROVED").length;
    const active = visibleRequests.filter((request) => request.status === "ACTIVE").length;

    return [
      { label: "Total requests", value: visibleRequests.length },
      { label: "Pending", value: pending },
      { label: "Approved", value: approved },
      { label: "Active rentals", value: active },
    ];
  }, [visibleRequests]);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-emerald-700">Tenant dashboard</p>
          <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Rental requests
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Track properties you requested, approval decisions, rental dates,
                and payment readiness.
              </p>
            </div>
            {user ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <p className="font-semibold text-slate-950">{user.name}</p>
                <p className="text-slate-600">{user.email}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
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
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-slate-600">
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                Loading rental requests
              </div>
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
                  <article
                    className="rounded-md border border-slate-200 p-4"
                    key={request.id}
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <RequestStatusBadge status={request.status} />
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
                      {request.property?.id ? (
                        <Link
                          className={buttonClasses({ variant: "outline", size: "sm" })}
                          href={`/properties/${request.property.id}`}
                        >
                          View property
                        </Link>
                      ) : null}
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
                        <p className="text-xs font-medium uppercase text-slate-500">
                          Move-in
                        </p>
                        <p className="mt-1 font-semibold text-slate-950">
                          {formatDate(request.moveInDate)}
                        </p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
                        <p className="text-xs font-medium uppercase text-slate-500">
                          Duration
                        </p>
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

                    {request.status === "APPROVED" ? (
                      <div className="mt-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                        <CalendarClock size={16} aria-hidden="true" />
                        Payment becomes available from the payment step.
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
