"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { fetchWithSession } from "@/lib/auth/fetchWithSession";
import RatingModal from "@/components/dashboard/lawyers/RatingModal";

type Item = { id: string; title: string; category: string; description: string | null; status: string; createdAt: string; hasRated?: boolean; lawyer: { id: string; name: string } | null };

export default function MyRequests() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingRequest, setRatingRequest] = useState<Item | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetchWithSession("/api/requests?limit=100");
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message ?? "Could not load your enquiries");
      setItems(body.data ?? []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load your enquiries"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-5xl bg-[#f5f3f0] px-4 py-8 md:px-8"><div className="mb-6 flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c4922a]">Your account</p><h1 className="mt-1 text-2xl font-semibold">My enquiries</h1><p className="mt-1 text-sm text-gray-500">Follow up on requests and continue your lawyer conversations.</p></div><button type="button" onClick={() => void load()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm"><RefreshCw className="h-4 w-4" />Refresh</button></div>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-[#c4922a]" /></div> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center"><h2 className="font-medium">No enquiries yet</h2><p className="mt-1 text-sm text-gray-500">Choose a lawyer and start a chat or send a consultation request.</p><Link href="/find-a-lawyer" className="mt-4 inline-flex text-sm font-medium text-[#a5771d]">Find a lawyer</Link></div> : <div className="space-y-3">{items.map((item) => <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{item.title}</h2><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{item.status.replaceAll("_", " ")}</span></div><p className="mt-1 text-sm text-gray-500">{item.category} · {item.lawyer ? `Lawyer: ${item.lawyer.name}` : "Waiting for lawyer assignment"} · {new Date(item.createdAt).toLocaleDateString()}</p>{item.description && <p className="mt-2 line-clamp-2 text-sm text-gray-700">{item.description}</p>}</div><div className="flex shrink-0 flex-wrap gap-2">{item.lawyer ? <Link href={`/requests/${item.id}/chat`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#111] px-4 text-sm font-medium text-white"><MessageCircle className="h-4 w-4" />Open chat</Link> : <span className="inline-flex items-center text-xs text-gray-400">Chat opens when a lawyer is assigned.</span>}{item.status === "COMPLETED" && item.lawyer && !item.hasRated && <button type="button" onClick={() => setRatingRequest(item)} className="h-10 rounded-xl border border-[#c4922a] px-4 text-sm font-medium text-[#8a6115] hover:bg-[#c4922a]/10">Rate experience</button>}{item.hasRated && <span className="inline-flex items-center text-xs text-green-700">Rated</span>}</div></article>)}</div>}
    {ratingRequest?.lawyer && <RatingModal isOpen onClose={() => setRatingRequest(null)} onRated={() => setItems((current) => current.map((item) => item.id === ratingRequest.id ? { ...item, hasRated: true } : item))} lawyerName={ratingRequest.lawyer.name} lawyerId={ratingRequest.lawyer.id} requestId={ratingRequest.id} />}
  </main>;
}
