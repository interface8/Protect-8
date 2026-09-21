


// "use client";

// import { Menu, X } from "lucide-react";

// interface TopBarProps {
//   pageTitle: string;
//   isSidebarOpen: boolean;
//   toggleSidebar: () => void;
// }

// // Hardcoded user data (temporary)
// const userData = {
//   name: "Chukwuemeka",
//   trialDaysRemaining: 7,
// };

// // Helper function for initials - takes first two names
// function getInitials(name: string): string {
//   const nameParts = name.trim().split(" ");
//   if (nameParts.length >= 2) {
//     return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
//   }
//   return nameParts[0].charAt(0).toUpperCase();
// }

// export default function TopBar({ pageTitle, isSidebarOpen, toggleSidebar }: TopBarProps) {
//   const initials = getInitials(userData.name);

//   return (
//     <header className="bg-white border-b border-[#554116]/10 px-4 md:px-8 py-5 flex items-center justify-between sticky top-0 z-30">
//       {/* Left side: Hamburger + Page Title */}
//       <div className="flex items-center gap-3">
//         {/* Hamburger Button - visible on mobile only */}
//         <button
//           onClick={toggleSidebar}
//           className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#efe2c7] transition-colors"
//           aria-label="Toggle sidebar"
//         >
//           {isSidebarOpen ? (
//             <X className="w-5 h-5 text-[#554116]" />
//           ) : (
//             <Menu className="w-5 h-5 text-[#554116]" />
//           )}
//         </button>

//         {/* Active page title */}
//         <span className="text-xl font-normal text-[#554116]">{pageTitle}</span>
//       </div>

//       {/* Right side: Trial Plan + Avatar */}
//       <div className="flex items-center gap-6">
//         {/* Trial Plan Badge */}
//         <div className="bg-white px-4 py-2 border border-gray-200 border-solid rounded-full">
//           <span className="text-sm font-medium text-[#554116]">
//             Trial Plan · {userData.trialDaysRemaining} days remaining
//           </span>
//         </div>

//         {/* User Avatar */}
//         <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-base font-semibold">
//           {initials}
//         </div>
//       </div>
//     </header>
//   );
// }

"use client";

import { useCurrentUser } from "@/hooks/UseCurrentUser";

interface TopBarProps {
  pageTitle: string;
}

function getInitials(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export default function TopBar({ pageTitle }: TopBarProps) {
  const { user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-white px-4 md:px-8">
      <span className="text-sm font-normal text-[#0a0a0a]">{pageTitle}</span>

      <div className="flex items-center gap-3">
        <div className="rounded-full border border-black/10 px-3 py-1">
          <span className="text-xs text-gray-500">Trial Plan</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a] text-xs font-medium text-white">
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
}