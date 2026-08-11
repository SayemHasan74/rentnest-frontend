"use client";

import { AlertCircle, CheckCircle2, Loader2, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { getStoredToken, getStoredUser, persistAuthSession, roleLabels } from "@/lib/auth-session";
import type { ProfileUpdatePayload, User } from "@/types/rentnest";

type FieldErrors = Partial<Record<keyof ProfileUpdatePayload, string>>;

const toProfileValues = (user: User): ProfileUpdatePayload => ({
  name: user.name,
  phone: user.phone,
  address: user.address,
});

const validate = (values: ProfileUpdatePayload): FieldErrors => {
  const errors: FieldErrors = {};
  const phone = values.phone?.trim() ?? "";
  const address = values.address?.trim() ?? "";

  if (values.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
  if (values.name.trim().length > 80) errors.name = "Name must be 80 characters or fewer.";
  if (phone && phone.length < 6) errors.phone = "Phone number must be at least 6 characters.";
  if (phone.length > 20) errors.phone = "Phone number must be 20 characters or fewer.";
  if (address.length > 255) errors.address = "Address must be 255 characters or fewer.";

  return errors;
};

export function ProfileForm() {
  const [user, setUser] = useState<User | null>(null);
  const [values, setValues] = useState<ProfileUpdatePayload>({ name: "", phone: null, address: null });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getStoredToken();
      const storedUser = getStoredUser();

      if (!token || !storedUser) {
        setStatus({ type: "error", message: "Your session is unavailable. Please log in again." });
        setIsLoading(false);
        return;
      }

      setUser(storedUser);
      setValues(toProfileValues(storedUser));

      try {
        const currentUser = await api.auth.me(token);
        setUser(currentUser);
        setValues(toProfileValues(currentUser));
        persistAuthSession({ accessToken: token, user: currentUser });
      } catch (error) {
        setStatus({ type: "error", message: `${getErrorMessage(error)} Showing the saved profile details.` });
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const updateValue = (field: keyof ProfileUpdatePayload, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatus(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus({ type: "error", message: "Please correct the highlighted fields and try again." });
      return;
    }

    const token = getStoredToken();
    if (!token) {
      setStatus({ type: "error", message: "Your session has expired. Please log in again." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const updatedUser = await api.auth.updateProfile(token, {
        name: values.name.trim(),
        phone: values.phone?.trim() || null,
        address: values.address?.trim() || null,
      });
      setUser(updatedUser);
      setValues(toProfileValues(updatedUser));
      persistAuthSession({ accessToken: token, user: updatedUser });
      setStatus({ type: "success", message: "Your profile has been updated." });
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-10">
        <aside className="h-fit border border-inverse bg-inverse p-6 text-inverse-foreground sm:p-8">
          <UserRound size={28} aria-hidden="true" />
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-inverse-muted">Account profile</p>
          <h1 className="mt-3 text-3xl font-semibold">Your details</h1>
          <p className="mt-4 text-sm leading-6 text-inverse-muted">Keep the contact details connected to your rental activity accurate.</p>
          {user ? (
            <div className="mt-8 border-t border-inverse-foreground/20 pt-5 text-sm">
              <p className="font-semibold">{user.email}</p>
              <p className="mt-2 text-inverse-muted">{roleLabels[user.role]} account</p>
            </div>
          ) : null}
        </aside>

        <section className="border border-slate-300 bg-surface p-6 shadow-sm sm:p-8" aria-labelledby="profile-form-title">
          <h2 className="text-2xl font-semibold text-slate-950" id="profile-form-title">Edit profile</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Your email and role are managed by your RentNest account and cannot be changed here.</p>

          {status ? (
            <div aria-live="polite" className={`mt-6 flex gap-3 rounded-md border p-4 text-sm leading-6 ${status.type === "success" ? "border-emerald-700/30 bg-emerald-50 text-emerald-900" : "border-red-700/30 bg-red-50 text-red-900"}`} role={status.type === "success" ? "status" : "alert"}>
              {status.type === "success" ? <CheckCircle2 className="mt-0.5 shrink-0" size={18} aria-hidden="true" /> : <AlertCircle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />}
              <p>{status.message}</p>
            </div>
          ) : null}

          <form className="mt-7 grid gap-5" noValidate onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input aria-describedby={errors.name ? "profile-name-error" : undefined} aria-invalid={Boolean(errors.name)} autoComplete="name" disabled={isLoading} id="profile-name" onChange={(event) => updateValue("name", event.target.value)} required value={values.name} />
              {errors.name ? <p className="text-sm text-red-700" id="profile-name-error">{errors.name}</p> : null}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input autoComplete="email" disabled id="profile-email" type="email" value={user?.email ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-role">Role</Label>
                <Input disabled id="profile-role" value={user ? roleLabels[user.role] : ""} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input aria-describedby={errors.phone ? "profile-phone-error" : undefined} aria-invalid={Boolean(errors.phone)} autoComplete="tel" disabled={isLoading} id="profile-phone" onChange={(event) => updateValue("phone", event.target.value)} placeholder="+8801700000000" value={values.phone ?? ""} />
              {errors.phone ? <p className="text-sm text-red-700" id="profile-phone-error">{errors.phone}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-address">Address</Label>
              <Textarea aria-describedby={errors.address ? "profile-address-error" : undefined} aria-invalid={Boolean(errors.address)} autoComplete="street-address" disabled={isLoading} id="profile-address" maxLength={255} onChange={(event) => updateValue("address", event.target.value)} placeholder="Dhaka, Bangladesh" value={values.address ?? ""} />
              {errors.address ? <p className="text-sm text-red-700" id="profile-address-error">{errors.address}</p> : null}
            </div>
            <Button className="w-full sm:w-fit" disabled={isLoading || isSubmitting} size="lg" type="submit">
              {isSubmitting ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : null}
              {isSubmitting ? "Saving profile..." : "Save profile"}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
