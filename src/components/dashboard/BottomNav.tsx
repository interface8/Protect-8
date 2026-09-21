"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Scale,
  Bot,
  Library,
  Phone,
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Know", href: "/know-your-rights", icon: BookOpen },
  { name: "Find", href: "/find-a-lawyer", icon: Scale },
  { name: "AI", href: "/ai-assistant", icon: Bot },
  { name: "Knowledge", href: "/knowledge-center", icon: Library },
  { name: "SOS", href: "/emergency", icon: Phone },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#554116]/10 flex items-center justify-around px-2 py-2 z-50 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center gap-0.5 py-1 px-2"
          >
            {/* Icon with black rounded background when active */}
            <div
              className={`p-4 rounded-full transition-colors ${
                isActive ? "bg-[#0a0a0a]" : ""
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-[#c4922a]" : "text-[#6B7280]"
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-medium ${
                isActive ? "text-[#0a0a0a]" : "text-[#6B7280]"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}