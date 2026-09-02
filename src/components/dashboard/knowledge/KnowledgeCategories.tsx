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
      <div className="w-full px-4 md:px-6 xl:w-[55%] xl:mx-auto py-6">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 md:gap-3 min-w-max">
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => setActiveCategory(category.slug)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full transition-colors ${
                  activeCategory === category.slug
                    ? "bg-[#c4922a] text-white"
                    : "bg-white text-[#554116] hover:bg-[#efe2c7]"
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