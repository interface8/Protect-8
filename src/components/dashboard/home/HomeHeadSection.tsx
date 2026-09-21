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
import { ArrowRight, Bell, User, CircleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import LocationPopup from "@/components/dashboard/LocationPopup";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const situations = [
  { label: "Traffic Stop", emoji: "🚓" },
  { label: "Police Arrest", emoji: "⚖️" },
  { label: "EFCC Issue", emoji: "🏛️" },
  { label: "Land Dispute", emoji: "🏡" },
  { label: "Domestic Violence", emoji: "🛡️" },
  { label: "Security Agency", emoji: "🔒" },
  { label: "Employment Matter", emoji: "💼" },
  { label: "Fraud", emoji: "⚠️" },
  { label: "Cybercrime", emoji: "💻" },
  { label: "Immigration", emoji: "✈️" },
  { label: "Other", emoji: "📋" },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeHeadSection() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedSituation, setSelectedSituation] = useState("");
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const toggleDropdown = () => setIsDropdownOpen((open) => !open);

  const handleSituationClick = (label: string) => {
    setSelectedSituation(label);
    setIsPopupOpen(true);
    setIsDropdownOpen(false);
  };

  const goToEmergency = (coords?: { lat: number; lng: number }) => {
    if (coords) {
      try {
        sessionStorage.setItem("protect8:location", JSON.stringify(coords));
      } catch {
        // storage unavailable, continue without it
      }
    }
    router.push(`/emergency?situation=${encodeURIComponent(selectedSituation)}`);
  };

  const handleAllowLocation = () => {
    setIsPopupOpen(false);
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      goToEmergency();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        goToEmergency({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => goToEmergency(),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  };

  const handleContinueWithoutLocation = () => {
    setIsPopupOpen(false);
    goToEmergency();
  };

  return (
    <div className="w-full bg-[#0a0a0a]">
      <div className="mx-auto w-[90%] max-w-5xl space-y-6 pb-8 pt-10 md:space-y-7 md:pb-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base text-white/50 md:text-sm">{greeting}</p>
            <div className="mt-0.5 h-9">
              {loading ? (
                <span className="inline-block h-7 w-40 animate-pulse rounded bg-white/10" />
              ) : (
                <h1 className="text-[22px] font-medium leading-9 text-white">
                  {user?.name || "User"}
                </h1>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition-colors hover:bg-white/10 md:h-10 md:w-10"
            >
              <Bell className="h-4 w-4 text-white/70 md:h-[18px] md:w-[18px]" />
              <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-[#c4922a]" />
            </button>
            <button
              type="button"
              aria-label="Profile"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition-colors hover:bg-white/10 md:h-10 md:w-10"
            >
              <User className="h-4 w-4 text-white/70 md:h-[18px] md:w-[18px]" />
            </button>
          </div>
        </div>

        {/* Emergency Card */}
        <div>
          <Card
            role="button"
            tabIndex={0}
            aria-expanded={isDropdownOpen}
            onClick={toggleDropdown}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleDropdown();
              }
            }}
            className="group cursor-pointer gap-0 rounded-2xl border-0 bg-white p-5 shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a0a0a]">
                  <CircleAlert className="h-5 w-5 text-[#c4922a]" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-widest text-gray-500">
                    EMERGENCY
                  </p>
                  <h2 className="text-base font-medium text-[#0a0a0a] md:text-xl">
                    Need a Lawyer Now
                  </h2>
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a0a0a] transition-colors duration-200 group-hover:bg-[#c4922a]">
                <ArrowRight
                  className={`h-4 w-4 text-white transition-transform duration-200 ${
                    isDropdownOpen ? "-rotate-90" : ""
                  }`}
                />
              </div>
            </div>
          </Card>

          {/* Situation panel */}
          {isDropdownOpen && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">
                Select Your Situation
              </p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {situations.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSituationClick(item.label)}
                    className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3.5 text-left text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.08]"
                  >
                    <span className="text-base leading-none">{item.emoji}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <LocationPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onAllow={handleAllowLocation}
        onContinue={handleContinueWithoutLocation}
      />
    </div>
  );
}