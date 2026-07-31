"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  AlertCircle,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Eye,
  Loader2,
  MapPin,
  Power,
  PowerOff,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth-session";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/format";
import type {
  PaymentStatus,
  Property,
  PropertyStatus,
  RentalRequest,
  RentalStatus,
  User,
} from "@/types/rentnest";

type AuthSnapshot = {
  token: string | null;
  user: User | null;
};

const propertyStatusTone: Record<PropertyStatus, "emerald" | "slate"> = {
  AVAILABLE: "emerald",
  UNAVAILABLE: "slate",
};

const rentalStatusTone: Record<RentalStatus, "slate" | "emerald" | "blue" | "amber" | "red" | "purple"> = {
  PENDING: "amber",
  APPROVED: "blue",
  REJECTED: "red",
  ACTIVE: "emerald",
  COMPLETED: "purple",
  CANCELLED: "slate",
};

const paymentStatusTone: Record<PaymentStatus, "slate" | "emerald" | "blue" | "amber" | "red"> = {
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

function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const isAvailable = status === "AVAILABLE";
  const Icon = isAvailable ? CheckCircle2 : PowerOff;

  return (
    <Badge className="gap-1.5" tone={propertyStatusTone[status]}>
      <Icon size={14} aria-hidden="true" />
      {status}
    </Badge>
  );
}

