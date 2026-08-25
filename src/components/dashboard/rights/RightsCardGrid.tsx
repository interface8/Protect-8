"use client";

import { Guide } from "@/types/rights";
import RightsCard from "./RightsCard";

interface RightsCardGridProps {
  guides: Guide[];
  onCardClick: (slug: string) => void;
}

export default function RightsCardGrid({ guides, onCardClick }: RightsCardGridProps) {
  if (guides.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#0a0a0a]/60">No scenarios found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {guides.map((guide) => (
        <RightsCard
          key={guide.id}
          guide={guide}
          onClick={() => onCardClick(guide.slug)}
        />
      ))}
    </div>
  );
}