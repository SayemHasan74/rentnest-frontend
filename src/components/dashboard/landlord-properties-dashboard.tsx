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
  PlusCircle,
  Power,
  PowerOff,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth-session";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/format";
import type {
  Category,
  PaymentStatus,
  Property,
  PropertyPayload,
  PropertyStatus,
  RentalRequest,
  RentalStatus,
  User,
} from "@/types/rentnest";

type AuthSnapshot = {
  token: string | null;
  user: User | null;
};

type PropertyFormValues = {
  title: string;
  description: string;
  location: string;
  address: string;
  rentAmount: string;
  bedrooms: string;
  bathrooms: string;
  areaSqFt: string;
  categoryId: string;
  amenities: string;
  images: string;
};

type PropertyFormErrors = Partial<Record<keyof PropertyFormValues, string>>;

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

const getDefaultPropertyFormValues = (): PropertyFormValues => ({
  title: "",
  description: "",
  location: "",
  address: "",
  rentAmount: "",
  bedrooms: "1",
  bathrooms: "1",
  areaSqFt: "",
  categoryId: "",
  amenities: "",
  images: "",
});

const splitListInput = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

function AddPropertyForm({
  categories,
  isSubmitting,
  onCreateProperty,
}: {
  categories: Category[];
  isSubmitting: boolean;
  onCreateProperty: (payload: PropertyPayload) => Promise<boolean>;
}) {
  const [values, setValues] = useState<PropertyFormValues>(
    getDefaultPropertyFormValues,
  );
  const [fieldErrors, setFieldErrors] = useState<PropertyFormErrors>({});

  const updateValue = (field: keyof PropertyFormValues, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  };

  const validate = () => {
    const errors: PropertyFormErrors = {};
    const rentAmount = Number(values.rentAmount);
    const bedrooms = Number(values.bedrooms);
    const bathrooms = Number(values.bathrooms);
    const areaSqFt = values.areaSqFt ? Number(values.areaSqFt) : undefined;
    const images = splitListInput(values.images);

    if (values.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters.";
    }

    if (values.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters.";
    }

    if (values.location.trim().length < 2) {
      errors.location = "Location is required.";
    }

    if (!Number.isFinite(rentAmount) || rentAmount <= 0) {
      errors.rentAmount = "Rent must be a positive number.";
    }

    if (!Number.isInteger(bedrooms) || bedrooms < 1 || bedrooms > 20) {
      errors.bedrooms = "Bedrooms must be 1 to 20.";
    }

    if (!Number.isInteger(bathrooms) || bathrooms < 1 || bathrooms > 20) {
      errors.bathrooms = "Bathrooms must be 1 to 20.";
    }

    if (areaSqFt !== undefined && (!Number.isInteger(areaSqFt) || areaSqFt < 1)) {
      errors.areaSqFt = "Area must be a positive whole number.";
    }

    if (!values.categoryId) {
      errors.categoryId = "Choose a category.";
    }

    const invalidImage = images.find((image) => {
      try {
        new URL(image);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidImage) {
      errors.images = "Every image must be a valid URL.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const created = await onCreateProperty({
      title: values.title.trim(),
      description: values.description.trim(),
      location: values.location.trim(),
      address: values.address.trim() || undefined,
      rentAmount: Number(values.rentAmount),
      bedrooms: Number(values.bedrooms),
      bathrooms: Number(values.bathrooms),
      areaSqFt: values.areaSqFt ? Number(values.areaSqFt) : undefined,
      amenities: splitListInput(values.amenities),
      images: splitListInput(values.images),
      status: "AVAILABLE",
      categoryId: values.categoryId,
    });

    if (created) {
      setValues(getDefaultPropertyFormValues());
      setFieldErrors({});
    }
  };

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="property-title">Title</Label>
          <Input
            id="property-title"
            onChange={(event) => updateValue("title", event.target.value)}
            placeholder="Modern apartment near Gulshan"
            value={values.title}
          />
          {fieldErrors.title ? (
            <p className="text-xs font-medium text-red-600">{fieldErrors.title}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="property-category">Category</Label>
          <select
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            disabled={categories.length === 0}
            id="property-category"
            onChange={(event) => updateValue("categoryId", event.target.value)}
            value={values.categoryId}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId ? (
            <p className="text-xs font-medium text-red-600">{fieldErrors.categoryId}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="property-location">Location</Label>
          <Input
            id="property-location"
            onChange={(event) => updateValue("location", event.target.value)}
            placeholder="Dhaka"
            value={values.location}
          />
          {fieldErrors.location ? (
            <p className="text-xs font-medium text-red-600">{fieldErrors.location}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="property-address">Address</Label>
          <Input
            id="property-address"
            onChange={(event) => updateValue("address", event.target.value)}
            placeholder="House 12, Road 5"
            value={values.address}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="property-rent">Monthly rent</Label>
          <Input
            id="property-rent"
            min="1"
            onChange={(event) => updateValue("rentAmount", event.target.value)}
            placeholder="45000"
            type="number"
            value={values.rentAmount}
          />
          {fieldErrors.rentAmount ? (
            <p className="text-xs font-medium text-red-600">{fieldErrors.rentAmount}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="property-bedrooms">Beds</Label>
            <Input
              id="property-bedrooms"
              max="20"
              min="1"
              onChange={(event) => updateValue("bedrooms", event.target.value)}
              type="number"
              value={values.bedrooms}
            />
            {fieldErrors.bedrooms ? (
              <p className="text-xs font-medium text-red-600">{fieldErrors.bedrooms}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="property-bathrooms">Baths</Label>
            <Input
              id="property-bathrooms"
              max="20"
              min="1"
              onChange={(event) => updateValue("bathrooms", event.target.value)}
              type="number"
              value={values.bathrooms}
            />
            {fieldErrors.bathrooms ? (
              <p className="text-xs font-medium text-red-600">{fieldErrors.bathrooms}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="property-area">Sqft</Label>
            <Input
              id="property-area"
              min="1"
              onChange={(event) => updateValue("areaSqFt", event.target.value)}
              type="number"
              value={values.areaSqFt}
            />
            {fieldErrors.areaSqFt ? (
              <p className="text-xs font-medium text-red-600">{fieldErrors.areaSqFt}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="property-description">Description</Label>
        <Textarea
          id="property-description"
          maxLength={2000}
          onChange={(event) => updateValue("description", event.target.value)}
          placeholder="Describe the rental property, nearby transport, building features, and tenant requirements."
          value={values.description}
        />
        {fieldErrors.description ? (
          <p className="text-xs font-medium text-red-600">{fieldErrors.description}</p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="property-amenities">Amenities</Label>
          <Textarea
            id="property-amenities"
            onChange={(event) => updateValue("amenities", event.target.value)}
            placeholder="Parking, WiFi, Elevator"
            value={values.amenities}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="property-images">Image URLs</Label>
          <Textarea
            id="property-images"
            onChange={(event) => updateValue("images", event.target.value)}
            placeholder="https://images.unsplash.com/..."
            value={values.images}
          />
          {fieldErrors.images ? (
            <p className="text-xs font-medium text-red-600">{fieldErrors.images}</p>
          ) : null}
        </div>
      </div>

      <Button className="w-full sm:w-fit" disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <Loader2 className="animate-spin" size={16} aria-hidden="true" />
        ) : (
          <PlusCircle size={16} aria-hidden="true" />
        )}
        Add property
      </Button>
    </form>
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);
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
        const [propertyData, requestData, categoryData] = await Promise.all([
          api.landlord.properties(token),
          api.landlord.requests(token),
          api.categories.list(),
        ]);

        if (isActive) {
          setProperties(propertyData);
          setRequests(requestData);
          setCategories(categoryData);
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
    setActionMessage("");

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

  const handleCreateProperty = async (payload: PropertyPayload) => {
    if (!token) {
      setActionError("Please login as a landlord before adding properties.");
      return false;
    }

    setIsCreatingProperty(true);
    setActionError("");
    setActionMessage("");

    try {
      const createdProperty = await api.landlord.createProperty(token, payload);

      setProperties((currentProperties) => [createdProperty, ...currentProperties]);
      setActionMessage("Property added successfully.");
      return true;
    } catch (createError) {
      setActionError(getErrorMessage(createError));
      return false;
    } finally {
      setIsCreatingProperty(false);
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
    setActionMessage("");

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
    setActionMessage("");

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
    setActionMessage("");

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
            <CardTitle>Add property</CardTitle>
          </CardHeader>
          <CardContent>
            {!isLoading && actionError ? (
              <div className="mb-4 flex gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <p>{actionError}</p>
              </div>
            ) : null}

            {!isLoading && actionMessage ? (
              <div className="mb-4 flex gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <p>{actionMessage}</p>
              </div>
            ) : null}

            <AddPropertyForm
              categories={categories}
              isSubmitting={isCreatingProperty}
              onCreateProperty={handleCreateProperty}
            />
          </CardContent>
        </Card>

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
