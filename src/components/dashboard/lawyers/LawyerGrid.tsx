"use client";

import { Lawyer } from "@/types/lawyers";
import LawyerCard from "./LawyerCard";

interface LawyerGridProps {
  lawyers: Lawyer[];
  onCardClick: (id: string) => void;
}

export default function LawyerGrid({ lawyers, onCardClick }: LawyerGridProps) {
  if (lawyers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-base text-[#0a0a0a]/60">No lawyers found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {lawyers.map((lawyer) => (
        <LawyerCard
          key={lawyer.id}
          lawyer={lawyer}
          onClick={() => onCardClick(lawyer.id)}
        />
      ))}
    </div>
  );
}