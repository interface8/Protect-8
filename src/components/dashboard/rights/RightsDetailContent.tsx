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

//   return (
//     <div className="min-h-[calc(100vh-4rem)] w-full bg-[#f5f3f0]">
//       {/* Dark header */}
//       <div className="w-full bg-[#0a0a0a]">
//         <div className="mx-auto w-[90%] max-w-3xl pb-8 pt-10">
//           <Link
//             href="/know-your-rights"
//             className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
//           >
//             <ChevronLeft className="h-4 w-4" />
//             Know Your Rights
//           </Link>

//           <div className="mt-6 flex items-center gap-4">
//             <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-2xl leading-none">
//               {emoji ?? (Icon ? <Icon className="h-6 w-6 text-[#c4922a]" /> : null)}
//             </div>
//             <div>
//               <h1 className="text-[22px] font-medium leading-7 text-white">
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
//         {intro.length > 0 && (
//           <p className="text-sm leading-6 text-gray-500">{intro.join(" ")}</p>
//         )}

//         {sections.length > 0 ? (
//           sections.map((section, index) => {
//             const isAvoid = section.tone === "avoid";
//             return (
//               <section
//                 key={`${section.title}-${index}`}
//                 className="rounded-2xl border border-black/[0.06] bg-white p-5"
//               >
//                 <h2 className="mb-5 flex items-center gap-2.5 text-lg font-medium text-[#0a0a0a]">
//                   {isAvoid ? (
//                     <CircleX className="h-5 w-5 shrink-0 text-[#9f1d1d]" />
//                   ) : (
//                     <CircleCheck className="h-5 w-5 shrink-0 text-[#1f7550]" />
//                   )}
//                   {section.title}
//                 </h2>

//                 {isAvoid ? (
//                   <ul className="space-y-[18px]">
//                     {section.items.map((item, i) => (
//                       <li
//                         key={`${i}-${item}`}
//                         className="flex items-start gap-3 text-sm leading-5 text-[#0a0a0a]/80"
//                       >
//                         <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#9f1d1d]" />
//                         {item}
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <ol className="space-y-[18px]">
//                     {section.items.map((item, i) => (
//                       <li
//                         key={`${i}-${item}`}
//                         className="flex items-start gap-3 text-sm leading-5 text-[#0a0a0a]/80"
//                       >
//                         <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f0eeea] text-xs text-gray-500">
//                           {i + 1}
//                         </span>
//                         {item}
//                       </li>
//                     ))}
//                   </ol>
//                 )}
//               </section>
//             );
//           })
//         ) : (
//           <div className="whitespace-pre-wrap rounded-2xl border border-black/[0.06] bg-white p-5 text-sm leading-6 text-[#0a0a0a]/80">
//             {guide.body}
//           </div>
//         )}

//         {/* Disclosure */}
//         <div className="flex items-start gap-3 rounded-xl border border-[#c4922a]/25 bg-[#c4922a]/[0.12] p-4">
//           <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#c4922a]" />
//           <p className="text-sm leading-6 text-[#5c4a1e]">{DISCLOSURE}</p>
//         </div>

//         {/* CTA */}
//         <Link
//           href="/emergency"
//           className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#0a0a0a] text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f]"
//         >
//           Connect to a Lawyer Now
//         </Link>
//       </div>
//     </div>
//   );
// }


"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { Guide } from "@/types/rights";
import { iconMap } from "@/lib/icon-map";
import { getGuideEmoji } from "@/lib/guide-emoji";
import { parseGuideBody } from "@/lib/parse-guide-body";

const DISCLOSURE =
  "This is general legal information, not legal advice. Always comply with lawful instructions while protecting your rights.";

interface RightsDetailContentProps {
  guide: Guide;
}

export default function RightsDetailContent({ guide }: RightsDetailContentProps) {
  const emoji = getGuideEmoji(guide.title);
  const Icon = iconMap[guide.iconKey];
  const { intro, sections } = useMemo(
    () => parseGuideBody(guide.body ?? ""),
    [guide.body]
  );
  const hasSections = sections.length > 0;
  const rawBody = (guide.body ?? "").trim();

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
        <Link
          href="/emergency"
          className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#0a0a0a] text-sm font-medium text-white transition-colors hover:bg-[#1f1f1f]"
        >
          Connect to a Lawyer Now
        </Link>
      </div>
    </div>
  );
}