"use client";

import { Article } from "@/types/knowledge";
import KnowledgeCard from "./KnowledgeCard";

interface KnowledgeGridProps {
  articles: Article[];
  onCardClick: (slug: string) => void;
}

export default function KnowledgeGrid({ articles, onCardClick }: KnowledgeGridProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-base text-[#0a0a0a]/60">No articles found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {articles.map((article) => (
        <KnowledgeCard
          key={article.id}
          article={article}
          onClick={() => onCardClick(article.slug)}
        />
      ))}
    </div>
  );
}