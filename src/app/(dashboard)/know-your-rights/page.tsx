"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RightsHeader from "@/components/dashboard/rights/RightsHeader";
import RightsCardGrid from "@/components/dashboard/rights/RightsCardGrid";
import { Guide } from "@/types/rights";
import { Loader2 } from "lucide-react";

export default function KnowYourRightsPage() {
  const router = useRouter();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGuides() {
      try {
        const res = await fetch("/api/rights-guides");
        if (!res.ok) throw new Error("Failed to fetch guides");
        const data = await res.json();
        setGuides(data.data);
        setFilteredGuides(data.data);
      } catch (err) {
        setError("Failed to load rights guides");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchGuides();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGuides(guides);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const filtered = guides.filter(
      (guide) =>
        guide.title.toLowerCase().includes(query) ||
        guide.shortDescription.toLowerCase().includes(query)
    );
    setFilteredGuides(filtered);
  }, [searchQuery, guides]);

  const handleCardClick = (slug: string) => {
    router.push(`/know-your-rights/${slug}`);
  };

  if (loading) {
    return (
      <div className="w-full bg-[#f3f4f6] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-[#c4922a] animate-spin" />
          <p className="text-sm text-[#554116]/60 animate-pulse">Loading rights guides...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#f3f4f6] min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <RightsHeader
        count={filteredGuides.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="w-full bg-[#f3f4f6]">
        <div className="w-full px-4 md:px-6 xl:w-[55%] xl:mx-auto py-8">
          <RightsCardGrid guides={filteredGuides} onCardClick={handleCardClick} />
        </div>
      </div>
    </>
  );
}