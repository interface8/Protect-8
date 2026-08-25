"use client";

import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Guide } from "@/types/rights";
import { iconMap } from "@/lib/icon-map";

interface RightsCardProps {
  guide: Guide;
  onClick: () => void;
}

export default function RightsCard({ guide, onClick }: RightsCardProps) {
  const Icon = iconMap[guide.iconKey];

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-[#554116]/10 hover:border-[#c4922a]/30 bg-white"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#e8e8e8] rounded-xl flex items-center justify-center p-4">
            <Icon className="w-7 h-7 text-[#554116]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#554116] text-xl md:text-2xl">
              {guide.title}
            </h3>
            <p className="font-medium text-base md:text-lg text-[#0a0a0a]/60 line-clamp-2">
              {guide.shortDescription}
            </p>
          </div>
        </div>
        <ChevronRight className="w-7 h-7 text-[#554116]/40 flex-shrink-0" />
      </div>
    </Card>
  );
}