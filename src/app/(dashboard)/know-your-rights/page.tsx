"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import RightsHeader from "@/components/dashboard/rights/RightsHeader";
import RightsCardGrid from "@/components/dashboard/rights/RightsCardGrid";
import { Guide } from "@/types/rights";

export default function KnowYourRightsPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchGuides() {
      try {
        const res = await fetch("/api/rights-guides", { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to fetch guides");
        const data = await res.json();
        setGuides(data.data ?? []);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError("Failed to load rights guides");
        console.error(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchGuides();
    return () => controller.abort();
  }, []);

  const filteredGuides = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return guides;
    return guides.filter(
      (guide) =>
        guide.title.toLowerCase().includes(query) ||
        guide.shortDescription.toLowerCase().includes(query)
    );
  }, [guides, searchQuery]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#f5f3f0]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#c4922a]" />
          <p className="animate-pulse text-sm text-gray-500">Loading rights guides...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#f5f3f0]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f5f3f0]">
      <RightsHeader
        count={guides.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="mx-auto w-[90%] max-w-[688px] pb-10 pt-6">
        {filteredGuides.length > 0 ? (
          <RightsCardGrid guides={filteredGuides} />
        ) : (
          <p className="py-10 text-center text-sm text-gray-500">
            No scenarios match &quot;{searchQuery}&quot;.
          </p>
        )}
      </div>
    </div>
  );
}