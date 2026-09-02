


"use client";

const platformStats = [
  { value: "1,200+", label: "Verified Lawyers" },
  { value: "8,400+", label: "Cases Resolved" },
  { value: "<15s", label: "Avg Response" },
];

export default function HomePlatformStats() {
  return (
    <div className="w-full bg-[#f3f4f6] pb-14">
      <div className="w-[90%] md:w-[75%] mx-auto bg-[#0a0a0a] rounded-2xl py-6 md:py-8 px-8 md:px-10">
        <p className="text-xs md:text-sm font-semibold text-white/40 uppercase tracking-wider mb-4 md:mb-6">
          Platform
        </p>
        <div className="flex justify-between items-start pr-20 md:pr-24">
          {platformStats.map((stat, index) => (
            <div key={index}>
              <p className="text-3xl md:text-4xl font-light text-[#c4922a]">{stat.value}</p>
              <p className="text-xs md:text-sm text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}