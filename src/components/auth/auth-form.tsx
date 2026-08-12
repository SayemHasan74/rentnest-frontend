"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import {
  getSafePostLoginPath,
  getStoredToken,
  getStoredUser,
  persistAuthSession,
  syncAuthCookies,
} from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { SocialLogin } from "@/components/auth/social-login";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { AuthPayload, RegisterPayload } from "@/types/rentnest";

type AuthMode = "login" | "register";

type FieldErrors = Partial<
  Record<"name" | "email" | "password" | "role" | "phone" | "address", string>
>;

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
  const [formNotice, setFormNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialSubmitting, setIsSocialSubmitting] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();

    if (!token || !user) {
      return;
    }

    syncAuthCookies(token, user);
    const from = searchParams.get("from");
    window.location.replace(getSafePostLoginPath(user.role, from));
  }, [searchParams]);

  const updateValue = (name: keyof RegisterPayload, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setFormError("");
    setFormNotice("");
  };

  const validate = () => {
    const errors: FieldErrors = {};
    const phone = values.phone?.trim() ?? "";
    const address = values.address?.trim() ?? "";

    if (isRegister && values.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (values.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (isRegister && !["TENANT", "LANDLORD"].includes(values.role)) {
      errors.role = "Choose tenant or landlord.";
    }

    if (isRegister && phone && phone.length < 6) {
      errors.phone = "Phone number must be at least 6 characters.";
    }

    if (isRegister && address.length > 255) {
      errors.address = "Address must be 255 characters or fewer.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const completeAuthentication = (auth: AuthPayload) => {
    const from = searchParams.get("from");
    const nextPath = getSafePostLoginPath(auth.user.role, from);

    setFormError("");
    setFormNotice("Signed in successfully. Redirecting...");
    persistAuthSession(auth);
    window.setTimeout(() => window.location.assign(nextPath), 250);
  };

  const loginAndRedirect = async (email: string, password: string) => {
    const auth = await api.auth.login({ email, password });
    completeAuthentication(auth);
  };

  const handleSocialError = (error: unknown) => {
    setFormNotice("");
    setFormError(getErrorMessage(error));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setFormNotice("");

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
        setFormNotice("Account created successfully. Signing you in...");
      }

      await loginAndRedirect(values.email.trim(), values.password);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccount = (account: (typeof demoAccounts)[number]) => {
    setValues((current) => ({
      ...current,
      email: account.email,
      password: account.password,
    }));
    setFieldErrors({});
    setFormError("");
    setFormNotice(`${account.label} demo credentials filled. Select Login to continue.`);
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
          <div
            aria-live="assertive"
            className="mt-5 flex gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            <AlertCircle className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
            <p>{formError}</p>
          </div>
        ) : null}

        {formNotice ? (
          <div
            aria-live="polite"
            className="mt-5 flex gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
            <p>{formNotice}</p>
          </div>
        ) : null}

        <form className="mt-6 grid gap-4" noValidate onSubmit={handleSubmit}>
          {isRegister ? (
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                autoComplete="name"
                id="name"
                name="name"
                onChange={(event) => updateValue("name", event.target.value)}
                placeholder="Your name"
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
                aria-invalid={Boolean(fieldErrors.name)}
                required
                value={values.name}
              />
              {fieldErrors.name ? (
                <p className="text-xs font-medium text-red-600" id="name-error">
                  {fieldErrors.name}
                </p>
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
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              aria-invalid={Boolean(fieldErrors.email)}
              required
              value={values.email}
            />
            {fieldErrors.email ? (
              <p className="text-xs font-medium text-red-600" id="email-error">
                {fieldErrors.email}
              </p>
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
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              aria-invalid={Boolean(fieldErrors.password)}
              minLength={6}
              required
              value={values.password}
            />
            {fieldErrors.password ? (
              <p className="text-xs font-medium text-red-600" id="password-error">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          {isRegister ? (
            <>
              <fieldset className="grid gap-2" aria-describedby={fieldErrors.role ? "role-error" : undefined}>
                <legend className="text-sm font-semibold text-slate-800">Role</legend>
                <div aria-label="Account role" className="grid grid-cols-2 gap-2" role="radiogroup">
                  {(["TENANT", "LANDLORD"] as const).map((role) => (
                    <button
                      className={`h-10 rounded-md border px-3 text-sm font-semibold transition ${
                        values.role === role
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-slate-300 bg-surface text-slate-700 hover:bg-slate-50"
                      }`}
                      key={role}
                      onClick={() => updateValue("role", role)}
                      aria-checked={values.role === role}
                      role="radio"
                      type="button"
                    >
                      {role === "TENANT" ? "Tenant" : "Landlord"}
                    </button>
                  ))}
                </div>
                {fieldErrors.role ? (
                  <p className="text-xs font-medium text-red-600" id="role-error">
                    {fieldErrors.role}
                  </p>
                ) : null}
              </fieldset>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  autoComplete="tel"
                  id="phone"
                  name="phone"
                  onChange={(event) => updateValue("phone", event.target.value)}
                  placeholder="+8801700000000"
                  aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  value={values.phone}
                />
                {fieldErrors.phone ? (
                  <p className="text-xs font-medium text-red-600" id="phone-error">
                    {fieldErrors.phone}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  autoComplete="street-address"
                  id="address"
                  name="address"
                  onChange={(event) => updateValue("address", event.target.value)}
                  placeholder="Dhaka, Bangladesh"
                  aria-describedby={fieldErrors.address ? "address-error" : undefined}
                  aria-invalid={Boolean(fieldErrors.address)}
                  maxLength={255}
                  value={values.address}
                />
                {fieldErrors.address ? (
                  <p className="text-xs font-medium text-red-600" id="address-error">
                    {fieldErrors.address}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}

          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : null}
            {isSubmitting
              ? isRegister
                ? "Creating account..."
                : "Logging in..."
              : isRegister
                ? "Create account"
                : "Login"}
          </Button>
        </form>

        <SocialLogin
          disabled={isSubmitting || isSocialSubmitting}
          onAuthenticated={completeAuthentication}
          onError={handleSocialError}
          onLoadingChange={setIsSocialSubmitting}
        />

        {isRegister ? (
          <p className="mt-3 text-center text-xs leading-5 text-slate-500">
            Google and Facebook create a tenant account. Landlords should use the registration form.
          </p>
        ) : null}

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
                  onClick={() => handleDemoAccount(account)}
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
            href={`${isRegister ? "/auth/login" : "/auth/register"}${searchParams.get("from") ? `?from=${encodeURIComponent(searchParams.get("from")!)}` : ""}`}
          >
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </div>
    </div>
  );
}
