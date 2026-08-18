"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Star, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { mockLawyers } from "@/lib/mock-data";

export default function HomeAvailableNow() {
  const router = useRouter();

  return (
    // Light gray background - full width
    <div className="w-full bg-[#f3f4f6]">
      {/* Content - 55% width, centered */}
      <div className="w-[55%] mx-auto py-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-[#554116] uppercase tracking-wider">
            Available Now
          </h3>
          <Link
            href="/find-a-lawyer"
            className="text-xs text-[#c4922a] hover:underline font-medium flex items-center gap-1"
          >
            See all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Lawyer Cards */}
        <div className="space-y-3">
          {mockLawyers.map((lawyer) => (
            <Card
              key={lawyer.id}
              className="p-4 border-[#554116]/10 hover:border-[#c4922a]/30 transition-colors cursor-pointer bg-white"
              onClick={() => router.push("/find-a-lawyer")}
            >
              <div className="flex items-center justify-between">
                {/* Left: Avatar + Info */}
                <div className="flex items-center gap-4">
                  {/* Avatar - Initials */}
                  <div className="w-10 h-10 bg-[#efe2c7] rounded-xl flex items-center justify-center text-[#554116] font-semibold text-sm">
                    {lawyer.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div>
                    <h4 className="font-semibold text-[#554116] text-sm">
                      {lawyer.name}
                    </h4>
                    <p className="text-xs text-[#0a0a0a]/60">
                      {lawyer.specialty}
                    </p>
                  </div>
                </div>

                {/* Right: Rating + Time - stacked vertically */}
                <div className="flex flex-col items-end gap-0.5">
                  {lawyer.rating && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-[#c4922a] text-[#c4922a]" />
                      <span className="text-xs font-medium text-[#0a0a0a]/80">
                        {lawyer.rating}
                      </span>
                    </div>
                  )}
                  {lawyer.time && (
                    <span className="text-xs text-[#0a0a0a]/60 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> {lawyer.time}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}