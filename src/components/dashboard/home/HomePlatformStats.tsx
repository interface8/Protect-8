const platformStats = [
  { value: "1,200+", label: "Verified Lawyers" },
  { value: "8,400+", label: "Cases Resolved" },
  { value: "< 15s", label: "Avg Response" },
];

export default function HomePlatformStats() {
  return (
    <div className="w-full bg-[#f5f3f0] pb-20 md:pb-16">
      <div className="mx-auto w-[90%] max-w-[944px] rounded-2xl bg-[#0a0a0a] p-4 md:p-6">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-white/40">
          Platform
        </p>
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {platformStats.map((stat) => (
            <div key={stat.label}>
              <p className="text-lg text-[#c4922a] md:text-xl">{stat.value}</p>
              <p className="mt-1 text-xs text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}