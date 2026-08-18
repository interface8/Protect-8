"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Bell, User, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { userData } from "@/lib/mock-data";

export default function HomeHeadSection() {
  const router = useRouter();

  return (
    // Black background - full width, no padding
    <div className="w-full bg-[#0a0a0a]">
      {/* Content - 60% width, centered */}
      <div className="w-[60%] mx-auto space-y-6 pt-10 pb-6">
        {/* Greeting with icons - individual containers */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 font-base">Good morning</p>
            <h1 className="text-2xl font-semibold text-white">{userData.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Bell icon - individual container */}
            <div className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
              <Bell className="w-4 h-4 text-white/70 hover:text-white transition-colors" />
            </div>
            {/* User icon - individual container */}
            <div className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
              <User className="w-4 h-4 text-white/70 hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        {/* Emergency Card - White background, black text */}
        <Card
          className="bg-white p-5 rounded-2xl cursor-pointer hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl group"
          onClick={() => router.push("/emergency")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Icon before EMERGENCY */}
              <div className="w-10 h-10 bg-[#0a0a0a] rounded-xl flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-[#c4922a]" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#554116]/60">EMERGENCY</p>
                <h2 className="text-xl font-semibold text-[#0a0a0a]">Need a Lawyer Now</h2>
              </div>
            </div>
            {/* Arrow right - black bg, white arrow, turns gold on hover */}
            <div className="w-10 h-10 bg-[#0a0a0a] rounded-full flex items-center justify-center transition-all duration-200 group-hover:bg-[#c4922a]">
              <ChevronRight className="w-5 h-5 text-white transition-colors duration-200 group-hover:text-white" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}