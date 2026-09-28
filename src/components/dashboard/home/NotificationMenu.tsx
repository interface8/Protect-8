"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BriefcaseBusiness, Loader2, MessageCircle, X } from "lucide-react";
import { fetchWithSession } from "@/lib/auth/fetchWithSession";

type NotificationItem = {
  id: string;
  type: "NEW_MESSAGE" | "REQUEST_ASSIGNED" | "REQUEST_STARTED" | "REQUEST_COMPLETED" | "REQUEST_UPDATED";
  title: string;
  body: string;
  href: string;
  readAt: string | null;
  createdAt: string;
};

function timeLabel(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(value).toLocaleDateString();
}

export default function NotificationMenu() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetchWithSession("/api/notifications", { signal, cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? "Could not load notifications");
      setItems(body.data ?? []);
      setUnreadCount(body.unreadCount ?? 0);
      setError("");
    } catch (cause) {
      if (!signal?.aborted) setError(cause instanceof Error ? cause.message : "Could not load notifications");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 30000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeEscape); };
  }, [open]);

  async function markRead(id?: string) {
    const response = await fetchWithSession("/api/notifications", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { id } : { all: true }),
    });
    if (!response.ok) throw new Error("Could not update notifications");
    if (id) {
      setItems((current) => current.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item));
      setUnreadCount((count) => Math.max(0, count - (items.find((item) => item.id === id && !item.readAt) ? 1 : 0)));
    } else {
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
      setUnreadCount(0);
    }
  }

  async function openNotification(item: NotificationItem) {
    try { if (!item.readAt) await markRead(item.id); } catch { /* navigation remains available if updating read state fails */ }
    setOpen(false);
    router.push(item.href);
  }

  async function markAllRead() {
    try { await markRead(); } catch { setError("Could not mark notifications as read. Try again."); }
  }

  return <div ref={rootRef} className="relative">
    <button type="button" aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"} aria-haspopup="dialog" aria-expanded={open} onClick={() => { setOpen((value) => !value); if (!open) { setLoading(true); void refresh(); } }} className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition-colors hover:bg-white/10 md:h-10 md:w-10">
      <Bell className="h-4 w-4 text-white/70 md:h-[18px] md:w-[18px]" />
      {unreadCount > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#0a0a0a] bg-[#c4922a] px-1 text-[9px] font-bold leading-none text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
    </button>
    {open && <section role="dialog" aria-label="Notifications" className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-black/10 bg-white text-[#171717] shadow-[0_18px_55px_rgba(0,0,0,0.22)]">
      <header className="flex items-center justify-between border-b border-black/[0.06] px-4 py-4"><div><h2 className="font-semibold">Notifications</h2><p className="mt-0.5 text-xs text-gray-500">Updates about your enquiries and messages</p></div><div className="flex items-center gap-1">{unreadCount > 0 && <button type="button" onClick={() => void markAllRead()} className="rounded-lg px-2 py-2 text-xs font-medium text-[#8b651c] hover:bg-amber-50">Mark all read</button>}<button type="button" aria-label="Close notifications" onClick={() => setOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X className="h-4 w-4" /></button></div></header>
      <div className="max-h-[min(65vh,440px)] overflow-y-auto">
        {error ? <div className="px-5 py-8 text-center"><p className="text-sm font-medium text-gray-700">Notifications aren’t available</p><p className="mt-1 text-xs leading-5 text-gray-500">{error}</p><button type="button" onClick={() => { setLoading(true); void refresh(); }} className="mt-3 text-xs font-semibold text-[#8b651c]">Try again</button></div>
          : loading && items.length === 0 ? <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-[#b08329]" /></div>
          : items.length === 0 ? <div className="px-5 py-10 text-center"><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"><Bell className="h-4 w-4 text-gray-400" /></span><p className="mt-3 text-sm font-medium">You’re all caught up</p><p className="mt-1 text-xs text-gray-500">New messages and enquiry updates will appear here.</p></div>
          : <ul className="divide-y divide-black/[0.05]">{items.map((item) => <li key={item.id}><button type="button" onClick={() => void openNotification(item)} className={`flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-50 ${!item.readAt ? "bg-[#fbf8f1]" : "bg-white"}`}><span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.type === "NEW_MESSAGE" ? "bg-blue-50 text-blue-700" : "bg-[#f5f0e4] text-[#91691c]"}`}>{item.type === "NEW_MESSAGE" ? <MessageCircle className="h-4 w-4" /> : <BriefcaseBusiness className="h-4 w-4" />}</span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><span className="text-sm font-semibold">{item.title}</span><time className="shrink-0 pt-0.5 text-[10px] text-gray-400">{timeLabel(item.createdAt)}</time></span><span className="mt-1 line-clamp-2 block text-xs leading-5 text-gray-600">{item.body}</span></span>{!item.readAt && <span aria-label="Unread" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#c4922a]" />}</button></li>)}</ul>}
      </div>
      {items.length > 0 && <footer className="border-t border-black/[0.06] px-4 py-3 text-center"><button type="button" onClick={() => { setOpen(false); router.push("/my-requests"); }} className="text-xs font-semibold text-[#8b651c] hover:underline">View my enquiries</button></footer>}
    </section>}
  </div>;
}
