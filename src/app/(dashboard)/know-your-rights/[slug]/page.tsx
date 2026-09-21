"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Guide } from "@/types/rights";
import { iconMap } from "@/lib/icon-map";

const DISCLOSURE =
  "This is general legal information, not legal advice. Always comply with lawful instructions while protecting your rights.";

export default function GuideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGuide() {
      try {
        const res = await fetch(`/api/rights-guides/${slug}`);
        if (!res.ok) throw new Error("Guide not found");
        const data = await res.json();
        setGuide(data);
      } catch (err) {
        setError("Failed to load guide");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchGuide();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full bg-[#f3f4f6] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-[#c4922a] animate-spin animate-spin-slow" />
          <p className="text-sm text-[#554116]/60 animate-pulse">Loading guide...</p>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="w-full bg-[#f3f4f6] min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || "Guide not found"}</p>
      </div>
    );
  }

  const Icon = iconMap[guide.iconKey];

  return (
    <div className="w-full bg-[#f3f4f6] min-h-screen">
      <div className="w-full px-4 md:w-[55%] md:mx-auto py-8">
        <Link
          href="/know-your-rights"
          className="inline-flex items-center gap-1 text-sm text-[#554116]/60 hover:text-[#554116] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Know Your Rights</span>
        </Link>

        <div className="bg-[#c4922a]/10 border border-[#c4922a]/30 rounded-lg p-4 mb-6">
          <p className="text-xs text-[#554116]/80 text-center">
            ⚠️ {DISCLOSURE}
          </p>
        </div>

        <Card className="p-6 md:p-8 bg-white shadow-lg rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#efe2c7] rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-[#554116]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#554116]">
                {guide.title}
              </h1>
              <p className="text-sm text-[#0a0a0a]/60">
                {guide.shortDescription}
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-[#0a0a0a]/80 whitespace-pre-wrap">
            {guide.body}
          </div>

          <div className="mt-8 pt-6 border-t border-[#554116]/10">
            <p className="text-xs text-[#554116]/60 text-center">
              ⚠️ {DISCLOSURE}
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Button
            onClick={() => router.push("/emergency")}
            className="bg-[#c4922a] hover:bg-[#c4922a]/80 text-white h-12 px-8 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#c4922a]/25"
          >
            Connect to a Lawyer Now
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}