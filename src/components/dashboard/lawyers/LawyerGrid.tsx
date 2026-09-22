import { Lawyer } from "@/types/lawyers";
import LawyerCard from "./LawyerCard";

interface LawyerGridProps {
  lawyers: Lawyer[];
}

export default function LawyerGrid({ lawyers }: LawyerGridProps) {
  if (lawyers.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-500">No lawyers found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {lawyers.map((lawyer) => (
        <LawyerCard key={lawyer.id} lawyer={lawyer} />
      ))}
    </div>
  );
}