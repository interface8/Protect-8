"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LawyerAvatar from "../lawyers/LawyerAvatar";
import { ChevronRight, Star } from "lucide-react";
import { Lawyer } from "@/types/lawyers";

function LawyersSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-black/[0.06] bg-white"
        />
      ))}
    </div>
  );
}

export default function HomeAvailableNow() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchLawyers() {
      try {
        const res = await fetch("/api/lawyers/available?limit=3", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch lawyers");
        const data = await res.json();
        setLawyers(data.data ?? []);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Failed to load lawyers", err);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchLawyers();
    return () => controller.abort();
  }, []);

  if (!loading && lawyers.length === 0) return null;

  return (
    <div className="w-full bg-[#f5f3f0]">
      <div className="mx-auto w-[90%] max-w-[944px] pb-6 pt-6 md:pb-8 md:pt-9">
        <div className="mb-3 flex items-center justify-between md:mb-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Available Now
          </h3>
          <Link
            href="/find-a-lawyer"
            className="flex items-center gap-0.5 text-sm font-medium text-[#c4922a] hover:underline"
          >
            See all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <LawyersSkeleton />
        ) : (
          <div className="space-y-2 md:space-y-3">
            {lawyers.slice(0, 3).map((lawyer) => (
              <Link
                key={lawyer.id}
                href={`/find-a-lawyer/${lawyer.id}`}
                className="block rounded-xl border border-black/[0.06] bg-white p-4 transition-colors hover:border-[#c4922a]/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <LawyerAvatar name={lawyer.name} src={lawyer.avatar} status={lawyer.availabilityStatus} />
                    <div>
                      <h4 className="text-sm font-medium text-[#0a0a0a] md:text-base">
                        {lawyer.name}
                      </h4>
                      <p className="text-sm text-gray-500">{lawyer.practiceArea}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-0.5 md:gap-1">
                    {lawyer.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-[#c4922a] text-[#c4922a]" />
                        <span className="text-sm font-medium text-[#0a0a0a]">
                          {lawyer.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {lawyer.responseTimeEstimate && (
                      <span className="text-xs text-gray-500">
                        {lawyer.responseTimeEstimate}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}