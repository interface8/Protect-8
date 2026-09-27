"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  ClipboardCheck,
  FileText,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  ScrollText,
  Shield,
  UserRoundCog,
} from "lucide-react";
import AdminHeaderActions from "@/components/admin/AdminHeaderActions";

const items = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Lawyer reviews", href: "/admin/lawyers", icon: ClipboardCheck },
  { label: "Users", href: "/admin/users", icon: UserRoundCog },
  { label: "Rights guides", href: "/admin/rights-guides", icon: BookOpenText },
  { label: "Knowledge articles", href: "/admin/articles", icon: FileText },
  { label: "Situations", href: "/admin/categories", icon: FolderOpen },
  { label: "Requests", href: "/admin/requests", icon: ListChecks },
  { label: "Audit log", href: "/admin/audit", icon: ScrollText },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col bg-[#0a0a0a]">
      <div className="border-b border-white/10 px-6 py-7">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c4922a]"><Shield className="h-5 w-5 text-white" /></span>
          <div><p className="font-medium text-white">Protect8</p><p className="text-xs text-white/45">Admin control room</p></div>
        </div>
      </div>
      <nav aria-label="Admin navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
          return <Link key={href} href={href} className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${active ? "bg-white/[0.09] text-white" : "text-white/55 hover:bg-white/5 hover:text-white"}`}>
            <Icon className={`h-4 w-4 ${active ? "text-[#c4922a]" : ""}`} />{label}{active && <span className="ml-auto h-4 w-1 rounded-full bg-[#c4922a]" />}
          </Link>;
        })}
      </nav>
      <div className="border-t border-white/10 p-4"><AdminHeaderActions /></div>
    </aside>
  );
}
