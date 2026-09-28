import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import LawyerSidebar from "@/components/lawyer/LawyerSidebar";

export default async function LawyerPortalLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=%2Flawyer");
  if (user.role !== "lawyer") redirect("/dashboard");
  return <div className="min-h-screen bg-[#f5f3f0] md:pl-[240px]"><LawyerSidebar />{children}</div>;
}
