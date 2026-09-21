// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { ChevronRight, Star, Clock } from "lucide-react";
// import { Card } from "@/components/ui/card";
// import { Lawyer } from "@/types/lawyers";

// export default function HomeAvailableNow() {
//   const router = useRouter();
//   const [lawyers, setLawyers] = useState<Lawyer[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchLawyers() {
//       try {
//         const res = await fetch("/api/lawyers/available?limit=3");
//         if (!res.ok) throw new Error("Failed to fetch lawyers");
//         const data = await res.json();
//         setLawyers(data.data ?? []);
//       } catch (err) {
//         console.error("Failed to load lawyers", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchLawyers();
//   }, []);

//   if (loading || lawyers.length === 0) {
//     return null;
//   }

//   return (
//     <div className="w-full bg-[#f3f4f6]">
//       <div className="w-[90%] md:w-[75%] mx-auto py-6 md:py-8">
//         <div className="flex items-center justify-between mb-3 md:mb-4">
//           <h3 className="text-xs md:text-sm font-semibold text-[#727271] uppercase tracking-wider">
//             Available Now
//           </h3>
//           <Link
//             href="/find-a-lawyer"
//             className="text-sm md:text-base text-[#c4922a] hover:underline font-medium flex items-center gap-1"
//           >
//             See all <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
//           </Link>
//         </div>

//         <div className="space-y-2 md:space-y-3">
//           {lawyers.slice(0, 3).map((lawyer) => (
//             <Card
//               key={lawyer.id}
//               className="p-4 md:p-5 border-[#554116]/10 hover:border-[#c4922a]/30 transition-colors cursor-pointer bg-white"
//               onClick={() => router.push(`/find-a-lawyer/${lawyer.id}`)}
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3 md:gap-4">
//                   <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#c4922a]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
//                     {lawyer.avatar ? (
//                       <img
//                         src={lawyer.avatar}
//                         alt={lawyer.name}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <span className="text-base font-semibold text-[#554116]">
//                         {lawyer.name.charAt(0)}
//                       </span>
//                     )}
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-[#554116] text-sm md:text-base">
//                       {lawyer.name}
//                     </h4>
//                     <p className="text-xs md:text-sm text-[#0a0a0a]/60">
//                       {lawyer.practiceArea}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex flex-col items-end gap-0.5 md:gap-1">
//                   {lawyer.rating > 0 && (
//                     <div className="flex items-center gap-0.5">
//                       <Star className="w-3 h-3 md:w-4 md:h-4 fill-[#c4922a] text-[#c4922a]" />
//                       <span className="text-xs md:text-sm font-medium text-[#0a0a0a]/80">
//                         {lawyer.rating}
//                       </span>
//                     </div>
//                   )}
//                   {lawyer.responseTimeEstimate && (
//                     <span className="text-xs md:text-sm text-[#0a0a0a]/60 flex items-center gap-0.5">
//                       <Clock className="w-3 h-3 md:w-4 md:h-4" />{" "}
//                       {lawyer.responseTimeEstimate}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
                    <div className="relative h-10 w-10 flex-shrink-0 md:h-12 md:w-12">
                      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-[#c4922a]/20">
                        {lawyer.avatar ? (
                          <Image
                            src={lawyer.avatar}
                            alt={lawyer.name}
                            fill
                            sizes="48px"
                            unoptimized={!lawyer.avatar.startsWith("/")}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-base font-semibold text-[#0a0a0a]">
                            {lawyer.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      {/* Online dot */}
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                    </div>
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