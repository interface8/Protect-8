"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import LawyerHeader from "@/components/dashboard/lawyers/LawyerHeader";
import LawyerFilters from "@/components/dashboard/lawyers/LawyerFilters";
import LawyerGrid from "@/components/dashboard/lawyers/LawyerGrid";
import { Lawyer } from "@/types/lawyers";
import { mockLawyers } from "@/lib/mock-data/lawyers";

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function FindLawyerPage() {
  const router = useRouter();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch lawyers (mock data for now)
  useEffect(() => {
    async function fetchLawyers() {
      try {
        // TODO: Replace with real API call
        // const res = await fetch("/api/lawyers");
        // const data = await res.json();
        // setLawyers(data.data);

        // Using mock data for now
        setLawyers(mockLawyers);
        setLoading(false);
      } catch (err) {
        setError("Failed to load lawyers");
        console.error(err);
        setLoading(false);
      }
    }
    fetchLawyers();
  }, []);

  // Filter lawyers based on search, filter, and availability
  const filteredLawyers = useMemo(() => {
    let result = lawyers;

    // Filter by availability
    if (activeFilter === "available") {
      result = result.filter((lawyer) => lawyer.availability);
    }

    // Filter by specialty
    if (activeFilter !== "all" && activeFilter !== "available") {
      result = result.filter((lawyer) =>
        lawyer.specialty.toLowerCase().includes(activeFilter.toLowerCase()) ||
        lawyer.subSpecialties.some((sub) =>
          sub.toLowerCase().includes(activeFilter.toLowerCase())
        )
      );
    }

    // Filter by search
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (lawyer) =>
          lawyer.name.toLowerCase().includes(query) ||
          lawyer.specialty.toLowerCase().includes(query) ||
          lawyer.subSpecialties.some((sub) =>
            sub.toLowerCase().includes(query)
          )
      );
    }

    return result;
  }, [lawyers, activeFilter, debouncedSearch]);

  const handleCardClick = (slug: string) => {
    router.push(`/find-a-lawyer/${slug}`);
  };

  if (loading) {
    return (
      <div className="w-full bg-[#f3f4f6] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-[#c4922a] animate-spin" />
          <p className="text-sm text-[#554116]/60 animate-pulse">Loading lawyers...</p>
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
      <LawyerHeader
        count={filteredLawyers.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <LawyerFilters
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
      <div className="w-full bg-[#f3f4f6]">
        <div className="w-full px-4 md:px-6 xl:w-[55%] xl:mx-auto py-8">
          <LawyerGrid lawyers={filteredLawyers} onCardClick={handleCardClick} />
        </div>
      </div>
    </>
  );
}