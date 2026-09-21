"use client";

import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Lawyer } from "@/types/lawyers";

interface LawyerCardProps {
  lawyer: Lawyer;
  onClick: () => void;
}

export default function LawyerCard({ lawyer, onClick }: LawyerCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(lawyer.consultationFee);

  return (
    <Card
      className="p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-[#554116]/10 hover:border-[#c4922a]/30 bg-white flex flex-col h-full"
      onClick={onClick}
    >
      {/* Name + Specialty */}
      <div className="mb-1">
        <h3 className="font-semibold text-[#554116] text-base md:text-lg">
          {lawyer.name}
        </h3>
        <p className="text-sm text-[#c4922a] font-medium">{lawyer.practiceArea}</p>
      </div>

      {/* Sub-specialties */}
      <div className="flex flex-wrap gap-1 mb-2">
        {lawyer.specialtyTags.slice(0, 3).map((tag, index, arr) => (
          <span key={tag} className="text-xs text-[#0a0a0a]/50">
            {tag}
            {index < arr.length - 1 && index < 2 && " · "}
          </span>
        ))}
      </div>

      {/* Rating + Price + Time */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#554116]/10">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-[#c4922a] text-[#c4922a]" />
          <span className="text-sm font-medium text-[#0a0a0a]/80">
            {lawyer.rating}
          </span>
          <span className="text-xs text-[#0a0a0a]/50">({lawyer.ratingCount})</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#0a0a0a]/60">
          <span className="font-medium text-[#554116]">{formattedPrice}</span>
          <span>·</span>
          <span>{lawyer.responseTimeEstimate}</span>
        </div>
      </div>
    </Card>
  );
}