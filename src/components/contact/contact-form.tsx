"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { ContactSubmissionPayload } from "@/types/rentnest";

type FieldName = keyof ContactSubmissionPayload;
type FieldErrors = Partial<Record<FieldName, string>>;

const initialValues: ContactSubmissionPayload = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const validate = (values: ContactSubmissionPayload): FieldErrors => {
  const errors: FieldErrors = {};

  if (values.name.trim().length < 2) errors.name = "Enter your name (at least 2 characters).";
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.subject.trim().length < 3) errors.subject = "Enter a subject (at least 3 characters).";
  if (values.message.trim().length < 10) errors.message = "Write a message of at least 10 characters.";

  return errors;
};

export function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (field: FieldName, value: string) => {
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

    setIsSubmitting(true);
    setStatus(null);

    try {
      await api.contact.create({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      });
      setValues(initialValues);
      setErrors({});
      setStatus({ type: "success", message: "Thanks — your message has been received. The RentNest team will review it." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
      {status && (
        <div
          aria-live="polite"
          className={status.type === "success" ? "flex gap-3 rounded-md border border-emerald-700/30 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900" : "rounded-md border border-red-700/30 bg-red-50 p-4 text-sm leading-6 text-red-900"}
          role={status.type === "error" ? "alert" : "status"}
        >
          {status.type === "success" && <CheckCircle2 className="mt-0.5 shrink-0" size={18} aria-hidden="true" />}
          <p>{status.message}</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input aria-describedby={errors.name ? "contact-name-error" : undefined} aria-invalid={Boolean(errors.name)} autoComplete="name" id="contact-name" onChange={(event) => updateValue("name", event.target.value)} required value={values.name} />
          {errors.name && <p className="text-sm text-red-700" id="contact-name-error">{errors.name}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input aria-describedby={errors.email ? "contact-email-error" : undefined} aria-invalid={Boolean(errors.email)} autoComplete="email" id="contact-email" inputMode="email" onChange={(event) => updateValue("email", event.target.value)} required type="email" value={values.email} />
          {errors.email && <p className="text-sm text-red-700" id="contact-email-error">{errors.email}</p>}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input aria-describedby={errors.subject ? "contact-subject-error" : undefined} aria-invalid={Boolean(errors.subject)} id="contact-subject" onChange={(event) => updateValue("subject", event.target.value)} required value={values.subject} />
        {errors.subject && <p className="text-sm text-red-700" id="contact-subject-error">{errors.subject}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-message">How can we help?</Label>
        <Textarea aria-describedby={errors.message ? "contact-message-error" : undefined} aria-invalid={Boolean(errors.message)} id="contact-message" onChange={(event) => updateValue("message", event.target.value)} required value={values.message} />
        {errors.message && <p className="text-sm text-red-700" id="contact-message-error">{errors.message}</p>}
      </div>
      <Button className="w-full sm:w-fit" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting && <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />}
        {isSubmitting ? "Sending message…" : "Send message"}
      </Button>
    </form>
  );
}
