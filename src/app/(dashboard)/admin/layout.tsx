import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=%2Fadmin");
  if (user.role !== "admin") redirect("/dashboard?error=forbidden");
  return (
    <div className="min-h-screen bg-[#f5f3f0] md:pl-[240px]">
      <AdminSidebar />
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
