import Link from "next/link";
import { ReactNode } from "react";
import { requireRole } from "@/lib/auth";

const items = [
  ["Overview", "/admin"],
  ["Lawyer reviews", "/admin/lawyers"],
  ["Users", "/admin/users"],
  ["Rights guides", "/admin/rights-guides"],
  ["Knowledge articles", "/admin/articles"],
  ["Situations", "/admin/categories"],
  ["Requests", "/admin/requests"],
  ["Audit log", "/admin/audit"],
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole("admin");
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f5f3f0]">
      <div className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c4922a]">Protect8 administration</p>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Admin navigation">
            {items.map(([label, href]) => (
              <Link key={href} href={href} className="shrink-0 rounded-lg border border-black/[0.08] px-3 py-2 text-sm text-gray-600 transition-colors hover:border-[#c4922a]/50 hover:text-black">{label}</Link>
            ))}
          </nav>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
