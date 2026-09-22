"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import LawyerHeader from "@/components/dashboard/lawyers/LawyerHeader";
import LawyerFilters from "@/components/dashboard/lawyers/LawyerFilters";
import LawyerGrid from "@/components/dashboard/lawyers/LawyerGrid";
import { Lawyer } from "@/types/lawyers";

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function FindLawyerPage() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [availableCount, setAvailableCount] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchLawyers() {
      try {
        const res = await fetch("/api/lawyers", { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to fetch lawyers");
        const data = await res.json();
        const list: Lawyer[] = data.data ?? [];
        setLawyers(list);
        setAvailableCount(
          data.availableNowCount ??
            list.filter((l) => l.availabilityStatus === "AVAILABLE").length
        );
      } catch (err) {
        if (controller.signal.aborted) return;
        setError("Failed to load lawyers");
        console.error(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchLawyers();
    return () => controller.abort();
  }, []);

  const filteredLawyers = useMemo(() => {
    let result = lawyers;

    if (activeFilter === "available") {
      result = result.filter((l) => l.availabilityStatus === "AVAILABLE");
    } else if (activeFilter !== "all") {
      const filter = activeFilter.toLowerCase();
      result = result.filter(
        (l) =>
          l.practiceArea.toLowerCase().includes(filter) ||
          l.specialtyTags.some((tag) => tag.toLowerCase().includes(filter))
      );
    }

    const query = debouncedSearch.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          l.practiceArea.toLowerCase().includes(query) ||
          l.specialtyTags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [lawyers, activeFilter, debouncedSearch]);

  const scrollToFilters = () =>
    document
      .getElementById("lawyer-filters")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#f5f3f0]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#c4922a]" />
          <p className="animate-pulse text-sm text-gray-500">Loading lawyers...</p>
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
      <LawyerHeader
        count={availableCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFilterClick={scrollToFilters}
      />
      <LawyerFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      <div className="mx-auto w-[90%] max-w-[944px] pb-10 pt-5">
        <LawyerGrid lawyers={filteredLawyers} />
      </div>
    </div>
  );
}