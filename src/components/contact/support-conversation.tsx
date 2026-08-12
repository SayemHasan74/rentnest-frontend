"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoaderCircle, Send, X } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import type { ContactSubmission } from "@/types/rentnest";

export function SupportConversation({ conversation, token, onChange, admin = false, onClose }: { conversation: ContactSubmission; token: string; onChange: (value: ContactSubmission) => void; admin?: boolean; onClose?: () => void }) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unread = admin ? conversation.unreadForAdmin : conversation.unreadForUser;
    if (unread) api.contact.markRead(token, conversation.id).then(onChange).catch(() => undefined);
  }, [admin, conversation.id, conversation.unreadForAdmin, conversation.unreadForUser, onChange, token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!reply.trim()) return;
    setSending(true); setError("");
    try { const updated = await api.contact.reply(token, conversation.id, reply.trim()); setReply(""); onChange(updated); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Reply could not be sent."); }
    finally { setSending(false); }
  };

  const canReply = conversation.status === "OPEN" && (!admin || Boolean(conversation.userId));

  return <section aria-label={`Conversation: ${conversation.subject}`} className="rounded-lg border border-slate-300 bg-white p-5 shadow-lg">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{conversation.status} conversation</p><h3 className="mt-1 text-xl font-semibold text-slate-950">{conversation.subject}</h3>{admin ? <p className="mt-1 text-sm text-slate-600">{conversation.name} · {conversation.email}</p> : null}</div>{onClose ? <button aria-label="Close conversation" className="rounded p-2 hover:bg-slate-100" onClick={onClose} type="button"><X size={18} /></button> : null}</div>
    <div className="mt-5 max-h-96 space-y-3 overflow-y-auto rounded-md bg-slate-50 p-4">{conversation.messages?.map((item) => { const own = admin ? item.senderRole === "ADMIN" : item.senderRole === "USER"; return <div className={`flex ${own ? "justify-end" : "justify-start"}`} key={item.id}><div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-6 ${own ? "bg-emerald-800 text-white" : "border border-slate-200 bg-white text-slate-800"}`}><p>{item.message}</p><p className={`mt-1 text-[10px] ${own ? "text-emerald-100" : "text-slate-400"}`}>{item.sender.name} · {new Date(item.createdAt).toLocaleString()}</p></div></div>; })}</div>
    {canReply ? <form className="mt-4 grid gap-3" onSubmit={submit}><Label htmlFor={`reply-${conversation.id}`}>Reply</Label><Textarea id={`reply-${conversation.id}`} maxLength={2000} onChange={(event) => setReply(event.target.value)} placeholder="Write your reply…" value={reply} />{error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}<Button className="w-fit" disabled={sending || !reply.trim()} type="submit">{sending ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={16} />}{sending ? "Sending…" : "Send reply"}</Button></form> : <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-slate-600">{conversation.status === "CLOSED" ? "This conversation is closed. An admin can reopen it." : "This older anonymous message is kept for records, but internal replies require a linked user account."}</p>}
  </section>;
}
