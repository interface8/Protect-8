// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useEffect } from "react";
// import {
//   Shield,
//   Phone,
//   Home,
//   BookOpen,
//   Scale,
//   Bot,
//   Library,
//   X,
// } from "lucide-react";

// interface SidebarProps {
//   isOpen: boolean;
//   closeSidebar: () => void;
// }

// const iconMap = {
//   Home,
//   BookOpen,
//   Scale,
//   Bot,
//   Library,
// };

// const navItems = [
//   { name: "Home", href: "/dashboard", icon: "Home" },
//   { name: "Know Your Rights", href: "/know-your-rights", icon: "BookOpen" },
//   { name: "Find a Lawyer", href: "/find-a-lawyer", icon: "Scale" },
//   { name: "AI Assistant", href: "/ai-assistant", icon: "Bot" },
//   { name: "Knowledge Center", href: "/knowledge-center", icon: "Library" },
// ];

// export default function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
//   const pathname = usePathname();

//   useEffect(() => {
//     if (isOpen) {
//       closeSidebar();
//     }
//   }, [pathname]);

//   return (
//     <>
     
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40 md:hidden"
//           onClick={closeSidebar}
//         />
//       )}

     
//       <aside
//         className={`
//           fixed top-0 left-0 w-[240px] bg-[#0a0a0a] h-screen flex flex-col z-50
//           transition-transform duration-300 ease-in-out
//           md:fixed md:translate-x-0 md:z-40
//           ${isOpen ? "translate-x-0" : "-translate-x-full"}
//         `}
//       >
      
//         <div className="px-4 py-4 border-b border-white/10 flex-shrink-0 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-11 h-11 bg-[#c4922a] rounded-xl flex items-center justify-center">
//               <Shield className="w-5 h-5 text-white" />
//             </div>
//             <span className="text-2xl font-normal text-white">Protect8</span>
//           </div>
         
//           <button
//             onClick={closeSidebar}
//             className="md:hidden text-white/60 hover:text-white transition-colors p-1"
//             aria-label="Close sidebar"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <p className="text-base text-white/40 tracking-wider px-6 pb-4 border-b border-white/10">
//           Emergency Legal Platform
//         </p>

        
//         <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
//           {navItems.map((item) => {
//             const isActive = pathname === item.href;
//             const Icon = iconMap[item.icon as keyof typeof iconMap];
//             return (
//               <Link
//                 key={item.name}
//                 href={item.href}
//                 className={`flex items-center justify-between px-4 py-3 text-lg transition-all duration-200 font-medium ${
//                   isActive
//                     ? "bg-[#2a2a2a] text-white rounded-2xl"
//                     : "text-[#4B5563] hover:text-[#9CA3AF] hover:bg-white/5 rounded-2xl"
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   <Icon
//                     className={`w-6 h-6 ${
//                       isActive ? "text-[#c4922a]" : "text-[#4B5563]"
//                     }`}
//                   />
//                   {item.name}
//                 </div>
//                 {isActive && (
//                   <span className="text-[#c4922a] text-3xl font-extrabold">|</span>
//                 )}
//               </Link>
//             );
//           })}
//         </nav>


//         <div className="px-4 py-4 border-t border-white/10 flex-shrink-0">
//           <div className="bg-red-500/10 rounded-lg p-3 border-2 border-dashed border-red-500/40">
//             <div className="flex items-center gap-2 text-red-400 font-semibold text-lg">
//               <Phone className="w-6 h-6" />
//               SOS Emergency
//             </div>
//           </div>
//         </div>

        
//         <div className="px-4 pb-4 flex-shrink-0">
//           <div className="bg-white/5 rounded-lg p-3 text-center">
//             <p className="text-sm text-white/40">Need help? Call</p>
//             <p className="text-base font-bold text-white/60 mt-1">0800-PROTECT</p>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// }



"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Phone,
  Home,
  BookOpen,
  Scale,
  Bot,
  Library,
} from "lucide-react";

const iconMap = {
  Home,
  BookOpen,
  Scale,
  Bot,
  Library,
};

const navItems = [
  { name: "Home", href: "/dashboard", icon: "Home" },
  { name: "Know Your Rights", href: "/know-your-rights", icon: "BookOpen" },
  { name: "Find a Lawyer", href: "/find-a-lawyer", icon: "Scale" },
  { name: "AI Assistant", href: "/ai-assistant", icon: "Bot" },
  { name: "Knowledge Center", href: "/knowledge-center", icon: "Library" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-[240px] bg-[#0a0a0a] h-screen fixed top-0 left-0 z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 bg-[#c4922a] rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-normal text-white">Protect8</span>
        </div>
        <p className="text-base text-white/40 tracking-wider pl-1">
          Emergency Legal Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 text-lg transition-all duration-200 font-medium ${
                isActive
                  ? "bg-[#2a2a2a] text-white rounded-2xl"
                  : "text-[#4B5563] hover:text-[#9CA3AF] hover:bg-white/5 rounded-2xl"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? "text-[#c4922a]" : "text-[#4B5563]"
                  }`}
                />
                {item.name}
              </div>
              {isActive && (
                <span className="text-[#c4922a] text-3xl font-extrabold">|</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* SOS Emergency */}
      <div className="px-4 py-4 border-t border-white/10 flex-shrink-0">
        <div className="bg-red-500/10 rounded-lg p-3 border-2 border-dashed border-red-500/40">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-lg">
            <Phone className="w-6 h-6" />
            SOS Emergency
          </div>
        </div>
      </div>

      {/* Need help? Call */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-sm text-white/40">Need help? Call</p>
          <p className="text-base font-bold text-white/60 mt-1">0800-PROTECT</p>
        </div>
      </div>
    </aside>
  );
}