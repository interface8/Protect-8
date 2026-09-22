// "use client";

// import { Star } from "lucide-react";
// import { Card } from "@/components/ui/card";
// import { Lawyer } from "@/types/lawyers";

// interface LawyerCardProps {
//   lawyer: Lawyer;
//   onClick: () => void;
// }

// export default function LawyerCard({ lawyer, onClick }: LawyerCardProps) {
//   const formattedPrice = new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency: "NGN",
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(lawyer.consultationFee);

//   return (
//     <Card
//       className="p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-[#554116]/10 hover:border-[#c4922a]/30 bg-white flex flex-col h-full"
//       onClick={onClick}
//     >
//       {/* Name + Specialty */}
//       <div className="mb-1">
//         <h3 className="font-semibold text-[#554116] text-base md:text-lg">
//           {lawyer.name}
//         </h3>
//         <p className="text-sm text-[#c4922a] font-medium">{lawyer.practiceArea}</p>
//       </div>

//       {/* Sub-specialties */}
//       <div className="flex flex-wrap gap-1 mb-2">
//         {lawyer.specialtyTags.slice(0, 3).map((tag, index, arr) => (
//           <span key={tag} className="text-xs text-[#0a0a0a]/50">
//             {tag}
//             {index < arr.length - 1 && index < 2 && " · "}
//           </span>
//         ))}
//       </div>

//       {/* Rating + Price + Time */}
//       <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#554116]/10">
//         <div className="flex items-center gap-1">
//           <Star className="w-4 h-4 fill-[#c4922a] text-[#c4922a]" />
//           <span className="text-sm font-medium text-[#0a0a0a]/80">
//             {lawyer.rating}
//           </span>
//           <span className="text-xs text-[#0a0a0a]/50">({lawyer.ratingCount})</span>
//         </div>
//         <div className="flex items-center gap-2 text-sm text-[#0a0a0a]/60">
//           <span className="font-medium text-[#554116]">{formattedPrice}</span>
//           <span>·</span>
//           <span>{lawyer.responseTimeEstimate}</span>
//         </div>
//       </div>
//     </Card>
//   );
// }


import Link from "next/link";
import { CircleCheckBig, Star } from "lucide-react";
import { Lawyer } from "@/types/lawyers";
import { formatNGN } from "@/lib/format";
import LawyerAvatar from "./LawyerAvatar";

interface LawyerCardProps {
  lawyer: Lawyer;
}

export default function LawyerCard({ lawyer }: LawyerCardProps) {
  return (
    <Link
      href={`/find-a-lawyer/${lawyer.id}`}
      className="flex h-full flex-col rounded-xl border border-black/[0.06] bg-white p-4 transition-colors hover:border-[#c4922a]/40"
    >
      <div className="flex items-center gap-3">
        <LawyerAvatar
          name={lawyer.name}
          src={lawyer.avatar}
          status={lawyer.availabilityStatus}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-medium text-[#0a0a0a]">
              {lawyer.name}
            </h3>
            {lawyer.verified && (
              <CircleCheckBig className="h-3.5 w-3.5 shrink-0 text-[#c4922a]" />
            )}
          </div>
          <p className="text-sm text-gray-500">{lawyer.practiceArea}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {lawyer.specialtyTags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-black/[0.05] bg-[#f0eeea] px-3 py-1 text-xs text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto">
        <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-3">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-[#c4922a] text-[#c4922a]" />
            <span className="text-sm font-medium text-[#0a0a0a]">
              {lawyer.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">({lawyer.ratingCount})</span>
          </div>
          <span className="text-xs text-gray-500">
            {formatNGN(lawyer.consultationFee)}
            {lawyer.responseTimeEstimate ? ` · ${lawyer.responseTimeEstimate}` : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}