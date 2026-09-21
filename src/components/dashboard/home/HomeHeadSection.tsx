// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   ChevronRight,
//   Bell,
//   User,
//   Circle,
//   ChevronUp,
//   Car,
//   Scale,
//   Building,
//   House,
//   Shield,
//   Lock,
//   Briefcase,
//   AlertTriangle,
//   Laptop,
//   Plane,
//   FileText,
// } from "lucide-react";
// import { Card } from "@/components/ui/card";
// import LocationPopup from "@/components/dashboard/LocationPopup";

// const situations = [
//   { label: "Traffic Stop", icon: Car, color: "#ef4444" },
//   { label: "Police Arrest", icon: Scale, color: "#c4922a" },
//   { label: "EFCC Issue", icon: Building, color: "#ffffff" },
//   { label: "Land Dispute", icon: House, color: "#f59e0b" },
//   { label: "Domestic Violence", icon: Shield, color: "#8b5cf6" },
//   { label: "Security Agency", icon: Lock, color: "#c4922a" },
//   { label: "Employment Matter", icon: Briefcase, color: "#92400e" },
//   { label: "Fraud", icon: AlertTriangle, color: "#eab308" },
//   { label: "Cybercrime", icon: Laptop, color: "#06b6d4" },
//   { label: "Immigration", icon: Plane, color: "#ffffff" },
//   { label: "Other", icon: FileText, color: "#ffffff" },
// ];

// export default function HomeHeadSection() {
//   const router = useRouter();
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [selectedSituation, setSelectedSituation] = useState<string>("");
//   const [userName, setUserName] = useState<string>("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const response = await fetch("/api/users/me");
//         if (response.ok) {
//           const data = await response.json();
//           setUserName(data.name);
//         }
//       } catch (error) {
//         console.error("Failed to fetch user:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();
//   }, []);

//   const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

//   const handleSituationClick = (label: string) => {
//     setSelectedSituation(label);
//     setIsPopupOpen(true);
//     setIsDropdownOpen(false);
//   };

//   const handleAllowLocation = () => {
//     console.log("Location allowed for:", selectedSituation);
//     setIsPopupOpen(false);
//     router.push("/emergency");
//   };

//   const handleContinueWithoutLocation = () => {
//     console.log("Continuing without location for:", selectedSituation);
//     setIsPopupOpen(false);
//     router.push("/emergency");
//   };

//   const handleClosePopup = () => {
//     setIsPopupOpen(false);
//   };

//   return (
//     <div className="w-full bg-[#0a0a0a]">
//       <div className="w-[90%] md:w-[80%] mx-auto space-y-6 md:space-y-8 pt-10 md:pt-14 pb-8 md:pb-10">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-base md:text-lg text-white/60 font-base">Good morning</p>
//             <h1 className="text-3xl md:text-4xl font-semibold text-white">
//               {loading ? "Loading..." : userName || "User"}
//             </h1>
//           </div>
//           <div className="flex items-center gap-2 md:gap-3">
//             <div className="bg-white/10 p-2 md:p-3 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
//               <Bell className="w-4 h-4 md:w-5 md:h-5 text-white/70 hover:text-white transition-colors" />
//             </div>
//             <div className="bg-white/10 p-2 md:p-3 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
//               <User className="w-4 h-4 md:w-5 md:h-5 text-white/70 hover:text-white transition-colors" />
//             </div>
//           </div>
//         </div>

//         {/* Emergency Card */}
//         <div>
//           <Card
//             className="bg-white p-5 md:p-7 rounded-2xl cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl group"
//             onClick={toggleDropdown}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3 md:gap-4">
//                 <div className="w-12 h-12 md:w-16 md:h-16 bg-[#0a0a0a] rounded-xl flex items-center justify-center">
//                   <div className="relative">
//                     <Circle className="w-6 h-6 md:w-8 md:h-8 text-[#c4922a]" strokeWidth={2} />
//                     <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#c4922a] font-normal text-base md:text-lg">
//                       !
//                     </span>
//                   </div>
//                 </div>
//                 <div>
//                   <p className="text-xs md:text-sm font-medium text-[#554116]/60">EMERGENCY</p>
//                   <h2 className="text-base md:text-xl font-semibold text-[#0a0a0a]">Need a Lawyer Now</h2>
//                 </div>
//               </div>
//               <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0a0a0a] rounded-full flex items-center justify-center transition-all duration-200 group-hover:bg-[#c4922a]">
//                 {isDropdownOpen ? (
//                   <ChevronUp className="w-5 h-5 md:w-6 md:h-6 text-white transition-colors duration-200" />
//                 ) : (
//                   <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white transition-colors duration-200" />
//                 )}
//               </div>
//             </div>
//           </Card>

