
// "use client";

// import { ReactNode } from "react";
// import { usePathname } from "next/navigation";
// import Sidebar from "@/components/dashboard/Sidebar";
// import TopBar from "@/components/dashboard/TopBar";
// import BottomNav from "@/components/dashboard/BottomNav";

// interface DashboardLayoutProps {
//   children: ReactNode;
// }

// const pageTitles: Record<string, string> = {
//   "/dashboard": "Home",
//   "/know-your-rights": "Know Your Rights",
//   "/find-a-lawyer": "Find a Lawyer",
//   "/ai-assistant": "AI Assistant",
//   "/knowledge-center": "Knowledge Center",
// };

// export default function DashboardLayout({ children }: DashboardLayoutProps) {
//   const pathname = usePathname();

//   // Get the page title based on the current path
//   // If the path is a detail page like /know-your-rights/traffic-stop, show "Know Your Rights"
//   let pageTitle = "Home";
//   if (pathname) {
//     if (pathname.startsWith("/know-your-rights")) {
//       pageTitle = "Know Your Rights";
//     } else if (pathname.startsWith("/find-a-lawyer")) {
//       pageTitle = "Find a Lawyer";
//     } else if (pathname.startsWith("/ai-assistant")) {
//       pageTitle = "AI Assistant";
//     } else if (pathname.startsWith("/knowledge-center")) {
//       pageTitle = "Knowledge Center";
//     } else if (pageTitles[pathname]) {
//       pageTitle = pageTitles[pathname];
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[#f3f4f6] flex">
//       {/* Sidebar - desktop only */}
//       <Sidebar />

//       {/* Main Content */}
//       <div className="flex-1 min-w-0 md:ml-[240px] pb-16 md:pb-0">
//         <TopBar pageTitle={pageTitle} />
//         <main>{children}</main>
//       </div>

//       {/* Bottom Navigation - mobile only */}
//       <BottomNav />
//     </div>
//   );
// }



"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import BottomNav from "@/components/dashboard/BottomNav";
import RatingTrigger from "@/components/dashboard/lawyers/RatingTrigger";

interface DashboardLayoutProps {
  children: ReactNode;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Home",
  "/know-your-rights": "Know Your Rights",
  "/find-a-lawyer": "Find a Lawyer",
  "/ai-assistant": "AI Assistant",
  "/knowledge-center": "Knowledge Center",
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  // Get the page title based on the current path
  // If the path is a detail page like /know-your-rights/traffic-stop, show "Know Your Rights"
  let pageTitle = "Home";
  if (pathname) {
    if (pathname.startsWith("/know-your-rights")) {
      pageTitle = "Know Your Rights";
    } else if (pathname.startsWith("/find-a-lawyer")) {
      pageTitle = "Find a Lawyer";
    } else if (pathname.startsWith("/ai-assistant")) {
      pageTitle = "AI Assistant";
    } else if (pathname.startsWith("/knowledge-center")) {
      pageTitle = "Knowledge Center";
    } else if (pageTitles[pathname]) {
      pageTitle = pageTitles[pathname];
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex">
      {/* Sidebar - desktop only */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-w-0 md:ml-[240px] pb-16 md:pb-0">
        <TopBar pageTitle={pageTitle} />
        <main>{children}</main>
      </div>

      {/* Bottom Navigation - mobile only */}
      <BottomNav />

      {/* Rating Trigger - checks for COMPLETED requests to rate */}
      <RatingTrigger />
    </div>
  );
}