function LandlordPropertyCard({
  onToggleAvailability,
  property,
  updatingPropertyId,
}: {
  onToggleAvailability: (property: Property) => void;
  property: Property;
  updatingPropertyId: string | null;
}) {
  const nextStatus: PropertyStatus =
    property.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
  const isUpdating = updatingPropertyId === property.id;

  return (
    <article className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <PropertyStatusBadge status={property.status} />
            <Badge tone="blue">{property.category?.name ?? "Rental"}</Badge>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950">
            {property.title}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={15} aria-hidden="true" />
            {property.address || property.location}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className={buttonClasses({ variant: "outline", size: "sm" })}
            href={`/properties/${property.id}`}
          >
            <Eye size={15} aria-hidden="true" />
            View
          </Link>
          <Button
            disabled={isUpdating}
            onClick={() => onToggleAvailability(property)}
            size="sm"
            type="button"
            variant={nextStatus === "AVAILABLE" ? "primary" : "secondary"}
          >
            {isUpdating ? (
              <Loader2 className="animate-spin" size={15} aria-hidden="true" />
            ) : nextStatus === "AVAILABLE" ? (
              <Power size={15} aria-hidden="true" />
            ) : (
              <PowerOff size={15} aria-hidden="true" />
            )}
            Mark {nextStatus.toLowerCase()}
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Rent</p>
          <p className="mt-1 font-semibold text-slate-950">
            {formatCurrency(property.rentAmount)}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Bedrooms</p>
          <p className="mt-1 font-semibold text-slate-950">{property.bedrooms}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Bathrooms</p>
          <p className="mt-1 font-semibold text-slate-950">{property.bathrooms}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Requests</p>
          <p className="mt-1 font-semibold text-slate-950">
            {property._count?.rentalRequests ?? 0}
          </p>
        </div>
      </div>

      {property.amenities.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {property.amenities.slice(0, 5).map((amenity) => (
            <span
              className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
              key={amenity}
            >
              {amenity}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

const formatDate = (value: string | null) => {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
  }).format(new Date(value));
};

const getRequestTotal = (request: RentalRequest) =>
  Number(request.property?.rentAmount ?? 0) * request.rentalMonths;

function RentalStatusBadge({ status }: { status: RentalStatus }) {
  return <Badge tone={rentalStatusTone[status]}>{status}</Badge>;
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={paymentStatusTone[status]}>{status}</Badge>;
}

function LandlordRequestCard({
  completingRequestId,
  onApprove,
  onComplete,
  onReject,
  request,
  updatingRequestId,
}: {
  completingRequestId: string | null;
  onApprove: (requestId: string) => void;
  onComplete: (requestId: string) => void;
  onReject: (requestId: string, rejectionReason: string) => void;
  request: RentalRequest;
  updatingRequestId: string | null;
}) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [fieldError, setFieldError] = useState("");
  const latestPayment = request.payments?.[0];
  const hasCompletedPayment = request.payments?.some(
    (payment) => payment.status === "COMPLETED",
  );
  const canReviewDecision = request.status === "PENDING";
  const canComplete = request.status === "ACTIVE" && Boolean(hasCompletedPayment);
  const isUpdating = updatingRequestId === request.id;
  const isCompleting = completingRequestId === request.id;

  const handleReject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!rejectionReason.trim()) {
      setFieldError("Rejection reason is required.");
      return;
    }

    setFieldError("");
    onReject(request.id, rejectionReason.trim());
  };

  return (
    <article className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <RentalStatusBadge status={request.status} />
            {latestPayment ? <PaymentStatusBadge status={latestPayment.status} /> : null}
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
            <Eye size={15} aria-hidden="true" />
            View property
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Tenant</p>
          <p className="mt-1 font-semibold text-slate-950">
            {request.tenant?.name ?? "Tenant"}
          </p>
          <p className="mt-1 text-xs text-slate-500">{request.tenant?.email}</p>
        </div>
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
          <p className="text-xs font-medium uppercase text-slate-500">Total</p>
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

      {canReviewDecision ? (
        <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4">
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isUpdating}
              onClick={() => onApprove(request.id)}
              size="sm"
              type="button"
            >
              {isUpdating ? (
                <Loader2 className="animate-spin" size={15} aria-hidden="true" />
              ) : (
                <CheckCircle2 size={15} aria-hidden="true" />
              )}
              Approve
            </Button>
          </div>
          <form className="grid gap-3" onSubmit={handleReject}>
            <div className="grid gap-2">
              <Label htmlFor={`rejection-${request.id}`}>Rejection reason</Label>
              <Textarea
                id={`rejection-${request.id}`}
                maxLength={500}
                onChange={(event) => {
                  setRejectionReason(event.target.value);
                  setFieldError("");
                }}
                placeholder="Required if you reject this request."
                value={rejectionReason}
              />
              {fieldError ? (
                <p className="text-xs font-medium text-red-600">{fieldError}</p>
              ) : null}
            </div>
            <Button
              className="w-full sm:w-fit"
              disabled={isUpdating}
              size="sm"
              type="submit"
              variant="outline"
            >
              {isUpdating ? (
                <Loader2 className="animate-spin" size={15} aria-hidden="true" />
              ) : (
                <XCircle size={15} aria-hidden="true" />
              )}
              Reject
            </Button>
          </form>
        </div>
      ) : null}

      {canComplete ? (
        <div className="mt-4 flex flex-col gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} aria-hidden="true" />
            Paid active rental is ready to complete.
          </span>
          <Button
            disabled={isCompleting}
            onClick={() => onComplete(request.id)}
            size="sm"
            type="button"
          >
            {isCompleting ? (
              <Loader2 className="animate-spin" size={15} aria-hidden="true" />
            ) : (
              <CheckCircle2 size={15} aria-hidden="true" />
            )}
            Mark completed
          </Button>
        </div>
      ) : null}

      {request.status === "APPROVED" ? (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          <CalendarClock size={16} aria-hidden="true" />
          Waiting for tenant payment.
        </div>
      ) : null}
    </article>
  );
}

