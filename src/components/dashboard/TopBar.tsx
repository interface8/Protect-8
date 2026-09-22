// "use client";

// import { useCurrentUser } from "@/hooks/useCurrentUser";

// interface TopBarProps {
//   pageTitle: string;
// }

// function getInitials(name?: string | null): string {
//   const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
//   if (parts.length === 0) return "U";
//   if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
//   return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
// }

// export default function TopBar({ pageTitle }: TopBarProps) {
//   const { user } = useCurrentUser();

//   return (
//     <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-white px-4 md:px-8">
//       <span className="text-sm font-normal text-[#0a0a0a]">{pageTitle}</span>

//       <div className="flex items-center gap-3">
//         <div className="rounded-full border border-black/10 px-3 py-1">
//           <span className="text-xs text-gray-500">Trial Plan</span>
//         </div>
//         <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a] text-xs font-medium text-white">
//           {getInitials(user?.name)}
//         </div>
//       </div>
//     </header>
//   );
// }


"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, LogIn } from "lucide-react";
import { useCurrentUser, clearCurrentUser } from "@/hooks/useCurrentUser";

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
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      clearCurrentUser();
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-white px-4 md:px-8">
      <span className="text-sm font-normal text-[#0a0a0a]">{pageTitle}</span>

      <div className="flex items-center gap-3">
        <div className="rounded-full border border-black/10 px-3 py-1">
          <span className="text-xs text-gray-500">Trial Plan</span>
        </div>

        {loading ? (
          // Loading skeleton
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        ) : user ? (
          // Logged in — avatar with dropdown
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label="Account menu"
              aria-expanded={open}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a] text-xs font-medium text-white transition-opacity hover:opacity-80"
            >
              {getInitials(user.name)}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-black/5 bg-white py-1 shadow-lg">
                <div className="px-3 py-2 border-b border-black/5">
                  <p className="text-sm font-medium text-[#0a0a0a] truncate">
                    {user.name}
                  </p>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#0a0a0a] hover:bg-[#f3f4f6]"
                >
                  <User className="w-4 h-4 text-[#c4922a]" />
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>
        ) : (
          // Not logged in — Login / Register buttons
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[#0a0a0a] hover:bg-[#f3f4f6]"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#0a0a0a] px-3 py-1.5 text-sm text-white hover:bg-[#2a2a2a]"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}