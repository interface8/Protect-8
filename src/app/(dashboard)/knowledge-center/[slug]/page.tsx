"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Article, categoryDisplayMap, categoryColorMap } from "@/types/knowledge";
import { mockArticles } from "@/lib/mock-data/knowledge";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchArticle() {
      try {
        // TODO: Replace with real API call
        // const res = await fetch(`/api/articles/${slug}`);
        // if (!res.ok) throw new Error("Article not found");
        // const data = await res.json();
        // setArticle(data);

        // Using mock data for now
        const found = mockArticles.find((a) => a.slug === slug);
        if (!found) throw new Error("Article not found");
        setArticle(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load article");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full bg-[#f3f4f6] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-[#c4922a] animate-spin" />
          <p className="text-sm text-[#554116]/60 animate-pulse">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="w-full bg-[#f3f4f6] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error || "Article not found"}</p>
          <Link
            href="/knowledge-center"
            className="text-[#c4922a] hover:underline text-sm mt-4 inline-block"
          >
            ← Back to Knowledge Center
          </Link>
        </div>
      </div>
    );
  }

  const categoryLabel = categoryDisplayMap[article.category];
  const categoryColor = categoryColorMap[article.category];

  return (
    <div className="w-full bg-[#f3f4f6] min-h-screen">
      <div className="w-full px-4 md:px-6 xl:w-[55%] xl:mx-auto py-8">
        {/* Back link */}
        <Link
          href="/knowledge-center"
          className="inline-flex items-center gap-1 text-sm text-[#554116]/60 hover:text-[#554116] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Knowledge Center</span>
        </Link>

        {/* Category Pill */}
        <div
          className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-4"
          style={{ backgroundColor: categoryColor }}
        >
          {categoryLabel}
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-[#554116] mb-3">
          {article.title}
        </h1>

        {/* Read Time */}
        <div className="flex items-center gap-1 text-sm text-[#0a0a0a]/50 mb-6">
          <Clock className="w-4 h-4" />
          <span>{article.readTimeMinutes} min read</span>
        </div>

        {/* Body Content */}
        <Card className="p-6 md:p-8 bg-white shadow-lg rounded-2xl">
          <div className="prose prose-sm md:prose-base max-w-none text-[#0a0a0a]/80 whitespace-pre-wrap">
            {article.body}
          </div>
        </Card>

        {/* CTA */}
        <div className="mt-6 text-center">
          <Button
            onClick={() => router.push("/emergency")}
            className="bg-[#c4922a] hover:bg-[#c4922a]/80 text-white h-12 px-8 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#c4922a]/25"
          >
            Need Legal Help? Connect Now
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}