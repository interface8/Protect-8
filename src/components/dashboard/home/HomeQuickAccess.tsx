"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { BookOpen, Scale, MessagesSquare } from "lucide-react";
import { quickAccessItems } from "@/lib/mock-data";

const iconMap = {
  BookOpen,
  Scale,
  MessagesSquare,
};

// Hardcoded display titles with line breaks for mobile
const displayTitles: Record<string, string> = {
  "Know Your Rights": "Know Your\nRights",
  "Find a Lawyer": "Find a\nLawyer",
  "AI Assistant": "AI\nAssistant",
};

export default function HomeQuickAccess() {
  return (
    <div className="w-full bg-[#f3f4f6]">
      <div className="w-[90%] md:w-[75%] mx-auto py-4 md:py-6">
        <h3 className="text-sm md:text-base font-semibold text-[#727271] uppercase tracking-wider mb-4 md:mb-6 text-left">
          Quick Access
        </h3>
        <div className="grid grid-cols-3 gap-2 md:gap-4 lg:gap-6">
          {quickAccessItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const displayTitle = displayTitles[item.title] || item.title;
            return (
              <Link key={item.title} href={item.href}>
                <Card className="p-2 md:px-5 md:py-6 hover:shadow-md transition-all duration-200 hover:scale-[1.01] cursor-pointer border-[#554116]/10 hover:border-[#c4922a]/30 bg-white">
                  <div className="flex flex-col items-start gap-1 md:gap-2">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-[#0a0a0a] rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-left">
                      {/* Mobile: line breaks, Desktop: straight text */}
                      <h4 className="font-semibold text-[#554116] text-sm md:text-lg whitespace-pre-line md:whitespace-normal">
                        {displayTitle}
                      </h4>
                      <p className="text-sm md:text-lg font-base text-[#0a0a0a]/70 hidden sm:block">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}