"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Bell,
  User,
  Circle,
  ChevronUp,
  Car,
  Scale,
  Building,
  House,
  Shield,
  Lock,
  Briefcase,
  AlertTriangle,
  Laptop,
  Plane,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { userData } from "@/lib/mock-data";

const situations = [
  { label: "Traffic Stop", icon: Car, color: "#ef4444" },
  { label: "Police Arrest", icon: Scale, color: "#c4922a" },
  { label: "EFCC Issue", icon: Building, color: "#ffffff" },
  { label: "Land Dispute", icon: House, color: "#f59e0b" },
  { label: "Domestic Violence", icon: Shield, color: "#8b5cf6" },
  { label: "Security Agency", icon: Lock, color: "#c4922a" },
  { label: "Employment Matter", icon: Briefcase, color: "#92400e" },
  { label: "Fraud", icon: AlertTriangle, color: "#eab308" },
  { label: "Cybercrime", icon: Laptop, color: "#06b6d4" },
  { label: "Immigration", icon: Plane, color: "#ffffff" },
  { label: "Other", icon: FileText, color: "#ffffff" },
];

export default function HomeHeadSection() {
  // const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <div className="w-full bg-[#0a0a0a]">
      <div className="w-[90%] md:w-[80%] mx-auto space-y-6 md:space-y-8 pt-10 md:pt-14 pb-8 md:pb-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base md:text-lg text-white/60 font-base">Good morning</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-white">{userData.name}</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-white/10 p-2 md:p-3 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
              <Bell className="w-4 h-4 md:w-5 md:h-5 text-white/70 hover:text-white transition-colors" />
            </div>
            <div className="bg-white/10 p-2 md:p-3 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
              <User className="w-4 h-4 md:w-5 md:h-5 text-white/70 hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        {/* Emergency Card */}
        <div>
          <Card
            className="bg-white p-5 md:p-7 rounded-2xl cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl group"
            onClick={toggleDropdown}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#0a0a0a] rounded-xl flex items-center justify-center">
                  <div className="relative">
                    <Circle className="w-6 h-6 md:w-8 md:h-8 text-[#c4922a]" strokeWidth={2} />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#c4922a] font-normal text-base md:text-lg">
                      !
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-[#554116]/60">EMERGENCY</p>
                  <h2 className="text-base md:text-xl font-semibold text-[#0a0a0a]">Need a Lawyer Now</h2>
                </div>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0a0a0a] rounded-full flex items-center justify-center transition-all duration-200 group-hover:bg-[#c4922a]">
                {isDropdownOpen ? (
                  <ChevronUp className="w-5 h-5 md:w-6 md:h-6 text-white transition-colors duration-200" />
                ) : (
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white transition-colors duration-200" />
                )}
              </div>
            </div>
          </Card>

          {/* Dropdown Content */}
          {isDropdownOpen && (
            <div className="mt-3 bg-[#0a0a0a] rounded-2xl p-5 md:p-7 shadow-lg border border-white/10">
              <p className="text-base font-bold text-white/40 uppercase tracking-wider mb-5">
                Select Your Situation
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {situations.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className="bg-[#1a1a1a] px-4 py-3 text-base md:text-xl font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left flex items-center gap-3"
                      onClick={() => {
                        console.log("Selected:", item.label);
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}