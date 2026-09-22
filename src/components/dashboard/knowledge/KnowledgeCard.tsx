"use client";

import { ChevronRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Article, categoryDisplayMap, categoryColorMap } from "@/types/knowledge";

interface KnowledgeCardProps {
  article: Article;
  onClick: () => void;
}

export default function KnowledgeCard({ article, onClick }: KnowledgeCardProps) {
  const categoryLabel = categoryDisplayMap[article.category];
  const categoryColor = categoryColorMap[article.category];

  return (
    <Card
      className="p-3 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-[#554116]/10 hover:border-[#c4922a]/30 bg-white flex flex-col h-full"
      onClick={onClick}
    >
      {/* Category pill — tinted version of the category's brand color */}
      <div
        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium w-fit"
        style={{ backgroundColor: `${categoryColor}1f`, color: categoryColor }}
      >
        {categoryLabel}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[#554116] text-sm md:text-base line-clamp-2 flex-1">
        {article.title}
      </h3>

      {/* Excerpt */}
      <p className="text-xs md:text-sm text-[#0a0a0a]/60 line-clamp-2 mb-1.5">
        {article.excerpt}
      </p>

      {/* Divider Line */}
      <div className="border-t border-[#554116]/10"></div>

      {/* Footer: Read Time + Chevron */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-[#0a0a0a]/50">
          <Clock className="w-3.5 h-3.5" />
          <span>{article.readTimeMinutes} min read</span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#554116]/40 flex-shrink-0" />
      </div>
    </Card>
  );
}