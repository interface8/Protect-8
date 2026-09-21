// "use client";

// import { Guide } from "@/types/rights";
// import RightsCard from "./RightsCard";

// interface RightsCardGridProps {
//   guides: Guide[];
//   onCardClick: (slug: string) => void;
// }

// export default function RightsCardGrid({ guides, onCardClick }: RightsCardGridProps) {
//   if (guides.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-sm text-[#0a0a0a]/60">No scenarios found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
//       {guides.map((guide) => (
//         <RightsCard
//           key={guide.id}
//           guide={guide}
//           onClick={() => onCardClick(guide.slug)}
//         />
//       ))}
//     </div>
//   );
// }



import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Guide } from "@/types/rights";
import { iconMap } from "@/lib/icon-map";
import { getGuideEmoji } from "@/lib/guide-emoji";

interface RightsCardGridProps {
  guides: Guide[];
}

export default function RightsCardGrid({ guides }: RightsCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {guides.map((guide) => {
        const emoji = getGuideEmoji(guide.title);
        const Icon = iconMap[guide.iconKey];
        return (
          <Link
            key={guide.slug}
            href={`/know-your-rights/${guide.slug}`}
            className="flex items-center gap-4 rounded-xl border border-black/[0.06] bg-white p-4 transition-colors hover:border-[#c4922a]/40"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.04] bg-[#f5f3f0] text-xl leading-none">
              {emoji ?? (Icon ? <Icon className="h-5 w-5 text-[#0a0a0a]" /> : null)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-medium leading-6 text-[#0a0a0a]">
                {guide.title}
              </h3>
              <p className="mt-0.5 text-sm leading-snug text-gray-500">
                {guide.shortDescription}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
          </Link>
        );
      })}
    </div>
  );
}