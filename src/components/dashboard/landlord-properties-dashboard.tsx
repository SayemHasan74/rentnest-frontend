"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Eye,
  Loader2,
  MapPin,
  Power,
  PowerOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth-session";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/format";
import type { Property, PropertyStatus, User } from "@/types/rentnest";

type AuthSnapshot = {
  token: string | null;
  user: User | null;
};

const propertyStatusTone: Record<PropertyStatus, "emerald" | "slate"> = {
  AVAILABLE: "emerald",
  UNAVAILABLE: "slate",
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

export function LandlordPropertiesDashboard() {
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthStorage,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const { token, user } = JSON.parse(authSnapshot) as AuthSnapshot;
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingPropertyId, setUpdatingPropertyId] = useState<string | null>(null);

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
        const data = await api.landlord.properties(token);

        if (isActive) {
          setProperties(data);
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

  const stats = useMemo(() => {
    const available = visibleProperties.filter(
      (property) => property.status === "AVAILABLE",
    ).length;
    const unavailable = visibleProperties.length - available;
    const requests = visibleProperties.reduce(
      (total, property) => total + (property._count?.rentalRequests ?? 0),
      0,
    );

    return [
      { label: "Total listings", value: visibleProperties.length },
      { label: "Available", value: available },
      { label: "Unavailable", value: unavailable },
      { label: "Rental requests", value: requests },
    ];
  }, [visibleProperties]);

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
      </section>
    </main>
  );
}
