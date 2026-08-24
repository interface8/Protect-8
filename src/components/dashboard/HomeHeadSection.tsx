"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Bell, User, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { userData } from "@/lib/mock-data";

export default function HomeHeadSection() {
  const router = useRouter();

  return (
    <div className="w-full bg-[#0a0a0a]">
      <div className="w-[90%] md:w-[80%] mx-auto space-y-8 md:space-y-10 pt-16 md:pt-20 pb-12 md:pb-16">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base md:text-xl text-white/60 font-base">Good morning</p>
            <h1 className="text-4xl md:text-5xl font-semibold text-white">{userData.name}</h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-white/10 p-3 md:p-4 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
              <Bell className="w-5 h-5 md:w-6 md:h-6 text-white/70 hover:text-white transition-colors" />
            </div>
            <div className="bg-white/10 p-3 md:p-4 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
              <User className="w-5 h-5 md:w-6 md:h-6 text-white/70 hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        <Card
          className="bg-white p-6 md:p-8 rounded-3xl cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl group"
          onClick={() => router.push("/emergency")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0a0a0a] rounded-xl flex items-center justify-center">
                <div className="relative">
                  <Circle className="w-8 h-8 md:w-10 md:h-10 text-[#c4922a]" strokeWidth={2} />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#c4922a] font-normal text-lg md:text-xl">
                    !
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm md:text-base font-medium text-[#554116]/60">EMERGENCY</p>
                <h2 className="text-xl md:text-2xl font-semibold text-[#0a0a0a]">Need a Lawyer Now</h2>
              </div>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 bg-[#0a0a0a] rounded-full flex items-center justify-center transition-all duration-200 group-hover:bg-[#c4922a]">
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-white transition-colors duration-200 group-hover:text-white" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}