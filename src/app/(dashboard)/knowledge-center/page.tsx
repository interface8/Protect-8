"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import KnowledgeHeader from "@/components/dashboard/knowledge/KnowledgeHeader";
import KnowledgeCategories from "@/components/dashboard/knowledge/KnowledgeCategories";
import KnowledgeGrid from "@/components/dashboard/knowledge/KnowledgeGrid";
import { Article } from "@/types/knowledge";
import { mockArticles } from "@/lib/mock-data/knowledge";

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

export default function KnowledgeCenterPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch articles (mock data for now)
  useEffect(() => {
    async function fetchArticles() {
      try {
        // TODO: Replace with real API call
        // const res = await fetch("/api/articles");
        // const data = await res.json();
        // setArticles(data.data);

        // Using mock data for now
        setArticles(mockArticles);
        setLoading(false);
      } catch (err) {
        setError("Failed to load articles");
        console.error(err);
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    let result = articles;

    // Filter by category
    if (activeCategory !== "all") {
      result = result.filter((article) => article.category === activeCategory);
    }

    // Filter by search
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query)
      );
    }

    return result;
  }, [articles, activeCategory, debouncedSearch]);

  const handleCardClick = (slug: string) => {
    router.push(`/knowledge-center/${slug}`);
  };

  if (loading) {
    return (
      <div className="w-full bg-[#f3f4f6] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-[#c4922a] animate-spin" />
          <p className="text-sm text-[#554116]/60 animate-pulse">Loading articles...</p>
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
      <KnowledgeHeader
        count={filteredArticles.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <KnowledgeCategories
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <div className="w-full bg-[#f3f4f6]">
        {/* Same max-w-7xl + mx-auto as KnowledgeHeader and KnowledgeCategories */}
        <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
          <KnowledgeGrid articles={filteredArticles} onCardClick={handleCardClick} />
        </div>
      </div>
    </>
  );
}