"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { fetchWithSession } from "@/lib/auth/fetchWithSession";

interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
}
interface ChatRequest {
  id: string;
  citizenId: string;
  lawyerId: string | null;
  status: string;
  citizen: { id: string; name: string };
  lawyer: { id: string; name: string } | null;
}

export default function RequestChat({ requestId, currentUserId, currentRole }: { requestId: string; currentUserId: string; currentRole: "citizen" | "lawyer" }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [request, setRequest] = useState<ChatRequest | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const closed = request?.status === "COMPLETED" || request?.status === "CANCELLED";

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetchWithSession(`/api/requests/${encodeURIComponent(requestId)}/messages`, { signal });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? "Could not load this conversation");
      setMessages(body.data ?? []);
      setRequest(body.request ?? null);
      setError("");
    } catch (cause) {
      if (signal?.aborted) return;
      setError(cause instanceof Error ? cause.message : "Could not load this conversation");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    const interval = window.setInterval(() => void refresh(), 3500);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, [refresh]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const content = text.trim();
    if (!content || sending || closed) return;
    setSending(true);
    setError("");
    try {
      const response = await fetchWithSession(`/api/requests/${encodeURIComponent(requestId)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? "Message could not be sent");
      setText("");
      setMessages((current) => current.some((message) => message.id === body.id) ? current : [...current, body]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Message could not be sent");
    } finally { setSending(false); }
  }

  const otherName = request ? (currentRole === "lawyer" ? request.citizen.name : request.lawyer?.name ?? "Lawyer") : "Conversation";

  return <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col bg-[#f5f3f0] px-4 py-5 md:px-8">
    <header className="mb-4 flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-4">
      <Link href={currentRole === "lawyer" ? "/lawyer" : "/dashboard"} aria-label="Back" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><ArrowLeft className="h-5 w-5" /></Link>
      <div className="min-w-0 flex-1"><h1 className="truncate font-semibold">{otherName}</h1><p className="text-xs text-gray-500">{request ? `${request.status.replaceAll("_", " ")} · Request ${request.id.slice(-8)}` : "Secure lawyer enquiry"}</p></div>
      {request && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{request.status.replaceAll("_", " ")}</span>}
    </header>

    <section aria-label="Messages" className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-black/[0.06] bg-white p-4 md:p-6">
      {loading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#c4922a]" /></div> : messages.length === 0 ? <p className="py-10 text-center text-sm text-gray-500">This conversation is ready. Send the first message.</p> : messages.map((message) => {
        const mine = message.senderId === currentUserId;
        return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><article className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[72%] ${mine ? "rounded-br-md bg-[#111] text-white" : "rounded-bl-md bg-[#f1efeb] text-[#171717]"}`}><p className="mb-1 text-[11px] font-medium opacity-60">{mine ? "You" : message.sender.name}</p><p className="whitespace-pre-wrap break-words text-sm">{message.content}</p><time className="mt-2 block text-right text-[10px] opacity-50">{new Date(message.createdAt).toLocaleString()}</time></article></div>;
      })}<div ref={endRef} />
    </section>

    {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    {closed ? <p className="mt-3 rounded-xl border border-black/[0.06] bg-white p-4 text-center text-sm text-gray-500">This request is closed. You can read the conversation above.</p> : <form onSubmit={send} className="mt-3 flex items-end gap-2 rounded-2xl border border-black/[0.06] bg-white p-3"><textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={5000} rows={2} placeholder="Write a message…" className="max-h-40 min-h-12 flex-1 resize-y rounded-xl border-0 px-2 py-2 text-sm outline-none focus:ring-0" aria-label="Message" /><button type="submit" disabled={!text.trim() || sending} className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#111] px-4 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-40">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}<span className="hidden sm:inline">Send</span></button></form>}
    <p className="mt-2 text-center text-[11px] text-gray-400">Messages refresh automatically while this page is open.</p>
  </div>;
}
