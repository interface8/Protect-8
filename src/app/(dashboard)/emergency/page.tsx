"use client";

import { useCallback, useEffect, useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, MapPin, Star, X } from "lucide-react";
import LawyerAvatar from "@/components/dashboard/lawyers/LawyerAvatar";
import { Lawyer } from "@/types/lawyers";
import { fetchWithSession } from "@/lib/auth/fetchWithSession";

interface Category { id: string; key: string; label: string }

function readStoredLocation(): { lat: number; lng: number } | null {
  try {
    const raw = sessionStorage.getItem("protect8:location");
    const parsed = raw ? JSON.parse(raw) : null;
    return typeof parsed?.lat === "number" && typeof parsed?.lng === "number" ? parsed : null;
  } catch { return null; }
}

export default function EmergencyPage() {
  return <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center bg-[#f5f3f0]"><Loader2 className="h-8 w-8 animate-spin text-[#c4922a]" /></div>}><EmergencyPageContent /></Suspense>;
}

function EmergencyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("categoryId");
  const categoryKey = searchParams.get("category") ?? "";
  const [category, setCategory] = useState<Category | null>(null);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingLawyerId, setConnectingLawyerId] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const [categoryResponse, location] = await Promise.all([
          fetch("/api/emergency-categories", { signal: controller.signal }),
          Promise.resolve(readStoredLocation()),
        ]);
        if (!categoryResponse.ok) throw new Error("Could not load this situation.");
        const body = await categoryResponse.json();
        const categories: Category[] = body.data ?? [];
        const selected = categories.find((item) =>
          categoryIdParam ? item.id === categoryIdParam : item.key === categoryKey
        ) ?? null;
        setCategory(selected);
        const query = new URLSearchParams({ limit: "20" });
        const selectedKey = selected?.key ?? categoryKey;
        if (selectedKey) query.set("categoryKey", selectedKey);
        if (location) {
          query.set("userLatitude", String(location.lat));
          query.set("userLongitude", String(location.lng));
        }
        const lawyersResponse = await fetch(`/api/lawyers/available?${query}`, { signal: controller.signal });
        if (!lawyersResponse.ok) throw new Error("Could not load available lawyers.");
        const lawyerBody = await lawyersResponse.json();
        setLawyers(lawyerBody.data ?? []);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load lawyers.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [categoryIdParam, categoryKey]);

  const connect = useCallback(async (lawyer: Lawyer) => {
    setConnectingLawyerId(lawyer.id);
    setError("");
    try {
      const auth = await fetchWithSession("/api/users/me");
      const targetParams = new URLSearchParams();
      if (category) targetParams.set("category", category.label);
      const suffix = targetParams.toString();
      const profileUrl = `/find-a-lawyer/${encodeURIComponent(lawyer.id)}${suffix ? `?${suffix}` : ""}`;
      if (!auth.ok) {
        setSelectedLawyer(lawyer);
        setAuthModal(true);
        return;
      }
      router.push(profileUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not open this lawyer's profile.");
    } finally { setConnectingLawyerId(null); }
  }, [category, router]);

  const selectedProfileUrl = selectedLawyer
    ? `/find-a-lawyer/${encodeURIComponent(selectedLawyer.id)}${category ? `?${new URLSearchParams({ category: category.label })}` : ""}`
    : "/find-a-lawyer";

  return <div className="min-h-[calc(100vh-4rem)] bg-[#f5f3f0]">
    <div className="bg-[#0a0a0a] text-white">
      <div className="mx-auto w-[90%] max-w-3xl py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"><ChevronLeft className="h-4 w-4" />Home</Link>
        <h1 className="mt-4 text-2xl font-medium">Available lawyers</h1>
        <p className="mt-1 text-sm text-white/50">{category ? `For ${category.label}` : "Browse lawyers available to help"}</p>
      </div>
    </div>
    <div className="mx-auto w-[90%] max-w-3xl space-y-3 py-6">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#c4922a]" /></div> : lawyers.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center"><p className="font-medium">No lawyers are available right now.</p><p className="mt-2 text-sm text-gray-500">Please check back soon or browse all lawyers.</p><Link href="/find-a-lawyer" className="mt-4 inline-block text-sm font-medium text-[#c4922a]">Browse all lawyers</Link></div>
      ) : lawyers.map((lawyer) => <article key={lawyer.id} className="flex flex-col gap-4 rounded-2xl border border-black/[0.06] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/find-a-lawyer/${lawyer.id}`} className="flex min-w-0 items-center gap-3">
          <LawyerAvatar name={lawyer.name} src={lawyer.avatar} status={lawyer.availabilityStatus} />
          <div className="min-w-0"><h2 className="font-medium text-[#0a0a0a]">{lawyer.name}</h2><p className="text-sm text-gray-500">{lawyer.practiceArea}</p><p className="flex items-center gap-1 text-xs text-gray-400">{lawyer.location && <><MapPin className="h-3 w-3" />{lawyer.location}</>}{lawyer.rating > 0 && <><Star className="ml-2 h-3 w-3 fill-[#c4922a] text-[#c4922a]" />{lawyer.rating.toFixed(1)}</>}</p></div>
        </Link>
        <button type="button" onClick={() => connect(lawyer)} disabled={connectingLawyerId === lawyer.id || loading} className="h-11 shrink-0 rounded-xl bg-[#0a0a0a] px-5 text-sm font-medium text-white hover:bg-[#252525] disabled:opacity-60">{connectingLawyerId === lawyer.id ? "Opening profile..." : "Connect"}</button>
      </article>)}
    </div>
    {authModal && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button type="button" aria-label="Close" onClick={() => setAuthModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
        <h2 id="auth-title" className="text-xl font-semibold">Sign in to continue</h2><p className="mt-2 text-sm text-gray-500">Sign in or create an account to continue to {selectedLawyer?.name}&apos;s profile and send an enquiry.</p>
        <div className="mt-6 grid grid-cols-2 gap-3"><Link href={`/login?returnTo=${encodeURIComponent(selectedProfileUrl)}`} className="flex h-11 items-center justify-center rounded-xl bg-[#0a0a0a] text-sm font-medium text-white">Sign in</Link><Link href={`/register?returnTo=${encodeURIComponent(selectedProfileUrl)}`} className="flex h-11 items-center justify-center rounded-xl border border-black/10 text-sm font-medium">Sign up</Link></div>
      </div>
    </div>}
  </div>;
}
