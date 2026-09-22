"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import RightsDetailContent from "@/components/dashboard/rights/RightsDetailContent";
import { Guide } from "@/types/rights";

export default function GuideDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();

    async function fetchGuide() {
      try {
        const res = await fetch(`/api/rights-guides/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setError(res.status === 404 ? "Guide not found" : "Failed to load guide");
          return;
        }
        setGuide(await res.json());
      } catch (err) {
        if (controller.signal.aborted) return;
        setError("Failed to load guide");
        console.error(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchGuide();
    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#f5f3f0]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#c4922a]" />
          <p className="animate-pulse text-sm text-gray-500">Loading guide...</p>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 bg-[#f5f3f0]">
        <p className="text-red-500">{error || "Guide not found"}</p>
        <Link
          href="/know-your-rights"
          className="text-sm font-medium text-[#c4922a] hover:underline"
        >
          Back to Know Your Rights
        </Link>
      </div>
    );
  }

  return <RightsDetailContent guide={guide} />;
}