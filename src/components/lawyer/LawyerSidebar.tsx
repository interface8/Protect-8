"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BriefcaseBusiness, ClipboardList, Clock3, LogOut, MessageCircle, Shield, UserRound } from "lucide-react";
import { useState } from "react";
import { clearCurrentUser } from "@/hooks/useCurrentUser";

const items = [
  { label: "Overview", href: "/lawyer", icon: BriefcaseBusiness },
  { label: "Client enquiries", href: "/lawyer/enquiries", icon: ClipboardList },
  { label: "Availability", href: "/lawyer/availability", icon: Clock3 },
  { label: "Professional profile", href: "/lawyer/profile", icon: UserRound },
  { label: "Messages", href: "/lawyer/messages", icon: MessageCircle },
];

export default function LawyerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  async function logout() {
    setLoggingOut(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); }
    finally { clearCurrentUser(); router.replace("/login"); router.refresh(); }
  }

  const activeItem = (href: string) => href === "/lawyer" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const navItems = items.map(({ label, href, icon: Icon }) => {
    const active = activeItem(href);
    return <Link key={label} href={href} aria-current={active ? "page" : undefined} className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${active ? "bg-white/[0.09] text-white" : "text-white/55 hover:bg-white/5 hover:text-white"}`}><Icon className={`h-4 w-4 ${active ? "text-[#c4922a]" : ""}`} />{label}{active && <span className="ml-auto h-4 w-1 rounded-full bg-[#c4922a]" />}</Link>;
  });

  return <>
  <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col bg-[#0a0a0a] md:flex">
    <div className="border-b border-white/10 px-6 py-7"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c4922a]"><Shield className="h-5 w-5 text-white" /></span><div><p className="font-medium text-white">Protect8</p><p className="text-xs text-white/45">Lawyer workspace</p></div></div></div>
    <nav aria-label="Lawyer workspace navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
      {navItems}
    </nav>
    <button type="button" onClick={() => void logout()} disabled={loggingOut} className="m-4 inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-white/60 hover:bg-white/5 disabled:opacity-40"><LogOut className="h-4 w-4" />{loggingOut ? "Signing out…" : "Sign out"}</button>
  </aside>
  <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a] px-4 py-3 md:hidden"><div className="mb-3 flex items-center gap-2 text-white"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c4922a]"><Shield className="h-4 w-4" /></span><span className="text-sm font-medium">Lawyer workspace</span></div><nav aria-label="Lawyer workspace navigation" className="flex gap-2 overflow-x-auto pb-1">{items.map(({label, href, icon: Icon}) => <Link key={label} href={href} aria-current={activeItem(href) ? "page" : undefined} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${activeItem(href) ? "bg-white/10 text-white" : "text-white/55"}`}><Icon className="h-4 w-4" />{label}</Link>)}<button type="button" onClick={() => void logout()} disabled={loggingOut} aria-label="Sign out" className="flex shrink-0 items-center rounded-lg px-3 text-white/55"><LogOut className="h-4 w-4" /></button></nav></header>
  </>;
}