//           {/* Dropdown Content */}
//           {isDropdownOpen && (
//             <div className="mt-3 bg-[#0a0a0a] rounded-2xl p-5 md:p-7 shadow-lg border border-white/10">
//               <p className="text-base font-bold text-white/40 uppercase tracking-wider mb-5">
//                 Select Your Situation
//               </p>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
//                 {situations.map((item) => {
//                   const Icon = item.icon;
//                   return (
//                     <button
//                       key={item.label}
//                       className="bg-[#1a1a1a] px-4 py-3 text-base md:text-xl font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left flex items-center gap-3"
//                       onClick={() => handleSituationClick(item.label)}
//                     >
//                       <Icon className="w-5 h-5" style={{ color: item.color }} />
//                       {item.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Location Popup */}
//       <LocationPopup
//         isOpen={isPopupOpen}
//         onClose={handleClosePopup}
//         onAllow={handleAllowLocation}
//         onContinue={handleContinueWithoutLocation}
//       />
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  User,
  CircleAlert,
  Car,
  Scale,
  Building,
  House,
  Shield,
  Lock,
  Briefcase,
  AlertTriangle,
  Laptop,
  Plane,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import LocationPopup from "@/components/dashboard/LocationPopup";

const situations = [
  { label: "Traffic Stop", icon: Car, color: "#ef4444" },
  { label: "Police Arrest", icon: Scale, color: "#c4922a" },
  { label: "EFCC Issue", icon: Building, color: "#ffffff" },
  { label: "Land Dispute", icon: House, color: "#f59e0b" },
  { label: "Domestic Violence", icon: Shield, color: "#8b5cf6" },
  { label: "Security Agency", icon: Lock, color: "#c4922a" },
  { label: "Employment Matter", icon: Briefcase, color: "#92400e" },
  { label: "Fraud", icon: AlertTriangle, color: "#eab308" },
  { label: "Cybercrime", icon: Laptop, color: "#06b6d4" },
  { label: "Immigration", icon: Plane, color: "#ffffff" },
  { label: "Other", icon: FileText, color: "#ffffff" },
];

export default function HomeHeadSection() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedSituation, setSelectedSituation] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const data = await response.json();
          setUserName(data.name);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleSituationClick = (label: string) => {
    setSelectedSituation(label);
    setIsPopupOpen(true);
    setIsDropdownOpen(false);
  };

  const handleAllowLocation = () => {
    console.log("Location allowed for:", selectedSituation);
    setIsPopupOpen(false);
    router.push("/emergency");
  };

  const handleContinueWithoutLocation = () => {
    console.log("Continuing without location for:", selectedSituation);
    setIsPopupOpen(false);
    router.push("/emergency");
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="w-full bg-[#0a0a0a]">
      <div className="w-[90%] max-w-5xl mx-auto space-y-6 md:space-y-7 pt-10 pb-8 md:pb-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base md:text-sm text-white/50">Good morning</p>
            <h1 className="mt-0.5 text-3xl font-medium text-white">
              {loading ? "Loading..." : userName || "User"}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Bell className="w-4 h-4 md:w-[18px] md:h-[18px] text-white/70" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-[#c4922a]" />
            </button>
            <button
              type="button"
              aria-label="Profile"
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <User className="w-4 h-4 md:w-[18px] md:h-[18px] text-white/70" />
            </button>
          </div>
        </div>

        {/* Emergency Card */}
        <div>
          <Card
            className="bg-white p-5 gap-0 rounded-2xl border-0 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl group"
            onClick={toggleDropdown}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 bg-[#0a0a0a] rounded-xl flex items-center justify-center">
                  <CircleAlert className="w-5 h-5 text-[#c4922a]" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-widest text-gray-500">EMERGENCY</p>
                  <h2 className="text-base md:text-xl font-medium text-[#0a0a0a]">Need a Lawyer Now</h2>
                </div>
              </div>
              <div className="w-9 h-9 bg-[#0a0a0a] rounded-full flex items-center justify-center transition-colors duration-200 group-hover:bg-[#c4922a]">
                <ArrowRight
                  className={`w-4 h-4 text-white transition-transform duration-200 ${
                    isDropdownOpen ? "-rotate-90" : ""
                  }`}
                />
              </div>
            </div>
          </Card>

          {/* Dropdown Content */}
          {isDropdownOpen && (
            <div className="mt-3 bg-[#0a0a0a] rounded-2xl p-5 md:p-7 shadow-lg border border-white/10">
              <p className="text-base font-bold text-white/40 uppercase tracking-wider mb-5">
                Select Your Situation
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {situations.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className="bg-[#1a1a1a] px-4 py-3 text-base md:text-xl font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left flex items-center gap-3"
                      onClick={() => handleSituationClick(item.label)}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location Popup */}
      <LocationPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onAllow={handleAllowLocation}
        onContinue={handleContinueWithoutLocation}
      />
    </div>
  );
}