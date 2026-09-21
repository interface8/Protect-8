"use client";

import Link from "next/link";
import { Search, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LawyerHeaderProps {
  count: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function LawyerHeader({
  count,
  searchQuery,
  setSearchQuery,
}: LawyerHeaderProps) {
  return (
    <div className="w-full bg-[#0a0a0a]">
      <div className="w-full px-4 md:px-6 xl:w-[60%] xl:mx-auto pt-12 pb-14">
        {/* < Home link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-base text-white/40 hover:text-white transition-colors mb-5"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Home</span>
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
            Find a Lawyer
          </h1>
          <p className="text-sm md:text-base text-white/40">
            {count} available right now
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-5 py-3 h-12 bg-white/10 border-white/10 focus-visible:ring-[#c4922a] focus-visible:border-[#c4922a] rounded-full text-sm text-white placeholder:text-white/50 placeholder:text-sm"
          />
        </div>
      </div>
    </div>
  );
}