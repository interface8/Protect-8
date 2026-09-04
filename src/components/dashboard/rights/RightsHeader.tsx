// "use client";

// import Link from "next/link";
// import { Search, ChevronLeft, BookOpen } from "lucide-react";
// import { Input } from "@/components/ui/input";

// interface RightsHeaderProps {
//   count: number;
//   searchQuery: string;
//   setSearchQuery: (query: string) => void;
// }

// export default function RightsHeader({ count, searchQuery, setSearchQuery }: RightsHeaderProps) {
//   return (
//     <div className="w-full bg-[#0a0a0a]">
//       <div className="w-full px-4 md:px-6 lg:w-[60%] lg:mx-auto pt-12 pb-14">
//         {/* < Home link */}
//         <Link
//           href="/dashboard"
//           className="inline-flex items-center gap-1 text-lg text-white/40 hover:text-white transition-colors mb-6"
//         >
//           <ChevronLeft className="w-6 h-6" />
//           <span>Home</span>
//         </Link>

//         {/* Header with open book icon */}
//         <div className="flex items-center gap-3 mb-6">
//           <div className="w-14 h-14 bg-[#0a0a0a] rounded-xl border-2 border-[#2a2a2a] flex items-center justify-center">
//             <BookOpen className="w-7 h-7 text-[#c4922a]" />
//           </div>
//           <div>
//             <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
//               Know Your Rights
//             </h1>
//             <p className="text-lg md:text-xl text-white/40 pt-2">
//               {count} legal scenario{count !== 1 ? "s" : ""} covered
//             </p>
//           </div>
//         </div>

//         {/* Search Bar */}
//         <div className="relative mt-2">
//           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
//           <Input
//             type="text"
//             placeholder="Search scenarios..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-12 pr-5 py-3 h-14 bg-white/10 border-white/10 focus-visible:ring-[#c4922a] focus-visible:border-[#c4922a] rounded-full text-base text-white placeholder:text-white/50 placeholder:text-base"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { Search, ChevronLeft, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RightsHeaderProps {
  count: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function RightsHeader({ count, searchQuery, setSearchQuery }: RightsHeaderProps) {
  return (
    <div className="w-full bg-[#0a0a0a]">
      <div className="w-full px-4 md:px-6 xl:w-[60%] xl:mx-auto pt-12 pb-14">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-lg text-white/40 hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="w-6 h-6" />
          <span>Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-[#0a0a0a] rounded-xl border-2 border-[#2a2a2a] flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-[#c4922a]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-[21px] font-semibold text-white">
              Know Your Rights
            </h1>
            <p className="text-lg md:text-xl text-white/40 pt-2">
              {count} legal scenario{count !== 1 ? "s" : ""} covered
            </p>
          </div>
        </div>

        <div className="relative mt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder="Search scenarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-5 py-3 h-14 bg-white/10 border-white/10 focus-visible:ring-[#c4922a] focus-visible:border-[#c4922a] rounded-full text-base text-white placeholder:text-white/50 placeholder:text-base"
          />
        </div>
      </div>
    </div>
  );
}