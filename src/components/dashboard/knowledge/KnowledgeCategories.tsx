"use client";

import { KnowledgeCategory } from "@/types/knowledge";

interface KnowledgeCategoriesProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const categories = [
  { slug: "all", label: "All" },
  { slug: KnowledgeCategory.CRIMINAL_RIGHTS, label: "Criminal Rights" },
  { slug: KnowledgeCategory.PRIVACY_RIGHTS, label: "Privacy Rights" },
  { slug: KnowledgeCategory.PROPERTY_LAW, label: "Property Law" },
  { slug: KnowledgeCategory.FINANCIAL_CRIME, label: "Financial Crime" },
  { slug: KnowledgeCategory.TRAFFIC_LAW, label: "Traffic Law" },
];

export default function KnowledgeCategories({
  activeCategory,
  setActiveCategory,
}: KnowledgeCategoriesProps) {
  return (
    <div className="w-full bg-[#f3f4f6]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
        <div className="scrollbar-hide overflow-x-auto">
          <div className="flex min-w-max gap-2 md:gap-3">
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => setActiveCategory(category.slug)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category.slug
                    ? "bg-[#0a0a0a] text-white"
                    : "border border-black/[0.04] bg-white text-[#554116] hover:bg-white/70"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}