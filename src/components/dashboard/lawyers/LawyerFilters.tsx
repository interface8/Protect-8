"use client";

interface LawyerFiltersProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

const filters = [
  { slug: "all", label: "All" },
  { slug: "available", label: "Available" },
  { slug: "criminal", label: "Criminal" },
  { slug: "property", label: "Property" },
  { slug: "employment", label: "Employment" },
  { slug: "family", label: "Family" },
  { slug: "civil", label: "Civil" },
];

export default function LawyerFilters({
  activeFilter,
  setActiveFilter,
}: LawyerFiltersProps) {
  return (
    <div className="w-full bg-[#f3f4f6]">
      <div className="w-full px-4 md:px-6 xl:w-[55%] xl:mx-auto py-4">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {filters.map((filter) => (
              <button
                key={filter.slug}
                onClick={() => setActiveFilter(filter.slug)}
                className={`px-4 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-colors ${
                  activeFilter === filter.slug
                    ? "bg-[#0a0a0a] text-white"
                    : "bg-white text-[#554116] hover:bg-[#efe2c7]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}