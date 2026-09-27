
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { Guide } from "@/types/rights";
import { iconMap } from "@/lib/icon-map";
import { getGuideEmoji } from "@/lib/guide-emoji";
import { parseGuideBody } from "@/lib/parse-guide-body";
import { getCategoryKeyForGuideSlug } from "@/lib/guide-category-map";
import LocationPopup from "@/components/dashboard/LocationPopup";

const DISCLOSURE =
  "This is general legal information, not legal advice. Always comply with lawful instructions while protecting your rights.";

interface RightsDetailContentProps {
  guide: Guide;
}

export default function RightsDetailContent({ guide }: RightsDetailContentProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);

  const emoji = getGuideEmoji(guide.title);
  const Icon = iconMap[guide.iconKey];
  const { intro, sections } = useMemo(
    () => parseGuideBody(guide.body ?? ""),
    [guide.body]
  );

  const hasSections = sections.length > 0;
  const rawBody = (guide.body ?? "").trim();

  const goToEmergency = (coords?: { lat: number; lng: number }) => {
    const categoryKey = getCategoryKeyForGuideSlug(slug);
    const categoryId = searchParams.get("categoryId");
    const query = new URLSearchParams({ category: categoryKey });
    if (categoryId) query.set("categoryId", categoryId);
    try {
      if (coords) sessionStorage.setItem("protect8:location", JSON.stringify(coords));
      else sessionStorage.removeItem("protect8:location");
    } catch { /* continue without persisted location */ }
    const target = `/emergency?${query.toString()}`;
    router.push(target);
  };

  const handleAllowLocation = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setIsLocationPopupOpen(false);
      goToEmergency();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocationPopupOpen(false);
        goToEmergency({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        setIsLocationPopupOpen(false);
        goToEmergency();
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-[#f5f3f0]">
      {/* Dark header */}
      <div className="w-full bg-[#0a0a0a]">
        <div className="mx-auto w-[90%] max-w-3xl pb-7 pt-10">
          <Link
            href="/know-your-rights"
            className="inline-flex items-center gap-2 text-[15px] text-white/50 transition-colors hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Know Your Rights
          </Link>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-2xl leading-none">
              {emoji ?? (Icon ? <Icon className="h-6 w-6 text-[#c4922a]" /> : null)}
            </div>
            <div>
              <h1 className="text-2xl font-medium leading-7 text-white">
                {guide.title}
              </h1>
              <p className="mt-1.5 text-sm text-white/40">
                {guide.shortDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-[90%] max-w-[688px] space-y-4 pb-10 pt-7">
        {hasSections ? (
          <>
            {intro.length > 0 && (
              <p className="text-sm leading-6 text-gray-500">{intro.join(" ")}</p>
            )}

            {sections.map((section, index) => {
              const isAvoid = section.tone === "avoid";
              return (
                <section
                  key={`${section.title}-${index}`}
                  className="rounded-2xl border border-black/[0.06] bg-white p-5"
                >
                  <h2 className="mb-5 flex items-center gap-2.5 text-xl font-medium leading-7 text-[#0a0a0a]">
                    {isAvoid ? (
                      <CircleX className="h-[18px] w-[18px] shrink-0 text-[#9f1d1d]" />
                    ) : (
                      <CircleCheck className="h-[18px] w-[18px] shrink-0 text-[#1f7550]" />
                    )}
                    {section.title}
                  </h2>

                  {isAvoid ? (
                    <ul className="space-y-[18px]">
                      {section.items.map((item, i) => (
                        <li
                          key={`${i}-${item}`}
                          className="flex items-start gap-3 text-[15px] leading-5 text-[#0a0a0a]/80"
                        >
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#9f1d1d]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ol className="space-y-[18px]">
                      {section.items.map((item, i) => (
                        <li
                          key={`${i}-${item}`}
                          className="flex items-start gap-3 text-[15px] leading-5 text-[#0a0a0a]/80"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f0eeea] text-xs text-gray-500">
                            {i + 1}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              );
            })}
          </>
        ) : (
          // Body isn't structured: show it once (no duplicate intro above it).
          rawBody && (
            <div className="whitespace-pre-wrap rounded-2xl border border-black/[0.06] bg-white p-5 text-[15px] leading-6 text-[#0a0a0a]/80">
              {rawBody}
            </div>
          )
        )}

        {/* Disclosure */}
        <div className="flex items-start gap-3 rounded-xl border border-[#c4922a]/25 bg-[#c4922a]/[0.12] p-4">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#c4922a]" />
          <p className="text-sm leading-6 text-[#5c4a1e]">{DISCLOSURE}</p>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => setIsLocationPopupOpen(true)}
          className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#0a0a0a] text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:opacity-60"
        >
          Connect to a Lawyer Now
        </button>
      </div>
      <LocationPopup
        isOpen={isLocationPopupOpen}
        onClose={() => setIsLocationPopupOpen(false)}
        onAllow={handleAllowLocation}
        onContinue={() => {
          setIsLocationPopupOpen(false);
          goToEmergency();
        }}
      />
    </div>
  );
}






// "use client";

// import { useMemo } from "react";
// import Link from "next/link";
// import { ChevronLeft, CircleCheck, CircleX, TriangleAlert } from "lucide-react";
// import { Guide } from "@/types/rights";
// import { iconMap } from "@/lib/icon-map";
// import { getGuideEmoji } from "@/lib/guide-emoji";
// import { parseGuideBody } from "@/lib/parse-guide-body";

// const DISCLOSURE =
//   "This is general legal information, not legal advice. Always comply with lawful instructions while protecting your rights.";

// interface RightsDetailContentProps {
//   guide: Guide;
// }

// export default function RightsDetailContent({ guide }: RightsDetailContentProps) {
//   const emoji = getGuideEmoji(guide.title);
//   const Icon = iconMap[guide.iconKey];
//   const { intro, sections } = useMemo(
//     () => parseGuideBody(guide.body ?? ""),
//     [guide.body]
//   );
//   const hasSections = sections.length > 0;
//   const rawBody = (guide.body ?? "").trim();

//   return (
//     <div className="min-h-[calc(100vh-4rem)] w-full bg-[#f5f3f0]">
//       {/* Dark header */}
//       <div className="w-full bg-[#0a0a0a]">
//         <div className="mx-auto w-[90%] max-w-3xl pb-7 pt-10">
//           <Link
//             href="/know-your-rights"
//             className="inline-flex items-center gap-2 text-[15px] text-white/50 transition-colors hover:text-white"
//           >
//             <ChevronLeft className="h-4 w-4" />
//             Know Your Rights
//           </Link>

//           <div className="mt-5 flex items-center gap-4">
//             <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-2xl leading-none">
//               {emoji ?? (Icon ? <Icon className="h-6 w-6 text-[#c4922a]" /> : null)}
//             </div>
//             <div>
//               <h1 className="text-2xl font-medium leading-7 text-white">
//                 {guide.title}
//               </h1>
//               <p className="mt-1.5 text-sm text-white/40">
//                 {guide.shortDescription}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="mx-auto w-[90%] max-w-[688px] space-y-4 pb-10 pt-7">
//         {hasSections ? (
//           <>
//             {intro.length > 0 && (
//               <p className="text-sm leading-6 text-gray-500">{intro.join(" ")}</p>
//             )}

//             {sections.map((section, index) => {
//               const isAvoid = section.tone === "avoid";
//               return (
//                 <section
//                   key={`${section.title}-${index}`}
//                   className="rounded-2xl border border-black/[0.06] bg-white p-5"
//                 >
//                   <h2 className="mb-5 flex items-center gap-2.5 text-xl font-medium leading-7 text-[#0a0a0a]">
//                     {isAvoid ? (
//                       <CircleX className="h-[18px] w-[18px] shrink-0 text-[#9f1d1d]" />
//                     ) : (
//                       <CircleCheck className="h-[18px] w-[18px] shrink-0 text-[#1f7550]" />
//                     )}
//                     {section.title}
//                   </h2>

//                   {isAvoid ? (
//                     <ul className="space-y-[18px]">
//                       {section.items.map((item, i) => (
//                         <li
//                           key={`${i}-${item}`}
//                           className="flex items-start gap-3 text-[15px] leading-5 text-[#0a0a0a]/80"
//                         >
//                           <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#9f1d1d]" />
//                           {item}
//                         </li>
//                       ))}
//                     </ul>
//                   ) : (
//                     <ol className="space-y-[18px]">
//                       {section.items.map((item, i) => (
//                         <li
//                           key={`${i}-${item}`}
//                           className="flex items-start gap-3 text-[15px] leading-5 text-[#0a0a0a]/80"
//                         >
//                           <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f0eeea] text-xs text-gray-500">
//                             {i + 1}
//                           </span>
//                           {item}
//                         </li>
//                       ))}
//                     </ol>
//                   )}
//                 </section>
//               );
//             })}
//           </>
//         ) : (
//           // Body isn't structured: show it once (no duplicate intro above it).
//           rawBody && (
//             <div className="whitespace-pre-wrap rounded-2xl border border-black/[0.06] bg-white p-5 text-[15px] leading-6 text-[#0a0a0a]/80">
//               {rawBody}
//             </div>
//           )
//         )}

//         {/* Disclosure */}
//         <div className="flex items-start gap-3 rounded-xl border border-[#c4922a]/25 bg-[#c4922a]/[0.12] p-4">
//           <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#c4922a]" />
//           <p className="text-sm leading-6 text-[#5c4a1e]">{DISCLOSURE}</p>
//         </div>

//         {/* CTA */}
//         <Link
//           href="/find-a-lawyer"
//           className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#0a0a0a] text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f]"
//         >
//           Connect to a Lawyer Now
//         </Link>
//       </div>
//     </div>
//   );
// }
