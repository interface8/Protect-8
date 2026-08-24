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
    <div className="w-full bg-[#f3f4f6]">
      <div className="w-[90%] md:w-[75%] mx-auto py-8 md:py-12">
        <h3 className="text-lg md:text-xl font-semibold text-[#727271] uppercase tracking-wider mb-4 md:mb-6">
          Quick Access
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {quickAccessItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <Link key={item.title} href={item.href}>
                <Card className="px-5 md:px-6 py-8 md:py-10 hover:shadow-md transition-all duration-200 hover:scale-[1.01] cursor-pointer border-[#554116]/10 hover:border-[#c4922a]/30 bg-white">
                  <div className="flex flex-col items-start gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0a0a0a] rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#554116] text-lg md:text-xl">
                        {item.title}
                      </h4>
                      <p className="text-base md:text-lg font-base text-[#0a0a0a]/70">
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