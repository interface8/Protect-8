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

// Map icon strings to Lucide components
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
    <aside className="w-[240px] bg-[#0a0a0a] h-screen fixed top-0 left-0 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-12 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 bg-[#c4922a] rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white"/>
          </div>
          <span className="text-2xl font-normal text-white">Protect8</span>
        </div>
        <p className="text-base text-white/40 tracking-wider pl-1">
          Emergency Legal Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
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

      {/* SOS Emergency - with dashed border */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="bg-red-500/10 rounded-lg p-3 border-2 border-dashed border-red-500/40">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-lg">
            <Phone className="w-6 h-6" />
            SOS Emergency
          </div>
        </div>
      </div>

      {/* Need help? Call - with phone number on its own line */}
      <div className="px-4 pb-4">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-sm text-white/40">
            Need help? Call
          </p>
          <p className="text-base font-bold text-white/60 mt-1">
            0800-PROTECT
          </p>
        </div>
      </div>
    </aside>
  );
}