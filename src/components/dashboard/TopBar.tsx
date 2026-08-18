"use client";

interface TopBarProps {
  pageTitle: string;
}

// Hardcoded user data (temporary)
const userData = {
  name: "Chukwuemeka",
  trialDaysRemaining: 7,
};

// Helper function for initials - takes first two names
function getInitials(name: string): string {
  const nameParts = name.trim().split(" ");
  if (nameParts.length >= 2) {
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  }
  return nameParts[0].charAt(0).toUpperCase();
}

export default function TopBar({ pageTitle }: TopBarProps) {
  const initials = getInitials(userData.name);

  return (
    <header className="bg-white border-b border-[#554116]/10 px-8 py-5 flex items-center justify-between sticky top-0 z-30">
      {/* Active page title only - increased font */}
      <span className="text-xl font-normal text-[#554116]">{pageTitle}</span>

      {/* Right side: Trial Plan + Avatar */}
      <div className="flex items-center gap-6">
        {/* Trial Plan Badge */}
        <div className="bg-white px-4 py-2  border border-gray-200 border-solid rounded-full">
          <span className="text-sm font-medium text-[#554116]">
            Trial Plan · {userData.trialDaysRemaining} days remaining
          </span>
        </div>

        {/* User Avatar */}
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-base font-semibold">
          {initials}
        </div>
      </div>
    </header>
  );
}