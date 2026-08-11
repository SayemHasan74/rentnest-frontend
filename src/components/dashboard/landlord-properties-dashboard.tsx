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
  Pencil,
  PlusCircle,
  Power,
  PowerOff,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { DashboardContentSkeleton } from "@/components/ui/dashboard-content-skeleton";
import { api } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth-session";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/format";
import { getDashboardCache, setDashboardCache } from "@/lib/dashboard-cache";
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

type LandlordDashboardCache = {
  properties: Property[];
  requests: RentalRequest[];
  categories: Category[];
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

type InventoryFilters = {
  search: string;
  status: "" | PropertyStatus;
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
  COMPLETED: "slate",
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

function LandlordPortfolioChart({
  properties,
  requests,
}: {
  properties: Property[];
  requests: RentalRequest[];
}) {
  const activity = [
    { label: "Available", value: properties.filter((property) => property.status === "AVAILABLE").length },
    { label: "Unavailable", value: properties.filter((property) => property.status === "UNAVAILABLE").length },
    { label: "Pending", value: requests.filter((request) => request.status === "PENDING").length },
    { label: "Active", value: requests.filter((request) => request.status === "ACTIVE").length },
  ];
  const maximum = Math.max(1, ...activity.map((item) => item.value));

  return (
    <div aria-label="Landlord portfolio activity chart" className="grid gap-4" role="img">
      <div className="grid h-44 grid-cols-4 items-end gap-3 border-b border-slate-300 px-2 sm:gap-5">
        {activity.map((item) => (
          <div className="flex h-full min-w-0 flex-col justify-end" key={item.label}>
            <div
              aria-label={`${item.label}: ${item.value}`}
              className="min-h-1 rounded-t-md bg-primary transition-[height]"
              style={{ height: `${Math.max(4, (item.value / maximum) * 100)}%` }}
              title={`${item.label}: ${item.value}`}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3 text-center sm:gap-5">
        {activity.map((item) => (
          <div className="min-w-0" key={item.label}>
            <p className="text-lg font-bold text-slate-950">{item.value}</p>
            <p className="truncate text-xs font-medium text-slate-600">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LandlordPropertyCard({
  categories,
  deletingPropertyId,
  onDeleteProperty,
  onUpdateProperty,
  onToggleAvailability,
  property,
  updatingPropertyDetailsId,
  updatingPropertyId,
}: {
  categories: Category[];
  deletingPropertyId: string | null;
  onDeleteProperty: (property: Property) => void;
  onUpdateProperty: (property: Property, payload: PropertyPayload) => Promise<boolean>;
  onToggleAvailability: (property: Property) => void;
  property: Property;
  updatingPropertyDetailsId: string | null;
  updatingPropertyId: string | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const nextStatus: PropertyStatus =
    property.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
  const isUpdating = updatingPropertyId === property.id;
  const isDeleting = deletingPropertyId === property.id;
  const isUpdatingDetails = updatingPropertyDetailsId === property.id;

  const handleUpdateProperty = async (payload: PropertyPayload) => {
    const succeeded = await onUpdateProperty(property, payload);

    if (succeeded) {
      setIsEditing(false);
    }

    return succeeded;
  };

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
            onClick={() => setIsEditing((current) => !current)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Pencil size={15} aria-hidden="true" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
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
          <Button
            disabled={isDeleting}
            onClick={() => onDeleteProperty(property)}
            size="sm"
            type="button"
            variant="outline"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin" size={15} aria-hidden="true" />
            ) : (
              <Trash2 size={15} aria-hidden="true" />
            )}
            Delete
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

      {isEditing ? (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <AddPropertyForm
            categories={categories}
            formId={`edit-${property.id}`}
            initialValues={propertyToFormValues(property)}
            isSubmitting={isUpdatingDetails}
            onSubmitProperty={handleUpdateProperty}
            submitLabel="Update property"
          />
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

const propertyToFormValues = (property: Property): PropertyFormValues => ({
  title: property.title,
  description: property.description,
  location: property.location,
  address: property.address ?? "",
  rentAmount: String(property.rentAmount),
  bedrooms: String(property.bedrooms),
  bathrooms: String(property.bathrooms),
  areaSqFt: property.areaSqFt ? String(property.areaSqFt) : "",
  categoryId: property.categoryId,
  amenities: property.amenities.join("\n"),
  images: property.images.join("\n"),
});

const splitListInput = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

function AddPropertyForm({
  categories,
  formId = "new-property",
  initialValues,
  isSubmitting,
  onSubmitProperty,
  submitLabel = "Add property",
}: {
  categories: Category[];
  formId?: string;
  initialValues?: PropertyFormValues;
  isSubmitting: boolean;
  onSubmitProperty: (payload: PropertyPayload) => Promise<boolean>;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<PropertyFormValues>(
    initialValues ?? getDefaultPropertyFormValues,
  );
  const [fieldErrors, setFieldErrors] = useState<PropertyFormErrors>({});

  const getErrorProps = (field: keyof PropertyFormValues) => ({
    "aria-describedby": fieldErrors[field]
      ? `${formId}-${field}-error`
      : undefined,
    "aria-invalid": Boolean(fieldErrors[field]),
  });

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
        return new URL(image).protocol !== "https:";
      } catch {
        return true;
      }
    });

    if (invalidImage) {
      errors.images = "Every image must be a valid HTTPS URL.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const succeeded = await onSubmitProperty({
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

    if (succeeded && !initialValues) {
      setValues(getDefaultPropertyFormValues());
      setFieldErrors({});
    }
  };

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${formId}-title`}>Title</Label>
          <Input
            {...getErrorProps("title")}
            id={`${formId}-title`}
            onChange={(event) => updateValue("title", event.target.value)}
            placeholder="Modern apartment near Gulshan"
            value={values.title}
          />
          {fieldErrors.title ? (
            <p className="text-xs font-medium text-red-600" id={`${formId}-title-error`}>
              {fieldErrors.title}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${formId}-category`}>Category</Label>
          <select
            {...getErrorProps("categoryId")}
            className="h-10 w-full rounded-md border border-slate-300 bg-surface px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            disabled={categories.length === 0}
            id={`${formId}-category`}
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
            <p className="text-xs font-medium text-red-600" id={`${formId}-categoryId-error`}>
              {fieldErrors.categoryId}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${formId}-location`}>Location</Label>
          <Input
            {...getErrorProps("location")}
            id={`${formId}-location`}
            onChange={(event) => updateValue("location", event.target.value)}
            placeholder="Dhaka"
            value={values.location}
          />
          {fieldErrors.location ? (
            <p className="text-xs font-medium text-red-600" id={`${formId}-location-error`}>
              {fieldErrors.location}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${formId}-address`}>Address</Label>
          <Input
            {...getErrorProps("rentAmount")}
            id={`${formId}-address`}
            onChange={(event) => updateValue("address", event.target.value)}
            placeholder="House 12, Road 5"
            value={values.address}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${formId}-rent`}>Monthly rent</Label>
          <Input
            id={`${formId}-rent`}
            min="1"
            onChange={(event) => updateValue("rentAmount", event.target.value)}
            placeholder="45000"
            type="number"
            value={values.rentAmount}
          />
          {fieldErrors.rentAmount ? (
            <p className="text-xs font-medium text-red-600" id={`${formId}-rentAmount-error`}>
              {fieldErrors.rentAmount}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label htmlFor={`${formId}-bedrooms`}>Beds</Label>
            <Input
              {...getErrorProps("bedrooms")}
              id={`${formId}-bedrooms`}
              max="20"
              min="1"
              onChange={(event) => updateValue("bedrooms", event.target.value)}
              type="number"
              value={values.bedrooms}
            />
            {fieldErrors.bedrooms ? (
              <p className="text-xs font-medium text-red-600" id={`${formId}-bedrooms-error`}>
                {fieldErrors.bedrooms}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${formId}-bathrooms`}>Baths</Label>
            <Input
              {...getErrorProps("bathrooms")}
              id={`${formId}-bathrooms`}
              max="20"
              min="1"
              onChange={(event) => updateValue("bathrooms", event.target.value)}
              type="number"
              value={values.bathrooms}
            />
            {fieldErrors.bathrooms ? (
              <p className="text-xs font-medium text-red-600" id={`${formId}-bathrooms-error`}>
                {fieldErrors.bathrooms}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${formId}-area`}>Sqft</Label>
            <Input
              {...getErrorProps("areaSqFt")}
              id={`${formId}-area`}
              min="1"
              onChange={(event) => updateValue("areaSqFt", event.target.value)}
              type="number"
              value={values.areaSqFt}
            />
            {fieldErrors.areaSqFt ? (
              <p className="text-xs font-medium text-red-600" id={`${formId}-areaSqFt-error`}>
                {fieldErrors.areaSqFt}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${formId}-description`}>Description</Label>
        <Textarea
          {...getErrorProps("description")}
          id={`${formId}-description`}
          maxLength={2000}
          onChange={(event) => updateValue("description", event.target.value)}
          placeholder="Describe the rental property, nearby transport, building features, and tenant requirements."
          value={values.description}
        />
        {fieldErrors.description ? (
          <p className="text-xs font-medium text-red-600" id={`${formId}-description-error`}>
            {fieldErrors.description}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${formId}-amenities`}>Amenities</Label>
        <Textarea
          {...getErrorProps("images")}
            id={`${formId}-amenities`}
            onChange={(event) => updateValue("amenities", event.target.value)}
            placeholder="Parking, WiFi, Elevator"
            value={values.amenities}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${formId}-images`}>Image URLs</Label>
          <Textarea
            id={`${formId}-images`}
            onChange={(event) => updateValue("images", event.target.value)}
            placeholder="https://images.unsplash.com/..."
            value={values.images}
          />
        {fieldErrors.images ? (
            <p className="text-xs font-medium text-red-600" id={`${formId}-images-error`}>
              {fieldErrors.images}
            </p>
          ) : null}
        </div>
      </div>

      <Button className="w-full sm:w-fit" disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <Loader2 className="animate-spin" size={16} aria-hidden="true" />
        ) : (
          <PlusCircle size={16} aria-hidden="true" />
        )}
        {submitLabel}
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
          <form className="grid gap-3" noValidate onSubmit={handleReject}>
            <div className="grid gap-2">
              <Label htmlFor={`rejection-${request.id}`}>Rejection reason</Label>
              <Textarea
                aria-describedby={fieldError ? `rejection-${request.id}-error` : undefined}
                aria-invalid={Boolean(fieldError)}
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
                <p
                  aria-live="assertive"
                  className="text-xs font-medium text-red-600"
                  id={`rejection-${request.id}-error`}
                  role="alert"
                >
                  {fieldError}
                </p>
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
        <div className="mt-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
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
  const [updatingPropertyDetailsId, setUpdatingPropertyDetailsId] = useState<string | null>(null);
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [completingRequestId, setCompletingRequestId] = useState<string | null>(null);
  const [inventoryFilters, setInventoryFilters] = useState<InventoryFilters>({
    search: "",
    status: "",
  });
  const [inventoryPage, setInventoryPage] = useState(1);
  const cacheKey = user ? `landlord:${user.id}` : null;

  useEffect(() => {
    let isActive = true;

    if (!token || !cacheKey) {
      return () => {
        isActive = false;
      };
    }
    const dashboardCacheKey = cacheKey ?? "";

    const loadProperties = async () => {
      const cached = getDashboardCache<LandlordDashboardCache>(dashboardCacheKey);

      if (cached) {
        setProperties(cached.properties);
        setRequests(cached.requests);
        setCategories(cached.categories);
      }

      setIsLoading(!cached);
      setError("");
      setActionError("");

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
          setDashboardCache(dashboardCacheKey, {
            properties: propertyData,
            requests: requestData,
            categories: categoryData,
          });
        }
      } catch (fetchError) {
        if (isActive) {
          const message = getErrorMessage(fetchError);
          if (cached) {
            setActionError(`${message} Showing saved dashboard data.`);
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

    loadProperties();

    return () => {
      isActive = false;
    };
  }, [cacheKey, token]);

  const visibleProperties = useMemo(
    () => (token ? properties : []),
    [properties, token],
  );
  const visibleRequests = useMemo(
    () => (token ? requests : []),
    [requests, token],
  );
  const requestGroups = useMemo(
    () => [
      {
        description: "New requests waiting for your approval or rejection.",
        items: visibleRequests.filter((request) => request.status === "PENDING"),
        title: "Needs decision",
        tone: "border-amber-400 bg-amber-50/50",
      },
      {
        description: "Approved requests and tenants currently renting your properties.",
        items: visibleRequests.filter((request) =>
          request.status === "APPROVED" || request.status === "ACTIVE",
        ),
        title: "Current rentals",
        tone: "border-emerald-500 bg-emerald-50/50",
      },
      {
        description: "Completed, rejected, and cancelled request records.",
        items: visibleRequests.filter((request) =>
          ["COMPLETED", "REJECTED", "CANCELLED"].includes(request.status),
        ),
        title: "Request history",
        tone: "border-slate-500 bg-surface",
      },
    ],
    [visibleRequests],
  );

  const stats = useMemo(() => {
    const available = visibleProperties.filter(
      (property) => property.status === "AVAILABLE",
    ).length;
    const activeRequests = visibleRequests.filter(
      (request) => request.status === "ACTIVE",
    ).length;
    const earnings = visibleRequests.reduce(
      (total, request) =>
        total +
        Number(
          request.payments?.find((payment) => payment.status === "COMPLETED")
            ?.amount ?? 0,
        ),
      0,
    );

    return [
      { label: "Total listings", value: visibleProperties.length },
      { label: "Available", value: available },
      { label: "Active requests", value: activeRequests },
      { label: "Earnings", value: formatCurrency(earnings) },
    ];
  }, [visibleProperties, visibleRequests]);
  const filteredProperties = useMemo(() => {
    const search = inventoryFilters.search.trim().toLowerCase();

    return visibleProperties.filter((property) => {
      const matchesSearch =
        !search ||
        property.title.toLowerCase().includes(search) ||
        property.location.toLowerCase().includes(search) ||
        property.category?.name.toLowerCase().includes(search);
      const matchesStatus = !inventoryFilters.status || property.status === inventoryFilters.status;

      return matchesSearch && matchesStatus;
    });
  }, [inventoryFilters, visibleProperties]);
  const inventoryPerPage = 5;
  const inventoryTotalPages = Math.max(1, Math.ceil(filteredProperties.length / inventoryPerPage));
  const paginatedProperties = filteredProperties.slice(
    (inventoryPage - 1) * inventoryPerPage,
    inventoryPage * inventoryPerPage,
  );

  const updateInventoryFilters = (nextFilters: InventoryFilters) => {
    setInventoryFilters(nextFilters);
    setInventoryPage(1);
  };

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
      setActionMessage(`Property marked ${updatedProperty.status.toLowerCase()}.`);
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

  const handleUpdateProperty = async (property: Property, payload: PropertyPayload) => {
    if (!token) {
      setActionError("Please login as a landlord before updating properties.");
      return false;
    }

    setUpdatingPropertyDetailsId(property.id);
    setActionError("");
    setActionMessage("");

    try {
      const updatedProperty = await api.landlord.updateProperty(
        token,
        property.id,
        payload,
      );

      setProperties((currentProperties) =>
        currentProperties.map((currentProperty) =>
          currentProperty.id === updatedProperty.id ? updatedProperty : currentProperty,
        ),
      );
      setActionMessage("Property updated successfully.");
      return true;
    } catch (updateError) {
      setActionError(getErrorMessage(updateError));
      return false;
    } finally {
      setUpdatingPropertyDetailsId(null);
    }
  };

  const handleDeleteProperty = async (property: Property) => {
    if (!token) {
      setActionError("Please login as a landlord before deleting properties.");
      return;
    }

    setDeletingPropertyId(property.id);
    setActionError("");
    setActionMessage("");

    try {
      await api.landlord.deleteProperty(token, property.id);

      setProperties((currentProperties) =>
        currentProperties.filter((currentProperty) => currentProperty.id !== property.id),
      );
      setActionMessage("Property deleted successfully.");
    } catch (deleteError) {
      setActionError(getErrorMessage(deleteError));
    } finally {
      setDeletingPropertyId(null);
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
    const previousRequest = requests.find((request) => request.id === requestId);

    if (!previousRequest) {
      setUpdatingRequestId(null);
      setActionError("Rental request could not be found.");
      return;
    }

    replaceRequest({ ...previousRequest, status: "APPROVED" });

    try {
      const updatedRequest = await api.landlord.updateRequest(token, requestId, {
        status: "APPROVED",
      });

      replaceRequest(updatedRequest);
      setActionMessage("Rental request approved.");
    } catch (updateError) {
      replaceRequest(previousRequest);
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
    const previousRequest = requests.find((request) => request.id === requestId);

    if (!previousRequest) {
      setUpdatingRequestId(null);
      setActionError("Rental request could not be found.");
      return;
    }

    replaceRequest({ ...previousRequest, status: "REJECTED", rejectionReason });

    try {
      const updatedRequest = await api.landlord.updateRequest(token, requestId, {
        status: "REJECTED",
        rejectionReason,
      });

      replaceRequest(updatedRequest);
      setActionMessage("Rental request rejected.");
    } catch (updateError) {
      replaceRequest(previousRequest);
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
      setActionMessage("Rental request marked completed.");
    } catch (completeError) {
      setActionError(getErrorMessage(completeError));
    } finally {
      setCompletingRequestId(null);
    }
  };

  return (
    <main className="bg-slate-50">
      <Toast message={actionMessage} tone="success" />
      <Toast message={actionError} tone="error" />
      <section className="border-b border-slate-300 bg-surface">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Landlord dashboard
          </p>
          <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">
                Property listings
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Manage your rental inventory and control whether each property is
                visible as available to tenants.
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

        <nav
          aria-label="Landlord dashboard sections"
          className="grid border border-slate-300 bg-surface sm:grid-cols-4"
        >
          {[
            { href: "#portfolio-activity", label: "Portfolio activity", number: "01" },
            { href: "#add-property", label: "Add property", number: "02" },
            { href: "#my-properties", label: "My properties", number: "03" },
            { href: "#rental-requests", label: "Rental requests", number: "04" },
          ].map((item) => (
            <a
              className="flex min-h-14 items-center gap-3 border-b border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-inverse hover:text-inverse-foreground last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
              href={item.href}
              key={item.href}
            >
              <span className="text-xs text-slate-500">{item.number}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <DashboardSection
          description="A live view of listing availability and rental-request activity from your own portfolio."
          icon={CalendarClock}
          id="portfolio-activity"
          index="01"
          title="Portfolio activity"
          tone="muted"
        >
          {isLoading ? <DashboardContentSkeleton label="Loading portfolio activity" /> : null}
          {!isLoading && !error ? <LandlordPortfolioChart properties={visibleProperties} requests={visibleRequests} /> : null}
        </DashboardSection>

        <DashboardSection
          description="Publish a new rental with pricing, amenities, category, and image URLs."
          icon={PlusCircle}
          id="add-property"
          index="02"
          title="Create a listing"
          tone="dark"
        >
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
              onSubmitProperty={handleCreateProperty}
            />
        </DashboardSection>

        <DashboardSection
          description={`${visibleProperties.length} listing${visibleProperties.length === 1 ? "" : "s"}. Edit details, change availability, or remove a property.`}
          icon={Building2}
          id="my-properties"
          index="03"
          title="My properties"
          tone="light"
        >
            {isLoading ? (
              <DashboardContentSkeleton label="Loading properties" />
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

            {!isLoading && !error && visibleProperties.length > 0 ? (
              <>
                <div className="mb-5 grid gap-4 border-b border-slate-300 pb-5 sm:grid-cols-[minmax(0,1fr)_12rem]">
                  <div className="grid gap-2">
                    <Label htmlFor="landlord-inventory-search">Search inventory</Label>
                    <Input
                      id="landlord-inventory-search"
                      onChange={(event) => updateInventoryFilters({ ...inventoryFilters, search: event.target.value })}
                      placeholder="Title, location, or category"
                      value={inventoryFilters.search}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="landlord-inventory-status">Listing status</Label>
                    <select
                      className="h-10 rounded-md border border-slate-400 bg-surface px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                      id="landlord-inventory-status"
                      onChange={(event) => updateInventoryFilters({ ...inventoryFilters, status: event.target.value as InventoryFilters["status"] })}
                      value={inventoryFilters.status}
                    >
                      <option value="">All statuses</option>
                      <option value="AVAILABLE">Available</option>
                      <option value="UNAVAILABLE">Unavailable</option>
                    </select>
                  </div>
                </div>

                {filteredProperties.length === 0 ? (
                  <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">No listings match the current filters.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[48rem] text-left text-sm">
                      <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="py-3 pr-4 font-semibold">Listing</th>
                          <th className="py-3 pr-4 font-semibold">Category</th>
                          <th className="py-3 pr-4 font-semibold">Rent</th>
                          <th className="py-3 pr-4 font-semibold">Requests</th>
                          <th className="py-3 pr-4 font-semibold">Status</th>
                          <th className="py-3 font-semibold">Open</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {paginatedProperties.map((property) => (
                          <tr key={property.id}>
                            <td className="py-3 pr-4 font-medium text-slate-950">{property.title}</td>
                            <td className="py-3 pr-4 text-slate-700">{property.category?.name ?? "Rental"}</td>
                            <td className="py-3 pr-4 text-slate-700">{formatCurrency(property.rentAmount)}</td>
                            <td className="py-3 pr-4 text-slate-700">{property._count?.rentalRequests ?? 0}</td>
                            <td className="py-3 pr-4"><PropertyStatusBadge status={property.status} /></td>
                            <td className="py-3"><Link className="font-semibold text-emerald-800 underline underline-offset-4" href={`/properties/${property.id}`}>View</Link></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {filteredProperties.length > 0 ? (
                  <div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
                    <p className="text-sm text-slate-600">Page {inventoryPage} of {inventoryTotalPages}</p>
                    <div className="flex gap-2">
                      <Button disabled={inventoryPage <= 1} onClick={() => setInventoryPage((current) => Math.max(1, current - 1))} type="button" variant="outline">Previous</Button>
                      <Button disabled={inventoryPage >= inventoryTotalPages} onClick={() => setInventoryPage((current) => Math.min(inventoryTotalPages, current + 1))} type="button" variant="outline">Next</Button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            {!isLoading && !error && visibleProperties.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Building2 className="mx-auto text-slate-400" size={34} aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                  No listings yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Use the add-property form above to publish your first rental
                  listing.
                </p>
              </div>
            ) : null}

            {!isLoading && !error && paginatedProperties.length > 0 ? (
              <div className="grid gap-4">
                {paginatedProperties.map((property) => (
                  <LandlordPropertyCard
                    categories={categories}
                    deletingPropertyId={deletingPropertyId}
                    key={property.id}
                    onDeleteProperty={handleDeleteProperty}
                    onToggleAvailability={handleToggleAvailability}
                    onUpdateProperty={handleUpdateProperty}
                    property={property}
                    updatingPropertyDetailsId={updatingPropertyDetailsId}
                    updatingPropertyId={updatingPropertyId}
                  />
                ))}
              </div>
            ) : null}
        </DashboardSection>

        <DashboardSection
          description={`${visibleRequests.length} request${visibleRequests.length === 1 ? "" : "s"}. Review tenant details, payment state, and rental progress.`}
          icon={ClipboardList}
          id="rental-requests"
          index="04"
          title="Rental requests"
          tone="muted"
        >
            {isLoading ? (
              <DashboardContentSkeleton label="Loading rental requests" />
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
              <div className="grid gap-8">
                {requestGroups.map((group) =>
                  group.items.length > 0 ? (
                    <section key={group.title}>
                      <div className={`mb-4 border-l-4 p-4 ${group.tone}`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-slate-950">
                              {group.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              {group.description}
                            </p>
                          </div>
                          <Badge tone="slate">{group.items.length}</Badge>
                        </div>
                      </div>
                      <div className="grid gap-4">
                        {group.items.map((request) => (
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
                    </section>
                  ) : null,
                )}
              </div>
            ) : null}
        </DashboardSection>
      </section>
    </main>
  );
}
