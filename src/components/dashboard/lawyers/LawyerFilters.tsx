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
    <div
      id="lawyer-filters"
      className="w-full border-b border-black/[0.06] bg-white"
    >
      <div className="mx-auto w-[90%] max-w-5xl py-3">
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.slug;
              return (
                <button
                  key={filter.slug}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveFilter(filter.slug)}
                  className={`h-8 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#0a0a0a] text-white"
                      : "bg-[#f0eeea] text-gray-600 hover:bg-[#e8e5e0]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}