export function LandlordPropertiesDashboard() {
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthStorage,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const { token, user } = JSON.parse(authSnapshot) as AuthSnapshot;
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingPropertyId, setUpdatingPropertyId] = useState<string | null>(null);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [completingRequestId, setCompletingRequestId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!token) {
      return () => {
        isActive = false;
      };
    }

    const loadProperties = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [propertyData, requestData] = await Promise.all([
          api.landlord.properties(token),
          api.landlord.requests(token),
        ]);

        if (isActive) {
          setProperties(propertyData);
          setRequests(requestData);
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

    loadProperties();

    return () => {
      isActive = false;
    };
  }, [token]);

  const visibleProperties = useMemo(
    () => (token ? properties : []),
    [properties, token],
  );
  const visibleRequests = useMemo(
    () => (token ? requests : []),
    [requests, token],
  );

  const stats = useMemo(() => {
    const available = visibleProperties.filter(
      (property) => property.status === "AVAILABLE",
    ).length;
    const unavailable = visibleProperties.length - available;
    const pendingRequests = visibleRequests.filter(
      (request) => request.status === "PENDING",
    ).length;

    return [
      { label: "Total listings", value: visibleProperties.length },
      { label: "Available", value: available },
      { label: "Unavailable", value: unavailable },
      { label: "Pending requests", value: pendingRequests },
    ];
  }, [visibleProperties, visibleRequests]);

  const handleToggleAvailability = async (property: Property) => {
    if (!token) {
      setActionError("Please login as a landlord before updating properties.");
      return;
    }

    const nextStatus: PropertyStatus =
      property.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";

    setUpdatingPropertyId(property.id);
    setActionError("");

    try {
      const updatedProperty = await api.landlord.updateAvailability(
        token,
        property.id,
        nextStatus,
      );

      setProperties((currentProperties) =>
        currentProperties.map((currentProperty) =>
          currentProperty.id === property.id ? updatedProperty : currentProperty,
        ),
      );
    } catch (updateError) {
      setActionError(getErrorMessage(updateError));
    } finally {
      setUpdatingPropertyId(null);
    }
  };

  const replaceRequest = (updatedRequest: RentalRequest) => {
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === updatedRequest.id ? updatedRequest : request,
      ),
    );
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!token) {
      setActionError("Please login as a landlord before updating requests.");
      return;
    }

    setUpdatingRequestId(requestId);
    setActionError("");

    try {
      const updatedRequest = await api.landlord.updateRequest(token, requestId, {
        status: "APPROVED",
      });

      replaceRequest(updatedRequest);
    } catch (updateError) {
      setActionError(getErrorMessage(updateError));
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId: string, rejectionReason: string) => {
    if (!token) {
      setActionError("Please login as a landlord before updating requests.");
      return;
    }

    setUpdatingRequestId(requestId);
    setActionError("");

    try {
      const updatedRequest = await api.landlord.updateRequest(token, requestId, {
        status: "REJECTED",
        rejectionReason,
      });

      replaceRequest(updatedRequest);
    } catch (updateError) {
      setActionError(getErrorMessage(updateError));
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleCompleteRequest = async (requestId: string) => {
    if (!token) {
      setActionError("Please login as a landlord before completing requests.");
      return;
    }

    setCompletingRequestId(requestId);
    setActionError("");

    try {
      const updatedRequest = await api.landlord.completeRequest(token, requestId);

      replaceRequest(updatedRequest);
    } catch (completeError) {
      setActionError(getErrorMessage(completeError));
    } finally {
      setCompletingRequestId(null);
    }
  };

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-emerald-700">
            Landlord dashboard
          </p>
          <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Property listings
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Manage your rental inventory and control whether each property is
                visible as available to tenants.
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
            <CardTitle>My properties</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-slate-600">
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                Loading properties
              </div>
            ) : null}

            {!isLoading && error ? (
              <div className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <p>{error}</p>
              </div>
            ) : null}

            {!isLoading && !error && actionError ? (
              <div className="mb-4 flex gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <p>{actionError}</p>
              </div>
            ) : null}

            {!isLoading && !error && visibleProperties.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Building2 className="mx-auto text-slate-400" size={34} aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                  No listings yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Add-property tools are coming in the next landlord step. Existing
                  listings from your backend account will appear here.
                </p>
              </div>
            ) : null}

            {!isLoading && !error && visibleProperties.length > 0 ? (
              <div className="grid gap-4">
                {visibleProperties.map((property) => (
                  <LandlordPropertyCard
                    key={property.id}
                    onToggleAvailability={handleToggleAvailability}
                    property={property}
                    updatingPropertyId={updatingPropertyId}
                  />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rental requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-slate-600">
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                Loading rental requests
              </div>
            ) : null}

            {!isLoading && !error && visibleRequests.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <ClipboardList className="mx-auto text-slate-400" size={34} aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                  No rental requests
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Tenant requests for your properties will appear here.
                </p>
              </div>
            ) : null}

            {!isLoading && !error && visibleRequests.length > 0 ? (
              <div className="grid gap-4">
                {visibleRequests.map((request) => (
                  <LandlordRequestCard
                    completingRequestId={completingRequestId}
                    key={request.id}
                    onApprove={handleApproveRequest}
                    onComplete={handleCompleteRequest}
                    onReject={handleRejectRequest}
                    request={request}
                    updatingRequestId={updatingRequestId}
                  />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
