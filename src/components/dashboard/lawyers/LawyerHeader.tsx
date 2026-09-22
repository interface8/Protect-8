"use client";

import Link from "next/link";
import { Search, ChevronLeft, Filter } from "lucide-react";

interface LawyerHeaderProps {
  count: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onFilterClick?: () => void;
}

export default function LawyerHeader({
  count,
  searchQuery,
  setSearchQuery,
  onFilterClick,
}: LawyerHeaderProps) {
  return (
    <div className="w-full bg-[#0a0a0a]">
      <div className="mx-auto w-[90%] max-w-5xl pb-6 pt-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Home
        </Link>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-medium leading-7 text-white">
              Find a Lawyer
            </h1>
            <p className="mt-1.5 text-sm text-white/40">
              {count} available right now
            </p>
          </div>
          {onFilterClick && (
            <button
              type="button"
              onClick={onFilterClick}
              aria-label="Filters"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] transition-colors hover:bg-white/10"
            >
              <Filter className="h-[18px] w-[18px] text-white/70" />
            </button>
          )}
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or specialty..."
            aria-label="Search lawyers"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-[#c4922a]/50"
          />
        </div>
      </div>
    </div>
  );
}