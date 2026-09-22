"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, Loader2 } from "lucide-react";
import { Article, categoryDisplayMap } from "@/types/knowledge";
import { mockArticles } from "@/lib/mock-data/knowledge";
import { parseArticleBody } from "@/lib/parse-article-body";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

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

    if (slug) fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f5f3f0]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#c4922a]" />
          <p className="animate-pulse text-sm text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-[#f5f3f0]">
        <p className="text-red-500">{error || "Article not found"}</p>
        <Link
          href="/knowledge-center"
          className="text-sm font-medium text-[#c4922a] hover:underline"
        >
          Back to Knowledge Center
        </Link>
      </div>
    );
  }

  const categoryLabel = categoryDisplayMap[article.category];
  const { intro, sections } = parseArticleBody(article.body ?? "");
  const hasSections = sections.length > 0;
  const rawBody = (article.body ?? "").trim();

  return (
    <div className="min-h-screen w-full bg-[#f5f3f0]">
      {/* Dark header */}
      <div className="w-full bg-[#0a0a0a]">
        <div className="mx-auto w-[90%] max-w-3xl pb-8 pt-10">
          <Link
            href="/knowledge-center"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Knowledge Center
          </Link>

          <div className="mt-5">
            <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-[#554116]">
              {categoryLabel}
            </span>

            <h1 className="mt-4 text-2xl font-semibold leading-8 text-white md:text-[28px]">
              {article.title}
            </h1>

            <div className="mt-3 flex items-center gap-1.5 text-sm text-white/40">
              <Clock className="h-4 w-4" />
              <span>{article.readTimeMinutes} min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-[90%] max-w-[688px] space-y-4 pb-10 pt-7">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8">
          {intro && (
            <p className="mb-6 text-[15px] leading-6 text-[#0a0a0a]/80">{intro}</p>
          )}

          {hasSections ? (
            <div className="space-y-6">
              {sections.map((section, i) => (
                <div key={`${section.title}-${i}`}>
                  <h2 className="mb-2 text-lg font-semibold text-[#0a0a0a]">
                    {section.title}
                  </h2>
                  <p className="text-[15px] leading-6 text-[#0a0a0a]/80">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            !intro &&
            rawBody && (
              <p className="whitespace-pre-wrap text-[15px] leading-6 text-[#0a0a0a]/80">
                {rawBody}
              </p>
            )
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#0a0a0a] p-5">
          <div>
            <p className="text-[15px] font-semibold text-white">
              Need help with this situation?
            </p>
            <p className="text-sm text-white/50">Connect with a qualified lawyer</p>
          </div>
          <button
            onClick={() => router.push("/emergency")}
            className="shrink-0 rounded-xl bg-[#c4922a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c4922a]/85"
          >
            Get Help
          </button>
        </div>
      </div>
    </div>
  );
}