"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import {
  getRoleDashboardPath,
  getSafePostLoginPath,
  getStoredToken,
  getStoredUser,
  persistAuthSession,
  syncAuthCookies,
} from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { RegisterPayload } from "@/types/rentnest";

type AuthMode = "login" | "register";

type FieldErrors = Partial<Record<"name" | "email" | "password" | "role", string>>;

const demoAccounts = [
  { label: "Tenant", email: "tenant@rentnest.com", password: "tenant123" },
  { label: "Landlord", email: "landlord@rentnest.com", password: "landlord123" },
  { label: "Admin", email: "admin@rentnest.com", password: "admin123" },
];

const getInitialRegisterValues = (): RegisterPayload => ({
  name: "",
  email: "",
  password: "",
  role: "TENANT",
  phone: "",
  address: "",
});

export function AuthForm({ mode }: { mode: AuthMode }) {
  const searchParams = useSearchParams();
  const isRegister = mode === "register";
  const [values, setValues] = useState(getInitialRegisterValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();

    if (!token || !user) {
      return;
    }

    syncAuthCookies(token, user);
    window.location.replace(getRoleDashboardPath(user.role));
  }, []);

  const updateValue = (name: keyof RegisterPayload, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setFormError("");
  };

  const validate = () => {
    const errors: FieldErrors = {};

    if (isRegister && values.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (!values.email.includes("@")) {
      errors.email = "Enter a valid email address.";
    }

    if (values.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (isRegister && !["TENANT", "LANDLORD"].includes(values.role)) {
      errors.role = "Choose tenant or landlord.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loginAndRedirect = async (email: string, password: string) => {
    const auth = await api.auth.login({ email, password });
    const from = searchParams.get("from");
    const nextPath = getSafePostLoginPath(auth.user.role, from);

    persistAuthSession(auth);
    window.location.assign(nextPath);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      if (isRegister) {
        await api.auth.register({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          role: values.role,
          phone: values.phone?.trim() || undefined,
          address: values.address?.trim() || undefined,
        });
      }

      await loginAndRedirect(values.email.trim(), values.password);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccount = async (account: (typeof demoAccounts)[number]) => {
    setValues((current) => ({
      ...current,
      email: account.email,
      password: account.password,
    }));
    setFieldErrors({});
    setFormError("");

    if (!isRegister) {
      setIsSubmitting(true);

      try {
        await loginAndRedirect(account.email, account.password);
      } catch (error) {
        setFormError(getErrorMessage(error));
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="border-t border-slate-950 bg-surface px-0 py-8 sm:px-8">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            {isRegister ? "Create account" : "Welcome back"}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">
            {isRegister ? "Join RentNest" : "Login to RentNest"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {isRegister
              ? "Choose your role and create a tenant or landlord account."
              : "Use your account credentials or one of the seeded demo accounts."}
          </p>
        </div>

        {formError ? (
          <div className="mt-5 flex gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
            <p>{formError}</p>
          </div>
        ) : null}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {isRegister ? (
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                autoComplete="name"
                id="name"
                name="name"
                onChange={(event) => updateValue("name", event.target.value)}
                placeholder="Your name"
                value={values.name}
              />
              {fieldErrors.name ? (
                <p className="text-xs font-medium text-red-600">{fieldErrors.name}</p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              onChange={(event) => updateValue("email", event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={values.email}
            />
            {fieldErrors.email ? (
              <p className="text-xs font-medium text-red-600">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              autoComplete={isRegister ? "new-password" : "current-password"}
              id="password"
              name="password"
              onChange={(event) => updateValue("password", event.target.value)}
              placeholder="At least 6 characters"
              type="password"
              value={values.password}
            />
            {fieldErrors.password ? (
              <p className="text-xs font-medium text-red-600">{fieldErrors.password}</p>
            ) : null}
          </div>

          {isRegister ? (
            <>
              <div className="grid gap-2">
                <Label>Role</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["TENANT", "LANDLORD"] as const).map((role) => (
                    <button
                      className={`h-10 rounded-md border px-3 text-sm font-semibold transition ${
                        values.role === role
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-slate-300 bg-surface text-slate-700 hover:bg-slate-50"
                      }`}
                      key={role}
                      onClick={() => updateValue("role", role)}
                      type="button"
                    >
                      {role === "TENANT" ? "Tenant" : "Landlord"}
                    </button>
                  ))}
                </div>
                {fieldErrors.role ? (
                  <p className="text-xs font-medium text-red-600">{fieldErrors.role}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  autoComplete="tel"
                  id="phone"
                  name="phone"
                  onChange={(event) => updateValue("phone", event.target.value)}
                  placeholder="+8801700000000"
                  value={values.phone}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  autoComplete="street-address"
                  id="address"
                  name="address"
                  onChange={(event) => updateValue("address", event.target.value)}
                  placeholder="Dhaka, Bangladesh"
                  value={values.address}
                />
              </div>
            </>
          ) : null}

          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : null}
            {isRegister ? "Create account" : "Login"}
          </Button>
        </form>

        {!isRegister ? (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Demo accounts
            </p>
            <div className="mt-3 grid gap-2">
              {demoAccounts.map((account) => (
                <button
                  className="flex items-center justify-between border-b border-slate-300 px-1 py-3 text-left text-sm transition hover:bg-slate-50"
                  disabled={isSubmitting}
                  key={account.email}
                  onClick={() => void handleDemoAccount(account)}
                  type="button"
                >
                  <span className="font-semibold text-slate-800">{account.label}</span>
                  <span className="font-mono text-xs text-slate-500">{account.email}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-6 text-center text-sm text-slate-600">
          {isRegister ? "Already have an account?" : "Need an account?"}{" "}
          <Link
            className="border-b border-slate-950 font-semibold text-slate-950"
            href={isRegister ? "/auth/login" : "/auth/register"}
          >
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </div>
    </div>
  );
}
