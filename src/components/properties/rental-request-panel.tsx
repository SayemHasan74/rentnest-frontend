"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { FormEvent, useState, useSyncExternalStore } from "react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { getStoredToken, getStoredUser } from "@/lib/auth-session";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { User } from "@/types/rentnest";

type FieldErrors = Partial<Record<"moveInDate" | "rentalMonths", string>>;

const getTomorrowDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  return date.toISOString().slice(0, 10);
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

export function RentalRequestPanel({
  propertyId,
}: {
  propertyId: string;
}) {
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthStorage,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const { token, user } = JSON.parse(authSnapshot) as {
    token: string | null;
    user: User | null;
  };
  const [moveInDate, setMoveInDate] = useState(getTomorrowDate);
  const [rentalMonths, setRentalMonths] = useState("12");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors: FieldErrors = {};
    const months = Number(rentalMonths);

    if (!moveInDate) {
      errors.moveInDate = "Choose a move-in date.";
    }

    if (!Number.isInteger(months) || months < 1 || months > 60) {
      errors.rentalMonths = "Rental duration must be 1 to 60 months.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setFormError("Please login as a tenant before requesting this property.");
      return;
    }

    if (user?.role !== "TENANT") {
      setFormError("Only tenant accounts can submit rental requests.");
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      await api.rentals.create(token, {
        propertyId,
        moveInDate,
        rentalMonths: Number(rentalMonths),
        message: message.trim() || undefined,
      });

      setSuccessMessage("Rental request submitted. Wait for landlord approval.");
      setMessage("");
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div>
        <p className="text-sm leading-6 text-slate-600">
          Tenants can submit a rental request after logging in. The landlord
          must approve it before payment is available.
        </p>
        <Link
          className={buttonClasses({ className: "mt-5 w-full" })}
          href={`/auth/login?from=/properties/${propertyId}`}
        >
          Login to request
        </Link>
      </div>
    );
  }

  if (user?.role !== "TENANT") {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">Tenant account required</p>
        <p className="mt-1 leading-6">
          You are logged in as {user?.role.toLowerCase()}. Rental requests can
          only be submitted from tenant accounts.
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {formError ? (
        <div className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
          <p>{formError}</p>
        </div>
      ) : null}

      {successMessage ? (
        <div className="flex gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
          <p>{successMessage}</p>
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="moveInDate">Move-in date</Label>
        <Input
          id="moveInDate"
          min={getTomorrowDate()}
          name="moveInDate"
          onChange={(event) => {
            setMoveInDate(event.target.value);
            setFieldErrors((current) => ({ ...current, moveInDate: undefined }));
          }}
          type="date"
          value={moveInDate}
        />
        {fieldErrors.moveInDate ? (
          <p className="text-xs font-medium text-red-600">{fieldErrors.moveInDate}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="rentalMonths">Rental duration</Label>
        <Input
          id="rentalMonths"
          max="60"
          min="1"
          name="rentalMonths"
          onChange={(event) => {
            setRentalMonths(event.target.value);
            setFieldErrors((current) => ({ ...current, rentalMonths: undefined }));
          }}
          type="number"
          value={rentalMonths}
        />
        {fieldErrors.rentalMonths ? (
          <p className="text-xs font-medium text-red-600">{fieldErrors.rentalMonths}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Message to landlord</Label>
        <Textarea
          id="message"
          maxLength={1000}
          name="message"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Share move-in details or questions for the landlord."
          value={message}
        />
      </div>

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : null}
        Submit rental request
      </Button>
    </form>
  );
}
