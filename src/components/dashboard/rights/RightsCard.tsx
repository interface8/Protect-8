"use client";

import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Guide } from "@/types/rights";
import { iconMap } from "@/lib/icon-map";

// Color mapping for each icon
const iconColors: Record<string, string> = {
  car: "#ef4444", // red
  handcuffs: "#c4922a", // gold
  building: "#3b82f6", // blue
  map: "#10b981", // green
  "shield-heart": "#8b5cf6", // purple
  briefcase: "#92400e", // brown
};

interface RightsCardProps {
  guide: Guide;
  onClick: () => void;
}

export default function RightsCard({ guide, onClick }: RightsCardProps) {
  const Icon = iconMap[guide.iconKey];
  const iconColor = iconColors[guide.iconKey] || "#6b7280";

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-[#554116]/10 hover:border-[#c4922a]/30 bg-white"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#e8e8e8] rounded-xl flex items-center justify-center p-4">
            <Icon className="w-8 h-8" style={{ color: iconColor }} />
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
        <ChevronRight className="w-8 h-8 text-[#554116]/40 flex-shrink-0" />
      </div>
    </Card>
  );
}