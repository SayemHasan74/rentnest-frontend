"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, LoaderCircle, LockKeyhole, LogIn } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SupportConversation } from "@/components/contact/support-conversation";
import type { ContactSubmission, ContactSubmissionPayload } from "@/types/rentnest";

type FieldName = keyof ContactSubmissionPayload;
type FieldErrors = Partial<Record<FieldName, string>>;

export const CONTACT_DRAFT_KEY = "rentnest_contact_draft";

const initialValues: ContactSubmissionPayload = { name: "", email: "", subject: "", message: "" };

const validate = (values: ContactSubmissionPayload): FieldErrors => {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 2) errors.name = "Enter your name (at least 2 characters).";
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.subject.trim().length < 3) errors.subject = "Enter a subject (at least 3 characters).";
  if (values.message.trim().length < 10) errors.message = "Write a message of at least 10 characters.";
  return errors;
};

export function ContactForm() {
  const searchParams = useSearchParams();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{ type: "success" | "error" | "notice"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversations, setConversations] = useState<ContactSubmission[]>([]);
  const [activeConversation, setActiveConversation] = useState<ContactSubmission | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initialize = () => {
      const storedToken = getStoredToken();
      const user = getStoredUser();
      setToken(storedToken);

      let draft: ContactSubmissionPayload | null = null;
      try {
        draft = JSON.parse(window.localStorage.getItem(CONTACT_DRAFT_KEY) ?? "null") as ContactSubmissionPayload | null;
      } catch {
        window.localStorage.removeItem(CONTACT_DRAFT_KEY);
      }

      if (draft) {
        setValues(draft);
        if (storedToken && searchParams.get("resume") === "1") {
          setStatus({ type: "notice", message: "Your message was restored. Review it, then select Send message." });
        }
      } else if (user) {
        setValues((current) => ({ ...current, name: user.name, email: user.email }));
      }

      if (storedToken) api.contact.listMine(storedToken).then(setConversations).catch(() => undefined);
    };
    const timeout = window.setTimeout(initialize, 0);
    return () => window.clearTimeout(timeout);
  }, [searchParams]);

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

    const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])) as ContactSubmissionPayload;
    if (!token) {
      window.localStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify(payload));
      window.location.assign(`/auth/login?from=${encodeURIComponent("/contact?resume=1#contact-form")}`);
      return;
    }

    setIsSubmitting(true);
    setStatus(null);
    try {
      const created = await api.contact.create(token, payload);
      const detailed = await api.contact.details(token, created.id);
      window.localStorage.removeItem(CONTACT_DRAFT_KEY);
      setValues({ ...initialValues, name: detailed.name, email: detailed.email });
      setErrors({});
      setActiveConversation(detailed);
      setConversations((current) => [detailed, ...current]);
      setStatus({ type: "success", message: "Message sent to RentNest support. Continue the conversation below." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof ApiError ? error.message : "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusClass = status?.type === "error"
    ? "border-red-700/30 bg-red-50 text-red-900"
    : status?.type === "notice"
      ? "border-amber-700/30 bg-amber-50 text-amber-950"
      : "border-emerald-700/30 bg-emerald-50 text-emerald-900";

  return (
    <div className="grid gap-10">
      <form className="grid scroll-mt-28 gap-5" id="contact-form" noValidate onSubmit={handleSubmit}>
        {status && <div aria-live="polite" className={`flex gap-3 rounded-md border p-4 text-sm leading-6 ${statusClass}`} role={status.type === "error" ? "alert" : "status"}>
          {status.type === "success" ? <CheckCircle2 className="mt-0.5 shrink-0" size={18} aria-hidden="true" /> : status.type === "notice" ? <LockKeyhole className="mt-0.5 shrink-0" size={18} aria-hidden="true" /> : null}
          <p>{status.message}</p>
        </div>}

        {!token ? <div className="flex gap-3 rounded-md border border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-700"><LogIn className="mt-0.5 shrink-0" size={18} aria-hidden="true" /><p>You can write your message now. When you select Send, we will preserve it and ask you to log in before anything is submitted.</p></div> : <div className="flex gap-3 rounded-md border border-emerald-700/20 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><LockKeyhole className="mt-0.5 shrink-0" size={18} aria-hidden="true" /><p>This message will be securely linked to your signed-in account.</p></div>}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2"><Label htmlFor="contact-name">Name</Label><Input aria-describedby={errors.name ? "contact-name-error" : undefined} aria-invalid={Boolean(errors.name)} autoComplete="name" id="contact-name" onChange={(event) => updateValue("name", event.target.value)} required value={values.name} />{errors.name && <p className="text-sm text-red-700" id="contact-name-error">{errors.name}</p>}</div>
          <div className="grid gap-2"><Label htmlFor="contact-email">Email</Label><Input aria-describedby={errors.email ? "contact-email-error" : undefined} aria-invalid={Boolean(errors.email)} autoComplete="email" id="contact-email" inputMode="email" onChange={(event) => updateValue("email", event.target.value)} required type="email" value={values.email} />{errors.email && <p className="text-sm text-red-700" id="contact-email-error">{errors.email}</p>}</div>
        </div>
        <div className="grid gap-2"><Label htmlFor="contact-subject">Subject</Label><Input aria-describedby={errors.subject ? "contact-subject-error" : undefined} aria-invalid={Boolean(errors.subject)} id="contact-subject" onChange={(event) => updateValue("subject", event.target.value)} required value={values.subject} />{errors.subject && <p className="text-sm text-red-700" id="contact-subject-error">{errors.subject}</p>}</div>
        <div className="grid gap-2"><Label htmlFor="contact-message">How can we help?</Label><Textarea aria-describedby={errors.message ? "contact-message-error" : undefined} aria-invalid={Boolean(errors.message)} id="contact-message" onChange={(event) => updateValue("message", event.target.value)} required value={values.message} />{errors.message && <p className="text-sm text-red-700" id="contact-message-error">{errors.message}</p>}</div>
        <Button className="w-full sm:w-fit" disabled={isSubmitting} size="lg" type="submit">{isSubmitting && <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />}{isSubmitting ? "Sending message…" : token ? "Send message" : "Continue to login"}</Button>
      </form>

      {token ? <section className="scroll-mt-28 border-t border-slate-300 pt-8" id="support-inbox"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Your support inbox</p><h2 className="mt-2 text-3xl font-semibold text-slate-950">Conversations with RentNest</h2>{conversations.length ? <div className="mt-5 grid gap-3">{conversations.map((conversation) => <button className={`flex w-full items-center justify-between rounded-md border p-4 text-left ${conversation.unreadForUser ? "border-emerald-700 bg-emerald-50" : "border-slate-300 bg-white"}`} key={conversation.id} onClick={() => setActiveConversation(conversation)} type="button"><span><b className="block text-slate-950">{conversation.subject}</b><span className="mt-1 block text-xs text-slate-500">Updated {new Date(conversation.updatedAt).toLocaleString()}</span></span><span className="text-xs font-semibold uppercase text-slate-500">{conversation.status}</span></button>)}</div> : <p className="mt-4 text-sm text-slate-600">You have no support conversations yet.</p>}</section> : null}

      {token && activeConversation ? <SupportConversation conversation={activeConversation} onChange={(updated) => { setActiveConversation(updated); setConversations((current) => current.map((item) => item.id === updated.id ? updated : item)); }} token={token} /> : null}
    </div>
  );
}
