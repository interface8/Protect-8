


// // "use client";

// // import { ReactNode, useState } from "react";
// // import Sidebar from "@/components/dashboard/Sidebar";
// // import TopBar from "@/components/dashboard/TopBar";

// // interface DashboardLayoutProps {
// //   children: ReactNode;
// // }

// // export default function DashboardLayout({ children }: DashboardLayoutProps) {
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

// //   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
// //   const closeSidebar = () => setIsSidebarOpen(false);

// //   return (
// //     <div className="min-h-screen bg-[#f3f4f6] flex">
// //       {/* Sidebar */}
// //       <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

// //       {/* Main Content */}
// //       <div className="flex-1 min-w-0 md:ml-[240px]">
// //         <TopBar
// //           pageTitle="Home"
// //           isSidebarOpen={isSidebarOpen}
// //           toggleSidebar={toggleSidebar}
// //         />
// //         <main>{children}</main>
// //       </div>
// //     </div>
// //   );
// // }


// "use client";

// import { ReactNode, useState } from "react";
// import Sidebar from "@/components/dashboard/Sidebar";
// import TopBar from "@/components/dashboard/TopBar";
// import BottomNav from "@/components/dashboard/BottomNav";

// interface DashboardLayoutProps {
//   children: ReactNode;
//   pageTitle?: string;
// }

// export default function DashboardLayout({ children, pageTitle = "Home" }: DashboardLayoutProps) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
//   const closeSidebar = () => setIsSidebarOpen(false);

//   return (
//     <div className="min-h-screen bg-[#f3f4f6] flex">
//       <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
//       <div className="flex-1 min-w-0 md:ml-[240px] pb-16 md:pb-0">
//         <TopBar
//           pageTitle={pageTitle}
//           isSidebarOpen={isSidebarOpen}
//           toggleSidebar={toggleSidebar}
//         />
//         <main>{children}</main>
//       </div>
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
    </div>
  );
}