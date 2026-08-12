"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Archive, Inbox, LoaderCircle, RefreshCw, Search } from "lucide-react";
import { SupportConversation } from "@/components/contact/support-conversation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { api } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-session";
import type { ContactSubmission } from "@/types/rentnest";

export function AdminSupportInbox() {
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<"" | "OPEN" | "CLOSED">("");
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const token = typeof window === "undefined" ? null : getStoredToken();

  const load = useCallback(async () => {
    const accessToken = getStoredToken();
    if (!accessToken) { setError("Please log in as an admin."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const result = await api.admin.contactSubmissions(accessToken, { search: appliedSearch || undefined, status: status || undefined, page, limit: 10 });
      setItems(result.submissions); setUnread(result.unread); setTotalPages(Math.max(result.meta.totalPages, 1));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Support inbox could not be loaded."); }
    finally { setLoading(false); }
  }, [appliedSearch, page, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const submitSearch = (event: FormEvent) => { event.preventDefault(); setPage(1); setAppliedSearch(search.trim()); };
  const replace = (updated: ContactSubmission) => {
    setSelected(updated);
    setItems((current) => {
      const previous = current.find((item) => item.id === updated.id);
      if (previous?.unreadForAdmin && !updated.unreadForAdmin) {
        setUnread((count) => Math.max(0, count - 1));
      }
      return current.map((item) => item.id === updated.id ? updated : item);
    });
  };
  const changeStatus = async (item: ContactSubmission) => {
    if (!token) return;
    try { await api.admin.updateContactStatus(token, item.id, item.status === "OPEN" ? "CLOSED" : "OPEN"); const updated = await api.contact.details(token, item.id); replace(updated); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Status could not be changed."); }
  };

  return <section className="scroll-mt-24 rounded-lg border border-slate-300 bg-white p-5 sm:p-7" id="support-inbox">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Admin support</p><h2 className="mt-2 text-3xl font-semibold text-slate-950">Support inbox</h2><p className="mt-2 text-sm text-slate-600">Reply to authenticated users inside RentNest. <b>{unread}</b> unread.</p></div><Button onClick={() => void load()} variant="outline"><RefreshCw size={16} />Refresh</Button></div>
    <form className="mt-6 grid gap-3 sm:grid-cols-[1fr_11rem_auto]" onSubmit={submitSearch}><div><Label className="sr-only" htmlFor="support-search">Search messages</Label><Input id="support-search" onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, subject…" value={search} /></div><select aria-label="Filter support status" className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm" onChange={(e) => { setPage(1); setStatus(e.target.value as typeof status); }} value={status}><option value="">All statuses</option><option value="OPEN">Open</option><option value="CLOSED">Closed</option></select><Button type="submit"><Search size={16} />Search</Button></form>
    {error ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p> : null}
    {loading ? <p className="mt-6 flex items-center gap-2 text-sm text-slate-600"><LoaderCircle className="animate-spin" size={17} />Loading support conversations…</p> : items.length ? <div className="mt-6 grid gap-3">{items.map((item) => <div className={`rounded-md border p-4 ${item.unreadForAdmin ? "border-emerald-700 bg-emerald-50" : "border-slate-300"}`} key={item.id}><div className="flex flex-wrap items-center justify-between gap-3"><button className="min-w-0 flex-1 text-left" onClick={() => setSelected(item)} type="button"><span className="block truncate font-semibold text-slate-950">{item.subject}</span><span className="mt-1 block text-xs text-slate-600">{item.name} · {item.email} · {new Date(item.updatedAt).toLocaleString()}</span></button><Button onClick={() => void changeStatus(item)} size="sm" variant="outline"><Archive size={15} />{item.status === "OPEN" ? "Close" : "Reopen"}</Button></div></div>)}</div> : <div className="mt-6 rounded-md border border-dashed border-slate-300 p-8 text-center"><Inbox className="mx-auto text-slate-400" size={32} /><p className="mt-3 font-semibold text-slate-800">No matching conversations</p></div>}
    <div className="mt-5 flex items-center justify-between"><Button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} variant="outline">Previous</Button><span className="text-xs text-slate-500">Page {page} of {totalPages}</span><Button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} variant="outline">Next</Button></div>
    {selected && token ? <div className="mt-8"><SupportConversation admin conversation={selected} onChange={replace} onClose={() => setSelected(null)} token={token} /></div> : null}
  </section>;
}
