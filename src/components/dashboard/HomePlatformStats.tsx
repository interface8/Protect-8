"use client";

const platformStats = [
  { value: "1,200+", label: "Verified Lawyers" },
  { value: "8,400+", label: "Cases Resolved" },
  { value: "<15s", label: "Avg Response" },
];

export default function HomePlatformStats() {
  return (
    <div className="w-full bg-[#f3f4f6] py-6">
      <div className="w-[55%] mx-auto bg-[#0a0a0a] rounded-2xl py-6 px-8">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-4">
          Platform
        </p>

        <div className="flex justify-between items-start pr-20">
          {platformStats.map((stat, index) => (
            <div key={index}>
              <p className="text-2xl font-light text-[#c4922a]">{stat.value}</p>
              <p className="text-[10px] text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}