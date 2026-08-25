// "use client";

// import HomeHeadSection from "@/components/dashboard/home/HomeHeadSection";
// import HomeQuickAccess from "@/components/dashboard/home/HomeQuickAccess";
// import HomeAvailableNow from "@/components/dashboard/home/HomeAvailableNow";
// import HomePlatformStats from "@/components/dashboard/home/HomePlatformStats";

// export default function DashboardPage() {
//   return (
//     <div className="flex flex-col min-h-screen">
//       <HomeHeadSection />
//       <HomeQuickAccess />
//       <HomeAvailableNow />
//       <HomePlatformStats />
//     </div>
//   );
// }

"use client";

import HomeHeadSection from "@/components/dashboard/home/HomeHeadSection";
import HomeQuickAccess from "@/components/dashboard/home/HomeQuickAccess";
import HomeAvailableNow from "@/components/dashboard/home/HomeAvailableNow";
import HomePlatformStats from "@/components/dashboard/home/HomePlatformStats";

export default function DashboardPage() {
  return (
    <>
      <HomeHeadSection />
      <HomeQuickAccess />
      <HomeAvailableNow />
      <HomePlatformStats />
    </>
  );
}