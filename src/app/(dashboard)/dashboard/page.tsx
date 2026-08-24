"use client";

import HomeHeadSection from "@/components/dashboard/HomeHeadSection";
import HomeQuickAccess from "@/components/dashboard/HomeQuickAccess";
import HomeAvailableNow from "@/components/dashboard/HomeAvailableNow";
import HomePlatformStats from "@/components/dashboard/HomePlatformStats";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HomeHeadSection />
      <HomeQuickAccess />
      <HomeAvailableNow />
      <HomePlatformStats />
    </div>
  );
}