"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Star, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Lawyer } from "@/types/lawyers";

export default function HomeAvailableNow() {
  const router = useRouter();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLawyers() {
      try {
        const res = await fetch("/api/lawyers/available?limit=3");
        if (!res.ok) throw new Error("Failed to fetch lawyers");
        const data = await res.json();
        setLawyers(data.data ?? []);
      } catch (err) {
        console.error("Failed to load lawyers", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLawyers();
  }, []);

  if (loading || lawyers.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-[#f3f4f6]">
      <div className="w-[90%] md:w-[75%] mx-auto py-6 md:py-8">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-semibold text-[#727271] uppercase tracking-wider">
            Available Now
          </h3>
          <Link
            href="/find-a-lawyer"
            className="text-sm md:text-base text-[#c4922a] hover:underline font-medium flex items-center gap-1"
          >
            See all <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
          </Link>
        </div>

        <div className="space-y-2 md:space-y-3">
          {lawyers.slice(0, 3).map((lawyer) => (
            <Card
              key={lawyer.id}
              className="p-4 md:p-5 border-[#554116]/10 hover:border-[#c4922a]/30 transition-colors cursor-pointer bg-white"
              onClick={() => router.push(`/find-a-lawyer/${lawyer.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#c4922a]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {lawyer.avatar ? (
                      <img
                        src={lawyer.avatar}
                        alt={lawyer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-semibold text-[#554116]">
                        {lawyer.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#554116] text-sm md:text-base">
                      {lawyer.name}
                    </h4>
                    <p className="text-xs md:text-sm text-[#0a0a0a]/60">
                      {lawyer.practiceArea}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 md:gap-1">
                  {lawyer.rating > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 md:w-4 md:h-4 fill-[#c4922a] text-[#c4922a]" />
                      <span className="text-xs md:text-sm font-medium text-[#0a0a0a]/80">
                        {lawyer.rating}
                      </span>
                    </div>
                  )}
                  {lawyer.responseTimeEstimate && (
                    <span className="text-xs md:text-sm text-[#0a0a0a]/60 flex items-center gap-0.5">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />{" "}
                      {lawyer.responseTimeEstimate}
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