"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Star, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { mockLawyers } from "@/lib/mock-data";

export default function HomeAvailableNow() {
  const router = useRouter();

  return (
    <div className="w-full bg-[#f3f4f6]">
      <div className="w-[90%] md:w-[75%] mx-auto py-8 md:py-12">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-base md:text-xl font-semibold text-[#554116] uppercase tracking-wider">
            Available Now
          </h3>
          <Link
            href="/find-a-lawyer"
            className="text-base md:text-xl text-[#c4922a] hover:underline font-medium flex items-center gap-1"
          >
            See all <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>

        <div className="space-y-3 md:space-y-4">
          {mockLawyers.map((lawyer) => (
            <Card
              key={lawyer.id}
              className="p-6 md:p-8 border-[#554116]/10 hover:border-[#c4922a]/30 transition-colors cursor-pointer bg-white"
              onClick={() => router.push("/find-a-lawyer")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-[#efe2c7] rounded-xl flex items-center justify-center text-[#554116] font-semibold text-base md:text-lg">
                    {lawyer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#554116] text-lg md:text-xl">
                      {lawyer.name}
                    </h4>
                    <p className="text-base md:text-lg text-[#0a0a0a]/60">
                      {lawyer.specialty}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 md:gap-1.5">
                  {lawyer.rating && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-4 h-4 md:w-5 md:h-5 fill-[#c4922a] text-[#c4922a]" />
                      <span className="text-base md:text-lg font-medium text-[#0a0a0a]/80">
                        {lawyer.rating}
                      </span>
                    </div>
                  )}
                  {lawyer.time && (
                    <span className="text-base md:text-lg text-[#0a0a0a]/60 flex items-center gap-0.5">
                      <Clock className="w-4 h-4 md:w-5 md:h-5" /> {lawyer.time}
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