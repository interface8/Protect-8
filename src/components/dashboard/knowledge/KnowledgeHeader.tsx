"use client";

import Link from "next/link";
import { Search, ChevronLeft, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";

interface KnowledgeHeaderProps {
  count: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function KnowledgeHeader({
  count,
  searchQuery,
  setSearchQuery,
}: KnowledgeHeaderProps) {
  return (
    <div className="w-full bg-[#0a0a0a]">
      <div className="mx-auto w-full max-w-5xl px-4 pt-12 pb-8 md:px-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-base text-white/40 hover:text-white transition-colors mb-5"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#0a0a0a] rounded-xl border-2 border-[#2a2a2a] flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[#c4922a]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-[21px] font-semibold text-white">
              Knowledge Center
            </h1>
            <p className="text-sm md:text-base text-white/40">
              {count} legal guide{count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="relative mt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-5 py-3 h-12 bg-white/10 border-white/10 focus-visible:ring-[#c4922a] focus-visible:border-[#c4922a] rounded-full text-sm text-white placeholder:text-white/50 placeholder:text-sm"
          />
        </div>
      </div>
    </div>
  );
}