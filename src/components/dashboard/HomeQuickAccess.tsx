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

export default function HomeQuickAccess() {
  return (
    // Light gray background - full width
    <div className="w-full bg-[#f3f4f6]">
      {/* Content - 55% width, centered */}
      <div className="w-[55%] mx-auto py-8">
        <h3 className="text-xs font-semibold text-[#554116] uppercase tracking-wider mb-3">
          Quick Access
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickAccessItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <Link key={item.title} href={item.href}>
                <Card className="px-4 py-6 hover:shadow-md transition-all duration-200 hover:scale-[1.01] cursor-pointer border-[#554116]/10 hover:border-[#c4922a]/30 bg-white">
                  <div className="flex flex-col items-start gap-1.5">
                    {/* Icon container - black rounded-full */}
                    <div className="w-8 h-8 bg-[#0a0a0a] rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#554116] text-xs">
                        {item.title}
                      </h4>
                      <p className="text-[10px] font-base text-[#0a0a0a]/70">
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