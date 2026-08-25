"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RightsHeader from "@/components/dashboard/rights/RightsHeader";
import RightsCardGrid from "@/components/dashboard/rights/RightsCardGrid";
import { Guide } from "@/types/rights";

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
        <p className="text-[#554116]">Loading rights guides...</p>
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